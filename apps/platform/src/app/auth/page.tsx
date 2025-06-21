"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, GithubIcon, Loader2, UserIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { DISABLE_ANONYMOUS_AUTH } from "@/lib/utils";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/pad",
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    if (DISABLE_ANONYMOUS_AUTH) {
      console.warn("Anonymous authentication is disabled.");
      return;
    }
    setIsLoading(true);
    try {
      await authClient.signIn.anonymous();
      router.push("/pad");
    } catch (error) {
      console.error("Anonymous sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute top-6 left-6">
        <Button variant="ghost" size="sm" asChild className="paper-effect">
          <Link href="/" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md paper-effect">
        <CardHeader className="space-y-2 text-center p-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome to KbNet
          </CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pb-6">
          <Button
            variant="outline"
            className="w-full relative py-6 flex gap-3 paper-effect"
            onClick={handleGitHubSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <GithubIcon className="h-5 w-5" />
            )}
            <span>Continue with GitHub</span>
          </Button>

          {!DISABLE_ANONYMOUS_AUTH && (
            <Button
              variant="outline"
              className="w-full relative py-6 flex gap-3 paper-effect"
              onClick={handleAnonymousSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
              <span>Continue as Guest</span>
            </Button>
          )}
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground px-6 pb-6">
          <span>
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-primary hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
