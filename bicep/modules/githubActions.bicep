/*
  SYNOPSIS: Me
  DESCRIPTION: Provision the resources to allow GitHub CI/CD to deploy to Azure. Includes Container Apps and static websites.
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
*/

param containerAppManagedEnvironmentName string

@description('The name of the app or solution.')
param solutionName string


@description('The type of environment you want to provision. Allowed values are dev and prod.')
@allowed([
  'dev'
  'prod'
])
param environmentType string
param location string
param githubOrganizationOrUsername string



resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'uai-GitHubOIDC'
  location: location
}


@description('The Contributor role. See https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#contributor')
resource contributorRoleDefinition 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = {
  scope: subscription()
  // This is the Contributor role, which is the minimum role permission we can give for Container Environment. See https://docs.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#:~:text=17d1049b-9a84-46fb-8f53-869881c3d3ab
  name: 'b24988ac-6180-42a0-ab88-20f7382dd24c'
}


resource containerAppManagedEnvironment 'Microsoft.App/managedEnvironments@2022-11-01-preview' existing = {
  name: containerAppManagedEnvironmentName
}


// https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/scenarios-rbac
// https://learn.microsoft.com/en-us/azure/role-based-access-control/troubleshooting?tabs=bicep#symptom---assigning-a-role-to-a-new-principal-sometimes-fails
@description('The default scope is the current Resource Group')
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: resourceGroup()  // Deploys to Container App Environment and Storage Account
  name: guid(resourceGroup().id, userAssignedIdentity.id, contributorRoleDefinition.id)
  properties: {
    roleDefinitionId: contributorRoleDefinition.id
    principalId: userAssignedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}


var federatedIdentityName = 'fic-${solutionName}-${environmentType}'
// https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure?tabs=azure-cli%2Clinux
@description('Create trust between GitHub and User Assigned Identity')
resource federatedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: userAssignedIdentity
  name: federatedIdentityName
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: 'repo:${githubOrganizationOrUsername}/${solutionName}:environment:${environmentType}'
    audiences: [
      'api://AzureADTokenExchange'
    ]
  }
}
