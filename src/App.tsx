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
  Star
} from 'lucide-react';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ChatBot from './components/ChatBot';
import AdminPanel from './components/AdminPanel';
import { fetchContentFromSupabase, supabase } from './lib/supabaseClient';

const DEFAULT_WHATSAPP_NUMBER = '5511999999999';

const OFFICIAL_COPY = {
  heroTitle: 'ELEVE O SEU PADRAO',
  heroSubtitle:
    'Bem-vindo a Fonseca Barber Club.\nMais que uma barbearia - uma experiencia completa de cuidado, estilo e confianca.\nConheca nossos planos de assinatura e mantenha seu visual impecavel o mes inteiro.',
  authorityTitle: 'Uma barbearia que ja conquistou a cidade.',
  authorityText:
    'A Fonseca Barber Club se tornou referencia em estilo, atendimento e experiencia em Parauapebas. Centenas de clientes ja confiaram no nosso trabalho e mais de 100 clientes fazem parte do Clube Fonseca.',
  reasons: [
    {
      title: 'Precisao e padrao em cada corte',
      text: 'Nossa equipe segue um padrao de qualidade para garantir cortes bem executados, acabamento limpo e um visual alinhado em cada atendimento.',
      icon: Scissors
    },
    {
      title: 'Experiencia que vai alem do corte',
      text: 'Aqui voce nao vem apenas cortar o cabelo. Oferecemos uma experiencia completa de cuidado, conforto e atencao aos detalhes.',
      icon: Sparkles
    },
    {
      title: 'Clube de assinatura exclusivo',
      text: 'Com os planos de assinatura da Fonseca Barber Club, voce mantem seu visual sempre em dia com praticidade e economia todos os meses.',
      icon: Crown
    }
  ],
  membershipTitle: 'Clube Fonseca',
  membershipSubtitle: 'Seu visual sempre em dia.',
  membershipText:
    'Com os planos de assinatura da Fonseca Barber Club, voce pode cuidar do seu visual todos os meses com praticidade e economia.',
  membershipBullets: [
    'Corte sempre alinhado.',
    'Barba sempre bem feita.',
    'Estilo sempre no mais alto nivel.'
  ],
  servicesTitle: 'Nossos Servicos',
  servicesText:
    'Os cinco servicos serao inseridos depois ou puxados do banco. A estrutura abaixo ja esta pronta para receber esse conteudo com boa hierarquia visual.',
  experienceTitle: 'Cada cliente vive uma experiencia.',
  experienceText:
    'Na Fonseca Barber Club cada atendimento e unico. Cuidamos de cada detalhe para que voce saia daqui com confianca e estilo.',
  finalTitle: 'Seu proximo corte comeca aqui.',
  finalText:
    'Agende agora seu horario ou conheca os planos de assinatura da Fonseca Barber Club.'
};

const PLACEHOLDER_SERVICES = [
  { name: 'Servico 01', description: 'Espaco reservado para o primeiro servico premium da barbearia.', meta: 'Em breve' },
  { name: 'Servico 02', description: 'Estrutura pronta para receber nome, descricao e preco vindos do painel.', meta: 'Em breve' },
  { name: 'Servico 03', description: 'Card preparado para destacar beneficios e acabamento de cada atendimento.', meta: 'Em breve' },
  { name: 'Servico 04', description: 'Layout pensado para manter leitura clara no mobile e no desktop.', meta: 'Em breve' },
  { name: 'Servico 05', description: 'Quando os dados forem cadastrados, esta grade assume o conteudo automaticamente.', meta: 'Em breve' }
];

const PLACEHOLDER_GALLERY = [
  {
    type: 'placeholder',
    eyebrow: 'Ambiente premium',
    title: 'Conforto, estilo e acabamento em cada detalhe.',
    text: 'Use esta area para mostrar fotos dos atendimentos, do ambiente e dos resultados da Fonseca Barber Club.',
    accent: 'from-amber-400/30 via-transparent to-transparent'
  },
  {
    type: 'placeholder',
    eyebrow: 'Resultados reais',
    title: 'O carrossel recebe fotos ou videos direto da galeria.',
    text: 'Quando a tabela gallery estiver preenchida, este bloco troca os placeholders automaticamente pelas midias reais.',
    accent: 'from-cyan-400/30 via-transparent to-transparent'
  },
  {
    type: 'placeholder',
    eyebrow: 'Clube Fonseca',
    title: 'Uma vitrine visual para reforcar confianca e autoridade.',
    text: 'Mesmo sem imagens cadastradas, a home continua elegante e pronta para conversao.',
    accent: 'from-fuchsia-400/20 via-transparent to-transparent'
  }
];

const DEFAULT_CONTENT = {
  settings: {
    whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
    instagram_link: '#',
    instagram_handle: '@fonsecabarberclub',
    address: 'Parauapebas - PA',
    hero_title: OFFICIAL_COPY.heroTitle,
    hero_subtitle: OFFICIAL_COPY.heroSubtitle,
    logo_url: '',
    hero_video: ''
  },
  services: [],
  gallery: [],
  video_gallery: [],
  appointments: []
};

function fallbackText(value: unknown, defaultValue: string) {
  return typeof value === 'string' && value.trim() ? value : defaultValue;
}

function sanitizePhoneNumber(value: string) {
  const normalized = value.replace(/\D/g, '');
  return normalized || DEFAULT_WHATSAPP_NUMBER;
}

function buildWhatsAppLink(number: string, message: string) {
  return `https://wa.me/${sanitizePhoneNumber(number)}?text=${encodeURIComponent(message)}`;
}

function mergeContent(data?: any) {
  const settings = data?.settings || {};

  return {
    settings: {
      ...DEFAULT_CONTENT.settings,
      ...settings,
      hero_title: fallbackText(settings.hero_title, OFFICIAL_COPY.heroTitle),
      hero_subtitle: fallbackText(settings.hero_subtitle, OFFICIAL_COPY.heroSubtitle),
      whatsapp_number: fallbackText(settings.whatsapp_number, DEFAULT_WHATSAPP_NUMBER),
      instagram_link: fallbackText(settings.instagram_link, DEFAULT_CONTENT.settings.instagram_link),
      instagram_handle: fallbackText(settings.instagram_handle, DEFAULT_CONTENT.settings.instagram_handle),
      address: fallbackText(settings.address, DEFAULT_CONTENT.settings.address)
    },
    services: Array.isArray(data?.services) ? data.services : [],
    gallery: Array.isArray(data?.gallery) ? data.gallery : [],
    video_gallery: Array.isArray(data?.video_gallery) ? data.video_gallery : [],
    appointments: Array.isArray(data?.appointments) ? data.appointments : []
  };
}

export default function App() {
  const [content, setContent] = useState(() => mergeContent());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [experienceIndex, setExperienceIndex] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchContentFromSupabase();
        setContent(mergeContent(data));
      } catch (error) {
        console.error('Fallback da home ativado:', error);
        setContent(mergeContent());
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const { settings, services, gallery, video_gallery } = content;
  const whatsappNumber = sanitizePhoneNumber(settings.whatsapp_number);
  const plansLink = buildWhatsAppLink(whatsappNumber, 'Ola! Quero conhecer os planos do Clube Fonseca.');
  const bookingLink = buildWhatsAppLink(whatsappNumber, 'Ola! Quero agendar um horario na Fonseca Barber Club.');

  const displayServices = services.length
    ? services.slice(0, 5).map((service: any, index: number) => ({
        name: fallbackText(service.name || service.title, `Servico ${index + 1}`),
        description: fallbackText(
          service.description || service.desc,
          'Descricao a ser preenchida pelo painel administrativo.'
        ),
        meta: service.price ? `R$ ${service.price}` : 'Premium'
      }))
    : PLACEHOLDER_SERVICES;

  const liveExperienceItems = [
    ...gallery
      .filter((item: any) => typeof item?.url === 'string' && item.url.trim())
      .map((item: any) => ({ type: 'image', url: item.url })),
    ...video_gallery
      .filter((item: any) => typeof item?.url === 'string' && item.url.trim())
      .map((item: any) => ({ type: 'video', url: item.url }))
  ];

  const experienceItems = liveExperienceItems.length ? liveExperienceItems : PLACEHOLDER_GALLERY;

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
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100 selection:bg-amber-300 selection:text-black">
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(34,211,238,0.14),_transparent_22%),linear-gradient(180deg,_#030303_0%,_#09090b_38%,_#050505_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)] opacity-30" />
      {settings.hero_video ? (
        <div className="fixed inset-0 -z-10 overflow-hidden opacity-20 pointer-events-none">
          <video autoPlay muted loop playsInline className="h-full w-full object-cover scale-105">
            <source src={settings.hero_video} />
          </video>
        </div>
      ) : null}

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
        <AdminPanel initialData={content} onClose={() => setIsAdminOpen(false)} onUpdate={() => window.location.reload()} />
      ) : null}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex items-center gap-3">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Fonseca Barber Club" className="h-12 w-auto object-contain sm:h-14" />
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
            <a href="#diferenciais" className="transition-colors hover:text-white">Diferenciais</a>
            <a href="#clube" className="transition-colors hover:text-white">Clube</a>
            <a href="#servicos" className="transition-colors hover:text-white">Servicos</a>
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

      <main>
        <section id="inicio" className="relative">
          <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
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
                  href={plansLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition-all hover:border-amber-300/40 hover:bg-white/8"
                >
                  Conhecer planos
                  <ArrowRight className="h-4 w-4 text-amber-300" />
                </a>
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
              className="relative"
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

        <section id="autoridade" className="relative py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid gap-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-300/70">Autoridade local</p>
                <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  {OFFICIAL_COPY.authorityTitle}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  {OFFICIAL_COPY.authorityText}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: 'Clientes recorrentes', value: '100+' },
                  { label: 'Experiencia elevada', value: 'Premium' },
                  { label: 'Cidade conquistada', value: 'Parauapebas' }
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

        <section id="diferenciais" className="relative py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Por que escolher</p>
              <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                A escolha certa para manter seu visual no mais alto nivel.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {OFFICIAL_COPY.reasons.map((item) => (
                <motion.article
                  key={item.title}
                  whileHover={{ y: -6 }}
                  className="group rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:p-7"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/80 text-amber-300 transition-transform group-hover:scale-105">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/62 sm:text-base">{item.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="clube" className="relative py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="rounded-[30px] border border-amber-300/15 bg-[linear-gradient(145deg,rgba(251,191,36,0.10),rgba(255,255,255,0.04))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-8 md:p-10">
                <p className="text-xs uppercase tracking-[0.32em] text-amber-200/70">Assinatura premium</p>
                <h2 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">{OFFICIAL_COPY.membershipTitle}</h2>
                <p className="mt-3 text-xl text-white/75 sm:text-2xl">{OFFICIAL_COPY.membershipSubtitle}</p>
                <p className="mt-6 text-base leading-8 text-white/68 sm:text-lg">{OFFICIAL_COPY.membershipText}</p>

                <div className="mt-8 space-y-3">
                  {OFFICIAL_COPY.membershipBullets.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                      <ShieldCheck className="h-5 w-5 text-amber-300" />
                      <span className="text-sm text-white/78 sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={plansLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform hover:-translate-y-0.5"
                >
                  Conhecer planos
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  {
                    title: 'Praticidade recorrente',
                    text: 'Uma estrutura pensada para quem quer manter frequencia sem depender de decisoes de ultima hora.'
                  },
                  {
                    title: 'Economia com previsibilidade',
                    text: 'O cliente entende melhor seu investimento mensal e volta com mais constancia.'
                  },
                  {
                    title: 'Fidelizacao natural',
                    text: 'Os planos reforcam relacao de longo prazo entre atendimento, resultado e rotina.'
                  },
                  {
                    title: 'Marca percebida como premium',
                    text: 'A apresentacao do clube eleva valor percebido e diferencia a barbearia da concorrencia.'
                  }
                ].map((item) => (
                  <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Clube Fonseca</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/60 sm:text-base">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="servicos" className="relative py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.32em] text-white/45">{OFFICIAL_COPY.servicesTitle}</p>
                <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  Estrutura pronta para destacar os cinco servicos principais.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/60 sm:text-base">{OFFICIAL_COPY.servicesText}</p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
              {displayServices.map((service: any, index: number) => (
                <article
                  key={`${service.name}-${index}`}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/55 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-amber-300">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/45">
                      {service.meta}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{service.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/60">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="experiencia" className="relative py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-300/70">Experiencia do cliente</p>
                <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  {OFFICIAL_COPY.experienceTitle}
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-white/66 sm:text-lg">
                  {OFFICIAL_COPY.experienceText}
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setExperienceIndex((current) => (current - 1 + experienceItems.length) % experienceItems.length)}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                    aria-label="Item anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExperienceIndex((current) => (current + 1) % experienceItems.length)}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                    aria-label="Proximo item"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-5">
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/90">
                  {currentExperienceItem?.type === 'image' ? (
                    <img
                      src={currentExperienceItem.url}
                      alt="Cliente da Fonseca Barber Club"
                      className="aspect-[16/11] w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : currentExperienceItem?.type === 'video' ? (
                    <video
                      src={currentExperienceItem.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-[16/11] w-full object-cover"
                    />
                  ) : (
                    <div className={`relative flex aspect-[16/11] flex-col justify-between overflow-hidden bg-gradient-to-br ${currentExperienceItem.accent} p-6 sm:p-8`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
                      <div className="relative flex items-center justify-between">
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/60">
                          {currentExperienceItem.eyebrow}
                        </span>
                        <Images className="h-5 w-5 text-white/55" />
                      </div>
                      <div className="relative max-w-lg">
                        <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">{currentExperienceItem.title}</h3>
                        <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">{currentExperienceItem.text}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-center gap-2">
                  {experienceItems.map((_: any, index: number) => (
                    <button
                      key={`experience-dot-${index}`}
                      type="button"
                      onClick={() => setExperienceIndex(index)}
                      className={`h-2 rounded-full transition-all ${experienceIndex === index ? 'w-10 bg-amber-300' : 'w-2 bg-white/25'}`}
                      aria-label={`Ir para item ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(251,191,36,0.10),rgba(34,211,238,0.08))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-10 lg:p-12">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.32em] text-black/60">CTA final</p>
                <h2 className="mt-4 font-display text-4xl font-bold text-black sm:text-5xl md:text-6xl">
                  {OFFICIAL_COPY.finalTitle}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
                  {OFFICIAL_COPY.finalText}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={bookingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5"
                >
                  Agendar horario
                  <MessageCircle className="h-4 w-4 text-amber-300" />
                </a>
                <a
                  href={plansLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white/45 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black backdrop-blur-xl transition-transform hover:-translate-y-0.5"
                >
                  Conhecer planos
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/45 py-10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-display text-xl font-bold uppercase tracking-[0.18em] text-white">Fonseca Barber Club</p>
            <p className="mt-2 text-sm text-white/45">Barbearia premium com foco em experiencia, estilo e recorrencia.</p>
          </div>
          <div className="text-sm text-white/45">
            <p>{settings.address}</p>
            <p className="mt-1">{settings.instagram_handle}</p>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp number={whatsappNumber} />
      <ChatBot number={whatsappNumber} />
    </div>
  );
}
