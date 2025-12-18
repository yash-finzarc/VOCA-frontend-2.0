import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 lg:py-40 xl:py-48">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            <span className="hidden sm:inline">AI-Powered Voice Agents for Scalable Business Conversations</span>
            <span className="sm:hidden">AI Voice for Business</span>
          </div>

          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-tight text-center">
            Automate Business Calls with AI Voice Agents
          </h1>

          <p className="mb-8 sm:mb-10 text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground text-pretty leading-relaxed max-w-3xl mx-auto text-center px-4 sm:px-0">
            VOCA enables intelligent outbound and inbound calling using real-time speech recognition, AI reasoning, and
            natural voice responses.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12">
              Request Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 bg-transparent"
            >
              View Architecture
            </Button>
          </div>

          <div className="mt-12 sm:mt-16 rounded-xl border border-border bg-card p-1.5 sm:p-2 shadow-2xl mx-auto max-w-5xl w-full">
            <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
              <img
                src="/ai-voice-call-dashboard-with-waveforms-and-analyti.jpg"
                alt="VOCA Dashboard"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
