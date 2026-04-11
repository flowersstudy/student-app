const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    uiIcons,
    lessonInfo: {
      date: '2026年3月28日 周六',
      time: '14:00 - 15:00',
      teacher: '李老师',
      subject: '申论基础课 - 总结转述难',
      status: '上课中'
    },
    notes: '',
    feedback: '',
    hasReport: true
  },
  onLoad() {},
  enterCourse() {
    wx.showToast({ title: '正在进入课程...', icon: 'loading' })
  },
  viewReport() {
    wx.showToast({ title: '报告加载中...', icon: 'loading' })
  },
  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },
  onFeedbackInput(e) {
    this.setData({ feedback: e.detail.value })
  },
  viewPlayback() {
    wx.showToast({ title: '回放加载中...', icon: 'loading' })
  }
})
