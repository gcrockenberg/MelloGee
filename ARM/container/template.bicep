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
  dependsOn: []
}