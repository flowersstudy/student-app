const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    uiIcons,
    liveInfo: {
      title: '第 2 周直播讲评',
      subtitle: '对策推导难 · 本周共性问题讲评',
      time: '4月24日 周四 19:00 - 20:30',
      teacher: '李老师',
      status: '待开课',
      link: 'https://meeting.tencent.com/mock/practice-live-room',
      meetingNo: '987 654 321',
      updatedAt: '今天 16:20',
    },
    reminders: [
      '老师会在这里上传直播链接，开课前 10 分钟可直接复制进入。',
      '建议提前整理 1 个最想问的问题，上课时更容易跟住重点。',
      '如果链接有变化，这里会更新最新版本。',
    ],
    notes: '',
  },

  copyLink() {
    wx.setClipboardData({
      data: this.data.liveInfo.link,
    })
  },

  copyMeetingNo() {
    wx.setClipboardData({
      data: this.data.liveInfo.meetingNo,
    })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  goChat() {
    wx.switchTab({
      url: '/pages/chat/chat',
    })
  },
})
