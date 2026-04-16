const { uiIcons } = require('../../../utils/ui-icons')
const { completeLocalUpload } = require('../../../utils/offline')
const { finishStudySession, startStudySession } = require('../../../utils/study-session')

function buildAiReview(uploadedFiles = []) {
  const hasImage = uploadedFiles.some((item) => item.kind === 'image')
  const hasDoc = uploadedFiles.some((item) => item.kind === 'file')

  return {
    score: hasImage && hasDoc ? 84 : hasImage ? 80 : 78,
    summary: hasImage && hasDoc
      ? 'AI 初步判断：你本次提交材料比较完整，主要问题集中在对策表述不够具体。'
      : 'AI 初步判断：本次作答思路基本在线，但还需要再补强针对性和表达完整度。',
    strengths: [
      '已经能围绕题干核心问题展开作答',
      '对策方向基本没有明显跑偏',
    ],
    risks: [
      '部分对策还偏抽象，落地动作不够清楚',
      '个别表述更像观点，没完全写成可执行对策',
    ],
    suggestions: [
      '把“谁来做、怎么做、做到什么程度”写清楚',
      '提交后可在复盘页继续写明自己最不确定的地方',
    ],
  }
}

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
    this.studyOptions = options || {}
  },

  onShow() {
    startStudySession(this, {
      sessionType: 'practice',
      courseId: (page) => page.studyOptions && page.studyOptions.courseId,
      studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
      minDurationSec: 5,
    })
  },

  onHide() {
    finishStudySession(this)
  },

  onUnload() {
    finishStudySession(this)
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

  submitHomework() {
    if (this.data.uploadedFiles.length === 0) {
      wx.showToast({
        title: '请先上传作业',
        icon: 'none',
      })
      return
    }

    this.data.uploadedFiles.forEach((item) => {
      completeLocalUpload({
        fileName: item.name,
        reviewType: 'practice-homework',
        checkpoint: this.data.assignment.pointName,
        sourcePath: item.path,
      })
    })

    this.setData({
      aiReview: buildAiReview(this.data.uploadedFiles),
      submitMeta: {
        submittedAt: '刚刚提交',
        countText: `共提交 ${this.data.uploadedFiles.length} 个文件`,
      },
    })

    wx.showToast({
      title: '已提交并生成 AI 初评',
      icon: 'success',
    })
  },

  goReview() {
    wx.navigateTo({
      url: '/pkg-practice/pages/practice-review/practice-review',
    })
  },
})
