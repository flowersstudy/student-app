const PATH_STEPS = [
  {
    id: 'task',
    title: '完成刷题任务',
    desc: '先完成当期卡点对应的刷题任务，明确自己卡在哪里。',
    scheduleType: 'drill',
    routeUrl: '/pages/practice-task/practice-task',
  },
  {
    id: 'submit',
    title: '提交刷题作业',
    desc: '按要求提交当天作业，系统先做 AI 批改，老师再重点看问题。',
    scheduleType: 'hw',
    routeUrl: '/pages/practice-submit/practice-submit',
  },
  {
    id: 'review',
    title: '完成并反馈复盘',
    desc: '根据指导完成复盘，把“为什么错”真正说清楚、写明白。',
    scheduleType: 'video',
    routeUrl: '/pages/practice-review/practice-review',
  },
  {
    id: 'live',
    title: '直播学习',
    desc: '进入直播课，针对共性卡点集中拆解方法和提分路径。',
    scheduleType: 'class',
    routeUrl: '/pages/practice-live/practice-live',
  },
]

const SCHEDULE_WEEKS = [
  {
    label: '第 1 周',
    days: [
      { date: '4/13', weekday: '日', title: '完成 1 道游走式找点 + 总结转述难的刷题', type: 'task' },
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
      { date: '4/20', weekday: '日', title: '完成 1 道对策推导难的刷题', type: 'task' },
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
      { date: '4/27', weekday: '日', title: '完成 1 道分析结构不清的刷题', type: 'task' },
      { date: '4/28', weekday: '一', title: '完成 1 道公文结构不清的刷题 + 提交作业', note: 'AI 批改', type: 'submit' },
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
      { date: '5/4', weekday: '日', title: '完成 1 道作文立意不准的刷题', note: '完成立意', type: 'task' },
      { date: '5/5', weekday: '一', title: '完成 1 道作文逻辑不清 + 作文表达不畅的刷题', note: '完成开头 + 1 个分论点论证 + 结尾', type: 'task' },
      { date: '5/6', weekday: '二', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '5/7', weekday: '三', title: '根据指导完成刷题复盘并提交', type: 'review' },
      { date: '5/8', weekday: '四', title: '直播 4：探讨写好作文的技巧', note: '19:00-21:00', type: 'live' },
      { date: '5/9', weekday: '五', title: '休息', type: 'rest' },
      { date: '5/10', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
]

const NOTICE_LIST = [
  '所有任务需要当天按时提交。',
  '本次直播在腾讯会议 APP 中进行，无回放，请提前下载好腾讯会议 APP 并准时参加。',
  '具体直播时间可能会根据当月情况调整，若有变化会另行通知。',
]

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
      const dateStr = `2026-${padNumber(parseInt(day.date.split('/')[0], 10))}-${padNumber(parseInt(day.date.split('/')[1], 10))}`
      if (!result[dateStr]) result[dateStr] = []
      result[dateStr].push({
        label: day.title,
        type: (typeMap[day.type] || {}).eventType || 'drill',
        note: day.note || '',
        weekday: day.weekday,
      })
    })
    return result
  }, {})
}

Page({
  data: {
    isEnrolled: false,
    hasPracticeCourse: false,
    productName: '《申论八大卡点·刷题班》',
    depositText: '99 元 / 月 · 4 次直播全勤返还 99 元',
    pathSteps: PATH_STEPS,
    scheduleWeeks: SCHEDULE_WEEKS,
    noticeList: NOTICE_LIST,
    scheduleData: buildScheduleData(),
    calendarView: 'month',
    calendarYear: 2026,
    calendarMonth: 4,
    calendarSelectedDate: '',
    calendarWeeks: [],
    calendarWeekDays: [],
    calendarWeekTitle: '',
    calendarSelectedLabel: '',
    calendarSelectedTasks: [],
    todayDateStr: '',
    todayTasks: [],
  },

  onShow() {
    const app = getApp()
    this.setData({
      isEnrolled: !!(app && app.globalData && app.globalData.isEnrolled),
      hasPracticeCourse: !!(app && app.globalData && app.globalData.hasPracticeCourse),
    })
    this.initCalendar()
  },

  goToPurchase() {
    wx.navigateTo({
      url: '/pages/practice-purchase/practice-purchase',
    })
  },

  initCalendar() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = formatDateStr(today)
    const weekData = this.buildWeekDays(todayStr)

    this.setData({
      calendarYear: today.getFullYear(),
      calendarMonth: today.getMonth() + 1,
      calendarSelectedDate: todayStr,
      calendarWeeks: this.buildMonthWeeks(today.getFullYear(), today.getMonth() + 1),
      calendarWeekDays: weekData,
      calendarWeekTitle: weekData.title,
      calendarSelectedLabel: formatDisplayDate(todayStr),
      calendarSelectedTasks: this.data.scheduleData[todayStr] || [],
      todayDateStr: todayStr,
      todayTasks: this.data.scheduleData[todayStr] || [],
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
    const scheduleData = this.data.scheduleData
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = formatDateStr(today)
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
    const scheduleData = this.data.scheduleData
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = formatDateStr(today)
    const selectedDate = new Date(selectedDateStr)
    const dayOffset = (selectedDate.getDay() + 6) % 7
    const monday = new Date(selectedDate.getTime() - dayOffset * 86400000)
    const sunday = new Date(monday.getTime() + 6 * 86400000)
    const weekdays = ['一', '二', '三', '四', '五', '六', '日']
    const days = []

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(monday.getTime() + index * 86400000)
      const dateStr = formatDateStr(date)
      days.push({
        dateStr,
        dayNum: date.getDate(),
        label: weekdays[index],
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
    const dateStr = e.currentTarget.dataset.date
    const weekData = this.buildWeekDays(dateStr)
    this.setData({
      calendarSelectedDate: dateStr,
      calendarSelectedLabel: formatDisplayDate(dateStr),
      calendarSelectedTasks: this.data.scheduleData[dateStr] || [],
      calendarWeekDays: weekData,
      calendarWeekTitle: weekData.title,
    })
  },

  onPathStepTap(e) {
    const { routeUrl } = e.currentTarget.dataset
    if (!routeUrl) {
      wx.showToast({ title: '页面准备中', icon: 'none' })
      return
    }

    wx.navigateTo({
      url: routeUrl,
    })
  },

  findNearestScheduleDate(stepType) {
    const todayStr = formatDateStr(new Date())
    const scheduleDates = Object.keys(this.data.scheduleData)
      .filter((dateStr) => (this.data.scheduleData[dateStr] || []).some((task) => task.type === stepType))
      .sort()

    const upcoming = scheduleDates.find((dateStr) => dateStr >= todayStr)
    return upcoming || scheduleDates[0] || ''
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
})
