// آیکون‌های قطعه‌رسان — طبق کتاب برند بخش ۰۷:
// خطی (outline)، ضخامت ۲ پیکسل، گوشه‌های گرد، شبکهٔ ۲۴×۲۴
// رنگ از جریان متن می‌آید (currentColor)؛ پیش‌فرض سرمه‌ای، نارنجی فقط برای کنش اصلی.

const P = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

function svg(paths, label = "") {
  const aria = label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"${aria}>${paths}</svg>`;
}

export const icons = {
  search: svg(`<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>`),

  menu: svg(`<path d="M4 6h16M4 12h16M4 18h16"/>`),

  close: svg(`<path d="M18 6 6 18M6 6l12 12"/>`),

  "chevron-down": svg(`<path d="m6 9 6 6 6-6"/>`),

  // فلش «رسان» — در جهت خوانش فارسی به چپ اشاره می‌کند
  "arrow-forward": svg(`<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>`),

  "arrow-back": svg(`<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`),

  nut: svg(`<path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5Z"/><circle cx="12" cy="12" r="3.2"/>`),

  truck: svg(
    `<path d="M14 17V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2.2"/><path d="M15.8 17H8.8"/><path d="M14 8h3.5a1 1 0 0 1 .8.4l2.5 3.3a1 1 0 0 1 .2.6V16a1 1 0 0 1-1 1h-1"/><circle cx="6.8" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>`
  ),

  "shield-check": svg(
    `<path d="M12 2.8 4.5 5.6v5.2c0 4.6 3.2 8.6 7.5 10.4 4.3-1.8 7.5-5.8 7.5-10.4V5.6Z"/><path d="m9 11.6 2.1 2.1L15 9.8"/>`
  ),

  box: svg(
    `<path d="M12 2.7 20.5 7.3v9.4L12 21.3 3.5 16.7V7.3Z"/><path d="m3.8 7.4 8.2 4.4 8.2-4.4"/><path d="M12 11.8v9.3"/>`
  ),

  clock: svg(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.8"/>`),

  phone: svg(
    `<path d="M6.8 3h2.9l1.4 4.2-2 1.5a12.6 12.6 0 0 0 5.2 5.2l1.5-2 4.2 1.4v2.9a2 2 0 0 1-2.1 2A16.8 16.8 0 0 1 3 5.1 2 2 0 0 1 5 3z"/>`
  ),

  mail: svg(`<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>`),

  "map-pin": svg(`<path d="M12 21.5s7-5.8 7-11.3A7 7 0 0 0 5 10.2c0 5.5 7 11.3 7 11.3Z"/><circle cx="12" cy="10" r="2.6"/>`),

  check: svg(`<path d="m4.5 12.5 5 5L19.5 7"/>`),

  "check-circle": svg(`<circle cx="12" cy="12" r="9"/><path d="m8.5 12.3 2.4 2.4 4.8-5"/>`),

  alert: svg(`<path d="M12 3.5 22 20H2Z"/><path d="M12 10v4.5"/><path d="M12 17.4v.1"/>`),

  info: svg(`<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.1"/>`),

  filter: svg(`<path d="M3 5.5h18l-7 8v5.5l-4 2v-7.5Z"/>`),

  users: svg(
    `<circle cx="9" cy="8.5" r="3.5"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M15.5 5.4a3.5 3.5 0 0 1 0 6.2"/><path d="M17.8 14.6A6.2 6.2 0 0 1 21.2 20"/>`
  ),

  wrench: svg(
    `<path d="M14.2 6.3a4.6 4.6 0 0 0-6 6L3 17.5a1.9 1.9 0 0 0 2.7 2.7l5.2-5.2a4.6 4.6 0 0 0 6-6l-3 3-2.7-2.7Z"/>`
  ),

  car: svg(
    `<path d="M4 12.5 5.6 7.9A2 2 0 0 1 7.5 6.5h9a2 2 0 0 1 1.9 1.4L20 12.5"/><path d="M3 17v-3a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 14v3"/><path d="M5.5 17v1.8M18.5 17v1.8"/><circle cx="7.5" cy="15" r="0.5"/><circle cx="16.5" cy="15" r="0.5"/>`
  ),

  invoice: svg(`<path d="M6 2.8h9l4 4v14.4H6Z"/><path d="M14.6 2.8v4.4H19"/><path d="M9 12h6M9 15.5h6M9 8.5h2"/>`),

  chart: svg(`<path d="M4 4v16h16"/><path d="M8 16v-5M12 16V8M16 16v-8"/>`),

  warehouse: svg(
    `<path d="M3 20V8.8L12 3l9 5.8V20"/><path d="M7 20v-7h10v7"/><path d="M7 16.5h10"/>`
  ),

  "id-card": svg(`<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16.2a3 3 0 0 1 6 0"/><path d="M14 9.5h4.5M14 13h4.5M14 16h2.8"/>`),

  "send-plane": svg(`<path d="M21 3 10.4 13.6"/><path d="M21 3 14 21l-3.6-7.4L3 10Z"/>`),

  "hex-arrow": svg(`<path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5Z"/><path d="M15.5 12h-7"/><path d="m10.5 9.5-2 2.5 2 2.5"/>`),
};
