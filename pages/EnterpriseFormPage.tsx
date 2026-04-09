import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shop } from '../types';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { guardarComercio } from '../firebase';
import {
    ChevronLeft,
    Factory,
    Save,
    Globe,
    Landmark,
    MapPin,
    Phone,
    Camera,
    Link2,
    FileText,
    MessageSquare
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface EnterpriseFormPageProps {
    allShops?: Shop[];
}

const EnterpriseFormPage: React.FC<EnterpriseFormPageProps> = ({ allShops = [] }) => {
    const { townId = 'esteban-echeverria', enterpriseId } = useParams<{ townId: string; enterpriseId: string }>();
    const navigate = useNavigate();
    const isEditing = !!enterpriseId;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        specialty: '',
        reach: 'national' as 'national' | 'regional' | 'local',
        zone: '',
        address: '',
        phone: '',
        ownerName: '',
        image: '',
        bannerImage: '',
        mapUrl: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        description: '',
    });
    const [saving, setSaving] = useState(false);

    // Cargar datos si estamos editando
    useEffect(() => {
        if (isEditing && allShops) {
            const enterprise = allShops.find(s => s.id === enterpriseId);
            if (enterprise) {
                setFormData({
                    name: enterprise.name || '',
                    category: enterprise.category || '',
                    specialty: enterprise.specialty || '',
                    reach: (enterprise.reach as any) || 'national',
                    zone: enterprise.zone || '',
                    address: enterprise.address || '',
                    phone: enterprise.phone || '',
                    ownerName: enterprise.ownerName || '',
                    image: enterprise.image || '',
                    bannerImage: enterprise.bannerImage || '',
                    mapUrl: enterprise.mapUrl || '',
                    instagram: (enterprise as any).instagram || '',
                    facebook: (enterprise as any).facebook || '',
                    tiktok: (enterprise as any).tiktok || '',
                    description: enterprise.description || '',
                });
            }
        }
    }, [isEditing, enterpriseId, allShops]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        playNeonClick();
        if (!formData.name || !formData.category) {
            alert('⚠️ El nombre y el rubro son obligatorios.');
            return;
        }

        setSaving(true);
        try {
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const id = isEditing ? enterpriseId! : `ent-${slug}-${Date.now()}`;

            const enterpriseData: any = {
                id,
                slug,
                name: formData.name,
                category: formData.category,
                specialty: formData.specialty,
                entityType: 'enterprise',
                reach: formData.reach,
                zone: formData.zone,
                address: formData.address || formData.zone,
                phone: formData.phone,
                ownerName: formData.ownerName,
                image: formData.bannerImage || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop',
                bannerImage: formData.bannerImage || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=400&fit=crop',
                description: formData.description,
                mapUrl: formData.mapUrl,
                instagram: formData.instagram,
                facebook: formData.facebook,
                tiktok: formData.tiktok,
                rating: 5.0,
                isActive: true,
                townId,
                offers: [],
            };

            await guardarComercio(enterpriseData, townId);
            playSuccessSound();
            alert(`✅ ¡Empresa "${formData.name}" ${isEditing ? 'actualizada' : 'asociada'} con éxito al Nodo Industrial!`);
            navigate(`/${townId}/embajador/empresas`);
        } catch (error: any) {
            console.error("Error al guardar empresa:", error);
            alert('❌ Error: ' + (error.message || 'No se pudo guardar.'));
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full bg-zinc-900/60 border border-amber-500/20 rounded-xl p-3.5 text-white text-[12px] font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-400/60 focus:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all";
    const labelClass = "text-[9px] font-black text-amber-400/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5";

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-amber-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b border-amber-500/20 mb-6 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/empresas`); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-400/30 hover:bg-amber-500/20 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <Factory size={28} className="text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <h2 className="text-[16px] font-black text-white uppercase tracking-[0.2em]">
                    {isEditing ? 'Editar Empresa' : 'Alta de Empresa'}
                </h2>
                <p className="text-[8px] font-bold text-amber-400/60 uppercase tracking-widest mt-1 italic">
                    Nodo Empresarial B2B · Formulario Industrial
                </p>
            </div>

            {/* Formulario */}
            <div className="px-6 max-w-lg mx-auto relative z-10 space-y-5">
                {/* Nombre */}
                <div>
                    <label className={labelClass}><Factory size={12} /> Nombre de la Empresa</label>
                    <input type="text" className={inputClass} placeholder='Ej: TecnoImport "El Chino Veloz"' value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                </div>

                {/* Rubro Industrial */}
                <div>
                    <label className={labelClass}><FileText size={12} /> Rubro Industrial</label>
                    <select className={inputClass} value={formData.category} onChange={e => handleChange('category', e.target.value)}>
                        <option value="">Seleccionar Rubro...</option>
                        {ENTERPRISE_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Especialidad */}
                <div>
                    <label className={labelClass}><FileText size={12} /> Especialidad / Descripción Corta</label>
                    <input type="text" className={inputClass} placeholder="Ej: Importación directa de electrónica" value={formData.specialty} onChange={e => handleChange('specialty', e.target.value)} />
                </div>

                {/* Alcance */}
                <div>
                    <label className={labelClass}><Globe size={12} /> Alcance de Distribución</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'national', label: '🌎 Nacional', icon: <Globe size={14} /> },
                            { id: 'regional', label: '📍 Regional', icon: <Landmark size={14} /> },
                            { id: 'local', label: '🏠 Local', icon: <MapPin size={14} /> },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleChange('reach', opt.id)}
                                className={`py-3 rounded-xl border font-black uppercase tracking-widest text-[8px] transition-all active:scale-95
                                    ${formData.reach === opt.id
                                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ubicación */}
                <div>
                    <label className={labelClass}><MapPin size={12} /> Ubicación / Ciudad</label>
                    <input type="text" className={inputClass} placeholder="Ej: Buenos Aires, CABA, Zona Sur" value={formData.zone} onChange={e => handleChange('zone', e.target.value)} />
                </div>

                {/* Dirección */}
                <div>
                    <label className={labelClass}><MapPin size={12} /> Dirección de Planta / Depósito</label>
                    <input type="text" className={inputClass} placeholder="Ej: Av. Industrial 1234, Lanús" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
                </div>

                {/* Titular */}
                <div>
                    <label className={labelClass}><FileText size={12} /> Representante / Titular</label>
                    <input type="text" className={inputClass} placeholder="Nombre del contacto" value={formData.ownerName} onChange={e => handleChange('ownerName', e.target.value)} />
                </div>

                {/* Teléfono */}
                <div>
                    <label className={labelClass}><Phone size={12} /> WhatsApp de Ventas</label>
                    <input type="tel" className={inputClass} placeholder="Ej: 1155001234" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                </div>

                {/* Imagen */}
                <div>
                    <label className={labelClass}><Camera size={12} /> URL de Logo / Imagen de Portada</label>
                    <input type="url" className={inputClass} placeholder="https://..." value={formData.bannerImage} onChange={e => handleChange('bannerImage', e.target.value)} />
                    {formData.bannerImage && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-amber-500/20 h-32">
                            <img src={formData.bannerImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* GPS */}
                <div>
                    <label className={labelClass}><MapPin size={12} /> URL de Google Maps (embed)</label>
                    <input type="url" className={inputClass} placeholder="https://www.google.com/maps/embed?..." value={formData.mapUrl} onChange={e => handleChange('mapUrl', e.target.value)} />
                </div>

                {/* Redes Sociales */}
                <div>
                    <label className={labelClass}><Link2 size={12} /> Instagram</label>
                    <input type="text" className={inputClass} placeholder="@empresa" value={formData.instagram} onChange={e => handleChange('instagram', e.target.value)} />
                </div>

                {/* Descripción */}
                <div>
                    <label className={labelClass}><MessageSquare size={12} /> Descripción Completa</label>
                    <textarea className={`${inputClass} min-h-[80px]`} placeholder="Descripción de la empresa, historia, servicios..." value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                </div>

                {/* Botón de Guardar */}
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all mt-6
                        ${saving
                            ? 'bg-amber-900/50 text-amber-500 cursor-not-allowed'
                            : 'bg-amber-500 text-black active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                        }`}
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    ) : (
                        <><Save size={16} /> {isEditing ? 'Guardar Cambios' : 'Asociar Empresa al Nodo'}</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default EnterpriseFormPage;
