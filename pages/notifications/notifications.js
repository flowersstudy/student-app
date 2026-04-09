const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    notifications: [],
    uiIcons
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
