const { loginStudentByAccount } = require('../../utils/auth')

function showToast(title) {
  wx.showToast({
    title,
    icon: 'none',
  })
}

Page({
  data: {
    account: '',
    password: '',
    agreed: false,
    submitting: false,
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

  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed,
    })
  },

  handleForgotPassword() {
    showToast('忘记密码流程待接入')
  },

  handleRegister() {
    showToast('注册流程待接入')
  },

  handleAgreementTap(event) {
    const type = event.currentTarget.dataset.type
    showToast(type === 'privacy' ? '隐私政策待补充' : '用户协议待补充')
  },

  async handleLogin() {
    const account = String(this.data.account || '').trim()
    const password = String(this.data.password || '').trim()

    if (!account) {
      showToast('请输入账号')
      return
    }

    if (!password) {
      showToast('请输入密码')
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
      await loginStudentByAccount({
        account,
        password,
      }, getApp())

      wx.switchTab({
        url: '/pages/home/home',
      })
    } catch (error) {
      showToast((error && error.message) || '登录失败')
    } finally {
      this.setData({
        submitting: false,
      })
    }
  },
})
