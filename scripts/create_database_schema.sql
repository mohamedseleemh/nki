-- Added database schema creation script
-- Create orders table for storing customer orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_notes TEXT,
    status TEXT DEFAULT 'جديد' CHECK (status IN ('جديد', 'قيد التجهيز', 'تم التوصيل')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create site_content table for managing website content
CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY DEFAULT 1,
    product_name TEXT DEFAULT 'كيكه',
    product_price TEXT DEFAULT '350 جنيه',
    product_subtitle TEXT DEFAULT 'سيروم فيتامين سي الطبيعي لبشرة مشرقة وصحية',
    usage_instructions TEXT DEFAULT 'ضع السيروم على بشرة نظيفة وجافة، دلك بلطف حتى يتم امتصاصه بالكامل، استخدم واقي الشمس خلال النهار، وتجنب المنتجات المهيجة.',
    brand_name TEXT DEFAULT 'سندرين بيوتي',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default content if not exists
INSERT INTO site_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
