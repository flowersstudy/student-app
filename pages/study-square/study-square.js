Page({
  data: {
    heroStats: [
      { id: 1, value: '2', label: '近期活动' },
      { id: 2, value: '2', label: '学习小组' },
      { id: 3, value: '3', label: '可兑换内容' }
    ],
    activities: [
      {
        id: 1,
        tag: '本周活动',
        title: '申论晨读打卡营',
        time: '04-10 至 04-16',
        desc: '连续 7 天晨读打卡，帮助建立稳定输入节奏。',
        extra: '完成后可获得 180 积分',
        cta: '查看活动'
      },
      {
        id: 2,
        tag: '直播预告',
        title: '材料分析公开拆解课',
        time: '04-12 19:30',
        desc: '围绕高频失分点做现场拆解，适合跟学与提问。',
        extra: '李老师主讲 · 支持回放',
        cta: '预约直播'
      }
    ],
    teams: [
      {
        id: 1,
        name: '国考晨练队',
        desc: '每天 7:00 一起打卡刷题，适合需要同伴监督的同学。',
        meta: '46/60 人 · 活跃中',
        cta: '申请加入'
      },
      {
        id: 2,
        name: '申论复盘小组',
        desc: '每晚 21:00 一起复盘错题，重点看“为什么错”。',
        meta: '28/40 人 · 高热度',
        cta: '加入小组'
      }
    ],
    syncItems: [
      '本周新增 2 节录播课和 1 份范文资料。',
      '4 月 12 日晚 19:30 有公开直播答疑。',
      '阶段测评将于 4 月 13 日 20:00 开放提交。'
    ],
    comments: [
      { id: 1, user: '王同学', avatar: '王', text: '跟着卡点学习后，终于知道自己问题不是不会写，而是前面找点和结构就错了。' },
      { id: 2, user: '刘同学', avatar: '刘', text: '组队复盘特别有用，看到别人怎么拆题，自己的盲区会一下子暴露出来。' },
      { id: 3, user: '陈同学', avatar: '陈', text: '公开课配合资料包一起看，学习链路会更完整，不会听完就结束。' }
    ],
    cases: [
      {
        id: 1,
        name: '张同学',
        result: '申论 68 → 78',
        summary: '用 6 周时间补齐结构和论证短板，复盘习惯建立后提分更稳定。'
      },
      {
        id: 2,
        name: '陈同学',
        result: '行测 59 → 71',
        summary: '通过晨练刷题和错题复盘，把做题节奏和准确率都拉了起来。'
      }
    ],
    pointGoods: [
      { id: 1, name: '高频范文资料包', desc: '适合日常积累与背诵', points: 300, cta: '立即兑换' },
      { id: 2, name: '公开课优先名额', desc: '热门活动可优先报名', points: 500, cta: '查看详情' },
      { id: 3, name: '1v1 点评券', desc: '用于专项作业点评', points: 1200, cta: '立即兑换' }
    ]
  },

  handleAction(e) {
    const label = e.currentTarget.dataset.label
    wx.showToast({ title: label, icon: 'none' })
  }
})
