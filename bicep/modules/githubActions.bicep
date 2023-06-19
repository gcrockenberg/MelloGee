@description('The name of the app or solution.')
param solutionName string

@description('The type of environment you want to provision. Allowed values are dev and prod.')
@allowed([
  'dev'
  'prod'
])
param environmentType string
param location string
param githubRepoUserName string

var federatedIdentityName = 'fic-${solutionName}-${environmentType}'

resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'uai-${solutionName}-${environmentType}'
  location: location
}


@description('RoleDefinitionId is the built-in Contributor role. See https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#contributor')
module githubActionsModule 'roleAssignment.bicep' = {
  name: 'roleAssignmentTemplate'
  params: {
    principalId: userAssignedIdentity.properties.principalId
    roleDefinitionID: 'b24988ac-6180-42a0-ab88-20f7382dd24c'
  }
}

// https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure?tabs=azure-cli%2Clinux
@description('Create trust between GitHub and User Assigned Identity')
resource federatedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: userAssignedIdentity
  name: federatedIdentityName
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: 'repo:${githubRepoUserName}/me-microservice:environment:/${environmentType}'
    audiences: [
      'api://AzureADTokenExchange'
    ]
  }
}
