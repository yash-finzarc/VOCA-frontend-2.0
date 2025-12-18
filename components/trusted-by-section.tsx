import { Card } from "@/components/ui/card"
import { Phone, Users, Calendar, DollarSign, Heart, TrendingUp } from "lucide-react"

const useCases = [
  {
    icon: TrendingUp,
    title: "Sales & Lead Qualification",
    description: "Automatically qualify leads and schedule appointments with prospects at scale.",
  },
  {
    icon: Users,
    title: "Customer Support Automation",
    description: "Provide 24/7 support with AI agents that understand context and resolve issues.",
  },
  {
    icon: Calendar,
    title: "Appointment Reminders",
    description: "Reduce no-shows with intelligent automated reminder calls and confirmations.",
  },
  {
    icon: DollarSign,
    title: "Payment Follow-ups",
    description: "Handle collections and payment reminders with professional, consistent communication.",
  },
  {
    icon: Heart,
    title: "Healthcare Calling Assistants",
    description: "HIPAA-compliant calling for patient outreach, follow-ups, and care coordination.",
  },
  {
    icon: Phone,
    title: "Enterprise Operations",
    description: "Streamline high-volume calling operations across logistics, fintech, and more.",
  },
]

export function TrustedBySection() {
  return (
    <section className="py-24 sm:py-32 border-b border-border" id="product">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4 text-balance">
            Built for High-Volume Business Communication
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Trusted by enterprises across industries to automate and scale their calling operations
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <useCase.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{useCase.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
