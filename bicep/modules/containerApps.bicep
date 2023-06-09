/*
  SYNOPSIS: Me
  DESCRIPTION: Create and configure the Me Container Apps
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
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

@description('Right now the container app secrets are common. Just connecting with Docker.')
@secure()
param containerSecrets object = {
  arrayValue: [
        {
          name: 'container-registry-password'
          value: containerRegistryPassword
        }
      ]      
}

@description('Required to integrate with Docker as container registry')
@secure()
param containerRegistryPassword string

@description('The smallest for dev testing')
var containerResources = {
            cpu: '0.25'
            memory: '0.5Gi'
          }

@description('Allow scale to 0 for minimal cost during dev')
var containerScale = {
        minReplicas: 0
        maxReplicas: 1
      }

var keyVaultName = 'kv-${solutionName}-${environmentType}-${location}'

@description('Docker registry for container app')
param containerRegistries array = [
        {
          server: 'registry.docker.io'
          passwordSecretRef: 'container-registry-password'
          username: 'gcrockenberg'
        }
      ]

@description('Container Apps are secure in subnet and accessed through APIM')
param ingress object = {
  external: true
  transport: 'Auto'
  allowInsecure: true
  targetPort: 80
  stickySessions: {
    affinity: 'none'
  }
}

@description('I wonder if this can be passed in as a parameter')
resource containerAppManagedEnvironment 'Microsoft.App/managedEnvironments@2022-11-01-preview' existing = {
  name: 'env-${solutionName}-${environmentType}-${location}'
}

@description('Set up the container app - CI/CD completes the api deployment')
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

@description('Set up the container app - CI/CD completes the api deployment')
resource catalogApiContainerApp 'Microsoft.App/containerApps@2022-11-01-preview' = {
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
          env: [
            {
              name: 'VAULT_NAME'
              value: keyVaultName
            }
          ]
        }
      ]
      scale: containerScale
    }
  }
  dependsOn: [
    keyVaultForManagedEnvironment
  ]
}

@description('This is the built-in Key Vault Secrets User role. See https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#key-vault-secrets-user')
resource keyVaultReaderRoleDefinition 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = {
  scope: subscription()
  name: '4633458b-17de-408a-b874-0445c86b69e6'
}

module keyVaultForManagedEnvironment 'keyVault.bicep' = {
  name: 'keyVault'
  params: {
    keyVaultName: keyVaultName
    location: location
  }
}

@description('Connect container app to the key vault using System Assigned Id and RBAC')
resource connectCatalogApiToKeyVault 'Microsoft.ServiceLinker/linkers@2022-11-01-preview' = {
  scope: catalogApiContainerApp
  name: 'catalogapi_to_keyvault'
  properties: {
    clientType: 'dotnet'
    targetService: {
      type: 'AzureResource'
      id: keyVaultForManagedEnvironment.outputs.id
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
