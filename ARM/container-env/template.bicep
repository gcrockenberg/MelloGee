param subscriptionId string
param name string
param location string
param environmentId string
param containers array

@secure()
param secrets object = {
  arrayValue: []
}
param registries array
param ingress object
param environmentName string
param workspaceName string
param workspaceLocation string

resource name_resource 'Microsoft.App/containerapps@2022-11-01-preview' = {
  name: name
  kind: 'containerapps'
  location: location
  properties: {
    environmentId: environmentId
    configuration: {
      secrets: secrets.arrayValue
      registries: registries
      activeRevisionsMode: 'Single'
      ingress: ingress
    }
    template: {
      containers: containers
      scale: {
        minReplicas: 0
      }
    }
  }
  dependsOn: [
    environment
  ]
}

resource environment 'Microsoft.App/managedEnvironments@2022-11-01-preview' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference('Microsoft.OperationalInsights/workspaces/${workspaceName}', '2020-08-01').customerId
        sharedKey: listKeys('Microsoft.OperationalInsights/workspaces/${workspaceName}', '2020-08-01').primarySharedKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: '/subscriptions/48e9f9a8-695d-42ee-bc6d-b6f85795e2b6/resourceGroups/MelloGee/providers/Microsoft.Network/virtualNetworks/vnet-for-me/subnets/snet-for-me'
      internal: true
    }
    zoneRedundant: false
  }
  dependsOn: [
    workspace
    newInfrastructureSubnetTemplate
  ]
}

resource workspace 'Microsoft.OperationalInsights/workspaces@2020-08-01' = {
  name: workspaceName
  location: workspaceLocation
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    workspaceCapping: {}
  }
  dependsOn: []
}

module newInfrastructureSubnetTemplate './nested_newInfrastructureSubnetTemplate.bicep' = {
  name: 'newInfrastructureSubnetTemplate'
  scope: resourceGroup('48e9f9a8-695d-42ee-bc6d-b6f85795e2b6', 'MelloGee')
  params: {}
  dependsOn: [
    vnet_for_me
  ]
}

resource vnet_for_me 'Microsoft.Network/virtualNetworks@2020-07-01' = {
  location: 'eastus'
  name: 'vnet-for-me'
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: []
  }
}