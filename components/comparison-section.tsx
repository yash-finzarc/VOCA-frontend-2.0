import { Card } from "@/components/ui/card"
import { X, Check } from "lucide-react"

const comparisons = [
  {
    traditional: "High operational costs with human agents",
    voca: "Lower operational cost with AI automation",
  },
  {
    traditional: "Limited availability and scaling constraints",
    voca: "Faster response times with 24/7 availability",
  },
  {
    traditional: "Inconsistent call quality and messaging",
    voca: "Consistent call quality across all interactions",
  },
  {
    traditional: "Difficult to scale during peak periods",
    voca: "Easy scaling with instant capacity increases",
  },
  {
    traditional: "Manual reporting and limited insights",
    voca: "Actionable insights with real-time analytics",
  },
]

export function ComparisonSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Why VOCA
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty px-4 sm:px-0">
            Transform your calling operations with AI-powered automation
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:gap-6 lg:grid-cols-2">
            <Card className="p-6 sm:p-8 border-destructive/50">
              <div className="mb-4 sm:mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">Traditional Call Centers</h3>
              </div>
              <ul className="space-y-3">
                {comparisons.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 text-destructive" />
                    <span className="text-sm sm:text-base leading-relaxed">{item.traditional}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 sm:p-8 border-accent/50 bg-accent/5">
              <div className="mb-4 sm:mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">VOCA AI Calling</h3>
              </div>
              <ul className="space-y-3">
                {comparisons.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 text-accent" />
                    <span className="text-sm sm:text-base leading-relaxed">{item.voca}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
