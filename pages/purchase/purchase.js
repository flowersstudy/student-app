const { getPointVersionData } = require('../../utils/card-paths')

const CONSULT_QR_IMAGE = '/assets/chat/study-manager-qrcode.png'

const DEFAULT_SCENE = {
  navTitle: '咨询学管老师',
  courseLabel: '课程咨询',
  title: '详情请咨询学管老师',
  subtitle: '当前课程的开通、版本说明和学习安排，统一由学管老师协助处理。',
  qrTitle: '学管老师微信',
  qrNote: '请扫码添加学管老师微信，沟通课程详情和开通方式。',
  helpList: [
    '确认课程内容、适合人群和当前是否适合开通',
    '说明具体学习安排、服务形式和后续解锁流程',
    '如你已与老师沟通过，可继续协助完成开通',
  ],
}

function resolvePointName(options = {}) {
  const pointName = String(options.pointName || '').trim()
  if (pointName) {
    return pointName
  }

  const pointId = parseInt(options.pointId || options.id, 10)
  if (!pointId) {
    return ''
  }

  try {
    const pointData = getPointVersionData(pointId)
    return String((pointData && pointData.pointName) || '').trim()
  } catch (error) {
    return ''
  }
}

function buildScene(options = {}) {
  if (options.mode === 'diagnose') {
    return {
      navTitle: '诊断课咨询',
      courseLabel: '诊断课',
      title: '诊断课详情请咨询学管老师',
      subtitle: '诊断课当前改为由学管老师一对一协助介绍、报价和开通，未解锁时会直接进入这里。',
      qrTitle: '诊断课咨询二维码',
      qrNote: '扫码后可直接咨询诊断课适合情况、服务流程和开通方式。',
      helpList: [
        '先判断你是否适合先做 1v1 人工诊断',
        '说明诊断流程、输出内容和后续学习衔接',
        '需要开通时，由学管老师继续跟进处理',
      ],
    }
  }

  const pointName = resolvePointName(options)
  if (pointName) {
    return {
      navTitle: '卡点课咨询',
      courseLabel: pointName,
      title: `${pointName}详情请咨询学管老师`,
      subtitle: '该卡点课程当前改为由学管老师统一介绍版本差异、学习安排和开通方式。',
      qrTitle: '卡点课咨询二维码',
      qrNote: `扫码后发送“${pointName}”，学管老师会继续为你介绍详情。`,
      helpList: [
        '介绍当前卡点适合的学习版本和节奏',
        '说明课程安排、服务内容和后续推进方式',
        '如需开通，由学管老师协助完成解锁',
      ],
    }
  }

  return DEFAULT_SCENE
}

Page({
  data: {
    qrImage: CONSULT_QR_IMAGE,
    ...DEFAULT_SCENE,
  },

  onLoad(options = {}) {
    const scene = buildScene(options)

    this.setData(scene)

    wx.setNavigationBarTitle({
      title: scene.navTitle,
    })
  },

  previewQr() {
    wx.previewImage({
      current: this.data.qrImage,
      urls: [this.data.qrImage],
      fail: () => {
        wx.showToast({
          title: '请长按二维码保存',
          icon: 'none',
        })
      },
    })
  },

  goChat() {
    wx.switchTab({
      url: '/pages/chat/chat',
    })
  },
})
