"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { predictText, PredictionResponse } from "@/lib/api"
import { Loader2, Copy, Check, AlertCircle } from "lucide-react"

const PRESET_EXAMPLES = [
    "Tapai ko kaam ramro cha.",
    "Tero anuhar herda kasto gu jasto.",
    "Mula ko saag mitho huncha.",
    "Timilai ma maya garchu.",
    "Ta muji lai ma chodina."
]

export default function DemoPage() {
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<PredictionResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handlePredict = async () => {
        if (!text.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await predictText(text)
            setResult(data)
        } catch (err) {
            setError("Failed to get prediction. Please ensure the backend is running.")
            console.error(err)
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
        // If it's a negative class (Profane/Offensive), higher confidence = Red.
        // If it's positive (Not Profane/Not Offensive), higher confidence = Green.
        const isNegative = label.toLowerCase().includes("profane") && !label.toLowerCase().includes("not") ||
            label.toLowerCase().includes("offensive") && !label.toLowerCase().includes("not");

        if (isNegative) {
            if (confidence > 0.8) return "bg-red-600" // High confidence bad
            if (confidence > 0.5) return "bg-orange-500"
            return "bg-yellow-500"
        } else {
            if (confidence > 0.8) return "bg-green-600" // High confidence good
            if (confidence > 0.5) return "bg-green-500"
            return "bg-blue-500"
        }
    }

    return (
        <div className="min-h-screen bg-secondary/20 flex flex-col">
            <Navbar />

            <main className="container py-12 flex-1 max-w-4xl">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Interactive Demo</h1>
                        <p className="text-muted-foreground">
                            Enter Nepali text (Romanized or Devanagari) to detect profanity and offensiveness.
                        </p>
                    </div>

                    <Card className="border-2">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {PRESET_EXAMPLES.map((ex, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        className="whitespace-nowrap"
                                        onClick={() => setText(ex)}
                                    >
                                        Ex {i + 1}
                                    </Button>
                                ))}
                            </div>

                            <Textarea
                                placeholder="Type something here... e.g., &apos;Kasto gu jasto manche raicha&apos;"
                                className="min-h-[150px] text-lg resize-none p-4"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />

                            <div className="flex justify-end">
                                <Button onClick={handlePredict} disabled={loading || !text.trim()} size="lg" className="px-8">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        "Predict Analysis"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {error}
                        </div>
                    )}

                    {result && (
                        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                            <CardHeader className="bg-muted/50 pb-4">
                                <CardTitle className="flex justify-between items-center">
                                    <span>Analysis Results</span>
                                    <Badge variant="outline" className="font-mono font-normal text-xs">
                                        {result.latency_ms}ms latency
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid md:grid-cols-2 gap-8">

                                {/* Profanity Result */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">Profanity</h3>
                                        <Badge variant={result.profanity.label === "Profane" ? "destructive" : "success"}>
                                            {result.profanity.label}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Confidence</span>
                                            <span>{(result.profanity.confidence * 100).toFixed(1)}%</span>
                                        </div>
                                        <Progress
                                            value={result.profanity.confidence * 100}
                                            className="h-2.5"
                                            indicatorClass={getConfidenceColor(result.profanity.label, result.profanity.confidence)}
                                        />
                                    </div>
                                </div>

                                {/* Offensiveness Result */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">Offensiveness</h3>
                                        <Badge variant={result.offensiveness.label === "Offensive" ? "destructive" : "success"}>
                                            {result.offensiveness.label}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Confidence</span>
                                            <span>{(result.offensiveness.confidence * 100).toFixed(1)}%</span>
                                        </div>
                                        <Progress
                                            value={result.offensiveness.confidence * 100}
                                            className="h-2.5"
                                            indicatorClass={getConfidenceColor(result.offensiveness.label, result.offensiveness.confidence)}
                                        />
                                    </div>
                                </div>

                            </CardContent>
                            <CardFooter className="bg-muted/30 border-t py-3 flex justify-end">
                                <Button variant="ghost" size="sm" onClick={copyResult} className="text-muted-foreground">
                                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {copied ? "Copied JSON" : "Copy JSON"}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
