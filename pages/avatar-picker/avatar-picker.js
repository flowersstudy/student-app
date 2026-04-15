const { avatarOptions, getStoredStudentAvatar, setStoredStudentAvatar } = require('../../utils/avatar-options')

Page({
  data: {
    avatarOptions,
    selectedAvatar: '',
  },

  onShow() {
    this.setData({
      selectedAvatar: getStoredStudentAvatar(),
    })
  },

  handleAvatarTap(e) {
    const { url } = e.currentTarget.dataset
    if (!url) return

    const app = getApp()
    setStoredStudentAvatar(url, app)
    this.setData({ selectedAvatar: url })

    wx.showToast({
      title: '头像已更新',
      icon: 'success',
      duration: 1200,
    })

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 250)
  },
})
