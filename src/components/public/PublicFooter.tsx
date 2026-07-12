import { Link } from 'react-router-dom';
import { Cloud, Mail, Github, Linkedin, Twitter, Shield, Heart } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="relative mt-20 border-t border-border/60 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4 lg:px-6 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
              <Cloud className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">
              Scripts <span className="text-primary">Hub Tools</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Plateforme centralisée et sécurisée dédiée à la gestion, au partage et à la
            valorisation de scripts Cloud & DevOps. Accessible sans création de compte.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="#" aria-label="GitHub" className="p-2 rounded-md bg-secondary/60 hover:bg-primary/20 hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-md bg-secondary/60 hover:bg-primary/20 hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="p-2 rounded-md bg-secondary/60 hover:bg-primary/20 hover:text-primary transition-colors"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Navigation</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Accueil</Link></li>
            <li><Link to="/qui-sommes-nous" className="hover:text-primary transition-colors">Qui sommes-nous ?</Link></li>
            <li><Link to="/nos-scripts" className="hover:text-primary transition-colors">Scripts</Link></li>
            <li><Link to="/nos-categories" className="hover:text-primary transition-colors">Catégories</Link></li>
            <li><Link to="/nos-ressources" className="hover:text-primary transition-colors">Ressources</Link></li>
            <li><Link to="/nous-contacter" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Informations légales</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link></li>
            <li><Link to="/conditions-generales" className="hover:text-primary transition-colors">Conditions générales</Link></li>
            <li><Link to="/politique-confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
            <li><Link to="/politique-cookies" className="hover:text-primary transition-colors">Politique des cookies</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary shrink-0" /> contact@cloudscripts.io</li>
            <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary shrink-0" /> Données chiffrées & RGPD</li>
            <li><a href="https://www.estiam.education/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">École ESTIAM</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Scripts Hub Tools — Projet pédagogique ESTIAM. Tous droits réservés.</p>
          <p className="flex items-center gap-1">Conçu avec <Heart className="h-3 w-3 text-destructive" /> par l'équipe Master ESTIAM</p>
        </div>
      </div>
    </footer>
  );
}
