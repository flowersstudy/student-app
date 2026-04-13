const { readStudentSession, silentLogin, saveStudentSession } = require('./utils/auth')
const { syncChatUnreadBadge } = require('./utils/chat-badge')
const { getRuntimeConfig } = require('./utils/runtime-config')
const PRACTICE_COURSE_STORAGE_KEY = 'student_has_practice_course'
const initialRuntimeConfig = getRuntimeConfig()

App({
  globalData: {
    userInfo: null,
    authReady: false,
    isLoggedIn: false,
    isEnrolled: false,
    isNewUser: false,
    hasDiagnoseCourse: false,
    hasPracticeCourse: false,
    notifications: [],
    pointVersionSelections: {},
    selectedPurchaseVersion: '',
    serverBase: initialRuntimeConfig.serverBase,
    offlineMode: initialRuntimeConfig.offlineMode,
    chatMockMode: initialRuntimeConfig.chatMockMode,
    runtimeEnv: initialRuntimeConfig.envVersion,
    leaveStatus: {
      active: false,
      approvalStatus: '',
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
      phone: '',
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
    const runtimeConfig = getRuntimeConfig()
    const hasPracticeCourse = wx.getStorageSync(PRACTICE_COURSE_STORAGE_KEY) === true
    const session = readStudentSession()

    this.globalData.serverBase = runtimeConfig.serverBase
    this.globalData.offlineMode = runtimeConfig.offlineMode
    this.globalData.chatMockMode = runtimeConfig.chatMockMode
    this.globalData.runtimeEnv = runtimeConfig.envVersion
    this.globalData.hasPracticeCourse = hasPracticeCourse
    syncChatUnreadBadge(this)

    console.log('运行配置:', runtimeConfig)

    if (session.token && session.info) {
      saveStudentSession({
        token: session.token,
        ...session.info,
      }, this)
      syncChatUnreadBadge(this)
      console.log('App launched')
      return
    }

    silentLogin(this)
      .catch((error) => {
        this.globalData.authReady = true
        this.globalData.isLoggedIn = false
        this.globalData.isNewUser = true
        this.globalData.isEnrolled = false
        this.globalData.token = ''
        console.warn('静默登录失败:', error && error.message ? error.message : error)
      })
      .finally(() => {
        syncChatUnreadBadge(this)
      })

    console.log('App launched')
  },

  onError(err) {
    console.error('全局错误:', JSON.stringify(err))
  },

  onUnhandledRejection(res) {
    console.error('未处理的Promise拒绝:', JSON.stringify(res))
  }
})
