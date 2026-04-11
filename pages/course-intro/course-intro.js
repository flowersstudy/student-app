const { uiIcons } = require('../../utils/ui-icons')
const {
  PATH_SYSTEM_OVERVIEW,
  VERSION_META,
  getPointVersionData,
} = require('../../utils/card-paths')

const courseMap = {
  1: {
    name: '游走式找点',
    code: 'K-D1',
    level: '底层卡点',
    subject: '申论',
    scene: '直接概括情况下',
    tagline: '材料读了一遍又一遍，关键信息还是抓不住',
    symptoms: [
      '阅读材料时毫无重点，逐字逐句却啥都没记住',
      '找到的要点零散、重复，不知道哪个才是关键',
      '同样的材料，别人能找出5个要点，你只找到2个',
      '考场上时间不够用，找点就花掉一半时间',
    ],
    solutions: [
      '掌握“主题句 + 支撑句”双层找点框架',
      '学会用标志词快速定位关键信息',
      '建立段落级到全文级的找点逻辑',
      '真题实练，从慢到快形成稳定阅读规则',
    ],
    lossPoints: [
      '前置词错误',
      '要点遗漏',
      '要点不完整',
      '总括句错误',
      '关键词分类位置不正确',
      '分类要点数量不正确',
    ],
    knowledgePoints: [
      '正确的申论阅读规则意识',
      '申论各作答要素识别与书写',
      '分析材料逻辑关系，判断主次信息',
      '材料信息取舍规则',
      '要点分类判定规则',
      '答案要点书写规则',
      '总括句识别、书写规则',
      '基础词性判断',
    ],
    lessonCatalog: [
      { code: 'L-D1-E01', content: '掌握正确的阅读认知【要点的构成、评分标准、阅读习惯】' },
      { code: 'L-D1-E02', content: '判断题干 + 材料中关于主体的信息' },
      { code: 'L-D1-E03', content: '判断题干 + 材料中关于主题的信息' },
      { code: 'L-D1-E04', content: '判断题干 + 材料要素一致性【材料直给的要素能识别】' },
      { code: 'L-D1-E05', content: '明确掌握基础词性（主谓宾、定状补；感情色彩）' },
      { code: 'L-D1-R01', content: '判断材料信息主次关系 + 划分材料层级 + 根据层级取舍 + 规划要点字数' },
      { code: 'L-D1-R02', content: '判断段落间的总分关系 + 定位总结性的信息' },
      { code: 'L-D1-R03', content: '掌握材料分类依据、规则 + 方法' },
    ],
    requiredLessonCodes: [
      'L-D1-E01',
      'L-D1-E05',
      'L-D1-E02',
      'L-D1-E03',
      'L-D1-E04',
      'L-D1-R01',
      'L-D1-R02',
      'L-D1-R03',
    ],
    optionalLessonCodes: [],
  },
  2: {
    name: '总结转述难',
    code: 'K-D2',
    level: '底层卡点',
    subject: '申论',
    scene: '间接概括情况下',
    tagline: '主题明明看懂了，写出来却总是跑偏',
    symptoms: [
      '概括题答完总被说偏题，但自己不知道哪里偏',
      '提炼出的主旨和材料核心总差一口气',
      '归纳段落大意时容易被细节带偏',
      '同一道题，不同人提炼的结果差异很大',
    ],
    solutions: [
      '建立句子主信息提炼能力',
      '掌握从段内共性到段落主旨的抽象总结方法',
      '学会把材料信息规范转述成前置词和关键词',
      '补足词性、情感色彩和表达匹配能力',
    ],
    lossPoints: [
      '前置词错误',
      '要点遗漏',
      '要点不完整',
      '总括句错误',
      '关键词分类位置不正确',
      '分类要点数量不正确',
    ],
    knowledgePoints: [
      '正确的申论阅读规则意识',
      '申论各作答要素识别与书写',
      '抽象总结材料信息',
      '规范转述材料信息',
      '基础词性判断',
    ],
    lessonCatalog: [
      { code: 'L-D2-E01', content: '补弱勾选：明确掌握基础词性（主谓宾、定状补；感情色彩）' },
      { code: 'L-D2-E02', content: '掌握正确的阅读认知【要点的构成、评分标准、阅读习惯】' },
      { code: 'L-D2-E03', content: '判断题干 + 材料中关于主体的信息' },
      { code: 'L-D2-E04', content: '判断题干 + 材料中关于主题的信息' },
      { code: 'L-D2-R01', content: '总结每一句的主要信息 + 分析句子间主要信息的共性 = 得出本段主旨' },
      { code: 'L-D2-R02', content: '根据本段主旨匹配规范表述的短语或词语，精准形成前置词、关键词' },
      { code: 'L-D3-R03', content: '判断题干 + 材料要素一致性【特定表述方式匹配、情感色彩判断】' },
    ],
    requiredLessonCodes: [
      'L-D2-E01',
      'L-D2-E02',
      'L-D2-E03',
      'L-D2-E04',
      'L-D2-R01',
      'L-D2-R02',
      'L-D3-R03',
    ],
    optionalLessonCodes: [],
  },
  3: {
    name: '分析结构不清',
    code: 'K-Z2',
    level: '专项卡点',
    subject: '申论',
    scene: '',
    tagline: '材料里的逻辑关系看不清，分析题无从下手',
    symptoms: [
      '综合分析题不知道分析什么，只会堆材料',
      '看不出材料中的因果、转折、递进关系',
      '分析结构混乱，没有逻辑层次',
      '多则材料综合时不知如何整合',
    ],
    solutions: [
      '认知分析三段式的整体布局',
      '学会判定不同分析题的必要组成部分',
      '掌握开头和结尾的稳定写法',
      '补足分析题的分类判断能力',
    ],
    lossPoints: [
      '必要组成部分直接缺少',
      '整体结构布局不合理',
      '必要组成部分的语义不符合题目要求【首段非解释性信息/观点性信息、尾段非总结性信息】',
    ],
    knowledgePoints: [
      '分析结构规则认知',
      '必要组成部分判定方法',
      '必要组成部分书写方法',
    ],
    lessonCatalog: [
      { code: 'L-Z2-E01', content: '评价型分析的判定方法 + 开头写法' },
      { code: 'L-Z2-E02', content: '定义型分析的判定方法 + 开头写法' },
      { code: 'L-Z2-E03', content: '比较型分析的判定方法 + 开头写法' },
      { code: 'L-Z2-E04', content: '混合型分析的判定方法 + 开头写法' },
      { code: 'L-Z2-E05', content: '掌握题干分类依据、规则 + 方法' },
      { code: 'L-Z2-E06', content: '认知分析三段式【书写格式 + 布局 + 每段的作用】' },
      { code: 'L-Z2-R01', content: '解释型分析的判定方法 + 开头写法' },
      { code: 'L-Z2-R02', content: '结尾的判断方法 + 书写方法' },
    ],
    requiredLessonCodes: [
      'L-Z2-E06',
      'L-Z2-E05',
      'L-Z2-R01',
      'L-Z2-R02',
      'L-Z2-E01',
      'L-Z2-E02',
      'L-Z2-E03',
      'L-Z2-E04',
    ],
    optionalLessonCodes: [],
  },
  4: {
    name: '公文结构不清',
    code: 'K-Z3',
    level: '专项卡点',
    subject: '申论',
    scene: '',
    tagline: '公文格式死记硬背，换个题型就不会套',
    symptoms: [
      '公文题只会背格式，稍有变化就不会写',
      '公文内容空洞，全是格式没有实质内容',
      '搞不清不同文种的区别和适用场景',
      '写出的公文缺乏公文语感',
    ],
    solutions: [
      '建立公文三段式的基础认知',
      '掌握格式、开头、结尾、语言要求的分析方法',
      '覆盖近5年高频公文的结构规则',
      '能根据题干快速判断格式和布局',
    ],
    lossPoints: [
      '必要组成部分直接多或少',
      '整体结构不符合短长短的布局，必要组成部分的语义不符合题目要求',
      '公文格式错误或不完整',
      '公文题单个语言在特定位置要出现的没有出现',
    ],
    knowledgePoints: [
      '公文结构规则认知',
      '公文格式规则认知',
      '必要组成部分判定方法',
      '必要组成部分书写方法',
      '公文特殊分类规则认知',
    ],
    lessonCatalog: [
      { code: 'L-Z3-E01', content: '掌握题干分类依据、规则 + 方法' },
      { code: 'L-Z3-E02', content: '认知公文三段式【书写格式 + 布局 + 每段的作用】' },
      { code: 'L-Z3-R01', content: '所有近5年出现过的公文的开头判定方法 + 书写方法' },
      { code: 'L-Z3-R02', content: '所有近5年出现过的公文的结尾判定方法 + 书写方法' },
      { code: 'L-Z3-R03', content: '所有近5年出现过的公文的语言要求 + 对应的书写方式' },
      { code: 'L-Z3-R04', content: '根据题干分析格式的方法' },
      { code: 'L-Z3-R05', content: '所有近5年出现过的公文的格式要求 + 对应的书写方式' },
    ],
    requiredLessonCodes: [
      'L-Z3-E02',
      'L-Z3-E01',
      'L-Z3-R04',
      'L-Z3-R05',
      'L-Z3-R01',
      'L-Z3-R02',
      'L-Z3-R03',
    ],
    optionalLessonCodes: [],
  },
  5: {
    name: '对策推导难',
    code: 'K-Z1',
    level: '专项卡点',
    subject: '申论',
    scene: '',
    tagline: '提对策时脑子空白，写出来又空又假',
    symptoms: [
      '看到提出对策类题目就发慌，不知道从哪下手',
      '写出的对策千篇一律，套话连篇',
      '对策脱离材料，缺乏针对性',
      '对策条数凑不够，写到第三条就词穷',
    ],
    solutions: [
      '明确题干中的对应性要求',
      '学会判断针对性、可操作性、可行性',
      '掌握对策来源识别和推导方法',
      '补足对策库积累与背诵检查闭环',
    ],
    lossPoints: [
      '问题与对策不对应（在有要求的情况下）',
      '对策的前置词或关键词与材料的问题不匹配',
      '不符合关于经济、伦理、技术、法律、身份、场合的边界要求',
    ],
    knowledgePoints: [
      '对策书写规则认知、判定',
      '对策推导依据的识别、判定',
      '对策推导规则',
      '对策表述方法',
    ],
    lessonCatalog: [
      { code: 'L-Z1-E01', content: '明确题干中关于对应性要求的识别方法，理解对应性要求的含义 + 明确对应书写逻辑，达成一一对应的答题框架' },
      { code: 'L-Z1-E02', content: '明确判断针对性、可操作性、可行性的方法，达到能自行判断' },
      { code: 'L-Z1-R01', content: '明确识别对策来源 + 推导对策的方法' },
      { code: 'L-Z2-R02', content: '积累对策库 + 背诵检查闭环' },
    ],
    requiredLessonCodes: [
      'L-Z1-E02',
      'L-Z1-E01',
      'L-Z1-R01',
      'L-Z2-R02',
    ],
    optionalLessonCodes: [],
  },
  6: {
    name: '作文立意不准',
    code: 'K-Z4',
    level: '专项卡点',
    subject: '申论',
    scene: '',
    tagline: '大作文审题时看似懂了，落笔就跑偏',
    symptoms: [
      '作文立意总是偏向材料的次要矛盾',
      '看到题目能想到很多，但写出来就偏了',
      '批改反复提示立意不准',
      '不同材料背景下立意方法不会迁移',
    ],
    solutions: [
      '建立文体与主题词的基本认知',
      '掌握关键词拆解和识别方法',
      '学会从材料中确认关键词和主题词',
      '完成关键词整合同层级训练',
    ],
    lossPoints: [
      '作文文体判断错误',
      '主题词没写或写错',
      '关键词缺少或错误',
      '关键词角度写错',
    ],
    knowledgePoints: [
      '申论作文规则认知',
      '主题词识别、判断方法',
      '关键词识别、判断方法',
    ],
    lessonCatalog: [
      { code: 'L-Z4-E01', content: '明确掌握文体基本认识（议论文、策论文是什么、框架写成啥样 - 书写框架和范式、四要素）' },
      { code: 'L-Z4-E02', content: '明确主题词（话题）识别的方法 + 优先原则' },
      { code: 'L-Z4-E03', content: '明确如何从材料中找主题词的方法' },
      { code: 'L-Z4-E04', content: '明确角度的判定依据 + 选取原则' },
      { code: 'L-Z4-R01', content: '明确题干关键词的拆解方法' },
      { code: 'L-Z4-R02', content: '明确从材料中确定关键词的方法' },
      { code: 'L-Z4-R03', content: '明确关键词选择 + 整合到同一层级的方法' },
    ],
    requiredLessonCodes: [
      'L-Z4-E01',
      'L-Z4-E02',
      'L-Z4-R01',
      'L-Z4-E04',
      'L-Z4-R02',
      'L-Z4-R03',
      'L-Z4-E03',
    ],
    optionalLessonCodes: [],
  },
  7: {
    name: '作文逻辑不清',
    code: 'K-Z5',
    level: '专项卡点',
    subject: '申论',
    scene: '',
    tagline: '作文写了很多，但阅卷老师说“没有论证”',
    symptoms: [
      '写作文就是把材料要点重新排列一遍',
      '有观点但不会展开，每段只有1-2句话',
      '论据和论点之间缺乏分析衔接，逻辑断裂',
      '字数勉强凑够，但内容空洞',
    ],
    solutions: [
      '明确论证顺序和论证要素分类方法',
      '学会论据和论点的关联判断',
      '掌握不同字数条件下的论据表达方式',
      '补足论证力度加强的常见情形',
    ],
    lossPoints: [
      '论证顺序错误',
      '论证层次夹杂',
      '论证未闭环',
      '论证内容不充实',
    ],
    knowledgePoints: [
      '作文论证规则认知',
      '论证闭环书写、判定方法',
      '论证分层书写、判定方法',
      '论据选择、书写方法',
    ],
    lessonCatalog: [
      { code: 'L-Z5-E01', content: '明确论证顺序的方法' },
      { code: 'L-Z5-E02', content: '明确论证要素分类的方法 + 书写的组合形式' },
      { code: 'L-Z5-R01', content: '明确论证形成闭环的前提条件（论据与论点的关联性）' },
      { code: 'L-Z5-R02', content: '明确知道论据选择的方法 + 明确不同字数情况下论据的表达方式，能够书写出来' },
      { code: 'L-Z5-R03', content: '明确论证力度加强的各类情形' },
    ],
    requiredLessonCodes: [
      'L-Z5-E01',
      'L-Z5-E02',
      'L-Z5-R01',
      'L-Z5-R02',
      'L-Z5-R03',
    ],
    optionalLessonCodes: [],
  },
  8: {
    name: '作文表达不畅',
    code: 'K-Z6',
    level: '专项卡点',
    subject: '申论',
    scene: '',
    tagline: '答案写得明白但像聊天，缺乏书面语感',
    symptoms: [
      '表达有语病、不流畅',
      '表达口语化、不规范',
    ],
    solutions: [
      '建立语言标准认知',
      '掌握书面表达的书写与判断方法',
      '补足标题、观点、开头、论证、结尾等位置的书面表达方式',
      '提高自主校阅和连接词运用能力',
    ],
    lossPoints: [
      '表达有语病、不流畅',
      '表达口语化、不规范',
    ],
    knowledgePoints: [
      '语言标准认知',
      '书面表达书写、判断方法',
      '明确书面表达的方法 + 常见表达，达到能够使用书面用语的目的【标题、观点、开头、论证、结尾】',
    ],
    lessonCatalog: [
      { code: 'L-Z6-E01', content: '明确校阅改错的基本方法，达到自主判断并解决语病的目标' },
      { code: 'L-Z6-E02', content: '能够熟练运用各类连接词' },
    ],
    requiredLessonCodes: [
      'L-Z6-E01',
      'L-Z6-E02',
    ],
    optionalLessonCodes: [],
  },
}

function buildLessonMap(lessonCatalog = []) {
  return lessonCatalog.reduce((result, item) => {
    result[item.code] = item
    return result
  }, {})
}

function uniqueCodes(codes = []) {
  return [...new Set(codes)]
}

function buildLessonEntries(lessonMap, codes = []) {
  return uniqueCodes(codes).map((code) => {
    const lesson = lessonMap[code]
    return lesson || { code, content: '待补充' }
  })
}

function buildLearningBlocks(requiredLessons = []) {
  const conceptLessons = requiredLessons.filter((item) => item.code.includes('-E'))
  const methodLessons = requiredLessons.filter((item) => item.code.includes('-R'))
  const blocks = []

  if (conceptLessons.length > 0) {
    blocks.push({
      title: '基础认知',
      desc: '先把这类题的判断规则、核心概念和识别方法建立起来。',
      lessons: conceptLessons,
    })
  }

  if (methodLessons.length > 0) {
    blocks.push({
      title: '方法训练',
      desc: '再进入具体方法、书写方式和题型训练。',
      lessons: methodLessons,
    })
  }

  if (blocks.length === 0 && requiredLessons.length > 0) {
    blocks.push({
      title: '学习内容',
      desc: '围绕当前卡点完成对应学习内容。',
      lessons: requiredLessons,
    })
  }

  return blocks
}

function buildCourseViewData(course) {
  const lessonMap = buildLessonMap(course.lessonCatalog || [])
  const levelClassMap = {
    底层卡点: 'foundation',
    专项卡点: 'special',
    靶向卡点: 'targeted',
  }

  return {
    ...course,
    levelClass: levelClassMap[course.level] || 'foundation',
    lessonCatalog: course.lessonCatalog || [],
    requiredLessonCodes: uniqueCodes(course.requiredLessonCodes || []),
    optionalLessonCodes: uniqueCodes(course.optionalLessonCodes || []),
    requiredLessons: buildLessonEntries(lessonMap, course.requiredLessonCodes || []),
    optionalLessons: buildLessonEntries(lessonMap, course.optionalLessonCodes || []),
    learningOrder: buildLessonEntries(lessonMap, course.requiredLessonCodes || []),
    learningBlocks: buildLearningBlocks(buildLessonEntries(lessonMap, course.requiredLessonCodes || [])),
  }
}

Page({
  data: {
    uiIcons,
    pointId: 1,
    course: {},
    versionOverview: PATH_SYSTEM_OVERVIEW,
    versionCards: [],
  },

  onLoad(options) {
    const id = parseInt(options.id, 10) || 1
    const course = buildCourseViewData(courseMap[id] || courseMap[1])
    const pointVersionData = getPointVersionData(id)
    const versionCards = Object.keys(VERSION_META).map((key) => {
      const meta = VERSION_META[key]
      const versionData = (pointVersionData.versions || {})[key]

      return {
        key,
        label: meta.label,
        priceText: meta.priceText,
        cycleText: meta.cycleText,
        description: meta.description,
        serviceItems: meta.serviceItems,
        followUps: meta.followUps,
        available: !!versionData && versionData.available !== false,
        unavailableText: versionData && versionData.unavailableText ? versionData.unavailableText : '',
      }
    })

    this.setData({
      pointId: id,
      course,
      versionCards,
    })

    wx.setNavigationBarTitle({ title: course.name })
  },

  goPurchase() {
    const { pointId, course } = this.data
    const pointName = course && course.name ? encodeURIComponent(course.name) : ''
    wx.navigateTo({ url: `/pages/purchase/purchase?source=course_intro&pointId=${pointId}&pointName=${pointName}` })
  },
})
