const { uiIcons } = require('../../../utils/ui-icons')
const { finishStudySession, startStudySession } = require('../../../utils/study-session')
const { normalizeStudyOptions } = require('../../../utils/study-route')
const { resolvePolyvVideo } = require('../../../utils/polyv-video')
const {
  fetchStudentPointLearningSummary,
  fetchStudentStudyCourse,
  submitStudentFeedback,
} = require('../../../utils/student-api')

function decodeOption(value, fallback = '') {
  if (value === undefined || value === null || `${value}` === '') {
    return fallback
  }

  try {
    return decodeURIComponent(`${value}`)
  } catch (error) {
    return `${value}`
  }
}

function normalizeFileResource(resource = {}, index = 0) {
  return {
    id: String(resource.id || `file_${index + 1}`),
    name: resource.title || `资料 ${index + 1}`,
    url: resource.url || '',
    opened: false,
  }
}

function buildRecordedTasks({ preFiles, videoTitle, postFiles, postVideoTitle }) {
  const tasks = []

  preFiles.forEach((file, index) => {
    tasks.push({
      id: `pre_${index + 1}`,
      title: index === 0 ? '阅读课前讲义' : '查看课前资料',
      desc: file.name,
      done: false,
    })
  })

  if (videoTitle) {
    tasks.push({
      id: 'video_main',
      title: '观看录播视频',
      desc: videoTitle,
      done: false,
    })
  }

  postFiles.forEach((file, index) => {
    tasks.push({
      id: `post_${index + 1}`,
      title: index === 0 ? '完成课后作业' : '查看课后资料',
      desc: file.name,
      done: false,
    })
  })

  if (postVideoTitle) {
    tasks.push({
      id: 'video_post',
      title: '观看课后讲解视频',
      desc: postVideoTitle,
      done: false,
    })
  }

  tasks.push({
    id: 'submit_homework',
    title: '上传作业等待老师批改',
    desc: '老师将在 24 小时内补充批改反馈',
    done: false,
  })

  return tasks
}

function extractLessonPayload(study = {}) {
  const days = Array.isArray(study.days) ? study.days : []
  const theoryTasks = []

  days.forEach((day) => {
    ;(day.tasks || [])
      .filter((task) => task.type === 'video' || task.type === 'review')
      .forEach((task) => {
        theoryTasks.push(task)
      })
  })

  const preFiles = []
  const postFiles = []
  const mainVideos = []

  theoryTasks.forEach((task) => {
    const resources = Array.isArray(task.resources) ? task.resources : []
    resources.forEach((resource) => {
      const type = String(resource.resource_type || '')
      const phase = String(resource.phase || '')

      if ((type === 'pdf' || type === 'file' || type === 'link') && phase === 'pre') {
        preFiles.push(normalizeFileResource(resource, preFiles.length))
        return
      }

      if ((type === 'pdf' || type === 'file' || type === 'link') && phase === 'post') {
        postFiles.push(normalizeFileResource(resource, postFiles.length))
        return
      }

      if (type === 'video' && phase === 'main') {
        mainVideos.push({
          id: String(resource.id || `video_${mainVideos.length + 1}`),
          title: resource.title || task.name || `视频 ${mainVideos.length + 1}`,
          videoId: resource.video_id || '',
        })
      }
    })
  })

  const videoTitle = mainVideos[0] ? mainVideos[0].title : '录播课'
  const videoId = mainVideos[0] ? mainVideos[0].videoId : ''
  const postVideoTitle = mainVideos[1] ? mainVideos[1].title : ''
  const postVideoId = mainVideos[1] ? mainVideos[1].videoId : ''

  return {
    preFiles,
    videoTitle,
    videoId,
    postFiles,
    postVideoTitle,
    postVideoId,
    recordedTasks: buildRecordedTasks({
      preFiles,
      videoTitle,
      postFiles,
      postVideoTitle,
    }),
  }
}

function buildPolyvPayload(options = {}, pointName = '') {
  const slotKey = decodeOption(options.polyvSlotKey || '')
  const directVideoId = decodeOption(options.videoId || '')
  const directVideoTitle = decodeOption(options.videoTitle || '')
  const resolved = resolvePolyvVideo(pointName, slotKey)
  const videoId = directVideoId || resolved.vid || ''
  const videoTitle = directVideoTitle || resolved.title || pointName || '录播课'

  return {
    preFiles: [],
    videoId,
    videoTitle,
    postFiles: [],
    postVideoId: '',
    postVideoTitle: '',
    recordedTasks: buildRecordedTasks({
      preFiles: [],
      videoTitle,
      postFiles: [],
      postVideoTitle: '',
    }),
  }
}

Page({
  data: {
    uiIcons,
    loading: true,
    preFiles: [],
    videoId: '',
    videoTitle: '录播课',
    postFiles: [],
    postVideoId: '',
    postVideoTitle: '',
    feedback: '',
    submittingFeedback: false,
    recordedTasks: [],
    recordedDoneCount: 0,
  },

  onLoad(options) {
    this.rawOptions = options || {}
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: '录播课',
    })
    void this.loadRecordedLesson()
  },

  onShow() {
    startStudySession(this, {
      sessionType: 'video',
      courseId: (page) => page.studyOptions && page.studyOptions.courseId,
      studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
      pointName: (page) => page.studyOptions && page.studyOptions.pointName,
    })
  },

  onHide() {
    finishStudySession(this)
  },

  onUnload() {
    finishStudySession(this)
  },

  async loadRecordedLesson() {
    try {
      const hasDirectPolyvSource = !!(
        decodeOption(this.rawOptions.videoId || '')
        || decodeOption(this.rawOptions.polyvSlotKey || '')
      )

      if (hasDirectPolyvSource) {
        const payload = buildPolyvPayload(this.rawOptions, this.studyOptions.pointName)
        this.setData({
          loading: false,
          ...payload,
          recordedDoneCount: 0,
        })
        return
      }

      let courseId = this.studyOptions.courseId

      if (!courseId && this.studyOptions.pointName) {
        const summary = await fetchStudentPointLearningSummary(this.studyOptions.pointName, this)
        courseId = summary && summary.courseId ? String(summary.courseId) : ''
        this.studyOptions.courseId = courseId
      }

      if (!courseId) {
        const payload = buildPolyvPayload({
          videoTitle: this.studyOptions.pointName || '录播课',
        }, this.studyOptions.pointName)

        this.setData({
          loading: false,
          ...payload,
        })
        return
      }

      const study = await fetchStudentStudyCourse(courseId, this)
      const payload = extractLessonPayload(study || {})

      this.setData({
        loading: false,
        ...payload,
        recordedDoneCount: 0,
      })
    } catch (error) {
      const payload = buildPolyvPayload({
        videoTitle: this.studyOptions.pointName || '录播课',
      }, this.studyOptions.pointName)

      this.setData({
        loading: false,
        ...payload,
        recordedDoneCount: 0,
      })
    }
  },

  openFile(e) {
    const { list, id } = e.currentTarget.dataset
    const targetList = Array.isArray(this.data[list]) ? this.data[list] : []
    const file = targetList.find((item) => String(item.id) === String(id))
    if (!file || !file.url) return

    const files = targetList.map((item) => (
      String(item.id) === String(id) ? { ...item, opened: true } : item
    ))

    this.setData({ [list]: files })
    wx.downloadFile({
      url: file.url,
      success: (res) => wx.openDocument({ filePath: res.tempFilePath, showMenu: true }),
    })
  },

  copyVideoId(videoId = '', title = '视频') {
    if (!videoId) {
      wx.showToast({
        title: `${title}暂未配置`,
        icon: 'none',
      })
      return
    }

    wx.setClipboardData({
      data: videoId,
      success: () => {
        wx.showToast({
          title: `${title}ID已复制`,
          icon: 'none',
        })
      },
    })
  },

  enterVideo() {
    this.copyVideoId(this.data.videoId, this.data.videoTitle || '录播视频')
  },

  enterPostVideo() {
    this.copyVideoId(this.data.postVideoId, this.data.postVideoTitle || '讲解视频')
  },

  askTeacher() {
    wx.switchTab({ url: '/pages/chat/chat' })
  },

  toggleRecordedTask(e) {
    const id = e.currentTarget.dataset.id
    const tasks = this.data.recordedTasks.map((item) => (
      item.id === id ? { ...item, done: !item.done } : item
    ))
    const doneCount = tasks.filter((item) => item.done).length

    this.setData({
      recordedTasks: tasks,
      recordedDoneCount: doneCount,
    })
  },

  onFeedbackInput(e) {
    this.setData({ feedback: e.detail.value })
  },

  async submitLessonFeedback() {
    const content = String(this.data.feedback || '').trim()
    if (!content) {
      wx.showToast({
        title: '请先填写课程反馈',
        icon: 'none',
      })
      return
    }

    if (this.data.submittingFeedback) return

    this.setData({ submittingFeedback: true })

    try {
      await submitStudentFeedback({
        source: 'recorded_lesson',
        title: this.data.videoTitle || this.studyOptions.pointName || '录播课反馈',
        pointName: this.studyOptions.pointName || '',
        courseId: this.studyOptions.courseId || '',
        content,
        meta: {
          videoTitle: this.data.videoTitle || '',
          recordedDoneCount: this.data.recordedDoneCount || 0,
          recordedTasksTotal: Array.isArray(this.data.recordedTasks) ? this.data.recordedTasks.length : 0,
        },
      }, getApp())

      this.setData({ feedback: '' })
      wx.showToast({
        title: '反馈已提交',
        icon: 'success',
      })
    } catch (error) {
      wx.showToast({
        title: (error && error.message) || '提交失败，请稍后再试',
        icon: 'none',
      })
    } finally {
      this.setData({ submittingFeedback: false })
    }
  },
})
