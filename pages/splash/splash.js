const LOGIN_URL = '/pages/login/login'
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
    const elapsed = Date.now() - startAt

    if (elapsed < MIN_SPLASH_DURATION) {
      await wait(MIN_SPLASH_DURATION - elapsed)
    }

    wx.redirectTo({ url: LOGIN_URL })
  },
})
