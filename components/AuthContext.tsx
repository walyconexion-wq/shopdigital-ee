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
                
                // Root Admin Auto-Setup (Bypass for owner)
                if (!authData && currentUser.email === 'walyconexion@gmail.com') {
                    const newAdminRef = doc(collection(db, 'autorizados'));
                    await setDoc(newAdminRef, {
                        email: currentUser.email,
                        uid: currentUser.uid,
                        name: currentUser.displayName || 'Waly Admin',
                        role: 'admin',
                        status: 'active',
                        date: new Date().toISOString()
                    });
                    authData = await checkUserAuthorization(currentUser.email);
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
        await logout();
    };

    return (
        <AuthContext.Provider value={{ user, role, status, name, loading, login, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
