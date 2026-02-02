import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Calendar, BarChart3, ChevronRight, Loader2, Trash2, X, AlertTriangle } from "lucide-react";
import { useDataStore } from "@/store/useDataStore";
import { useAuthStore } from "@/store/useAuthStore";


export const ProjectList = () => {
    const { projects, loading, fetchProjects, deleteProject } = useDataStore();
    const { user } = useAuthStore();

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteName, setDeleteName] = useState("");
    const [deleteFailures, setDeleteFailures] = useState<number>(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const confirmDelete = (e: React.MouseEvent, project: any) => {
        e.preventDefault();
        setDeleteId(project.id);
        setDeleteName(project.name);
        setDeleteFailures(project.totalFailures);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteProject(deleteId, deleteFailures);
            setDeleteId(null);
        } catch (error) {
            alert("Erro ao excluir");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Delete Modal Overlay */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setDeleteId(null)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="text-red-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Excluir Projeto?</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Você está prestes a excluir <b>"{deleteName}"</b>. Essa ação é irreversível e removerá todos os dados processados.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
                                    disabled={isDeleting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition flex items-center justify-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Sim, Excluir"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
            <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
                {loading && projects.length === 0 ? (
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
                    <div className="divide-y divide-[#1e293b]">
                        {projects.map((project) => (
                            <Link
                                to={`/projects/${project.id}`}
                                key={project.id}
                                className="group flex flex-col md:flex-row items-center justify-between p-6 hover:bg-[#1e293b]/30 transition duration-200 cursor-pointer text-decoration-none"
                            >
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <BarChart3 className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                <Calendar size={14} />
                                                {(() => {
                                                    const d = project.createdAt as any;
                                                    if (!d) return "";
                                                    if (d.seconds) return new Date(d.seconds * 1000).toLocaleDateString("pt-BR");
                                                    return new Date(d).toLocaleDateString("pt-BR");
                                                })()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                {project.totalFailures} Falhas
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={(e) => confirmDelete(e, project)}
                                            className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-full transition"
                                            title="Excluir Projeto"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                    <div className="px-3 py-1 bg-[#1e293b] rounded-full text-xs font-medium text-slate-300 border border-slate-700">
                                        Processado
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover:text-slate-300 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            <div className="flex justify-end text-sm text-slate-500">
                Mostrando {projects.length} resultados
            </div>
        </div>
    );
};
