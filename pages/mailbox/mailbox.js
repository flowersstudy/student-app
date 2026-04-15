const { uiIcons } = require('../../utils/ui-icons')
const { submitStudentMailbox } = require('../../utils/student-api')

Page({
  data: {
    uiIcons,
    category: '教学建议',
    categories: ['教学建议', '课程安排', '老师反馈', '服务投诉', '其他'],
    content: '',
    anonymous: true,
    submitted: false,
    submitting: false,
  },

  onCategoryChange(e) {
    this.setData({ category: this.data.categories[e.detail.value] })
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  toggleAnonymous() {
    this.setData({ anonymous: !this.data.anonymous })
  },

  async submit() {
    const content = (this.data.content || '').trim()

    if (!content) {
      wx.showToast({ title: '请填写内容', icon: 'none' })
      return
    }

    if (this.data.submitting) {
      return
    }

    this.setData({ submitting: true })

    try {
      await submitStudentMailbox({
        category: this.data.category,
        content,
        anonymous: this.data.anonymous,
      }, getApp())

      this.setData({ submitted: true })
      wx.showToast({ title: '投递成功', icon: 'success' })
    } catch (error) {
      wx.showToast({
        title: (error && error.message) || '投递失败，请稍后重试',
        icon: 'none',
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  reset() {
    this.setData({
      category: '教学建议',
      content: '',
      anonymous: true,
      submitted: false,
      submitting: false,
    })
  },
})
