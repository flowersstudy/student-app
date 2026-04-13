const CHAT_UNREAD_COUNT_KEY = 'student_chat_unread_count'
const CHAT_BADGE_SEEN_KEY = 'student_chat_badge_seen'
const CHAT_TAB_INDEX = 1
const DEFAULT_NEW_USER_CHAT_UNREAD = 2

function normalizeUnreadCount(value) {
  const count = Number(value || 0)
  if (!Number.isFinite(count) || count <= 0) {
    return 0
  }
  return Math.max(0, Math.floor(count))
}

function getAppSafe() {
  try {
    return getApp()
  } catch (error) {
    return null
  }
}

function readChatUnreadCount() {
  return normalizeUnreadCount(wx.getStorageSync(CHAT_UNREAD_COUNT_KEY))
}

function hasSeenChatBadge() {
  return wx.getStorageSync(CHAT_BADGE_SEEN_KEY) === true
}

function writeChatUnreadCount(count) {
  const normalizedCount = normalizeUnreadCount(count)
  wx.setStorageSync(CHAT_UNREAD_COUNT_KEY, normalizedCount)
  return normalizedCount
}

function applyChatTabBadge(count) {
  const normalizedCount = normalizeUnreadCount(count)

  if (normalizedCount > 0) {
    wx.setTabBarBadge({
      index: CHAT_TAB_INDEX,
      text: normalizedCount > 99 ? '99+' : String(normalizedCount),
    })
    return normalizedCount
  }

  wx.removeTabBarBadge({
    index: CHAT_TAB_INDEX,
  })
  return 0
}

function syncChatUnreadBadge(appInstance) {
  let unreadCount = readChatUnreadCount()

  if (!hasSeenChatBadge() && unreadCount <= 0) {
    unreadCount = writeChatUnreadCount(DEFAULT_NEW_USER_CHAT_UNREAD)
  }

  return applyChatTabBadge(unreadCount)
}

function setChatUnreadBadge(count) {
  const unreadCount = writeChatUnreadCount(count)
  return applyChatTabBadge(unreadCount)
}

function clearChatUnreadBadge() {
  wx.setStorageSync(CHAT_BADGE_SEEN_KEY, true)
  return setChatUnreadBadge(0)
}

module.exports = {
  CHAT_BADGE_SEEN_KEY,
  CHAT_UNREAD_COUNT_KEY,
  clearChatUnreadBadge,
  readChatUnreadCount,
  setChatUnreadBadge,
  syncChatUnreadBadge,
}
