import { Card } from "@/components/ui/card"

const stackItems = [
  { name: "Twilio", description: "Voice Infrastructure" },
  { name: "Speech-to-Text", description: "Real-time Transcription" },
  { name: "AI Reasoning", description: "Decision Engine" },
  { name: "Text-to-Speech", description: "Natural Voice Generation" },
  { name: "Supabase", description: "Auth, Database & RLS" },
]

export function ArchitectureSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-muted/30" id="architecture">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Enterprise-Ready Architecture
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty px-4 sm:px-0">
            Built on industry-leading technologies for reliability and scale
          </p>
        </div>

        <div className="mx-auto max-w-5xl mb-8 sm:mb-12">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {stackItems.map((item, index) => (
              <Card key={index} className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-1 text-sm sm:text-base">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl">
          <Card className="p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Multi-Tenant B2B Support</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <svg className="h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Single Organization with Multiple Collaborators</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Built for teams with role-based permissions and secure workspace isolation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <svg className="h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Secure Row-Level Isolation</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Data segregation at the database level with Supabase Row Level Security policies
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
