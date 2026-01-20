import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Nepali AI
                        </span>
                    </Link>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Home
                    </Link>
                    <Link href="/demo" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Demo
                    </Link>
                    <Link href="/examples" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Examples
                    </Link>
                    <Link href="/api" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        API
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="https://aclanthology.org/2024.icon-1.60" target="_blank">
                        <Button variant="outline" size="sm">Read Paper</Button>
                    </Link>
                    <Link href="/demo">
                        <Button size="sm">Try Demo</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
