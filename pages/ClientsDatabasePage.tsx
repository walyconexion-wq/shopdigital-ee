import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ClientsDatabasePage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        // REDIRECCIÓN DE EMERGENCIA: Esta ruta ya no existe en el ADN regionalizado.
        // Volvemos al Tablero Maestro de la zona.
        navigate(`/${townId}/tablero-maestro`);
    }, [navigate, townId]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
            <div className="animate-pulse text-cyan-400 font-black uppercase tracking-widest text-xs mb-4">
                REDIRECCIONANDO...
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">
                Ruta Deprecada · Operación Exorcismo Exitosa 👻🛡️
            </p>
        </div>
    );
};

export default ClientsDatabasePage;
