function svg(body) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">${body}</svg>`
  )}`
}

const uiIcons = {
  bell: svg(`
    <defs>
      <linearGradient id="bellGrad" x1="7" y1="5" x2="17" y2="20" gradientUnits="userSpaceOnUse">
        <stop stop-color="#60A5FA"/>
        <stop offset="1" stop-color="#2563EB"/>
      </linearGradient>
    </defs>
    <path d="M12 4.9A4.4 4.4 0 0 1 16.4 9.3V11C16.4 12.4 16.9 13.8 17.8 14.9L18.6 15.9C18.95 16.32 18.65 16.95 18.1 16.95H5.9C5.35 16.95 5.05 16.32 5.4 15.9L6.2 14.9C7.1 13.8 7.6 12.4 7.6 11V9.3A4.4 4.4 0 0 1 12 4.9Z" fill="url(#bellGrad)"/>
    <path d="M9.6 18.1C9.95 19.03 10.85 19.7 12 19.7C13.15 19.7 14.05 19.03 14.4 18.1" stroke="#1D4ED8" stroke-width="1.55" stroke-linecap="round"/>
    <circle cx="16.9" cy="7.6" r="1.55" fill="#DBEAFE"/>
  `),
  class: svg(`
    <defs><linearGradient id="bookGrad" x1="5.5" y1="6" x2="18.5" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#EFF6FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <path d="M6.7 5.8H15.1C16.8 5.8 18.2 7.2 18.2 8.9V17.1C18.2 17.54 17.84 17.9 17.4 17.9H8.9C7.14 17.9 5.7 16.46 5.7 14.7V6.8C5.7 6.25 6.15 5.8 6.7 5.8Z" fill="url(#bookGrad)" stroke="#2563EB" stroke-width="1.35"/>
    <path d="M8.8 8.8H14.8" stroke="#2563EB" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M8.8 11.5H14" stroke="#60A5FA" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M8.8 14.2H12.6" stroke="#60A5FA" stroke-width="1.4" stroke-linecap="round"/>
  `),
  exam: svg(`
    <defs><linearGradient id="examGrad" x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse"><stop stop-color="#EEF2FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <path d="M8 4.8H13L17.8 9.4V18C17.8 19.05 16.95 19.9 15.9 19.9H8C6.95 19.9 6.1 19.05 6.1 18V6.7C6.1 5.65 6.95 4.8 8 4.8Z" fill="url(#examGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <path d="M13 4.8V8.7C13 9.09 13.31 9.4 13.7 9.4H17.8" fill="#BFDBFE"/>
    <path d="M9 12.2L10.7 13.8L14.9 9.9" stroke="#2563EB" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 16H14.7" stroke="#93C5FD" stroke-width="1.4" stroke-linecap="round"/>
  `),
  drill: svg(`
    <defs><linearGradient id="penGrad" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse"><stop stop-color="#FFF7ED"/><stop offset="1" stop-color="#FFEDD5"/></linearGradient></defs>
    <path d="M7.1 16.95L8 13.5L14.95 6.55C15.73 5.77 16.99 5.77 17.77 6.55L18.15 6.93C18.93 7.71 18.93 8.97 18.15 9.75L11.2 16.7L7.75 17.6C7.35 17.7 7 17.35 7.1 16.95Z" fill="url(#penGrad)" stroke="#C2410C" stroke-width="1.25"/>
    <path d="M13.7 7.8L16.9 11" stroke="#F59E0B" stroke-width="1.35" stroke-linecap="round"/>
    <path d="M9.2 15.45L10.4 14.2" stroke="#C2410C" stroke-width="1.35" stroke-linecap="round"/>
  `),
  homework: svg(`
    <defs><linearGradient id="hwGrad" x1="5" y1="5.5" x2="19" y2="18.5" gradientUnits="userSpaceOnUse"><stop stop-color="#ECFDF5"/><stop offset="1" stop-color="#DCFCE7"/></linearGradient></defs>
    <rect x="5.2" y="5.7" width="13.6" height="12.9" rx="3.2" fill="url(#hwGrad)" stroke="#16A34A" stroke-width="1.3"/>
    <path d="M8.2 9.2H15.7" stroke="#16A34A" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M8.2 12H13.8" stroke="#4ADE80" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M8.2 14.8H12.2" stroke="#4ADE80" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="16.2" cy="15.1" r="1.35" fill="#16A34A"/>
  `),
  video: svg(`
    <defs><linearGradient id="videoGrad" x1="5.5" y1="6" x2="18.5" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#EEF2FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <rect x="5" y="6.1" width="14" height="11.8" rx="3" fill="url(#videoGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <path d="M10.2 9.3L15 12L10.2 14.7V9.3Z" fill="#2563EB"/>
  `),
  mailbox: svg(`
    <defs><linearGradient id="mailGrad" x1="5" y1="6" x2="19" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#EEF2FF"/><stop offset="1" stop-color="#E0E7FF"/></linearGradient></defs>
    <rect x="4.8" y="6.2" width="14.4" height="11.6" rx="3.1" fill="url(#mailGrad)" stroke="#4F46E5" stroke-width="1.3"/>
    <path d="M7.1 9L11.1 12C11.64 12.4 12.36 12.4 12.9 12L16.9 9" stroke="#4F46E5" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.4 15.2H16.6" stroke="#818CF8" stroke-width="1.4" stroke-linecap="round"/>
  `),
  mailboxSent: svg(`
    <defs><linearGradient id="mailSentGrad" x1="5" y1="5.5" x2="19" y2="18.5" gradientUnits="userSpaceOnUse"><stop stop-color="#EFF6FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <path d="M4.8 8.1C4.8 6.9 5.77 5.93 6.96 5.93H17.04C18.23 5.93 19.2 6.9 19.2 8.1V15.9C19.2 17.1 18.23 18.07 17.04 18.07H6.96C5.77 18.07 4.8 17.1 4.8 15.9V8.1Z" fill="url(#mailSentGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <path d="M7 9.1L11.18 12.15C11.67 12.5 12.33 12.5 12.82 12.15L17 9.1" stroke="#2563EB" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.8 6.1L18.6 2.8" stroke="#60A5FA" stroke-width="1.35" stroke-linecap="round"/>
    <path d="M16.45 2.95L18.75 2.7L18.5 5" stroke="#60A5FA" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
  `),
  calendar: svg(`
    <defs><linearGradient id="calGrad" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse"><stop stop-color="#EFF6FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <rect x="5.2" y="6.1" width="13.6" height="12.8" rx="3" fill="url(#calGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <path d="M8.3 4.8V7.2" stroke="#2563EB" stroke-width="1.55" stroke-linecap="round"/>
    <path d="M15.7 4.8V7.2" stroke="#2563EB" stroke-width="1.55" stroke-linecap="round"/>
    <path d="M5.2 9.2H18.8" stroke="#93C5FD" stroke-width="1.3"/>
    <rect x="8.2" y="11.2" width="3.2" height="2.8" rx=".8" fill="#2563EB"/>
    <rect x="12.6" y="11.2" width="3.2" height="2.8" rx=".8" fill="#BFDBFE"/>
  `),
  user: svg(`
    <defs><linearGradient id="userGrad" x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse"><stop stop-color="#F8FBFF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <circle cx="12" cy="8.5" r="3.2" fill="url(#userGrad)" stroke="#2563EB" stroke-width="1.35"/>
    <path d="M6.5 18.2C7.3 15.8 9.4 14.5 12 14.5C14.6 14.5 16.7 15.8 17.5 18.2" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.35" stroke-linecap="round"/>
  `),
  camera: svg(`
    <defs><linearGradient id="camGrad" x1="6" y1="7" x2="18" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#ECFEFF"/><stop offset="1" stop-color="#CFFAFE"/></linearGradient></defs>
    <path d="M7 7.2H9L10.15 5.8C10.42 5.48 10.81 5.3 11.22 5.3H12.78C13.19 5.3 13.58 5.48 13.85 5.8L15 7.2H17C18.27 7.2 19.3 8.23 19.3 9.5V16.2C19.3 17.47 18.27 18.5 17 18.5H7C5.73 18.5 4.7 17.47 4.7 16.2V9.5C4.7 8.23 5.73 7.2 7 7.2Z" fill="url(#camGrad)" stroke="#0891B2" stroke-width="1.3"/>
    <circle cx="12" cy="12.7" r="3.3" fill="#FFFFFF" stroke="#0891B2" stroke-width="1.3"/>
    <circle cx="12" cy="12.7" r="1.55" fill="#67E8F9"/>
  `),
  file: svg(`
    <path d="M8.2 4.4H13.1L17.7 8.9V18C17.7 19.05 16.85 19.9 15.8 19.9H8.2C7.15 19.9 6.3 19.05 6.3 18V6.3C6.3 5.25 7.15 4.4 8.2 4.4Z" fill="#F8FAFC" stroke="#475569" stroke-width="1.3"/>
    <path d="M13.1 4.4V7.8C13.1 8.4 13.6 8.9 14.2 8.9H17.7" fill="#E2E8F0"/>
    <path d="M13.1 4.4V7.8C13.1 8.4 13.6 8.9 14.2 8.9H17.7" stroke="#475569" stroke-width="1.3" stroke-linejoin="round"/>
    <rect x="8.9" y="11" width="6.8" height="1.55" rx=".78" fill="#64748B"/>
    <rect x="8.9" y="14" width="5.1" height="1.55" rx=".78" fill="#94A3B8"/>
  `),
  chart: svg(`
    <defs><linearGradient id="chartGrad" x1="5.5" y1="6.5" x2="18.5" y2="18.5" gradientUnits="userSpaceOnUse"><stop stop-color="#EEF6FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <rect x="5.2" y="5.8" width="13.6" height="12.8" rx="3.1" fill="url(#chartGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <path d="M8.3 15.2V11.6" stroke="#60A5FA" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 15.2V8.9" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M15.7 15.2V10.4" stroke="#93C5FD" stroke-width="1.8" stroke-linecap="round"/>
  `),
  target: svg(`
    <defs><linearGradient id="targetGrad" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse"><stop stop-color="#EEF2FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <circle cx="12" cy="12" r="7.1" fill="url(#targetGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <circle cx="12" cy="12" r="4.2" fill="#FFFFFF" stroke="#60A5FA" stroke-width="1.2"/>
    <circle cx="12" cy="12" r="1.9" fill="#2563EB"/>
  `),
  points: svg(`
    <defs>
      <linearGradient id="pointsGrad" x1="6.2" y1="5.8" x2="17.8" y2="18.2" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FEF3C7"/>
        <stop offset="1" stop-color="#FDE68A"/>
      </linearGradient>
      <linearGradient id="pointsCore" x1="8.3" y1="8.4" x2="15.7" y2="15.6" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F59E0B"/>
        <stop offset="1" stop-color="#D97706"/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="7.15" fill="url(#pointsGrad)" stroke="#D97706" stroke-width="1.3"/>
    <circle cx="12" cy="12" r="4.5" fill="#FFFDF7" stroke="#F59E0B" stroke-width="1.15"/>
    <path d="M12 8.55L13.03 10.65L15.35 10.98L13.67 12.61L14.06 14.9L12 13.82L9.94 14.9L10.33 12.61L8.65 10.98L10.97 10.65L12 8.55Z" fill="url(#pointsCore)"/>
    <circle cx="16.85" cy="8.35" r="1.1" fill="#FDE68A"/>
  `),
  plaza: svg(`
    <defs>
      <linearGradient id="plazaGrad" x1="5.5" y1="6" x2="18.5" y2="18.5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#EFF6FF"/>
        <stop offset="1" stop-color="#DBEAFE"/>
      </linearGradient>
    </defs>
    <rect x="5.1" y="6.7" width="13.8" height="10.8" rx="3" fill="url(#plazaGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <path d="M7.1 6.7L9 4.9H15L16.9 6.7" stroke="#60A5FA" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8.4 10.3H10.2" stroke="#2563EB" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M13.8 10.3H15.6" stroke="#2563EB" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M8.4 13.5H15.6" stroke="#93C5FD" stroke-width="1.4" stroke-linecap="round"/>
  `),
  play: svg(`
    <defs><linearGradient id="playGrad" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#60A5FA"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs>
    <circle cx="12" cy="12" r="7.8" fill="url(#playGrad)"/>
    <path d="M10.1 8.8L15.6 12L10.1 15.2V8.8Z" fill="#FFFFFF"/>
    <circle cx="12" cy="12" r="8.45" stroke="#DBEAFE" stroke-width=".9" opacity=".8"/>
  `),
  spark: svg(`
    <defs><linearGradient id="sparkGrad" x1="8" y1="5" x2="16" y2="19" gradientUnits="userSpaceOnUse"><stop stop-color="#93C5FD"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs>
    <path d="M12 4.8L13.7 9.2L18.1 10.9L13.7 12.6L12 17L10.3 12.6L5.9 10.9L10.3 9.2L12 4.8Z" fill="url(#sparkGrad)"/>
    <circle cx="17.7" cy="6.4" r="1.2" fill="#BFDBFE"/>
    <circle cx="7.1" cy="17.5" r=".95" fill="#60A5FA"/>
  `),
  warning: svg(`
    <defs><linearGradient id="warnGrad" x1="12" y1="4.6" x2="12" y2="19.4" gradientUnits="userSpaceOnUse"><stop stop-color="#FDBA74"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs>
    <path d="M12.92 5.93L18.96 16.34C19.38 17.08 18.84 18 17.99 18H6.01C5.16 18 4.62 17.08 5.04 16.34L11.08 5.93C11.5 5.2 12.5 5.2 12.92 5.93Z" fill="url(#warnGrad)"/>
    <path d="M12 9.1V12.95" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="12" cy="15.45" r="1.1" fill="#FFFFFF"/>
  `),
  info: svg(`
    <defs><linearGradient id="infoGrad" x1="7" y1="6" x2="17" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#EFF6FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <circle cx="12" cy="12" r="7.8" fill="url(#infoGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <circle cx="12" cy="8.4" r="1.15" fill="#2563EB"/>
    <path d="M12 11.1V15.4" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round"/>
  `),
  check: svg(`
    <circle cx="12" cy="12" r="8" fill="#ECFDF5" stroke="#16A34A" stroke-width="1.3"/>
    <path d="M8.7 12.1L10.9 14.3L15.5 9.7" stroke="#16A34A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  `),
  pending: svg(`
    <defs><linearGradient id="pendingGrad" x1="7" y1="6" x2="17" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#EFF6FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <circle cx="12" cy="12" r="8" fill="url(#pendingGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <path d="M12 8.15V12.15L14.55 13.7" stroke="#2563EB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="#60A5FA"/>
  `),
  leave: svg(`
    <defs><linearGradient id="leaveGrad" x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse"><stop stop-color="#FFF7ED"/><stop offset="1" stop-color="#FFEDD5"/></linearGradient></defs>
    <rect x="5" y="6.1" width="14" height="12.9" rx="3.2" fill="url(#leaveGrad)" stroke="#D97706" stroke-width="1.35"/>
    <path d="M8.2 4.6V7.1" stroke="#D97706" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M15.8 4.6V7.1" stroke="#D97706" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M5 9.4H19" stroke="#F59E0B" stroke-width="1.35"/>
    <path d="M9 13.2L11.15 15.25L15.4 10.95" stroke="#D97706" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  `),
  chat: svg(`
    <defs><linearGradient id="chatGrad" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#EFF6FF"/><stop offset="1" stop-color="#DBEAFE"/></linearGradient></defs>
    <path d="M7.2 6.1H16.8C18.13 6.1 19.2 7.17 19.2 8.5V13.2C19.2 14.53 18.13 15.6 16.8 15.6H11.2L8.1 18V15.6H7.2C5.87 15.6 4.8 14.53 4.8 13.2V8.5C4.8 7.17 5.87 6.1 7.2 6.1Z" fill="url(#chatGrad)" stroke="#2563EB" stroke-width="1.3"/>
    <circle cx="9.2" cy="10.9" r="1" fill="#2563EB"/>
    <circle cx="12" cy="10.9" r="1" fill="#60A5FA"/>
    <circle cx="14.8" cy="10.9" r="1" fill="#2563EB"/>
  `)
}

module.exports = { uiIcons }
