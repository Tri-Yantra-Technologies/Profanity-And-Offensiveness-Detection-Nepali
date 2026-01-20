import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const EXAMPLES = [
    {
        text: "Tapai ko kaam dherai ramro cha.",
        profanity: { label: "Not Profane", confidence: 0.99 },
        offensiveness: { label: "Not Offensive", confidence: 0.98 }
    },
    {
        text: "Tero dimag chaina?",
        profanity: { label: "Not Profane", confidence: 0.85 },
        offensiveness: { label: "Offensive", confidence: 0.92 }
    },
    {
        text: "Aja maile kukur lai kutte.",
        profanity: { label: "Not Profane", confidence: 0.95 },
        offensiveness: { label: "Not Offensive", confidence: 0.99 },
        note: "Contains 'kukur' (dog) but used literally contextually."
    },
    {
        text: "Mula ko achaar mitho.",
        profanity: { label: "Not Profane", confidence: 0.99 },
        offensiveness: { label: "Not Offensive", confidence: 0.99 },
        note: "'Mula' means Radish here, not the slur."
    }
]

export default function ExamplesPage() {
    return (
        <div className="min-h-screen bg-secondary/20 block">
            <Navbar />
            <main className="container py-12 max-w-5xl">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Examples</h1>
                        <p className="text-muted-foreground">
                            See how the model handles various nuances in Nepali language (Romanized).
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {EXAMPLES.map((ex, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardHeader className="bg-muted/50 pb-4">
                                    <CardTitle className="font-medium text-lg">&quot;{ex.text}&quot;</CardTitle>
                                    {ex.note && <CardDescription>{ex.note}</CardDescription>}
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Profanity</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{(ex.profanity.confidence * 100).toFixed(0)}%</span>
                                            <Badge variant={ex.profanity.label === "Profane" ? "destructive" : "secondary"}>
                                                {ex.profanity.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">Offensiveness</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{(ex.offensiveness.confidence * 100).toFixed(0)}%</span>
                                            <Badge variant={ex.offensiveness.label === "Offensive" ? "destructive" : "secondary"}>
                                                {ex.offensiveness.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
