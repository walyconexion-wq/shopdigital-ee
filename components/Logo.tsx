import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-2 px-6 select-none text-center">
      {/* Nombre de la App */}
      <h1 className="text-[38px] font-[900] tracking-tighter leading-none mb-1">
        <span className="text-[#0A224E]">shopdigital</span>
        <span className="text-[#FF0000]">.ar</span>
      </h1>
      
      {/* Nombre del Distrito */}
      <p className="text-[13px] font-bold text-[#0A224E]/50 tracking-[0.2em] uppercase mb-4">
        Esteban Echeverría
      </p>

      {/* Emblema del Distrito (Hojas) */}
      <div className="flex justify-center mb-2">
        <svg width="80" height="60" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Círculo Rojo de Fondo (Semicírculo) */}
          <path d="M10 75C10 30 35 5 50 5C65 5 90 30 90 75" fill="#FF0000" />
          
          {/* Hojas Verdes con bordes blancos gruesos para separar */}
          {/* Hoja Izquierda */}
          <path d="M48 75C25 75 12 60 12 45C12 35 30 30 48 45V75Z" fill="#22C55E" stroke="white" strokeWidth="3" />
          
          {/* Hoja Derecha */}
          <path d="M52 75C75 75 88 60 88 45C88 35 70 30 52 45V75Z" fill="#22C55E" stroke="white" strokeWidth="3" />
          
          {/* Hoja Central */}
          <path d="M50 72C65 72 75 40 50 10C25 40 35 72 50 72Z" fill="#15803d" stroke="white" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
};

export default Logo;