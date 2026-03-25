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
    const bypass = localStorage.getItem('shopdigital_admin_bypass') === 'true';
    const [user, setUser] = useState<User | null>(bypass ? { email: 'walyconexion@gmail.com', uid: 'root-bypass' } as unknown as User : null);
    const [role, setRole] = useState<'admin' | 'ambassador' | null>(bypass ? 'admin' : null);
    const [status, setStatus] = useState<'active' | 'inactive' | 'pending' | null>(bypass ? 'active' : null);
    const [name, setName] = useState<string | null>(bypass ? 'Waly Admin (Root)' : null);
    const [loading, setLoading] = useState(!bypass);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Root Admin LocalStorage Bypass (no requiere login de Google)
            if (localStorage.getItem('shopdigital_admin_bypass') === 'true') {
                setUser({ email: 'walyconexion@gmail.com', uid: 'root-bypass' } as unknown as User);
                setRole('admin');
                setStatus('active');
                setName('Waly Admin (Root)');
                setLoading(false);
                return;
            }

            setUser(currentUser);
            if (currentUser && currentUser.email) {
                let authData = await checkUserAuthorization(currentUser.email);
                
                // Root Admin Auto-Setup (Stateless Bypass for owner to avoid Firestore rules issues)
                if (currentUser.email === 'walyconexion@gmail.com') {
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
        await loginConGoogle();
    };

    const logoutUser = async () => {
        localStorage.removeItem('shopdigital_admin_bypass');
        await logout();
    };

    return (
        <AuthContext.Provider value={{ user, role, status, name, loading, login, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
