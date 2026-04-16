# Student App Notes

- This repo is a WeChat Mini Program. Prefer native Mini Program components when they already solve the interaction well.
- For time selection, prefer native `picker` with `mode="multiSelector"` instead of building custom full-screen `picker-view` modals. Native picker is more stable and less likely to cause render/white-screen issues.
- When changing `wxml`, keep structure simple and verify tag pairing manually, especially around conditional blocks like `wx:if`, `wx:for`, `picker`, and modal wrappers.
- Avoid adding extra wrapper layers or custom modal systems unless they are clearly necessary.
- Do not delete page files or shared assets piecemeal. If a page/module is being removed, update `app.json`, navigation targets, and dependent imports together; otherwise WeChat DevTools hot reload may still compile stale deleted pages and cause white screens.
- After editing page logic, run `node --check` on the touched `.js` files.
