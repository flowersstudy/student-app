const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')

function buildIconSvg(body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">${body}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const ICONS = {
  menu: buildIconSvg(`
    <circle cx="6" cy="12" r="1.6" fill="#475569"/>
    <circle cx="12" cy="12" r="1.6" fill="#475569"/>
    <circle cx="18" cy="12" r="1.6" fill="#475569"/>
  `),
  voice: buildIconSvg(`
    <defs>
      <linearGradient id="voiceGrad" x1="7" y1="4.5" x2="17" y2="19.5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#60A5FA"/>
        <stop offset="1" stop-color="#2563EB"/>
      </linearGradient>
    </defs>
    <rect x="8.1" y="3.8" width="7.8" height="11.2" rx="3.9" fill="url(#voiceGrad)"/>
    <path d="M6.6 10.4C6.6 13.4 9 15.8 12 15.8C15 15.8 17.4 13.4 17.4 10.4" stroke="#1D4ED8" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M12 16.1V19.1" stroke="#1D4ED8" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M9.2 19.1H14.8" stroke="#1D4ED8" stroke-width="1.7" stroke-linecap="round"/>
    <rect x="9.4" y="5.4" width="5.2" height="6.1" rx="2.6" fill="#DBEAFE"/>
  `),
  keyboard: buildIconSvg(`
    <rect x="3.8" y="5.1" width="16.4" height="13.8" rx="4.1" fill="#EAF2FF" stroke="#2563EB" stroke-width="1.4"/>
    <rect x="6.5" y="8.2" width="1.7" height="1.7" rx=".45" fill="#2563EB"/>
    <rect x="9.4" y="8.2" width="1.7" height="1.7" rx=".45" fill="#2563EB"/>
    <rect x="12.3" y="8.2" width="1.7" height="1.7" rx=".45" fill="#2563EB"/>
    <rect x="15.2" y="8.2" width="1.7" height="1.7" rx=".45" fill="#2563EB"/>
    <rect x="6.5" y="11.1" width="1.7" height="1.7" rx=".45" fill="#60A5FA"/>
    <rect x="9.4" y="11.1" width="1.7" height="1.7" rx=".45" fill="#60A5FA"/>
    <rect x="12.3" y="11.1" width="1.7" height="1.7" rx=".45" fill="#60A5FA"/>
    <rect x="15.2" y="11.1" width="1.7" height="1.7" rx=".45" fill="#60A5FA"/>
    <rect x="7.4" y="14.4" width="9.2" height="1.8" rx=".9" fill="#2563EB" opacity=".85"/>
  `),
  emoji: buildIconSvg(`
    <defs>
      <radialGradient id="emojiBg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9 7) rotate(53) scale(14.5)">
        <stop stop-color="#EAF2FF"/>
        <stop offset="1" stop-color="#DBEAFE"/>
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="8.1" fill="url(#emojiBg)" stroke="#2563EB" stroke-width="1.3"/>
    <ellipse cx="9.1" cy="10.2" rx="1.05" ry="1.35" fill="#1D4ED8"/>
    <ellipse cx="14.9" cy="10.2" rx="1.05" ry="1.35" fill="#1D4ED8"/>
    <path d="M8.6 13.7C9.55 15.15 10.63 15.85 12 15.85C13.37 15.85 14.45 15.15 15.4 13.7" stroke="#2563EB" stroke-width="1.65" stroke-linecap="round"/>
    <circle cx="7.8" cy="13.1" r="1.05" fill="#93C5FD" opacity=".65"/>
    <circle cx="16.2" cy="13.1" r="1.05" fill="#93C5FD" opacity=".65"/>
  `),
  plus: buildIconSvg(`
    <path d="M12 5.5V18.5" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M5.5 12H18.5" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>
  `),
  image: buildIconSvg(`
    <defs>
      <linearGradient id="imgGrad" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F8FBFF"/>
        <stop offset="1" stop-color="#DBEAFE"/>
      </linearGradient>
    </defs>
    <rect x="4.4" y="5.2" width="15.2" height="13.6" rx="3.4" fill="url(#imgGrad)" stroke="#2563EB" stroke-width="1.4"/>
    <circle cx="9" cy="9.3" r="1.5" fill="#60A5FA"/>
    <path d="M7 15.8L10.2 12.7C10.55 12.36 11.12 12.38 11.45 12.73L13.3 14.63C13.65 14.98 14.21 15 14.57 14.68L17 12.5L18 13.4V16.4H7Z" fill="#93C5FD"/>
    <path d="M7 15.8L10.2 12.7C10.55 12.36 11.12 12.38 11.45 12.73L13.3 14.63C13.65 14.98 14.21 15 14.57 14.68L17 12.5" stroke="#2563EB" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  `),
  file: buildIconSvg(`
    <path d="M8.2 4.4H13.1L17.7 8.9V18C17.7 19.05 16.85 19.9 15.8 19.9H8.2C7.15 19.9 6.3 19.05 6.3 18V6.3C6.3 5.25 7.15 4.4 8.2 4.4Z" fill="#F8FAFC" stroke="#475569" stroke-width="1.35"/>
    <path d="M13.1 4.4V7.8C13.1 8.4 13.6 8.9 14.2 8.9H17.7" fill="#E2E8F0"/>
    <path d="M13.1 4.4V7.8C13.1 8.4 13.6 8.9 14.2 8.9H17.7" stroke="#475569" stroke-width="1.35" stroke-linejoin="round"/>
    <rect x="8.9" y="11" width="6.8" height="1.55" rx=".78" fill="#64748B"/>
    <rect x="8.9" y="14" width="5.1" height="1.55" rx=".78" fill="#94A3B8"/>
  `),
  camera: buildIconSvg(`
    <defs>
      <linearGradient id="camGrad" x1="6" y1="7" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ECFEFF"/>
        <stop offset="1" stop-color="#CFFAFE"/>
      </linearGradient>
    </defs>
    <path d="M7 7.2H9L10.15 5.8C10.42 5.48 10.81 5.3 11.22 5.3H12.78C13.19 5.3 13.58 5.48 13.85 5.8L15 7.2H17C18.27 7.2 19.3 8.23 19.3 9.5V16.2C19.3 17.47 18.27 18.5 17 18.5H7C5.73 18.5 4.7 17.47 4.7 16.2V9.5C4.7 8.23 5.73 7.2 7 7.2Z" fill="url(#camGrad)" stroke="#0891B2" stroke-width="1.35"/>
    <circle cx="12" cy="12.7" r="3.35" fill="#FFFFFF" stroke="#0891B2" stroke-width="1.35"/>
    <circle cx="12" cy="12.7" r="1.55" fill="#67E8F9"/>
    <circle cx="16.5" cy="9.6" r=".95" fill="#0891B2"/>
  `),
  leave: buildIconSvg(`
    <defs>
      <linearGradient id="leaveGrad" x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFF7ED"/>
        <stop offset="1" stop-color="#FFEDD5"/>
      </linearGradient>
    </defs>
    <rect x="5" y="6.1" width="14" height="12.9" rx="3.2" fill="url(#leaveGrad)" stroke="#D97706" stroke-width="1.35"/>
    <path d="M8.2 4.6V7.1" stroke="#D97706" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M15.8 4.6V7.1" stroke="#D97706" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M5 9.4H19" stroke="#F59E0B" stroke-width="1.35"/>
    <path d="M9 13.2L11.15 15.25L15.4 10.95" stroke="#D97706" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  `),
  mailbox: buildIconSvg(`
    <defs>
      <linearGradient id="mailGrad" x1="5.2" y1="6" x2="18.8" y2="18.4" gradientUnits="userSpaceOnUse">
        <stop stop-color="#EEF2FF"/>
        <stop offset="1" stop-color="#E0E7FF"/>
      </linearGradient>
    </defs>
    <rect x="4.8" y="6.2" width="14.4" height="11.8" rx="3.1" fill="url(#mailGrad)" stroke="#4F46E5" stroke-width="1.35"/>
    <path d="M7.2 9L11.15 12.1C11.65 12.48 12.35 12.48 12.85 12.1L16.8 9" stroke="#4F46E5" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 15.1H16.5" stroke="#818CF8" stroke-width="1.45" stroke-linecap="round"/>
  `)
}

Page({
  data: {
    uiIcons,
    isEnrolled: false,
    showMemberPanel: false,
    voiceMode: false,
    showEmoji: false,
    showMore: false,
    inputIcons: {
      menu: ICONS.menu,
      voice: ICONS.voice,
      keyboard: ICONS.keyboard,
      emoji: ICONS.emoji,
      plus: ICONS.plus
    },
    quickActions: [
      { key: 'image', label: '图片', icon: ICONS.image, tone: 'blue' },
      { key: 'file', label: '文件', icon: ICONS.file, tone: 'slate' },
      { key: 'camera', label: '拍照', icon: ICONS.camera, tone: 'cyan' },
      { key: 'leave', label: '申请请假', icon: ICONS.leave, tone: 'amber' },
      { key: 'mailbox', label: '校长信箱', icon: ICONS.mailbox, tone: 'indigo' }
    ],
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
  handleQuickAction(e) {
    const { key } = e.currentTarget.dataset
    const actionMap = {
      image: () => this.sendImage(),
      file: () => this.sendFile(),
      camera: () => this.sendCamera(),
      leave: () => this.goLeave(),
      mailbox: () => this.goMailbox()
    }
    const action = actionMap[key]
    if (action) action()
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
