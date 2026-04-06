const app = getApp()

// 各卡点标准学习路径
// 来源：卡点体系完整汇报_按四体系整理.xlsx · 学习路径 · 标准版路径
// extra 为 null 表示刷题无额外专项；有内容时 Day4-6 追加对应专项子任务
// 课程内容（视频ID、讲义文件）在各 lesson 页面中维护，后期按卡点接入
function buildTasks(pointName, extra) {
  const drillLabel = extra ? `刷题 + ${extra}` : '刷题'
  return [
    {
      id: 1, day: 'Day 1', label: '1v1共识课', type: 'live',
      status: '待开始', url: '/pages/lesson-live/lesson-live', btnText: '去学习'
    },
    {
      id: 2, day: 'Day 2', label: '理论录播课', type: 'recorded',
      status: '待开始', url: '/pages/lesson-recorded/lesson-recorded',
      btnText: '去学习', expanded: false,
      subTasks: [
        { id: 1, title: `${pointName}·理论精讲`, status: '待开始', url: '/pages/lesson-recorded/lesson-recorded' },
        { id: 2, title: '课后作业讲解',           status: '待开始', url: '/pages/lesson-recorded/lesson-recorded' }
      ]
    },
    {
      id: 3, day: 'Day 3', label: '1v1纠偏课', type: 'correct',
      status: '待开始', url: '/pages/lesson-correct/lesson-correct', btnText: '去学习'
    },
    {
      id: 4, day: 'Day 4', label: drillLabel, type: 'drill',
      status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=1',
      btnText: '去练习', expanded: false,
      subTasks: extra
        ? [{ id: 1, title: '第一题', status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=1' },
           { id: 2, title: extra,   status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=1' }]
        : [{ id: 1, title: '第一题', status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=1' }]
    },
    {
      id: 5, day: 'Day 5', label: drillLabel, type: 'drill',
      status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=2',
      btnText: '去练习', expanded: false,
      subTasks: extra
        ? [{ id: 1, title: '第二题', status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=2' },
           { id: 2, title: extra,   status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=2' }]
        : [{ id: 1, title: '第二题', status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=2' }]
    },
    {
      id: 6, day: 'Day 6', label: drillLabel, type: 'drill',
      status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=3',
      btnText: '去练习', expanded: false,
      subTasks: extra
        ? [{ id: 1, title: '第三题', status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=3' },
           { id: 2, title: extra,   status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=3' }]
        : [{ id: 1, title: '第三题', status: '待开始', url: '/pages/lesson-drill/lesson-drill?set=3' }]
    },
    {
      id: 7, day: 'Day 7', label: '阶段考试', type: 'exam',
      status: '待开始', url: '/pages/lesson-exam/lesson-exam', btnText: '去考试'
    }
  ]
}

// 卡点基础信息（extra 来源：Excel 学习路径列）
const contentMap = {
  1: { pointName: '游走式找点',    extra: null,
       teacher: { assigned: true,  id: 1, name: '李老师', title: '申论主讲',   avatar: '李', years: 5, specialty: ['归纳概括','综合分析'] } },
  2: { pointName: '提炼转述错误',  extra: '背诵规范词',
       teacher: { assigned: true,  id: 1, name: '李老师', title: '申论主讲',   avatar: '李', years: 5, specialty: ['归纳概括','综合分析'] } },
  3: { pointName: '分析结构错误',  extra: null,
       teacher: { assigned: false } },
  4: { pointName: '公文结构错误',  extra: null,
       teacher: { assigned: true,  id: 2, name: '王老师', title: '公文写作专项', avatar: '王', years: 7, specialty: ['公文写作','应用文'] } },
  5: { pointName: '对策推导错误',  extra: '常规对策积累',
       teacher: { assigned: true,  id: 1, name: '李老师', title: '申论主讲',   avatar: '李', years: 5, specialty: ['归纳概括','综合分析'] } },
  6: { pointName: '作文立意错误',  extra: null,
       teacher: { assigned: true,  id: 3, name: '陈老师', title: '大作文专项',  avatar: '陈', years: 6, specialty: ['大作文立意','文章结构'] } },
  7: { pointName: '作文逻辑不清晰', extra: '论据背诵',
       teacher: { assigned: false } },
  8: { pointName: '作文表达不流畅', extra: '语言积累背诵',
       teacher: { assigned: false } }
}

Page({
  data: {
    pointId: null,
    teacher: { name: '', subject: '', avatar: '' },
    overallProgress: 0,
    progressStatus: '正常',
    tasks: []
  },

  onLoad(options) {
    const pointId = parseInt(options.id) || null
    this.setData({ pointId })

    const content = contentMap[pointId]
    if (content) {
      const tasks = buildTasks(content.pointName, content.extra)
      const done = tasks.filter(t => t.status === '已完成').length
      const overallProgress = Math.round(done / tasks.length * 100)
      this.setData({
        tasks,
        overallProgress,
        teacher: content.teacher || { assigned: false }
      })
    }
    // TODO: 其他卡点从接口拉取数据
  },

  goTeacher() {
    const t = this.data.teacher
    if (!t || !t.assigned) return
    const app = getApp()
    app.globalData.currentTeacher = t
    wx.navigateTo({ url: '/pages/teacher/teacher' })
  },

  goTask(e) {
    const url = e.currentTarget.dataset.url
    this._checkLeaveAndNavigate(url)
  },

  toggleExpand(e) {
    const taskId = parseInt(e.currentTarget.dataset.taskid)
    const tasks = this.data.tasks.map(t =>
      t.id === taskId ? { ...t, expanded: !t.expanded } : t
    )
    this.setData({ tasks })
  },

  goSubTask(e) {
    const url = e.currentTarget.dataset.url
    this._checkLeaveAndNavigate(url)
  },

  _checkLeaveAndNavigate(url) {
    const ls = app.globalData.leaveStatus
    if (!ls || !ls.active) {
      wx.navigateTo({ url })
      return
    }

    const statusText = ls.approvalStatus === 'approved' ? '（已批准）' : '（审批中）'
    const detail = ls.pointName
      ? `卡点：${ls.pointName}\n课节：${ls.stepName}`
      : '整体请假'

    wx.showModal({
      title: '你当前处于请假状态',
      content: `${detail}\n时长：${ls.days} ${statusText}\n\n开始学习将自动销假，是否继续？`,
      confirmText: '销假继续',
      cancelText: '暂不学习',
      success: (res) => {
        if (!res.confirm) return
        app.globalData.leaveStatus = {
          active: false, approvalStatus: '', pointName: '',
          stepName: '', days: '', submitTime: ''
        }
        wx.navigateTo({ url })
      }
    })
  }
})
