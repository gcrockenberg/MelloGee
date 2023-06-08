/*
  SYNOPSIS: Me
  DESCRIPTION: Create and manage the resources to support the Me solution
  VERSION: 1.0.0
  OWNER TEAM: MelloGee
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

//@description('A unique suffix to add to resource names that need to be globally unique.')
//var resourceNameSuffix = take(uniqueString(resourceGroup().id), 13)

@description('Place holder for Container Apps')
@secure()
param secrets object = {
  arrayValue: []
}

var containerResources = {
            cpu: '0.25'
            memory: '.5Gi'
          }

var containerScale = {
        minReplicas: 0
        maxReplicas: 1
      }

@description('Docker registry for container app')
param containerRegistries array = [
        {
          server: 'registry.docker.io'
        }
      ]

@description('Container Apps are secure in vNet and accessed through APIM')
param ingress object = {
  external: true
  transport: 'Auto'
  allowInsecure: true
  targetPort: 80
  stickySessions: {
    affinity: 'none'
  }
}


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
  dependsOn: [
    subnetForManagedEnvironment
  ]
}

resource workspaceForManagedEnvionment 'Microsoft.OperationalInsights/workspaces@2020-08-01' = {
  name: take('wkspc-${solutionName}-${environmentType}-${location}', 63)
  location: location
  properties: {
    sku: {
      name: 'pergb2018'
    }
    retentionInDays: 30
    workspaceCapping: {}
  }
  dependsOn: []
}

module subnetForManagedEnvironment 'modules/newInfrastructureSubnetTemplate.bicep' = {
  name: 'newInfrastructureSubnetTemplate'
  //  scope: resourceGroup(subscriptionId, 'MelloGee')
  params: {
    vnetName: vnetForManagedEnvironment.name
    environmentType: environmentType
    location: location
    solutionName: solutionName
  }
}

resource vnetForManagedEnvironment 'Microsoft.Network/virtualNetworks@2020-07-01' = {
  location: location
  name: take('vnet-${solutionName}-${environmentType}-${location}', 64)
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: []
  }
}

resource coffeeApiContainerApp 'Microsoft.App/containerapps@2022-11-01-preview' = {
  name: '${solutionName}-coffee-api'
  kind: 'containerapps'
  location: location
  properties: {
    environmentId: containerAppManagedEnvironment.id
    configuration: {
      secrets: secrets.arrayValue
      registries: containerRegistries
      activeRevisionsMode: 'Single'
      ingress: ingress
    }
    template: {
      containers: [
        {
          name: '${environmentType}-coffee-api'
          image: 'gcrockenberg/coffeeapi:latest'
          resources: containerResources
        }
      ]
      scale: containerScale
    }
  }
}
