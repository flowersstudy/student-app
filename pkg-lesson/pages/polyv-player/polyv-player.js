const { fetchStudentPolyvPlayAuth } = require('../../../utils/student-api')
const { getPolyvPlayerBase } = require('../../../utils/request')

const RATING_TRIGGER_STORAGE_KEY = 'recorded_rating_prompt_v1'

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

function buildPlayerUrl(base = '', {
  videoId = '',
  title = '',
  playsafe = '',
  ts = '',
  sign = '',
  autoBackOnEnded = false,
} = {}) {
  const safeBase = String(base || '').replace(/\/+$/, '')
  const query = [
    `vid=${encodeURIComponent(videoId)}`,
    `title=${encodeURIComponent(title)}`,
    `playsafe=${encodeURIComponent(playsafe)}`,
    `ts=${encodeURIComponent(ts)}`,
    `sign=${encodeURIComponent(sign)}`,
    `autoBackOnEnded=${autoBackOnEnded ? '1' : '0'}`,
  ].join('&')

  return `${safeBase}/polyv/player?${query}`
}

Page({
  data: {
    loading: true,
    playerUrl: '',
    errorText: '',
    videoTitle: '录播课',
  },

  onLoad(options) {
    this.videoId = decodeOption(options.videoId || '')
    this.taskId = decodeOption(options.taskId || options.studyTaskId || '')
    this.pointName = decodeOption(options.pointName || '')
    this.autoBackOnEnded = String(options.autoBackOnEnded || '') === '1'
    this.videoTitle = decodeOption(options.title || '录播课')
    this.setData({
      videoTitle: this.videoTitle,
    })
    void this.loadPlayer()
  },

  onWebMessage(e) {
    const rawData = e && e.detail ? e.detail.data : []
    const messages = Array.isArray(rawData) ? rawData : [rawData]
    const endedMessage = messages.find((item) => item && item.type === 'polyv_ended')

    if (!endedMessage || this._handledEndedMessage) {
      return
    }

    this._handledEndedMessage = true
    wx.setStorageSync(RATING_TRIGGER_STORAGE_KEY, {
      type: 'polyv_ended',
      taskId: this.taskId || '',
      pointName: this.pointName || '',
      title: this.videoTitle || '',
      videoId: this.videoId || '',
      endedAt: Number(endedMessage.endedAt || Date.now()),
    })
  },

  async loadPlayer() {
    if (!this.videoId) {
      this.setData({
        loading: false,
        errorText: '缺少视频 VID',
      })
      return
    }

    try {
      const authPayload = await fetchStudentPolyvPlayAuth(this.videoId, getApp())
      const authData = authPayload && authPayload.data ? authPayload.data : {}
      const playsafe = String(authData.playsafe || '').trim()
      const ts = String(authData.ts || '').trim()
      const sign = String(authData.sign || '').trim()

      if (!playsafe || !ts || !sign) {
        throw new Error('录播鉴权参数不完整')
      }

      const playerUrl = buildPlayerUrl(getPolyvPlayerBase(getApp()), {
        videoId: this.videoId,
        title: this.videoTitle,
        playsafe,
        ts,
        sign,
        autoBackOnEnded: this.autoBackOnEnded,
      })

      this.setData({
        loading: false,
        playerUrl,
        errorText: '',
      })
    } catch (error) {
      this.setData({
        loading: false,
        errorText: (error && error.message) || '录播鉴权失败',
      })
    }
  },
})
