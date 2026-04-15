const STUDENT_AVATAR_STORAGE_KEY = 'student_selected_avatar'

const avatarOptions = Array.from({ length: 10 }, (_, index) => {
  const id = `avatar-${String(index + 1).padStart(2, '0')}`
  return {
    id,
    label: `头像 ${index + 1}`,
    url: `/assets/avatars/${id}.png`,
  }
})

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
  STUDENT_AVATAR_STORAGE_KEY,
  applyStudentAvatarToApp,
  avatarOptions,
  getStoredStudentAvatar,
  setStoredStudentAvatar,
}
