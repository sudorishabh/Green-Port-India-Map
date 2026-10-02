import Header from "@/components/portal/header";
import Protected from "@/components/portal/protected";
import Sidebar from "@/components/portal/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <div className='min-h-dvh'>
        <Header />
        <div className='lg:flex lg:min-h-[calc(100dvh-3.5rem)]'>
          <Sidebar />
          {/* min-w-0 lets wide tables scroll inside the page, not widen it. */}
          <main className='min-w-0 flex-1 p-4 sm:p-6 lg:p-8'>{children}</main>
        </div>
      </div>
    </Protected>
  );
}
