const { createDemoSession } = require('./utils/offline')

App({
  globalData: {
    userInfo: null,
    isEnrolled: false,
    serverBase: 'http://localhost:3001',  // 开发环境后端地址
    // 请假状态（leave.js 提交后写入，progress.js 销假时清除）
    leaveStatus: {
      active: false,          // 是否处于请假中
      approvalStatus: '',     // 'pending' | 'approved'
      pointName: '',
      stepName: '',
      days: '',
      submitTime: ''
    },
    userProfile: {
      name: '张三',
      gender: '男',
      grade: '2026届',
      hometown: '湖南省',
      examStatus: '备考中',
      examTime: '2026年4月',
      education: '本科',
      major: '汉语言文学',
      avatar: ''
    },
    diagnosis: {
      targetExam: '国考行测申论',
      targetScore: 130,
      diagnosisScore: 108,
      scoreGap: 22
    }
  },
  onLaunch() {
    const storedToken = wx.getStorageSync('student_token')
    const storedInfo = wx.getStorageSync('student_info')

    if (storedToken && storedInfo) {
      this.globalData.token = storedToken
      this.globalData.isEnrolled = storedInfo.status !== 'new'
      this.globalData.userProfile.name = storedInfo.name || this.globalData.userProfile.name
      console.log('App launched')
      return
    }

    const demo = createDemoSession(1)
    wx.setStorageSync('student_token', demo.token)
    wx.setStorageSync('student_info', {
      id: demo.id,
      name: demo.name,
      status: demo.status
    })
    this.globalData.token = demo.token
    this.globalData.isEnrolled = demo.status !== 'new'
    this.globalData.userProfile.name = demo.name
    console.log('App launched')
  },
  onError(err) {
    console.error('全局错误:', JSON.stringify(err))
  },
  onUnhandledRejection(res) {
    console.error('未处理的Promise拒绝:', JSON.stringify(res))
  }
})
