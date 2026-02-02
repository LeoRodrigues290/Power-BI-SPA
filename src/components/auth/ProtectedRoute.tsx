
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = () => {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0b0f19]">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
