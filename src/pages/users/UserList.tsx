import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, firebaseConfig } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Loader2, Shield, User, X, UserPlus, Lock, Mail, FolderKanban, Check, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useDataStore } from "@/store/useDataStore";

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
    const { projects, fetchProjects } = useDataStore();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    // Create User State
    const [isCreating, setIsCreating] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'analyst' as 'admin' | 'manager' | 'analyst'
    });

    useEffect(() => {
        fetchUsers();
        fetchProjects(); // Ensure we have projects for the dropdown
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

    const handleEditClick = (user: UserProfile) => {
        setEditingUser({ ...user, allowedProjects: user.allowedProjects || [] });
        setIsEditing(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setSaveLoading(true);
        try {
            const userRef = doc(db, "users", editingUser.id);
            await updateDoc(userRef, {
                name: editingUser.name,
                role: editingUser.role,
                accessAll: editingUser.accessAll,
                allowedProjects: editingUser.allowedProjects || []
            });

            setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
            setIsEditing(false);
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Erro ao atualizar usuário");
        } finally {
            setSaveLoading(false);
        }
    };

    const toggleProjectAccess = (projectId: string) => {
        if (!editingUser) return;
        const current = editingUser.allowedProjects || [];
        const updated = current.includes(projectId)
            ? current.filter(id => id !== projectId)
            : [...current, projectId];

        setEditingUser({ ...editingUser, allowedProjects: updated });
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);

        try {
            const secondaryApp = initializeApp(firebaseConfig, "Secondary");
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);
            const uid = userCredential.user.uid;

            const newUserData: UserProfile = {
                id: uid,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                accessAll: false,
                allowedProjects: []
            };

            await setDoc(doc(db, "users", uid), {
                ...newUserData,
                createdAt: new Date()
            });

            await signOut(secondaryAuth);

            setUsers([...users, newUserData]);
            setIsCreating(false);
            setNewUser({ name: '', email: '', password: '', role: 'analyst' });
            alert("Usuário criado com sucesso!");

        } catch (error: any) {
            console.error("Error creating user:", error);
            if (error.code === 'auth/email-already-in-use') {
                alert("Este email já está em uso.");
            } else {
                alert("Erro ao criar usuário: " + error.message);
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita e o usuário perderá o acesso imediatamente.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Erro ao excluir usuário.");
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
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                    <UserPlus size={18} />
                    <span>Novo Usuário</span>
                </button>
            </div>

            {/* Create User Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">Adicionar Novo Usuário</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="text" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: João Silva" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="joao@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="password" required minLength={6} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="******" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Função</label>
                                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as any })} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                    <option value="analyst">Analista</option>
                                    <option value="manager">Gerente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <button type="submit" disabled={createLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-600/20 mt-4 flex items-center justify-center gap-2">
                                {createLoading ? <Loader2 className="animate-spin" size={20} /> : "Criar Usuário"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditing && editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl shadow-2xl max-w-lg w-full mx-4 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">Editar Usuário</h3>
                        <form onSubmit={handleSaveEdit} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="text" required value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email (Somente Leitura)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="email" value={editingUser.email} disabled className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Função</label>
                                <select
                                    value={editingUser.role}
                                    onChange={e => {
                                        const role = e.target.value as any;
                                        setEditingUser({
                                            ...editingUser,
                                            role,
                                            accessAll: role === 'admin' ? true : editingUser.accessAll
                                        });
                                    }}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="analyst">Analista</option>
                                    <option value="manager">Gerente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-white flex items-center gap-2">
                                        <FolderKanban size={16} className="text-blue-400" />
                                        Acesso aos Projetos
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-blue-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingUser.accessAll || editingUser.role === 'admin'}
                                            disabled={editingUser.role === 'admin'}
                                            onChange={e => setEditingUser({ ...editingUser, accessAll: e.target.checked })}
                                            className={cn(
                                                "w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-blue-500",
                                                editingUser.role === 'admin' ? "opacity-50 cursor-not-allowed text-blue-400" : "text-blue-600"
                                            )}
                                        />
                                        Acesso Total (Admin)
                                    </label>
                                </div>

                                {!editingUser.accessAll && (
                                    <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                                        {projects.length === 0 ? (
                                            <p className="text-sm text-slate-500 text-center py-2">Nenhum projeto encontrado.</p>
                                        ) : (
                                            projects.map(project => (
                                                <label key={project.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                        editingUser.allowedProjects?.includes(project.id)
                                                            ? "bg-blue-600 border-blue-600 text-white"
                                                            : "border-slate-600 bg-slate-800"
                                                    )}>
                                                        {editingUser.allowedProjects?.includes(project.id) && <Check size={14} />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={editingUser.allowedProjects?.includes(project.id) || false}
                                                        onChange={() => toggleProjectAccess(project.id)}
                                                    />
                                                    <span className="text-sm text-slate-300 truncate">{project.name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={saveLoading} className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition shadow-lg shadow-green-600/20 mt-4 flex items-center justify-center gap-2">
                                {saveLoading ? <Loader2 className="animate-spin" size={20} /> : "Salvar Alterações"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* User List Table */}
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
                                    <th className="p-6 font-medium">Acesso</th>
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
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium border",
                                                user.role === 'admin' ? "bg-purple-500/20 text-purple-300 border-purple-500/20" :
                                                    user.role === 'manager' ? "bg-blue-500/20 text-blue-300 border-blue-500/20" :
                                                        "bg-gray-500/20 text-gray-300 border-gray-500/20"
                                            )}>
                                                {user.role === 'admin' ? 'Administrador' :
                                                    user.role === 'manager' ? 'Gerente' : 'Analista'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            {user.role === 'admin' || user.accessAll ? (
                                                <span className="text-green-400 text-sm flex items-center gap-1">
                                                    <Shield size={14} /> Total
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">
                                                    {user.allowedProjects?.length || 0} Projetos
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="text-blue-300 hover:text-white font-medium text-sm hover:underline"
                                                >
                                                    Editar
                                                </button>
                                                {currentUser?.uid !== user.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20 transition ml-2"
                                                        title="Excluir Usuário"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
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
