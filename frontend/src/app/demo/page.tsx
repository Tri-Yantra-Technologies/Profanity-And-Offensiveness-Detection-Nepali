"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { predictText, PredictionResponse } from "@/lib/api"
import { Loader2, Copy, Check, AlertCircle, Sparkles, ChevronDown } from "lucide-react"

const ThreeBackground = dynamic(() => import("@/components/three-background"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-background -z-10" />
})

const PRESET_EXAMPLES = [
    { text: "तपाईंको काम राम्रो छ।", label: "Compliment" },
    { text: "Tapai ko kaam ramro cha.", label: "Romanized" },
    { text: "Mula ko saag mitho huncha.", label: "Contextual" },
    { text: "Timilai ma maya garchu.", label: "Positive" },
]

export default function DemoPage() {
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<PredictionResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [showExamples, setShowExamples] = useState(false)

    const handlePredict = async () => {
        if (!text.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await predictText(text)
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get prediction")
        } finally {
            setLoading(false)
        }
    }

    const copyResult = () => {
        if (!result) return
        navigator.clipboard.writeText(JSON.stringify(result, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getConfidenceColor = (label: string, confidence: number) => {
        const isNegative = (label.toLowerCase().includes("profane") && !label.toLowerCase().includes("not")) ||
            (label.toLowerCase().includes("offensive") && !label.toLowerCase().includes("not"))

        if (isNegative) {
            return confidence > 0.7 ? "from-red-500 to-orange-500" : "from-orange-500 to-yellow-500"
        }
        return confidence > 0.7 ? "from-green-500 to-emerald-500" : "from-blue-500 to-cyan-500"
    }

    const isProfane = result?.profanity.label === "Profane"
    const isOffensive = result?.offensiveness.label === "Offensive"

    return (
        <div className="min-h-screen relative">
            <ThreeBackground />
            <Navbar />

            <main className="container py-32 max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Badge className="px-4 py-2 text-sm bg-primary/20 text-primary border-primary/30">
                                <Sparkles className="w-3 h-3 mr-2" />
                                Interactive Demo
                            </Badge>
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                            Try the <span className="gradient-text">Detector</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Enter Nepali text in Romanized or Devanagari script to analyze for profanity and offensiveness.
                        </p>
                    </div>

                    {/* Input Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-3xl p-6 sm:p-8 space-y-6"
                    >
                        {/* Example Pills */}
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowExamples(!showExamples)}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <span>Try an example</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showExamples && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {PRESET_EXAMPLES.map((ex, i) => (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => {
                                                    setText(ex.text)
                                                    setShowExamples(false)
                                                }}
                                                className="px-4 py-2 rounded-full text-sm font-medium bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all"
                                            >
                                                {ex.label}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Text Input */}
                        <Textarea
                            placeholder="टाइप गर्नुहोस्... या Type in Romanized Nepali..."
                            className="min-h-[160px] text-lg resize-none p-5 bg-muted/30 border-border/50 focus:border-primary/50 rounded-2xl nepali-text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    handlePredict()
                                }
                            }}
                        />

                        {/* Submit Button */}
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                {text.length}/2000 characters • Ctrl+Enter to submit
                            </span>
                            <Button
                                onClick={handlePredict}
                                disabled={loading || !text.trim()}
                                size="lg"
                                className="px-8 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Analyze Text
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Error State */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass-card rounded-2xl p-5 border-destructive/30 bg-destructive/10"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                    <span className="text-destructive">{error}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ type: "spring", duration: 0.6 }}
                                className="space-y-6"
                            >
                                {/* Results Header */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">Analysis Results</h2>
                                    <Badge variant="outline" className="font-mono text-xs px-3 py-1">
                                        {result.latency_ms.toFixed(1)}ms
                                    </Badge>
                                </div>

                                {/* Result Cards Grid */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {/* Profanity Card */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="glass-card rounded-2xl p-6 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                                Profanity
                                            </span>
                                            <Badge
                                                variant={isProfane ? "destructive" : "default"}
                                                className={`px-3 py-1 font-semibold ${!isProfane && 'bg-green-500/20 text-green-400 border-green-500/30'}`}
                                            >
                                                {result.profanity.label}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Confidence</span>
                                                <span className="font-mono font-bold">
                                                    {(result.profanity.confidence * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.profanity.confidence * 100}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(result.profanity.label, result.profanity.confidence)}`}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Offensiveness Card */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="glass-card rounded-2xl p-6 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                                Offensiveness
                                            </span>
                                            <Badge
                                                variant={isOffensive ? "destructive" : "default"}
                                                className={`px-3 py-1 font-semibold ${!isOffensive && 'bg-green-500/20 text-green-400 border-green-500/30'}`}
                                            >
                                                {result.offensiveness.label}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Confidence</span>
                                                <span className="font-mono font-bold">
                                                    {(result.offensiveness.confidence * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.offensiveness.confidence * 100}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(result.offensiveness.label, result.offensiveness.confidence)}`}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Copy JSON */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex justify-end"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={copyResult}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 mr-2 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-2" />
                                        )}
                                        {copied ? "Copied!" : "Copy JSON"}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    )
}
