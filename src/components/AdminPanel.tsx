import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, X, Image as ImageIcon, Video, Settings, Scissors, Calendar, Upload, Check, Clock, LayoutDashboard, BarChart3, Users, Eye } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = async () => {
  let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  let supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    try {
      const res = await fetch('/api/supabase-config');
      if (res.ok) {
        const config = await res.json();
        supabaseUrl = config.url;
        supabaseKey = config.anonKey;
      }
    } catch (e) {
      console.error("Failed to fetch Supabase config:", e);
    }
  }

  if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === "" || supabaseKey.trim() === "") {
    throw new Error("Configuração do Supabase ausente. Verifique SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente do projeto.");
  }

  try {
    new URL(supabaseUrl);
  } catch (e) {
    throw new Error(`A URL do Supabase fornecida é inválida: "${supabaseUrl}". Certifique-se de que começa com https://`);
  }

  return createClient(supabaseUrl, supabaseKey);
};

interface AdminProps {
  onClose: () => void;
  initialData: any;
  onUpdate: () => void;
}

export default function AdminPanel({ onClose, initialData, onUpdate }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'services' | 'midia' | 'agenda'>('dashboard');
  
  const [settings, setSettings] = useState(initialData.settings);
  const [services, setServices] = useState(initialData.services);
  const [plans, setPlans] = useState(() => {
    try {
      return initialData.settings.plans ? JSON.parse(initialData.settings.plans) : [
        { name: "Barba Ilimitada", price: "135", save: "22%", cuts: "Ilimitado" },
        { name: "Corte Ilimitado", price: "75", save: "", cuts: "Ilimitado" },
        { name: "Cabelo e Barba Ilimitado", price: "135", save: "15%", cuts: "Ilimitado" }
      ];
    } catch {
      return [];
    }
  });
  const [gallery, setGallery] = useState(initialData.gallery.map((g: any) => g.url));
  const [videoGallery, setVideoGallery] = useState(initialData.video_gallery?.map((v: any) => v.url) || []);
  const [appointments, setAppointments] = useState(initialData.appointments || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingGalleryVideo, setIsUploadingGalleryVideo] = useState(false);
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);
  const [galleryImageUploadProgress, setGalleryImageUploadProgress] = useState(0);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryVideoInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalSettings = { ...settings, plans: JSON.stringify(plans) };
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: finalSettings })
      });
      await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services })
      });
      await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery })
      });
      await fetch('/api/admin/video-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_gallery: videoGallery })
      });
      onUpdate();
      alert('Informações atualizadas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const supabase = await getSupabase();
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('barber-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('barber-assets')
        .getPublicUrl(fileName);

      setSettings({ ...settings, hero_video: publicUrl });
      alert('Vídeo principal enviado com sucesso!');
    } catch (error: any) {
      console.error("Upload error:", error);
      alert('Erro ao enviar vídeo: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoUploadProgress(0);

    try {
      const supabase = await getSupabase();
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('barber-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('barber-assets')
        .getPublicUrl(fileName);

      setSettings({ ...settings, logo_url: publicUrl });
      alert('Logo enviada com sucesso!');
    } catch (error: any) {
      console.error("Upload error:", error);
      alert('Erro ao enviar logo: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsUploadingLogo(false);
      setLogoUploadProgress(0);
    }
  };

  const handleGalleryVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGalleryVideo(true);
    setGalleryUploadProgress(0);

    try {
      const supabase = await getSupabase();
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery-video-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('barber-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('barber-assets')
        .getPublicUrl(fileName);

      setVideoGallery(prev => [...prev, publicUrl]);
      alert('Vídeo da galeria enviado com sucesso!');
      onUpdate();
    } catch (error: any) {
      console.error("Upload error:", error);
      alert('Erro ao enviar vídeo da galeria: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsUploadingGalleryVideo(false);
      setGalleryUploadProgress(0);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGalleryImage(true);
    setGalleryImageUploadProgress(0);

    try {
      const supabase = await getSupabase();
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery-image-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('barber-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('barber-assets')
        .getPublicUrl(fileName);

      setGallery([...gallery, publicUrl]);
      alert('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error("Upload error:", error);
      alert('Erro ao enviar imagem: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsUploadingGalleryImage(false);
      setGalleryImageUploadProgress(0);
    }
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('Excluir este agendamento?')) return;
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE'
      });
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const pendingAppointmentsCount = appointments.filter((a: any) => a.status === 'Pendente').length;

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex overflow-hidden text-zinc-100">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-800">
          <Scissors className="text-gold w-8 h-8" />
          <h1 className="text-xl font-serif font-bold italic text-white leading-none">Painel<br/><span className="text-gold text-sm tracking-widest">ADMIN</span></h1>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard & Analytics', icon: LayoutDashboard },
            { id: 'agenda', label: 'Agendamentos', icon: Calendar, badge: pendingAppointmentsCount > 0 ? pendingAppointmentsCount : null },
            { id: 'config', label: 'Configurações Gerais', icon: Settings },
            { id: 'services', label: 'Serviços & Planos', icon: Scissors },
            { id: 'midia', label: 'Mídia & Galeria', icon: ImageIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-gold/10 text-gold border border-gold/20' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
            <X className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
        {/* Topbar Actions */}
        <div className="h-20 px-8 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md absolute top-0 w-full z-10">
          <h2 className="text-xl font-bold text-white">
            {activeTab === 'dashboard' && 'Visão Geral'}
            {activeTab === 'agenda' && 'Gestão de Agendamentos'}
            {activeTab === 'config' && 'Informações do Sistema'}
            {activeTab === 'services' && 'Serviços e Preços'}
            {activeTab === 'midia' && 'Central de Mídia'}
          </h2>
          <div className="flex gap-4">
            {activeTab !== 'dashboard' && activeTab !== 'agenda' && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gold text-zinc-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gold/90 transition-all shadow-lg shadow-gold/10 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-28">
          <div className="max-w-5xl mx-auto w-full">

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-zinc-400 text-sm font-medium">Acessos Hoje</div>
                      <Eye className="w-5 h-5 text-gold" />
                    </div>
                    <div className="text-3xl font-bold text-white">1,284</div>
                    <div className="text-xs text-green-400 mt-2 flex items-center gap-1">↑ 12% vs ontem</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-zinc-400 text-sm font-medium">Agendamentos (Mês)</div>
                      <Calendar className="w-5 h-5 text-gold" />
                    </div>
                    <div className="text-3xl font-bold text-white">{appointments.length}</div>
                    <div className="text-xs text-green-400 mt-2 flex items-center gap-1">↑ Novos clientes ativos</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-zinc-400 text-sm font-medium">Cliques no WhatsApp</div>
                      <BarChart3 className="w-5 h-5 text-gold" />
                    </div>
                    <div className="text-3xl font-bold text-white">342</div>
                    <div className="text-xs text-green-400 mt-2 flex items-center gap-1">Alta conversão</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-zinc-400 text-sm font-medium">Assinantes</div>
                      <Users className="w-5 h-5 text-gold" />
                    </div>
                    <div className="text-3xl font-bold text-white">89</div>
                    <div className="text-xs text-zinc-500 mt-2">Planos recorrentes</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-gold" /> Próximos Atendimentos</h3>
                  <div className="divide-y divide-zinc-800">
                    {appointments.slice(0, 5).map((app: any) => (
                      <div key={app.id} className="py-4 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">{app.client_name}</div>
                          <div className="text-sm text-zinc-400">{app.service_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gold font-bold">{app.time}</div>
                          <div className="text-xs text-zinc-500">{app.date}</div>
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 && <div className="text-zinc-500 italic py-4">Sem agendamentos recentes.</div>}
                  </div>
                </div>
              </div>
            )}

            {/* CONFIG TAB */}
            {activeTab === 'config' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                    <div className="md:col-span-2 mb-2 border-b border-zinc-800 pb-4">
                      <h3 className="text-lg font-bold text-white">Textos Principais</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Título Principal (Hero)</label>
                      <input
                        type="text"
                        value={settings.hero_title || ''}
                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Subtítulo Hero</label>
                      <textarea
                        value={settings.hero_subtitle || ''}
                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none h-24 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                    <div className="md:col-span-2 mb-2 border-b border-zinc-800 pb-4">
                      <h3 className="text-lg font-bold text-white">Contato e Redes Sociais</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">WhatsApp (com DDD)</label>
                      <input
                        type="text"
                        value={settings.whatsapp_number || ''}
                        onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Endereço Completo</label>
                      <input
                        type="text"
                        value={settings.address || ''}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Instagram (@)</label>
                      <input
                        type="text"
                        value={settings.instagram_handle || ''}
                        onChange={(e) => setSettings({ ...settings, instagram_handle: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Link do Instagram</label>
                      <input
                        type="text"
                        value={settings.instagram_link || ''}
                        onChange={(e) => setSettings({ ...settings, instagram_link: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                    <div className="md:col-span-4 mb-2 border-b border-zinc-800 pb-4">
                      <h3 className="text-lg font-bold text-white">Estatísticas da Home</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Anos de Tradição</label>
                      <input
                        value={settings.stat_anos || '5+'}
                        onChange={(e) => setSettings({ ...settings, stat_anos: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Clientes</label>
                      <input
                        value={settings.stat_clientes || '5000+'}
                        onChange={(e) => setSettings({ ...settings, stat_clientes: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Avaliação</label>
                      <input
                        value={settings.stat_nota || '5.0/5'}
                        onChange={(e) => setSettings({ ...settings, stat_nota: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Atendimento</label>
                      <input
                        value={settings.stat_atendimento || 'Premium'}
                        onChange={(e) => setSettings({ ...settings, stat_atendimento: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none text-white"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Cortes e Serviços</h3>
                    <button
                      onClick={() => setServices([...services, { name: '', price: '', desc: '' }])}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4 text-gold" /> Novo Serviço
                    </button>
                  </div>
                  <div className="space-y-4">
                    {services.map((service: any, i: number) => (
                      <div key={i} className="flex gap-4 items-center bg-zinc-950 p-4 rounded-2xl border border-zinc-800 group">
                        <div className="flex-1 grid md:grid-cols-3 gap-4">
                          <input
                            placeholder="Nome do Serviço"
                            value={service.name}
                            onChange={(e) => {
                              const newServices = [...services];
                              newServices[i].name = e.target.value;
                              setServices(newServices);
                            }}
                            className="bg-transparent border-b border-zinc-800 p-2 focus:border-gold outline-none text-white"
                          />
                          <input
                            placeholder="Preço (R$)"
                            value={service.price}
                            onChange={(e) => {
                              const newServices = [...services];
                              newServices[i].price = e.target.value;
                              setServices(newServices);
                            }}
                            className="bg-transparent border-b border-zinc-800 p-2 focus:border-gold outline-none text-gold font-bold"
                          />
                          <input
                            placeholder="Breve descrição"
                            value={service.desc}
                            onChange={(e) => {
                              const newServices = [...services];
                              newServices[i].desc = e.target.value;
                              setServices(newServices);
                            }}
                            className="bg-transparent border-b border-zinc-800 p-2 focus:border-gold outline-none text-white"
                          />
                        </div>
                        <button
                          onClick={() => setServices(services.filter((_: any, idx: number) => idx !== i))}
                          className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Planos de Assinatura</h3>
                    <button
                      onClick={() => setPlans([...plans, { name: '', price: '', save: '', cuts: 'Ilimitado' }])}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4 text-gold" /> Novo Plano
                    </button>
                  </div>
                  <div className="space-y-4">
                    {plans.map((plan: any, i: number) => (
                      <div key={i} className="flex gap-4 items-center bg-zinc-950 p-4 rounded-2xl border border-zinc-800 group">
                        <div className="flex-1 grid md:grid-cols-4 gap-4">
                          <input
                            placeholder="Nome do Plano"
                            value={plan.name}
                            onChange={(e) => {
                              const newPlans = [...plans];
                              newPlans[i].name = e.target.value;
                              setPlans(newPlans);
                            }}
                            className="bg-transparent border-b border-zinc-800 p-2 focus:border-gold outline-none text-white font-bold"
                          />
                          <input
                            placeholder="Preço Mensal"
                            value={plan.price}
                            onChange={(e) => {
                              const newPlans = [...plans];
                              newPlans[i].price = e.target.value;
                              setPlans(newPlans);
                            }}
                            className="bg-transparent border-b border-zinc-800 p-2 focus:border-gold outline-none text-gold"
                          />
                          <input
                            placeholder="Economia (Ex: 20%)"
                            value={plan.save}
                            onChange={(e) => {
                              const newPlans = [...plans];
                              newPlans[i].save = e.target.value;
                              setPlans(newPlans);
                            }}
                            className="bg-transparent border-b border-zinc-800 p-2 focus:border-green-500 outline-none text-green-400"
                          />
                          <input
                            placeholder="Qtd. Cortes"
                            value={plan.cuts}
                            onChange={(e) => {
                              const newPlans = [...plans];
                              newPlans[i].cuts = e.target.value;
                              setPlans(newPlans);
                            }}
                            className="bg-transparent border-b border-zinc-800 p-2 focus:border-gold outline-none text-white"
                          />
                        </div>
                        <button
                          onClick={() => setPlans(plans.filter((_: any, idx: number) => idx !== i))}
                          className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* MIDIA TAB */}
            {activeTab === 'midia' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                  <h3 className="text-xl font-bold text-white mb-6">Identidade Visual</h3>
                  
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold block">Logo Principal</label>
                      <div className="flex flex-col gap-4">
                        <div className="h-32 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                          {settings.logo_url ? (
                            <img src={settings.logo_url} alt="Logo" className="h-20 object-contain" />
                          ) : (
                            <span className="text-zinc-600 text-sm">Sem Logomarca</span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                            <button onClick={() => logoInputRef.current?.click()} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                              <Upload className="w-4 h-4" /> Alterar Logo
                            </button>
                          </div>
                        </div>
                        {isUploadingLogo && <div className="text-xs text-gold animate-pulse">Enviando logo...</div>}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs text-zinc-400 uppercase tracking-widest font-semibold block">Vídeo de Fundo (Capa)</label>
                      <div className="flex flex-col gap-4">
                        <div className="h-32 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                          {settings.hero_video ? (
                            <video src={settings.hero_video} className="w-full h-full object-cover opacity-50" muted />
                          ) : (
                            <span className="text-zinc-600 text-sm">Sem Vídeo</span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" className="hidden" />
                            <button onClick={() => videoInputRef.current?.click()} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                              <Upload className="w-4 h-4" /> Alterar Vídeo
                            </button>
                          </div>
                        </div>
                        {isUploading && (
                          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden mt-2 border border-zinc-800">
                            <div className="bg-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Álbum de Imagens</h3>
                      <p className="text-sm text-zinc-400 mt-1">Cortes, espaço e clientes</p>
                    </div>
                    <div className="flex gap-3">
                      <input type="file" ref={galleryImageInputRef} onChange={handleGalleryImageUpload} accept="image/*" className="hidden" />
                      <button onClick={() => galleryImageInputRef.current?.click()} disabled={isUploadingGalleryImage} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                        <Upload className="w-4 h-4 text-gold" /> {isUploadingGalleryImage ? 'Enviando...' : 'Upload PC'}
                      </button>
                      <button onClick={() => setGallery([...gallery, ''])} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                        <Plus className="w-4 h-4 text-gold" /> Adicionar Link
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery.map((url: string, i: number) => (
                      <div key={i} className="group relative aspect-square bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner">
                        {url ? (
                          <img src={url} alt={`Galeria ${i}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <input
                              placeholder="Cole a URL da Imagem"
                              value={url}
                              onChange={(e) => {
                                const newGallery = [...gallery];
                                newGallery[i] = e.target.value;
                                setGallery(newGallery);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs focus:border-gold outline-none text-center"
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                          <button onClick={() => setGallery(gallery.filter((_: any, idx: number) => idx !== i))} className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-xl" title="Remover">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Álbum de Vídeos</h3>
                      <p className="text-sm text-zinc-400 mt-1">Reels e vídeos do salão</p>
                    </div>
                    <div className="flex gap-3">
                      <input type="file" ref={galleryVideoInputRef} onChange={handleGalleryVideoUpload} accept="video/*" className="hidden" />
                      <button onClick={() => galleryVideoInputRef.current?.click()} disabled={isUploadingGalleryVideo} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                        <Upload className="w-4 h-4 text-gold" /> {isUploadingGalleryVideo ? 'Enviando...' : 'Upload PC'}
                      </button>
                      <button onClick={() => setVideoGallery([...videoGallery, ''])} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                        <Plus className="w-4 h-4 text-gold" /> Adicionar Link
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videoGallery.map((url: string, i: number) => (
                      <div key={i} className="group relative aspect-video bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner">
                        {url ? (
                          <video src={url} className="w-full h-full object-cover" muted loop playsInline />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <input
                              placeholder="Cole a URL do Vídeo"
                              value={url}
                              onChange={(e) => {
                                const newVideoGallery = [...videoGallery];
                                newVideoGallery[i] = e.target.value;
                                setVideoGallery(newVideoGallery);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs focus:border-gold outline-none text-center"
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                          <button onClick={() => setVideoGallery(videoGallery.filter((_: any, idx: number) => idx !== i))} className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-xl" title="Remover Vídeo">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* AGENDA TAB */}
            {activeTab === 'agenda' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="text-gold w-6 h-6" /> 
                      Agendamentos Online ({appointments.length})
                    </h3>
                  </div>
                  
                  <div className="overflow-hidden rounded-2xl border border-zinc-800">
                    <table className="w-full text-left border-collapse bg-zinc-950">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs uppercase tracking-widest">
                          <th className="p-4 font-semibold">Cliente</th>
                          <th className="p-4 font-semibold">Serviço</th>
                          <th className="p-4 font-semibold">Data/Hora</th>
                          <th className="p-4 font-semibold">Status</th>
                          <th className="p-4 font-semibold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {appointments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-zinc-500 italic">Nenhum agendamento registrado ainda.</td>
                          </tr>
                        ) : (
                          appointments.map((app: any) => (
                            <tr key={app.id} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="p-4 font-bold text-white">{app.client_name}</td>
                              <td className="p-4 text-zinc-300">{app.service_name}</td>
                              <td className="p-4 text-zinc-400">
                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold/50" /> {app.date}</div>
                                <div className="flex items-center gap-2 mt-1"><Clock className="w-4 h-4 text-gold/50" /> {app.time}</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  app.status === 'Concluído' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                  app.status === 'Cancelado' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                  'bg-gold/10 text-gold border-gold/20'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => updateAppointmentStatus(app.id, 'Concluído')}
                                    className="p-2 text-green-400 bg-green-500/10 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                                    title="Marcar como Concluído"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteAppointment(app.id)}
                                    className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                    title="Excluir Agendamento"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
