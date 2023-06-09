resource keyvault_9db67 'Microsoft.ServiceLinker/linkers@2022-11-01-preview' = {
  scope: 'Microsoft.App/containerApps/me-catalog-api'
  name: 'keyvault_9db67'
  properties: {
    clientType: 'dotnet'
    targetService: {
      type: 'AzureResource'
      id: '/subscriptions/48e9f9a8-695d-42ee-bc6d-b6f85795e2b6/resourceGroups/MelloGee/providers/Microsoft.KeyVault/vaults/MG-CatalogServiceVault'
      resourceProperties: {
        type: 'KeyVault'
        connectAsKubernetesCsiDriver: false
      }
    }
    authInfo: {
      authType: 'systemAssignedIdentity'
      roles: []
    }
    scope: 'container-main'
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