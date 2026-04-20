const { normalizeStudyOptions } = require('../../../utils/study-route')

Page({
  data: {
    pointName: '当前卡点',
  },

  onLoad(options) {
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: '当前卡点',
    })

    this.setData({
      pointName: this.studyOptions.pointName,
    })

    wx.setNavigationBarTitle({
      title: '学习完成',
    })
  },
})
