// ملف مركزي للقيم الثابتة والتكوينات

// حالات الطلب المتاحة
export const ORDER_STATUSES = ['جديد', 'قيد التجهيز', 'تم التوصيل', 'ملغي'];

// بيانات المنتج الافتراضية في حالة عدم توفرها من قاعدة البيانات
export const DEFAULT_PRODUCT = {
  id: 'default-product-id',
  name: 'كيكه',
  description: 'سيروم فيتامين سي الطبيعي لبشرة مشرقة وصحية',
  price: 350,
  benefits: [
    {
      title: "تنظيم إفراز الزيوت",
      description: "ينظم إفراز الزيوت ويقلل حجم المسام.",
      icon: "droplet"
    },
    {
      title: "فيتامين سي المستقر",
      description: "مضاد للبكتيريا والالتهابات.",
      icon: "shield"
    },
    {
      title: "مكونات طبيعية",
      description: "للتحكم بالدهون ومكافحة البكتيريا.",
      icon: "leaf"
    },
    {
      title: "تقشير لطيف",
      description: "يزيل الخلايا الميتة ويقلل ظهور حب الشباب.",
      icon: "sparkles"
    },
    {
      title: "ترطيب عميق",
      description: "يحافظ على توازن البشرة الطبيعي.",
      icon: "heart"
    },
    {
      title: "حماية مضادة للأكسدة",
      description: "يفتح البقع الداكنة ويحمي البشرة.",
      icon: "sun"
    }
  ],
  usage_instructions: 'ضع السيروم على بشرة نظيفة وجافة، دلك بلطف حتى يتم امتصاصه بالكامل، استخدم واقي الشمس خلال النهار.',
  image_url: null
};

// إعدادات الموقع الافتراضية
export const DEFAULT_SITE_CONTENT = {
  brand_name: 'سندرين بيوتي',
  brand_tagline: 'العناية الطبيعية لجمالك',
  whatsapp_number: '01556133633',
  free_shipping_enabled: 'true'
};
