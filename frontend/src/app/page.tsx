import Link from "next/link"
import { ArrowRight, Shield, Zap, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
            ICON 2024 Accepted Paper
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight lg:text-7xl">
            Detect <span className="text-primary">Profanity</span> & <span className="text-indigo-600">Offensiveness</span> in Nepali
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
            A state-of-the-art Natural Language Processing model using Bi-directional LSTMs to identify harmful content in Romanized and Devanagari Nepali text.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/demo">
              <Button size="lg" className="h-12 px-8 text-base">
                Try the Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/examples">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                View Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-24 space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Dual Classification</h3>
            <p className="text-muted-foreground">
              Simultaneously predicts if text contains profanity and whether it is offensive, providing nuanced content moderation.
            </p>
          </div>
          <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
            <Zap className="h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Bi-LSTM Architecture</h3>
            <p className="text-muted-foreground">
              Powered by deep learning models trained on a custom Nepali dataset, capturing context better than keyword matching.
            </p>
          </div>
          <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
            <FileText className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Research Backed</h3>
            <p className="text-muted-foreground">
              Based on the paper published at ICON 2024. Open source and available for the community.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-secondary/30">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2024 Research Demo. Built for ICON 2024.
          </p>
          <div className="flex gap-6">
            <Link href="https://aclanthology.org/2024.icon-1.60" className="text-sm text-muted-foreground hover:underline">
              Read the Paper
            </Link>
            <Link href="https://github.com" className="text-sm text-muted-foreground hover:underline">
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
