Page({
  data: {
    pointName: '当前卡点',
    stageIndex: '2 / 6',
    stageName: '理论',
    stageSubtitle: '按「1v1共识 → 理论课 → 1v1纠偏」三层推进，会更清晰。',
    theoryGroups: [
      {
        title: '1v1共识',
        items: [
          { title: '去上课', status: 'current', actionText: '直播课', actionLabel: '1v1共识直播课连接' },
          { title: '已上课', status: 'pending', actionText: '回放课', actionLabel: '1v1共识回放课连接' },
          { title: '课后反馈', status: 'pending', actionText: '查看', actionLabel: '1v1共识课后反馈' },
        ],
      },
      {
        title: '理论课',
        items: [
          { title: '课前讲义', status: 'pending', actionText: '查看', actionLabel: '课前讲义' },
          { title: '理论课', status: 'pending', actionText: '去上课', actionLabel: '理论课' },
          { title: '课后作业', status: 'pending', actionText: '查看', actionLabel: '课后作业' },
          { title: '视频讲解', status: 'pending', actionText: '观看', actionLabel: '视频讲解' },
          { title: '课后作业（二）', status: 'pending', actionText: '查看', actionLabel: '课后作业' },
        ],
      },
      {
        title: '1v1纠偏',
        items: [
          { title: '去上课', status: 'pending', actionText: '直播课', actionLabel: '1v1纠偏直播课连接' },
          { title: '已上课', status: 'pending', actionText: '回放课', actionLabel: '1v1纠偏回放课连接' },
          { title: '课后反馈', status: 'pending', actionText: '查看', actionLabel: '1v1纠偏课后反馈' },
        ],
      },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '理论',
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
