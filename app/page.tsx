import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Layers3,
  ListTodo,
  MoveUpRight,
  Sparkles,
  Users2,
  Workflow,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

const features = [
  {
    icon: Workflow,
    number: '01',
    title: 'İşin tamamı görünür',
    description: 'Görevleri liste, Kanban veya takvim görünümünde takip edin. Herkes sıradaki adımı ve sorumlusunu bilsin.',
    tone: 'from-indigo-500/15 to-blue-500/5 text-indigo-600',
  },
  {
    icon: Users2,
    number: '02',
    title: 'Ekip aynı ritimde',
    description: 'Roller, sorumlular ve teslim tarihleri tek yerde. İlerleme için toplantıdan toplantıya beklemeyin.',
    tone: 'from-violet-500/15 to-fuchsia-500/5 text-violet-600',
  },
  {
    icon: BarChart3,
    number: '03',
    title: 'Öncelikler netleşsin',
    description: 'Geciken işleri, yaklaşan teslimleri ve ekip iş yükünü sade analitiklerle bir bakışta değerlendirin.',
    tone: 'from-emerald-500/15 to-teal-500/5 text-emerald-600',
  },
];

const previewTasks = [
  { title: 'Ürün lansman planı', project: 'Lansman', color: 'bg-violet-400', priority: 'Yüksek', due: 'Bugün', avatar: 'EA', avatarColor: 'bg-rose-200 text-rose-800' },
  { title: 'Ana sayfa içeriklerini gözden geçir', project: 'Web sitesi', color: 'bg-sky-400', priority: 'Orta', due: 'Yarın', avatar: 'MK', avatarColor: 'bg-amber-200 text-amber-900' },
  { title: 'Kullanıcı görüşmelerini planla', project: 'Araştırma', color: 'bg-emerald-400', priority: 'Düşük', due: '24 Eyl', avatar: 'AY', avatarColor: 'bg-indigo-200 text-indigo-800' },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9fc]">
      <SiteHeader />

      <section className="landing-hero-bg relative isolate overflow-hidden border-b border-white/10 bg-[#10152f] text-white">
        <div className="landing-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -left-48 top-16 size-[34rem] rounded-full bg-indigo-600/25 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 top-36 size-[32rem] rounded-full bg-sky-500/15 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.84fr_1.16fr] lg:gap-8 lg:pb-28 lg:pt-24">
          <div className="motion-reveal relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-indigo-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
              <span className="flex size-5 items-center justify-center rounded-full bg-indigo-400/20 text-indigo-200"><Sparkles className="size-3" /></span>
              Ekip çalışmasının daha net hâli
            </div>
            <h1 className="max-w-[12ch] text-balance text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.065em] sm:text-6xl lg:text-[4.4rem]">
              İyi işler, <span className="bg-gradient-to-r from-indigo-200 via-sky-200 to-violet-200 bg-clip-text text-transparent">iyi bir akışla</span> başlar.
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Görevleri, ekipleri ve teslim tarihlerini tek bir sakin çalışma alanında buluşturun. Daha az takip karmaşası, daha çok tamamlanan iş.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild className="bg-white font-semibold text-[#171c3d] shadow-[0_10px_30px_rgba(6,10,34,0.25)] hover:bg-indigo-50 hover:text-[#171c3d]">
                <Link href="/kayit">Ücretsiz çalışma alanı oluştur <ArrowRight className="size-4" /></Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="border border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white">
                <Link href="/giris">Hesabıma giriş yap <ArrowUpRight className="size-4" /></Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-300" /> Dakikalar içinde hazır</span>
              <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-300" /> Ekibinle birlikte çalış</span>
            </div>
          </div>

          <div className="motion-reveal relative mx-auto w-full max-w-[760px] [animation-delay:120ms] lg:mx-0 lg:justify-self-end">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-400/25 via-blue-500/10 to-cyan-300/20 opacity-70 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#fbfcff] text-slate-900 shadow-[0_35px_100px_rgba(3,7,25,0.48)] ring-1 ring-black/5">
              <div className="flex h-12 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Layers3 className="size-3.5" /></span>
                  <span className="text-xs font-semibold tracking-tight">Taskflow</span>
                  <span className="hidden h-4 w-px bg-slate-200 sm:block" />
                  <span className="hidden text-[11px] text-slate-500 sm:block">Pazarlama ekibi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500 sm:inline">⌘ K</span>
                  <div className="flex -space-x-1.5">
                    {['EA', 'MK', 'AY'].map((member, index) => <span key={member} className={`flex size-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold ${['bg-rose-200 text-rose-800', 'bg-amber-200 text-amber-900', 'bg-indigo-200 text-indigo-800'][index]}`}>{member}</span>)}
                  </div>
                  <span className="ml-1 flex size-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">EA</span>
                </div>
              </div>

              <div className="flex min-h-[360px] sm:min-h-[414px]">
                <aside className="hidden w-40 shrink-0 border-r border-slate-200/80 bg-[#f7f8fc] p-3 sm:block">
                  <div className="mb-5 px-2 pt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Çalışma alanı</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-2.5 py-2 font-semibold text-indigo-700"><ListTodo className="size-3.5" /> Görevler <span className="ml-auto text-[9px] text-indigo-500">12</span></div>
                    <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-slate-500"><CalendarDays className="size-3.5" /> Takvim</div>
                    <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-slate-500"><BarChart3 className="size-3.5" /> Analitik</div>
                  </div>
                  <div className="mb-2 mt-7 flex items-center justify-between px-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400"><span>Projeler</span><span>+</span></div>
                  <div className="space-y-1 text-[10px] text-slate-600">
                    <div className="flex items-center gap-2 rounded-md px-2 py-1.5"><span className="size-2 rounded-sm bg-violet-400" /> Ürün lansmanı</div>
                    <div className="flex items-center gap-2 rounded-md px-2 py-1.5"><span className="size-2 rounded-sm bg-sky-400" /> Yeni web sitesi</div>
                    <div className="flex items-center gap-2 rounded-md px-2 py-1.5"><span className="size-2 rounded-sm bg-emerald-400" /> Kullanıcı araştırması</div>
                  </div>
                  <div className="mt-7 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm"><Sparkles className="size-3" /></span>
                    <p className="mt-2 text-[10px] font-semibold">Haftalık ilerleme</p>
                    <p className="mt-0.5 text-[9px] leading-4 text-slate-500">İşlerin %72’si tamamlandı.</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-indigo-100"><div className="h-full w-[72%] rounded-full bg-indigo-500" /></div>
                  </div>
                </aside>

                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-[9px] font-medium uppercase tracking-[0.13em] text-slate-400">Salı, 23 Eylül</p><h2 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">Günün akışı</h2><p className="mt-1 text-[10px] text-slate-500">Ekibinizin güncel işleri ve öncelikleri</p></div>
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-[9px] shadow-sm"><span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">Liste</span><span className="px-1.5 text-slate-400">Pano</span><span className="hidden px-1.5 text-slate-400 sm:inline">Takvim</span></div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:p-3"><div className="flex items-center justify-between"><span className="text-[9px] text-slate-500">Açık görev</span><span className="flex size-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600"><ListTodo className="size-3" /></span></div><p className="mt-1.5 text-lg font-semibold tracking-tight">12</p><p className="text-[8px] text-emerald-600">2 tanesi bugün</p></div>
                    <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:p-3"><div className="flex items-center justify-between"><span className="text-[9px] text-slate-500">Tamamlandı</span><span className="flex size-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-3" /></span></div><p className="mt-1.5 text-lg font-semibold tracking-tight">28</p><p className="text-[8px] text-slate-400">Bu hafta</p></div>
                    <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:p-3"><div className="flex items-center justify-between"><span className="text-[9px] text-slate-500">Takım odağı</span><span className="flex size-5 items-center justify-center rounded-md bg-amber-50 text-amber-600"><MoveUpRight className="size-3" /></span></div><p className="mt-1.5 text-lg font-semibold tracking-tight">%84</p><p className="text-[8px] text-slate-400">Geçen haftaya göre +8</p></div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 sm:px-3.5"><span className="text-[10px] font-semibold">Öncelikli görevler</span><span className="text-[9px] font-medium text-indigo-600">Tümünü gör <ArrowRight className="ml-0.5 inline size-3" /></span></div>
                    {previewTasks.map((task, index) => (
                      <div key={task.title} className={`flex items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-3.5 ${index < previewTasks.length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <Circle className={`size-3.5 shrink-0 ${index === 0 ? 'text-indigo-500' : 'text-slate-300'}`} />
                        <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium text-slate-800 sm:text-[11px]">{task.title}</p><p className="mt-1 flex items-center gap-1.5 text-[8px] text-slate-400"><span className={`size-1.5 rounded-full ${task.color}`} />{task.project}<span className="text-slate-300">·</span><Clock3 className="size-2.5" />{task.due}</p></div>
                        <span className={`hidden rounded-full px-2 py-1 text-[8px] font-medium sm:inline ${task.priority === 'Yüksek' ? 'bg-rose-50 text-rose-600' : task.priority === 'Orta' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</span>
                        <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${task.avatarColor}`}>{task.avatar}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="landing-float absolute -bottom-5 -left-4 z-10 hidden w-48 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-[0_20px_55px_rgba(7,12,36,0.28)] backdrop-blur sm:block lg:-left-10">
              <div className="flex items-center justify-between"><span className="text-[10px] font-medium text-slate-500">Bu haftaki tamamlanma</span><span className="flex size-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><ArrowUpRight className="size-3.5" /></span></div>
              <div className="mt-1 flex items-end gap-2"><span className="text-2xl font-semibold tracking-tight text-slate-900">72%</span><span className="mb-1 text-[9px] font-medium text-emerald-600">+12% bu hafta</span></div>
              <div className="mt-2 flex h-7 items-end gap-1">{[35, 52, 43, 68, 55, 82, 72].map((height, index) => <span key={index} className={`flex-1 rounded-t-sm ${index === 6 ? 'bg-indigo-500' : 'bg-indigo-100'}`} style={{ height: `${height}%` }} />)}</div>
            </div>
            <div className="landing-float-delayed absolute -right-3 top-16 z-10 hidden items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 py-2.5 shadow-[0_16px_45px_rgba(7,12,36,0.22)] backdrop-blur sm:flex lg:-right-6">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-4" /></span>
              <span><span className="block text-[10px] font-semibold text-slate-800">Görev tamamlandı</span><span className="block text-[9px] text-slate-400">Ekip akışta ilerliyor</span></span>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#10152f] to-transparent" />
      </section>

      <section className="relative z-10 mx-auto -mt-1 max-w-7xl px-5 sm:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_55px_rgba(24,32,66,0.07)] sm:grid-cols-3">
          {[
            { icon: ListTodo, title: 'Görevler tek akışta', detail: 'Atama, öncelik ve teslim tarihi' },
            { icon: Users2, title: 'Ekipler uyum içinde', detail: 'Sorumluluklar ve roller net' },
            { icon: BarChart3, title: 'İlerleme görünür', detail: 'Durum ve iş yükü özeti' },
          ].map(({ icon: Icon, title, detail }, index) => (
            <div key={title} className={`flex items-center gap-3.5 px-5 py-5 sm:px-6 ${index < 2 ? 'border-b border-slate-100 sm:border-b-0 sm:border-r' : ''}`}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="size-[18px]" /></span>
              <div><p className="text-sm font-semibold tracking-tight text-slate-900">{title}</p><p className="mt-0.5 text-[11px] text-slate-500">{detail}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="ozellikler" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-20 pt-24 sm:px-8 sm:pb-28 sm:pt-32">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <Badge variant="outline" className="rounded-full border-indigo-100 bg-indigo-50/80 px-3 py-1 text-indigo-700">Daha az dağınıklık. Daha çok ilerleme.</Badge>
          <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-[-0.045em] text-slate-900 sm:text-4xl">Ekibinizin işi ilerletmesi için gereken her şey.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">Planlama, takip ve ekip koordinasyonu; karmaşık araçlara gerek kalmadan aynı yerde.</p>
        </div>

        <div className="motion-stagger grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, number, title, description, tone }) => (
            <article key={title} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_3px_12px_rgba(24,32,66,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(24,32,66,0.08)] sm:p-7">
              <div className="flex items-start justify-between"><span className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone}`}><Icon className="size-5" /></span><span className="font-mono text-[11px] text-slate-300">{number}</span></div>
              <h3 className="mt-7 text-lg font-semibold tracking-[-0.025em] text-slate-900">{title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">{description}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600">Daha fazlasını keşfet <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#151b3b] px-6 py-10 text-white shadow-[0_24px_70px_rgba(18,25,62,0.2)] sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-16 -top-32 size-96 rounded-full bg-indigo-500/25 blur-[90px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-72 bg-sky-500/10 blur-[80px]" />
          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-indigo-200"><span className="flex size-6 items-center justify-center rounded-lg bg-white/10"><Sparkles className="size-3.5" /></span>İlk adım bugün</div>
              <h2 className="text-balance text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">İyi fikirleri, bitmiş işlere dönüştürün.</h2>
              <p className="mt-2.5 max-w-lg text-sm leading-6 text-slate-300">Ekibinizi bir araya getirin, ilk görevlerinizi ekleyin ve ilerlemeyi görün.</p>
            </div>
            <Button size="lg" asChild className="shrink-0 bg-white font-semibold text-[#171c3d] hover:bg-indigo-50 hover:text-[#171c3d]">
              <Link href="/kayit">Taskflow’u kullanmaya başla <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400"><CheckCircle2 className="size-3.5 text-emerald-500" /> Ücretsiz başlayın <span className="text-slate-300">·</span> Ekibinizi davet edin <span className="text-slate-300">·</span> Hemen ilerleyin</p>
      </section>

      <SiteFooter />
    </main>
  );
}
