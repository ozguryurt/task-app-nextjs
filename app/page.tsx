import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const features = [
  { icon: Users2, title: "Ekipler tek merkezde", description: "Üyeleri, rolleri ve iş akışlarını karmaşa olmadan yönetin." },
  { icon: CheckCircle2, title: "Net görev takibi", description: "Sorumlu, öncelik ve teslim tarihini bir bakışta görün." },
  { icon: BarChart3, title: "Anlık ilerleme", description: "Ekibin odağını ve tamamlanan işleri gerçek zamanlı izleyin." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative">
        <div className="subtle-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div className="max-w-xl">
            <Badge variant="secondary" className="mb-5 rounded-full border border-primary/10 px-3 py-1 text-primary">
              <Sparkles className="size-3" /> Daha az operasyon, daha çok ilerleme
            </Badge>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-[3.6rem]">
              Ekibinizin odağını tek bir yerde toplayın.
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Görevleri planlayın, sorumlulukları netleştirin ve herkesin aynı hedefe ilerlemesini sağlayın.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild><Link href="/kayit">Çalışma alanı oluştur <ArrowRight /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/giris">Hesabıma giriş yap</Link></Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              {['Kurulum gerektirmez', 'Rol bazlı yetkilendirme', 'Ekibinle hemen başla'].map((item) => (
                <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> {item}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
            <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-cyan-400/10 to-transparent blur-2xl" />
            <Card className="overflow-hidden border-white/90 bg-white/80 p-0 shadow-[0_30px_90px_rgba(46,40,100,0.16)]">
              <div className="flex h-11 items-center justify-between border-b bg-white/70 px-4">
                <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-400" /><span className="size-2 rounded-full bg-amber-400" /><span className="size-2 rounded-full bg-emerald-400" /></div>
                <span className="text-[11px] font-medium text-muted-foreground">Proje görünümü</span><span className="w-8" />
              </div>
              <CardContent className="p-3 sm:p-4">
                <Image src="/hero.webp" alt="Taskflow ekip yönetimi ekranı" width={800} height={520} priority className="aspect-[4/2.65] w-full rounded-xl border object-cover object-top" />
              </CardContent>
            </Card>
            <div className="premium-panel absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border p-3 sm:flex">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-4.5" /></span>
              <div><p className="text-xs font-semibold">Sprint tamamlandı</p><p className="mt-0.5 text-[11px] text-muted-foreground">12 görev zamanında bitti</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="ozellikler" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-20 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-3 border-t pt-10 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Akıcı iş yönetimi</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Ekibiniz için gereken netlik</h2></div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Dağınık konuşmaları, belirsiz sorumlulukları ve kaçan teslim tarihlerini geride bırakın.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="group transition-all hover:-translate-y-1 hover:border-primary/15 hover:shadow-xl">
              <CardContent className="pt-1">
                <span className="mb-5 flex size-10 items-center justify-center rounded-xl bg-secondary text-primary transition-transform group-hover:scale-105"><Icon className="size-4.5" /></span>
                <h3 className="font-semibold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-4 overflow-hidden border-primary/10 bg-[#18172a] text-white shadow-2xl shadow-primary/10">
          <CardContent className="flex flex-col items-start justify-between gap-6 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10"><ShieldCheck className="size-5 text-indigo-300" /></span><div><h3 className="font-semibold">Ekibiniz hazır olduğunda siz de hazırsınız.</h3><p className="mt-1 text-sm text-white/55">Dakikalar içinde alanınızı kurun ve ilk görevi atayın.</p></div></div>
            <Button variant="secondary" asChild className="shrink-0 bg-white text-[#18172a] hover:bg-white/90"><Link href="/kayit">Şimdi başlayın <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </main>
  );
}
