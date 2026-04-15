const {
  createDiagnoseCouponState,
  diagnoseCouponContent,
  ensureDiagnoseCouponState,
  readDiagnoseCouponState,
  writeDiagnoseCouponState,
  isDiagnoseCouponExpired,
  formatCouponCountdown,
} = require('../../utils/diagnose-coupon')

const DIAGNOSE_COUPON_ENABLED = false
const DIAGNOSE_COUPON_TEST_MODE = false
const DIAGNOSE_COUPON_POPUP_ON_LAUNCH = false

Component({
  properties: {
    autoPopup: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    showPopup: false,
    showMini: false,
    coupon: diagnoseCouponContent,
  },

  lifetimes: {
    attached() {
      this.syncCouponView()
    },
    detached() {
      this.stopCouponTimer()
    },
  },

  pageLifetimes: {
    show() {
      this.syncCouponView()
    },
    hide() {
      this.stopCouponTimer()
    },
  },

  methods: {
    isCouponEligible() {
      if (!DIAGNOSE_COUPON_ENABLED) {
        return false
      }

      if (DIAGNOSE_COUPON_TEST_MODE) {
        return true
      }

      const app = getApp()
      const state = readDiagnoseCouponState()
      const hasActiveCoupon = !!(state && !state.claimed && !isDiagnoseCouponExpired(state))
      return !!(app && app.globalData && app.globalData.isNewUser) || hasActiveCoupon
    },

    syncCouponView() {
      const now = Date.now()
      const app = getApp()
      const isEligible = this.isCouponEligible()
      const shouldPopupForLaunch = !!(
        DIAGNOSE_COUPON_POPUP_ON_LAUNCH
        && app
        && app.globalData
        && !app.globalData.diagnoseCouponPopupShownInSession
      )

      if (!isEligible) {
        this.stopCouponTimer()
        this.setData({
          showPopup: false,
          showMini: false,
          'coupon.remainingText': '00:00',
        })
        return
      }

      let state = readDiagnoseCouponState()

      if (state && state.claimed) {
        if (shouldPopupForLaunch) {
          state = createDiagnoseCouponState(now)
          writeDiagnoseCouponState(state)
        } else {
          this.stopCouponTimer()
          this.setData({
            showPopup: false,
            showMini: false,
            'coupon.remainingText': '00:00',
          })
          return
        }
      }

      if (!state || isDiagnoseCouponExpired(state, now)) {
        state = createDiagnoseCouponState(now)
        writeDiagnoseCouponState(state)
      }

      if (shouldPopupForLaunch && app && app.globalData) {
        app.globalData.diagnoseCouponPopupShownInSession = true
      }

      const showPopup = !!this._popupOpenInCurrentPage
      const showMini = !showPopup

      if (!state.popupShownAt) {
        state = {
          ...state,
          popupShownAt: now,
          minimized: false,
        }
        writeDiagnoseCouponState(state)
      }

      this._popupOpenInCurrentPage = showPopup

      this.setData({
        showPopup,
        showMini,
        'coupon.remainingText': formatCouponCountdown(state.expiresAt - now),
      })

      this.startCouponTimer()
    },

    startCouponTimer() {
      this.stopCouponTimer()
      this._couponTimer = setInterval(() => {
        const state = readDiagnoseCouponState()
        const now = Date.now()

        if (!state || state.claimed || isDiagnoseCouponExpired(state, now)) {
          this.stopCouponTimer()
          this.setData({
            showPopup: false,
            showMini: false,
            'coupon.remainingText': '00:00',
          })
          return
        }

        this.setData({
          'coupon.remainingText': formatCouponCountdown(state.expiresAt - now),
        })
      }, 1000)
    },

    stopCouponTimer() {
      if (this._couponTimer) {
        clearInterval(this._couponTimer)
        this._couponTimer = null
      }
    },

    noop() {
      return
    },

    openCouponPopup() {
      const state = ensureDiagnoseCouponState({
        isEligible: this.isCouponEligible(),
      })

      if (!state || state.claimed || isDiagnoseCouponExpired(state)) {
        this._popupOpenInCurrentPage = false
        this.setData({
          showPopup: false,
          showMini: false,
        })
        return
      }

      writeDiagnoseCouponState({
        ...state,
        popupShownAt: state.popupShownAt || Date.now(),
        minimized: true,
      })

      this._popupOpenInCurrentPage = true
      this.setData({
        showPopup: true,
        showMini: false,
      })
    },

    closeCouponPopup() {
      const state = ensureDiagnoseCouponState({
        isEligible: this.isCouponEligible(),
      })

      if (state) {
        writeDiagnoseCouponState({
          ...state,
          popupShownAt: state.popupShownAt || Date.now(),
          minimized: true,
        })
      }

      this._popupOpenInCurrentPage = false
      this.setData({
        showPopup: false,
        showMini: true,
      })
    },

    goConsult() {
      const state = ensureDiagnoseCouponState({
        isEligible: this.isCouponEligible(),
      })

      if (state && !state.claimed && !isDiagnoseCouponExpired(state)) {
        writeDiagnoseCouponState({
          ...state,
          popupShownAt: state.popupShownAt || Date.now(),
          minimized: true,
        })
      }

      this._popupOpenInCurrentPage = false
      this.setData({
        showPopup: false,
        showMini: true,
      })

      wx.switchTab({
        url: '/pages/chat/chat',
      })
    },

    handleCouponClaim() {
      const state = readDiagnoseCouponState()
      const now = Date.now()

      if (!state || isDiagnoseCouponExpired(state, now)) {
        this.stopCouponTimer()
        this.setData({
          showPopup: false,
          showMini: false,
          'coupon.remainingText': '00:00',
        })
        wx.showToast({
          title: '优惠券已过期',
          icon: 'none',
        })
        return
      }

      writeDiagnoseCouponState({
        ...state,
        popupShownAt: state.popupShownAt || now,
        minimized: true,
      })

      this.stopCouponTimer()
      this._popupOpenInCurrentPage = false
      this.setData({
        showPopup: false,
        showMini: true,
      })

      wx.navigateTo({
        url: '/pages/purchase/purchase?mode=diagnose&coupon=1',
      })
    },
  },
})
