import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github, Youtube, Database, Brain } from "lucide-react";
import Link from "next/link";

const DEMO_VIDEO_URL = "https://youtube.com/your-demo-video";

export default function AboutPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Content */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">About KBNet</h1>
            <p className="text-xl text-muted-foreground">
              An AI-powered knowledge exploration platform
            </p>
          </div>

          {/* Project Info Cards */}
          <div className="grid gap-6 mt-8">
            {/* Tech Stack */}
            <Card className="p-6 paper-effect">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Built with MindsDB
              </h2>
              <p className="text-muted-foreground">
                KBNet leverages MindsDB's powerful AI capabilities to create
                intelligent knowledge connections and provide smart learning
                path recommendations. The integration allows us to offer
                advanced natural language processing and machine learning
                features directly within your learning journey.
              </p>
            </Card>

            {/* Quira Quest */}
            <Card className="p-6 paper-effect">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Quira Quest Project
              </h2>
              <p className="text-muted-foreground">
                This project was developed as part of the Quira Quest
                initiative, aimed at creating innovative AI-powered educational
                tools. The quest challenged us to build something that makes
                learning more interactive and personalized.
              </p>
            </Card>

            {/* Demo & Links */}
            <Card className="p-6 paper-effect">
              <h2 className="text-2xl font-semibold mb-4">Demo & Resources</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="gap-2" asChild>
                  <Link
                    href={DEMO_VIDEO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Youtube className="h-4 w-4" /> Watch Demo
                  </Link>
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                  <Link
                    href="https://github.com/PriyanshuPz/kbnet"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" /> View on GitHub
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Maintainer */}
            <Card className="p-6 paper-effect">
              <h2 className="text-2xl font-semibold mb-4">Maintainer</h2>
              <div className="flex items-center gap-4">
                <img
                  src="https://github.com/PriyanshuPz.png"
                  alt="Priyanshu Verma"
                  className="h-16 w-16 rounded-full border-2 border-border"
                />
                <div>
                  <h3 className="text-lg font-medium">Priyanshu Verma</h3>
                  <p className="text-muted-foreground">
                    Project Creator & Maintainer
                  </p>
                  <div className="flex gap-4 mt-2">
                    <Link
                      href="https://github.com/PriyanshuPz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      GitHub
                    </Link>
                    <Link
                      href="https://x.com/PriyanshuPz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      X (formerly Twitter)
                    </Link>
                    <Link
                      href="https://peerlist.io/priyanshu_verma"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Peerlist
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
