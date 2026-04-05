## Diagramme d'activité

## Groupe : 24

### Membres
- Amir Minihadji AMINA  
- LO Pape  
- Neylie NDJUMKENG-NGUEMO  

### Superviseur
- Mhand BOUFALA
---

Dans cette section, nous allons décrire les scénarios des cas d’utilisation suivants, avec leurs flux principaux, alternatifs et erreurs.  
Chaque cas d’utilisation est accompagné d’un diagramme d’activité illustrant le processus complet.

### Cas d’utilisation couverts

1. Création de compte utilisateur
2. Connexion
3. Mot de passe oublié
4. Consultation des scripts
5. Recherche d’un script
6. Téléchargement d’un script
7. Copie d’un script
8. Consultation de la documentation
9. Envoi d’un commentaire
10. Contacter le support

Chaque diagramme ci-dessous présente le **flux nominal**, les **alternatives** et les **erreurs possibles** pour chaque scénario.  

### 1. Création de compte

```plantuml
@startuml
title Création de compte - Diagramme d'activité

start
:Saisie des informations utilisateur;

if (Champs valides ?) then (oui)
  if (Email unique ?) then (oui)
    if (Mot de passe conforme ?) then (oui)
      :Hash du mot de passe;
      :Création du compte dans la DB;
      :Attribution rôle utilisateur;
      :Journalisation;
      :Confirmation de création;
      stop
    else (non)
      :Afficher erreur mot de passe;
      ->Saisie des informations utilisateur;
    endif
  else (non)
    :Afficher erreur email déjà utilisé;
    ->Saisie des informations utilisateur;
  endif
else (non)
  :Afficher erreur champs incomplets;
  ->Saisie des informations utilisateur;
endif

@enduml
```

### 2. Connexion

```plantuml
@startuml
title Connexion - Diagramme d'activité

start
:Saisie identifiants;

if (Champs valides ?) then (oui)
  if (Utilisateur existe ?) then (oui)
    if (Mot de passe correct ?) then (oui)
      if (Compte activé ?) then (oui)
        :Générer session/token;
        :Journalisation;
        :Accès au dashboard;
        stop
      else (non)
        :Afficher "Compte non activé";
        stop
      endif
    else (non)
      :Afficher "Email ou mot de passe incorrect";
      ->Saisie identifiants;
    endif
  else (non)
    :Proposer création de compte;
    stop
  endif
else (non)
  :Afficher erreur champs invalides;
  ->Saisie identifiants;
endif

@enduml
```

### 3. Mot de passe oublié

```plantuml
@startuml
title Mot de passe oublié - Diagramme d'activité

start

:Saisie de l'adresse email;

if (L'email existe en base ?) then (oui)
    :Envoyer l'email avec le lien de réinitialisation;
    :L'utilisateur clique sur le lien;
    
    partition "Validation du nouveau mot de passe" {
        repeat
            :Saisie du nouveau mot de passe;
            if (Le mot de passe respecte les critères ?) then (oui)
                :Hachage du mot de passe;
                :Mise à jour de la base de données;
                :Journaliser l'action (Audit Log);
                break
            else (non)
                :Afficher les erreurs de conformité;
            endif
        repeat while (Réessayer ?) is (oui)
    }
    
else (non)
    :Afficher le message "Email inconnu";
endif

stop

@enduml
```

### 4. Consultation des scripts

```plantuml
@startuml
title Consultation des scripts - Diagramme d'activité

start
:Connexion utilisateur;
:Accès tableau de bord;
:Sélection "Consultation scripts";

if (Scripts disponibles ?) then (oui)
  :Afficher liste scripts;
  stop
else (non)
  :Afficher "Aucun script disponible";
  stop
endif

@enduml
```

### 5. Recherche d’un script

```plantuml
@startuml
title Recherche d'un script - Diagramme d'activité

start
:Connexion utilisateur;
:Accès tableau de bord;
:Sélection "Recherche script";
:Saisie critères de recherche;

if (Résultat trouvé ?) then (oui)
  :Afficher script(s) trouvé(s);
  stop
else (non)
  :Afficher "Aucun script trouvé";
  stop
endif

@enduml
```

### 6. Téléchargement d’un script

```plantuml
@startuml
title Téléchargement d'un script - Diagramme d'activité

start
:Connexion utilisateur;
:Accès tableau de bord;
:Sélection script à télécharger;

if (Droits ok ?) then (oui)
  :Téléchargement sécurisé;
  :Journalisation;
  stop
else (non)
  :Afficher "Accès refusé";
  stop
endif

@enduml
```

### 7. Copie d’un script

```plantuml
@startuml
title Copie d'un script - Diagramme d'activité

start
:Connexion utilisateur;
:Accès tableau de bord;
:Sélection script;

if (Droits ok ?) then (oui)
  :Copie contenu script;
  :Journalisation;
  stop
else (non)
  :Afficher "Accès refusé";
  stop
endif

@enduml
```

### 8. Consultation de la documentation

```plantuml
@startuml
title Consultation documentation - Diagramme d'activité

start
:Connexion utilisateur;
:Accès tableau de bord;
:Sélection script;

if (Droits ok ?) then (oui)
  if (Documentation disponible ?) then (oui)
    :Afficher documentation;
    :Journalisation;
    stop
  else (non)
    :Afficher "Documentation indisponible";
    stop
  endif
else (non)
  :Afficher "Accès refusé";
  stop
endif
@enduml
```

### 9. Envoi d’un commentaire

```plantuml
@startuml
title Envoi de commentaire - Diagramme d'activité

start

:Connexion utilisateur;
:Accès au tableau de bord;
:Sélection du script;
:Saisie du commentaire;

repeat
  if (Champs valides ?) then (oui)
    if (Droits ok ?) then (oui)
      :Enregistrer le commentaire;
      :Publication ou modération;
      :Journaliser l'action;
      stop
    else (non)
      :Afficher "Accès refusé";
      stop
    endif
  else (non)
    :Afficher "Commentaire invalide";
    :Saisie du commentaire;
  endif
repeat while (Champs invalides ?)

@enduml
```

### 10. Contacter le support

```plantuml
@startuml
title Contacter le support - Diagramme d'activité

start

:Connexion utilisateur;
:Accès au tableau de bord;
:Sélection du Support;
:Remplir le formulaire;

repeat
  if (Champs valides ?) then (oui)
    if (Service disponible ?) then (oui)
      :Envoyer la demande au backend;
      :Notifier l'équipe support;
      :Journaliser la demande;
      stop
    else (non)
      :Afficher "Service indisponible";
      stop
    endif
  else (non)
    :Afficher "Champs invalides";
    :Remplir le formulaire;
  endif
repeat while (Champs invalides ?)

@enduml
```