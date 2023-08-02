/*
  SYNOPSIS: Me
  DESCRIPTION: Provision and configure the Me Container Apps and APIs
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
*/

param addToAPIM bool
param apimName string
//param apimIpAddress string =''
param apiPath string
//param connectKeyVault bool
param containerAppName string
param containerAppManagedEnvironmentName string
param dockerImageName string
param minScale int
param targetPort int
param transport string

@description('The location into which your Azure resources should be deployed.')
param location string = resourceGroup().location

@description('Container App secrets')
param containerSecrets array

@description('Container environment variables.')
param environmentVariables array

@description('Required to integrate with Docker as container registry')
@secure()
param dockerHubUsername string

@description('The smallest for dev testing')
param containerResources object

@description('Allow scale to 0 for minimal cost during dev')
var containerScale = {
  minReplicas: minScale
  maxReplicas: 1
}

//param keyVaultName string
//param keyVaultId string

@description('Docker registry for container app')
param containerRegistries array = [
  {
    server: 'registry.docker.io'
    passwordSecretRef: 'container-registry-password'
    username: dockerHubUsername
  }
]

resource containerAppManagedEnvironment 'Microsoft.App/managedEnvironments@2023-04-01-preview' existing = {
  name: containerAppManagedEnvironmentName
}

// @description('This is the built-in Key Vault Secrets User role. See https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#key-vault-secrets-user')
// resource keyVaultReaderRoleDefinition 'Microsoft.Authorization/roleDefinitions@2022-05-01-preview' existing = if (connectKeyVault) {
//   scope: subscription()
//   name: '4633458b-17de-408a-b874-0445c86b69e6'
// }

resource apim 'Microsoft.ApiManagement/service@2023-03-01-preview' existing = {
  name: apimName
}

// The following ranges support using Consumption plan by allowing the whole data center
// See https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-ip-addresses#ip-addresses-of-consumption-tier-api-management-service
// See ServiceTags_Public_20230710.json under AzureCloud.eastus
var eastusDataCenterIPRanges = [
  '4.156.0.0/15'
  '4.227.128.0/17'
  '4.236.128.0/17'
  '4.246.128.0/17'
  '4.255.0.0/17'
  '13.68.128.0/17'
  '13.72.64.0/18'
  '13.82.0.0/16'
  '13.87.112.0/21'
  '13.90.0.0/16'
  '13.92.0.0/16'
  '13.104.144.128/27'
  '13.104.152.128/25'
  '13.104.192.0/21'
  '13.104.211.0/25'
  '13.104.214.128/25'
  '13.104.215.0/25'
  '13.105.17.0/26'
  '13.105.19.0/25'
  '13.105.20.192/26'
  '13.105.27.0/25'
  '13.105.27.192/27'
  '13.105.36.192/26'
  '13.105.74.48/28'
  '13.105.98.48/28'
  '13.105.98.96/27'
  '13.105.98.128/27'
  '13.105.104.32/27'
  '13.105.104.64/28'
  '13.105.104.96/27'
  '13.105.106.0/27'
  '13.105.106.32/28'
  '13.105.106.64/27'
  '20.25.0.0/17'
  '20.33.3.0/24'
  '20.33.8.0/24'
  '20.33.12.0/24'
  '20.33.143.0/24'
  '20.33.150.0/24'
  '20.38.98.0/24'
  '20.39.32.0/19'
  '20.42.0.0/17'
  '20.47.1.0/24'
  '20.47.16.0/23'
  '20.47.31.0/24'
  '20.47.108.0/23'
  '20.47.113.0/24'
  '20.49.104.0/21'
  '20.51.128.0/17'
  '20.55.0.0/17'
  '20.60.0.0/24'
  '20.60.2.0/23'
  '20.60.6.0/23'
  '20.60.60.0/22'
  '20.60.128.0/23'
  '20.60.134.0/23'
  '20.60.146.0/23'
  '20.60.220.0/23'
  '20.62.128.0/17'
  '20.72.128.0/18'
  '20.75.128.0/17'
  '20.81.0.0/17'
  '20.83.128.0/18'
  '20.84.0.0/17'
  '20.85.128.0/17'
  '20.88.128.0/18'
  '20.95.0.0/24'
  '20.95.2.0/24'
  '20.95.4.0/24'
  '20.95.6.0/24'
  '20.95.19.0/24'
  '20.95.21.0/24'
  '20.95.31.0/24'
  '20.95.33.0/24'
  '20.95.34.0/24'
  '20.95.54.0/24'
  '20.95.58.0/24'
  '20.102.0.0/17'
  '20.106.128.0/17'
  '20.115.0.0/17'
  '20.119.0.0/17'
  '20.120.0.0/17'
  '20.121.0.0/16'
  '20.124.0.0/16'
  '20.127.0.0/16'
  '20.135.4.0/23'
  '20.135.194.0/23'
  '20.135.196.0/22'
  '20.136.3.0/25'
  '20.136.4.0/24'
  '20.143.12.0/24'
  '20.143.34.0/23'
  '20.143.52.0/23'
  '20.150.32.0/23'
  '20.150.90.0/24'
  '20.152.0.0/23'
  '20.157.6.0/23'
  '20.157.19.0/24'
  '20.157.24.0/24'
  '20.157.39.0/24'
  '20.157.59.0/24'
  '20.157.61.0/24'
  '20.157.93.0/24'
  '20.157.104.0/24'
  '20.157.109.0/24'
  '20.157.116.0/24'
  '20.157.124.0/24'
  '20.157.132.0/24'
  '20.157.147.0/24'
  '20.157.171.0/24'
  '20.157.215.0/24'
  '20.157.216.0/24'
  '20.157.231.0/24'
  '20.157.240.0/24'
  '20.157.252.0/24'
  '20.163.128.0/17'
  '20.168.192.0/18'
  '20.169.128.0/17'
  '20.172.128.0/17'
  '20.185.0.0/16'
  '20.190.130.0/24'
  '20.190.151.0/24'
  '20.202.20.0/24'
  '20.202.39.0/24'
  '20.202.106.0/24'
  '20.202.110.0/24'
  '20.202.114.0/24'
  '20.202.118.0/24'
  '20.202.120.0/22'
  '20.202.124.0/24'
  '20.202.130.0/24'
  '20.202.134.0/24'
  '20.202.138.0/24'
  '20.202.184.0/21'
  '20.202.192.0/23'
  '20.209.0.0/23'
  '20.209.40.0/23'
  '20.209.52.0/23'
  '20.209.74.0/23'
  '20.209.84.0/23'
  '20.209.106.0/23'
  '20.209.146.0/23'
  '20.209.162.0/23'
  '20.228.128.0/17'
  '20.231.0.0/17'
  '20.231.192.0/18'
  '20.232.0.0/16'
  '20.237.0.0/17'
  '20.241.128.0/17'
  '20.242.128.0/17'
  '20.246.128.0/17'
  '20.253.0.0/17'
  '23.96.0.0/17'
  '23.98.45.0/24'
  '23.100.16.0/20'
  '23.101.128.0/20'
  '40.64.146.80/28'
  '40.71.0.0/16'
  '40.76.0.0/16'
  '40.78.219.0/24'
  '40.78.224.0/21'
  '40.79.152.0/21'
  '40.80.144.0/21'
  '40.82.24.0/22'
  '40.82.60.0/22'
  '40.85.160.0/19'
  '40.87.0.0/17'
  '40.87.164.0/22'
  '40.88.0.0/16'
  '40.90.23.128/25'
  '40.90.24.128/25'
  '40.90.25.0/26'
  '40.90.30.192/26'
  '40.90.129.128/26'
  '40.90.130.96/28'
  '40.90.131.224/27'
  '40.90.136.16/28'
  '40.90.136.32/27'
  '40.90.137.96/27'
  '40.90.139.224/27'
  '40.90.143.0/27'
  '40.90.146.64/26'
  '40.90.147.0/27'
  '40.90.148.64/27'
  '40.90.150.32/27'
  '40.90.224.0/19'
  '40.91.4.0/22'
  '40.93.2.0/24'
  '40.93.4.0/24'
  '40.93.11.0/24'
  '40.97.4.0/24'
  '40.97.46.192/26'
  '40.97.47.0/25'
  '40.112.48.0/20'
  '40.114.0.0/17'
  '40.117.32.0/19'
  '40.117.64.0/18'
  '40.117.128.0/17'
  '40.121.0.0/16'
  '40.123.132.0/22'
  '40.123.176.0/22'
  '40.126.2.0/24'
  '40.126.23.0/24'
  '52.101.4.0/22'
  '52.101.9.0/24'
  '52.101.20.0/22'
  '52.101.51.0/24'
  '52.101.52.0/22'
  '52.102.129.0/24'
  '52.102.137.0/24'
  '52.102.159.0/24'
  '52.103.1.0/24'
  '52.103.3.0/24'
  '52.103.11.0/24'
  '52.103.129.0/24'
  '52.103.137.0/24'
  '52.106.2.0/24'
  '52.108.16.0/21'
  '52.108.79.0/24'
  '52.108.105.0/24'
  '52.108.106.0/23'
  '52.109.12.0/22'
  '52.111.229.0/24'
  '52.112.23.0/24'
  '52.112.112.0/24'
  '52.112.123.0/24'
  '52.112.127.0/24'
  '52.113.16.0/20'
  '52.114.132.0/22'
  '52.115.54.0/24'
  '52.115.62.0/23'
  '52.115.192.0/19'
  '52.120.32.0/19'
  '52.120.224.0/20'
  '52.122.0.0/24'
  '52.122.2.0/23'
  '52.122.4.0/23'
  '52.122.6.0/24'
  '52.122.148.0/22'
  '52.122.152.0/21'
  '52.122.160.0/22'
  '52.123.0.0/24'
  '52.123.10.0/24'
  '52.123.187.0/24'
  '52.123.188.0/24'
  '52.125.132.0/22'
  '52.136.64.0/18'
  '52.142.0.0/18'
  '52.143.207.0/24'
  '52.146.0.0/17'
  '52.147.192.0/18'
  '52.149.128.0/17'
  '52.150.0.0/17'
  '52.151.128.0/17'
  '52.152.128.0/17'
  '52.154.64.0/18'
  '52.168.0.0/16'
  '52.170.0.0/16'
  '52.179.0.0/17'
  '52.186.0.0/16'
  '52.188.0.0/16'
  '52.190.0.0/17'
  '52.191.0.0/17'
  '52.191.192.0/18'
  '52.224.0.0/16'
  '52.226.0.0/16'
  '52.232.146.0/24'
  '52.234.128.0/17'
  '52.239.152.0/22'
  '52.239.168.0/22'
  '52.239.207.192/26'
  '52.239.214.0/23'
  '52.239.220.0/23'
  '52.239.246.0/23'
  '52.239.252.0/24'
  '52.240.0.0/17'
  '52.245.8.0/22'
  '52.245.104.0/22'
  '52.249.128.0/17'
  '52.253.160.0/24'
  '52.255.128.0/17'
  '65.54.19.128/27'
  '68.220.88.0/21'
  '74.235.0.0/16'
  '104.41.128.0/19'
  '104.44.91.32/27'
  '104.44.94.16/28'
  '104.44.95.160/27'
  '104.44.95.240/28'
  '104.45.128.0/18'
  '104.45.192.0/20'
  '104.211.0.0/18'
  '137.116.112.0/20'
  '137.117.32.0/19'
  '137.117.64.0/18'
  '137.135.64.0/18'
  '138.91.96.0/19'
  '157.56.176.0/21'
  '168.61.32.0/20'
  '168.61.48.0/21'
  '168.62.32.0/19'
  '168.62.160.0/19'
  '172.171.32.0/19'
  '172.171.64.0/19'
  '172.171.128.0/17'
  '172.173.128.0/17'
  '172.174.0.0/16'
  '172.178.0.0/17'
  '172.190.0.0/16'
  '191.234.32.0/19'
  '191.236.0.0/18'
  '191.237.0.0/17'
  '191.238.0.0/18'
  '204.152.18.0/31'
  '204.152.18.8/29'
  '204.152.18.32/27'
  '204.152.18.64/26'
  '204.152.19.0/24'
]
var ipSecurityRestrictionsForAPIMConsuptionPlan = [for (ipRange, i) in eastusDataCenterIPRanges: {
  name: 'allow-apim-access_${i}'
  action: 'Allow'
  ipAddressRange: ipRange
  description: 'Allow request from data center ip range ${i}'
}]
@description('Provision container app - CI/CD completes the api deployment')
resource containerApp 'Microsoft.App/containerApps@2023-04-01-preview' = {
  name: containerAppName
  location: location
  properties: {
    environmentId: containerAppManagedEnvironment.id
    configuration: {
      secrets: containerSecrets
      registries: containerRegistries
      activeRevisionsMode: 'Single'
      ingress: {
        external: addToAPIM
        transport: transport
        allowInsecure: (transport == 'http')
        targetPort: targetPort
        stickySessions: {
          affinity: 'none'
        }
        ipSecurityRestrictions: (addToAPIM) ? ipSecurityRestrictionsForAPIMConsuptionPlan : []   //[ 
        //   {  // For APIM Developer plan
        //     name: 'allow-apim-access'
        //     action: 'Allow'
        //     ipAddressRange: '${apimIpAddress}/32' 
        //   }
        // ]
      }
    }
    template: {
      containers: [
        {
          name: 'container-main'
          image: dockerImageName
          resources: containerResources
          env: environmentVariables
          // connectKeyVault ? [
          //   {
          //     name: 'VAULT_NAME'
          //     value: 'No key vault' //keyVaultName
          //   }
          // ] : []
        }
      ]
      scale: containerScale
    }
  }
}

// Using Container App secrets instead
// @description('Connect Container App to the Key Vault using System Assigned Id and RBAC')
// resource connectContainerAppToKeyVault 'Microsoft.ServiceLinker/linkers@2022-11-01-preview' = if (connectKeyVault) {
//   scope: containerApp
//   name: 'connect_container_app_to_keyvault'
//   properties: {
//     clientType: 'dotnet'
//     targetService: {
//       type: 'AzureResource'
//       id: keyVaultId
//       resourceProperties: {
//         type: 'KeyVault'
//         connectAsKubernetesCsiDriver: false
//       }
//     }
//     authInfo: {
//       authType: 'systemAssignedIdentity'
//       roles: [
//         keyVaultReaderRoleDefinition.name
//       ]
//     }
//     scope: containerApp.properties.template.containers[0].name
//     configurationInfo: {
//       customizedKeys: {}
//       daprProperties: {
//         version: ''
//         componentType: ''
//         metadata: []
//         scopes: []
//       }
//     }
//   }
// }

// Thank you - https://www.chingono.com/blog/2022/09/28/integrate-container-apps-api-management-bicep/
@description('Provision the Container App as a Backend resource in APIM')
resource containerAppBackendResource 'Microsoft.ApiManagement/service/backends@2023-03-01-preview' = if (addToAPIM) {
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
resource containerAppApiResource 'Microsoft.ApiManagement/service/apis@2023-03-01-preview' = if (addToAPIM) {
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
resource setApiPolicyToUseBackend 'Microsoft.ApiManagement/service/apis/policies@2023-03-01-preview' = if (addToAPIM) {
  name: 'policy'
  parent: containerAppApiResource
  properties: {
    value: replace(loadTextContent('apimPolicies/api.xml'), '{backendName}', containerAppBackendResource.name)
    format: 'xml'
  }
}
