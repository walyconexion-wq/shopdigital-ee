import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-0.5 pb-0.5 px-4 select-none text-center">
      {/* Nombre de la App */}
      <h1 className="text-[28px] font-[900] tracking-tighter leading-none mb-1">
        <span className="text-[#22d3ee] drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] text-shadow-premium">ShopDigital</span>
      </h1>

      {/* Identificación de Zona */}
      <p className="text-[7px] font-black text-white/40 tracking-[0.3em] uppercase mt-0.5 drop-shadow-md">
        RED COMERCIAL DIGITAL
      </p>
    </div>
  );
};

export default Logo;