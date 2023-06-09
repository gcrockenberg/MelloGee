/*
  SYNOPSIS: Me
  DESCRIPTION: Create and manage the resources to support the Me solution
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
param containerRegistryPassword string


resource containerAppManagedEnvironment 'Microsoft.App/managedEnvironments@2022-11-01-preview' = {
  name: 'env-${solutionName}-${environmentType}-${location}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: workspaceForManagedEnvionment.properties.customerId
        sharedKey: workspaceForManagedEnvionment.listKeys().primarySharedKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: subnetForManagedEnvironment.outputs.id
      internal: true
    }
    zoneRedundant: false
  }
}

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

module containerApps 'modules/containerApps.bicep' = {
  name: 'containerApps'
  params: {
    environmentType: environmentType
    location: location
    solutionName: solutionName
    containerRegistryPassword: containerRegistryPassword
  }
  dependsOn: [
    containerAppManagedEnvironment
  ]
}
