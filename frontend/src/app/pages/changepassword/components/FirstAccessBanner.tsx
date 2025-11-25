export function FirstAccessBanner() {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 rounded-xl mb-6 flex gap-4 items-start">
      <div className="text-2xl sm:text-3xl flex-shrink-0">🔐</div>
      <div>
        <p className="text-base sm:text-lg font-bold m-0 mb-1">
          Primeiro Acesso
        </p>
        <p className="text-sm sm:text-base m-0 opacity-95 leading-relaxed">
          Para sua segurança, é necessário alterar a senha temporária
          enviada por email.
        </p>
      </div>
    </div>
  );
}

