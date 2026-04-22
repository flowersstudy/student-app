const { uiIcons } = require('../../../utils/ui-icons')
const { appendStudyQuery, normalizeStudyOptions } = require('../../../utils/study-route')
const { uploadStudentSubmission } = require('../../../utils/student-api')

Page({
  data: {
    uiIcons,
    assignment: {
      title: '第 2 周刷题作业提交',
      dueText: '今日 23:59 截止',
      pointName: '对策推导困难',
      teacher: '李老师',
      weekLabel: '第 2 周',
      taskLabel: '对策专项作业',
    },
    statusChips: ['支持图片提交', '支持 PDF / Word', 'AI 先初评'],
    uploadedFiles: [],
    remark: '',
    aiReview: null,
    submitMeta: null,
    teacherFollowUp: {
      title: '老师复看',
      desc: 'AI 只做初步判断，老师会结合你的作答内容和备注继续看重点问题。',
      eta: '通常 24 小时内补充老师点评',
    },
  },

  onLoad(options) {
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: this.data.assignment.pointName,
    })
    this.setData({
      assignment: {
        ...this.data.assignment,
        pointName: this.studyOptions.pointName,
      },
    })
  },

  chooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      success: (res) => {
        const nextFiles = res.tempFilePaths.map((path, index) => ({
          id: `${Date.now()}-${index}`,
          name: `作业图片-${this.data.uploadedFiles.length + index + 1}.jpg`,
          path,
          kind: 'image',
        }))
        this.setData({
          uploadedFiles: [...this.data.uploadedFiles, ...nextFiles],
        })
      },
    })
  },

  chooseFile() {
    wx.chooseMessageFile({
      count: 9,
      type: 'file',
      extension: ['pdf', 'doc', 'docx'],
      success: (res) => {
        const nextFiles = res.tempFiles.map((file, index) => ({
          id: `${Date.now()}-f-${index}`,
          name: file.name,
          path: file.path,
          kind: 'file',
        }))
        this.setData({
          uploadedFiles: [...this.data.uploadedFiles, ...nextFiles],
        })
      },
    })
  },

  removeFile(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      uploadedFiles: this.data.uploadedFiles.filter((item) => item.id !== id),
    })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  async submitHomework() {
    if (this.data.uploadedFiles.length === 0) {
      wx.showToast({ title: '请先上传作业', icon: 'none' })
      return
    }

    // 先弹订阅消息授权，让老师批改完后能通知到学生
    try {
      const templateId = 'PGKtvst6aqQRRyGe1aHwnArQ3-dk-VKDYUFO7VNadLo'
      await new Promise((resolve) => {
        wx.requestSubscribeMessage({
          tmplIds: [templateId],
          complete: resolve,
        })
      })
    } catch (_) {}

    wx.showLoading({ title: '提交中...', mask: true })

    const pointName = this.studyOptions.pointName || this.data.assignment.pointName
    const app = getApp()
    const studentName = ((app.globalData || {}).userProfile || {}).name || ''
    const submissions = []

    try {
      for (const file of this.data.uploadedFiles) {
        const result = await uploadStudentSubmission(file, {
          studentName,
          reviewType: 'practice-homework',
          checkpoint: pointName,
          pointName,
          stageKey: this.studyOptions.stageKey || 'practice',
          taskId: this.studyOptions.taskId || '',
          priority: 'normal',
          submittedNormal: 'true',
        }, app)
        submissions.push(result)
      }

      wx.hideLoading()
      this.setData({
        submitMeta: {
          submittedAt: '刚刚提交',
          countText: `共提交 ${submissions.length} 个文件`,
        },
      })
      wx.showToast({ title: '提交成功', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '提交失败，请重试', icon: 'none' })
    }
  },

  goReview() {
    wx.navigateTo({
      url: appendStudyQuery('/pkg-practice/pages/practice-review/practice-review', this.studyOptions),
    })
  },
})
