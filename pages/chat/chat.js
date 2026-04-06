const app = getApp()

Page({
  data: {
    isEnrolled: false,
    showMemberPanel: false,
    voiceMode: false,
    showEmoji: false,
    showMore: false,
    emojiList: ['😀','😂','🥹','😍','🤩','😎','🥳','😭','😅','🤣','👍','👎','🙏','👏','🤝','💪','🫶','❤️','🔥','✅','⭐','💯','🎉','😤','🤔','😴','🫠','😬','🥺','😱'],
    inputText: '',
    messages: [
      {
        id: 1,
        type: 'teacher',
        avatar: '李',
        name: '李老师',
        time: '09:00',
        content: '同学你好，欢迎来到申论基础课！今天我们开始学习"提炼转述错误"这个卡点，请先阅读课前材料。'
      },
      {
        id: 2,
        type: 'student',
        avatar: '张',
        name: '张三',
        time: '09:05',
        content: '老师好！我已经看完了课前材料，对于第三段的主题句提炼还有些疑问。'
      },
      {
        id: 3,
        type: 'teacher',
        avatar: '李',
        name: '李老师',
        time: '09:08',
        content: '好的，你的问题很好。主题句提炼要抓住段落的核心论点，我们在课上会专门讲解这个技巧，请记得准备好笔记。'
      },
      {
        id: 4,
        type: 'student',
        avatar: '张',
        name: '张三',
        time: '09:10',
        content: '明白了，我会认真准备的！请问课程是几点开始？'
      }
    ],
    members: [
      { role: '带教老师', name: '李老师', avatar: '李' },
      { role: '诊断老师', name: '王老师', avatar: '王' },
      { role: '学管', name: '陈老师', avatar: '陈' },
      { role: '校长', name: '刘校长', avatar: '刘' }
    ]
  },
  onShow() {
    this.setData({ isEnrolled: app.globalData.isEnrolled })
  },
  onLoad() {},
  goEnroll() {
    wx.switchTab({ url: '/pages/home/home' })
  },
  toggleMemberPanel() {
    this.setData({ showMemberPanel: !this.data.showMemberPanel })
  },
  closeMemberPanel() {
    this.setData({ showMemberPanel: false })
  },
  onInputChange(e) {
    this.setData({ inputText: e.detail.value })
  },
  onInputFocus() {
    this.setData({ showEmoji: false, showMore: false })
  },
  toggleVoice() {
    this.setData({ voiceMode: !this.data.voiceMode, showEmoji: false, showMore: false })
  },
  toggleEmoji() {
    this.setData({ showEmoji: !this.data.showEmoji, showMore: false, voiceMode: false })
  },
  toggleMore() {
    this.setData({ showMore: !this.data.showMore, showEmoji: false, voiceMode: false })
  },
  sendEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji
    this.setData({ inputText: this.data.inputText + emoji })
  },
  startRecord() {
    wx.showToast({ title: '录音中...', icon: 'none' })
  },
  stopRecord() {
    wx.hideToast()
    wx.showToast({ title: '语音已发送', icon: 'success' })
  },
  sendImage() {
    wx.chooseImage({
      count: 9,
      success: () => wx.showToast({ title: '图片已选择', icon: 'success' })
    })
  },
  sendFile() {
    wx.showToast({ title: '文件发送功能开发中', icon: 'none' })
  },
  sendMessage() {
    if (!this.data.inputText.trim()) return
    const newMsg = {
      id: Date.now(),
      type: 'student',
      avatar: '张',
      name: '张三',
      time: '现在',
      content: this.data.inputText
    }
    this.setData({
      messages: [...this.data.messages, newMsg],
      inputText: ''
    })
  },
  clearChat() {
    wx.showModal({
      title: '提示',
      content: '确认清空聊天记录？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [], showMemberPanel: false })
        }
      }
    })
  },
  sendCamera() {
    wx.chooseImage({
      sourceType: ['camera'],
      success: () => wx.showToast({ title: '拍照已发送', icon: 'success' })
    })
  },
  goLeave() {
    wx.navigateTo({ url: '/pages/leave/leave?type=all' })
  },
  goMailbox() {
    this.setData({ showMore: false })
    wx.navigateTo({ url: '/pages/mailbox/mailbox' })
  }
})
