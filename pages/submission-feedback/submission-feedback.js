const {
  fetchLatestFeedbackSubmission,
  persistLearningPathTask,
} = require('../../utils/learning-path')
const { openStudentReviewedSubmission } = require('../../utils/student-api')
const { normalizeStudyOptions } = require('../../utils/study-route')

Page({
  data: {
    title: '批改反馈',
    pointName: '',
    stageKey: '',
    taskId: '',
    loading: true,
    graded: false,
    submission: null,
    emptyText: '',
  },

  async onLoad(options) {
    this.app = getApp()
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: '',
    })

    const title = decodeURIComponent(options.title || '批改反馈')
    const pointName = this.studyOptions.pointName
    const stageKey = options.stageKey || ''
    const taskId = options.taskId || ''

    this.setData({
      title,
      pointName,
      stageKey,
      taskId,
    })

    wx.setNavigationBarTitle({
      title,
    })

    await this.loadFeedback()
  },

  async loadFeedback() {
    this.setData({
      loading: true,
      emptyText: '',
    })

    try {
      const submission = await fetchLatestFeedbackSubmission(
        this.data.pointName,
        this.data.stageKey,
        this.data.taskId,
        this.app
      )

      if (!submission) {
        this.setData({
          loading: false,
          graded: false,
          submission: null,
          emptyText: '还没有找到这次作业的提交记录',
        })
        return
      }

      this.setData({
        loading: false,
        graded: !!submission.graded,
        submission,
        emptyText: submission.graded ? '' : '老师正在批改中，稍后再来看看',
      })

      if (submission.graded) {
        try {
          await persistLearningPathTask(
            this.data.pointName,
            this.data.stageKey,
            this.data.taskId,
            {},
            this.app
          )
        } catch (_error) {}
      }
    } catch (_error) {
      this.setData({
        loading: false,
        graded: false,
        submission: null,
        emptyText: '加载失败，请稍后重试',
      })
    }
  },

  onRefreshTap() {
    void this.loadFeedback()
  },

  onAskTeacherTap() {
    wx.switchTab({
      url: '/pages/chat/chat',
    })
  },

  onOpenReviewedPdfTap() {
    const submission = this.data.submission || {}
    if (!submission.id || !submission.hasReviewedFile) {
      wx.showToast({
        title: '老师暂未上传批改 PDF',
        icon: 'none',
      })
      return
    }

    wx.showLoading({
      title: '打开中',
      mask: true,
    })

    openStudentReviewedSubmission(submission.id, this.app)
      .catch(() => {
        wx.showToast({
          title: '打开失败，请稍后重试',
          icon: 'none',
        })
      })
      .finally(() => {
        wx.hideLoading()
      })
  },
})
