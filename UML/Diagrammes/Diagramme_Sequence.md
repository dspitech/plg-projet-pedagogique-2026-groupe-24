# Diagrammes de séquence

## Groupe : 24

### Membres
- Amir Minihadji AMINA  
- LO Pape  
- Neylie NDJUMKENG-NGUEMO  

### Superviseur
- Mhand BOUFALA
---

Dans cette section, nous allons décrire les diagrammes de séquence correspondant aux cas d’utilisation suivants :

- Création de compte utilisateur  
- Connexion  
- Mot de passe oublié  
- Consultation des scripts  
- Recherche d’un script  
- Téléchargement d’un script  
- Copie d’un script  
- Consultation de la documentation  
- Envoi d’un commentaire  
- Contacter le support  

### 1. Création de compte 
```plantuml
@startuml
title Diagramme de séquence - Création de compte

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway / Auth" as API
    participant "Service Utilisateur" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page d'inscription
activate UI
UI --> User : Affiche le formulaire (Email, Mot de passe, Pseudo)
deactivate UI

User -> UI : Remplit et soumet le formulaire
activate UI
UI -> UI : Validation côté client (format email, force mot de passe)

UI -> API : POST /api/register (JSON Payload)
activate API

API -> Service : Traitement de la demande
activate Service

Service -> DB : Vérifier si l'email existe
activate DB
DB --> Service : Résultat (Disponible / Déjà utilisé)
deactivate DB

alt Email déjà utilisé ou format invalide
    Service --> API : Erreur 400 / Conflict
    API --> UI : Réponse d'erreur (JSON)
    UI --> User : Affiche message "Email déjà utilisé ou invalide"
else Email valide
    Service -> Service : Hachage mot de passe (Argon2/BCrypt)
    Service -> DB : Persister nouvel utilisateur
    activate DB
    DB --> Service : Confirmation ID utilisateur
    deactivate DB
    
    Service --> API : Succès 201 Created
    deactivate Service
    
    API --> UI : JWT Token + message succès
    deactivate API
    
    UI --> User : Redirection vers Dashboard / Message de bienvenue
end

deactivate UI

@enduml
```

### 2. Connexion 

```plantuml
@startuml
title Diagremme de séquence - Connexion Utilisateur 

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway / Auth" as API
    participant "Service Utilisateur" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page de connexion
activate UI
UI --> User : Affiche formulaire de connexion (Email / Mot de passe)
deactivate UI

User -> UI : Saisir identifiants et soumettre
activate UI
UI -> UI : Validation côté client (format email, champs remplis)

UI -> API : POST /api/login (JSON Payload)
activate API

API -> Service : Vérifier identifiants
activate Service

Service -> DB : Rechercher utilisateur par email
activate DB
DB --> Service : Données utilisateur (Email + Hash mot de passe)
deactivate DB

alt Identifiants corrects
    Service -> Service : Vérifier mot de passe (Hash)
    Service --> API : Authentification réussie
    deactivate Service
    
    API --> UI : JWT Token + message succès
    deactivate API
    
    UI --> User : Redirection vers Dashboard / Message de bienvenue
else Identifiants incorrects
    Service --> API : Erreur 401 / Auth failed
    deactivate Service
    
    API --> UI : Réponse d'erreur (JSON)
    deactivate API
    
    UI --> User : Affiche message "Email ou mot de passe incorrect"
end

deactivate UI

@enduml
```

### 3. Mot de passe oublié 

```plantuml
@startuml
title Diagremme de séquence -  Mot de passe oublié 

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway / Auth" as API
    participant "Service Utilisateur" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page "Mot de passe oublié"
activate UI
UI --> User : Affiche formulaire (saisie email)
deactivate UI

User -> UI : Saisir email et soumettre
activate UI
UI -> UI : Validation côté client (format email)
UI -> API : POST /api/password/forgot (JSON Payload)
activate API

API -> Service : Vérifier existence de l'email
activate Service
Service -> DB : Rechercher utilisateur par email
activate DB
DB --> Service : Données utilisateur / Email trouvé ?
deactivate DB

alt Email trouvé
    Service --> API : Email valide
    API --> UI : Envoyer lien de réinitialisation
    UI --> User : Affiche message "Lien envoyé à votre email"
    
    User -> UI : Cliquer sur le lien et saisir nouveau mot de passe
    activate UI
    UI -> UI : Validation côté client (force mot de passe)
    UI -> API : POST /api/password/reset (nouveau mot de passe)
    
    Service -> Service : Vérifier conformité mot de passe
    alt Mot de passe conforme
        Service -> Service : Hachage mot de passe (Argon2/BCrypt)
        Service -> DB : Mise à jour du mot de passe
        activate DB
        DB --> Service : Confirmation
        deactivate DB
        Service --> API : Succès 200
        API --> UI : Confirmation mise à jour
        UI --> User : Affiche message "Mot de passe mis à jour"
    else Mot de passe non conforme
        Service --> API : Erreur 400
        API --> UI : Affiche exigences mot de passe
        UI --> User : Ressaisir mot de passe
    end
else Email non trouvé
    Service --> API : Erreur 404 / Email inconnu
    API --> UI : Affiche message "Email inconnu"
end

deactivate UI
deactivate Service
deactivate API

@enduml
```

### 4. Consultation des scripts

```plantuml
@startuml
title Consultation des scripts 

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway" as API
    participant "Service Script" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page "Scripts"
activate UI
UI --> User : Affiche interface liste de scripts
deactivate UI

User -> UI : Cliquer sur "Consulter les scripts"
activate UI
UI -> API : GET /api/scripts
activate API

API -> Service : Récupérer la liste des scripts
activate Service
Service -> DB : Requête tous les scripts
activate DB
DB --> Service : Liste des scripts
deactivate DB
Service --> API : Retour liste des scripts
deactivate Service

API --> UI : Envoi liste des scripts
deactivate API
UI --> User : Affiche les scripts disponibles

@enduml
```

### 5. Recherche d’un script

```plantuml
@startuml
title Recherche d'un script

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway" as API
    participant "Service Script" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page "Scripts"
activate UI
UI --> User : Affiche barre de recherche
deactivate UI

User -> UI : Saisir mot-clé et valider
activate UI
UI -> API : GET /api/scripts?query=motclé
activate API

API -> Service : Rechercher scripts correspondants
activate Service
Service -> DB : Requête sur la base (LIKE %motclé%)
activate DB
DB --> Service : Résultats de la recherche
deactivate DB

alt Scripts trouvés
    Service --> API : Liste des scripts
    deactivate Service
    API --> UI : Envoi résultats
    deactivate API
    UI --> User : Affiche scripts correspondants
else Aucun script trouvé
    Service --> API : Liste vide
    deactivate Service
    API --> UI : Message "Aucun résultat"
    deactivate API
    UI --> User : Affiche message "Aucun script trouvé"
end

deactivate UI

@enduml
```

### 6. Téléchargement d’un script

```plantuml
@startuml
title Téléchargement d'un script 

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway" as API
    participant "Service Script" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page "Scripts"
activate UI
UI --> User : Affiche liste des scripts
deactivate UI

User -> UI : Cliquer sur "Télécharger" pour un script
activate UI
UI -> API : GET /api/scripts/{id}/download
activate API

API -> Service : Vérifier disponibilité et droits d'accès
activate Service
Service -> DB : Rechercher script et vérifier permissions
activate DB
DB --> Service : Script trouvé / droits OK ?
deactivate DB

alt Script disponible et droits OK
    Service --> API : Script disponible
    deactivate Service
    API --> UI : Envoi du fichier
    deactivate API
    UI --> User : Téléchargement du script
else Script non disponible ou droits insuffisants
    Service --> API : Erreur 403 / 404
    deactivate Service
    API --> UI : Message d'erreur
    deactivate API
    UI --> User : Affiche message "Téléchargement impossible"
end

deactivate UI

@enduml
```

### Copie d’un script

```plantuml
@startuml
title Copie d'un script 

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway" as API
    participant "Service Script" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page "Scripts"
activate UI
UI --> User : Affiche liste des scripts
deactivate UI

User -> UI : Cliquer sur "Copier" pour un script
activate UI
UI -> API : POST /api/scripts/{id}/copy
activate API

API -> Service : Vérifier droits et disponibilité
activate Service
Service -> DB : Rechercher script et vérifier permissions
activate DB
DB --> Service : Script trouvé / droits OK ?
deactivate DB

alt Copie autorisée
    Service --> API : Contenu du script
    deactivate Service
    API --> UI : Envoi du script à copier
    deactivate API
    UI --> User : Script copié dans presse-papier / affiché
else Copie interdite
    Service --> API : Erreur 403
    deactivate Service
    API --> UI : Message d'erreur
    deactivate API
    UI --> User : Affiche "Copie non autorisée"
end

deactivate UI

@enduml
```

### 8. Consultation de la documentation

```plantuml
@startuml
title Consultation de la documentation 

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway" as API
    participant "Service Documentation" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page "Documentation"
activate UI
UI --> User : Affiche interface documentation
deactivate UI

User -> UI : Cliquer sur un document / section
activate UI
UI -> API : GET /api/docs/{id}
activate API

API -> Service : Récupérer contenu de la documentation
activate Service
Service -> DB : Requête du document demandé
activate DB
DB --> Service : Contenu du document
deactivate DB
Service --> API : Retour contenu documentation
deactivate Service

API --> UI : Envoi du contenu
deactivate API
UI --> User : Affiche la documentation

@enduml
```

### 9. Envoi d’un commentaire

```plantuml
@startuml
title Envoi de commentaire 

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway" as API
    participant "Service Commentaire" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page du script
activate UI
UI --> User : Affiche interface de commentaire
deactivate UI

User -> UI : Saisir et soumettre commentaire
activate UI
UI -> UI : Validation côté client (champs remplis, longueur)
UI -> API : POST /api/scripts/{id}/comment
activate API

API -> Service : Vérifier droits et contenu
activate Service
Service -> DB : Enregistrer commentaire
activate DB
DB --> Service : Confirmation d'enregistrement
deactivate DB

alt Commentaire valide et droits ok
    Service --> API : Succès 201 Created
    deactivate Service
    API --> UI : Confirmation succès
    deactivate API
    UI --> User : Affiche "Commentaire publié / en attente de modération"
else Commentaire invalide
    Service --> API : Erreur 400 / Validation failed
    deactivate Service
    API --> UI : Message d'erreur
    deactivate API
    UI --> User : Affiche "Commentaire invalide, ressaisir"
else Droits insuffisants
    Service --> API : Erreur 403
    deactivate Service
    API --> UI : Message d'erreur
    deactivate API
    UI --> User : Affiche "Accès refusé"
end

deactivate UI

@enduml
```

### 10. Contacter le support

```plantuml
@startuml
title Contacter le support 

autonumber
skinparam style strictuml
skinparam MaxMessageSize 200

actor "Utilisateur" as User

box "Front-End" #LightBlue
    participant "Interface Web/App" as UI
end box

box "Back-End" #LightYellow
    participant "API Gateway" as API
    participant "Service Support" as Service
    database "Base de Données" as DB
end box

User -> UI : Accéder à la page "Support"
activate UI
UI --> User : Affiche formulaire de contact
deactivate UI

User -> UI : Remplir et soumettre formulaire
activate UI
UI -> UI : Validation côté client (champs remplis, email valide)
UI -> API : POST /api/support/request
activate API

API -> Service : Vérifier disponibilité du service et données
activate Service
Service -> DB : Enregistrer demande de support
activate DB
DB --> Service : Confirmation d'enregistrement
deactivate DB

alt Champs valides et service disponible
    Service --> API : Succès 201 Created
    deactivate Service
    API --> UI : Confirmation envoi
    deactivate API
    UI --> User : Affiche "Demande envoyée, réponse prochaine"
else Champs invalides
    Service --> API : Erreur 400
    deactivate Service
    API --> UI : Message d'erreur
    deactivate API
    UI --> User : Affiche "Champs invalides, ressaisir"
else Service indisponible
    Service --> API : Erreur 503
    deactivate Service
    API --> UI : Message d'erreur
    deactivate API
    UI --> User : Affiche "Service indisponible, réessayer plus tard"
end

deactivate UI

@enduml
```