import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Shield, User, Save, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'analyst';
    accessAll: boolean;
    allowedProjects?: string[];
}

export const UserList = () => {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserProfile[];
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: UserProfile) => {
        setEditingId(user.id);
        setEditForm({
            name: user.name,
            role: user.role,
            accessAll: user.accessAll,
            allowedProjects: user.allowedProjects || []
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async (id: string) => {
        try {
            const userRef = doc(db, "users", id);
            await updateDoc(userRef, {
                name: editForm.name,
                role: editForm.role,
                accessAll: editForm.accessAll,
                allowedProjects: editForm.allowedProjects || []
            });

            // Optimistic update
            setUsers(users.map(u => u.id === id ? { ...u, ...editForm } as UserProfile : u));
            setEditingId(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Erro ao atualizar usuário");
        }
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Shield size={48} className="text-red-400 mb-4" />
                <h1 className="text-2xl font-bold text-white">Acesso Negado</h1>
                <p className="text-blue-200 mt-2">Apenas administradores podem gerenciar usuários.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Usuários</h1>
                    <p className="text-blue-200/60 mt-1">Gerencie permissões e acessos do sistema.</p>
                </div>
            </div>

            {/* User List */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-blue-100/70 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="p-6 font-medium">Usuário</th>
                                    <th className="p-6 font-medium">Email</th>
                                    <th className="p-6 font-medium">Função</th>
                                    <th className="p-6 font-medium">Acesso Total</th>
                                    <th className="p-6 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                                    <User size={20} className="text-blue-400" />
                                                </div>
                                                <span className="font-medium text-white">{user.name || "Sem nome"}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-blue-200">{user.email}</td>
                                        <td className="p-6">
                                            {editingId === user.id ? (
                                                <select
                                                    value={editForm.role}
                                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                                                    className="bg-slate-800 text-white border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="manager">Gerente</option>
                                                    <option value="analyst">Analista</option>
                                                </select>
                                            ) : (
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                                                    user.role === 'admin' ? "bg-purple-500/20 text-purple-300 border-purple-500/20" :
                                                        user.role === 'manager' ? "bg-blue-500/20 text-blue-300 border-blue-500/20" :
                                                            "bg-gray-500/20 text-gray-300 border-gray-500/20"
                                                )}>
                                                    {user.role === 'admin' ? 'Administrador' :
                                                        user.role === 'manager' ? 'Gerente' : 'Analista'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {editingId === user.id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editForm.name || ""}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="bg-slate-800 text-white border border-white/20 rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nome do usuário"
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.accessAll || false}
                                                        onChange={(e) => setEditForm({ ...editForm, accessAll: e.target.checked })}
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                                        id={`access-${user.id}`}
                                                    />
                                                    <label htmlFor={`access-${user.id}`} className="text-sm text-slate-300">Acesso Global</label>

                                                    {!editForm.accessAll && (
                                                        <textarea
                                                            className="w-full bg-slate-800 border border-white/20 rounded p-1 text-xs text-slate-300"
                                                            placeholder="IDs dos projetos (separados por vírgula)"
                                                            value={editForm.allowedProjects?.join(',') || ''}
                                                            onChange={(e) => setEditForm({
                                                                ...editForm,
                                                                allowedProjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                                            })}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={user.accessAll || false}
                                                    disabled
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 opacity-50 cursor-not-allowed"
                                                />
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            {editingId === user.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSave(user.id)}
                                                        className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-blue-300 hover:text-white font-medium text-sm hover:underline"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
