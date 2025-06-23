import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ExternalLink, ScrollText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Guidelines for using KBNet
          </p>
        </div>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-muted-foreground mb-4">
            Welcome to KBNet, an AI-powered knowledge exploration platform
            developed for the Quira Quest hackathon. By accessing or using our
            service, you agree to be bound by these Terms of Service.
          </p>
          <p className="text-muted-foreground">
            KBNet is a project built as part of the Quira Quest hackathon hosted
            at{" "}
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
            's AI technology.
          </p>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" />
            Service Description
          </h2>
          <p className="text-muted-foreground mb-4">
            KBNet provides an intelligent knowledge exploration platform that:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Creates connections between knowledge resources</li>
            <li>Provides personalized learning path recommendations</li>
            <li>Leverages AI to enhance your educational experience</li>
            <li>Facilitates discovery of related learning materials</li>
          </ul>
          <p className="text-muted-foreground">
            While we strive to provide accurate and helpful information, KBNet
            is an experimental project and may have limitations.
          </p>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
          <p className="text-muted-foreground mb-4">
            As a KBNet user, you agree to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Provide accurate information when creating an account</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Use the service for legitimate educational purposes</li>
            <li>Respect intellectual property rights of content creators</li>
            <li>Avoid attempting to misuse or exploit the platform</li>
          </ul>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            KBNet, including its design, functionality, and content created by
            our team, is protected by copyright and other intellectual property
            laws. Third-party content accessible through KBNet remains the
            property of its respective owners.
          </p>
          <p className="text-muted-foreground">
            You may use KBNet for personal, non-commercial educational purposes
            but may not reproduce, distribute, or create derivative works from
            our platform without explicit permission.
          </p>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">
            Limitation of Liability
          </h2>
          <p className="text-muted-foreground mb-4">
            KBNet is provided "as is" without warranties of any kind. We are not
            responsible for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Accuracy or completeness of any information provided</li>
            <li>Interruptions or errors in the service</li>
            <li>Actions taken based on recommendations from our platform</li>
            <li>User-generated content or third-party linked resources</li>
          </ul>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">Modifications</h2>
          <p className="text-muted-foreground mb-4">
            We reserve the right to modify these Terms of Service at any time.
            Continued use of KBNet following any changes constitutes acceptance
            of those changes.
          </p>
          <p className="text-muted-foreground">
            For significant changes, we will make reasonable efforts to notify
            users through our platform or via email.
          </p>
        </Card>

        <Card className="p-6 paper-effect">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-muted-foreground mb-4">
            If you have questions about these Terms of Service, please contact:
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
