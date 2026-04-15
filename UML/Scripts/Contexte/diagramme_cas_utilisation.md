# Diagramme de cas d’utilisation

```mermaid
flowchart LR

User["Utilisateur"]
Admin["Administrateur"]
Azure["Cloud Azure"]
Security["Système de sécurité"]

subgraph Authentification
UC1["Se connecter"]
UC2["Créer un compte"]
end

subgraph Consultation["Consultation et Interaction"]
UC3["Consulter les scripts"]
UC4["Rechercher un script"]
UC5["Télécharger un script"]
UC6["Copier un script"]
UC7["Consulter la documentation"]
UC8["Envoyer un commentaire"]
UC9["Contacter le support"]
end

subgraph Administration
UC10["Gérer les scripts (CRUD)"]
UC11["Gérer utilisateurs et rôles"]
UC12["Gérer les commentaires"]
UC13["Gérer les demandes support"]
UC14["Consulter les logs"]
UC15["Sécuriser les accès"]
end

User --> UC1
User --> UC2
User --> UC3
User --> UC4
User --> UC5
User --> UC6
User --> UC7
User --> UC8
User --> UC9

Admin --> UC1
Admin --> UC2
Admin --> UC10
Admin --> UC11
Admin --> UC12
Admin --> UC13
Admin --> UC14
Admin --> UC15

UC3 --> Azure
UC5 --> Azure
UC10 --> Azure
UC11 --> Azure

UC1 --> Security
UC2 --> Security
UC14 --> Security

style User fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px
style Admin fill:#ffebee,stroke:#e53935,stroke-width:2px
style Azure fill:#e8f5e9,stroke:#43a047,stroke-width:2px
style Security fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px