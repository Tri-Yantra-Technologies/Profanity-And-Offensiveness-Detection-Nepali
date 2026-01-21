"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Zap, FileText, Sparkles, BookOpen, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

const ThreeBackground = dynamic(() => import("@/components/three-background"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-background -z-10" />
})

const features = [
  {
    icon: Shield,
    title: "Triple Detection",
    description: "State-of-the-art analysis for profanity, offensiveness, and gender identification.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Zap,
    title: "Bi-LSTM Architecture",
    description: "Deep learning models trained on custom Nepali datasets, capturing context beyond keywords.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: FileText,
    title: "Research Backed",
    description: "Based on peer-reviewed research published at ICON 2024. Completely free to use.",
    gradient: "from-orange-500 to-red-500"
  }
]

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <ThreeBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl space-y-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary pulse-glow">
            <Sparkles className="w-4 h-4" />
            ICON 2024 Published Research • Free to Use
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Analyze{" "}
            <span className="gradient-text">Profanity,</span>
            <br />
            <span className="gradient-text-warm">Offensiveness</span>
            {" "}&{" "}
            <span className="text-primary">Gender</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Free NLP tool powered by Bi-directional LSTMs to identify
            harmful content in both Romanized and Devanagari Nepali text.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/demo">
              <Button size="lg" className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity group">
                Start Analyzing
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="https://aclanthology.org/2024.icon-1.60" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base font-semibold border-border/50 hover:bg-muted/50">
                <BookOpen className="mr-2 h-5 w-5" />
                Read the Paper
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Use <span className="gradient-text">NepSense</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built on cutting-edge research, available for free to the community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-8 group hover:border-primary/30 transition-colors"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 sm:p-12"
          >
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold gradient-text mb-2">95%+</div>
                <div className="text-muted-foreground">Detection Accuracy</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold gradient-text-warm mb-2">&lt;50ms</div>
                <div className="text-muted-foreground">Inference Speed</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold gradient-text mb-2">Free</div>
                <div className="text-muted-foreground">Forever</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Analyze Your Text?
            </h2>
            <p className="text-muted-foreground text-lg">
              Test the model with your own Nepali text or explore our curated examples.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/demo">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-primary to-accent">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/examples">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  View Examples
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">© 2024 NepSense. Built for ICON 2024 • Free & Open Source</p>
          <a href="https://aclanthology.org/2024.icon-1.60" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Read the Paper →
          </a>
        </div>
      </footer>
    </main>
  )
}
