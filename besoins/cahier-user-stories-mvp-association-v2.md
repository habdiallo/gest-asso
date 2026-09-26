# Cahier des User Stories — MVP Gestion de l'Association
### Version 2 — Consolidée et prête pour rédaction du backlog

---

## Note de version

Cette version corrige et ferme les points laissés ouverts dans la v1 :

| Point ouvert dans la v1 | Décision retenue en v2 |
|---|---|
| US-COT-007 mentionnait le "Président" comme rôle applicatif | Corrigé : seuls les 4 rôles applicatifs sont utilisés dans les US. Le Président accède via le rôle qui lui est attribué (RG-ROLE-006). |
| "Opérateur autorisé" non défini | Défini comme un attribut binaire du compte Opérateur (§2.3). |
| Modification d'un membre par l'Opérateur (⚠️ dans la matrice) | Formalisée en RG-MEM-017. |
| Sur-paiement d'une cotisation | Bloqué par le système (RG-PAY-007). |
| Contributions multiples à une cagnotte | Autorisées sans restriction (RG-CAG-005 fermée). |
| Paiement en ligne par le membre | Hors périmètre MVP (Annexe A). |
| Traçabilité des opérations financières | Ajoutée (RG-PAY-008, RG-CAG-007). |
| Protection des données personnelles | Clause minimale ajoutée (§26). |
| Devise et format des gros montants | Devise fixée en Franc Guinéen (GNF), avec notation condensée K / M / Mds (§1.3). |
| Modes de règlement | Restreints à Espèces, Mobile Money et Virement bancaire — aucun paiement en ligne intégré (§1.3, RG-PAY-009). |
| Incohérence matrice/US-MEM-005 sur la modification du statut par le Trésorier | Corrigée : le statut ne se modifie que via désactivation/réactivation, réservées à l'Administrateur (RG-MEM-018). |
| Réactivation d'un membre désactivé | Ajoutée en tant qu'opération à part entière, réservée à l'Administrateur (US-MEM-006, RG-MEM-019, RG-MEM-020). |

---

## 1. Principes généraux du modèle

L'application permet à l'association de gérer :

- ses membres ;
- leurs catégories de revenu ;
- les campagnes de cotisation ;
- les montants dus par membre et par campagne ;
- les règlements de cotisations ;
- les cagnottes sociales ;
- les contributions aux cagnottes ;
- les comptes utilisateurs et leurs rôles.

### Séparation fonction / rôle

Le **rôle applicatif** (ce qu'un utilisateur peut faire dans l'application) est indépendant de la **fonction associative** (ce qu'une personne représente au sein de l'association, ex. Président, Secrétaire). Un Président est un membre comme un autre du point de vue applicatif ; s'il doit accéder à des données de gestion, il reçoit l'un des 4 rôles applicatifs, au même titre que n'importe quel autre membre.

### 1.3 Devise et format des montants

**RG-FMT-001**
La devise unique de l'application est le **Franc Guinéen (GNF)**. Il n'existe pas de sous-unité usuelle : tous les montants sont stockés et calculés en nombres **entiers** (pas de décimales).

**RG-FMT-002 — Affichage détaillé**
Sur les fiches, historiques et exports (relevé d'un membre, détail d'un règlement, export comptable), le montant est toujours affiché en **valeur complète**, avec séparateur de milliers : *ex. 1 250 000 GNF*.

**RG-FMT-003 — Affichage condensé**
Sur les listes, tableaux de bord et bilans (là où la lisibilité prime sur l'exactitude au franc près), les montants sont affichés avec une notation condensée à partir des seuils suivants :

| Seuil | Suffixe | Exemple |
|---|---|---|
| ≥ 1 000 GNF et < 1 000 000 GNF | **K** (millier) | 50 000 GNF → **50K GNF** |
| ≥ 1 000 000 GNF et < 1 000 000 000 GNF | **M** (million) | 2 500 000 GNF → **2,5M GNF** |
| ≥ 1 000 000 000 GNF | **Mds** (milliard) | 1 200 000 000 GNF → **1,2 Mds GNF** |

La notation condensée conserve au maximum **une décimale**, et la valeur brute complète reste toujours accessible (info-bulle, clic, ou export).

**RG-FMT-004**
En deçà de 1 000 GNF, le montant est affiché tel quel, sans suffixe.

**RG-PAY-009 — Modes de règlement disponibles**
Un règlement ou une contribution ne peut être enregistré que selon l'un des trois modes suivants : **Espèces**, **Mobile Money**, **Virement bancaire**. Il n'existe aucune intégration de paiement en ligne dans le MVP (cf. Annexe A) ; ces trois modes correspondent tous à un encaissement constaté après coup par un Trésorier ou un Opérateur autorisé, jamais à un paiement déclenché par le membre lui-même dans l'application.

---

## 2. Rôles applicatifs

### 2.1 Les 4 rôles

| Rôle | Niveau | Responsabilité principale |
|---|---|---|
| **Administrateur** | Très élevé | Gestion globale de l'application et des membres |
| **Trésorier** | Très élevé | Gestion et suivi financier |
| **Opérateur** | Intermédiaire | Réalisation des opérations courantes autorisées |
| **Membre** | Standard | Consultation de sa situation et participation |

### 2.2 Principe d'accréditation

Plus le niveau d'accréditation est élevé, plus l'utilisateur peut :

- modifier des informations sensibles ;
- créer ou modifier des éléments structurants ;
- enregistrer des opérations financières ;
- superviser les opérations réalisées par les autres utilisateurs.

L'Opérateur ne dispose pas des mêmes droits que l'Administrateur et le Trésorier.

### 2.3 L'attribut "Opérateur autorisé"

**RG-ROLE-007**
Un compte de rôle Opérateur possède un attribut binaire `peut_enregistrer_paiements` (oui/non), positionné par un Administrateur.

**RG-ROLE-008**
Quand cet attribut vaut "non", l'Opérateur dispose uniquement des droits de consultation prévus pour son rôle (§3), et ne peut enregistrer aucun règlement ni contribution.

**RG-ROLE-009**
Quand cet attribut vaut "oui", l'Opérateur peut enregistrer des règlements de cotisation et des contributions de cagnotte, dans les limites fixées par la matrice de responsabilités (§3).

> Cette autorisation est globale à l'application dans le MVP (pas de granularité par campagne ou par cagnotte). Une granularité plus fine peut être introduite en V2 si le besoin est confirmé à l'usage.

---

## 3. Matrice des responsabilités (version finale)

| Action | Admin | Trésorier | Opérateur | Membre |
|---|:---:|:---:|:---:|:---:|
| Consulter les membres | ✅ | ✅ | ✅ | Limité à soi-même |
| Ajouter un membre | ✅ | ✅ | ❌ | ❌ |
| Modifier un membre (champs non structurants) | ✅ | ✅ | ✅ | ❌ |
| Modifier un membre (champs structurants : catégorie, fonction) | ✅ | ✅ | ❌ | ❌ |
| Désactiver un membre (change le statut à Inactif) | ✅ | ❌ | ❌ | ❌ |
| Réactiver un membre (change le statut à Actif) | ✅ | ❌ | ❌ | ❌ |
| Gérer les catégories de revenu | ✅ | ❌ | ❌ | ❌ |
| Créer une campagne | ✅ | ✅ | ❌ | ❌ |
| Configurer les montants d'une campagne | ✅ | ✅ | ❌ | ❌ |
| Enregistrer un règlement | ✅ | ✅ | ✅ *(si autorisé)* | ❌ |
| Consulter le suivi financier d'une campagne | ✅ | ✅ | Limité | Personnel uniquement |
| Créer une cagnotte | ✅ | ✅ | ❌ | ❌ |
| Enregistrer une contribution | ✅ | ✅ | ✅ *(si autorisé)* | ❌ |
| Clôturer une campagne | ✅ | ✅ | ❌ | ❌ |
| Clôturer une cagnotte | ✅ | ✅ | ❌ | ❌ |
| Gérer les rôles | ✅ | ❌ | ❌ | ❌ |
| Consulter sa propre situation | ✅ | ✅ | ✅ | ✅ |

---

## 4. Gestion des rôles

### US-ROLE-001 — Attribuer un rôle applicatif

**En tant qu'Administrateur**, je veux attribuer un rôle applicatif à un utilisateur, afin de déterminer ce qu'il est autorisé à faire dans l'application.

**Rôles disponibles** : Administrateur, Trésorier, Opérateur, Membre.

**Règles de gestion**

- **RG-ROLE-001** — Un utilisateur possède un rôle applicatif.
- **RG-ROLE-002** — Seul un Administrateur peut attribuer ou modifier les rôles.
- **RG-ROLE-003** — Le rôle Membre correspond au niveau d'accès standard.
- **RG-ROLE-004** — L'Opérateur possède un niveau d'accréditation inférieur à l'Administrateur et au Trésorier.
- **RG-ROLE-005** — Le rôle d'un utilisateur ne modifie pas son statut de membre dans l'association.
- **RG-ROLE-006** — La fonction associative d'un membre (Président, Secrétaire, etc.) est une information descriptive, sans lien automatique avec un rôle applicatif ; son accès applicatif dépend uniquement du rôle qui lui est attribué séparément.

---

## 5. Gestion des membres

### US-MEM-001 — Ajouter un membre

**En tant qu'Administrateur ou Trésorier**, je veux ajouter un membre, afin de l'enregistrer dans l'association.

**Informations** : Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction dans l'association, Statut.

**Règles**

- **RG-MEM-001** — La création d'un membre est réservée à l'Administrateur et au Trésorier.
- **RG-MEM-002** — Un membre doit posséder une catégorie de revenu.
- **RG-MEM-003** — Un nouveau membre est actif par défaut.
- **RG-MEM-004** — La création du membre entraîne automatiquement la création de son compte utilisateur.
- **RG-MEM-005** — Un membre ne peut pas s'inscrire lui-même ; il n'existe aucune inscription libre (voir RG-003).
- **RG-MEM-006** — La création du membre ne crée aucune cotisation.

### US-MEM-002 — Consulter la liste des membres

**En tant qu'Administrateur, Trésorier ou Opérateur**, je veux consulter la liste des membres, afin d'effectuer les opérations autorisées.

**Informations affichées** : Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction, Statut.

**Règles**

- **RG-MEM-007** — Les membres actifs et inactifs doivent pouvoir être distingués visuellement.
- **RG-MEM-008** — Un Opérateur ne voit que les informations nécessaires à ses opérations (pas nécessairement le détail financier complet).

### US-MEM-003 — Consulter la fiche d'un membre

**En tant qu'utilisateur autorisé**, je veux consulter la fiche d'un membre, afin de connaître sa situation.

La fiche présente : informations personnelles, catégorie de revenu, fonction, statut, situation des cotisations, historique des règlements, contributions aux cagnottes.

### US-MEM-004 — Modifier les informations d'un membre

**En tant qu'Administrateur ou Trésorier**, je veux modifier les informations d'un membre, afin de maintenir les données à jour.

**En tant qu'Opérateur autorisé**, je veux modifier les informations non structurantes d'un membre (téléphone, ville, pays, nom d'usage), afin de corriger des informations de contact courantes.

**Règles**

- **RG-MEM-009** — Une modification de la catégorie de revenu ne modifie aucune cotisation déjà établie.
- **RG-MEM-010** — Une modification de la catégorie de revenu s'applique uniquement aux futures campagnes.
- **RG-MEM-011** — Les informations historiques restent cohérentes avec la situation du membre au moment de chaque campagne passée.
- **RG-MEM-017** — Un Opérateur ne peut modifier que les champs non structurants d'un membre (téléphone, ville, pays, nom d'usage). Les champs structurants — catégorie de revenu, fonction, rôle applicatif — sont réservés à l'Administrateur et au Trésorier, quel que soit l'attribut `peut_enregistrer_paiements` de l'Opérateur.
- **RG-MEM-018** — Le statut d'un membre (Actif/Inactif) n'est jamais modifié par cette opération générale de mise à jour (US-MEM-004), y compris pour un Trésorier. Il ne change que via les opérations dédiées de désactivation (US-MEM-005) et de réactivation (US-MEM-006), toutes deux réservées à l'Administrateur.

### US-MEM-005 — Désactiver un membre

**En tant qu'Administrateur**, je veux désactiver un membre, afin de ne plus le considérer comme membre actif.

**Règles**

- **RG-MEM-012** — La désactivation ne supprime jamais le membre.
- **RG-MEM-013** — Les cotisations historiques sont conservées.
- **RG-MEM-014** — Les règlements historiques sont conservés.
- **RG-MEM-015** — Les contributions aux cagnottes sont conservées.
- **RG-MEM-016** — Un membre inactif n'est pas automatiquement inclus dans une nouvelle campagne.

### US-MEM-006 — Réactiver un membre

**En tant qu'Administrateur**, je veux réactiver un membre précédemment désactivé, afin de le considérer de nouveau comme membre actif.

**Règles**

- **RG-MEM-019** — La réactivation est réservée à l'Administrateur, symétriquement à la désactivation.
- **RG-MEM-020** — La réactivation ne modifie aucune donnée historique : catégorie de revenu, fonction, cotisations, règlements et contributions restent inchangés.
- **RG-MEM-021** — La réactivation n'ajoute pas rétroactivement le membre aux campagnes créées pendant sa période d'inactivité ; il n'est concerné qu'à partir des campagnes créées après sa réactivation, conformément à RG-MEM-016.
- **RG-MEM-022** — Réactiver un membre déjà actif n'est pas une opération valide (conflit métier).

---

## 6. Catégories de revenu

### US-REV-001 — Créer une catégorie de revenu

**En tant qu'Administrateur**, je veux créer une catégorie de revenu, afin de classer les membres.

**Règles**

- **RG-REV-001** — Le libellé est obligatoire.
- **RG-REV-002** — Une catégorie ne possède pas de montant de cotisation permanent.
- **RG-REV-003** — Une catégorie peut être associée à plusieurs membres.

### US-REV-002 — Modifier une catégorie

**En tant qu'Administrateur**, je veux modifier une catégorie de revenu, afin de maintenir le référentiel à jour.

**Règle essentielle** : la modification d'une catégorie ne modifie jamais rétroactivement les cotisations déjà établies.

---

## 7. Campagnes de cotisation

### US-COT-001 — Créer une campagne

**En tant qu'Administrateur ou Trésorier**, je veux créer une campagne de cotisation, afin de lancer une collecte.

**Informations** : Nom, Description, Date de début, Date de fin, Membres concernés, Configuration des montants par catégorie.

**Règles**

- **RG-COT-001** — Une campagne peut être créée à tout moment.
- **RG-COT-002** — Une campagne n'est pas obligatoirement annuelle.
- **RG-COT-003** — La date de début est obligatoire.
- **RG-COT-004** — La date de fin est obligatoire.
- **RG-COT-005** — La date de fin ne peut pas être antérieure à la date de début.

### Cycle de vie d'une campagne

Une campagne traverse trois états, dans cet ordre et sans retour en arrière :

| État | Déclencheur | Actions autorisées |
|---|---|---|
| Brouillon | Création de la campagne, jusqu'à l'ouverture explicite après la date de début | Configurer/modifier les montants par catégorie (US-COT-002), vérifier la préparation et ouvrir la campagne si elle est prête |
| Ouverte | Ouverture explicite par un Administrateur ou un Trésorier, après la date de début | Enregistrer des règlements (US-COT-005), suivre les cotisations (US-COT-004) et le bilan (US-COT-007) |
| Clôturée | Clôture explicite par un Administrateur ou un Trésorier (US-COT-008) | Consultation uniquement ; aucune modification |

**Règles**

- **RG-COT-017** : Une campagne suit trois états : Brouillon jusqu'à son ouverture explicite, Ouverte après cette ouverture et jusqu'à sa clôture, puis Clôturée après clôture explicite (US-COT-008).
- **RG-COT-018** : Les montants par catégorie d'une campagne ne sont modifiables que lorsqu'elle est en Brouillon ; ils sont figés dès qu'elle passe à l'état Ouverte.
- **RG-COT-019** : Une campagne ne peut être ouverte que par un Administrateur ou un Trésorier, après sa date de début et lorsque toutes les vérifications de préparation sont satisfaites.
- **RG-COT-020** : L'ouverture d'une campagne est confirmée explicitement, enregistrée avec sa date et son auteur, puis rend le barème immuable.
- **RG-PAY-010** : Un règlement ne peut être enregistré que sur une campagne à l'état Ouverte ; l'enregistrement n'est pas possible en Brouillon ni sur une campagne Clôturée.

### US-COT-002 — Configurer les montants par catégorie

**En tant qu'Administrateur ou Trésorier**, je veux définir le montant applicable à chaque catégorie de revenu dans une campagne, afin de déterminer les montants dus.

**Exemple — Campagne Octobre 2026**

| Catégorie | Montant |
|---|---:|
| A | 50 000 GNF (50K GNF) |
| B | 100 000 GNF (100K GNF) |
| C | 250 000 GNF (250K GNF) |
| D | 500 000 GNF (500K GNF) |

**Règles**

- **RG-COT-006** — Le montant est défini au niveau de la campagne.
- **RG-COT-007** — Un membre n'a jamais de montant de cotisation permanent.
- **RG-COT-008** — Une catégorie de revenu n'a jamais de montant de cotisation permanent.
- **RG-COT-009** — Deux campagnes peuvent définir des montants différents pour une même catégorie.
- **RG-COT-010** — Le montant applicable à un membre est celui défini dans la campagne pour sa catégorie.
- Cette configuration n'est accessible que sur une campagne en Brouillon (RG-COT-018).

### US-COT-003 — Établir la cotisation d'un membre

**En tant qu'Administrateur ou Trésorier**, je veux établir la cotisation de chaque membre concerné, afin de connaître son montant dû.

**Règle centrale** : Catégorie du membre + configuration de la campagne = montant dû pour cette campagne.

**Exemple** — Membre de catégorie B, campagne où B = 100 000 GNF (100K GNF) → montant dû = **100 000 GNF (100K GNF)**. Si une nouvelle campagne fixe B = 150 000 GNF (150K GNF), le montant dû pour cette nouvelle campagne devient **150 000 GNF (150K GNF)**, sans affecter le montant déjà dû sur la campagne précédente.

**Règles**

- **RG-COT-011** — Le montant dû est propre à la campagne.
- **RG-COT-012** — Le montant dû est conservé dans l'historique de la campagne.
- **RG-COT-013** — Une modification ultérieure de la catégorie du membre ne modifie pas ce montant.

### US-COT-004 — Consulter les cotisations d'une campagne

**En tant qu'Administrateur, Trésorier ou Opérateur**, je veux consulter les cotisations d'une campagne, afin de suivre les paiements.

**Informations** : Membre, Catégorie, Montant dû, Montant payé, Reste à payer, Statut.

**Statuts** : À payer / Partiellement payé / Payé / En retard.

### US-COT-005 — Enregistrer un règlement

**En tant que Trésorier ou Opérateur autorisé**, je veux enregistrer un règlement, afin de mettre à jour la situation d'une cotisation.

**Informations** : Membre, Campagne, Montant (GNF), Date, Mode de règlement (Espèces / Mobile Money / Virement bancaire), Utilisateur ayant enregistré le règlement.

**Règles**

- **RG-PAY-001** — Tout règlement est rattaché à une cotisation.
- **RG-PAY-002** — Un membre peut avoir plusieurs règlements pour une même cotisation.
- **RG-PAY-003** — Le montant total payé permet de déterminer le reste à payer.
- **RG-PAY-007** — Le système refuse l'enregistrement d'un règlement dont le montant dépasserait le reste à payer de la cotisation concernée.
- **RG-PAY-008** — Chaque règlement enregistre l'identité de l'utilisateur qui l'a saisi et l'horodatage de la saisie (traçabilité).
- **RG-PAY-010** — Un règlement ne peut être enregistré que sur une campagne Ouverte (voir Cycle de vie d'une campagne, §7).

### US-COT-006 — Gérer un paiement partiel

**En tant que Trésorier ou Opérateur autorisé**, je veux enregistrer plusieurs paiements pour une même cotisation, afin de permettre le suivi des règlements partiels.

**Exemple** — Montant dû : 500 000 GNF (500K GNF) → Paiement 1 : 200 000 GNF (200K GNF, Mobile Money) puis Paiement 2 : 150 000 GNF (150K GNF, Espèces) → Reste : **150 000 GNF (150K GNF)**.

**Règles**

- **RG-PAY-004** — Reste à payer = Montant dû − Total des règlements.
- **RG-PAY-005** — Une cotisation est « Partiellement payée » lorsque le montant payé est supérieur à zéro et inférieur au montant dû.
- **RG-PAY-006** — Une cotisation est « Payée » lorsque le montant dû est entièrement réglé.

### US-COT-007 — Consulter le bilan financier d'une campagne

**En tant qu'Administrateur, Trésorier ou Opérateur autorisé**, je veux consulter le bilan d'une campagne, afin de suivre la collecte.

> Si le Président de l'association souhaite consulter ce bilan, son compte doit recevoir l'un des rôles ci-dessus (généralement Trésorier ou un accès en lecture assimilé à l'Opérateur), conformément à RG-ROLE-006. Il n'existe pas de rôle "Président" dans l'application.

**Informations** : Total attendu, Total encaissé, Reste à encaisser, Nombre de membres concernés, Nombre de membres ayant payé, Nombre de membres partiellement payés, Nombre de membres n'ayant pas payé.

**Règles**

- **RG-COT-014** — Total attendu = somme des montants dus.
- **RG-COT-015** — Total encaissé = somme des règlements enregistrés.
- **RG-COT-016** — Reste à encaisser = Total attendu − Total encaissé.

### US-COT-008 — Clôturer une campagne

**En tant qu'Administrateur ou Trésorier**, je veux clôturer une campagne, afin de terminer la collecte.

**Règles**

- Une campagne clôturée reste consultable.
- Son historique est conservé.
- Les montants dus restent inchangés.
- Les règlements restent accessibles.
- Une campagne clôturée ne peut plus être modifiée : ni son barème (RG-COT-018), ni l'enregistrement d'un nouveau règlement (RG-PAY-010) (Cycle de vie d'une campagne, §7).

### US-COT-009 - Ouvrir une campagne

**En tant qu'Administrateur ou Trésorier**, je veux ouvrir explicitement une campagne prête, afin de figer son barème et de démarrer l'enregistrement des règlements.

**Informations de préparation** : complétude du barème, cohérence des dates, capacité à établir les cotisations, date de début et état courant de la campagne.

**Règles**

- L'action d'ouverture est proposée uniquement à l'Administrateur et au Trésorier.
- Toutes les catégories portées par les membres concernés doivent avoir un montant strictement positif.
- La date de début doit être atteinte ; une ouverture anticipée n'est pas autorisée dans le MVP.
- Une confirmation explicite est demandée avant l'ouverture, car le barème devient immuable.
- L'ouverture renseigne la date et l'utilisateur l'ayant effectuée.
- Une campagne ouverte accepte les règlements et n'accepte plus de modification du barème.
- Une campagne non prête reste en Brouillon et expose les éléments bloquants.

---

## 8. Cagnottes sociales

### US-CAG-001 — Créer une cagnotte

**En tant qu'Administrateur ou Trésorier**, je veux créer une cagnotte sociale, afin de collecter des contributions pour un événement ou une situation particulière.

**Types d'événements** (configurables) : Mariage, Baptême, Décès, Naissance, Autre.

**Informations** : Titre, Type d'événement, Description, Personne ou famille concernée, Date de début, Date de fin, Objectif éventuel.

**Règles**

- **RG-CAG-001** — Une cagnotte est indépendante d'une campagne de cotisation.
- **RG-CAG-002** — Une cagnotte peut être créée pour un événement particulier.
- **RG-CAG-003** — Une cagnotte possède une période de collecte.

### US-CAG-002 — Enregistrer une contribution

**En tant que Trésorier ou Opérateur autorisé**, je veux enregistrer la contribution d'un membre ou d'un contributeur externe, afin de suivre les participations à la cagnotte sans créer de faux membre.

**Informations** : Membre sélectionné ou contributeur externe (prénom et nom), Cagnotte, Montant (GNF), Date, Mode (Espèces / Mobile Money / Virement bancaire), Utilisateur ayant enregistré la contribution.

**Règles**

- **RG-CAG-004** — Une contribution est rattachée à une cagnotte et à exactement une identité contributrice : un membre sélectionné ou un contributeur externe identifié par son prénom et son nom.
- **RG-CAG-005** — Un membre ou un contributeur externe peut effectuer plusieurs contributions à une même cagnotte, sans restriction de nombre ni de montant minimal entre deux contributions.
- **RG-CAG-006** — Une contribution à une cagnotte ne réduit jamais le montant d'une cotisation.
- **RG-CAG-007** — Chaque contribution enregistre l'identité de l'utilisateur qui l'a saisie et l'horodatage de la saisie (traçabilité).
- **RG-CAG-008** — Un contributeur externe est conservé comme un instantané de prénom et de nom dans la contribution ; il ne devient ni membre, ni utilisateur, ni titulaire d'un accès à l'application.
- **RG-CAG-009** — Une contribution ne peut pas contenir simultanément un membre et un contributeur externe, ni être dépourvue d'identité contributrice.
- **RG-CAG-010** — Le nombre de contributeurs d'une cagnotte compte les membres distincts par identifiant et les contributeurs externes distincts par paire de prénom et nom normalisée dans cette cagnotte.

### US-CAG-003 — Suivre une cagnotte

**En tant qu'Administrateur, Trésorier ou Opérateur autorisé**, je veux consulter la situation d'une cagnotte, afin de suivre la collecte.

**Informations** : Total collecté, Nombre de contributeurs, Objectif, Reste éventuel, Liste des contributions.

### US-CAG-004 — Clôturer une cagnotte

**En tant qu'Administrateur ou Trésorier**, je veux clôturer une cagnotte, afin de terminer la collecte.

**Règles**

- Les contributions historiques restent accessibles.
- Le montant final reste disponible.
- Une cagnotte clôturée n'accepte plus de nouvelle contribution.

---

## 9. Espace personnel du membre

### US-MBR-001 — Consulter son profil

**En tant que membre**, je veux consulter mes informations, afin de vérifier les données détenues par l'association.

### US-MBR-002 — Consulter mes cotisations

**En tant que membre**, je veux consulter mes cotisations, afin de connaître ma situation.

**Informations** : Campagne, Période, Montant dû, Montant payé, Reste, Statut.

### US-MBR-003 — Consulter mes contributions

**En tant que membre**, je veux consulter mes contributions aux cagnottes, afin de retrouver mon historique de participation.

---

## 10. Gestion du compte utilisateur

### US-ACC-001 — Créer automatiquement le compte

**En tant qu'association**, je veux qu'un compte soit automatiquement associé à chaque nouveau membre, afin que le membre dispose d'un accès à son espace.

**Règles**

- Un membre possède un compte associé.
- La création du compte est déclenchée lors de l'ajout du membre.
- Il n'existe pas d'inscription libre.
- Un membre ne peut pas créer lui-même son profil d'adhérent.

---

## 11. Synthèse des droits par niveau

**Niveau 1 — Administrateur** : gérer les membres, les catégories, les rôles, les paramètres de référence ; superviser l'ensemble de l'application.

**Niveau 2 — Trésorier** : gérer les campagnes, définir les montants, suivre les cotisations, enregistrer les règlements, gérer les cagnottes, enregistrer les contributions, consulter les situations financières.

**Niveau 3 — Opérateur** : consulter les membres et les campagnes autorisées ; modifier les champs non structurants d'un membre ; enregistrer les règlements et contributions **si** `peut_enregistrer_paiements = oui`. Ne peut jamais : gérer les rôles, gérer les catégories de revenu, modifier les paramètres structurants d'un membre, désactiver ou réactiver un membre, modifier les montants d'une campagne, clôturer une campagne ou une cagnotte.

**Niveau 4 — Membre** : consulter son profil, ses cotisations, ses règlements, ses contributions ; participer aux opérations ouvertes aux membres (hors saisie de paiement, cf. Annexe A).

---

## 12. Règles métier fondamentales (référentiel officiel)

| ID | Règle |
|---|---|
| RG-001 | Un membre est une personne de l'association, avec ses informations personnelles, sa catégorie de revenu, sa fonction et son statut. |
| RG-002 | Un compte n'est pas un membre. Le compte permet d'accéder à l'application ; le membre représente la personne dans l'association. |
| RG-003 | Pas d'adhésion libre : seuls les responsables autorisés créent les membres. |
| RG-004 | Une catégorie de revenu ne fixe aucun montant ; elle sert uniquement à déterminer quel montant de campagne appliquer au membre. |
| RG-005 | La campagne définit les montants. Chaque campagne possède sa propre configuration des montants par catégorie. |
| RG-006 | Le montant dû est propre à la campagne. Un membre peut devoir 25 € pour une campagne et 40 € pour une autre. |
| RG-007 | L'historique financier est préservé. Les changements futurs de membre, catégorie ou campagne ne modifient jamais l'historique. |
| RG-008 | Les campagnes sont indépendantes : chacune peut être créée à tout moment et possède ses propres dates et montants. |
| RG-009 | Les règlements sont liés aux cotisations : un paiement doit toujours permettre d'identifier la campagne et le membre concernés. |
| RG-010 | Les paiements peuvent être partiels. |
| RG-011 | Les cagnottes sont indépendantes : elles n'ont aucun impact sur le statut de cotisation. |
| RG-012 | L'inactivité ne supprime pas l'historique. Un membre désactivé reste présent dans l'historique. |
| RG-013 | Les droits dépendent du rôle. Chaque opération est réservée au rôle autorisé. |
| RG-014 | Un règlement ou une contribution ne peut jamais être supprimé, seulement annulé/contre-passé, afin de préserver la traçabilité comptable. |
| RG-015 | La devise de l'application est le Franc Guinéen (GNF) ; tous les montants sont des entiers (voir RG-FMT-001 à RG-FMT-004, §1.3). |
| RG-016 | Un règlement ou une contribution est toujours associé à l'un des trois modes suivants : Espèces, Mobile Money, ou Virement bancaire (voir RG-PAY-009, §1.3). |
| RG-017 | Une contribution de cagnotte est associée à un membre ou à un contributeur externe, mais jamais aux deux et jamais à aucun. |
| RG-018 | Une identité externe saisie pour une contribution ne crée pas de membre ni de compte et n'ouvre pas d'accès à l'espace personnel. |

---

## 13. Protection des données personnelles

L'application traite des données personnelles de membres (identité, coordonnées, historique financier). Pour le MVP, a minima :

Les prénom et nom d'un contributeur externe sont également des données personnelles conservées comme instantané de l'opération. Ils sont limités aux informations nécessaires au suivi de la cagnotte, ne sont pas utilisés pour créer un membre ou un compte, et ne sont pas exposés dans l'espace personnel d'un membre.

- **RG-DATA-001** — L'accès aux données personnelles des membres est limité aux rôles définis dans la matrice (§3) ; un Membre ne voit que ses propres données.
- **RG-DATA-002** — La désactivation d'un membre (§5, US-MEM-005) ne vaut pas suppression de ses données ; une éventuelle demande de suppression définitive (droit à l'effacement) est traitée hors MVP, manuellement par l'Administrateur, en conformité avec le RGPD.
- **RG-DATA-003** — Aucune donnée de membre n'est communiquée à un tiers hors du fonctionnement de l'association.

> Ce paragraphe est un socle minimal. Une analyse RGPD complète (durée de conservation formalisée, registre des traitements, information des membres) est recommandée avant mise en production, même pour un usage associatif restreint.

---

## Annexe A — Hors périmètre du MVP (explicite)

Pour éviter toute ambiguïté avec l'équipe de développement, les points suivants sont **volontairement exclus** de la version 1 et pourront faire l'objet d'une V2 :

- Paiement en ligne par le membre lui-même (carte bancaire, agrégateur de paiement, etc.). Dans le MVP, seul un Trésorier ou un Opérateur autorisé enregistre un règlement, constaté après coup selon l'un des trois modes retenus : espèces, Mobile Money, ou virement bancaire reçu.
- Intégration technique directe avec un opérateur Mobile Money (API de paiement, notification automatique de transaction). Dans le MVP, l'enregistrement d'un règlement Mobile Money reste une saisie manuelle par le Trésorier/Opérateur, au vu d'une preuve de transaction (SMS, capture d'écran).
- Permissions d'Opérateur granulaires par campagne ou par cagnotte (le MVP utilise un attribut global, §2.3).
- Notifications ou relances automatiques des membres en retard de paiement.
- Génération de reçus ou justificatifs fiscaux.
- Suppression définitive d'un membre ou de ses données (traitée manuellement, hors application).
- Rôle applicatif dédié "Président" ou toute autre fonction associative.
- Correction ou annulation d'un règlement ou d'une contribution déjà enregistrés (erreur de saisie de montant, de mode ou de date). Pour le MVP, toute erreur de ce type doit être corrigée manuellement, hors application, par l'Administrateur ; aucun écran ni endpoint n'est prévu pour cela. (La réactivation d'un membre, elle, est prise en charge — voir US-MEM-006 — ce point ne concerne que les écritures financières.)
- Génération et communication automatiques de l'identifiant de connexion initial d'un membre. Pour le MVP, la convention retenue est : l'identifiant est le numéro de téléphone du membre, et le mot de passe initial est communiqué de la main à la main ou par SMS par l'Administrateur au moment de la création du compte — sans automatisation (pas d'email, pas de SMS applicatif).

---

## Proposition pour la suite

Le référentiel ci-dessus est stable et sans point ouvert. L'étape suivante consiste à décliner chaque User Story au format backlog complet :

**ID → Epic → User Story → Description → Règles de gestion → Préconditions → Scénarios nominaux → Scénarios d'erreur → Critères d'acceptation → Priorité MVP → Rôle autorisé.**

Ce document peut être transmis à une équipe de développement sans interprétation supplémentaire des règles métier.
