import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Users, LogOut, Menu, X, BarChart2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        auth.signOut();
        navigate("/login");
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Projetos", path: "/projects", icon: FolderKanban },
        { label: "Equipe", path: "/users", icon: Users },
    ];

    return (
        <div className="flex h-screen bg-[#0b0f19] text-white overflow-hidden font-sans">
            {/* Mobile Toggle */}
            <div className="lg:hidden absolute top-4 right-4 z-[60]">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-[#060910] border-r border-[#1e293b] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shadow-2xl",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Brand */}
                <div className="h-24 flex items-center px-6 border-b border-[#1e293b]/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                            <BarChart2 className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">InkyBI</h1>
                            <span className="text-[10px] text-blue-400/80 uppercase tracking-[0.2em] font-bold">Analytics v2.0</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 flex-1 py-8">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative font-medium text-sm",
                                    isActive
                                        ? "bg-blue-600/10 text-blue-400 shadow-none"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon
                                    size={20}
                                    className={cn(
                                        "transition-colors",
                                        isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                                    )}
                                />
                                {item.label}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-500 rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}


                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-[#1e293b]">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                                {user?.name?.substring(0, 2).toUpperCase() || "US"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
                                    {user?.name || "Usuário"}
                                </span>
                                <span className="text-xs text-slate-400 capitalize">
                                    {user?.role === 'admin' ? 'Administrador' : user?.role || 'Visitante'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-red-400 transition-colors p-2"
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#0b0f19]">
                {/* Subtle reduced background elements for cleaner look */}
                <div className="absolute top-[0%] left-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="p-4 md:p-8 relative z-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
