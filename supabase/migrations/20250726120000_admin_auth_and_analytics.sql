/*
# [Operation Name]
إضافة نظام مصادقة للوحة الإدارة وتحسينات على التقارير

## Query Description:
يقوم هذا السكريبت بإضافة الوظائف اللازمة لتأمين لوحة الإدارة بكلمة مرور، وتحسين هيكل البيانات لدعم هذه الميزة.
- **الأمان:** إضافة كلمة مرور افتراضية للوحة الإدارة (`admin123`).
- **المصادقة:** إنشاء دالة آمنة (RPC) للتحقق من كلمة المرور دون كشفها.
- **الأداء:** إصلاح مشكلة `search_path` التي ظهرت في تقرير الأمان.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- **Table:** `site_content`
  - **Action:** `INSERT`
  - **Details:** إضافة سجل جديد `admin_password` لتخزين كلمة مرور لوحة الإدارة.
- **Function:** `verify_admin_password`
  - **Action:** `CREATE`
  - **Details:** دالة جديدة للتحقق من كلمة المرور بشكل آمن.

## Security Implications:
- RLS Status: لا تغييرات على RLS.
- Policy Changes: لا تغييرات.
- Auth Requirements: يتم التحقق من كلمة المرور عبر دالة RPC آمنة.

## Performance Impact:
- Indexes: لا تغييرات.
- Triggers: لا تغييرات.
- Estimated Impact: لا يوجد تأثير على الأداء.
*/

-- إضافة كلمة مرور افتراضية للوحة الإدارة
INSERT INTO public.site_content (content_key, content_value)
VALUES ('admin_password', 'admin123')
ON CONFLICT (content_key) DO NOTHING;

-- إنشاء دالة آمنة للتحقق من كلمة المرور
CREATE OR REPLACE FUNCTION verify_admin_password(password_attempt TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  correct_password TEXT;
BEGIN
  -- تحديد مسار البحث لإصلاح مشكلة الأمان
  SET search_path = public;

  SELECT content_value INTO correct_password
  FROM site_content
  WHERE content_key = 'admin_password';

  RETURN password_attempt = correct_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح الصلاحية للدالة
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT) TO anon, authenticated;
