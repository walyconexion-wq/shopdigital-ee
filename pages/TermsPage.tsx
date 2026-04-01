import React, { useEffect } from 'react';
import { ChevronLeft, ScrollText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';

const TermsPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            title: "1. Aceptación de los Términos",
            content: "Al acceder y utilizar la aplicación Waly (en adelante, la 'App'), usted acepta estar sujeto a estos Términos y Condiciones, así como a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio."
        },
        {
            title: "2. Descripción del Servicio",
            content: "Waly es una plataforma de servicios digitales que facilita la interacción entre comercios y clientes, ofreciendo herramientas de fidelización, facturación B2C y B2B, y gestión de credenciales digitales. Las funciones y herramientas disponibles están sujetas a cambios y actualizaciones constates."
        },
        {
            title: "3. Registro y Cuentas de Usuario",
            content: "Para utilizar ciertas funciones de la App, debe registrarse y mantener una cuenta. Usted es responsable de salvaguardar su contraseña y de cualquier actividad o acción bajo su cuenta. Nos reservamos el derecho de denegar el servicio, cancelar cuentas, eliminar o editar contenido a nuestra entera discreción."
        },
        {
            title: "4. Política de Privacidad y Tratamiento de Datos",
            content: "El uso de la App está también regido por nuestra Política de Privacidad, la cual se incorpora a estos Términos y Condiciones mediante esta referencia. No compartiremos su información personal con terceros para fines ajenos a la operación de la plataforma sin su consentimiento, salvo requerimiento judicial."
        },
        {
            title: "5. Pagos y Suscripciones (Módulos Comerciales)",
            content: "Los comercios que opten por nuestros planes de suscripción se rigen por las tarifas publicadas al momento de su aceptación. El acceso a los Paneles de Autogestión ('Posnet') y funcionalidades avanzadas requiere mantener la cuenta al día. Waly utiliza pasarelas de pago de terceros y no almacena directamente datos de tarjetas bancarias."
        },
        {
            title: "6. Propiedad Intelectual",
            content: "El contenido, organización, gráficos, diseño, compilación, traducción magnética, conversión digital y otros asuntos relacionados con el Sitio y la App están protegidos por las leyes de propiedad intelectual, marcas registradas y otras normativas aplicables. La copia, redistribución, uso o publicación por parte del usuario de tales cuestiones está estrictamente prohibida."
        },
        {
            title: "7. Exención de Responsabilidad",
            content: "Los materiales y servicios proporcionados en la App se entregan 'tal cual' sin ninguna garantía de ningún tipo, ya sea expresa o implícita. Waly no garantiza que el servicio será ininterrumpido, oportuno, seguro o libre de errores."
        },
        {
            title: "8. Modificaciones a los Términos",
            content: "Nos reservamos el derecho de modificar estos términos en cualquier momento a nuestra discreción sin previo aviso. Es su responsabilidad revisar estos Términos y Condiciones periódicamente para verificar si existen cambios."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-cyan-500/30 pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button 
                    onClick={() => { playNeonClick(); navigate(-1); }} 
                    className="absolute top-10 left-6 text-white/50 hover:text-cyan-400 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <ScrollText size={32} className="text-cyan-400 mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                    <h1 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white text-center">Términos y<br/>Condiciones</h1>
                    <p className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest mt-2">(Documento Legal Provisional)</p>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 mt-8 relative z-10 max-w-lg mx-auto pb-12">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-8">
                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest leading-relaxed text-center">
                        Este documento es una versión provisional y de prueba. Los términos y condiciones finales y legalmente vinculantes se encuentran actualmente en proceso de redacción y registro.
                    </p>
                </div>

                <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                    <div className="space-y-8">
                        {sections.map((section, idx) => (
                            <div key={idx} className="group">
                                <h3 className="text-[12px] font-[1000] text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2 group-hover:text-white transition-colors">
                                    {section.title}
                                </h3>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium text-justify">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                            Última actualización: Noviembre 2026
                        </p>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
                            ShopDigital VIP S.A.
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-full mt-8 bg-cyan-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                >
                    Aceptar y Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default TermsPage;
