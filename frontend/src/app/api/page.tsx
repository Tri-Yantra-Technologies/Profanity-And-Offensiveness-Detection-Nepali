"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Code, Copy, Check, Terminal, Zap } from "lucide-react"
import { useState } from "react"

const ThreeBackground = dynamic(() => import("@/components/three-background"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-background -z-10" />
})

function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative group">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                </button>
            </div>
            <div className="bg-black/50 rounded-xl p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-zinc-300">
                    <code>{code}</code>
                </pre>
            </div>
            <div className="absolute bottom-3 right-3">
                <span className="text-xs text-muted-foreground/50">{language}</span>
            </div>
        </div>
    )
}

const endpoints = [
    {
        method: "GET",
        path: "/health",
        description: "Health check for monitoring and load balancers.",
        response: `{
  "status": "ok"
}`
    },
    {
        method: "GET",
        path: "/meta",
        description: "Model version, paper info, and rate limit details.",
        response: `{
  "model_version": "1.0.0",
  "paper": "Profanity and Offensiveness Detection...",
  "paper_link": "https://aclanthology.org/2024.icon-1.60",
  "mock_mode": false,
  "rate_limit": { "requests": 20, "window_seconds": 60 }
}`
    },
    {
        method: "POST",
        path: "/predict",
        description: "Analyze Nepali text for profanity and offensiveness.",
        request: `{
  "text": "तपाईंको काम राम्रो छ"
}`,
        response: `{
  "profanity": { "label": "Not Profane", "confidence": 0.98 },
  "offensiveness": { "label": "Not Offensive", "confidence": 0.95 },
  "latency_ms": 45.2
}`
    }
]

const curlExample = `curl -X POST "https://your-api-url.com/predict" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "तपाईंको काम राम्रो छ"}'`

const pythonExample = `import requests

response = requests.post(
    "https://your-api-url.com/predict",
    json={"text": "तपाईंको काम राम्रो छ"}
)

result = response.json()
print(f"Profanity: {result['profanity']['label']}")
print(f"Offensive: {result['offensiveness']['label']}")`

const jsExample = `const response = await fetch("https://your-api-url.com/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "तपाईंको काम राम्रो छ" })
});

const result = await response.json();
console.log(result.profanity.label);  // "Not Profane"
console.log(result.offensiveness.label);  // "Not Offensive"`

export default function ApiPage() {
    return (
        <div className="min-h-screen relative">
            <ThreeBackground />
            <Navbar />

            <main className="container py-32 max-w-4xl relative z-10">
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
                                <Code className="w-3 h-3 mr-2" />
                                REST API
                            </Badge>
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                            API <span className="gradient-text">Documentation</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Integrate our detection models directly into your applications.
                        </p>
                    </div>

                    {/* Endpoints */}
                    <div className="space-y-6">
                        {endpoints.map((endpoint, i) => (
                            <motion.div
                                key={endpoint.path}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card rounded-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-border/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge
                                            className={`font-mono text-xs ${endpoint.method === "POST"
                                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                }`}
                                        >
                                            {endpoint.method}
                                        </Badge>
                                        <code className="text-lg font-mono font-bold">{endpoint.path}</code>
                                    </div>
                                    <p className="text-muted-foreground text-sm">{endpoint.description}</p>
                                </div>

                                <div className="p-6 space-y-4">
                                    {endpoint.request && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-muted-foreground">Request Body</h4>
                                            <CodeBlock code={endpoint.request} language="json" />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">Response</h4>
                                        <CodeBlock code={endpoint.response} language="json" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Code Examples */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Terminal className="w-6 h-6 text-primary" />
                            Code Examples
                        </h2>

                        <div className="space-y-4">
                            <div className="glass-card rounded-2xl p-6 space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground">cURL</h3>
                                <CodeBlock code={curlExample} language="bash" />
                            </div>

                            <div className="glass-card rounded-2xl p-6 space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground">Python</h3>
                                <CodeBlock code={pythonExample} language="python" />
                            </div>

                            <div className="glass-card rounded-2xl p-6 space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground">JavaScript</h3>
                                <CodeBlock code={jsExample} language="javascript" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Rate Limiting */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card rounded-2xl p-6 space-y-4"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Rate Limiting
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            The <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">/predict</code> endpoint
                            is rate limited to prevent abuse:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>20 requests per 60 second window</li>
                            <li>Sliding window algorithm per IP</li>
                            <li>Returns 429 status when exceeded</li>
                        </ul>
                        <div className="pt-2">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Response Headers</h4>
                            <CodeBlock
                                code={`X-RateLimit-Limit: 20
X-RateLimit-Remaining: 18
X-RateLimit-Window: 60`}
                                language="http"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}
