const app = getApp()

Page({
  data: {
    notifications: []
  },

  onLoad() {
    const notifications = app.globalData.notifications || []
    this.setData({ notifications })
  },

  onItemTap(e) {
    const { url, pinned } = e.currentTarget.dataset
    if (!url) return
    wx.navigateTo({ url })
  }
})
