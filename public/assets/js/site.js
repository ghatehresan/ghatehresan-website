/* =============================================================
   قطعه‌رسان — اسکریپت اصلی سایت
   جست‌وجو، کاتالوگ، صفحهٔ محصول و فرم‌ها.
   همهٔ قابلیت‌ها سمت مرورگر و بدون وابستگی خارجی است؛
   اتصال به سرور فقط از طریق تنظیمات config.js انجام می‌شود.
   ============================================================= */

(function () {
  "use strict";

  var CONFIG = window.GR_CONFIG || {};
  var CATALOG = window.GR_CATALOG || { categories: [], vehicles: [], products: [] };

  /* ---------- ابزار ---------- */

  var FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
  var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

  function toLatinDigits(s) {
    return String(s)
      .replace(/[۰-۹]/g, function (d) { return FA_DIGITS.indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return AR_DIGITS.indexOf(d); });
  }

  function toFaDigits(s) {
    return String(s).replace(/\d/g, function (d) { return FA_DIGITS[d]; });
  }

  function formatToman(n) {
    return toFaDigits(Number(n).toLocaleString("en-US"));
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function catName(slug) {
    var c = CATALOG.categories.find(function (x) { return x.slug === slug; });
    return c ? c.name : "";
  }

  var STATUS_META = {
    in:        { label: "موجود در انبار", badge: "badge-ok",   dot: "bg-ok" },
    low:       { label: "موجودی کم",     badge: "badge-warn", dot: "bg-warn" },
    out:       { label: "ناموجود",       badge: "badge-bad",  dot: "bg-bad" },
    backorder: { label: "قابل سفارش",    badge: "badge-info", dot: "bg-info" },
  };

  function statusBadge(p) {
    var m = STATUS_META[p.status] || STATUS_META.out;
    var extra = p.status === "low" && p.stockNote ? " · " + esc(p.stockNote) : "";
    extra += p.status === "backorder" && p.leadDays
      ? " · تحویل حدود " + toFaDigits(p.leadDays) + " روز کاری"
      : "";
    return '<span class="badge ' + m.badge + '">' + m.label + extra + "</span>";
  }

  /* ---------- اطلاعات تماس از پیکربندی ---------- */

  function hydrateContactInfo() {
    var phoneEl = $('[data-gr="phone"]');
    var emailEl = $('[data-gr="email"]');
    var addrEl = $('[data-gr="address"]');

    if (phoneEl && CONFIG.phone) {
      phoneEl.innerHTML = '<a dir="ltr" class="lat hover:text-white" href="tel:' +
        esc(CONFIG.phone) + '">' + esc(toFaDigits(CONFIG.phone)) + "</a>";
    }
    if (emailEl && CONFIG.email) {
      emailEl.innerHTML = '<a dir="ltr" class="lat hover:text-white" href="mailto:' +
        esc(CONFIG.email) + '">' + esc(CONFIG.email) + "</a>";
    }
    if (addrEl && CONFIG.address) {
      addrEl.textContent = CONFIG.address;
    }
  }

  /* ---------- منوی موبایل ---------- */

  function setupMobileNav() {
    var toggle = $("#nav-toggle");
    var panel = $("#nav-mobile");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("hidden") === false;
      toggle.setAttribute("aria-expanded", String(open));
      $(".gr-menu-open", toggle).classList.toggle("hidden", open);
      $(".gr-menu-close", toggle).classList.toggle("hidden", !open);
    });

    $all("a", panel).forEach(function (a) {
      a.addEventListener("click", function () {
        panel.classList.add("hidden");
        toggle.setAttribute("aria-expanded", "false");
        $(".gr-menu-open", toggle).classList.remove("hidden");
        $(".gr-menu-close", toggle).classList.add("hidden");
      });
    });
  }

  /* ---------- جست‌وجو و پیشنهادها ---------- */

  function normalize(s) {
    return toLatinDigits(String(s)).toLowerCase().replace(/‌/g, " ").replace(/\s+/g, " ").trim();
  }

  function productSearchText(p) {
    return normalize(
      [p.name, p.brand, p.partNumber, catName(p.category)].concat(p.vehicles || []).join(" ")
    );
  }

  function searchProducts(q, limit) {
    var tokens = normalize(q).split(" ").filter(Boolean);
    if (!tokens.length) return [];
    var hits = CATALOG.products.filter(function (p) {
      var text = productSearchText(p);
      return tokens.every(function (t) { return text.indexOf(t) !== -1; });
    });
    hits.sort(function (a, b) { return (a.status === "out") - (b.status === "out"); });
    return hits.slice(0, limit || 8);
  }

  function setupSearch(form) {
    var input = $("#gr-search-input", form);
    var list = $("#gr-search-list", form);
    if (!input || !list) return;

    var active = -1;

    function close() {
      list.classList.add("hidden");
      list.innerHTML = "";
      input.setAttribute("aria-expanded", "false");
      active = -1;
    }

    function render(q) {
      var hits = searchProducts(q, 7);
      if (!hits.length) {
        list.innerHTML =
          '<li class="px-4 py-3.5 text-sm text-steel">' +
          "چیزی پیدا نشد. می‌توانید این قطعه را " +
          '<a class="font-bold text-brand-800 underline" href="part-request.html">درخواست کنید</a>.' +
          "</li>";
        list.classList.remove("hidden");
        input.setAttribute("aria-expanded", "true");
        active = -1;
        return;
      }
      list.innerHTML = hits.map(function (p, i) {
        var m = STATUS_META[p.status] || STATUS_META.out;
        return (
          '<li role="option" id="gr-opt-' + i + '" aria-selected="false">' +
          '<a class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-brand-50" ' +
          'href="product.html?p=' + encodeURIComponent(p.slug) + '" data-i="' + i + '">' +
          '<span class="min-w-0">' +
          '<span class="block truncate text-sm font-bold text-ink">' + esc(p.name) + "</span>" +
          '<span class="mt-0.5 block text-xs text-steel"><span class="lat">' +
          esc(p.partNumber) + "</span> · " + esc(catName(p.category)) + "</span>" +
          "</span>" +
          '<span class="badge ' + m.badge + ' shrink-0">' + m.label + "</span>" +
          "</a></li>"
        );
      }).join("");
      list.classList.remove("hidden");
      input.setAttribute("aria-expanded", "true");
      active = -1;
    }

    input.addEventListener("input", function () {
      var q = input.value.trim();
      if (q.length < 2) { close(); return; }
      render(q);
    });

    input.addEventListener("keydown", function (e) {
      var opts = $all("li[role=option] a", list);
      if (!opts.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        active = e.key === "ArrowDown" ? (active + 1) % opts.length : (active - 1 + opts.length) % opts.length;
        opts.forEach(function (a, i) {
          a.parentElement.setAttribute("aria-selected", String(i === active));
          a.parentElement.classList.toggle("bg-brand-50", i === active);
        });
        input.setAttribute("aria-activedescendant", "gr-opt-" + active);
      } else if (e.key === "Enter" && active >= 0 && opts[active]) {
        e.preventDefault();
        window.location.href = opts[active].getAttribute("href");
      } else if (e.key === "Escape") {
        close();
      }
    });

    document.addEventListener("click", function (e) {
      if (!form.contains(e.target)) close();
    });
  }

  /* ---------- کارت محصول ---------- */

  function productCard(p) {
    return (
      '<article class="card card-hover flex flex-col overflow-hidden">' +
      '<a href="product.html?p=' + encodeURIComponent(p.slug) + '"' +
      ' class="hex-texture-strong flex h-36 items-center justify-center border-b border-line bg-paper text-brand-800/25"' +
      ' aria-hidden="true" tabindex="-1">' +
      '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5Z"/><circle cx="12" cy="12" r="3.2"/></svg>' +
      "</a>" +
      '<div class="flex flex-1 flex-col gap-2 p-4">' +
      '<div class="flex items-center justify-between gap-2">' +
      statusBadge(p) +
      '<span class="text-xs text-steel">' + esc(catName(p.category)) + "</span>" +
      "</div>" +
      '<h3 class="text-[17px] font-bold leading-7">' +
      '<a class="hover:text-brand-700 transition-colors" href="product.html?p=' + encodeURIComponent(p.slug) + '">' +
      esc(p.name) + "</a></h3>" +
      '<p class="text-xs text-steel"><span class="lat">' + esc(p.partNumber) + "</span> · " +
      esc(p.brand) + "</p>" +
      (p.vehicles && p.vehicles.length
        ? '<p class="text-xs text-steel">مناسب: ' + esc(p.vehicles.join("، ")) + "</p>"
        : "") +
      '<div class="mt-auto flex items-end justify-between gap-2 pt-2">' +
      '<p class="text-lg font-black text-brand-800">' + formatToman(p.price) +
      ' <span class="text-xs font-normal text-steel">تومان</span></p>' +
      '<a class="btn-brand btn-sm" href="product.html?p=' + encodeURIComponent(p.slug) + '">مشاهده</a>' +
      "</div></div></article>"
    );
  }

  /* ---------- صفحهٔ کاتالوگ ---------- */

  function setupCatalog() {
    var root = $("#catalog-root");
    if (!root) return;

    var state = { q: "", cat: "", vehicle: "", avail: false };
    var params = new URLSearchParams(window.location.search);
    state.q = (params.get("q") || "").slice(0, 80);
    state.cat = (params.get("cat") || "").slice(0, 40);
    state.vehicle = (params.get("v") || "").slice(0, 40);
    state.avail = params.get("avail") === "1";

    $("#cat-q").value = state.q;
    fillSelect($("#cat-category"), CATALOG.categories.map(function (c) { return [c.slug, c.name]; }), "همهٔ دسته‌ها", state.cat);
    fillSelect($("#cat-vehicle"), CATALOG.vehicles.map(function (v) { return [v, v]; }), "همهٔ خودروها", state.vehicle);
    $("#cat-avail").checked = state.avail;

    function fillSelect(sel, items, allLabel, current) {
      sel.innerHTML =
        '<option value="">' + allLabel + "</option>" +
        items.map(function (it) {
          return '<option value="' + esc(it[0]) + '"' + (it[0] === current ? " selected" : "") + ">" + esc(it[1]) + "</option>";
        }).join("");
    }

    function matches(p) {
      if (state.cat && p.category !== state.cat) return false;
      if (state.vehicle && (p.vehicles || []).indexOf(state.vehicle) === -1) return false;
      if (state.avail && p.status === "out") return false;
      if (state.q) {
        var tokens = normalize(state.q).split(" ").filter(Boolean);
        var text = productSearchText(p);
        if (!tokens.every(function (t) { return text.indexOf(t) !== -1; })) return false;
      }
      return true;
    }

    function syncUrl() {
      var sp = new URLSearchParams();
      if (state.q) sp.set("q", state.q);
      if (state.cat) sp.set("cat", state.cat);
      if (state.vehicle) sp.set("v", state.vehicle);
      if (state.avail) sp.set("avail", "1");
      var qs = sp.toString();
      history.replaceState(null, "", "catalog.html" + (qs ? "?" + qs : ""));
    }

    function render() {
      var hits = CATALOG.products.filter(matches);
      var grid = $("#catalog-grid");
      var count = $("#catalog-count");
      var empty = $("#catalog-empty");

      count.textContent = hits.length
        ? toFaDigits(hits.length) + " قطعه"
        : "";

      if (!hits.length) {
        grid.innerHTML = "";
        grid.classList.add("hidden");
        empty.classList.remove("hidden");
        $("#empty-q").textContent = state.q ? " برای «" + state.q + "»" : "";
        return;
      }
      empty.classList.add("hidden");
      grid.classList.remove("hidden");
      grid.innerHTML = hits.map(productCard).join("");
    }

    function onChange() { render(); syncUrl(); }

    var debounce;
    $("#cat-q").addEventListener("input", function (e) {
      clearTimeout(debounce);
      debounce = setTimeout(function () { state.q = e.target.value.trim(); onChange(); }, 180);
    });
    $("#cat-category").addEventListener("change", function (e) { state.cat = e.target.value; onChange(); });
    $("#cat-vehicle").addEventListener("change", function (e) { state.vehicle = e.target.value; onChange(); });
    $("#cat-avail").addEventListener("change", function (e) { state.avail = e.target.checked; onChange(); });

    $("#cat-reset").addEventListener("click", function () {
      state = { q: "", cat: "", vehicle: "", avail: false };
      $("#cat-q").value = "";
      $("#cat-category").selectedIndex = 0;
      $("#cat-vehicle").selectedIndex = 0;
      $("#cat-avail").checked = false;
      onChange();
    });

    render();
  }

  /* ---------- صفحهٔ محصول ---------- */

  function setupProduct() {
    var root = $("#product-root");
    if (!root) return;

    var slug = new URLSearchParams(window.location.search).get("p");
    var p = CATALOG.products.find(function (x) { return x.slug === slug; });

    if (!p) {
      root.innerHTML =
        '<div class="container-x py-16 text-center">' +
        '<div class="mx-auto max-w-lg card p-10">' +
        '<p class="text-h2 text-brand-800">این قطعه را پیدا نکردیم</p>' +
        '<p class="mt-3 text-body text-steel">ممکن است نشانی اشتباه باشد یا این قطعه هنوز در کاتالوگ نباشد.</p>' +
        '<div class="mt-6 flex flex-wrap justify-center gap-3">' +
        '<a class="btn-brand" href="catalog.html">مشاهدهٔ کاتالوگ</a>' +
        '<a class="btn-accent" href="part-request.html">درخواست این قطعه</a>' +
        "</div></div></div>";
      return;
    }

    document.title = p.name + " | قطعه‌رسان";

    var m = STATUS_META[p.status] || STATUS_META.out;
    var deliveryLine =
      p.status === "out"
        ? "فعلاً موجود نیست — درخواست بدهید تا به‌محض رسیدن خبرتان کنیم."
        : p.status === "backorder"
          ? "الان در انبار نیست؛ تحویل حدود " + toFaDigits(p.leadDays || 0) + " روز کاری دیگر. می‌توانید همین حالا رزرو کنید."
          : "سفارش تا ساعت ۱۴ → ارسال همان روز از " + esc(p.warehouse || "انبار تهران") +
            " · تهران: فردا · شهرستان: ۲ تا ۴ روز کاری";

    root.innerHTML =
      '<nav class="container-x pt-6 text-xs text-steel" aria-label="مسیر صفحه">' +
      '<a class="hover:text-brand-800" href="index.html">خانه</a> <span aria-hidden="true">←</span> ' +
      '<a class="hover:text-brand-800" href="catalog.html">کاتالوگ قطعات</a> <span aria-hidden="true">←</span> ' +
      '<a class="hover:text-brand-800" href="catalog.html?cat=' + encodeURIComponent(p.category) + '">' +
      esc(catName(p.category)) + '</a> <span aria-hidden="true">←</span> ' +
      '<span class="text-ink">' + esc(p.name) + "</span></nav>" +

      '<div class="container-x grid gap-8 py-8 lg:grid-cols-2">' +
      '<div class="hex-texture-strong card flex min-h-[320px] items-center justify-center bg-paper text-brand-800/25">' +
      '<svg viewBox="0 0 24 24" width="120" height="120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5Z"/><circle cx="12" cy="12" r="3.2"/></svg>' +
      "</div>" +

      '<div>' +
      "<div>" + statusBadge(p) + "</div>" +
      '<h1 class="mt-4 text-h1">' + esc(p.name) + "</h1>" +

      '<dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">' +
      dt("شمارهٔ فنی", '<span class="lat">' + esc(p.partNumber) + "</span>") +
      dt("برند", esc(p.brand)) +
      dt("کیفیت", esc(p.quality)) +
      dt("دسته", '<a class="text-brand-700 hover:underline" href="catalog.html?cat=' + encodeURIComponent(p.category) + '">' + esc(catName(p.category)) + "</a>") +
      dt("خودروهای سازگار", p.vehicles && p.vehicles.length ? esc(p.vehicles.join("، ")) : "عمومی") +
      dt("انبار", esc(p.warehouse || "تهران")) +
      "</dl>" +

      '<div class="mt-7 rounded-xl border border-line bg-white p-5">' +
      '<p class="text-3xl font-black text-brand-800">' + formatToman(p.price) +
      ' <span class="text-sm font-normal text-steel">تومان</span></p>' +
      '<p class="mt-2 flex items-start gap-2 text-sm leading-6 text-steel">' +
      '<span class="mt-0.5 shrink-0 text-accent-600">' + iconSvg("truck") + "</span>" +
      "<span>" + deliveryLine + "</span></p>" +
      '<div class="mt-5 flex flex-wrap gap-3">' +
      '<a class="btn-accent" href="part-request.html?part=' + encodeURIComponent(p.slug) + '">' +
      iconSvg("hex-arrow") + (p.status === "out" ? "درخواست این قطعه" : "ثبت درخواست / استعلام") + "</a>" +
      '<a class="btn-outline" href="b2b.html">قیمت عمده</a>' +
      "</div></div></div></div>" +

      '<div class="container-x pb-10">' +
      '<div class="card p-6 sm:p-8">' +
      '<h2 class="text-h2">توضیحات</h2>' +
      '<p class="mt-3 max-w-3xl text-body">' + esc(p.description) + "</p>" +
      '<div class="mt-5 flex flex-wrap gap-2">' +
      tagBadge(iconSvg("shield-check") + " گارانتی اصالت کالا") +
      tagBadge(iconSvg("check-circle") + " مهلت بازگشت ۷ روزه") +
      tagBadge(iconSvg("invoice") + " فاکتور رسمی") +
      "</div></div></div>" +

      relatedSection(p);

    injectProductJsonLd(p);

    function dt(label, value) {
      return '<div><dt class="text-xs text-steel">' + label + '</dt><dd class="mt-1 font-bold">' + value + "</dd></div>";
    }
    function tagBadge(html) {
      return '<span class="badge bg-paper text-steel !font-medium border border-line">' + html + "</span>";
    }
    function relatedSection(p) {
      var rel = CATALOG.products.filter(function (x) {
        return x.slug !== p.slug && (x.category === p.category ||
          (p.vehicles || []).some(function (v) { return (x.vehicles || []).indexOf(v) !== -1; }));
      }).slice(0, 4);
      if (!rel.length) return "";
      return (
        '<section class="container-x pb-16" aria-labelledby="related-h">' +
        '<h2 id="related-h" class="text-h2">قطعه‌های مرتبط</h2>' +
        '<div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">' +
        rel.map(productCard).join("") + "</div></section>"
      );
    }
  }

  function iconSvg(name) {
    var el = document.createElement("span");
    el.innerHTML = {
      truck: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 17V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2.2"/><path d="M15.8 17H8.8"/><path d="M14 8h3.5a1 1 0 0 1 .8.4l2.5 3.3a1 1 0 0 1 .2.6V16a1 1 0 0 1-1 1h-1"/><circle cx="6.8" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/></svg>',
      "shield-check": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8 4.5 5.6v5.2c0 4.6 3.2 8.6 7.5 10.4 4.3-1.8 7.5-5.8 7.5-10.4V5.6Z"/><path d="m9 11.6 2.1 2.1L15 9.8"/></svg>',
      "check-circle": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.3 2.4 2.4 4.8-5"/></svg>',
      invoice: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2.8h9l4 4v14.4H6Z"/><path d="M14.6 2.8v4.4H19"/><path d="M9 12h6M9 15.5h6M9 8.5h2"/></svg>',
      "hex-arrow": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5Z"/><path d="M15.5 12h-7"/><path d="m10.5 9.5-2 2.5 2 2.5"/></svg>',
    }[name] || "";
    return el.innerHTML;
  }

  function injectProductJsonLd(p) {
    var data = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.description,
      sku: p.partNumber,
      brand: { "@type": "Brand", name: p.brand },
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "IRT",
        availability:
          p.status === "out"
            ? "https://schema.org/OutOfStock"
            : p.status === "backorder"
              ? "https://schema.org/PreOrder"
              : "https://schema.org/InStock",
      },
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- فرم‌ها ---------- */

  function setupForm(opts) {
    var form = $(opts.selector);
    if (!form) return;

    var banner = $(opts.banner);
    var btn = $("button[type=submit]", form);

    function showBanner(kind, msg) {
      var styles = {
        ok: "bg-ok-soft text-ok border-ok/30",
        bad: "bg-bad-soft text-bad border-bad/30",
        info: "bg-info-soft text-info border-info/30",
      };
      banner.className = "rounded-xl border px-5 py-4 text-sm font-bold leading-7 " + (styles[kind] || styles.info);
      banner.innerHTML = msg;
      banner.classList.remove("hidden");
      banner.setAttribute("role", kind === "bad" ? "alert" : "status");
      banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function setError(input, msg) {
      var err = document.getElementById(input.getAttribute("aria-describedby") || "");
      input.classList.toggle("field-error", Boolean(msg));
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) { err.textContent = msg || ""; err.classList.toggle("hidden", !msg); }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if ($('[name="hp"]', form) && $('[name="hp"]', form).value) return; // هانی‌پات

      var valid = true;
      opts.fields.forEach(function (f) {
        var input = form.elements[f.name];
        var val = (input.value || "").trim();
        var problem = f.validate ? f.validate(toLatinDigits(val), val) : (f.required && !val ? "این فیلد لازم است." : "");
        setError(input, problem);
        if (problem) valid = false;
      });
      if (!valid) return;

      var endpoint = (CONFIG.endpoints || {})[opts.endpointKey];
      var payload = {};
      opts.fields.forEach(function (f) { payload[f.name] = (form.elements[f.name].value || "").trim(); });

      if (!endpoint) {
        showBanner("info",
          "در نسخهٔ نمایشی، این فرم هنوز به سرور متصل نیست؛ با راه‌اندازی سامانه، درخواست شما مستقیم ثبت می‌شود. " +
          "اطلاعات شما برای هیچ مقصد دیگری ارسال نشد.");
        return;
      }

      btn.disabled = true;
      btn.textContent = "در حال ارسال…";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          showBanner("ok", "ثبت شد ✓ به‌زودی با شما تماس می‌گیریم.");
          form.reset();
        })
        .catch(function () {
          showBanner("bad", "ارسال انجام نشد. اتصال را بررسی کنید و دوباره تلاش کنید.");
        })
        .finally(function () {
          btn.disabled = false;
          btn.innerHTML = opts.submitLabel;
        });
    });
  }

  function validPhone(latin) {
    var cleaned = latin.replace(/[\s\-()]/g, "");
    return /^(\+?98|0)?9\d{9}$/.test(cleaned) ? "" : "شمارهٔ موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).";
  }

  /* ---------- پیش‌پر کردن فرم درخواست از صفحهٔ محصول ---------- */

  function prefillPartRequest() {
    var field = $("#req-part");
    if (!field) return;
    var slug = new URLSearchParams(window.location.search).get("part");
    var p = CATALOG.products.find(function (x) { return x.slug === slug; });
    if (p) {
      field.value = p.name + " — " + p.partNumber;
      var chip = $("#req-part-chip");
      if (chip) {
        chip.classList.remove("hidden");
        $("#req-part-name").textContent = p.name;
      }
    }
  }

  /* ---------- قطعه‌های پرتقاضا در صفحهٔ اصلی ---------- */

  function setupFeatured() {
    var grid = $("#featured-grid");
    if (!grid) return;
    var picked = [];
    var seenCats = {};
    // اول یک قطعه از هر دستهٔ موجود، تا تنوع خودروها و دسته‌ها دیده شود
    CATALOG.products.forEach(function (p) {
      if (picked.length >= 4) return;
      if ((p.status === "in" || p.status === "low") && !seenCats[p.category]) {
        seenCats[p.category] = true;
        picked.push(p);
      }
    });
    grid.innerHTML = picked.map(productCard).join("");
  }

  /* ---------- راه‌اندازی ---------- */

  function init() {
    hydrateContactInfo();
    setupMobileNav();
    $all("form.gr-search").forEach(setupSearch);
    setupFeatured();
    setupCatalog();
    setupProduct();
    prefillPartRequest();

    setupForm({
      selector: "#form-part-request",
      banner: "#form-part-request-banner",
      endpointKey: "partRequest",
      submitLabel: "ثبت درخواست",
      fields: [
        { name: "part", required: true },
        { name: "name", required: true },
        { name: "phone", required: true, validate: validPhone },
        { name: "vehicle" },
        { name: "qty" },
        { name: "note" },
      ],
    });

    setupForm({
      selector: "#form-contact",
      banner: "#form-contact-banner",
      endpointKey: "contact",
      submitLabel: "ارسال پیام",
      fields: [
        { name: "name", required: true },
        { name: "phone", required: true, validate: validPhone },
        { name: "subject", required: true },
        { name: "message", required: true },
      ],
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
