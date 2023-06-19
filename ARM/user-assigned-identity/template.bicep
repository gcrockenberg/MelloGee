param userAssignedIdentities_parent_uami_name string = 'parent_uami'

resource userAssignedIdentities_parent_uami_name_resource 'Microsoft.ManagedIdentity/userAssignedIdentities@2022-01-31-preview' = {
  name: userAssignedIdentities_parent_uami_name
  location: 'eastus'
}

resource userAssignedIdentities_parent_uami_name_fic01 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2022-01-31-preview' = {
  parent: userAssignedIdentities_parent_uami_name_resource
  name: 'fic01'
  properties: {
    issuer: 'https://kubernetes-oauth.azure.com'
    subject: 'fic01'
    audiences: [
      'api://AzureADTokenExchange'
    ]
  }
}

resource userAssignedIdentities_parent_uami_name_fic02 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2022-01-31-preview' = {
  parent: userAssignedIdentities_parent_uami_name_resource
  name: 'fic02'
  properties: {
    issuer: 'https://kubernetes-oauth.azure.com'
    subject: 'fic02'
    audiences: [
      'api://AzureADTokenExchange'
    ]
  }
  dependsOn: [

    userAssignedIdentities_parent_uami_name_fic01
  ]
}

resource userAssignedIdentities_parent_uami_name_fic03 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2022-01-31-preview' = {
  parent: userAssignedIdentities_parent_uami_name_resource
  name: 'fic03'
  
  properties: {
    issuer: 'https://kubernetes-oauth.azure.com'
    subject: 'fic03'
    audiences: [
      'api://AzureADTokenExchange'
    ]
  }
  dependsOn: [

    userAssignedIdentities_parent_uami_name_fic02
  ]
}
