using './main.bicep'

param location = 'canadacentral'
param webPubSubSku = 'Free_F1'
// After scripts/push-gitlab-registry.sh or Kaniko on main:
// param serverImage = 'registry.gitlab.com/samybaouche/partyverse/server:<sha>'
// param webImage = 'registry.gitlab.com/samybaouche/partyverse/web:<sha>'
// param registryServer = 'registry.gitlab.com'
// param registryUsername = '<deploy-token-user>'
// param registryPassword = '<deploy-token>'
