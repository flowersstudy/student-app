const { loginStudentByAccount, registerStudentByAccount } = require('../../utils/auth')

function showToast(title) {
  wx.showToast({
    title,
    icon: 'none',
  })
}

Page({
  data: {
    mode: 'login',
    name: '',
    account: '',
    password: '',
    confirmPassword: '',
    agreed: false,
    submitting: false,
  },

  handleNameInput(event) {
    this.setData({
      name: event.detail.value,
    })
  },

  handleAccountInput(event) {
    this.setData({
      account: event.detail.value,
    })
  },

  handlePasswordInput(event) {
    this.setData({
      password: event.detail.value,
    })
  },

  handleConfirmPasswordInput(event) {
    this.setData({
      confirmPassword: event.detail.value,
    })
  },

  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed,
    })
  },

  setMode(mode) {
    this.setData({
      mode,
      name: '',
      account: '',
      password: '',
      confirmPassword: '',
      submitting: false,
    })
  },

  handleForgotPassword() {
    showToast('忘记密码流程待接入')
  },

  handleRegister() {
    this.setMode('register')
  },

  handleBackToLogin() {
    this.setMode('login')
  },

  handleAgreementTap(event) {
    const type = event.currentTarget.dataset.type
    showToast(type === 'privacy' ? '隐私政策待补充' : '用户协议待补充')
  },

  async handleSubmit() {
    const mode = this.data.mode
    const name = String(this.data.name || '').trim()
    const account = String(this.data.account || '').trim()
    const password = String(this.data.password || '').trim()
    const confirmPassword = String(this.data.confirmPassword || '').trim()

    if (mode === 'register' && !name) {
      showToast('请输入姓名')
      return
    }

    if (!account) {
      showToast('请输入账号')
      return
    }

    if (!password) {
      showToast('请输入密码')
      return
    }

    if (mode === 'register' && account.length < 4) {
      showToast('账号至少 4 位')
      return
    }

    if (mode === 'register' && password.length < 6) {
      showToast('密码至少 6 位')
      return
    }

    if (mode === 'register' && password !== confirmPassword) {
      showToast('两次密码不一致')
      return
    }

    if (!this.data.agreed) {
      showToast('请先勾选协议')
      return
    }

    this.setData({
      submitting: true,
    })

    try {
      if (mode === 'register') {
        await registerStudentByAccount({
          name,
          account,
          password,
        }, getApp())
      } else {
        await loginStudentByAccount({
          account,
          password,
        }, getApp())
      }

      wx.switchTab({
        url: '/pages/home/home',
      })
    } catch (error) {
      showToast((error && error.message) || (mode === 'register' ? '注册失败' : '登录失败'))
    } finally {
      this.setData({
        submitting: false,
      })
    }
  },
})
