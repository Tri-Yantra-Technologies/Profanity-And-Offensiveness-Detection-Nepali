"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useState } from "react"

const navItems = [
    { href: "/", label: "Home" },
    { href: "/demo", label: "Demo" },
    { href: "/examples", label: "Examples" },
    { href: "/api", label: "API" },
]

export function Navbar() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50"
        >
            <div className="mx-4 mt-4">
                <div className="glass rounded-2xl px-6 py-4">
                    <div className="flex items-center justify-between max-w-6xl mx-auto">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <span className="text-white font-bold text-sm">NP</span>
                            </div>
                            <span className="font-bold text-lg hidden sm:block group-hover:text-primary transition-colors">
                                NepDetect
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="relative px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-active"
                                                className="absolute inset-0 bg-primary/20 rounded-lg"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className={`relative z-10 text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                            }`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Paper Link */}
                        <div className="hidden md:flex items-center gap-4">
                            <a
                                href="https://aclanthology.org/2024.icon-1.60"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                Read Paper
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 pt-4 border-t border-border/50"
                        >
                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? "bg-primary/20 text-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    )
                                })}
                                <a
                                    href="https://aclanthology.org/2024.icon-1.60"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                                >
                                    Read Paper
                                </a>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.nav>
    )
}
