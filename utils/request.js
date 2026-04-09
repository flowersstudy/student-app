/**
 * 小程序统一请求工具
 * 自动携带 student_token，统一处理错误
 */

const app = getApp()
const { isOfflineMode, mockRequest } = require('./offline')

function request(options) {
  if (isOfflineMode()) {
    return mockRequest(options)
  }

  const token = wx.getStorageSync('student_token') || ''
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.serverBase + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...(options.header || {}),
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          wx.clearStorageSync()
          wx.redirectTo({ url: '/pages/login/login' })
          reject(new Error('未登录'))
        } else {
          const msg = res.data?.message || res.data?.error || '请求失败'
          wx.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络错误，请检查后端是否启动', icon: 'none' })
        reject(err)
      },
    })
  })
}

const http = {
  get: (url, data) => request({ url, method: 'GET', data }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url) => request({ url, method: 'DELETE' }),
}

module.exports = { http }
