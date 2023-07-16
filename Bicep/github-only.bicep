/*
  SYNOPSIS: Me
  DESCRIPTION: Provision ONLY resources needed for Github to deploy to Azure
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
*/
@description('The name of the app or solution.')
param solutionName string = 'me'

@description('The type of environment you want to provision. Allowed values are dev and prod.')
@allowed([
  'dev'
  'prod'
])
param environmentType string = 'dev'

@description('The location into which your Azure resources should be deployed.')
param location string = resourceGroup().location

@description('Required to provision Federated Id Credentials for Github Open Id Connect login.')
@secure()
param githubOrganizationOrUsername string


module githubActionsModule 'modules/githubActions.bicep' = {
  name: 'githubActionsTemplate'
  params: {
    environmentType: environmentType
    githubOrganizationOrUsername: githubOrganizationOrUsername
    location: location
    solutionName: solutionName
  }
}

