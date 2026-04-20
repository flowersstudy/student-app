const { readStudentSession, saveStudentSession } = require('./auth')
const {
  getAppSafe,
  getServerBase: getRequestServerBase,
  requestWithAuth,
} = require('./request')

const CHAT_HISTORY_CACHE_PREFIX = 'chat_history_cache_'
const HEARTBEAT_INTERVAL = 25000
const INITIAL_RECONNECT_DELAY = 1500
const MAX_RECONNECT_DELAY = 12000

function getServerBase() {
  return getRequestServerBase()
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
  return requestWithAuth({
    url,
    method,
    data,
  })
}

async function requestChatApi(options = {}, requestOptions = {}) {
  const { allowDevLoginRetry = false } = requestOptions
  const executeRequest = () => requestWithSession(options)

  try {
    return await executeRequest()
  } catch (error) {
    if (!allowDevLoginRetry || !canUseDevChatLogin()) {
      throw error
    }

    try {
      await devStudentLogin(1)
      return await executeRequest()
    } catch (retryError) {
      throw retryError
    }
  }
}

function canUseDevChatLogin() {
  const serverBase = getServerBase()
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(serverBase)
}

function devStudentLogin(studentId = 1) {
  if (!canUseDevChatLogin()) {
    return Promise.reject(new Error('\u5f53\u524d\u73af\u5883\u4e0d\u5141\u8bb8\u5f00\u53d1\u767b\u5f55'))
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
  const cleaned = raw.replace(/[?\uFF1F\s,\uFF0C.\u3002!\uFF01:\uFF1A;\uFF1B\u3001'\"\u201C\u201D\u2018\u2019\-_/\\|()\[\]{}<>~`@#$%^&*+=]+/g, '')
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
    return '\u52a9'
  }

  if (raw.senderRole === 'student') {
    return '\u6211'
  }

  return '\u5e08'
}

function createMessageKey(message = {}) {
  return message.clientId || message.id || ''
}

function normalizeChatMessage(raw = {}) {
  const messageType = raw.messageType || (['text', 'image', 'file', 'audio'].includes(raw.type) ? raw.type : 'text')
  const senderType = inferMessageType(raw)
  const rawName = raw.name || raw.senderName || ''
  const nameFallback = senderType === 'student'
    ? '\u5f20\u540c\u5b66'
    : senderType === 'assistant'
      ? '\u8bfe\u7a0b\u52a9\u624b'
      : '\u674e\u8001\u5e08'
  const name = sanitizeDisplayText(rawName, nameFallback)
  const sentAt = raw.sentAt || raw.createdAt || raw.updatedAt || ''
  const id = raw.id || raw.messageId || raw.clientId || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const clientId = raw.clientId || `${id}`

  return {
    id,
    clientId,
    type: senderType,
    senderRole: raw.senderRole || senderType,
    avatar: sanitizeDisplayText(inferAvatar(raw, name), name.slice(0, 1) || '\u5e08'),
    avatarUrl: raw.avatarUrl || '',
    name,
    time: raw.time || formatChatTime(sentAt || Date.now()),
    sentAt: sentAt || new Date().toISOString(),
    content: sanitizeDisplayText(raw.content, '\u6b22\u8fce\u6765\u5230\u804a\u5929\u623f\u95f4\uff0c\u6211\u4eec\u53ef\u4ee5\u5728\u8fd9\u91cc\u5b9e\u65f6\u6c9f\u901a\u3002'),
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

  return requestChatApi({
    url: '/api/chat/rooms',
  }, {
    allowDevLoginRetry: true,
  })
}

function fetchChatRoomMembers(roomId) {
  if (!roomId || isExplicitMockMode()) {
    return Promise.resolve([])
  }

  return requestChatApi({
    url: `/api/chat/rooms/${roomId}/members`,
  }, {
    allowDevLoginRetry: true,
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

  return requestChatApi({
    url: `/api/chat/rooms/${roomId}/messages`,
    data: {
      limit: 30,
    },
  }, {
    allowDevLoginRetry: true,
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

function postChatMessage(roomId, { content, messageType = 'text', replyToId = null } = {}) {
  if (!roomId) {
    return Promise.reject(new Error('Chat room is missing'))
  }

  const doRequest = () => requestChatApi({
    url: `/api/chat/rooms/${roomId}/messages`,
    method: 'POST',
    data: {
      content,
      type: messageType,
      reply_to_id: replyToId || null,
    },
  }, {
    allowDevLoginRetry: true,
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

  return doRequest()
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
    name: sanitizeDisplayText(item.name, item.contactType === 'teacher' ? '\u674e\u8001\u5e08' : '\u5f20\u540c\u5b66'),
    avatar: sanitizeDisplayText(item.avatar, sanitizeDisplayText(item.name, item.contactType === 'teacher' ? '\u674e\u8001\u5e08' : '\u5f20\u540c\u5b66').slice(0, 1)),
    preview: sanitizeDisplayText(item.preview, '\u6b22\u8fce\u6765\u5230\u804a\u5929\u623f\u95f4\uff0c\u6211\u4eec\u53ef\u4ee5\u5728\u8fd9\u91cc\u5b9e\u65f6\u6c9f\u901a\u3002'),
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
  const name = isNewUser ? '\u8bfe\u7a0b\u52a9\u624b' : '\u674e\u8001\u5e08'
  const avatar = isNewUser ? '\u52a9' : '\u674e'

  let replyContent = '\u6536\u5230\u5566\uff0c\u6211\u5148\u5e2e\u4f60\u8bb0\u4e0b\uff0c\u7a0d\u540e\u4f1a\u7ee7\u7eed\u8ddf\u8fdb\u4f60\u7684\u95ee\u9898\u3002'

  if (/\u51e0\u70b9|\u65f6\u95f4|\u4e0a\u8bfe|\u5f00\u59cb/.test(content)) {
    replyContent = '\u8bfe\u7a0b\u65f6\u95f4\u6211\u5df2\u7ecf\u5e2e\u4f60\u8bb0\u4e0b\uff0c\u6b63\u5f0f\u6392\u8bfe\u540e\u4f1a\u7b2c\u4e00\u65f6\u95f4\u5728\u8fd9\u91cc\u540c\u6b65\u7ed9\u4f60\u3002'
  } else if (/\u603b\u7ed3\u8f6c\u8ff0|\u4e3b\u9898\u53e5|\u6982\u62ec/.test(content)) {
    replyContent = '\u8fd9\u4e2a\u95ee\u9898\u5f88\u5178\u578b\uff0c\u540e\u9762\u6211\u4eec\u4f1a\u91cd\u70b9\u770b\u5148\u5224\u65ad\u6bb5\u843d\u4e3b\u65e8\u518d\u538b\u7f29\u8868\u8fbe\u7684\u6b65\u9aa4\u3002'
  } else if (/\u4f18\u60e0|\u591a\u5c11\u94b1|\u4ef7\u683c|\u8bca\u65ad/.test(content)) {
    replyContent = '\u8bca\u65ad\u8bfe\u4f1a\u5148\u5e2e\u4f60\u770b\u5931\u5206\u539f\u56e0\uff0c\u518d\u51b3\u5b9a\u540e\u7eed\u8bfe\u7a0b\uff0c\u4ef7\u683c\u548c\u6743\u76ca\u6211\u4e5f\u53ef\u4ee5\u7ee7\u7eed\u53d1\u7ed9\u4f60\u3002'
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
        console.warn('\u5173\u95ed\u5931\u8d25\u7684\u804a\u5929 socket \u65f6\u51fa\u9519:', error)
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


