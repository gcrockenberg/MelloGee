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

@description('The Container App microservices')
var microservices = [
  {
    apiPath: 'cof'
    connectKeyVault: false
    containerAppName: '${solutionName}-coffee-api'
    dockerImageName: '${dockerHubUsername}/coffeeapi:latest'
  }
  {
    apiPath: 'cat'
    connectKeyVault: true
    containerAppName: '${solutionName}-catalog-api'
    dockerImageName: '${dockerHubUsername}/catalogapi:latest'
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

module apiManagement 'modules/apimGateway.bicep' = {
  name: 'apiManagementTemplate'
  params: {
    environmentType: environmentType
    location: location
    solutionName: solutionName
  }
}

var keyVaultName = 'kv-${solutionName}-${environmentType}-${location}'
module keyVaultForSolution 'modules/keyVault.bicep' = {
  name: 'keyVaultTemplate'
  params: {
    keyVaultName: keyVaultName
    location: location
  }
}

module containerAppModule 'modules/containerApps.bicep' = [for (microservice, index) in microservices: {
  name: 'containerApp-${index}'
  params: {
    apimIpAddress: apiManagement.outputs.ipAddress
    apimName: apiManagement.outputs.name
    apiPath: microservice.apiPath
    connectKeyVault: microservice.connectKeyVault
    containerAppName: microservice.containerAppName
    containerAppManagedEnvironmentName: containerAppsManagedEnvironment.name
    dockerHubPasswordOrToken: dockerHubPasswordOrToken
    dockerHubUsername: dockerHubUsername
    dockerImageName: microservice.dockerImageName
    keyVaultId: keyVaultForSolution.outputs.id
    keyVaultName: keyVaultName
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

module singleSpaStaticWebsiteModule 'modules/singleSpaStaticWeb.bicep' = {
  name: 'singleSpaStaticWebsiteTemplate'
  params: {
    environmentType: environmentType
    location: location
    solutionName: solutionName
  }
}

