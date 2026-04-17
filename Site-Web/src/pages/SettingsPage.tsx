import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { User, Bell, Shield, Database, Server } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="mt-1 text-muted-foreground">
            Gérez vos préférences et la configuration de la plateforme
          </p>
        </div>

        <div className="space-y-4">
          {/* Profile Section */}
          <section className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Profil Utilisateur</h2>
                <p className="text-sm text-muted-foreground">Informations personnelles et préférences</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                <input 
                  type="text" 
                  defaultValue="Admin Azure"
                  className="search-input mt-1 w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input 
                  type="email" 
                  defaultValue="admin@contoso.com"
                  className="search-input mt-1 w-full"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Notifications</h2>
                <p className="text-sm text-muted-foreground">Configurez vos alertes et notifications</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-background/50 rounded-lg cursor-pointer">
                <span className="text-foreground">Nouveaux scripts ajoutés</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
              </label>
              <label className="flex items-center justify-between p-3 bg-background/50 rounded-lg cursor-pointer">
                <span className="text-foreground">Mises à jour de scripts</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
              </label>
              <label className="flex items-center justify-between p-3 bg-background/50 rounded-lg cursor-pointer">
                <span className="text-foreground">Alertes de sécurité</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
              </label>
            </div>
          </section>

          {/* Security */}
          <section className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Sécurité</h2>
                <p className="text-sm text-muted-foreground">Authentification et contrôle d'accès</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-background/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Authentification MFA</p>
                  <p className="text-sm text-muted-foreground">Protection supplémentaire du compte</p>
                </div>
                <span className="px-3 py-1 bg-success/20 text-success text-sm rounded-full">Activé</span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sessions actives</p>
                  <p className="text-sm text-muted-foreground">Gérez vos connexions</p>
                </div>
                <span className="text-muted-foreground">2 appareils</span>
              </div>
            </div>
          </section>

          {/* Infrastructure Info */}
          <section className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Infrastructure</h2>
                <p className="text-sm text-muted-foreground">État des services backend</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Region</span>
                  <span className="text-foreground">France Central 🇫🇷</span>
                </div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Backup Region</span>
                  <span className="text-foreground">North Europe 🇪🇺</span>
                </div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">App Service</span>
                  <span className="flex items-center gap-1 text-success">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Opérationnel
                  </span>
                </div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Load Balancer</span>
                  <span className="flex items-center gap-1 text-success">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Actif
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
