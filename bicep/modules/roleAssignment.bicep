@description('Specifies the role definition ID used in the role assignment.')
param roleDefinitionID string

@description('Specifies the principal ID assigned to the role.')
param principalId string

var roleAssignmentName= guid(resourceGroup().id, principalId, roleDefinitionID)

// https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/scenarios-rbac
// https://learn.microsoft.com/en-us/azure/role-based-access-control/troubleshooting?tabs=bicep#symptom---assigning-a-role-to-a-new-principal-sometimes-fails
@description('The default scope is the current Resource Group')
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: resourceGroup()    // Could be narrowed to the Container Apps Environment
  name: roleAssignmentName
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', roleDefinitionID)
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
