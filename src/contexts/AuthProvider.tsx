import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { setUser, setLoading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                try {
                    // Fetch additional user data from Firestore
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            name: userData.name || currentUser.displayName || "Usuário",
                            role: userData.role || "analyst", // Default to analyst
                            accessAll: userData.accessAll || false,
                            allowedProjects: userData.allowedProjects || [],
                        });
                    } else {
                        // User exists in Auth but not in Firestore (e.g. freshly created manually?)
                        // We can set a default pending state or just basic info
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            name: currentUser.displayName,
                            role: "analyst",
                            accessAll: false,
                            allowedProjects: [],
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setLoading]);

    return <>{children}</>;
};
