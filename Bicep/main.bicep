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

@description('Required to configure SQL Server. 8 character min, 3 of following - uppercase, lowercase, digit, non-alphanumeric')
@secure()
param msSqlSaPassword string

@description('Naming rules for CA env variables: allowed characters are a-z, A-Z, 0-9 and _')
var microserviceCommonEnvironment = [
  {
    name: 'AzureAdB2C__Instance'
    value: 'https://meauth.b2clogin.com'
  }
  {
    name: 'AzureAdB2C__Domain'
    value: 'meauth.onmicrosoft.com'
  }
  {
    name: 'AzureAdB2C__ClientId'
    value: '730a4c4b-7cbe-4aef-8677-01763fad779a'
  }
  {
    name: 'AzureAdB2C__SignedOutCallbackPath'
    value: '/signout/B2C_1_susi_v2'
  }
  {
    name: 'AzureAdB2C__SignUpSignInPolicyId'
    value: 'B2C_1_susi_v2'
  }
  {
    name: 'ConnectionStrings__EventBus'
    value: 'me-rabbitmq'
  }
  {    
    name: 'EventBus__RetryCount'
    value: '5'
  }
]

@description('Naming rules for CA secrets: allowed characters are a-z and -')
var microserviceCommonSecrets = [
  {
    name: 'container-registry-password'
    value: dockerHubPasswordOrToken
  }
]


@description('Microsoft should add this to thier standard environment suffixes list')
var apiManagementSuffix = 'azure-api.net'

var apimName = environmentType == 'dev' ? '${solutionName}-dev' : solutionName


// Allowed CPU - Memory combinations: 
// [cpu: 0.25, memory: 0.5Gi]; 
// [cpu: 0.5, memory: 1.0Gi]; 
// [cpu: 0.75, memory: 1.5Gi]; 
// [cpu: 1.0, memory: 2.0Gi]; 
// [cpu: 1.25, memory: 2.5Gi]; 
// [cpu: 1.5, memory: 3.0Gi]; 
// [cpu: 1.75, memory: 3.5Gi]; 
// [cpu: 2.0, memory: 4.0Gi]
var defaultResources = {
  cpu: '0.25'
  memory: '0.5Gi'
}
@description('The Container App microservices')
var microservices = [
  {
    skip: false
    addToAPIM: false
    apiPath: ''
    //connectKeyVault: false
    containerAppName: '${solutionName}-cart-data'
    dockerImageName: '${dockerHubUsername}/cart-data:latest'
    minScale: 1
    targetPort: 6379
    transport: 'tcp'
    secrets: microserviceCommonSecrets
    environment: []
    resources: defaultResources
  }
  {
    skip: false
    addToAPIM: false
    apiPath: ''
    //connectKeyVault: false
    containerAppName: '${solutionName}-sql-data'
    dockerImageName: '${dockerHubUsername}/sqlserver:latest'
    minScale: 1
    targetPort: 1433
    transport: 'tcp'
    secrets: [
      {
        name: 'container-registry-password'
        value: dockerHubPasswordOrToken
      }
      {
        name: 'mssql-sa-password'
        value: msSqlSaPassword
      }
    ]
    environment: [
      {
        name: 'MSSQL_SA_PASSWORD'
        secretRef: 'mssql-sa-password'
      }
    ]
    resources: {
      cpu: '1.0'
      memory: '2.0Gi'
    }
  }
  { // Not currently used. Focused on SQL Server
    skip: true
    addToAPIM: false
    apiPath: ''
    //connectKeyVault: false
    containerAppName: '${solutionName}-mariadb'
    dockerImageName: '${dockerHubUsername}/mariadb:latest'
    minScale: 1
    targetPort: 3306
    transport: 'tcp'
    secrets: microserviceCommonSecrets
    environment: [
      {
        name: 'MARIADB_ALLOW_EMPTY_ROOT_PASSWORD'
        value: 'true'
      }
    ]
    resources: defaultResources   // Less demanding that SQL Server
  }
  {
    skip: false
    addToAPIM: false
    apiPath: ''
    //connectKeyVault: false
    containerAppName: '${solutionName}-rabbitmq'
    dockerImageName: '${dockerHubUsername}/rabbitmq:latest'
    minScale: 1
    targetPort: 5672
    transport: 'tcp'
    secrets: microserviceCommonSecrets
    environment: []
    resources: defaultResources
  }
  {
    skip: false
    addToAPIM: true
    apiPath: 'c'
    //connectKeyVault: false
    containerAppName: '${solutionName}-catalog-api'
    dockerImageName: '${dockerHubUsername}/catalog-api:latest'
    minScale: 0
    targetPort: 80
    transport: 'http'
    secrets: concat(microserviceCommonSecrets, [
        {
          name: 'connectionstrings-catalogdb'
          value: 'Server=${solutionName}-sql-data;Database=Me.Services.CatalogDb;User Id=sa;Password=${msSqlSaPassword};Encrypt=False;TrustServerCertificate=true'
          //value: 'server=${solutionName}-mariadb;port=3306;uid=root;password=;database=Me.Services.CatalogDb'
        }
      ])
    environment: concat(microserviceCommonEnvironment, [
      {
        name: 'ConnectionStrings__CatalogDb'
        secretRef: 'connectionstrings-catalogdb'
      }
      {
        name: 'PicBaseUrl' 
        value: 'https://${apimName}.${apiManagementSuffix}/c/api/v1/catalog/items/[0]/pic/'
      }
    ])
    resources: defaultResources
  }
  {
    skip: false
    addToAPIM: true
    apiPath: 'b'
    //connectKeyVault: false
    containerAppName: '${solutionName}-cart-api'
    dockerImageName: '${dockerHubUsername}/cart-api:latest'
    minScale: 0
    targetPort: 80
    transport: 'http'
    secrets: concat(microserviceCommonSecrets, [
        {
          name: 'stripe-configuration-apikey'
          value: stripeApiKey
        }
      ])
    environment: concat(microserviceCommonEnvironment, [
        {
          name: 'stripe-configuration-apikey'
          secretRef: 'stripe-configuration-apikey'
        }
        {
          name: 'ConnectionStrings__Redis'
          value: 'me-cart-data'
        }
      ])
      resources: defaultResources
    }
  {
    skip: false
    addToAPIM: true
    apiPath: 'o'
    //connectKeyVault: false
    containerAppName: '${solutionName}-order-api'
    dockerImageName: '${dockerHubUsername}/order-api:latest'
    minScale: 0
    targetPort: 80
    transport: 'http'
    secrets: concat(microserviceCommonSecrets, [
      {
        name: 'connectionstrings-purchasedb'
        value: 'Server=${solutionName}-sql-data;Database=Me.Services.PurchaseDb;User Id=sa;Password=${msSqlSaPassword};Encrypt=False;TrustServerCertificate=true'
        //value: 'server=${solutionName}-mariadb;port=3306;uid=root;password=;database=Me.Services.CatalogDb'
      }
    ])
    environment: concat(microserviceCommonEnvironment, [
      {
        name: 'ConnectionStrings__PurchaseDb'
        secretRef: 'connectionstrings-purchasedb'
      }
    ])
    resources: defaultResources
  }
  { // Test service
    skip: true
    addToAPIM: false
    apiPath: ''
    //connectKeyVault: false
    containerAppName: '${solutionName}-coffee-api'
    dockerImageName: '${dockerHubUsername}/coffeeapi:latest'
    minScale: 1
    targetPort: 80
    transport: 'http'
    secrets: microserviceCommonSecrets
    // concat(microserviceCommonSecrets, [
    //   {
    //     name: 'connectionstrings-coffeedb'
    //     value: 'server=${solutionName}-my-sql;port=3306;database=coffeedb;uid=root;password='
    //   }
    // ])
    environment: [
      // {
      //   name: 'ConnectionStrings__CoffeeDb'
      //   secretRef: 'connectionstrings-coffeedb'
      // }
      {
        name: 'ConnectionStrings__CoffeeDb'
        value: 'server=${solutionName}-mariadb;port=3306;uid=root;password=;database=coffeedb'
      }
    ]
    resources: defaultResources
  }
]

var filteredMicroservices = [for (item, i) in microservices: item.skip != true ? item : []]
var keepMicroservices = intersection(filteredMicroservices, microservices)

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
    apimName: apimName
    location: location
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
module containerAppModule 'modules/containerApps.bicep' = [for (microservice, index) in keepMicroservices: {
  name: 'containerApp-${index}'
  params: {
    containerResources: microservice.resources
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

// For AAD B2C login templates
@description('Static web site hosted from Blob storage')
module storageWebsiteHostingModule 'modules/storageWebsiteHosting.bicep' = {
  name: 'storageWebsiteHostingTemplate'
  params: {
    environmentType: environmentType
    location: location
    solutionName: solutionName
  }
}

// Putting micro-frontend on hold to focus on a pure, "full-bleed" Angular solution
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
