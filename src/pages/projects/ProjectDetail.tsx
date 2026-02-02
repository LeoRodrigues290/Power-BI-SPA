import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { ProjectCharts } from "@/components/charts/ProjectCharts";
import { type SheetData } from "@/lib/excel";

interface ProjectDetail {
    id: string;
    name: string;
    totalFailures: number;
    sheets: SheetData[];
    createdAt: any;
}

export const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "projects", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProject({ id: docSnap.id, ...docSnap.data() } as ProjectDetail);
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching project:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <h2 className="text-xl font-bold mb-2">Projeto não encontrado</h2>
                <Link to="/projects" className="text-blue-400 hover:underline">Voltar para listagem</Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link
                    to="/projects"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{project.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-blue-200/60">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            Criado em: {project.createdAt?.toDate().toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur-md rounded-xl p-6 border border-red-500/20 shadow-lg">
                    <h3 className="text-red-200 text-sm font-medium uppercase tracking-wider">Total de Falhas</h3>
                    <p className="text-4xl font-bold text-white mt-1">{project.totalFailures}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/20 shadow-lg">
                    <h3 className="text-blue-200 text-sm font-medium uppercase tracking-wider">Abas Analisadas</h3>
                    <p className="text-4xl font-bold text-white mt-1">{project.sheets.length}</p>
                </div>
            </div>

            <div className="border-t border-white/10 pt-8">
                <ProjectCharts data={project.sheets} />
            </div>
        </div>
    );
};
