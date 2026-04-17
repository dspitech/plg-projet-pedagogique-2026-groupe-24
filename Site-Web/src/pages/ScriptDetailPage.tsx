import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScriptDetail } from '@/components/scripts/ScriptDetail';
import { getScriptById } from '@/data/scripts';
import { FileCode } from 'lucide-react';

export default function ScriptDetailPage() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const script = scriptId ? getScriptById(scriptId) : undefined;

  if (!script) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Script non trouvé</h2>
          <Link to="/scripts" className="text-primary hover:underline mt-2 inline-block">
            Retour à la bibliothèque
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ScriptDetail script={script} />
    </DashboardLayout>
  );
}
