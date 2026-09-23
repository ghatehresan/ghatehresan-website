/* =============================================================
   دادهٔ کاتالوگ — نسخهٔ نمایشی (نمونه‌های مستند در کتاب برند)
   ------------------------------------------------------------
   ساختار فیلدها عمداً با جدول products سامانهٔ مدیریت
   قطعه‌رسان هم‌خوان است (فقط فیلدهای عمومی؛ قیمت خرید،
   تأمین‌کننده و یادداشت داخلی هرگز به وب‌سایت نمی‌آیند).
   پس از اتصال به API واقعی، این فایل حذف و داده از سرور
   خوانده می‌شود — بدون تغییر در رابط کاربری.
   ============================================================= */

window.GR_CATALOG = {
  // دسته‌بندی‌ها: دقیقاً فهرست جدول categories سامانهٔ مدیریت
  categories: [
    { slug: "filter", name: "فیلتر", icon: "filter" },
    { slug: "motor-consumable", name: "مصرفی موتور", icon: "wrench" },
    { slug: "fluids", name: "روغن و مایعات", icon: "box" },
    { slug: "brakes", name: "ترمز", icon: "shield-check" },
    { slug: "electrical", name: "برقی سبک", icon: "info" },
    { slug: "cabin", name: "کابین و جانبی", icon: "nut" },
    { slug: "suspension", name: "جلوبندی", icon: "car" },
    { slug: "body", name: "بدنه", icon: "warehouse" },
    { slug: "other", name: "سایر", icon: "box" },
  ],

  // خودروها: دقیقاً فهرست جدول vehicles سامانهٔ مدیریت
  vehicles: [
    "پژو ۴۰۵", "پژو پارس", "پژو ۲۰۶", "سمند", "دنا", "رانا",
    "پراید", "تیبا", "کوییک", "شاهین", "ال۹۰",
  ],

  /* وضعیت‌ها:
     in        → موجود در انبار
     low       → موجودی کم (با ذکر تعداد واقعی)
     out       → ناموجود
     backorder → قابل سفارش (با زمان تحویل واقعی، نه تبلیغاتی) */
  products: [
    {
      slug: "lent-jolo-206-tip5",
      name: "لنت ترمز جلو پژو ۲۰۶ تیپ ۵",
      category: "brakes",
      partNumber: "4252.46",
      brand: "اصلی کارخانه",
      quality: "درجهٔ یک",
      vehicles: ["پژو ۲۰۶", "رانا"],
      price: 1283400,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "لنت ترمز جلو مناسب پژو ۲۰۶ تیپ ۵ با گارانتی اصالت کالا. شمارهٔ فنی 4252.46. این قطعه از انبار تهران ارسال می‌شود و برای سفارش‌های ثبت‌شده تا ساعت ۱۴، همان روز به پست تحویل داده می‌شود.",
    },
    {
      slug: "tasme-timing-samand-ef7",
      name: "تسمه تایم سمند EF7",
      category: "motor-consumable",
      partNumber: "1210.82",
      brand: "اصلی کارخانه",
      quality: "درجهٔ یک",
      vehicles: ["سمند", "دنا"],
      price: 985000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "تسمه تایم مناسب موتور ملی EF7 (سمند و دنا). تعویض به‌موقع تسمه تایم از آسیب پرهزینه به موتور جلوگیری می‌کند؛ اگر از زمان آخرین تعویض مطمئن نیستید، همین امروز سفارش دهید.",
    },
    {
      slug: "dastgire-dakhel-pride",
      name: "دستگیرهٔ داخل کابین پراید",
      category: "cabin",
      partNumber: "PRD-8124",
      brand: "شرکتی",
      quality: "درجهٔ یک",
      vehicles: ["پراید"],
      price: 215000,
      status: "low",
      stockNote: "۲ عدد باقی",
      warehouse: "انبار تهران",
      description:
        "دستگیرهٔ داخل کابین پراید، مناسب همهٔ مدل‌های صندوق‌دار و هاچ‌بک. رنگ مشکی فابریک.",
    },
    {
      slug: "filter-roghan-405-pars",
      name: "فیلتر روغن پژو ۴۰۵ و پارس (XU7)",
      category: "filter",
      partNumber: "1109.C4",
      brand: "اصلی کارخانه",
      quality: "درجهٔ یک",
      vehicles: ["پژو ۴۰۵", "پژو پارس", "سمند"],
      price: 185000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "فیلتر روغن مناسب موتور XU7 (پژو ۴۰۵، پارس و سمند). با هر بار تعویض روغن، فیلتر را هم عوض کنید.",
    },
    {
      slug: "lent-jolo-pride",
      name: "لنت ترمز جلو پراید",
      category: "brakes",
      partNumber: "PRD-2150",
      brand: "اصلی کارخانه",
      quality: "درجهٔ یک",
      vehicles: ["پراید"],
      price: 540000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "لنت ترمز جلو مناسب همهٔ مدل‌های پراید. صدای سوت کم، عمر استاندارد و گارانتی اصالت.",
    },
    {
      slug: "sham-motor-dena-ef7",
      name: "شمع موتور دنا و سمند EF7 (ست ۴ عددی)",
      category: "electrical",
      partNumber: "EF7-SP4",
      brand: "اصلی کارخانه",
      quality: "درجهٔ یک",
      vehicles: ["دنا", "سمند", "رانا"],
      price: 1450000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "ست ۴ عددی شمع موتور مناسب موتور ملی EF7. شمع فرسوده مصرف سوخت را بالا می‌برد و کشش موتور را کم می‌کند.",
    },
    {
      slug: "roghan-motor-10w40",
      name: "روغن موتور 10W40 نیمه‌سنتتیک — ۴ لیتری",
      category: "fluids",
      partNumber: "OIL-10W40-4L",
      brand: "برند معتبر داخلی",
      quality: "درجهٔ یک",
      vehicles: [],
      price: 1120000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "روغن موتور 10W40 نیمه‌سنتتیک، مناسب موتورهای پژو، سمند، پراید و تیبا. قوطی ۴ لیتری با پلمپ کارخانه.",
    },
    {
      slug: "disk-safhe-pars",
      name: "دیسک و صفحه کلاچ پژو پارس و ۴۰۵",
      category: "motor-consumable",
      partNumber: "2052.K2",
      brand: "اصلی کارخانه",
      quality: "درجهٔ یک",
      vehicles: ["پژو پارس", "پژو ۴۰۵", "سمند"],
      price: 4850000,
      status: "backorder",
      leadDays: 5,
      warehouse: "انبار تهران",
      description:
        "ست کامل دیسک و صفحه کلاچ مناسب موتور XU7. الان در انبار موجود نیست؛ محمولهٔ بعدی حدود ۵ روز کاری دیگر می‌رسد و می‌توانید همین حالا رزرو کنید.",
    },
    {
      slug: "cheragh-jolo-405",
      name: "چراغ جلو پژو ۴۰۵ (سمت راست)",
      category: "body",
      partNumber: "405-FL-R",
      brand: "شرکتی",
      quality: "درجهٔ یک",
      vehicles: ["پژو ۴۰۵"],
      price: 2350000,
      status: "out",
      warehouse: "انبار تهران",
      description:
        "چراغ جلو کامل پژو ۴۰۵ سمت راست (شاگرد) با طلق شفاف و سوکت فابریک. فعلاً موجود نیست — درخواست بدهید تا به‌محض رسیدن خبرتان کنیم.",
    },
    {
      slug: "sibak-farman-pride",
      name: "سیبک فرمان پراید",
      category: "suspension",
      partNumber: "PRD-3310",
      brand: "شرکتی",
      quality: "درجهٔ یک",
      vehicles: ["پراید"],
      price: 320000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "سیبک فرمان پراید با گارانتی اصالت. لق شدن فرمان معمولاً از همین قطعه شروع می‌شود.",
    },
    {
      slug: "filter-hava-samand",
      name: "فیلتر هوای سمند و پژو ۴۰۵",
      category: "filter",
      partNumber: "1444.XS",
      brand: "اصلی کارخانه",
      quality: "درجهٔ یک",
      vehicles: ["سمند", "پژو ۴۰۵", "پژو پارس"],
      price: 145000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "فیلتر هوای موتور مناسب سمند و خانوادهٔ پژو. فیلتر کثیف مصرف سوخت را بالا می‌برد.",
    },
    {
      slug: "vayr-sham-pride",
      name: "وایر شمع پراید (ست کامل)",
      category: "electrical",
      partNumber: "PRD-5960",
      brand: "شرکتی",
      quality: "درجهٔ یک",
      vehicles: ["پراید"],
      price: 480000,
      status: "low",
      stockNote: "۳ عدد باقی",
      warehouse: "انبار تهران",
      description:
        "ست کامل وایر شمع پراید با روکش سیلیکونی مقاوم حرارت.",
    },
    {
      slug: "lent-jolo-tiba-quick",
      name: "لنت ترمز جلو تیبا و کوییک",
      category: "brakes",
      partNumber: "TBA-4410",
      brand: "اصلی کارخانه",
      quality: "درجهٔ یک",
      vehicles: ["تیبا", "کوییک"],
      price: 690000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "لنت ترمز جلو مناسب تیبا و کوییک با گارانتی اصالت کالا.",
    },
    {
      slug: "tabagh-jolo-pride",
      name: "طبق جلو پراید (با سیبک)",
      category: "suspension",
      partNumber: "PRD-3355",
      brand: "شرکتی",
      quality: "درجهٔ یک",
      vehicles: ["پراید"],
      price: 890000,
      status: "in",
      warehouse: "انبار تهران",
      description:
        "طبق جلو پراید همراه با سیبک نصب‌شده؛ تعویض طبق با سیبک، هزینهٔ اجرت شما را کم می‌کند.",
    },
  ],
};
