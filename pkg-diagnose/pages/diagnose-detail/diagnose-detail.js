const app = getApp()

Page({
  data: {
    student: {
      name: '张三',
      exam: '国考申论',
      diagnosisDate: '2026-04-03',
      teacher: '李老师'
    },
    overview: {
      currentScore: 108,
      targetScore: 130,
      scoreGap: 22,
      dimensions: 8,
      outputCount: 3,
      serviceType: '人工诊断'
    },
    highlights: [
      {
        title: '优势基础',
        desc: '材料阅读基础不弱，理解速度和信息敏感度在线，具备继续提分的底子。'
      },
      {
        title: '核心卡点',
        desc: '真正拖分的不是努力不够，而是卡在结构、转述和作文逻辑这几个关键位置。'
      }
    ],
    quickTags: ['失分拆解', '卡点定位', '阶段规划', '专属报告'],
    systemFacts: [
      {
        value: '8',
        label: '核心卡点',
        desc: '围绕申论提分主线拆出 8 个关键卡点，用来定位真正拖分的位置。'
      },
      {
        value: '23',
        label: '学习路径',
        desc: '按卡点继续往下拆，形成 23 条具体学习路径，不再只给模糊建议。'
      },
      {
        value: '5',
        label: '用户阻力',
        desc: '把学习过程中最常见的 5 类阻力单独识别出来，避免只管讲题不管推进。'
      },
      {
        value: '12',
        label: '干预动作',
        desc: '针对不同阻力设计 12 套干预动作，把诊断结果真正落到后续学习安排。'
      }
    ],
    previewPoints: [
      {
        tier: 'red',
        tierText: '红标优先',
        name: '提炼转述困难',
        desc: '能看懂材料，但写出来容易照抄原文，概括提炼不够稳。'
      },
      {
        tier: 'yellow',
        tierText: '黄标优先',
        name: '分析结构不清',
        desc: '分析题容易有点没层次，论证关系没有清楚展开。'
      },
      {
        tier: 'blue',
        tierText: '蓝标跟进',
        name: '作文论证不清',
        desc: '文章有观点，但段落推进和总分结构还不够完整。'
      }
    ],
    basisRows: [
      { label: '诊断方式', value: '老师批改 + 失分分析 + 书面报告' },
      { label: '输出结果', value: '失分依据、核心卡点、学习路径、干预建议' },
      { label: '适用场景', value: '不知道先补哪、刷题很多但分数不涨' }
    ],
    phases: [
      {
        tag: '阶段一',
        title: '底层重塑',
        desc: '先纠偏最根本的阅读与提炼问题，把跑偏、抄材料、抓不准主旨的情况先压住。'
      },
      {
        tag: '阶段二',
        title: '结构巩固',
        desc: '重点突破分析、公文、对策等题型结构，让答题框架稳定下来。'
      },
      {
        tag: '阶段三',
        title: '面向冲刺',
        desc: '围绕目标考试做作文和考情突破，把分数真正往上拉。'
      }
    ],
    suitableList: [
      '刷了很多题，但一直不知道问题到底出在哪',
      '想先看清失分原因，再决定课程和学习路径',
      '希望拿到一份能直接指导后续学习的诊断报告'
    ]
  },

  onLoad() {
    const profile = app.globalData.userProfile || {}
    const diagnosis = app.globalData.diagnosis || {}
    this.setData({
      'student.name': profile.name || this.data.student.name,
      'student.exam': diagnosis.targetExam || this.data.student.exam,
      'overview.currentScore': diagnosis.diagnosisScore || this.data.overview.currentScore,
      'overview.targetScore': diagnosis.targetScore || this.data.overview.targetScore,
      'overview.scoreGap': diagnosis.scoreGap || this.data.overview.scoreGap
    })
  },

  goStartDiagnose() {
    wx.navigateTo({ url: '/pkg-diagnose/pages/diagnose-report/diagnose-report' })
  }
})
