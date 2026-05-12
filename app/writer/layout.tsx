import WriterSidebar from "@/components/WriterSidebar";

export default function WriterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <WriterSidebar />
      <div className="flex-1 bg-bg min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
