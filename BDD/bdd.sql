/* =========================================================
   CLOUD SCRIPT MANAGER - DATABASE (MYSQL)
========================================================= */

CREATE DATABASE CloudScriptManager;
USE CloudScriptManager;

/* =========================
   TABLE ROLES
========================= */
CREATE TABLE Roles (
  idRole INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  niveau INT,
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   TABLE PERMISSIONS
========================= */
CREATE TABLE Permissions (
  idPermission INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL,
  description TEXT,
  module VARCHAR(100),
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   TABLE ROLE_PERMISSION (N,N)
========================= */
CREATE TABLE Role_Permission (
  idRole INT,
  idPermission INT,
  PRIMARY KEY (idRole, idPermission),
  FOREIGN KEY (idRole) REFERENCES Roles(idRole) ON DELETE CASCADE,
  FOREIGN KEY (idPermission) REFERENCES Permissions(idPermission) ON DELETE CASCADE
);

/* =========================
   TABLE UTILISATEURS
========================= */
CREATE TABLE Utilisateurs (
  idUtilisateur INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  motDePasse VARCHAR(255),
  telephone VARCHAR(30),
  adresse TEXT,
  ville VARCHAR(100),
  pays VARCHAR(100),
  statut VARCHAR(50),
  dateInscription DATETIME DEFAULT CURRENT_TIMESTAMP,
  derniereActivite DATETIME,
  idRole INT,
  FOREIGN KEY (idRole) REFERENCES Roles(idRole)
);

/* =========================
   TABLE ADMINISTRATEURS
========================= */
CREATE TABLE Administrateurs (
  idAdmin INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  motDePasse VARCHAR(255),
  role VARCHAR(50),
  statut VARCHAR(50),
  mfaActif BOOLEAN DEFAULT FALSE,
  dernierLogin DATETIME,
  ipDerniereConnexion VARCHAR(100),
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
  idRole INT,
  FOREIGN KEY (idRole) REFERENCES Roles(idRole)
);

/* =========================
   TABLE CATEGORIES
========================= */
CREATE TABLE Categories (
  idCategorie INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100),
  description TEXT,
  couleur VARCHAR(50),
  icone VARCHAR(100),
  statut VARCHAR(50),
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   TABLE SCRIPTS
========================= */
CREATE TABLE Scripts (
  idScript INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(150),
  description TEXT,
  typeScript VARCHAR(50),
  contenu LONGTEXT,
  criticite VARCHAR(50),
  version INT,
  statut VARCHAR(50),
  tags VARCHAR(255),
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
  dateModification DATETIME,
  idCategorie INT,
  idAdmin INT,
  FOREIGN KEY (idCategorie) REFERENCES Categories(idCategorie),
  FOREIGN KEY (idAdmin) REFERENCES Administrateurs(idAdmin)
);

/* =========================
   TABLE COMMENTAIRES
========================= */
CREATE TABLE Commentaires (
  idCommentaire INT PRIMARY KEY AUTO_INCREMENT,
  contenu TEXT,
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR(50),
  likes INT DEFAULT 0,
  idUtilisateur INT,
  idScript INT,
  FOREIGN KEY (idUtilisateur) REFERENCES Utilisateurs(idUtilisateur),
  FOREIGN KEY (idScript) REFERENCES Scripts(idScript)
);

/* =========================
   TABLE SUPPORT TICKETS
========================= */
CREATE TABLE SupportTickets (
  idTicket INT PRIMARY KEY AUTO_INCREMENT,
  sujet VARCHAR(255),
  message TEXT,
  statut VARCHAR(50),
  priorite VARCHAR(50),
  categorie VARCHAR(100),
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
  dateResolution DATETIME,
  idUtilisateur INT,
  idAdmin INT,
  FOREIGN KEY (idUtilisateur) REFERENCES Utilisateurs(idUtilisateur),
  FOREIGN KEY (idAdmin) REFERENCES Administrateurs(idAdmin)
);

/* =========================
   TABLE LOGS
========================= */
CREATE TABLE Logs (
  idLog INT PRIMARY KEY AUTO_INCREMENT,
  typeAction VARCHAR(100),
  description TEXT,
  module VARCHAR(100),
  ip VARCHAR(100),
  userAgent VARCHAR(255),
  severity VARCHAR(50),
  dateAction DATETIME DEFAULT CURRENT_TIMESTAMP,
  idUtilisateur INT,
  FOREIGN KEY (idUtilisateur) REFERENCES Utilisateurs(idUtilisateur)
);

/* =========================
   TABLE CONTACTS
========================= */
CREATE TABLE Contacts (
  idContact INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(150),
  sujet VARCHAR(255),
  message TEXT,
  statut VARCHAR(50),
  ip VARCHAR(100),
  dateEnvoi DATETIME DEFAULT CURRENT_TIMESTAMP,
  idUtilisateur INT,
  FOREIGN KEY (idUtilisateur) REFERENCES Utilisateurs(idUtilisateur)
);
