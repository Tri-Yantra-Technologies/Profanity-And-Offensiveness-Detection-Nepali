"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Info } from "lucide-react"

const ThreeBackground = dynamic(() => import("@/components/three-background"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-background -z-10" />
})

const EXAMPLES = [
    {
        text: "तपाईंको काम धेरै राम्रो छ।",
        romanized: "Tapai ko kaam dherai ramro cha.",
        profanity: { label: "Not Profane", confidence: 0.99 },
        offensiveness: { label: "Not Offensive", confidence: 0.98 },
        category: "Positive"
    },
    {
        text: "तेरो दिमाग छैन?",
        romanized: "Tero dimag chaina?",
        profanity: { label: "Not Profane", confidence: 0.85 },
        offensiveness: { label: "Offensive", confidence: 0.92 },
        category: "Offensive",
        note: "Not profane but offensive in tone."
    },
    {
        text: "आज मैले कुकुरलाई खाना दिएँ।",
        romanized: "Aja maile kukur lai khana diye.",
        profanity: { label: "Not Profane", confidence: 0.95 },
        offensiveness: { label: "Not Offensive", confidence: 0.99 },
        category: "Neutral",
        note: "Contains 'kukur' (dog) used literally."
    },
    {
        text: "मुलाको अचार मिठो।",
        romanized: "Mula ko achaar mitho.",
        profanity: { label: "Not Profane", confidence: 0.99 },
        offensiveness: { label: "Not Offensive", confidence: 0.99 },
        category: "Context",
        note: "'Mula' means Radish here, not the slur."
    }
]

const getCategoryColor = (category: string) => {
    switch (category) {
        case "Positive": return "from-green-500 to-emerald-500"
        case "Offensive": return "from-red-500 to-orange-500"
        case "Neutral": return "from-blue-500 to-cyan-500"
        case "Context": return "from-purple-500 to-pink-500"
        default: return "from-gray-500 to-gray-600"
    }
}

export default function ExamplesPage() {
    return (
        <div className="min-h-screen relative">
            <ThreeBackground />
            <Navbar />

            <main className="container py-32 max-w-5xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Badge className="px-4 py-2 text-sm bg-primary/20 text-primary border-primary/30">
                                <BookOpen className="w-3 h-3 mr-2" />
                                Curated Examples
                            </Badge>
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                            See It <span className="gradient-text">in Action</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Explore how the model handles various nuances in Nepali language.
                        </p>
                    </div>

                    {/* Examples Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {EXAMPLES.map((ex, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card rounded-2xl overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                {/* Header */}
                                <div className="p-6 pb-4 border-b border-border/50">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryColor(ex.category)} text-white`}>
                                            {ex.category}
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium leading-relaxed nepali-text">
                                        "{ex.text}"
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {ex.romanized}
                                    </p>
                                    {ex.note && (
                                        <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            {ex.note}
                                        </div>
                                    )}
                                </div>

                                {/* Results */}
                                <div className="p-6 pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Profanity</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {(ex.profanity.confidence * 100).toFixed(0)}%
                                            </span>
                                            <Badge
                                                variant={ex.profanity.label === "Profane" ? "destructive" : "default"}
                                                className={`text-xs ${ex.profanity.label !== "Profane" && 'bg-green-500/20 text-green-400 border-green-500/30'}`}
                                            >
                                                {ex.profanity.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Offensiveness</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {(ex.offensiveness.confidence * 100).toFixed(0)}%
                                            </span>
                                            <Badge
                                                variant={ex.offensiveness.label === "Offensive" ? "destructive" : "default"}
                                                className={`text-xs ${ex.offensiveness.label !== "Offensive" && 'bg-green-500/20 text-green-400 border-green-500/30'}`}
                                            >
                                                {ex.offensiveness.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-sm text-muted-foreground"
                    >
                        These are expected outputs based on model training. Actual results may vary.
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}
