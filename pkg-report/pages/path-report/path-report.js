Page({
  data: {
    pointName: '当前卡点',
    stageIndex: '5 / 6',
    stageName: '报告',
    stageSubtitle: '完成测试后，这里会给你一个阶段鼓励。',
    sectionTitle: '阶段鼓励',
    pathItems: [
      {
        title: '恭喜你完成本卡点第一阶段的学习',
        status: 'current',
      },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '报告',
    })
  },
})
