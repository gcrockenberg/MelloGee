/*
  SYNOPSIS: Me
  DESCRIPTION: Provision the Me Azure Static Web App to host the Angular SPA
  https://learn.microsoft.com/en-us/shows/azure-tips-and-tricks-static-web-apps/how-to-configure-routing-in-azure-static-web-apps-6-of-16--azure-tips-and-tricks-static-web-apps
  VERSION: 1.0.0
  OWNER TEAM: Gerard C.
*/

param solutionName string
param apimName string

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


resource apim 'Microsoft.ApiManagement/service@2023-03-01-preview' existing = {
  name: apimName
}


@description('Update APIM CORS to allow Static Web App')
resource setApimCORSPolicyToAllowStaticWebApp 'Microsoft.ApiManagement/service/policies@2023-03-01-preview' = {
  name: 'policy'
  parent: apim
  properties: {
    value: replace(loadTextContent('apimPolicies/cors.xml'), '{staticWebAppUrl}', 'https://${staticWebApp.properties.defaultHostname}')
    format: 'xml'
  }
}
