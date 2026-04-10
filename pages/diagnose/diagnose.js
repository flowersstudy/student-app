const DIAGNOSE_PROGRESS_KEY = 'diagnose_progress_state'

function createDefaultProgress() {
  return {
    step1: { status: '已完成' },
    step2: {
      status: '待电话沟通',
      scheduledTime: '',
    },
    step3: {
      status: '去答题',
      fileUrl: '',
      fileName: '诊断试卷.pdf',
      fileOpened: false,
      answerUploaded: false,
    },
    step4: {
      status: '去反馈',
      feedback: '',
      feedbackSubmitted: false,
      uploadedFiles: [],
    },
    step5: {
      status: '待上课',
      scheduledTime: '',
    },
  }
}

Page({
  data: createDefaultProgress(),

  onLoad() {
    const savedProgress = wx.getStorageSync(DIAGNOSE_PROGRESS_KEY)

    if (savedProgress) {
      this.setData(savedProgress)
      return
    }

    this.persistProgress()
  },

  persistProgress() {
    wx.setStorageSync(DIAGNOSE_PROGRESS_KEY, {
      step1: this.data.step1,
      step2: this.data.step2,
      step3: this.data.step3,
      step4: this.data.step4,
      step5: this.data.step5,
    })
  },

  scheduleCall() {
    wx.showToast({ title: '约时间功能开发中', icon: 'none' })
  },

  openPaper() {
    const { fileUrl } = this.data.step3

    if (!fileUrl) {
      wx.showToast({ title: '试卷暂未上传', icon: 'none' })
      return
    }

    this.setData({ 'step3.fileOpened': true }, () => this.persistProgress())

    wx.downloadFile({
      url: fileUrl,
      success: (res) => {
        wx.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
        })
      },
    })
  },

  uploadAnswer() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: () => {
        this.setData({ 'step3.answerUploaded': true }, () => this.persistProgress())
        wx.showToast({ title: '答案已上传', icon: 'success' })
      },
    })
  },

  onFeedbackInput(e) {
    this.setData({ 'step4.feedback': e.detail.value })
  },

  uploadFeedbackFile() {
    wx.chooseMessageFile({
      count: 9,
      type: 'file',
      success: (res) => {
        const newFiles = res.tempFiles.map((file) => ({ name: file.name, path: file.path }))
        const merged = [...this.data.step4.uploadedFiles, ...newFiles]
        this.setData({ 'step4.uploadedFiles': merged }, () => this.persistProgress())
      },
    })
  },

  removeFeedbackFile(e) {
    const index = e.currentTarget.dataset.index
    const files = [...this.data.step4.uploadedFiles]

    files.splice(index, 1)
    this.setData({ 'step4.uploadedFiles': files }, () => this.persistProgress())
  },

  submitFeedback() {
    if (!this.data.step4.feedback.trim() && this.data.step4.uploadedFiles.length === 0) {
      wx.showToast({ title: '请填写反馈或上传文件', icon: 'none' })
      return
    }

    this.setData({ 'step4.feedbackSubmitted': true }, () => this.persistProgress())
    wx.showToast({ title: '反馈已提交', icon: 'success' })
  },

  scheduleCourse() {
    wx.showToast({ title: '约课功能开发中', icon: 'none' })
  },

  viewPlayback() {
    wx.showToast({ title: '回放加载中...', icon: 'loading' })
  },

  viewReport() {
    wx.navigateTo({ url: '/pages/diagnose-report/diagnose-report' })
  },
})
