/*
  SYNOPSIS: Me
  DESCRIPTION: Provision and configure the Me Container Apps and APIs
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
*/

param apimName string
param apimIpAddress string
param apiPath string
param connectKeyVault bool
param containerAppName string
param containerAppManagedEnvironmentName string
param dockerImageName string

@description('The location into which your Azure resources should be deployed.')
param location string = resourceGroup().location

@description('Container app secrets are common. Just connecting with Docker.')
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
@description('Required to integrate with Docker as container registry')
@secure()
param containerRegistryUserName string

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

param keyVaultName string
param keyVaultId string

@description('Docker registry for container app')
param containerRegistries array = [
  {
    server: 'registry.docker.io'
    passwordSecretRef: 'container-registry-password'
    username: containerRegistryUserName
  }
]

// @description('Container Apps are secure in subnet and accessed through APIM')
// param ingress object = {
//   external: true
//   transport: 'Auto'
//   allowInsecure: true
//   targetPort: 80
//   stickySessions: {
//     affinity: 'none'
//   }
// }

resource containerAppManagedEnvironment 'Microsoft.App/managedEnvironments@2022-11-01-preview' existing = {
  name: containerAppManagedEnvironmentName
}

@description('This is the built-in Key Vault Secrets User role. See https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#key-vault-secrets-user')
resource keyVaultReaderRoleDefinition 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = if (connectKeyVault) {
  scope: subscription()
  name: '4633458b-17de-408a-b874-0445c86b69e6'
}

resource apim 'Microsoft.ApiManagement/service@2022-09-01-preview' existing = {
  name: apimName
}

@description('Provision container app - CI/CD completes the api deployment')
resource containerApp 'Microsoft.App/containerApps@2022-11-01-preview' = {
  name: containerAppName
  location: location
  properties: {
    environmentId: containerAppManagedEnvironment.id
    configuration: {
      secrets: containerSecrets.arrayValue
      registries: containerRegistries
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        transport: 'Auto'
        allowInsecure: true
        targetPort: 80
        stickySessions: {
          affinity: 'none'
        }
        ipSecurityRestrictions: [
          {
            name: 'allow-apim-access'
            action: 'Allow'
            ipAddressRange: '${apimIpAddress}/32' 
          }
        ]
      }
    }
    template: {
      containers: [
        {
          name: 'container-main'
          image: dockerImageName
          resources: containerResources
          env: connectKeyVault ? [
            {
              name: 'VAULT_NAME'
              value: keyVaultName
            }
          ] : []
        }
      ]
      scale: containerScale
    }
  }
}

@description('Connect Container App to the Key Vault using System Assigned Id and RBAC')
resource connectContainerAppToKeyVault 'Microsoft.ServiceLinker/linkers@2022-11-01-preview' = if (connectKeyVault) {
  scope: containerApp
  name: 'connect_container_app_to_keyvault'
  properties: {
    clientType: 'dotnet'
    targetService: {
      type: 'AzureResource'
      id: keyVaultId
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
    scope: containerApp.properties.template.containers[0].name
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
}

// Thank you - https://www.chingono.com/blog/2022/09/28/integrate-container-apps-api-management-bicep/
@description('Provision the Container App as a Backend resource in APIM')
resource containerAppBackendResource 'Microsoft.ApiManagement/service/backends@2022-09-01-preview' = {
  name: 'ContainerApp_${containerApp.name}'
  parent: apim
  properties: {
    resourceId: '${environment().resourceManager}${containerApp.id}' // Management Uri
    protocol: 'http'
    url: 'https://${containerApp.properties.configuration.ingress.fqdn}'
    description: containerApp.name
  }
}

@description('Provision the Container App as an API in APIM')
resource containerAppApiResource 'Microsoft.ApiManagement/service/apis@2022-09-01-preview' = {
  parent: apim
  name: containerApp.name
  properties: {
    displayName: containerApp.name
    path: apiPath
    subscriptionRequired: false
    protocols: [
      'https'
    ]
    isCurrent: true
    // Import the operations
    value: 'https://${containerApp.properties.configuration.ingress.fqdn}/swagger/v1/swagger.json'
    format: 'openapi-link'
  }
}

@description('Update the Container App API in APIM to use the Container App Backend resource')
resource setApiPolicyToUseBackend 'Microsoft.ApiManagement/service/apis/policies@2022-09-01-preview' = {
  name: 'policy'
  parent: containerAppApiResource
  properties: {
    value: replace(loadTextContent('apimPolicies/api.xml'), '{backendName}', containerAppBackendResource.name)
    format: 'xml'
  }
}
