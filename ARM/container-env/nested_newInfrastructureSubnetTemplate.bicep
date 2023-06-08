resource vnet_for_me_snet_for_me 'Microsoft.Network/virtualNetworks/subnets@2020-07-01' = {
  name: 'vnet-for-me/snet-for-me'
  properties: {
    delegations: []
    serviceEndpoints: []
    addressPrefix: '10.0.0.0/23'
  }
}