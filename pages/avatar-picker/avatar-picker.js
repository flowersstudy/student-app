const {
  DEFAULT_AVATAR_OPTIONS,
  getStoredStudentAvatar,
  resolveAvatarOptions,
  setStoredStudentAvatar,
} = require('../../utils/avatar-options')
const { fetchStudentAvatarPresets, updateStudentAvatar } = require('../../utils/student-api')

Page({
  data: {
    avatarOptions: DEFAULT_AVATAR_OPTIONS,
    selectedAvatar: '',
    loading: false,
  },

  async onShow() {
    const app = getApp()
    const currentAvatar = (app.globalData.userProfile || {}).avatar || getStoredStudentAvatar()

    this.setData({
      selectedAvatar: currentAvatar,
    })

    await this.loadAvatarOptions()
  },

  async loadAvatarOptions() {
    const app = getApp()

    try {
      const avatarOptions = resolveAvatarOptions(await fetchStudentAvatarPresets(app))
      this.setData({ avatarOptions })
    } catch (error) {
      console.warn('头像列表加载失败:', error && error.message ? error.message : error)
      this.setData({
        avatarOptions: resolveAvatarOptions(),
      })
    }
  },

  async handleAvatarTap(e) {
    const { url } = e.currentTarget.dataset
    if (!url || this.data.loading) return

    const app = getApp()
    this.setData({ loading: true })

    try {
      wx.showLoading({
        title: '保存中',
        mask: true,
      })

      await updateStudentAvatar(url, app)
      setStoredStudentAvatar(url, app)
      this.setData({ selectedAvatar: url })

      wx.hideLoading()
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
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: (error && error.message) || '头像保存失败',
        icon: 'none',
        duration: 1800,
      })
    } finally {
      this.setData({ loading: false })
    }
  },
})
