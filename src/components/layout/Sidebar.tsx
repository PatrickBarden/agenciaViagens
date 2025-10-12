import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  FolderKanban, 
  UserCog, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Leads", icon: Users, path: "/leads" },
  { title: "Propostas", icon: FileText, path: "/propostas" },
  { title: "Financeiro", icon: DollarSign, path: "/financeiro" },
  { title: "Projetos", icon: FolderKanban, path: "/projetos" },
  { title: "Usuários", icon: UserCog, path: "/usuarios" },
  { title: "Configurações", icon: Settings, path: "/configuracoes" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border animate-slide-in">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">Barden</h1>
              <p className="text-xs text-muted-foreground">CRM System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-primary"
                      : "text-sidebar-foreground"
                  )
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground text-center">
            © 2025 Barden Desenvolvimento
          </div>
        </div>
      </div>
    </aside>
  );
};
