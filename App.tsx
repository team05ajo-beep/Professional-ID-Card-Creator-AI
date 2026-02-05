
import React, { useState, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { 
  Camera, Upload, RefreshCw, Printer, Sparkles, User, Palette, 
  Building2, ShieldCheck, Download, Image as ImageIcon, 
  Trash2, CheckCircle2, Focus
} from 'lucide-react';
import { IDCardData, ProfessionType } from './types';
import { IDCardTemplate } from './components/IDCardTemplate';
import { generateProfessionalPhoto } from './services/geminiService';

const App: React.FC = () => {
  const [data, setData] = useState<IDCardData>({
    fullName: 'ANASTASIA',
    role: 'CHIEF FINANCIAL OFFICER',
    idNumber: '202500010009920',
    phone: '+62 812-3456-7890',
    bloodType: 'O+',
    companyName: 'PT GRAHA CITRA PRIMA',
    department: 'KEUANGAN & INVESTASI',
    address: 'Plaza Indonesia Lantai 1 No. 46-47, JL MH Thamrin, Kav. 28-30, RT.9/RW.4, Gondangdia, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10310, Indonesia',
    validUntil: '31 DESEMBER 2029',
    email: 'anastasia@grahacitra.id',
    photoUrl: null,
    logoUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&auto=format&fit=crop',
    qrValue: 'https://www.gucci.com/id/en/',
    templateColor: '#0f172a' 
  });

  const [loading, setLoading] = useState(false);
  const [profession, setProfession] = useState<ProfessionType>(ProfessionType.CORPORATE_MALE);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setIsCapturing(false);
      alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photo = canvasRef.current.toDataURL('image/png');
        setData(prev => ({ ...prev, photoUrl: photo }));
        stopCamera();
      }
    }
  };

  const transformWithAI = async () => {
    if (!data.photoUrl) {
      alert("Silakan unggah atau ambil foto terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateProfessionalPhoto(data.photoUrl, profession);
      if (result) {
        setData(prev => ({ ...prev, photoUrl: result }));
      } else {
        throw new Error("AI returned no image");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memproses foto. Pastikan wajah terlihat jelas.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async (side: 'front' | 'back') => {
    const element = document.getElementById(`id-card-${side}`);
    if (!element) return;
    
    setLoading(true);
    try {
      if (document.fonts) await document.fonts.ready;
      
      // Tunggu durasi ekstra untuk render stabil sebelum capture
      await new Promise(r => setTimeout(r, 1500));

      const dataUrl = await toPng(element, { 
        width: 360,
        height: 560,
        pixelRatio: 4, // Higher ratio for crystal clear printing
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          left: '0',
          top: '0',
          margin: '0',
          padding: '0',
          borderRadius: '0',
        }
      });
      
      if (!dataUrl || dataUrl.length < 5000) {
        throw new Error("Gagal merender gambar.");
      }

      const link = document.createElement('a');
      link.download = `ID_CARD_${data.fullName.trim().replace(/\s+/g, '_')}_${side.toUpperCase()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
      alert('Gagal mengunduh gambar. Silakan gunakan browser Chrome/Edge terbaru.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="no-print bg-white/70 backdrop-blur-2xl border-b border-slate-200 sticky top-0 z-50 px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white shadow-xl transform hover:rotate-6 transition-transform">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">ID<span className="text-indigo-600">PRO</span> STUDIO</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1">AI-Powered Identity Solutions</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <button 
            onClick={handlePrint}
            className="flex items-center space-x-3 px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black transition-all hover:bg-slate-50 shadow-sm active:scale-95"
          >
            <Printer size={20} />
            <span className="uppercase tracking-widest text-xs">Cetak PDF</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        <aside className="no-print w-full lg:w-[450px] border-r border-slate-200 bg-white overflow-y-auto p-10 space-y-12 pb-32 custom-scrollbar">
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner"><User size={22} /></div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Profil Karyawan</h3>
               </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={data.fullName}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 shadow-sm focus:border-indigo-500" 
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan Korporat</label>
                <input 
                  type="text" 
                  name="role"
                  value={data.role}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 shadow-sm focus:border-indigo-500" 
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Divisi / Departemen</label>
                <input 
                  type="text" 
                  name="department"
                  value={data.department}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 shadow-sm focus:border-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Induk Pegawai</label>
                  <input 
                    type="text" 
                    name="idNumber"
                    value={data.idNumber}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 font-mono shadow-sm focus:border-indigo-500" 
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gol. Darah</label>
                  <input 
                    type="text" 
                    name="bloodType"
                    value={data.bloodType}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 text-center shadow-sm focus:border-indigo-500" 
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Berlaku Hingga</label>
                <input 
                  type="text" 
                  name="validUntil"
                  value={data.validUntil}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 shadow-sm focus:border-indigo-500" 
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Kantor</label>
                <textarea 
                  name="address"
                  value={data.address}
                  onChange={(e: any) => setData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 shadow-sm text-[11px] leading-relaxed min-h-[100px] focus:border-indigo-500" 
                />
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl shadow-inner"><Sparkles size={22} /></div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">AI Headshot Studio</h3>
               </div>
            </div>
            
            <div className="bg-slate-900 rounded-[36px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl mb-8 flex items-start space-x-3">
                 <Focus size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-indigo-200 font-medium leading-relaxed">
                   AI akan menyempurnakan posisi tubuh agar menghadap depan sesuai standar ID Card profesional.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-8">
                 <label className="cursor-pointer group flex flex-col items-center justify-center p-6 rounded-[28px] border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all">
                    <Upload size={24} className="text-slate-500 group-hover:text-indigo-400 mb-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Impor Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </label>
                 <button 
                  onClick={isCapturing ? takePhoto : startCamera}
                  className="flex flex-col items-center justify-center p-6 rounded-[28px] border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all"
                 >
                    <Camera size={24} className="text-slate-500 hover:text-indigo-400 mb-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white">{isCapturing ? 'Ambil Foto' : 'Webcam'}</span>
                 </button>
              </div>

              {isCapturing && (
                <div className="relative rounded-[28px] overflow-hidden mb-8 aspect-square bg-slate-800 border border-slate-700">
                   <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                   <button onClick={stopCamera} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-lg"><Trash2 size={18} /></button>
                </div>
              )}

              <div className="space-y-4 mb-8">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pilihan Busana</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setProfession(ProfessionType.CORPORATE_MALE)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${profession === ProfessionType.CORPORATE_MALE ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                    >
                      Jas Pria
                    </button>
                    <button 
                      onClick={() => setProfession(ProfessionType.CORPORATE_FEMALE)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${profession === ProfessionType.CORPORATE_FEMALE ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                    >
                      Jas Wanita
                    </button>
                 </div>
              </div>

              <button 
                disabled={loading || !data.photoUrl}
                onClick={transformWithAI}
                className="w-full flex items-center justify-center space-x-4 py-5 bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-[1.02] active:scale-95 text-white rounded-[28px] font-black uppercase tracking-[0.25em] transition-all shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] disabled:opacity-30 disabled:grayscale"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                <span className="text-xs">{loading ? "Memproses..." : "Render AI"}</span>
              </button>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner"><Building2 size={22} /></div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Branding Identitas</h3>
               </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Perusahaan</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={data.companyName}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none font-black text-indigo-700 uppercase tracking-tight shadow-sm focus:border-indigo-500" 
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo Brand</label>
                <div className="flex items-center space-x-5 p-5 bg-slate-50/50 rounded-[28px] border border-slate-200 shadow-inner">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {data.logoUrl ? (
                      <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" crossOrigin="anonymous" />
                    ) : (
                      <ImageIcon size={24} className="text-slate-300" />
                    )}
                  </div>
                  <label className="cursor-pointer flex-1 py-3 px-5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-indigo-600 transition-all text-center shadow-sm">
                    Ganti Logo
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Kartu</label>
                <div className="flex flex-wrap gap-4">
                  {['#0f172a', '#1e40af', '#10b981', '#f59e0b', '#dc2626'].map(color => (
                    <button 
                      key={color}
                      onClick={() => setData(prev => ({...prev, templateColor: color}))}
                      className={`w-11 h-11 rounded-2xl border-4 transition-all hover:scale-110 ${data.templateColor === color ? 'border-white ring-4 ring-indigo-500/20 scale-105 shadow-xl' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:scale-110 transition-transform flex items-center justify-center bg-white">
                     <Palette size={18} className="text-slate-400 pointer-events-none" />
                     <input type="color" value={data.templateColor} onChange={(e) => setData(prev => ({...prev, templateColor: e.target.value}))} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section className="flex-1 bg-[#f4f7fa] overflow-y-auto p-10 lg:p-20 print-area relative">
          <div className="max-w-6xl mx-auto space-y-24 relative z-10">
            <div className="no-print flex flex-col items-center text-center space-y-6">
               <div className="inline-flex items-center space-x-3 px-6 py-2 bg-white/80 backdrop-blur-md text-slate-900 rounded-full text-[11px] font-black uppercase tracking-[0.4em] shadow-xl border border-white/50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>High-Fidelity Rendering Mode</span>
               </div>
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Identity <br/>Luxury Studio</h2>
            </div>

            <div className="flex flex-col xl:flex-row gap-20 items-center justify-center">
              <div className="flex flex-col items-center space-y-8">
                 <div className="no-print flex items-center justify-between w-full px-4">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Sisi Depan</span>
                    <button 
                      onClick={() => downloadCard('front')} 
                      className="flex items-center space-x-3 px-5 py-2.5 bg-white hover:bg-slate-900 hover:text-white rounded-2xl shadow-xl transition-all active:scale-95 border border-slate-100 font-black text-[10px] uppercase tracking-widest"
                    >
                      <Download size={16} />
                      <span>Simpan PNG</span>
                    </button>
                 </div>
                 <IDCardTemplate data={data} side="front" />
              </div>

              <div className="flex flex-col items-center space-y-8">
                 <div className="no-print flex items-center justify-between w-full px-4">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Sisi Belakang</span>
                    <button 
                      onClick={() => downloadCard('back')} 
                      className="flex items-center space-x-3 px-5 py-2.5 bg-white hover:bg-slate-900 hover:text-white rounded-2xl shadow-xl transition-all active:scale-95 border border-slate-100 font-black text-[10px] uppercase tracking-widest"
                    >
                      <Download size={16} />
                      <span>Simpan PNG</span>
                    </button>
                 </div>
                 <IDCardTemplate data={data} side="back" />
              </div>
            </div>

            <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pb-20">
               <div className="bg-white p-10 rounded-[40px] shadow-xl border border-white/50 flex flex-col items-center text-center group hover:bg-slate-900 transition-all duration-500">
                  <div className="w-16 h-16 bg-slate-50 rounded-[22px] flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors"><CheckCircle2 size={30} className="text-emerald-500" /></div>
                  <h4 className="font-black text-slate-900 group-hover:text-white uppercase tracking-wider mb-3">ISO Standard</h4>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-500 font-medium">Dimensi mengikuti standar internasional ISO/IEC 7810 ID-1.</p>
               </div>
               <div className="bg-white p-10 rounded-[40px] shadow-xl border border-white/50 flex flex-col items-center text-center group hover:bg-indigo-600 transition-all duration-500">
                  <div className="w-16 h-16 bg-slate-50 rounded-[22px] flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors"><ImageIcon size={30} className="text-indigo-600 group-hover:text-white" /></div>
                  <h4 className="font-black text-slate-900 group-hover:text-white uppercase tracking-wider mb-3">Photo Realistic</h4>
                  <p className="text-[11px] text-slate-400 group-hover:text-indigo-200 font-medium">Tekstur kulit dan busana diproses secara detail oleh AI.</p>
               </div>
               <div className="bg-white p-10 rounded-[40px] shadow-xl border border-white/50 flex flex-col items-center text-center group hover:bg-slate-900 transition-all duration-500">
                  <div className="w-16 h-16 bg-slate-50 rounded-[22px] flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors"><Download size={30} className="text-slate-900 group-hover:text-white" /></div>
                  <h4 className="font-black text-slate-900 group-hover:text-white uppercase tracking-wider mb-3">4K PNG Ready</h4>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-500 font-medium">Hasil ekspor tajam dan siap cetak pada kartu PVC fisik.</p>
               </div>
            </div>
          </div>
        </section>
      </main>

      <canvas ref={canvasRef} className="hidden" />
      
      {loading && (
        <div className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
          <div className="bg-white p-12 rounded-[56px] shadow-2xl flex flex-col items-center max-w-sm w-full animate-in zoom-in duration-300">
             <div className="relative mb-10">
                <div className="w-32 h-32 border-[8px] border-slate-50 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600"><Sparkles size={40} className="animate-pulse" /></div>
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Identity Rendering</h3>
             <p className="text-slate-400 text-xs font-medium leading-relaxed">Menyiapkan aset visual kualitas tinggi. Harap jangan tutup jendela ini...</p>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
