import { PublicLayout } from '@/components/public/PublicLayout';
import { useState, useEffect, useRef } from 'react';
import {
  Shield, FileText, Cookie, ScrollText, Mail, Scale, BookOpen, AlertCircle,
  ChevronRight, ExternalLink, Clock, Lock, Eye, Server, Users, Globe
} from 'lucide-react';

/* ─── types ─── */
interface TocItem { id: string; label: string; level: 1 | 2 }

interface LegalShellProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  updated?: string;
  children: React.ReactNode;
  seoDescription: string;
}

/* ─── helpers ─── */
const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* ─── scroll-spy hook ─── */
function useScrollSpy(ids: string[], offset = 120) {
  const [active, setActive] = useState<string>('');
  useEffect(() => {
    const handle = () => {
      let best = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) best = id;
      }
      setActive(best);
    };
    handle();
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, [ids, offset]);
  return active;
}

/* ─── table of contents ─── */
function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  const tocRef = useRef<HTMLDivElement>(null);
  return (
    <nav
      ref={tocRef}
      className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2"
    >
      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Sommaire
      </h4>
      <ul className="space-y-1 border-l border-border/50">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={
                  `block pl-4 py-1 text-sm transition-colors border-l-2 -ml-px ` +
                  (isActive
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border')
                }
                style={{ paddingLeft: item.level === 2 ? '1.5rem' : '1rem' }}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ─── section card ─── */
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 mb-12">
      <div className="glass-card rounded-2xl p-8 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-primary/60 inline-block" />
          {title}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <ChevronRight className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <div className="pl-6 text-muted-foreground leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

/* ─── main shell ─── */
function LegalShell({ title, subtitle, icon: Icon, updated, children, seoDescription }: LegalShellProps) {
  const [toc, setToc] = useState<TocItem[]>([]);

  /* Extract headings from children after mount */
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('section[id]'));
    const items: TocItem[] = headings.map((h) => ({
      id: h.id,
      label: (h.querySelector('h2')?.textContent || h.id).replace(/^\s+/, ''),
      level: 1,
    }));
    setToc(items);
  }, [children]);

  const activeId = useScrollSpy(toc.map((t) => t.id));

  return (
    <PublicLayout title={title} description={seoDescription}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* animated gradient blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[80px] animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-info/10 blur-[60px] animate-pulse-slow" />
        </div>

        <div className="relative border-b border-border/40">
          <div className="container mx-auto px-4 lg:px-6 py-16 md:py-20 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/30 shadow-glow">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    {title}
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-xl">{subtitle}</p>
                </div>
              </div>
              {updated && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
                  <Clock className="h-4 w-4 text-primary" />
                  Dernière mise à jour :{' '}
                  <span className="text-foreground font-medium">{updated}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Content grid ── */}
      <section className="container mx-auto px-4 lg:px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
          {/* main */}
          <main>{children}</main>

          {/* TOC */}
          <aside className="order-first lg:order-last">
            <TableOfContents items={toc} activeId={activeId} />
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}

const UPDATED = '4 juin 2026';

/* ══════════════════════════════════════════
   Conditions générales d'utilisation
   ══════════════════════════════════════════ */
export function TermsPage() {
  return (
    <LegalShell
      title="Conditions générales d'utilisation"
      subtitle="Règles d'usage, responsabilités et droits applicables sur Scripts Hub Tools."
      icon={Scale}
      updated={UPDATED}
      seoDescription="Conditions générales d'utilisation de Scripts Hub Tools — règles, responsabilités et droits d'usage."
    >
      <Section id="objet" title="1. Objet">
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
          du site <strong className="text-foreground">Scripts Hub Tools</strong>, plateforme
          éditoriale et pédagogique dédiée au partage de scripts d'infrastructure Cloud et DevOps.
        </p>
        <p>
          En naviguant sur ce site, vous acceptez sans réserve les présentes conditions. Si vous
          n'êtes pas en accord avec l'une de ces stipulations, nous vous invitons à cesser
          immédiatement toute utilisation du service.
        </p>
      </Section>

      <Section id="acces" title="2. Accès au service">
        <p>
          Le site est accessible librement et gratuitement à toute personne disposant d'un accès
          Internet. <strong className="text-foreground">Aucune création de compte n'est requise</strong>{' '}
          pour consulter les contenus publics (scripts, catégories, ressources).
        </p>
        <p>
          L'éditeur se réserve le droit de suspendre, interrompre ou limiter l'accès à tout ou
          partie du service, notamment pour des opérations de maintenance, de sécurité ou
          d'évolution technique, sans préavis ni indemnité.
        </p>
      </Section>

      <Section id="propriete" title="3. Propriété intellectuelle">
        <p>
          L'ensemble des contenus (textes, codes sources, visuels, logos, charte graphique)
          reste la propriété exclusive de leurs auteurs respectifs. Les scripts publiés peuvent être
          soumis à des licences spécifiques mentionnées sur leur page de détail.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou
          partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite
          sans l'autorisation écrite préalable de l'éditeur.
        </p>
      </Section>

      <Section id="responsabilite" title="4. Responsabilité">
        <p>
          Les scripts publiés sont fournis <strong className="text-foreground">« en l'état »</strong>{' '}
          à titre purement informatif et pédagogique. L'éditeur ne saurait être tenu responsable
          d'un usage inapproprié, d'un dommage matériel ou d'une perte de données résultant de
          leur exécution.
        </p>
        <SubSection title="Précaution d'usage">
          <p>
            L'utilisateur s'engage impérativement à tester tout script dans un environnement isolé
            (bac à sable, VM, conteneur de test) avant tout déploiement en production.
          </p>
        </SubSection>
      </Section>

      <Section id="usage-acceptable" title="5. Usage acceptable">
        <ul className="space-y-3 list-disc pl-6 marker:text-primary">
          <li>Ne pas tenter de compromettre la sécurité ou l'intégrité du service.</li>
          <li>Ne pas extraire massivement les contenus (scraping) sans autorisation préalable.</li>
          <li>Ne pas utiliser la plateforme à des fins illégales, malveillantes ou frauduleuses.</li>
          <li>Ne pas usurper l'identité d'autrui ni créer de faux comptes administrateurs.</li>
        </ul>
      </Section>

      <Section id="modifications" title="6. Modifications">
        <p>
          Les présentes CGU peuvent être modifiées à tout moment. La version applicable est celle
          publiée à la date de consultation du site. Nous vous recommandons de consulter
          régulièrement cette page pour prendre connaissance des éventuelles mises à jour.
        </p>
      </Section>

      <Section id="droit-applicable" title="7. Droit applicable">
        <p>
          Les CGU sont régies par le droit français. Tout litige relèvera de la compétence
          exclusive des tribunaux du ressort de Paris, sauf disposition légale impérative
          contraire.
        </p>
      </Section>
    </LegalShell>
  );
}

/* ══════════════════════════════════════════
   Politique de confidentialité
   ══════════════════════════════════════════ */
export function PrivacyPage() {
  return (
    <LegalShell
      title="Politique de confidentialité"
      subtitle="Protection et traitement des données des visiteurs de Scripts Hub Tools."
      icon={Shield}
      updated={UPDATED}
      seoDescription="Politique de confidentialité — comment Scripts Hub Tools collecte, utilise et protège les données des visiteurs."
    >
      <Section id="responsable" title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données collectées sur Scripts Hub Tools est l'équipe
          pédagogique du projet, dans le cadre du <strong className="text-foreground">Master ESTIAM</strong>.
          Pour toute question relative à la protection des données, vous pouvez nous contacter à{' '}
          <a href="mailto:contact@cloudscripts.io" className="text-primary underline underline-offset-4 hover:text-primary/80 inline-flex items-center gap-1">
            contact@cloudscripts.io <ExternalLink className="h-3 w-3" />
          </a>.
        </p>
      </Section>

      <Section id="donnees-collectees" title="2. Données collectées">
        <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-info/10 border border-info/20 text-info-foreground">
          <AlertCircle className="h-5 w-5 shrink-0 text-info" />
          <p className="text-sm font-medium">
            Les visiteurs <strong>ne créent pas de compte</strong> sur la plateforme. Aucune donnée
            personnelle d'identification n'est collectée automatiquement.
          </p>
        </div>

        <SubSection title="Données de navigation anonymisées">
          <p>
            Pages consultées, durée de visite, type de navigateur, système d'exploitation. Ces
            données sont agrégées et ne permettent pas de vous identifier personnellement.
          </p>
        </SubSection>
        <SubSection title="Adresse IP partielle">
          <p>
            Utilisée à des fins de sécurité et de prévention des abus (rate limiting, détection
            d'attaques). L'adresse complète n'est ni stockée ni exploitée à des fins commerciales.
          </p>
        </SubSection>
        <SubSection title="Formulaire de contact">
          <p>
            Lorsque vous nous écrivez volontairement via le formulaire de contact, nous collectons
            : nom, adresse e-mail, sujet et contenu du message.
          </p>
        </SubSection>
        <SubSection title="Compteurs d'engagement">
          <p>
            Likes, partages, téléchargements sont agrégés de manière anonyme. Ils ne sont pas
            rattachés à une personne identifiée.
          </p>
        </SubSection>
      </Section>

      <Section id="finalites" title="3. Finalités du traitement">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Server, title: 'Fonctionnement', text: 'Assurer le bon fonctionnement technique et la sécurité de la plateforme.' },
            { icon: Eye, title: 'Audience', text: 'Mesurer l\'audience anonymement et améliorer l\'expérience utilisateur.' },
            { icon: Mail, title: 'Contact', text: 'Répondre aux demandes envoyées via le formulaire de contact.' },
          ].map((card) => (
            <div key={card.title} className="p-5 rounded-xl bg-secondary/40 border border-border/50 flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-foreground text-sm">{card.title}</h4>
              <p className="text-sm text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="base-legale" title="4. Base légale">
        <p>
          Les traitements reposent sur :{' '}
          <strong className="text-foreground">l'intérêt légitime</strong> de l'éditeur (sécurité,
          mesure d'audience) et sur votre <strong className="text-foreground">consentement explicite</strong>{' '}
          pour le formulaire de contact, conformément au RGPD.
        </p>
      </Section>

      <Section id="conservation" title="5. Durée de conservation">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-border/50 rounded-xl overflow-hidden">
            <thead className="bg-secondary/70 text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Type de données</th>
                <th className="px-4 py-3 font-semibold">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr className="bg-card/40">
                <td className="px-4 py-3">Logs de sécurité</td>
                <td className="px-4 py-3">90 jours actifs, puis archivage sécurisé</td>
              </tr>
              <tr className="bg-card/40">
                <td className="px-4 py-3">Messages de contact</td>
                <td className="px-4 py-3">24 mois maximum</td>
              </tr>
              <tr className="bg-card/40">
                <td className="px-4 py-3">Données d'engagement</td>
                <td className="px-4 py-3">Conservées de manière agrégée sans identification</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="droits" title="6. Vos droits">
        <p>
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul className="space-y-2 list-disc pl-6 marker:text-primary">
          <li><strong className="text-foreground">Droit d'accès</strong> : obtenir une copie de vos données.</li>
          <li><strong className="text-foreground">Droit de rectification</strong> : corriger des informations inexactes.</li>
          <li><strong className="text-foreground">Droit à l'effacement</strong> (« droit à l'oubli »).</li>
          <li><strong className="text-foreground">Droit d'opposition</strong> : vous opposer au traitement de vos données.</li>
          <li><strong className="text-foreground">Droit à la portabilité</strong> : récupérer vos données dans un format structuré.</li>
        </ul>
        <p className="mt-4">
          Pour exercer ces droits, contactez-nous à{' '}
          <a href="mailto:contact@cloudscripts.io" className="text-primary underline underline-offset-4 hover:text-primary/80 inline-flex items-center gap-1">
            contact@cloudscripts.io <ExternalLink className="h-3 w-3" />
          </a>.
        </p>
      </Section>

      <Section id="partage" title="7. Partage et sous-traitance">
        <p>
          Les données ne sont <strong className="text-foreground">jamais cédées</strong> à des tiers
          commerciaux. L'hébergement est assuré par <strong className="text-foreground">Supabase</strong>{' '}
          (Union Européenne) et l'application est servie via une infrastructure Cloud sécurisée
          conforme au RGPD.
        </p>
      </Section>

      <Section id="securite" title="8. Sécurité">
        <div className="flex items-start gap-4 p-5 rounded-xl bg-success/10 border border-success/20">
          <Lock className="h-6 w-6 text-success shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-success-foreground mb-1">Sécurité renforcée</h4>
            <p className="text-sm text-muted-foreground">
              Toutes les communications sont chiffrées en HTTPS (TLS 1.3). Les données sensibles
              sont protégées par <strong className="text-foreground">Row Level Security (RLS)</strong>{' '}
              au niveau de la base de données. Aucun token d'authentification n'est exposé côté client.
            </p>
          </div>
        </div>
      </Section>
    </LegalShell>
  );
}

/* ══════════════════════════════════════════
   Politique des cookies
   ══════════════════════════════════════════ */
export function CookiesPage() {
  return (
    <LegalShell
      title="Politique des cookies"
      subtitle="Usage des cookies et technologies similaires sur Scripts Hub Tools."
      icon={Cookie}
      updated={UPDATED}
      seoDescription="Politique des cookies — quels cookies utilise Scripts Hub Tools et comment les gérer."
    >
      <Section id="definition" title="1. Qu'est-ce qu'un cookie ?">
        <p>
          Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette,
          smartphone) lors de la consultation d'un site web. Il permet de mémoriser des informations
          relatives à votre navigation pour faciliter votre visite et améliorer l'expérience.
        </p>
      </Section>

      <Section id="cookies-utilises" title="2. Cookies utilisés">
        <SubSection title="Cookies strictement nécessaires">
          <p>
            Ces cookies sont indispensables au fonctionnement du site. Ils ne nécessitent{' '}
            <strong className="text-foreground">aucun consentement</strong> de votre part.
          </p>
          <ul className="list-disc pl-6 marker:text-primary space-y-1 mt-2">
            <li><strong className="text-foreground">Préférence de thème</strong> (clair / sombre)</li>
            <li><strong className="text-foreground">Session de navigation</strong> temporaire</li>
          </ul>
        </SubSection>

        <SubSection title="Cookies de performance (anonymes)">
          <p>
            Permettent de mesurer l'audience de manière entièrement anonyme : pages visitées,
            temps passé, taux de rebond. Aucune donnée personnelle n'est collectée.
          </p>
        </SubSection>
      </Section>

      <Section id="pas-publicitaires" title="3. Aucun cookie publicitaire">
        <div className="flex items-start gap-4 p-5 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-destructive-foreground mb-1">Zero publicité, zero tracking tiers</h4>
            <p className="text-sm text-muted-foreground">
              Scripts Hub Tools n'utilise <strong className="text-foreground">aucun cookie publicitaire</strong>,{' '}
              <strong className="text-foreground">aucun traçage tiers</strong> (Google Analytics,
              Facebook Pixel, etc.) et <strong className="text-foreground">ne revend aucune donnée</strong>.
              Votre navigation reste privée.
            </p>
          </div>
        </div>
      </Section>

      <Section id="gestion" title="4. Gestion des cookies">
        <p>
          Vous pouvez à tout moment configurer votre navigateur pour bloquer, restreindre ou
          supprimer les cookies. Voici les liens vers les guides officiels des principaux navigateurs :
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {[
            { label: 'Google Chrome', href: 'https://support.google.com/chrome/answer/95647' },
            { label: 'Mozilla Firefox', href: 'https://support.mozilla.org/kb/cookies-information-websites-store' },
            { label: 'Microsoft Edge', href: 'https://support.microsoft.com/edge/cookies' },
            { label: 'Apple Safari', href: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <Globe className="h-4 w-4 text-primary" />
              {link.label}
              <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
            </a>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Notez que la suppression des cookies strictement nécessaires peut altérer certaines
          fonctionnalités du site (préférence de thème, par exemple).
        </p>
      </Section>
    </LegalShell>
  );
}

/* ══════════════════════════════════════════
   Mentions légales
   ══════════════════════════════════════════ */
export function LegalNoticePage() {
  return (
    <LegalShell
      title="Mentions légales"
      subtitle="Informations légales relatives à l'éditeur et à l'hébergement du site."
      icon={FileText}
      updated={UPDATED}
      seoDescription="Mentions légales de Scripts Hub Tools — éditeur, hébergeur et informations légales."
    >
      <Section id="editeur" title="Éditeur du site">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-secondary/40 border border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Identité
            </h4>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Scripts Hub Tools</strong><br />
              Projet pédagogique réalisé dans le cadre du Master ESTIAM.
              Le site n'a pas de vocation commerciale.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-secondary/40 border border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Directeur de la publication
            </h4>
            <p className="text-sm text-muted-foreground">
              Équipe Master ESTIAM — promotion 2025-2026.
            </p>
          </div>
        </div>
      </Section>

      <Section id="hebergement" title="Hébergement">
        <p>
          Le site est hébergé par <strong className="text-foreground">Supabase</strong> (base de
          données PostgreSQL, fonctions Edge et stockage objet) et servi via une infrastructure
          Cloud sécurisée déployée dans l'<strong className="text-foreground">Union Européenne</strong>{' '}
          (régions France-Central et Europe-Nord), garantissant la conformité RGPD.
        </p>
      </Section>

      <Section id="contact-legal" title="Contact">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Mail className="h-5 w-5 text-primary" />
          <a
            href="mailto:contact@cloudscripts.io"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            contact@cloudscripts.io
          </a>
        </div>
      </Section>

      <Section id="propriete-intellectuelle" title="Propriété intellectuelle">
        <p>
          L'ensemble du contenu du site (design, code applicatif, textes, illustrations,
          photographies, logos) est protégé par le droit d'auteur et, le cas échéant, par le droit
          des marques. Toute reproduction, représentation ou diffusion, en tout ou en partie, sans
          autorisation préalable écrite est strictement interdite et constitue une contrefaçon
          sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
        </p>
      </Section>

      <Section id="credits" title="Crédits">
        <p>
          Conçu avec <strong className="text-foreground">React</strong>,{' '}
          <strong className="text-foreground">Tailwind CSS</strong>,{' '}
          <strong className="text-foreground">Supabase</strong> et l'écosystème open source.
        </p>
        <p className="mt-2">
          Icônes fournies par{' '}
          <a
            href="https://lucide.dev"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4 inline-flex items-center gap-1 hover:text-primary/80"
          >
            Lucide <ExternalLink className="h-3 w-3" />
          </a>.
          Typographie : Inter (Google Fonts) & JetBrains Mono (Google Fonts).
        </p>
      </Section>
    </LegalShell>
  );
}
