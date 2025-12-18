import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Call Initiated",
    description: "Outbound or inbound call starts via Twilio integration",
  },
  {
    number: "02",
    title: "Real-Time Audio Streaming",
    description: "Live audio streams to our processing pipeline",
  },
  {
    number: "03",
    title: "Speech-to-Text Processing",
    description: "Convert speech to text with high accuracy in real-time",
  },
  {
    number: "04",
    title: "AI Decision Engine",
    description: "Context-aware AI analyzes intent and formulates responses",
  },
  {
    number: "05",
    title: "Natural Voice Response",
    description: "Text-to-speech generates natural-sounding responses",
  },
  {
    number: "06",
    title: "Call Analytics Stored",
    description: "Secure logging with transcripts, sentiment, and insights",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            How VOCA Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty px-4 sm:px-0">
            A seamless pipeline from call initiation to actionable insights
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col h-full">
                  <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl font-bold text-primary/20">{step.number}</div>
                  <h3 className="mb-2 text-lg sm:text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && index % 3 !== 2 && (
                  <div className="hidden xl:block absolute -right-4 top-8">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
