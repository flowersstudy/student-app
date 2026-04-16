const app = getApp()

Page({
  data: {
    student: {
      name: '张三',
      course: '破局刷题课',
      period: '第 2 周 / 共 4 周',
      reportDate: '2026-04-10',
      teacher: '何可心',
    },
    overview: {
      status: '刷题作业中',
      currentWeek: '第 2 周',
      taskCount: '2/4',
      nextLiveDate: '4/24',
      summary: '当前已进入第 2 周训练节奏，正在进行刷题作业与阶段复盘，整体推进正常。',
    },
    highlights: [
      '已完成 2 次找点专项刷题训练。',
      '本周作业已提交 2/4，剩余任务继续推进中。',
      '最近一次复盘反馈已同步，需重点关注漏点和分类问题。',
    ],
    tasks: [
      { title: '刷题作业', score: '2/4', desc: '围绕找点专项继续完成本周剩余作业，重点减少漏点。' },
      { title: '复盘反馈', score: '已同步', desc: '根据老师讲评修正前置词与分类问题，整理错因。' },
      { title: '直播讲评', score: '4/24', desc: '参加本周直播讲评，带着错题和疑问集中解决。' },
    ],
    stages: [
      {
        title: '阶段一 · 找点纠偏',
        duration: '第 1-2 周',
        goal: '建立稳定的提炼习惯，减少要点不全不准带来的失分。',
      },
      {
        title: '阶段二 · 分类巩固',
        duration: '第 3-4 周',
        goal: '加强前置词、分类与整题输出，形成稳定训练节奏。',
      },
    ],
    suggestions: [
      '刷题后立即复盘，不要把问题留到下一周。',
      '把错题按“漏点、前置词、分类”做成专门清单。',
      '直播前先整理问题，讲评时针对性更强。',
      '保持稳定节奏，比临时猛刷更有效。',
    ],
    closing: '刷题、复盘、讲评三步一起走，进步会更稳定。',
  },

  onLoad() {
    const profile = app.globalData.userProfile || {}
    if (profile.name) {
      this.setData({
        'student.name': profile.name,
      })
    }
  },
})
