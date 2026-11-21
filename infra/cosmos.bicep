// Phase 2.2 — Cosmos DB free tier for durable room activity / membership (#41).
// One free-tier account per subscription. Shared 400 RU/s on the database.
@description('Azure region')
param location string = resourceGroup().location

@description('Unique suffix matching other Partyverse resources')
param suffix string = uniqueString(resourceGroup().id)

@description('User-assigned identity (Account Reader for ops)')
param managedIdentityName string = 'partyverse-mi-${suffix}'

var tags = {
  project: 'partyverse'
  env: 'dev'
}

@description('Optional name override when a failed create reserved the default name')
param accountNameOverride string = ''

var accountName = empty(accountNameOverride) ? take('pvcosmos${suffix}', 44) : accountNameOverride
var databaseName = 'partyverse'
var containerName = 'rooms'

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: managedIdentityName
}

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: accountName
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    enableFreeTier: true
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmos
  name: databaseName
  properties: {
    resource: { id: databaseName }
    options: {
      throughput: 400
    }
  }
}

resource container 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: database
  name: containerName
  properties: {
    resource: {
      id: containerName
      partitionKey: {
        paths: ['/code']
        kind: 'Hash'
      }
      defaultTtl: 86400
    }
  }
}

resource cosmosReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(cosmos.id, 'reader', identity.id)
  scope: cosmos
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '5bd9cd88-fe45-4216-9381-d97597941ca3'
    )
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output cosmosAccountName string = cosmos.name
output cosmosEndpoint string = cosmos.properties.documentEndpoint
output databaseName string = databaseName
output containerName string = containerName
