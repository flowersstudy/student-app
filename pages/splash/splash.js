Page({
  onLoad() {
    setTimeout(() => {
      this.skip()
    }, 800)
  },
  skip() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
