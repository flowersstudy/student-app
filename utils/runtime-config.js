const RUNTIME_CONFIG_STORAGE_KEY = 'student_app_runtime_config'
const LOCAL_SERVER_BASE = 'http://localhost:3000'
const RELEASE_SERVER_BASE =  'https://apix.1v1.buzhi.com'

function normalizeServerBase(serverBase = '') {
  return String(serverBase || '').trim().replace(/\/+$/, '')
}

function getEnvVersion() {
  try {
    if (typeof wx.getAccountInfoSync !== 'function') {
      return 'develop'
    }

    const accountInfo = wx.getAccountInfoSync()
    return (accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.envVersion) || 'develop'
  } catch (error) {
    return 'develop'
  }
}

function getPresetRuntimeConfig(envVersion = getEnvVersion()) {
  const isLocalEnv = envVersion === 'develop'

  return {
    envVersion,
    serverBase: isLocalEnv ? LOCAL_SERVER_BASE : RELEASE_SERVER_BASE,
    offlineMode: false,
    chatMockMode: false,
  }
}

function getStoredRuntimeConfig() {
  try {
    const stored = wx.getStorageSync(RUNTIME_CONFIG_STORAGE_KEY)
    return stored && typeof stored === 'object' ? stored : null
  } catch (error) {
    return null
  }
}

function getRuntimeConfig() {
  const preset = getPresetRuntimeConfig()
  const stored = getStoredRuntimeConfig() || {}
  const storedServerBase = typeof stored.serverBase === 'string' ? normalizeServerBase(stored.serverBase) : ''

  return {
    envVersion: preset.envVersion,
    serverBase: storedServerBase || preset.serverBase,
    offlineMode: typeof stored.offlineMode === 'boolean' ? stored.offlineMode : preset.offlineMode,
    chatMockMode: typeof stored.chatMockMode === 'boolean' ? stored.chatMockMode : preset.chatMockMode,
  }
}

function setRuntimeConfig(partial = {}) {
  const current = getStoredRuntimeConfig() || {}
  const next = { ...current }

  if (Object.prototype.hasOwnProperty.call(partial, 'serverBase')) {
    next.serverBase = normalizeServerBase(partial.serverBase)
  }

  if (Object.prototype.hasOwnProperty.call(partial, 'offlineMode')) {
    next.offlineMode = !!partial.offlineMode
  }

  if (Object.prototype.hasOwnProperty.call(partial, 'chatMockMode')) {
    next.chatMockMode = !!partial.chatMockMode
  }

  wx.setStorageSync(RUNTIME_CONFIG_STORAGE_KEY, next)
  return getRuntimeConfig()
}

function clearRuntimeConfig() {
  wx.removeStorageSync(RUNTIME_CONFIG_STORAGE_KEY)
}

module.exports = {
  LOCAL_SERVER_BASE,
  RELEASE_SERVER_BASE,
  RUNTIME_CONFIG_STORAGE_KEY,
  clearRuntimeConfig,
  getRuntimeConfig,
  setRuntimeConfig,
}
