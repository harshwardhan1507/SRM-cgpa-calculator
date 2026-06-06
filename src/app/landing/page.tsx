'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calculator, Flame, TrendingUp, Upload, ArrowRight, CheckCircle2, Zap, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketingPage() {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="pt-[80px] pb-16 sm:pb-24 px-4 sm:px-6 max-w-[1440px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              SRM Academic Suite
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium">
              Calculate. Predict. Track.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Academic performance toolkit built specifically for SRM students. Track SGPA, CGPA, import ERP results, and get AI-powered academic insights.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button size="xl" className="w-full">
                Launch Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/grading" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="w-full">
                View Regulations
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1440px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to excel
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for SRM students to manage their academic journey with precision and ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Calculator className="w-6 h-6" />}
              title="SGPA Calculator"
              description="Compute term-specific performance based on internal grades with accurate credit-weighted calculations."
              href="/semester/new"
            />
            <FeatureCard
              icon={<Flame className="w-6 h-6" />}
              title="CGPA Calculator"
              description="Aggregate multiple semesters to track your overall academic standing and degree progress."
              href="/cgpa"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="GPA Planner"
              description="Map target grades and get AI-powered academic coaching to achieve your goals."
              href="/predictor"
            />
            <FeatureCard
              icon={<Upload className="w-6 h-6" />}
              title="ERP Import"
              description="Import academic reports dynamically from portal screenshots with smart parsing."
              href="/semester/new?import=true"
            />
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#090909] border-y border-border">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for performance
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed with modern web technologies for speed, reliability, and offline-first functionality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Built with Next.js for optimal performance and instant page loads."
            />
            <BenefitCard
              icon={<Shield className="w-8 h-8" />}
              title="Offline First"
              description="Works without internet. Your data stays local and syncs when online."
            />
            <BenefitCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Smart Analytics"
              description="AI-powered insights to help you understand and improve your performance."
            />
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1440px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to take control of your academics?
          </h2>
          <p className="text-muted-foreground text-lg">
            Join SRM students already using the suite to track their progress.
          </p>
          <Link href="/" className="inline-block">
            <Button size="xl" className="text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ y: -4, borderColor: '#FAFAFA' }}
        transition={{ duration: 0.2 }}
        className="bg-[#090909] border border-border p-6 rounded-xl hover:bg-neutral-900 transition-all duration-200 h-full"
      >
        <div className="flex flex-col h-full">
          <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4 text-white">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto text-white">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
