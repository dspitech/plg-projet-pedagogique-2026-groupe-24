import { ExternalLink, BookOpen, Github, FileText, Video, Cloud, Server } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Resource {
  title: string;
  description: string;
  url: string;
  icon: typeof BookOpen;
  category: string;
}

const resources: Resource[] = [
  {
    title: 'Microsoft Learn — Azure',
    description: 'Documentation officielle, tutoriels et parcours certifiants Azure',
    url: 'https://learn.microsoft.com/azure/',
    icon: Cloud,
    category: 'Azure',
  },
  {
    title: 'Azure PowerShell Docs',
    description: 'Référence complète des cmdlets Az PowerShell',
    url: 'https://learn.microsoft.com/powershell/azure/',
    icon: FileText,
    category: 'Azure',
  },
  {
    title: 'Azure CLI Reference',
    description: 'Toutes les commandes az et leurs paramètres',
    url: 'https://learn.microsoft.com/cli/azure/',
    icon: FileText,
    category: 'Azure',
  },
  {
    title: 'Bicep Documentation',
    description: 'Langage déclaratif pour le déploiement de ressources Azure',
    url: 'https://learn.microsoft.com/azure/azure-resource-manager/bicep/',
    icon: BookOpen,
    category: 'Azure',
  },
  {
    title: 'AWS Documentation',
    description: 'Centre de documentation officiel AWS',
    url: 'https://docs.aws.amazon.com/',
    icon: Server,
    category: 'AWS',
  },
  {
    title: 'AWS CLI Reference',
    description: 'Référence complète de la CLI AWS',
    url: 'https://docs.aws.amazon.com/cli/',
    icon: FileText,
    category: 'AWS',
  },
  {
    title: 'Terraform Registry',
    description: 'Modules et providers Terraform pour Azure et AWS',
    url: 'https://registry.terraform.io/',
    icon: Github,
    category: 'IaC',
  },
  {
    title: 'Azure Architecture Center',
    description: 'Patterns, références d\'architecture et best practices',
    url: 'https://learn.microsoft.com/azure/architecture/',
    icon: BookOpen,
    category: 'Architecture',
  },
  {
    title: 'AWS Well-Architected',
    description: 'Framework et bonnes pratiques pour vos workloads AWS',
    url: 'https://aws.amazon.com/architecture/well-architected/',
    icon: BookOpen,
    category: 'Architecture',
  },
  {
    title: 'GitHub — Azure Samples',
    description: 'Dépôt officiel d\'exemples et templates Azure',
    url: 'https://github.com/Azure-Samples',
    icon: Github,
    category: 'Communauté',
  },
  {
    title: 'GitHub — AWS Samples',
    description: 'Dépôt officiel d\'exemples et templates AWS',
    url: 'https://github.com/aws-samples',
    icon: Github,
    category: 'Communauté',
  },
  {
    title: 'YouTube — John Savill',
    description: 'Tutoriels vidéo Azure de référence',
    url: 'https://www.youtube.com/@NTFAQGuy',
    icon: Video,
    category: 'Communauté',
  },
];

export default function ResourcesPage() {
  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    (acc[r.category] = acc[r.category] || []).push(r);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ressources</h1>
          <p className="mt-1 text-muted-foreground">
            Bibliothèque de liens utiles pour approfondir vos connaissances cloud
          </p>
        </div>

        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat}>
            <h2 className="text-lg font-semibold text-foreground mb-3">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="script-card group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <r.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {r.title}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {r.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DashboardLayout>
  );
}
