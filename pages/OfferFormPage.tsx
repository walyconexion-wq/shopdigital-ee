import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Offer } from '../types';
import { CATEGORIES } from '../constants';
import { guardarOferta } from '../firebase';
import {
    ChevronLeft,
    Save,
    Tag,
    Store,
    MapPin,
    Calendar,
    Package,
    Image as ImageIcon,
    Type,
    FileText,
    DollarSign,
    Coins
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

const LOCALITIES = ['Luis Guillón', 'Monte Grande', 'El Jagüel'];

interface OfferFormPageProps {
    allOffers?: Offer[];
}

const OfferFormPage: React.FC<OfferFormPageProps> = ({ allOffers }) => {
    const navigate = useNavigate();
    const { target, offerId } = useParams<{ target?: string; offerId?: string }>();

    const isEditing = !!offerId;
    const offerTarget = (target?.toUpperCase() || 'B2B') as 'B2B' | 'B2C';

    const existingOffer = isEditing && allOffers
        ? allOffers.find(o => o.id === offerId)
        : null;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        discountLabel: '',
        image: '',
        merchantName: '',
        merchantZone: LOCALITIES[1],
        category: CATEGORIES[0].id,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        stockLimit: '',
        pointsPrice: '',
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (existingOffer) {
            setFormData({
                title: existingOffer.title,
                description: existingOffer.description,
                price: existingOffer.price,
                discountLabel: existingOffer.discountLabel,
                image: existingOffer.image,
                merchantName: existingOffer.merchantName,
                merchantZone: existingOffer.merchantZone,
                category: existingOffer.category,
                validFrom: existingOffer.validFrom,
                validUntil: existingOffer.validUntil,
                stockLimit: existingOffer.stockLimit?.toString() || '',
                pointsPrice: existingOffer.pointsPrice?.toString() || '',
            });
        }
    }, [existingOffer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        img.onload = () => {
            const MAX = 600;
            let w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
                const ratio = Math.min(MAX / w, MAX / h);
                w *= ratio; h *= ratio;
            }
            canvas.width = w; canvas.height = h;
            ctx?.drawImage(img, 0, 0, w, h);
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            setFormData(prev => ({ ...prev, image: base64 }));
        };
        img.src = URL.createObjectURL(file);
    };

    const handleSubmit = async () => {
        playNeonClick();
        if (!formData.title || !formData.merchantName || !formData.discountLabel) {
            alert('Completa al menos Título, Nombre del Comercio y Descuento.');
            return;
        }

        const offerData: Offer = {
            id: isEditing && offerId ? offerId : `offer-${Date.now()}`,
            target: isEditing && existingOffer ? existingOffer.target : offerTarget,
            title: formData.title,
            description: formData.description,
            price: formData.price,
            discountLabel: formData.discountLabel,
            image: formData.image,
            merchantName: formData.merchantName,
            merchantZone: formData.merchantZone,
            category: formData.category,
            validFrom: formData.validFrom,
            validUntil: formData.validUntil || 'indefinido',
            stockLimit: formData.stockLimit ? parseInt(formData.stockLimit) : undefined,
            pointsPrice: formData.pointsPrice ? parseInt(formData.pointsPrice) : undefined,
            isActive: false,
            createdAt: isEditing && existingOffer ? existingOffer.createdAt : new Date().toISOString(),
        };

        try {
            await guardarOferta(offerData);
            playSuccessSound();
            setSaved(true);
        } catch (err) {
            alert('Error al guardar la oferta.');
        }
    };

    if (saved) {
        const backTarget = isEditing && existingOffer ? existingOffer.target.toLowerCase() : offerTarget.toLowerCase();
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 animate-in fade-in">
                <div className="glass-card-3d bg-green-500/10 border border-green-500/40 rounded-3xl p-10 flex flex-col items-center text-center max-w-sm shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                    <Save size={48} className="text-green-400 mb-4 animate-bounce" />
                    <h2 className="text-xl font-[1000] text-green-300 uppercase tracking-widest mb-4">
                        {isEditing ? '¡Oferta Actualizada!' : '¡Oferta Creada!'}
                    </h2>
                    <p className="text-sm text-white/60 mb-8">
                        Ahora podés publicarla desde el panel de gestión.
                    </p>
                    <button onClick={() => { playNeonClick(); navigate(`/embajador/ofertas/${backTarget}`); }}
                        className="w-full bg-green-500/20 border border-green-400/40 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-green-300 active:scale-95 transition-all">
                        Ir al Panel de Ofertas
                    </button>
                </div>
            </div>
        );
    }

    const INPUT_CLASS = "w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 transition-all";
    const LABEL_CLASS = "text-[9px] font-black text-white/50 uppercase tracking-widest mb-1.5 flex items-center gap-1.5";

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b border-cyan-500/20 mb-6 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(-1); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-[15px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    {isEditing ? 'Editar Oferta' : 'Crear Oferta'} {offerTarget}
                </h2>
                <span className="text-[8px] font-bold text-cyan-400/70 uppercase tracking-widest mt-1">
                    {offerTarget === 'B2B' ? 'Red Comercial' : 'Clientes de Calle'}
                </span>
            </div>

            {/* Form */}
            <div className="px-5 max-w-lg mx-auto space-y-5 relative z-10">
                <div>
                    <label className={LABEL_CLASS}><Tag size={10} /> Título / Promoción</label>
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="Ej: 2x1 en Pizzas Grandes" className={INPUT_CLASS} />
                </div>
                <div>
                    <label className={LABEL_CLASS}><DollarSign size={10} /> Descuento (Etiqueta)</label>
                    <input name="discountLabel" value={formData.discountLabel} onChange={handleChange} placeholder="Ej: 20% OFF, 2x1, BONO" className={INPUT_CLASS} />
                </div>
                <div>
                    <label className={LABEL_CLASS}><DollarSign size={10} /> Precio (Opcional)</label>
                    <input name="price" value={formData.price} onChange={handleChange} placeholder="Ej: $2.500" className={INPUT_CLASS} />
                </div>
                <div>
                    <label className={LABEL_CLASS}><Coins size={10} className="text-yellow-400" /> Precio en Puntos VIP (Opcional)</label>
                    <input type="number" name="pointsPrice" value={formData.pointsPrice} onChange={handleChange} placeholder="Ej: 30" className={INPUT_CLASS + " border-yellow-500/30 focus:border-yellow-400/50"} />
                </div>
                <div>
                    <label className={LABEL_CLASS}><FileText size={10} /> Descripción</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Detalles de la promoción..." className={INPUT_CLASS + " min-h-[80px] resize-y"} />
                </div>
                <div>
                    <label className={LABEL_CLASS}><Store size={10} /> Nombre del Comercio</label>
                    <input name="merchantName" value={formData.merchantName} onChange={handleChange} placeholder="Ej: Pizzería Waly" className={INPUT_CLASS} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={LABEL_CLASS}><MapPin size={10} /> Zona</label>
                        <select name="merchantZone" value={formData.merchantZone} onChange={handleChange} className={INPUT_CLASS}>
                            {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={LABEL_CLASS}><Type size={10} /> Rubro</label>
                        <select name="category" value={formData.category} onChange={handleChange} className={INPUT_CLASS}>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={LABEL_CLASS}><Calendar size={10} /> Válido Desde</label>
                        <input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange} className={INPUT_CLASS} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}><Calendar size={10} /> Válido Hasta</label>
                        <input type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} className={INPUT_CLASS} />
                    </div>
                </div>

                <div>
                    <label className={LABEL_CLASS}><Package size={10} /> Límite de Stock (Opcional)</label>
                    <input type="number" name="stockLimit" value={formData.stockLimit} onChange={handleChange} placeholder="Ej: 100 (dejar vacío = ilimitado)" className={INPUT_CLASS} />
                </div>

                <div>
                    <label className={LABEL_CLASS}><ImageIcon size={10} /> Banner / Foto del Producto</label>
                    {formData.image && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-white/10">
                            <img src={formData.image} alt="Preview" className="w-full h-40 object-cover" />
                        </div>
                    )}
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload}
                        className="w-full text-xs text-white/50 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-cyan-400/30 file:bg-cyan-500/10 file:text-cyan-300 file:font-black file:text-[9px] file:uppercase file:tracking-widest file:cursor-pointer" />
                </div>

                {/* Submit */}
                <button onClick={handleSubmit}
                    className="w-full bg-cyan-500/15 border border-cyan-400/40 py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] text-cyan-300 active:scale-95 transition-all hover:bg-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.2)] mt-8">
                    <Save size={16} />
                    {isEditing ? 'Guardar Cambios' : 'Crear Promoción'}
                </button>
            </div>
        </div>
    );
};

export default OfferFormPage;
