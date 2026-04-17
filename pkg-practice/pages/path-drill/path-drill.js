const { bindPathCountdown, formatCountdownParts } = require('../../../utils/path-countdown')
const { finishCountdownStudySession, startCountdownStudySession } = require('../../../utils/countdown-study-session')
const {
  createTimerPickerHours,
  createTimerPickerMinutes,
  minutesToPickerValue,
  pickerValueToMinutes,
} = require('../../../utils/timer-picker')

const DRILL_RECOMMENDED_MINUTES = 45
const DRILL_DURATION = DRILL_RECOMMENDED_MINUTES * 60
const TIMER_PICKER_HOURS = createTimerPickerHours()
const TIMER_PICKER_MINUTES = createTimerPickerMinutes()
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
      { date: '4/28', weekday: '一', title: '完成 1 道公文结构不清刷题并提交作业', note: 'AI 批改', type: 'submit' },
      { date: '4/29', weekday: '二', title: '根据指导完成刷题复盘并提交', type: 'review' },
      { date: '4/30', weekday: '三', title: '直播 3：讲解结构清晰的表达方法', note: '19:00-20:30', type: 'live' },
      { date: '5/1', weekday: '四', title: '休息', note: '劳动节', type: 'rest' },
      { date: '5/2', weekday: '五', title: '休息', type: 'rest' },
      { date: '5/3', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
  {
    label: '第 4 周',
    days: [
      { date: '5/4', weekday: '日', title: '完成 1 道作文立意不准刷题', note: '完成立意', type: 'task' },
      { date: '5/5', weekday: '一', title: '完成 1 道作文论证不清 + 表达不畅刷题', note: '完成开头 + 1 个分论点论证 + 结尾', type: 'task' },
      { date: '5/6', weekday: '二', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '5/7', weekday: '三', title: '根据指导完成刷题复盘并提交', type: 'review' },
      { date: '5/8', weekday: '四', title: '直播 4：探讨写好作文的技巧', note: '19:00-21:00', type: 'live' },
      { date: '5/9', weekday: '五', title: '休息', type: 'rest' },
      { date: '5/10', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
]

function normalizeMinutes(value, fallbackMinutes = DRILL_RECOMMENDED_MINUTES) {
  const minutes = parseInt(value, 10)
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return fallbackMinutes
  }

  return Math.min(minutes, 999)
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
      if (day.type === 'rest') return

      const [monthText, dayText] = String(day.date || '').split('/')
      const month = parseInt(monthText, 10)
      const dateNum = parseInt(dayText, 10)
      if (!month || !dateNum) return

      const mappedType = (typeMap[day.type] || {}).eventType || 'drill'
      const dateStr = `2026-${padNumber(month)}-${padNumber(dateNum)}`

      if (!result[dateStr]) {
        result[dateStr] = []
      }

      result[dateStr].push({
        label: day.title,
        type: mappedType,
        note: day.note || '',
        weekday: day.weekday,
      })
    })
    return result
  }, {})
}

const pageConfig = {
  data: {
    pointName: '当前卡点',
    stageIndex: '6 / 6',
    stageName: '刷题',
    stageSubtitle: '按顺序完成限时刷题、提交作业和课堂反馈。',
    sectionTitle: '刷题路径',
    calendarTitle: '刷题日历',
    calendarSubtitle: '按日历查看刷题、作业、复盘和直播安排',
    pathCountdownRunning: false,
    pathCountdownFinished: false,
    recommendedMinutes: DRILL_RECOMMENDED_MINUTES,
    timerPickerHours: TIMER_PICKER_HOURS,
    timerPickerMinutes: TIMER_PICKER_MINUTES,
    timerPickerRange: [TIMER_PICKER_HOURS, TIMER_PICKER_MINUTES],
    timerPickerValue: minutesToPickerValue(DRILL_RECOMMENDED_MINUTES),
    calendarView: 'month',
    calendarYear: 2026,
    calendarMonth: 4,
    calendarWeekdayLabels: CALENDAR_WEEKDAY_LABELS,
    calendarSelectedDate: '',
    calendarWeeks: [],
    calendarWeekDays: [],
    calendarWeekTitle: '',
    calendarSelectedLabel: '',
    calendarSelectedTasks: [],
    scheduleData: buildScheduleData(),
    pathItems: [
      {
        title: '计时器',
        desc: '当前刷题剩余时间',
        status: 'done',
        countdownParts: formatCountdownParts(DRILL_DURATION),
        countdownEditable: true,
      },
      {
        title: '刷题任务（待批改）',
        desc: '完成当前刷题任务，提交后等待老师批改。',
        status: 'current',
        actionText: '当前',
      },
      {
        title: '直播课',
        desc: '进入直播课堂，跟老师一起讲评本轮刷题重点。',
        status: 'pending',
        actionText: '待上课',
      },
      {
        title: '课堂反馈',
        desc: '查看老师对当前刷题情况的反馈。',
        status: 'pending',
        actionText: '待反馈',
      },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.studyOptions = {
      ...(options || {}),
      pointName,
    }

    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '刷题',
    })
    this.resetPathCountdown()
    this.initCalendar()
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

  togglePathCountdown() {
    if (this.data.pathCountdownFinished) {
      return
    }

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
      sessionType: 'practice',
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

    this.setData({ calendarView: 'month' })
  },
}

bindPathCountdown(pageConfig, {
  durationSeconds: DRILL_DURATION,
  runningDesc: '当前刷题剩余时间',
  finishedDesc: '刷题时间已结束',
  onComplete(page) {
    finishCountdownStudySession(page, {
      remainingSeconds: 0,
    }, {
      force: true,
    })
  },
})

Page(pageConfig)
