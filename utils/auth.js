const STUDENT_TOKEN_KEY = 'student_token'
const STUDENT_INFO_KEY = 'student_info'
const { getRuntimeConfig } = require('./runtime-config')

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

function getStudentToken() {
  return wx.getStorageSync(STUDENT_TOKEN_KEY) || ''
}

function getStudentAuthHeader() {
  const token = getStudentToken()

  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
}

function updateAppAuthState(session = {}, appInstance) {
  const app = appInstance || getAppSafe()
  if (!app || !app.globalData) return

  const info = session.info || {}
  const token = session.token || ''
  const isNewUser = info.status === 'new'

  app.globalData.token = token
  app.globalData.authReady = true
  app.globalData.isLoggedIn = !!token
  app.globalData.isEnrolled = info.status && info.status !== 'new'
  app.globalData.isNewUser = isNewUser
  app.globalData.userProfile = {
    ...(app.globalData.userProfile || {}),
    name: info.name || (app.globalData.userProfile || {}).name || '张三',
    phone: info.phone || (app.globalData.userProfile || {}).phone || '',
  }
}

function saveStudentSession(payload = {}, appInstance) {
  const session = {
    token: payload.token || '',
    info: {
      id: payload.id,
      name: payload.name || '',
      status: payload.status || 'new',
      phone: payload.phone || '',
    },
  }

  if (session.token) {
    wx.setStorageSync(STUDENT_TOKEN_KEY, session.token)
  }

  wx.setStorageSync(STUDENT_INFO_KEY, session.info)
  updateAppAuthState(session, appInstance)
  return session
}

function readStudentSession() {
  return {
    token: getStudentToken(),
    info: wx.getStorageSync(STUDENT_INFO_KEY) || null,
  }
}

function clearStudentSession(appInstance) {
  wx.removeStorageSync(STUDENT_TOKEN_KEY)
  wx.removeStorageSync(STUDENT_INFO_KEY)

  const app = appInstance || getAppSafe()
  if (!app || !app.globalData) return

  app.globalData.token = ''
  app.globalData.authReady = true
  app.globalData.isLoggedIn = false
  app.globalData.isEnrolled = false
  app.globalData.isNewUser = false
}

function requestApi({ url, method = 'GET', data = {}, header = {} }, appInstance) {
  const serverBase = getServerBase(appInstance)

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${serverBase}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }

        const msg = (res.data && (res.data.message || res.data.error)) || '请求失败'
        reject(new Error(msg))
      },
      fail: reject,
    })
  })
}

function silentLogin(appInstance) {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          reject(new Error('未获取到微信登录 code'))
          return
        }

        try {
          const result = await requestApi({
            url: '/api/auth/student/wx-login',
            method: 'POST',
            data: { code: loginRes.code },
          }, appInstance)

          resolve(saveStudentSession(result, appInstance))
        } catch (error) {
          reject(error)
        }
      },
      fail: reject,
    })
  })
}

async function ensureSilentLogin(appInstance) {
  const session = readStudentSession()
  if (session.token && session.info) {
    updateAppAuthState(session, appInstance)
    return session
  }

  return silentLogin(appInstance)
}

async function bindStudentPhone(phone, appInstance) {
  const session = await ensureSilentLogin(appInstance)
  const token = session && session.token

  if (!token) {
    throw new Error('尚未完成静默登录')
  }

  const result = await requestApi({
    url: '/api/auth/student/bind-phone',
    method: 'POST',
    data: { phone },
    header: {
      Authorization: `Bearer ${token}`,
    },
  }, appInstance)

  return saveStudentSession(result, appInstance)
}

module.exports = {
  bindStudentPhone,
  clearStudentSession,
  ensureSilentLogin,
  getStudentAuthHeader,
  getStudentToken,
  readStudentSession,
  requestApi,
  saveStudentSession,
  silentLogin,
  STUDENT_INFO_KEY,
  STUDENT_TOKEN_KEY,
}
