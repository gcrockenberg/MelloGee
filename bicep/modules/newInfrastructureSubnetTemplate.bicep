/*
  SYNOPSIS: Managed Environment subnet infrastructure module
  DESCRIPTION: Provisions the subnet required for a Container Apps Managed Environment.
  VERSION: 1.0.0
  OWNER TEAM: MelloGee
*/
@description('Used in subnet name. The name of the parent vNet.')
param vnetName string

@description('Used in subnet name. The name of the app or solution.')
param solutionName string

@description('Used in subnet name. Select the type of environment you want to provision. Allowed values are dev and prod.')
@allowed([
  'dev'
  'prod'
])
param environmentType string

@description('Used in subnet name. The location into which your Azure resources should be deployed.')
param location string

var snetName = take('snet-${solutionName}-${environmentType}-${location}', 80)

resource subnetForManagedEnvironment 'Microsoft.Network/virtualNetworks/subnets@2020-07-01' = {
  name: '${vnetName}/${snetName}'
  properties: {
    delegations: []
    serviceEndpoints: []
    addressPrefix: '10.0.0.0/23'
  }
}

output id string = subnetForManagedEnvironment.id
