import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-background">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
};
