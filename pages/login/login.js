const app = getApp()

// 开发阶段测试账号（对应数据库 seed 数据）
// studentId 1 = 张三（正常在读）
// studentId 2 = 李四（请假中）
// studentId 3 = 王五（异常）
const DEV_STUDENT_ID = 1

Page({
  data: {
    productName: '学习助手',
    slogan: '专业备考，精准提分',
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

  // ── 表单校验 ─────────────────────────────────────────────
  _validate() {
    const { phone, password, confirmPassword, activeTab } = this.data
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return false
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return false
    }
    if (activeTab === 'register' && password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return false
    }
    return true
  },

  // ── 提交（登录 / 注册）────────────────────────────────────
  submit() {
    if (!this._validate()) return
    this._devLogin(DEV_STUDENT_ID)
  },

  // ── 开发阶段登录（绕过微信鉴权）─────────────────────────
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
          // 存 token，后续请求用
          wx.setStorageSync('student_token', data.token)
          wx.setStorageSync('student_info', {
            id: data.id,
            name: data.name,
            status: data.status
          })
          // 更新全局状态
          app.globalData.token = data.token
          app.globalData.isEnrolled = data.status !== 'new'
          app.globalData.userProfile.name = data.name

          wx.switchTab({ url: '/pages/home/home' })
        } else {
          wx.showToast({ title: data.message || '登录失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '无法连接服务器，请确认后端已启动', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // ── 演示快捷入口 ──────────────────────────────────────────
  demoEnrolled() {
    this._devLogin(1)  // 张三 - 正常在读
  },

  demoNew() {
    this._devLogin(3)  // 王五 - 新学员流程
  }
})
