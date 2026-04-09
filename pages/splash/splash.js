Page({
  onLoad() {
    setTimeout(() => {
      this.skip()
    }, 800)
  },
  skip() {
    wx.redirectTo({ url: '/pages/login/login' })
  }
})
