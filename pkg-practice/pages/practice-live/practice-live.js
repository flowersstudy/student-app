const { uiIcons } = require('../../../utils/ui-icons')
const { finishStudySession, startStudySession } = require('../../../utils/study-session')
const { normalizeStudyOptions } = require('../../../utils/study-route')

const LIVE_INFO_BY_DATE = {
  '2026-04-17': {
    title: '直播 1：讲解精准找点的方法',
    subtitle: '要点不全不准 · 提炼转述困难',
    time: '4月17日 周四 19:00 - 20:30',
    teacher: '李老师',
    meetingNo: '987 654 321',
    meetingPassword: '6666',
    link: 'https://meeting.tencent.com/mock/practice-live-room-0417',
    replayLink: 'https://meeting.tencent.com/mock/practice-live-replay-0417',
    updatedAt: '已生成回放',
  },
  '2026-04-24': {
    title: '直播 2：分享对策精准可行的思路',
    subtitle: '对策推导困难 · 本周共性问题讲评',
    time: '4月24日 周四 19:00 - 20:30',
    teacher: '李老师',
    meetingNo: '987 654 322',
    meetingPassword: '6666',
    link: 'https://meeting.tencent.com/mock/practice-live-room-0424',
    replayLink: 'https://meeting.tencent.com/mock/practice-live-replay-0424',
    updatedAt: '已生成回放',
  },
  '2026-04-30': {
    title: '直播 3：讲解结构清晰的表达方法',
    subtitle: '分析结构不清 · 公文结构不清',
    time: '4月30日 周三 19:00 - 20:30',
    teacher: '李老师',
    meetingNo: '987 654 323',
    meetingPassword: '6666',
    link: 'https://meeting.tencent.com/mock/practice-live-room-0430',
    replayLink: 'https://meeting.tencent.com/mock/practice-live-replay-0430',
    updatedAt: '已生成回放',
  },
  '2026-05-08': {
    title: '直播 4：探讨写好作文的技巧',
    subtitle: '作文立意 · 论证表达综合讲评',
    time: '5月8日 周四 19:00 - 21:00',
    teacher: '李老师',
    meetingNo: '987 654 324',
    meetingPassword: '6666',
    link: 'https://meeting.tencent.com/mock/practice-live-room-0508',
    replayLink: 'https://meeting.tencent.com/mock/practice-live-replay-0508',
    updatedAt: '已生成回放',
  },
}

function safeDecode(value = '') {
  try {
    return decodeURIComponent(value)
  } catch (error) {
    return value
  }
}

function buildDefaultLiveInfo(options = {}) {
  const title = safeDecode(options.title || '') || '刷题直播课'

  return {
    title,
    subtitle: '刷题班 · 共性问题讲评',
    time: options.date || '待确认',
    teacher: '李老师',
    status: '待开课',
    link: 'https://meeting.tencent.com/mock/practice-live-room',
    meetingNo: '987 654 321',
    meetingPassword: '6666',
    replayLink: 'https://meeting.tencent.com/mock/practice-live-replay',
    updatedAt: '今天 16:20',
  }
}

Page({
  data: {
    uiIcons,
    isReplayMode: false,
    liveInfo: buildDefaultLiveInfo(),
    reminders: [
      '老师会在这里上传直播链接，开课前 10 分钟可直接复制进入。',
      '建议提前整理 1 个最想问的问题，上课时更容易跟住重点。',
      '如果链接有变化，这里会更新最新版本。',
    ],
    replayReminders: [
      '回放生成后可以从这里复制链接观看。',
      '建议先看老师讲评，再回到刷题任务里完成订正。',
      '如果回放无法打开，可以联系老师重新发送链接。',
    ],
    notes: '',
  },

  onLoad(options = {}) {
    const date = options.date || ''
    const liveInfo = {
      ...buildDefaultLiveInfo(options),
      ...(LIVE_INFO_BY_DATE[date] || {}),
    }
    const isReplayMode = options.mode === 'replay'

    this.studyOptions = normalizeStudyOptions(options, {
      pointName: liveInfo.subtitle,
    })

    this.setData({
      isReplayMode,
      liveInfo: {
        ...liveInfo,
        status: isReplayMode ? '可回放' : (liveInfo.status || '待开课'),
      },
    })

    wx.setNavigationBarTitle({
      title: isReplayMode ? '直播回放' : '直播学习',
    })
  },

  onShow() {
    startStudySession(this, {
      sessionType: this.data.isReplayMode ? 'review' : 'lesson',
      courseId: (page) => page.studyOptions && page.studyOptions.courseId,
      studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
      pointName: (page) => page.studyOptions && page.studyOptions.pointName,
      minDurationSec: 5,
    })
  },

  onHide() {
    finishStudySession(this)
  },

  onUnload() {
    finishStudySession(this)
  },

  copyLink() {
    wx.setClipboardData({
      data: this.data.liveInfo.link,
    })
  },

  copyReplayLink() {
    wx.setClipboardData({
      data: this.data.liveInfo.replayLink,
    })
  },

  copyMeetingNo() {
    wx.setClipboardData({
      data: this.data.liveInfo.meetingNo,
    })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  goChat() {
    wx.switchTab({
      url: '/pages/chat/chat',
    })
  },
})
