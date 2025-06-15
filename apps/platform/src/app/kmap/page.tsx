import Brand from "@/components/core/brand";
import Link from "next/link";
import KLinearTree from "./_components/ktree";

export default function KTreePage() {
  return (
    <div className="w-full h-screen flex flex-col bg-background text-foreground">
      {/* <div className="flex items-center px-4 h-14 mt-3">
        <Link href="/" className="flex items-center gap-2">
          <Brand />
        </Link>
      </div> */}
      <KLinearTree />
    </div>
  );
}
