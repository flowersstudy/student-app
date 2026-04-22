const {
  buildLearningPathStage,
  completeLearningPathTask,
  openLearningPathFeedback,
  openTeacherTab,
  persistLearningPathTask,
  saveLearningPathTaskMeta,
  submitLearningPathUploadTask,
  syncLearningPathFromServer,
} = require('../../../utils/learning-path')
const { openRemoteDocument } = require('../../../utils/document-url')
const { buildLearningTaskVideoRoute } = require('../../../utils/polyv-video')
const { normalizeStudyOptions } = require('../../../utils/study-route')

function shouldPromptTheoryRating(taskId = '') {
  return /^theory_round_\d+_(recorded|explain_video)$/.test(String(taskId || '').trim())
}

function shouldAutoCompleteTheoryDocument(taskId = '') {
  const safeTaskId = String(taskId || '').trim()
  return safeTaskId === 'theory_handout'
    || /^theory_round_\d+_(handout|homework_pdf)$/.test(safeTaskId)
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

  getOrderedTasks() {
    return (this.data.theoryGroups || []).reduce((result, group) => (
      result.concat(group.items || [])
    ), [])
  },

  findCurrentTask() {
    const groups = this.data.theoryGroups || []

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const items = groups[groupIndex].items || []
      for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        if (items[itemIndex].status === 'current') {
          return items[itemIndex]
        }
      }
    }

    return null
  },

  isNextTaskAfterCurrent(currentTaskId = '', targetTaskId = '') {
    const orderedTasks = this.getOrderedTasks()
    const currentIndex = orderedTasks.findIndex((item) => item.id === currentTaskId)
    const targetIndex = orderedTasks.findIndex((item) => item.id === targetTaskId)

    if (currentIndex < 0 || targetIndex < 0) {
      return false
    }

    return targetIndex === currentIndex + 1
  },

  async markTheoryDocumentDone(taskId = '') {
    if (!shouldAutoCompleteTheoryDocument(taskId)) {
      return false
    }

    const openedAt = new Date().toISOString()
    completeLearningPathTask(this.data.pointName, 'theory', taskId, {
      result: {
        openedAt,
      },
    })

    try {
      await persistLearningPathTask(this.data.pointName, 'theory', taskId, {
        status: 'done',
        result: {
          openedAt,
        },
      }, this.app)
      return true
    } catch (_error) {
      return false
    }
  },

  async onActionTap(e) {
    const { taskId, status, actionType, title } = e.currentTarget.dataset
    if (!taskId) return
    let currentTask = this.findTaskById(taskId) || {}
    let resource = currentTask.resource || {}

    if (status === 'pending') {
      const activeTask = this.findCurrentTask() || {}
      const shouldAutoUnlockVideo = actionType === 'video'
        && activeTask.actionType === 'document'
        && shouldAutoCompleteTheoryDocument(activeTask.id)
        && this.isNextTaskAfterCurrent(activeTask.id, taskId)

      if (shouldAutoUnlockVideo) {
        const completed = await this.markTheoryDocumentDone(activeTask.id)
        this.refreshStage()

        if (completed) {
          currentTask = this.findTaskById(taskId) || currentTask
          resource = currentTask.resource || resource
        } else {
          wx.showToast({
            title: '上一份资料状态更新失败，请重试',
            icon: 'none',
          })
          return
        }
      } else {
        const shouldGuideDocumentFirst = actionType === 'video'
          && activeTask.actionType === 'document'
          && shouldAutoCompleteTheoryDocument(activeTask.id)

        wx.showToast({
          title: shouldGuideDocumentFirst
            ? `先打开${activeTask.title || '上一步资料'}`
            : '请先完成上一步任务',
          icon: 'none',
        })
        return
      }
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
        routeMode: 'player',
        autoBackOnEnded: shouldPromptTheoryRating(taskId),
      })

      if (url) {
        if (shouldPromptTheoryRating(taskId)) {
          this._pendingRatingTask = { taskId, title }
        }
        wx.navigateTo({
          url,
          fail: () => {
            wx.showToast({
              title: '页面打开失败，请重试',
              icon: 'none',
            })
          },
        })
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
        const opened = await openRemoteDocument(resource.url, {
          title,
          appInstance: this.app,
        })
        if (opened) {
          if (status !== 'done' && shouldAutoCompleteTheoryDocument(taskId)) {
            const completed = await this.markTheoryDocumentDone(taskId)
            this.refreshStage()
            wx.showToast({
              title: completed ? '已打开资料，可继续下一步' : '已打开资料，请稍后刷新',
              icon: 'none',
            })
            return
          }

          wx.showToast({
            title: '已打开资料',
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
