import { useEffect, useState } from 'react';
import { Loader2, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { isPseudoAvailable, registerGuest, validatePseudo, type GuestIdentity } from '@/hooks/useGuest';
import { toast } from '@/lib/toast';

interface GuestPseudoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered: (guest: GuestIdentity) => void;
  reason?: string;
}

export function GuestPseudoDialog({ open, onOpenChange, onRegistered, reason }: GuestPseudoDialogProps) {
  const [pseudo, setPseudo] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setPseudo(''); setAvailable(null); setValidationError(null); setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    const err = pseudo ? validatePseudo(pseudo) : null;
    setValidationError(err);
    setAvailable(null);
    if (err || !pseudo) return;
    setChecking(true);
    const handle = setTimeout(async () => {
      const ok = await isPseudoAvailable(pseudo);
      setAvailable(ok);
      setChecking(false);
    }, 400);
    return () => { clearTimeout(handle); setChecking(false); };
  }, [pseudo]);

  const submit = async () => {
    const err = validatePseudo(pseudo);
    if (err) { setValidationError(err); return; }
    setSubmitting(true);
    try {
      const guest = await registerGuest(pseudo);
      toast.success(`Bienvenue ${guest.pseudo} !`);
      onRegistered(guest);
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      setValidationError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !validationError && !!pseudo && available === true && !submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <User className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Choisissez un pseudo</DialogTitle>
          <DialogDescription className="text-center">
            {reason ?? "Pour interagir sans compte, choisissez un pseudo unique. Il sera réutilisé pour toutes vos futures interactions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="pseudo">Pseudo</Label>
            <div className="relative">
              <Input
                id="pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="ex : dev_azure_2026"
                autoComplete="off"
                maxLength={30}
                onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) submit(); }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!checking && available === true && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {!checking && available === false && <AlertCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              6 à 30 caractères — lettres, chiffres, <code>_ . -</code>
            </p>
            {validationError && <p className="text-xs text-destructive">{validationError}</p>}
            {!validationError && available === false && (
              <p className="text-xs text-destructive">Ce pseudo est déjà utilisé, essayez-en un autre.</p>
            )}
            {!validationError && available === true && (
              <p className="text-xs text-emerald-500">Pseudo disponible ✓</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Annuler</Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer et continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
