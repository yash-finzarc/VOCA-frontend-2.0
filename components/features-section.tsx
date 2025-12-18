import { Card } from "@/components/ui/card"
import { Bot, Mic, Brain, Building2, Shield, FileText, Zap, Lock } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Voice Agents",
    description: "24/7 availability with human-like conversation capabilities",
  },
  {
    icon: Mic,
    title: "Real-Time Speech Recognition",
    description: "Industry-leading accuracy in multiple languages and accents",
  },
  {
    icon: Brain,
    title: "Context-Aware Conversations",
    description: "AI understands intent, sentiment, and conversation history",
  },
  {
    icon: Building2,
    title: "Multi-Tenant Architecture",
    description: "Built for B2B with complete organizational isolation",
  },
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description: "Granular permissions for teams and collaborators",
  },
  {
    icon: FileText,
    title: "Secure Call Logs & Transcripts",
    description: "Comprehensive records with full audit trails",
  },
  {
    icon: Zap,
    title: "Scalable API-First Design",
    description: "RESTful APIs for seamless integration into your systems",
  },
  {
    icon: Lock,
    title: "Enterprise-Grade Security",
    description: "SOC 2 compliant with end-to-end encryption",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Key Features
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty px-4 sm:px-0">
            Everything you need to build scalable, intelligent calling systems
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-5 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="mb-3 sm:mb-4 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-accent/10">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-base sm:text-lg font-semibold">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
