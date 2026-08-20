import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, checkUserAuthorization, loginConGoogle, logout } from '../firebase';
import { registrarAccesoExitoso, registrarIntentoFallido, registrarAccesoNoAutorizado } from '../services/doberman';

interface AuthContextType {
    user: User | null;
    role: 'admin' | 'ambassador' | null;
    status: 'active' | 'inactive' | 'pending' | null;
    name: string | null;
    loading: boolean;
    login: () => Promise<void>;
    loginAsDirector: () => void;
    logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'ambassador' | null>(null);
    const [status, setStatus] = useState<'active' | 'inactive' | 'pending' | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const activateDirectorSession = () => {
        const mockUser = {
            email: 'walyconexion@gmail.com',
            displayName: 'Waly Director (Root)',
            uid: 'director-waly-root',
            emailVerified: true,
        } as unknown as User;

        setUser(mockUser);
        setRole('admin');
        setStatus('active');
        setName('Waly Director (Root)');
        localStorage.setItem('lab_director_session', 'true');
        setLoading(false);
        registrarAccesoExitoso('walyconexion@gmail.com', window.location.pathname, 'admin').catch(() => {});
    };

    useEffect(() => {
        // 🧪 MODO LABORATORIO / BYPASS LOCAL: Si ya estaba autenticado como Director
        if (localStorage.getItem('lab_director_session') === 'true') {
            activateDirectorSession();
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser && currentUser.email) {
                const userEmail = currentUser.email.trim().toLowerCase();
                
                // Root Admin Auto-Setup (Stateless Bypass for owner to avoid Firestore rules issues)
                if (userEmail === 'walyconexion@gmail.com') {
                    setRole('admin');
                    setStatus('active');
                    setName(currentUser.displayName || 'Waly Admin (Root)');
                    setLoading(false);
                    // 🛡️ DOBERMAN: Registrar acceso del Director
                    registrarAccesoExitoso(userEmail, window.location.pathname, 'admin').catch(() => {});
                    return;
                }

                let authData = await checkUserAuthorization(currentUser.email);

                if (authData) {
                    setRole(authData.role as 'admin' | 'ambassador');
                    setStatus(authData.status as 'active' | 'inactive' | 'pending');
                    setName(authData.name);
                    // 🛡️ DOBERMAN: Registrar acceso exitoso
                    if (authData.status === 'active') {
                        registrarAccesoExitoso(userEmail, window.location.pathname, authData.role).catch(() => {});
                    }
                } else {
                    setRole(null);
                    setStatus(null);
                    setName(null);
                    // 🛡️ DOBERMAN: Email no autorizado intentó entrar
                    registrarAccesoNoAutorizado(userEmail, window.location.pathname).catch(() => {});
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
            // 🛡️ DOBERMAN: Registrar intento fallido de login
            registrarIntentoFallido('desconocido', window.location.pathname).catch(() => {});
            
            // Si el error es auth/unauthorized-domain (Vercel preview URL), ofrecer bypass directo
            if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
                const confirmBypass = window.confirm("⚠️ Dominio de laboratorio no registrado en Google OAuth de Firebase.\n\n¿Deseas ingresar directamente como Director General (Waly)?");
                if (confirmBypass) {
                    activateDirectorSession();
                    return;
                }
            }
            alert("⚠️ Error al ingresar: " + (error.message || "Fallo desconocido. Revisa tu conexión."));
        }
    };

    const loginAsDirector = () => {
        activateDirectorSession();
    };

    const logoutUser = async () => {
        localStorage.removeItem('lab_director_session');
        setUser(null);
        setRole(null);
        setStatus(null);
        setName(null);
        await logout().catch(() => {});
    };

    return (
        <AuthContext.Provider value={{ user, role, status, name, loading, login, loginAsDirector, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
