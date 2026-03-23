import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-1 pb-1 px-5 select-none text-center relative">
      {/* Luz Ambiental de Fondo del Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-12 bg-cyan-500/10 blur-xl rounded-full pointer-events-none" />

      {/* Nombre de la App */}
      <h1 className="text-[36px] font-[900] tracking-tighter leading-none mb-1.5 relative z-10">
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] text-shadow-premium transition-all duration-300">
          ShopDigital
        </span>
      </h1>

      {/* Identificación de Zona */}
      <div className="flex flex-col items-center gap-0.5 relative z-10">
        <span className="text-[12px] font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-400 via-white to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          Esteban Echeverría
        </span>
        <p className="text-[7px] font-black text-white/50 tracking-[0.3em] uppercase drop-shadow-md">
          RED COMERCIAL DIGITAL
        </p>
      </div>
    </div>
  );
};

export default Logo;