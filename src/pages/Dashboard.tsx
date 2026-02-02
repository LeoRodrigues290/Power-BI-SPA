import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart3, Users, FolderKanban, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const Dashboard = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalFailures: 0,
        activeUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Projects Stats
                const projectsSnapshot = await getDocs(collection(db, "projects"));
                const totalProjects = projectsSnapshot.size;

                let failures = 0;
                projectsSnapshot.forEach(doc => {
                    failures += doc.data().totalFailures || 0;
                });

                // Mock Users count for now (since reading users collection needs admin privilege ideally)
                // But we can try to read if rules allow. Based on our rules, only admin can read list.
                // So we will just show a static number or "N/A" if not admin, or try fetch.
                // specific validation:
                let userCount = 0;
                if (user?.role === 'admin') {
                    const usersSnapshot = await getDocs(collection(db, "users"));
                    userCount = usersSnapshot.size;
                } else {
                    userCount = 5; // Hardcoded limit mentioned in briefing as placeholder
                }

                setStats({
                    totalProjects,
                    totalFailures: failures,
                    activeUsers: userCount
                });

            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h1>
                <p className="text-blue-200/60 mt-1">Bem-vindo ao InkyBI, {user?.name}.</p>
            </div>

            {loading ? (
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
                            <h3 className="text-4xl font-bold text-white mt-2">{stats.totalProjects}</h3>
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
                            <h3 className="text-4xl font-bold text-white mt-2">{stats.totalFailures}</h3>
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
                            <h3 className="text-4xl font-bold text-white mt-2">{stats.activeUsers}</h3>
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
