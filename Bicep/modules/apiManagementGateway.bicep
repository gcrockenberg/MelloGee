/*
  SYNOPSIS: Me
  DESCRIPTION: Provision APIM - beware of soft delete defaults
  See https://learn.microsoft.com/en-us/azure/api-management/soft-delete
  az rest --method delete --header "Accept=applicaiton/json" -u 'https://management.azure.com/subscriptions/{SubscriptionId}/providers/Microsoft.ApiManagement/locations/{eastus}/deletedservices/{apim name}?api-version=2020-06-01-preview' 
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
param environmentType string = 'dev'
param location string = 'eastus'

param tier string = 'Developer'
param capacity int = 1
param adminEmail string = 'gcrockenberg@hotmail.com'
param organizationName string = 'Myoptyx'
param customProperties object = {}
param tagsByResource object = {} 
var apimName = environmentType == 'dev' ? '${solutionName}-dev' : solutionName

resource apim 'Microsoft.ApiManagement/service@2022-09-01-preview' = {
  name: apimName
  location: location
  sku: {
    name: tier
    capacity: capacity
  }
  identity: {
    type: 'None'
  }
  tags: tagsByResource
  properties: {
    publisherEmail: adminEmail
    publisherName: organizationName
    customProperties: customProperties
  }
}

output ipAddress string = apim.properties.publicIPAddresses[0]
output name string = apim.name

