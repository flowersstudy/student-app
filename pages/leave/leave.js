const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')
const { fetchStudentLeaveRecords, fetchStudentProfile, submitStudentLeave } = require('../../utils/student-api')


function getStepsForPoint() {
  return [
    'Day 1 · 1v1共识课',
    'Day 3 · 1v1纠偏课'
  ]
}

function fmtTime(date) {
  const d = date || new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toPointItem(course = {}) {
  return {
    id: Number(course.course_id || course.courseId || course.id || 0),
    name: course.name || '',
    subject: course.subject || '',
    progress: Number(course.progress || 0),
    status: course.status || '',
  }
}

function formatLeaveDays(days) {
  const safeDays = Math.max(1, Number(days || 1))
  return safeDays >= 7 ? '7天及以上' : `${safeDays}天`
}

function getLatestActiveLeave(records = []) {
  return records.find((item) => item.status === 'pending' || item.status === 'approved') || null
}

function buildLeaveHistoryMap(records = []) {
  return records.reduce((acc, item) => {
    const courseId = Number(item.course_id || item.courseId || 0)
    if (!courseId || item.status === 'rejected') {
      return acc
    }

    acc[courseId] = (acc[courseId] || 0) + 1
    return acc
  }, {})
}

function buildSubmittedInfo(record = {}) {
  return {
    leaveType: record.type || 'single',
    pointName: record.point_name || '',
    stepName: record.step_name || '',
    days: formatLeaveDays(record.days),
    reason: record.reason || '',
    submitTime: record.created_at ? fmtTime(new Date(record.created_at)) : fmtTime(new Date()),
  }
}

Page({
  data: {
    uiIcons,
    leaveType: 'single',

    purchasedPoints: [],
    pointNames: [],
    pointIndex: 0,
    steps: [],
    stepIndex: 0,

    // 请假天数选项（index 6 = 7天及以上）
    daysOptions: ['1天', '2天', '3天', '4天', '5天', '6天', '7天及以上'],
    daysIndex: 0,

    // 每卡点已请假次数（上线后从服务端拉取）
    leaveHistory: { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
    currentPointLeaveCount: 0,

    // 警告状态
    warnMaxLeaves: false,   // 该卡点已请假2次
    warnLongLeave: false,   // 请假天数≥7天

    // 请假预警（根据学习进度 + 考试时间动态生成）
    leaveWarning: null,
    // leaveWarning 结构：
    // {
    //   days: 2,                                               // 请假天数
    //   newResumeDate: '4月5日',                               // 预计恢复学习日期（TODO：接入真实数据）
    //   examAlert: '距离考试仅剩 12 天，顺延后建议与老师加快进度', // 考试紧迫提示（无考试时为 null）
    //   priority: 'high' | 'medium' | 'low'
    // }

    reason: '',

    // 提交后状态
    submitted: false,
    approvalStatus: 'pending',  // 'pending' | 'approved'
    submittedInfo: null
  },

  onLoad(options) {
    const type = options.type || 'single'
    this.setData({ leaveType: type })
    this.refreshLeaveState({
      pointId: options.pointId,
      stepIndex: options.stepIndex,
      leaveType: type,
    })
  },

  onShow() {
    this.refreshLeaveState()
  },

  async refreshLeaveState(options = {}) {
    const leaveType = options.leaveType || this.data.leaveType || 'single'

    try {
      const [profile, leaveRecords] = await Promise.all([
        fetchStudentProfile(app),
        fetchStudentLeaveRecords(app),
      ])

      const inProgress = Array.isArray(profile && profile.inProgress) ? profile.inProgress : []
      const completed = Array.isArray(profile && profile.completed) ? profile.completed : []
      const purchasedPoints = [...inProgress, ...completed].map(toPointItem)

      if (purchasedPoints.length) {
        const xingcePoints = purchasedPoints.filter((item) => String(item.subject || '').includes('行测'))
        const shenlunPoints = purchasedPoints.filter((item) => !String(item.subject || '').includes('行测'))
        app.globalData.xingcePoints = xingcePoints
        app.globalData.shenlunPoints = shenlunPoints
      }

      const pointNames = purchasedPoints.map((item) => item.name)
      const leaveHistory = buildLeaveHistoryMap(leaveRecords)
      const latestLeave = getLatestActiveLeave(leaveRecords)

      let pointIndex = Number(this.data.pointIndex || 0)
      const pointId = Number(options.pointId || 0)
      if (pointId) {
        const matchedIndex = purchasedPoints.findIndex((item) => Number(item.id) === pointId)
        if (matchedIndex >= 0) {
          pointIndex = matchedIndex
        }
      } else if (purchasedPoints[pointIndex] == null) {
        pointIndex = 0
      }

      const point = purchasedPoints[pointIndex] || { id: 0, name: '' }
      const steps = getStepsForPoint(point)
      let stepIndex = Number(this.data.stepIndex || 0)
      if (options.stepIndex !== undefined) {
        stepIndex = Math.min(Number(options.stepIndex) || 0, steps.length - 1)
      } else if (stepIndex > steps.length - 1) {
        stepIndex = 0
      }

      const currentPointLeaveCount = leaveHistory[point.id] || 0
      const submitted = !!latestLeave
      const approvalStatus = latestLeave && latestLeave.status === 'approved' ? 'approved' : 'pending'
      const submittedInfo = latestLeave ? buildSubmittedInfo(latestLeave) : null

      if (latestLeave) {
        app.globalData.leaveStatus = {
          active: true,
          approvalStatus,
          pointName: submittedInfo.pointName,
          stepName: submittedInfo.stepName,
          days: submittedInfo.days,
          submitTime: submittedInfo.submitTime,
        }
      } else {
        app.globalData.leaveStatus = {
          active: false,
          approvalStatus: '',
          pointName: '',
          stepName: '',
          days: '',
          submitTime: '',
        }
      }

      this.setData({
        leaveType,
        purchasedPoints,
        pointNames,
        pointIndex,
        steps,
        stepIndex,
        leaveHistory,
        currentPointLeaveCount,
        warnMaxLeaves: leaveType === 'single' && currentPointLeaveCount >= 2,
        submitted,
        approvalStatus,
        submittedInfo,
      }, () => this._computeLeaveWarning())
    } catch (error) {
      console.warn('请假页真实数据加载失败:', error && error.message ? error.message : error)
      wx.showToast({
        title: (error && error.message) || '请假信息加载失败',
        icon: 'none',
      })
    }
  },

  selectType(e) {
    const leaveType = e.currentTarget.dataset.type
    this.setData(
      { leaveType, warnMaxLeaves: leaveType === 'all' ? false : this.data.currentPointLeaveCount >= 2 },
      () => this._computeLeaveWarning()
    )
  },

  onPointChange(e) {
    const pointIndex = parseInt(e.detail.value)
    const point = this.data.purchasedPoints[pointIndex]
    const steps = getStepsForPoint()
    const currentPointLeaveCount = this.data.leaveHistory[point.id] || 0
    this.setData(
      { pointIndex, steps, stepIndex: 0, currentPointLeaveCount, warnMaxLeaves: currentPointLeaveCount >= 2 },
      () => this._computeLeaveWarning()
    )
  },

  onStepChange(e) {
    this.setData({ stepIndex: parseInt(e.detail.value) }, () => this._computeLeaveWarning())
  },

  onDaysChange(e) {
    const daysIndex = parseInt(e.detail.value)
    this.setData({ daysIndex, warnLongLeave: daysIndex >= 6 }, () => this._computeLeaveWarning())
  },

  // ─────────────────────────────────────────────────────────────────
  // 请假预警计算
  // 后期需要接入两个数据源：
  //   1. 学习进度接口：返回当前卡点从 stepIndex 往后还有哪些未完成节点
  //      接口格式建议：{ remainingSteps: ['Day 4 · 刷题', 'Day 5 · 刷题', 'Day 7 · 考试'] }
  //   2. 考试时间接口：返回学生下次考试日期
  //      接口格式建议：{ examDate: '2026-04-20' }
  // ─────────────────────────────────────────────────────────────────
  _computeLeaveWarning() {
    const { leaveType, daysIndex, purchasedPoints, pointIndex, steps, stepIndex } = this.data
    const days = daysIndex + 1  // 1天~6天；index=6 对应7天及以上，按7计

    // ── TODO 1：替换为真实恢复日期 ──────────────────────────────────
    // 上线后从接口获取学生当前预计恢复学习日期，再加上请假天数
    // 目前用今天 + 请假天数简单估算
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const resumeDate = new Date(today.getTime() + days * 86400000)
    const month = resumeDate.getMonth() + 1
    const day = resumeDate.getDate()
    const newResumeDate = `${month}月${day}日`
    // ────────────────────────────────────────────────────────────────

    // ── TODO 2：替换为真实考试时间数据 ──────────────────────────────
    // 上线后从接口获取 examDate
    const examDate = null  // 示例：new Date('2026-04-20')
    let examAlert = null
    let priority = 'low'
    if (examDate) {
      const daysUntilExam = Math.round((examDate - today) / 86400000)
      if (daysUntilExam <= 7) {
        examAlert = `距离考试仅剩 ${daysUntilExam} 天，顺延后可能来不及完成全部学习内容，请谨慎考虑`
        priority = 'high'
      } else if (daysUntilExam <= 14) {
        examAlert = `距离考试还有 ${daysUntilExam} 天，顺延后时间较紧，建议与老师确认学习安排`
        priority = 'medium'
      }
    }
    // ────────────────────────────────────────────────────────────────

    // TODO：接入数据库后，在此补充 missedContent 字段
    // missedContent: ['1v1纠偏课', '刷题 Day4~6'] 等具体内容
    // 并在 wxml 中替换"期间可能涉及的学习内容"为真实列表
    this.setData({ leaveWarning: { days, newResumeDate, examAlert, priority } })
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value })
  },

  selectMakeup(e) {
    this.setData({ makeup: e.currentTarget.dataset.val })
  },

  goChat() {
    wx.switchTab({ url: '/pages/chat/chat' })
  },

  submit() {
    const { leaveType, warnMaxLeaves, warnLongLeave, reason,
            purchasedPoints, pointIndex, steps, stepIndex, daysOptions, daysIndex } = this.data


    if (leaveType === 'single' && warnMaxLeaves) {
      wx.showToast({ title: '该卡点已达请假上限，请联系学管', icon: 'none', duration: 2500 })
      return
    }
    if (warnLongLeave) {
      wx.showToast({ title: '请先与学管沟通后再提交', icon: 'none', duration: 2500 })
      return
    }
    if (!reason.trim()) {
      wx.showToast({ title: '请填写请假原因', icon: 'none' })
      return
    }

    const point = purchasedPoints[pointIndex]
    const step  = steps[stepIndex]
    const days  = daysOptions[daysIndex]

    const detailText = leaveType === 'single'
      ? `卡点：${point.name}\n课节：${step}\n时长：${days}`
      : `整体请假\n时长：${days}`

    wx.showModal({
      title: '确认提交',
      content: `${detailText}\n\n提交后将通知带教老师和学管，确认吗？`,
      success: async (res) => {
        if (!res.confirm) return

        try {
          wx.showLoading({ title: '提交中...', mask: true })
          await submitStudentLeave({
            type: leaveType,
            courseId: leaveType === 'single' ? point.id : null,
            pointName: leaveType === 'single' ? point.name : '',
            stepName: leaveType === 'single' ? step : '',
            days: daysIndex >= 6 ? 7 : daysIndex + 1,
            reason,
          }, app)

          wx.hideLoading()
          wx.showToast({ title: '请假申请已提交', icon: 'success' })
          await this.refreshLeaveState({
            pointId: leaveType === 'single' ? point.id : '',
            stepIndex,
            leaveType,
          })
        } catch (error) {
          wx.hideLoading()
          wx.showToast({
            title: (error && error.message) || '提交失败，请稍后重试',
            icon: 'none',
            duration: 2500,
          })
        }
      }
    })
  }
})
