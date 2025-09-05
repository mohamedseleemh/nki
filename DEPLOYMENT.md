# دليل النشر - كيكه سندرين بيوتي 🚀

## متطلبات النشر

### 1. إعداد قاعدة البيانات (Supabase)

1. **إنشاء مشروع جديد:**
   - اذهب إلى [Supabase](https://supabase.com)
   - أنشئ حساب جديد أو سجل الدخول
   - أنشئ مشروع جديد

2. **تشغيل Migration Files:**
   ```sql
   -- في SQL Editor في Supabase، قم بتشغيل الملفات بالترتيب:
   -- 1. supabase/migrations/20250115180000_initial_schema.sql
   -- 2. supabase/migrations/20250726120000_admin_auth_and_analytics.sql  
   -- 3. supabase/migrations/20250730120000_react_auth_upgrade.sql
   ```

3. **الحصول على المفاتيح:**
   - اذهب إلى Settings > API
   - انسخ `Project URL` و `anon public key`

### 2. إعداد متغيرات البيئة

أنشئ ملف `.env.local` في جذر المشروع:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration  
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=201556133633

# Environment
NODE_ENV=production
```

## خيارات النشر

### 1. النشر على Vercel (موصى به) ⭐

1. **ربط المشروع:**
   ```bash
   # تثبيت Vercel CLI
   npm i -g vercel
   
   # ربط المشروع
   vercel link
   ```

2. **إضافة متغيرات البيئة:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   vercel env add NEXT_PUBLIC_WHATSAPP_NUMBER
   ```

3. **النشر:**
   ```bash
   vercel --prod
   ```

### 2. النشر على Netlify

1. **إعداد Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `out`

2. **إضافة متغيرات البيئة في Netlify Dashboard**

3. **إضافة ملف `netlify.toml`:**
   ```toml
   [build]
     command = "npm run build"
     publish = "out"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

### 3. النشر على خادم VPS

1. **تثبيت Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **رفع الملفات وتثبيت المكتبات:**
   ```bash
   git clone your-repo
   cd your-project
   npm install
   ```

3. **إعداد PM2:**
   ```bash
   npm install -g pm2
   npm run build
   pm2 start npm --name "keeka-app" -- start
   pm2 startup
   pm2 save
   ```

4. **إعداد Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## إعدادات الأمان

### 1. Row Level Security (RLS)
تأكد من تفعيل RLS على جميع الجداول في Supabase:

```sql
-- تم تفعيلها بالفعل في migration files
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
```

### 2. HTTPS
- استخدم شهادة SSL (Let's Encrypt مجانية)
- تأكد من إعادة توجيه HTTP إلى HTTPS

### 3. متغيرات البيئة
- لا تضع المفاتيح السرية في الكود
- استخدم متغيرات البيئة دائماً

## مراقبة الأداء

### 1. Analytics
- تم تفعيل Vercel Analytics بالفعل
- يمكن إضافة Google Analytics إذا لزم الأمر

### 2. Error Monitoring
```bash
# إضافة Sentry للمراقبة (اختياري)
npm install @sentry/nextjs
```

### 3. Performance Monitoring
- استخدم Lighthouse لفحص الأداء
- راقب Core Web Vitals

## النسخ الاحتياطي

### 1. قاعدة البيانات
```bash
# نسخ احتياطي من Supabase
# يتم تلقائياً في Supabase، أو يمكن تصدير البيانات يدوياً
```

### 2. الملفات المرفوعة
```bash
# نسخ احتياطي من مجلد uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/
```

## استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاتصال بقاعدة البيانات:**
   - تحقق من صحة متغيرات البيئة
   - تأكد من تشغيل migration files

2. **مشاكل في رفع الصور:**
   - تحقق من صلاحيات مجلد uploads
   - تأكد من وجود المجلد

3. **مشاكل في الأداء:**
   - فعل caching
   - ضغط الصور
   - استخدم CDN

## الصيانة

### تحديثات دورية:
```bash
# تحديث المكتبات
npm update

# فحص الثغرات الأمنية  
npm audit

# إصلاح الثغرات
npm audit fix
```

### مراقبة السجلات:
```bash
# عرض سجلات PM2
pm2 logs

# عرض سجلات Nginx
sudo tail -f /var/log/nginx/access.log
```

---

## ملاحظات مهمة 📝

- تأكد من تشغيل جميع migration files قبل النشر
- اختبر جميع الوظائف في بيئة التطوير أولاً
- احتفظ بنسخة احتياطية من قاعدة البيانات
- راقب الأداء والأخطاء بانتظام

للدعم التقني، راجع الوثائق أو تواصل مع فريق التطوير.