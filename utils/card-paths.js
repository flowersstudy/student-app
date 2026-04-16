const PATH_SYSTEM_OVERVIEW = {
  pointCount: 8,
  versionCount: 3,
  pathCount: 23,
  judgeText: '学习路径和路径版本绑定，判定依据是用户的备考周期及理解能力。',
}

const VERSION_META = {
  progressive: {
    key: 'progressive',
    label: '循序渐进版',
    shortLabel: '循序渐进',
    priceText: '¥1080 / ¥1680',
    cycleText: '首轮 7 天，持续提升到考前',
    description: '先跑通一轮完整方法闭环，再持续刷题与定期测试，适合希望稳扎稳打推进到考前的用户。',
    serviceItems: [
      '理论方法录播课',
      '1V1共识课 · 15分钟 × 1节',
      '1V1纠偏课 · 45分钟 × 1节',
      '单卡的补强训练 × 3次',
      '单卡点测试 × 1次',
    ],
    followUps: [
      '二轮持续刷题到考前',
      '每月定期卡点测试',
    ],
  },
  fast: {
    key: 'fast',
    label: '极速提升版',
    shortLabel: '极速提升',
    priceText: '¥1880 / ¥2480',
    cycleText: '3-4 天快速突破',
    description: '更强调方法提炼与快速突破，适合备考周期较短、问题已经比较明确的用户。',
    serviceItems: [
      '1V1共识课 · 15分钟 × 1节',
      '理论方法指导册',
      '1V1方法课 · 45分钟 × 1节',
      '1V1纠偏课 · 45分钟 × 1节',
      '单卡的补强训练 × 3次',
      '单卡点测试 × 1次',
    ],
    followUps: [],
  },
  premium: {
    key: 'premium',
    label: '极速尊享版',
    shortLabel: '极速尊享',
    priceText: '¥2680 / ¥3080',
    cycleText: '3-4 天核心师资辅助突破',
    description: '方法课更细、串联更强，并增加整卷模考，适合需要更强辅助与更高完成度的用户。',
    serviceItems: [
      '1V1共识课 · 15分钟 × 1节',
      '1V1单点方法课 · 45分钟 × 1节',
      '1V1方法串联课 · 45分钟 × 1节',
      '1V1纠偏课 · 45分钟 × 1节',
      '单卡的补强训练 × 3次',
      '单卡点测试 × 1次',
      '整卷模考 × 1次',
    ],
    followUps: [],
  },
}

function buildStep(title, note = '') {
  return { title, note }
}

function buildProgressiveStage1(lastStep = '刷题') {
  return [
    buildStep('1V1共识课【15分钟】'),
    buildStep('理论课'),
    buildStep('1V1纠偏课【45分钟】'),
    buildStep(lastStep),
    buildStep('测试'),
  ]
}

function buildProgressiveStage2() {
  return [
    buildStep('刷题'),
    buildStep('测试'),
  ]
}

function buildFastSteps() {
  return [
    buildStep('1V1共识课【15分钟】'),
    buildStep('理论讲义'),
    buildStep('1V1方法课【45分钟】'),
    buildStep('训练'),
    buildStep('1V1纠偏课【45分钟】'),
    buildStep('测试'),
  ]
}

function buildPremiumSteps() {
  return [
    buildStep('1V1共识课【15分钟】'),
    buildStep('1V1方法单点课【45分钟】'),
    buildStep('1V1方法串讲课【45分钟】'),
    buildStep('训练'),
    buildStep('1V1纠偏课【45分钟】'),
    buildStep('测试'),
    buildStep('模考'),
  ]
}

function buildPointVersions(progressiveLastStep = '刷题', premiumAvailable = true) {
  return {
    progressive: {
      available: true,
      stages: [
        {
          key: 'stage1',
          label: '一阶',
          steps: buildProgressiveStage1(progressiveLastStep),
        },
        {
          key: 'stage2',
          label: '二阶',
          steps: buildProgressiveStage2(),
        },
      ],
    },
    fast: {
      available: true,
      steps: buildFastSteps(),
    },
    premium: premiumAvailable
      ? {
          available: true,
          steps: buildPremiumSteps(),
        }
      : {
          available: false,
          unavailableText: '当前卡点暂未开放极速尊享版',
          steps: [],
        },
  }
}

const POINT_VERSION_PATHS = {
  1: {
    pointName: '要点不全不准',
    versions: buildPointVersions('刷题'),
  },
  2: {
    pointName: '提炼转述困难',
    versions: buildPointVersions('刷题 + 积累'),
  },
  3: {
    pointName: '分析结构不清',
    versions: buildPointVersions('刷题'),
  },
  4: {
    pointName: '公文结构不清',
    versions: buildPointVersions('刷题'),
  },
  5: {
    pointName: '对策推导困难',
    versions: buildPointVersions('刷题', false),
  },
  6: {
    pointName: '作文立意不准',
    versions: buildPointVersions('刷题'),
  },
  7: {
    pointName: '作文论证不清',
    versions: buildPointVersions('刷题'),
  },
  8: {
    pointName: '作文表达不畅',
    versions: buildPointVersions('刷题'),
  },
}

function getPointVersionData(pointId) {
  return POINT_VERSION_PATHS[pointId] || POINT_VERSION_PATHS[1]
}

module.exports = {
  PATH_SYSTEM_OVERVIEW,
  VERSION_META,
  POINT_VERSION_PATHS,
  getPointVersionData,
}
