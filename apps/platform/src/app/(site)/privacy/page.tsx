import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Database, ExternalLink } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">
            How we handle your data at KBNet
          </p>
        </div>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            KBNet is an AI-powered knowledge exploration platform developed for
            the Quira Quest hackathon. This privacy policy outlines how we
            collect, use, and protect your information when you use our service.
          </p>
          <p className="text-muted-foreground">
            This project is built as part of the Quira Quest hackathon hosted at{" "}
            <Link
              target="_blank"
              href="https://quira.sh"
              className="text-primary hover:underline"
            >
              Quira
            </Link>{" "}
            and powered by{" "}
            <Link
              target="_blank"
              href="https://mindsdb.com"
              className="text-primary hover:underline"
            >
              MindsDB
            </Link>
            .
          </p>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Data Collection
          </h2>
          <p className="text-muted-foreground mb-4">
            We collect minimal personal information necessary to provide you
            with our service. This may include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Basic profile information, such as name and email address</li>
            <li>
              Learning preferences and history to personalize your experience
            </li>
            <li>Usage data to improve our platform</li>
          </ul>
          <p className="text-muted-foreground">
            KBNet leverages MindsDB's powerful AI capabilities to create
            intelligent knowledge connections and provide smart learning path
            recommendations. All data processing follows industry standard
            security practices.
          </p>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
          <p className="text-muted-foreground mb-4">
            Your data helps us provide and improve the KBNet platform:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Personalizing your knowledge exploration experience</li>
            <li>Creating intelligent connections between learning resources</li>
            <li>Improving our AI recommendations and platform functionality</li>
            <li>Understanding user needs and preferences</li>
          </ul>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-muted-foreground mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of certain data processing activities</li>
          </ul>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-muted-foreground mb-4">
            For any questions about this privacy policy or our data practices,
            please contact:
          </p>
          <p className="text-muted-foreground">
            Priyanshu Verma, Project Creator & Maintainer
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="https://github.com/PriyanshuPz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center gap-1"
            >
              GitHub <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="https://peerlist.io/priyanshu_verma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center gap-1"
            >
              Peerlist <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
