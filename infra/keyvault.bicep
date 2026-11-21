// Additive Phase 2.1 slice: Key Vault + Managed Identity + secrets.
// Does not mutate Container Apps (wire with scripts/wire-kv-secrets.sh).
@description('Azure region')
param location string = resourceGroup().location

@description('Unique suffix matching main.bicep (default = RG uniqueString)')
param suffix string = uniqueString(resourceGroup().id)

@description('Existing Web PubSub resource name in this RG')
param webPubSubName string = 'partyverse-wps-${suffix}'

@description('Application Insights connection string to store in Key Vault')
@secure()
param appInsightsConnectionString string

var tags = {
  project: 'partyverse'
  env: 'dev'
}

var keyVaultName = take('pv-kv-${suffix}', 24)
var identityName = 'partyverse-mi-${suffix}'

resource webPubSub 'Microsoft.SignalRService/webPubSub@2024-03-01' existing = {
  name: webPubSubName
}

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: tags
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
  }
}

resource kvSecretsOfficer 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, 'secrets-officer', deployer().objectId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      'b86a8fe4-44ce-4948-aee5-eccb2c155cd7' // Key Vault Secrets Officer
    )
    principalId: deployer().objectId
    principalType: 'User'
  }
}

resource kvSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, 'secrets-user', identity.id)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '4633458b-17de-408a-b874-0445c86b69e6' // Key Vault Secrets User
    )
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource webPubSubSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'webpubsub-connection-string'
  properties: {
    value: webPubSub.listKeys().primaryConnectionString
  }
  dependsOn: [
    kvSecretsOfficer
  ]
}

resource appInsightsSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'appinsights-connection-string'
  properties: {
    value: appInsightsConnectionString
  }
  dependsOn: [
    kvSecretsOfficer
  ]
}

output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
output managedIdentityName string = identity.name
output managedIdentityId string = identity.id
output managedIdentityClientId string = identity.properties.clientId
