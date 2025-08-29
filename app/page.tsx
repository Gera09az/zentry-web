"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, ArrowUpRight, Home, Lock, Clock } from 'lucide-react';
import { Navbar } from "@/components/landing";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeIn, slideIn, staggerContainer, floatingAnimation, glowingAnimation } from "@/lib/animations";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useInView } from "react-intersection-observer";
import { useSpring, animated } from "@react-spring/web";
import Image from 'next/image';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const springProps = useSpring({
    from: { transform: "scale(0.8)" },
    to: { transform: heroInView ? "scale(1)" : "scale(0.8)" },
    config: { tension: 300, friction: 10 }
  });

  return (
    <div className="relative min-h-screen w-full">
      <Navbar />
      
      <motion.main 
        className="container relative mx-auto px-4 pt-32 pb-16"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        ref={heroRef}
      >
        {/* Decorative elements */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <motion.div 
            className="absolute top-0 right-0 w-full md:w-1/2 h-[500px] bg-primary-100/20 rounded-full blur-[128px]"
            variants={floatingAnimation}
            animate="animate"
          />
          <motion.div 
            className="absolute top-1/4 left-0 w-full md:w-1/2 h-[500px] bg-accent-100/20 rounded-full blur-[128px]"
            variants={floatingAnimation}
            animate="animate"
            transition={{ delay: 0.5 }}
          />
        </div>

        <section className="relative flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="flex-1 space-y-8"
            variants={slideIn}
          >
            <motion.div 
              className="inline-flex items-center rounded-full border border-primary-200/50 bg-primary-50/30 px-4 py-1.5 text-sm backdrop-blur-sm hover:border-primary-300 transition-colors duration-300 cursor-pointer group"
              variants={fadeIn}
            >
              <motion.span 
                className="relative flex h-2 w-2 mr-2"
                variants={glowingAnimation}
                animate="animate"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </motion.span>
              <span className="text-primary-700 font-medium">Seguridad Residencial</span>
              <ArrowUpRight className="w-4 h-4 ml-2 text-primary-500 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
            </motion.div>
            
            <div className="space-y-6">
              <motion.h1 
                className="text-4xl lg:text-7xl font-bold leading-tight tracking-tight"
                variants={fadeIn}
              >
                Gestiona el{' '}
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  acceso
                </span>{' '}
                a tu residencial con ZENTRY
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
                variants={fadeIn}
              >
                Controla y monitorea los ingresos a tu residencial de forma segura y eficiente. 
                Optimiza la experiencia de residentes y visitantes con nuestra app móvil.
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeIn}
            >
              <Button 
                size="lg" 
                className="group gap-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white shadow-lg hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 h-14 px-8 rounded-2xl"
                asChild
              >
                <Link href="#como-funciona">
                  Ver demostración
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="group gap-2 border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50/50 backdrop-blur-sm h-14 px-8 rounded-2xl"
                asChild
              >
                <Link href="#contacto">
                  <Home className="h-4 w-4 text-primary-500 group-hover:scale-110 transition-transform" />
                  Contactar
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-primary-100/50"
              variants={staggerContainer}
            >
              <motion.div 
                className="space-y-2"
                variants={fadeIn}
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary-50">
                    <Users className="h-6 w-6 text-primary-500" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                    <AnimatedCounter end={500} prefix="+" />
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Residenciales confían en nosotros
                </p>
              </motion.div>
              <motion.div 
                className="space-y-2"
                variants={fadeIn}
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary-50">
                    <Shield className="h-6 w-6 text-primary-500" />
                  </div>
                  <span className="text-3xl font-bold">
                    <AnimatedCounter end={100} suffix="%" />
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Seguro y confiable
                </p>
              </motion.div>
              <motion.div 
                className="space-y-2"
                variants={fadeIn}
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary-50">
                    <Clock className="h-6 w-6 text-primary-500" />
                  </div>
                  <span className="text-3xl font-bold">24/7</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Control de acceso permanente
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          <animated.div 
            style={springProps}
            className="flex-1 relative"
          >
            <motion.div 
              className="relative w-full aspect-square lg:aspect-[4/3]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-accent-100/10 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)]"></div>
              <Image
                src="/images/hero/zentry-app.jpg"
                alt="ZENTRY App Móvil"
                width={800}
                height={600}
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                priority
                unoptimized
              />
            </motion.div>
          </animated.div>
        </section>
      </motion.main>

      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Contact />
      <Footer />
      <ChatBubble />
    </div>
  );
}
