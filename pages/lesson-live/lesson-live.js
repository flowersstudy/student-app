const { requestWithStudentAuth } = require('../../utils/request')

Page({
  data: {
    loading: true,
    lesson: null,
    error: '',
  },

  onLoad(options) {
    const eventId = options.eventId || options.id || ''
    if (!eventId) {
      this.setData({ loading: false, error: '缺少课程参数' })
      return
    }
    this.loadLesson(eventId)
  },

  async loadLesson(eventId) {
    try {
      const data = await requestWithStudentAuth({
        url: `/api/student/lesson-live/${eventId}`,
        method: 'GET',
      })
      this.setData({ lesson: data, loading: false })
    } catch (err) {
      this.setData({ loading: false, error: '加载失败，请重试' })
    }
  },

  onJoinLive() {
    const url = this.data.lesson && this.data.lesson.live_url
    if (!url) {
      wx.showToast({ title: '暂无直播链接', icon: 'none' })
      return
    }
    wx.openUrl({ url })
  },

  onCopyLink() {
    const url = this.data.lesson && this.data.lesson.live_url
    if (!url) return
    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({ title: '链接已复制', icon: 'success' })
      },
    })
  },
})
