import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ApiPage() {
    return (
        <div className="min-h-screen bg-secondary/20">
            <Navbar />
            <main className="container py-12 max-w-4xl">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
                        <p className="text-muted-foreground">
                            Integrate our detection models directly into your applications.
                        </p>
                    </div>

                    {/* Health Endpoint */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">GET</Badge>
                                <CardTitle className="font-mono text-lg">/health</CardTitle>
                            </div>
                            <CardDescription>Health check endpoint for monitoring and load balancers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Response</h4>
                                <div className="bg-muted p-4 rounded-md font-mono text-sm">
                                    {`{
  "status": "ok"
}`}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meta Endpoint */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">GET</Badge>
                                <CardTitle className="font-mono text-lg">/meta</CardTitle>
                            </div>
                            <CardDescription>Get API metadata, model info, and paper details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Response</h4>
                                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                                    {`{
  "model_version": "1.0.0",
  "paper": "Profanity and Offensiveness Detection...",
  "paper_link": "https://aclanthology.org/2024.icon-1.60",
  "mock_mode": false,
  "rate_limit": {
    "requests": 20,
    "window_seconds": 60
  }
}`}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Predict Endpoint */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Badge>POST</Badge>
                                <CardTitle className="font-mono text-lg">/predict</CardTitle>
                            </div>
                            <CardDescription>
                                Analyze Nepali text for profanity and offensiveness. Rate limited.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Request Body</h4>
                                <div className="bg-muted p-4 rounded-md font-mono text-sm">
                                    {`{
  "text": "Your Nepali text here (1-2000 chars)"
}`}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Response</h4>
                                <div className="bg-muted p-4 rounded-md font-mono text-sm">
                                    {`{
  "profanity": {
    "label": "Not Profane",
    "confidence": 0.98
  },
  "offensiveness": {
    "label": "Offensive",
    "confidence": 0.76
  },
  "latency_ms": 45.2
}`}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">cURL Example</h4>
                                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                                    <pre>{`curl -X POST "https://your-api-url.com/predict" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "तपाईंको काम राम्रो छ"}'`}</pre>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Python Example</h4>
                                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                                    <pre>{`import requests

response = requests.post(
    "https://your-api-url.com/predict",
    json={"text": "तपाईंको काम राम्रो छ"}
)
result = response.json()
print(f"Profanity: {result['profanity']['label']}")
print(f"Offensive: {result['offensiveness']['label']}")`}</pre>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Error Responses</h4>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">400</Badge>
                                        <span className="text-muted-foreground">Invalid input (empty or too long)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">429</Badge>
                                        <span className="text-muted-foreground">Rate limit exceeded</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">500</Badge>
                                        <span className="text-muted-foreground">Internal server error</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rate Limiting Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Rate Limiting</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground text-sm">
                                The /predict endpoint is rate limited to prevent abuse. Default limits:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>20 requests per 60 second window</li>
                                <li>Sliding window algorithm per IP address</li>
                                <li>Returns 429 status when limit exceeded</li>
                            </ul>
                            <p className="text-muted-foreground text-sm">
                                Response headers include rate limit information:
                            </p>
                            <div className="bg-muted p-4 rounded-md font-mono text-sm">
                                {`X-RateLimit-Limit: 20
X-RateLimit-Remaining: 18
X-RateLimit-Window: 60`}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
