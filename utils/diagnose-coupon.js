const DIAGNOSE_COUPON_STORAGE_KEY = 'new_user_diagnose_coupon'
const DIAGNOSE_COUPON_DURATION = 30 * 60 * 1000

const diagnoseCouponContent = {
  badge: '首次进入专享',
  title: '先别急着报课，先诊断你为什么丢分',
  subtitle: '人工拆解失分原因，定位核心卡点，输出书面诊断报告',
  countdownLabel: '优惠仅保留',
  remainingText: '30:00',
  originalPrice: '¥380',
  price: '¥199',
  saveText: '新人立减 ¥181',
  heroText: '领券后可用于完整诊断',
  featureTags: ['失分原因拆解', '核心卡点定位', '学习路径生成'],
  benefitList: [
    '判断你当前真正拖分的关键问题',
    '定位最该优先突破的核心卡点',
    '输出后续学习路径和提分建议',
  ],
  summary: '适合想先看清问题、再决定怎么学的同学。',
}

function createDiagnoseCouponState(now = Date.now()) {
  return {
    createdAt: now,
    expiresAt: now + DIAGNOSE_COUPON_DURATION,
    popupShownAt: 0,
    minimized: false,
    claimed: false,
  }
}

function readDiagnoseCouponState() {
  return wx.getStorageSync(DIAGNOSE_COUPON_STORAGE_KEY) || null
}

function writeDiagnoseCouponState(state) {
  wx.setStorageSync(DIAGNOSE_COUPON_STORAGE_KEY, state)
}

function ensureDiagnoseCouponState({ isEligible, now = Date.now() }) {
  if (!isEligible) {
    return null
  }

  let state = readDiagnoseCouponState()
  if (!state) {
    state = createDiagnoseCouponState(now)
    writeDiagnoseCouponState(state)
  }

  return state
}

function isDiagnoseCouponExpired(state, now = Date.now()) {
  if (!state || !state.expiresAt) {
    return true
  }

  return state.expiresAt <= now
}

function formatCouponCountdown(remainingMs) {
  const safeRemaining = Math.max(0, remainingMs)
  const totalSeconds = Math.floor(safeRemaining / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

module.exports = {
  createDiagnoseCouponState,
  diagnoseCouponContent,
  ensureDiagnoseCouponState,
  readDiagnoseCouponState,
  writeDiagnoseCouponState,
  isDiagnoseCouponExpired,
  formatCouponCountdown,
}
