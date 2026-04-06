const pointMap = {
  1: { name: '游走式找点',    type: '行测卡点' },
  2: { name: '提炼转述错误',  type: '行测卡点' },
  3: { name: '分析结构错误',  type: '行测卡点' },
  4: { name: '公文结构错误',  type: '申论卡点' },
  5: { name: '对策推导错误',  type: '申论卡点' },
  6: { name: '作文立意错误',  type: '申论卡点' },
  7: { name: '作文逻辑不清晰', type: '申论卡点' },
  8: { name: '作文表达不流畅', type: '申论卡点' }
}

Page({
  data: {
    pointId: 2,
    pointName: '提炼转述错误',
    pointType: '行测卡点',

    // 1. 学习时长
    studyDisplay: '6h 20m',

    // 2. 刷题数据
    drillTotal: 48,
    drillCorrect: 35,
    drillAccuracy: 72.9,
    drillExpanded: false,
    drillRecords: [
      { id: 1, date: '2026-03-08', label: 'Day 4 · 第一套刷题', correct: 8, total: 10, status: '已批改' },
      { id: 2, date: '2026-03-09', label: 'Day 5 · 第二套刷题', correct: 7, total: 10, status: '已批改' },
      { id: 3, date: '2026-03-10', label: 'Day 6 · 第三套刷题', correct: 9, total: 10, status: '已批改' }
    ],

    // 3. 考试
    examExpanded: false,
    examRecords: [
      { id: 1, date: '2026-03-11', label: '阶段考试', score: 82, passLine: 75, status: '已批改' }
    ],

    // 4. 学习纪录（"历史上的今天"风格）
    studyRecords: [
      { id: 1, title: '最晚学习',    value: '23:47',   desc: '你曾在深夜还坚持学习，这份执着令人钦佩' },
      { id: 2, title: '最早开始',    value: '06:58',   desc: '黎明即起，争分夺秒，是最勤奋的备考人' },
      { id: 3, title: '最长专注',    value: '2h 33m',  desc: '单次专注超2小时，专注力令人赞叹' },
      { id: 4, title: '老师最晚批改', value: '00:23',   desc: '老师深夜0点还在认真批改，感谢老师的辛勤付出' }
    ],

    // 5. 请假记录
    leaveCount: 1,
    leaveMax: 2,

    // 老师寄语
    teacherMessage: '同学你好！通过这段时间的学习，我观察到你在"提炼转述错误"这个卡点上有了明显的进步。你已经能够准确抓住材料的主要论点，不再像之前那样容易被次要信息带偏。\n\n接下来建议你继续加强在复杂材料中快速定位核心主题的练习。遇到长段落时，先找关键词，再梳理逻辑关系，这样能让你的提炼更加精准。\n\n相信你一定能在考试中取得好成绩，加油！',
    messageExpanded: false
  },

  onLoad(options) {
    const id = parseInt(options.id) || 2
    const point = pointMap[id] || pointMap[2]
    this.setData({ pointId: id, pointName: point.name, pointType: point.type })
  },

  // 1. 跳转到该卡点学习路径（含课程回放与资料）
  goProgress() {
    wx.navigateTo({ url: `/pages/progress/progress?id=${this.data.pointId}` })
  },

  // 2. 刷题展开
  toggleDrillExpand() {
    this.setData({ drillExpanded: !this.data.drillExpanded })
  },

  viewDrillRecord() {
    wx.showToast({ title: '加载批改文件…', icon: 'loading', duration: 1500 })
  },

  // 3. 考试展开
  toggleExamExpand() {
    this.setData({ examExpanded: !this.data.examExpanded })
  },

  viewExamRecord() {
    wx.showToast({ title: '加载批改文件…', icon: 'loading', duration: 1500 })
  },

  // 5. 请假记录入口
  goLeave() {
    wx.navigateTo({ url: `/pages/leave/leave?pointId=${this.data.pointId}` })
  },

  toggleMessage() {
    this.setData({ messageExpanded: !this.data.messageExpanded })
  },

  goDiagnoseReport() {
    wx.showToast({ title: '诊断报告生成中', icon: 'loading' })
  },

  goChat() {
    wx.switchTab({ url: '/pages/chat/chat' })
  }
})
