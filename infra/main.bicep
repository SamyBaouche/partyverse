@description('Azure region for all Partyverse resources')
param location string = resourceGroup().location

@description('Unique suffix for globally named resources')
param suffix string = uniqueString(resourceGroup().id)

@description('Web PubSub SKU — Free_F1 for resume cost baseline')
param webPubSubSku string = 'Free_F1'

@description('Container Apps environment name')
param envName string = 'partyverse-env-${suffix}'

var webPubSubName = 'partyverse-wps-${suffix}'
var logAnalyticsName = 'partyverse-logs-${suffix}'
var serverAppName = 'partyverse-server'
var webAppName = 'partyverse-web'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource webPubSub 'Microsoft.SignalRService/webPubSub@2024-03-01' = {
  name: webPubSubName
  location: location
  sku: {
    name: webPubSubSku
    capacity: 1
  }
  properties: {
    publicNetworkAccess: 'Enabled'
  }
}

resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: envName
  location: location
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

@description('Server image (set after ACR push)')
param serverImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Web image (set after ACR push)')
param webImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

resource serverApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: serverAppName
  location: location
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
      }
      secrets: [
        {
          name: 'webpubsub-connection-string'
          value: webPubSub.listKeys().primaryConnectionString
        }
      ]
    }
    template: {
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
      containers: [
        {
          name: 'server'
          image: serverImage
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
}

resource webApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: webAppName
  location: location
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
      }
    }
    template: {
      scale: {
        minReplicas: 0
        maxReplicas: 3
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

output webPubSubName string = webPubSub.name
output serverFqdn string = serverApp.properties.configuration.ingress.fqdn
output webFqdn string = webApp.properties.configuration.ingress.fqdn
output estimatedIdleCostUsd string = '0 (scale-to-zero + Free_F1 Web PubSub)'
