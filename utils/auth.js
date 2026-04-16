const STUDENT_TOKEN_KEY = 'student_token'
const STUDENT_INFO_KEY = 'student_info'
const STUDENT_PHONE_BOUND_KEY = 'student_phone_bound'
const LOCAL_STUDENT_NAME = '新同学'

const { request } = require('./request')

function getAppSafe() {
  try {
    return getApp()
  } catch (error) {
    return null
  }
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
  app.globalData.isEnrolled = !!(info.status && info.status !== 'new')
  app.globalData.isNewUser = isNewUser
  app.globalData.userProfile = {
    ...(app.globalData.userProfile || {}),
    name: info.name || (app.globalData.userProfile || {}).name || '张三',
    phone: info.phone || (app.globalData.userProfile || {}).phone || '',
  }
}

function saveStudentSession(payload = {}, appInstance) {
  const currentInfo = wx.getStorageSync(STUDENT_INFO_KEY) || {}
  const resolvedPhone = payload.phone || currentInfo.phone || ''
  const resolvedPhoneBound = payload.phoneBound === true || !!String(resolvedPhone || '').trim()
  const session = {
    token: payload.token || '',
    info: {
      id: payload.id,
      name: payload.name || '',
      status: payload.status || 'new',
      phone: resolvedPhone,
    },
  }

  if (session.token) {
    wx.setStorageSync(STUDENT_TOKEN_KEY, session.token)
  }

  wx.setStorageSync(STUDENT_INFO_KEY, session.info)
  wx.setStorageSync(STUDENT_PHONE_BOUND_KEY, resolvedPhoneBound)
  updateAppAuthState(session, appInstance)
  return session
}

function readStudentSession() {
  return {
    token: getStudentToken(),
    info: wx.getStorageSync(STUDENT_INFO_KEY) || null,
  }
}

function hasBoundStudentPhone(session = {}) {
  const info = session && session.info
    ? session.info
    : session
  const phone = info && info.phone
  return !!String(phone || '').trim() || wx.getStorageSync(STUDENT_PHONE_BOUND_KEY) === true
}

function shouldRequireStudentPhone(session = {}) {
  return !!(session && session.token) && !hasBoundStudentPhone(session)
}

function clearStudentSession(appInstance) {
  wx.removeStorageSync(STUDENT_TOKEN_KEY)
  wx.removeStorageSync(STUDENT_INFO_KEY)
  wx.removeStorageSync(STUDENT_PHONE_BOUND_KEY)

  const app = appInstance || getAppSafe()
  if (!app || !app.globalData) return

  app.globalData.token = ''
  app.globalData.authReady = true
  app.globalData.isLoggedIn = false
  app.globalData.isEnrolled = false
  app.globalData.isNewUser = false
}

function saveLocalStudentPhone(phone, appInstance) {
  const currentInfo = wx.getStorageSync(STUDENT_INFO_KEY) || {}
  const nextInfo = {
    id: currentInfo.id || `local_${Date.now()}`,
    name: currentInfo.name || LOCAL_STUDENT_NAME,
    status: currentInfo.status || 'new',
    phone: String(phone || '').trim(),
  }

  wx.setStorageSync(STUDENT_INFO_KEY, nextInfo)
  wx.setStorageSync(STUDENT_PHONE_BOUND_KEY, !!nextInfo.phone)

  const app = appInstance || getAppSafe()
  if (app && app.globalData) {
    app.globalData.authReady = true
    app.globalData.isLoggedIn = false
    app.globalData.isEnrolled = false
    app.globalData.isNewUser = true
    app.globalData.userProfile = {
      ...(app.globalData.userProfile || {}),
      name: nextInfo.name || (app.globalData.userProfile || {}).name || LOCAL_STUDENT_NAME,
      phone: nextInfo.phone,
    }
  }

  return {
    token: '',
    info: nextInfo,
  }
}

function requestApi({ url, method = 'GET', data = {}, header = {} }, appInstance) {
  return request({
    url,
    method,
    data,
    header,
    appInstance,
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

async function bindStudentPhone(payload, appInstance) {
  const session = await ensureSilentLogin(appInstance)
  const token = session && session.token

  if (!token) {
    throw new Error('尚未完成静默登录')
  }

  const data = typeof payload === 'string'
    ? { phone: payload }
    : { ...(payload || {}) }
  const fallbackPhone = data.phone || (session && session.info && session.info.phone) || ''

  if (!data.phone && !data.phoneCode && !data.code) {
    throw new Error('缺少手机号绑定参数')
  }

  const result = await requestApi({
    url: '/api/auth/student/bind-phone',
    method: 'POST',
    data,
    header: {
      Authorization: `Bearer ${token}`,
    },
  }, appInstance)

  return saveStudentSession({
    ...result,
    phone: result && result.phone ? result.phone : fallbackPhone,
    phoneBound: true,
  }, appInstance)
}

module.exports = {
  bindStudentPhone,
  clearStudentSession,
  ensureSilentLogin,
  getStudentAuthHeader,
  getStudentToken,
  hasBoundStudentPhone,
  readStudentSession,
  requestApi,
  saveStudentSession,
  saveLocalStudentPhone,
  silentLogin,
  shouldRequireStudentPhone,
  STUDENT_PHONE_BOUND_KEY,
  STUDENT_INFO_KEY,
  STUDENT_TOKEN_KEY,
}
