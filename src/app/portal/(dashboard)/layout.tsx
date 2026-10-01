import Header from "@/components/portal/header";
import Protected from "@/components/portal/protected";
import Sidebar from "@/components/portal/sidebar";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen w-full flex-col'>
      <Protected>
        <Header />

        <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-60'>
          <Sidebar />
          <main className='flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
            {children}
          </main>
        </div>
      </Protected>
    </div>
  );
}
