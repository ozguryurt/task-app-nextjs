"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Uygulama genelinde form ve veri işlemleri sonrasında gösterilen bildirimler.
 * Kök layout içinde bir kez render edilir, bildirimler `sonner` üzerinden
 * `toast.success(...)` / `toast.error(...)` ile tetiklenir.
 *
 * Tema sabit olarak "light" verilir: uygulama arayüzü yalnızca açık temada
 * çalışır (dark token'lar tanımlı olsa da tema geçişi yoktur).
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      richColors
      closeButton
      duration={4500}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "border backdrop-blur-xl shadow-[0_1px_2px_rgba(20,20,50,0.04),0_16px_40px_rgba(40,35,90,0.14)]",
          title: "text-sm font-semibold",
          description: "text-xs",
          actionButton: "rounded-lg",
          cancelButton: "rounded-lg",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

