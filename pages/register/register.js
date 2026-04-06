Page({
  data: {
    courses: [
      { id: 1, name: '游走式找点', price: 1080, selected: false },
      { id: 2, name: '提炼转述错误', price: 1080, selected: false },
      { id: 3, name: '分析结构错误', price: 1080, selected: false },
      { id: 4, name: '公文结构错误', price: 1080, selected: false },
      { id: 5, name: '对策推导错误', price: 1080, selected: false },
      { id: 6, name: '作文立意错误', price: 1080, selected: false },
      { id: 7, name: '作文逻辑不清晰', price: 1080, selected: false },
      { id: 8, name: '作文表达不流畅', price: 1080, selected: false }
    ],
    selectedCount: 0,
    totalPrice: 0,
    examples: [
      {
        id: 1,
        name: '李同学',
        exam: '国考',
        grade: '2025届',
        major: '汉语言文学',
        score: 18,
        points: ['提炼转述错误', '作文立意错误'],
        comment: '以前申论总跑题，现在审题准确率高了很多，申论稳定在75分以上。'
      },
      {
        id: 2,
        name: '王同学',
        exam: '省考',
        grade: '2026届',
        major: '行政管理',
        score: 24,
        points: ['分析结构错误', '作文逻辑不清晰'],
        comment: '材料分析终于有逻辑了，不再是把材料抄一遍，老师反馈进步很大。'
      },
      {
        id: 3,
        name: '陈同学',
        exam: '国考',
        grade: '2025届',
        major: '法学',
        score: 15,
        points: ['作文表达不流畅', '对策推导错误'],
        comment: '书面表达提升明显，对策类题目从没思路到能写满，非常感谢老师！'
      }
    ]
  },
  toggleCourse(e) {
    const id = e.currentTarget.dataset.id
    const courses = this.data.courses.map(c => {
      if (c.id === id) return { ...c, selected: !c.selected }
      return c
    })
    const selected = courses.filter(c => c.selected)
    this.setData({ courses, selectedCount: selected.length, totalPrice: selected.length * 1080 })
  },
  goPayment() {
    if (this.data.selectedCount === 0) {
      wx.showToast({ title: '请先选择卡点课程', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/purchase/purchase' })
  }
})
