import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "destructive" | "success"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variantStyles = {
            default: "bg-blue-50 text-blue-900 border-blue-200",
            destructive: "bg-red-50 text-red-900 border-red-200",
            success: "bg-green-50 text-green-900 border-green-200",
        }

        return (
            <div
                ref={ref}
                role="alert"
                className={cn(
                    "motion-reveal relative w-full rounded-lg border px-4 py-3 text-sm",
                    variantStyles[variant],
                    className
                )}
                {...props}
            />
        )
    }
)
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed", className)}
        {...props}
    />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }

