Page({
  data: {
    pointName: '当前卡点',
    stageIndex: '6 / 6',
    stageName: '报告',
    stageSubtitle: '按顺序查看最终刷题报告和阶段总结。',
    sectionTitle: '报告路径',
    pathItems: [
      { title: '查看刷题报告', desc: '查看该卡点最终刷题报告、阶段复盘和成长结论。', status: 'current', actionText: '查看', actionLabel: '刷题报告' },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '报告',
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
