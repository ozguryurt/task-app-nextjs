import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ShieldCheck,
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

      <section className="relative before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-[38rem] before:bg-[radial-gradient(circle_at_70%_15%,rgba(79,70,229,0.10),transparent_42%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:py-24">
          <div className="motion-reveal max-w-xl">
            <Badge variant="outline" className="mb-5 rounded-full border-primary/15 bg-primary/[0.035] px-3 py-1 text-primary">
              Ekip yönetimi, sadeleştirildi
            </Badge>
            <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-5xl lg:text-[3.6rem]">
              Ekibinizin odağını tek bir yerde toplayın.
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
              Görevleri planlayın, sorumlulukları netleştirin ve herkesin aynı hedefe ilerlemesini sağlayın.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Button size="lg" asChild><Link href="/kayit">Çalışma alanı oluştur <ArrowRight /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/giris">Hesabıma giriş yap</Link></Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {['Kurulum gerektirmez', 'Rol bazlı yetkilendirme', 'Ekibinle hemen başla'].map((item) => (
                <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> {item}</span>
              ))}
            </div>
          </div>

          <div className="motion-reveal relative mx-auto w-full max-w-2xl [animation-delay:100ms] lg:mx-0">
            <Card className="overflow-hidden border-white/80 bg-card p-0 shadow-[0_28px_80px_rgba(23,31,59,0.14)] ring-1 ring-primary/[0.04]">
              <div className="flex h-10 items-center justify-between border-b bg-muted/40 px-4">
                <div className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-muted-foreground/30" /><span className="size-1.5 rounded-full bg-muted-foreground/30" /><span className="size-1.5 rounded-full bg-muted-foreground/30" /></div>
                <span className="text-[11px] font-medium text-muted-foreground">Proje görünümü</span><span className="w-8" />
              </div>
              <CardContent className="p-2 sm:p-3">
                <Image src="/hero.webp" alt="Taskflow ekip yönetimi ekranı" width={800} height={520} priority className="aspect-[4/2.65] w-full rounded-md border object-cover object-top" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="ozellikler" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-16 sm:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 border-t pt-9 sm:flex-row sm:items-end">
          <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Temel özellikler</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Ekibiniz için gereken netlik</h2></div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Dağınık konuşmaları, belirsiz sorumlulukları ve kaçan teslim tarihlerini geride bırakın.</p>
        </div>
        <div className="motion-stagger grid gap-3 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="transition-colors hover:border-primary/25">
              <CardContent>
                <span className="mb-4 flex size-8 items-center justify-center rounded-md bg-secondary text-primary"><Icon className="size-4" /></span>
                <h3 className="font-semibold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-3 border-border bg-secondary/55">
          <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-card text-primary"><ShieldCheck className="size-4" /></span><div><h3 className="text-sm font-semibold">Ekibiniz hazır olduğunda siz de hazırsınız.</h3><p className="mt-0.5 text-xs text-muted-foreground">Dakikalar içinde alanınızı kurun ve ilk görevi atayın.</p></div></div>
            <Button variant="outline" asChild className="shrink-0"><Link href="/kayit">Şimdi başlayın <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </main>
  );
}
