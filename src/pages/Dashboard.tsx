import { useEffect } from "react";
import { Users, FolderKanban, Loader2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useDataStore } from "@/store/useDataStore";

export const Dashboard = () => {
    const { user } = useAuthStore();
    const { stats, fetchStats, loading } = useDataStore();

    useEffect(() => {
        fetchStats();
    }, []);

    const { totalProjects, totalFailures, usersCount } = stats;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h1>
                <p className="text-blue-200/60 mt-1">Bem-vindo ao InkyBI, {user?.name}.</p>
            </div>

            {loading && totalProjects === 0 ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* KPI Cards */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FolderKanban size={100} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-blue-200/70 text-sm font-medium">Projetos Ativos</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{totalProjects}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-blue-300/50">
                            <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">+12%</span>
                            vs. mês passado
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertTriangle size={100} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-blue-200/70 text-sm font-medium">Falhas Identificadas</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{totalFailures}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-blue-300/50">
                            <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">+5%</span>
                            vs. mês passado
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={100} className="text-purple-500 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-blue-200/70 text-sm font-medium">Usuários Totais</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{usersCount}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-blue-300/50">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Sistema online
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
