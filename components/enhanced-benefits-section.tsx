"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Shield, Droplets, Sparkles, Heart, Zap, Sun } from "lucide-react"

const benefits = [
  {
    icon: Droplets,
    title: "تنظيم إفراز الزيوت",
    description: "يتحكم في إنتاج الزيوت الطبيعية ويقلل من حجم المسام الظاهرة",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "مضاد للبكتيريا والالتهابات",
    description: "يحتوي على فوسفات أسكوربيل الصوديوم، مشتق ثابت من فيتامين سي",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Sparkles,
    title: "تقشير لطيف للبشرة",
    description: "يزيل الخلايا الميتة والدهون الزائدة، ويقلل من ظهور حب الشباب",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Heart,
    title: "ترطيب عميق",
    description: "يرطب البشرة بعمق دون ثقل، ويحافظ على توازن البشرة الطبيعي",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "مضاد قوي للأكسدة",
    description: "يحمي البشرة من التلف الناتج عن الجذور الحرة والعوامل البيئية",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Sun,
    title: "تفتيح البقع الداكنة",
    description: "يفتح البقع الداكنة ويهدئ الالتهابات لبشرة موحدة اللون",
    color: "from-yellow-500 to-orange-500",
  },
]

export function EnhancedBenefitsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-pink-50/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            فوائد كيكه المذهلة
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            اكتشفي قوة فيتامين سي المتطور في تحويل بشرتك إلى بشرة صحية ومشرقة
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-pink-600 transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>

                {/* Hover effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
