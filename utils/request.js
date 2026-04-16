const { getRuntimeConfig } = require('./runtime-config')
const { isOfflineMode, mockRequest } = require('./offline')

const STUDENT_TOKEN_KEY = 'student_token'
const DEFAULT_UNAUTHORIZED_REDIRECT = '/pages/home/home'

function getAppSafe() {
  try {
    return getApp()
  } catch (error) {
    return null
  }
}

function getServerBase(appInstance) {
  const app = appInstance || getAppSafe()
  return (app && app.globalData && app.globalData.serverBase) || getRuntimeConfig().serverBase
}

function buildRequestUrl(url = '', appInstance, serverBase = '') {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const base = String(serverBase || getServerBase(appInstance) || '').replace(/\/+$/, '')
  const path = String(url || '')

  if (!path) {
    return base
  }

  return path.startsWith('/')
    ? `${base}${path}`
    : `${base}/${path}`
}

function normalizeErrorMessage(payload, fallback = '请求失败') {
  return (payload && (payload.message || payload.error)) || fallback
}

function createRequestError(message, statusCode, data) {
  const error = new Error(message)
  error.statusCode = statusCode || 0
  error.data = data
  return error
}

function showToast(title) {
  if (!title) return

  wx.showToast({
    title,
    icon: 'none',
  })
}

function handleUnauthorizedRedirect(options = {}) {
  const {
    clearStorage = true,
    redirectUrl = DEFAULT_UNAUTHORIZED_REDIRECT,
  } = options

  if (clearStorage) {
    wx.clearStorageSync()
  }

  if (redirectUrl) {
    wx.switchTab({ url: redirectUrl })
  }
}

function request(options = {}) {
  const {
    url = '',
    method = 'GET',
    data = {},
    header = {},
    appInstance,
    serverBase = '',
    withAuth = false,
    token,
    allowOffline = false,
    mockData,
    showErrorToast = false,
    showNetworkErrorToast = showErrorToast,
    clearOnUnauthorized = false,
    redirectOnUnauthorized = '',
    onUnauthorized = null,
  } = options

  if (allowOffline && isOfflineMode()) {
    return mockRequest({
      url,
      method,
      data,
      header,
      mockData,
    })
  }

  const resolvedToken = typeof token === 'string'
    ? token
    : (withAuth ? (wx.getStorageSync(STUDENT_TOKEN_KEY) || '') : '')
  const finalHeader = {
    'Content-Type': 'application/json',
    ...header,
  }

  if (resolvedToken && !finalHeader.Authorization) {
    finalHeader.Authorization = `Bearer ${resolvedToken}`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: buildRequestUrl(url, appInstance, serverBase),
      method,
      data,
      header: finalHeader,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }

        const message = normalizeErrorMessage(res.data, '请求失败')
        const error = createRequestError(message, res.statusCode, res.data)

        if (res.statusCode === 401) {
          if (clearOnUnauthorized) {
            handleUnauthorizedRedirect({
              clearStorage: true,
              redirectUrl: redirectOnUnauthorized || DEFAULT_UNAUTHORIZED_REDIRECT,
            })
          }

          if (typeof onUnauthorized === 'function') {
            onUnauthorized(error, res)
          }
        }

        if (showErrorToast) {
          showToast(message)
        }

        reject(error)
      },
      fail: (err) => {
        const message = '网络错误，请检查后端是否启动'
        const error = createRequestError(message, 0, err)

        if (showNetworkErrorToast) {
          showToast(message)
        }

        reject(error)
      },
    })
  })
}

function requestWithAuth(options = {}) {
  return request({
    withAuth: true,
    ...options,
  })
}

function requestWithStudentAuth(options = {}) {
  return requestWithAuth({
    allowOffline: true,
    clearOnUnauthorized: true,
    redirectOnUnauthorized: DEFAULT_UNAUTHORIZED_REDIRECT,
    ...options,
  })
}

const http = {
  get: (url, data, options = {}) => requestWithStudentAuth({
    ...options,
    url,
    data,
    method: 'GET',
    showErrorToast: true,
  }),
  post: (url, data, options = {}) => requestWithStudentAuth({
    ...options,
    url,
    data,
    method: 'POST',
    showErrorToast: true,
  }),
  put: (url, data, options = {}) => requestWithStudentAuth({
    ...options,
    url,
    data,
    method: 'PUT',
    showErrorToast: true,
  }),
  delete: (url, options = {}) => requestWithStudentAuth({
    ...options,
    url,
    method: 'DELETE',
    showErrorToast: true,
  }),
}

module.exports = {
  DEFAULT_UNAUTHORIZED_REDIRECT,
  getAppSafe,
  getServerBase,
  handleUnauthorizedRedirect,
  http,
  request,
  requestWithAuth,
  requestWithStudentAuth,
}
