const app = getApp()

Page({
  data: {
    isEnrolled: false,
    stats: {
      scoreGap: 22,
      solved: 3,
      pending: 5
    },
    totalStudyDisplay: '20h 40m',
    studyTimeExpanded: false,
    studyTimeByPoint: [
      { id: 2, name: '提炼转述错误', display: '6h 20m', pct: 31 },
      { id: 4, name: '公文结构错误', display: '5h 20m', pct: 26 },
      { id: 6, name: '作文立意错误', display: '4h 40m', pct: 23 },
      { id: 1, name: '游走式找点',   display: '2h 20m', pct: 11 },
      { id: 5, name: '对策推导错误', display: '2h 00m', pct: 10 }
    ],
    solvedPoints: [
      { id: 2, name: '提炼转述错误', completedAt: '2026-03-10', summary: '已掌握主题句提炼技巧，答题准确率提升30%' },
      { id: 4, name: '公文结构错误', completedAt: '2026-03-18', summary: '公文格式与套路熟练掌握，得分稳定' },
      { id: 6, name: '作文立意错误', completedAt: '2026-03-22', summary: '立意跑偏问题已解决，审题准确率显著提升' }
    ],
    pendingPoints: [
      { id: 1, name: '游走式找点', desc: '找点逻辑尚不清晰，需加强材料精读训练' },
      { id: 5, name: '对策推导错误', desc: '对策思维不足，需结合真题反复练习' },
      { id: 3, name: '分析结构错误', desc: '材料分析框架尚未建立，需重点突破' },
      { id: 7, name: '作文逻辑不清晰', desc: '论述结构混乱，缺乏逻辑层次感' },
      { id: 8, name: '作文表达不流畅', desc: '书面表达不规范，语言过于口语化' }
    ]
  },
  onShow() {
    this.setData({ isEnrolled: app.globalData.isEnrolled })
  },
  onLoad() {},
  toggleStudyTime() {
    this.setData({ studyTimeExpanded: !this.data.studyTimeExpanded })
  },
  goEnroll() {
    wx.switchTab({ url: '/pages/home/home' })
  },
  goCardDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${id}` })
  }
})
