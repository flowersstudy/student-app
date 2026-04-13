const { readStudentSession, saveStudentSession } = require('./auth')
const { getRuntimeConfig } = require('./runtime-config')

const CHAT_HISTORY_CACHE_PREFIX = 'chat_history_cache_'
const HEARTBEAT_INTERVAL = 25000
const INITIAL_RECONNECT_DELAY = 1500
const MAX_RECONNECT_DELAY = 12000

function getAppSafe() {
  try {
    return getApp()
  } catch (error) {
    return null
  }
}

function getServerBase() {
  const app = getAppSafe()
  return (app && app.globalData && app.globalData.serverBase) || getRuntimeConfig().serverBase
}

function isExplicitMockMode() {
  const app = getAppSafe()
  return !!(app && app.globalData && app.globalData.chatMockMode === true)
}

function buildConversationId({ isNewUser = false, studentId = '' } = {}) {
  const safeStudentId = studentId || 'guest'
  return isNewUser
    ? `student-${safeStudentId}-diagnose-service`
    : `student-${safeStudentId}-teacher-service`
}

function requestWithSession({ url, method = 'GET', data = {} } = {}) {
  const session = readStudentSession()
  const serverBase = getServerBase()

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${serverBase}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: session.token ? `Bearer ${session.token}` : '',
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }

        reject(new Error((res.data && (res.data.message || res.data.error)) || '请求失败'))
      },
      fail: reject,
    })
  })
}

function canUseDevChatLogin() {
  const serverBase = getServerBase()
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(serverBase)
}

function devStudentLogin(studentId = 1) {
  if (!canUseDevChatLogin()) {
    return Promise.reject(new Error('当前环境不允许开发登录'))
  }

  return requestWithSession({
    url: '/api/auth/student/dev-login',
    method: 'POST',
    data: { studentId },
  }).then((result) => {
    saveStudentSession(result)
    return result
  })
}

function buildCacheKey(conversationId) {
  return `${CHAT_HISTORY_CACHE_PREFIX}${conversationId || 'default'}`
}

function formatChatTime(value) {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }

  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

function isBrokenText(value) {
  if (value === null || value === undefined) return true
  const raw = String(value).trim()
  if (!raw) return true
  const cleaned = raw.replace(/[?？\s,，.。!！:：;；、'"“”‘’\-_/\\|()[\]{}<>~`@#$%^&*+=]+/g, '')
  return cleaned.length === 0
}

function sanitizeDisplayText(value, fallback) {
  return isBrokenText(value) ? fallback : String(value).trim()
}

function inferMessageType(raw = {}) {
  if (raw.senderType === 'student' || raw.senderType === 'teacher' || raw.senderType === 'assistant') {
    return raw.senderType
  }

  if (raw.senderRole === 'student') {
    return 'student'
  }

  if (raw.senderRole === 'assistant') {
    return 'assistant'
  }

  if (raw.type === 'student' || raw.type === 'teacher' || raw.type === 'assistant') {
    return raw.type
  }

  return 'teacher'
}

function inferAvatar(raw = {}, name = '') {
  if (raw.avatar) {
    return raw.avatar
  }

  if (name) {
    return name.slice(0, 1)
  }

  if (raw.senderRole === 'assistant') {
    return '助'
  }

  if (raw.senderRole === 'student') {
    return '我'
  }

  return '师'
}

function createMessageKey(message = {}) {
  return message.clientId || message.id || ''
}

function normalizeChatMessage(raw = {}) {
  const messageType = raw.messageType || (['text', 'image', 'file', 'audio'].includes(raw.type) ? raw.type : 'text')
  const senderType = inferMessageType(raw)
  const rawName = raw.name || raw.senderName || ''
  const nameFallback = senderType === 'student'
    ? '张同学'
    : senderType === 'assistant'
      ? '课程助手'
      : '李老师'
  const name = sanitizeDisplayText(rawName, nameFallback)
  const sentAt = raw.sentAt || raw.createdAt || raw.updatedAt || ''
  const id = raw.id || raw.messageId || raw.clientId || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const clientId = raw.clientId || `${id}`

  return {
    id,
    clientId,
    type: senderType,
    senderRole: raw.senderRole || senderType,
    avatar: sanitizeDisplayText(inferAvatar(raw, name), name.slice(0, 1) || '师'),
    avatarUrl: raw.avatarUrl || '',
    name,
    time: raw.time || formatChatTime(sentAt || Date.now()),
    sentAt: sentAt || new Date().toISOString(),
    content: sanitizeDisplayText(raw.content, '欢迎来到聊天房间，我们可以在这里实时沟通。'),
    messageType,
    imageUrl: raw.imageUrl || '',
    imageCaption: raw.imageCaption || '',
    navigateUrl: raw.navigateUrl || '',
    coupon: raw.coupon || null,
    sendStatus: raw.sendStatus || 'sent',
  }
}

function dedupeMessages(list = []) {
  const result = []
  const indexMap = {}

  list.forEach((item) => {
    const message = normalizeChatMessage(item)
    const key = createMessageKey(message)
    if (!key) {
      result.push(message)
      return
    }

    if (indexMap[key] === undefined) {
      indexMap[key] = result.length
      result.push(message)
      return
    }

    const previous = result[indexMap[key]]
    result[indexMap[key]] = {
      ...previous,
      ...message,
      coupon: message.coupon || previous.coupon || null,
    }
  })

  return result
}

function readChatHistoryCache(conversationId) {
  const key = buildCacheKey(conversationId)
  const stored = wx.getStorageSync(key)
  if (!Array.isArray(stored)) {
    return []
  }

  return dedupeMessages(stored)
}

function persistChatHistory(conversationId, messages = []) {
  if (!conversationId) return []
  const normalized = dedupeMessages(messages)
  wx.setStorageSync(buildCacheKey(conversationId), normalized)
  return normalized
}

function normalizeHistoryResponse(result, seedMessages = []) {
  const list = Array.isArray(result)
    ? result
    : result && Array.isArray(result.messages)
      ? result.messages
      : []

  if (!list.length) {
    return dedupeMessages(seedMessages)
  }

  return dedupeMessages(list)
}

function fetchChatRooms() {
  if (isExplicitMockMode()) {
    return Promise.resolve([])
  }

  return requestWithSession({
    url: '/api/chat/rooms',
  }).catch(async (error) => {
    if (!canUseDevChatLogin()) {
      throw error
    }

    await devStudentLogin(1)
    return requestWithSession({
      url: '/api/chat/rooms',
    })
  })
}

function fetchChatRoomMembers(roomId) {
  if (!roomId || isExplicitMockMode()) {
    return Promise.resolve([])
  }

  return requestWithSession({
    url: `/api/chat/rooms/${roomId}/members`,
  }).catch(() => [])
}

function fetchChatHistory({ roomId, seedMessages = [] } = {}) {
  const cacheKey = roomId || 'default'
  const cached = readChatHistoryCache(cacheKey)
  if (isExplicitMockMode()) {
    const fallback = cached.length ? cached : dedupeMessages(seedMessages)
    persistChatHistory(cacheKey, fallback)
    return Promise.resolve(fallback)
  }

  if (!roomId) {
    const fallback = cached.length ? cached : dedupeMessages(seedMessages)
    persistChatHistory(cacheKey, fallback)
    return Promise.resolve(fallback)
  }

  return requestWithSession({
    url: `/api/chat/rooms/${roomId}/messages`,
    data: {
      limit: 30,
    },
  }).then((result) => {
    const messages = normalizeHistoryResponse(result, seedMessages)
    persistChatHistory(cacheKey, messages)
    return messages
  }).catch(() => {
    const fallback = cached.length ? cached : dedupeMessages(seedMessages)
    persistChatHistory(cacheKey, fallback)
    return fallback
  })
}

/*
function postChatMessage(roomId, { content, messageType = 'text', replyToId = null } = {}) {
  if (!roomId) {
    return Promise.reject(new Error('鑱婂ぉ鎴块棿涓嶅瓨鍦?))
  }

  const doRequest = () => requestWithSession({
    url: `/api/chat/rooms/${roomId}/messages`,
    method: 'POST',
    data: {
      content,
      type: messageType,
      reply_to_id: replyToId || null,
    },
  }).then((result) => normalizeChatMessage({
    ...result,
    messageType: result.messageType || result.type || messageType,
    sendStatus: 'sent',
  }))

  if (isExplicitMockMode()) {
    return Promise.resolve(normalizeChatMessage({
      id: `mock_http_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      clientId: `mock_http_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderType: 'student',
      senderRole: 'student',
      name: '张三',
      avatar: '张',
      content,
      messageType,
      createdAt: new Date().toISOString(),
      sendStatus: 'sent',
    }))
  }

  return doRequest().catch(async (error) => {
    if (!canUseDevChatLogin()) {
      throw error
    }

    await devStudentLogin(1)
    return doRequest()
  })
}
*/

function postChatMessage(roomId, { content, messageType = 'text', replyToId = null } = {}) {
  if (!roomId) {
    return Promise.reject(new Error('Chat room is missing'))
  }

  const doRequest = () => requestWithSession({
    url: `/api/chat/rooms/${roomId}/messages`,
    method: 'POST',
    data: {
      content,
      type: messageType,
      reply_to_id: replyToId || null,
    },
  }).then((result) => normalizeChatMessage({
    ...result,
    messageType: result.messageType || result.type || messageType,
    sendStatus: 'sent',
  }))

  if (isExplicitMockMode()) {
    const mockId = `mock_http_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    return Promise.resolve(normalizeChatMessage({
      id: mockId,
      clientId: mockId,
      senderType: 'student',
      senderRole: 'student',
      name: 'Student',
      avatar: 'S',
      content,
      messageType,
      createdAt: new Date().toISOString(),
      sendStatus: 'sent',
    }))
  }

  return doRequest().catch(async (error) => {
    if (!canUseDevChatLogin()) {
      throw error
    }

    await devStudentLogin(1)
    return doRequest()
  })
}

function buildSocketUrl(serverBase, { roomId, token } = {}) {
  const normalizedBase = (serverBase || 'http://localhost:3000')
    .replace(/^http:\/\//i, 'ws://')
    .replace(/^https:\/\//i, 'wss://')
    .replace(/\/$/, '')

  const params = new URLSearchParams()
  if (roomId) {
    params.set('roomId', String(roomId))
  }
  if (token) {
    params.set('token', token)
  }

  return `${normalizedBase}/?${params.toString()}`
}

function normalizeRoomMembers(list = []) {
  if (!Array.isArray(list)) return []
  return list.map((item) => ({
    id: item.id || '',
    name: sanitizeDisplayText(item.name, '老师'),
    role: sanitizeDisplayText(item.role, '成员'),
    avatar: sanitizeDisplayText(item.avatar, sanitizeDisplayText(item.name, '老师').slice(0, 1)),
  }))
}

function normalizeRoomList(list = []) {
  if (!Array.isArray(list)) return []
  return list.map((item) => ({
    id: item.id ? String(item.id) : '',
    name: sanitizeDisplayText(item.name, item.contactType === 'teacher' ? '李老师' : '张同学'),
    avatar: sanitizeDisplayText(item.avatar, sanitizeDisplayText(item.name, item.contactType === 'teacher' ? '李老师' : '张同学').slice(0, 1)),
    preview: sanitizeDisplayText(item.preview, '欢迎来到聊天房间，我们可以在这里实时沟通。'),
    time: item.time || '',
    unreadCount: Number(item.unreadCount || 0),
    contactType: item.contactType || '',
    title: sanitizeDisplayText(item.title, item.contactType === 'teacher' ? '带教老师' : ''),
    subject: item.subject || '',
    grade: item.grade || '',
  }))
}

function createMockSocket({ roomId, onEvent }) {
  let closed = false
  const timers = []

  function safeEmit(event) {
    if (closed || typeof onEvent !== 'function') return
    onEvent(event)
  }

  function registerTimer(callback, delay) {
    const timer = setTimeout(() => {
      if (closed) return
      callback()
    }, delay)
    timers.push(timer)
  }

  return {
    connect() {
      registerTimer(() => safeEmit({ type: 'mode', mode: 'mock' }), 20)
      registerTimer(() => safeEmit({ type: 'open' }), 80)
    },
    send(payload = {}) {
      if (closed) return false

      if (payload.type === 'ping') {
        registerTimer(() => safeEmit({ type: 'pong' }), 20)
        return true
      }

      if (payload.type !== 'chat_message') {
        return true
      }

      registerTimer(() => {
        safeEmit({
          type: 'ack',
          clientId: payload.clientId,
          message: normalizeChatMessage({
            id: payload.clientId,
            clientId: payload.clientId,
            senderType: 'student',
            senderRole: 'student',
            name: payload.senderName || '张三',
            avatar: (payload.senderName || '张三').slice(0, 1),
            content: payload.content || '',
            messageType: payload.messageType || 'text',
            createdAt: payload.sentAt || new Date().toISOString(),
            sendStatus: 'sent',
          }),
        })
      }, 120)

      registerTimer(() => {
        safeEmit({
          type: 'chat_message',
          message: buildMockReply(payload, roomId),
        })
      }, 900)

      return true
    },
    reconnect() {
      if (closed) return
      this.connect()
    },
    close() {
      if (closed) return
      safeEmit({ type: 'close', code: 1000, reason: 'mock_closed' })
      closed = true
      timers.forEach((timer) => clearTimeout(timer))
    },
  }
}

function buildMockReply(payload = {}, roomId = '') {
  const content = `${payload.content || ''}`.trim()
  const isNewUser = /diagnose|guest/.test(roomId)
  const name = isNewUser ? '课程助手' : '李老师'
  const avatar = isNewUser ? '助' : '李'

  let replyContent = '收到啦，我先帮你记下，稍后会继续跟进你的问题。'

  if (/几点|时间|上课|开始/.test(content)) {
    replyContent = '课程时间我已经帮你记下，正式排课后会第一时间在这里同步给你。'
  } else if (/总结转述|主题句|概括/.test(content)) {
    replyContent = '这个问题很典型，后面我们会重点看“先判断段落主旨，再压缩表达”的步骤。'
  } else if (/优惠|多少钱|价格|诊断/.test(content)) {
    replyContent = '诊断课这边会先帮你看失分病因，再决定后续课程，价格和权益我也可以继续发你。'
  }

  return normalizeChatMessage({
    id: `mock_reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    senderType: isNewUser ? 'assistant' : 'teacher',
    senderRole: isNewUser ? 'assistant' : 'teacher',
    avatar,
    name,
    content: replyContent,
    messageType: 'text',
    createdAt: new Date().toISOString(),
    sendStatus: 'sent',
  })
}

function createChatSocket({ roomId, onEvent, allowMockFallback = true } = {}) {
  let socketTask = null
  let mockSocket = null
  let heartbeatTimer = null
  let reconnectTimer = null
  let reconnectDelay = INITIAL_RECONNECT_DELAY
  let manualClose = false
  let openedOnce = false
  let connected = false
  let sendQueue = []
  let mode = 'socket'
  let switchedToMock = false
  const enableMockFallback = !!(allowMockFallback && canUseDevChatLogin())

  function safeEmit(event) {
    if (typeof onEvent === 'function') {
      onEvent(event)
    }
  }

  function clearHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  function clearReconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function flushQueue() {
    if (!connected || !socketTask || !sendQueue.length) {
      return
    }

    const queued = sendQueue.slice()
    sendQueue = []
    queued.forEach((payload) => {
      socketTask.send({
        data: JSON.stringify(payload),
      })
    })
  }

  function startHeartbeat() {
    clearHeartbeat()
    heartbeatTimer = setInterval(() => {
      controller.send({
        type: 'ping',
        roomId,
        timestamp: Date.now(),
      })
    }, HEARTBEAT_INTERVAL)
  }

  function parseIncomingData(data) {
    if (!data) return null

    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch (error) {
        return {
          type: 'chat_message',
          content: data,
        }
      }
    }

    return data
  }

  function handleIncomingPayload(payload) {
    if (!payload) return

    if (Array.isArray(payload)) {
      payload.forEach((item) => handleIncomingPayload(item))
      return
    }

    if (payload.type === 'pong') {
      safeEmit({ type: 'pong' })
      return
    }

    if (payload.type === 'chat_ack' || payload.type === 'ack') {
      safeEmit({
        type: 'ack',
        clientId: payload.clientId,
        message: payload.message ? normalizeChatMessage(payload.message) : null,
      })
      return
    }

    if (payload.type === 'connected') {
      safeEmit({
        type: 'connected',
        roomId: payload.roomId || '',
      })
      return
    }

    if (payload.type === 'error') {
      safeEmit({
        type: 'error',
        clientId: payload.clientId || '',
        message: payload.message || '聊天服务异常',
      })
      return
    }

    if (payload.type === 'chat_message' || payload.message || payload.content) {
      const message = normalizeChatMessage(payload.message || payload.data || payload)
      safeEmit({
        type: 'chat_message',
        message,
      })
    }
  }

  function scheduleReconnect() {
    if (manualClose || mode !== 'socket') {
      return
    }

    clearReconnect()
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      controller.connect()
    }, reconnectDelay)

    safeEmit({
      type: 'reconnecting',
      delay: reconnectDelay,
    })

    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY)
  }

  function switchToMockMode() {
    if (switchedToMock) return
    switchedToMock = true
    mode = 'mock'
    connected = false
    clearHeartbeat()
    clearReconnect()

    if (socketTask) {
      try {
        socketTask.close()
      } catch (error) {
        console.warn('关闭失败的聊天 socket 时出错:', error)
      }
      socketTask = null
    }

    mockSocket = createMockSocket({ roomId, onEvent })
    mockSocket.connect()
  }

  const controller = {
    connect() {
      manualClose = false
      clearReconnect()

      if (isExplicitMockMode()) {
        switchToMockMode()
        return
      }

      if (mode === 'mock' && mockSocket) {
        mockSocket.connect()
        return
      }

      mode = 'socket'
      const session = readStudentSession()
      const socketUrl = buildSocketUrl(getServerBase(), {
        roomId,
        token: session.token || '',
      })
      socketTask = wx.connectSocket({
        url: socketUrl,
      })

      socketTask.onOpen(() => {
        openedOnce = true
        connected = true
        reconnectDelay = INITIAL_RECONNECT_DELAY
        startHeartbeat()
        safeEmit({ type: 'open' })
        flushQueue()
      })

      socketTask.onMessage((res) => {
        handleIncomingPayload(parseIncomingData(res.data))
      })

      socketTask.onError((error) => {
        safeEmit({ type: 'error', error })

        if (!openedOnce && enableMockFallback) {
          switchToMockMode()
        }
      })

      socketTask.onClose((res) => {
        connected = false
        clearHeartbeat()
        safeEmit({
          type: 'close',
          code: res && res.code,
          reason: res && res.reason,
        })

        if (manualClose) {
          return
        }

        if (!openedOnce && enableMockFallback) {
          switchToMockMode()
          return
        }

        scheduleReconnect()
      })
    },

    send(payload = {}) {
      if (mode === 'mock' && mockSocket) {
        return mockSocket.send(payload)
      }

      if (!socketTask || !connected) {
        sendQueue.push(payload)
        if (!socketTask) {
          controller.connect()
        }
        return true
      }

      socketTask.send({
        data: JSON.stringify(payload),
      })
      return true
    },

    reconnect() {
      if (mode === 'mock' && mockSocket) {
        mockSocket.reconnect()
        return
      }

      controller.connect()
    },

    close() {
      manualClose = true
      connected = false
      clearHeartbeat()
      clearReconnect()

      if (mockSocket) {
        mockSocket.close()
        mockSocket = null
      }

      if (socketTask) {
        try {
          socketTask.close({
            code: 1000,
            reason: 'manual_close',
          })
        } catch (error) {
          console.warn('关闭聊天 socket 失败:', error)
        }
        socketTask = null
      }
    },
  }

  return controller
}

module.exports = {
  buildConversationId,
  createChatSocket,
  fetchChatRoomMembers,
  fetchChatRooms,
  devStudentLogin,
  fetchChatHistory,
  formatChatTime,
  normalizeChatMessage,
  normalizeRoomList,
  normalizeRoomMembers,
  postChatMessage,
  persistChatHistory,
}
