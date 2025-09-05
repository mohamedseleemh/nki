"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Sparkles, Heart, Star, Zap } from "lucide-react"

export function EnhancedHeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const floatingIcons = [
    { Icon: Sparkles, delay: 0, x: 20, y: -20 },
    { Icon: Heart, delay: 0.5, x: -30, y: 10 },
    { Icon: Star, delay: 1, x: 40, y: 30 },
    { Icon: Zap, delay: 1.5, x: -20, y: -40 },
  ]

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute text-pink-300/40"
          initial={{ opacity: 0, scale: 0 }}
          animate={
            inView
              ? {
                  opacity: [0, 1, 0.7, 1],
                  scale: [0, 1.2, 0.8, 1],
                  x: [0, x, x * 0.5, x],
                  y: [0, y, y * 0.5, y],
                }
              : {}
          }
          transition={{
            duration: 3,
            delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          style={{
            left: `${20 + index * 20}%`,
            top: `${15 + index * 15}%`,
          }}
        >
          <Icon size={24} />
        </motion.div>
      ))}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="container mx-auto px-4 text-center relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          {/* Brand logo */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">سندرين بيوتي</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full" />
          </motion.div>

          {/* Main title */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
          >
            كيكه
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-700 mb-8 font-medium">
            سيروم فيتامين سي المتطور لبشرة مشرقة وصحية
          </motion.p>

          {/* Product image */}
          <motion.div variants={itemVariants} className="relative mb-8">
            <div className="relative w-64 h-80 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200/50 to-purple-200/50 rounded-3xl blur-xl transform rotate-6" />
              <div className="relative bg-white rounded-3xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="كيكه سيروم فيتامين سي"
                  className="w-full h-64 object-cover rounded-2xl"
                />
              </div>
            </div>
          </motion.div>

          {/* Price and CTA */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg">
              <span className="text-3xl font-bold text-pink-600">350 جنيه</span>
              <div className="w-px h-8 bg-gray-300" />
              <span className="text-green-600 font-medium">شحن مجاني</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              اطلبي الآن — الدفع عند الاستلام
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center gap-8 mt-12 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>متوفر الآن</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>توصيل سريع</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span>ضمان الجودة</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
