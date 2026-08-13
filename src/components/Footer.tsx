import { MetanoiaLogo } from "@/components/Navbar.tsx";
import { useSiteInfo } from "@/hooks/use-site-info.ts";

export default function Footer() {
  const info = useSiteInfo();

  return (
    <footer className="bg-[#0f1825] px-[5%] md:px-[8%] py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-4">
          <MetanoiaLogo size={32} />
        </div>
        <p className="text-white/60 text-xs tracking-wide text-center mb-4">
          {`© ${new Date().getFullYear()} Metanoia · Băcănie-butic · ${info.address}`}
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-white/50 tracking-wide">
          <span>{info.companyName}</span>
          <span>CUI: {info.cui}</span>
          <span>Reg. Com.: {info.regCom}</span>
          <a href={`mailto:${info.email}`} className="hover:text-white/80 transition-colors">
            {info.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
