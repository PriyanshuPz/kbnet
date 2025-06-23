"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  mindsdb: z.boolean(),
  googleAI: z.boolean(),
  apiKey: z.string().optional(),
});

export function IntegrationsForm() {
  const [isLoading, setIsLoading] = useState(false);

  const [showApiKey, setShowApiKey] = useState(false);
  const { data, refetch } = authClient.useSession();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mindsdb: true,
      googleAI: false,
      apiKey: "",
    },
  });

  // Update form values when session data is available
  useEffect(() => {
    if (data?.user.settings) {
      form.reset({
        mindsdb: data.user.settings.useMindsDB,
        googleAI: data.user.settings.useBYOK,
        apiKey: "",
      });
      setShowApiKey(data.user.settings.useBYOK);
    }
  }, [data, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mindsdb: values.mindsdb,
          googleAI: values.googleAI,
          apiKey: values.apiKey || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }

      refetch(); // Refresh session data
      toast("Settings updated successfully");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to update settings"
      );
    } finally {
      setIsLoading(false);
      form.reset({ ...values, apiKey: "" }); // Clear API key after submission
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="mindsdb"
            render={({ field }) => (
              <FormItem className="paper-effect p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>MindsDB Integration</FormLabel>
                    <FormDescription className="flex flex-col">
                      <span>Enable/disable MindsDB integration.</span>
                      <span>
                        <span className="text-amber-600 font-medium">
                          Note:
                        </span>{" "}
                        Disabling this will restrict certain advanced features
                        and may affect background jobs that depend on your
                        MindsDB setup.
                      </span>
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="googleAI"
            render={({ field }) => (
              <FormItem className="paper-effect p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Google AI API</FormLabel>
                    <FormDescription className="flex flex-col">
                      <span>
                        Use your own Google AI API key for node generation and
                        other AI features.
                      </span>
                      <span>
                        <span className="text-amber-600 font-medium">
                          Note:
                        </span>{" "}
                        MindsDB operations will continue using the system's API
                        key regardless of this setting.
                      </span>
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setShowApiKey(checked);
                      }}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          {showApiKey && (
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem className="paper-effect p-4">
                  <FormLabel>
                    {data?.user.settings.googleAIEnabled
                      ? "Edit API Key"
                      : "Add API Key"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        data?.user.settings.googleAIEnabled
                          ? "Enter new API key to update"
                          : "Enter your Google AI API key"
                      }
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>

        <Button disabled={isLoading} type="submit" className="paper-effect">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
