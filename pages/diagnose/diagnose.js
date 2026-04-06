Page({
  data: {
    step1: { status: '已完成' },
    step2: {
      status: '待电话沟通',   // '待约时间' | '待电话沟通' | '已完成'
      scheduledTime: ''
    },
    step3: {
      status: '去答题',    // '组卷中' | '去答题'
      fileUrl: '',
      fileName: '诊断试卷.pdf',
      fileOpened: false,
      answerUploaded: false
    },
    step4: {
      status: '去反馈',    // '待听课' | '去反馈'
      feedback: '',
      feedbackSubmitted: false,
      uploadedFiles: []
    },
    step5: {
      status: '待上课',    // '待约课' | '待上课' | '已完成'
      scheduledTime: ''
    }
  },

  // Step 2: 约电话时间（待接入老师日程表）
  scheduleCall() {
    wx.showToast({ title: '约时间功能开发中', icon: 'none' })
  },

  // Step 3: 打开试卷 PDF
  openPaper() {
    const { fileUrl, fileName } = this.data.step3
    if (!fileUrl) {
      wx.showToast({ title: '试卷暂未上传', icon: 'none' })
      return
    }
    this.setData({ 'step3.fileOpened': true })
    wx.downloadFile({
      url: fileUrl,
      success: (res) => wx.openDocument({ filePath: res.tempFilePath, showMenu: true })
    })
  },

  // Step 3: 上传答案
  uploadAnswer() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: () => {
        this.setData({ 'step3.answerUploaded': true })
        wx.showToast({ title: '答案已上传', icon: 'success' })
      }
    })
  },

  // Step 4: 听课反馈输入
  onFeedbackInput(e) {
    this.setData({ 'step4.feedback': e.detail.value })
  },

  // Step 4: 上传文档
  uploadFeedbackFile() {
    wx.chooseMessageFile({
      count: 9,
      type: 'file',
      success: (res) => {
        const newFiles = res.tempFiles.map(f => ({ name: f.name, path: f.path }))
        const merged = [...this.data.step4.uploadedFiles, ...newFiles]
        this.setData({ 'step4.uploadedFiles': merged })
      }
    })
  },

  // Step 4: 删除已选文档
  removeFeedbackFile(e) {
    const idx = e.currentTarget.dataset.index
    const files = [...this.data.step4.uploadedFiles]
    files.splice(idx, 1)
    this.setData({ 'step4.uploadedFiles': files })
  },

  // Step 4: 提交反馈（待接入后端同步）
  submitFeedback() {
    if (!this.data.step4.feedback.trim() && this.data.step4.uploadedFiles.length === 0) {
      wx.showToast({ title: '请填写反馈或上传文档', icon: 'none' })
      return
    }
    this.setData({ 'step4.feedbackSubmitted': true })
    wx.showToast({ title: '反馈已提交', icon: 'success' })
    // TODO: 后端同步文字 + 文件
  },

  // Step 5: 约课（待接入老师日程表）
  scheduleCourse() {
    wx.showToast({ title: '约课功能开发中', icon: 'none' })
  },

  // Step 5: 查看回放
  viewPlayback() {
    wx.showToast({ title: '回放加载中...', icon: 'loading' })
  },

  // Step 6: 查看报告
  viewReport() {
    wx.navigateTo({ url: '/pages/diagnose-report/diagnose-report' })
  }
})
