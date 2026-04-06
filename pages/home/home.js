const app = getApp()
const { http } = require('../../utils/request')

Page({
  data: {
    isEnrolled: false,
    // 复习提醒（由 _computeReviewReminder 动态计算，初始不显示）
    reviewReminder: { show: false, type: '', label: '', desc: '', days: 0, pointName: '' },
    // 学习时间数据（用于判断复习触发条件）
    lastStudyDate: '2026-03-28',   // 最后一次学习日期；有学习行为时更新
    allCompletedDate: null,        // 所有卡点全部完成的日期；未全完成时为 null
    // 已购课数据
    userProfile: {
      name: '张三', gender: '男', grade: '2026届',
      hometown: '湖南省', examStatus: '备考中', examTime: '2026年4月',
      education: '本科', major: '汉语言文学'
    },
    diagnosis: {
      targetExam: '国考行测申论', targetScore: 130,
      diagnosisScore: 108, scoreGap: 22
    },
    examDaysLeft: 0,
    xingcePoints: [
      { id: 1, name: '游走式找点', status: '学习中', progress: 60 },
      { id: 5, name: '对策推导错误', status: '学习中', progress: 30 },
      { id: 3, name: '分析结构错误', status: '待解锁', progress: 0 },
      { id: 7, name: '作文逻辑不清晰', status: '待解锁', progress: 0 },
      { id: 8, name: '作文表达不流畅', status: '待解锁', progress: 0 }
    ],
    shenlunPoints: [
      { id: 2, name: '提炼转述错误', status: '已完成', progress: 100, completedAt: '2026-03-10' },
      { id: 4, name: '公文结构错误', status: '已完成', progress: 100, completedAt: '2026-03-18' },
      { id: 6, name: '作文立意错误', status: '已完成', progress: 100, completedAt: '2026-03-22' }
    ],
    // 未购课数据
    courses: [
      { id: 1, name: '游走式找点', price: 1080, selected: false },
      { id: 2, name: '提炼转述错误', price: 1080, selected: false },
      { id: 3, name: '分析结构错误', price: 1080, selected: false },
      { id: 4, name: '公文结构错误', price: 1080, selected: false },
      { id: 5, name: '对策推导错误', price: 1080, selected: false },
      { id: 6, name: '作文立意错误', price: 1080, selected: false },
      { id: 7, name: '作文逻辑不清晰', price: 1080, selected: false },
      { id: 8, name: '作文表达不流畅', price: 1080, selected: false }
    ],
    selectedCount: 0,
    totalPrice: 0,
    carouselIndex: 0,
    carouselCards: [
      { name: '游走式找点', symptom: '读了三遍材料，还是不知道要点在哪里' },
      { name: '提炼转述错误', symptom: '觉得自己看懂了，写出来老师说跑题了' },
      { name: '分析结构错误', symptom: '材料里的逻辑关系永远理不清楚' },
      { name: '公文结构错误', symptom: '公文格式背了又背，换个题型就不会套' },
      { name: '对策推导错误', symptom: '看到"提出对策"就发慌，脑子一片空白' },
      { name: '作文立意错误', symptom: '作文审题时觉得懂了，落笔就开始跑偏' },
      { name: '作文逻辑不清晰', symptom: '写了很多，老师说"没有论证，全是堆砌"' },
      { name: '作文表达不流畅', symptom: '答案写得明白，就是像在聊天而非答题' }
    ],
    provinces: ['国考', '北京', '上海', '广东', '浙江', '江苏', '湖南', '湖北', '四川', '河南', '山东', '陕西', '河北', '安徽', '福建', '江西', '重庆', '云南', '贵州', '辽宁'],
    provinceIndex: 6,
    selectedProvince: '湖南',
    calendarView: 'month',
    calendarYear: 2026,
    calendarMonth: 4,
    calendarSelectedDate: '2026-04-03',
    calendarWeeks: [],
    calendarWeekDays: [],
    calendarWeekTitle: '',
    calendarSelectedTasks: [],
    todayDateStr: '',
    todayTasks: [],
    todaySpans: [],
    scheduleData: {
      '2026-03-30': [{ label: '1v1共识课', type: 'class', done: true,  url: '/pages/lesson-live/lesson-live' }],
      '2026-03-31': [{ label: '看录播课',  type: 'video', done: true,  url: '/pages/lesson-recorded/lesson-recorded' }],
      '2026-04-01': [{ label: '1v1纠偏课', type: 'class', done: true,  url: '/pages/lesson-correct/lesson-correct' }],
      '2026-04-02': [{ label: '刷题',      type: 'drill', done: true,  url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-03': [{ label: '刷题',      type: 'drill', done: false, url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-04': [{ label: '刷题',      type: 'drill', done: false, url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-05': [{ label: '阶段考试',  type: 'exam',  done: false, url: '/pages/lesson-exam/lesson-exam' }],
      '2026-04-07': [{ label: '1v1共识课', type: 'class', done: false, url: '/pages/lesson-live/lesson-live' }],
      '2026-04-08': [{ label: '看录播课',  type: 'video', done: false, url: '/pages/lesson-recorded/lesson-recorded' }],
      '2026-04-09': [{ label: '1v1纠偏课', type: 'class', done: false, url: '/pages/lesson-correct/lesson-correct' }],
      '2026-04-10': [{ label: '刷题',      type: 'drill', done: false, url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-11': [{ label: '刷题',      type: 'drill', done: false, url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-12': [{ label: '刷题',      type: 'drill', done: false, url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-13': [{ label: '阶段考试',  type: 'exam',  done: false, url: '/pages/lesson-exam/lesson-exam' }],
      '2026-04-14': [{ label: '1v1共识课', type: 'class', done: false, url: '/pages/lesson-live/lesson-live' }],
      '2026-04-15': [{ label: '看录播课',  type: 'video', done: false, url: '/pages/lesson-recorded/lesson-recorded' }],
      '2026-04-16': [{ label: '1v1纠偏课', type: 'class', done: false, url: '/pages/lesson-correct/lesson-correct' }],
      '2026-04-17': [{ label: '刷题',      type: 'drill', done: false, url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-18': [{ label: '刷题',      type: 'drill', done: false, url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-19': [{ label: '刷题',      type: 'drill', done: false, url: '/pages/lesson-drill/lesson-drill' }],
      '2026-04-20': [{ label: '阶段考试',  type: 'exam',  done: false, url: '/pages/lesson-exam/lesson-exam' }],
    },
    spanEvents: [
      { label: '写诊断试卷', type: 'hw', start: '2026-04-03', end: '2026-04-05', url: '/pages/diagnose/diagnose' },
      { label: '交刷题记录', type: 'hw', start: '2026-04-02', end: '2026-04-04', url: '/pages/lesson-drill/lesson-drill' },
      { label: '交刷题记录', type: 'hw', start: '2026-04-10', end: '2026-04-12', url: '/pages/lesson-drill/lesson-drill' },
      { label: '交刷题记录', type: 'hw', start: '2026-04-17', end: '2026-04-19', url: '/pages/lesson-drill/lesson-drill' },
    ],
    examples: [
      { id: 1, name: '李同学', exam: '国考', grade: '2025届', major: '汉语言文学', score: 18, comment: '以前申论总跑题，现在审题准确率高了很多，申论稳定在75分以上。' },
      { id: 2, name: '王同学', exam: '省考', grade: '2026届', major: '行政管理', score: 24, comment: '材料分析终于有逻辑了，不再是把材料抄一遍，老师反馈进步很大。' }
    ],
    notifications: [],
    notificationCount: 0,
    topReminder: null,
    examCountdown: '',
    showExamEdit: false,
    examEditDate: '',
    examEditTime: '09:00'
  },
  onShow() {
    this.setData({ isEnrolled: app.globalData.isEnrolled })
    this._startCarousel()
    if (app.globalData.isEnrolled) {
      const notifications = this._computeNotifications()
      const topReminder = notifications.find(n => n.pinned) || null
      this.setData({ notifications, notificationCount: notifications.length, topReminder })
      if (topReminder && topReminder.type === 'exam') {
        this._startExamCountdown(topReminder.dateStr)
      }
    }
  },
  onHide() {
    this._stopCarousel()
    this._stopExamCountdown()
  },
  onUnload() {
    this._stopCarousel()
    this._stopExamCountdown()
  },
  _startCarousel() {
    this._stopCarousel()
    this._carouselTimer = setInterval(() => {
      const next = (this.data.carouselIndex + 1) % this.data.carouselCards.length
      this.setData({ carouselIndex: next })
    }, 2500)
  },
  _stopCarousel() {
    if (this._carouselTimer) {
      clearInterval(this._carouselTimer)
      this._carouselTimer = null
    }
  },
  // ── 通知计算 ───────────────────────────────────────────────
  // 置顶：待上课 / 阶段考试提醒；其次：截止日期预警（≤3天）；最后：今日未完成任务
  _computeNotifications() {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayStr = this._calDateStr(today)

    function daysUntil(dateStr) {
      const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
      return Math.round((d - today) / 86400000)
    }

    const items = []

    // 1. 置顶：最近7天内待上课 / 阶段考试（按日期升序）
    const upcomingDays = 7
    for (let i = 0; i <= upcomingDays; i++) {
      const d = new Date(today.getTime() + i * 86400000)
      const ds = this._calDateStr(d)
      const tasks = this.data.scheduleData[ds] || []
      for (const t of tasks) {
        if (t.done) continue
        if (t.type === 'class' || t.type === 'exam') {
          const label = i === 0 ? `今天 · ${t.label}` : i === 1 ? `明天 · ${t.label}` : `${ds} · ${t.label}`
          items.push({ pinned: true, type: t.type, label, desc: i === 0 ? '今天上课，点击进入' : `还有 ${i} 天`, url: t.url, dateStr: ds })
        }
      }
    }

    // 2. 截止日期预警：spanEvents 中 end 日期距今 ≤3 天（且未过期）
    for (const se of (this.data.spanEvents || [])) {
      const diff = daysUntil(se.end)
      if (diff >= 0 && diff <= 3) {
        const desc = diff === 0 ? '今天截止！' : `还有 ${diff} 天截止`
        items.push({ pinned: false, type: se.type, label: se.label, desc, url: se.url, dateStr: se.end })
      }
    }

    // 3. 今日未完成的普通任务（drill / video / hw）
    const todayTasks = this.data.scheduleData[todayStr] || []
    for (const t of todayTasks) {
      if (!t.done && t.type !== 'class' && t.type !== 'exam') {
        items.push({ pinned: false, type: t.type, label: `今日待办 · ${t.label}`, desc: '今天还未完成', url: t.url, dateStr: todayStr })
      }
    }

    // 置顶项排前，同类按 dateStr 升序
    items.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return a.dateStr.localeCompare(b.dateStr)
    })

    return items
  },
  // ────────────────────────────────────────────────────────

  // ── 考试倒计时 ─────────────────────────────────────────
  _getExamTargetTs(dateStr) {
    const app = getApp()
    const saved = app.globalData.examDatetime  // 'YYYY-MM-DD HH:MM'
    if (saved && saved.startsWith(dateStr)) {
      const [, time] = saved.split(' ')
      return new Date(`${dateStr}T${time}:00`).getTime()
    }
    return new Date(`${dateStr}T09:00:00`).getTime()
  },

  _fmtCountdown(ms) {
    if (ms <= 0) return '已结束'
    const totalSec = Math.floor(ms / 1000)
    const d = Math.floor(totalSec / 86400)
    const h = Math.floor((totalSec % 86400) / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    const p = n => String(n).padStart(2, '0')
    if (d > 0) return `${d}天 ${p(h)}:${p(m)}:${p(s)}`
    return `${p(h)}:${p(m)}:${p(s)}`
  },

  _startExamCountdown(dateStr) {
    this._stopExamCountdown()
    const defaultTime = '09:00'
    const app = getApp()
    const saved = app.globalData.examDatetime
    const time = (saved && saved.startsWith(dateStr)) ? saved.split(' ')[1] : defaultTime
    this.setData({ examEditDate: dateStr, examEditTime: time })
    const update = () => {
      const targetTs = this._getExamTargetTs(dateStr)
      const ms = targetTs - Date.now()
      this.setData({ examCountdown: this._fmtCountdown(ms) })
      if (ms <= 0) this._stopExamCountdown()
    }
    update()
    this._examCdTimer = setInterval(update, 1000)
  },

  _stopExamCountdown() {
    if (this._examCdTimer) {
      clearInterval(this._examCdTimer)
      this._examCdTimer = null
    }
  },

  openExamEdit() {
    this.setData({ showExamEdit: true })
  },

  onExamEditDateChange(e) {
    this.setData({ examEditDate: e.detail.value })
  },

  onExamEditTimeChange(e) {
    this.setData({ examEditTime: e.detail.value })
  },

  confirmExamEdit() {
    const { examEditDate, examEditTime } = this.data
    const app = getApp()
    app.globalData.examDatetime = `${examEditDate} ${examEditTime}`
    const topReminder = this.data.topReminder
    if (topReminder && topReminder.type === 'exam') {
      this._startExamCountdown(topReminder.dateStr)
    }
    this.setData({ showExamEdit: false })
  },

  cancelExamEdit() {
    this.setData({ showExamEdit: false })
  },
  // ────────────────────────────────────────────────────────

  onLoad() {
    const profile = app.globalData.userProfile
    const diagnosis = app.globalData.diagnosis
    if (profile) this.setData({ userProfile: profile })
    if (diagnosis) this.setData({ diagnosis })
    this._computeExamDaysLeft()
    this._initCalendar()
    this._loadFromServer()
  },

  _loadFromServer() {
    http.get('/api/student/profile').then((data) => {
      if (!data) return
      function mapStatus(s) {
        if (s === 'completed') return '已完成'
        if (s === 'in_progress') return '学习中'
        return '待解锁'
      }
      const all = [...(data.inProgress || []), ...(data.completed || [])]
      const xingcePoints = all.filter(c => c.subject === '行测').map(c => ({
        id: c.id, name: c.name, status: mapStatus(c.status), progress: c.progress
      }))
      const shenlunPoints = all.filter(c => c.subject === '申论').map(c => ({
        id: c.id, name: c.name, status: mapStatus(c.status), progress: c.progress
      }))
      if (xingcePoints.length > 0) this.setData({ xingcePoints })
      if (shenlunPoints.length > 0) this.setData({ shenlunPoints })
    }).catch(() => {})
  },

  _initCalendar() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const todayStr = this._calDateStr(today)
    const todaySpans = (this.data.spanEvents || []).filter(se => se.start <= todayStr && se.end >= todayStr)
    const weekData = this._buildWeekDays(todayStr)
    this.setData({
      calendarYear: year,
      calendarMonth: month,
      calendarSelectedDate: todayStr,
      calendarWeeks: this._buildMonthWeeks(year, month),
      calendarWeekDays: weekData,
      calendarWeekTitle: weekData.title,
      calendarSelectedTasks: this.data.scheduleData[todayStr] || [],
      todayDateStr: todayStr,
      todayTasks: this.data.scheduleData[todayStr] || [],
      todaySpans
    })
  },

  _buildMonthWeeks(year, month) {
    const days = this._buildMonthDays(year, month)
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7)
      weeks.push({ days: weekDays, spans: this._computeWeekSpans(weekDays) })
    }
    return weeks
  },

  _computeWeekSpans(weekDays) {
    const spanEvents = this.data.spanEvents || []
    const weekStart = weekDays[0].dateStr
    const weekEnd = weekDays[6].dateStr
    const spans = []
    for (const se of spanEvents) {
      if (se.end < weekStart || se.start > weekEnd) continue
      const clampedStart = se.start < weekStart ? weekStart : se.start
      const clampedEnd   = se.end   > weekEnd   ? weekEnd   : se.end
      const col    = weekDays.findIndex(d => d.dateStr === clampedStart)
      const endCol = weekDays.findIndex(d => d.dateStr === clampedEnd)
      if (col < 0 || endCol < 0) continue
      const spanCount = endCol - col + 1
      spans.push({
        label: se.label, type: se.type,
        leftPct: col / 7 * 100,
        widthPct: spanCount / 7 * 100
      })
    }
    return spans
  },

  _calDateStr(d) {
    const p = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  },

  _buildMonthDays(year, month) {
    const p = n => String(n).padStart(2, '0')
    const sd = this.data.scheduleData
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayStr = this._calDateStr(today)
    const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7  // Mon=0
    const daysInMonth = new Date(year, month, 0).getDate()
    const prevMonthDays = new Date(year, month - 1, 0).getDate()
    const days = []
    // 上月补位
    for (let i = firstDow - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const m = month === 1 ? 12 : month - 1
      const y = month === 1 ? year - 1 : year
      const ds = `${y}-${p(m)}-${p(d)}`
      days.push({ dateStr: ds, dayNum: d, isCurrentMonth: false, isToday: false, tasks: sd[ds] || [] })
    }
    // 本月
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${p(month)}-${p(d)}`
      days.push({ dateStr: ds, dayNum: d, isCurrentMonth: true, isToday: ds === todayStr, tasks: sd[ds] || [] })
    }
    // 下月补位
    const rem = days.length % 7
    if (rem > 0) {
      const nm = month === 12 ? 1 : month + 1
      const ny = month === 12 ? year + 1 : year
      for (let d = 1; d <= 7 - rem; d++) {
        const ds = `${ny}-${p(nm)}-${p(d)}`
        days.push({ dateStr: ds, dayNum: d, isCurrentMonth: false, isToday: false, tasks: sd[ds] || [] })
      }
    }
    return days
  },

  _buildWeekDays(selectedDateStr) {
    const sd = this.data.scheduleData
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayStr = this._calDateStr(today)
    const d = new Date(selectedDateStr)
    const dow = (d.getDay() + 6) % 7
    const monday = new Date(d.getTime() - dow * 86400000)
    const sunday = new Date(monday.getTime() + 6 * 86400000)
    const labels = ['一', '二', '三', '四', '五', '六', '日']
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday.getTime() + i * 86400000)
      const ds = this._calDateStr(day)
      days.push({ dateStr: ds, dayNum: day.getDate(), label: labels[i], isToday: ds === todayStr, tasks: sd[ds] || [] })
    }
    const fmt = d => `${d.getMonth() + 1}月${d.getDate()}日`
    const title = `${fmt(monday)} - ${fmt(sunday)}`
    return { days, spans: this._computeWeekSpans(days), title }
  },

  _computeExamDaysLeft() {
    const examTime = this.data.userProfile.examTime || ''
    const m = examTime.match(/(\d{4})年(\d{1,2})月/)
    if (!m) return
    const target = new Date(parseInt(m[1]), parseInt(m[2]), 0) // 该月最后一天
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = Math.ceil((target - today) / 86400000)
    if (days > 0) this.setData({ examDaysLeft: days })
  },
  // 已购课方法
  goDiagnose() {
    wx.navigateTo({ url: '/pages/diagnose/diagnose' })
  },
  goProgress(e) {
    wx.navigateTo({ url: `/pages/progress/progress?id=${e.currentTarget.dataset.id}` })
  },
  goNotifications() {
    const app = getApp()
    app.globalData.notifications = this.data.notifications
    wx.navigateTo({ url: '/pages/notifications/notifications' })
  },
  goTopReminder() {
    const r = this.data.topReminder
    if (r && r.url) wx.navigateTo({ url: r.url })
  },
  goProfile() {
    wx.showToast({ title: '个人中心开发中', icon: 'none' })
  },
  onCalDayTap(e) {
    const dateStr = e.currentTarget.dataset.date
    const tasks = this.data.scheduleData[dateStr] || []
    const weekData = this._buildWeekDays(dateStr)
    this.setData({ calendarSelectedDate: dateStr, calendarSelectedTasks: tasks, calendarWeekDays: weekData, calendarWeekTitle: weekData.title })
  },

  onCalPrev() {
    if (this.data.calendarView === 'week') {
      const d = new Date(this.data.calendarSelectedDate)
      d.setDate(d.getDate() - 7)
      const ds = this._calDateStr(d)
      const weekData = this._buildWeekDays(ds)
      this.setData({
        calendarSelectedDate: ds,
        calendarSelectedTasks: this.data.scheduleData[ds] || [],
        calendarWeekDays: weekData,
        calendarWeekTitle: weekData.title
      })
    } else {
      let { calendarYear, calendarMonth } = this.data
      if (--calendarMonth < 1) { calendarMonth = 12; calendarYear-- }
      this.setData({ calendarYear, calendarMonth, calendarWeeks: this._buildMonthWeeks(calendarYear, calendarMonth) })
    }
  },

  onCalNext() {
    if (this.data.calendarView === 'week') {
      const d = new Date(this.data.calendarSelectedDate)
      d.setDate(d.getDate() + 7)
      const ds = this._calDateStr(d)
      const weekData = this._buildWeekDays(ds)
      this.setData({
        calendarSelectedDate: ds,
        calendarSelectedTasks: this.data.scheduleData[ds] || [],
        calendarWeekDays: weekData,
        calendarWeekTitle: weekData.title
      })
    } else {
      let { calendarYear, calendarMonth } = this.data
      if (++calendarMonth > 12) { calendarMonth = 1; calendarYear++ }
      this.setData({ calendarYear, calendarMonth, calendarWeeks: this._buildMonthWeeks(calendarYear, calendarMonth) })
    }
  },

  onTodayTaskTap(e) {
    const { url, done } = e.currentTarget.dataset
    if (done) {
      wx.showToast({ title: '该任务已完成', icon: 'none' })
      return
    }
    if (url) wx.navigateTo({ url })
  },

  onCalToggleView() {
    if (this.data.calendarView === 'month') {
      const weekData = this._buildWeekDays(this.data.calendarSelectedDate)
      this.setData({ calendarView: 'week', calendarWeekDays: weekData, calendarWeekTitle: weekData.title })
    } else {
      this.setData({ calendarView: 'month' })
    }
  },

  onCalTouchStart(e) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      this._calPinchDist = Math.sqrt(dx * dx + dy * dy)
    } else {
      this._calPinchDist = 0
    }
  },

  onCalTouchMove(e) {
    if (e.touches.length !== 2 || !this._calPinchDist) return
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const ratio = Math.sqrt(dx * dx + dy * dy) / this._calPinchDist
    if (ratio > 1.3 && this.data.calendarView === 'month') {
      this.setData({ calendarView: 'week', calendarWeekDays: this._buildWeekDays(this.data.calendarSelectedDate) })
      this._calPinchDist = 0
    } else if (ratio < 0.75 && this.data.calendarView === 'week') {
      this.setData({ calendarView: 'month' })
      this._calPinchDist = 0
    }
  },
  // 未购课方法
  onProvinceChange(e) {
    const index = e.detail.value
    this.setData({
      provinceIndex: index,
      selectedProvince: this.data.provinces[index]
    })
  },
  goCourseDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/course-intro/course-intro?id=${id}` })
  }
})
