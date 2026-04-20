const { syncCustomTabBar } = require('../../utils/custom-tab-bar')
const { submitStudentFeedback } = require('../../utils/student-api')

const FEEDBACK_DRAFT_KEY = 'teacher_feedback_draft'
const MAX_IMAGE_COUNT = 6

function inferMimeType(filePath = '') {
  const normalized = String(filePath || '').toLowerCase()
  if (normalized.endsWith('.png')) return 'image/png'
  if (normalized.endsWith('.webp')) return 'image/webp'
  if (normalized.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

function readFileAsBase64(filePath = '') {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (res) => resolve(res.data || ''),
      fail: reject,
    })
  })
}

Page({
  data: {
    title: '“找老师”功能正在完善中',
    desc: '“找老师”功能开发中，以后和老师的对话会在这里。你可以先通过这里告诉我们你对整个小程序的使用感受、想补充的功能，或直接反馈页面问题。',
    feedbackTitle: '聊聊你的使用感受吧',
    feedbackHint: '无论是页面设计、操作流程、功能需求，还是使用时出现的卡顿、加载慢、页面不流畅等情况，都欢迎告诉我们。你的反馈会帮助我们把小程序做得更好。',
    placeholder: '写下你的真实感受，想到什么都可以告诉我们',
    submitText: '提交反馈',
    feedbackText: '',
    images: [],
    submitting: false,
  },

  onLoad() {
    const feedbackText = wx.getStorageSync(FEEDBACK_DRAFT_KEY) || ''

    this.setData({
      feedbackText,
    })
  },

  onShow() {
    syncCustomTabBar(this, 'chat')

    wx.setNavigationBarTitle({
      title: '找老师',
    })
  },

  handleInput(event) {
    const feedbackText = event.detail.value || ''

    this.setData({
      feedbackText,
    })

    wx.setStorageSync(FEEDBACK_DRAFT_KEY, feedbackText)
  },

  chooseImage() {
    const remainCount = Math.max(0, MAX_IMAGE_COUNT - this.data.images.length)
    if (remainCount <= 0) {
      wx.showToast({
        title: `最多上传 ${MAX_IMAGE_COUNT} 张图片`,
        icon: 'none',
      })
      return
    }

    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      success: (res) => {
        const nextImages = (res.tempFilePaths || []).map((path, index) => ({
          id: `${Date.now()}-${index}`,
          path,
        }))

        this.setData({
          images: [...this.data.images, ...nextImages],
        })
      },
    })
  },

  previewImage(event) {
    const { url } = event.currentTarget.dataset
    const urls = this.data.images.map((item) => item.path)

    wx.previewImage({
      current: url,
      urls,
    })
  },

  removeImage(event) {
    const { id } = event.currentTarget.dataset

    this.setData({
      images: this.data.images.filter((item) => item.id !== id),
    })
  },

  async buildAttachments() {
    const files = Array.isArray(this.data.images) ? this.data.images.slice(0, MAX_IMAGE_COUNT) : []

    return Promise.all(files.map(async (item, index) => ({
      name: `找老师反馈截图-${index + 1}${inferMimeType(item.path) === 'image/png' ? '.png' : '.jpg'}`,
      mimeType: inferMimeType(item.path),
      base64: await readFileAsBase64(item.path),
    })))
  },

  async handleSubmit() {
    const feedbackText = (this.data.feedbackText || '').trim()

    if (!feedbackText && this.data.images.length === 0) {
      wx.showToast({
        title: '请先填写反馈，或上传截图',
        icon: 'none',
      })
      return
    }

    if (this.data.submitting) return

    this.setData({ submitting: true })

    try {
      const attachments = await this.buildAttachments()
      await submitStudentFeedback({
        source: 'find_teacher',
        title: '找老师反馈',
        content: feedbackText,
        attachments,
      }, getApp())

      wx.removeStorageSync(FEEDBACK_DRAFT_KEY)
      this.setData({
        feedbackText: '',
        images: [],
      })

      wx.showToast({
        title: '反馈已提交',
        icon: 'success',
      })
    } catch (error) {
      wx.showToast({
        title: (error && error.message) || '提交失败，请稍后再试',
        icon: 'none',
      })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
