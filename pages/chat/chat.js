const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')
const { syncCustomTabBar } = require('../../utils/custom-tab-bar')
const { readStudentSession } = require('../../utils/auth')
const { clearChatUnreadBadge } = require('../../utils/chat-badge')
const {
  createChatSocket,
  devStudentLogin,
  fetchChatRoomMembers,
  fetchChatRooms,
  fetchChatHistory,
  normalizeChatMessage,
  normalizeRoomList,
  normalizeRoomMembers,
  postChatMessage,
  persistChatHistory,
} = require('../../utils/chat-socket')

const PENDING_CHAT_DRAFT_KEY = 'pending_chat_draft'
const MESSAGE_ACK_TIMEOUT = 5000

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
    <path d="M12 5.5V18.5" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M5.5 12H18.5" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round"/>
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
  `),
}

const WECOM_QR_PLACEHOLDER = '../../assets/chat/wecom-qrcode-placeholder.svg'

const DEFAULT_MESSAGES = [
  {
    id: 1,
    type: 'teacher',
    avatar: '李',
    name: '李老师',
    time: '09:00',
    content: '同学你好，欢迎来到申论基础课！今天我们开始学习“总结转述难”这个卡点，请先阅读课前材料。'
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
]

const NEW_USER_MESSAGES = [
  {
    id: 101,
    type: 'assistant',
    avatar: '助',
    name: '课程助手',
    time: '09:00',
    content: '你好呀，我是诊断课客服助手。先把新人专享的诊断课优惠发你，方便你先了解课程内容和优惠。',
    navigateUrl: '/pages/purchase/purchase?mode=diagnose&source=chat_new_user',
    coupon: {
      badge: '新人专享',
      title: '申论诊断课优惠券',
      subtitle: '人工拆解失分原因，输出书面诊断报告和学习建议',
      price: '¥199',
      originalPrice: '¥380',
      saveText: '新人立减 ¥181',
      actionText: '领券后可用于完整诊断课',
      tags: ['找准失分点', '生成学习路径', '再决定报什么课']
    }
  },
  {
    id: 102,
    type: 'assistant',
    avatar: '助',
    name: '课程助手',
    time: '09:01',
    content: '这是企业微信二维码截图。你扫码后把当前分数、目标分和最近卡点发我，我来帮你安排诊断。',
    imageUrl: WECOM_QR_PLACEHOLDER,
    imageCaption: '企业微信二维码示意图'
  }
]

const DEFAULT_MEMBERS = [
  { role: '带教老师', name: '李老师', avatar: '李' },
  { role: '诊断老师', name: '王老师', avatar: '王' },
  { role: '学管', name: '陈老师', avatar: '陈' },
  { role: '校长', name: '刘校长', avatar: '刘' }
]

const NEW_USER_MEMBERS = [
  { role: '诊断课客服', name: '课程助手', avatar: '助' },
  { role: '课程顾问', name: '学习规划顾问', avatar: '顾' }
]

const MANAGER_FALLBACK_MESSAGES = [
  {
    id: 'manager-welcome-1',
    type: 'assistant',
    avatar: '学',
    name: '学管老师',
    time: '09:00',
    content: '欢迎回来，我是你的学管老师。你现在还没有开通课程，有学习安排、诊断、课程节奏或报名问题，都可以先在这里咨询我。'
  },
  {
    id: 'manager-welcome-2',
    type: 'assistant',
    avatar: '学',
    name: '学管老师',
    time: '09:01',
    content: '如果你不确定下一步怎么学，可以把当前分数、目标分数和备考时间发给我，我会帮你先梳理适合的学习路径。'
  }
]

const MANAGER_FALLBACK_MEMBERS = [
  { role: '学管', name: '学管老师', avatar: '学' }
]

function cloneMessages(list) {
  return list.map((item) => ({
    ...item,
    coupon: item.coupon
      ? {
          ...item.coupon,
          tags: (item.coupon.tags || []).slice()
        }
      : null
  }))
}

function cloneMembers(list) {
  return list.map((item) => ({ ...item }))
}

function buildConversationState(isNewUser) {
  return {
    messages: cloneMessages(isNewUser ? NEW_USER_MESSAGES : DEFAULT_MESSAGES),
    members: cloneMembers(isNewUser ? NEW_USER_MEMBERS : DEFAULT_MEMBERS)
  }
}

function buildManagerConversationState() {
  return {
    messages: cloneMessages(MANAGER_FALLBACK_MESSAGES),
    members: cloneMembers(MANAGER_FALLBACK_MEMBERS)
  }
}

function buildEmptyConversationState() {
  return {
    messages: [],
    members: []
  }
}

function buildDefaultMessages(isNewUser) {
  return cloneMessages(isNewUser ? NEW_USER_MESSAGES : DEFAULT_MESSAGES)
}

function buildNavigationTitle(isNewUser) {
  return isNewUser ? '课程助手 · 新人咨询' : '聊天'
}

function shouldUseNewUserFallback(globalData = {}) {
  if (globalData.authReady === false) {
    return true
  }

  if (globalData.isNewUser) {
    return true
  }

  return false
}

function hasPurchasedCourse(globalData = {}) {
  return !!(globalData.hasDiagnoseCourse || globalData.hasPracticeCourse)
}

function shouldUseManagerFallback(globalData = {}) {
  if (globalData.authReady === false || globalData.isNewUser) {
    return false
  }

  return !hasPurchasedCourse(globalData)
}

function buildFallbackState(globalData = {}) {
  if (shouldUseNewUserFallback(globalData)) {
    return {
      mode: 'new',
      isNewUser: true,
      isManagerFallback: false,
      ...buildConversationState(true),
    }
  }

  if (shouldUseManagerFallback(globalData)) {
    return {
      mode: 'manager',
      isNewUser: false,
      isManagerFallback: true,
      ...buildManagerConversationState(),
    }
  }

  return {
    mode: 'room',
    isNewUser: false,
    isManagerFallback: false,
    ...buildEmptyConversationState(),
  }
}

function buildNavigationTitleByMode(mode, isNewUser) {
  if (mode === 'manager') {
    return '学管'
  }

  return buildNavigationTitle(isNewUser)
}

function buildStudentProfile() {
  const profile = (app && app.globalData && app.globalData.userProfile) || {}
  const session = readStudentSession()
  const name = profile.name || (session.info && session.info.name) || '张三'

  return {
    name,
    avatar: name.slice(0, 1) || '张',
    avatarUrl: profile.avatar || '',
    studentId: (session.info && session.info.id) || '',
  }
}

function getMessageAnchor(message) {
  const key = message && (message.clientId || message.id)
  return key ? `msg-${key}` : ''
}

function getLastMessageAnchor(messages) {
  if (!Array.isArray(messages) || !messages.length) {
    return ''
  }

  return getMessageAnchor(messages[messages.length - 1])
}

function mergeMessages(list, incoming) {
  const source = Array.isArray(list) ? list.slice() : []
  const nextMessage = normalizeChatMessage(incoming)
  const key = nextMessage.clientId || nextMessage.id
  const targetIndex = source.findIndex((item) => {
    const currentKey = item.clientId || item.id
    return currentKey && currentKey === key
  })

  if (targetIndex >= 0) {
    source[targetIndex] = {
      ...source[targetIndex],
      ...nextMessage,
      coupon: nextMessage.coupon || source[targetIndex].coupon || null,
    }
    return source
  }

  source.push(nextMessage)
  return source
}

function createOutgoingMessage(content) {
  const profile = buildStudentProfile()
  const clientId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const sentAt = new Date().toISOString()

  return normalizeChatMessage({
    id: clientId,
    clientId,
    type: 'student',
    senderRole: 'student',
    name: profile.name,
    avatar: profile.avatar,
    avatarUrl: profile.avatarUrl,
    content,
    sentAt,
    sendStatus: 'sending',
  })
}

function createManagerFallbackReply() {
  return normalizeChatMessage({
    id: `manager_reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'assistant',
    senderRole: 'assistant',
    name: '学管老师',
    avatar: '学',
    content: '收到啦，我先帮你记录下来。后续如果需要人工跟进，学管会结合你的情况继续联系你。',
    sentAt: new Date().toISOString(),
    sendStatus: 'sent',
  })
}

function findDeliveredMessage(historyMessages = [], outgoingMessage = {}) {
  const expectedContent = String(outgoingMessage.content || '').trim()
  const sentAtMs = new Date(outgoingMessage.sentAt || Date.now()).getTime()

  if (!expectedContent) {
    return null
  }

  const reversed = Array.isArray(historyMessages) ? historyMessages.slice().reverse() : []
  return reversed.find((item) => {
    if (!item) return false
    if ((item.type || item.senderRole) !== 'student') return false
    if (String(item.content || '').trim() !== expectedContent) return false

    const itemSentAtMs = new Date(item.sentAt || item.createdAt || Date.now()).getTime()
    if (Number.isNaN(sentAtMs) || Number.isNaN(itemSentAtMs)) {
      return true
    }

    return Math.abs(itemSentAtMs - sentAtMs) <= 2 * 60 * 1000
  }) || null
}

Page({
  data: {
    uiIcons,
    isEnrolled: false,
    isNewUser: false,
    isManagerFallback: false,
    conversationMode: 'room',
    roomId: '',
    scrollIntoView: '',
    socketConnected: false,
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
    emojiList: ['😀', '😂', '🥹', '😍', '🤩', '😎', '🥳', '😭', '😅', '🤣', '👍', '👎', '🙏', '👏', '🤝', '💪', '🫶', '❤️', '🔥', '✅', '⭐', '💯', '🎉', '😤', '🤔', '😴', '🫠', '😬', '🥺', '😱'],
    inputText: '',
    messages: [],
    members: []
  },

  onShow() {
    syncCustomTabBar(this, 'chat')
    clearChatUnreadBadge()
    const globalData = (app && app.globalData) || {}
    const pendingDraft = wx.getStorageSync(PENDING_CHAT_DRAFT_KEY) || ''
    const baseState = buildFallbackState(globalData)

    this._pageVisible = true
    this._activeRoomId = ''
    this._pendingAckTimers = {}

    this.setData({
      isEnrolled: !!globalData.isEnrolled,
      isNewUser: baseState.isNewUser,
      isManagerFallback: baseState.isManagerFallback,
      conversationMode: baseState.mode,
      roomId: '',
      socketConnected: false,
      showMemberPanel: false,
      inputText: pendingDraft || '',
      scrollIntoView: getLastMessageAnchor(baseState.messages),
      ...baseState
    })

    wx.setNavigationBarTitle({
      title: buildNavigationTitleByMode(baseState.mode, baseState.isNewUser),
    })

    this.bootstrapRoomConversation()

    if (pendingDraft) {
      wx.removeStorageSync(PENDING_CHAT_DRAFT_KEY)
    }
  },

  onHide() {
    this._pageVisible = false
    this.clearAllPendingAckTimers()
    this.closeRealtime()
  },

  onUnload() {
    this._pageVisible = false
    this.clearAllPendingAckTimers()
    this.closeRealtime()
  },

  onLoad() {},

  setConversationMessages(messages = []) {
    const safeMessages = Array.isArray(messages) ? messages : []
    const scrollIntoView = getLastMessageAnchor(safeMessages)

    this.setData({
      messages: safeMessages,
      scrollIntoView,
    })

    if (this.data.roomId) {
      persistChatHistory(this.data.roomId, safeMessages)
    }
  },

  applyMessageUpdate(message) {
    const nextMessages = mergeMessages(this.data.messages, message)
    this.setConversationMessages(nextMessages)
  },

  clearPendingAckTimer(clientId) {
    if (!clientId || !this._pendingAckTimers) {
      wx.setNavigationBarTitle({
        title: buildNavigationTitle(shouldFallbackToNewUser),
      })
      return
    }

    const timer = this._pendingAckTimers[clientId]
    if (timer) {
      clearTimeout(timer)
      delete this._pendingAckTimers[clientId]
    }
  },

  clearAllPendingAckTimers() {
    if (!this._pendingAckTimers) {
      return
    }

    Object.keys(this._pendingAckTimers).forEach((clientId) => {
      clearTimeout(this._pendingAckTimers[clientId])
    })
    this._pendingAckTimers = {}
  },

  startPendingAckTimer(clientId) {
    if (!clientId) return

    this.clearPendingAckTimer(clientId)
    this._pendingAckTimers[clientId] = setTimeout(async () => {
      delete this._pendingAckTimers[clientId]

      const outgoingMessage = this.data.messages.find((item) => item.clientId === clientId)
      if (!outgoingMessage || outgoingMessage.sendStatus === 'sent') {
        return
      }

      await this.tryFallbackSend(outgoingMessage)
    }, MESSAGE_ACK_TIMEOUT)
  },

  async tryFallbackSend(outgoingMessage) {
    if (!outgoingMessage || !outgoingMessage.clientId) {
      return
    }

    if (!this.data.roomId) {
      this.applyMessageUpdate({
        ...outgoingMessage,
        sendStatus: 'failed',
      })
      return
    }

    try {
      const historyMessages = await fetchChatHistory({
        roomId: this.data.roomId,
        seedMessages: [],
      })
      const deliveredMessage = findDeliveredMessage(historyMessages, outgoingMessage)

      if (deliveredMessage) {
        this.applyMessageUpdate({
          ...deliveredMessage,
          clientId: outgoingMessage.clientId,
          sendStatus: 'sent',
        })
        return
      }

      const savedMessage = await postChatMessage(this.data.roomId, {
        content: outgoingMessage.content,
        messageType: outgoingMessage.messageType || 'text',
      })

      if (!this._pageVisible) {
        return
      }

      this.applyMessageUpdate({
        ...savedMessage,
        clientId: outgoingMessage.clientId,
        sendStatus: 'sent',
      })
      if (!this.data.socketConnected) {
        this.loadConversationHistory(this.data.roomId, this.data.isNewUser)
      }
      wx.showToast({
        title: '实时通道异常，已改用备用发送',
        icon: 'none',
        duration: 2200,
      })
    } catch (error) {
      this.applyMessageUpdate({
        ...outgoingMessage,
        sendStatus: 'failed',
      })
      wx.showToast({
        title: (error && error.message) || '消息发送失败',
        icon: 'none',
        duration: 2200,
      })
    }
  },

  async bootstrapRoomConversation() {
    let rooms = []
    let bootstrapError = null

    try {
      rooms = normalizeRoomList(await fetchChatRooms())
    } catch (error) {
      bootstrapError = error
      try {
        await devStudentLogin(1)
        const globalData = (app && app.globalData) || {}
        const fallbackState = buildFallbackState(globalData)
        this.setData({
          isNewUser: fallbackState.isNewUser,
          isManagerFallback: fallbackState.isManagerFallback,
          conversationMode: fallbackState.mode,
          isEnrolled: !!globalData.isEnrolled,
        })
        rooms = normalizeRoomList(await fetchChatRooms())
      } catch (retryError) {
        bootstrapError = retryError
      }
    }

    const primaryRoom = rooms[0] || null

    if (!this._pageVisible) {
      return
    }

    if (!primaryRoom || !primaryRoom.id) {
      const globalData = (app && app.globalData) || {}
      const fallbackState = buildFallbackState(globalData)
      this._activeRoomId = ''
      this.setData({
        roomId: '',
        isNewUser: fallbackState.isNewUser,
        isManagerFallback: fallbackState.isManagerFallback,
        conversationMode: fallbackState.mode,
        members: fallbackState.members,
      })
      this.setConversationMessages(fallbackState.messages)
      wx.setNavigationBarTitle({
        title: buildNavigationTitleByMode(fallbackState.mode, fallbackState.isNewUser),
      })
      if (bootstrapError && !fallbackState.isNewUser && !fallbackState.isManagerFallback) {
        wx.showToast({
          title: bootstrapError.message || '聊天房间加载失败',
          icon: 'none',
          duration: 2600,
        })
      } else if (!fallbackState.isNewUser && !fallbackState.isManagerFallback) {
        wx.showToast({
          title: '当前账号还没有分配聊天房间',
          icon: 'none',
          duration: 2200,
        })
      }
      return
    }

    this._activeRoomId = primaryRoom.id
    this.setData({
      roomId: primaryRoom.id,
      isManagerFallback: false,
      conversationMode: 'room',
    })

    wx.setNavigationBarTitle({
      title: primaryRoom.name
        ? `${primaryRoom.name}${primaryRoom.title ? ` · ${primaryRoom.title}` : ''}`
        : '聊天',
    })

    const members = normalizeRoomMembers(await fetchChatRoomMembers(primaryRoom.id))
    if (this._pageVisible && this._activeRoomId === primaryRoom.id && members.length) {
      this.setData({ members })
    }

    this.loadConversationHistory(primaryRoom.id, this.data.isNewUser)
    this.connectRealtime(primaryRoom.id)
  },

  async loadConversationHistory(roomId, isNewUser) {
    const seedMessages = isNewUser ? buildDefaultMessages(true) : []
    const messages = await fetchChatHistory({
      roomId,
      seedMessages,
    })

    if (!this._pageVisible || this._activeRoomId !== roomId) {
      return
    }

    this.setConversationMessages(messages.length ? messages : seedMessages)
  },

  connectRealtime(roomId) {
    this.closeRealtime()

    this._chatSocket = createChatSocket({
      roomId,
      allowMockFallback: false,
      onEvent: (event) => {
        if (!event || this._activeRoomId !== roomId) {
          return
        }

        if (event.type === 'open' || event.type === 'connected') {
          this.setData({ socketConnected: true })
          return
        }

        if (event.type === 'close' || event.type === 'reconnecting') {
          this.setData({ socketConnected: false })
          return
        }

        if (event.type === 'ack') {
          this.clearPendingAckTimer(event.clientId)
          if (event.message) {
            this.applyMessageUpdate({
              ...event.message,
              clientId: event.clientId || event.message.clientId,
              sendStatus: 'sent',
            })
            return
          }

          const targetIndex = this.data.messages.findIndex((item) => item.clientId === event.clientId)
          if (targetIndex >= 0) {
            const nextMessages = this.data.messages.slice()
            nextMessages[targetIndex] = {
              ...nextMessages[targetIndex],
              sendStatus: 'sent',
            }
            this.setConversationMessages(nextMessages)
          }
          return
        }

        if (event.type === 'error') {
          if (event.clientId) {
            this.clearPendingAckTimer(event.clientId)
            this.applyMessageUpdate({
              clientId: event.clientId,
              sendStatus: 'failed',
            })
          }
          wx.showToast({
            title: event.message || '聊天服务异常',
            icon: 'none',
            duration: 2200,
          })
          return
        }

        if (event.type === 'chat_message' && event.message) {
          this.applyMessageUpdate(event.message)
        }
      },
    })

    this._chatSocket.connect()
  },

  closeRealtime() {
    if (this._chatSocket) {
      this._chatSocket.close()
      this._chatSocket = null
    }
  },

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
    const content = (this.data.inputText || '').trim()
    if (!content) return

    if (this.data.isNewUser) {
      wx.setStorageSync(PENDING_CHAT_DRAFT_KEY, content)
      wx.showModal({
        title: '先绑定一下账号',
        content: '发送消息前，已购课学员请先绑定报名手机号。绑定成功后会自动回到当前聊天页，你刚才输入的内容也会保留。',
        confirmText: '去绑定',
        cancelText: '稍后再说',
        success: (res) => {
          if (!res.confirm) return
        wx.navigateTo({
            url: `/pages/account-bind/account-bind?mode=chat&redirect=${encodeURIComponent('/pages/chat/chat')}`,
        })
        },
      })
      return
    }

    if (this.data.isManagerFallback && !this.data.roomId) {
      const outgoingMessage = createOutgoingMessage(content)
      this.setData({ inputText: '' })
      this.applyMessageUpdate({
        ...outgoingMessage,
        sendStatus: 'sent',
      })
      setTimeout(() => {
        if (!this._pageVisible || this.data.roomId) return
        this.applyMessageUpdate(createManagerFallbackReply())
      }, 350)
      return
    }

    if (!this.data.roomId) {
      wx.showToast({
        title: '当前未分配聊天房间',
        icon: 'none',
      })
      return
    }

    const outgoingMessage = createOutgoingMessage(content)
    const payload = {
      type: 'chat_message',
      roomId: this.data.roomId,
      clientId: outgoingMessage.clientId,
      senderId: buildStudentProfile().studentId || 'student_guest',
      senderName: outgoingMessage.name,
      senderRole: 'student',
      content,
      sentAt: outgoingMessage.sentAt,
      messageType: outgoingMessage.messageType || 'text',
    }

    this.setData({ inputText: '' })
    this.applyMessageUpdate(outgoingMessage)
    if (!this.data.socketConnected || !this._chatSocket) {
      this.tryFallbackSend(outgoingMessage)
      return
    }

    this.startPendingAckTimer(outgoingMessage.clientId)
    const sendOk = this._chatSocket.send(payload)
    if (!sendOk) {
      this.clearPendingAckTimer(outgoingMessage.clientId)
      this.tryFallbackSend(outgoingMessage)
    }
  },

  clearChat() {
    wx.showModal({
      title: '提示',
      content: this.data.roomId ? '确认重新拉取聊天记录？' : '确认恢复初始对话？',
      success: (res) => {
        if (res.confirm) {
          if (this.data.roomId) {
            this.setData({ showMemberPanel: false })
            this.loadConversationHistory(this.data.roomId, false)
            return
          }

          const baseState = this.data.isManagerFallback
            ? buildManagerConversationState()
            : buildConversationState(this.data.isNewUser)
          this.setData({
            showMemberPanel: false,
          })
          this.setConversationMessages(baseState.messages)
        }
      }
    })
  },

  handleMessageTap(e) {
    const { url } = e.currentTarget.dataset
    if (!url) return
    wx.navigateTo({ url })
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
