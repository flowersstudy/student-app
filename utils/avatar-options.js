const STUDENT_AVATAR_STORAGE_KEY = 'student_selected_avatar'

const DEFAULT_AVATAR_OPTIONS = Array.from({ length: 10 }, (_, index) => {
  const id = `avatar-${String(index + 1).padStart(2, '0')}`
  return {
    id,
    label: `头像 ${index + 1}`,
    url: `/assets/avatars/${id}.png`,
  }
})

function normalizeAvatarOption(option = {}, index = 0) {
  const defaultOption = DEFAULT_AVATAR_OPTIONS[index] || {}
  const id = String(option.id || defaultOption.id || `avatar-${String(index + 1).padStart(2, '0')}`)
  const url = String(option.url || option.avatarUrl || defaultOption.url || '').trim()

  if (!url) {
    return null
  }

  return {
    id,
    label: String(option.label || defaultOption.label || `头像 ${index + 1}`),
    url,
  }
}

function resolveAvatarOptions(options = []) {
  if (!Array.isArray(options) || !options.length) {
    return DEFAULT_AVATAR_OPTIONS
  }

  const normalized = options
    .map((option, index) => normalizeAvatarOption(option, index))
    .filter(Boolean)

  return normalized.length ? normalized : DEFAULT_AVATAR_OPTIONS
}

function getAppSafe() {
  try {
    return getApp()
  } catch (error) {
    return null
  }
}

function getStoredStudentAvatar() {
  return wx.getStorageSync(STUDENT_AVATAR_STORAGE_KEY) || ''
}

function applyStudentAvatarToApp(avatarUrl = '', appInstance) {
  const app = appInstance || getAppSafe()
  if (!app || !app.globalData) return

  app.globalData.userProfile = {
    ...(app.globalData.userProfile || {}),
    avatar: avatarUrl,
  }
}

function setStoredStudentAvatar(avatarUrl = '', appInstance) {
  const safeUrl = String(avatarUrl || '')

  if (safeUrl) {
    wx.setStorageSync(STUDENT_AVATAR_STORAGE_KEY, safeUrl)
  } else {
    wx.removeStorageSync(STUDENT_AVATAR_STORAGE_KEY)
  }

  applyStudentAvatarToApp(safeUrl, appInstance)
  return safeUrl
}

module.exports = {
  DEFAULT_AVATAR_OPTIONS,
  STUDENT_AVATAR_STORAGE_KEY,
  applyStudentAvatarToApp,
  getStoredStudentAvatar,
  normalizeAvatarOption,
  resolveAvatarOptions,
  setStoredStudentAvatar,
}
