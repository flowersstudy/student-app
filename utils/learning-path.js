const {
  fetchStudentLearningPath,
  fetchStudentSubmissions,
  uploadStudentSubmission,
  updateStudentLearningPathTask,
} = require('./student-api')
const { normalizeDocumentResource } = require('./document-url')
const { appendStudyQuery } = require('./study-route')

const STORAGE_KEY = 'student_learning_path_progress_v1'
const REMOTE_STORAGE_KEY = 'student_learning_path_remote_v1'
const THEORY_REPEAT_COUNT = 3

const DRILL_ITEMS = [
  {
    id: 'drill_question',
    title: '题目',
    desc: '查看当前刷题题目 PDF。',
    actionText: '查看题目',
    actionType: 'document',
  },
  {
    id: 'drill_upload',
    title: '上传作业',
    desc: '上传本次刷题作业，支持 PDF 或图片。',
    actionText: '去上传',
    actionType: 'upload',
  },
  {
    id: 'drill_ai_review',
    title: 'AI批改',
    desc: '提交后进入 AI 批改流程。',
    actionText: '查看批改',
    actionType: 'processing',
  },
  {
    id: 'drill_live',
    title: '去上课',
    desc: '进入直播课链接。',
    actionText: '去上课',
    actionType: 'live',
    secondaryActionText: '去提问',
    secondaryActionType: 'askTeacher',
  },
  {
    id: 'drill_replay',
    title: '去回顾',
    desc: '查看直播课回放链接。',
    actionText: '去回顾',
    actionType: 'replay',
  },
  {
    id: 'drill_qa_summary',
    title: '群内答疑总结',
    desc: '查看群内答疑总结。',
    actionText: '查看总结',
    actionType: 'feedback',
  },
]

function buildTrainingRound(roundNumber) {
  const taskPrefix = `training_round_${roundNumber}`
  return [
    {
      id: `${taskPrefix}_question`,
      title: '题目',
      desc: '查看本题实训题目 PDF。',
      actionText: '查看题目',
      actionType: 'document',
    },
    {
      id: `${taskPrefix}_explain_video`,
      title: '视频讲解',
      desc: '查看 PDF 文档及视频链接，并完成课程星级评价。',
      actionText: '看讲解',
      actionType: 'video',
    },
    {
      id: `${taskPrefix}_homework_upload`,
      title: '上传作业',
      desc: '看完视频讲解后提交本题作业，支持 PDF 或图片。',
      actionText: '去上传',
      actionType: 'upload',
      requireDoneTaskId: `${taskPrefix}_explain_video`,
      blockedToast: '看完视频讲解后才可以上传作业',
    },
    {
      id: `${taskPrefix}_homework_feedback`,
      title: '批改反馈',
      desc: '查看本题作业批改反馈；有疑问可去“找老师”提问。',
      actionText: '查看反馈',
      actionType: 'feedback',
      secondaryActionText: '去提问',
      secondaryActionType: 'askTeacher',
    },
    {
      id: `${taskPrefix}_reflection_upload`,
      title: '学生心得体会',
      desc: '提交本题学习心得体会，支持 PDF 或图片。',
      actionText: '去提交',
      actionType: 'upload',
    },
    {
      id: `${taskPrefix}_reflection_feedback`,
      title: '批改反馈',
      desc: '查看本题心得体会批改反馈。',
      actionText: '查看反馈',
      actionType: 'feedback',
    },
  ]
}

const TRAINING_ROUND_ITEMS = [1, 2, 3].reduce((items, roundNumber) => (
  items.concat(buildTrainingRound(roundNumber))
), [])

function buildTheoryRound(roundNumber) {
  const label = `第 ${roundNumber} 轮`
  return {
    title: label,
    items: [
      {
        id: `theory_round_${roundNumber}_recorded`,
        title: '理论课',
        desc: `${label}观看理论课录播，返回后可选星级评价。`,
        actionText: '看录播',
        actionType: 'video',
        secondaryActionText: '找老师',
        secondaryActionType: 'askTeacher',
      },
      {
        id: `theory_round_${roundNumber}_homework_pdf`,
        title: '课后作业',
        desc: `${label}下载课后作业 PDF。`,
        actionText: '下载作业',
        actionType: 'document',
      },
      {
        id: `theory_round_${roundNumber}_explain_video`,
        title: '视频讲解',
        desc: `${label}观看视频讲解，返回后可选星级评价。`,
        actionText: '看讲解',
        actionType: 'video',
      },
    ],
  }
}

const THEORY_ROUND_GROUPS = Array.from({ length: THEORY_REPEAT_COUNT }, (_, index) => (
  buildTheoryRound(index + 1)
))
const LEARNING_PATH_STAGE_SEQUENCE = ['diagnose', 'theory', 'training', 'exam', 'report', 'drill']
const ACTIVE_LEARNING_STAGE_SEQUENCE = ['theory', 'training', 'exam', 'report', 'drill']

const STAGE_DEFINITIONS = {
  diagnose: {
    stageKey: 'diagnose',
    stageIndex: '1 / 6',
    stageName: '诊断',
    stageSubtitle: '按顺序完成诊断群、电话沟通、诊断试卷、解析课、1v1诊断、回顾和报告。',
    sectionTitle: '诊断路径',
    groups: [
      {
        title: '诊断路径',
        items: [
          {
            id: 'diagnose_group',
            title: '诊断群',
            desc: '点击加入诊断群，接收老师安排和后续通知。',
            actionText: '去加群',
            actionType: 'group',
          },
          {
            id: 'diagnose_schedule',
            title: '电话沟通',
            desc: '自己选择老师可预约时间，确认当前问题和学习目标。',
            actionText: '预约时间',
            actionType: 'schedule',
          },
          {
            id: 'diagnose_paper',
            title: '诊断试卷',
            desc: '先完成诊断试卷，帮助老师判断当前卡点。',
            actionText: '查看试卷',
            actionType: 'document',
          },
          {
            id: 'diagnose_analysis_video',
            title: '听解析课',
            desc: '查看解析课内容，了解本卡点常见失分原因。',
            actionText: '去学习',
            actionType: 'video',
          },
          {
            id: 'diagnose_live',
            title: '1v1诊断：去上课',
            desc: '进入 1v1 诊断直播课链接。',
            actionText: '去上课',
            actionType: 'live',
          },
          {
            id: 'diagnose_feedback',
            title: '课后反馈',
            desc: '查看老师给你的本次诊断反馈。',
            actionText: '查看反馈',
            actionType: 'feedback',
          },
          {
            id: 'diagnose_replay',
            title: '去回顾',
            desc: '查看直播课回放链接。',
            actionText: '去回顾',
            actionType: 'replay',
          },
          {
            id: 'diagnose_report',
            title: '报告',
            desc: '查看诊断报告和后续学习建议。',
            actionText: '查看报告',
            actionType: 'report',
          },
        ],
      },
    ],
  },
  theory: {
    stageKey: 'theory',
    stageIndex: '2 / 6',
    stageName: '理论',
    stageSubtitle: '按“课前讲义—理论课—课后作业—视频讲解”循环学习多轮，完成后再上传思维导图。',
    sectionTitle: '理论路径',
    groups: [
      {
        title: '课前准备',
        items: [
          {
            id: 'theory_handout',
            title: '课前讲义',
            desc: '下载理论课课前讲义 PDF。',
            actionText: '查看讲义',
            actionType: 'document',
          },
        ],
      },
      ...THEORY_ROUND_GROUPS,
      {
        title: '思维导图',
        items: [
          {
            id: 'theory_mindmap_upload',
            title: '上传思维导图',
            desc: '支持上传 PDF 或照片，可反复重新上传。',
            actionText: '去上传',
            actionType: 'upload',
          },
        ],
      },
    ],
  },
  training: {
    stageKey: 'training',
    stageIndex: '3 / 6',
    stageName: '实训',
    stageSubtitle: '按 3 轮完成“题目、视频讲解、上传作业、批改反馈/去提问、学生心得体会、批改反馈”的实训闭环。',
    sectionTitle: '实训路径',
    groups: [
      {
        title: '实训路径',
        items: [
          {
            id: 'training_timer',
            title: '计时器',
            desc: '设置并开始本次实训计时。',
            actionType: 'timer',
          },
          ...TRAINING_ROUND_ITEMS,
        ],
      },
    ],
  },
  exam: {
    stageKey: 'exam',
    stageIndex: '4 / 6',
    stageName: '测试',
    stageSubtitle: '按顺序完成倒计时、题目、上传、讲解、反馈和卡点报告。',
    sectionTitle: '测试路径',
    groups: [
      {
        title: '测试路径',
        items: [
          {
            id: 'exam_countdown',
            title: '倒计时显示器',
            desc: '设置并开始本次测试倒计时。',
            actionType: 'timer',
          },
          {
            id: 'exam_question',
            title: '题目',
            desc: '查看当前测试题目 PDF。',
            actionText: '查看题目',
            actionType: 'document',
          },
          {
            id: 'exam_homework_upload',
            title: '上传作业',
            desc: '上传测试作业，支持 PDF 或图片，可重新上传。',
            actionText: '去上传',
            actionType: 'upload',
          },
          {
            id: 'exam_explain_video',
            title: '视频讲解',
            desc: '查看 PDF 文档及视频链接。',
            actionText: '去学习',
            actionType: 'video',
            secondaryActionText: '去提问',
            secondaryActionType: 'askTeacher',
          },
          {
            id: 'exam_feedback',
            title: '批改反馈',
            desc: '查看基于作业 PDF 的批改反馈。',
            actionText: '查看反馈',
            actionType: 'feedback',
            secondaryActionText: '去提问',
            secondaryActionType: 'askTeacher',
          },
          {
            id: 'exam_point_report',
            title: '查看卡点报告',
            desc: '查看当前卡点测试报告。',
            actionText: '查看报告',
            actionType: 'report',
          },
        ],
      },
    ],
  },
  report: {
    stageKey: 'report',
    stageIndex: '5 / 6',
    stageName: '完成',
    stageSubtitle: '恭喜你完成本次学习。',
    sectionTitle: '学习完成',
    groups: [
      {
        title: '学习完成',
        items: [
          {
            id: 'report_encourage',
            title: '恭喜你完成本次学习',
            desc: '你已经走完了这一阶段的完整训练路径，继续保持复盘和练习节奏，下一次会更稳、更准。',
            actionText: '我知道了',
            actionType: 'encourage',
          },
        ],
      },
    ],
  },
  drill: {
    stageKey: 'drill',
    stageIndex: '6 / 6',
    stageName: '刷题',
    stageSubtitle: '先开启正计时，再按顺序完成题目、上传作业、AI批改、去上课、去回顾、群内答疑总结，最后查看刷题报告总结。',
    sectionTitle: '刷题流程',
    groups: [
      {
        title: '刷题流程',
        items: [
          {
            id: 'drill_countdown',
            title: '计时器',
            desc: '开始本次刷题计时。',
            actionType: 'timer',
          },
          ...DRILL_ITEMS,
          {
            id: 'drill_monthly_report',
            title: '刷题报告总结',
            desc: '查看 4 月直播课安排、休息日和注意事项。',
            actionText: '查看总结',
            actionType: 'report',
          },
        ],
      },
    ],
  },
}

function cloneItems(items = []) {
  return items.map((item) => ({ ...item }))
}

function cloneGroups(groups = []) {
  return groups.map((group) => ({
    ...group,
    items: cloneItems(group.items || []),
  }))
}

function readAllProgress() {
  return wx.getStorageSync(STORAGE_KEY) || {}
}

function writeAllProgress(payload = {}) {
  wx.setStorageSync(STORAGE_KEY, payload)
}

function readAllRemotePayloads() {
  return wx.getStorageSync(REMOTE_STORAGE_KEY) || {}
}

function writeAllRemotePayloads(payload = {}) {
  wx.setStorageSync(REMOTE_STORAGE_KEY, payload)
}

function getStageStorageId(pointName = '', stageKey = '') {
  return `${String(pointName || 'default').trim()}::${String(stageKey || '').trim()}`
}

function normalizeStageState(state = {}) {
  return {
    completedTaskIds: Array.isArray(state.completedTaskIds) ? state.completedTaskIds : [],
    taskMeta: state && typeof state.taskMeta === 'object' && state.taskMeta
      ? state.taskMeta
      : {},
  }
}

function readLearningPathStageState(pointName = '', stageKey = '') {
  const allProgress = readAllProgress()
  return normalizeStageState(allProgress[getStageStorageId(pointName, stageKey)] || {})
}

function writeLearningPathStageState(pointName = '', stageKey = '', stageState = {}) {
  const allProgress = readAllProgress()
  allProgress[getStageStorageId(pointName, stageKey)] = normalizeStageState(stageState)
  writeAllProgress(allProgress)
}

function readRemoteLearningPathPayload(pointName = '') {
  const allPayloads = readAllRemotePayloads()
  return allPayloads[String(pointName || '').trim()] || null
}

function hydrateLearningPathStateFromPayload(payload = {}) {
  const pointName = String(payload.pointName || '').trim()
  if (!pointName || !Array.isArray(payload.stages)) {
    return
  }

  payload.stages.forEach((stage) => {
    if (!stage || !stage.stageKey) return

    const stageState = {
      completedTaskIds: [],
      taskMeta: {},
    }

    ;(stage.groups || []).forEach((group) => {
      ;(group.items || group.tasks || []).forEach((item) => {
        const taskId = item.id || item.taskId
        if (!taskId) return

        if (item.status === 'done') {
          stageState.completedTaskIds.push(taskId)
        }

        if (item.meta && typeof item.meta === 'object') {
          stageState.taskMeta[taskId] = {
            ...(stageState.taskMeta[taskId] || {}),
            ...item.meta,
          }
        }

        if (item.appointment) {
          stageState.taskMeta[taskId] = {
            ...(stageState.taskMeta[taskId] || {}),
            appointment: item.appointment,
          }
        }

        if (item.result) {
          stageState.taskMeta[taskId] = {
            ...(stageState.taskMeta[taskId] || {}),
            result: item.result,
          }
        }

        if (item.resource) {
          stageState.taskMeta[taskId] = {
            ...(stageState.taskMeta[taskId] || {}),
            resource: item.resource,
          }
        }

        if (Array.isArray(item.uploads)) {
          stageState.taskMeta[taskId] = {
            ...(stageState.taskMeta[taskId] || {}),
            uploads: item.uploads,
          }
        }
      })
    })

    writeLearningPathStageState(pointName, stage.stageKey, stageState)
  })
}

function saveRemoteLearningPathPayload(pointName = '', payload = null) {
  const safePointName = String(pointName || '').trim()
  if (!safePointName || !payload) return

  const normalizedPayload = {
    ...payload,
    stages: Array.isArray(payload.stages)
      ? payload.stages.map((stage) => ({
          ...stage,
          groups: Array.isArray(stage.groups)
            ? stage.groups.map((group) => {
                const normalizedItems = (group.items || group.tasks || []).map((item) => {
                  const nextItem = { ...item }

                  if (item.resource) {
                    nextItem.resource = normalizeDocumentResource(item.resource)
                  }

                  if (item.meta && typeof item.meta === 'object') {
                    nextItem.meta = {
                      ...item.meta,
                      resource: normalizeDocumentResource(item.meta.resource),
                    }
                  }

                  return nextItem
                })

                return {
                  ...group,
                  ...(Array.isArray(group.items) ? { items: normalizedItems } : {}),
                  ...(Array.isArray(group.tasks) ? { tasks: normalizedItems } : {}),
                }
              })
            : [],
        }))
      : [],
  }
  const allPayloads = readAllRemotePayloads()
  allPayloads[safePointName] = normalizedPayload
  writeAllRemotePayloads(allPayloads)
  hydrateLearningPathStateFromPayload(normalizedPayload)
}

function saveLearningPathTaskMeta(pointName = '', stageKey = '', taskId = '', meta = {}) {
  const stageState = readLearningPathStageState(pointName, stageKey)
  stageState.taskMeta[taskId] = {
    ...(stageState.taskMeta[taskId] || {}),
    ...meta,
  }
  writeLearningPathStageState(pointName, stageKey, stageState)
  return stageState
}

function completeLearningPathTask(pointName = '', stageKey = '', taskId = '', meta = {}) {
  const stageState = readLearningPathStageState(pointName, stageKey)
  const completedSet = new Set(stageState.completedTaskIds || [])
  completedSet.add(taskId)
  stageState.completedTaskIds = [...completedSet]
  if (meta && Object.keys(meta).length) {
    stageState.taskMeta[taskId] = {
      ...(stageState.taskMeta[taskId] || {}),
      ...meta,
    }
  }
  writeLearningPathStageState(pointName, stageKey, stageState)
  return stageState
}

function buildUploadDesc(desc = '', taskMeta = {}) {
  const uploadCount = Number(taskMeta.uploadCount || 0)
  if (!uploadCount) {
    return desc
  }

  return `${desc} 已上传 ${uploadCount} 个文件，可继续重新上传。`
}

function buildScheduleDesc(desc = '', taskMeta = {}) {
  if (!taskMeta.selectedLabel) {
    return desc
  }

  return `${desc} 已预约：${taskMeta.selectedLabel}。`
}

function buildProcessingDesc(desc = '', taskMeta = {}) {
  if (!taskMeta.processingStartedAt) {
    return desc
  }

  return taskMeta.processingDone
    ? 'AI 批改已处理完成，可以查看批改。'
    : 'AI 正在处理中，请稍后查看批改。'
}

function buildDoneHint(item = {}, taskMeta = {}) {
  if (item.actionType === 'upload') {
    return buildUploadDesc(item.desc || '', taskMeta)
  }

  if (item.actionType === 'schedule') {
    return buildScheduleDesc(item.desc || '', taskMeta)
  }

  if (item.actionType === 'processing') {
    return buildProcessingDesc(item.desc || '', taskMeta)
  }

  return item.desc || ''
}

function decorateTask(item = {}, taskMeta = {}) {
  const nextItem = {
    ...item,
    meta: taskMeta,
    desc: buildDoneHint(item, taskMeta),
  }

  if (item.actionType === 'schedule' && taskMeta.selectedLabel) {
    nextItem.actionText = '修改时间'
  }

  if (item.actionType === 'upload' && Number(taskMeta.uploadCount || 0) > 0) {
    nextItem.actionText = '继续上传'
  }

  if (item.actionType === 'processing' && taskMeta.processingDone) {
    nextItem.actionText = '查看批改'
  }

  return nextItem
}

function buildLearningPathStageFromRemote(stage = {}, pointName = '') {
  const groups = (stage.groups || []).map((group) => ({
    ...group,
    items: (group.items || group.tasks || []).map((item) => {
      const normalizedItem = {
        ...item,
        id: item.id || item.taskId || '',
      }
      return decorateTask(normalizedItem, normalizedItem.meta || {})
    }),
  }))

  return {
    ...stage,
    pointName: pointName || stage.pointName || '',
    currentTaskId: stage.currentTaskId || '',
    groups,
  }
}

function getRemoteStageItems(stage = {}) {
  return (stage.groups || []).reduce((items, group) => (
    items.concat(group.items || group.tasks || [])
  ), [])
}

function getDefinitionStageItems(stageKey = '') {
  const definition = STAGE_DEFINITIONS[stageKey] || STAGE_DEFINITIONS.diagnose
  return (definition.groups || []).reduce((items, group) => (
    items.concat(group.items || [])
  ), [])
}

function shouldUseRemoteStage(stageKey = '', stage = {}) {
  if (stageKey === 'theory') {
    return !getRemoteStageItems(stage).some((item) => (
      /^theory_(consensus|fix)_/.test(String(item.id || item.taskId || ''))
      || ['theory_recorded', 'theory_homework_pdf', 'theory_explain_video', 'theory_teacher_feedback'].includes(String(item.id || item.taskId || ''))
    ))
  }

  if (stageKey === 'training') {
    const legacyFeedbackIds = ['training_feedback_1', 'training_feedback_2', 'training_feedback_3']
    return !getRemoteStageItems(stage).some((item) => legacyFeedbackIds.includes(item.id || item.taskId))
  }

  if (stageKey === 'drill') {
    return !getRemoteStageItems(stage).some((item) => String(item.id || item.taskId || '').startsWith('drill_round_'))
  }

  return true
}

function buildLearningPathStage(stageKey = '', pointName = '') {
  const remotePayload = readRemoteLearningPathPayload(pointName)
  if (remotePayload && Array.isArray(remotePayload.stages)) {
    const remoteStage = remotePayload.stages.find((item) => item.stageKey === stageKey)
    if (remoteStage && shouldUseRemoteStage(stageKey, remoteStage)) {
      return buildLearningPathStageFromRemote(remoteStage, pointName)
    }
  }

  const definition = STAGE_DEFINITIONS[stageKey] || STAGE_DEFINITIONS.diagnose
  const stageState = readLearningPathStageState(pointName, definition.stageKey)
  let currentTaskId = ''
  let currentFound = false

  const groups = cloneGroups(definition.groups || []).map((group) => ({
    ...group,
    items: (group.items || []).map((item) => {
      const taskMeta = stageState.taskMeta[item.id] || {}
      const nextItem = decorateTask(item, taskMeta)
      const isDone = (stageState.completedTaskIds || []).includes(item.id)

      if (isDone) {
        return {
          ...nextItem,
          status: 'done',
        }
      }

      if (!currentFound) {
        currentFound = true
        currentTaskId = item.id
        return {
          ...nextItem,
          status: 'current',
        }
      }

      return {
        ...nextItem,
        status: 'pending',
      }
    }),
  }))

  return {
    ...definition,
    pointName,
    currentTaskId,
    groups,
  }
}

function normalizePointCourseStatus(courseStatus = '') {
  const safeStatus = String(courseStatus || '').trim()

  if (['solved', 'completed', 'done'].includes(safeStatus)) {
    return 'solved'
  }

  if (['learning', 'current', 'in_progress'].includes(safeStatus)) {
    return 'learning'
  }

  if (safeStatus === 'locked') {
    return 'locked'
  }

  return 'pending'
}

function buildStageProgressMeta(pointName = '', stageKey = '') {
  const remotePayload = readRemoteLearningPathPayload(pointName)
  const remoteStage = remotePayload && Array.isArray(remotePayload.stages)
    ? remotePayload.stages.find((item) => item.stageKey === stageKey)
    : null

  if (remoteStage && shouldUseRemoteStage(stageKey, remoteStage)) {
    const items = getRemoteStageItems(remoteStage)
    const doneCount = items.filter((item) => item.status === 'done').length
    const hasCurrent = items.some((item) => item.status === 'current')

    return {
      totalCount: items.length,
      doneCount,
      hasCurrent,
      hasProgress: hasCurrent || doneCount > 0,
      allDone: items.length > 0 && doneCount >= items.length,
    }
  }

  const definitionItems = getDefinitionStageItems(stageKey)
  const stageState = readLearningPathStageState(pointName, stageKey)
  const completedSet = new Set(stageState.completedTaskIds || [])
  const doneCount = definitionItems.filter((item) => completedSet.has(item.id)).length

  return {
    totalCount: definitionItems.length,
    doneCount,
    hasCurrent: false,
    hasProgress: doneCount > 0 || Object.keys(stageState.taskMeta || {}).length > 0,
    allDone: definitionItems.length > 0 && doneCount >= definitionItems.length,
  }
}

function buildLearningPathProgress(pointName = '', courseStatus = 'pending') {
  let resolvedCourseStatus = normalizePointCourseStatus(courseStatus)
  const stageStatusMap = LEARNING_PATH_STAGE_SEQUENCE.reduce((result, stageKey) => {
    result[stageKey] = 'locked'
    return result
  }, {})

  if (resolvedCourseStatus === 'locked') {
    return {
      courseStatus: resolvedCourseStatus,
      currentStageKey: '',
      stageStatusMap,
    }
  }

  if (resolvedCourseStatus === 'solved') {
    LEARNING_PATH_STAGE_SEQUENCE.forEach((stageKey) => {
      stageStatusMap[stageKey] = 'done'
    })

    return {
      courseStatus: resolvedCourseStatus,
      currentStageKey: '',
      stageStatusMap,
    }
  }

  stageStatusMap.diagnose = 'done'

  const progressMeta = {
    theory: buildStageProgressMeta(pointName, 'theory'),
    training: buildStageProgressMeta(pointName, 'training'),
    exam: buildStageProgressMeta(pointName, 'exam'),
    drill: buildStageProgressMeta(pointName, 'drill'),
  }

  const hasLearningProgress = ['theory', 'training', 'exam', 'drill'].some((stageKey) => {
    const meta = progressMeta[stageKey]
    return meta && (meta.hasProgress || meta.allDone)
  })

  if (resolvedCourseStatus === 'pending' && hasLearningProgress) {
    resolvedCourseStatus = 'learning'
  }

  if (resolvedCourseStatus === 'pending') {
    stageStatusMap.theory = 'current'

    return {
      courseStatus: resolvedCourseStatus,
      currentStageKey: 'theory',
      stageStatusMap,
    }
  }

  const allDone = progressMeta.theory.allDone
    && progressMeta.training.allDone
    && progressMeta.exam.allDone
    && progressMeta.drill.allDone

  if (allDone) {
    LEARNING_PATH_STAGE_SEQUENCE.forEach((stageKey) => {
      stageStatusMap[stageKey] = 'done'
    })

    return {
      courseStatus: 'solved',
      currentStageKey: '',
      stageStatusMap,
    }
  }

  let currentStageKey = ['theory', 'training', 'exam', 'drill'].find((stageKey) => progressMeta[stageKey].hasCurrent)

  if (!currentStageKey) {
    currentStageKey = ['theory', 'training', 'exam', 'drill'].find((stageKey) => (
      progressMeta[stageKey].hasProgress && !progressMeta[stageKey].allDone
    ))
  }

  if (!currentStageKey) {
    if (!progressMeta.theory.allDone) {
      currentStageKey = 'theory'
    } else if (!progressMeta.training.allDone) {
      currentStageKey = 'training'
    } else if (!progressMeta.exam.allDone) {
      currentStageKey = 'exam'
    } else if (!progressMeta.drill.hasProgress && !progressMeta.drill.allDone) {
      currentStageKey = 'report'
    } else if (!progressMeta.drill.allDone) {
      currentStageKey = 'drill'
    }
  }

  const currentStageIndex = ACTIVE_LEARNING_STAGE_SEQUENCE.indexOf(currentStageKey)

  ACTIVE_LEARNING_STAGE_SEQUENCE.forEach((stageKey, index) => {
    if (currentStageIndex === -1) {
      return
    }

    if (index < currentStageIndex) {
      stageStatusMap[stageKey] = 'done'
      return
    }

    if (index === currentStageIndex) {
      stageStatusMap[stageKey] = 'current'
    }
  })

  return {
    courseStatus: resolvedCourseStatus,
    currentStageKey,
    stageStatusMap,
  }
}

function getLearningPathTask(stageKey = '', taskId = '') {
  const definition = STAGE_DEFINITIONS[stageKey] || STAGE_DEFINITIONS.diagnose
  const groups = definition.groups || []

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const group = groups[groupIndex]
    const items = group.items || []
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      if (items[itemIndex].id === taskId) {
        return { ...items[itemIndex] }
      }
    }
  }

  return null
}

function chooseImageFiles(count = 9) {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      success: (res) => {
        const files = (res.tempFilePaths || []).map((filePath, index) => ({
          id: `${Date.now()}-img-${index + 1}`,
          path: filePath,
          name: `图片-${index + 1}.jpg`,
          kind: 'image',
        }))
        resolve(files)
      },
      fail: reject,
    })
  })
}

function chooseDocumentFiles(count = 9, fileExtensions = ['pdf', 'doc', 'docx']) {
  return new Promise((resolve, reject) => {
    wx.chooseMessageFile({
      count,
      type: 'file',
      extension: fileExtensions,
      success: (res) => {
        const files = (res.tempFiles || []).map((file, index) => ({
          id: `${Date.now()}-file-${index + 1}`,
          path: file.path,
          name: file.name || `文件-${index + 1}`,
          kind: 'file',
        }))
        resolve(files)
      },
      fail: reject,
    })
  })
}

function chooseLearningPathFiles(options = {}) {
  const {
    count = 9,
    allowImage = true,
    allowFile = true,
    fileExtensions = ['pdf', 'doc', 'docx'],
  } = options

  if (allowImage && allowFile) {
    return new Promise((resolve, reject) => {
      wx.showActionSheet({
        itemList: ['上传图片', '上传文件'],
        success: async (res) => {
          try {
            const files = res.tapIndex === 0
              ? await chooseImageFiles(count)
              : await chooseDocumentFiles(count, fileExtensions)
            resolve(files)
          } catch (error) {
            reject(error)
          }
        },
        fail: reject,
      })
    })
  }

  if (allowImage) {
    return chooseImageFiles(count)
  }

  return chooseDocumentFiles(count, fileExtensions)
}

function simulateLearningPathProcessing(duration = 900) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

function openTeacherTab() {
  return new Promise((resolve) => {
    wx.switchTab({
      url: '/pages/chat/chat',
      complete: resolve,
    })
  })
}

function getFeedbackTaskIdForUploadTask(taskId = '') {
  const fixedMap = {
    exam_homework_upload: 'exam_feedback',
    drill_upload: 'drill_qa_summary',
  }

  if (fixedMap[taskId]) return fixedMap[taskId]

  const trainingMatch = String(taskId || '').match(/^training_round_(\d+)_(homework|reflection)_upload$/)
  if (trainingMatch) {
    return `training_round_${trainingMatch[1]}_${trainingMatch[2]}_feedback`
  }

  return ''
}

function getLearningPathReviewType(stageKey = '') {
  return stageKey === 'exam'
    ? '卡点考试'
    : '卡点练习题'
}

function getUploadPickerOptions(stageKey = '', taskId = '') {
  if (stageKey === 'theory' && taskId === 'theory_mindmap_upload') {
    return {
      count: 9,
      allowImage: true,
      allowFile: true,
      fileExtensions: ['pdf'],
    }
  }

  return {
    count: 9,
    allowImage: false,
    allowFile: true,
    fileExtensions: ['pdf'],
  }
}

async function submitLearningPathUploadTask(pointName = '', stageKey = '', taskId = '', appInstance) {
  const safePointName = String(pointName || '').trim()
  const safeStageKey = String(stageKey || '').trim()
  const safeTaskId = String(taskId || '').trim()
  if (!safePointName || !safeStageKey || !safeTaskId) {
    return { files: [], submissions: [] }
  }

  const files = await chooseLearningPathFiles(getUploadPickerOptions(safeStageKey, safeTaskId))

  if (!files.length) {
    return { files: [], submissions: [] }
  }

  const app = appInstance || getApp()
  const studentName = (((app || {}).globalData || {}).userProfile || {}).name || ''
  const reviewType = getLearningPathReviewType(safeStageKey, safeTaskId)
  const feedbackTaskId = getFeedbackTaskIdForUploadTask(safeTaskId)
  const submissions = []

  for (const file of files) {
    const result = await uploadStudentSubmission(file, {
      studentName,
      reviewType,
      checkpoint: safePointName,
      pointName: safePointName,
      stageKey: safeStageKey,
      taskId: safeTaskId,
      feedbackTaskId,
      priority: 'normal',
      submittedNormal: 'true',
    }, app)
    submissions.push(result.submission || result)
  }

  await syncLearningPathFromServer(safePointName, app)
  return { files, submissions }
}

function openLearningPathFeedback(options = {}) {
  const {
    pointName = '',
    stageKey = '',
    taskId = '',
    title = '',
    studyOptions = {},
  } = options

  const url = appendStudyQuery('/pages/submission-feedback/submission-feedback', studyOptions, {
    pointName,
    stageKey,
    taskId,
    title,
  })

  return new Promise((resolve) => {
    wx.navigateTo({
      url,
      complete: resolve,
    })
  })
}

async function fetchLatestFeedbackSubmission(pointName = '', stageKey = '', taskId = '', appInstance) {
  const safePointName = String(pointName || '').trim()
  const safeStageKey = String(stageKey || '').trim()
  const safeTaskId = String(taskId || '').trim()
  if (!safePointName || !safeStageKey || !safeTaskId) {
    return null
  }

  const list = await fetchStudentSubmissions({
    pointName: safePointName,
    stageKey: safeStageKey,
    feedbackTaskId: safeTaskId,
  }, appInstance)

  return Array.isArray(list) && list.length ? list[0] : null
}

async function syncLearningPathFromServer(pointName = '', appInstance) {
  const safePointName = String(pointName || '').trim()
  if (!safePointName) return null

  const payload = await fetchStudentLearningPath(safePointName, appInstance)
  if (payload && payload.stages) {
    saveRemoteLearningPathPayload(safePointName, payload)
  }
  return payload
}

async function persistLearningPathTask(pointName = '', stageKey = '', taskId = '', data = {}, appInstance) {
  if (!pointName || !stageKey || !taskId) {
    return null
  }

  const result = await updateStudentLearningPathTask(taskId, {
    pointName,
    stageKey,
    ...data,
  }, appInstance)

  await syncLearningPathFromServer(pointName, appInstance)
  return result
}

module.exports = {
  STAGE_DEFINITIONS,
  buildLearningPathProgress,
  buildLearningPathStage,
  chooseLearningPathFiles,
  completeLearningPathTask,
  getLearningPathTask,
  openTeacherTab,
  openLearningPathFeedback,
  persistLearningPathTask,
  readLearningPathStageState,
  saveLearningPathTaskMeta,
  submitLearningPathUploadTask,
  syncLearningPathFromServer,
  simulateLearningPathProcessing,
  fetchLatestFeedbackSubmission,
}
