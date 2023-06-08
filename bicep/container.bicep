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
  arrayValue: [
        {
          name: 'container-registry-password'
          value: containerRegistryPassword
        }
      ]      
}

@secure()
param containerRegistryPassword string

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


resource containerAppManagedEnvironment 'Microsoft.App/managedEnvironments@2022-11-01-preview' existing = {
  name: 'env-me-dev-eastus'
}

resource coffeeApiContainerApp 'Microsoft.App/containerapps@2022-11-01-preview' = {
  name: '${solutionName}-coffee-api'
  kind: 'containerapps'
  location: location
  properties: {
    environmentId: containerAppManagedEnvironment.id
    configuration: {
      secrets: secrets.arrayValue
      registries: [
        {
          server: 'registry.docker.io'
          passwordSecretRef: 'container-registry-password'
          username: 'gcrockenberg'
        }
      ]
      activeRevisionsMode: 'Single'
      ingress: ingress
    }
    template: {
      containers: [
        {
          name: 'container-main'
          image: 'gcrockenberg/coffeeapi:latest'
          resources: containerResources
        }
      ]
      scale: containerScale
    }
  }
}

resource catalogApiContainerApp 'Microsoft.App/containerapps@2022-11-01-preview' = {
  name: '${solutionName}-catalog-api'
  kind: 'containerapps'
  location: location
  properties: {
    environmentId: containerAppManagedEnvironment.id
    configuration: {
      secrets: secrets.arrayValue
      registries: [
        {
          server: 'registry.docker.io'
          passwordSecretRef: 'container-registry-password'
          username: 'gcrockenberg'
        }
      ]
      activeRevisionsMode: 'Single'
      ingress: ingress
    }
    template: {
      containers: [
        {
          name: 'container-main'
          image: 'gcrockenberg/catalogapi:latest'
          resources: containerResources
        }
      ]
      scale: containerScale
    }
  }
}

@description('This is the built-in Key Vault Administrator role. See https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#key-vault-secrets-user')
resource keyVaultReaderRoleDefinition 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = {
  scope: subscription()
  name: '4633458b-17de-408a-b874-0445c86b69e6'
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' existing = {
  name: 'MG-CatalogServiceVault'
}

resource connectCatalogApiToKeyVault 'Microsoft.ServiceLinker/linkers@2022-11-01-preview' = {
  scope: catalogApiContainerApp
  name: 'catalogapi_to_keyvault'
  properties: {
    clientType: 'dotnet'
    targetService: {
      type: 'AzureResource'
      id: keyVault.id
      resourceProperties: {
        type: 'KeyVault'
        connectAsKubernetesCsiDriver: false
      }
    }
    authInfo: {
      authType: 'systemAssignedIdentity'
      roles: [
        keyVaultReaderRoleDefinition.name
      ]
    }
    scope: catalogApiContainerApp.properties.template.containers[0].name
    configurationInfo: {
      customizedKeys: {}
      daprProperties: {
        version: ''
        componentType: ''
        metadata: []
        scopes: []
      }
    }
  }
  dependsOn: []
}
