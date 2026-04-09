const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    uiIcons
  },
  goEntryHub() {
    wx.navigateTo({ url: '/pages/entry-hub/entry-hub' })
  },
  goStartTrial() {
    wx.navigateTo({ url: '/pages/lesson-drill/lesson-drill?set=1' })
  }
})
