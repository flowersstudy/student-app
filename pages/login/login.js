const app = getApp()
const { createDemoSession, isOfflineMode } = require('../../utils/offline')

const DEV_STUDENT_ID = 1

Page({
  data: {
    productName: '步知1v1',
    slogan: '做更好的申论在线教育平台',
    activeTab: 'login',
    phone: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    loading: false
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab, password: '', confirmPassword: '' })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value })
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  _validate() {
    const { phone, password, confirmPassword, activeTab } = this.data
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return false
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少 6 位', icon: 'none' })
      return false
    }
    if (activeTab === 'register' && password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return false
    }
    return true
  },

  submit() {
    if (!this._validate()) return
    if (isOfflineMode()) {
      this._completeLogin(createDemoSession(DEV_STUDENT_ID))
      return
    }
    this._devLogin(DEV_STUDENT_ID)
  },

  _completeLogin(data) {
    wx.setStorageSync('student_token', data.token)
    wx.setStorageSync('student_info', {
      id: data.id,
      name: data.name,
      status: data.status
    })
    app.globalData.token = data.token
    app.globalData.isEnrolled = data.status !== 'new'
    app.globalData.userProfile.name = data.name
    wx.redirectTo({ url: '/pages/entry-hub/entry-hub' })
  },

  _devLogin(studentId) {
    this.setData({ loading: true })
    wx.request({
      url: `${app.globalData.serverBase}/api/auth/student/dev-login`,
      method: 'POST',
      data: { studentId },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        const data = res.data
        if (data && data.token) {
          this._completeLogin(data)
        } else {
          wx.showToast({ title: data.message || '登录失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '已切换离线演示模式', icon: 'none' })
        this._completeLogin(createDemoSession(studentId))
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  }
})
