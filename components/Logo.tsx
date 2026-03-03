import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-0.5 pb-0.5 px-4 select-none text-center">
      {/* Nombre de la App */}
      <h1 className="text-[28px] font-[900] tracking-tighter leading-none mb-0.5">
        <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] text-shadow-premium">shopdigital</span>
        <span className="text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] text-shadow-premium">.ar</span>
      </h1>

      {/* Nombre del Distrito */}
      <p className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase mb-1 drop-shadow-[0_0_5px_rgba(0,158,227,0.5)]">
        Esteban Echeverría
      </p>

      {/* Emblema del Distrito (Hojas) */}
      <div className="flex justify-center mb-0">
        <svg width="40" height="30" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Círculo Rojo de Fondo (Semicírculo) */}
          <path d="M10 75C10 30 35 5 50 5C65 5 90 30 90 75" fill="#FF0000" />

          {/* Hojas Verdes con bordes blancos gruesos para separar */}
          <path d="M48 75C25 75 12 60 12 45C12 35 30 30 48 45V75Z" fill="#22C55E" stroke="white" strokeWidth="3" />
          <path d="M52 75C75 75 88 60 88 45C88 35 70 30 52 45V75Z" fill="#22C55E" stroke="white" strokeWidth="3" />
          <path d="M50 72C65 72 75 40 50 10C25 40 35 72 50 72Z" fill="#15803d" stroke="white" strokeWidth="3" />
        </svg>
      </div>

      {/* Identificación de Zona */}
      <p className="text-[7px] font-black text-white/40 tracking-[0.3em] uppercase mt-0.5 drop-shadow-md">
        ZONA:001/BAIRES - REPUBLICA ARGENTINA
      </p>
    </div>
  );
};

export default Logo;