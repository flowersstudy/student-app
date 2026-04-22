const { finishCountdownStudySession, startCountdownStudySession } = require('../../../utils/countdown-study-session')
const {
  buildLearningPathStage,
  completeLearningPathTask,
  openLearningPathFeedback,
  openTeacherTab,
  persistLearningPathTask,
  simulateLearningPathProcessing,
  submitLearningPathUploadTask,
  syncLearningPathFromServer,
} = require('../../../utils/learning-path')
const { openRemoteDocument } = require('../../../utils/document-url')
const { buildLearningTaskVideoRoute } = require('../../../utils/polyv-video')
const { normalizeStudyOptions } = require('../../../utils/study-route')

const CALENDAR_WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

const SCHEDULE_WEEKS = [
  {
    label: '第 1 周',
    days: [
      { date: '4/13', weekday: '日', title: '完成 1 道要点不全不准 + 提炼转述困难刷题', type: 'task' },
      { date: '4/14', weekday: '一', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '4/15', weekday: '二', title: '根据指导完成刷题复盘', type: 'review' },
      { date: '4/16', weekday: '三', title: '提交刷题复盘', type: 'submit' },
      { date: '4/17', weekday: '四', title: '直播 1：讲解精准找点的方法', note: '19:00-20:30', type: 'live' },
      { date: '4/18', weekday: '五', title: '休息', type: 'rest' },
      { date: '4/19', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
  {
    label: '第 2 周',
    days: [
      { date: '4/20', weekday: '日', title: '完成 1 道对策推导困难刷题', type: 'task' },
      { date: '4/21', weekday: '一', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '4/22', weekday: '二', title: '根据指导完成刷题复盘', type: 'review' },
      { date: '4/23', weekday: '三', title: '提交刷题复盘', type: 'submit' },
      { date: '4/24', weekday: '四', title: '直播 2：分享对策精准可行的思路', note: '19:00-20:30', type: 'live' },
      { date: '4/25', weekday: '五', title: '休息', type: 'rest' },
      { date: '4/26', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
  {
    label: '第 3 周',
    days: [
      { date: '4/27', weekday: '日', title: '完成 1 道分析结构不清刷题', type: 'task' },
      { date: '4/28', weekday: '一', title: '完成 1 道公文结构不清刷题', type: 'task' },
      { date: '4/28', weekday: '一', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '4/30', weekday: '三', title: '根据指导完成刷题复盘并提交', type: 'review' },
      { date: '4/30', weekday: '三', title: '直播 3：讲解结构正确的方法', note: '19:00-20:30', type: 'live' },
      { date: '5/1', weekday: '四', title: '休息', note: '劳动节', type: 'rest' },
      { date: '5/2', weekday: '五', title: '休息', type: 'rest' },
      { date: '5/3', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
  {
    label: '第 4 周',
    days: [
      { date: '5/4', weekday: '日', title: '完成 1 道作文立意不准刷题', note: '完成立意', type: 'task' },
      { date: '5/5', weekday: '一', title: '完成 1 道作文论证不清 + 表达不畅刷题', note: '完成开头 + 1 个分论点 + 结尾', type: 'task' },
      { date: '5/6', weekday: '二', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '5/7', weekday: '三', title: '根据指导完成刷题复盘并提交', type: 'review' },
      { date: '5/8', weekday: '四', title: '直播 4：探讨写好作文的技巧', note: '19:00-21:00', type: 'live' },
      { date: '5/9', weekday: '五', title: '休息', type: 'rest' },
      { date: '5/10', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
]

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

function padNumber(value) {
  return String(value).padStart(2, '0')
}

function formatDateStr(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getMonth() + 1}月${date.getDate()}日 · 周${weekdays[date.getDay()]}`
}

const LIVE_TITLE_OVERRIDES = {
  '2026-04-17': '直播 1：针对要点不全不准+提炼转述困难的问题',
  '2026-04-24': '直播 2：针对对策推导错误的问题',
  '2026-04-30': '直播 3：针对分析结构错误+公文结构错误的问题',
  '2026-05-08': '直播 4：针对作文立意错误+作文逻辑不清晰+作文表达不流畅的问题',
}

function buildScheduleData() {
  const typeMap = {
    task: { eventType: 'drill' },
    submit: { eventType: 'hw' },
    review: { eventType: 'video' },
    live: { eventType: 'class' },
    rest: { eventType: 'rest' },
  }

  return SCHEDULE_WEEKS.reduce((result, week) => {
    ;(week.days || []).forEach((day) => {
      const [monthText, dayText] = String(day.date || '').split('/')
      const month = parseInt(monthText, 10)
      const dateNum = parseInt(dayText, 10)
      if (!month || !dateNum) return

      const mappedType = (typeMap[day.type] || {}).eventType || 'drill'
      const dateStr = `2026-${padNumber(month)}-${padNumber(dateNum)}`

      if (!result[dateStr]) {
        result[dateStr] = []
      }

      const label = day.type === 'live' && LIVE_TITLE_OVERRIDES[dateStr]
        ? LIVE_TITLE_OVERRIDES[dateStr]
        : day.title

      result[dateStr].push({
        label,
        type: mappedType,
        note: day.note || '',
        weekday: day.weekday,
      })
    })
    return result
  }, {})
}

function getActionToast(actionType = '', title = '') {
  switch (actionType) {
    case 'document':
      return `${title || '题目'}已标记完成`
    case 'live':
      return `${title || '直播环节'}已完成`
    case 'replay':
      return '已完成回看'
    case 'feedback':
      return '已查看老师反馈'
    case 'processing':
      return 'AI 批改已完成'
    case 'report':
      return `已查看${title || '报告'}`
    default:
      return '已完成'
  }
}

Page({
  data: {
    pointName: '当前卡点',
    stageIndex: '6 / 6',
    stageName: '刷题',
    sectionTitle: '刷题流程',
    timerParts: buildTimerParts(0),
    timerTitle: '计时器',
    drillTimerRunning: false,
    pathItems: [],
    calendarTitle: '刷题报告总结',
    calendarView: 'month',
    calendarYear: 2026,
    calendarMonth: 4,
    calendarWeekdayLabels: CALENDAR_WEEKDAY_LABELS,
    calendarSelectedDate: '',
    calendarWeeks: [],
    calendarWeekDays: { days: [], title: '' },
    calendarWeekTitle: '',
    calendarSelectedLabel: '',
    calendarSelectedTasks: [],
    scheduleData: buildScheduleData(),
  },

  app: null,
  currentTimerTask: null,
  timerBaseElapsedSeconds: 0,
  timerStartedAt: 0,
  timerInterval: null,
  stageItems: [],

  onLoad(options) {
    this.app = getApp()
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: '当前卡点',
    })

    this.setData({
      pointName: this.studyOptions.pointName,
    })

    wx.setNavigationBarTitle({
      title: '刷题',
    })

    this.loadRemoteStage()
    this.initCalendar()
  },

  async loadRemoteStage() {
    const pointName = (this.studyOptions && this.studyOptions.pointName) || this.data.pointName
    try {
      await syncLearningPathFromServer(pointName, this.app)
    } catch (_error) {}
    this.refreshStage()
  },

  onHide() {
    this.stopDrillTimer({
      recordSession: true,
    })
  },

  onUnload() {
    this.stopDrillTimer({
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

  clearDrillTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },

  updateDrillTimerDisplay() {
    this.setData({
      timerParts: buildTimerParts(this.getElapsedSeconds()),
      drillTimerRunning: !!this.timerStartedAt,
    })
  },

  refreshStage(callback) {
    const stage = buildLearningPathStage('drill', this.data.pointName)
    const stageItems = ((((stage.groups || [])[0] || {}).items) || [])

    this.stageItems = stageItems
    this.currentTimerTask = stageItems.find((item) => item.id === 'drill_countdown') || null

    this.setData({
      stageIndex: stage.stageIndex,
      stageName: stage.stageName,
      sectionTitle: stage.sectionTitle,
      pathItems: stageItems.filter((item) => item.id !== 'drill_countdown'),
    }, () => {
      this.updateDrillTimerDisplay()
      if (typeof callback === 'function') {
        callback()
      }
    })
  },

  findTaskById(taskId = '') {
    return this.stageItems.find((item) => item.id === taskId) || null
  },

  isTaskDone(taskId = '') {
    const targetTask = this.findTaskById(taskId)
    return !!(targetTask && targetTask.status === 'done')
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
        const result = await submitLearningPathUploadTask(this.data.pointName, 'drill', taskId, this.app)
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
        stageKey: 'drill',
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

    if (actionType === 'processing') {
      if (!this.isTaskDone('drill_upload')) {
        wx.showToast({
          title: '请先上传刷题作业',
          icon: 'none',
        })
        return
      }

      const processingStartedAt = new Date().toISOString()
      wx.showLoading({
        title: 'AI 批改中',
        mask: true,
      })
      await simulateLearningPathProcessing(900)
      wx.hideLoading()

      completeLearningPathTask(this.data.pointName, 'drill', taskId, {
        processingStartedAt,
        processingDone: true,
      })
      try {
        await persistLearningPathTask(this.data.pointName, 'drill', taskId, {
          processingStartedAt,
          processingDone: true,
        }, this.app)
      } catch (_error) {}
      this.refreshStage()

      wx.showToast({
        title: getActionToast(actionType, title),
        icon: 'none',
      })
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

    if (actionType === 'document') {
      try {
        const opened = await openRemoteDocument(resource.url, {
          title,
          appInstance: this.app,
        })
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

    if (actionType === 'report') {
      wx.pageScrollTo({
        selector: '.calendar-section',
        duration: 300,
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

  async completeDrillTimerAfterStudy(elapsedSeconds = 0) {
    const timerTask = this.findTaskById('drill_countdown')
    if (!timerTask || timerTask.status !== 'current' || elapsedSeconds <= 0) {
      return
    }

    const completedAt = new Date().toISOString()
    completeLearningPathTask(this.data.pointName, 'drill', 'drill_countdown', {
      completedAt,
      elapsedSeconds,
    })
    try {
      await persistLearningPathTask(this.data.pointName, 'drill', 'drill_countdown', {
        completedAt,
        elapsedSeconds,
      }, this.app)
    } catch (_error) {}
    this.refreshStage()
  },

  async toggleDrillTimer() {
    if (this.data.drillTimerRunning) {
      void this.stopDrillTimer({
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
    this.clearDrillTimerInterval()
    this.timerInterval = setInterval(() => {
      this.updateDrillTimerDisplay()
    }, 1000)
    this.updateDrillTimerDisplay()
  },

  async stopDrillTimer(options = {}) {
    const { recordSession = false } = options
    if (!this.timerStartedAt) {
      this.updateDrillTimerDisplay()
      return null
    }

    const elapsedSeconds = this.getElapsedSeconds()
    this.timerBaseElapsedSeconds = elapsedSeconds
    this.timerStartedAt = 0
    this.clearDrillTimerInterval()
    this.updateDrillTimerDisplay()

    if (!recordSession) {
      return null
    }

    const result = await Promise.resolve(finishCountdownStudySession(this, {}))
    await this.completeDrillTimerAfterStudy(elapsedSeconds)
    return result
  },

  resetDrillTimer() {
    wx.showModal({
      title: '重置计时器',
      content: '确认将计时器重置为 00:00:00 吗？',
      success: (res) => {
        if (!res.confirm) return

        const clearAll = () => {
          this.timerBaseElapsedSeconds = 0
          this.timerStartedAt = 0
          this.clearDrillTimerInterval()
          this.updateDrillTimerDisplay()
        }

        if (this.data.drillTimerRunning) {
          Promise.resolve(this.stopDrillTimer({
            recordSession: true,
          })).then(clearAll)
          return
        }

        clearAll()
      },
    })
  },

  findInitialCalendarDate() {
    const scheduleDates = Object.keys(this.data.scheduleData || {}).sort()
    const todayStr = formatDateStr(new Date())
    const upcomingDate = scheduleDates.find((dateStr) => dateStr >= todayStr)
    return upcomingDate || scheduleDates[0] || todayStr
  },

  initCalendar() {
    const initialDate = this.findInitialCalendarDate()
    const selectedDate = new Date(initialDate)
    const calendarYear = selectedDate.getFullYear()
    const calendarMonth = selectedDate.getMonth() + 1
    const weekData = this.buildWeekDays(initialDate)

    this.setData({
      calendarYear,
      calendarMonth,
      calendarSelectedDate: initialDate,
      calendarWeeks: this.buildMonthWeeks(calendarYear, calendarMonth),
      calendarWeekDays: weekData,
      calendarWeekTitle: weekData.title,
      calendarSelectedLabel: formatDisplayDate(initialDate),
      calendarSelectedTasks: this.data.scheduleData[initialDate] || [],
    })
  },

  buildMonthWeeks(year, month) {
    const days = this.buildMonthDays(year, month)
    const weeks = []

    for (let index = 0; index < days.length; index += 7) {
      weeks.push({ days: days.slice(index, index + 7) })
    }

    return weeks
  },

  buildMonthDays(year, month) {
    const scheduleData = this.data.scheduleData || {}
    const todayStr = formatDateStr(new Date())
    const firstDayIndex = (new Date(year, month - 1, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month, 0).getDate()
    const previousMonthDays = new Date(year, month - 1, 0).getDate()
    const days = []

    for (let index = firstDayIndex - 1; index >= 0; index -= 1) {
      const day = previousMonthDays - index
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      const dateStr = `${prevYear}-${padNumber(prevMonth)}-${padNumber(day)}`
      days.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: false,
        isToday: false,
        tasks: scheduleData[dateStr] || [],
      })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateStr = `${year}-${padNumber(month)}-${padNumber(day)}`
      days.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        tasks: scheduleData[dateStr] || [],
      })
    }

    const remaining = days.length % 7
    if (remaining > 0) {
      const nextMonth = month === 12 ? 1 : month + 1
      const nextYear = month === 12 ? year + 1 : year

      for (let day = 1; day <= 7 - remaining; day += 1) {
        const dateStr = `${nextYear}-${padNumber(nextMonth)}-${padNumber(day)}`
        days.push({
          dateStr,
          dayNum: day,
          isCurrentMonth: false,
          isToday: false,
          tasks: scheduleData[dateStr] || [],
        })
      }
    }

    return days
  },

  buildWeekDays(selectedDateStr) {
    const scheduleData = this.data.scheduleData || {}
    const todayStr = formatDateStr(new Date())
    const selectedDate = new Date(selectedDateStr)
    const dayOffset = (selectedDate.getDay() + 6) % 7
    const monday = new Date(selectedDate.getTime() - dayOffset * 86400000)
    const sunday = new Date(monday.getTime() + 6 * 86400000)
    const days = []

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(monday.getTime() + index * 86400000)
      const dateStr = formatDateStr(date)
      days.push({
        dateStr,
        dayNum: date.getDate(),
        label: CALENDAR_WEEKDAY_LABELS[index],
        isToday: dateStr === todayStr,
        tasks: scheduleData[dateStr] || [],
      })
    }

    const formatTitle = (date) => `${date.getMonth() + 1}月${date.getDate()}日`

    return {
      days,
      title: `${formatTitle(monday)} - ${formatTitle(sunday)}`,
    }
  },

  onCalDayTap(e) {
    const { date } = e.currentTarget.dataset
    if (!date) return

    const weekData = this.buildWeekDays(date)
    this.setData({
      calendarSelectedDate: date,
      calendarSelectedLabel: formatDisplayDate(date),
      calendarSelectedTasks: this.data.scheduleData[date] || [],
      calendarWeekDays: weekData,
      calendarWeekTitle: weekData.title,
    })
  },

  onCalPrev() {
    if (this.data.calendarView === 'week') {
      const date = new Date(this.data.calendarSelectedDate)
      date.setDate(date.getDate() - 7)
      const dateStr = formatDateStr(date)
      const weekData = this.buildWeekDays(dateStr)
      this.setData({
        calendarSelectedDate: dateStr,
        calendarSelectedLabel: formatDisplayDate(dateStr),
        calendarSelectedTasks: this.data.scheduleData[dateStr] || [],
        calendarWeekDays: weekData,
        calendarWeekTitle: weekData.title,
      })
      return
    }

    let { calendarYear, calendarMonth } = this.data
    calendarMonth -= 1
    if (calendarMonth < 1) {
      calendarMonth = 12
      calendarYear -= 1
    }

    this.setData({
      calendarYear,
      calendarMonth,
      calendarWeeks: this.buildMonthWeeks(calendarYear, calendarMonth),
    })
  },

  onCalNext() {
    if (this.data.calendarView === 'week') {
      const date = new Date(this.data.calendarSelectedDate)
      date.setDate(date.getDate() + 7)
      const dateStr = formatDateStr(date)
      const weekData = this.buildWeekDays(dateStr)
      this.setData({
        calendarSelectedDate: dateStr,
        calendarSelectedLabel: formatDisplayDate(dateStr),
        calendarSelectedTasks: this.data.scheduleData[dateStr] || [],
        calendarWeekDays: weekData,
        calendarWeekTitle: weekData.title,
      })
      return
    }

    let { calendarYear, calendarMonth } = this.data
    calendarMonth += 1
    if (calendarMonth > 12) {
      calendarMonth = 1
      calendarYear += 1
    }

    this.setData({
      calendarYear,
      calendarMonth,
      calendarWeeks: this.buildMonthWeeks(calendarYear, calendarMonth),
    })
  },

  onCalToggleView() {
    if (this.data.calendarView === 'month') {
      const weekData = this.buildWeekDays(this.data.calendarSelectedDate)
      this.setData({
        calendarView: 'week',
        calendarWeekDays: weekData,
        calendarWeekTitle: weekData.title,
      })
      return
    }

    this.setData({
      calendarView: 'month',
    })
  },
})
