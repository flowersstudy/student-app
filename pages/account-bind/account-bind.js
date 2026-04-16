const { bindStudentPhone, ensureSilentLogin, hasBoundStudentPhone, saveLocalStudentPhone } = require('../../utils/auth')

const TAB_BAR_PAGES = [
  '/pages/home/home',
  '/pages/chat/chat',
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

const PAGE_COPY = {
  launch: {
    navTitle: '手机号登录',
    title: '首次进入先登录手机号',
    desc: '第一次进入小程序时，先填写你的手机号。登录成功后会自动进入首页，后续无需重复填写。',
    label: '手机号',
    placeholder: '请输入常用手机号',
    submitText: '登录并进入',
    hint: '仅首次需要填写一次，后续会自动识别你的账号。',
  },
  chat: {
    navTitle: '绑定已购课账号',
    title: '已购课学员先绑定一下账号',
    desc: '绑定成功后，聊天消息会跟你的正式学习档案关联起来，后续就不用重复操作了。',
    label: '购课手机号',
    placeholder: '请输入报名时使用的手机号',
    submitText: '绑定并继续发送',
    hint: '如果不是已购课学员，也可以先返回继续浏览咨询内容。',
  },
}

function shouldFallbackToLocalLogin(error) {
  const message = error && error.message ? String(error.message) : ''
  return /学生不存在|未找到|请求失败|network|fail|超时|timeout|ECONN|ENOTFOUND/i.test(message)
}

Page({
  data: {
    phone: '',
    submitting: false,
    wechatSubmitting: false,
    redirect: '/pages/home/home',
    mode: 'launch',
    pageCopy: PAGE_COPY.launch,
  },

  onLoad(options) {
    const mode = options.mode === 'chat' ? 'chat' : 'launch'
    const redirect = options.redirect
      ? decodeURIComponent(options.redirect)
      : mode === 'chat'
        ? '/pages/chat/chat'
        : '/pages/home/home'

    this.setData({
      redirect,
      mode,
      pageCopy: PAGE_COPY[mode],
    })
    wx.setNavigationBarTitle({
      title: PAGE_COPY[mode].navTitle,
    })

    ensureSilentLogin(getApp())
      .then((session) => {
        if (hasBoundStudentPhone(session)) {
          navigateByUrl(redirect)
        }
      })
      .catch(() => {})
  },

  onPhoneInput(e) {
    this.setData({
      phone: (e.detail.value || '').replace(/\D/g, '').slice(0, 11),
    })
  },

  async handleGetPhoneNumber(e) {
    if (this.data.submitting || this.data.wechatSubmitting) {
      return
    }

    const detail = (e && e.detail) || {}
    const phoneCode = detail.code || ''
    const errMsg = detail.errMsg || ''

    if (!phoneCode) {
      const isUserCancel = /deny|cancel|fail/i.test(errMsg)
      wx.showToast({
        title: isUserCancel ? '你已取消微信手机号授权' : '暂未获取到微信手机号，请手动输入',
        icon: 'none',
      })
      return
    }

    this.setData({ wechatSubmitting: true })

    try {
      await bindStudentPhone({
        phoneCode,
        code: phoneCode,
      }, getApp())

      wx.showToast({
        title: this.data.mode === 'launch' ? '登录成功' : '绑定成功',
        icon: 'success',
      })

      setTimeout(() => {
        navigateByUrl(this.data.redirect)
      }, 400)
    } catch (error) {
      wx.showToast({
        title: (error && error.message) || '微信手机号登录暂不可用，请先手动输入',
        icon: 'none',
      })
    } finally {
      this.setData({ wechatSubmitting: false })
    }
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
      if (this.data.mode === 'launch') {
        saveLocalStudentPhone(phone, getApp())
        wx.showToast({
          title: '登录成功',
          icon: 'success',
        })

        setTimeout(() => {
          navigateByUrl(this.data.redirect)
        }, 400)
        return
      }

      await bindStudentPhone(phone, getApp())
      wx.showToast({
        title: this.data.mode === 'launch' ? '登录成功' : '绑定成功',
        icon: 'success',
      })

      setTimeout(() => {
        navigateByUrl(this.data.redirect)
      }, 400)
    } catch (error) {
      if (this.data.mode === 'launch' && shouldFallbackToLocalLogin(error)) {
        saveLocalStudentPhone(phone, getApp())
        wx.showToast({
          title: '登录成功',
          icon: 'success',
        })

        setTimeout(() => {
          navigateByUrl(this.data.redirect)
        }, 400)
        return
      }

      wx.showToast({
        title: (error && error.message) || (this.data.mode === 'launch' ? '登录失败，请稍后重试' : '绑定失败，请稍后重试'),
        icon: 'none',
      })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
