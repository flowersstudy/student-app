const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')


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

  autoApproveTimer: null,

  onLoad(options) {
    const type = options.type || 'single'

    const xp = app.globalData.xingcePoints || []
    const sp = app.globalData.shenlunPoints || []
    const all = [...xp, ...sp].sort((a, b) => a.id - b.id)
    const purchasedPoints = all.length > 0 ? all : [
      { id: 1, name: '游走式找点' }, { id: 2, name: '提炼转述错误' },
      { id: 3, name: '分析结构错误' }, { id: 4, name: '公文结构错误' },
      { id: 5, name: '对策推导错误' }, { id: 6, name: '作文立意错误' },
      { id: 7, name: '作文逻辑不清晰' }, { id: 8, name: '作文表达不流畅' }
    ]
    const pointNames = purchasedPoints.map(p => p.name)

    let pointIndex = 0
    if (options.pointId) {
      const idx = purchasedPoints.findIndex(p => p.id === parseInt(options.pointId))
      if (idx >= 0) pointIndex = idx
    }

    const point = purchasedPoints[pointIndex]
    const steps = getStepsForPoint()
    const currentPointLeaveCount = this.data.leaveHistory[point.id] || 0

    let stepIndex = 0
    if (options.stepIndex) stepIndex = Math.min(parseInt(options.stepIndex), steps.length - 1)

    this.setData({
      leaveType: type, purchasedPoints, pointNames,
      pointIndex, steps, stepIndex,
      currentPointLeaveCount,
      warnMaxLeaves: currentPointLeaveCount >= 2
    })
  },

  onUnload() {
    if (this.autoApproveTimer) clearTimeout(this.autoApproveTimer)
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
      success: (res) => {
        if (!res.confirm) return

        // 更新请假次数
        const leaveHistory = { ...this.data.leaveHistory }
        if (leaveType === 'single') leaveHistory[point.id] = (leaveHistory[point.id] || 0) + 1

        const submittedInfo = {
          leaveType,
          pointName: leaveType === 'single' ? point.name : '',
          stepName:  leaveType === 'single' ? step : '',
          days,
          reason,
          submitTime: fmtTime(new Date())
        }

        this.setData({ submitted: true, approvalStatus: 'pending', leaveHistory, submittedInfo })

        // 写入全局请假状态（progress 页销假检测用）
        app.globalData.leaveStatus = {
          active: true,
          approvalStatus: 'pending',
          pointName: submittedInfo.pointName,
          stepName: submittedInfo.stepName,
          days: submittedInfo.days,
          submitTime: submittedInfo.submitTime
        }

        // 2小时后系统自动同意
        this.autoApproveTimer = setTimeout(() => {
          this.setData({ approvalStatus: 'approved' })
          app.globalData.leaveStatus.approvalStatus = 'approved'
          wx.showToast({ title: '老师已同意请假', icon: 'success', duration: 2500 })
        }, 2 * 60 * 60 * 1000)
      }
    })
  }
})
