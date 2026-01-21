"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Globe, GraduationCap } from "lucide-react"

const ThreeBackground = dynamic(() => import("@/components/three-background"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-background -z-10" />
})

const AUTHORS = [
    {
        name: "Abiral Adhikari",
        website: "https://www.researchgate.net/profile/Abiral-Adhikari-4",
        icon: GraduationCap,
        initials: "AA"
    },
    {
        name: "Prashant Manandhar",
        website: "https://manandharprashant.com.np",
        icon: Globe,
        initials: "PM"
    },
    {
        name: "Reewaj Khanal",
        website: "https://reewajkhanal.com.np",
        icon: Globe,
        initials: "RK"
    },
    {
        name: "Samir Wagle",
        website: "https://samirwagle.com.np",
        icon: Globe,
        initials: "SW"
    },
    {
        name: "Praveen Acharya",
        website: "https://aclanthology.org/people/praveen-acharya/",
        icon: GraduationCap,
        initials: "PA"
    },
    {
        name: "Bal Krishna Bal",
        website: "https://aclanthology.org/people/bal-krishna-bal/",
        icon: GraduationCap,
        initials: "BK"
    },
]

export default function AuthorsPage() {
    return (
        <div className="min-h-screen relative">
            <ThreeBackground />
            <Navbar />

            <main className="container py-32 max-w-5xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-16"
                >
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <Badge className="px-4 py-2 text-sm bg-primary/20 text-primary border-primary/30">
                            NepSense Research
                        </Badge>
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
                            About the <span className="gradient-text">Project</span>
                        </h1>
                    </div>

                    {/* Abstract Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-[2rem] p-8 sm:p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <GraduationCap className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <span className="w-8 h-1 bg-primary rounded-full" />
                                Abstract
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed italic">
                                &quot;Offensive and profane content has been on the rise in Nepali Social Media, which is very disturbing to users. This is partly due to the absence of proper tools and mechanisms for the Nepali language to deal with profanity and offensive texts. In this work, we attempt to develop a deep learning-based profanity and offensive comments detection tool. We develop a Bi-LSTM (Bidirectional Long Short Term Memory) based model for the classification of Profane and Offensive comments and study different variations of the task. Furthermore, Multilingual BERT embedding and vocab embedding were used among others for an accurate understanding of the intent and decency of the posts. While previous related studies in the Nepali language are more focused on sentiment and offensiveness detection only, our study explores profanity and offensiveness detection as two distinct tasks.&quot;
                            </p>
                        </div>
                    </motion.div>

                    {/* Writers Section */}
                    <div className="space-y-8">
                        <h2 className="text-3xl font-extrabold text-center">Meet the <span className="gradient-text">Writers</span></h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {AUTHORS.map((author, idx) => (
                                <motion.a
                                    key={author.name}
                                    href={author.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all group pointer-events-auto"
                                >
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-all relative">
                                        <span className="text-2xl font-black text-primary/40 group-hover:text-primary transition-colors">
                                            {author.initials}
                                        </span>
                                        <div className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-background border border-border shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <author.icon className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-center group-hover:text-primary transition-colors">
                                        {author.name}
                                    </h3>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
