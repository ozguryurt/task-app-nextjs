import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Compass,
  Layers3,
  MoveUpRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export default function NotFound() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9fc]">
      <SiteHeader />

      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden px-5 py-16 sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_38%,rgba(99,102,241,0.10),transparent_48%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(to_right,rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

        <div className="motion-reveal mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          <div className="mx-auto max-w-lg text-center lg:mx-0 lg:text-left">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-[0_10px_28px_rgba(38,48,104,0.09)] lg:mx-0">
              <Compass className="size-6" />
            </div>
            <p className="section-kicker">Yol ayrımındayız</p>
            <h1 className="mt-3 text-[4.6rem] font-semibold leading-none tracking-[-0.08em] text-slate-900 sm:text-8xl">404<span className="text-indigo-500">.</span></h1>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.035em] text-slate-900 sm:text-2xl">Bu sayfa görev listesinde yok.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 lg:mx-0">
              Bağlantı değişmiş veya aradığınız sayfa taşınmış olabilir. Bir sonraki adımı seçip kaldığınız yerden devam edin.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row lg:justify-start">
              <Button size="lg" asChild>
                <Link href="/"><ArrowLeft className="size-4" /> Ana sayfaya dön</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/giris">Çalışma alanına git <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-slate-400">Adresin doğru olduğunu düşünüyorsanız bağlantıyı yeniden kontrol edin.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[570px]">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-300/35 via-sky-200/20 to-violet-300/30 blur-2xl" />
            <div className="relative rounded-[1.6rem] border border-white bg-white/80 p-3 shadow-[0_28px_80px_rgba(32,43,93,0.12)] ring-1 ring-slate-900/[0.035] backdrop-blur sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-3">
                <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Layers3 className="size-3.5" /></span><span className="text-xs font-semibold text-slate-800">Taskflow</span><span className="ml-1 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-400">Sayfa bulunamadı</span></div>
                <div className="flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400"><Search className="size-3.5" /></div>
              </div>

              <div className="relative px-2 pb-2 pt-5 sm:px-3 sm:pt-6">
                <div className="absolute left-[19%] top-[48%] hidden h-px w-[59%] border-t border-dashed border-indigo-300 sm:block" />
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {[
                    { label: 'Yapılacak', tone: 'bg-slate-300', item: 'Brief hazırla', tint: 'bg-slate-50' },
                    { label: 'Devam ediyor', tone: 'bg-indigo-400', item: 'Yol biraz karıştı', tint: 'bg-indigo-50/80' },
                    { label: 'Tamamlandı', tone: 'bg-emerald-400', item: 'Buradan devam et', tint: 'bg-emerald-50/80' },
                  ].map((column, index) => (
                    <div key={column.label} className={`relative min-h-48 rounded-xl border border-slate-100 p-2.5 sm:min-h-56 sm:p-3 ${index === 1 ? 'bg-indigo-50/35' : 'bg-slate-50/70'}`}>
                      <div className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${column.tone}`} /><span className="truncate text-[9px] font-semibold text-slate-600 sm:text-[10px]">{column.label}</span><span className="ml-auto text-[9px] text-slate-300">0{index + 1}</span></div>
                      <div className={`relative z-10 mt-3 rounded-lg border border-slate-200/80 ${column.tint} p-2.5 shadow-[0_3px_10px_rgba(24,32,66,0.04)] sm:mt-4 sm:p-3`}>
                        <div className="mb-2 flex items-center justify-between"><span className="h-1 w-8 rounded-full bg-slate-200" /><span className="size-4 rounded-full bg-white/80" /></div>
                        <p className="text-[9px] font-medium leading-4 text-slate-700 sm:text-[10px]">{column.item}</p>
                        <div className="mt-3 flex items-center justify-between"><span className="h-1 w-9 rounded-full bg-slate-200/80" /><span className="size-4 rounded-full border border-white bg-indigo-200" /></div>
                      </div>
                      {index === 1 && <div className="absolute inset-x-2.5 top-[56%] z-20 flex items-center justify-center sm:inset-x-3"><span className="flex size-10 items-center justify-center rounded-2xl border border-white bg-white text-indigo-600 shadow-[0_10px_30px_rgba(59,69,145,0.16)] sm:size-12"><CircleHelp className="size-5 sm:size-6" /></span></div>}
                      {index === 2 && <div className="mt-3 flex items-center gap-1 text-[8px] font-medium text-emerald-600 sm:mt-4"><MoveUpRight className="size-3" /> Rotanızı bulun</div>}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2.5 sm:px-4">
                  <div><p className="text-[10px] font-semibold text-slate-700">Her şey yolunda.</p><p className="mt-0.5 text-[9px] text-slate-400">Sadece aradığınız sayfa burada değil.</p></div>
                  <Link href="/" className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100" aria-label="Ana sayfaya dön"><ArrowRight className="size-4" /></Link>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 hidden items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 shadow-[0_12px_35px_rgba(32,43,93,0.12)] sm:flex"><span className="size-2 rounded-full bg-emerald-400" /><span className="text-[10px] font-medium text-slate-600">Yeni bir başlangıç bir tık uzakta</span></div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
