"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  ChevronLeft,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  BarChart3,
  Hash,
  Percent,
} from "lucide-react";
import { useState } from "react";

interface EvolutionMap {
  id: string;
  title: string;
  user: string;
}

interface Evolution {
  id: string;
  maps: EvolutionMap[];
  metrics: EvolutionMetric;
}

interface EvolutionContentProps {
  data: Evolution[] | null;
}

export function EvolutionContent({ data }: EvolutionContentProps) {
  const [selectedEvolution, setSelectedEvolution] = useState<string | null>(
    null
  );

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center space-x-4 mb-8">
            <Link
              href="/pad"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Pad
            </Link>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Pad</span>
              <span>/</span>
              <span className="text-foreground">Evolution</span>
            </div>
          </div>

          <Card className="paper-effect bg-card border-2 border-border">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground mb-4">
                <BarChart3 className="h-16 w-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">
                Error Loading Evolution Data
              </h2>
              <p className="text-muted-foreground">
                Unable to fetch evolution data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center space-x-4 mb-8">
            <Link
              href="/pad"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Pad
            </Link>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Pad</span>
              <span>/</span>
              <span className="text-foreground">Evolution</span>
            </div>
          </div>

          <Card className="paper-effect bg-card border-2 border-border">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground mb-4">
                <TrendingUp className="h-16 w-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">
                No Evolution Data Available
              </h2>
              <p className="text-muted-foreground mb-6">
                Start creating maps and evaluations to see evolution data here.
              </p>
              <Button asChild className="paper-effect">
                <Link href="/pad">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatPercentage = (value?: number) =>
    value !== undefined ? `${(value * 100).toFixed(1)}%` : "N/A";
  const formatTime = (value?: number) =>
    value !== undefined ? `${value.toFixed(2)}ms` : "N/A";
  const formatScore = (value?: number) =>
    value !== undefined ? value.toFixed(3) : "N/A";

  // Safe calculations with fallbacks
  const avgRelevancy =
    data.length > 0
      ? data.reduce((acc, evo) => acc + (evo.metrics.avg_relevancy || 0), 0) /
        data.length
      : 0;
  const avgQueryTime =
    data.length > 0
      ? data.reduce((acc, evo) => acc + (evo.metrics.avg_query_time || 0), 0) /
        data.length
      : 0;

  // Helper function to format K metrics
  const formatKMetrics = (metrics: number[] | undefined, label: string) => {
    if (!metrics || !Array.isArray(metrics)) return null;

    return metrics.map((value, index) => ({
      k: index + 1,
      value: value,
      label: `${label}@${index + 1}`,
      percentage: formatPercentage(value),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/pad"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Pad
          </Link>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Pad</span>
            <span>/</span>
            <span className="text-foreground">Evolution</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-2">
          <Card className="paper-effect bg-card border-2 border-border md:rounded-b-none">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center m-4">
                <div className="bg-primary p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Evolution Analytics
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Track and analyze the performance evolution of your knowledge
                maps
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
          <Card className="paper-effect bg-card border-2 border-border md:rounded-t-none md:rounded-r-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {data.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Evolutions
              </div>
            </CardContent>
          </Card>
          <Card className="paper-effect bg-card border-2 border-border md:rounded-t-none md:rounded-b-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {data.reduce((acc, evo) => acc + evo.maps.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Maps Analyzed</div>
            </CardContent>
          </Card>
          <Card className="paper-effect bg-card border-2 border-border md:rounded-t-none md:rounded-b-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {formatPercentage(avgRelevancy)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Relevancy</div>
            </CardContent>
          </Card>
          <Card className="paper-effect bg-card border-2 border-border md:rounded-t-none md:rounded-l-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {formatTime(avgQueryTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Query Time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evolution Cards */}
        <div className="space-y-3">
          {data.map((evolution) => {
            const hitAtK = formatKMetrics(evolution.metrics.hit_at_k, "Hit");
            const precisionAtK = formatKMetrics(
              evolution.metrics.bin_precision_at_k,
              "Precision"
            );

            return (
              <Card
                key={evolution.id}
                className="paper-effect bg-card border-2 border-border hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="border-b border-border mt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <BarChart3 className="h-5 w-5" />
                      Evolution {evolution.metrics.id}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Maps Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                      <Users className="h-4 w-4" />
                      Associated Maps ({evolution.maps.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {evolution.maps.map((map) => (
                        <Card
                          key={map.id}
                          className="bg-muted border border-border"
                        >
                          <CardContent className="p-3">
                            <div
                              className="font-medium text-sm truncate text-foreground"
                              title={map.title}
                            >
                              {map.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              by {map.user}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-muted p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Relevancy
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatPercentage(evolution.metrics.avg_relevancy)}
                      </div>
                      {evolution.metrics.avg_relevancy && (
                        <Progress
                          value={evolution.metrics.avg_relevancy * 100}
                          className="mt-2 h-2"
                        />
                      )}
                    </div>

                    <div className="bg-muted p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Mean MRR
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatScore(evolution.metrics.mean_mrr)}
                      </div>
                      {evolution.metrics.mean_mrr && (
                        <Progress
                          value={evolution.metrics.mean_mrr * 100}
                          className="mt-2 h-2"
                        />
                      )}
                    </div>

                    <div className="bg-muted p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          NDCG
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatScore(evolution.metrics.avg_ndcg)}
                      </div>
                      {evolution.metrics.avg_ndcg && (
                        <Progress
                          value={evolution.metrics.avg_ndcg * 100}
                          className="mt-2 h-2"
                        />
                      )}
                    </div>

                    <div className="bg-muted p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Query Time
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatTime(evolution.metrics.avg_query_time)}
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Avg Entropy
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {formatScore(evolution.metrics.avg_entropy)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        First Relevant Position
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {evolution.metrics.avg_first_relevant_position?.toFixed(
                          1
                        ) || "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Created
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {new Date(
                          evolution.metrics.created_at
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Expandable detailed metrics */}
                  {selectedEvolution === evolution.id && (
                    <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                      <h5 className="font-semibold mb-3 text-foreground">
                        Complete Metrics
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {hitAtK && (
                          <div>
                            <strong className="text-foreground">
                              Complete Hit@K:
                            </strong>
                            <div className="mt-2 space-y-1">
                              {hitAtK.map((metric) => (
                                <div
                                  key={metric.k}
                                  className="flex justify-between"
                                >
                                  <span className="text-muted-foreground">
                                    Hit@{metric.k}:
                                  </span>
                                  <span className="text-foreground">
                                    {metric.percentage}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {precisionAtK && (
                          <div>
                            <strong className="text-foreground">
                              Complete Precision@K:
                            </strong>
                            <div className="mt-2 space-y-1">
                              {precisionAtK.map((metric) => (
                                <div
                                  key={metric.k}
                                  className="flex justify-between"
                                >
                                  <span className="text-muted-foreground">
                                    Precision@{metric.k}:
                                  </span>
                                  <span className="text-foreground">
                                    {metric.percentage}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSelectedEvolution(
                          selectedEvolution === evolution.id
                            ? null
                            : evolution.id
                        )
                      }
                      className="border-2 border-border hover:bg-muted paper-effect"
                    >
                      {selectedEvolution === evolution.id
                        ? "Hide Complete Metrics"
                        : "Show Complete Metrics"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
