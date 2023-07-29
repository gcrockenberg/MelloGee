/*
  SYNOPSIS: Me
  DESCRIPTION: Provision the resources for the Me solution
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
*/
@description('The name of the app or solution.')
param solutionName string = 'me'

@description('The type of environment you want to provision. Allowed values are dev and prod.')
@allowed([
  'dev'
  'prod'
])
param environmentType string = 'dev'

@description('The location into which your Azure resources should be deployed.')
param location string = resourceGroup().location

@description('Required to use Docker as container registry.')
@secure()
param dockerHubPasswordOrToken string

@description('Required to use Docker as container registry.')
@secure()
param dockerHubUsername string

@description('Required to provision Federated Id Credentials for Github Open Id Connect login.')
@secure()
param githubOrganizationOrUsername string

@description('Required to provision Federated Id Credentials for Github Open Id Connect login.')
@secure()
param stripeApiKey string

@description('The Container App microservices')
var microservices = [
  {
    addToAPIM: false
    apiPath: ''
    //connectKeyVault: false
    containerAppName: '${solutionName}-cart-data'
    dockerImageName: '${dockerHubUsername}/cart-data:latest'
    minScale: 1
    targetPort: 6379
    transport: 'tcp'
    secrets: [
        {
          name: 'container-registry-password'
          value: dockerHubPasswordOrToken
        }
      ] 
    environment: [
      {
        name: 'test-environment-variable'
        value: 'Foo'
      }
    ]
  }
  {
    addToAPIM: false
    apiPath: ''
    //connectKeyVault: false
    containerAppName: '${solutionName}-rabbitmq'
    dockerImageName: '${dockerHubUsername}/rabbitmq:latest'
    minScale: 1
    targetPort: 5672
    transport: 'tcp'
    secrets: [
        {
          name: 'container-registry-password'
          value: dockerHubPasswordOrToken
        }
      ]
    environment: [
      {
        name: 'test-environment-variable'
        value: 'Foo'
      }
    ]
  }
  {
    addToAPIM: true
    apiPath: 'c'
    //connectKeyVault: false
    containerAppName: '${solutionName}-catalog-api'
    dockerImageName: '${dockerHubUsername}/catalog-api:latest'
    minScale: 0
    targetPort: 80
    transport: 'http'
    secrets: [
        {
          name: 'container-registry-password'
          value: dockerHubPasswordOrToken
        }
      ]
    environment: [
      {
        name: 'test-environment-variable'
        value: 'Foo'
      }
    ]
  }
  {
    addToAPIM: true
    apiPath: 'b'
    //connectKeyVault: false
    containerAppName: '${solutionName}-cart-api'
    dockerImageName: '${dockerHubUsername}/cart-api:latest'
    minScale: 0
    targetPort: 80
    transport: 'http'
    secrets: [
        {
          name: 'container-registry-password'
          value: dockerHubPasswordOrToken
        }
      ] 
    environment: [
      {
        name: 'test-environment-variable'
        value: 'Foo'
      }
    ]
  }
  {
    addToAPIM: true
    apiPath: 'o'
    //connectKeyVault: false
    containerAppName: '${solutionName}-order-api'
    dockerImageName: '${dockerHubUsername}/order-api:latest'
    minScale: 0
    targetPort: 80
    transport: 'http'
    secrets: [
        {
          name: 'container-registry-password'
          value: dockerHubPasswordOrToken
        }
        {
          name: 'stripe-configuration-apikey'
          value: stripeApiKey
        }
      ] 
    environment: [
      {
        name: 'stripe-configuration-apikey'
        secretRef: 'stripe-configuration-apikey'
      }
    ]
  }
]

resource workspaceForManagedEnvionment 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: take('wkspc-${solutionName}-${environmentType}-${location}', 63)
  location: location
  properties: {
    sku: {
      name: 'pergb2018'
    }
    retentionInDays: 30
    workspaceCapping: {}
  }
}

module subnetForManagedEnvironment 'modules/newInfrastructureSubnetTemplate.bicep' = {
  name: 'newInfrastructureSubnetTemplate'
  params: {
    environmentType: environmentType
    location: location
    solutionName: solutionName
  }
}

resource containerAppsManagedEnvironment 'Microsoft.App/managedEnvironments@2022-11-01-preview' = {
  name: 'env-${solutionName}-${environmentType}-${location}'
  location: location
  properties: {
    infrastructureResourceGroup: 'rg-infrastructure-${solutionName}-${environmentType}'
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: workspaceForManagedEnvionment.properties.customerId
        sharedKey: workspaceForManagedEnvionment.listKeys().primarySharedKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: subnetForManagedEnvironment.outputs.id
      internal: false
    }
    zoneRedundant: false
  }
}

module apiManagementGateway 'modules/apiManagementGateway.bicep' = {
  name: 'apiManagementTemplate'
  params: {
    environmentType: environmentType
    location: location
    solutionName: solutionName
  }
}

// Using container secrets instead of Key Vault
// @description('Key Vault to demo connectivity from Container App')
// module keyVaultForSolution 'modules/keyVault.bicep' = {
//   name: 'keyVaultTemplate'
//   params: {
//     keyVaultName: 'kv-${solutionName}-${environmentType}-${location}'
//     location: location
//   }
// }

@description('Iterate and provision each containerized microservice')
module containerAppModule 'modules/containerApps.bicep' = [for (microservice, index) in microservices: {
  name: 'containerApp-${index}'
  params: {
    containerSecrets: microservice.secrets
    environmentVariables: microservice.environment
    addToAPIM: microservice.addToAPIM
    //apimIpAddress: apiManagementGateway.outputs.ipAddress
    apimName: apiManagementGateway.outputs.name
    apiPath: microservice.apiPath
    //    connectKeyVault: microservice.connectKeyVault
    containerAppName: microservice.containerAppName
    containerAppManagedEnvironmentName: containerAppsManagedEnvironment.name
    dockerHubUsername: dockerHubUsername
    dockerImageName: microservice.dockerImageName
    minScale: microservice.minScale
    targetPort: microservice.targetPort
    transport: microservice.transport
    //    keyVaultId: keyVaultForSolution.outputs.id
    //    keyVaultName: keyVaultForSolution.outputs.name
    location: location
  }
}]

module githubActionsModule 'modules/githubActions.bicep' = {
  name: 'githubActionsTemplate'
  params: {
    environmentType: environmentType
    githubOrganizationOrUsername: githubOrganizationOrUsername
    location: location
    solutionName: solutionName
  }
}

module staticWebAppModule 'modules/staticWebApp.bicep' = {
  name: 'staticWebAppTemplate'
  params: {
    solutionName: solutionName
    apimName: apiManagementGateway.outputs.name
  }
}

// Angular SPA routing requires more from server than pure static hosting
// Switched to static web app
// @description('Static web site hosted from Blob storage')
// module storageWebsiteHostingModule 'modules/storageWebsiteHosting.bicep' = {
//   name: 'storageWebsiteHostingTemplate'
//   params: {
//     environmentType: environmentType
//     location: location
//     solutionName: solutionName
//   }
// }

// Putting micro-frontend on hold to focus on a pure, full-bleed Angular solution
// @description('Single-spa micro-frontend solution')
// module singleSpaStaticWebsiteModule 'modules/singleSpaStaticWeb.bicep' = {
//   name: 'singleSpaStaticWebsiteTemplate'
//   params: {
//     environmentType: environmentType
//     location: location
//     solutionName: solutionName
//   }
// }

output nextSteps string = 'Update GitHub Actions secrets'
