import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Users, LogOut, Table } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        auth.signOut();
        navigate("/login");
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Projetos", path: "/projects", icon: FolderKanban },
        { label: "Usuários", path: "/users", icon: Users },
    ];

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
            {/* Sidebar - Glassmorphism */}
            <aside className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl z-50">
                <div className="h-24 flex items-center px-8 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                            <Table className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">InkyBI</h1>
                            <span className="text-xs text-blue-200/60 uppercase tracking-widest font-semibold">Analytics</span>
                        </div>
                    </div>
                </div>

                <nav className="p-6 space-y-2 flex-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon size={20} className={cn("transition-colors", isActive ? "text-white" : "text-blue-300/50 group-hover:text-blue-200")} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="absolute inset-y-0 left-0 w-1 bg-white/20 rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-red-300/70 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sair do Sistema</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                {/* Background Decorative Blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="p-8 relative z-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
