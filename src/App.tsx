import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Crown,
  Images,
  Loader2,
  MessageCircle,
  Scissors,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Instagram,
  MapPin
} from 'lucide-react';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import AdminPanel from './components/AdminPanel';
import { fetchContentFromSupabase, supabase } from './lib/supabaseClient';

const DEFAULT_WHATSAPP_NUMBER = '5511999999999';
const SUPABASE_ASSET_BASE_URL = 'https://oacqvijuafuzsbyyqdtt.supabase.co/storage/v1/object/public/barber-assets';
const HERO_VIDEO_PRIMARY = 'https://oacqvijuafuzsbyyqdtt.supabase.co/storage/v1/object/public/barber-assets/gallery-video-1771970955047.MOV';
const HERO_VIDEO_FALLBACK = 'https://oacqvijuafuzsbyyqdtt.supabase.co/storage/v1/object/public/barber-assets/gallery-video-1771970910931.webm';
const DEFAULT_LOGO_URL = `${SUPABASE_ASSET_BASE_URL}/logo-1773381242205.jpeg`;
const DEFAULT_GALLERY = [
  `${SUPABASE_ASSET_BASE_URL}/gallery-1773425205115.jpeg`,
  `${SUPABASE_ASSET_BASE_URL}/gallery-1773425219181.jpeg`,
  `${SUPABASE_ASSET_BASE_URL}/gallery-image-1772657325654.jpeg`
];
const DEFAULT_VIDEO_GALLERY = [
  `${SUPABASE_ASSET_BASE_URL}/gallery-video-1771970910931.webm`,
  `${SUPABASE_ASSET_BASE_URL}/gallery-video-1771970955047.MOV`
];
const DEFAULT_PLANS = [
  {
    name: 'Corte Ilimitado',
    price: 75,
    benefits: ['Cortes ilimitados no mes', 'Atendimento prioritario', 'Economia recorrente']
  },
  {
    name: 'Barba Ilimitada',
    price: 135,
    benefits: ['Barba ilimitada no mes', 'Acabamento premium', 'Conforto e constancia']
  },
  {
    name: 'Cabelo e Barba',
    price: 189,
    benefits: ['Cabelo e barba ilimitados', 'Melhor custo-beneficio', 'Visual impecavel sempre']
  }
];

// ✅ FALLBACK: Dados padrão quando Supabase não responde
function getMergedContent() {
  return {
    settings: {
      whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
      instagram_link: '#',
      instagram_handle: '@fonsecabarberclub',
      address: 'Parauapebas - PA',
      hero_title: 'ELEVE O SEU PADRAO',
      hero_subtitle: 'Bem-vindo a Fonseca Barber Club.\nMais que uma barbearia - uma experiencia completa de cuidado, estilo e confianca.\nConheca nossos planos de assinatura e mantenha seu visual impecavel o mes inteiro.',
      logo_url: DEFAULT_LOGO_URL,
      hero_video: HERO_VIDEO_PRIMARY
    },
    services: [],
    gallery: DEFAULT_GALLERY.map((url) => ({ url })),
    video_gallery: DEFAULT_VIDEO_GALLERY.map((url) => ({ url })),
    appointments: []
  };
}

function sanitizePhoneNumber(value: string) {
  const normalized = value.replace(/\D/g, '');
  return normalized || DEFAULT_WHATSAPP_NUMBER;
}

function buildWhatsAppLink(number: string, message: string) {
  return `https://wa.me/${sanitizePhoneNumber(number)}?text=${encodeURIComponent(message)}`;
}

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function normalizePlanBenefits(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === 'string' && item.trim());
  }

  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string' && item.trim());
      }
    } catch {
      return raw
        .split(/\n|\||;/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export default function App() {
  const [content, setContent] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [experienceIndex, setExperienceIndex] = useState(0);
  const [plans, setPlans] = useState<any[]>([]);

  // ✅ RESTAURADO: Fetch dinâmico de dados do Supabase
  const fetchContent = async () => {
    try {
      const data = await fetchContentFromSupabase();
      setContent(data);
    } catch (error) {
      console.error('Erro ao buscar dados do Supabase, usando fallbacks:', error);
      setContent(getMergedContent());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchPlans = async () => {
      if (!supabase) {
        if (mounted) setPlans([]);
        return;
      }

      const { data, error } = await supabase.from('plans').select('*').order('id', { ascending: true });

      if (error || !data?.length) {
        if (mounted) setPlans([]);
        return;
      }

      const parsedPlans = data.map((plan: any, index: number) => {
        const rawPrice = Number(plan.price ?? plan.valor ?? plan.amount ?? 0);
        const benefits = normalizePlanBenefits(plan.features ?? plan.benefits ?? plan.beneficios ?? plan.description);

        return {
          name: plan.name || plan.nome || plan.title || `Plano ${index + 1}`,
          price: Number.isFinite(rawPrice) ? rawPrice : 0,
          benefits: benefits.length ? benefits : ['Beneficios a definir no painel']
        };
      });

      if (mounted) setPlans(parsedPlans);
    };

    fetchPlans();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ RESTAURADO: Dados dinâmicos do Supabase com fallbacks
  const mergedContent = content || getMergedContent();
  const { settings, gallery, video_gallery } = mergedContent;
  const whatsappNumber = sanitizePhoneNumber(settings.whatsapp_number);
  const heroVideoUrl = settings.hero_video || HERO_VIDEO_FALLBACK;
  const instagramLink = settings.instagram_link || '#';
  const instagramHandle = settings.instagram_handle || '@fonsecabarberclub';
  const bookingLink = buildWhatsAppLink(whatsappNumber, 'Ola! Quero agendar um horario na Fonseca Barber Club.');

  // ✅ RESTAURADO: Galeria dinâmica com fallback
  const liveExperienceItems = [
    ...gallery
      .filter((item: any) => typeof item?.url === 'string' && item.url.trim())
      .map((item: any) => ({ type: 'image', url: item.url })),
    ...video_gallery
      .filter((item: any) => typeof item?.url === 'string' && item.url.trim())
      .map((item: any) => ({ type: 'video', url: item.url }))
  ];

  const experienceItems = liveExperienceItems.length ? liveExperienceItems : DEFAULT_GALLERY.map((url) => ({ type: 'image', url }));
  const plansToRender = plans.length ? plans : DEFAULT_PLANS;

  useEffect(() => {
    if (experienceItems.length <= 1) {
      setExperienceIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setExperienceIndex((current) => (current + 1) % experienceItems.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [experienceItems.length]);

  useEffect(() => {
    if (experienceIndex > experienceItems.length - 1) {
      setExperienceIndex(0);
    }
  }, [experienceIndex, experienceItems.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <Loader2 className="h-5 w-5 animate-spin text-amber-300" />
          <span className="text-sm uppercase tracking-[0.22em] text-white/70">Carregando experiencia</span>
        </div>
      </div>
    );
  }

  const currentExperienceItem = experienceItems[experienceIndex];

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-zinc-100 selection:bg-amber-300 selection:text-black">
      <video
        src={heroVideoUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed top-0 left-0 w-full h-screen object-cover -z-20"
      />
      <div className="fixed top-0 left-0 w-full h-screen bg-black/60 -z-10"></div>
      <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-black/90 via-black/70 to-transparent -z-10"></div>
      {supabase ? (
        <button
          onClick={() => setIsAdminOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/70 text-amber-300 shadow-2xl shadow-black/50 backdrop-blur-xl transition-transform hover:scale-105"
          title="Painel administrativo"
        >
          <Settings className="h-5 w-5" />
        </button>
      ) : null}

      {isAdminOpen ? (
        <AdminPanel initialData={mergedContent} onClose={() => setIsAdminOpen(false)} onUpdate={fetchContent} />
      ) : null}

      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex items-center gap-3">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Fonseca Barber Club"
                className="h-16 w-auto object-contain sm:h-[72px] lg:h-[82px] [filter:drop-shadow(0_10px_28px_rgba(0,0,0,0.38))]"
              />
            ) : (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/25 bg-white/5 shadow-[0_0_40px_rgba(251,191,36,0.08)]">
                  <Scissors className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold uppercase tracking-[0.18em] text-white sm:text-xl">Fonseca</p>
                  <p className="text-[10px] uppercase tracking-[0.42em] text-white/45 sm:text-xs">Barber Club</p>
                </div>
              </>
            )}
          </a>

          <nav className="hidden items-center gap-7 text-sm text-white/68 lg:flex">
            <a href="#autoridade" className="transition-colors hover:text-white">Autoridade</a>
            <a href="#clube" className="transition-colors hover:text-white">Clube</a>
            <a href="#social" className="transition-colors hover:text-white">Contato</a>
            <a href="#experiencia" className="transition-colors hover:text-white">Experiencia</a>
          </nav>

          <a
            href={bookingLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.02] sm:px-5 sm:py-3"
          >
            <MessageCircle className="h-4 w-4" />
            Agendar horario
          </a>
        </div>
      </header>

      <main className="bg-transparent">
        <section id="inicio" className="relative isolate overflow-hidden">
          <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative z-10 max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/65 backdrop-blur-xl sm:text-xs">
                <Star className="h-3.5 w-3.5 text-amber-300" />
                Experiencia premium em Parauapebas
              </div>

              <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] text-white sm:text-6xl md:text-7xl lg:text-[88px]">
                {settings.hero_title}
              </h1>

              <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-white/70 sm:text-lg md:text-xl">
                {settings.hero_subtitle}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href={bookingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_18px_60px_rgba(251,191,36,0.18)] transition-all hover:-translate-y-0.5 hover:bg-amber-200"
                >
                  Agendar horario
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.12 }}
              className="relative z-10"
            >
              <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -right-4 bottom-8 h-28 w-28 rounded-full bg-amber-300/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[26px] border border-white/10 bg-zinc-950/80 p-6 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Clube Fonseca</p>
                    <p className="mt-3 font-display text-3xl font-bold uppercase text-white sm:text-4xl">Visual impecavel o mes inteiro</p>
                    <p className="mt-3 max-w-md text-sm leading-7 text-white/65 sm:text-base">
                      Assinatura, frequencia e padrao de atendimento combinados em uma experiencia pensada para recorrencia e fidelizacao.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-white/45">100+</p>
                    <p className="mt-2 text-xl font-semibold text-white">Clientes no Clube Fonseca</p>
                    <p className="mt-2 text-sm leading-6 text-white/55">Autoridade consolidada com base recorrente e alto nivel de satisfacao.</p>
                  </div>

                  <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/[0.08] p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-amber-200/70">Padrao premium</p>
                    <p className="mt-2 text-xl font-semibold text-white">Corte, barba e acabamento</p>
                    <p className="mt-2 text-sm leading-6 text-white/55">Atendimento orientado por detalhes, constancia e apresentacao impecavel.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="clube" className="relative py-16 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs uppercase tracking-[0.32em] text-amber-300/75">Clube Fonseca</p>
              <h2 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Planos de Assinatura
              </h2>
              <p className="mt-4 text-white/65">Escolha seu plano e mantenha seu visual impecavel o mes inteiro.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plansToRender.map((plan, index) => (
                <article
                  key={`${plan.name}-${index}`}
                  className="rounded-[28px] border border-white/10 bg-black/35 p-6 backdrop-blur-xl"
                >
                  <p className="text-xs uppercase tracking-[0.26em] text-amber-200/75">Plano {index + 1}</p>
                  <h3 className="mt-3 font-display text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-4 text-3xl font-bold text-amber-300">{formatCurrencyBRL(plan.price)}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">/ mes</p>

                  <ul className="mt-5 space-y-2 text-sm text-white/75">
                    {(plan.features ?? plan.benefits ?? []).map((benefit: string, benefitIndex: number) => (
                      <li key={`${plan.name}-benefit-${benefitIndex}`} className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={buildWhatsAppLink(whatsappNumber, `Ola! Quero assinar o plano ${plan.name}.`) }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
                  >
                    Assinar pelo WhatsApp
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ✅ RESTAURADO: Seção de 3 Botões Dinâmicos (Social Links) */}
        <section id="social" className="relative py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Conecte-se <span className="text-amber-300">Conosco</span>
              </h2>
              <p className="mt-4 text-white/60 text-lg">Fale com a gente por nossos canais</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* 1️⃣ Instagram Dinâmico */}
              <motion.a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -8 }}
                className="group rounded-[32px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl transition-all hover:border-purple-400/50"
              >
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full">
                    <Instagram className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">Instagram</h3>
                    <p className="text-white/70">{instagramHandle}</p>
                  </div>
                  <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold transition-all group-hover:shadow-lg group-hover:shadow-purple-500/30">
                    Seguir Agora →
                  </button>
                </div>
              </motion.a>

              {/* 2️⃣ WhatsApp Dinâmico */}
              <motion.a
                href={buildWhatsAppLink(whatsappNumber, 'Ola! Tudo bem?')}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -8 }}
                className="group rounded-[32px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl transition-all hover:border-green-400/50"
              >
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="bg-[#25D366] p-4 rounded-full">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">WhatsApp</h3>
                    <p className="text-white/70">Resposta rápida</p>
                  </div>
                  <button className="w-full mt-4 bg-[#25D366] text-white py-3 rounded-xl font-semibold transition-all group-hover:shadow-lg group-hover:shadow-green-500/30">
                    Chamar Agora →
                  </button>
                </div>
              </motion.a>

              {/* 3️⃣ Localização Dinâmica */}
              <motion.a
                href={`https://maps.google.com/?q=${encodeURIComponent(settings.address || 'Parauapebas, PA')}`}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -8 }}
                className="group rounded-[32px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl transition-all hover:border-amber-300/50"
              >
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="bg-amber-300/30 p-4 rounded-full border border-amber-300/50">
                    <MapPin className="h-8 w-8 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">Localização</h3>
                    <p className="text-white/70">{settings.address || 'Parauapebas - PA'}</p>
                  </div>
                  <button className="w-full mt-4 bg-amber-300 text-black py-3 rounded-xl font-semibold transition-all group-hover:shadow-lg group-hover:shadow-amber-300/30">
                    Ver no Mapa →
                  </button>
                </div>
              </motion.a>
            </div>
          </div>
        </section>

        <section id="autoridade" className="relative py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid gap-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-300/70">Autoridade local</p>
                <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  Uma barbearia que ja conquistou a cidade.
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  A Fonseca Barber Club se tornou referencia em estilo, atendimento e experiencia em Parauapebas. Centenas de clientes ja confiaram no nosso trabalho e mais de 100 clientes fazem parte do Clube Fonseca.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: 'Clientes no Clube', value: '100+' },
                  { label: 'Padrao Premium', value: 'Premium' },
                  { label: 'Localizacao', value: 'Parauapebas' }
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-white/10 bg-black/40 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">{item.label}</p>
                    <p className="mt-3 font-display text-2xl font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ✅ RESTAURADO: Experiência - Galeria Dinâmica */}
        <section id="experiencia" className="relative py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-4">
                Cada cliente vive uma <span className="text-amber-300">experiencia.</span>
              </h2>
              <p className="text-white/60 text-lg">Na Fonseca Barber Club cada atendimento e unico.</p>
            </div>

            {experienceItems.length > 0 && (
              <div className="rounded-[32px] border border-white/10 overflow-hidden backdrop-blur-xl">
                {currentExperienceItem?.type === 'image' ? (
                  <img
                    src={currentExperienceItem.url}
                    alt="Experiencia"
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <video
                    src={currentExperienceItem?.url}
                    className="w-full h-96 object-cover"
                    controls
                  />
                )}
                <div className="bg-black/50 backdrop-blur-xl p-6 flex items-center justify-between">
                  <div className="text-white text-sm uppercase tracking-widest font-semibold">
                    {experienceIndex + 1} / {experienceItems.length}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setExperienceIndex((i) => (i - 1 + experienceItems.length) % experienceItems.length)}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setExperienceIndex((i) => (i + 1) % experienceItems.length)}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 p-4 bg-black/30 justify-center">
                  {experienceItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setExperienceIndex(i)}
                      className={`h-2 transition-all ${
                        i === experienceIndex ? 'bg-amber-300 w-8' : 'bg-white/30 w-2'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/45 py-10 backdrop-blur-xl relative z-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-display text-lg font-bold uppercase text-white">Fonseca Barber Club</p>
            <p className="text-sm text-white/60">{settings.address || 'Parauapebas - PA'}</p>
          </div>
          <button
            onClick={() => setIsAdminOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-amber-300/10 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-300/20"
          >
            Login Admin
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}
