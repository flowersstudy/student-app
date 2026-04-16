Page({
  data: {
    pointName: '当前卡点',
    stageIndex: '1 / 6',
    stageName: '诊断',
    stageSubtitle: '按顺序完成诊断流程，先把问题找清楚。',
    sectionTitle: '诊断路径',
    pathItems: [
      { title: '诊断群', desc: '进入诊断群，接收诊断安排。', status: 'done' },
      { title: '电话沟通', desc: '确认当前问题和学习目标。', status: 'done' },
      { title: '诊断试卷', desc: '完成诊断试卷，定位真实问题。', status: 'current', actionText: '去完成', actionLabel: '诊断试卷' },
      { title: '听解析课', desc: '听解析，理解错误原因。', status: 'pending', actionText: '去听课', actionLabel: '解析课' },
      { title: '1v1诊断课', desc: '老师针对卡点做 1v1 拆解。', status: 'pending', actionText: '去上课', actionLabel: '1v1诊断课' },
      { title: '报告', desc: '查看诊断报告和学习建议。', status: 'pending', actionText: '查看', actionLabel: '诊断报告' },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'

    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '诊断',
    })
  },

  onActionTap(e) {
    const { label } = e.currentTarget.dataset

    wx.showToast({
      title: `${label || '内容'}待接入`,
      icon: 'none',
    })
  },
})
