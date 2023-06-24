param storageAccounts_stmedev_name string = 'stmedev'

resource storageAccounts_stmedev_name_resource 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccounts_stmedev_name
  location: 'eastus'
  sku: {
    name: 'Standard_LRS'
    tier: 'Standard'
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

resource storageAccounts_stmedev_name_default 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  parent: storageAccounts_stmedev_name_resource
  name: 'default'
  sku: {
    name: 'Standard_LRS'
    tier: 'Standard'
  }
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
      corsRules: []
    }
    deleteRetentionPolicy: {
      allowPermanentDelete: false
      enabled: false
    }
    isVersioningEnabled: false
  }
}

// resource Microsoft_Storage_storageAccounts_fileServices_storageAccounts_stmedev_name_default 'Microsoft.Storage/storageAccounts/fileServices@2022-09-01' = {
//   parent: storageAccounts_stmedev_name_resource
//   name: 'default'
//   sku: {
//     name: 'Standard_LRS'
//     tier: 'Standard'
//   }
//   properties: {
//     protocolSettings: {
//       smb: {}
//     }
//     cors: {
//       corsRules: []
//     }
//     shareDeleteRetentionPolicy: {
//       enabled: false
//       days: 0
//     }
//   }
// }

// resource Microsoft_Storage_storageAccounts_queueServices_storageAccounts_stmedev_name_default 'Microsoft.Storage/storageAccounts/queueServices@2022-09-01' = {
//   parent: storageAccounts_stmedev_name_resource
//   name: 'default'
//   properties: {
//     cors: {
//       corsRules: []
//     }
//   }
// }

// resource Microsoft_Storage_storageAccounts_tableServices_storageAccounts_stmedev_name_default 'Microsoft.Storage/storageAccounts/tableServices@2022-09-01' = {
//   parent: storageAccounts_stmedev_name_resource
//   name: 'default'
//   properties: {
//     cors: {
//       corsRules: []
//     }
//   }
// }

resource storageAccounts_stmedev_name_default_web 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: storageAccounts_stmedev_name_default
  name: '$web'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
  dependsOn: [

    storageAccounts_stmedev_name_resource
  ]
}

resource storageAccounts_stmedev_name_default_catalog_app 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: storageAccounts_stmedev_name_default
  name: 'catalog-app'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'Container'
  }
  dependsOn: [

    storageAccounts_stmedev_name_resource
  ]
}

resource storageAccounts_stmedev_name_default_coffee_app 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: storageAccounts_stmedev_name_default
  name: 'coffee-app'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'Container'
  }
  dependsOn: [

    storageAccounts_stmedev_name_resource
  ]
}
