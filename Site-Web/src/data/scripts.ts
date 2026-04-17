export type Criticality = 'critical' | 'high' | 'medium' | 'low';
export type Category = 'users' | 'resources' | 'deployment' | 'network';
export type Provider = 'azure' | 'aws';

export interface Script {
  id: string;
  name: string;
  description: string;
  category: Category;
  provider: Provider;
  criticality: Criticality;
  language: 'PowerShell' | 'Azure CLI' | 'Bicep' | 'ARM' | 'AWS CLI' | 'Terraform' | 'CloudFormation';
  author: string;
  lastUpdated: string;
  version: string;
  tags: string[];
  documentation: {
    function: string;
    prerequisites: string[];
    parameters: { name: string; type: string; description: string; required: boolean }[];
    security: string[];
  };
  code: string;
  validated: boolean;
}

export const categories: { id: Category; name: string; icon: string; description: string }[] = [
  { id: 'users', name: 'Utilisateurs & Groupes', icon: 'Users', description: 'Gestion des utilisateurs, groupes et rôles Azure AD' },
  { id: 'resources', name: 'Ressources', icon: 'Layers', description: 'Création et gestion des groupes de ressources' },
  { id: 'deployment', name: 'Déploiement', icon: 'Rocket', description: 'Scripts ARM, Bicep et infrastructure as code' },
  { id: 'network', name: 'Réseau & Sécurité', icon: 'Shield', description: 'Configuration NSG, Firewall, VNet et UDR' },
];

export const scripts: Script[] = [];

export const getScriptsByCategory = (category: Category): Script[] => {
  return scripts.filter(s => s.category === category);
};

export const getScriptsByProvider = (provider: Provider): Script[] => {
  return scripts.filter(s => s.provider === provider);
};

export const getScriptById = (id: string): Script | undefined => {
  return scripts.find(s => s.id === id);
};

export const getScriptsByIds = (ids: string[]): Script[] => {
  return ids.map(id => scripts.find(s => s.id === id)).filter((s): s is Script => !!s);
};

export const searchScripts = (query: string): Script[] => {
  const lowerQuery = query.toLowerCase();
  return scripts.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery) ||
    s.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
};

