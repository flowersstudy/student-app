const { getDiagnosePathData } = require('../../utils/diagnose-path-data')

Page({
  data: getDiagnosePathData(),

  handleStepTap(e) {
    const { url } = e.currentTarget.dataset
    if (!url) return

    wx.navigateTo({ url })
  },
})
