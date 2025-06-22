import { ThemeSwitch } from "@/components/settings/theme-switch";
import { IntegrationsForm } from "@/components/settings/integrations-form";
import AccountSection from "@/components/settings/account-section";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/core/navbar";
import { Footer } from "@/components/core/footer";

export default async function ConfigurationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur">
        <Navbar />
      </div>

      <main className="flex-1 container max-w-3xl mx-auto py-8 px-4 md:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings and preferences.
            </p>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-4">
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
              <span className="text-foreground font-medium">Settings</span>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-6">
          <div className="paper-effect p-6 md:p-8 rounded-lg">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Theme</h2>
              <ThemeSwitch />
            </div>
          </div>

          <div className="paper-effect p-6 md:p-8 rounded-lg">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Integrations</h2>
              <IntegrationsForm />
            </div>
          </div>

          <div className="paper-effect p-6 md:p-8 rounded-lg">
            <AccountSection />
          </div>
        </div>
      </main>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}
