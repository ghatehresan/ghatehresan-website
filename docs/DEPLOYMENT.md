# استقرار (Deployment)

خروجی پروژه یک وب‌سایت کاملاً استاتیک در پوشهٔ `public/` است.

## پیش‌نیاز

```bash
npm install
npm run build
```

خروجی نهایی فقط محتوای `public/` است؛ هیچ Runtime، دیتابیس یا سرور اختصاصی لازم ندارد.

## گزینه‌های میزبانی

### ۱. وب‌سرور سنتی (نگینکس / آپاچی / هاست اشتراکی)

محتوای `public/` را در ریشهٔ وب کپی کنید.

نگینکس — نمونهٔ حداقل:

```nginx
server {
  listen 80;
  server_name ghatehresan.ir www.ghatehresan.ir;
  root /var/www/ghatehresan/public;
  index index.html;

  # صفحهٔ ۴۰۴ برند
  error_page 404 /404.html;

  # کش بلند برای دارایی‌های تغییرناپذیر
  location /assets/ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
  }

  # HTML همیشه تازه بررسی شود
  location ~* \.html$ {
    add_header Cache-Control "no-cache";
  }

  # فونت‌ها با CORS برای preload
  location ~* \.(woff2|woff)$ {
    add_header Cache-Control "public, max-age=2592000, immutable";
    add_header Access-Control-Allow-Origin "*";
  }

  gzip on;
  gzip_types text/css application/javascript image/svg+xml application/manifest+json;
}
```

### ۲. GitHub Pages / Netlify / Cloudflare Pages

- Build command: `npm run build`
- Publish dir: `public`
- 404: بیشتر پلتفرم‌ها فایل `404.html` را خودکار استفاده می‌کنند؛ در غیر این صورت
  یک redirect با کد 404 به `404.html` تعریف کنید.

### ۳. پیش‌نمایش محلی

```bash
npm run serve   # http://localhost:8000
```

## HTTPS و دامنه

- طبق کتاب برند، دامنهٔ اصلی `ghatehresan.ir` (و `ghatehresan.com`) است؛
  قبل از انتشار، وضعیت ثبت دامنه را بازبینی کنید.
- `origin` در `build.mjs` را با دامنهٔ نهایی همگام کنید تا canonical و sitemap درست شوند
  و سپس دوباره build بگیرید.

## چک‌لیست انتشار

1. `npm run build` بدون خطا.
2. مقادیر `public/assets/js/config.js` پر شده باشد (یا عمداً null بماند).
3. Lighthouse: عملکرد، دسترس‌پذیری و SEO بالای ۹۰.
4. تست دستی موبایل و دسکتاپ: جست‌وجو، کاتالوگ، صفحهٔ محصول، فرم‌ها.
5. بررسی دستی ۴۰۴ و مسیرهای نسبی (همهٔ لینک‌ها نسبی‌اند و زیرمسیر هم کار می‌کنند).

## یادداشت عملکرد

- وزن اولیهٔ هر صفحه ≈ CSS (~38KB min) + دو اسکریپت کوچک + دو فونت پیش‌بارگذاری‌شده.
- تصویر og-cover تنها تصویر raster سایت است؛ سایر گرافیک‌ها SVG/خطی‌اند.
- اگر بعداً تصاویر واقعی محصولات اضافه شد: WebP + `loading="lazy"` + `srcset` الزامی است.
