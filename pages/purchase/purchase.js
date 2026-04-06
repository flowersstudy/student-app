Page({
  data: {
    pointInfo: {
      name: '作文逻辑不清晰',
      type: '申论卡点',
      desc: '针对申论写作中常见的"作文逻辑不清晰"问题，通过系统性的纠偏训练，帮助学员建立逻辑清晰、论证有力的写作框架。',
      details: [
        '1节1v1纠偏课，45分钟，¥1080元',
        '1节理论录播课，约60分钟，免费',
        '配套刷题资料与讲义',
        '课后老师点评与指导',
        '无限次提问答疑'
      ]
    },
    unitPrice: 1080,
    totalPrice: 1080,
    // 学习团队：校长和学管默认分配，带教老师由诊断老师分配
    team: [
      {
        role: '校长',
        name: '陈校长',
        avatar: '陈',
        tag: '全程督导',
        desc: '统筹学习资源，保障整体教学质量',
        status: 'assigned'   // 默认已分配，锁定
      },
      {
        role: '学管',
        name: '小美老师',
        avatar: '美',
        tag: '学习管家',
        desc: '跟进学习进度，协调教学安排，处理请假等事务',
        status: 'assigned'
      },
      {
        role: '带教老师',
        name: '',
        avatar: '',
        tag: '专属辅导',
        desc: '由诊断老师根据你的卡点诊断结果，在付款后24小时内完成分配',
        status: 'pending'    // 待诊断老师分配
      }
    ]
  },

  onLoad() {},

  goPayment() {
    wx.showToast({ title: '付款成功', icon: 'success', duration: 1500 })
    setTimeout(() => {
      wx.switchTab({ url: '/pages/home/home' })
    }, 1500)
  }
})
