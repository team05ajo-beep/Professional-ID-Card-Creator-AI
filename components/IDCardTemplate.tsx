
import React, { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { Hash, Briefcase, ShieldCheck, Globe, Calendar, MapPin } from 'lucide-react';
import { IDCardData } from '../types';

interface IDCardTemplateProps {
  data: IDCardData;
  side: 'front' | 'back';
}

export const IDCardTemplate: React.FC<IDCardTemplateProps> = ({ data, side }) => {
  const primaryColor = data.templateColor || '#0c0e12';
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (side === 'back' && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, data.idNumber, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.5, 
          height: 35,
          displayValue: false,
          margin: 0, 
          background: "transparent"
        });
      } catch (e) {
        console.error("Barcode generation failed", e);
      }
    }
  }, [side, data.idNumber]);

  const qrUrl = data.qrValue || "https://google.com";

  const getFontSize = (text: string, baseSize: number, maxLength: number) => {
    if (!text) return `${baseSize}px`;
    if (text.length > maxLength) {
      const scaleFactor = Math.max(0.45, 1 - (text.length - maxLength) / (maxLength * 1.2));
      return `${baseSize * scaleFactor}px`;
    }
    return `${baseSize}px`;
  };

  if (side === 'front') {
    return (
      <div 
        id="id-card-front"
        className="relative w-[360px] h-[560px] bg-white shadow-2xl overflow-hidden rounded-[32px] border border-slate-200 flex flex-col select-none box-border"
        style={{ minWidth: '360px', maxWidth: '360px', minHeight: '560px', maxHeight: '560px' }}
      >
        <div className="absolute inset-0 card-pattern opacity-20 pointer-events-none"></div>
        
        {/* Lanyard Hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-2 bg-slate-200/40 rounded-full z-20"></div>

        {/* Simplified Header */}
        <div 
          className="h-40 w-full absolute top-0 left-0 z-0"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
          }}
        >
          <div className="p-7 flex items-center space-x-4 text-white">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
              {data.logoUrl ? (
                <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" crossOrigin="anonymous" />
              ) : (
                <span className="font-black text-xl text-slate-900">{data.companyName.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span 
                className="font-black tracking-tight uppercase leading-none" 
                style={{ fontSize: getFontSize(data.companyName, 13, 22) }}
              >
                {data.companyName}
              </span>
              <span className="text-[8px] font-bold text-white/50 uppercase tracking-[0.3em] mt-1">Digital Identity</span>
            </div>
          </div>
        </div>

        {/* Pas Foto 3x4 Style Section */}
        <div className="mt-[72px] relative z-10 flex flex-col items-center shrink-0">
          <div className="w-36 h-48 border-[6px] border-white shadow-2xl bg-red-600 rounded-[24px] overflow-hidden relative z-10">
            {data.photoUrl ? (
              <img 
                src={data.photoUrl} 
                alt="Portrait" 
                className="w-full h-full object-cover object-center" 
                crossOrigin="anonymous" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 bg-red-600 italic text-[10px]">
                Pas Foto 3x4
              </div>
            )}
            <div className="absolute inset-0 glossy-overlay opacity-10 pointer-events-none"></div>
          </div>
        </div>

        {/* Simplified Name Section */}
        <div className="px-8 text-center z-10 flex flex-col items-center mt-3 shrink-0">
          <h2 
            className="font-black uppercase tracking-tight leading-tight text-slate-950" 
            style={{ fontSize: getFontSize(data.fullName, 22, 18) }}
          >
            {data.fullName || "NAMA LENGKAP"}
          </h2>
          <div className="mt-1 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 inline-block">
             <p className="font-bold text-slate-600 uppercase tracking-widest text-[8px] whitespace-nowrap">
                {data.role || "JABATAN"}
             </p>
          </div>
        </div>

        {/* Lean Info Container */}
        <div className="mt-4 px-8 flex-1 flex flex-col space-y-2 z-10 overflow-hidden pb-2">
          {/* ID Row */}
          <div className="bg-white border border-slate-100 rounded-2xl p-2.5 flex items-center space-x-3 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-50">
               <Hash size={12} style={{ color: primaryColor }} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">ID Number</span>
              <span className="text-[11px] font-bold text-slate-950 font-mono tracking-wider leading-none">
                {data.idNumber}
              </span>
            </div>
          </div>

          {/* Dept Row */}
          <div className="bg-white border border-slate-100 rounded-2xl p-2.5 flex items-center space-x-3 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-50">
               <Briefcase size={12} style={{ color: primaryColor }} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Department</span>
              <span 
                className="font-bold text-slate-950 uppercase leading-none"
                style={{ fontSize: getFontSize(data.department, 9, 25) }}
              >
                {data.department || "N/A"}
              </span>
            </div>
          </div>

          {/* Status Row */}
          <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-2.5 flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
               <Globe size={12} className="text-emerald-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[6px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-0.5">Access Authority</span>
              <span className="text-[8px] font-black text-emerald-700 uppercase tracking-[0.2em] leading-none">VERIFIED ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Compact Footer Area */}
        <div className="h-28 w-full relative mt-auto shrink-0 flex items-end">
           <div 
             className="absolute inset-0"
             style={{ 
               background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}ee)`,
               clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)' 
             }}
           />
           <div className="relative w-full px-8 pb-8 flex justify-between items-end z-10">
              <div className="flex flex-col items-start">
                 <span className="text-[6px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">OFFICIAL DOCUMENT</span>
                 <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">SECURE IDENTITY</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg shadow-xl border border-white/20">
                <QRCodeSVG value={qrUrl} size={42} marginSize={1} />
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="id-card-back"
      className="relative w-[360px] h-[560px] bg-[#0c0e12] shadow-2xl overflow-hidden rounded-[32px] border border-slate-800 flex flex-col text-white select-none box-border"
      style={{ minWidth: '360px', maxWidth: '360px', minHeight: '560px', maxHeight: '560px' }}
    >
      <div className="absolute inset-0 card-pattern opacity-10 pointer-events-none"></div>
      
      <div 
          className="h-28 w-full absolute top-0 left-0"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, #111)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 70%)',
          }}
      />
      
      <div className="mt-24 px-8 flex-1 relative z-10 flex flex-col">
        <div className="flex items-center space-x-3 mb-6">
           <ShieldCheck size={18} className="text-indigo-400" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Terms of Use</h3>
        </div>
        
        <ul className="text-[9px] space-y-4 text-slate-400 font-medium leading-relaxed">
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
            <span>This card is the exclusive property of <strong>{data.companyName}</strong>.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
            <span>Unauthorized use or transfer to third parties is strictly prohibited.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
            <span>If found, please return to the office address listed below.</span>
          </li>
        </ul>

        <div className="mt-auto mb-8 pt-6 border-t border-white/5 space-y-4">
           <div className="flex items-center space-x-3">
              <Calendar size={14} className="text-slate-500" />
              <div className="flex flex-col">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Valid Until</span>
                <span className="text-[10px] font-bold text-slate-200 uppercase">{data.validUntil}</span>
              </div>
           </div>
           
           <div className="flex items-center space-x-3">
              <MapPin size={14} className="text-slate-500" />
              <div className="flex flex-col min-w-0">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Office Location</span>
                <span className="text-[8px] font-bold text-slate-300 leading-tight truncate uppercase">
                  {data.address || "Company Address"}
                </span>
              </div>
           </div>
        </div>
      </div>

      <div className="px-8 pb-12 shrink-0">
         <div className="w-full bg-white rounded-2xl flex flex-col items-center justify-center shadow-lg overflow-hidden">
            <div className="py-4 w-full flex items-center justify-center px-4">
               <svg ref={barcodeRef} className="max-w-full h-[35px]"></svg>
            </div>
            <div className="w-full bg-slate-50 py-2.5 flex justify-center border-t border-slate-100">
               <span className="text-[10px] font-mono font-black text-slate-950 tracking-[0.4em]">{data.idNumber}</span>
            </div>
         </div>
      </div>

      <div className="pb-8 text-center shrink-0">
        <span className="text-[8px] text-slate-700 font-black uppercase tracking-[0.5em]">SECURE ENCRYPTED ID</span>
      </div>
    </div>
  );
};
