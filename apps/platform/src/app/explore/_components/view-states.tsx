import Link from "next/link";

export function LoadingView() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading your knowledge exploration...</p>
      </div>
    </div>
  );
}

export function ErrorView({ error }: { error: string }) {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/" className="text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
