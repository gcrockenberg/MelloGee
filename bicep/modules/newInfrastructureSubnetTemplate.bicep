/*
  SYNOPSIS: Managed Environment subnet infrastructure module
  DESCRIPTION: Provisions the subnet required for a Container Apps Managed Environment.
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
*/

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


resource vnetForManagedEnvironment 'Microsoft.Network/virtualNetworks@2022-11-01' = {
  location: location
  name: take('vnet-${solutionName}-${environmentType}-${location}', 64)
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: snetName
        properties: {
          delegations: []
          serviceEndpoints: []
          addressPrefix: '10.0.0.0/23'
        }
      }      
    ]
  }

  resource subnetForManagedEnvironment 'subnets' existing = {
    name: snetName
  }
}

output id string = vnetForManagedEnvironment::subnetForManagedEnvironment.id
