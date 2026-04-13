const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')
const {
  fetchStudentNotifications,
  markAllStudentNotificationsRead,
  markStudentNotificationRead,
} = require('../../utils/student-api')

Page({
  data: {
    notifications: [],
    uiIcons,
    loading: false,
  },

  onLoad() {
    this.loadNotifications(true)
  },

  onShow() {
    if (!this._loaded) return
    this.loadNotifications(false)
  },

  async loadNotifications(markAllRead) {
    this.setData({ loading: true })

    try {
      const notifications = await fetchStudentNotifications(app)
      app.globalData.notifications = notifications
      this.setData({ notifications })
      this._loaded = true

      if (markAllRead && notifications.some((item) => !item.read)) {
        await markAllStudentNotificationsRead(app)
        const readNotifications = notifications.map((item) => ({ ...item, read: true }))
        app.globalData.notifications = readNotifications
        this.setData({ notifications: readNotifications })
      }
    } catch (error) {
      const notifications = app.globalData.notifications || []
      this.setData({ notifications })
      wx.showToast({
        title: (error && error.message) || '通知加载失败',
        icon: 'none',
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  async onItemTap(e) {
    const { id, url } = e.currentTarget.dataset
    if (id) {
      markStudentNotificationRead(id, app).catch(() => {})
    }
    if (!url) return
    wx.navigateTo({ url })
  }
})
