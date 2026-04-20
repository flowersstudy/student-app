const { ensureSilentLogin, getStudentAuthHeader } = require('./auth')
const { setStoredStudentAvatar } = require('./avatar-options')
const { getServerBase, requestWithStudentAuth } = require('./request')

function unwrapListPayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && Array.isArray(payload.value)) {
    return payload.value
  }

  return []
}

async function studentRequest({ url, method = 'GET', data = {} } = {}, appInstance, requestOptions = {}) {
  await ensureSilentLogin(appInstance)

  return requestWithStudentAuth({
    url,
    method,
    data,
    appInstance,
    ...requestOptions,
  })
}

async function fetchStudentProfile(appInstance) {
  const result = await studentRequest({
    url: '/api/student/profile',
  }, appInstance)

  const profileInfo = result && result.profileInfo ? result.profileInfo : null
  if (profileInfo && appInstance && appInstance.globalData) {
    appInstance.globalData.userProfile = {
      ...(appInstance.globalData.userProfile || {}),
      name: profileInfo.name || (appInstance.globalData.userProfile || {}).name || '',
      phone: profileInfo.phone || (appInstance.globalData.userProfile || {}).phone || '',
      gender: profileInfo.gender || (appInstance.globalData.userProfile || {}).gender || '',
      grade: profileInfo.grade || (appInstance.globalData.userProfile || {}).grade || '',
      hometown: profileInfo.hometown || (appInstance.globalData.userProfile || {}).hometown || '',
      examStatus: profileInfo.examStatus || (appInstance.globalData.userProfile || {}).examStatus || '',
      examTime: profileInfo.examTime || (appInstance.globalData.userProfile || {}).examTime || '',
      education: profileInfo.education || (appInstance.globalData.userProfile || {}).education || '',
      major: profileInfo.major || (appInstance.globalData.userProfile || {}).major || '',
      avatar: profileInfo.avatarUrl || '',
    }
    setStoredStudentAvatar(profileInfo.avatarUrl || '', appInstance)
  }

  return result
}

async function fetchStudentAvatarPresets(appInstance) {
  const result = await studentRequest({
    url: '/api/student/avatar-presets',
  }, appInstance)

  if (Array.isArray(result)) {
    return result
  }

  if (result && Array.isArray(result.items)) {
    return result.items
  }

  return []
}

async function updateStudentAvatar(avatarUrl = '', appInstance) {
  const safeAvatarUrl = String(avatarUrl || '').trim()
  if (!safeAvatarUrl) {
    throw new Error('缺少头像地址')
  }

  const result = await studentRequest({
    url: '/api/student/profile/avatar',
    method: 'PATCH',
    data: {
      avatarUrl: safeAvatarUrl,
    },
  }, appInstance)

  setStoredStudentAvatar(result && result.avatarUrl ? result.avatarUrl : safeAvatarUrl, appInstance)
  return result
}

async function fetchStudentAccessSummary(appInstance) {
  return studentRequest({
    url: '/api/student/access-summary',
  }, appInstance)
}

async function fetchStudentReviewOverview(appInstance) {
  return studentRequest({
    url: '/api/student/review-overview',
  }, appInstance, {
    clearOnUnauthorized: false,
    redirectOnUnauthorized: '',
    showErrorToast: false,
    showNetworkErrorToast: false,
  })
}

async function fetchStudentPointLearningSummary(pointName, appInstance) {
  return studentRequest({
    url: '/api/student/point-learning-summary',
    data: { pointName },
  }, appInstance)
}

async function recordStudentStudySession(data, appInstance) {
  return studentRequest({
    url: '/api/student/study-sessions',
    method: 'POST',
    data,
  }, appInstance)
}

async function fetchStudentStudyCourse(courseId, appInstance) {
  if (!courseId) {
    return null
  }

  return studentRequest({
    url: `/api/student/study/${courseId}`,
  }, appInstance)
}

async function fetchStudentPolyvPlayAuth(videoId, appInstance) {
  const safeVideoId = String(videoId || '').trim()
  if (!safeVideoId) {
    return null
  }

  return studentRequest({
    url: '/api/student/polyv/play-auth',
    data: { videoId: safeVideoId },
  }, appInstance)
}

async function fetchStudentLearningPath(pointName, appInstance) {
  if (!pointName) {
    return null
  }

  return studentRequest({
    url: '/api/student/learning-path',
    data: { pointName },
  }, appInstance)
}

async function updateStudentLearningPathTask(taskId, data = {}, appInstance) {
  if (!taskId) {
    return null
  }

  return studentRequest({
    url: `/api/student/learning-path/tasks/${taskId}`,
    method: 'PATCH',
    data,
  }, appInstance)
}

async function uploadStudentSubmission(file = {}, data = {}, appInstance) {
  if (!file || !file.path) {
    throw new Error('缺少上传文件')
  }

  await ensureSilentLogin(appInstance)

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${String(getServerBase(appInstance) || '').replace(/\/+$/, '')}/api/submissions`,
      filePath: file.path,
      name: 'file',
      header: getStudentAuthHeader(),
      formData: {
        fileName: file.name || '',
        ...data,
      },
      success: (res) => {
        let payload = {}
        try {
          payload = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {})
        } catch (error) {
          reject(new Error('上传结果解析失败'))
          return
        }

        if (res.statusCode >= 200 && res.statusCode < 300 && payload && payload.ok) {
          resolve(payload)
          return
        }

        reject(new Error((payload && (payload.message || payload.error)) || '上传失败'))
      },
      fail: reject,
    })
  })
}

async function fetchStudentSubmissions(data = {}, appInstance) {
  const result = await studentRequest({
    url: '/api/student/submissions',
    data,
  }, appInstance)

  return unwrapListPayload(result)
}

async function fetchStudentSubmission(submissionId, appInstance) {
  if (!submissionId) {
    return null
  }

  return studentRequest({
    url: `/api/student/submissions/${submissionId}`,
  }, appInstance)
}

async function openStudentReviewedSubmission(submissionId, appInstance) {
  if (!submissionId) {
    throw new Error('缺少提交记录')
  }

  await ensureSilentLogin(appInstance)
  const base = String(getServerBase(appInstance) || '').replace(/\/+$/, '')

  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: `${base}/api/student/submissions/${submissionId}/review-file`,
      header: getStudentAuthHeader(),
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300 || !res.tempFilePath) {
          reject(new Error('下载批改 PDF 失败'))
          return
        }

        wx.openDocument({
          filePath: res.tempFilePath,
          fileType: 'pdf',
          showMenu: true,
          success: resolve,
          fail: reject,
        })
      },
      fail: reject,
    })
  })
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

async function submitStudentFeedback(data, appInstance) {
  return studentRequest({
    url: '/api/student/feedbacks',
    method: 'POST',
    data,
  }, appInstance)
}

module.exports = {
  fetchStudentAccessSummary,
  fetchStudentAvatarPresets,
  fetchStudentLeaveRecords,
  fetchStudentLearningPath,
  fetchStudentNotifications,
  fetchStudentPointLearningSummary,
  fetchStudentPolyvPlayAuth,
  fetchStudentProfile,
  fetchStudentReviewOverview,
  fetchStudentSubmission,
  fetchStudentSubmissions,
  fetchStudentStudyCourse,
  updateStudentAvatar,
  openStudentReviewedSubmission,
  recordStudentStudySession,
  markAllStudentNotificationsRead,
  markStudentNotificationRead,
  studentRequest,
  submitStudentFeedback,
  submitStudentLeave,
  submitStudentMailbox,
  uploadStudentSubmission,
  updateStudentLearningPathTask,
  unwrapListPayload,
}
