const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    selectedProvince: '湖南',
    uiIcons,
  },

  goGenerateDiagnose() {
    this._enterHome('diagnose')
  },

  goTrialDrill() {
    this._enterHome('trial')
  },

  goKpointList() {
    this._enterHome('kpoint')
  },

  skipEntry() {
    const app = getApp()
    app.globalData.entryMode = ''
    wx.removeStorageSync('entry_mode')
    wx.switchTab({ url: '/pages/home/home' })
  },

  _enterHome(entryMode) {
    const app = getApp()
    app.globalData.entryMode = entryMode
    wx.setStorageSync('entry_mode', entryMode)
    wx.switchTab({ url: '/pages/home/home' })
  }
})
