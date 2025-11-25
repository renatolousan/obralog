export function AnimationStyles() {
  return (
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      .animate-slide-down {
        animation: slideDown 0.3s ease-out;
      }
    `}</style>
  );
}

