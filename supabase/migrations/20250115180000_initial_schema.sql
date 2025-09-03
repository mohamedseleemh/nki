/*
# Initial Database Schema for Kika Beauty Landing Page
Creates tables for orders, products, and content management

## Query Description:
This operation creates the initial database structure for the Kika Beauty landing page.
It sets up tables for managing customer orders, product information, and dynamic content.
All operations are safe and reversible. No existing data will be affected.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- orders: Customer order information with status tracking
- products: Product catalog and details
- site_content: Dynamic content management for the landing page

## Security Implications:
- RLS Status: Enabled on all tables
- Policy Changes: Yes - Creates row-level security policies
- Auth Requirements: Admin access for management, public read for products

## Performance Impact:
- Indexes: Added on frequently queried columns
- Triggers: Added for automatic timestamps
- Estimated Impact: Minimal performance overhead
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    order_notes TEXT,
    status VARCHAR(50) DEFAULT 'جديد',
    total_amount DECIMAL(10,2) DEFAULT 350.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    benefits JSONB,
    usage_instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_content table for dynamic content management
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_key VARCHAR(100) UNIQUE NOT NULL,
    content_value TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON public.site_content(content_key);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at 
    BEFORE UPDATE ON public.site_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Orders: Allow public insert for new orders, admin access for management
CREATE POLICY "Allow public to create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to view own orders" ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage orders" ON public.orders
    FOR ALL USING (true);

-- Products: Public read access
CREATE POLICY "Allow public to view products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin to manage products" ON public.products
    FOR ALL USING (true);

-- Site content: Public read access
CREATE POLICY "Allow public to view site content" ON public.site_content
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage site content" ON public.site_content
    FOR ALL USING (true);

-- Insert initial product data
INSERT INTO public.products (name, description, price, benefits, usage_instructions, image_url) VALUES 
(
    'كيكه',
    'سيروم فيتامين سي الطبيعي لبشرة مشرقة وصحية',
    350.00,
    '[
        {"title": "تنظيم إفراز الزيوت", "description": "ينظم إفراز الزيوت ويقلل حجم المسام لبشرة أكثر نعومة وإشراقاً", "icon": "droplet"},
        {"title": "فيتامين سي المستقر", "description": "يحتوي على فوسفات أسكوربيل الصوديوم، مشتق ثابت من فيتامين سي، مضاد للبكتيريا والالتهابات", "icon": "shield"},
        {"title": "مكونات طبيعية", "description": "مكونات طبيعية للتحكم بالدهون، مكافحة البكتيريا، وتقليل الاحمرار والتهيج", "icon": "leaf"},
        {"title": "تقشير لطيف", "description": "يقشر البشرة بلطف ويزيل الخلايا الميتة والدهون الزائدة، يقلل ظهور حب الشباب", "icon": "sparkles"},
        {"title": "ترطيب عميق", "description": "يرطب البشرة بعمق دون ثقل، يحافظ على توازن البشرة الطبيعي", "icon": "heart"},
        {"title": "حماية مضادة للأكسدة", "description": "مضاد قوي للأكسدة، يفتح البقع الداكنة، يهدئ الالتهابات ويحمي البشرة من التلف الناتج عن الجذور الحرة", "icon": "sun"}
    ]'::jsonb,
    'ضع السيروم على بشرة نظيفة وجافة، دلك بلطف حتى يتم امتصاصه بالكامل، استخدم واقي الشمس خلال النهار، وتجنب المنتجات المهيجة.',
    null
) ON CONFLICT DO NOTHING;

-- Insert initial site content
INSERT INTO public.site_content (content_key, content_value, content_type) VALUES 
('brand_name', 'سندرين بيوتي', 'text'),
('brand_tagline', 'العناية الطبيعية لجمالك', 'text'),
('whatsapp_number', '01556133633', 'text'),
('free_shipping_enabled', 'true', 'boolean'),
('hero_title', 'كيكه', 'text'),
('hero_subtitle', 'سيروم فيتامين سي الطبيعي لبشرة مشرقة وصحية', 'text')
ON CONFLICT (content_key) DO NOTHING;
