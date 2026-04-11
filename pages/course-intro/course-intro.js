const { uiIcons } = require('../../utils/ui-icons')

const courseMap = {
  1: {
    name: '游走式找点',
    subject: '申论',
    tagline: '材料读了一遍又一遍，关键信息还是抓不住',
    price: 1080,
    symptoms: [
      '阅读材料时毫无重点，逐字逐句却啥都没记住',
      '找到的要点零散、重复，不知道哪个才是关键',
      '同样的材料，别人能找出5个要点，你只找到2个',
      '考场上时间不够用，找点就花掉一半时间'
    ],
    solutions: [
      '掌握"主题句+支撑句"双层找点框架',
      '学会用标志词快速定位关键信息',
      '建立段落级→全文级的找点逻辑',
      '真题实练：从慢到快，形成肌肉记忆'
    ],
    includes: [
      { iconKey: 'target', name: '1v1纠偏课', desc: '45分钟，老师针对你的找点误区专项纠偏' },
      { iconKey: 'video', name: '理论录播课', desc: '约60分钟，系统讲解找点方法论，免费观看' },
      { iconKey: 'file', name: '配套讲义', desc: '真题专项练习材料，课后自主巩固' },
      { iconKey: 'chat', name: '无限提问', desc: '课后随时在群内向老师提问答疑' }
    ]
  },
  2: {
    name: '总结转述难',
    subject: '申论',
    tagline: '主题明明看懂了，写出来却总是跑偏',
    price: 1080,
    symptoms: [
      '概括题答完总被老师说"偏了"，自己却不知道哪里偏',
      '提炼出的主旨和材料核心总差一口气',
      '归纳段落大意时容易被细节带偏',
      '同一道题，不同人提炼的结果差异很大'
    ],
    solutions: [
      '掌握"问题-原因-对策"三元归纳法',
      '学会区分"表层信息"与"深层含义"',
      '建立主旨提炼的校验机制，写完能自查',
      '从单段练习到全文综合，循序渐进'
    ],
    includes: [
      { iconKey: 'target', name: '1v1纠偏课', desc: '45分钟，针对你的偏题规律逐一纠正' },
      { iconKey: 'video', name: '理论录播课', desc: '约60分钟，讲解主旨提炼核心方法，免费观看' },
      { iconKey: 'file', name: '配套讲义', desc: '分类真题练习，含答案解析' },
      { iconKey: 'chat', name: '无限提问', desc: '课后随时在群内向老师提问答疑' }
    ]
  },
  3: {
    name: '分析结构不清',
    subject: '申论',
    tagline: '材料里的逻辑关系看不清，分析题无从下手',
    price: 1080,
    symptoms: [
      '综合分析题不知道"分析什么"，只会堆材料',
      '看不出材料中的因果、转折、递进关系',
      '分析结构混乱，阅卷老师说"没有逻辑层次"',
      '多则材料综合时不知如何整合'
    ],
    solutions: [
      '建立"现象-本质-影响"的分析思维框架',
      '掌握五种逻辑关系的识别与表达方式',
      '学会多则材料的整合归纳技巧',
      '分析题答题模板与灵活运用'
    ],
    includes: [
      { iconKey: 'target', name: '1v1纠偏课', desc: '45分钟，针对你的分析短板专项突破' },
      { iconKey: 'video', name: '理论录播课', desc: '约60分钟，综合分析题全解，免费观看' },
      { iconKey: 'file', name: '配套讲义', desc: '历年综合分析题精选，附详解' },
      { iconKey: 'chat', name: '无限提问', desc: '课后随时在群内向老师提问答疑' }
    ]
  },
  4: {
    name: '公文结构不清',
    subject: '申论',
    tagline: '公文格式死记硬背，换个题型就不会套',
    price: 1080,
    symptoms: [
      '公文题只会背格式，稍有变化就不知道怎么写',
      '公文内容空洞，全是格式没有实质内容',
      '搞不清不同公文文种的区别和适用场景',
      '写出的公文像散文，缺乏公文语感'
    ],
    solutions: [
      '系统梳理常考公文文种及其核心要素',
      '掌握"格式+内容+语言风格"三位一体的写作法',
      '学会根据题目要求灵活调整公文结构',
      '真题实练：通知、报告、方案等高频文种'
    ],
    includes: [
      { iconKey: 'target', name: '1v1纠偏课', desc: '45分钟，公文写作全面诊断与纠偏' },
      { iconKey: 'video', name: '理论录播课', desc: '约60分钟，公文写作系统讲解，免费观看' },
      { iconKey: 'file', name: '配套讲义', desc: '各类公文模板与真题对比分析' },
      { iconKey: 'chat', name: '无限提问', desc: '课后随时在群内向老师提问答疑' }
    ]
  },
  5: {
    name: '对策推导难',
    subject: '申论',
    tagline: '提对策时脑子空白，写出来又空又假',
    price: 1080,
    symptoms: [
      '看到"提出对策"类题目就发慌，不知道从哪下手',
      '写出的对策千篇一律，"加强监管、提高意识"套话连篇',
      '对策脱离材料，缺乏针对性，得分极低',
      '对策条数凑不够，写到第三条就词穷了'
    ],
    solutions: [
      '学会从材料中"找"对策而不是"想"对策',
      '掌握对策的五种来源：问题反推、经验借鉴、政策援引等',
      '建立对策的"主体-措施-目的"三段式表达结构',
      '真题实练：从材料到对策的完整拆解'
    ],
    includes: [
      { iconKey: 'target', name: '1v1纠偏课', desc: '45分钟，专项训练你的对策思维' },
      { iconKey: 'video', name: '理论录播课', desc: '约60分钟，对策题全方法论，免费观看' },
      { iconKey: 'file', name: '配套讲义', desc: '对策题真题精选，分难度分类型' },
      { iconKey: 'chat', name: '无限提问', desc: '课后随时在群内向老师提问答疑' }
    ]
  },
  6: {
    name: '作文立意不准',
    subject: '申论',
    tagline: '大作文审题时看似懂了，落笔就跑偏',
    price: 1080,
    symptoms: [
      '作文立意总是偏向材料的次要矛盾',
      '看到题目能想到很多，但写出来就偏了',
      '批改老师反复说"立意不准"，自己不知道问题在哪',
      '不同材料背景下，立意方法完全不会迁移'
    ],
    solutions: [
      '掌握"问题溯源"立意法，找准材料核心矛盾',
      '学会用"主旨句"框定写作方向，防止偏移',
      '建立立意的自查三步骤，写前能预判对错',
      '五类常考主题的立意规律总结'
    ],
    includes: [
      { iconKey: 'target', name: '1v1纠偏课', desc: '45分钟，专项训练立意准确度' },
      { iconKey: 'video', name: '理论录播课', desc: '约60分钟，大作文立意全解，免费观看' },
      { iconKey: 'file', name: '配套讲义', desc: '近三年大作文真题立意精析' },
      { iconKey: 'chat', name: '无限提问', desc: '课后随时在群内向老师提问答疑' }
    ]
  },
  7: {
    name: '作文逻辑不清',
    subject: '申论',
    tagline: '作文写了很多，但阅卷老师说"没有论证"',
    price: 1080,
    symptoms: [
      '写作文就是把材料要点重新排列一遍',
      '有观点但不会展开，每段只有1-2句话',
      '论据和论点之间缺乏分析衔接，逻辑断裂',
      '字数勉强凑够，但内容空洞，得分上不去'
    ],
    solutions: [
      '掌握"论点-论据-分析-结论"四步论证结构',
      '学会三种展开方式：举例、引用、类比',
      '建立段落内部的逻辑链，让每段都有力度',
      '真题实练：从要点堆砌到有效论述的转化'
    ],
    includes: [
      { iconKey: 'target', name: '1v1纠偏课', desc: '45分钟，论证能力专项训练' },
      { iconKey: 'video', name: '理论录播课', desc: '约60分钟，论述写作全方法论，免费观看' },
      { iconKey: 'file', name: '配套讲义', desc: '论述段落改写练习，含优劣对比' },
      { iconKey: 'chat', name: '无限提问', desc: '课后随时在群内向老师提问答疑' }
    ]
  },
  8: {
    name: '作文表达不畅',
    subject: '申论',
    tagline: '答案写得明白但像聊天，缺乏书面语感',
    price: 1080,
    symptoms: [
      '写出的答案口语化严重，语言不够规范正式',
      '不知道申论书面语与日常语言的边界在哪',
      '想用官方表达，但总感觉生硬或用错地方',
      '老师批改总提"语言不够凝练""表达不规范"'
    ],
    solutions: [
      '掌握申论语言的"三高"标准：精炼、规范、逻辑性',
      '积累高频规范表达词库，替换口语化用词',
      '学会句式压缩：把3句口语变成1句书面语',
      '真题语言改写练习，形成语感'
    ],
    includes: [
      { iconKey: 'target', name: '1v1纠偏课', desc: '45分钟，语言表达专项打磨' },
      { iconKey: 'video', name: '理论录播课', desc: '约60分钟，申论语言规范全讲，免费观看' },
      { iconKey: 'file', name: '配套讲义', desc: '口语→书面语改写练习册' },
      { iconKey: 'chat', name: '无限提问', desc: '课后随时在群内向老师提问答疑' }
    ]
  }
}

const teachers = [
  {
    id: 1,
    name: '周老师',
    subject: '申论主讲',
    exp: '从教8年 · 辅导学员3000+',
    desc: '擅长逻辑框架梳理与写作思维训练，学员申论平均提分18分，国省考上岸率82%。'
  },
  {
    id: 2,
    name: '张老师',
    subject: '申论主讲',
    exp: '从教6年 · 辅导学员2000+',
    desc: '擅长材料分析与对策类题目，授课节奏清晰，善于针对不同学员因材施教。'
  }
]

Page({
  data: {
    uiIcons,
    course: {},
    teachers: teachers
  },
  onLoad(options) {
    const id = parseInt(options.id) || 1
    const course = courseMap[id] || courseMap[1]
    const courseWithIcons = {
      ...course,
      includes: (course.includes || []).map((item) => ({
        ...item,
        icon: uiIcons[item.iconKey]
      }))
    }
    this.setData({ course: courseWithIcons })
    wx.setNavigationBarTitle({ title: courseWithIcons.name })
  },
  goPurchase() {
    wx.navigateTo({ url: '/pages/purchase/purchase' })
  }
})
