const { appendStudyQuery } = require('./study-route')

const POLYV_SLOT_META = {
  diagnose_analysis_video: {
    title: '听解析课',
  },
  theory_recorded: {
    title: '理论课',
  },
  theory_explain_video: {
    title: '视频讲解',
  },
  training_explain_video: {
    title: '视频讲解',
  },
  training_review_video_1: {
    title: '第一题视频讲解',
    fallbackKeys: ['training_explain_video'],
  },
  training_review_video_2: {
    title: '第二题视频讲解',
    fallbackKeys: ['training_explain_video'],
  },
  training_review_video_3: {
    title: '第三题视频讲解',
    fallbackKeys: ['training_explain_video'],
  },
  exam_explain_video: {
    title: '视频讲解',
  },
  exam_review_video: {
    title: '视频讲解',
    fallbackKeys: ['exam_explain_video'],
  },
}

const COMMON_POLYV_VIDS = {
  diagnose_analysis_video: '',
  theory_recorded: '',
  theory_explain_video: '',
  training_explain_video: '',
  training_review_video_1: '',
  training_review_video_2: '',
  training_review_video_3: '',
  exam_explain_video: '',
  exam_review_video: '',
}

const POINT_POLYV_VIDS = {
}

function normalizeText(value = '') {
  return String(value || '').trim()
}

function getSlotMeta(slotKey = '') {
  return POLYV_SLOT_META[slotKey] || {}
}

function getLookupKeys(slotKey = '') {
  const meta = getSlotMeta(slotKey)
  const fallbackKeys = Array.isArray(meta.fallbackKeys) ? meta.fallbackKeys : []
  return [slotKey, ...fallbackKeys].filter(Boolean)
}

function resolvePolyvVideo(pointName = '', slotKey = '') {
  const safePointName = normalizeText(pointName)
  const pointConfig = POINT_POLYV_VIDS[safePointName] || {}
  const lookupKeys = getLookupKeys(slotKey)
  const meta = getSlotMeta(slotKey)

  for (let index = 0; index < lookupKeys.length; index += 1) {
    const currentKey = lookupKeys[index]
    const pointVid = normalizeText(pointConfig[currentKey])
    if (pointVid) {
      return {
        slotKey,
        title: meta.title || '',
        vid: pointVid,
      }
    }

    const commonVid = normalizeText(COMMON_POLYV_VIDS[currentKey])
    if (commonVid) {
      return {
        slotKey,
        title: meta.title || '',
        vid: commonVid,
      }
    }
  }

  return {
    slotKey,
    title: meta.title || '',
    vid: '',
  }
}

function getLearningTaskPolyvSlot(taskId = '') {
  const safeTaskId = normalizeText(taskId)

  if (/^theory_round_\d+_recorded$/.test(safeTaskId)) {
    return 'theory_recorded'
  }

  if (/^theory_round_\d+_explain_video$/.test(safeTaskId)) {
    return 'theory_explain_video'
  }

  const slotMap = {
    diagnose_analysis_video: 'diagnose_analysis_video',
    theory_recorded: 'theory_recorded',
    theory_explain_video: 'theory_explain_video',
    training_explain_video: 'training_explain_video',
    exam_explain_video: 'exam_explain_video',
  }

  return slotMap[safeTaskId] || ''
}

function getReviewItemPolyvSlot(stageKey = '', reviewIndex = -1, childIndex = -1) {
  const safeStageKey = normalizeText(stageKey)

  if (safeStageKey === 'diagnose' && reviewIndex === 1) {
    return 'diagnose_analysis_video'
  }

  if (safeStageKey === 'theory') {
    if (childIndex === 0) {
      return 'theory_recorded'
    }

    if (childIndex === 2) {
      return 'theory_explain_video'
    }

    return ''
  }

  if (safeStageKey === 'training' && childIndex === 1) {
    const trainingSlotMap = {
      0: 'training_review_video_1',
      1: 'training_review_video_2',
      2: 'training_review_video_3',
    }

    return trainingSlotMap[reviewIndex] || ''
  }

  if (safeStageKey === 'exam' && reviewIndex === 1) {
    return 'exam_review_video'
  }

  return ''
}

function buildPolyvLessonRoute(studyOptions = {}, { pointName = '', slotKey = '', title = '', videoId = '' } = {}) {
  const safePointName = normalizeText(pointName || studyOptions.pointName)
  const resolved = resolvePolyvVideo(safePointName, slotKey)

  return appendStudyQuery('/pkg-lesson/pages/lesson-recorded/lesson-recorded', studyOptions, {
    pointName: safePointName,
    polyvSlotKey: slotKey,
    videoTitle: normalizeText(title) || resolved.title || '录播课',
    videoId: normalizeText(videoId) || resolved.vid || '',
  })
}

function buildLearningTaskVideoRoute({ pointName = '', taskId = '', title = '', videoId = '', studyOptions = {} } = {}) {
  const slotKey = getLearningTaskPolyvSlot(taskId)
  if (!slotKey && !normalizeText(videoId)) {
    return ''
  }

  return buildPolyvLessonRoute(studyOptions, {
    pointName,
    slotKey,
    title,
    videoId,
  })
}

function buildReviewItemVideoRoute({
  pointName = '',
  stageKey = '',
  reviewIndex = -1,
  childIndex = -1,
  title = '',
  studyOptions = {},
} = {}) {
  const slotKey = getReviewItemPolyvSlot(stageKey, reviewIndex, childIndex)
  if (!slotKey) {
    return ''
  }

  return buildPolyvLessonRoute(studyOptions, {
    pointName,
    slotKey,
    title,
  })
}

module.exports = {
  COMMON_POLYV_VIDS,
  POINT_POLYV_VIDS,
  POLYV_SLOT_META,
  buildLearningTaskVideoRoute,
  buildPolyvLessonRoute,
  buildReviewItemVideoRoute,
  getLearningTaskPolyvSlot,
  getReviewItemPolyvSlot,
  resolvePolyvVideo,
}
