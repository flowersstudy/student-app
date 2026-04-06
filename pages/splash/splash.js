Page({
  onLoad() {
    // 最后标签 1.52s + 动画 0.38s + 停留 1.1s ≈ 3s
    setTimeout(() => {
      this.skip()
    }, 3000)
  },
  skip() {
    wx.redirectTo({ url: '/pages/login/login' })
  }
})
