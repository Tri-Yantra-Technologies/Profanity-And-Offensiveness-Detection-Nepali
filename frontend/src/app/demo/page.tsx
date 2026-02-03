"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { predictText, predictGender, getModels, submitFeedback, censorText, PredictionResponse, ModelInfo, GenderResponse, CensorResponse } from "@/lib/api"
import { Loader2, Copy, Check, AlertCircle, Sparkles, RotateCcw, ChevronDown, Cpu, ThumbsUp, ThumbsDown, User2, Eye, EyeOff } from "lucide-react"

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
    const [genderLoading, setGenderLoading] = useState(false)
    const [censorLoading, setCensorLoading] = useState(false)
    const [result, setResult] = useState<PredictionResponse | null>(null)
    const [genderResult, setGenderResult] = useState<GenderResponse | null>(null)
    const [censorResult, setCensorResult] = useState<CensorResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [feedbackSent, setFeedbackSent] = useState(false)

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
        setGenderResult(null)
        setFeedbackSent(false)

        try {
            const data = await predictText(text, selectedModel)
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get prediction")
        } finally {
            setLoading(false)
        }
    }

    const handleGenderPredict = async () => {
        if (!text.trim()) return
        setGenderLoading(true)
        setError(null)
        setResult(null)
        setGenderResult(null)
        setCensorResult(null)
        setFeedbackSent(false)

        try {
            const data = await predictGender(text)
            setGenderResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get gender prediction")
        } finally {
            setGenderLoading(false)
        }
    }

    const handleCensor = async () => {
        if (!text.trim()) return
        setCensorLoading(true)
        setError(null)
        setCensorResult(null)

        try {
            const data = await censorText(text, "*", selectedModel)
            setCensorResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to censor text")
        } finally {
            setCensorLoading(false)
        }
    }

    const handleFeedback = async (isCorrect: boolean) => {
        if (!text || feedbackSent) return

        const feedbackData = {
            text,
            model_used: result?.model_used || genderResult?.model_used || "unknown",
            prediction: result || genderResult,
            is_correct: isCorrect,
            timestamp: Date.now() / 1000
        }

        try {
            await submitFeedback(feedbackData)
            setFeedbackSent(true)
        } catch (err) {
            console.error("Failed to send feedback:", err)
        }
    }

    const handleReset = () => {
        setText("")
        setResult(null)
        setGenderResult(null)
        setCensorResult(null)
        setError(null)
        setFeedbackSent(false)
    }

    const copyResult = () => {
        const dataToCopy = result || genderResult
        if (!dataToCopy) return
        navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2))
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
                            NepSense • ICON 2024
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                            Smart <span className="gradient-text">Nepali AI</span> Analysis
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Advanced toxicity detection for Nepali text using state-of-the-art Bi-LSTM and BERT models.
                        </p>
                    </div>

                    {/* Input Card */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                        {/* Model Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Cpu className="w-4 h-4" />
                                Select ML Model
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                                    disabled={loadingModels || loading || genderLoading}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all text-left"
                                >
                                    <span className="font-medium text-sm sm:text-base">
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
                                                    <div className="font-medium text-sm">{model.name}</div>
                                                    <div className="text-xs text-muted-foreground">{model.description}</div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {/* Maintenance Notice for Multilabel */}
                                <AnimatePresence>
                                    {selectedModel === 'multilabel' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                                    <AlertCircle className="w-5 h-5 text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-orange-200">Maintenance Mode</p>
                                                    <p className="text-xs text-orange-300/80">We are currently fine-tuning this model. Expect improvements soon!</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Example Pills */}
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Quick Examples:</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_EXAMPLES.map((ex, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setText(ex.text)}
                                        className="px-4 py-1.5 rounded-full text-xs font-medium bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all"
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
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{text.length}/2000</span>
                                {text && (
                                    <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                        <RotateCcw className="w-3 h-3" /> Reset
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={handleCensor}
                                    disabled={loading || genderLoading || censorLoading || !text.trim()}
                                    variant="outline"
                                    size="lg"
                                    className="px-6 h-12 border-primary/30 hover:bg-primary/10 rounded-2xl"
                                >
                                    {censorLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Censoring...
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="mr-2 h-5 w-5" />
                                            Censor
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handlePredict}
                                    disabled={loading || genderLoading || censorLoading || !text.trim()}
                                    size="lg"
                                    className="px-10 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-semibold rounded-2xl"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            Analyze with AI
                                        </>
                                    )}
                                </Button>
                            </div>
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
                                    <span className="text-destructive text-sm font-medium">{error}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Censored Text Display */}
                    <AnimatePresence>
                        {censorResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-orange-500"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <EyeOff className="h-5 w-5" />
                                        Censored Text
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={censorResult.profanity_detected || censorResult.offensive_detected ? "destructive" : "default"} 
                                               className={!(censorResult.profanity_detected || censorResult.offensive_detected) ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}>
                                            {censorResult.censored_count > 0 ? `${censorResult.censored_count} word(s) censored` : "Clean"}
                                        </Badge>
                                        <Badge variant="outline" className="font-mono text-[10px] px-3 py-1">
                                            {censorResult.latency_ms.toFixed(1)}ms
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                                        <p className="text-xs text-muted-foreground mb-2">Original:</p>
                                        <p className="text-lg nepali-text">{censorResult.original}</p>
                                    </div>
                                    <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                                        <p className="text-xs text-muted-foreground mb-2">Censored:</p>
                                        <p className="text-lg font-bold nepali-text text-orange-400">{censorResult.censored}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 text-xs">
                                    {censorResult.profanity_detected && (
                                        <Badge variant="destructive" className="text-xs">Profanity Detected</Badge>
                                    )}
                                    {censorResult.offensive_detected && (
                                        <Badge variant="destructive" className="text-xs">Offensive Content</Badge>
                                    )}
                                    {!censorResult.profanity_detected && !censorResult.offensive_detected && (
                                        <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">Clean Content</Badge>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results */}
                    <AnimatePresence>
                        {(result || genderResult) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-2 px-2">
                                    <h2 className="text-xl font-bold">Analysis Results</h2>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono text-[10px] px-3 py-1 bg-primary/10">
                                            <Cpu className="w-3 h-3 mr-1" />
                                            {(result || genderResult)?.model_used}
                                        </Badge>
                                        <Badge variant="outline" className="font-mono text-[10px] px-3 py-1">
                                            {(result || genderResult)?.latency_ms.toFixed(1)}ms
                                        </Badge>
                                    </div>
                                </div>

                                <div className={`grid gap-4 ${result?.gender ? 'sm:grid-cols-3' : result ? 'sm:grid-cols-2' : 'sm:grid-cols-1 max-w-md mx-auto'}`}>
                                    {/* Profanity Card */}
                                    {result?.profanity && result.profanity.label !== "N/A" && (
                                        <div className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-primary">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Profanity</span>
                                                <Badge variant={result.profanity.label === "Profane" ? "destructive" : "default"} className={result.profanity.label !== "Profane" ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}>
                                                    {result.profanity.label}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Confidence</span>
                                                    <span className="font-mono font-bold">{(result.profanity.confidence * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${result.profanity.confidence * 100}%` }}
                                                        transition={{ duration: 0.8 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(result.profanity.label, result.profanity.confidence)}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Offensiveness Card */}
                                    {result?.offensiveness && result.offensiveness.label !== "N/A" && (
                                        <div className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-accent">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Offensiveness</span>
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
                                                <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: result.offensiveness.label.includes("N/A") ? '0%' : `${result.offensiveness.confidence * 100}%` }}
                                                        transition={{ duration: 0.8, delay: 0.1 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(result.offensiveness.label, result.offensiveness.confidence)}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Gender Card */}
                                    {(result?.gender || genderResult?.gender) && (
                                        <div className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-purple-500">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gender AI</span>
                                                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                                    {(result?.gender || genderResult?.gender)?.label}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Confidence</span>
                                                    <span className="font-mono font-bold">{(((result?.gender || genderResult?.gender)?.confidence || 0) * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${((result?.gender || genderResult?.gender)?.confidence || 0) * 100}%` }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Feedback Section */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="glass-card rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-primary/20"
                                >
                                    <div>
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            🔍 Was this prediction correct?
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Your feedback helps us retrain and improve our models.
                                        </p>
                                    </div>

                                    {feedbackSent ? (
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center gap-2 text-green-400 text-sm font-medium"
                                        >
                                            <Check className="w-4 h-4" />
                                            Thank you for your feedback!
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleFeedback(true)}
                                                className="rounded-lg hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50"
                                            >
                                                <ThumbsUp className="w-3.5 h-3.5 mr-2" />
                                                Correct
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleFeedback(false)}
                                                className="rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50"
                                            >
                                                <ThumbsDown className="w-3.5 h-3.5 mr-2" />
                                                Incorrect
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={copyResult} className="text-muted-foreground hover:text-foreground h-9">
                                        {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                                        {copied ? "Copied!" : "JSON"}
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
