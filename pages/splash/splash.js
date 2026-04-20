const { readStudentSession } = require('../../utils/auth')

const HOME_URL = '/pages/home/home'
const LOGIN_URL = '/pages/login/login'
const MIN_SPLASH_DURATION = 700
const AUTH_READY_TIMEOUT = 2000
const AUTH_READY_POLL_INTERVAL = 50

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getAppSafe() {
  try {
    return getApp()
  } catch (error) {
    return null
  }
}

function hasStoredSession() {
  const session = readStudentSession()
  return !!(session.token && session.info)
}

function waitForAuthReady(timeout = AUTH_READY_TIMEOUT) {
  const app = getAppSafe()
  if (!app || !app.globalData) {
    return Promise.resolve(false)
  }

  if (app.globalData.authReady) {
    return Promise.resolve(true)
  }

  return new Promise((resolve) => {
    const startAt = Date.now()
    const timer = setInterval(() => {
      if (app.globalData.authReady) {
        clearInterval(timer)
        resolve(true)
        return
      }

      if (Date.now() - startAt >= timeout) {
        clearInterval(timer)
        resolve(false)
      }
    }, AUTH_READY_POLL_INTERVAL)
  })
}

async function resolveLaunchUrl() {
  const app = getAppSafe()

  if (hasStoredSession() || (app && app.globalData && app.globalData.isLoggedIn)) {
    return HOME_URL
  }

  await waitForAuthReady()

  return hasStoredSession() || (app && app.globalData && app.globalData.isLoggedIn)
    ? HOME_URL
    : LOGIN_URL
}

Page({
  onLoad() {
    this.bootstrap()
  },

  async bootstrap() {
    if (this._bootstrapping) return
    this._bootstrapping = true

    const startAt = Date.now()
    const launchUrl = await resolveLaunchUrl()
    const elapsed = Date.now() - startAt

    if (elapsed < MIN_SPLASH_DURATION) {
      await wait(MIN_SPLASH_DURATION - elapsed)
    }

    if (launchUrl === HOME_URL) {
      wx.switchTab({ url: HOME_URL })
      return
    }

    wx.redirectTo({ url: LOGIN_URL })
  },
})
