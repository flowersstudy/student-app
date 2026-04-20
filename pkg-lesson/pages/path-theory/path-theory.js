const {
  buildLearningPathStage,
  openLearningPathFeedback,
  openTeacherTab,
  persistLearningPathTask,
  saveLearningPathTaskMeta,
  submitLearningPathUploadTask,
  syncLearningPathFromServer,
} = require('../../../utils/learning-path')
const { buildLearningTaskVideoRoute } = require('../../../utils/polyv-video')
const { normalizeStudyOptions } = require('../../../utils/study-route')

function shouldPromptTheoryRating(taskId = '') {
  return /^theory_round_\d+_(recorded|explain_video)$/.test(String(taskId || '').trim())
}

function openRemoteDocument(url = '', title = '资料') {
  const targetUrl = String(url || '').trim()
  if (!targetUrl) {
    return Promise.resolve(false)
  }

  wx.showLoading({
    title: '打开中',
  })

  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: targetUrl,
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300 || !res.tempFilePath) {
          reject(new Error('下载失败'))
          return
        }

        wx.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          success: () => resolve(true),
          fail: reject,
          complete: () => wx.hideLoading(),
        })
      },
      fail: (error) => {
        wx.hideLoading()
        reject(error)
      },
    })
  })
}

Page({
  data: {
    pointName: '当前卡点',
    stageIndex: '2 / 6',
    stageName: '理论',
    stageSubtitle: '按顺序完成理论学习任务。',
    theoryGroups: [],
    ratingPopupVisible: false,
    ratingTaskId: '',
    ratingTaskTitle: '',
    ratingScore: 0,
  },

  onLoad(options) {
    this.app = getApp()
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: '当前卡点',
    })

    this.setData({
      pointName: this.studyOptions.pointName,
    })

    wx.setNavigationBarTitle({
      title: '理论',
    })

    this.loadRemoteStage()
  },

  onShow() {
    if (!this._pendingRatingTask) {
      return
    }

    const pendingTask = this._pendingRatingTask
    this._pendingRatingTask = null
    const currentTask = this.findTaskById(pendingTask.taskId) || {}
    const currentScore = Number((((currentTask.meta || {}).rating || {}).score) || 0)

    this.setData({
      ratingPopupVisible: true,
      ratingTaskId: pendingTask.taskId,
      ratingTaskTitle: pendingTask.title,
      ratingScore: currentScore,
    })
  },

  async loadRemoteStage() {
    const pointName = (this.studyOptions && this.studyOptions.pointName) || this.data.pointName
    try {
      await syncLearningPathFromServer(pointName, this.app)
    } catch (_error) {}
    this.refreshStage()
  },

  refreshStage() {
    const stage = buildLearningPathStage('theory', this.data.pointName)

    this.setData({
      stageIndex: stage.stageIndex,
      stageName: stage.stageName,
      stageSubtitle: stage.stageSubtitle,
      theoryGroups: stage.groups || [],
    })
  },

  findTaskById(taskId = '') {
    const groups = this.data.theoryGroups || []

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const items = groups[groupIndex].items || []
      for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        if (items[itemIndex].id === taskId) {
          return items[itemIndex]
        }
      }
    }

    return null
  },

  async onActionTap(e) {
    const { taskId, status, actionType, title } = e.currentTarget.dataset
    if (!taskId) return
    const currentTask = this.findTaskById(taskId) || {}
    const resource = currentTask.resource || {}

    if (status === 'pending') {
      wx.showToast({
        title: '请先完成上一步任务',
        icon: 'none',
      })
      return
    }

    if (actionType === 'upload') {
      try {
        const result = await submitLearningPathUploadTask(this.data.pointName, 'theory', taskId, this.app)
        if (!result.files.length) {
          return
        }

        this.refreshStage()
        wx.showToast({
          title: `已上传 ${result.files.length} 个文件`,
          icon: 'none',
        })
      } catch (error) {
        if (error && error.errMsg && error.errMsg.includes('cancel')) {
          return
        }
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none',
        })
      }
      return
    }

    if (actionType === 'feedback') {
      await openLearningPathFeedback({
        pointName: this.data.pointName,
        stageKey: 'theory',
        taskId,
        title,
        studyOptions: this.studyOptions,
      })
      try {
        await syncLearningPathFromServer(this.data.pointName, this.app)
      } catch (_error) {}
      this.refreshStage()
      return
    }

    if (actionType === 'video') {
      const url = buildLearningTaskVideoRoute({
        pointName: this.data.pointName,
        taskId,
        title,
        videoId: resource.videoId || '',
        studyOptions: this.studyOptions,
      })

      if (url) {
        if (shouldPromptTheoryRating(taskId)) {
          this._pendingRatingTask = { taskId, title }
        }
        wx.navigateTo({ url })
        return
      }

      wx.showToast({
        title: '视频待老师上传',
        icon: 'none',
      })
      return
    }

    if (actionType === 'document') {
      try {
        const opened = await openRemoteDocument(resource.url, title)
        if (opened) {
          wx.showToast({
            title: '已打开资料，完成状态待系统确认',
            icon: 'none',
          })
          return
        }
      } catch (_error) {}

      wx.showToast({
        title: '资料待老师上传',
        icon: 'none',
      })
      return
    }

    wx.showToast({
      title: '该环节需由系统或老师确认完成',
      icon: 'none',
    })
  },

  onSecondaryActionTap(e) {
    const { status, actionType } = e.currentTarget.dataset
    if (status === 'pending') {
      wx.showToast({
        title: '请先完成上一步任务',
        icon: 'none',
      })
      return
    }

    if (actionType === 'askTeacher') {
      void openTeacherTab()
    }
  },

  onRatingStarTap(e) {
    const score = Number(e.currentTarget.dataset.score || 0)
    this.setData({
      ratingScore: score,
    })
  },

  closeRatingPopup() {
    this.setData({
      ratingPopupVisible: false,
      ratingTaskId: '',
      ratingTaskTitle: '',
      ratingScore: 0,
    })
  },

  async submitRating() {
    const { ratingTaskId, ratingScore } = this.data
    if (!ratingTaskId || !ratingScore) {
      this.closeRatingPopup()
      return
    }

    const rating = {
      score: ratingScore,
      ratedAt: new Date().toISOString(),
    }

    saveLearningPathTaskMeta(this.data.pointName, 'theory', ratingTaskId, { rating })
    try {
      await persistLearningPathTask(this.data.pointName, 'theory', ratingTaskId, {
        rating,
      }, this.app)
    } catch (_error) {}

    this.refreshStage()
    this.closeRatingPopup()
    wx.showToast({
      title: '评价已保存',
      icon: 'none',
    })
  },
})
