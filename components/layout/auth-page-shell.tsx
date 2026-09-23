import Link from 'next/link';
import { ArrowUpRight, Check, Layers3, Sparkles } from 'lucide-react';

export function AuthPageShell({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-dvh flex-col bg-[#f6f8fc] text-slate-900">
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
                <Link href="/" className="group flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_5px_14px_rgba(55,70,180,0.24)] transition-transform group-hover:-rotate-3"><Layers3 className="size-4" /></span>
                    <span className="text-sm font-semibold tracking-[-0.025em]">Taskflow</span>
                </Link>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600">Ana sayfa <ArrowUpRight className="size-3.5" /></Link>
            </header>

            <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:py-12">
                <section className="motion-reveal hidden max-w-xl lg:block">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-700 shadow-sm"><Sparkles className="size-3.5" /> Ekip çalışması için tek alan</div>
                    <h1 className="max-w-lg text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-slate-900 xl:text-[3.25rem]">İyi işler, iyi bir akışla başlar.</h1>
                    <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">Görevleri, ekipleri ve teslim tarihlerini tek bir sakin çalışma alanında bir araya getirin.</p>

                    <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_14px_40px_rgba(24,32,66,0.06)]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">Bugünün odağı</p><p className="mt-1 text-xs font-semibold text-slate-800">Ekip akışta ilerliyor</p></div><span className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Check className="size-4" /></span></div>
                        <div className="space-y-1.5 pt-3">
                            {['Lansman planını netleştir', 'İçerikleri son kez gözden geçir', 'Ekiple gün sonu paylaşımı'].map((task, index) => <div key={task} className="flex items-center gap-2.5 rounded-lg px-2 py-2"><span className={`flex size-4 items-center justify-center rounded-full ${index === 0 ? 'border border-indigo-300 text-indigo-500' : 'bg-emerald-50 text-emerald-600'}`}>{index > 0 && <Check className="size-2.5" />}</span><span className={`flex-1 text-[10px] ${index > 0 ? 'text-slate-400 line-through' : 'font-medium text-slate-700'}`}>{task}</span><span className={`size-1.5 rounded-full ${['bg-violet-400', 'bg-sky-400', 'bg-emerald-400'][index]}`} /></div>)}
                        </div>
                        <div className="mt-2 flex items-center justify-between rounded-xl bg-[#f7f8fc] px-3 py-2.5"><span className="text-[10px] text-slate-500">Bu haftaki tamamlanma</span><span className="text-sm font-semibold tracking-tight text-slate-900">72%</span></div>
                    </div>
                    <div className="mt-5 flex items-center gap-4 text-[10px] text-slate-400"><span className="inline-flex items-center gap-1.5"><Check className="size-3 text-emerald-500" /> Kolay başlangıç</span><span className="inline-flex items-center gap-1.5"><Check className="size-3 text-emerald-500" /> Ekip odaklı</span></div>
                </section>

                <div className="motion-reveal mx-auto w-full max-w-[440px] [animation-delay:80ms]">{children}</div>
            </div>

            <footer className="flex min-h-11 items-center justify-center border-t border-slate-200/70 px-5 text-center text-[10px] text-slate-400">Taskflow · Görevler, ekipler ve ilerleme tek çalışma alanında.</footer>
        </main>
    );
}
