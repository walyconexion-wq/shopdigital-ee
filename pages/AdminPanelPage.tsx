import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client, Invoice } from '../types';
import { CATEGORIES } from '../constants';
import { useAuth } from '../components/AuthContext';
import { 
    guardarComercio, 
    actualizarPuntosCliente, 
    suscribirseAFacturasPorZona, 
    registrarIntrusionBunker 
} from '../firebase';
import {
    ChevronLeft,
    Zap,
    Lock,
    Save,
    Camera,
    Upload,
    ExternalLink,
    Search,
    User,
    Coins,
    Award,
    FileText,
    CheckCircle,
    Clock,
    Sparkles,
    Trash2
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface AdminPanelPageProps {
    allShops: Shop[];
    allClients?: Client[];
}

const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ allShops, allClients = [] }) => {
    const { townId = 'esteban-echeverria', shopSlug } = useParams<{ townId: string, shopSlug: string }>();
    const navigate = useNavigate();
    
    // Auth context
    const { user, role, status, login, logoutUser, loading: authLoading } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [foundClient, setFoundClient] = useState<Client | null>(null);
    const [searchError, setSearchError] = useState('');
    const [isUpdatingPoints, setIsUpdatingPoints] = useState(false);
    const [shopInvoices, setShopInvoices] = useState<Invoice[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const existingShop = allShops.find(shop => (shop.slug || shop.id) === shopSlug);

    const [editableShop, setEditableShop] = useState<Shop>({
        id: existingShop?.id || `shop-${Date.now()}`,
        slug: existingShop?.slug || '',
        name: existingShop?.name || '',
        category: existingShop?.category || CATEGORIES[0].id,
        rating: existingShop?.rating || 5.0,
        specialty: existingShop?.specialty || '',
        address: existingShop?.address || '',
        phone: existingShop?.phone || '',
        bannerImage: existingShop?.bannerImage || '',
        image: existingShop?.image || '',
        offers: existingShop?.offers || [],
        mapUrl: existingShop?.mapUrl || '',
        mapSheetUrl: existingShop?.mapSheetUrl || '',
        instagram: existingShop?.instagram || '',
        facebook: existingShop?.facebook || '',
        tiktok: existingShop?.tiktok || '',
        gmail: existingShop?.gmail || '',
        authorizedEmail: existingShop?.authorizedEmail || '',
        ownerName: existingShop?.ownerName || '',
        ownerPhoto: existingShop?.ownerPhoto || '',
        memberNumber: existingShop?.memberNumber || '',
        shopNumber: existingShop?.shopNumber || '',
        region: existingShop?.region || '',
        townId: existingShop?.townId || townId,
        isActive: existingShop?.isActive ?? false,
        billingStatus: existingShop?.billingStatus || 'pending'
    });

    // Update editable shop if database state loads later
    useEffect(() => {
        if (existingShop) {
            setEditableShop({
                id: existingShop.id,
                slug: existingShop.slug || '',
                name: existingShop.name || '',
                category: existingShop.category || CATEGORIES[0].id,
                rating: existingShop.rating || 5.0,
                specialty: existingShop.specialty || '',
                address: existingShop.address || '',
                phone: existingShop.phone || '',
                bannerImage: existingShop.bannerImage || '',
                image: existingShop.image || '',
                offers: existingShop.offers || [],
                mapUrl: existingShop.mapUrl || '',
                mapSheetUrl: existingShop.mapSheetUrl || '',
                instagram: existingShop.instagram || '',
                facebook: existingShop.facebook || '',
                tiktok: existingShop.tiktok || '',
                gmail: existingShop.gmail || '',
                authorizedEmail: existingShop.authorizedEmail || '',
                ownerName: existingShop.ownerName || '',
                ownerPhoto: existingShop.ownerPhoto || '',
                memberNumber: existingShop.memberNumber || '',
                shopNumber: existingShop.shopNumber || '',
                region: existingShop.region || '',
                townId: existingShop.townId || townId,
                isActive: existingShop.isActive ?? false,
                billingStatus: existingShop.billingStatus || 'pending'
            });
        }
    }, [existingShop, townId]);

    // Permissions check
    const userEmail = user?.email?.trim().toLowerCase() || null;
    const isDG = userEmail === 'walyconexion@gmail.com';
    const isAmbassador = (role === 'admin' || role === 'ambassador') && status === 'active';
    const isShopOwner = userEmail && (
        userEmail === existingShop?.gmail?.trim().toLowerCase() ||
        userEmail === existingShop?.authorizedEmail?.trim().toLowerCase()
    );
    const isAuthorized = isDG || isAmbassador || isShopOwner;

    // Log intrusion if authenticated but unauthorized
    useEffect(() => {
        if (user && !isAuthorized && !authLoading) {
            console.warn(`[DOBERMAN] Acceso no autorizado registrado para: ${userEmail}`);
            registrarIntrusionBunker(userEmail).catch(console.error);
        }
    }, [user, isAuthorized, authLoading, userEmail]);

    // Subscribe to invoices
    useEffect(() => {
        if (existingShop?.id) {
            const unsubscribe = suscribirseAFacturasPorZona(townId, (facturas) => {
                const shopFacturas = facturas.filter(f => f.shopId === existingShop.id);
                setShopInvoices(shopFacturas.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
            });
            return () => unsubscribe();
        }
    }, [existingShop?.id, townId]);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 300; // 300px biométrica circular
                    
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        // 70% quality JPEG is super light (~15KB)
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        resolve(dataUrl);
                    } else {
                        resolve(e.target?.result as string);
                    }
                };
                img.onerror = () => reject(new Error('Error cargando imagen.'));
                img.src = e.target?.result as string;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        playNeonClick();
        try {
            const compressed = await compressImage(file);
            setEditableShop(prev => ({ ...prev, ownerPhoto: compressed }));
            playSuccessSound();
        } catch (err) {
            console.error("Error al procesar foto:", err);
            alert("Error al comprimir la foto.");
        }
    };

    const handleSave = async () => {
        playNeonClick();
        if (!editableShop.name || !editableShop.gmail) {
            alert('⚠️ El nombre del comercio y el Gmail de acceso son campos OBLIGATORIOS.');
            return;
        }
        setIsSaving(true);
        try {
            // Generar slug si no existe
            let slug = editableShop.slug;
            if (!slug) {
                slug = editableShop.name.toString().toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                    .replace(/\-\-+/g, '-')
                    .replace(/^-+/, '')
                    .replace(/-+$/, '');
            }
            const payload = {
                ...editableShop,
                slug,
                gmail: editableShop.gmail.trim().toLowerCase(),
                authorizedEmail: editableShop.authorizedEmail?.trim().toLowerCase() || ''
            };
            await guardarComercio(payload, townId);
            playSuccessSound();
            alert('¡Comercio guardado con éxito!');
            navigate(`/${townId}/home`);
        } catch (error) {
            console.error("Error al guardar comercio:", error);
            alert('Error al guardar el comercio.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSearchClient = () => {
        playNeonClick();
        setSearchError('');
        const normalizedQuery = searchQuery.trim().toLowerCase();
        
        if (!normalizedQuery) {
            setSearchError('Ingresá un DNI, teléfono o nombre.');
            setFoundClient(null);
            return;
        }

        const queryDigits = normalizedQuery.replace(/\D/g, '');
        const client = allClients.find(c => {
            const phoneDigits = c.phone.replace(/\D/g, '');
            const dniDigits = c.dni?.replace(/\D/g, '') || '';
            return (queryDigits && (phoneDigits.includes(queryDigits) || dniDigits.includes(queryDigits))) || c.name.toLowerCase().includes(normalizedQuery);
        });

        if (client) {
            setFoundClient(client);
        } else {
            setFoundClient(null);
            setSearchError('Cliente VIP no encontrado.');
        }
    };

    const handleAwardPoints = async (points: number) => {
        if (!foundClient || !existingShop) return;
        playNeonClick();
        setIsUpdatingPoints(true);
        try {
            const newBalance = await actualizarPuntosCliente(foundClient.id, points, existingShop.name, 'earned');
            setFoundClient({ ...foundClient, points: newBalance });
        } catch (error) {
            alert('Error al actualizar puntos.');
        } finally {
            setIsUpdatingPoints(false);
        }
    };

    const handleRedeemPoints = async () => {
        if (!foundClient || !existingShop) return;
        playNeonClick();
        
        const pointsStr = window.prompt(`¿Cuántos puntos querés descontar de ${foundClient.name}? (Saldo actual: ${foundClient.points || 0})`);
        if (!pointsStr) return;
        
        const points = parseInt(pointsStr, 10);
        if (isNaN(points) || points <= 0) {
            alert('Cantidad inválida.');
            return;
        }
        
        if (points > (foundClient.points || 0)) {
            alert('El cliente no tiene suficientes puntos.');
            return;
        }

        setIsUpdatingPoints(true);
        try {
            const newBalance = await actualizarPuntosCliente(foundClient.id, -points, existingShop.name, 'redeemed');
            setFoundClient({ ...foundClient, points: newBalance });
            alert(`Puntos canjeados con éxito. Nuevo saldo: ${newBalance}`);
        } catch (error) {
            alert('Error al canjear puntos.');
        } finally {
            setIsUpdatingPoints(false);
        }
    };

    // UI Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 selection:bg-cyan-500/30">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-t-2 border-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse">Sintonizando Seguridad...</span>
                </div>
            </div>
        );
    }

    // UI Unauthenticated state
    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_60%)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
                </div>
                
                <div className="w-full max-w-sm bg-zinc-950/40 border border-cyan-500/20 rounded-[2.5rem] p-8 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] mx-auto">
                        <Lock size={24} className="text-cyan-400 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter text-center mb-1">Acceso Autogestión</h2>
                    <p className="text-[9px] font-bold text-cyan-400/60 uppercase tracking-widest text-center mb-8">ShopDigital Live Security Node</p>

                    <button
                        onClick={() => { playNeonClick(); login(); }}
                        className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-black uppercase tracking-[0.15em] py-4.5 rounded-2xl active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.25)] flex items-center justify-center gap-3 text-xs"
                    >
                        <User size={16} /> Iniciar Sesión con Google
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(-1); }}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider py-3.5 rounded-2xl active:scale-95 transition-all mt-4 text-[10px]"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    // UI Unauthorized state (Doberman Secure protocol triggered)
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-red-950/10 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                </div>
                
                <div className="w-full max-w-sm bg-red-950/20 border border-red-500/30 rounded-[2.5rem] p-8 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] mx-auto">
                        <Zap size={24} className="text-red-500 animate-bounce" />
                    </div>
                    <h2 className="text-xl font-black text-red-500 uppercase tracking-tighter text-center mb-2">Acceso Denegado</h2>
                    <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest leading-relaxed text-center mb-6">
                        PROTOCOLO DOBERMAN ACTIVO.<br/>Su correo <span className="font-mono text-white select-all">{user.email}</span> no está autorizado para gestionar este comercio.
                    </p>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest leading-normal mb-8 border-l-2 border-red-500/30 pl-3">
                        Este intento de intrusión ha sido reportado inmediatamente al Búnker del Director General para auditoría.
                    </p>

                    <button
                        onClick={() => { playNeonClick(); logoutUser(); }}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.15em] py-4 rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] text-xs"
                    >
                        Cerrar Sesión / Cambiar Cuenta
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(-1); }}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider py-3.5 rounded-2xl active:scale-95 transition-all mt-4 text-[10px]"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
            {/* Tech backgrounds */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 pt-10 pb-6 px-8 flex flex-col items-center sticky top-0 z-50 shadow-md">
                <div className="w-full flex justify-between items-center mb-2">
                    <button onClick={() => {
                        playNeonClick();
                        navigate(`/${townId}/home`);
                    }} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors"><ChevronLeft size={20} /></button>
                    
                    <div className="text-right">
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Operador:</span>
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block max-w-[150px] truncate">{user.displayName || user.email}</span>
                    </div>
                </div>
                <h2 className="text-[16px] font-[1000] text-white uppercase tracking-[0.2em] mb-1">Carga de Comercio</h2>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Panel de Autogestión Conectado</p>
            </div>

            <div className="px-6 max-w-lg mx-auto mt-8 space-y-8 relative z-10">
                
                {/* BIO-PHOTO DUAL UPLOADER */}
                <div className="bg-zinc-950/60 border border-cyan-500/20 rounded-[2rem] p-6 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.02)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-400/30">
                            <Camera size={20} className="text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-[1000] text-cyan-400 uppercase tracking-[0.2em]">Foto Biométrica</h3>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Control de Identidad de Acceso</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Circular Neon Preview */}
                        <div className="relative w-24 h-24 rounded-full p-0.5 bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex-shrink-0 animate-[pulse_4s_infinite_ease-in-out]">
                            <div className="w-full h-full bg-zinc-900 rounded-full overflow-hidden flex items-center justify-center relative">
                                {editableShop.ownerPhoto ? (
                                    <img src={editableShop.ownerPhoto} alt="Owner" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={36} className="text-white/20" />
                                )}
                            </div>
                        </div>

                        {/* Upload buttons */}
                        <div className="w-full space-y-3">
                            <input 
                                type="file" 
                                accept="image/*" 
                                id="fileUpload" 
                                className="hidden" 
                                onChange={handlePhotoChange} 
                            />
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="user" 
                                id="cameraUpload" 
                                className="hidden" 
                                onChange={handlePhotoChange} 
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => document.getElementById('fileUpload')?.click()}
                                    className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 rounded-xl py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-white transition-all active:scale-95"
                                >
                                    <Upload size={14} className="text-cyan-400" /> Archivo
                                </button>
                                <button
                                    onClick={() => document.getElementById('cameraUpload')?.click()}
                                    className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 rounded-xl py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-white transition-all active:scale-95"
                                >
                                    <Camera size={14} className="text-cyan-400" /> Tomar Selfie
                                </button>
                            </div>
                            
                            {editableShop.ownerPhoto && (
                                <button
                                    onClick={() => {
                                        playNeonClick();
                                        setEditableShop(prev => ({ ...prev, ownerPhoto: '' }));
                                    }}
                                    className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl py-2 flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-red-400 transition-colors"
                                >
                                    <Trash2 size={10} /> Quitar Foto
                                </button>
                            )}
                            <p className="text-[7px] text-white/30 uppercase tracking-widest text-center">Las fotos se auto-comprimen a 300px JPEG para optimizar la velocidad 🚀</p>
                        </div>
                    </div>
                </div>

                {/* FORM FIELDS */}
                <div className="space-y-6 bg-zinc-950/40 border border-white/5 rounded-[2rem] p-6">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-4 border-b border-white/5 pb-2">Información de Catálogo</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/40 ml-2 mb-2">Nombre del Comercio *</label>
                            <input
                                required
                                value={editableShop.name}
                                onChange={(e) => setEditableShop({ ...editableShop, name: e.target.value })}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-violet-500 text-sm font-bold placeholder:text-white/20"
                                placeholder="Ej: Pizza Blu"
                            />
                        </div>

                        <div>
                            <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/40 ml-2 mb-2">Slug (URL del comercio)</label>
                            <input
                                value={editableShop.slug}
                                onChange={(e) => setEditableShop({ ...editableShop, slug: e.target.value })}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-violet-500 text-sm font-mono placeholder:text-white/20"
                                placeholder="Ej: pizza-blu"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/40 ml-2 mb-2">Nombre del Propietario</label>
                        <input
                            value={editableShop.ownerName}
                            onChange={(e) => setEditableShop({ ...editableShop, ownerName: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-violet-500 text-sm font-bold"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/40 ml-2 mb-2">Especialidad / Descripción Corta</label>
                            <input
                                value={editableShop.specialty}
                                onChange={(e) => setEditableShop({ ...editableShop, specialty: e.target.value })}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-violet-500 text-sm"
                                placeholder="Ej: Especialistas en masa madre"
                            />
                        </div>

                        <div>
                            <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/40 ml-2 mb-2">Teléfono de WhatsApp</label>
                            <input
                                type="tel"
                                value={editableShop.phone}
                                onChange={(e) => setEditableShop({ ...editableShop, phone: e.target.value })}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-violet-500 text-sm font-mono"
                                placeholder="Ej: 1122334455"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/40 ml-2 mb-2">Dirección Física</label>
                        <input
                            value={editableShop.address}
                            onChange={(e) => setEditableShop({ ...editableShop, address: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-violet-500 text-sm"
                            placeholder="Ej: Alem 450, Monte Grande"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                        <div>
                            <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-cyan-400 ml-2 mb-2">Gmail del Propietario *</label>
                            <input
                                required
                                type="email"
                                value={editableShop.gmail}
                                onChange={(e) => setEditableShop({ ...editableShop, gmail: e.target.value })}
                                className="w-full bg-zinc-900 border border-cyan-500/25 rounded-2xl py-3 px-4 focus:outline-none focus:border-cyan-400 text-sm font-bold text-cyan-400"
                                placeholder="Ej: juan.perez@gmail.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/40 ml-2 mb-2">Gmail Adicional Autorizado</label>
                            <input
                                type="email"
                                value={editableShop.authorizedEmail}
                                onChange={(e) => setEditableShop({ ...editableShop, authorizedEmail: e.target.value })}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-violet-500 text-sm"
                                placeholder="Ej: encargado@gmail.com"
                            />
                        </div>
                    </div>
                </div>

                {/* VIP LOYALTY TERMINAL */}
                <div className="bg-zinc-900/40 border border-cyan-500/20 rounded-[2rem] p-6 relative overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-[40px] pointer-events-none" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <Award size={20} className="text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-[1000] text-cyan-400 uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Punto de Venta VIP</h3>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Gestión de Puntos</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4 relative z-10">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClient()}
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all font-mono"
                            placeholder="DNI, Teléfono o Nombre"
                        />
                        <button
                            onClick={handleSearchClient}
                            className="bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 rounded-xl px-4 flex items-center justify-center hover:bg-cyan-500/30 active:scale-95 transition-all"
                        >
                            <Search size={18} />
                        </button>
                    </div>

                    {searchError && <p className="text-red-400 text-[10px] font-bold mt-2 uppercase tracking-wide px-2">{searchError}</p>}

                    {foundClient && (
                        <div className="mt-6 bg-black/60 border border-cyan-500/20 rounded-2xl p-5 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                            <User size={20} className="text-cyan-400/80" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white uppercase tracking-wider">{foundClient.name}</span>
                                        <span className="text-[10px] text-cyan-400/80 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                            <Coins size={10} /> Saldo: {foundClient.points || 0} pts
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 ml-1">Sumar Puntos de Compra</p>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {[5, 10, 15, 20].map((pts) => (
                                    <button
                                        key={pts}
                                        onClick={() => handleAwardPoints(pts)}
                                        disabled={isUpdatingPoints}
                                        className="bg-green-500/10 border border-green-500/30 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-green-500/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        <span className="text-[14px] font-[1000] text-green-400 leading-none">+{pts}</span>
                                        <span className="text-[7px] text-green-400/60 uppercase tracking-widest mt-1">Pts</span>
                                    </button>
                                ))}
                            </div>

                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 ml-1 mt-6">Canjear Recompensas</p>
                            <button
                                onClick={handleRedeemPoints}
                                disabled={isUpdatingPoints || (foundClient.points || 0) === 0}
                                className="w-full relative group bg-indigo-500/10 border border-indigo-500/30 rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Coins size={16} className="text-indigo-400 relative z-10" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400 relative z-10">Cobrar con Puntos</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* MIS FACTURAS TERMINAL */}
                <div className="bg-zinc-900/40 border border-green-500/20 rounded-[2rem] p-6 relative overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 rounded-full blur-[40px] pointer-events-none" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-400/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                            <FileText size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-[1000] text-green-400 uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">Suscripción y Pagos</h3>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Mis Facturas Mensuales</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {shopInvoices.length === 0 ? (
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center py-4">No tenés facturas registradas</p>
                        ) : (
                            shopInvoices.map(inv => (
                                <div key={inv.id} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden hover:border-green-500/30 transition-colors">
                                    <div className="flex justify-between items-start z-10">
                                        <div>
                                            <p className="text-[11px] font-[1000] text-white uppercase tracking-wider">{inv.concept}</p>
                                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Vence: {new Date(inv.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${inv.status === 'paid' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                            {inv.status === 'paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                            {inv.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-1 z-10 border-t border-white/5 pt-3">
                                        <div className="text-xl font-[1000] text-green-400 tracking-wider">${inv.amount}</div>
                                        <button 
                                            onClick={() => {
                                                playNeonClick();
                                                window.open(`/${townId}/factura/${inv.id}`, '_blank');
                                            }}
                                            className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-xl py-2 px-3 flex items-center gap-2 text-[9px] uppercase font-black tracking-widest transition-all"
                                        >
                                            <ExternalLink size={12} /> Ver Factura
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-4 pt-4">
                    <button 
                        onClick={() => {
                            playNeonClick();
                            const category = editableShop.category || (existingShop ? existingShop.category : '');
                            const slug = editableShop.slug || shopSlug;
                            if (category && slug) {
                                navigate(`/${townId}/${category}/${slug}/credencial`);
                            } else {
                                alert('Faltan datos para generar la ruta de la credencial');
                            }
                        }}
                        className="w-full glass-action-btn btn-cyan-neon py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                    >
                        <ExternalLink size={20} className="text-cyan-400 animate-pulse" /> Ver Credencial
                    </button>

                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="w-full bg-violet-600 hover:bg-violet-500 py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-[0_0_30px_rgba(139,92,246,0.3)] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} /> Guardar Cambios
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminPanelPage;
