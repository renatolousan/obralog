import Image from "next/image";

export function WelcomeSection() {
  return (
    <section className="w-full lg:w-3/4 flex items-end justify-center min-h-screen overflow-hidden relative">
      
      {/* Reduzi um pouco o max-w (de 1800 para 1500) para aproximar os dois elementos naturalmente */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-center w-full max-w-[1500px] mx-auto px-4">
        
        {/* --- IMAGEM --- 
            Diminui a largura da CAIXA dele para 55% (mas ele continua gigante pelo scale-125).
            Isso libera espaço para o texto chegar mais perto.
        */}
        <div className="relative w-full md:w-[55%] h-[60vh] md:h-[85vh] flex-shrink-0 pointer-events-none md:-ml-10">
           <Image 
             src="/uploads/auth/trabalhador.png" 
             alt="Trabalhador apontando"
             fill
             className="object-contain object-bottom md:scale-125 origin-bottom"
             priority
           />
        </div>

        {/* --- TEXTO --- 
            1. Aumentei para md:w-[45%] (antes era 35%). Agora o texto respira e não quebra feio.
            2. Adicionei md:-ml-20: Isso PUXA o texto para a esquerda, em direção ao dedo.
        */}
        <div className="w-full md:w-[45%] flex flex-col justify-center text-center md:text-left p-6 md:mb-56 z-10 md:-ml-20">
          
          {/* Adicionei 'whitespace-nowrap' no span do 'Bem-vindo' para evitar que quebre "Bem-" e "vindo" */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-[#ff751f] leading-tight">
            <span className="whitespace-nowrap">Bem-vindo(a)</span> à Obralog!
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#ff751f] opacity-90">
            Garanta o controle total da sua obra com zero imprevistos.
          </p>

        </div>

      </div>
    </section>
  );
}