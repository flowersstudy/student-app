const { ensureSilentLogin } = require('./auth')
const { requestWithStudentAuth } = require('./request')

function unwrapListPayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && Array.isArray(payload.value)) {
    return payload.value
  }

  return []
}

async function studentRequest({ url, method = 'GET', data = {} } = {}, appInstance) {
  await ensureSilentLogin(appInstance)

  return requestWithStudentAuth({
    url,
    method,
    data,
    appInstance,
  })
}

async function fetchStudentProfile(appInstance) {
  return studentRequest({
    url: '/api/student/profile',
  }, appInstance)
}

async function fetchStudentLeaveRecords(appInstance) {
  const result = await studentRequest({
    url: '/api/student/leave',
  }, appInstance)

  return unwrapListPayload(result)
}

function mapNotificationType(type = '') {
  switch (type) {
    case 'class':
      return 'class'
    case 'exam':
      return 'exam'
    case 'homework':
      return 'hw'
    case 'review':
      return 'video'
    case 'leave':
      return 'drill'
    default:
      return 'video'
  }
}

function normalizeNotification(item = {}) {
  const type = mapNotificationType(item.type)

  return {
    id: String(item.id || ''),
    type,
    originalType: item.type || 'system',
    label: item.title || '系统通知',
    desc: item.content || '',
    url: item.url || '/pages/notifications/notifications',
    pinned: type === 'class' || type === 'exam',
    read: !!item.isRead,
    createdAt: item.createdAt || '',
  }
}

async function fetchStudentNotifications(appInstance) {
  const result = await studentRequest({
    url: '/api/student/notifications',
  }, appInstance)

  return unwrapListPayload(result).map(normalizeNotification)
}

async function markStudentNotificationRead(id, appInstance) {
  if (!id) return null

  return studentRequest({
    url: `/api/student/notifications/${id}/read`,
    method: 'PATCH',
  }, appInstance)
}

async function markAllStudentNotificationsRead(appInstance) {
  return studentRequest({
    url: '/api/student/notifications/read-all',
    method: 'PATCH',
  }, appInstance)
}

async function submitStudentLeave(data, appInstance) {
  return studentRequest({
    url: '/api/student/leave',
    method: 'POST',
    data,
  }, appInstance)
}

async function submitStudentMailbox(data, appInstance) {
  return studentRequest({
    url: '/api/student/mailbox',
    method: 'POST',
    data,
  }, appInstance)
}

module.exports = {
  fetchStudentLeaveRecords,
  fetchStudentNotifications,
  fetchStudentProfile,
  markAllStudentNotificationsRead,
  markStudentNotificationRead,
  studentRequest,
  submitStudentLeave,
  submitStudentMailbox,
  unwrapListPayload,
}
