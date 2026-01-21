"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { predictText, getModels, PredictionResponse, ModelInfo } from "@/lib/api"
import { Loader2, Copy, Check, AlertCircle, Sparkles, RotateCcw, ChevronDown, Cpu } from "lucide-react"

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

    // Model selection state
    const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
    const [selectedModel, setSelectedModel] = useState<string>("multilabel")
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [loadingModels, setLoadingModels] = useState(true)

    // Fetch available models on mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const data = await getModels()
                setAvailableModels(data.available_models)
                setSelectedModel(data.default_model)
            } catch (err) {
                console.error("Failed to fetch models:", err)
                // Default fallback
                setAvailableModels([
                    { type: "multilabel", name: "Multilabel (Profanity & Offensiveness)", description: "Detects both" },
                    { type: "profane_binary", name: "Profanity Only", description: "Detects profanity" }
                ])
            } finally {
                setLoadingModels(false)
            }
        }
        fetchModels()
    }, [])

    const handlePredict = async () => {
        if (!text.trim()) return
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await predictText(text, selectedModel)
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get prediction")
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setText("")
        setResult(null)
        setError(null)
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

    const getSelectedModelName = () => {
        const model = availableModels.find(m => m.type === selectedModel)
        return model?.name || selectedModel
    }

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
                        <Badge className="px-4 py-2 text-sm bg-primary/20 text-primary border-primary/30">
                            <Sparkles className="w-3 h-3 mr-2" />
                            Powered by Bi-LSTM • Free Forever
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                            Analyze <span className="gradient-text">Nepali Text</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Enter text in Romanized or Devanagari script to check for profanity and offensiveness.
                        </p>
                    </div>

                    {/* Input Card */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
                        {/* Model Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Cpu className="w-4 h-4" />
                                Select Model
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                                    disabled={loadingModels}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all text-left"
                                >
                                    <span className="font-medium">
                                        {loadingModels ? "Loading models..." : getSelectedModelName()}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showModelDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            {availableModels.map((model) => (
                                                <button
                                                    key={model.type}
                                                    onClick={() => {
                                                        setSelectedModel(model.type)
                                                        setShowModelDropdown(false)
                                                    }}
                                                    className={`w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors ${selectedModel === model.type ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                                                >
                                                    <div className="font-medium">{model.name}</div>
                                                    <div className="text-sm text-muted-foreground">{model.description}</div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Example Pills */}
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Try an example:</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_EXAMPLES.map((ex, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setText(ex.text)}
                                        className="px-4 py-2 rounded-full text-sm font-medium bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all"
                                    >
                                        {ex.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text Input */}
                        <Textarea
                            placeholder="टाइप गर्नुहोस्... या Type in Romanized Nepali..."
                            className="min-h-[160px] text-lg resize-none p-5 bg-muted/30 border-border/50 focus:border-primary/50 rounded-2xl nepali-text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{text.length}/2000</span>
                                {text && (
                                    <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                        <RotateCcw className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>
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
                    </div>

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
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h2 className="text-xl font-bold">Analysis Results</h2>
                                    <div className="flex items-center gap-2">
                                        {result.model_used && (
                                            <Badge variant="outline" className="font-mono text-xs px-3 py-1 bg-primary/10">
                                                <Cpu className="w-3 h-3 mr-1" />
                                                {result.model_used}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="font-mono text-xs px-3 py-1">
                                            {result.latency_ms.toFixed(1)}ms
                                        </Badge>
                                    </div>
                                </div>

                                <div className={`grid gap-4 ${result.gender ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                                    {/* Profanity Card */}
                                    <div className="glass-card rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Profanity</span>
                                            <Badge variant={result.profanity.label === "Profane" ? "destructive" : "default"} className={result.profanity.label !== "Profane" ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}>
                                                {result.profanity.label}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Confidence</span>
                                                <span className="font-mono font-bold">{(result.profanity.confidence * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.profanity.confidence * 100}%` }}
                                                    transition={{ duration: 0.8 }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(result.profanity.label, result.profanity.confidence)}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Offensiveness Card */}
                                    <div className="glass-card rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Offensiveness</span>
                                            <Badge
                                                variant={result.offensiveness.label === "Offensive" ? "destructive" : "default"}
                                                className={
                                                    result.offensiveness.label.includes("N/A")
                                                        ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                        : result.offensiveness.label !== "Offensive"
                                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                            : ''
                                                }
                                            >
                                                {result.offensiveness.label}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Confidence</span>
                                                <span className="font-mono font-bold">
                                                    {result.offensiveness.label.includes("N/A")
                                                        ? "—"
                                                        : `${(result.offensiveness.confidence * 100).toFixed(1)}%`
                                                    }
                                                </span>
                                            </div>
                                            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: result.offensiveness.label.includes("N/A") ? '0%' : `${result.offensiveness.confidence * 100}%` }}
                                                    transition={{ duration: 0.8, delay: 0.1 }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(result.offensiveness.label, result.offensiveness.confidence)}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gender Card (Optional) */}
                                    {result.gender && (
                                        <div className="glass-card rounded-2xl p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gender</span>
                                                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                                    {result.gender.label}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Confidence</span>
                                                    <span className="font-mono font-bold">{(result.gender.confidence * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${result.gender.confidence * 100}%` }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button variant="ghost" size="sm" onClick={copyResult} className="text-muted-foreground hover:text-foreground">
                                        {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                                        {copied ? "Copied!" : "Copy JSON"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    )
}
