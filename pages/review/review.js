const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    uiIcons,
    triggerIcon: uiIcons.bell,
    totalStudyDisplay: '20h 40m',
    totalPoints: 1260,
    // 触发类型：interrupted / cycle_end / all_complete
    triggerType: 'interrupted',
    triggerLabel: '学习中断提醒',
    triggerDesc: '你已 3 天未学习，及时复习可以防止遗忘',

    reviewGroups: [
      {
        id: 1,
        name: '游走式找点',
        expanded: true,
        groupCheckedCount: 0,
        knowledgePoints: [
          { id: 1, title: '主题句 + 支撑句双层找点框架', checked: false },
          { id: 2, title: '用标志词快速定位关键信息', checked: false },
          { id: 3, title: '段落级→全文级递进找点逻辑', checked: false }
        ]
      },
      {
        id: 5,
        name: '对策推导错误',
        expanded: false,
        groupCheckedCount: 0,
        knowledgePoints: [
          { id: 1, title: '从材料中"找"对策，而非凭空"想"对策', checked: false },
          { id: 2, title: '对策五种来源：问题反推、经验借鉴、政策援引等', checked: false },
          { id: 3, title: '"主体—措施—目的"三段式对策表达结构', checked: false }
        ]
      }
    ],
    totalReviewPoints: 6,
    checkedCount: 0,
    allChecked: false,
    showFeedback: false,

    feedbackMessages: [
      {
        id: 1,
        type: 'voice',
        teacher: '李老师',
        avatar: '李',
        duration: '1\'23"',
        label: '游走式找点 · 核心框架回顾'
      },
      {
        id: 2,
        type: 'voice',
        teacher: '李老师',
        avatar: '李',
        duration: '0\'58"',
        label: '对策推导 · 五种来源速记'
      },
      {
        id: 3,
        type: 'video',
        teacher: '李老师',
        avatar: '李',
        title: '两个卡点综合复习讲解',
        duration: '4\'12"'
      }
    ]
  },

  onLoad(options) {
    const type = options.type || 'interrupted'
    const typeMap = {
      interrupted: { label: '学习中断提醒', desc: '你已 ' + (options.days || 3) + ' 天未学习，及时复习可以防止遗忘', icon: uiIcons.bell },
      cycle_end:   { label: '阶段复习提醒', desc: '「' + (options.pointName || '') + '」学习结束已满 8 天，建议回顾巩固', icon: uiIcons.calendar },
      all_complete:{ label: '全部完成复习', desc: '所有卡点学习完成已满 2 天，进行一次全面复习效果更佳', icon: uiIcons.check }
    }
    const info = typeMap[type] || typeMap['interrupted']
    this.setData({ triggerType: type, triggerLabel: info.label, triggerDesc: info.desc, triggerIcon: info.icon })

    // 统计总知识点数
    let total = 0
    this.data.reviewGroups.forEach(g => { total += g.knowledgePoints.length })
    this.setData({ totalReviewPoints: total })
  },

  toggleGroup(e) {
    const id = e.currentTarget.dataset.id
    const groups = this.data.reviewGroups.map(g =>
      g.id === id ? { ...g, expanded: !g.expanded } : g
    )
    this.setData({ reviewGroups: groups })
  },

  toggleCheck(e) {
    const { groupid, pointid } = e.currentTarget.dataset
    const groups = this.data.reviewGroups.map(g => {
      if (g.id !== groupid) return g
      const knowledgePoints = g.knowledgePoints.map(p =>
        p.id === pointid ? { ...p, checked: !p.checked } : p
      )
      const groupCheckedCount = knowledgePoints.filter(p => p.checked).length
      return { ...g, knowledgePoints, groupCheckedCount }
    })

    let checkedCount = 0
    groups.forEach(g => g.knowledgePoints.forEach(p => { if (p.checked) checkedCount++ }))
    const allChecked = checkedCount === this.data.totalReviewPoints

    this.setData({ reviewGroups: groups, checkedCount, allChecked })
  },

  goLearningSquare() {
    wx.showToast({ title: '学习广场内容待补充', icon: 'none', duration: 1800 })
  },

  finishReview() {
    this.setData({ showFeedback: true })
    wx.pageScrollTo({ scrollTop: 99999, duration: 400 })
  },

  playVoice(e) {
    const label = e.currentTarget.dataset.label
    wx.showToast({ title: '播放：' + label, icon: 'none', duration: 2000 })
  },

  playVideo(e) {
    const title = e.currentTarget.dataset.title
    wx.showToast({ title: '播放：' + title, icon: 'none', duration: 2000 })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
