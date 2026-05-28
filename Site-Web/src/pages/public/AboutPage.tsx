import { GraduationCap, Users, Target, Sparkles, Shield, Cloud, Server, Brain, Network, Heart, Award, Lightbulb, BookOpen, Rocket, CheckCircle2 } from 'lucide-react';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Amir Minihadji AMINA', role: 'Développeur + Administrateur', classe: 'E5 - CCSN', desc: 'Spécialiste full-stack et administration système.' },
  { name: 'LO Pape', role: 'Chef de projet + Développeur Backend + Administrateur', classe: 'E4 - CCSN', desc: 'Pilotage, architecture backend et coordination équipe.' },
  { name: 'Neylie NDJUMKENG-NGUEMO', role: 'Architecte Logiciel', classe: 'E4 - CCSN', desc: 'Conception logicielle et patterns d\'architecture.' },
  { name: 'Steve John BIAMOU HOUMGA', role: 'Expert Cybersécurité', classe: 'E4 - CCSN', desc: 'Sécurité applicative, RLS et audit.' },
  { name: 'Gauyet NGUEFACK-TCHAMI', role: 'Experte Cybersécurité', classe: 'E4 - CCSN', desc: 'Tests d\'intrusion et hardening de la plateforme.' },
];

const values = [
  { icon: Lightbulb, title: 'Innovation', desc: 'Explorer les technologies émergentes du Cloud et du DevOps.' },
  { icon: Users, title: 'Collaboration', desc: 'Construire ensemble, partager le savoir, progresser collectivement.' },
  { icon: Shield, title: 'Sécurité', desc: 'Faire de la sécurité une priorité dès la conception.' },
  { icon: BookOpen, title: 'Apprentissage continu', desc: 'Apprendre, expérimenter et améliorer en permanence.' },
  { icon: Award, title: 'Excellence technique', desc: 'Qualité de code, performance et bonnes pratiques.' },
  { icon: Heart, title: 'Partage des connaissances', desc: 'Diffuser librement nos ressources et nos retours d\'expérience.' },
];

const skills = [
  { icon: Server, label: 'Web & Mobile Development – Conception des architectures Internet des objets' },
  { icon: Brain, label: 'Big Data & Artificial Intelligence' },
  { icon: BookOpen, label: 'Digital Design' },
  { icon: Shield, label: 'Cyber Security, Cloud, Systems & Networks' },
  { icon: Users, label: 'Intégration & Team Building' },
  { icon: Cloud, label: 'BTS SIO SIST & SLAM' },
];

const timeline = [
  { year: 'Janvier 2026', title: 'Début du projet', desc: 'Lancement dans le cadre du Master à ESTIAM.' },
  { year: 'Février 2026', title: 'Architecture & MVP', desc: 'Conception de l\'architecture sécurisée et premier MVP fonctionnel.' },
  { year: 'Mars & Avril  2026', title: 'Dashboard administrateur', desc: 'Gestion complète des scripts, catégories, ressources et utilisateurs.' },
  { year: 'Mai & Juin. 2026', title: 'Déploiement & Hébergement', desc: 'Mise en place du déploiement, hébergement et sécurisation de l\'environnement.' },
  { year: 'Juillet & Août 2026', title: 'Interface publique', desc: 'Ouverture de la plateforme aux visiteurs avec un design premium.' },
];

export default function AboutPage() {
  return (
    <PublicLayout title="Qui sommes-nous ?" description="L'équipe et le projet derrière Scripts Hub Tools — un projet pédagogique ESTIAM devenu plateforme professionnelle.">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="container relative mx-auto px-4 lg:px-6 py-20 lg:py-28 text-center max-w-3xl space-y-5 animate-fade-in">
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5"><Sparkles className="h-3 w-3 mr-1" /> Notre histoire</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Une équipe passionnée, <span className="bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent">un projet ambitieux</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Scripts Hub Tools est né d'un projet de Master à ESTIAM, porté par cinq étudiants passionnés par le développement,
            la cybersécurité et les technologies cloud, et accompagnés par un superviseur dédié.
          </p>
        </div>
      </section>

      {/* Project */}
      <section className="container mx-auto px-4 lg:px-6 py-12 grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30">Le projet</Badge>
          <h2 className="text-3xl font-bold">Pourquoi Scripts Hub Tools ?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Réalisé initialement dans le cadre de notre <strong className="text-foreground">Master à ESTIAM</strong>,
            ce projet a évolué vers un véritable produit professionnel. Notre objectif : créer une plateforme moderne,
            utile, performante et évolutive, tout en appliquant les compétences réelles du monde professionnel.
          </p>
          <ul className="space-y-2 text-sm">
            {['Méthodologie agile et travail en équipe','Architecture pensée pour évoluer','Sécurité dès la conception','Qualité du code et performances','Expérience utilisateur soignée'].map((t) => (
              <li key={t} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {t}</li>
            ))}
          </ul>
        </div>
        <div className="relative p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/40">
          <Rocket className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Notre vision</h3>
          <p className="text-muted-foreground leading-relaxed">
            Transformer ce projet pédagogique en véritable plateforme professionnelle accessible à tous, autour
            du partage de scripts et de ressources Cloud. Construire une communauté autour des bonnes pratiques DevOps.
          </p>
        </div>
      </section>

      {/* ESTIAM */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-[var(--shadow-glow)] shrink-0">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="space-y-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Notre école</Badge>
              <h2 className="text-3xl font-bold"><a className="hover:text-primary underline-offset-4 hover:underline" href="https://www.estiam.education/" target="_blank" rel="noreferrer">ESTIAM</a> - École du numérique</h2>
              <p className="text-muted-foreground leading-relaxed">
                ESTIAM est une école spécialisée dans l'informatique, le numérique et les technologies innovantes.
                Sa pédagogie est basée sur la pratique, les projets concrets et la professionnalisation, avec une forte
                orientation vers le développement logiciel, la cybersécurité, le cloud, l'intelligence artificielle et les systèmes & réseaux.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                {skills.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 p-3 rounded-lg border border-border/60 bg-background/60 hover:border-primary/40 transition-colors">
                    <s.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30">Notre équipe</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Les visages du projet</h2>
          <p className="text-muted-foreground">Cinq étudiants passionnés, des rôles complémentaires, une seule vision.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((m, i) => {
            const initials = m.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
            return (
              <div key={m.name}
                className="group relative p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/40 text-primary-foreground text-xl font-bold mb-4 shadow-[var(--shadow-glow)]">
                  {initials}
                </div>
                <h3 className="font-semibold text-lg leading-tight">{m.name}</h3>
                <p className="text-sm text-primary mt-1">{m.role}</p>
                <Badge variant="secondary" className="mt-2 text-xs">{m.classe}</Badge>
                <p className="text-sm text-muted-foreground mt-3">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supervisor */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-10 max-w-3xl mx-auto text-center">
          <Award className="h-10 w-10 text-primary mx-auto mb-3" />
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-3">Supervision</Badge>
          <h2 className="text-2xl font-bold">Mhand BOUFALA</h2>
          <p className="text-primary text-sm mt-1">Superviseur du projet</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Nous adressons nos remerciements sincères à notre superviseur pour son accompagnement précieux, ses conseils
            techniques et pédagogiques, et la rigueur professionnelle qu'il nous a transmise tout au long du projet.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30">Nos valeurs</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Ce qui nous anime</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <div key={v.title}
              className="p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 mb-3 shadow-[var(--shadow-glow)]">
                <v.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30">Notre parcours</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Les grandes étapes</h2>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />
          {timeline.map((t, i) => (
            <div key={t.title} className={`relative grid md:grid-cols-2 gap-4 mb-8 ${i % 2 ? 'md:[&>div:first-child]:order-2 md:text-left' : 'md:text-right'}`}>
              <div className="pl-10 md:pl-0 md:pr-10">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-2">{t.year}</Badge>
                <h3 className="font-semibold text-lg">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <div className="hidden md:block" />
              <div className="absolute left-2.5 md:left-1/2 top-1.5 -translate-x-1/2 h-3 w-3 rounded-full bg-primary shadow-[var(--shadow-glow)]" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 lg:px-6 py-16">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-transparent p-10 text-center space-y-4">
          <Target className="h-10 w-10 text-primary mx-auto" />
          <h2 className="text-3xl font-bold">Envie d'en discuter ?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Nous sommes ouverts à toute collaboration, retour ou opportunité professionnelle.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg"><Link to="/nous-contacter">Nous contacter</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/nos-scripts">Voir nos scripts</Link></Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
