const STORAGE_KEYS = {
  submissions: 'offline_submissions',
}
const { resolveAvatarOptions } = require('./avatar-options')

const DEMO_PROFILE = {
  inProgress: [
    { id: 1, name: '要点不全不准', subject: '申论', status: 'in_progress', progress: 60 },
    { id: 5, name: '对策推导困难', subject: '申论', status: 'in_progress', progress: 30 },
  ],
  completed: [
    { id: 2, name: '提炼转述困难', subject: '申论', status: 'completed', progress: 100 },
    { id: 4, name: '公文结构不清', subject: '申论', status: 'completed', progress: 100 },
    { id: 6, name: '作文立意不准', subject: '申论', status: 'completed', progress: 100 },
  ],
}

function getAppSafe() {
  try {
    return getApp()
  } catch (err) {
    return null
  }
}

function isOfflineMode() {
  const app = getAppSafe()
  if (!app || !app.globalData) return false
  return !!app.globalData.offlineMode
}

function createDemoSession(studentId) {
  return {
    token: `offline-demo-token-${studentId || 1}`,
    id: studentId || 1,
    name: '张三',
    status: 'active',
  }
}

function mockRequest(options = {}) {
  if (options.url === '/api/student/profile') {
    return Promise.resolve({
      ...DEMO_PROFILE,
      profileInfo: {
        name: '张三',
        phone: '13800000000',
        avatarUrl: '/assets/avatars/avatar-01.png',
      },
    })
  }

  if (options.url === '/api/student/avatar-presets') {
    return Promise.resolve(resolveAvatarOptions())
  }

  if (options.url === '/api/student/profile/avatar' && options.method === 'PATCH') {
    return Promise.resolve({
      ok: true,
      avatarUrl: String((options.data || {}).avatarUrl || '').trim(),
    })
  }

  return Promise.resolve(options.mockData || {})
}

function readSubmissions() {
  return wx.getStorageSync(STORAGE_KEYS.submissions) || []
}

function writeSubmissions(list) {
  wx.setStorageSync(STORAGE_KEYS.submissions, list)
}

function completeLocalUpload(payload = {}) {
  const list = readSubmissions()
  const id = Date.now()
  list.unshift({
    id,
    createdAt: new Date().toISOString(),
    ...payload,
  })
  writeSubmissions(list)
  return { ok: true, id }
}

module.exports = {
  completeLocalUpload,
  createDemoSession,
  isOfflineMode,
  mockRequest,
}
