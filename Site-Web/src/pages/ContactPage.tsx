import { useState } from 'react';
import { Mail, MessageSquare, MapPin, Phone, Send } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message envoyé avec succès', {
      description: 'Notre équipe vous répondra rapidement.',
    });
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  const infos = [
    { icon: Mail, label: 'Email', value: 'support@cloudscripts.io' },
    { icon: Phone, label: 'Téléphone', value: '+33 1 23 45 67 89' },
    { icon: MapPin, label: 'Adresse', value: 'Paris, France' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact</h1>
          <p className="mt-1 text-muted-foreground">
            Une question, une suggestion ? Notre équipe est à votre écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {infos.map((i) => (
              <div key={i.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <i.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{i.label}</p>
                  <p className="font-medium text-foreground">{i.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="lg:col-span-2 glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Envoyer un message
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="search-input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="search-input mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sujet</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="search-input mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Message</label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="search-input mt-1 resize-none"
              />
            </div>
            <Button type="submit" className="gap-2">
              <Send className="h-4 w-4" />
              Envoyer
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
