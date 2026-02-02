import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileSpreadsheet, AlertCircle, Save, Loader2 } from "lucide-react";
import { processExcelFile, type ProcessedProjectData } from "@/lib/excel";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";

export const NewProject = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [projectName, setProjectName] = useState("");
    const [data, setData] = useState<ProcessedProjectData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setError("");

            // Auto-suggest project name from filename
            if (!projectName) {
                setProjectName(selectedFile.name.replace(".xlsx", "").replace(".xls", ""));
            }

            try {
                setLoading(true);
                const processed = await processExcelFile(selectedFile);
                setData(processed);
            } catch (err) {
                console.error(err);
                setError("Erro ao processar arquivo. Verifique se é uma planilha válida.");
                setData(null);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!data || !projectName || !user) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "projects"), {
                name: projectName,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
                totalFailures: data.totalFailures,
                sheets: data.sheets, // Saving the full JSON structure
                // If data is too large (>1MB), we would need to sub-collect it, but starting simple as per plan.
            });
            navigate("/projects");
        } catch (err) {
            console.error("Error saving project:", err);
            setError("Erro ao salvar no banco de dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Novo Projeto</h1>
                <p className="text-blue-200">Importe uma planilha de defeitos para gerar o dashboard.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-100">Nome do Projeto</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Relatório Jan/2026"
                        />
                    </div>

                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors relative">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-blue-600/20 rounded-full text-blue-400 mb-2">
                                <Upload size={32} />
                            </div>
                            <p className="font-medium text-white">Clique ou arraste sua planilha aqui</p>
                            <p className="text-sm text-blue-300/50">Suporta .xlsx e .xls</p>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-300 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Preview Section */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileSpreadsheet size={20} className="text-blue-400" />
                        Resumo da Importação
                    </h3>

                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-600/20 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-white">{data.totalFailures}</span>
                                    <span className="text-xs text-blue-200">Total de Falhas</span>
                                </div>
                                <div className="p-4 bg-purple-600/20 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-white">{data.sheets.length}</span>
                                    <span className="text-xs text-blue-200">Abas Processadas</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-medium text-blue-100">Abas Identificadas:</p>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {data.sheets.map((sheet) => (
                                        <div key={sheet.sheetName} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                            <span className="text-sm text-blue-100 truncate flex-1">{sheet.sheetName}</span>
                                            <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-1 rounded ml-2">
                                                {sheet.sheetTotal}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!projectName}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all",
                                    !projectName && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Save size={20} />
                                Salvar Projeto
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-blue-300/40 border-2 border-dashed border-white/5 rounded-lg">
                            <p>Nenhum arquivo processado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
