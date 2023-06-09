/*
  SYNOPSIS: Me
  DESCRIPTION: Create and configure the Me Container Apps
  VERSION: 1.0.0
  OWNER TEAM: MelloGee
*/
@description('The name of the app or solution.')
param solutionName string = 'me'

@description('The location into which your Azure resources should be deployed.')
param location string = resourceGroup().location

@description('The type of environment you want to provision. Allowed values are dev and prod.')
@allowed([
  'dev'
  'prod'
])
param environmentType string = 'dev'

//@description('A unique suffix to add to resource names that need to be globally unique.')
//var resourceNameSuffix = take(uniqueString(resourceGroup().id), 13)

@description('Place holder for Container Apps')
@secure()
param containerSecrets object = {
  arrayValue: [
        {
          name: 'container-registry-password'
          value: containerRegistryPassword
        }
      ]      
}

@description('Required to use Docker as container registry.')
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
          passwordSecretRef: 'container-registry-password'
          username: 'gcrockenberg'
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
  name: 'env-${solutionName}-${environmentType}-${location}'
}

resource coffeeApiContainerApp 'Microsoft.App/containerapps@2022-11-01-preview' = {
  name: '${solutionName}-coffee-api'
  location: location
  properties: {
    environmentId: containerAppManagedEnvironment.id
    configuration: {
      secrets: containerSecrets.arrayValue
      registries: containerRegistries
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
  location: location
  properties: {
    environmentId: containerAppManagedEnvironment.id
    configuration: {
      secrets: containerSecrets.arrayValue
      registries: containerRegistries
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

@description('This is the built-in Key Vault Secrets User role. See https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#key-vault-secrets-user')
resource keyVaultReaderRoleDefinition 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = {
  scope: subscription()
  name: '4633458b-17de-408a-b874-0445c86b69e6'
}

// TODO - Build Key Vault into full solution automation
@description('Preexisting key vault')
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' existing = {
  name: 'MG-CatalogServiceVault'
}

@description('Connect container app to the key vault')
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
