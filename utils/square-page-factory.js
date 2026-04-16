const { uiIcons } = require('./ui-icons')

const pageConfigs = {
  activity: {
    theme: 'sky',
    badge: '活动发布',
    title: '把活动安排做成一张清晰的上岛航线',
    desc: '先看值得参加的事，再决定今天往哪座岛靠。',
    heroIcon: 'calendar',
    stats: [
      { label: '本周活动', value: '12 场' },
      { label: '已报名', value: '3 个' },
      { label: '提醒开启', value: '2 项' },
    ],
    actions: ['近期活动', '报名记录', '提醒设置'],
    highlight: {
      lead: '先给你一个最值得点开的入口',
      tag: '报名中',
      title: '21 天上岸打卡营',
      desc: '连续打卡、阶段点评、周日晚复盘，适合现在就跟上的同学。',
    },
    sections: [
      {
        title: '活动日历',
        subtitle: '按时间看，决策会更快',
        items: [
          { icon: 'calendar', title: '今晚 19:30 真题陪练', desc: '45 分钟限时练 + 15 分钟讲评，适合晚自习前完成。', meta: '还剩 28 个名额', tag: '今晚' },
          { icon: 'pending', title: '周三冲刺答疑', desc: '针对本周高频错题做集中答疑，补薄弱点更直接。', meta: '已 186 人预约', tag: '预约中' },
          { icon: 'check', title: '周末复盘会', desc: '一周错题回看、方法总结、下周节奏规划。', meta: '报名后自动提醒', tag: '周末' },
        ],
      },
      {
        title: '活动类型',
        subtitle: '把常见需求分成更清楚的入口',
        items: [
          { icon: 'target', title: '限时刷题营', desc: '适合需要强节奏推进、想尽快进入状态的人。', meta: '重在执行感', tag: '高频' },
          { icon: 'info', title: '讲评答疑场', desc: '适合学完后卡壳、需要有人帮你理清重点的人。', meta: '重在理解感', tag: '讲评' },
          { icon: 'spark', title: '主题挑战赛', desc: '用挑战机制带动参与度，让学习广场更有氛围。', meta: '重在参与感', tag: '挑战' },
        ],
      },
    ],
  },
  team: {
    theme: 'blue',
    badge: '组队学习',
    title: '把一个人硬撑，变成一群人一起上岸',
    desc: '先找到同阶段同目标的人，学习节奏会稳很多。',
    heroIcon: 'user',
    stats: [
      { label: '可加入小队', value: '26 队' },
      { label: '连续打卡', value: '7 天' },
      { label: '同目标用户', value: '89 人' },
    ],
    actions: ['找队友', '创建小队', '组队规则'],
    highlight: {
      lead: '参考了组队打卡和小组讨论类产品思路',
      tag: '推荐加入',
      title: '7 天晚间共学小队',
      desc: '每天固定 20:00 开始，目标清晰、人数不多，适合需要陪跑感的同学。',
    },
    sections: [
      {
        title: '推荐小队',
        subtitle: '先按目标和节奏匹配',
        items: [
          { icon: 'target', title: '刷题冲刺队', desc: '主打高频练习和错题回看，适合提分期。', meta: '4/6 人 · 晚上活跃', tag: '提分' },
          { icon: 'chat', title: '答疑陪跑队', desc: '每天会有人发问题、互相解答，互动感更强。', meta: '6/8 人 · 讨论密度高', tag: '互动' },
          { icon: 'check', title: '晨读打卡队', desc: '适合想把学习节奏拉回正轨的人。', meta: '3/5 人 · 早晨活跃', tag: '习惯' },
        ],
      },
      {
        title: '共学动态',
        subtitle: '把队内氛围做得看得见',
        items: [
          { icon: 'pending', title: '本周打卡榜', desc: '谁在坚持、谁掉队，一眼就能看到。', meta: '适合做轻量榜单', tag: '榜单' },
          { icon: 'spark', title: '今日陪跑提醒', desc: '差一点就断签时，给你一个刚刚好的推动。', meta: '适合做提醒卡片', tag: '提醒' },
          { icon: 'user', title: '队友介绍卡', desc: '让人知道这是和谁一起学，而不是冷冰冰的编号。', meta: '适合做小头像卡', tag: '关系感' },
        ],
      },
    ],
  },
  drill: {
    theme: 'gold',
    badge: '刷题主岛',
    title: '先刷题，再把错题和进度都接住',
    desc: '这一页做成主阵地，用户一进来就知道今天该练什么。',
    heroIcon: 'drill',
    stats: [
      { label: '今日任务', value: '36 题' },
      { label: '当前正确率', value: '78%' },
      { label: '连续练习', value: '9 天' },
    ],
    actions: ['开始练习', '错题回看', '阶段报告'],
    highlight: {
      lead: '参考了题库、错题本、学习报告这类高频结构',
      tag: '优先完成',
      title: '今日刷题清单',
      desc: '先做 20 题基础巩固，再进 10 题强化，最后回看 6 道昨日错题。',
    },
    sections: [
      {
        title: '训练主线',
        subtitle: '先把最重要的内容放前面',
        items: [
          { icon: 'drill', title: '今日练习入口', desc: '适合做最醒目的主按钮，减少用户犹豫。', meta: '先做，再看别的', tag: '主入口' },
          { icon: 'warning', title: '高频错题回看', desc: '把最近反复出错的题单独拎出来，效率最高。', meta: '建议放在主入口下方', tag: '高优先' },
          { icon: 'chart', title: '阶段正确率曲线', desc: '让用户知道自己不是瞎刷，而是在稳定向上。', meta: '强化“快上岸”的感受', tag: '数据' },
        ],
      },
      {
        title: '提分抓手',
        subtitle: '内容不必多，但要都能直接行动',
        items: [
          { icon: 'file', title: '题组分类练习', desc: '把题按专题拆开，方便查漏补缺。', meta: '适合放专题卡片', tag: '专题' },
          { icon: 'check', title: '已掌握题型', desc: '给用户明确反馈，建立成就感和稳定感。', meta: '建议做轻量勾选态', tag: '掌握' },
          { icon: 'pending', title: '待突破难点', desc: '告诉用户下一步该盯哪里，而不是只给分数。', meta: '适合衔接讲评页', tag: '待攻克' },
        ],
      },
    ],
  },
  comment: {
    theme: 'green',
    badge: '用户评论',
    title: '把真实反馈做成可阅读、可信任的内容池',
    desc: '不是简单堆评论，而是让新用户快速看到有价值的声音。',
    heroIcon: 'chat',
    stats: [
      { label: '最新评论', value: '128 条' },
      { label: '精选评价', value: '18 篇' },
      { label: '热门话题', value: '6 个' },
    ],
    actions: ['精选评价', '热门话题', '我来留言'],
    highlight: {
      lead: '学习产品里，真实体验比口号更能打动人',
      tag: '精选',
      title: '“刷题节奏终于稳下来了”',
      desc: '这类一句话评价适合放在显眼位置，降低用户理解成本，也更容易建立信任。',
    },
    sections: [
      {
        title: '真实反馈',
        subtitle: '先看高信息密度的内容',
        items: [
          { icon: 'spark', title: '阶段提升反馈', desc: '重点展示“用了什么、改了什么、结果怎样”。', meta: '适合做短评卡片', tag: '结果向' },
          { icon: 'check', title: '体验感受反馈', desc: '例如节奏是否舒服、讲解是否清楚、是否愿意坚持。', meta: '适合做标签聚合', tag: '体验向' },
          { icon: 'info', title: '建议与吐槽', desc: '保留少量真实建议，会比全是好评更可信。', meta: '建议做折叠展示', tag: '真实' },
        ],
      },
      {
        title: '讨论趋势',
        subtitle: '让评论区不只是静态展示',
        items: [
          { icon: 'target', title: '大家最近在问什么', desc: '用 3 到 5 个高频问题快速带出讨论氛围。', meta: '适合做话题入口', tag: '热议' },
          { icon: 'user', title: '谁适合这个模块', desc: '把“适合什么阶段的人”说清楚，会减少试错。', meta: '适合做经验标签', tag: '适配' },
          { icon: 'chat', title: '跟帖互动', desc: '后续可承接回复、点赞和二次讨论。', meta: '让广场更像社区', tag: '互动' },
        ],
      },
    ],
  },
  case: {
    theme: 'teal',
    badge: '学生案例',
    title: '把“别人怎么上岸”的路径拆给用户看',
    desc: '案例页的重点不是励志，而是让路径变具体、可参考。',
    heroIcon: 'chart',
    stats: [
      { label: '本月案例', value: '24 例' },
      { label: '提分样本', value: '9 个' },
      { label: '阶段路径', value: '5 类' },
    ],
    actions: ['提分案例', '阶段路径', '方法拆解'],
    highlight: {
      lead: '案例型页面适合承接“我和他差在哪”这种心态',
      tag: '高关注',
      title: '45 天提分案例',
      desc: '用“基础状态—执行动作—结果变化”三段式呈现，比单纯晒结果更有说服力。',
    },
    sections: [
      {
        title: '精选案例',
        subtitle: '案例要先给结果，再给过程',
        items: [
          { icon: 'chart', title: '基础薄弱型', desc: '从知识点零散到建立题型意识，适合刚起步用户。', meta: '看得见进步路径', tag: '起步期' },
          { icon: 'file', title: '瓶颈停滞型', desc: '长期卡分但执行力还在，重点看怎么调整方法。', meta: '适合中段用户', tag: '瓶颈期' },
          { icon: 'target', title: '冲刺提升型', desc: '时间不多、目标明确，重点看取舍和节奏。', meta: '适合考前用户', tag: '冲刺期' },
        ],
      },
      {
        title: '可复制动作',
        subtitle: '给用户带走一点能立刻做的东西',
        items: [
          { icon: 'check', title: '每天只盯一类错题', desc: '先聚焦再扩散，避免一上来把自己学乱。', meta: '适合写成行动卡', tag: '动作 1' },
          { icon: 'pending', title: '每周固定一次复盘', desc: '案例里最常见的稳定动作，难度低但很有效。', meta: '适合放进周计划', tag: '动作 2' },
          { icon: 'spark', title: '借案例找到自己的版本', desc: '不是照搬别人，而是找到最像自己的那条路。', meta: '形成“我也能上岸”的暗示', tag: '动作 3' },
        ],
      },
    ],
  },
  points: {
    theme: 'amber',
    badge: '积分兑换',
    title: '把奖励做成可见、可攒、可兑换的正反馈',
    desc: '积分页不只是商城，更是把坚持学习变得有回响。',
    heroIcon: 'points',
    stats: [
      { label: '当前积分', value: '1260' },
      { label: '可兑权益', value: '8 项' },
      { label: '连续签到', value: '11 天' },
    ],
    actions: ['兑换中心', '赚积分', '兑换记录'],
    highlight: {
      lead: '参考了签到奖励和成长激励型产品思路',
      tag: '热门兑换',
      title: '错题精练包',
      desc: '这类和学习直接相关的奖励，比纯装饰奖励更符合小程序气质。',
    },
    sections: [
      {
        title: '热门兑换',
        subtitle: '让用户知道积分是有用的',
        items: [
          { icon: 'points', title: '题组加练包', desc: '兑换后可解锁一组更有针对性的强化练习。', meta: '600 积分', tag: '高频' },
          { icon: 'spark', title: '复盘模板包', desc: '给用户一个更省脑子的复盘框架。', meta: '300 积分', tag: '实用' },
          { icon: 'calendar', title: '打卡补签卡', desc: '减轻中途断档带来的挫败感。', meta: '120 积分', tag: '轻激励' },
        ],
      },
      {
        title: '赚积分方式',
        subtitle: '规则清楚，用户才愿意持续攒',
        items: [
          { icon: 'check', title: '完成今日练习', desc: '用最核心的学习动作来驱动积分增长。', meta: '+20 / 天', tag: '基础' },
          { icon: 'pending', title: '连续打卡', desc: '把坚持做成额外奖励，强化养成感。', meta: '第 7 天额外加成', tag: '连签' },
          { icon: 'info', title: '参与活动和分享', desc: '让广场内容和积分体系互相带动。', meta: '适合衔接活动页', tag: '联动' },
        ],
      },
    ],
  },
  share: {
    theme: 'purple',
    badge: '经验分享',
    title: '把零散心得整理成值得收藏的经验卡片',
    desc: '这一页更像方法库，重点是让内容好拿、好看、好复用。',
    heroIcon: 'spark',
    stats: [
      { label: '本周新帖', value: '39 篇' },
      { label: '方法合集', value: '12 组' },
      { label: '我的收藏', value: '8 条' },
    ],
    actions: ['方法合集', '热门主题', '发布心得'],
    highlight: {
      lead: '参考了卡片化知识和经验沉淀类产品结构',
      tag: '值得收藏',
      title: '错题复盘三步法',
      desc: '标题要直给、内容要可执行，这类卡片最容易被用户保存和转发。',
    },
    sections: [
      {
        title: '精选经验卡',
        subtitle: '先给最容易带走的内容',
        items: [
          { icon: 'file', title: '一页复盘模板', desc: '适合做成图文卡，一看就能照着用。', meta: '收藏率通常会高', tag: '模板' },
          { icon: 'play', title: '15 分钟晚自习启动法', desc: '解决“知道该学，但总是进不去状态”的问题。', meta: '适合短内容表达', tag: '节奏' },
          { icon: 'spark', title: '错题整理避坑清单', desc: '把最容易做错的整理方式先提醒掉。', meta: '适合做 checklist', tag: '避坑' },
        ],
      },
      {
        title: '本周热议',
        subtitle: '让经验页有一点社区流动感',
        items: [
          { icon: 'chat', title: '大家都在问的提分方法', desc: '用话题感把内容串起来，比散贴更容易逛。', meta: '适合做主题流', tag: '热议' },
          { icon: 'target', title: '不同阶段该怎么学', desc: '把经验分享和学生案例连接起来。', meta: '适合做阶段标签', tag: '阶段' },
          { icon: 'check', title: '高赞实用总结', desc: '精选真正有用、可复用、可执行的内容。', meta: '适合做置顶区', tag: '高赞' },
        ],
      },
    ],
  },
}

function resolveIcon(name) {
  return uiIcons[name] || uiIcons.info
}

function buildSquarePage(key) {
  const config = pageConfigs[key]
  if (!config) {
    throw new Error(`Unknown square page: ${key}`)
  }

  return {
    data: {
      ...config,
      heroIcon: resolveIcon(config.heroIcon),
      sections: config.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          icon: resolveIcon(item.icon),
        })),
      })),
    },
  }
}

module.exports = { buildSquarePage }
