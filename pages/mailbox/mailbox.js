const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    uiIcons,
    category: '教学建议',
    categories: ['教学建议', '课程安排', '老师反馈', '服务投诉', '其他'],
    content: '',
    anonymous: true,
    submitted: false
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

  submit() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请填写内容', icon: 'none' })
      return
    }
    // TODO: 接入后端
    this.setData({ submitted: true })
  },

  reset() {
    this.setData({
      category: '教学建议',
      content: '',
      anonymous: true,
      submitted: false
    })
  }
})
