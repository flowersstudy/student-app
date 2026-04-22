const { getServerBase } = require('./request')

function normalizeBaseUrl(baseUrl = '') {
  return String(baseUrl || '').trim().replace(/\/+$/, '')
}

function extractHost(url = '') {
  return String(url || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^\/\//, '')
    .split('/')[0]
    .toLowerCase()
}

function isLocalHost(host = '') {
  const normalizedHost = String(host || '').trim().split(':')[0].toLowerCase()
  return normalizedHost === 'localhost'
    || normalizedHost === '127.0.0.1'
    || normalizedHost === '::1'
    || normalizedHost.startsWith('10.')
    || normalizedHost.startsWith('192.168.')
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalizedHost)
}

function upgradeToHttps(url = '', baseUrl = '') {
  const targetUrl = String(url || '').trim()
  if (!/^http:\/\//i.test(targetUrl)) {
    return targetUrl
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  if (!/^https:\/\//i.test(normalizedBaseUrl)) {
    return targetUrl
  }

  const host = extractHost(targetUrl)
  if (!host || isLocalHost(host)) {
    return targetUrl
  }

  return targetUrl.replace(/^http:\/\//i, 'https://')
}

function buildAbsoluteUrl(url = '', appInstance) {
  const targetUrl = String(url || '').trim()
  if (!targetUrl) {
    return ''
  }

  const serverBase = normalizeBaseUrl(getServerBase(appInstance) || '')
  if (!serverBase) {
    return targetUrl
  }

  if (/^https?:\/\//i.test(targetUrl)) {
    return upgradeToHttps(targetUrl, serverBase)
  }

  if (targetUrl.startsWith('//')) {
    return /^https:\/\//i.test(serverBase) ? `https:${targetUrl}` : `http:${targetUrl}`
  }

  if (targetUrl.startsWith('/')) {
    return upgradeToHttps(`${serverBase}${targetUrl}`, serverBase)
  }

  return upgradeToHttps(`${serverBase}/${targetUrl.replace(/^\.?\//, '')}`, serverBase)
}

function normalizeDocumentResource(resource = null, appInstance) {
  if (!resource || typeof resource !== 'object') {
    return resource
  }

  return {
    ...resource,
    url: buildAbsoluteUrl(resource.url || '', appInstance),
  }
}

function openRemoteDocument(url = '', options = {}) {
  const {
    appInstance,
    header = {},
    fileType = 'pdf',
  } = options
  const targetUrl = buildAbsoluteUrl(url, appInstance)

  if (!targetUrl) {
    return Promise.resolve(false)
  }

  wx.showLoading({
    title: '打开中',
  })

  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: targetUrl,
      header,
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300 || !res.tempFilePath) {
          reject(new Error('下载失败'))
          return
        }

        wx.openDocument({
          filePath: res.tempFilePath,
          fileType,
          showMenu: true,
          success: () => resolve(true),
          fail: reject,
          complete: () => wx.hideLoading(),
        })
      },
      fail: (error) => {
        wx.hideLoading()
        reject(error)
      },
    })
  })
}

module.exports = {
  buildAbsoluteUrl,
  normalizeDocumentResource,
  openRemoteDocument,
}
