import { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send, Loader2, Github, Linkedin, Twitter, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

const schema = z.object({
  name: z.string().trim().min(2, 'Nom trop court').max(100),
  email: z.string().trim().email('Email invalide').max(255),
  subject: z.string().trim().min(3, 'Sujet trop court').max(200),
  category: z.string(),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(150).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Message trop court').max(2000),
  honeypot: z.string().max(0, 'Spam détecté').optional(),
});

const CATEGORIES = [
  { v: 'general', l: 'Question générale' },
  { v: 'support', l: 'Support technique' },
  { v: 'partnership', l: 'Partenariat' },
  { v: 'bug', l: 'Signaler un bug' },
  { v: 'feature', l: 'Suggestion de fonctionnalité' },
  { v: 'other', l: 'Autre' },
];

export default function ContactPublicPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', category: 'general', phone: '', company: '', message: '', honeypot: '' });
  const [sending, setSending] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const update =
    (k: keyof typeof form) =>
    (e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: typeof e === 'string' ? e : e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSending(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: parsed.data.name, email: parsed.data.email, subject: parsed.data.subject,
      category: parsed.data.category, phone: parsed.data.phone || null,
      company: parsed.data.company || null, message: parsed.data.message,
      user_agent: navigator.userAgent,
    });
    setSending(false);
    if (error) { toast.error('Erreur lors de l\'envoi : ' + error.message); return; }
    setForm({ name: '', email: '', subject: '', category: 'general', phone: '', company: '', message: '', honeypot: '' });
    setSuccessOpen(true);
  };

  const infos = [
    { icon: Mail, label: 'Email', value: 'contact@cloudscripts.io' },
    { icon: Phone, label: 'Téléphone', value: '+33 1 23 45 67 89' },
    { icon: MapPin, label: 'Adresse', value: 'Paris, France' },
    { icon: Building2, label: 'Projet', value: 'Master ESTIAM' },
  ];

  return (
    <PublicLayout title="Contact" description="Contactez l'équipe Scripts Hub Tools — questions, partenariats, suggestions.">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative mx-auto px-4 lg:px-6 py-12 lg:py-20 text-center space-y-4 max-w-3xl animate-fade-in">
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5"><MessageSquare className="h-3 w-3 mr-1" /> Échangeons</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Parlons <span className="text-primary">ensemble</span></h1>
          <p className="text-muted-foreground">Une question, une idée, une opportunité ? Notre équipe vous répond rapidement.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-6 py-12 grid lg:grid-cols-3 gap-6">
        <aside className="space-y-4 animate-fade-in">
          {infos.map((i) => (
            <div key={i.label} className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><i.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{i.label}</p>
                <p className="font-medium">{i.value}</p>
              </div>
            </div>
          ))}
          <div className="p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur">
            <p className="text-xs text-muted-foreground mb-2">Suivez-nous</p>
            <div className="flex gap-2">
              <a href="#" className="p-2 rounded-md bg-secondary/60 hover:bg-primary/20 hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>
              <a href="#" className="p-2 rounded-md bg-secondary/60 hover:bg-primary/20 hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="#" className="p-2 rounded-md bg-secondary/60 hover:bg-primary/20 hover:text-primary transition-colors"><Twitter className="h-4 w-4" /></a>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <ShieldCheck className="h-5 w-5 text-primary mb-2" />
            <p className="text-sm font-medium">Données sécurisées</p>
            <p className="text-xs text-muted-foreground mt-1">Vos messages sont stockés de manière chiffrée et ne sont consultables que par les administrateurs.</p>
          </div>
        </aside>

        <form onSubmit={submit} className="lg:col-span-2 p-6 md:p-8 rounded-xl border border-border/60 bg-card/40 backdrop-blur space-y-4 animate-fade-in">
          <h2 className="text-xl font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Envoyer un message</h2>

          <input type="text" name="honeypot" value={form.honeypot} onChange={update('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom *</Label>
              <Input id="name" value={form.name} onChange={update('name')} required maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={update('email')} required maxLength={255} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={form.phone} onChange={update('phone')} maxLength={40} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Profession</Label>
              <Input id="company" value={form.company} onChange={update('company')} maxLength={150} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Catégorie *</Label>
              <Select value={form.category} onValueChange={update('category')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Sujet *</Label>
              <Input id="subject" value={form.subject} onChange={update('subject')} required maxLength={200} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message *</Label>
            <Textarea id="message" value={form.message} onChange={update('message')} required rows={6} maxLength={2000} />
            <p className="text-xs text-muted-foreground text-right">{form.message.length}/2000</p>
          </div>

          <Button type="submit" disabled={sending} className="gap-2 shadow-[var(--shadow-glow)]">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? 'Envoi...' : 'Envoyer le message'}
          </Button>
        </form>
      </section>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success data-[state=open]:animate-in data-[state=open]:zoom-in-95">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Message envoyé</DialogTitle>
            <DialogDescription className="text-center">
              Merci pour votre message. Notre équipe vous répondra rapidement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setSuccessOpen(false)} className="w-full sm:w-auto">OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
