// Animated ticker band
export default function Ticker() {
  const items = [
    "CAFEA NESPRESSO", "LIMONADĂ & FRESH", "SANDWICH-URI PE LOC",
    "DULCE LA DOZĂ", "BORCANELE METANOIA", "PRODUSE LOCALE",
    "DN 68 · TOTEȘTI · HAȚEG",
  ];

  const repeated = [...items, ...items];

  return (
    <div className="bg-primary py-2.5 overflow-hidden whitespace-nowrap relative z-10">
      <div className="inline-flex gap-12 animate-[slide_28s_linear_infinite]">
        {repeated.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-12">
            <span className="text-[10px] font-bold tracking-[3.5px] uppercase text-white">{t}</span>
            <span className="text-white/30 text-xs">✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
