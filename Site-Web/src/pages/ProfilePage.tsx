import { useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useUserData';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const save = () => {
    updateProfile({ name, email, role });
    toast.success('Profil mis à jour');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
          <p className="mt-1 text-muted-foreground">Gérez vos informations personnelles</p>
        </div>

        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground"
              style={{ background: `hsl(${profile.avatarColor})` }}
            >
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {profile.email}
              </p>
              <p className="text-sm text-primary flex items-center gap-2 mt-1">
                <Shield className="h-4 w-4" />
                {profile.role}
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informations personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="search-input mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="search-input mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Rôle</label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="search-input mt-1"
              />
            </div>
          </div>
          <Button onClick={save}>Enregistrer les modifications</Button>
        </section>
      </div>
    </DashboardLayout>
  );
}
