import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, checkUserAuthorization, loginConGoogle, logout, db } from '../firebase';
import { doc, setDoc, collection } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    role: 'admin' | 'ambassador' | null;
    status: 'active' | 'inactive' | 'pending' | null;
    name: string | null;
    loading: boolean;
    login: () => Promise<void>;
    logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'ambassador' | null>(null);
    const [status, setStatus] = useState<'active' | 'inactive' | 'pending' | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser && currentUser.email) {
                let authData = await checkUserAuthorization(currentUser.email);
                
                const userEmail = currentUser.email.trim().toLowerCase();
                
                // Root Admin Auto-Setup (Stateless Bypass for owner to avoid Firestore rules issues)
                if (userEmail === 'walyconexion@gmail.com') {
                    setRole('admin');
                    setStatus('active');
                    setName(currentUser.displayName || 'Waly Admin (Root)');
                    setLoading(false);
                    return;
                }

                if (authData) {
                    setRole(authData.role as 'admin' | 'ambassador');
                    setStatus(authData.status as 'active' | 'inactive' | 'pending');
                    setName(authData.name);
                } else {
                    setRole(null);
                    setStatus(null);
                    setName(null);
                }
            } else {
                setRole(null);
                setStatus(null);
                setName(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await loginConGoogle();
        } catch (error: any) {
            console.error("Error details:", error);
            alert("⚠️ Error al ingresar: " + (error.message || "Fallo desconocido. Revisa tu conexión."));
        }
    };

    const logoutUser = async () => {
        await logout();
    };

    return (
        <AuthContext.Provider value={{ user, role, status, name, loading, login, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
