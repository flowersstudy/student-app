const { bindPathCountdown, formatCountdownParts } = require('../../../utils/path-countdown')
const { finishCountdownStudySession, startCountdownStudySession } = require('../../../utils/countdown-study-session')
const {
  createTimerPickerHours,
  createTimerPickerMinutes,
  minutesToPickerValue,
  pickerValueToMinutes,
} = require('../../../utils/timer-picker')
const {
  buildLearningPathStage,
  completeLearningPathTask,
  openLearningPathFeedback,
  openTeacherTab,
  persistLearningPathTask,
  submitLearningPathUploadTask,
  syncLearningPathFromServer,
} = require('../../../utils/learning-path')
const { buildLearningTaskVideoRoute } = require('../../../utils/polyv-video')
const { buildStageUrl } = require('../../../utils/path-stage-routes')
const { normalizeStudyOptions } = require('../../../utils/study-route')

const EXAM_RECOMMENDED_MINUTES = 60
const EXAM_DURATION = EXAM_RECOMMENDED_MINUTES * 60
const TIMER_PICKER_HOURS = createTimerPickerHours()
const TIMER_PICKER_MINUTES = createTimerPickerMinutes()

function normalizeMinutes(value, fallbackMinutes = EXAM_RECOMMENDED_MINUTES) {
  const minutes = parseInt(value, 10)
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return fallbackMinutes
  }

  return Math.min(minutes, 999)
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

const pageConfig = {
  data: {
    pointName: '当前卡点',
    stageIndex: '4 / 6',
    stageName: '测试',
    stageSubtitle: '按顺序完成测试任务。',
    sectionTitle: '测试路径',
    pathItems: [],
    pathCountdownRunning: false,
    pathCountdownFinished: false,
    recommendedMinutes: EXAM_RECOMMENDED_MINUTES,
    timerPickerHours: TIMER_PICKER_HOURS,
    timerPickerMinutes: TIMER_PICKER_MINUTES,
    timerPickerRange: [TIMER_PICKER_HOURS, TIMER_PICKER_MINUTES],
    timerPickerValue: minutesToPickerValue(EXAM_RECOMMENDED_MINUTES),
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
      title: '测试',
    })

    this.loadRemoteStage(() => {
      this.resetPathCountdown()
    })
  },

  async loadRemoteStage(callback) {
    const pointName = (this.studyOptions && this.studyOptions.pointName) || this.data.pointName
    try {
      await syncLearningPathFromServer(pointName, this.app)
    } catch (_error) {}
    this.refreshStage(callback)
  },

  onUnload() {
    finishCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    })
    this.clearPathCountdown()
  },

  onHide() {
    finishCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    })
    this.pausePathCountdown()
  },

  refreshStage(callback) {
    const stage = buildLearningPathStage('exam', this.data.pointName)
    const remainingSeconds = typeof this.getPathCountdownRemainingSeconds === 'function'
      ? this.getPathCountdownRemainingSeconds()
      : EXAM_DURATION
    const pathItems = ((((stage.groups || [])[0] || {}).items) || []).map((item) => (
      item.id === 'exam_countdown'
        ? {
            ...item,
            countdownParts: formatCountdownParts(remainingSeconds),
            countdownEditable: true,
          }
        : item
    ))

    this.setData({
      stageIndex: stage.stageIndex,
      stageName: stage.stageName,
      stageSubtitle: stage.stageSubtitle,
      sectionTitle: stage.sectionTitle,
      pathItems,
    }, () => {
      if (typeof this.updatePathCountdown === 'function') {
        this.updatePathCountdown()
      }
      if (typeof callback === 'function') {
        callback()
      }
    })
  },

  findTaskById(taskId = '') {
    return (this.data.pathItems || []).find((item) => item.id === taskId) || null
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
        const result = await submitLearningPathUploadTask(this.data.pointName, 'exam', taskId, this.app)
        if (!result.files.length) return

        this.refreshStage()
        wx.showToast({
          title: `已上传 ${result.files.length} 个 PDF`,
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
        stageKey: 'exam',
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
        wx.navigateTo({ url })
        return
      }

      wx.showToast({
        title: '视频待老师上传',
        icon: 'none',
      })
      return
    }

    if (actionType === 'report') {
      const reportUrl = buildStageUrl('report', this.studyOptions && this.studyOptions.pointId, this.data.pointName)
      if (reportUrl) {
        wx.navigateTo({ url: reportUrl })
        return
      }
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

  onCountdownPickerConfirm(e) {
    finishCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    })
    this.pausePathCountdown()
    const minutes = normalizeMinutes(pickerValueToMinutes(e.detail.value))
    this.setPathCountdownDuration(minutes * 60, true)
    this.setData({
      timerPickerValue: minutesToPickerValue(minutes),
    })
  },

  async completeExamCountdownAfterFinish() {
    const timerTask = this.findTaskById('exam_countdown')
    if (!timerTask || timerTask.status !== 'current') {
      return
    }

    const completedAt = new Date().toISOString()
    completeLearningPathTask(this.data.pointName, 'exam', 'exam_countdown', {
      completedAt,
    })
    try {
      await persistLearningPathTask(this.data.pointName, 'exam', 'exam_countdown', {
        completedAt,
      }, this.app)
    } catch (_error) {}
    this.refreshStage()
  },

  async togglePathCountdown() {
    if (this.data.pathCountdownFinished) return

    if (this.data.pathCountdownRunning) {
      finishCountdownStudySession(this, {
        remainingSeconds: this.getPathCountdownRemainingSeconds(),
      })
      this.pausePathCountdown()
      return
    }

    startCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    }, {
      sessionType: 'exam',
      courseId: (page) => page.studyOptions && page.studyOptions.courseId,
      studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
      pointName: (page) => page.studyOptions && page.studyOptions.pointName,
    })
    this.startPathCountdown()
  },

  resetCurrentCountdown() {
    finishCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    })
    this.resetPathCountdown()
  },
}

bindPathCountdown(pageConfig, {
  durationSeconds: EXAM_DURATION,
  runningDesc: '当前测试剩余时间',
  finishedDesc: '测试计时已结束',
  readyDesc: '设置好时间后开始计时',
  onComplete(page) {
    finishCountdownStudySession(page, {
      remainingSeconds: 0,
    }, {
      force: true,
    })
    void page.completeExamCountdownAfterFinish()
  },
})

Page(pageConfig)


