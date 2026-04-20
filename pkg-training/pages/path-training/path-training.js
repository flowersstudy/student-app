const { finishCountdownStudySession, startCountdownStudySession } = require('../../../utils/countdown-study-session')
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
const { normalizeStudyOptions } = require('../../../utils/study-route')

function buildTimerParts(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return [
    { value: String(hours).padStart(2, '0'), label: '时' },
    { value: String(minutes).padStart(2, '0'), label: '分' },
    { value: String(seconds).padStart(2, '0'), label: '秒' },
  ]
}

function formatElapsedLabel(totalSeconds = 0) {
  return buildTimerParts(totalSeconds).map((part) => part.value).join(':')
}

function buildTrainingGroups(pathItems = []) {
  const safeItems = Array.isArray(pathItems) ? pathItems : []
  const groups = []
  const timerItems = safeItems.filter((item) => item.id === 'training_timer')
  const fallbackItems = []
  const roundMap = new Map()
  const roundLabels = {
    1: '第一题',
    2: '第二题',
    3: '第三题',
  }

  safeItems.forEach((item) => {
    if (!item || item.id === 'training_timer') return

    const matched = String(item.id || '').match(/^training_round_(\d+)_/)
    if (!matched) {
      fallbackItems.push(item)
      return
    }

    const roundNumber = Number(matched[1]) || 0
    const currentItems = roundMap.get(roundNumber) || []
    currentItems.push(item)
    roundMap.set(roundNumber, currentItems)
  })

  if (timerItems.length) {
    groups.push({
      title: '',
      items: timerItems,
    })
  }

  Array.from(roundMap.keys()).sort((left, right) => left - right).forEach((roundNumber) => {
    groups.push({
      title: roundLabels[roundNumber] || `第${roundNumber}题`,
      items: roundMap.get(roundNumber) || [],
    })
  })

  if (fallbackItems.length) {
    groups.push({
      title: '实训路径',
      items: fallbackItems,
    })
  }

  return groups
}

const pageConfig = {
  data: {
    pointName: '当前卡点',
    stageIndex: '3 / 6',
    stageName: '实训',
    stageSubtitle: '按顺序完成实训任务。',
    sectionTitle: '实训路径',
    pathItems: [],
    trainingGroups: [],
    trainingTimerRunning: false,
  },

  timerBaseElapsedSeconds: 0,
  timerStartedAt: 0,
  timerInterval: null,

  onLoad(options) {
    this.app = getApp()
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: '当前卡点',
    })

    this.setData({
      pointName: this.studyOptions.pointName,
    })

    wx.setNavigationBarTitle({
      title: '实训',
    })

    this.loadRemoteStage()
  },

  async loadRemoteStage() {
    const pointName = (this.studyOptions && this.studyOptions.pointName) || this.data.pointName
    try {
      await syncLearningPathFromServer(pointName, this.app)
    } catch (_error) {}
    this.refreshStage()
  },

  onUnload() {
    this.stopTrainingTimer({
      recordSession: true,
    })
    this.clearTrainingTimerInterval()
  },

  onHide() {
    this.stopTrainingTimer({
      recordSession: true,
    })
  },

  getElapsedSeconds() {
    const baseElapsedSeconds = Math.max(0, Math.floor(Number(this.timerBaseElapsedSeconds) || 0))
    if (!this.timerStartedAt) {
      return baseElapsedSeconds
    }

    const liveElapsedSeconds = Math.max(0, Math.floor((Date.now() - this.timerStartedAt) / 1000))
    return baseElapsedSeconds + liveElapsedSeconds
  },

  clearTrainingTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },

  buildTrainingTimerDesc(elapsedSeconds = 0, running = false, fallbackDesc = '') {
    if (elapsedSeconds <= 0) {
      return fallbackDesc || '开始本次实训正计时。'
    }

    return `${running ? '当前已累计' : '累计时长'} ${formatElapsedLabel(elapsedSeconds)}`
  },

  setTrainingItems(pathItems = [], extraData = {}, callback) {
    this.setData({
      ...extraData,
      pathItems,
      trainingGroups: buildTrainingGroups(pathItems),
    }, () => {
      if (typeof callback === 'function') {
        callback()
      }
    })
  },

  updateTrainingTimerDisplay() {
    const elapsedSeconds = this.getElapsedSeconds()
    const running = !!this.timerStartedAt
    const pathItems = (this.data.pathItems || []).slice()
    const itemIndex = pathItems.findIndex((item) => item.id === 'training_timer')

    if (itemIndex >= 0) {
      const currentItem = pathItems[itemIndex]
      pathItems[itemIndex] = {
        ...currentItem,
        desc: this.buildTrainingTimerDesc(elapsedSeconds, running, currentItem.desc),
        timerParts: buildTimerParts(elapsedSeconds),
        timerEditable: true,
      }
    }

    this.setTrainingItems(pathItems, {
      trainingTimerRunning: running,
    })
  },

  refreshStage(callback) {
    const stage = buildLearningPathStage('training', this.data.pointName)
    const elapsedSeconds = this.getElapsedSeconds()
    const running = !!this.timerStartedAt
    const pathItems = ((((stage.groups || [])[0] || {}).items) || []).map((item) => (
      item.id === 'training_timer'
        ? {
            ...item,
            desc: this.buildTrainingTimerDesc(elapsedSeconds, running, item.desc),
            timerParts: buildTimerParts(elapsedSeconds),
            timerEditable: true,
          }
        : item
    ))

    this.setTrainingItems(pathItems, {
      stageIndex: stage.stageIndex,
      stageName: stage.stageName,
      stageSubtitle: stage.stageSubtitle,
      sectionTitle: stage.sectionTitle,
      trainingTimerRunning: running,
    }, callback)
  },

  findTaskById(taskId = '') {
    return (this.data.pathItems || []).find((item) => item.id === taskId) || null
  },

  isTaskDone(taskId = '') {
    const targetTask = this.findTaskById(taskId)
    return !!(targetTask && targetTask.status === 'done')
  },

  async onActionTap(e) {
    const { taskId, status, actionType, title } = e.currentTarget.dataset
    if (!taskId) return

    const currentTask = this.findTaskById(taskId) || {}

    if (status === 'pending') {
      wx.showToast({
        title: currentTask.blockedToast || '请先完成上一步任务',
        icon: 'none',
      })
      return
    }

    if (currentTask.requireDoneTaskId && !this.isTaskDone(currentTask.requireDoneTaskId)) {
      wx.showToast({
        title: currentTask.blockedToast || '请先完成上一步任务',
        icon: 'none',
      })
      return
    }

    if (actionType === 'upload') {
      try {
        const result = await submitLearningPathUploadTask(this.data.pointName, 'training', taskId, this.app)
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
        stageKey: 'training',
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

    if (actionType === 'document') {
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

  async completeTrainingTimerAfterStudy(elapsedSeconds = 0) {
    const timerTask = this.findTaskById('training_timer')
    if (!timerTask || timerTask.status !== 'current' || elapsedSeconds <= 0) {
      return
    }

    const completedAt = new Date().toISOString()
    completeLearningPathTask(this.data.pointName, 'training', 'training_timer', {
      completedAt,
      elapsedSeconds,
    })
    try {
      await persistLearningPathTask(this.data.pointName, 'training', 'training_timer', {
        completedAt,
        elapsedSeconds,
      }, this.app)
    } catch (_error) {}
    this.refreshStage()
  },

  async toggleTrainingTimer() {
    if (this.data.trainingTimerRunning) {
      void this.stopTrainingTimer({
        recordSession: true,
      })
      return
    }

    startCountdownStudySession(this, {}, {
      sessionType: 'practice',
      courseId: (page) => page.studyOptions && page.studyOptions.courseId,
      studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
      pointName: (page) => page.studyOptions && page.studyOptions.pointName,
    })

    this.timerStartedAt = Date.now()
    this.clearTrainingTimerInterval()
    this.timerInterval = setInterval(() => {
      this.updateTrainingTimerDisplay()
    }, 1000)
    this.updateTrainingTimerDisplay()
  },

  async stopTrainingTimer(options = {}) {
    const { recordSession = false } = options
    if (!this.timerStartedAt) {
      this.updateTrainingTimerDisplay()
      return null
    }

    const elapsedSeconds = this.getElapsedSeconds()
    this.timerBaseElapsedSeconds = elapsedSeconds
    this.timerStartedAt = 0
    this.clearTrainingTimerInterval()
    this.updateTrainingTimerDisplay()

    if (!recordSession) {
      return null
    }

    const result = await Promise.resolve(finishCountdownStudySession(this, {}))
    await this.completeTrainingTimerAfterStudy(elapsedSeconds)
    return result
  },

  resetTrainingTimer() {
    wx.showModal({
      title: '重置计时器',
      content: '确认将正计时器重置为 00:00:00 吗？',
      success: (res) => {
        if (!res.confirm) return

        const clearAll = () => {
          this.timerBaseElapsedSeconds = 0
          this.timerStartedAt = 0
          this.clearTrainingTimerInterval()
          this.updateTrainingTimerDisplay()
        }

        if (this.data.trainingTimerRunning) {
          Promise.resolve(this.stopTrainingTimer({
            recordSession: true,
          })).then(clearAll)
          return
        }

        clearAll()
      },
    })
  },
}

Page(pageConfig)


