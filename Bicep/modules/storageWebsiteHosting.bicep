/*
  SYNOPSIS: Me
  DESCRIPTION: Provision Azure Blob static web site hosting for AAD B2C login customization
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
*/
@description('The name of the app or solution.')
param solutionName string

@description('The type of environment you want to provision. Allowed values are dev and prod.')
@allowed([
  'dev'
  'prod'
])
param environmentType string

@description('The location into which your Azure resources should be deployed.')
param location string

param storageAccountName string


resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    dnsEndpointType: 'Standard'
    defaultToOAuthAuthentication: false
    publicNetworkAccess: 'Enabled'
    allowCrossTenantReplication: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: true
    allowSharedKeyAccess: true
    networkAcls: {
      bypass: 'AzureServices'
      virtualNetworkRules: []
      ipRules: []
      defaultAction: 'Allow'
    }
    supportsHttpsTrafficOnly: true
    encryption: {
      requireInfrastructureEncryption: false
      services: {
        file: {
          keyType: 'Account'
          enabled: true
        }
        blob: {
          keyType: 'Account'
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
    accessTier: 'Hot'
  }
}


resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    changeFeed: {
      enabled: false
    }
    restorePolicy: {
      enabled: false
    }
    containerDeleteRetentionPolicy: {
      enabled: false
    }
    cors: {
      corsRules: [
        {
          allowedOrigins: [
            'https://meauth.b2clogin.com'
          ]
          allowedMethods: [
            'GET'
            'OPTIONS'
          ]
          maxAgeInSeconds: 200
          exposedHeaders: [
            '*'
          ]
          allowedHeaders: [
            '*'
          ]
        }
      ]
    }
    deleteRetentionPolicy: {
      allowPermanentDelete: false
      enabled: false
    }
    isVersioningEnabled: false
  }
}


resource storageAccountContributorRoleDefinition 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = {
  scope: subscription()
  // This is the Storage Account Contributor role, which is the minimum role permission we can give. See https://docs.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#:~:text=17d1049b-9a84-46fb-8f53-869881c3d3ab
  name: '17d1049b-9a84-46fb-8f53-869881c3d3ab'
}


resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: 'uai-BicepDeployment'
  location: location
}


resource roleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  scope: storageAccount
  name: guid(resourceGroup().id, managedIdentity.id, storageAccountContributorRoleDefinition.id)
  properties: {
    roleDefinitionId: storageAccountContributorRoleDefinition.id
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}


@description('Using Az Powershell because bicep does not support enabling static website on Storage Account')
resource deploymentScript 'Microsoft.Resources/deploymentScripts@2020-10-01' = {
  name: 'bicepDeploymentScript'
  location: location
  kind: 'AzurePowerShell'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  dependsOn: [
    // we need to ensure we wait for the role assignment to be deployed before trying to access the storage account
    roleAssignment
  ]
  properties: {
    azPowerShellVersion: '3.0'
    scriptContent: loadTextContent('../scripts/enable-static-website.ps1')
    retentionInterval: 'PT4H'
    environmentVariables: [
      {
        name: 'ResourceGroupName'
        value: resourceGroup().name
      }
      {
        name: 'StorageAccountName'
        value: storageAccount.name
      }
      {
        name: 'IndexDocumentPath'
        value: 'index.html'
      }
      {
        name: 'ErrorDocument404Path'
        value: 'error.html'
      }
    ]
  }
}

output blobStaticWebsiteEndpoint string = storageAccount.properties.primaryEndpoints.web
