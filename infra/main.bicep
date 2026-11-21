@description('Azure region for all Partyverse resources')
param location string = resourceGroup().location

@description('Unique suffix for globally named resources')
param suffix string = uniqueString(resourceGroup().id)

@description('Web PubSub SKU — Free_F1 for resume cost baseline')
param webPubSubSku string = 'Free_F1'

@description('Container Apps environment name')
param envName string = 'partyverse-env-${suffix}'

@description('Server image (GitLab Container Registry after #25)')
param serverImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Web image (GitLab Container Registry after #25)')
param webImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Optional registry server for private pulls (e.g. registry.gitlab.com)')
param registryServer string = ''

@description('Registry username (CI deploy token / deploy user)')
@secure()
param registryUsername string = ''

@description('Registry password / deploy token')
@secure()
param registryPassword string = ''

var tags = {
  project: 'partyverse'
  env: 'dev'
}

var webPubSubName = 'partyverse-wps-${suffix}'
var logAnalyticsName = 'partyverse-logs-${suffix}'
var keyVaultName = take('pv-kv-${suffix}', 24)
var identityName = 'partyverse-mi-${suffix}'
var serverAppName = 'partyverse-server'
var webAppName = 'partyverse-web'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
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

// Deployer (current principal) can write secrets during this deployment.
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

// Container Apps identity can read secrets at runtime.
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

resource webPubSub 'Microsoft.SignalRService/webPubSub@2024-03-01' = {
  name: webPubSubName
  location: location
  tags: tags
  sku: {
    name: webPubSubSku
    capacity: 1
  }
  properties: {
    publicNetworkAccess: 'Enabled'
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

resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: envName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

var registryConfig = empty(registryServer) ? [] : [
  {
    server: registryServer
    username: registryUsername
    passwordSecretRef: 'registry-password'
  }
]

var registrySecrets = empty(registryServer) ? [] : [
  {
    name: 'registry-password'
    value: registryPassword
  }
]

resource serverApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: serverAppName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
      }
      registries: registryConfig
      secrets: union(registrySecrets, [
        {
          name: 'webpubsub-connection-string'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/webpubsub-connection-string'
          identity: identity.id
        }
      ])
    }
    template: {
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
      containers: [
        {
          name: 'server'
          image: serverImage
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 3
              periodSeconds: 10
            }
          ]
          env: [
            { name: 'PORT', value: '3000' }
            { name: 'WEBPUBSUB_HUB', value: 'partyverse' }
            {
              name: 'WEBPUBSUB_CONNECTION_STRING'
              secretRef: 'webpubsub-connection-string'
            }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
    }
  }
  dependsOn: [
    webPubSubSecret
    kvSecretsUser
  ]
}

resource webApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: webAppName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
      }
      registries: registryConfig
      secrets: registrySecrets
    }
    template: {
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
      containers: [
        {
          name: 'web'
          image: webImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
    }
  }
}

// Web PubSub event handler → server Container App (system events + user connect).
resource webPubSubHub 'Microsoft.SignalRService/webPubSub/hubs@2024-03-01' = {
  parent: webPubSub
  name: 'partyverse'
  properties: {
    eventHandlers: [
      {
        urlTemplate: 'https://${serverApp.properties.configuration.ingress.fqdn}/eventhandler'
        userEventPattern: '*'
        systemEvents: [
          'connect'
          'connected'
          'disconnected'
        ]
      }
    ]
  }
}

output webPubSubName string = webPubSub.name
output keyVaultName string = keyVault.name
output managedIdentityName string = identity.name
output serverFqdn string = serverApp.properties.configuration.ingress.fqdn
output webFqdn string = webApp.properties.configuration.ingress.fqdn
output estimatedIdleCostUsd string = '0 (scale-to-zero + Free_F1 Web PubSub + KV standard idle)'
