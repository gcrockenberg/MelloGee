param solutionName string

// NOTE: Static Web App not available in eastus
@description('The location into which your Azure resources should be deployed.')
var location = 'East US 2'

resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: solutionName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/gcrockenberg/me'
    branch: 'main'
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    provider: 'GitHub'
    enterpriseGradeCdnStatus: 'Disabled'
  }
}
