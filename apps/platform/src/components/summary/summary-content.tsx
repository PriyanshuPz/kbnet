"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarkdownText } from "@/components/map/mark";
import { useState } from "react";
import { MapSummary } from "@kbnet/db";
import { Progress } from "../ui/progress";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface SummaryContentProps {
  mapId: string;
  initialData: MapSummary | null;
}

const demo = `Okay, I have the data for the user's learning journey along the path ~~branch-oy5lr0kpnor2sqq18tpjqofq~~. Now I can write the journal-style narrative.

Here's the narrative:

"Today, I embarked on a fascinating journey, starting with the very building blocks of everything around us: **Atom**. It's incredible to think that everything is made of these tiny LEGO-like bricks!

Driven by curiosity, I decided to delve **UP** into **Atom Interactions**. It's amazing how these tiny particles don't just sit still; they bump, bounce, and even stick together to form molecules. I wondered what happens when these interactions go beyond simple connections.

Veering **LEFT**, I stumbled upon **Nuclear Reactions**. This was a whole new level! Instead of just bumping or sticking, the very core of atoms can change, releasing immense energy. It's mind-blowing to think about the power contained within these tiny structures.

Intrigued, I went **UP** to **Beyond Similarity: Tracing the Evolution of Ideas**. This felt like stepping into a vast library of interconnected thoughts. It's not just about finding similar topics, but about tracing how ideas evolve and influence different fields.

Continuing **UP**, I explored **Emergence: A Cross-Disciplinary Journey**. This concept, where complex systems exhibit properties that their individual components don't, took me through philosophy, biology, computer science, and even the social sciences. It's amazing how one idea can manifest in so many different ways.

My journey continued **UP** to **The US in Space: Navigating Leadership, Collaboration, and a New Paradigm**. This was a shift from the abstract to the practical, examining the US's role in space exploration and the balance between leadership and collaboration.

Driven by this, I went **UP** to **Artemis Unveiled: The US Balancing Act Between Leadership and Collaboration**. This exploration of NASA's Artemis program highlighted the complexities of international partnerships and the growing influence of private space companies.

I then went **UP** to **The Adaptive Learning Journey: A Personalized Path to Mastery**. This was a fascinating look at how learning can be tailored to individual needs, like a GPS for the brain constantly recalibrating the route to mastery.

Finally, I went **UP** to **Decoding the Algorithms: The Engine of Adaptive Learning**. This was a deep dive into the algorithms that power adaptive learning, understanding how they analyze learner behavior and personalize the learning experience.

What a journey! From the fundamental building blocks of matter to the cutting edge of adaptive learning, I've uncovered layers of knowledge I hadn't anticipated. It's amazing how one topic can lead to another, unfolding a rich tapestry of interconnected ideas."`;

export function MapSummaryContent({ mapId, initialData }: SummaryContentProps) {
  const [summaryData, setSummaryData] = useState(initialData);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/maps/${mapId}/summary/generate`, {
        method: "POST",
      });
      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusDisplay = () => {
    switch (summaryData?.status) {
      case "QUEUED":
        return { color: "bg-yellow-500", text: "Queued" };
      case "PENDING":
        return { color: "bg-blue-500", text: "Pending" };
      case "IN_PROGRESS":
        return { color: "bg-purple-500", text: "In Progress" };
      case "COMPLETED":
        return { color: "bg-green-500", text: "Completed" };
      case "FAILED":
        return { color: "bg-red-500", text: "Failed" };
      default:
        return { color: "bg-gray-500", text: "Not Started" };
    }
  };

  const status = getStatusDisplay();
  const isInProgress = ["QUEUED", "IN_PROGRESS"].includes(
    summaryData?.status || ""
  );

  return (
    <div className="space-y-6 h-full w-full">
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/pad"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Pad
        </Link>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Pad</span>
          <span>/</span>
          <span>Map</span>
          <span>/</span>
          <span className="text-foreground font-medium">Summary</span>
        </div>
      </div>
      <Card className="p-6 h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Map Summary</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${status.color}`}></div>
              <span className="text-sm font-medium">{status.text}</span>
            </div>
            <Button
              onClick={handleGenerateSummary}
              disabled={isGenerating || isInProgress}
            >
              {isGenerating ? "Generating..." : "Generate Summary"}
            </Button>
          </div>
        </div>

        {isInProgress && (
          <div className="mb-6">
            <Progress value={30} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Generating summary... This might take a few minutes.
            </p>
          </div>
        )}

        {/* <MarkdownText content={summaryData.summary} /> */}
        {!summaryData?.summary ? (
          <div className="space-y-6">
            <MarkdownText content={demo} />
            <div className="text-sm text-muted-foreground">
              <p>
                Requested:{" "}
                {new Date(
                  summaryData?.requestedAt || new Date()
                ).toLocaleString()}
              </p>
              {summaryData?.completedAt && (
                <p>
                  Completed:{" "}
                  {new Date(summaryData.completedAt).toLocaleString()}
                </p>
              )}
              <p>Generated by: {summaryData?.generatedBy.toLowerCase()}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No summary available. Click generate to create one.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
