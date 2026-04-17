const { uiIcons } = require('../../../utils/ui-icons')
const { completeLocalUpload, isOfflineMode } = require('../../../utils/offline')
const { ensureSilentLogin, getStudentAuthHeader } = require('../../../utils/auth')
const { finishStudySession, startStudySession } = require('../../../utils/study-session')
const { normalizeStudyOptions } = require('../../../utils/study-route')

Page({
  data: {
    uiIcons,
    lessonInfo: {
      date: '2026年4月20日 周一',
      time: '15:00 - 16:00',
      teacher: '李老师',
      subject: '1v1纠偏 - 提炼转述困难',
      status: '待开始'
    },
    uploadedFiles: [],
    topicOptions: [
      { id: 1, name: '上次作业点评', selected: true },
      { id: 2, name: '错误模式分析', selected: false },
      { id: 3, name: '纠偏练习指导', selected: false }
    ],
    notes: '',
    feedback: ''
  },
  onLoad(options) {
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: this.data.lessonInfo.subject,
    })
  },
  onShow() {
    startStudySession(this, {
      sessionType: 'review',
      courseId: (page) => page.studyOptions && page.studyOptions.courseId,
      studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
      pointName: (page) => page.studyOptions && page.studyOptions.pointName,
    })
  },
  onHide() {
    finishStudySession(this)
  },
  onUnload() {
    finishStudySession(this)
  },
  selectTopic(e) {
    const id = e.currentTarget.dataset.id
    const topicOptions = this.data.topicOptions.map(t => ({
      ...t, selected: t.id === id
    }))
    this.setData({ topicOptions })
  },
  choosePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => this._doUpload(res.tempFilePaths[0], '作业图片.jpg'),
    })
  },
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf'],
      success: (res) => this._doUpload(res.tempFiles[0].path, res.tempFiles[0].name),
    })
  },
  async _doUpload(filePath, fileName) {
    const app = getApp()
    const profile = app.globalData.userProfile
    const lesson = this.data.lessonInfo
    const topic = this.data.topicOptions.find(t => t.selected) || {}

    wx.showLoading({ title: '上传中...', mask: true })
    if (isOfflineMode()) {
      const result = completeLocalUpload({
        fileName,
        studentName: profile.name,
        reviewType: 'checkpoint-correct',
        checkpoint: topic.name || lesson.subject,
        sourcePath: filePath,
      })
      wx.hideLoading()
      const uploadedFiles = [...this.data.uploadedFiles, { name: fileName, id: result.id }]
      this.setData({ uploadedFiles })
      wx.showToast({ title: '已保存到本地演示', icon: 'success' })
      return
    }

    try {
      await ensureSilentLogin(app)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '登录状态已失效，请稍后重试', icon: 'none' })
      return
    }

    wx.uploadFile({
      url: `${app.globalData.serverBase}/api/submissions`,
      filePath,
      name: 'file',
      header: getStudentAuthHeader(),
      formData: {
        studentName: profile.name,
        studentId: profile.name,
        reviewType: '卡点练习题',
        checkpoint: topic.name || lesson.subject,
        deadline: '今日 23:59',
        priority: 'normal',
        submittedNormal: 'true',
      },
      success: (res) => {
        wx.hideLoading()
        const result = JSON.parse(res.data)
        if (result.ok) {
          const uploadedFiles = [...this.data.uploadedFiles, { name: fileName, id: result.id }]
          this.setData({ uploadedFiles })
          wx.showToast({ title: '作业已提交', icon: 'success' })
        } else {
          wx.showToast({ title: result.error || '上传失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误，请重试', icon: 'none' })
      },
    })
  },
  enterCourse() {
    wx.showToast({ title: '正在进入课程...', icon: 'loading' })
  },
  viewReport() {
    wx.showToast({ title: '报告加载中...', icon: 'loading' })
  },
  viewPlayback() {
    wx.showToast({ title: '回放加载中...', icon: 'loading' })
  },
  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },
  onFeedbackInput(e) {
    this.setData({ feedback: e.detail.value })
  }
})
