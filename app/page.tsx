import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckSquare,
  BarChart3,
  Bell,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background border-b min-h-screen flex items-center">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2">
                <Sparkles className="h-4 w-4" />
                Takım Yönetiminde Yeni Dönem
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-transparent bg-clip-text">
                  Takımınızı
                </span>
                <br />
                <span className="text-foreground">
                  Güçlendirin
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Ekip üyelerinizi bir araya getirin, görevleri kolayca atayın ve projelerin ilerlemesini gerçek zamanlı takip edin. Başarıya giden yol, doğru araçlarla başlar.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="group" asChild>
                  <Link href="/login">
                    Hemen Başla
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <p className="text-3xl font-bold">10K+</p>
                  <p className="text-sm text-muted-foreground">Aktif Kullanıcı</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">50K+</p>
                  <p className="text-sm text-muted-foreground">Tamamlanan Görev</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">99%</p>
                  <p className="text-sm text-muted-foreground">Memnuniyet</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <Card className="relative overflow-hidden border-2">
                <CardContent className="p-4">
                  <Image
                    src="/hero.webp"
                    alt="Takım Yönetimi Dashboard"
                    width={600}
                    height={400}
                    className="rounded-lg w-full h-auto"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary">Özellikler</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Güçlü Özellikler, <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">Kolay Kullanım</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Takım yönetimini kolaylaştıran ve verimliliği artıran özellikleri keşfedin
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Takım Yönetimi</CardTitle>
                <CardDescription className="text-base">
                  Ekip üyelerinizi kolayca ekleyin, roller atayın ve tüm takımı tek bir yerden yönetin.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckSquare className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle className="text-2xl">Görev Atama</CardTitle>
                <CardDescription className="text-base">
                  Görevleri hızlıca oluşturun, önceliklendirin ve doğru kişilere atayın. Deadline yönetimi kolayca.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <CardTitle className="text-2xl">İlerleme Takibi</CardTitle>
                <CardDescription className="text-base">
                  Gerçek zamanlı raporlar ve grafiklerle projelerin ilerlemesini her an takip edin.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Anlık Bildirimler</CardTitle>
                <CardDescription className="text-base">
                  Önemli güncellemeler ve değişiklikler hakkında anında bildirim alın.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-2xl">Zaman Yönetimi</CardTitle>
                <CardDescription className="text-base">
                  Zaman takibi ve raporlama ile ekibinizin verimliliğini maksimize edin.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-slate-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <CardTitle className="text-2xl">Güvenli Sistem</CardTitle>
                <CardDescription className="text-base">
                  Rol bazlı erişim kontrolü ile verilerinizi güvende tutun.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
