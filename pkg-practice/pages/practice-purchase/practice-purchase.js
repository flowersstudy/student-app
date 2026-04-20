const CONSULT_QR_IMAGE = '/assets/chat/study-manager-qrcode.png'

Page({
  data: {
    courseLabel: '刷题班',
    title: '刷题班详情请咨询学管老师',
    subtitle: '刷题班当前改为由学管老师统一介绍开通方式、训练安排和适合人群。',
    qrTitle: '刷题班咨询二维码',
    qrNote: '扫码后发送“刷题班”，学管老师会继续为你介绍课程详情。',
    qrImage: CONSULT_QR_IMAGE,
    helpList: [
      '确认当前是否适合先进入刷题训练节奏',
      '说明每周训练、作业、复盘和讲评安排',
      '如需开通，由学管老师继续协助处理',
    ],
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '刷题班咨询',
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
