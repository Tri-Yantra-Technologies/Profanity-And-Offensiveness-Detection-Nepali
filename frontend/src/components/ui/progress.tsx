import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: number | null, indicatorClass?: string }
>(({ className, value, indicatorClass, ...props }, ref) => {
    const safeValue = Math.min(100, Math.max(0, value || 0))
    return (
        <div
            ref={ref}
            className={cn(
                "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
                className
            )}
            {...props}
        >
            <div
                className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClass)}
                style={{ transform: `translateX(-${100 - safeValue}%)` }}
            />
        </div>
    )
})
Progress.displayName = "Progress"

export { Progress }
