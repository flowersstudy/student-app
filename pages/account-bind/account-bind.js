const { bindStudentPhone, ensureSilentLogin } = require('../../utils/auth')

const TAB_BAR_PAGES = [
  '/pages/home/home',
  '/pages/chat/chat',
  '/pages/study-square/study-square',
  '/pages/results/results',
]

function navigateByUrl(url = '') {
  if (!url) {
    wx.switchTab({ url: '/pages/chat/chat' })
    return
  }

  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  const pagePath = normalizedUrl.split('?')[0]

  if (TAB_BAR_PAGES.includes(pagePath)) {
    wx.switchTab({ url: pagePath })
    return
  }

  wx.redirectTo({ url: normalizedUrl })
}

Page({
  data: {
    phone: '',
    submitting: false,
    redirect: '/pages/chat/chat',
  },

  onLoad(options) {
    const redirect = options.redirect ? decodeURIComponent(options.redirect) : '/pages/chat/chat'
    this.setData({ redirect })

    ensureSilentLogin(getApp()).catch(() => {})
  },

  onPhoneInput(e) {
    this.setData({
      phone: (e.detail.value || '').replace(/\D/g, '').slice(0, 11),
    })
  },

  async submitBind() {
    const phone = (this.data.phone || '').trim()

    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确手机号',
        icon: 'none',
      })
      return
    }

    this.setData({ submitting: true })

    try {
      await bindStudentPhone(phone, getApp())
      wx.showToast({
        title: '绑定成功',
        icon: 'success',
      })

      setTimeout(() => {
        navigateByUrl(this.data.redirect)
      }, 400)
    } catch (error) {
      wx.showToast({
        title: (error && error.message) || '绑定失败，请稍后重试',
        icon: 'none',
      })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
