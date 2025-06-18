import { Button } from "@/components/ui/button";
import { cn, secondaryFonts } from "@/lib/utils";
import {
  ChevronRight,
  BookOpen,
  Sparkles,
  GitBranch,
  Github,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-5xl mx-auto space-y-16">
            {/* Main Hero */}
            <div className="relative space-y-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Your Knowledge <br />
                <span
                  className={cn(
                    secondaryFonts.className,
                    "text-primary relative"
                  )}
                >
                  Branched
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore and map your learning path with AI-powered knowledge
                trees. Branch out, discover connections, and grow your
                understanding.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Link href="/pad">
                  <Button size="lg" className="gap-2">
                    Start Exploring <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="gap-2">
                    Learn More <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="relative p-6 border-2 border-border rounded-xl bg-card paper-effect"
                >
                  <div className="space-y-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-primary mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* GitHub Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                <Github className="h-4 w-4" />
                Open Source
              </div>
              <h2 className="text-2xl font-semibold">Support Us on GitHub</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                KBNet is open source and free forever. If you like what we're
                building, please consider giving us a star on GitHub.
              </p>
              <a
                href="https://github.com/PriyanshuPz/kbnet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" size="lg" className="gap-2">
                  <Github className="h-4 w-4" />
                  Star on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "AI-Powered Exploration",
    description:
      "Let AI guide you through interconnected knowledge paths, suggesting relevant branches and connections.",
    icon: <Sparkles className="h-6 w-6 text-primary" />,
  },
  {
    title: "Visual Learning Paths",
    description:
      "See your knowledge journey unfold with beautiful, interactive branch visualizations.",
    icon: <GitBranch className="h-6 w-6 text-primary" />,
  },
  {
    title: "Smart Recommendations",
    description:
      "Get personalized suggestions for related topics and alternative learning paths.",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
  },
];
