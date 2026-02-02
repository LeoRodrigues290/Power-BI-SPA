import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Calendar, BarChart3, ChevronRight, Loader2 } from "lucide-react";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Project {
    id: string;
    name: string;
    createdAt: Timestamp;
    totalFailures: number;
}

export const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Basic query: order by creation date desc, limit 10
                const q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(10));
                const querySnapshot = await getDocs(q);

                const projectData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Project[];

                setProjects(projectData);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Projetos</h1>
                    <p className="text-blue-200/60 mt-1">Gerencie e visualize suas importações de dados.</p>
                </div>
                <Link
                    to="/projects/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span>Novo Projeto</span>
                </Link>
            </div>

            {/* Filters (Visual only for now) */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar projeto..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="bg-white/5 p-4 rounded-full mb-4">
                            <BarChart3 size={32} className="text-blue-400/50" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhum projeto encontrado</h3>
                        <p className="text-blue-200/60 max-w-sm mb-6">
                            Comece importando uma planilha de defeitos para gerar visualizações.
                        </p>
                        <Link
                            to="/projects/new"
                            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                        >
                            Criar meu primeiro projeto
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {projects.map((project) => (
                            <Link
                                to={`/projects/${project.id}`}
                                key={project.id}
                                className="group flex flex-col md:flex-row items-center justify-between p-6 hover:bg-white/5 transition duration-200 cursor-pointer text-decoration-none"
                            >
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <BarChart3 className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-blue-200/50">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {project.createdAt?.toDate().toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                {project.totalFailures} Falhas
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-xs font-medium text-blue-200/70">
                                        Processado
                                    </div>
                                    <ChevronRight className="text-white/20 group-hover:text-white/60 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Footer (Static for now) */}
            <div className="flex justify-end text-sm text-blue-200/40">
                Mostrando {projects.length} resultados
            </div>
        </div>
    );
};
