const app = getApp()

// 老师详情数据（后期接入后端）
const teacherProfiles = {
  1: {
    name: '李老师', title: '申论主讲', avatar: '李', years: 5,
    specialty: ['归纳概括', '综合分析', '提出对策'],
    bio: '毕业于中国人民大学，专注申论教学5年，累计辅导学员500+，申论平均提分16分。擅长帮助学员找准失分根源，精准击破申论卡点。',
    highlights: [
      { label: '辅导学员', value: '500+' },
      { label: '平均提分', value: '+16分' },
      { label: '好评率',   value: '98%' }
    ]
  },
  2: {
    name: '王老师', title: '公文写作专项', avatar: '王', years: 7,
    specialty: ['公文写作', '应用文格式', '通知公告'],
    bio: '曾任职于政府机关，7年一线公文写作经验，深谙各类公文格式要求。授课风格严谨务实，帮助学员快速掌握公文核心套路。',
    highlights: [
      { label: '辅导学员', value: '300+' },
      { label: '平均提分', value: '+12分' },
      { label: '好评率',   value: '97%' }
    ]
  },
  3: {
    name: '陈老师', title: '大作文专项', avatar: '陈', years: 6,
    specialty: ['大作文立意', '文章结构', '论证逻辑'],
    bio: '专注申论大作文辅导6年，深入研究历年真题立意规律，帮助学员解决"会写但跑题"的核心问题，大作文平均提分8分。',
    highlights: [
      { label: '辅导学员', value: '400+' },
      { label: '作文提分', value: '+8分' },
      { label: '好评率',   value: '99%' }
    ]
  }
}

Page({
  data: {
    teacher: null
  },

  onLoad() {
    const t = app.globalData.currentTeacher
    if (!t || !t.id) return
    const profile = teacherProfiles[t.id]
    if (profile) this.setData({ teacher: profile })
  },

  goChat() {
    wx.switchTab({ url: '/pages/chat/chat' })
  }
})
