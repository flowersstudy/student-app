const { ensureSilentLogin, hasBoundStudentPhone, readStudentSession } = require('../../utils/auth')

const HOME_URL = '/pages/home/home'
const LAUNCH_LOGIN_URL = `/pages/account-bind/account-bind?mode=launch&redirect=${encodeURIComponent(HOME_URL)}`
const MIN_SPLASH_DURATION = 700

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

Page({
  onLoad() {
    this.bootstrap()
  },

  async bootstrap() {
    if (this._bootstrapping) return
    this._bootstrapping = true

    const startAt = Date.now()
    const localSession = readStudentSession()
    let navigation = hasBoundStudentPhone(localSession)
      ? { type: 'tab', url: HOME_URL }
      : { type: 'page', url: LAUNCH_LOGIN_URL }

    try {
      if (navigation.type === 'tab') {
        await ensureSilentLogin(getApp())
      }
    } catch (error) {
      console.warn('启动鉴权失败，进入首页:', error && error.message ? error.message : error)
    }

    const elapsed = Date.now() - startAt
    if (elapsed < MIN_SPLASH_DURATION) {
      await wait(MIN_SPLASH_DURATION - elapsed)
    }

    if (navigation.type === 'page') {
      wx.redirectTo({ url: navigation.url })
    } else {
      wx.switchTab({ url: navigation.url })
    }
  },
})
