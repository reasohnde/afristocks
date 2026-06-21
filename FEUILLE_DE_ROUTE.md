# Feuille de route — Plateforme AfriStocks
## Plan directeur d'industrialisation : du prototype compromis au MVP fintech production-ready

> **Version 2 (finalisee apres controle x5).** Cette version integre les correctifs issus du protocole de controle x5 : registre de decisions unifie, matrice de dependances comme source de verite unique, chiffrage bottom-up en personne-jours, dimensionnement d'equipe explicite, buffer de contingence, registre d'IDs unique avec taches « owner », et nouveaux domaines metier (operations/support, portail emetteur, cycle de vie des campagnes, residence des donnees). Le Journal du controle x5 en fin de document trace chaque lentille et l'integration des lacunes.

---

## 1. Resume executif & verdict

**Verdict : le systeme NE PEUT PAS aller en production en l'etat.** Trois categories de blocages le rendent inexploitable et juridiquement dangereux aujourd'hui :

1. **Compromission active des secrets.** Mot de passe DB (`Bonesoire001`), secrets JWT, AWS Account ID et fichier `Mots de passes et ID.txt` sont toujours suivis par git et presents dans l'historique de **5 remotes**. Tout secret ayant transite par git doit etre considere comme public.
2. **Failles d'autorisation exploitables immediatement.** L'inscription est ouverte, `requireAdmin` n'est applique nulle part : tout utilisateur peut s'inscrire, atteindre `/api/admin/*`, modifier roles/KYC/soldes et **auto-valider son propre KYC**. Des IDOR persistent (logout/refresh prennent `userId` depuis le body).
3. **Fausse monnaie & operations financieres non fiables.** Le depot credite le wallet **sans aucun encaissement reel** (0 SDK de paiement), aucune idempotence, pas de grand livre, retraits jamais finalises. Inacceptable pour une plateforme manipulant de l'argent.

**Cependant, le projet est SAUVABLE.** Les fondations sont saines : modele de donnees Prisma correct (Decimal 20,2, enums metier, transactions atomiques), services backend wallet/investment/auth fonctionnels sur le plan logique, frontend deja decoupe en 24 vues, stack technique moderne et coherente. Le probleme n'est pas conceptuel mais **executif** : chaos git, secrets exposes, securite non cablee, features financieres absentes, zero test gating, zero CI/CD, zero observabilite.

**Conditions de mise en production (non negociables) :**
- Purge + rotation complete des secrets (**rotation AVANT purge d'historique**), historique git assaini, RBAC effectif sur toutes les routes sensibles, IDOR fermes, invalidation globale des sessions au changement de mot de passe (Phase 1).
- Au moins un PSP (mobile money) reellement integre avec webhooks signes (anti-rejeu timestamp+nonce, allowlist IP), idempotence et reconciliation ; grand livre comptable double-entree auditable ; KYC/AML reel conditionnant les operations (Phases 2-3).
- Backups DB testes (RPO/RTO valides), monitoring/alerting, audit logging immuable (WORM, conforme CENTIF/UEMOA), CI/CD avec gating securite/tests, console operateur & support (Phases 3-4).
- Pentest cible (authz, IDOR, 2FA, paiements) sans finding critique/high non resolu avant ouverture publique (Phase 4).

**Estimation : voir section 4 bis (chiffrage bottom-up).** La charge totale realiste est estimee a **~250-400 personne-jours**. La fenetre calendaire de **16 a 20 semaines** n'est atteignable qu'avec une **equipe de 4-6 ETP qualifies** (scenario A) ; en **solo/1-2 ETP**, le delai realiste est de **9 a 15 mois** (scenario B). Le mode d'execution (DEC-C) est une decision **bloquante de pre-phase 1**. Le chemin critique passe par la securite (Phase 1) puis le socle financier (Phases 2-3), avec une **reserve de contingence explicite** (section 4 bis).

---

## 2. Vision produit & objectifs

**AfriStocks** est une plateforme d'investissement permettant au grand public ouest-africain (cible monetaire **XOF/UEMOA**, cf. DEC-B) d'investir dans des **startups africaines** via une experience web et mobile, avec depot/retrait par **mobile money** (Orange Money, MTN MoMo, Wave).

| Axe | MVP (lancement) | Cible (vision) |
|---|---|---|
| **Identite** | Inscription, login JWT reel, 2FA optionnelle, KYC Tier 1 | KYC multi-niveaux, biometrie mobile, screening PEP/sanctions |
| **Argent** | Depot + retrait via 1 PSP, wallet fiable, grand livre double-entree | Multi-PSP, dividendes, remboursements, multi-devises |
| **Investissement** | Catalogue startups, investir, portefeuille, calcul de rendement | Valorisation/parts, marche secondaire, analytics avances |
| **Emission (cote startup)** | Portail emetteur minimal : profil startup, soumission de campagne (validee par admin) | Cap table, suivi de levee en temps reel, communication investisseurs, reporting fondateur |
| **Cycle de campagne** | Etats de campagne (brouillon/active/clôturee), seuils min/max, remboursement auto si objectif non atteint | Sur-souscription geree, calendrier de tranches, secondaire |
| **Conformite** | KYC bloquant avant retrait/investissement, audit trail, residence des donnees UEMOA evaluee | AML transactionnel, reporting reglementaire (STR/SAR CENTIF), souverainete data confirmee |
| **Operations & support** | Console operateur (vue 360 client), gel/degel compte, file de litiges/reclamations, SLA chiffres | Support multicanal, scoring de risque, outils de remediation avances |
| **Canaux** | Web (Next.js) + Android | Web + iOS + Android a parite, notifications push temps reel |
| **Exploitation** | CI/CD, backups testes, monitoring, alerting | DR multi-AZ/multi-region, SLO formalises, observabilite complete |

**Principe directeur :** aucune fonctionnalite financiere n'est exposee tant que son socle de securite et de tracabilite comptable n'est pas en place. La fiabilite de l'argent prime sur la richesse fonctionnelle.

---

## 3. Architecture cible

```
                      ┌─────────────────────────────────────────────┐
                      │         CLIENTS                              │
   ┌──────────────┐   │  Web (Next.js 15 / App Router / RSC)         │
   │  Utilisateur │──▶│  Mobile (React Native 0.80 / Keychain)      │
   │  Fondateur   │   │  Operateur (console back-office)            │
   └──────────────┘   └───────────────────┬─────────────────────────┘
                                           │  HTTPS (TLS, domaine unique)
                                           │  Auth: cookie httpOnly + refresh
                                           ▼
                      ┌─────────────────────────────────────────────┐
                      │  INGRESS K8s  (/ → web, /api + /socket.io → API)│
                      └───────────────────┬─────────────────────────┘
                                           ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │  BACKEND  (Express/TS, Node 20)                                    │
   │  routes → controllers → services → repositories                   │
   │  Middlewares: auth JWT · RBAC · validation · rate-limit · audit   │
   │  Socket.io authentifie (room user:<id>) · Redis adapter           │
   │  Couche financiere: Ledger (double-entree) · idempotence ·        │
   │    machine a etats Transaction · webhooks PSP signes (anti-rejeu) │
   │  Operations: console operateur · gel/degel · file de litiges      │
   │  Emission: cycle de vie campagne · cap table                      │
   └───────┬───────────────┬───────────────┬──────────────┬──────────┘
           ▼               ▼               ▼              ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐  ┌──────────────┐
   │ PostgreSQL │   │   Redis     │   │  S3 (KYC,   │  │ PSP externes │
   │ (Prisma,   │   │ (sessions,  │   │  backups,   │  │ Orange/MTN/  │
   │  WAL/PITR) │   │  cache,file)│   │  SSE-KMS)   │  │ Wave         │
   └────────────┘   └────────────┘   └────────────┘  └──────────────┘
           │
           ▼  Observabilite: logs JSON (Pino) · metrics (Prometheus) ·
              traces (OTel) · erreurs (Sentry) · audit immuable (WORM)
```

**Couches & responsabilites :**
- **Web** : App Router (URLs partageables, SSR/RSC), React Query, client HTTP unique, auth reelle (fin du `mock-token`).
- **Mobile** : sortie du monolithe `App.tsx`, React Navigation, stockage securise Keychain, parite fonctionnelle progressive, **i18n et a11y traitees a parite avec le web**.
- **Backend** : separation stricte routes/controllers/services/repositories, gestion d'erreurs centralisee (AppError + handler), validation systematique, RBAC effectif, console operateur.
- **Donnees** : PostgreSQL comme source de verite financiere (grand livre double-entree, soft-delete, audit log immuable). Redis pour sessions/cache/rate-limit/file de notifications. **Residence des donnees : la localisation des PII et donnees financieres UEMOA fait l'objet de DEC-I (souverainete data) — eu-west-1 par defaut = transfert hors zone a evaluer.**
- **Infra** : Kubernetes (probes, limits, NetworkPolicy, secrets manager), CI/CD gating, backups testes, monitoring, DR.

**Contrat d'API = source de verite.** Une specification **OpenAPI** (libs `swagger-jsdoc`/`swagger-ui-express` deja installees mais non branchees) devient le contrat unique : annotee sur les routes backend, versionnee (`/api/v1`), lintee en CI (spectral), generant les **clients TS typed** consommes par le web et le mobile. Fini les divergences de champs (`firstName`/`lastName` vs `name`), de devise (XAF/XOF) et de ports.

---

## 4. Modele operationnel — Roster des agents & cadence

### 4.1 Roster des 13 agents specialises

Chaque domaine est pilote par un agent responsable de son backlog. Matrice RACI : **R**=Realise, **A**=Approuve/Redevable, **C**=Consulte, **I**=Informe. L'**Architecte en chef** est **A** sur tous les livrables transverses et arbitre les dependances inter-domaines.

> **Nature des « agents » (cf. DEC-C) :** un « agent » designe un **role de domaine**, pas necessairement une personne. Selon le scenario d'execution retenu, un domaine peut etre tenu par un ETP humain, partage entre plusieurs domaines pour un meme contributeur (mode solo/petit), ou assiste par des sessions IA supervisees. Dans tous les cas, **la supervision humaine de revue (notamment securite/paiements) est une ressource limitee** : un humain ne supervise efficacement que 1-2 chantiers complexes en parallele. L'overhead de revue (protocole x5) est integre au chiffrage (section 4 bis).

| # | Agent / Domaine | Perimetre | Prefixe | Principales interfaces (C/I) |
|---|---|---|---|---|
| 1 | **Securite & secrets** | Purge/rotation secrets, durcissement auth/transport, chiffrement, supply chain | SECU | A sur tout ce qui touche secrets/authz ; C: tous |
| 2 | **Backend API** | Routes/services Express, RBAC, JWT, gestion d'erreurs, OpenAPI, console operateur | BACK | C: Securite, Donnees, Paiements ; I: Front, Mobile |
| 3 | **Modele de donnees & Prisma** | Schema, migrations, grand livre, soft-delete, audit, seed, cap table | DATA | C: Backend, Paiements, KYC ; A sur migrations |
| 4 | **Paiements & argent** | PSP, webhooks, idempotence, ledger, retrait/dividende/refund, litiges/retro-facturation | PAIE | C: Donnees, Securite, Backend ; I: Front, Mobile |
| 5 | **KYC / AML / Conformite** | Niveaux KYC, documents S3, screening, plafonds, RGPD, residence data, reporting CENTIF | KYC | C: Securite, Paiements, Donnees, juriste |
| 6 | **Frontend web** | App Router, auth reelle, React Query, design system, i18n, a11y | FRON | C: Backend (contrat API), Securite |
| 7 | **Mobile RN** | Navigation, auth Keychain, parite fonctionnelle, i18n/a11y, build/signature | MOBI | C: Backend, Securite ; bloque par PSP/KYC |
| 8 | **Temps reel & notifications** | Socket.io auth, NotificationService, email/SMS/push, file | REAL | C: Backend, Securite, Infra |
| 9 | **Infra Docker/K8s** | Images prod, manifests Helm, datastores, ingress/TLS, secrets runtime, DR/region | INFR | A sur deploiement ; C: Securite, CI/CD |
| 10 | **CI/CD & release** | Pipelines, gating, build/push images, deploy, versioning | CICD | C: Infra, Tests, Securite |
| 11 | **Tests & QA** | Pyramide de tests, integration, E2E, charge, gating couverture | TEST | C: tous ; A sur la DoD qualite |
| 12 | **Observabilite & exploitation** | Logs, metrics, traces, Sentry, audit log, backups, runbooks, support/SLA | OBSE | C: Infra, Backend, Securite |
| 13 | **Depot & architecture cible** | Git/historique, remotes/branches, workspaces, doc, ADR, registre d'IDs & decisions | REPO | A sur structure repo + registre IDs/DEC ; C: tous |

> **Note de perimetre (nouveaux domaines metier integres aux sections de domaine) :** le **portail emetteur/fondateur** (champ `ownerId` sur Startup, soumission de campagne, cap table, communication investisseurs) est porte par BACK+DATA+FRON ; le **cycle de vie des campagnes** (etats, seuils min/max, remboursement auto en cas de sous-souscription) par PAIE+DATA+BACK ; les **operations & support** (console operateur, gel/degel, file de litiges, SLA) par BACK+OBSE+PAIE ; la **residence/souverainete des donnees** par KYC+INFR (cf. DEC-I) ; le **reporting reglementaire et la facturation/TVA des frais** par DATA+KYC.

### 4.2 Cadence de synchronisation

- **Daily (asynchrone)** : chaque agent met a jour l'etat de ses tickets (To do / In progress / Blocked / In review / Done) et signale tout nouveau blocage inter-domaines.
- **Sync hebdomadaire d'integration** : l'Architecte en chef arbitre les dependances, valide les decisions ouvertes (DEC-*), reordonne le chemin critique. **Artefact** : **la matrice de dependances unique (section 4 ter)** mise a jour + liste des blocages leves/ouverts.
- **Revue de fin de phase (gating)** : aucun passage a la phase suivante sans que tous les livrables P0/P1 de la phase aient passe le **Protocole de controle x5** (section 5).

**Artefacts produits a chaque etape :**
1. Backlog par domaine, gabarit de ligne **unique** (memes colonnes obligatoires : ID, Titre, Desc, Fichiers, DoD verifiable, Deps, Effort echelle unifiee, Phase canonique unique, Prio, Risques, **total p-j**), idealement exportable en CSV/YAML pour lint CI.
2. **Matrice de dependances unique (DAG)** — source de verite du sequencement (section 4 ter), premier artefact de Phase 1.
3. **Registre d'IDs et de decisions unique** (section 4 ter) garantissant l'unicite des IDs et la tracabilite des DEC-*.
4. Specification OpenAPI versionnee (contrat source de verite).
5. ADR pour chaque decision structurante (repo, secrets, domaine, ledger…).
6. Rapport de controle x5 par livrable.
7. Runbooks et documentation d'exploitation.

**Definition of Done globale (tout livrable) :** code merge sur `main` via PR ; CI verte (lint + typecheck + tests + scan secrets/deps) ; couverture ≥ seuil de phase ; aucun secret introduit ; documentation/OpenAPI a jour ; ID unique sans doublon ; les 5 controles passes sans erreur residuelle.

### 4 ter. Gouvernance de la tracabilite (registre unique — correctifs de coherence)

**Registre d'IDs unique.** Un seul format d'identifiant : `<PREFIXE>-<NN>`, prefixe de 4 lettres max, **un seul tiret** (les `KYC--XX` deviennent `KYC-XX`). La numerotation est globalement unique et jamais reutilisee pour un meme sujet. Un lint des backlogs (si machine-readable) verifie l'unicite en CI.

**Tache « owner » unique par correctif transverse.** Chaque correctif partage a **une seule tache R (owner)** ; les autres deviennent des references « depend de / consomme ». Resolution des doublons signales :

| Sujet transverse | Tache OWNER (R) | References (consomment) |
|---|---|---|
| Devise XAF→XOF | **DATA-01** | BACK-15, PAIE-05 (DoD corrigee en « XOF partout ») |
| RBAC admin | **SECU-10** | BACK-04, KYC-01 |
| CORS allowlist | **SECU-23** | BACK-61, PAIE-26 |
| Auth Socket.io | **SECU-25** | BACK-62, REAL-01 |
| Dedup JWT | **SECU-18** | BACK-01 |
| Secret refresh distinct | **SECU-19** | BACK-02 |
| Validation env au boot | **SECU-07** | BACK-63, REPO-19 |
| Purge historique git | **REPO-03** | SECU-03 (rotation prealable), INFR-02, CICD-03 |
| Brancher swagger/OpenAPI | **BACK-50** | REPO-24, TEST-70 |
| Ecriture LoginAttempt | **SECU-16** | OBSE-21 |

**Registre de decisions unique.** **Toutes** les decisions sont centralisees dans le referentiel `DEC-*` du chapeau (section 8). Les referentiels locaux des sections (DEC-1..7 securite, « decisions 1..8 » backend/data, etc.) sont **supprimes ou mappes** vers les refs canoniques. Une table « decision → tickets impactes » est maintenue dans le chapeau.

**Contradiction de devise tranchee.** DEC-B tranchee **XOF/UEMOA**. La DoD de PAIE-05 est corrigee pour lire « **XOF partout** » (et non XAF). DATA-01 est owner ; un test de coherence transverse verifie « une seule devise (XOF) dans schema + services + validators + seed ».

### 4 bis. Chiffrage bottom-up, dimensionnement & contingence (correctifs de faisabilite)

**Bareme de conversion effort → personne-jours :** S = 0,5 j · M = 1,5 j · L = 3,5 j · XL = 8 j. Chaque section de domaine porte une colonne **« total p-j »**, sommee par domaine et par phase. Un **facteur d'overhead de verification de +15-20 %** est applique a chaque estimation pour couvrir le protocole x5, les revues de fin de phase et le pentest (planification prestataire + cycle de remediation, 2-4 sem. de bout en bout).

**Charge totale estimee (bottom-up, a affiner par section) : ~250-400 personne-jours**, overhead inclus. Les items XL/L critiques (ledger double-entree, abstraction PSP + 3 PSP, KYC upload S3/screening/chiffrement, App Router, sortie du monolithe mobile, file/outbox notifications, Terraform/IaC) totalisent a eux seuls >120-150 j-h.

**Deux scenarios de dimensionnement (DEC-C, decision bloquante de pre-phase 1) :**

| Scenario | Capacite | Duree calendaire derivee | Profils requis |
|---|---|---|---|
| **A — Equipe** | 4-6 ETP qualifies | **16-20 semaines** (parallelisation des domaines independants) | 1 securite/backend senior, 1 paiements/fintech (experience PSP/AML — profil rare, a recruter en avance), 1 data/Prisma, 1 frontend, 1 mobile, 1 devops/SRE + supervision Architecte |
| **B — Solo / 1-2 ETP** | 1-2 ETP | **9-15 mois** (serialisation) | polyvalence forte ; calendrier serialise, pas de parallelisme inter-domaines |

La duree calendaire est **derivee** de la charge (total p-j ÷ capacite ETP × jours ouvrables × facteur de focalisation ~0,7), et non postulee.

**Delais externes a integrer au chemin critique (hors controle de l'equipe, 4 a 26 semaines) :**

| Dependance externe | Delai typique | Impact |
|---|---|---|
| Onboarding marchand PSP (Wave/MTN/Orange) | 4-12 sem. | Bloque depot/retrait reels (P3) |
| Licence/statut reglementaire CREPMF/BCEAO | 8-26 sem. | Bloque ouverture publique |
| Prestataire KYC/AML & screening | 4-10 sem. | Bloque KYC reel (P3) |
| Compte Apple/Google Developer | 1-4 sem. | Bloque distribution mobile |

Ces delais **demarrent en pre-phase 1** (en parallele de la securite) car ils sont souvent plus longs que le developpement lui-meme.

**Reserve de contingence :** **+20-30 %** (≈ 3-4 semaines tampon avant J4 en scenario A). Regle : tout finding critique/high du pentest ou tout echec de migration ledger consomme d'abord le buffer avant de repousser la date. **Risques « tueurs de calendrier » identifies :** (1) refonte ledger double-entree (gel des operations), (2) onboarding PSP, (3) licence reglementaire, (4) recrutement profil fintech, (5) migration d'historique git destructive coordonnee sur 5 remotes.

**Budget (DEC-D, decision bloquante de pre-phase 1) :** une enveloppe mensuelle chiffree doit etre arbitree avant la Phase 1, car le choix managed vs self-hosted (RDS/ElastiCache/EKS vs in-cluster) change radicalement l'effort DevOps et donc le calendrier. A defaut, le calendrier des phases 3-4 est presente comme **conditionnel**.

---

## 5. Protocole de controle x5 (gating obligatoire)

Chaque livrable subit **5 controles independants**. Un livrable ne peut etre marque Done que si les **5 passent**. Regle absolue : **aucune erreur laissee** — toute anomalie detectee est soit corrigee avant merge, soit transformee en ticket trace et explicitement acceptee par l'Architecte en chef (jamais ignoree silencieusement).

| # | Controle | Question centrale | Critere de passage (gating) |
|---|---|---|---|
| **C1** | **Completude** | Le livrable couvre-t-il toute la portee du ticket (DoD, cas d'erreur, tests, doc, OpenAPI) ? | Tous les criteres de DoD coches ; aucun TODO/stub `success:true` residuel ; doc et contrat API mis a jour. |
| **C2** | **Sequencement** | Toutes les dependances amont sont-elles livrees ? N'introduit-on pas un travail « en l'air » ? | Dependances declarees `Done` **dans la matrice de dependances unique (section 4 ter)** ; aucun mock destine a masquer une dependance absente ; phase canonique unique respectee (P0→P1→P2). |
| **C3** | **Securite & conformite** | Introduit-on/laisse-t-on une faille, un secret, une PII exposee, une regle KYC/AML contournable ? | Scan secrets vert ; pas de regression RBAC/authz ; pas d'IDOR ; PII chiffrees ; pas de nouveau secret en clair ; impact reglementaire (CENTIF/UEMOA, residence data) evalue. |
| **C4** | **Faisabilite** | La solution est-elle realisable, dimensionnee, sans dette ingerable ni dependance externe non maitrisee ? | Effort en p-j coherent ; capacite ETP suffisante ; dependances externes (PSP, licence, cloud) confirmees et leurs delais integres ; buffer non epuise ; pas de cardinalite/cout explosif. |
| **C5** | **Coherence** | Le livrable est-il aligne avec l'architecture cible, le contrat API, les conventions et les autres domaines ? | Respect OpenAPI ; ID unique au format `<PREFIXE>-<NN>` ; owner unique pour les correctifs transverses ; devise/champs unifies (XOF) ; refs DEC-* canoniques ; pas de divergence front/back/mobile. |

**Application :** C1, C3 et C5 sont systematiques sur chaque PR (en partie automatises via CI). C2 et C4 sont verifies lors de la sync hebdomadaire et de la revue de phase, **sur la base de la matrice de dependances unique et du chiffrage p-j**. Le rapport x5 est l'artefact de tracabilite du gating.

---

## 6. Plan par phases, calendrier, chemin critique & dependances

> **Pre-phase 0 (avant tout engagement de date) :** trancher les decisions bloquantes **DEC-B (devise/PSP), DEC-C (solo vs equipe), DEC-D (budget), DEC-I (residence data)** ; demarrer en parallele les **onboardings externes a long delai** (PSP, licence CREPMF/BCEAO, prestataire KYC/AML, compte Apple/Google) ; produire la **matrice de dependances unique** et le **registre d'IDs/decisions**.

### Phase 1 — Urgence & confinement (semaines 1-3, etendre a 4 si la capacite l'exige)
**Objectif : stopper l'hemorragie et rendre le systeme non exploitable par un attaquant.**
- **SECU/REPO/INFR** : inventaire + **rotation de tous les secrets (PREALABLE et bloquant)** puis detrackage et purge d'historique (REPO-03 owner, coordination 5 remotes/force-push/re-clone), rationalisation remotes/branches, retrait AWS Account ID, scan secrets pre-commit+CI.
- **REPO (prerequis dur, bloquant AVANT purge)** : consolidation des **181 changements non commites** et du travail sur branche `restore-frontend` sur `main` — **ne jamais purger l'historique avant d'avoir securise ce code** (risque de perte du travail de fev. 2026).
- **SECU/BACK** : RBAC sur `/api/admin/*` (SECU-10 owner) et 2FA, `role='USER'` force a l'inscription, mass-assignment corrige, fermeture des **IDOR** (logout/refresh ne prennent plus `userId` du body), **invalidation globale des sessions au changement de mot de passe**, deduplication JWT + secret refresh distinct, CORS allowlist, validation+rate-limit auth.
- **BACK/DATA** : route `POST /wallet/withdraw`, **correction devise XOF (DATA-01 owner)**, mismatch `name`/KYC.
- **KYC (anticipe, P1)** : **fermer l'auto-validation KYC et bloquer l'investissement-sans-KYC immediatement** (faille active aujourd'hui) — le modele complet de plafonds reste en P3 mais le verrou minimal est pose des P1.
- **PAIE (P0)** : neutraliser le faux depot (plus de credit automatique).
- **CICD/TEST** : pipeline CI minimal + gating secrets ; DoD git propre.

> **Priorisation si la capacite < charge :** (1) confinement secrets+rotation, (2) RBAC + role force + fermeture IDOR/auto-KYC (escalade active), (3) neutralisation faux depot. CI et refactors non bloquants peuvent glisser en debut de Phase 2. Prevoir un **temps d'onboarding/reappropriation** du code (README 1 ligne) pour toute nouvelle ressource.

**Jalon J1 :** aucun secret valide expose, aucune escalade de privilege possible, IDOR fermes, auto-validation KYC impossible, `main` propre, faux depot neutralise.

### Phase 2 — Stabilisation & socle (semaines 4-7)
**Objectif : fiabiliser l'auth, les tokens, la couche financiere de base, et poser l'infra/tests.**
- **DATA (chemin critique)** : grand livre **double-entree**, idempotence, machine a etats Transaction, comptes systeme — **affectation de phase unique : Phase 2** (resout les divergences ledger/idempotence/machine a etats entre sections). Debloque tout le domaine Paiements.
- **PAIE/BACK** : abstraction PaymentProvider, webhooks signes (**anti-rejeu timestamp+nonce, allowlist IP**), settlement retrait.
- **SECU/BACK** : refresh tokens hashes + rotation **avec reuse-detection/blacklist**, 2FA au login, cookies httpOnly (+CSRF), Socket.io authentifie, validation env au boot (SECU-07 owner).
- **INFR** : Dockerfile prod, manifests Helm complets (probes/limits), datastores PG/Redis securises.
- **TEST** : Jest backend + DB de test, tests unitaires services monetaires/auth, gating couverture.
- **FRON/MOBI** : client HTTP unique, auth reelle (fin du mock).

**Jalon J2 :** auth robuste, grand livre operationnel et equilibre, premier PSP en sandbox, CI gating actif.

### Phase 3 — Features business & MVP (semaines 8-13)
**Objectif : livrer le parcours utilisateur complet de bout en bout.**
- **PAIE** : ≥ 1 PSP en production (depot + retrait), reconciliation, refund, **gestion des litiges/retro-facturations**.
- **KYC** : modele KYC complet, upload S3 chiffre, parcours utilisateur, **plafonds par niveau bloquant retrait/investissement** (le verrou minimal etait deja pose en P1), residence data appliquee (DEC-I).
- **BACK/DATA** : module Startup **avec `ownerId`**, **portail emetteur/fondateur** (soumission de campagne validee admin, cap table minimal), **cycle de vie des campagnes** (etats, seuils min/max, remboursement auto si objectif non atteint), dividendes, lien Investment↔Transaction, calcul de rendement.
- **BACK/OBSE** : **console operateur** (vue 360 client, historique financier, actions auditees de remediation, gel/degel), **file de support liee aux litiges et au KYC avec SLA chiffres**.
- **FRON** : App Router complet, vues branchees sur l'API, UI depot/retrait, i18n.
- **MOBI** : parite MVP (explore/investir/portefeuille/wallet), **i18n/a11y**.
- **REAL** : NotificationService, evenements metier, push web.
- **TEST/REPO** : E2E parcours cles, OpenAPI source de verite + clients generes.

**Jalon J3 :** un utilisateur peut s'inscrire, passer le KYC, deposer, investir, consulter son portefeuille et retirer — sur web et mobile ; un fondateur peut soumettre une campagne ; un operateur dispose de la console et du support.

### Phase 4 — Production & exploitation (semaines 14-18, + buffer 3-4 sem.)
**Objectif : rendre la plateforme exploitable, observable et conforme en production.**
- **OBSE** : backups PG testes + PITR (RPO/RTO chiffres et valides), monitoring/alerting, **audit log immuable WORM (conforme CENTIF/UEMOA, horodatage inviolable, base STR/SAR)**, runbooks, DR multi-region (cf. DEC-I).
- **CICD/INFR** : CD staging→prod avec approbation, scan d'images, TLS/domaine unique, secrets manager.
- **SECU/KYC** : screening AML, rotation des secrets, **pentest cible** (gating final).
- **TEST** : tests de charge, SLO/SLI (p95 latence, taux 5xx) chiffres.

**Jalon J4 (Go/No-Go production) :** backups testes (RPO/RTO valides), observabilite active, audit WORM en place, pentest sans finding critique/high non resolu, SLO definis.

### Chemin critique & dependances cles
```
DEC-B/C/D/I + onboarding externes ─▶ SECU(rotation→purge+RBAC+IDOR) ─▶ DATA(ledger+idempotence) ─▶ PAIE(PSP+webhooks signes) ─▶ KYC(plafonds) ─▶ MVP complet ─▶ OBSE(backups+monitoring+WORM) ─▶ Pentest(+buffer) ─▶ GO
        │                                   │                              │
        └─▶ tout le reste                   └─▶ wallet fiable               └─▶ UI depot/retrait (FRON/MOBI) + portail emetteur + console operateur
```
- **La matrice de dependances unique (section 4 ter)** est la source de verite : chaque livrable y a **une phase canonique unique** et ses dependances dures inter-domaines.
- **DATA double-entree** (Phase 2) est le verrou central : aucun flux argent fiable sans lui.
- **SECU Phase 1** (rotation AVANT purge) debloque l'ensemble.
- **KYC** : verrou minimal en P1 (auto-validation fermee), plafonds complets en P3.
- **Delais externes** (PSP, licence, KYC/AML, comptes mobiles) demarres en pre-phase 0, sur le chemin critique.

---

## 7. KPIs / indicateurs de succes par phase

| Phase | Indicateurs de succes (gating chiffre) |
|---|---|
| **P1** | 0 secret valide expose (verifie par tentative d'auth qui echoue, **apres rotation**) ; 0 fichier secret tracke ; token USER → 403 sur `/api/admin/*` ; **0 IDOR exploitable (logout/refresh/changement mdp)** ; **auto-validation KYC impossible** ; 0 credit wallet sans encaissement ; CI bloque sur faux secret ; `git status` propre, dev sur `main`. |
| **P2** | Grand livre equilibre (Σ debits = Σ credits) sur 100% des operations ; 0 double-credit sous test concurrent (idempotence) ; **refresh token vole inexploitable (reuse-detection active)** ; couverture tests services monetaires/auth ≥ **70%** ; pods K8s `Ready` avec probes/limits. |
| **P3** | Parcours inscription→KYC→depot→investir→retrait vert en E2E (web + mobile) ; retrait impossible si KYC < niveau requis ; ≥ 1 PSP en prod avec reconciliation 0 ecart sur seed ; **campagne sous-souscrite → remboursement auto verifie** ; **fondateur soumet une campagne (validee admin) ; operateur execute une action de remediation auditee** ; reponses API conformes a OpenAPI (0 derive) ; investissement sans KYC reel = impossible. |
| **P4** | Backup quotidien + restauration testee (RPO/RTO valides) ; alerte de bout en bout fonctionnelle ; p95 latence & taux 5xx sous SLO ; pentest : 0 finding critique/high ouvert ; **toute action admin/financiere/operateur auditee dans un AuditLog immuable (WORM)** ; residence data conforme (DEC-I). |

> **Coherence des seuils :** le seuil de couverture de reference est **70 %** (services monetaires/auth en P2). Toute valeur divergente dans une section de domaine est alignee sur ce chapeau (correction de la contradiction relevee par C5).

---

## 8. Hypotheses & decisions a valider par le porteur (registre unique DEC-*)

Toutes les decisions du projet sont centralisees ici. Les sections de domaine **referencent uniquement** ces refs canoniques (les referentiels locaux DEC-1..7, « decisions 1..8 », etc. sont supprimes ou mappes). Une table « decision → tickets impactes » accompagne ce registre.

| Ref | Decision | Impact | Recommandation | Blocage |
|---|---|---|---|---|
| **DEC-A — Juridiction & regulateur** | UEMOA/BCEAO + CREPMF (Cote d'Ivoire) vs exposition UE (.eu) ? Statut reglementaire. | KYC/AML, retention, devise, licence | UEMOA, domaine `.com`, conformite locale d'abord. | Pre-phase 0 |
| **DEC-B — Devise & marches paiement** | XOF (UEMOA) confirme ? Quels PSP au MVP ? Qui ouvre les comptes marchands ? | Wallet, ledger, PSP, devise unifiee | **XOF + 1 PSP au MVP (souvent Wave), elargir ensuite. Tranche : XOF partout.** | **Bloquante pre-phase 0** |
| **DEC-C — Solo vs equipe** | Execution solo/1-2 ETP en sequentiel vs equipe 4-6 ETP en parallele ? | Calendrier (16-20 sem. = equipe ; 9-15 mois = solo) | Confirmer la capacite et les profils (fintech/PSP/AML rare). Fournir les deux scenarios chiffres (section 4 bis). | **Bloquante pre-phase 0** |
| **DEC-D — Budget** | Enveloppe cloud (EKS/RDS/ElastiCache/S3), comptes Apple/Google, PSP, screening AML, observabilite (SaaS vs self-hosted). | Faisabilite P3/P4, managed vs self-hosted, calendrier | Definir une enveloppe mensuelle ; lier chaque choix a son impact en j-h DevOps. | **Bloquante pre-phase 0** |
| **DEC-E — Delais** | Date cible de MVP public ? Tolerance au report si pentest revele des failles ? | Ordre des phases, perimetre MVP, buffer | Fixer une date Go/No-Go conditionnee a J4 et au buffer de contingence. | Pre-phase 0 |
| **DEC-F — Mono vs multi-repo** | Monorepo a workspaces (recommande) vs multi-repo ? Remote canonique unique ? | Structure, CI/CD, imports, purge historique | Monorepo + `origin` GitHub unique ; abandonner les 4 autres remotes apres audit. | Phase 1 |
| **DEC-G — Modele de session & 2FA** | Cookies httpOnly (+CSRF) vs bearer en memoire ? Politique 2FA (obligatoire ADMIN/avant retrait ?). | Frontend, mobile, securite | Cookies httpOnly + refresh ; 2FA obligatoire pour ADMIN et avant tout retrait. | Phase 1-2 |
| **DEC-H — Comptabilite double-entree** | Grand livre double-entree (effort XL) vs journal mono-entree ? | Tout le domaine Paiements, auditabilite AML | Double-entree : non negociable pour une fintech. | Phase 2 |
| **DEC-I — Residence & souverainete des donnees** | Heberger PII/donnees financieres UEMOA sur AWS eu-west-1 = transfert hors zone. Region/souverainete acceptable ? DR multi-region ? | Conformite UEMOA/CENTIF, choix region cloud, DR, latence | Evaluer une region/arrangement conforme a la zone UEMOA ; sinon documenter la base legale du transfert. | **Bloquante pre-phase 0** |

---

## 9. Synthese des artefacts & relecture

*Les backlogs detailles (epics, taches, effort, **total p-j**, phase canonique unique, priorite, DoD, deps, risques) figurent dans les sections par domaine qui suivent ce chapeau, au gabarit de ligne unique. Ce document directeur, la matrice de dependances unique et le registre d'IDs/decisions doivent etre relus a chaque revue de fin de phase et mis a jour selon les decisions validees.*

---

## Journal du controle x5

Cette version 2 du chapeau integre les verdicts et lacunes du protocole de controle x5. Resume par lentille :

| Lentille | Verdict initial | Score | Integration dans la v2 |
|---|---|---|---|
| **C1 — Completude** | approved-with-changes | 7/10 | **Integre.** Nouveaux domaines metier ajoutes a la vision (section 2), a l'architecture (section 3) et au perimetre des sections de domaine (note 4.1) : portail emetteur/fondateur (`ownerId`, cap table, communication investisseurs), litiges/retro-facturations & **support client + console operateur + SLA**, **residence/souverainete des donnees (DEC-I)**, DR multi-region & RPO/RTO chiffres, **i18n/a11y mobile**, cycle de vie des campagnes (sous/sur-souscription, remboursement auto), reporting reglementaire & facturation/TVA des frais. |
| **C2 — Dependances & sequencement** | approved-with-changes | 7/10 | **Integre.** Creation de la **matrice de dependances unique (DAG)** comme source de verite et premier artefact de Phase 1 (section 4 ter), support obligatoire de C2. Verrou KYC minimal avance en **P1** (auto-validation/investissement-sans-KYC). Affectation de phase **canonique unique** pour ledger/idempotence/machine a etats (**Phase 2**). Consolidation du travail non commite posee en **prerequis dur AVANT purge** (section Phase 1). |
| **C3 — Securite & conformite** | approved-with-changes | 8/10 | **Integre.** **Rotation des secrets imposee AVANT purge** d'historique ; fermeture des **IDOR** (logout/refresh) ; **invalidation globale des sessions au changement de mdp** ; **reuse-detection/blacklist** des refresh tokens ; webhooks PSP **anti-rejeu (timestamp+nonce) + allowlist IP** ; **audit log WORM conforme CENTIF/UEMOA** (STR/SAR, horodatage inviolable). Refletes dans sections 1, 6, 7 et controle C3. |
| **C4 — Faisabilite & estimation** | needs-rework | 4/10 | **Integre (refonte la plus lourde).** Ajout de la **section 4 bis** : bareme effort→p-j, **chiffrage bottom-up ~250-400 p-j**, overhead verification +15-20 %, **deux scenarios de dimensionnement** (equipe 16-20 sem. vs solo 9-15 mois), **integration des delais externes** (PSP/licence/KYC/comptes), **reserve de contingence +20-30 %** et risques « tueurs de calendrier ». DEC-C/D/I rendues **bloquantes en pre-phase 0**. Calendrier desormais **derive** de la charge, plus postule. |
| **C5 — Coherence & criteres d'acceptation** | approved-with-changes | 7/10 | **Integre.** **Registre d'IDs unique** (`<PREFIXE>-<NN>`, `KYC--XX`→`KYC-XX`), **tache owner unique** par correctif transverse (table 4 ter), **registre de decisions unifie DEC-*** (suppression des refs locales), **contradiction de devise tranchee (XOF)**, **gabarit de ligne de backlog unique**, **seuil de couverture aligne (70 %)**. Refletes dans sections 4, 4 ter, 7, 8 et controle C5. |

**Conclusion du gating :** la lentille **C4 (faisabilite)**, seule en *needs-rework*, est traitee par la section 4 bis (chiffrage, scenarios, delais externes, buffer) et la pre-phase 0 de decisions bloquantes ; les lentilles *approved-with-changes* (C1, C2, C3, C5) ont vu leurs lacunes integrees comme indique ci-dessus. Aucune anomalie n'est laissee silencieusement : chaque lacune est soit corrigee dans ce chapeau, soit explicitement renvoyee aux sections de domaine et a la matrice de dependances unique pour traitement traçable.

---



# Détail par domaine


---

All claims confirmed: `...(user as any)` at line 177 spreads the full Prisma entity (including `passwordHash` and `twoFactorSecret`); `data: req.body` at line 198 is raw mass-assignment. All lacunes are valid and verified against the code. Here is the finalized v2 section.

---

## Securite & secrets

### Etat actuel (verifie sur le code)

**Score : 2/10** (inchange par rapport a l'audit du 9 fev. ; le delta est faible et certaines regressions de surface ont ete corrigees sans traiter le fond).

#### Ce qui fonctionne (briques saines mais sous-exploitees)
- `helmet()` est monte (`src/server.ts:30`) — mais en configuration par defaut, sans CSP ni HSTS adaptes a la prod.
- `bcrypt` est utilise pour le hash des mots de passe (`src/services/auth.service.ts:37`, cost factor **10**).
- 2FA TOTP fonctionnel cote generation/verification via `speakeasy` (`auth.service.ts:248-306`) — **mais casse par un desalignement de cles Redis** (cf. infra) : non operationnel de bout en bout.
- Rate limiting global applique (`apiLimiter` sur `/api/`, `src/server.ts:40`) : 100 req / 15 min.
- RBAC ecrit (`src/middleware/rbac.middleware.ts` : `requireRole`, `requireAdmin`, `requireOwnership`).
- Modeles BDD de securite presents : `LoginAttempt`, `RefreshToken`, `User.twoFactorSecret/twoFactorEnabled/isActive` (`prisma/schema.prisma:44-117`).
- `.gitignore` ignore desormais `.env` et `.env.*` sauf `.env.example` (`.gitignore`).
- Le deployment K8s lit ses secrets via `secretKeyRef`/`afristocks-secrets` (`k8s/backend-deployment.yaml:24-60`) au lieu de valeurs en clair — **delta positif** vs audit.

#### Ce qui est casse ou absent (constats verifies sur disque)

**Secrets exposes / historique non purge (le point le plus grave) :**
- `.env.production` est **toujours suivi par git** (`git ls-files --error-unmatch .env.production` => trouve) et contient des secrets reels : mot de passe DB `Bonesoire001` (`.env.production:9`), secrets JWT factices mais reels (`votre_secret_jwt...`, lignes 17-18), placeholders AWS/Orange/MTN/Wave/SMTP. Le `.gitignore` ne « detrack » pas un fichier deja commite.
- `Mots de passes et ID.txt` est **toujours suivi par git** a la racine (`git ls-files` => trouve). Les copies `backend/Mots de passes et ID.txt` et `backend/.env.production` apparaissent en `D` (supprimees du disque) mais **la suppression n'est meme pas commitee**.
- Le fichier mot de passe et les `.env` sont presents dans **tout l'historique** (`git log --all --name-only` les liste). Aucune purge BFG/git-filter-repo n'a ete faite.
- AWS Account ID `771237845610` en clair dans `k8s/backend-deployment.yaml:18`, `K8s:/backend-deployment.yaml:18` (dossier mal nomme, doublon), `production-values.yaml:6`.
- **5 remotes** (`origin` GitHub + `backend` GitHub + `gitlab` + `gitlab_backend` + `gitlab_frontend`) : les secrets de l'historique ont potentiellement ete pousses sur 5 depots distincts => surface de fuite x5, purge a coordonner partout. **Tout secret ayant transite par ces remotes doit etre considere comme exfiltre, donc compromis.**

**Authentification / autorisation cassee :**
- **Broken access control critique** : `src/routes/admin.routes.ts:8` n'applique que `authenticateToken`, **jamais `requireAdmin`**. N'importe quel utilisateur authentifie (role `USER`) peut lister tous les users, modifier les roles/KYC (`PUT /users/:id`, `POST /users/:id/kyc`), desactiver des comptes, exporter tous les investissements. `requireRole`/`requireAdmin` sont **definis mais utilises nulle part** (verifie par grep).
- **Fuite directe de hash + secrets TOTP de toute la base** : `GET /api/admin/users/:id/details` (`admin.routes.ts:158-189`) repond avec `...(user as any)` (`admin.routes.ts:177`), qui spread l'entite Prisma brute **incluant `passwordHash` ET `twoFactorSecret`**. Combine a l'absence de `requireAdmin`, ce endpoint est aujourd'hui atteignable par **tout compte `USER`** => exfiltration immediate des hashs de mots de passe et des secrets 2FA de tous les utilisateurs. (Verifie sur disque.)
- **Mass assignment** : `PUT /api/admin/users/:id` (`admin.routes.ts:194-204`, `data: req.body` brut, ligne 198) et `PUT /startups/:id` passent `req.body` brut a `prisma.update` => un appelant peut ecrire n'importe quel champ (dont `role`, `kycStatus`, `isActive`).
- **IDOR / DoS de session sur `/auth/logout` et `/auth/refresh-token`** : `POST /auth/logout` (`auth.routes.ts:44-58`) prend `userId` ET `refreshToken` depuis le **body**, sans `authenticateToken`. `AuthService.logout` (`auth.service.ts:163-173`) effectue un `prisma.refreshToken.deleteMany` filtre par ce `userId` => **un attaquant peut revoquer/forcer la deconnexion des sessions d'autrui** (`logout(userId_victime, ...)`). `POST /auth/refresh-token` (`auth.routes.ts:61-75`) n'est lie a aucun utilisateur appelant. (Verifie sur disque.)
- **2FA non protegee et non liee a l'utilisateur** : `POST /auth/2fa/generate` et `/2fa/verify` (`auth.routes.ts:78-109`) prennent `userId` **dans le body** (commentaires « Temporaire, sera remplace par req.user »), sans `authenticateToken`. N'importe qui peut (re)generer/verifier le 2FA de n'importe quel compte.
- **2FA cassee par un desalignement de cles Redis** : la generation ecrit le secret sous `2fa_temp:${userId}` (`auth.service.ts:256`) alors que la verification lit `2fa_secret:${userId}` (`auth.service.ts:277`). Tant que ce bug subsiste, l'activation 2FA reelle echoue silencieusement — ce qui sapera toute application du 2FA au login et donnera une **fausse assurance** de protection. (Verifie sur disque ; suivi cote backend BACK-03.)
- **2FA jamais appliquee au login** : `AuthService.login` (`auth.service.ts:104-161`) ne verifie jamais `twoFactorEnabled` ni un code TOTP. Le 2FA est purement decoratif.
- **Brute-force non protege** : `authLimiter` et `createAccountLimiter` sont definis (`rateLimit.middleware.ts`) mais **jamais appliques** aux routes `/auth/*` (qui n'ont aucun limiteur dedie). Le modele `LoginAttempt` n'est **ecrit nulle part** (grep : 0 occurrence dans `src/`). `login()` ne verifie pas `isActive` (comptes desactives peuvent se connecter).
- **Pas de validation d'entree sur l'auth** : `auth.routes.ts` n'utilise ni `validateRequest` ni `auth.validator.ts` (le validateur existe, 58 lignes, mais n'est cable que sur `investment.routes.ts`). `register` accepte `role` depuis le body (`auth.service.ts:25`) => **un utilisateur peut s'auto-attribuer le role STARTUP/ADMIN a l'inscription**.
- **Aucun flux de changement / reinitialisation de mot de passe** : seul `generateResetToken` (`src/utils/jwt.ts:56`) existe, mais c'est du code **mort** (jamais importe) ; aucun endpoint `change-password`/`reset-password`/`currentPassword` n'existe (grep : seul un template d'email `resetPassword` dans `src/utils/email.ts:65`). Pour une fintech, l'absence de flux de reset (token a usage unique, hashe, expirant, rate-limite) et l'absence d'invalidation de session a la rotation du mot de passe sont des manques de conformite et un vecteur de persistance d'attaquant.

**Gestion des tokens defectueuse :**
- **Duplication conflictuelle** `src/utils/jwt.ts` vs `src/utils/token.utils.ts` : signatures incompatibles de `generateTokens` (`jwt.ts` prend un payload, `token.utils.ts` prend un `User`). Le service auth et le middleware importent `token.utils`, mais `jwt.ts` reste (et contient `generateResetToken` mort).
- **Meme secret pour access et refresh** : `token.utils.ts:16-26` signe l'access ET le refresh avec `process.env.JWT_SECRET!` (le `JWT_REFRESH_SECRET` n'est utilise que par `jwt.ts`, mort). La separation ne repose que sur un champ `type` dans le payload (`token.utils.ts:17,23`) : une fuite/confusion du secret unique reduit la robustesse.
- **Aucune validation stricte du JWT** : `verifyAccessToken`/`verifyRefreshToken` (`token.utils.ts:31-53`) verifient sans `audience`, sans `issuer`, **sans epinglage d'algorithme** (`algorithms:['HS256']`), et sans `jti`. Expose a des confusions de tokens et reduit la tracabilite/revocabilite.
- **Refresh tokens stockes en clair** : le JWT brut est stocke tel quel en DB (`RefreshToken.token`, `auth.service.ts:85-88,137-147,234-237`) et dans Redis (`session:...`, lignes 76, 128, 218), aucun hash. Une fuite DB/Redis = comptes detournes.
- **Pas de revocation effective des access tokens** : aucune blacklist/denylist (grep : 0), pas de `jti`. Un access token vole reste rejouable jusqu'a expiration **meme apres logout**, changement de mot de passe ou detection de reuse. `logout` ne supprime que le refresh.

**Chiffrement au repos absent :**
- `ENCRYPTION_KEY` est declare (`.env`, `.env.production:19`) mais **utilise nulle part** (grep : 0). Le secret TOTP `twoFactorSecret` est stocke **en clair** en DB (`auth.service.ts:263`).

**Transport / CORS / Socket.io / Redis :**
- `app.use(cors())` **totalement ouvert** (`server.ts:31`, commentaire « Accepte toutes les origines temporairement »), credentials inclus implicitement cote socket.
- **Socket.io sans authentification** (`server.ts:64-76`) : n'importe qui peut `join('user:<id>')` et recevoir les notifications d'autrui.
- **Redis sans auth en local et fallback silencieux** : `config/redis.ts` lit `REDIS_PASSWORD` mais bascule sur un `mockRedis` no-op en cas d'erreur => sessions/2FA cache/rate-limit silencieusement neutralises sans alerte, et `docker-compose.yml` lance Redis sans mot de passe.
- **helmet par defaut** : pas de `Strict-Transport-Security`, pas de CSP, pas de `frameguard`/`referrerPolicy` ajustes.
- Pas de cookie `httpOnly`/`secure`/`SameSite` : le frontend stocke le JWT dans `localStorage` (`frontend/src/app/page.tsx:232,328`, `AfriStocksApp.tsx`, plusieurs composants admin) => expose au XSS. `AuthContext.tsx:61,79` pose meme un `'mock-token'` en dur.

**Secrets infra / images :**
- `docker-compose.yml` : creds Postgres en dur (`afristocks/afristocks`), Redis sans password.
- Aucun scan d'image (Trivy/Grype), aucun gestionnaire de secrets (Secrets Manager/Doppler), aucune rotation.

#### Delta reel depuis l'audit du 9 fev.
| Sujet | Audit 9 fev. | Etat verifie aujourd'hui |
|---|---|---|
| `.env.production` sur disque & git | present | **toujours present et toujours tracke** |
| `Mots de passes et ID.txt` historique | non purge | **toujours tracke a la racine + present dans tout l'historique** |
| AWS Account ID dans K8s | expose | **toujours expose** (`k8s/`, `K8s:/`, `production-values.yaml`) |
| CORS | ouvert | **toujours `cors()` ouvert** |
| Secrets K8s en clair | en clair | **corrige** : `secretKeyRef` (delta +) |
| `.gitignore` | absent/incomplet | **corrige** : ignore `.env*` (delta +, mais sans effet retroactif) |
| Auth client | mock | **toujours mock** (`mock-token` dans `AuthContext`) |

---

### Backlog (epics et taches)

Effort : S (<0,5j), M (0,5-2j), L (2-5j), XL (>5j). Phase 1-4 = feuille de route. Priorite P0 (bloquant prod / faille active) > P1 > P2.

> **Note de sequencement (suite a revue) :** la validation des secrets au boot a ete **decoupee** en `SECU-07a` (minimale, Phase 1, prerequis des durcissements tokens/CORS de Phase 1) et `SECU-07b` (schema complet, Phase 2). Les corrections exploitables aujourd'hui (fuite PII admin `SECU-31`, auth Socket.io `SECU-25`) ont ete **avancees en Phase 1**.

#### EPIC A — Confinement immediat & purge des secrets
*Objectif : stopper l'hemorragie. Considerer tous les secrets historiques comme compromis, les revoquer, et nettoyer depots + historique.*

| ID | Titre | Description | Fichiers / chemins | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| SECU-01 | Inventaire & revocation de TOUS les secrets compromis | Lister chaque secret apparu dans git/disk (DB `Bonesoire001`, JWT, AWS, SMTP, providers paiement) et le revoquer/regenerer cote fournisseur. **Un seul proprietaire de l'inventaire** (coordonne avec INFR-02/REPO-04). | `.env.production`, `Mots de passes et ID.txt`, `k8s/*`, `production-values.yaml` | Tableau d'inventaire complet ; chaque secret marque « revoque + remplace » ; **pour chaque secret, ancienne valeur testee comme INVALIDE cote fournisseur (tentative d'auth qui echoue, documentee)** ; aucun ancien secret encore valide. | — | M | 1 | **P0** | Coupure de service si un secret encore utilise est revoque sans remplacement coordonne. |
| SECU-02 | Detracker les fichiers sensibles du HEAD | `git rm --cached .env.production "Mots de passes et ID.txt"` (+ copies `backend/`), committer la suppression. | racine, `backend/` | `git ls-files` ne renvoie plus aucun `.env*` (hors `.env.example`) ni fichier mot de passe ; commit pousse. | SECU-01 | S | 1 | **P0** | Aucun (fichiers deja sur disque local conserves hors git). |
| SECU-03 | Purge complete de l'historique git | `git filter-repo` (ou BFG) pour supprimer `*.env.production`, `Mots de passes et ID.txt`, tout `.env` non-example sur **toutes** les branches/tags. | tout le repo + 5 remotes | **Pre-requis bloquant : SECU-01 100% terminee ET verifiee (chaque ancien secret prouve invalide) ; un miroir `git clone --mirror` realise AVANT toute reecriture.** Les chemins n'apparaissent plus dans `git log --all` ; force-push coordonne sur `origin`, `backend`, `gitlab`, `gitlab_backend`, `gitlab_frontend` ; equipe re-clone. | **SECU-01 (terminee+verifiee)**, SECU-02 | L | 1 | **P0** | Reecriture d'historique casse les clones/forks ; **purger sans avoir fini la revocation cree une fausse impression de remediation** (la purge ne decompromet rien). |
| SECU-04 | Rationaliser les remotes & verrouiller les depots | Reduire a 1 remote canonique, supprimer les 4 autres apres purge, activer secret-scanning (GitHub push protection / GitLab secret detection) et protection de branche. | config git, settings GitHub/GitLab | 1 seul remote actif ; push protection activee ; tentative de push d'un faux secret bloquee (test). | SECU-03, DEC-6 | M | 1 | P1 | Perte d'acces si un remote encore utilise par un membre. |
| SECU-05 | Retirer l'AWS Account ID des manifests | Externaliser le registry/compte via variable Helm/CI ; supprimer le dossier doublon mal nomme `K8s:/`. | `k8s/backend-deployment.yaml`, `K8s:/`, `production-values.yaml`, `charts/afristocks/values.yaml` | Aucune occurrence de `771237845610` (grep) ; dossier `K8s:/` supprime ; deploiement Helm fonctionne avec param injecte. | SECU-01 | M | 1 | P1 | Mauvais ARN injecte = pull image echoue. |

#### EPIC B — Gestion centralisee des secrets & config
*Objectif : plus jamais de secret en clair dans le repo ; injection a l'execution + rotation.*

| ID | Titre | Description | Fichiers | DoD | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| SECU-06 | Choisir et integrer un gestionnaire de secrets | AWS Secrets Manager (region eu-west-1 deja cible) ou Doppler ; injection via env au boot. | `src/config/*`, manifests K8s, CI | Tous les secrets prod proviennent du gestionnaire ; aucun secret dans `values.yaml`/`docker-compose`; doc d'acces. | SECU-01, decision DEC-1 | L | 2 | P0 | Mauvaise IAM policy = exposition ou indispo. |
| SECU-07a | Validation MINIMALE des secrets critiques au boot | Le serveur refuse de booter si `JWT_SECRET`/`JWT_REFRESH_SECRET`/`DATABASE_URL` manquants **ou egaux aux valeurs par defaut connues** (`your-secret-key-change-this`, `votre_secret_jwt...`). Profil dev tolerant prevu. **Prerequis de SECU-08, SECU-19, SECU-23.** | `src/server.ts`, nouveau `src/config/env.ts`, `src/utils/token.utils.ts` | Boot echoue avec message clair si secret par defaut/absent ; test unitaire couvre chaque secret critique manquant/par defaut. | — | M | 1 | **P0** | Faux positifs bloquant le dev local (profil dev). |
| SECU-07b | Schema complet de validation d'env (zod/envalid) | Etendre `env.ts` a **toutes** les variables (`ENCRYPTION_KEY`, `REDIS_PASSWORD`, providers, SMTP, URLs), typage, profils dev/prod distincts. | `src/config/env.ts`, `src/server.ts` | Schema couvrant toutes les variables documentees ; boot prod exige `ENCRYPTION_KEY`/`REDIS_PASSWORD` ; tests des cas manquants. | SECU-06, SECU-07a | M | 2 | P0 | Faux positifs ; coordonner avec profil dev. |
| SECU-08 | Supprimer les secrets par defaut hardcodes | Retirer les fallbacks `'your-secret-key-change-this'`/`'your-refresh-secret...'` et tout `JWT_SECRET!` non valide. | `src/utils/jwt.ts:16-17`, `token.utils.ts` | Aucun fallback de secret dans le code (grep) ; lecture stricte via `env.ts`. | SECU-07a | S | 1 | **P0** | Casse au boot si SECU-07a pas en place. |
| SECU-09 | Politique de rotation des secrets | Procedure documentee + automatisation (rotation JWT avec periode de grace bi-cles, rotation DB/Redis). | doc, `src/config/env.ts` | Runbook de rotation ; rotation JWT supporte 2 secrets actifs (verif des deux en lecture) sans deconnecter les users. | SECU-06 | M | 4 | P1 | Rotation JWT mal geree = invalidation massive des sessions. |

#### EPIC C — Durcissement authentification & autorisation
*Objectif : auth robuste, RBAC effectif, 2FA reellement appliquee, flux mot de passe complet.*

| ID | Titre | Description | Fichiers | DoD | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| SECU-10 | Appliquer `requireAdmin` a toutes les routes admin | Ajouter `requireRole('ADMIN')` apres `authenticateToken`. | `src/routes/admin.routes.ts:8` | Test : un token `USER` recoit 403 sur tout `/api/admin/*` ; un `ADMIN` passe. | — | S | 1 | **P0** | Verrouiller hors un vrai compte admin en cas d'erreur de seed. |
| SECU-11 | Corriger mass-assignment sur PUT admin | Whitelister explicitement les champs modifiables (jamais `role`/`kycStatus`/`isActive` via update generique sans controle dedie) ; remplacer `data: req.body`. | `admin.routes.ts:194-204, 312-322` | Test : envoyer `{role:'ADMIN'}` sur un endpoint non prevu n'a aucun effet ; seuls les champs whitelistes changent. | SECU-10 | M | 1 | **P0** | Oublier un champ legitime (regression fonctionnelle). |
| SECU-12 | Empecher l'auto-attribution de role a l'inscription | Forcer `role='USER'` dans `register`, ignorer le `role` du body. | `src/services/auth.service.ts:25`, `auth.validator.ts` | Test : `register` avec `role:'ADMIN'` cree un `USER` ; promotion uniquement via endpoint admin protege. | SECU-10 | S | 1 | **P0** | — |
| SECU-13 | Securiser les endpoints 2FA | Exiger `authenticateToken` ; deriver `userId` de `req.user`, jamais du body. | `src/routes/auth.routes.ts:78-109` | Test : appel sans token => 401 ; `userId` du body ignore. | SECU-18 | S | 1 | **P0** | — |
| SECU-13b | Lier toutes les operations de session a l'utilisateur appelant (corriger IDOR `/logout` & `/refresh-token`) | Appliquer `authenticateToken` a `/logout` ; deriver `userId` de `req.user` (jamais du body) dans `AuthService.logout` ; pour `/refresh-token`, verifier que le refresh appartient bien au sujet authentifie/au refresh presente. | `auth.routes.ts:44-75`, `auth.service.ts:163-173,176-246` | Test negatif : `logout` d'autrui (`userId` victime) => 401/403, aucune session tierce supprimee ; `refresh-token` rejette un refresh n'appartenant pas a l'appelant. | SECU-18 | M | 1 | **P0** | — |
| SECU-14 | Appliquer 2FA au login | Si `twoFactorEnabled`, exiger un code TOTP valide (flux en 2 etapes ou challenge token). **Prerequis : 2FA reellement fonctionnelle de bout en bout** (correction du desalignement de cles Redis `2fa_temp` vs `2fa_secret`, BACK-03) **et** chiffrement du secret (SECU-29). | `auth.service.ts:104-161,256,277`, `auth.routes.ts` | Test bout-en-bout : generation -> activation -> login challenge -> verification d'un VRAI TOTP ; login d'un user 2FA sans code => challenge ; mauvais code => echec ; bon code => tokens. | SECU-13, BACK-03, SECU-29, DEC-5 | M | 2 | P1 | UX login a refondre cote client. |
| SECU-15 | Cabler validation + rate limit sur `/auth/*` | `validateRequest` + `auth.validator.ts` + `authLimiter` (login) + `createAccountLimiter` (register). | `auth.routes.ts`, `rateLimit.middleware.ts`, `auth.validator.ts` | Test : 6e login en 15 min => 429 ; payload invalide => 400 structure ; 4e compte/h/IP => 429. | — | M | 1 | **P0** | Limiteur trop strict bloque tests/QA. |
| SECU-16 | Brute-force : alimenter `LoginAttempt` + protection anti-DoS & anti-enumeration | Logger chaque tentative (ip/ua/success) ; verifier `isActive` au login ; **limiter par IP/empreinte ET par compte** ; **backoff progressif** plutot que verrouillage dur ; deverrouillage temporise + voie admin ; **reponses de login uniformes** (meme message pour « email inconnu » et « mot de passe faux ») ; CAPTCHA/PoW au-dela d'un seuil. | `auth.service.ts:104-161`, `prisma/schema.prisma:89-103` | Test : 5 echecs => backoff/verrouillage temporise ; tentative sur compte `isActive=false` => refus ; lignes `LoginAttempt` ecrites ; **enumeration impossible (reponse identique)** ; **DoS par lockout attenue (limitation IP + deverrouillage)**. | SECU-15 | M | 2 | P1 | Verrouillage par compte = vecteur de DoS (attenue par backoff + limite IP). |
| SECU-17 | Augmenter le cost bcrypt / passer a argon2id | Cost bcrypt >= 12 ou migration argon2id ; re-hash transparent au prochain login. | `auth.service.ts:37,117` | Nouveaux hash au cost cible ; benchmark < seuil latence ; re-hash a la connexion verifie. | DEC-4 | M | 2 | P2 | Cout CPU au login (dimensionner). |
| SECU-17b | Flux mot de passe : reset & change | (1) `forgot/reset-password` avec token a **usage unique, hashe, expirant, rate-limite** ; (2) `change-password` exigeant le **mot de passe courant** + **2FA si activee** ; (3) sur tout changement de mot de passe => **revocation de TOUTES les sessions/refresh** + ajout des access concernes a la denylist (SECU-21b). Supprimer/cabler le `generateResetToken` mort (`jwt.ts:56`). | nouveau controleur auth, `auth.service.ts`, `src/utils/email.ts:65`, `jwt.ts:56` | Tests : token reset a usage unique non rejouable + expire ; `change-password` sans mot de passe courant => 403 ; apres changement, anciens refresh/access invalides. Tests negatifs inclus. | SECU-15, SECU-21b | L | 2 | P1 | Mauvaise gestion de l'expiration/usage unique = contournement. |

#### EPIC D — Tokens & sessions
*Objectif : separation des secrets, refresh tokens non rejouables, revocation effective access + refresh, validation stricte du JWT.*

| ID | Titre | Description | Fichiers | DoD | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| SECU-18 | Unifier la gestion JWT (supprimer la duplication) | Garder un seul module ; supprimer `jwt.ts` (apres avoir reloge `generateResetToken` dans le flux SECU-17b) ; un seul `generateTokens`. | `src/utils/jwt.ts`, `src/utils/token.utils.ts`, importeurs | Un seul module token (grep) ; build TS OK ; tous les imports a jour. | — | S | 1 | **P0** | Casser un import oublie. |
| SECU-18b | Validation stricte du JWT (alg pinning, iss/aud, claims typés) | Signer/verifier avec `issuer` + `audience` ; **epingler `algorithms:['HS256']`** a la verification ; ajouter `jti` et `typ` (access/refresh) verifies. | module token unifie (`token.utils.ts:16-53`) | Test : token sans `aud`/`iss` attendus, ou avec `alg` different, ou sans `jti` => rejete. | SECU-18 | S | 1 | P1 | Invalide les tokens existants sans claims (cutover, cf DEC-7). |
| SECU-19 | Secrets distincts access/refresh | Signer le refresh avec `JWT_REFRESH_SECRET` (et plus `JWT_SECRET`). | module token unifie (`token.utils.ts:16-26`) | Test : un access token presente comme refresh est rejete ; refresh signe avec secret dedie. | SECU-18, **SECU-07a** | S | 1 | **P0** | Invalide les refresh existants (acceptable au cutover, cf DEC-7). |
| SECU-20 | Hasher les refresh tokens au repos | Stocker un hash (SHA-256/HMAC) du refresh en DB/Redis, comparer au lieu d'egalite brute. | `auth.service.ts:75-150,176-246`, `prisma/schema.prisma:106-117` | Aucun JWT brut en DB/Redis ; refresh valide via hash ; test fuite simulee inexploitable. | SECU-18 | M | 2 | P1 | Migration des tokens existants (forcer re-login). |
| SECU-21 | Rotation + reuse-detection des refresh | Rotation a chaque refresh + detection de reutilisation d'un refresh deja consomme => revoquer toute la famille. | `auth.service.ts:176-246` | Test : rejouer un ancien refresh apres rotation => toutes les sessions du user revoquees. | SECU-20 | M | 2 | P1 | Faux positifs deconnectant des users legitimes. |
| SECU-21b | Denylist des access tokens revoques | Introduire un claim `jti` (via SECU-18b) + une **denylist Redis** des access revoques (a la deconnexion, au changement de mot de passe, a la detection de reuse), TTL = duree de vie access. **Reduire la TTL access a <= 15 min** (deja a 15m, a confirmer/figer). | `auth.service.ts`, middleware `authenticateToken`, `token.utils.ts` | Test : un access token revoque (logout/reset/reuse) est refuse avant expiration ; entree denylist expire avec le token. | SECU-18b, SECU-21 | M | 2 | P1 | Charge Redis ; indispo Redis = fail-open si mal gere (cf SECU-26). |
| SECU-22 | Migrer le stockage du token client vers cookie httpOnly | Refresh en cookie `httpOnly`+`Secure`+`SameSite=Strict`; supprimer le JWT de `localStorage` et le `mock-token`. | `frontend/src/contexts/AuthContext.tsx:61,79`, `frontend/src/app/page.tsx:232,328`, `AfriStocksApp.tsx`, composants admin | `localStorage` ne contient plus de token ; refresh en cookie httpOnly ; `mock-token` supprime. | SECU-23, SECU-24, domaine Frontend, DEC-3 | L | 2 | P1 | Necessite CORS/credentials + CSRF (SECU-24). |

#### EPIC E — Transport, CORS, Socket.io, Redis, en-tetes
*Objectif : fermer les surfaces reseau ouvertes.*

| ID | Titre | Description | Fichiers | DoD | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| SECU-23 | Restreindre CORS par origine (allowlist) | Remplacer `cors()` par une allowlist (`FRONTEND_URL`/`APP_URL` + origines connues), `credentials:true`. | `src/server.ts:31` | Test : origine non listee => bloquee ; origine valide avec credentials => OK. | **SECU-07a** | S | 1 | **P0** | Oubli d'une origine legitime (mobile/web/admin). |
| SECU-24 | Protection CSRF (si cookies) | Token CSRF (double-submit/synchronizer) sur mutations si l'auth passe par cookie. | `src/server.ts`, middleware nouveau | Test : POST sans token CSRF => 403 ; avec token => OK. | SECU-22, DEC-3 | M | 2 | P1 | Inutile/contre-productif si on reste full bearer header (cf DEC-3). |
| SECU-25 | Authentifier Socket.io par token | Verifier le JWT dans `io.use(...)` ; n'autoriser `join` que sur sa propre room (`user:<self>`). **Tant que non livre, geler le temps reel (REAL-*) : ne pas exposer de notifications via Socket.io.** | `src/server.ts:64-76` | Test : connexion sans token valide refusee ; impossible de rejoindre la room d'un autre user. | SECU-18 | M | 1 | **P0** | Casse les clients qui se connectent sans token. |
| SECU-26 | Activer l'auth Redis + supprimer le fallback silencieux | `REDIS_PASSWORD` obligatoire en prod ; en cas d'indispo Redis en prod, **echouer bruyamment (log+alerte)** au lieu du `mockRedis`. Definir une degradation maitrisee (ne JAMAIS fail-open sur rate-limit / denylist / sessions). | `src/config/redis.ts`, `docker-compose.yml` | Redis exige un password en prod ; perte de Redis => erreur visible/alerte, pas de neutralisation silencieuse des sessions/rate-limit/denylist. | SECU-06, SECU-21b | M | 2 | P1 | Indispo Redis = indispo service si trop strict (degradation maitrisee). |
| SECU-27 | Durcir helmet (CSP, HSTS, etc.) | Configurer `contentSecurityPolicy`, `hsts` (prod), `referrerPolicy`, `crossOriginResourcePolicy`. | `src/server.ts:30` | En-tetes verifies (HSTS, CSP) sur reponse prod ; pas de regression front (CSP report-only d'abord). | — | M | 2 | P1 | CSP trop stricte casse le front (deployer en report-only). |
| SECU-28 | Forcer HTTPS / TLS de bout en bout | Verifier ingress TLS (`afristocks-tls`), redirect HTTP->HTTPS, `Secure` cookies, domaine unique. | `ingress.yaml`, `production-values.yaml`, `clusterissuer.yaml` | TLS valide en prod ; HTTP redirige ; domaine coherent (cf DEC-2). | infra, DEC-2 | M | 2 | P1 | Mismatch domaine cert (afristocks.eu vs .com). |

#### EPIC F — Chiffrement au repos & donnees sensibles
*Objectif : utiliser `ENCRYPTION_KEY`, proteger secret TOTP et donnees KYC, ne jamais exposer de PII brute.*

| ID | Titre | Description | Fichiers | DoD | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| SECU-29 | Chiffrer le secret 2FA en DB | AES-256-GCM via `ENCRYPTION_KEY` ; chiffrer a l'ecriture, dechiffrer a la verification. **Prerequis de SECU-14** (chiffrer la valeur reellement stockee, en plus de corriger le mapping de cle BACK-03). | `auth.service.ts:248-306`, `prisma/schema.prisma:54`, nouveau `src/utils/crypto.ts` | Test : `twoFactorSecret` illisible en base ; verif TOTP fonctionne ; cle absente => boot bloque (SECU-07b). | SECU-07b | M | 2 | P1 | Perte de la cle = 2FA irrecuperable (prevoir backup cle). |
| SECU-30 | Chiffrement au repos DB & S3 | Activer le chiffrement RDS/volumes et S3 SSE pour les documents KYC futurs. | infra K8s/AWS | Chiffrement active (preuve console/IaC) ; documents KYC en S3 chiffres. | domaine Infra, feature KYC | M | 3 | P2 | Cout/operationnel (KMS). |
| SECU-31 | Minimisation des reponses API (PII) — fuite `passwordHash`/`twoFactorSecret` ACTIVE | `GET /admin/users/:id/details` (`admin.routes.ts:158-189`) fait `...(user as any)` (`:177`) et renvoie l'entite Prisma brute (`passwordHash` ET `twoFactorSecret`) ; **atteignable par tout `USER` faute de `requireAdmin`** => exfiltration immediate des hashs et secrets TOTP de toute la base. Remplacer tous les spreads d'entite par des **DTO de sortie explicites**. **A faire dans le meme lot que SECU-10.** | `admin.routes.ts:158-189,177`, autres controleurs | Aucune reponse n'expose `passwordHash`/`twoFactorSecret` (test) ; DTO de sortie explicite ; **regle de test/CI echouant si une reponse contient `passwordHash`/`twoFactorSecret`**. | SECU-10 | M | 1 | **P0** | Oubli d'un champ utile au front. |

#### EPIC G — Supply chain, scan & gouvernance
*Objectif : detecter les vulnerabilites et empecher la reintroduction de secrets.*

| ID | Titre | Description | Fichiers | DoD | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| SECU-32 | Scan d'images conteneur (Trivy) | Trivy dans la CI sur l'image backend ; fail si CVE Critical/High. | CI, `Dockerfile` | Pipeline bloque si CVE Critical ; rapport archive. | domaine Infra (CI) | M | 3 | P1 | Faux positifs bloquant les releases (politique d'exception). |
| SECU-33 | Audit des dependances (npm audit / SCA) | `npm audit`/Dependabot/Snyk en CI. | CI, `package.json` | CI signale les vulnerabilites ; politique de seuil definie. | domaine Infra | S | 3 | P2 | Bruit d'alertes. |
| SECU-34 | Secret scanning pre-commit & CI | `gitleaks`/`trufflehog` en hook pre-commit + CI. | `.pre-commit`, CI | Commit contenant un secret bloque (test) ; CI echoue sur secret detecte. | SECU-03 | S | 1 | P1 | Faux positifs (allowlist). |
| SECU-35 | Dockerfile prod durci (non-root) | Image multi-stage, user non-root, pas de devDeps, `.dockerignore` verifie (`.env*` exclus). | `Dockerfile`, `.dockerignore` | Conteneur tourne en non-root ; aucun `.env` dans l'image (inspect) ; image prod (pas `npm run dev`). | domaine Infra | M | 3 | P1 | Permissions fichiers au runtime. |
| SECU-36 | Logging securise & masquage | Centraliser le logging ; masquer secrets/tokens/PII ; le handler d'erreur (`server.ts:54-62`) ne doit pas fuiter de stack en prod (deja conditionne — a verifier). | `src/server.ts:54-62`, logger | Aucun token/mot de passe/PII dans les logs (revue) ; stack masquee en prod. | — | M | 3 | P2 | Sur-masquage genant le debug. |
| SECU-37 | Test de penetration / revue avant MVP prod | Pentest cible (authz, IDOR, 2FA, paiements) avant ouverture publique. | global | Rapport pentest ; findings critiques/high corriges. | EPICs C-F | L | 4 | P1 | Decouverte tardive de failles structurelles. |

---

### Risques specifiques au domaine
- **Compromission deja effective et multipliee** : les secrets reels (DB `Bonesoire001`, AWS account, JWT) sont dans l'historique de **5 remotes**. Tant que SECU-01/03 ne sont pas faits, on doit considerer la base de donnees et le compte AWS comme potentiellement accessibles a un tiers. **La purge (SECU-03) ne decompromet rien : elle doit etre strictement bloquee par une revocation 100% verifiee (SECU-01) et precedee d'un miroir.**
- **Escalade de privileges + exfiltration immediates** : SECU-10/11/12 ET SECU-31 sont exploitables aujourd'hui par tout compte cree librement (register ouvert). Un attaquant s'inscrit, atteint `/api/admin/*`, modifie roles/KYC/soldes (SECU-10/11) et **aspire `passwordHash`/`twoFactorSecret` de toute la base via `GET /users/:id/details`** (SECU-31). C'est la faille la plus urgente apres les secrets — d'ou son passage en **P0 Phase 1**.
- **IDOR de session** : `/auth/logout` permet aujourd'hui de **deconnecter n'importe quel utilisateur** (DoS cible) — corrige par SECU-13b (P0).
- **2FA en trompe-l'oeil** : le desalignement de cles Redis (`2fa_temp` vs `2fa_secret`) rend le 2FA non operationnel ; appliquer SECU-14 sans corriger BACK-03 + SECU-29 donnerait une fausse assurance de protection.
- **Persistance d'attaquant via tokens** : sans denylist access (SECU-21b) ni flux de changement/reset de mot de passe avec invalidation (SECU-17b), un access token vole reste valide jusqu'a expiration meme apres « securisation » du compte.
- **Plateforme financiere = surface reglementaire** : KYC/AML, traçabilite des transactions, exigences PSD2-like des providers (Orange/MTN/Wave) imposeront chiffrement, journalisation inalterable et 2FA effective. Les manques actuels sont disqualifiants pour une mise en prod.
- **Reecriture d'historique** (SECU-03) cassera les clones/forks et toute PR ouverte : risque organisationnel, a planifier avec l'equipe (et a coordonner avec DEC-6).
- **Fallback Redis silencieux** : neutralise sessions, cache 2FA, rate-limit ET denylist access sans alerte — une panne Redis peut transformer un durcissement (SECU-15/16/21b) en passoire (fail-open) sans que personne ne le voie. SECU-26 doit garantir un fail-closed maitrise.

### Decisions a valider par le porteur du projet
- **DEC-1 — Gestionnaire de secrets** : AWS Secrets Manager (coherent avec ECR/S3 eu-west-1) vs Doppler (plus simple multi-env) vs Vault. Impacte SECU-06/07a/07b/09.
- **DEC-2 — Domaine canonique** : `afristocks.eu` ou `afristocks.com` ? Incoherence entre manifests ; bloque TLS/CORS/cookies (SECU-23/28).
- **DEC-3 — Modele de session client** : cookies `httpOnly` (necessite CSRF, SECU-24) vs bearer en memoire (pas de localStorage, refresh silencieux). Impacte SECU-22/24 et le Frontend/Mobile.
- **DEC-4 — Hashing** : conserver bcrypt (cost >=12) ou migrer argon2id (recommande finance) ? Impacte SECU-17 et la latence login.
- **DEC-5 — Politique 2FA** : optionnelle, obligatoire pour ADMIN/STARTUP, ou obligatoire avant tout retrait/investissement ? Impacte SECU-14.
- **DEC-6 — Mono-repo vs multi-repo** : clarifier la structure (origine des 5 remotes) avant la purge SECU-03/04, sinon la purge devra etre rejouee sur chaque depot.
- **DEC-7 — Strategie de coupure** : faut-il invalider toutes les sessions/refresh existants au moment du durcissement tokens (SECU-18b/19/20) ? **Recommande oui (re-login force), couple a la denylist access SECU-21b pour une invalidation globale propre.**

---

Confirmed: no campaign status enum (Startup only has `isActive` boolean), no DRAFT/FUNDED/FAILED states, no cron/job scheduler, no refund flow, no `completeWithdrawal`/`cancelWithdrawal`, no idempotency. The `invest` service blocks on `endDate` window but has no closure logic and no over-subscription guard against `valuationTarget`. All three lacunes are valid. Here is the finalized v2 section.

## Backend API (Express/Prisma)

### Etat actuel (verifie sur le code)

**Score : 5/10** (en hausse par rapport au 6/10 de l'audit pour la couverture fonctionnelle, mais revu a la baisse sur la securite/coherence reelle constatee dans le code).

Le backend reside a la **racine du depot** (`/Users/cyrilsohnde/afristocks/src/`, `prisma/`), et non dans un sous-dossier `backend/`. La structure mono/poly-repo n'est donc toujours pas clarifiee : `frontend/` et `mobile/` cohabitent comme sous-dossiers du meme repo que le backend.

#### Ce qui fonctionne
- **Bootstrap serveur** (`src/server.ts`) : Express 4.18 + Helmet + compression + morgan + Socket.io, arret propre sur SIGTERM, health check (`src/routes/index.ts:12`).
- **Auth** (`src/services/auth.service.ts`) : register/login/logout/refresh-token fonctionnels, bcrypt, double persistance session (Redis + table `RefreshToken`), creation automatique du wallet a l'inscription, 2FA TOTP via speakeasy (generate/verify).
- **Wallet** (`src/services/wallet.service.ts`) : `getBalance`, `deposit`, `withdraw`, `getTransactionHistory` tous implementes avec `prisma.$transaction` et `Decimal`. Le service withdraw existe et est correct (verrouillage des fonds via `lockedBalance`, generation d'une `reference` `WTH-...`).
- **Investment** (`src/services/investment.service.ts`) : liste/details startups, `invest` (transaction atomique : debit wallet + creation investment + increment raisedAmount + ecriture transaction), `getUserInvestments`. La fenetre temporelle est verifiee (`now < startDate || now > endDate` -> rejet, `investment.service.ts:97`). Validation `express-validator` presente sur les routes investment (`src/routes/investment.routes.ts:10-18`).
- **Admin** (`src/routes/admin.routes.ts`, 489 lignes) : dashboard, gestion users, gestion KYC (verify/reject), liste/edition startups, stats fonds, export investissements. **Nouveau depuis l'audit** : ce fichier est tres etoffe (l'audit le decrivait minimal).
- **Fund** (`src/routes/fund.routes.ts`) et **News** (`src/routes/news.routes.ts`, donnees statiques) operationnels pour le MVP.
- **Validators** (`src/validators/auth.validator.ts`, `wallet.validator.ts`) bien ecrits.
- **Rate limiting** global monte sur `/api/` (`src/server.ts:40`).

#### Ce qui est casse / absent / incoherent (verifie)
1. **Route `POST /api/wallet/withdraw` MANQUANTE** : le service `WalletService.withdraw` existe (`wallet.service.ts:83`) mais aucune route ne l'expose. `src/routes/wallet.routes.ts` n'a que `/balance`, `/deposit`, `/transactions`. La route `/transactions` n'utilise meme pas `getTransactionHistory` (pas de pagination, `take: 20` code en dur).
2. **`src/routes/startup.routes.ts` TOUJOURS VIDE (0 octet)** : confirme (verifie le 9 fev. 2026). Aucune route CRUD startup cote createur. De plus, il n'est **importe nulle part** (`src/routes/index.ts` ne le monte pas).
3. **Duplication jwt.ts / token.utils.ts non resolue ET dangereuse** : `src/utils/jwt.ts` (68 lignes) est **du code mort total** (aucun import sauf l'auto-reference du commentaire de ligne 1). Seul `token.utils.ts` est utilise. Les deux exposent un `generateTokens` aux signatures **incompatibles** (jwt.ts prend un payload, token.utils.ts prend un `User`). Risque de regression si on importe le mauvais.
4. **Secrets JWT identiques** : `src/utils/token.utils.ts` signe l'access token ET le refresh token avec **le meme secret** `process.env.JWT_SECRET` (lignes 18, 24). Le `JWT_REFRESH_SECRET` n'existe que dans le fichier mort `jwt.ts`. Faiblesse de securite : un refresh token vole est interchangeable avec un access token cote signature.
5. **2FA hors middleware auth** : `POST /api/auth/2fa/generate` et `/2fa/verify` recoivent `userId` **depuis le body** (`auth.routes.ts:80,97`, commentaires "Temporaire, sera remplace par req.user"). N'importe qui peut generer/verifier un secret 2FA pour n'importe quel userId.
6. **RBAC absent de TOUTES les routes** : `requireRole`/`requireAdmin` existent (`src/middleware/rbac.middleware.ts`) mais ne sont **jamais utilises** (grep = 0 resultat dans `src/routes`). Tout `/api/admin/*` n'est protege que par `authenticateToken` : **n'importe quel utilisateur connecte (role USER) peut lister tous les users, modifier les KYC, editer/desactiver les startups, exporter tous les investissements**. Faille d'autorisation critique.
7. **Mismatch schema/code** : `src/routes/admin.routes.ts` et `fund.routes.ts` lisent `user.firstName` / `user.lastName`, mais le modele Prisma `User` n'a que `name` (`schema.prisma:48`). Ces champs renvoient donc systematiquement `undefined`/chaine vide. De meme l'admin utilise un defaut KYC `'NONE'` alors que le schema impose `@default("PENDING")` (`schema.prisma:50`).
8. **Incoherence devise** : `wallet` cree a l'inscription avec `currency: 'XOF'` (`auth.service.ts:56`) alors que le schema impose `@default("XAF")` (`schema.prisma:126`).
9. **CORS totalement ouvert** : `app.use(cors())` (`server.ts:31`, commentaire "Accepte toutes les origines temporairement"). Socket.io, lui, est restreint a `FRONTEND_URL` — incoherence.
10. **Pas de gestion d'erreurs centralisee reelle** : chaque route fait son propre `try/catch` renvoyant `400` quelle que soit l'erreur (un "Wallet non trouve" renvoie 400 au lieu de 404). Le handler global (`server.ts:54`) n'est jamais atteint car rien n'appelle `next(err)`.
11. **Swagger installe mais absent** : `swagger-jsdoc` + `swagger-ui-express` sont dans `package.json` mais **aucun code ne les utilise** (la "doc" est un objet JSON statique a `/api/docs`).
12. **`src/controllers/auth.controller.ts` = code mort** (jamais importe ; les routes appellent le service directement).
13. **Rate limiters specifiques non cables** : `authLimiter` et `createAccountLimiter` definis mais jamais appliques sur `/auth/login` ou `/auth/register`.
14. **Stubs en production** : `src/routes/index.ts:28-67` contient de nombreux endpoints bidon (notifications, analytics, trading, payments/status) renvoyant `success:true` en dur — masquent l'absence de features et faussent le front.
15. **Aucun test backend** : les seuls tests sont front/mobile (`mobile/tests/unit/*`, `frontend/__test__/*`). 0 test sur `src/`.
16. **Redis** : connexion sans password requis (le `password` est optionnel via env), avec proxy de fallback "no-op" silencieux (`config/redis.ts`) qui masque les pertes de session/2FA.
17. **`.env.production` toujours present** sur le disque (verifie, date du 18 aout 2025) — secrets a regenerer (domaine securite, hors perimetre backend pur mais bloquant).
18. **Pas de versionnement coherent** : melange de `/api/auth` et `/api/v1/news` (`index.ts:25`).
19. **Cycle de vie des campagnes inexistant (verifie)** : le modele `Startup` ne possede **qu'un booleen `isActive`** (`schema.prisma:195`) — **aucun enum de statut** (DRAFT/ACTIVE/FUNDED/FAILED/CLOSED). `invest` controle la fenetre `startDate/endDate` mais **rien ne ferme la campagne a `endDate`**, **rien ne plafonne `raisedAmount` a `valuationTarget`** (sur-souscription possible), et **aucun mecanisme all-or-nothing / remboursement de masse** si l'objectif n'est pas atteint. Aucun ordonnanceur (grep `node-cron`/`setInterval`/`job` = 0) et aucun flux REFUND cote service (l'enum `TransactionType.REFUND` existe mais n'est jamais ecrit ; grep = 0). L'emission de parts (`shares`) a la cloture n'existe pas.
20. **Withdraw sans finalisation ni idempotence (verifie)** : `withdraw` incremente `lockedBalance` et cree une transaction `PENDING` (`wallet.service.ts:111-126`) mais **aucun `completeWithdrawal`/`cancelWithdrawal`** n'existe (grep = 0) : `lockedBalance` gonfle sans jamais etre libere, et un retry reseau double-debite (aucune cle d'idempotence ; la `reference` est generee a chaque appel, non deduplicante).

---

### Backlog (epics et taches)

> Legende effort : S (<0,5j), M (0,5-2j), L (2-5j), XL (>5j). Phases 1-4 (cf. plan global). Priorites P0 (bloquant/securite), P1 (important MVP), P2 (amelioration).

#### EPIC A — Securisation de l'authentification et de l'autorisation
*Objectif : eliminer les failles d'auth/authz et rendre le systeme de tokens coherent et sur.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-01 | Dedupliquer JWT, supprimer jwt.ts | S | 1 | P0 |
| BACK-02 | Secret distinct pour refresh token | S | 1 | P0 |
| BACK-03 | Brancher le 2FA derriere authenticateToken | M | 1 | P0 |
| BACK-04 | Appliquer le RBAC sur les routes admin/startup | M | 1 | P0 |
| BACK-05 | Cabler authLimiter / createAccountLimiter | S | 1 | P1 |
| BACK-06 | Supprimer auth.controller.ts (code mort) | S | 1 | P2 |
| BACK-07 | Flux complet 2FA au login | L | 2 | P1 |

- **BACK-01 — Deduplication JWT**
  - Description : supprimer `src/utils/jwt.ts` (code mort) ; conserver `src/utils/token.utils.ts` comme unique source. Migrer toute fonction utile manquante (`generateResetToken`/`verifyResetToken`) vers `token.utils.ts`.
  - Fichiers : `src/utils/jwt.ts`, `src/utils/token.utils.ts`.
  - DoD : `grep -r "utils/jwt" src/` ne renvoie aucun import ; `tsc --noEmit` passe sans erreur ; les tests auth (BACK-71) restent verts.
  - Dependances : aucune. Risque : un import oublie casse le build (mitige par `tsc`).
- **BACK-02 — Secret refresh distinct**
  - Description : signer le refresh token avec `JWT_REFRESH_SECRET` ; verifier en consequence. Ajouter la variable a `.env.example`.
  - Fichiers : `src/utils/token.utils.ts`, `.env.example`.
  - DoD : test unitaire dedie prouvant qu'un refresh token est rejete par `verifyAccessToken` et un access token rejete par `verifyRefreshToken` (deux assertions distinctes).
  - Dependances : BACK-01. Risque : invalidation des tokens existants (acceptable en dev).
- **BACK-03 — 2FA derriere middleware auth**
  - Description : sur `/2fa/generate` et `/2fa/verify`, retirer `userId` du body et utiliser `req.user!.userId` ; appliquer `authenticateToken`. Corriger l'incoherence de cle Redis (`2fa_temp:` ecrit a la generation, `2fa_secret:` lu a la verification — `auth.service.ts:255` vs `277`).
  - Fichiers : `src/routes/auth.routes.ts`, `src/services/auth.service.ts`.
  - DoD : test prouvant qu'un appel sans token -> 401 ; qu'un token de user A ne peut pas generer/verifier le 2FA de user B ; et qu'un vrai code TOTP valide la verification de bout en bout.
  - Dependances : BACK-01/02. Risque : cle Redis mal alignee (cause actuelle de bug verifie).
- **BACK-04 — RBAC sur admin/startup**
  - Description : appliquer `requireAdmin` a tout le routeur `admin.routes.ts` (apres `authenticateToken`), et `requireStartup`/`requireAdmin` au futur `startup.routes.ts`. Verifier que `req.user.role` est bien dans le payload du token (il l'est).
  - Fichiers : `src/routes/admin.routes.ts`, `src/routes/startup.routes.ts`, `src/middleware/rbac.middleware.ts`.
  - DoD : test d'integration ou un token role USER recoit 403 sur au moins 3 endpoints `/api/admin/*` et un token ADMIN recoit 200 sur les memes.
  - Dependances : BACK-08 pour startup. Risque : se verrouiller hors admin (prevoir un seed admin).
- **BACK-05 — Rate limit auth** : appliquer `authLimiter` sur `/auth/login`, `createAccountLimiter` sur `/auth/register`. Fichiers : `src/routes/auth.routes.ts`. DoD : test prouvant qu'au-dela du seuil configure, la requete suivante renvoie 429.
- **BACK-06 — Suppression `auth.controller.ts`** : DoD : fichier supprime, `grep -r "auth.controller" src/` vide, `tsc --noEmit` OK.
- **BACK-07 — Flux 2FA login** : si `twoFactorEnabled`, le login renvoie un token intermediaire `2fa_pending` (type deja prevu dans `auth.types.ts:8`) ; un endpoint `/auth/2fa/login-verify` echange code TOTP + token pending contre les vrais tokens. Fichiers : `auth.service.ts`, `auth.routes.ts`. DoD : test prouvant qu'un compte 2FA active ne recoit aucun access token sans code TOTP valide, et le recoit avec.

#### EPIC B — Completion de l'API Wallet (operations monetaires)
*Objectif : exposer toutes les operations wallet de maniere fail-closed, fiabiliser l'idempotence et le cycle de vie des transactions.*

> **Sequencement critique (lacune de controle integree)** : l'exposition publique du retrait (BACK-10) est **subordonnee** a l'idempotence (BACK-13) et au settlement (BACK-14). Ouvrir `/withdraw` sans ces garde-fous reproduit le bug verifie (`lockedBalance` gonfle sans liberation, double-debit sur retry). On garde donc BACK-10 en Phase 1 **mais derriere un flag fail-closed** (route presente, repondant 503 `feature_disabled` tant que BACK-13/14 et DATA-08 ne sont pas livres), et son **activation** est une tache distincte de Phase 2.

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-10 | Route POST /api/wallet/withdraw (fail-closed, derriere flag) | M | 1 | P0 |
| BACK-11 | Brancher validators wallet (deposit/withdraw) | S | 1 | P0 |
| BACK-12 | /transactions via getTransactionHistory paginé | S | 2 | P1 |
| BACK-13 | Idempotence des operations monetaires | L | 2 | P0 |
| BACK-14 | Settlement des retraits (lockedBalance) | M | 2 | P1 |
| BACK-15 | Coherence devise wallet (XOF/XAF) | S | 1 | P1 |
| BACK-16 | Activation de /withdraw (leve du flag) | S | 2 | P0 |

- **BACK-10 — Route withdraw (fail-closed)**
  - Description : ajouter `POST /withdraw` dans `wallet.routes.ts` appelant `WalletService.withdraw(req.user!.userId, amount, bankDetails)`, protege par `authenticateToken`. **Tant que BACK-13 (idempotence) et BACK-14 (settlement) ne sont pas livres**, la route est gardee par un flag d'environnement (`WITHDRAW_ENABLED=false` par defaut) et renvoie `503 { code: "feature_disabled" }`.
  - Fichiers : `src/routes/wallet.routes.ts`.
  - DoD : avec le flag a `false`, tout appel -> 503 `feature_disabled` (test) ; avec le flag a `true` ET solde suffisant -> 200 + transaction PENDING + `lockedBalance` incremente ; solde insuffisant -> 400 message clair. Test d'integration couvrant les trois cas.
  - Dependances : BACK-11. **Bloque l'activation par** : BACK-13, BACK-14, BACK-16, DATA-08.
- **BACK-11 — Validators wallet cables**
  - Description : appliquer `depositValidator` sur `/deposit`, `withdrawValidator` sur `/withdraw`, `transactionQueryValidator` sur `/transactions`, avec `validateRequest`.
  - Fichiers : `wallet.routes.ts`, `src/validators/wallet.validator.ts`.
  - DoD : test prouvant qu'un montant < 1000, une devise/paymentMethod invalide, ou des bankDetails manquants renvoient 400 avec un corps d'erreur structuré.
  - Dependances : BACK-10.
- **BACK-12 — /transactions paginé** : remplacer la requete inline par `WalletService.getTransactionHistory(userId, limit, offset)` avec lecture de `req.query`. DoD : la reponse contient `items`, `total` et `hasMore` ; tri par date desc verifie par test.
- **BACK-13 — Idempotence monetaire**
  - Description : accepter un header/`body.idempotencyKey` (UUID) sur `/deposit`, `/withdraw`, `/invest`. Stocker la cle (Redis + colonne `reference`/dediee) ; rejouer = renvoyer le resultat initial sans re-debiter.
  - Fichiers : `wallet.service.ts`, `investment.service.ts`, nouvelle migration (index unique sur la cle d'idempotence), middleware dedie.
  - DoD : test concurrent prouvant que deux requetes identiques avec la meme cle ne creent **qu'une seule** transaction et renvoient le meme corps.
  - Dependances : EPIC G (migration), DATA-08. Risque : finance — a tester rigoureusement. Prio P0.
- **BACK-14 — Settlement retrait** : ajouter `WalletService.completeWithdrawal(transactionId)` (status COMPLETED, decrement `lockedBalance`) et `cancelWithdrawal(transactionId)` (rollback vers `balance`). Exposer cote admin (avec `requireAdmin`). DoD : test prouvant que le cycle PENDING->COMPLETED libere `lockedBalance`, que PENDING->CANCELLED restitue `balance`, et que l'invariant `balance + lockedBalance` est conserve dans les deux cas.
- **BACK-15 — Coherence devise** : aligner sur une seule devise (decision porteur, cf. infra) — corriger `auth.service.ts:56` et `schema.prisma:126`. DoD : test prouvant que tout wallet cree a la meme devise que le defaut du schema.
- **BACK-16 — Activation de /withdraw** : passer `WITHDRAW_ENABLED=true` une fois BACK-13, BACK-14 et DATA-08 livres et testes. DoD : la suite d'integration du parcours complet (register->deposit->withdraw->settlement) est verte avec le flag actif ; checklist des dependances cochee.
  - Dependances : BACK-13, BACK-14, DATA-08.

#### EPIC C — Module Startup (CRUD createur + admin)
*Objectif : implementer le fichier vide `startup.routes.ts` et son service.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-20 | Service StartupService (CRUD) | M | 2 | P1 |
| BACK-21 | Routes startup.routes.ts + montage | M | 2 | P1 |
| BACK-22 | POST create startup (admin) | M | 3 | P1 |
| BACK-23 | Validation startup | S | 2 | P1 |

- **BACK-20 — StartupService** : creer `src/services/startup.service.ts` : `create`, `update`, `delete`/desactivation, `getOwnStartups`. Reutiliser la logique de mapping Decimal existante. DoD : chaque methode couverte par un test unitaire vert.
- **BACK-21 — Routes + montage** : implementer `src/routes/startup.routes.ts` (actuellement 0 octet) et l'importer/monter dans `src/routes/index.ts` (`router.use('/startups', startupRoutes)` — attention au conflit de nommage avec `/investments/startups`). DoD : `grep "startupRoutes" src/routes/index.ts` renvoie le montage ; les routes repondent (test d'integration).
- **BACK-22 — Creation startup** : `POST /api/startups` (role STARTUP/ADMIN) créant une `Startup` ; deplacer aussi `PUT /admin/startups/:id` vers un service partage. DoD : test prouvant qu'une startup creee via cet endpoint apparait dans `GET /investments/startups`.
- **BACK-23 — Validation startup** : `src/validators/startup.validator.ts` (name, valuationTarget>0, minInvestment<=maxInvestment, startDate<endDate). DoD : test prouvant que chaque payload invalide -> 400 structuré.

#### EPIC C-bis — Cycle de vie des campagnes de levee (cloture, all-or-nothing, remboursement, parts)
*Objectif (lacune de controle integree) : gerer la transition d'une campagne au-dela de l'acte d'investir — plafonnement, cloture a `endDate`, regle all-or-nothing, remboursement de masse, emission des parts. Le modele `Startup` n'a aujourd'hui qu'un booleen `isActive` et aucun service ne pilote ce cycle (verifie).*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-24 | Enum statut campagne + migration | M | 2 | P1 |
| BACK-25 | Plafonnement & blocage des investissements | M | 2 | P0 |
| BACK-26 | Job de cloture a endDate (machine a etats) | L | 3 | P1 |
| BACK-27 | Remboursement de masse all-or-nothing (FAILED) | L | 3 | P0 |
| BACK-28 | Emission des parts a la cloture reussie (FUNDED) | L | 3 | P1 |

- **BACK-24 — Statut campagne** : ajouter un enum `CampaignStatus { DRAFT, ACTIVE, FUNDED, FAILED, CLOSED }` au schema, le champ `status` sur `Startup` (defaut `DRAFT`), migration + reseed, et adapter les lectures qui s'appuient sur `isActive`. Fichiers : `prisma/schema.prisma`, `src/services/{investment,startup}.service.ts`, migration. DoD : test prouvant que chaque statut est persistable et que `GET /investments/startups` ne renvoie que les `ACTIVE`. Dependances : EPIC G (migration), DATA (source de verite migrations).
- **BACK-25 — Plafonnement & blocage** : dans `invest` (`investment.service.ts`), refuser tout investissement qui ferait depasser `valuationTarget` (sur-souscription) et tout investissement sur une campagne dont `status != ACTIVE` ou hors fenetre `startDate/endDate`. DoD : test prouvant qu'un investissement portant `raisedAmount` au-dela de `valuationTarget` est refuse (400), et qu'un investissement sur une campagne non `ACTIVE` est refuse. Dependances : BACK-24. Prio P0 (integrite financiere de la levee).
- **BACK-26 — Job de cloture** : ordonnanceur (ex. `node-cron` ou worker dedie) qui, a `endDate`, fait transiter chaque campagne `ACTIVE` vers `FUNDED` (si `raisedAmount >= valuationTarget`) ou `FAILED` (sinon), puis `CLOSED` apres traitement. Idempotent (rejouable sans double effet). Fichiers : nouveau `src/jobs/campaignClosure.job.ts`, `src/services/startup.service.ts`. DoD : test prouvant que, simulant `now > endDate`, une campagne atteignant l'objectif passe `FUNDED` et une campagne sous l'objectif passe `FAILED` ; relancer le job ne reapplique pas la transition. Dependances : BACK-24, BACK-25.
- **BACK-27 — Remboursement de masse (all-or-nothing)** : a la transition `FAILED`, rembourser automatiquement **tous** les investisseurs (credit `wallet.balance`, transaction `REFUND`, investissement `CANCELLED`), de maniere atomique et idempotente. Fichiers : `src/services/investment.service.ts` (ou nouveau `refund.service.ts`), `wallet.service.ts`. DoD : test d'integration prouvant qu'apres `FAILED` sur une campagne a N investisseurs, chaque wallet est recredite du montant exact, N transactions `REFUND` existent, et un rejeu du remboursement ne double-credite pas (reutilise BACK-13). Dependances : BACK-13 (idempotence), BACK-26. Prio P0.
- **BACK-28 — Emission des parts (FUNDED)** : a la transition `FUNDED`, materialiser les parts/`shares` de chaque investisseur (champ/relation a definir sur `Investment` ou nouveau modele), figer le statut `COMPLETED`. Fichiers : `prisma/schema.prisma` (modele/champ parts + migration), `src/services/investment.service.ts`. DoD : test prouvant qu'apres `FUNDED`, chaque investissement porte un nombre de parts coherent avec sa quote-part de `raisedAmount`, et que le total des parts emises est conserve. Dependances : BACK-24, BACK-26.

#### EPIC D — Coherence des donnees & corrections de bugs verifies
*Objectif : eliminer les mismatches schema/code constates.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-30 | Corriger firstName/lastName -> name | M | 1 | P0 |
| BACK-31 | Aligner defauts KYC | S | 1 | P1 |
| BACK-32 | Supprimer les stubs trompeurs | M | 2 | P1 |
| BACK-33 | Codes HTTP coherents (404 vs 400) | M | 2 | P1 |

- **BACK-30 — firstName/lastName** : choisir entre (a) splitter `name` en `firstName`/`lastName` au schema + migration, ou (b) corriger toutes les lectures `admin.routes.ts`/`fund.routes.ts` pour utiliser `name`. Decision porteur. DoD : test/inspection prouvant que les reponses admin/fund affichent un nom non vide. Risque : front/mobile attendent peut-etre `firstName` (verifier cote domaines front/mobile).
- **BACK-31 — Defauts KYC** : harmoniser la valeur par defaut (`PENDING` vs `NONE`) entre schema et code (`admin.routes.ts:107,142`). DoD : `grep -rn "NONE" src/routes/admin.routes.ts` vide ; valeur unique partout.
- **BACK-32 — Suppression stubs** : retirer les endpoints bidon (`index.ts:28-67`) ou les remplacer par `501 Not Implemented` explicites. DoD : test prouvant qu'aucune des routes concernees ne renvoie un `success:true` avec donnee fictive (soit absente -> 404, soit -> 501).
- **BACK-33 — Codes HTTP** : "non trouve" -> 404, "non autorise" -> 403, validation -> 422/400. DoD : tableau de mapping documente et verifie par tests (au moins un cas 404, un cas 403, un cas 400/422).

#### EPIC E — Architecture, gestion d'erreurs & couche service
*Objectif : centraliser erreurs, assainir la structure controleur/service.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-40 | Classe AppError + handler global | M | 2 | P1 |
| BACK-41 | Wrapper asyncHandler | S | 2 | P1 |
| BACK-42 | Extraire controllers wallet/investment | L | 3 | P2 |
| BACK-43 | Supprimer require() dynamiques | S | 2 | P2 |

- **BACK-40 — AppError + handler** : creer `src/utils/AppError.ts` (statusCode + message + code) et un `errorHandler` monte en dernier ; les services lancent des `AppError`. DoD : toutes les routes delegent au handler via `next(err)` ; test prouvant que le format d'erreur est unifie (champs `code`/`message`/`statusCode`).
- **BACK-41 — asyncHandler** : wrapper supprimant les `try/catch` repetitifs. DoD : la suite de tests d'integration des routes wallet/investment/auth (BACK-72) reste **integralement verte** apres refactor (non-regression nommee : `npm test` cible `wallet.int.test.ts`, `investment.int.test.ts`, `auth.int.test.ts`).
- **BACK-42 — Controllers** : creer `wallet.controller.ts`, `investment.controller.ts` ; les routes ne contiennent **aucune logique metier, uniquement le wiring** (instanciation/validation/appel controller). DoD : revue + regle lint custom (ex. `no-restricted-syntax` interdisant `prisma.`/`await *Service.` dans `src/routes/`) passant sans erreur. (Le critere flou "<15 lignes" est remplace par ce critere binaire outille.)
- **BACK-43 — require dynamiques** : remplacer `require('../config/database')` (`investment.routes.ts:126`) et `require('../services/investment.service')` (`fund.routes.ts:144`) par des imports ES statiques. DoD : `grep -rn "require(" src/routes/` renvoie 0 resultat.

#### EPIC F — Documentation API (OpenAPI/Swagger) & versionnement
*Objectif : exploiter les deps swagger deja installees ; versionner l'API.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-50 | Setup swagger-ui + swagger-jsdoc | M | 3 | P1 |
| BACK-51 | Annoter toutes les routes | L | 3 | P1 |
| BACK-52 | Versionnement uniforme /api/v1 | M | 2 | P1 |

- **BACK-50 — Setup Swagger** : configurer `swagger-jsdoc` + servir `/api/docs` via `swagger-ui-express` (remplacer l'objet statique). DoD : `/api/docs` sert l'UI Swagger interactive (HTTP 200, contenu `swagger-ui`).
- **BACK-51 — Annotations** : JSDoc OpenAPI sur auth/wallet/investment/admin/startup/fund. DoD : la spec generee valide (validateur OpenAPI sans erreur) et chaque endpoint monte y figure avec schemas req/resp.
- **BACK-52 — Versionnement** : prefixer toutes les routes par `/api/v1` (aujourd'hui seul news l'est). DoD : tous les endpoints repondent sous `/api/v1/*` ; strategie de retrocompat tranchee (cf. decisions) et, si alias retenu, test prouvant que l'ancien prefixe redirige.

#### EPIC G — Observabilite, logging, infra applicative
*Objectif : logging structure, config robuste.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-60 | Logger structure (pino/winston) | M | 2 | P1 |
| BACK-61 | CORS configurable (whitelist) | S | 1 | P0 |
| BACK-62 | Auth Socket.io (JWT handshake) | M | 2 | P1 |
| BACK-63 | Validation des variables d'env (zod/envalid) | S | 2 | P1 |
| BACK-64 | Healthcheck enrichi (DB+Redis) | S | 2 | P2 |
| BACK-65 | Redis : echec explicite si requis | M | 2 | P1 |

- **BACK-60 — Logger** : remplacer `console.*`/`morgan('dev')` par pino (logs JSON + requestId). DoD : `grep -rn "console\." src/` ramene a 0 dans le code applicatif ; logs JSON avec niveaux par env verifies.
- **BACK-61 — CORS** : whitelist via `ALLOWED_ORIGINS`, remplacer `cors()` (`server.ts:31`). DoD : test prouvant qu'une origine hors whitelist est bloquee (pas d'en-tete `Access-Control-Allow-Origin`) et qu'une origine autorisee passe.
- **BACK-62 — Auth Socket.io** : valider le JWT au handshake (`io.use`), retirer le `join` libre par `userId` arbitraire (`server.ts:68`). DoD : test prouvant qu'une connexion sans token valide est refusee et qu'un user ne peut rejoindre que sa propre room.
- **BACK-63 — Validation env** : valider au boot (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, `WITHDRAW_ENABLED`, etc.). DoD : test prouvant que le demarrage echoue avec message explicite si une variable requise manque.
- **BACK-64 — Healthcheck** : `/health` verifie reellement DB et Redis. DoD : test prouvant que `/health` renvoie 503 si la DB est indisponible.
- **BACK-65 — Redis strict** : en production, echec de connexion Redis = erreur (pas de fallback no-op silencieux qui perd sessions/2FA). DoD : test prouvant qu'en mode `REDIS_REQUIRED=true`, l'absence de Redis bloque le boot.

#### EPIC H — Tests automatises backend
*Objectif : passer de 0 a une suite de tests gating CI.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| BACK-70 | Setup Jest + ts-jest + supertest | M | 2 | P0 |
| BACK-71 | Tests unitaires services (wallet/investment/auth) | L | 2 | P0 |
| BACK-72 | Tests d'integration routes (DB de test) | XL | 3 | P1 |
| BACK-73 | Tests RBAC/auth negatifs | M | 2 | P0 |

- **BACK-70 — Setup test** : ajouter Jest + ts-jest + supertest, script `test`, `test:coverage`. DoD : `npm test` s'execute et rapporte au moins une suite.
- **BACK-71 — Unitaires services** : couvrir withdraw (solde insuffisant, frais), invest (bornes min/max, fenetre dates, plafond `valuationTarget` cf. BACK-25), refreshToken, remboursement (BACK-27). DoD : couverture des services `wallet`/`investment`/`auth` > 70% (rapport `test:coverage`).
- **BACK-72 — Integration** : base Postgres ephemere (Docker/Testcontainers), tester les parcours register->login->deposit->invest->(cloture FUNDED/FAILED)->withdraw. DoD : suite verte en CI. C'est la suite de non-regression referencee par BACK-41.
- **BACK-73 — Tests authz** : verifier 401/403 sur admin/wallet sans token et avec role insuffisant. DoD : cas negatifs couverts (lie a BACK-04).

#### EPIC I — Pagination/tri/filtre generalises
*Objectif : pagination coherente sur les listes admin.*

- **BACK-80** (M, P2, phase 3) — Pagination/tri/filtre sur `admin.routes.ts` (`/investments`, `/startups`, `/transactions/recent` qui sont non paginees) + utilitaire commun de pagination. Fichiers : `src/routes/admin.routes.ts`, nouveau `src/utils/pagination.ts`. DoD : test prouvant que chaque liste accepte `limit/offset/sort` et renvoie un objet `pagination` (`total`, `limit`, `offset`).

---

### Matrice de dependances critiques (extrait)

- **BACK-10 (withdraw)** -> bloque par BACK-11 ; **activation BACK-16** bloquee par **BACK-13, BACK-14, DATA-08**.
- **BACK-13 (idempotence)** -> requis par BACK-16, BACK-27 ; depend de la migration (EPIC G/DATA).
- **BACK-25/26/27/28 (cycle campagne)** -> chaine : BACK-24 -> BACK-25 -> BACK-26 -> {BACK-27 (depend aussi de BACK-13), BACK-28}.
- **BACK-04 (RBAC)** -> requis par BACK-14 (endpoints admin de settlement) et BACK-73 (tests negatifs).
- **BACK-41 (asyncHandler)** -> ne peut etre valide qu'apres BACK-72 (suite de non-regression nommee).

### Risques specifiques au domaine
- **Failles d'autorisation actives** : sans BACK-04, toute la surface admin est exposee a n'importe quel compte USER (lecture/modification de donnees sensibles, KYC, export). A traiter en P0 absolue.
- **Operation de retrait exposee avant ses garde-fous** : ouvrir `/withdraw` sans idempotence ni settlement reproduit le bug verifie (`lockedBalance` jamais libere, double-debit sur retry). Mitige par le flag fail-closed (BACK-10) et l'activation conditionnee (BACK-16).
- **Cycle de levee incomplet** : sans EPIC C-bis, une campagne peut etre sur-souscrite au-dela de `valuationTarget`, ne se cloture jamais a `endDate`, et un echec d'objectif ne declenche aucun remboursement — non-conformite au modele equity crowdfunding all-or-nothing et risque de litige investisseur.
- **Operations monetaires sans idempotence** : un double-clic ou un retry reseau peut double-debiter/double-investir/double-rembourser (deposit, withdraw, invest, refund). Risque financier reel tant que BACK-13 n'est pas livre.
- **Secret JWT unique access/refresh** : compromet la separation des privileges des tokens.
- **Fallback Redis silencieux** : en cas de perte Redis, sessions et 2FA degradent sans alerte (`config/redis.ts`), masquant des incidents de securite.
- **Mismatch schema/code (firstName/lastName, KYC, devise)** : bugs fonctionnels deja presents en runtime (champs vides), et risque de divergence avec les attentes front/mobile — coordination inter-domaines requise.
- **Migrations Prisma** : tout changement de schema (BACK-13, BACK-24, BACK-28, BACK-30) implique une migration + reseed ; l'historique de migrations s'arrete en juillet 2025, le schema a pu deriver de la base reelle (`.pg-data` embarquee). Verifier `prisma migrate status` avant toute migration.
- **Stubs renvoyant `success:true`** : risque de masquer des regressions et de fausser les tests d'integration tant que BACK-32 n'est pas fait.

### Decisions a valider par le porteur du projet
1. **Modele de nom utilisateur** : conserver `name` unique (corriger les routes) ou migrer vers `firstName`/`lastName` (migration + impact front/mobile) ? (BACK-30)
2. **Devise par defaut** : XOF ou XAF ? Impact sur schema, seed et donnees existantes. (BACK-15)
3. **Strategie de versionnement** : basculer tout sur `/api/v1` maintenant (rupture front) ou maintenir un alias de compatibilite ? (BACK-52)
4. **Fournisseur de paiement** pour finaliser deposit/withdraw (Orange Money / MTN / Wave) — le service withdraw simule actuellement un virement bancaire ; quel PSP cabler et selon quel cycle de settlement ? (impacte BACK-14/16, hors perimetre code actuel mais bloquant MVP).
5. **Politique 2FA** : 2FA optionnelle/obligatoire ? Declenchee au login pour quels roles ? (BACK-07)
6. **Stubs/endpoints fantomes** : supprimer purement ou conserver en 501 documentes le temps d'implementer notifications/analytics/trading ? (BACK-32)
7. **Strategie mono-repo vs multi-repo** : le backend vit a la racine avec front/mobile en sous-dossiers ; faut-il isoler le backend dans `backend/` (impact Docker, CI, imports) ?
8. **Source de verite des migrations** : valider/regenerer l'historique Prisma vs la base `.pg-data` embarquee avant d'ajouter les migrations BACK-13/24/28/30.
9. **Regle de cloture de campagne** : modele all-or-nothing strict (remboursement total si `raisedAmount < valuationTarget`) ou seuil de declenchement partiel (financement valide des un % atteint) ? Definition de la quote-part pour l'emission des parts. (EPIC C-bis : BACK-26/27/28)
10. **Ordonnanceur de cloture** : `node-cron` intra-process, worker dedie, ou tache K8s CronJob ? Impacte BACK-26 et l'infra. 

Fichiers reels cites (chemins absolus) : `/Users/cyrilsohnde/afristocks/src/server.ts`, `/Users/cyrilsohnde/afristocks/src/routes/{index,auth,wallet,investment,admin,fund,news,startup}.routes.ts`, `/Users/cyrilsohnde/afristocks/src/services/{auth,wallet,investment}.service.ts`, `/Users/cyrilsohnde/afristocks/src/middleware/{auth,rbac,validation,rateLimit}.middleware.ts`, `/Users/cyrilsohnde/afristocks/src/utils/{jwt,token.utils,email}.ts`, `/Users/cyrilsohnde/afristocks/src/validators/{auth,wallet}.validator.ts`, `/Users/cyrilsohnde/afristocks/src/controllers/auth.controller.ts`, `/Users/cyrilsohnde/afristocks/src/config/{database,redis}.ts`, `/Users/cyrilsohnde/afristocks/src/types/auth.types.ts`, `/Users/cyrilsohnde/afristocks/prisma/schema.prisma`, `/Users/cyrilsohnde/afristocks/package.json`.

---

All findings confirmed: `Startup` has no `ownerId`/`founderId` (only `investments` relation), `User` has no `ownedStartups` relation, `Investment.shares Int @default(0)`. The control-agent lacunes are valid. Here is the finalized v2 section.

---

## Modele de donnees & Prisma

### Etat actuel (verifie sur le code)

**Score : 6.5/10** (l'audit du 9 fev. donnait 7/10 pour la BDD ; le score reste proche, mais une analyse fine revele plus de defauts de coherence et d'integrite que l'audit ne le laissait penser).

**Fichiers reels examines :**
- `/Users/cyrilsohnde/afristocks/prisma/schema.prisma` (220 lignes, **9 modeles + 4 enums** — verifie par `grep -c "^model "` = 9, voir correction ci-dessous)
- `/Users/cyrilsohnde/afristocks/prisma/seed.ts`
- `/Users/cyrilsohnde/afristocks/prisma/migrations/` : 4 migrations (`20250713235204_init`, `20250715135217_add_missing_fields`, `20250715135652_newdata` (vide), `20250715205256_add_kyc_status`) + `migration_lock.toml`
- `/Users/cyrilsohnde/afristocks/src/services/wallet.service.ts`, `investment.service.ts`, `auth.service.ts`
- `/Users/cyrilsohnde/afristocks/src/routes/admin.routes.ts`
- `/Users/cyrilsohnde/afristocks/setup-db.js` (script de bootstrap DB hors-Prisma, present a la racine, 10 747 octets)

**Correction de decompte (lacune controle, severity low) :** la reference et certaines sections annoncent « 13 modeles Prisma ». Le schema reel n'en contient que **9** : `User`, `UserProfile`, `LoginAttempt`, `RefreshToken`, `Wallet`, `Transaction`, `Investment`, `Startup`, `Notification` (verifie). Cette imprecision fausse l'estimation de l'ampleur du chantier : les modeles `KycDocument`/`KycSubmission`, `LedgerAccount`/`LedgerEntry`, `DividendDeclaration`/`DividendDistribution`, `AuditLog`, `CompanyKyb`, `ShareClass`/cap table, `DeviceToken`, `NotificationPreference`, `Dispute` sont a **CREER** (≈ 12+ nouveaux modeles), non a modifier. Le dimensionnement de l'effort data-model doit partir de cette base de 9 et non de 13.

**Ce qui fonctionne :**
- Schema Prisma globalement bien structure : 9 modeles, nommage des tables coherent via `@@map` (snake_case) et `@map` sur les colonnes.
- Types monetaires en `Decimal @db.Decimal(20, 2)` sur `Wallet.balance`, `Wallet.lockedBalance`, `Transaction.amount`, `Transaction.fee`, `Investment.amount`, `Investment.returnAmount`, `Startup.valuationTarget/raisedAmount/minInvestment/maxInvestment` — choix correct pour de la monnaie (pas de float).
- Index presents sur les tables a fort trafic : `transactions` (userId, walletId, type, status), `investments` (userId, startupId, status), `login_attempts`, `refresh_tokens`, `notifications`.
- `Transaction.reference` est `@unique` (bon pour l'idempotence/tracabilite).
- Les operations argent critiques sont enveloppees dans `prisma.$transaction(...)` (wallet.service.ts:32, 86 ; investment.service.ts:79) — l'atomicite de base est presente.
- Cascades `onDelete: Cascade` correctement posees sur les relations possedees par `User` (profile, loginAttempts, refreshTokens, wallet, transactions, investments, notifications) ; `RESTRICT` sur `transactions.wallet_id` et `investments.startup_id` (protege contre la suppression d'un wallet/startup reference).

**Ce qui est casse / absent / incoherent (delta reel) :**

1. **Incoherence de devise XAF vs XOF (bug fonctionnel).** `schema.prisma:126` definit `currency String @default("XAF")` alors que TOUT le reste du code utilise `XOF` : `auth.service.ts:56` (`currency: 'XOF'`), `seed.ts:22`, `email.ts:94`. Un wallet cree sans devise explicite recevra `XAF` (Franc CFA Afrique centrale) au lieu de `XOF` (Afrique de l'Ouest). Incoherence directe avec la cible XOF de l'audit.

2. **Logique de retrait incomplete dans le modele d'etat.** `wallet.service.ts:83-146` : le retrait decremente `balance` et incremente `lockedBalance` du `totalAmount`, mais **aucun service ne libere jamais le `lockedBalance`** (pas de transition COMPLETED/FAILED cote retrait). Le `lockedBalance` est donc une colonne qui gonfle indefiniment sans contrepartie comptable. C'est un defaut de modelisation d'etat (machine a etats des transactions non implementee).

3. **`kycStatus` est un `String` libre, pas un enum.** `schema.prisma:50` : `kycStatus String @default("PENDING")`. Le code admin (`admin.routes.ts:107,142,232,247,262`) ecrit des valeurs ad hoc `'VERIFIED'`, `'REJECTED'`, lit `'NONE'` en fallback — aucune contrainte. Statuts non typés, risque de fautes de frappe en base. Le champ n'a meme pas de migration coherente avec un enum.

4. **Aucune modelisation KYC reelle.** Un seul champ `kycStatus` sur `User`. Pas de modele `KycDocument` (type de piece, URL S3, statut par document, verificateur, horodatage, motif de rejet). L'audit le notait deja ; toujours vrai.

5. **Dividendes : enum sans modele ni logique.** `TransactionType.DIVIDEND` (schema.prisma:23) existe mais il n'y a **aucun modele** `Dividend`/`DividendDistribution`, aucun service, aucune route. Impossible de declarer/distribuer un dividende.

6. **Pas de grand livre / double entree.** Le modele `Transaction` est un simple journal mono-entree attache a un seul `Wallet`. Il n'existe aucune table de compte comptable (`LedgerAccount`) ni d'ecritures debit/credit equilibrees. Les mouvements (depot, frais, investissement) modifient directement `Wallet.balance` sans contrepartie tracee (ou va l'argent investi ? ou vont les frais de 1 % preleves en wallet.service.ts:99 ?). Aucune table ne recoit ces frais : ils disparaissent du `balance` mais ne sont credites nulle part.

7. **Risque de precision : increment/decrement avec `number` JS.** `wallet.service.ts:59` (`increment: amount`), `:124` (`decrement: totalAmount`), `investment.service.ts:122,131` passent des `number` JavaScript bruts a Prisma. Le calcul `const fee = amount * 0.01` (wallet.service.ts:99) et `totalAmount = amount + fee` se font en flottant IEEE-754 **avant** d'atteindre la colonne Decimal — perte de precision possible (ex. arrondis a la 3e decimale) injectee dans une colonne `Decimal(20,2)` sans arrondi explicite. Les sorties font systematiquement `.toNumber()` (wallet.service.ts:22-23, 77 ; investment.service.ts:26-32) — re-conversion en float perdant la garantie Decimal cote API.

8. **Drift de migration historique non nettoye.** La migration `init` (`20250713235204_init`) crée des tables fantomes (`Portfolio`, `Order`, `Session`, `Token`) avec `Wallet.balance DECIMAL(65,30)` (precision differente de la cible 20,2), puis la migration suivante (`add_missing_fields`) **DROP toutes les tables** et les recree. Une migration vide (`20250715135652_newdata`) traine. L'historique de migration est sale, non lineaire conceptuellement, et l'ecart de precision Decimal(65,30) -> Decimal(20,2) a transite par un DROP/CREATE (perte de donnees assumee). `setup-db.js` (10 747 octets a la racine) fait du bootstrap SQL hors Prisma, source potentielle de drift entre la base reelle et le schema Prisma.

9. **Pas de soft-delete ni d'audit trail.** Aucun champ `deletedAt` sur aucun modele (verifie par grep : 0 occurrence). Aucune table `AuditLog`. Sur une plateforme financiere, les suppressions en cascade dur (`onDelete: Cascade`) detruisent l'historique transactionnel d'un utilisateur supprime — inacceptable d'un point de vue conformite/comptabilite.

10. **Relations & contraintes manquantes :**
    - `Investment` n'a pas de FK vers la `Transaction` correspondante (le lien est seulement dans `metadata.investmentId`, investment.service.ts:147 — non contraint, non indexe, non requetable proprement).
    - `Wallet.currency` et `Transaction` n'ont pas de champ devise sur la transaction (la devise est implicite via le wallet).
    - Aucune contrainte `CHECK` (ex. `balance >= 0`, `amount > 0`) — Prisma ne les genere pas par defaut, et aucune migration manuelle ne les ajoute. Rien n'empeche un solde negatif au niveau base.
    - Aucune contrainte d'unicite metier sur `Startup` (deux startups peuvent avoir exactement le meme nom).

11. **Seed minimaliste et non realiste.** `seed.ts` crée 1 admin (mot de passe en clair dans le code : `'Admin123!'`) + 3 startups avec `raisedAmount` aleatoire (`Math.random`). Aucun utilisateur de test, aucun wallet approvisionne, aucune transaction, aucun investissement, aucune notification — donc impossible de tester les ecrans/flux sans creer les donnees a la main.

12. **`Notification.type` et `UserProfile.investorType/riskProfile` sont des `String` libres** (pas d'enums) — meme probleme de typage faible que `kycStatus`.

13. **Aucun fondement de donnees pour le role STARTUP / portail fondateur (defaut structurel, lacune controle critical).** Le role `STARTUP` existe dans l'enum `UserRole` (schema.prisma:12) mais le modele `Startup` (schema.prisma:182) **n'a AUCUNE relation vers un proprietaire** : pas de `ownerId`/`founderId`, et `User` (schema.prisma:44-69) n'expose **aucune** relation `ownedStartups` (verifie : seules relations User = wallet, investments, transactions, loginAttempts, profile, notifications, refreshTokens). Toute la feuille de route qui suppose un portail emetteur (creation/gestion de campagne par un fondateur, KYB de l'entreprise, cap table, reporting investisseurs) repose donc sur **zero** fondation de donnees. Le domaine metier « fondateur/emetteur » n'etait couvert par aucun epic en v1 — corrige ci-dessous (nouvel EPIC G).

14. **`Investment.shares` toujours a 0 et aucun registre de propriete / cap table (lacune controle high).** `schema.prisma:167` : `shares Int @default(0)` — jamais calcule par `investment.service.ts`. Il n'existe ni definition de la « part » (prix de part, classe de part), ni registre/cap table prouvant ce qu'un investisseur possede. Or les dividendes (DATA-14) et le marche secondaire futur dependent de cette source de verite. Le sujet etait sous-traite en P2 (DATA-16) ; il est remonte en P1 ci-dessous.

---

### Backlog (epics et taches)

> **Ordre intra-domaine impose (lacune controle medium, dependances).** Avant toute autre migration, **DATA-20 et DATA-21 sont les tout premiers tickets DATA de la Phase 1** et constituent un **prerequis dur** de DATA-01 et de toute migration ulterieure : empiler de nouvelles migrations (devise, enums, ledger…) sur un historique sale (tables fantomes, DROP/CREATE, `DECIMAL(65,30)->20,2`) propagerait le drift. La **decision DEC #7 « existe-t-il une base de prod ? »** doit etre tranchee AVANT DATA-20 (elle conditionne squash vs baselining). Le DoD-porte avant d'autoriser DATA-01 est : `prisma migrate status` = « up to date, no drift » sur base vierge.
>
> **Mini-graphe de dependances du socle financier (lacune controle medium, cycle implicite C2) :**
> ```
> DEC#7 ─▶ DATA-20 ─▶ DATA-21 ─▶ DATA-01 ─▶ DATA-06 (ledger, chantier dedie, GEL des operations argent)
>                                                  │
>                    ┌─────────────────────────────┼───────────────────────────┐
>                    ▼                             ▼                           ▼
>                 DATA-07 (comptes systeme)   DATA-08 (machine a etats   DATA-04 (CHECK montants/solde)
>                    │                          + cycle retrait)              │
>                    └──────────────┬───────────────┘                        ▼
>                                   ▼                                      DATA-10 (verrou concurrent)
>                              DATA-09 (idempotence) ◀── BACK-13/14 (services wallet/invest)
> ```
> Ordre topologique a respecter : **DEC#7 → DATA-20 → DATA-21 → DATA-01 → DATA-06 → {DATA-07, DATA-08} → DATA-04 → DATA-09 → DATA-10**. Resolution du cycle apparent DATA-04↔DATA-06↔DATA-10 : DATA-04 (CHECK `balance>=0`) est pose **apres** la bascule ledger (DATA-06) pour ne pas casser des soldes transitoires, puis DATA-10 (verrou) apres DATA-04. Un **jalon « gel des operations argent pendant la bascule ledger »** est inscrit au chemin critique (cf. section 6 de la feuille de route).

#### EPIC A — Hygiene du schema & coherence immediate
*Objectif : eliminer les incoherences et bugs latents du schema existant sans changer l'architecture.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| DATA-01 | Corriger la devise par defaut XAF -> XOF | S | 1 | P0 |
| DATA-02 | Convertir `kycStatus` en enum `KycStatus` | S | 2 | P1 |
| DATA-03 | Typer `Notification.type`, `investorType`, `riskProfile` en enums | S | 2 | P2 |
| DATA-04 | Ajouter contraintes CHECK metier (montants > 0, solde >= 0) | M | 2 | P1 |
| DATA-05 | Ajouter unicite/normalisation sur `Startup` | S | 3 | P2 |

**DATA-01 — Corriger la devise par defaut XAF -> XOF**
- Description : aligner `Wallet.currency @default("XAF")` sur la devise reellement utilisee partout (`XOF`). Verifier qu'aucun wallet en base n'a deja `XAF` ; si oui, migration de donnees `UPDATE wallets SET currency='XOF' WHERE currency='XAF'`.
- Fichiers : `prisma/schema.prisma:126` ; nouvelle migration `prisma/migrations/*`.
- DoD : `@default("XOF")` dans le schema ; migration generee et appliquee ; requete `SELECT DISTINCT currency FROM wallets` ne renvoie que `XOF` ; test unitaire creant un wallet sans devise -> `XOF`.
- **Dependances : BLOQUE PAR DATA-20 et DATA-21** (ne pas poser cette migration avant assainissement de l'historique). Risques : faible ; verifier que la couche paiement (Orange/MTN/Wave) cible bien XOF.

**DATA-02 — Enum `KycStatus`**
- Description : remplacer `kycStatus String` par `enum KycStatus { NONE PENDING SUBMITTED UNDER_REVIEW VERIFIED REJECTED }`. Mapper les valeurs existantes (`'PENDING'`, `'VERIFIED'`, `'REJECTED'`, `'NONE'`) lors de la migration. Adapter `admin.routes.ts:84,107,142,232,247,262`.
- Fichiers : `prisma/schema.prisma:50` ; `src/routes/admin.routes.ts` ; migration.
- DoD : enum present ; migration convertissant la colonne `TEXT` -> type enum avec mapping non destructif ; compilation TS OK ; `admin.routes.ts` n'utilise plus de chaines libres.
- Dependances : **BLOQUE PAR DATA-20/21** ; coordonner avec le domaine Backend (routes admin KYC). Risques : la conversion TEXT->enum exige un `USING` SQL explicite (a ecrire manuellement dans la migration).

**DATA-03 — Typage fort des champs categoriels**
- Description : enums `NotificationType`, `InvestorType`, `RiskProfile`. Migrations avec mapping.
- Fichiers : `schema.prisma` (Notification.type, UserProfile.investorType/riskProfile).
- DoD : enums definis ; migrations appliquees ; pas de valeur orpheline en base.
- Dependances : **BLOQUE PAR DATA-20/21** ; Backend (services notifications/profil). Effort S, Phase 2, P2.

**DATA-04 — Contraintes CHECK metier**
- Description : ajouter via migration SQL manuelle des `CHECK` : `wallets.balance >= 0`, `wallets.locked_balance >= 0`, `transactions.amount > 0`, `transactions.fee >= 0`, `investments.amount > 0`, `startups.min_investment <= startups.max_investment`.
- Fichiers : nouvelle migration SQL.
- DoD : contraintes presentes en base (`\d+ wallets` les montre) ; tests d'integration prouvant qu'un `UPDATE` violant la contrainte echoue ; migration reversible (down documente).
- Dependances : **BLOQUE PAR DATA-06** (la double entree doit etre coherente avant d'interdire les soldes negatifs) ; pose **avant** DATA-10. Risques : si une logique applicative s'appuie sur des soldes negatifs transitoires, la contrainte cassera — verifier wallet.service.

**DATA-05 — Unicite/normalisation Startup**
- Description : `@@unique` sur un `slug` normalise de `Startup.name` (ajouter colonne `slug`), eviter doublons.
- DoD : colonne `slug` unique ; backfill des startups existantes ; creation refusee en doublon.
- Dependances : a coordonner avec DATA-26 (ajout `ownerId` sur Startup) pour ne pas multiplier les migrations sur la meme table.

---

#### EPIC B — Grand livre comptable & integrite financiere (double entree)
*Objectif : transformer le journal mono-entree actuel en un systeme comptable a double entree auditable, condition sine qua non d'une fintech.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| DATA-06 | Modeles `LedgerAccount` & `LedgerEntry` (double entree) — **chantier dedie** | XXL (3-4 sem.) | 2 (debut) | P0 |
| DATA-07 | Comptes systeme (frais, sequestre, passerelle paiement) | M | 2 | P0 |
| DATA-08 | Machine a etats des `Transaction` + cycle de retrait complet | L | 2 | P0 |
| DATA-09 | Idempotence des operations argent | M | 2 | P1 |
| DATA-10 | Verrouillage concurrent (SELECT ... FOR UPDATE / version) | M | 3 | P1 |
| DATA-11 | Vue/agregat de reconciliation des soldes | M | 4 | P1 |

**DATA-06 — Modeles `LedgerAccount` & `LedgerEntry` (chantier dedie)**
- Description : introduire `LedgerAccount` (id, ownerType USER|SYSTEM, ownerId nullable, type ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE, currency, balance Decimal(20,2)) et `LedgerEntry` (id, journalId/transactionRef, accountId, direction DEBIT|CREDIT, amount Decimal(20,2), createdAt). Chaque mouvement argent crée au minimum 2 entrees equilibrees (somme debits = somme credits). Relier a `Transaction` via une FK `Transaction.ledgerEntries`.
- **Re-cotation (lacune controle high, faisabilite).** L'estimation v1 (XL ≈ 8 j) etait **optimiste**. Re-cote en **chantier dedie de 3 a 4 semaines** couvrant : conception du plan de comptes, implementation, **migration de l'historique transactionnel existant** (vers ecritures retroactives ou soldes d'ouverture), **tests de propriete** (invariant « somme des entrees d'un journal = 0 », non-negativite, conservation globale) et reconciliation (DATA-11). Place le **plus tot possible (debut Phase 2)** car il est sur le chemin critique de presque tout (PSP, retrait, dividendes, plafonds KYC). **Exiger une revue par un profil ayant deja construit un ledger en production** ; necessite un **gel des operations argent pendant la bascule** (jalon dedie au chemin critique).
- Fichiers : `prisma/schema.prisma` (nouveaux modeles + enums `LedgerAccountType`, `LedgerDirection`) ; migration ; nouveau `src/services/ledger.service.ts`.
- DoD : modeles + migration ; tests de propriete verts ; index sur `(accountId, createdAt)` ; test prouvant qu'un depot crée 2 ecritures equilibrees ; plan de bascule de l'historique valide et execute ; revue externe signee.
- Dependances : **BLOQUE PAR DATA-01** (donc apres DATA-20/21) ; declenche la refonte de wallet.service.ts/investment.service.ts (Backend, BACK-13/14). Risques : XXL — refonte structurelle, double-dependance avec les services argent.

**DATA-07 — Comptes systeme**
- Description : seed de comptes systeme non rattaches a un user : `FEES_REVENUE`, `WITHDRAWAL_ESCROW` (sequestre des retraits en cours, remplace le `lockedBalance` flou), `PAYMENT_GATEWAY_CLEARING` (compte de passage Orange/MTN/Wave), `INVESTMENT_POOL`. Les frais de 1 % (wallet.service.ts:99) doivent crediter `FEES_REVENUE`.
- Fichiers : `prisma/seed.ts` ; `ledger.service.ts`.
- DoD : comptes systeme crees par le seed (idempotent) ; les frais preleves apparaissent au credit de `FEES_REVENUE` ; test verifiant qu'aucun argent ne « disparait ».
- Dependances : DATA-06. Risques : la mise en place change la semantique de `lockedBalance` (a deprecier au profit du compte sequestre).

**DATA-08 — Machine a etats des transactions + cycle de retrait complet**
- Description : formaliser les transitions `PENDING -> COMPLETED|FAILED|CANCELLED` et implementer la liberation du sequestre cote retrait (actuellement absent : wallet.service.ts ne sort jamais du `lockedBalance`). Ajouter `Transaction.statusHistory` (Json ou table dediee `TransactionStatusLog`).
- Fichiers : `prisma/schema.prisma` ; `src/services/wallet.service.ts` ; migration.
- DoD : un retrait `COMPLETED` debite le sequestre ; un retrait `FAILED`/`CANCELLED` re-credite le `balance` du user ; transitions invalides rejetees ; tests couvrant chaque transition.
- Dependances : DATA-06/07 ; route `POST /api/wallet/withdraw` (Backend). Risques : coherence avec la passerelle de paiement (callbacks asynchrones).

**DATA-09 — Idempotence des operations argent**
- Description : exploiter `Transaction.reference @unique` comme cle d'idempotence cote service (rejet sur doublon) et ajouter une colonne `idempotencyKey @unique` optionnelle pour les requetes client. Eviter double-depot/double-retrait sur retry reseau.
- Fichiers : `schema.prisma` (colonne idempotencyKey + index) ; services wallet/investment.
- DoD : deux appels avec la meme cle ne creent qu'une transaction ; test concurrent. Dependances : DATA-08 ; aligner avec BACK-13 (idempotence cote backend).

**DATA-10 — Verrouillage concurrent**
- Description : prevenir les races sur `Wallet.balance` (deux investissements simultanes pourraient passer le check `balance.lessThan(amount)` chacun). Ajouter `Wallet.version Int @default(0)` (verrou optimiste) ou utiliser `SELECT ... FOR UPDATE` via `$queryRaw` dans la `$transaction`, avec niveau d'isolation `Serializable`.
- Fichiers : `schema.prisma` (version) ; `wallet.service.ts:33,87`, `investment.service.ts:101`.
- DoD : test de charge concurrent prouvant qu'on ne peut pas depenser deux fois le meme solde ; pas de solde negatif. Dependances : **BLOQUE PAR DATA-04**. Risques : retries necessaires en cas de conflit serialisable.

**DATA-11 — Reconciliation des soldes**
- Description : vue SQL ou job verifiant que pour chaque wallet, `balance == somme des LedgerEntry` du compte correspondant, et que le grand livre global est equilibre.
- DoD : commande/job `npm run reconcile` retournant les ecarts ; 0 ecart sur seed. Phase 4, P1.

---

#### EPIC C — KYC & documents
*Objectif : modeliser un parcours KYC verifiable avec documents.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| DATA-12 | Modele `KycDocument` | M | 3 | P1 |
| DATA-13 | Modele `KycSubmission` / dossier KYC | M | 3 | P1 |

**DATA-12 — `KycDocument`**
- Description : `KycDocument` (id, userId FK, type ID_CARD|PASSPORT|PROOF_OF_ADDRESS|SELFIE, fileUrl S3, status PENDING|APPROVED|REJECTED, rejectionReason, reviewedBy FK User, reviewedAt, createdAt). Index `(userId)`, `(status)`.
- Fichiers : `prisma/schema.prisma` ; migration.
- DoD : modele + migration ; relation `User.kycDocuments` ; un document peut etre approuve/rejete avec motif.
- Dependances : upload S3 (domaine Infra/Backend), enum `KycStatus` (DATA-02). Risques : conformite (retention/chiffrement des pieces d'identite — a couvrir cote securite).

**DATA-13 — `KycSubmission` (dossier)**
- Description : regrouper les documents d'un cycle de soumission (statut global, derive vers `User.kycStatus`). Horodater chaque transition.
- DoD : modele ; le passage de tous les documents a APPROVED met `User.kycStatus = VERIFIED`. Dependances : DATA-12.

---

#### EPIC D — Dividendes & rendement
*Objectif : permettre la declaration et la distribution de dividendes, et calculer le rendement des investissements.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| DATA-14 | Modeles `DividendDeclaration` & `DividendDistribution` | L | 3 | P1 |
| DATA-15 | Lien `Investment` <-> `Transaction` + champ rendement | M | 3 | P1 |
| DATA-16 | Modele de parts/valorisation (`shares`, prix, classe de part) | M | 3 | **P1** |

**DATA-14 — Dividendes**
- Description : `DividendDeclaration` (id, startupId FK, totalAmount Decimal(20,2), perShareAmount, declaredAt, payableAt, status DECLARED|DISTRIBUTED|CANCELLED). `DividendDistribution` (id, declarationId FK, investmentId/userId FK, amount Decimal(20,2), transactionId FK vers la `Transaction` de type DIVIDEND, status).
- Fichiers : `prisma/schema.prisma` ; migration ; `src/services/dividend.service.ts`.
- DoD : declaration d'un dividende genere N distributions equilibrees au grand livre (somme distribuee = totalAmount) ; chaque distribution crée une `Transaction` DIVIDEND creditant le wallet beneficiaire ; **la repartition s'appuie sur le registre de parts (DATA-16)** ; tests.
- Dependances : DATA-06 (double entree), **DATA-16 (cap table / parts comme source de verite)**. Risques : arrondis sur la repartition par part (gerer le reliquat de centimes — cf. decision #4).

**DATA-15 — Lien Investment<->Transaction & rendement**
- Description : ajouter `Investment.transactionId` FK (au lieu du seul `metadata`, investment.service.ts:147) et exploiter `returnAmount`/`maturityDate` (deja au schema) avec un calcul de rendement (ROI = returnAmount/amount).
- Fichiers : `schema.prisma:160-179` ; investment.service.ts ; migration.
- DoD : FK indexee ; champ rendement calculable et expose ; backfill des investissements existants. Dependances : DATA-06.

**DATA-16 — Parts, valorisation & registre de propriete (remonte en P1)**
- Description (lacune controle high) : `Investment.shares` (schema.prisma:167) est toujours **0** car jamais calcule. Introduire `ShareClass` (prix de part par campagne/classe, droits) et **calculer `shares` au moment de l'investissement** a partir d'un prix de part. Creer un **registre / cap table** (qui possede quoi, par campagne) consultable par l'investisseur **ET** le fondateur, source de verite pour les dividendes (DATA-14) et le marche secondaire futur.
- Fichiers : `schema.prisma` (modele `ShareClass`, table cap table / `ShareHolding` ou agregation sur `Investment`) ; `investment.service.ts` ; migration.
- DoD : `shares` non nul et calcule a chaque investissement ; cap table requetable par campagne et par investisseur ; coherence (somme des parts emises ≤ parts disponibles de la campagne) testee ; expose cote API.
- Dependances : decision metier #3 (definition de la part) ; lie a l'EPIC G (vue fondateur de la cap table). **Justification de la remontee P2 -> P1 :** DATA-14 (dividendes au prorata des parts) et le reporting fondateur en dependent ; sans registre, le produit ne peut pas prouver la propriete.

---

#### EPIC E — Audit, soft-delete & conformite
*Objectif : tracer toute action sensible et eviter la destruction d'historique financier.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| DATA-17 | Soft-delete (`deletedAt`) sur entites a historique | M | 2 | P1 |
| DATA-18 | Revoir les cascades de suppression financiere | M | 2 | P0 |
| DATA-19 | Modele `AuditLog` | M | 3 | P1 |

**DATA-17 — Soft-delete**
- Description : ajouter `deletedAt DateTime?` sur `User`, `Wallet`, `Startup`, `Investment` (et filtrer par defaut). Eviter la suppression physique d'entites financieres.
- Fichiers : `schema.prisma` (champs) ; middleware Prisma `$extends`/query pour filtrer ; migration.
- DoD : un user « supprime » a `deletedAt` non nul, ses transactions restent en base ; les requetes courantes l'excluent ; test. Dependances : DATA-18. Risques : oublier le filtre dans une requete = fuite de donnees supprimees.

**DATA-18 — Revoir les cascades destructives**
- Description : les `onDelete: Cascade` actuels (schema.prisma:75,92,109,123,139,163,208) detruisent transactions/investissements quand un user est supprime — incompatible avec une fintech. Passer en `Restrict`/`SetNull` sur les entites financieres (transactions, investments) et s'appuyer sur le soft-delete.
- Fichiers : `schema.prisma` (toutes les relations vers User portant des donnees financieres) ; migration.
- DoD : impossible de hard-delete un user ayant des transactions ; cascades financieres remplacees ; test. Dependances : DATA-17. Risques : casse les tests existants qui supposaient le cascade.

**DATA-19 — `AuditLog`**
- Description : `AuditLog` (id, actorId FK nullable, action, entityType, entityId, before Json, after Json, ipAddress, createdAt). Alimente sur actions admin (validation KYC, declaration dividende, ajustements, **validation de campagne fondateur**). Index `(entityType, entityId)`, `(actorId)`, `(createdAt)`.
- Fichiers : `schema.prisma` ; migration ; hook applicatif.
- DoD : toute action admin sensible (admin.routes.ts:232,247,262) crée une ligne d'audit ; test. Dependances : Backend (middleware admin).

---

#### EPIC F — Migrations propres, seed realiste & performance
*Objectif : assainir l'historique de migration, fournir un seed exploitable, garantir les performances.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| DATA-20 | Auditer & assainir l'historique de migrations — **1er ticket DATA** | L | 1 | P0 |
| DATA-21 | Aligner la base reelle sur Prisma (supprimer `setup-db.js`) | M | 1 | P0 |
| DATA-22 | Seed realiste & deterministe | M | 2 | P1 |
| DATA-23 | Revue d'index & performance | M | 4 | P2 |
| DATA-24 | Strategie multi-devises | M | 4 | P2 |
| DATA-25 | Politique de migration reversible & CI | M | 2 | P1 |

**DATA-20 — Assainir l'historique de migrations (tout premier ticket DATA)**
- Description : les migrations creent des tables fantomes (`Portfolio`/`Order`/`Session`/`Token`, init), font un DROP/CREATE total (`add_missing_fields`), contiennent une migration vide (`newdata`) et un ecart de precision `DECIMAL(65,30)` -> `DECIMAL(20,2)`. Decider selon **DEC #7** : soit squash en une migration baseline propre (`prisma migrate diff` -> nouvelle init) si aucune donnee de prod n'existe, soit baseliner (`migrate resolve --applied`) si une prod existe. Verifier `prisma migrate status`.
- Fichiers : `prisma/migrations/*` ; `migration_lock.toml`.
- DoD : `prisma migrate status` = « up to date, no drift » sur une base vierge ; plus de migration vide ; plus de tables fantomes dans l'historique baseline. **Dependances : BLOQUE PAR la decision DEC #7 (existe-t-il une base de prod ?). Prerequis dur de DATA-01 et de toute migration ulterieure.** A faire en tout premier.
- Risques : si une base de prod existe deja, le squash exige un baselining (`migrate resolve --applied`).

**DATA-21 — Supprimer le bootstrap hors-Prisma**
- Description : `setup-db.js` (10 747 octets, racine) execute du SQL en marge de Prisma, source de drift schema reel/Prisma. Migrer toute logique necessaire dans une migration Prisma + seed, puis supprimer le fichier.
- Fichiers : `/Users/cyrilsohnde/afristocks/setup-db.js`.
- DoD : `setup-db.js` supprime ; le schema complet est reconstructible par `prisma migrate deploy` + `prisma db seed` seuls ; documente dans le README. **Dependances : DATA-20 (immediatement apres) ; prerequis de DATA-01.**

**DATA-22 — Seed realiste**
- Description : remplacer le seed minimal (1 admin avec mot de passe code en dur, 3 startups a `raisedAmount` aleatoire). Fournir : utilisateurs de test (USER/STARTUP/ADMIN), **au moins un user STARTUP proprietaire d'une campagne (cf. EPIC G)**, wallets approvisionnes, investissements (avec `shares` calcules), transactions de chaque type, notifications, comptes systeme du grand livre (DATA-07), une declaration de dividende exemple. Donnees deterministes (seed RNG fixe), mot de passe depuis variable d'env, pas en clair.
- Fichiers : `prisma/seed.ts`.
- DoD : `prisma db seed` peuple un jeu de donnees complet et reproductible ; tous les ecrans frontend/mobile ont des donnees a afficher ; aucun secret en clair dans le code (lecture via env). Dependances : DATA-06/07/14/16/26. Risques : maintenir le seed en phase avec l'evolution du schema.

**DATA-23 — Revue d'index & performance**
- Description : ajouter index manquants reveles par les requetes reelles : `transactions(wallet_id, created_at)` (pagination historique, wallet.service.ts:158-162), `investments(user_id, invested_at)` (investment.service.ts:166-171), index sur `startups(is_active, created_at)` (investment.service.ts:8-13). Eventuels index composites pour le grand livre et la cap table.
- Fichiers : `schema.prisma` ; migrations.
- DoD : `EXPLAIN ANALYZE` des requetes des services n'effectue pas de seq scan sur les tables a volume ; benchmark documente. Dependances : DATA-06. Phase 4, P2.

**DATA-24 — Strategie multi-devises**
- Description : meme si XOF est la cible unique au lancement, decider la modelisation : devise par wallet (deja present) vs devise par transaction. Si multi-devises futur : table `ExchangeRate`, devise sur `Transaction`/`LedgerEntry`, contrainte d'homogeneite de devise par compte du grand livre.
- DoD : decision tracee ; au minimum, chaque `LedgerEntry`/`Transaction` porte une devise explicite coherente avec son compte. Dependances : DATA-06, decision metier #8. Phase 4, P2.

**DATA-25 — Migrations reversibles & gating CI**
- Description : convention de migration avec section « down » documentee, interdiction des migrations destructives non revues, verification `prisma migrate diff` en CI (drift detection) et `prisma validate`.
- Fichiers : `prisma/` ; pipeline CI (domaine Infra).
- DoD : la CI echoue si le schema et les migrations divergent (drift) ou si `prisma validate` echoue ; chaque migration a un down documente. Dependances : mise en place CI (domaine Infra). Phase 2, P1.

---

#### EPIC G — Portail Fondateur / Emetteur (donnees) — *NOUVEAU (lacune controle critical)*
*Objectif : poser le fondement de donnees du domaine metier « fondateur/emetteur », absent du schema (le role STARTUP existe sans aucune relation de propriete). Ce socle conditionne le RBAC, le KYB, la cap table et le calcul de parts. A trancher tot.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| DATA-26 | Relation de propriete `Startup.ownerId` + `User.ownedStartups` | M | 2 | P0 |
| DATA-27 | Modele `CompanyKyb` (KYB entreprise, distinct du KYC personne) | L | 3 | P1 |
| DATA-28 | Cycle de soumission/validation de campagne (`Startup.status` + workflow) | L | 3 | P1 |
| DATA-29 | Cap table / registre des parts par investisseur (cote fondateur) | L | 3 | P1 |
| DATA-30 | Donnees de reporting & communication investisseurs | M | 4 | P2 |

**DATA-26 — Relation de propriete Startup<->User**
- Description : le modele `Startup` (schema.prisma:182-202) n'a **aucun** champ proprietaire et `User` (schema.prisma:44-69) **aucune** relation `ownedStartups` (verifie). Ajouter `Startup.ownerId String @map("owner_id")` + `owner User @relation("OwnedStartups", fields:[ownerId], references:[id])` et cote `User` `ownedStartups Startup[] @relation("OwnedStartups")`. Choisir `onDelete: Restrict` (ne pas detruire une campagne avec un proprietaire supprime ; s'appuyer sur soft-delete DATA-17). Index `(ownerId)`.
- Fichiers : `schema.prisma` (User, Startup) ; migration (backfill : rattacher les 3 startups seed a un user STARTUP de test) ; `seed.ts`.
- DoD : un user de role `STARTUP` est proprietaire d'au moins une `Startup` ; requete « startups d'un fondateur » fonctionne ; backfill applique ; le RBAC backend peut autoriser un fondateur a gerer **uniquement** ses campagnes.
- Dependances : aucune cote data (a faire tot, debut Phase 2, **avant** DATA-28/29) ; coordonner avec le domaine RBAC/Backend (BACK-22 creation startup role STARTUP, qui presupposait ce modele) et DATA-18 (cascades). Risques : impacte le calcul de parts et le KYB.

**DATA-27 — `CompanyKyb` (KYB entreprise)**
- Description : KYB (Know Your Business) distinct du KYC personne : `CompanyKyb` (id, startupId FK, legalName, registrationNumber, taxId, countryOfIncorporation, status NONE|SUBMITTED|UNDER_REVIEW|VERIFIED|REJECTED, reviewedBy, reviewedAt, rejectionReason). Documents d'entreprise via une table `CompanyKybDocument` (statuts, S3, type : registre de commerce, statuts, beneficiaires effectifs).
- Fichiers : `schema.prisma` ; migration ; service KYB.
- DoD : une campagne ne peut passer en « ouverte aux investissements » que si `CompanyKyb.status = VERIFIED` ; relation `Startup.kyb` ; tests. Dependances : DATA-26 ; upload S3 (Infra) ; reutilise l'enum de statut de DATA-02 (factoriser un `VerificationStatus` commun KYC/KYB).
- Risques : conformite BCEAO/UEMOA (KYB obligatoire pour emetteur).

**DATA-28 — Cycle de validation de campagne**
- Description : `Startup` n'a aujourd'hui qu'un booleen `isActive` (schema.prisma:195). Ajouter `Startup.status` (enum `DRAFT|SUBMITTED|UNDER_REVIEW|APPROVED|LIVE|CLOSED|REJECTED`) et un workflow : un fondateur cree en `DRAFT`, soumet, l'admin valide (declenche un `AuditLog` DATA-19), la campagne devient `LIVE`. Lier au KYB (DATA-27) et a la cap table (DATA-29).
- Fichiers : `schema.prisma` ; migration ; service.
- DoD : transitions de statut validees et testees ; seuls les `LIVE` acceptent des investissements (impacte investment.service.ts:8-13) ; une transition vers `LIVE` exige KYB VERIFIED. Dependances : DATA-26, DATA-27.

**DATA-29 — Cap table / registre des parts (vue fondateur)**
- Description : exploiter le registre de parts de DATA-16 pour offrir au fondateur la table de capitalisation de **sa** campagne (liste des investisseurs, parts, montants, % du tour). Source de verite unique partagee avec l'investisseur (DATA-16) et les dividendes (DATA-14).
- Fichiers : `schema.prisma` (vue/agregation) ; service ; requetes scopees par `ownerId`.
- DoD : un fondateur consulte la cap table de ses campagnes uniquement (scoping RBAC) ; totaux coherents avec `Startup.raisedAmount` ; tests. Dependances : DATA-16, DATA-26.

**DATA-30 — Reporting & communication investisseurs (donnees)**
- Description : modeles support pour le reporting fondateur -> investisseurs (ex. `StartupUpdate` : titre, contenu, campagne, publie le ; lien notifications). Base de donnees du tableau de bord fondateur.
- DoD : un fondateur publie une mise a jour visible par ses investisseurs ; declenche notifications. Dependances : DATA-26, domaine Notifications. Phase 4, P2.

---

### Risques specifiques au domaine

- **Refonte double-entree (DATA-06) = risque structurel majeur, re-cote en chantier de 3-4 semaines.** C'est le changement le plus lourd, sur le chemin critique de presque tout le reste (PSP, retrait, dividendes, plafonds KYC). Il impacte wallet.service.ts et investment.service.ts, exige une migration de l'historique existant et un **gel des operations argent pendant la bascule**. A planifier comme chantier dedie en debut de Phase 2, avec revue par un profil ayant deja construit un ledger en production.
- **Domaine fondateur/emetteur sans fondation de donnees (EPIC G)** : le role `STARTUP` existe sans relation de propriete ; toute la chaine RBAC/KYB/cap table/parts en depend. A trancher tot (DATA-26 en debut de Phase 2) sous peine de bloquer plusieurs domaines.
- **`Investment.shares` a 0 + absence de cap table (DATA-16)** : sans registre de parts, impossible de prouver la propriete ni de distribuer des dividendes au prorata. Remonte en P1.
- **Perte de precision deja presente** (calcul des frais en float, `.toNumber()` partout) : tant que les montants restent petits l'erreur est invisible, mais elle est latente. Risque comptable cumulatif.
- **Cascades destructives (`onDelete: Cascade`)** : un simple `prisma.user.delete` efface aujourd'hui tout l'historique financier d'un utilisateur — risque de conformite et de perte de preuve. A corriger avant toute mise en production (DATA-18).
- **Drift base reelle vs Prisma** via `setup-db.js` : le schema applique en local peut differer du schema Prisma, rendant les migrations imprevisibles. **Prerequis dur (DATA-20/21) avant toute nouvelle migration.**
- **Conversion TEXT -> enum (kycStatus, types divers, statut campagne)** : risque de migration echouee si des valeurs orphelines existent en base ; necessite des `USING` SQL et un mapping exhaustif.
- **LockedBalance orphelin** : tant que DATA-08 n'est pas fait, chaque retrait augmente un solde verrouille jamais libere, faussant les soldes affiches.
- **Concurrence non geree** (DATA-10) : possibilite de double-depense sur investissements/retraits simultanes sous charge.
- **Sequencement non lineaire du socle financier** : la chaine DEC#7 → DATA-20/21 → DATA-01 → DATA-06 → {DATA-07, DATA-08} → DATA-04 → DATA-09 → DATA-10 doit etre respectee a la lettre pour eviter le travail « en l'air ». Voir le mini-graphe en tete de backlog.

### Decisions a valider par le porteur du projet

1. **Devise** : confirmation que la devise cible unique est **XOF** (et non XAF) — la cible influence aussi la passerelle de paiement.
2. **Architecture comptable** : adopter une **comptabilite en double entree** (recommande pour une fintech) vs conserver le journal mono-entree simplifie ? Impacte fortement l'effort (DATA-06 est un chantier de 3-4 semaines).
3. **Modele de parts/valorisation** : qu'est-ce qu'une « part » (`shares`) ? Prix fixe par campagne, valorisation pre/post-money, ou simple ratio montant/valuation ? Necessaire pour calculer `shares`, le rendement ET la cap table (DATA-16/29). **A trancher tot (bloque DATA-14, DATA-16, DATA-29).**
4. **Politique de dividendes** : repartition au prorata du montant investi ou par nombre de parts ? Traitement du reliquat d'arrondi (qui encaisse les centimes restants) ?
5. **Frais** : ou doivent comptablement atterrir les frais de retrait de 1 % (compte de revenus de la plateforme) ? Y a-t-il des frais sur depot/investissement ?
6. **Conformite & retention** : duree de conservation des transactions et des documents KYC/**KYB** (reglementation BCEAO/UEMOA) ? Cela conditionne soft-delete vs anonymisation.
7. **Existence d'une base de prod** : y a-t-il deja des donnees reelles en base ? **Decision prerequis dur de DATA-20** (squash vs baseline) — a poser **avant** tout chantier de migration.
8. **Multi-devises** : besoin a moyen terme (XOF + EUR/USD pour investisseurs diaspora) ou XOF strict ? Conditionne DATA-24.
9. **Portail fondateur/emetteur** : modele de propriete des campagnes (un fondateur = une ou plusieurs startups ? co-fondateurs multiples ?), perimetre du KYB et niveau de delegation de gestion. **Conditionne tout l'EPIC G ; a trancher tot.**

---

All key claims confirmed: `useAuth`/`AuthProvider` are used nowhere outside their own definition, no i18n lib, 20 hardcoded `localhost:50` references, mock-token only in the dead AuthContext. The gap-finding is valid (double restructuring of `app/` tree and strict auth ordering). I have enough to finalize.

## Frontend web (Next.js 15)

### Etat actuel (verifie sur le code)

**Score : 4/10** (audit du 9 fev. : 5/10 — score legerement revise a la baisse apres lecture reelle : l'architecture s'est diversifiee mais a accumule des couches concurrentes mortes qui aggravent la dette).

Code reellement lu sous `/Users/cyrilsohnde/afristocks/frontend`. Branche git active : `restore-frontend-2025-08-11`, dernier commit `2acac65` (18 aout 2025). **Tout le travail de fev. 2026 est non commite** : les fichiers `app/views/*`, `contexts/`, `services/`, `providers/` datent du 9 fev. mais ne sont pas dans l'historique git.

**Ce qui fonctionne :**
- L'application se structure desormais en vues separees : `src/app/views/` contient 24 fichiers (HomeView, StartupsView, PortfolioView, TradingView, StartupDetailView, StartupDashboardView, 5 vues Admin, vues Learn, etc.). C'est un **delta positif majeur** vs l'audit qui ne mentionnait que `page.tsx` monolithique.
- L'authentification n'est **plus** un mock-token cote `page.tsx` : `handleLogin`/`handleRegister` (`src/app/page.tsx` l.207-354) appellent reellement `POST ${API_URL}/api/auth/login` et `/api/auth/register`, stockent un vrai JWT et redirigent selon le role (ADMIN/STARTUP/USER). Le delta vs audit (« auth fictive mock-token ») est donc **partiellement corrige** pour le flux principal.
- `ReactQueryProvider` est monte dans `src/app/layout.tsx` (l.6, l.33).
- `next.config.js` apporte des en-tetes de securite (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy), une config `images.remotePatterns` (Cloudinary) et un `rewrites` `/api/:path*` vers le backend.
- Une route API serveur existe : `src/app/api/news/route.ts` (mock, NewsAPI commente).
- Un design system embryonnaire existe : `components/ui/GlassCard.tsx`, `components/effects/BackgroundOrbs.tsx`, `components/animations/AnimatedWrapper.tsx`, `lib/utils.ts` (`cn`).

**Ce qui est casse / absent / incoherent (verifie) :**

1. **`page.tsx` toujours monolithique : 1538 lignes** (`src/app/page.tsx`). Il contient encore inline : `NewsletterModal`, le composant `AuthModal` (l.411-721), `Header` (l.724-943), `Footer` (l.946-1241), `AccountTypeSelection` (l.1249-1359), `GlassCard` (l.375-401), la table de notifications statiques (l.404-408) et **tout le routing applicatif** via `activeView` + cascade de `&&` (l.1384-1495). Le delta vs audit est nul sur ce point.
2. **Routing maison par `useState('activeView')`** : aucune utilisation de l'App Router de Next.js pour la navigation (pas de routes `/startups`, `/portfolio`, etc.). Pas d'URL partageable, pas de deep-linking, pas de bouton retour navigateur, pas de SSR/SEO par page. `page.tsx` l.1473 declare `activeView === 'faq'` **deux fois** (l.1450 et l.1473) — code mort/conflit.
3. **Trois couches d'auth/API concurrentes, dont deux mortes :**
   - `src/contexts/AuthContext.tsx` : **TOUJOURS un mock** (`localStorage.setItem('token', 'mock-token')` l.61 et l.79, `mockUser`). `useAuth`/`AuthProvider` ne sont **importes nulle part** (grep verifie : seule occurrence = leur propre definition). Couche morte et trompeuse.
   - `src/services/api.ts` : instance axios + intercepteurs JWT via cookie `auth_token`, `authService`/`startupService`. **Jamais importe** ailleurs. De plus baseURL et chemins incoherents (`/auth/login` sans prefixe `/api`).
   - `src/config/api.ts` : 3e instance axios, doublon.
   - **La realite** : tout passe par `fetch()` brut avec `Authorization: Bearer ${localStorage.getItem('token')}` disperse dans 18+ fichiers.
4. **Token JWT stocke en `localStorage`** (`page.tsx` l.232, et tous les Admin*View) → vulnerable au vol par XSS. Contradiction directe avec `services/api.ts` qui, lui, lit un cookie. L'objectif « cookies httpOnly + refresh » n'est pas atteint ; aucun mecanisme de refresh token cote client.
5. **Redux installe, jamais utilise** : `@reduxjs/toolkit` + `react-redux` dans `package.json` (l.22, l.38). Grep `configureStore|createSlice|useSelector|useDispatch` = **0 occurrence**. Dependances mortes. Delta vs audit : nul.
6. **React Query monte mais jamais utilise** : grep `useQuery|useMutation|useInfiniteQuery` = **0 occurrence**. Le provider tourne a vide.
7. **Incoherence d'URL backend critique** : le port varie entre fichiers (20 occurrences `localhost:50*` en dur, verifie).
   - `5002` : `page.tsx`, `FundContext`, `config/api.ts`, `services/*`, `components/admin/*`, `AfriStocksApp`.
   - `5001` (en dur, sans fallback env) : `app/views/AdminUsersView.tsx` (l.10), `AdminStartupsView.tsx` (l.10), `AdminDashboardView.tsx` (l.11), `AdminVerificationView.tsx` (l.9).
   - Prefixes incoherents : auth/wallet sur `/api/...`, news sur `/api/v1/news` (`AdminNewsView`, `HomeView`, `NewsSection`). → les vues Admin pointent vers un mauvais port et ne fonctionneront pas.
8. **Doublons de composants** : `src/components/views/` (AdminDashboardView, InvestmentFundView, TradingView — dates aout 2025) **fait doublon** avec `src/app/views/` (versions fev. 2026 reellement utilisees). De meme `Toast` existe dans `app/components/Toast.tsx` ET `components/Toast.tsx` ; `SmartNewsSection` dans `app/news/` ET `components/` ; `BackButton` dans `app/components/` ET `app/views/` ; `InvestmentFundView` en 3 exemplaires. `GlassCard` existe **deux fois** (inline dans `page.tsx` + `components/ui/GlassCard.tsx`).
9. **Composant gigantesque mort** : `src/components/AfriStocksApp.tsx` (1219 lignes) — ancienne version de l'app, non importee par `page.tsx`. `components/AdvancedTrading.tsx` (451 l.) : non importe par les vues. `FileUpload.jsx` (JS dans un projet TS).
10. **Donnees mock partout** : `StartupsView.tsx` rend un tableau `startups` code en dur (l.16+), idem `HomeView`, `FormationsView`, `components/trading/TradingChart`, `OrderBook`, `components/admin/AdminStats`. Aucune vue startup/portfolio/trading n'est branchee sur de vraies donnees.
11. **Tests : 1 seul, probablement casse.** `__test__/components/GlassCard.test.ts` importe `{ GlassCard }` de `@/components/ui/GlassCard` avec une prop `glowColor` — mais teste un composant different de celui reellement affiche (inline dans `page.tsx`). Aucune couverture des vues, de l'auth, du routing. `eslint.config.mjs` est correct mais `next.config.js` a `eslint.ignoreDuringBuilds: true` → le lint ne bloque jamais le build.
12. **i18n : absente.** Aucune lib (`next-intl`/`i18next`/`react-i18next` : 0, verifie sur `package.json`). Tout le texte est en francais code en dur dans le JSX. L'objectif FR/EN n'a aucune fondation.
13. **a11y : quasi nulle.** 3 attributs `aria-*` sur 52 composants `.tsx`. Boutons icone (cloche, menu, fermeture modale) sans `aria-label`. Modales sans gestion focus-trap / `role="dialog"` / `aria-modal` / fermeture par Echap.
14. **Performance / images** : `0` usage de `next/image`, `8` balises `<img>` brutes. Pas d'optimisation d'images, pas de lazy-loading natif. Tout est `'use client'` de fait (l'app entiere descend de `page.tsx` client) → aucun benefice SSR/RSC ; seules 2 directives `'use client'` explicites sur 52 fichiers (le reste herite de la frontiere client du parent).
15. **Config dupliquee** : `next.config.js`, `next.config.ts`, `next.config.build.js` coexistent ; idem `tailwind.config.js`/`.ts`, `postcss.config.js`/`.mjs`. Ambiguite sur la config effective (`.js` prime en pratique).
16. **Metadata par defaut** : `layout.tsx` l.18-21 → `title: "Create Next App"`, `description: "Generated by create next app"`, `<html lang="en">` alors que l'app est en francais.
17. **Fichiers parasites** versionnes/presents : `Untitled-1`, `dump.rdb`, `.DS_Store`, `.vercel/`.

---

### Backlog (epics et taches)

Effort : S (<0,5 j), M (0,5-2 j), L (2-5 j), XL (>5 j). Phases 1-4 alignees sur le plan global. Priorites P0 (bloquant) > P1 > P2.

> **Sequencement transverse (a lire avant tout) — corrige une lacune de la v1 :**
> - **Ordre auth strictement impose** : la suppression du mock ne doit PAS preceder la mise en place du vrai flux. L'ordre obligatoire est **FRON-20 → FRON-21 → FRON-22 → FRON-02** (suppression de `AuthContext` mock **en dernier**), pour ne jamais laisser de « trou d'auth ». FRON-02 est en consequence **deplacee en Phase 2** (et non Phase 1) et marquee P0-fin.
> - **Eviter la double restructuration de l'arbre `app/`** : la migration App Router (EPIC B) puis l'ajout d'un segment `[locale]` (EPIC F, FRON-50) reorganisent **deux fois** la meme arborescence. Pour l'eviter, la **decision #3 (routing localise)** doit etre tranchee **avant FRON-11**. Si `[locale]` est retenu, l'arborescence cible avec `app/[locale]/...` est figee et **integree des EPIC B** (voir FRON-11). EPIC F ne fait alors plus que brancher la lib et externaliser les chaines, sans re-router. La tache **FRON-50bis** acte ce gel d'arborescence.
> - **Gel des contrats API** : aucune vue data (EPIC D, en particulier FRON-32/33) n'est branchee tant que le contrat backend (OpenAPI/Swagger) du domaine concerne n'est pas fige, pour eviter le travail UI « en l'air ». Voir prerequis ajoute sur FRON-30.

#### EPIC A — Assainissement & coherence du code (dette technique)
*Objectif : supprimer les couches mortes/concurrentes et unifier la configuration avant tout refactor, pour partir d'une base lisible et non trompeuse.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| FRON-01 | Supprimer Redux inutilise | Retirer `@reduxjs/toolkit` et `react-redux` du `package.json` et regenerer le lockfile. | `package.json` | `npm ls @reduxjs/toolkit react-redux` ne renvoie rien ; le build passe ; grep confirme 0 usage. | — | S | 1 | P1 | Aucun (0 usage confirme) |
| FRON-02 | Supprimer la couche AuthContext mock | Supprimer `contexts/AuthContext.tsx` (mock, non importe) une fois le vrai `AuthProvider` (FRON-22) en place et adopte. **A executer EN DERNIER de la chaine auth**, jamais avant FRON-22. | `src/contexts/AuthContext.tsx` | Fichier supprime ; aucun import casse ; `mock-token` n'apparait plus (grep=0) ; le vrai `AuthProvider` (FRON-22) est deja utilise par Header/vues. | FRON-22 | S | **2** | P0 (fin de chaine) | Supprimer avant FRON-22 = trou d'auth → ordre FRON-20→21→22→02 impose |
| FRON-03 | Eliminer les composants/vues en doublon | Supprimer `components/views/` (3 fichiers aout 2025), `components/AfriStocksApp.tsx`, doublons de `Toast`, `SmartNewsSection`, `BackButton`, `InvestmentFundView`, `GlassCard` inline. Conserver une seule source par composant. | `src/components/views/*`, `src/components/AfriStocksApp.tsx`, `src/app/components/Toast.tsx` vs `src/components/Toast.tsx`, etc. | Un seul exemplaire de chaque composant ; build OK ; grep des imports valide. | — | M | 1 | P1 | Supprimer le mauvais doublon ; verifier l'arbre d'imports d'abord |
| FRON-04 | Unifier la config (next/tailwind/postcss) | Garder un seul `next.config.*`, un seul `tailwind.config.*`, un seul `postcss.config.*`. Fusionner le contenu utile. **Trancher l'incoherence Tailwind v3 (`tailwindcss@^3.4.17`) vs v4 (`@tailwindcss/postcss@^4.1.11`)** : choisir une version et aligner postcss. | `next.config.{js,ts,build.js}`, `tailwind.config.{js,ts}`, `postcss.config.{js,mjs}`, `package.json` | Un fichier par outil ; une seule version Tailwind ; `next build` reussit ; comportement identique (headers, images, rewrites preserves). | — | S | 1 | P1 | Perte de reglages lors de la fusion ; casse PostCSS si versions melangees |
| FRON-05 | Centraliser l'URL backend & les chemins API | Creer `src/config/env.ts` exposant `API_BASE_URL` (depuis `NEXT_PUBLIC_API_URL`) et constantes de chemins. Remplacer TOUS les `localhost:5001/5002` en dur (20 occurrences verifiees). | tous fichiers listes au point 7 (notamment `AdminUsersView/StartupsView/DashboardView/VerificationView`) | grep `localhost:50` = 0 hors `env.ts` ; vues Admin utilisent la meme base ; `.env.example` documente la variable. | FRON-04 | M | 1 | P0 | Risque de casser un appel mal aligne ; tester chaque appel |
| FRON-06 | Supprimer fichiers parasites & convertir JSX→TSX | Retirer `Untitled-1`, `dump.rdb`, `.DS_Store`, `.vercel/` du repo ; convertir `FileUpload.jsx` en `.tsx` type. Mettre a jour `.gitignore`. | `frontend/Untitled-1`, `dump.rdb`, `src/components/FileUpload.jsx` | Fichiers parasites absents ; `.gitignore` couvre `.DS_Store`, `*.rdb` ; `FileUpload.tsx` compile en strict. | — | S | 1 | P2 | Aucun |
| FRON-07 | Activer le gating ESLint/TS au build | Passer `eslint.ignoreDuringBuilds` a `false` ; corriger les erreurs revelees ; activer `typescript.ignoreBuildErrors:false`. | `next.config.js`, sources | `next build` echoue si lint/type error ; build vert apres corrections. | FRON-03, FRON-05 | L | 1 | P1 | Nombreuses erreurs latentes (any, imports morts) |

#### EPIC B — Migration vers l'App Router (routing & decoupage de page.tsx)
*Objectif : remplacer le routing maison `activeView` par les routes App Router de Next 15, eclater `page.tsx` (1538 l.) en segments/layouts, restaurer URLs partageables, SSR/SEO et navigation native. **Prerequis bloquant : la decision #3 (routing localise `[locale]` oui/non) doit etre tranchee AVANT FRON-11** pour figer l'arborescence cible une seule fois et eviter la double restructuration avec EPIC F.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| FRON-50bis | Figer l'arborescence cible (decision i18n) | Trancher la decision #3 et arreter l'arborescence `app/` definitive : **avec** segment `app/[locale]/...` si i18n localise retenu, **sans** sinon. Documenter le schema de routes cible (public/admin/startup) qui servira de reference a FRON-11/13. | doc d'archi de routing, `src/app/` (squelette) | Schema d'arborescence valide et ecrit ; FRON-11 part de ce schema ; aucune re-restructuration `[locale]` prevue apres EPIC B. | decision #3 | S | **2 (debut)** | P0 | Si non tranche, double restructuration de `app/` (EPIC B puis F) |
| FRON-10 | Extraire Header/Footer/Newsletter dans un layout | Sortir `Header`, `Footer`, `NewsletterModal`, `AccountTypeSelection` de `page.tsx` vers `components/layout/` et un `app/layout.tsx` enrichi. | `src/app/page.tsx`, `src/components/layout/`, `src/app/layout.tsx` | `page.tsx` ne contient plus ces composants ; ils s'affichent sur toutes les pages via le layout ; rendu visuel inchange. | FRON-03 | M | 2 | P0 | Etats partages (menu, notifications) a remonter en contexte |
| FRON-11 | Creer les routes App Router | Creer les segments selon l'arborescence figee par FRON-50bis : `(public)/startups`, `/portfolio`, `/trading`, `/actualites`, `/formations`, `/faq`, `/startups/[id]`, `/investment/checkout`, et `(admin)/admin/*` — **sous `app/[locale]/` si la decision #3 retient le routing localise**. Chaque page importe la vue correspondante. | `src/app/**/page.tsx` (eventuellement `app/[locale]/**`), `src/app/views/*` | Chaque vue accessible par URL dediee ; back/forward navigateur fonctionnel ; liens partageables ; arborescence conforme a FRON-50bis. | FRON-10, FRON-50bis | XL | 2 | P0 | Passage de props (`setActiveView`) a remplacer par `next/navigation` ; `[locale]` integre maintenant pour ne pas re-router en EPIC F |
| FRON-12 | Remplacer `setActiveView`/props par navigation | Substituer toutes les props `setActiveView`, `setShowAuthModal`, `setAuthMode`, `setSelectedStartup`, `setCheckoutData` par `useRouter()`/`Link` et par des contextes/route params. | toutes les vues sous `app/views/` | Plus aucune prop `setActiveView` ; navigation par `router.push`/`<Link>` ; `selectedStartup` derive de l'URL `[id]`. | FRON-11 | L | 2 | P0 | Surface de modif large ; tests de non-regression requis |
| FRON-13 | Segmenter les espaces admin/startup avec layouts dedies | `(admin)/layout.tsx` avec `AdminSidebar`/`AdminHeader` ; `(startup)/layout.tsx`. Proteger par garde de role (FRON-23). | `src/app/(admin)/layout.tsx` (ou `app/[locale]/(admin)/layout.tsx`), `components/admin/*` | Sidebar/header admin partages ; pages admin sous un layout unique ; non-admin redirige. | FRON-11, FRON-23 | M | 2 | P1 | Reutiliser les `AdminSidebar/Header` (1173 l. chacun) a auditer |
| FRON-14 | Convertir en Server Components ce qui peut l'etre | Marquer en RSC les vues purement presentationnelles (Formations, FAQ, Guide, contenu statique) ; reserver `'use client'` aux vues interactives. | `app/views/learn/*`, vues statiques | RSC par defaut, `'use client'` cible ; bundle client reduit (mesure avant/apres). | FRON-11 | L | 3 | P2 | Hooks/handlers a isoler dans des sous-composants client |
| FRON-15 | Page 404 / error boundaries / loading | Ajouter `not-found.tsx`, `error.tsx`, `loading.tsx` par segment. | `src/app/**/{not-found,error,loading}.tsx` | URL inconnue → 404 stylee ; erreur runtime → fallback ; transitions → skeleton. | FRON-11 | M | 2 | P1 | — |

#### EPIC C — Authentification reelle & securite client
*Objectif : remplacer le stockage localStorage du JWT par des cookies httpOnly + refresh, centraliser le client HTTP, proteger les routes par role. **Ordre de la chaine auth strictement impose : FRON-20 → FRON-21 → FRON-22 → FRON-02 (cette derniere en EPIC A mais executee en dernier).** Ne jamais supprimer le mock avant que le vrai provider soit adopte.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| FRON-20 | Client HTTP unique avec gestion token | Garder UNE instance (axios ou fetch wrapper), avec intercepteurs : injection token, refresh sur 401, gestion erreurs. Supprimer `config/api.ts` et le doublon. **Premier maillon de la chaine auth.** | `src/services/api.ts`, `src/config/api.ts` | Une seule instance exportee ; tous les appels passent par elle ; `config/api.ts` supprime. | FRON-05 | M | 2 | P0 (1/4) | Aligner les chemins (`/api/...`) reellement servis par le backend |
| FRON-21 | Auth via cookies httpOnly + refresh | Implementer login/refresh/logout via Route Handlers `app/api/auth/*` posant des cookies httpOnly (proxy backend), sortir le JWT du localStorage. **Deuxieme maillon ; requiert FRON-20.** | `src/app/api/auth/*`, `page.tsx` l.207-364 | Token absent de `localStorage` (grep=0) ; cookie httpOnly present ; refresh transparent ; XSS ne peut plus voler le token. | FRON-20, backend (endpoint refresh) | L | 2 | P0 (2/4) | Depend d'un endpoint refresh backend ; CORS/credentials a coordonner |
| FRON-22 | Contexte Auth reel (remplace le mock) | Reecrire un `AuthProvider`/`useAuth` branche sur le vrai flux, source unique de `user`/`isAuthenticated`/`role`. Brancher `page.tsx` et le header dessus. **Troisieme maillon ; doit etre adopte AVANT la suppression du mock (FRON-02).** | `src/contexts/AuthContext.tsx`, `app/layout.tsx`, `page.tsx` | `useAuth` utilise dans Header/vues (grep > 0 hors definition — actuellement 0, verifie) ; etat auth non duplique dans `page.tsx` ; `mockUser` non utilise. | FRON-21 | M | 2 | P0 (3/4) | Migration de l'etat local actuel de `page.tsx` ; FRON-02 suit immediatement |
| FRON-23 | Gardes de route par role | Middleware Next (`middleware.ts`) + verif serveur : `/admin/*`→ADMIN, `/startup/*`→STARTUP, pages privees→authentifie. | `src/middleware.ts`, layouts (admin)/(startup) | Acces direct URL admin sans role → redirection ; teste pour les 3 roles. | FRON-13, FRON-22 | M | 2 | P0 | Verif role aussi cote backend (defense en profondeur) |
| FRON-24 | Validation de formulaires (Zod + RHF) | Utiliser `react-hook-form` + `zod` (deja installes) pour login/register/checkout au lieu de la validation manuelle de `AuthModal`. | `components/auth/AuthModal.tsx`, vues a formulaire | Schemas zod ; messages d'erreur i18n-ready ; validation manuelle supprimee. | FRON-22 | M | 2 | P1 | — |
| FRON-25 | Flux 2FA (TOTP) cote UI | Ecran de saisie code 2FA apres login si active, gestion `requires2FA` renvoye par le backend. | nouvelle vue `(public)/login/2fa`, client auth | Si compte 2FA, ecran code obligatoire ; succes → session. | FRON-21, backend 2FA | M | 3 | P1 | Depend du contrat backend 2FA |

#### EPIC D — Data fetching & etats (React Query)
*Objectif : remplacer les `fetch` disperses et les donnees mock par React Query (deja monte), avec cache, loading et erreurs unifies. **Prerequis transverse : le branchement des vues sur l'API (FRON-32/33) est gele tant que le contrat backend (OpenAPI) du domaine n'est pas fige** — sinon travail UI « en l'air ».*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| FRON-30 | Couche services typee par domaine | Creer `services/{startup,wallet,investment,news,admin,fund}.ts` (fonctions typees) au-dessus du client unique. **Les types/chemins doivent deriver d'un contrat backend fige (OpenAPI) ; ne pas demarrer un domaine dont le contrat n'est pas stabilise.** | `src/services/*` | Chaque endpoint a une fonction typee, alignee sur le contrat OpenAPI du domaine ; plus de `fetch` direct dans les vues (grep cible). | FRON-20, contrats API backend figes (par domaine) | L | 2 | P0 | Necessite stabilisation des contrats backend ; sinon retravail |
| FRON-31 | Hooks React Query | `useStartups`, `useStartup(id)`, `usePortfolio`, `useWallet`, `useNews`, `useAdminUsers`, etc. avec cles de cache. | `src/hooks/queries/*` | grep `useQuery` > 0 (actuellement 0, verifie) ; vues consomment les hooks ; cache verifiable. | FRON-30 | L | 2 | P0 | Invalidations a bien penser (mutations) |
| FRON-32 | Brancher StartupsView/HomeView sur l'API | Remplacer les tableaux mock par `useStartups`/`useNews`. **Gele tant que le contrat backend startups/news n'est pas fige** (route startups backend actuellement vide). | `app/views/StartupsView.tsx`, `HomeView.tsx` | Donnees mock supprimees ; liste alimentee par l'API ; filtres/tri fonctionnent sur donnees reelles. | FRON-31, contrat API startups/news fige | M | 3 | P1 | Endpoint startups backend (route actuellement vide) |
| FRON-33 | Brancher Portfolio/Trading/Wallet | Connecter PortfolioView, TradingView, et l'UI wallet (depot/retrait) aux services. **Gele tant que les contrats wallet/investment ne sont pas figes** (route withdraw absente cote backend). | `app/views/PortfolioView.tsx`, `TradingView.tsx` | Soldes/positions reels ; bouton retrait appelle `POST /api/wallet/withdraw`. | FRON-31, backend (route withdraw + contrats figes) | L | 3 | P1 | Route withdraw absente cote backend |
| FRON-34 | Etats loading/erreur/vide unifies | Composants `<Skeleton>`, `<ErrorState>`, `<EmptyState>` reutilises par tous les hooks. | `src/components/ui/*` | Chaque vue data affiche skeleton, erreur reessayable et etat vide. | FRON-31 | M | 3 | P1 | — |
| FRON-35 | Mutations & invalidation | `useMutation` pour investir, souscrire newsletter (actuellement `setTimeout` mock l.62-78), actions admin. | vues concernees | Newsletter/investissement appellent l'API ; cache invalide apres succes ; toast reel. | FRON-31 | M | 3 | P1 | — |

#### EPIC E — Design system, UI & accessibilite
*Objectif : factoriser les primitives UI (glassmorphism), homogeneiser, rendre l'app accessible.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| FRON-40 | Primitives UI unifiees | `Button`, `Input`, `Modal`/`Dialog` (via `@radix-ui/react-dialog` deja installe), `Card`, `Badge`, `Select`. Remplacer le markup repete (boutons gradient orange dupliques partout). | `src/components/ui/*` | Composants reutilises dans ≥80% des ecrans ; styles centralises ; Radix Dialog pour les modales. | FRON-03 | L | 3 | P1 | Refactor visuel large |
| FRON-41 | Accessibilite des modales | Migrer AuthModal/AccountTypeSelection/NewsletterModal vers Radix Dialog (focus-trap, Echap, `aria-modal`). | `page.tsx`, `components/auth/AuthModal.tsx` | Navigation clavier complete ; lecteur d'ecran annonce la modale ; Echap ferme. | FRON-40 | M | 3 | P1 | — |
| FRON-42 | a11y globale | `aria-label` sur boutons icone (cloche, menu, X), `alt` sur images, ordre de focus, contrastes verifies. | tous composants | Audit axe/Lighthouse a11y ≥ 90 ; 0 bouton icone sans label. | FRON-40 | L | 3 | P1 | Le theme sombre/glass peut poser des contrastes |
| FRON-43 | Metadata & SEO | Corriger `layout.tsx` (title/description AfriStocks, `lang="fr"`), ajouter `generateMetadata` par route, OpenGraph, favicon. | `src/app/layout.tsx`, pages | Plus de "Create Next App" ; `<html lang="fr">` ; metadonnees par page. | FRON-11 | S | 2 | P1 | — |
| FRON-44 | Theme & tokens Tailwind | Centraliser couleurs (orange/amber/emerald), espacements, glass dans `tailwind.config` + variables CSS ; supprimer les `style={{}}` inline disperses. | `tailwind.config.*`, `globals.css` | Tokens utilises ; styles inline gradient/glass reduits. | FRON-04, FRON-40 | M | 3 | P2 | — |

#### EPIC F — Internationalisation (FR/EN)
*Objectif : externaliser les chaines et offrir FR/EN. **L'arborescence `[locale]` ayant ete figee par FRON-50bis et integree des EPIC B, cet EPIC ne re-route PLUS l'arbre `app/`** : il se limite a installer la lib, configurer le middleware de locale et externaliser les chaines. C'est la correction de la double-restructuration relevee.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| FRON-50 | Mettre en place next-intl (sur arbre deja localise) | Installer/configurer `next-intl` (compatible App Router) **sur la structure `app/[locale]/` deja en place depuis FRON-11** : provider, middleware de detection/redirection de locale, FR par defaut, EN secondaire. **Aucune reorganisation de routes ici** si FRON-50bis a retenu `[locale]`. | `i18n.ts`, `middleware.ts`, `messages/{fr,en}.json` | Switch de langue fonctionnel ; FR par defaut ; routes localisees deja existantes branchees ; arbre `app/` non re-restructure. | FRON-50bis, FRON-11 | M | 3 | P2 | Si decision #3 a finalement ecarte `[locale]`, fallback sur routing par cookie sans prefixe (pas de re-route) |
| FRON-51 | Externaliser les chaines | Extraire tout le texte FR code en dur (Header, Footer, vues) vers `messages/fr.json` et traduire `en.json`. | toutes les vues | grep de texte FR inline ≈ 0 dans le JSX ; cles utilisees via `useTranslations`. | FRON-50 | XL | 3 | P2 | Volume eleve (24 vues) ; geler l'ajout de texte non-i18n des FRON-50 |
| FRON-52 | Formats locale (devise/date/nombre) | Formater montants (XOF/FCFA) et dates via `Intl`/`date-fns` selon la locale. | composants d'affichage montants | Montants/dates formates selon locale ; tests sur FR/EN. | FRON-51 | M | 3 | P2 | Choix devise a valider (cf. decisions) |

#### EPIC G — Performance & build
*Objectif : reduire le bundle, optimiser images et rendu.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| FRON-60 | Migrer `<img>` vers `next/image` | Remplacer les 8 `<img>` par `next/image` avec dimensions et lazy-loading. | composants avec `<img>` | 0 `<img>` brut ; images optimisees ; CLS reduit. | FRON-04 | M | 3 | P2 | Domains/remotePatterns a completer |
| FRON-61 | Code-splitting des grosses vues | `next/dynamic` pour AdminNewsView (1002 l.), AdminStats/Header/Sidebar (1173 l. chacun), TradingChart (lightweight-charts). | vues lourdes | Bundle initial reduit (rapport `next build` avant/apres) ; chargement differe verifie. | FRON-14 | M | 3 | P2 | — |
| FRON-62 | Audit dependances | Verifier l'usage reel de `gsap`, `@gsap/react`, `firebase`, `recharts` vs `lightweight-charts`, `react-simple-typewriter`. Retirer le superflu. | `package.json` | Dependances non utilisees supprimees ; build OK ; bundle reduit. | FRON-01 | M | 3 | P2 | Firebase peut etre voulu (push) — a confirmer |
| FRON-63 | Budget perf & Lighthouse CI | Definir budgets bundle/LCP et integrer Lighthouse au CI. | config CI | Lighthouse perf ≥ 80 sur pages cles ; CI echoue si regression. | FRON-65, Infra (CI) | M | 4 | P2 | Depend du CI (domaine Infra) |

#### EPIC H — Tests & qualite
*Objectif : passer de 1 test (probablement casse) a une couverture utile + gating CI.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| FRON-65 | Reparer le harnais de test | Corriger `GlassCard.test.ts` (cible le bon composant), fiabiliser `jest.config.js`/`jest.setup.js`, alias `@/`. | `__test__/*`, `jest.config.js` | `npm test` vert ; alias resolus ; au moins 1 test pertinent passe. | FRON-03 | S | 2 | P1 | Le composant teste actuel n'existe pas tel quel |
| FRON-66 | Tests unitaires composants/hooks | Tester primitives UI, hooks React Query (msw pour mock API), garde de role. | `__test__/**` | Couverture ≥ 50% sur `components/ui` et `hooks/queries`. | FRON-31, FRON-40 | L | 3 | P1 | — |
| FRON-67 | Tests E2E parcours cles | Playwright : inscription, login, navigation, investissement, vue admin. **A ecrire AVANT la migration App Router (EPIC B) pour servir de filet de non-regression de navigation**, puis a maintenir. | `e2e/*`, config Playwright | 5 parcours verts en CI sur build de prod local. | FRON-21 (parcours auth) ; harnais Playwright des debut Phase 2 | L | 4 (harnais des P2) | P2 | Necessite backend de test ; ecrire les parcours navigation avant FRON-11/12 |
| FRON-68 | Lint/format/typecheck en CI | `next lint`, `tsc --noEmit`, Prettier dans le pipeline (domaine Infra). | config CI | PR bloquee si lint/type/test echoue. | FRON-07, Infra (CI) | M | 4 | P1 | Depend du CI |

---

### Risques specifiques au domaine

- **Migration App Router a fort rayon de blast (EPIC B)** : tout le routing repose sur `activeView` + props `setActiveView` injectees dans ~24 vues. La conversion en routes + `useRouter` touche quasiment tous les fichiers ; risque de regressions de navigation. Mitiger par des tests E2E (FRON-67) ecrits **avant** la migration et par un decoupage page par page.
- **Double restructuration de l'arbre `app/` (EPIC B puis EPIC F)** : sans decision i18n anticipee, on reorganise l'arborescence une premiere fois en migrant vers l'App Router, puis une seconde fois en introduisant `[locale]`. **Mitige par FRON-50bis** (gel de l'arborescence cible avant FRON-11) et par l'integration de `[locale]` des EPIC B si la decision #3 le retient ; EPIC F ne re-route alors plus.
- **Couches concurrentes trompeuses & ordre auth** : la coexistence de `AuthContext` mock, `services/api.ts` (cookie) et du flux `fetch`+localStorage de `page.tsx` peut induire un developpeur a brancher la mauvaise couche. **L'ordre FRON-20 → FRON-21 → FRON-22 → FRON-02 est strictement impose** (suppression du mock en dernier) ; le non-respect cree un trou d'auth ou une regression. `useAuth`/`AuthProvider` n'etant importes nulle part aujourd'hui (verifie), le risque est uniquement de cablage incorrect lors de la bascule.
- **Dependance forte au backend & travail UI « en l'air »** : data fetching reel (EPIC D), refresh token (FRON-21), 2FA (FRON-25), retrait wallet (FRON-33), startups (FRON-32) sont bloques par des endpoints backend absents ou instables (route startups vide, route withdraw manquante). **Mitige par le gel : aucune vue data n'est branchee tant que le contrat OpenAPI du domaine n'est pas fige** (prerequis sur FRON-30/32/33).
- **Securite : JWT en localStorage** maintenu tant que FRON-21 n'est pas livre → fenetre de vulnerabilite XSS sur un produit financier. A traiter en P0, debut Phase 2.
- **i18n tardive (EPIC F) apres beaucoup de texte ecrit en dur** : externaliser 24 vues (FRON-51) est volumineux et fastidieux ; cout croissant tant que de nouvelles chaines FR sont ajoutees. Geler l'ajout de texte non-i18n des FRON-50, et figer l'arborescence des FRON-50bis.
- **Travail non commite** : la base fev. 2026 n'est pas dans git (`restore-frontend-2025-08-11`). Risque de perte ; toute refonte doit commencer par un commit de l'existant (coordination domaine Organisation/Infra).
- **Tailwind v3 vs v4** : `package.json` melange `tailwindcss@^3.4.17` et `@tailwindcss/postcss@^4.1.11` — incoherence de version pouvant casser le build PostCSS ; tranchee dans FRON-04.

### Decisions a valider par le porteur du projet

1. **Strategie de session** : cookies httpOnly + refresh token (recommande pour un produit financier) vs maintien du JWT cote client. Impacte FRON-21/22 et la coordination CORS backend.
2. **Bibliotheque i18n** : `next-intl` (recommande, natif App Router) vs `react-i18next`. Et perimetre : FR seul au MVP puis EN, ou FR/EN des le depart ?
3. **Routing localise (A TRANCHER TOT — debut Phase 2, avant FRON-11)** : adopter le segment `[locale]` (impacte l'arborescence `app/` et donc l'integration directe en EPIC B via FRON-50bis) ou langue sans prefixe d'URL ? **Cette decision conditionne l'evitement de la double restructuration ; elle doit etre prise avant la creation des routes (FRON-11), pas en Phase 3.**
4. **Devise & formats** : FCFA/XOF par defaut ? Multi-devises ? (impacte FRON-52 et l'affichage des montants).
5. **Firebase** : conserver Firebase Messaging/Analytics (push web) ou le retirer ? (`services/firebase.ts` present mais init conditionnelle ; impacte FRON-62 et le bundle).
6. **Graphiques** : standardiser sur `lightweight-charts` (trading) + `recharts` (dashboards) ou n'en garder qu'un ? (impacte FRON-62).
7. **Hebergement** : Vercel (presence de `.vercel/`, `vercel.json`, `VERCEL_DEPLOYMENT.md`) vs Docker/K8s (un `Dockerfile` frontend existe). Choix structurant pour build, ISR, images et CI.
8. **Profondeur de la refonte UI** : refonte complete du design system (EPIC E) vs simple factorisation minimale, selon le budget et l'echeance MVP.
9. **Contrats API (prerequis EPIC D)** : a quel moment le backend fige-t-il les contrats OpenAPI par domaine (startups, wallet, investment, news, admin) ? Le branchement des vues data (FRON-32/33) est gele jusque-la pour eviter le retravail.

Fichiers de reference cles (chemins absolus) : `/Users/cyrilsohnde/afristocks/frontend/src/app/page.tsx` (1538 l.), `/Users/cyrilsohnde/afristocks/frontend/src/contexts/AuthContext.tsx` (mock, `mock-token` l.61/79, non importe), `/Users/cyrilsohnde/afristocks/frontend/src/services/api.ts` & `/Users/cyrilsohnde/afristocks/frontend/src/config/api.ts` (couches mortes), `/Users/cyrilsohnde/afristocks/frontend/src/app/views/` (24 vues), `/Users/cyrilsohnde/afristocks/frontend/src/components/views/` (doublons), `/Users/cyrilsohnde/afristocks/frontend/src/app/layout.tsx`, `/Users/cyrilsohnde/afristocks/frontend/next.config.js`, `/Users/cyrilsohnde/afristocks/frontend/package.json`, `/Users/cyrilsohnde/afristocks/frontend/__test__/components/GlassCard.test.ts`.

---

All v1 claims are verified against the current disk state: `App.tsx` 1165 lines, 0 accessibility refs, `formatCurrency`/XOF hardcoded, `index.js` → `./App` monolith, `src/` orphan, `process.env.API_URL` fallback. The three control-agent gaps are valid: no a11y epic, no i18n parity epic, and sequencing/feasibility issues. Here is the finalized v2 section.

---

## Application mobile (React Native)

### Etat actuel (verifie sur le code)

**Score : 2,5 / 10** (l'audit du 9 fev. indiquait 3/10 ; le delta reel est nul a negatif — voir ci-dessous).

#### Ce qui fonctionne

- Le projet RN compile en theorie : `react-native@^0.80.1`, `react@^19.1.0`, TypeScript `^5.8.3` (`/Users/cyrilsohnde/afristocks/mobile/package.json`).
- Structure native iOS/Android presente (`/Users/cyrilsohnde/afristocks/mobile/ios/AfriStocksMobile.xcworkspace`, `/Users/cyrilsohnde/afristocks/mobile/android/app/build.gradle`).
- Un seul appel API reel et fonctionnel : `checkHealth()` qui frappe `${API_URL}/health` (`/Users/cyrilsohnde/afristocks/mobile/src/services/api.ts`).
- 4 fichiers de tests existent et sont non triviaux : `__tests__/App.test.tsx` (smoke render), `tests/unit/api.test.ts` (3 cas : succes, erreur HTTP, erreur reseau), `tests/unit/WelcomeScreen.test.tsx`, `tests/unit/health.test.ts`. Config Jest presente (`jest.config.js`, `jest.setup.js`, `__mocks__/`).
- Lint/format configures (`.eslintrc.js`, `.prettierrc.js`).

#### Ce qui est casse / absent

- **L'UI reelle de l'app est entierement mockee.** `App.tsx` (1165 lignes, 31 530 octets — confirme sur disque ; datee aout 2025) contient **tout** : types, donnees mock (`mockStartups`, `mockInvestments`, lignes 60-124), composants `AuthScreen` et `MainScreen` imbriques dans `App`, 4 onglets (explore/portfolio/wallet/profile), une modale d'investissement et ~500 lignes de `StyleSheet`.
- **Auth fictive confirmee.** `handleAuth` (lignes 143-162 d'`App.tsx`) simule la connexion via `setTimeout(..., 1500)` puis pose un `user` en dur (`walletBalance: 50000`). Aucun appel a `/api/auth/login`, aucun token recu ni stocke.
- **Aucune integration de l'API metier.** Au-dela de `/health`, rien n'est branche. Les endpoints backend existants ne sont jamais appeles : `POST /api/auth/login`, `/register`, `/refresh-token`, `/logout`, `/2fa/generate`, `/2fa/verify` (`src/routes/auth.routes.ts`) ; `GET /api/wallet/balance`, `POST /api/wallet/deposit`, `GET /api/wallet/transactions` (`src/routes/wallet.routes.ts`) ; `GET /api/investment/startups`, `/startups/:id`, `POST /api/investment/invest/:startupId`, `GET /api/investment/my-investments` (`src/routes/investment.routes.ts`).
- **Dependances installees mais JAMAIS utilisees.** Grep sur `App.tsx` + `src/` : **0 occurrence** de `@react-navigation/*`, `react-native-keychain`, `@react-native-async-storage/async-storage`, `axios`. La navigation se fait par `useState('explore')` au lieu de React Navigation (pourtant installe : `@react-navigation/native`, `/bottom-tabs`, `/stack`). Les tokens ne sont **pas** stockes dans Keychain. `axios` installe, code utilise `fetch`.
- **Code mort / dossier `src/` orphelin.** `index.js` enregistre `./App` (le monolithe, verifie sur disque), **pas** `src/`. Les fichiers `src/components/WelcomeScreen.tsx`, `src/services/api.ts`, `src/config/constants.ts` ne sont references que par les tests, jamais par l'app reelle. L'architecture modulaire amorcee n'est pas cablee.
- **Config API non securisee.** `API_URL = process.env.API_URL || 'http://localhost:3000'` (`src/config/constants.ts`, verifie). En RN, `process.env` n'est pas resolu au runtime sans `react-native-config` / babel plugin : la valeur sera donc toujours `localhost:3000`. Pas de gestion dev/staging/prod.
- **Aucune accessibilite.** `grep` sur `App.tsx` : **0 occurrence** de `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`, `allowFontScaling`. Aucun support lecteur d'ecran (TalkBack/VoiceOver), aucune prise en charge des tailles de police systeme (Dynamic Type), contrastes non audites. Parite manquante avec le web (qui traite l'a11y, cf. FRON-42).
- **Aucune i18n ; devise et libelles en dur.** `formatCurrency` est defini inline dans `App.tsx` (L.648) avec **XOF en dur** (L.607 : libelle « Montant à investir (XOF) ») ; tous les libelles FR sont disperses dans le JSX. Aucune librairie i18n, aucun fichier de traduction, aucun partage avec la strategie i18n web.
- **Signature Android = keystore de DEBUG en release.** `android/app/build.gradle` ligne 103 : `release { signingConfig signingConfigs.debug }`, `storeFile file('debug.keystore')`. **Impubliable** sur le Play Store. `versionCode 1`, `versionName "1.0"`, `applicationId "com.afristocksmobile"`.
- **Aucun build iOS reussi documente.** `ios-build.log` (9 419 octets, daté aout 2025) presente une trace de build ; aucun pipeline ni archive signee.
- **Aucun CI/CD mobile** (0 fichier `.yml`/`.yaml` dans `mobile/`), **aucune notification push** (Firebase / `@react-native-firebase/messaging` absents), **aucune gestion offline** (`NetInfo` absent), **aucun deep-linking**, **aucune gestion d'etat globale** (pas de Context/Redux/Zustand ; tout l'etat vit dans `App`).
- **Secrets en clair.** `mobile/.env.production` versionne (placeholders mais pratique a risque) ; alignement requis avec la remediation securite globale.

#### Delta reel depuis l'audit du 9 fev.

`App.tsx` n'a **pas** ete refactore (memes 1165 lignes, datees aout 2025). Le dossier `src/` (3 fichiers) existait deja et reste orphelin. Aucun progres mobile constate : le nettoyage Phase 1 a porte sur backend/infra, **pas** sur le mobile. Le score reste a son plus bas.

---

### Cadrage de faisabilite et sequencement (a lire avant le backlog)

> **Lacune critique relevee par le controle (severite haute) : la parite MVP mobile en Phase 3 est irrealiste a l'etat actuel (2,5/10) et le mobile est dur-dependant de PAIE/KYC/BACK.** Cette section pose le cadre que le backlog ci-dessous applique.

**Principe de sequencement adopte.** Le travail mobile est decoupe en deux blocs :

1. **Bloc structurel NON-bloquant (Phase 2)** — tout ce qui ne depend d'AUCUN livrable backend : sortie du monolithe, navigation, theme, config multi-env, Keychain, store global, fondations a11y et i18n. Ce bloc est avance en **Phase 2** pour absorber le risque de blocage et eviter qu'en Phase 3 plusieurs taches deviennent simultanement bloquees faute de backend pret.
2. **Bloc de branchement API (Phase 3+)** — tous les appels metier reels, qui ne demarrent **qu'une fois le contrat OpenAPI fige** (dependance explicite sur BACK-50/BACK-52, source de verite API) et les routes argent livrees.

**Decisions structurantes prealables (voir aussi « Decisions a valider »).** Le porteur doit trancher en debut de Phase 2 :
- **Cible et niveau de parite** : option recommandee = **Android d'abord** + parite mobile complete repoussee a une **v1.1 post-MVP web**, le MVP mobile se limitant a auth + explore + investir + portfolio + wallet (depot). L'alternative (iOS+Android simultanes en MVP) **exige un ETP mobile dedie a plein temps des la Phase 2**, sans quoi l'estimation n'est pas tenable.
- Sans ETP mobile dedie, la somme MOBI-01..MOBI-19 sur la meme fenetre que web+backend+paiements est **infaisable** : le mobile doit etre explicitement marque « piste a risque de travail bloque » au **calendrier**, pas seulement dans le roster d'equipe.

---

### Backlog (epics et taches)

> Conventions : Effort S (<0,5j), M (0,5-2j), L (2-5j), XL (>5j). Phase 1-4 = feuille de route globale. Priorite P0 (bloquant MVP) / P1 (necessaire MVP) / P2 (post-MVP).
> **Note de sequencement** : les epics A, B (structurel + Keychain), G-fondations, H et I sont avances en **Phase 2** (aucune dependance backend). L'epic C (branchement metier) reste en Phase 3 et est **conditionne au gel du contrat OpenAPI (BACK-50/52)**.

#### EPIC A — Fondations & architecture modulaire
*Objectif : sortir du monolithe `App.tsx`, cabler la navigation et l'arborescence `src/`, etablir des conventions reutilisables. **Bloc structurel non-bloquant — Phase 2.***

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| MOBI-01 | Cabler l'arborescence `src/` comme point d'entree | Faire pointer `index.js` vers un `src/App.tsx` reorganise ; deplacer la logique hors de la racine. | `mobile/index.js`, `mobile/App.tsx`, `mobile/src/` | `index.js` enregistre `src/App` ; `App.tsx` racine supprime ou reduit a un re-export ; l'app demarre identique. | — | S | 2 | P0 | Casse les imports relatifs des tests |
| MOBI-02 | Mettre en place React Navigation | Remplacer le routing `useState('explore')` par un `NavigationContainer` + `BottomTabNavigator` (explore/portfolio/wallet/profile) + `StackNavigator` (auth vs app). | nouveau `src/navigation/`, `src/App.tsx` | Navigation par onglets et stack fonctionnelle ; back natif gere ; deep-link de base configure. Libs deja presentes. | MOBI-01 | M | 2 | P0 | Setup `react-native-screens`/`gesture-handler` natif a finaliser (pods/gradle) |
| MOBI-03 | Decouper `App.tsx` en ecrans | Extraire `AuthScreen`, `ExploreScreen`, `PortfolioScreen`, `WalletScreen`, `ProfileScreen`, `InvestmentModal` en fichiers dedies. | `src/screens/*`, `src/components/*` | Chaque ecran dans son fichier (<250 l.) ; `App.tsx` racine ne contient plus de JSX d'ecran ; tests de rendu par ecran. | MOBI-01, MOBI-02 | L | 2 | P0 | Regressions visuelles |
| MOBI-04 | Externaliser le design system | Sortir le `StyleSheet` (~500 l.) en `src/theme` (couleurs, espacements, typo) + composants UI reutilisables (Button, Card, Input, Badge). | `src/theme/`, `src/components/ui/` | Tokens centralises ; ecrans consomment le theme ; 0 couleur hexa en dur dans les ecrans ; ratios de contraste theme conformes WCAG AA (lien avec MOBI-41). | MOBI-03 | M | 2 | P1 | — |
| MOBI-05 | Gestion d'etat globale (Context/Zustand) | Introduire un store auth + user + wallet (pas Redux, aligne sur la decision web). | `src/store/` | `user`, `token`, `walletBalance` accessibles sans prop-drilling ; persistance au reload. | MOBI-01 | M | 2 | P0 | Choix tech a valider |
| MOBI-06 | Configuration multi-environnement | Remplacer `process.env.API_URL` par `react-native-config` (dev/staging/prod) ; `localhost` non hardcode. | `src/config/constants.ts`, `.env.*`, natif iOS/Android | `API_URL` resolu au runtime selon le build ; documente dans `README.md`. | — | M | 2 | P0 | Setup natif (Info.plist, build.gradle) |

#### EPIC B — Securite & stockage des tokens
*Objectif : auth reelle et stockage securise conforme au backend JWT + refresh.*
*Sequencement : MOBI-07 (Keychain, sans dependance backend) en Phase 2 ; MOBI-08..12 (branchement auth) en Phase 3, conditionnes au gel du contrat OpenAPI et a la stabilisation auth backend.*

| ID | Titre | Description | Fichiers | DoD | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|-----|------|--------|-------|------|---------|
| MOBI-07 | Service de stockage securise (Keychain) | Implementer `secureStorage` (set/get/delete token) via `react-native-keychain` (deja installe, jamais utilise). | `src/services/secureStorage.ts` | Token jamais en clair ni dans AsyncStorage ; teste sur iOS et Android. | MOBI-01 | M | 2 | P0 | API Keychain differente iOS/Android |
| MOBI-08 | Client HTTP avec intercepteurs | Centraliser `axios` : base URL, header `Authorization: Bearer`, intercepteur de refresh sur 401, timeout, gestion d'erreurs typee. | `src/services/httpClient.ts` | Toute requete authentifiee injecte le token ; 401 declenche `/auth/refresh-token` puis rejoue ; sinon logout. **Demarre seulement apres gel du contrat OpenAPI (BACK-50/52).** | MOBI-06, MOBI-07, **BACK-50/52 (contrat OpenAPI)** | L | 3 | P0 | Boucle de refresh ; race conditions ; contrat API instable si non fige |
| MOBI-09 | Auth reelle (login/register) | Brancher `AuthScreen` sur `POST /api/auth/login` et `/register` ; supprimer le `setTimeout` mock (App.tsx L.143-162). | `src/screens/AuthScreen.tsx`, `src/services/authService.ts` | Login/register reels ; token stocke (MOBI-07) ; erreurs backend affichees ; mock supprime. | MOBI-08, **stabilisation auth backend (SECU-14 flux 2FA, modele session DEC-G)** | L | 3 | P0 | Cabler avant stabilisation auth = retravail garanti ; format reponse a verifier |
| MOBI-10 | Refresh token & session persistante | Au demarrage, restaurer la session depuis Keychain ; rafraichir le token ; auto-login si valide. | `src/store/`, `src/services/authService.ts` | Reouverture de l'app sans re-login tant que le refresh token est valide. | MOBI-08, MOBI-09 | M | 3 | P0 | Expiration/rotation des refresh tokens |
| MOBI-11 | Logout reel | Brancher le logout (App.tsx L.488-507) sur `POST /api/auth/logout` + purge Keychain + reset store. | `src/screens/ProfileScreen.tsx`, store | Token revoque cote serveur ; aucune donnee residuelle ; retour ecran auth. | MOBI-09 | S | 3 | P0 | — |
| MOBI-12 | Support 2FA (TOTP) | Ecran de saisie du code 2FA ; brancher `/api/auth/2fa/verify` dans le flux login si requis. | `src/screens/TwoFactorScreen.tsx` | Si compte 2FA, login demande le code et le valide. | MOBI-09, **backend 2FA (SECU-14)** | M | 3 | P1 | Middleware auth backend 2FA incomplet (cf. audit) |
| MOBI-13 | Authentification biometrique | Deverrouillage par Face ID / empreinte pour reouvrir l'app (Keychain + biometrie). | `src/services/secureStorage.ts` | Reauth biometrique optionnelle activable ; fallback PIN/mot de passe. | MOBI-07 | M | 4 | P2 | Variabilite materiel |

#### EPIC C — Parite fonctionnelle metier (MVP)
*Objectif : remplacer toutes les donnees mock par l'API reelle, a parite avec le web.*
*Sequencement : **tout l'epic est conditionne au gel du contrat OpenAPI (BACK-50/52)** et demarre en Phase 3. Les taches dependant de features backend absentes (MOBI-18, -19, -21) sont signalees comme a risque de blocage.*

| ID | Titre | Description | Fichiers | DoD | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|-----|------|--------|-------|------|---------|
| MOBI-14 | Liste & detail des startups | Remplacer `mockStartups` (App.tsx L.61-101) par `GET /api/investment/startups` et `/startups/:id`. | `src/screens/ExploreScreen.tsx`, `src/services/investmentService.ts` | Liste reelle, recherche, pull-to-refresh reel ; detail charge depuis l'API. | MOBI-08, **BACK-50/52** | M | 3 | P0 | Champs schema vs UI (logo/growth absents cote backend) |
| MOBI-15 | Investissement reel | Brancher la modale (App.tsx L.256-288, L.564-639) sur `POST /api/investment/invest/:startupId` ; validation cote serveur. | `src/components/InvestmentModal.tsx`, service | Investissement persiste ; solde wallet mis a jour ; erreurs (solde insuffisant) gerees serveur. | MOBI-14, MOBI-16 | L | 3 | P0 | Coherence calcul actions (arrondi L.618) |
| MOBI-16 | Wallet : solde & transactions | Remplacer le solde mock par `GET /api/wallet/balance` et l'historique vide (App.tsx L.453-458) par `GET /api/wallet/transactions`. | `src/screens/WalletScreen.tsx`, `src/services/walletService.ts` | Solde et historique reels ; etats vide/erreur/chargement. | MOBI-08, **BACK-50/52** | M | 3 | P0 | Format `Decimal(20,2)` a parser sans perte |
| MOBI-17 | Depot de fonds | Brancher le bouton « Deposer » (App.tsx L.442) sur `POST /api/wallet/deposit`. | `src/screens/DepositScreen.tsx` | Flux depot fonctionnel ; solde rafraichi. | MOBI-16 | M | 3 | P0 | Paiements (Orange/MTN/Wave) non implementes backend |
| MOBI-18 | Retrait de fonds | Bouton « Retirer » (App.tsx L.446) — **route backend `POST /api/wallet/withdraw` absente** (annoncee dans `src/routes/index.ts` L.87 mais non implementee dans `wallet.routes.ts` — confirme). | `src/screens/WithdrawScreen.tsx` | Flux retrait fonctionnel une fois la route backend livree. | MOBI-16, **backend withdraw (route a creer)** | M | 3 | P1 | **Bloque par backend** ; ne pas planifier avant livraison route |
| MOBI-19 | Portfolio reel | Remplacer `mockInvestments` (App.tsx L.103-124) par `GET /api/investment/my-investments` ; calcul rendement cote serveur. | `src/screens/PortfolioScreen.tsx` | Portefeuille reel ; valeur totale et rendement issus de l'API. | MOBI-08, **backend rendement (absent, a creer)** | M | 3 | P0 | **Calcul de rendement absent backend** (cf. audit) — risque de blocage |
| MOBI-20 | Profil utilisateur reel | Charger le profil (`UserProfile`) ; afficher role/email reels (App.tsx L.462-472). | `src/screens/ProfileScreen.tsx` | Donnees profil reelles ; edition basique si endpoint dispo. | MOBI-09 | S | 3 | P1 | Endpoint profil a confirmer |
| MOBI-21 | Parcours KYC | Remplacer le menu « Verification KYC » inerte (App.tsx L.476) par un vrai flux (upload pieces). | `src/screens/KycScreen.tsx` | Soumission KYC fonctionnelle. | **upload S3 + logique KYC backend (absents)** | L | 4 | P2 | **Bloque par backend** (logique KYC + S3 absents) |
| MOBI-22 | Notifications in-app | Brancher le modele `Notification` (liste/lecture). | `src/screens/NotificationsScreen.tsx` | Notifications reelles listees et marquables comme lues. | MOBI-08, endpoint notif | M | 4 | P2 | Endpoint a confirmer |

#### EPIC D — Robustesse : offline, etats, erreurs
*Objectif : rendre l'app utilisable en reseau degrade et tracable.*

| ID | Titre | Description | Fichiers | DoD | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|-----|------|--------|-------|------|---------|
| MOBI-24 | Detection reseau (offline) | Integrer `@react-native-community/netinfo` ; banniere hors-ligne ; desactivation des actions reseau. | `src/hooks/useNetwork.ts` | Etat reseau reactif ; UI adaptee hors-ligne ; banniere annoncee aux lecteurs d'ecran (lien MOBI-41). | — | M | 3 | P1 | Dep a installer |
| MOBI-25 | Cache & data-fetching | Introduire TanStack Query (cache, retry, staleness) pour startups/wallet/portfolio. | `src/services/*`, providers | Cache + retry + invalidation ; lecture offline du dernier etat. | MOBI-08 | L | 3 | P1 | Courbe d'apprentissage |
| MOBI-26 | Etats UI standardises | Composants loading/empty/error reutilisables sur tous les ecrans (App.tsx n'a qu'un empty state L.454). | `src/components/ui/State*` | Chaque ecran gere chargement/vide/erreur de facon coherente. | MOBI-04 | M | 3 | P1 | — |
| MOBI-27 | Reporting d'erreurs (Sentry) | Integrer Sentry (crash + erreurs JS), source maps iOS/Android. | natif + `src/` | Crashs remontes avec stack ; release tagguee. | MOBI-31 | M | 4 | P2 | Cle/DSN a fournir |
| MOBI-28 | Validation de formulaires | Validation cliente (email, montant, mot de passe) avant appel API. | `src/screens/*`, `src/utils/validation.ts` | Messages d'erreur clairs ; pas d'appel API si invalide ; erreurs reliees aux champs pour les lecteurs d'ecran. | MOBI-03 | S | 3 | P1 | — |

#### EPIC E — Notifications push (Firebase)
*Objectif : notifications transactionnelles (depot, investissement, dividende).*

| ID | Titre | Description | Fichiers | DoD | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|-----|------|--------|-------|------|---------|
| MOBI-29 | Integration FCM | Installer `@react-native-firebase/app` + `/messaging` ; config iOS (APNs) + Android. | natif iOS/Android, `src/services/push.ts` | App recoit une push de test foreground/background/quit. | compte Firebase | L | 4 | P2 | Cert APNs, comptes stores |
| MOBI-30 | Enregistrement du device token | Envoyer le token FCM au backend, lie a l'utilisateur ; permission runtime (Android 13+/iOS). | `src/services/push.ts`, endpoint backend | Token persiste cote backend ; permission demandee proprement. | MOBI-29, **endpoint backend a creer** | M | 4 | P2 | Endpoint backend inexistant — a sequencer cote backend |

#### EPIC F — Build, signature & publication (CI/CD)
*Objectif : pipelines reproductibles et publication stores.*

| ID | Titre | Description | Fichiers | DoD | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|-----|------|--------|-------|------|---------|
| MOBI-31 | Keystore de release Android | Generer un keystore de prod ; sortir le secret du repo ; corriger `build.gradle` (actuellement `release` signe avec `debug.keystore`, L.103 — confirme). | `android/app/build.gradle`, secrets CI | Build release signe avec keystore de prod ; keystore hors repo ; doc de procedure. | — | M | 1 | P0 | Perte du keystore = blocage Play Store |
| MOBI-32 | Signature & provisioning iOS | Configurer certificats/profils (manuel ou fastlane match) ; capabilities (push). | `ios/`, fastlane | Archive `.ipa` signee generable. | compte Apple Developer | L | 4 | P1 | Compte Apple, certificats |
| MOBI-33 | Pipeline CI build/test | GitHub Actions : lint + `jest` + build Android (et iOS si runner macOS) a chaque PR. Inclut le gating a11y minimal (MOBI-43). | `.github/workflows/mobile-ci.yml` | PR bloquee si lint/test/build/a11y echoue. | MOBI-31 | M | 1 | P0 | Pas de runner macOS |
| MOBI-34 | Pipeline CD (TestFlight / Play Internal) | Fastlane : upload TestFlight + Play Internal testing depuis CI, versioning auto. | fastlane, workflow CD | Build distribuable aux testeurs en 1 clic. | MOBI-31, MOBI-32 | L | 4 | P1 | Secrets stores en CI |
| MOBI-35 | Gestion versions & changelog | Automatiser `versionCode`/`versionName` (actuellement 1 / 1.0) et build number iOS. | `android/app/build.gradle`, `ios/`, scripts | Version incrementee automatiquement par release. | MOBI-33 | S | 4 | P2 | — |
| MOBI-36 | Assets stores & conformite | Icones, splash, captures, descriptions FR (+ EN si i18n multilingue, cf. EPIC I), politique de confidentialite, declarations data-safety/ATT. | `ios/`, `android/`, store metadata | Fiches stores completes et conformes. | EPIC I si multilingue | M | 4 | P1 | Refus store si non conforme |

#### EPIC G — Qualite & tests
*Objectif : couverture utile et gating CI.*

| ID | Titre | Description | Fichiers | DoD | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|-----|------|--------|-------|------|---------|
| MOBI-37 | Tests des services API | Couvrir auth/wallet/investment (succes, 401+refresh, erreurs). | `tests/unit/*` | >=80% de couverture sur `src/services`. | MOBI-08..MOBI-19 | M | 3 | P1 | — |
| MOBI-38 | Tests de composants/ecrans | RTL sur ecrans cles (auth, explore, wallet, portfolio). | `tests/` | Rendu + interactions de base testes. | MOBI-03 | M | 2 | P1 | — |
| MOBI-39 | Test E2E (Detox/Maestro) | Parcours critique : login -> explore -> investir -> portfolio. | config E2E | 1 parcours E2E vert en CI. | MOBI-15, MOBI-33 | L | 4 | P2 | Stabilite emulateurs CI |
| MOBI-40 | Nettoyer le code mort | Supprimer/recabler `WelcomeScreen.tsx` orphelin ; aligner `App.test.tsx` apres refactor ; retirer mocks inutilises. | `src/`, `tests/`, `__tests__/` | 0 fichier orphelin ; tous les tests passent. | MOBI-01, MOBI-03 | S | 2 | P1 | — |

#### EPIC H — Accessibilite mobile
*Objectif : parite a11y avec le web (cf. FRON-42) ; rendre l'app utilisable au lecteur d'ecran et conforme avant publication store. **Bloc structurel non-bloquant — demarre en Phase 2 avec le refactor UI.***

> Lacune relevee par le controle (severite moyenne) : l'a11y n'avait aucun epic mobile alors que le web la traite. Epic ajoute.

| ID | Titre | Description | Fichiers | DoD | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|-----|------|--------|-------|------|---------|
| MOBI-41 | Labels & roles a11y sur composants UI | Ajouter `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`, `accessibilityState` aux composants UI (Button, Card, Input, Badge) et aux elements interactifs. | `src/components/ui/*`, `src/screens/*` | Tout element interactif est annonce par TalkBack/VoiceOver avec un libelle clair ; etats (selectionne, desactive) annonces. | MOBI-04 | M | 2 | P1 | — |
| MOBI-42 | Dynamic Type & contrastes | Activer la mise a l'echelle des polices systeme (pas de `allowFontScaling={false}` non justifie) ; verifier les contrastes du theme (WCAG AA). | `src/theme/`, `src/components/ui/*` | UI lisible aux grandes tailles de police sans rupture de layout ; contrastes >= AA documentes. | MOBI-04 | M | 2 | P1 | Casse de layout aux grandes polices |
| MOBI-43 | Audit a11y & gating CI | Audit manuel TalkBack/VoiceOver des ecrans MVP + verification a11y minimale automatisee (ex. `jest-axe`-like RN / lint a11y) integree au CI. | `tests/`, `.github/workflows/mobile-ci.yml` | Checklist a11y des ecrans MVP validee ; **gating a11y minimal bloquant avant publication store** (lien MOBI-33/MOBI-36). | MOBI-41, MOBI-42, MOBI-33 | M | 4 | P1 | Outillage a11y RN moins mature que web |

#### EPIC I — Internationalisation & devise
*Objectif : aligner l'i18n mobile sur la strategie web (memes fichiers de traduction, meme format de devise), sortir XOF et les libelles du code. **Bloc structurel non-bloquant — Phase 2/3.***

> Lacune relevee par le controle (severite moyenne) : l'i18n mobile etait reduite a une tache utilitaire (ex-MOBI-23) sans equivalent de l'epic i18n web. Epic ajoute et aligne.

| ID | Titre | Description | Fichiers | DoD | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|-----|------|--------|-------|------|---------|
| MOBI-44 | Framework i18n aligne sur le web | Introduire une lib i18n (ex. `i18next`/`react-i18next` si retenu cote web) ; partager/reutiliser les memes fichiers de traduction que le web. | `src/i18n/`, fichiers de traduction partages | Mecanisme i18n en place ; les memes cles/fichiers que le web sont consommables ; langue par defaut FR. | decision i18n web | M | 3 | P1 | Divergence de format des cles web/mobile |
| MOBI-45 | Externaliser tous les libelles FR | Remplacer les chaines FR codees en dur dans `App.tsx`/ecrans par des cles i18n. | `src/screens/*`, `src/i18n/` | 0 libelle utilisateur en dur dans le code ; toutes les chaines passent par i18n. | MOBI-44, MOBI-03 | M | 3 | P1 | Couverture exhaustive des chaines |
| MOBI-46 | Format devise/nombre centralise (ex-MOBI-23) | Centraliser `formatCurrency` (App.tsx L.648, **XOF en dur** L.607) et le formatage des nombres via la couche i18n ; preparer le multi-devises. | `src/utils/format.ts`, `src/i18n/` | Format devise testable et configurable (locale + devise) ; aligne sur le format web ; `Decimal(20,2)` formate sans perte. | MOBI-44 | S | 3 | P2 | — |

---

### Risques specifiques au domaine

- **Faisabilite de la parite MVP (risque haut)** : a 2,5/10, atteindre la parite mobile (explore/investir/portfolio/wallet) dans la fenetre Phase 3, en parallele de web+backend+paiements, est **irrealiste sans un ETP mobile dedie a plein temps des la Phase 2**. Decision requise : Android d'abord et/ou parite mobile repoussee en v1.1 (cf. cadrage de faisabilite). Le mobile doit etre marque « piste a risque » au calendrier.
- **Dependance backend forte et risque de blocage simultane** : retrait wallet (route absente), calcul de rendement (absent), KYC, upload S3, paiements (Orange/MTN/Wave) et endpoint d'enregistrement des push tokens n'existent pas cote backend. MOBI-18, MOBI-19, MOBI-21, MOBI-30 sont **bloquees**. Mitigation : avancer le bloc structurel (EPIC A, B-Keychain, H, I, G-fondations) en Phase 2 et **ne demarrer le branchement API (EPIC C, MOBI-08/09) qu'apres gel du contrat OpenAPI (BACK-50/52)** et stabilisation auth (SECU-14, modele session DEC-G), pour ne pas cabler un flux qui changera.
- **Keystore Android de prod** : actuellement la config release signe avec `debug.keystore` (L.103, confirme). Une fois le keystore de prod genere, sa perte rend toute mise a jour Play Store impossible — sauvegarde/secret management critiques (lie a la remediation securite globale).
- **iOS exige du materiel/compte payant** : compte Apple Developer (99 $/an), certificats APNs, runner macOS pour la CI. Goulot probable, renforce si la cible reste iOS+Android simultanes.
- **Accessibilite tardive = retravail** : l'a11y (EPIC H) est avancee en Phase 2 precisement pour eviter de devoir reprendre tous les ecrans plus tard ; reportée, elle deviendrait un gros chantier et un risque de refus/retard store.
- **Format `Decimal(20,2)`** : parser cote JS sans perte de precision (eviter les `float` ; envisager une lib decimale) pour les soldes et montants.
- **React 19 + RN 0.80** : ecosysteme recent ; risques de compat avec Reanimated 3, navigation, Firebase, Detox.
- **Refactor risque de regression** : extraction du monolithe `App.tsx` sans suite de tests robuste prealable (1 seul smoke test aujourd'hui) — d'ou l'avancement des tests de rendu (MOBI-38) en Phase 2.
- **`process.env` non resolu au runtime** : si non corrige (MOBI-06), l'app pointera toujours vers `localhost:3000`, donnant une fausse impression de fonctionnement en dev.

### Decisions a valider par le porteur du projet

1. **Gestion d'etat** : Context API + hooks, Zustand, ou TanStack Query seul (Redux installe cote web mais non utilise — a ne pas reproduire) ?
2. **Cible MVP mobile & parite (DECISION STRUCTURANTE, a trancher en debut de Phase 2)** : iOS + Android simultanes (exige un ETP mobile dedie a plein temps) **ou** Android d'abord + parite mobile complete repoussee en v1.1 post-MVP web ? Recommandation : Android d'abord.
3. **Niveau de parite web/mobile au lancement** : MVP mobile = auth + explore + investir + portfolio + wallet (depot), en repoussant retrait/KYC/dividendes/notifications en v1.1 ?
4. **Ressources** : un ETP mobile dedie est-il alloue des la Phase 2 ? (Condition de faisabilite si le mobile reste dans le MVP.)
5. **Fournisseur push** : Firebase Cloud Messaging confirme (vs alternative) ? Compte Firebase disponible ?
6. **Comptes & secrets** : qui detient le compte Apple Developer, le compte Google Play, et ou seront stockes keystore/certificats (gestionnaire de secrets) ?
7. **Outil E2E** : Detox ou Maestro ?
8. **i18n** : multilingue prevu (FR/EN/portugais...) ou FR seul au lancement ? La strategie (lib + fichiers de traduction) doit etre **commune au web et au mobile** (EPIC I). Devise unique XOF ou multi-devises ?
9. **Accessibilite** : niveau cible (WCAG AA recommande) et gating a11y minimal bloquant avant publication store confirme (EPIC H) ?
10. **Strategie de distribution beta** : TestFlight + Play Internal Testing des la Phase 3 pour feedback precoce ?

Fichiers cles cites (verifies sur disque) : `/Users/cyrilsohnde/afristocks/mobile/App.tsx` (1165 l.), `/Users/cyrilsohnde/afristocks/mobile/index.js` (registre `./App`), `/Users/cyrilsohnde/afristocks/mobile/package.json`, `/Users/cyrilsohnde/afristocks/mobile/src/services/api.ts`, `/Users/cyrilsohnde/afristocks/mobile/src/config/constants.ts` (`process.env.API_URL || 'http://localhost:3000'`), `/Users/cyrilsohnde/afristocks/mobile/src/components/WelcomeScreen.tsx` (orphelin), `/Users/cyrilsohnde/afristocks/mobile/android/app/build.gradle` (L.103 release = debug.keystore), `/Users/cyrilsohnde/afristocks/src/routes/{auth,wallet,investment,index}.routes.ts`.

---

All v1 claims are confirmed against the current code. Now I have everything needed to produce the v2 with the five lacunes integrated. Key facts confirmed:
- No dispute/chargeback/reversal logic (lacune 1 valid)
- `TransactionStatus` enum has only PENDING/COMPLETED/FAILED/CANCELLED — no PROCESSING/REVERSED yet (relevant to PAIE-03 and disputes)
- `deposit()` auto-completes (l.41-67), no idempotency, no nonce/replay protection, `express.json()` only, `cors()` open
- No PSP SDK anywhere

Here is the finalized v2 section.

---

## Paiements & mouvements d argent

### Etat actuel (verifie sur le code)

**Score : 1,5 / 10** (l audit du 9 fev. indiquait « paiements : 0 SDK » ; la verification au 21 juin confirme qu aucun progres reel n a ete fait sur l integration des paiements externes — le delta est nul, voire negatif sur la coherence du wallet).

**Ce qui fonctionne (mouvements *internes* uniquement, sans argent reel) :**
- Modele de donnees correct pour la comptabilite de base : `Wallet` (`balance`, `lockedBalance`, `currency` defaut `XAF`) et `Transaction` en `Decimal(20,2)` — bon choix pour eviter les erreurs de flottant (`/Users/cyrilsohnde/afristocks/prisma/schema.prisma`, l.120-157).
- Enums metier presents et coherents : `TransactionType` (DEPOSIT/WITHDRAWAL/INVESTMENT/DIVIDEND/FEE/REFUND, `schema.prisma` l.19-27) et `TransactionStatus` **limite a 4 valeurs** : PENDING/COMPLETED/FAILED/CANCELLED (`schema.prisma` l.29-34) — **ni `PROCESSING` ni `REVERSED`** (verifie), ce qui bloque la machine a etats et les reversals.
- `WalletService.deposit()` et `WalletService.withdraw()` utilisent `prisma.$transaction()` (atomicite DB) et `lockedBalance` au retrait (`/Users/cyrilsohnde/afristocks/src/services/wallet.service.ts`, l.29-146).
- `InvestmentService.invest()` debite le wallet, incremente `raisedAmount` et cree une `Transaction` de type `INVESTMENT` dans une transaction atomique (`/Users/cyrilsohnde/afristocks/src/services/investment.service.ts`, l.78-163).
- Validateurs presents pour deposit/withdraw/transfer (`/Users/cyrilsohnde/afristocks/src/validators/wallet.validator.ts`).

**Ce qui est casse, absent ou dangereux :**
- **Aucun SDK / aucun provider de paiement.** `grep` exhaustif au 21 juin sur `src` : zero reference a Orange Money, MTN MoMo, Wave, CinetPay, PayDunya, Flutterwave, Paystack (`grep -rinE "orange|momo|wave|..." src/` → NONE). Une cle morte `stripePublicKey?` jamais utilisee subsiste cote front (`/Users/cyrilsohnde/afristocks/frontend/src/services/fundService.ts` l.19). Le `.env` ne contient **aucune** variable de paiement (seulement DB/Redis/JWT).
- **Le « depot » credite le wallet sans aucun encaissement.** `WalletService.deposit()` cree la transaction en `PENDING`, fait immediatement `balance.increment` puis bascule en `COMPLETED` **sans appel a un PSP** (verifie `wallet.service.ts` l.41-67). C est de la fausse monnaie : n importe quel utilisateur peut se crediter a volonte via `POST /api/wallet/deposit`.
- **La route de retrait n existe pas.** `wallet.routes.ts` ne monte que `/balance`, `/deposit`, `/transactions` (verifie, l.11-72). `POST /api/wallet/withdraw` est documente (`src/routes/index.ts`) mais **non branche** ; `WalletService.withdraw()` et `withdrawValidator` sont du code mort non atteignable.
- **Aucun webhook, aucune verification de signature, aucun anti-rejeu.** `server.ts` n active que `express.json()` (verifie l.36) — pas de route `express.raw()` pour valider une signature HMAC. Aucune trace de `nonce`/`replay`/`timestamp` de securite (`grep` → NONE hors un `timestamp` cosmetique de healthcheck). Endpoint `GET /api/payments/status/:transactionId` est un **stub** renvoyant toujours `status:'completed'`.
- **Aucune idempotence.** `grep -rinE "idempoten" src/` → NONE. Pas de cle sur deposit/invest/withdraw ; un double-clic ou un retry reseau double l operation.
- **Pas de grand livre en double entree.** Une seule ligne `Transaction` par operation, mutation directe du solde — pas de table d ecritures (`LedgerEntry`) ni d invariant comptable verifiable.
- **Aucune gestion des litiges / chargebacks / reversals.** `grep -rinE "dispute|chargeback|reversal|reclamation|litige" src/` → NONE (verifie). Aucun modele, etat, ni workflow de contestation, de gel de fonds litigieux ou de reversal comptable.
- **Retrait jamais finalise.** `withdraw()` deplace les fonds vers `lockedBalance` et laisse la transaction en `PENDING` indefiniment : aucun job/admin pour confirmer, debiter le lock, ou rembourser en cas d echec (`wallet.service.ts` l.106-133).
- **Frais incoherents.** Aucune ligne `Transaction` de type `FEE` n est jamais creee ; les frais sont noyes dans `transaction.fee`. Types `REFUND` et `DIVIDEND` jamais emis (aucun service).
- **Validateurs non cables.** Les routes `deposit`/`withdraw` n appliquent pas `depositValidator`/`withdrawValidator` (les handlers lisent `req.body` brut, verifie `wallet.routes.ts` l.29). Incoherence de devise : validateurs en « XOF », wallet en « XAF ».
- **Securite transverse aggravante** : `app.use(cors())` ouvert a tous (verifie `server.ts` l.31, commentaire « Accepte toutes les origines temporairement »), Socket.io sans auth, Redis sans auth, secrets reels exposes — un webhook PSP serait expose dans un contexte non securise.
- **Cote client, tout est mock** : auth via `mock-token` ; aucun ecran de depot/retrait dans `frontend/src` ; mobile : 0 flux paiement.

---

### Sequencement du socle financier (matrice source de verite — inter-domaines)

> **Resolution de l incoherence de phase** signalee par le controle. Les briques fondamentales (faux depot, ledger, machine a etats, idempotence) sont decrites dans plusieurs domaines (Paiements, Backend, Data). Pour eviter double implementation et dependances circulaires, **cette matrice est l unique source de verite de phase et de responsabilite** ; les tickets des autres domaines (BACK-13, BACK-14, DATA-06, DATA-08, DATA-09) sont **fusionnes** ici, traces par un identifiant unique, et ne doivent PAS etre re-implementes ailleurs.

| Brique | Ticket unique (canonique) | Doublons fusionnes | Phase | Responsable (A) | Consommateurs (C) |
|--------|---------------------------|--------------------|-------|-----------------|-------------------|
| Neutraliser le faux depot | **PAIE-04** | — | **1** | Paiements | Front, Mobile |
| Grand livre double entree | **PAIE-01** (= DATA-06) | DATA-06 | **2** | Data (migrations) | Paiements, Backend |
| Machine a etats transactions | **PAIE-03** (= DATA-08) | DATA-08 | **2** | Data (enum/migration) | Paiements, Backend |
| Idempotence | **PAIE-02** (= DATA-09 = BACK-13) | DATA-09, BACK-13 | **2** | Backend (middleware) + Data (colonne unique) | Paiements |
| Settlement / finalisation | **PAIE-18** (= BACK-14) | BACK-14 | **2** | Paiements | Backend |

**Consequence sur les fiches ci-dessous** : PAIE-01, PAIE-02 et PAIE-03 sont **reaffectes de Phase 1 a Phase 2** (seul PAIE-04 reste en Phase 1, comme correctif d urgence du faux depot). Le chapeau (sections 4/5) doit refleter ce placement unifie.

---

### Backlog (epics et taches)

> **Echelle d effort unifiee (normative, identique a toutes les sections, cf. chapeau) : S (<0,5j) / M (0,5-2j) / L (2-5j) / XL (>5j).** Les efforts ci-dessous ont ete **re-evalues** selon cette echelle commune (l ancienne echelle locale S<1j/M1-3j/L4-8j/XL>8j est abandonnee). Phases 1-4 conformes au plan d audit. Priorite P0 (bloquant MVP) / P1 / P2.

#### EPIC A — Fondations comptables & integrite du wallet
*Objectif : etablir une comptabilite fiable, atomique et auditable AVANT de brancher tout argent reel. C est le socle non negociable.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| PAIE-01 | Grand livre double entree (= DATA-06) | Ajouter un modele `LedgerEntry` (compte debiteur, compte crediteur, montant, devise, transactionId, sens). Comptes systeme (`PLATFORM_CASH`, `USER_WALLET:<id>`, `FEES`, `PSP_SUSPENSE`, `DISPUTE_HOLD`). Toute mutation de solde passe par 2 ecritures equilibrees. **Responsabilite migrations : Data ; Paiements/Backend consommateurs.** | `prisma/schema.prisma`, nouveau `src/services/ledger.service.ts` | Migration appliquee ; tout depot/retrait/invest/frais/dividende/refund cree des ecritures equilibrees (somme debits = somme credits) ; un script de controle prouve l invariant sur la base de test. | — | XL | **2** | P0 | Refonte des services existants ; risque de regression sur soldes |
| PAIE-02 | Cle d idempotence (= DATA-09 = BACK-13) | Colonne `idempotencyKey` unique (scopee par user+endpoint) sur `Transaction` + header `Idempotency-Key` obligatoire sur deposit/withdraw/invest. Rejouer renvoie la reponse memorisee. **Middleware : Backend ; colonne unique : Data ; un seul ticket, pas de re-implementation.** | `prisma/schema.prisma`, `src/middleware/`, `src/services/wallet.service.ts`, `investment.service.ts` | Deux requetes identiques avec meme cle ne creent qu une transaction ; test prouvant l absence de double credit ; scope cle = (userId, endpoint, payload-hash) documente. | PAIE-01 | M | **2** | P0 | Scope trop large peut bloquer des op. legitimes |
| PAIE-03 | Machine a etats des transactions (= DATA-08) | Definir transitions autorisees : `PENDING → PROCESSING → COMPLETED / FAILED / CANCELLED`, et `COMPLETED → REVERSED` (pour litiges). Interdire transitions invalides au niveau service. Ajouter statuts `PROCESSING` et `REVERSED` a l enum (verifie : absents aujourd hui, `schema.prisma` l.29-34). | `prisma/schema.prisma`, `src/services/payment-state.service.ts` | Toute transition illegale leve une erreur ; matrice de transitions testee unitairement (y compris `COMPLETED → REVERSED`). | PAIE-01 | M | **2** | P0 | Migration enum Postgres delicate (ajout de valeurs) |
| PAIE-04 | Corriger le faux depot (CORRECTIF D URGENCE) | `deposit()` ne doit PLUS crediter ni passer a COMPLETED automatiquement : creer en `PENDING`, ne crediter qu apres confirmation PSP/webhook. Correctif independant des migrations lourdes. | `src/services/wallet.service.ts` (l.41-67) | Apres `POST /deposit`, solde inchange et transaction `PENDING` ; credit uniquement via PAIE-12. | — | S | **1** | P0 | Casse le parcours demo actuel — coordonner avec front/mobile |
| PAIE-05 | Cabler les validateurs + devise unique | Appliquer `depositValidator`/`withdrawValidator` aux routes ; unifier la devise (XAF partout) ; bornes montant centralisees en config. | `src/routes/wallet.routes.ts`, `src/validators/wallet.validator.ts` | Requete invalide → 400 structuree ; libelles « XAF » ; test de validation. | — | S | 1 | P0 | Faible |
| PAIE-06 | Centraliser le calcul des frais (FEE) | Service `fee.service.ts` : bareme par moyen de paiement (deposit/withdraw), creation systematique d une ligne `Transaction` type `FEE` + ecriture ledger vers compte `FEES`. | nouveau `src/services/fee.service.ts`, `wallet.service.ts` | Tout retrait genere une transaction FEE distincte ; bareme configurable ; test couvrant frais % et fixes. | PAIE-01 | M | 2 | P1 | Regles de frais PSP reelles a confirmer (decision porteur) |

#### EPIC B — Integration des fournisseurs Mobile Money (PSP)
*Objectif : encaisser et reverser reellement via les PSP cibles, derriere une abstraction commune. **MVP recommande : 1 seul PSP (Wave) ; OM/MTN en post-MVP** (cf. piste externe et DEC-2).*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| PAIE-00 | **Piste externe : onboarding marchand PSP (DEMARRAGE SEMAINE 1)** | Lancer **des la semaine 1, en parallele de la securite**, les demandes de comptes marchands + cles sandbox/production Wave (puis OM, MTN). Documenter KYB/licence requis et delai estime par PSP (typiquement 4-16 semaines, OM/MTN les plus longs) comme **jalon a risque hors controle de l equipe**. Le dev n est PAS bloque grace au mock-provider (PAIE-07). | doc projet, `.env.example` | Demandes deposees pour le(s) PSP du MVP en semaine 1 ; tableau de suivi des delais d onboarding tenu a jour ; cles sandbox obtenues avant le debut de PAIE-08. | — | S (suivi) | **1** | P0 | Delai externe pouvant decaler tout le domaine argent ; mitige par MVP 1-PSP + mock |
| PAIE-07 | Abstraction `PaymentProvider` + mock sandbox | Interface commune : `initiateCollect()`, `initiatePayout()`, `verifyStatus()`, `verifyWebhookSignature()`. Registre de providers + selection par moyen de paiement. **Fournir un mock-provider sandbox** pour debloquer le dev pendant l onboarding PSP. | nouveau `src/services/payments/provider.interface.ts`, `provider.registry.ts`, `mock.provider.ts` | Interface typee + provider factice implementant le contrat (collect/payout/webhook simules) ; tests du registre ; le dev des EPICs C/D fonctionne sans aucun PSP reel. | PAIE-03 | M | 2 | P0 | Differences fortes entre APIs Wave/OM/MTN |
| PAIE-08 | Provider Wave (PSP du MVP) | Implementer collect + payout + verif signature Wave (API Checkout / Payout). Gestion OAuth/token, retries, timeouts. | `src/services/payments/wave.provider.ts`, `.env`, `.env.example` | En sandbox : un depot Wave credite apres webhook ; un payout Wave debite ; signature validee ; test sandbox documente. | PAIE-07, PAIE-13, **PAIE-00** | L | 2 | P0 | Acces sandbox/compte marchand requis (depend de PAIE-00) |
| PAIE-09 | Provider Orange Money (POST-MVP) | Idem pour Orange Money (API Web Payment / Cash-in/Cash-out selon pays cible). | `src/services/payments/orange.provider.ts`, `.env` | Depot + retrait OM en sandbox fonctionnels, notification verifiee ; test sandbox. | PAIE-07, PAIE-13, **PAIE-00** | L | **3** | P1 | API OM varie par pays ; onboarding marchand long |
| PAIE-10 | Provider MTN MoMo (POST-MVP) | Implementer Collections (requestToPay) + Disbursements (transfer) MTN MoMo, X-Reference-Id, polling de statut. | `src/services/payments/mtn.provider.ts`, `.env` | Collect + disbursement MTN en sandbox ; correlation X-Reference-Id ↔ transaction ; test sandbox. | PAIE-07, PAIE-13, **PAIE-00** | L | **3** | P1 | Sandbox MTN exige cles API + subscription key |
| PAIE-11 | Gestion centralisee des credentials PSP | Stocker cles/secrets par provider via variables d env + (a terme) secret manager ; jamais en clair dans le repo ; mettre a jour `.env.example`. | `.env.example`, `src/config/`, K8s secrets | Aucun secret PSP commite ; `.env.example` liste toutes les cles requises ; doc de provisioning. | Securite (domaine secrets) | S | 2 | P0 | Lien avec purge historique git deja signalee |

#### EPIC C — Webhooks, statuts & reconciliation
*Objectif : confirmer de maniere fiable l etat reel des paiements (source de verite = PSP) et garantir la coherence.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| PAIE-12 | Endpoint webhooks + signature + **anti-rejeu + allowlist** | Routes `POST /api/payments/webhooks/:provider` montees AVANT `express.json()` avec `express.raw()` (verifie : seul `express.json()` est actif, `server.ts` l.36) ; verification HMAC obligatoire. **Anti-rejeu temporel** : exiger un horodatage signe avec tolerance courte (ex. 5 min), rejeter hors fenetre. **Nonce a usage unique** stocke en Redis. **Allowlist IP/CIDR** des PSP la ou disponible. Sur succes : transition d etat + credit/debit + ecritures ledger (idempotent). | nouveau `src/routes/payment-webhook.routes.ts`, `src/server.ts` (l.36), `src/services/payments/*`, Redis | Webhook signe valide & dans la fenetre → COMPLETED + solde mis a jour ; webhook non signe/altere → 401 ; **rejeu hors fenetre temporelle → 401** ; **nonce deja vu → 401** ; rejeu du meme webhook (idempotent) = no-op ; source hors allowlist → rejet (la ou allowlist dispo). | PAIE-02, PAIE-07 | L | 2 | P0 | Ordre middlewares (raw vs json) ; Redis sans auth a corriger (lien securite) |
| PAIE-13 | Remplacer le stub /payments/status | Brancher `GET /api/payments/status/:transactionId` sur le statut reel (DB + `verifyStatus()` PSP en fallback). Supprimer le stub `status:'completed'`. | `src/routes/index.ts` | Le statut renvoye reflete la transaction reelle ; le stub est supprime ; test. | PAIE-07 | S | 2 | P0 | — |
| PAIE-14 | Polling de reconciliation | Job periodique : pour chaque transaction `PENDING/PROCESSING` au-dela d un seuil, interroger le PSP (`verifyStatus`) et reconcilier (filet de securite si webhook perdu). | nouveau `src/jobs/reconciliation.job.ts` | Transaction restee PENDING est resolue automatiquement ; metrique de transactions reconciliees ; test. | PAIE-12 | M | 2 | P1 | Necessite un scheduler (cron/queue) cote infra |
| PAIE-15 | Reconciliation comptable quotidienne | Rapport quotidien : total credite/debite par PSP vs releve PSP ; detection des ecarts ; alerte admin. | nouveau `src/jobs/daily-recon.job.ts`, route admin | Rapport genere ; ecart non nul → notification ; export CSV. | PAIE-14, PAIE-01 | L | 3 | P1 | Acces aux releves PSP (format variable) |
| PAIE-16 | Gestion echecs / timeouts / retries | Politique de retry exponentiel pour appels PSP sortants ; circuit breaker ; classification des erreurs (definitive vs reessayable) ; passage en `FAILED` propre. | `src/services/payments/*`, util retry | Un timeout PSP n entraine ni double credit ni perte ; transaction finit deterministe (COMPLETED ou FAILED) ; tests simulant timeouts. | PAIE-07, PAIE-12 | M | 2 | P0 | Mauvaise classification → double paiement |

#### EPIC D — Flux retrait (payout) complet
*Objectif : permettre le retrait reel avec controle anti-fraude et finalisation fiable.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| PAIE-17 | Brancher la route withdraw | Monter `POST /api/wallet/withdraw` avec auth + validateur ; appeler `WalletService.withdraw()` corrige. | `src/routes/wallet.routes.ts` | Route accessible et testee ; code mort elimine. | PAIE-05 | S | 1 | P0 | — |
| PAIE-18 | Retrait via payout PSP + finalisation du lock (= BACK-14 settlement) | Apres lock du solde, declencher `initiatePayout()` ; sur confirmation webhook : debiter `lockedBalance`, ecriture ledger ; sur echec : liberer le lock + transaction `FAILED`/`REVERSED`. **Settlement unifie ici (fusion BACK-14).** | `src/services/wallet.service.ts` (l.83-146), `src/services/payments/*` | Payout reussi → lock consomme, solde correct ; payout echoue → fonds restitues ; aucun fond bloque indefiniment ; tests des 2 chemins. | PAIE-08, PAIE-12 | L | 2 | P0 | Fonds bloques si finalisation absente (bug actuel) |
| PAIE-19 | Anti-fraude & limites de retrait | Plafonds journaliers/mensuels, cooldown, blocage si KYC non `APPROVED`, verification que le numero payout appartient a l utilisateur. | `src/services/wallet.service.ts`, config | Retrait refuse si KYC non valide ou plafond depasse ; tests des regles. | KYC (domaine), PAIE-17 | M | 3 | P1 | Regles AML a definir (decision porteur) |

#### EPIC E — Remboursements & dividendes
*Objectif : couvrir les types `REFUND` et `DIVIDEND` jamais implementes.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| PAIE-20 | Service de remboursement (REFUND) | Rembourser un depot/investissement (total ou partiel) : transaction `REFUND`, ecritures ledger inverses, eventuel payout PSP. Admin-only. | nouveau `src/services/refund.service.ts`, route admin | Refund cree une transaction REFUND, restitue le solde et equilibre le ledger ; idempotent ; test. | PAIE-01, PAIE-18 | M | 3 | P1 | Refund partiel apres frais : calcul delicat |
| PAIE-21 | Service de dividendes (DIVIDEND) | Distribuer des dividendes aux investisseurs d une startup au prorata : transactions `DIVIDEND` + credits wallet + ecritures ledger, en batch atomique. | nouveau `src/services/dividend.service.ts`, route admin | Distribution credite chaque investisseur correctement ; somme distribuee = montant declare ; idempotent ; test. | PAIE-01, Investissement (rendement) | L | 3 | P1 | Calcul prorata/arrondis ; gros volumes |

#### EPIC F — Interfaces depot/retrait (web & mobile)
*Objectif : exposer les flux d argent reels aux utilisateurs (aujourd hui 0 ecran).*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| PAIE-22 | UI depot web | Ecran de depot : choix moyen (Wave au MVP, OM/MTN ensuite), montant, redirection/USSD, suivi de statut (polling `/payments/status`). Auth JWT reelle (pas mock-token). | `frontend/src/...` (a creer), `frontend/src/services/` | Depot sandbox aboutit visuellement a COMPLETED ; affichage frais ; gestion echec. | PAIE-12, Auth (JWT reel) | L | 3 | P1 | Depend du branchement JWT reel (domaine auth) |
| PAIE-23 | UI retrait web | Ecran de retrait : montant, destinataire payout, recap frais, etat. | `frontend/src/...` | Retrait sandbox visible de bout en bout ; blocage si KYC non valide. | PAIE-18, PAIE-19 | M | 3 | P1 | — |
| PAIE-24 | UI depot/retrait mobile | Idem cote React Native, remplacer les mocks `setTimeout`. | `mobile/...` | Parcours depot + retrait sandbox fonctionnels sur mobile. | PAIE-12, PAIE-18 | L | 3 | P2 | Mobile globalement immature (score audit 3/10) |
| PAIE-25 | Recu / justificatif de transaction | Generer un recu (PDF/email) apres depot/retrait/investissement reussi via nodemailer. | `src/utils/email.ts`, service | Email de confirmation envoye avec reference et montant ; test. | PAIE-12 | M | 4 | P2 | — |

#### EPIC G — Conformite, securite & qualite paiements
*Objectif : satisfaire PCI/AML applicable et garantir la testabilite du domaine.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| PAIE-26 | Durcir CORS sur les routes argent | Remplacer `app.use(cors())` (verifie ouvert, `server.ts` l.31) par whitelist d origines ; webhooks PSP sur route dediee sans CORS public. | `src/server.ts` (l.31) | Origines non autorisees rejetees ; webhooks toujours joignables par les PSP ; test. | Securite (domaine) | S | 1 | P0 | Casser le front si whitelist mal configuree |
| PAIE-27 | Piste d audit immuable des paiements | Journaliser (append-only) chaque evenement paiement (init, webhook recu, transition, payout, ouverture/resolution de litige) avec horodatage et acteur. | nouveau modele `PaymentAuditLog` ou table ledger, services | Chaque operation laisse une trace immuable consultable par admin ; test. | PAIE-01 | M | 3 | P1 | Volume de logs |
| PAIE-28 | Controles AML de base | Seuils de declaration, detection de patterns (structuration), flag des comptes a risque, blocage transactions suspectes. | services paiement, admin | Transaction au-dela du seuil flaggee ; rapport AML exportable. | PAIE-27, KYC | L | 4 | P1 | Reglementation par pays a confirmer (decision porteur) |
| PAIE-29 | Eviter le stockage de donnees carte (PCI) | Si carte un jour : ne jamais stocker PAN/CVV ; tout via PSP hoste/tokenise. Documenter le scope PCI (idealement SAQ-A). | doc + code | Aucune donnee carte ne transite/persiste cote serveur ; note de scope PCI redigee. | — | S | 4 | P2 | Carte hors scope MVP (mobile money prioritaire) |
| PAIE-30 | Suite de tests paiements (sandbox + unitaires) | Tests : double credit/idempotence, signature webhook valide/invalide, **rejeu hors fenetre + nonce reutilise**, timeout PSP, finalisation/echec retrait, equilibre ledger, transitions d etat, **reversal de litige**. Integration en CI. | `src/**/*.test.ts`, CI | Couverture des chemins critiques (y compris anti-rejeu et litiges) ; CI bloque le merge si test paiement echoue. | EPICS A-E, CI (infra) | L | 2 | P0 | Necessite CI (absent aujourd hui) |
| PAIE-31 | Observabilite des paiements | Metriques (taux de succes par PSP, latence, montants, litiges ouverts), alertes sur echec anormal, dashboard. | infra monitoring, services | Dashboard montre volumes/echecs/litiges par provider ; alerte sur pic d echecs. | Infra monitoring | M | 4 | P2 | Depend du monitoring (absent) |

#### EPIC H — Litiges, reclamations & reversals
*Objectif : couvrir la gestion des contestations sur les flux d argent (verifie absent : `grep` dispute/chargeback/reversal/litige → NONE). Exigence operateurs PSP et reglementaire pour une plateforme manipulant de l argent.*

| ID | Titre | Description | Fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| PAIE-32 | Modele `Dispute` + machine a etats litige | Nouveau modele `Dispute` (`transactionId`, `reason`, `status`, `evidence`, `decision`, `amountHeld`, `openedBy`, `resolvedBy`, horodatages). Etats : `OPEN → UNDER_REVIEW → RESOLVED_REFUND / RESOLVED_REJECTED / ESCALATED`. A l ouverture : **gel des fonds litigieux** vers un compte sequestre ledger (`DISPUTE_HOLD`). | `prisma/schema.prisma`, nouveau `src/services/dispute.service.ts` | Migration appliquee ; ouverture d un litige gele le montant conteste (ecritures ledger equilibrees vers `DISPUTE_HOLD`) ; transitions invalides rejetees ; test unitaire de la machine a etats. | PAIE-01, PAIE-03 | L | 3 | P0 | Coherence ledger lors du gel/degel ; risque de double gel |
| PAIE-33 | Workflow admin de resolution + reversal comptable | Interface/route admin : consulter, instruire (pieces), decider. Sur remboursement : reversal comptable equilibre (transaction `REVERSED`/`REFUND`, ecritures inverses, eventuel payout PSP) ; sur rejet : degel vers le solde initial. | `src/routes/admin.routes.ts`, `dispute.service.ts`, `ledger.service.ts` | Decision « refund » → reversal equilibre au grand livre + fonds restitues/payout ; decision « reject » → fonds degeles ; aucune incoherence de solde ; test des 2 issues. | PAIE-32, PAIE-18, PAIE-20 | M | 3 | P0 | Calcul reversal apres frais/partiel delicat |
| PAIE-34 | SLA, notifications & tracabilite litiges | Definir des SLA chiffres (ex. accuse < 24h, resolution < 7j ouvres) ; notifications a l utilisateur a chaque transition ; chaque evenement litige journalise dans la piste d audit immuable. | `dispute.service.ts`, notifications, `PaymentAuditLog` | SLA documentes et mesurables (horodatages) ; utilisateur notifie a l ouverture et a la resolution ; chaque transition tracee dans l audit (PAIE-27) ; test. | PAIE-32, PAIE-27 | M | 3 | P1 | Definition des SLA = decision porteur/juridique |

---

### Risques specifiques au domaine

- **Double credit / fraude au depot (CRITIQUE, actif aujourd hui)** : `deposit()` credite sans encaissement (`wallet.service.ts` l.41-67) — exploitable immediatement pour creer de la fausse monnaie. A neutraliser des PAIE-04 (Phase 1).
- **Onboarding PSP sur le chemin critique (CRITIQUE, externe)** : l obtention des comptes marchands/cles (Wave, OM, MTN) peut prendre 4-16 semaines, hors controle de l equipe. Mitige par PAIE-00 (demarrage semaine 1), un MVP a 1 seul PSP (Wave) et le mock-provider PAIE-07 qui debloque le dev.
- **Litiges/chargebacks non geres (CRITIQUE, perimetre)** : aucun processus de contestation, gel de fonds, ni reversal (verifie absent). Couvert par l EPIC H ; sans lui, risque operationnel et reglementaire majeur.
- **Fonds bloques indefiniment** : `withdraw()` met les fonds en `lockedBalance` sans finalisation (l.106-133) — perte de fonds des qu un retrait reel sera tente. Couvert par PAIE-18.
- **Absence d idempotence** : retries reseau/double-clic = double paiement/investissement. Couvert par PAIE-02.
- **Webhooks non securises / rejeu** : sans `express.raw()`, sans signature, sans fenetre temporelle ni nonce, un attaquant pourrait forger ou rejouer une confirmation de paiement. Couvert par PAIE-12. Aggrave par le CORS ouvert et Redis sans auth.
- **Incoherence comptable** : mutation directe du solde sans grand livre = equilibre non prouvable, audit AML difficile. Couvert par PAIE-01.
- **Incoherence de devise** : validateurs « XOF » vs wallet « XAF » — ambiguite zone cible. Couvert par PAIE-05.
- **Secrets** : les cles PSP s ajouteront a un historique git deja compromis ; risque eleve si la purge n est pas faite avant (lien securite/PAIE-11).

### Decisions a valider par le porteur du projet

1. **Pays et zone monetaire cibles** : XAF (CEMAC) ou XOF (UEMOA), ou les deux ? Determine les variantes d API OM/MTN et la devise du wallet.
2. **Providers prioritaires pour le MVP** : recommandation = **Wave seul au MVP** (le plus rapide a onboarder), OM/MTN en post-MVP. A confirmer.
3. **Comptes marchands & sandbox (URGENT — semaine 1)** : qui ouvre les comptes marchands et fournit les cles de chaque PSP ? Quel est le delai d onboarding par PSP ? (cf. PAIE-00, jalon a risque).
4. **Bareme de frais** : frais de depot/retrait factures a l utilisateur (% et/ou fixe) ? Qui absorbe les frais PSP ?
5. **Modele comptable** : valider le grand livre en double entree (PAIE-01, Phase 2) — surcout initial mais indispensable pour audit/AML/reversals.
6. **Carte bancaire** : dans le scope ? (recommandation : hors MVP, mobile money d abord, pour limiter le scope PCI).
7. **Politique AML** : seuils de declaration, plafonds de retrait, exigence KYC `APPROVED` avant retrait — a cadrer juridiquement par pays.
8. **Delais de retrait** : le message actuel « 2-3 jours ouvrables » (`wallet.service.ts` l.143) est-il realiste vs payouts mobile money quasi-instantanes ?
9. **Reconciliation** : frequence et responsable du rapprochement quotidien avec les releves PSP.
10. **SLA litiges** : delais d accuse et de resolution des reclamations (cf. PAIE-34) — a cadrer juridiquement.

---

Confirmed: the `Startup` model has zero KYB/founder/UBO fields, and there's no link to a founder User. All lacunes are validated against real code. I'll now produce the finalized v2 section integrating each lacune precisely.

## KYC / AML / Conformite

### Etat actuel (verifie sur le code)

**Score : 1,5 / 10** (l'audit du 9 fev. indiquait « champ seul, 0 logique » ; le delta reel est faible : quelques routes admin de changement de statut ont ete ajoutees, mais elles sont non securisees et sans aucune logique metier KYC/AML reelle).

**Ce qui existe (et fonctionne partiellement) :**
- Un champ `kycStatus String @default("PENDING")` sur le modele `User` (`prisma/schema.prisma:50`), introduit par la migration `prisma/migrations/20250715205256_add_kyc_status/migration.sql`. C'est une simple chaine libre, sans enum, sans contrainte.
- Le modele `UserProfile` contient des champs exploitables pour le KYC : `dateOfBirth`, `location`, `investorType`, `riskProfile` (`prisma/schema.prisma:72-86`, migration `20250715135217_add_missing_fields`). Ces champs ne sont alimentes par aucun flux.
- L'enum `UserRole { USER, STARTUP, ADMIN }` existe (`prisma/schema.prisma:12-16`) : le role `STARTUP` est donc bien prevu, mais le modele `Startup` (`prisma/schema.prisma:182-204`) ne contient **aucune donnee de verification d'entreprise** (pas de registre du commerce, pas de beneficiaires effectifs, pas de relation vers un User fondateur).
- Des routes admin de pilotage du statut existent dans `src/routes/admin.routes.ts` :
  - `GET /api/admin/users?kycStatus=PENDING` (filtre, ligne 76)
  - `POST /api/admin/users/:id/kyc` (ligne 227)
  - `POST /api/admin/users/:id/verify-kyc` (ligne 243)
  - `POST /api/admin/users/:id/reject-kyc` (ligne 258)
  - `GET /api/admin/users/:id/documents` (ligne 273)
- Une UI admin de revue KYC : `frontend/src/app/views/AdminVerificationView.tsx` (checklist, modal de rejet avec motifs, zoom/rotation document, approbation/rejet).
- Une UI utilisateur de saisie KYC dans le tunnel d'investissement : `frontend/src/app/views/InvestmentCheckoutView.tsx` (etape 3 « Verification KYC » : `idType`, `idNumber`, `dateOfBirth`, `occupation`, `sourceOfFunds` ; etape 5 : `acceptTerms`, `acceptRisk` + avertissement sur les risques, lignes 40-48, 314-482).

**Ce qui est casse ou absent (critique) :**
- **Aucune protection d'autorisation sur les routes KYC admin.** `src/routes/admin.routes.ts:8` ne monte que `router.use(authenticateToken)` et **n'applique JAMAIS `requireAdmin`** (le middleware existe pourtant dans `src/middleware/rbac.middleware.ts:49`, ainsi que `requireRole` ligne 5). Consequence : **tout utilisateur authentifie peut auto-valider son propre KYC** via `POST /api/admin/users/<son_id>/verify-kyc`, lister tous les utilisateurs, etc. Faille de conformite et de securite majeure.
- **`POST /api/admin/users/:id/kyc` accepte un statut arbitraire** (`status || 'VERIFIED'`, ligne 230) sans validation contre une liste d'etats autorises.
- **`POST /api/admin/users/:id/reject-kyc` ignore le motif de rejet** : le frontend envoie `{ reason }` (`AdminVerificationView.tsx:133`) mais le backend ne le persiste pas (ligne 258-268). Aucune trace du motif, aucune notification a l'utilisateur.
- **Aucun upload de document.** `GET /api/admin/users/:id/documents` renvoie en dur `{ data: [] }` (ligne 273-275). L'UI admin affiche des **documents simules** (`/placeholder-id.jpg`, commentaire « Simuler des documents pour la demo », `AdminVerificationView.tsx:482-486`). Aucun bucket S3, aucun champ `Document` en base, aucune route d'upload cote utilisateur. L'audit le confirme : « upload S3 (0) ».
- **Les donnees KYC saisies par l'utilisateur ne sont jamais persistees.** Dans `InvestmentCheckoutView.tsx`, l'etape KYC alimente un state local `investmentData` ; `processPayment` (ligne 132-149) **simule via `setTimeout(2000)`** puis appelle uniquement `addInvestment(...)`. Ni `idNumber`, ni `dateOfBirth`, ni `sourceOfFunds`, ni les consentements ne sont envoyes a l'API. KYC = formulaire d'affichage sans backend.
- **Aucun referentiel de niveaux KYC** (Tier 0/1/2). Le statut est binaire/textuel (`PENDING`/`VERIFIED`/`REJECTED`), sans lien avec des plafonds (depot/retrait/investissement). Le KYC n'est jamais une condition d'acces a une transaction.
- **Aucun screening sanctions / PEP / liste noire.** 0 integration, 0 service, 0 champ. `pendingVerifications: 0` est code en dur dans le dashboard admin (`admin.routes.ts:35`).
- **Aucune verification d'entreprise (KYB).** Le role `STARTUP` peut lever des fonds et encaisser l'argent des investisseurs, mais aucune verification de l'entreprise, de ses dirigeants ni de ses beneficiaires effectifs (UBO) n'existe (`prisma/schema.prisma:182-204`).
- **Aucun consentement persiste.** Les cases `acceptTerms`/`acceptRisk` ne quittent pas le navigateur. Pas d'horodatage, pas de version de CGU, pas de preuve de consentement (RGPD).
- **Aucune piste d'audit de conformite** : pas de table d'historique des decisions KYC, pas de log de qui a approuve/rejete quoi et quand. `prisma.user.update` ecrase simplement `kycStatus`.
- **Aucune politique de retention / RGPD** : pas de droit d'acces/effacement, pas de chiffrement des PII, pas de DPA. Les PII sensibles (numero de piece, date de naissance) n'ont pas de stockage securise prevu.
- **Aucune analyse de residence des donnees.** Les PII de verification et les documents sont prevus sur AWS eu-west-1 (Irlande) alors que la cible est l'UEMOA : la legalite du transfert hors zone et une eventuelle exigence de localisation ne sont pas traitees.
- **Mobile** : un simple item de menu « Verification KYC » (`mobile/App.tsx:477`), sans ecran fonctionnel ni appel API.
- **Aucune CGU / mention de risque / politique de confidentialite reelle** : le texte de risque est en dur dans le composant React (`InvestmentCheckoutView.tsx:452-482`), non versionne, non opposable.

**Delta depuis l'audit du 9 fev. :** quasi nul sur le fond. L'audit notait « KYC (champ seul, 0 logique) » — c'est toujours vrai. Les seuls ajouts sont des stubs de routes admin et des UI de demonstration cablees sur des donnees factices, ce qui aggrave meme le risque (fausse impression de fonctionnalite + auto-validation possible).

---

### Principe directeur (fail-closed) et sequencement de conformite

Le chapeau de la feuille de route pose le principe : *« aucune fonctionnalite financiere exposee tant que son socle de securite/tracabilite n'est pas en place »*. Ce principe est aujourd'hui viole pour le pilier KYC : le tunnel d'investissement aboutit sans KYC reel, et la faille d'auto-validation est active. Deux exigences de sequencement en decoulent et sont integrees au backlog ci-dessous :

1. **Garde-fou fail-closed des la Phase 1** (KYC-31) : un middleware `kycRequired` renvoie 403 par defaut sur toute route d'investissement et de retrait, **avant** meme l'existence du vrai parcours KYC. Tant que le parcours reel n'est pas livre, ces routes restent fermees.
2. **Gating dur en fin de Phase 2** : l'enum `KycStatus`/`KycLevel` (KYC-05) et les plafonds bloquants par niveau (KYC-19) doivent etre **Done avant** l'ouverture de tout flux d'argent reel, y compris en mode sandbox PSP (jalon J2). Aucune route de retrait (PAIE-17/18) ni de depot/investissement reel (PAIE-08/09/10 hors mock) ne franchit le gating C2 tant que KYC-19 n'est pas livre.

---

### Backlog (epics et taches)

> Conventions : Effort S (<1j) / M (1-3j) / L (3-8j) / XL (>8j). Phase 0 (pre-projet, en parallele) a Phase 4 (Production). Priorite P0 (bloquant/securite-conformite) a P2.

#### EPIC Z — Prerequis reglementaires et de faisabilite (chantier parallele, hors developpement)
*Objectif : traiter la conformite reglementaire comme une dependance externe a timeline propre, et non comme un simple chantier technique de fin de projet. Sans ces jalons, la date MVP public est une fiction.*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--00 | Jalon reglementaire J0 — qualification juridique et delai d'agrement | Consultation juridique en pre-Phase 1 : determiner le statut requis (intermediaire, conseiller en investissement, plateforme de financement participatif) aupres du CREPMF/BCEAO et le delai d'obtention (potentiellement 3 a 12 mois). Traiter l'agrement comme une dependance externe parallele a tout le developpement, avec sa propre timeline. | doc, registre des jalons | Statut reglementaire cible documente ; delai et procedure d'agrement estimes ; timeline reglementaire ouverte en parallele du dev. Le **Go production (J4) est conditionne A LA FOIS au pentest ET a l'autorisation reglementaire**. | DEC-A / DEC-1 | M | **0** | **P0** | L'agrement peut prendre plusieurs mois ; un produit techniquement pret peut etre juridiquement interdit d'ouverture |
| KYC--00b | Selection et contractualisation du prestataire KYC/AML | Lancer des la Phase 1 la selection du prestataire de verification/screening (Smile ID, Onfido, Sumsub, ComplyAdvantage, Open Sanctions). Integrer au calendrier le delai de contractualisation + DPA + acces API (souvent 2 a 6 semaines). Estimer le **cout par verification x volume cible** pour valider la viabilite economique du MVP (alimente DEC-D budget). | doc, DEC-4 | Prestataire choisi ; contrat + DPA signes ; acces API obtenu ; cout unitaire et projection budgetaire valides. | DEC-4, DEC-D | M | **0/1** | P0 | Delai et cout recurrent sous-estimes peuvent bloquer KYC-16 et le MVP |
| KYC--00c | Analyse de residence des donnees / souverainete UEMOA | Evaluer la legalite du transfert des PII (piece d'identite, selfie) et donnees financieres d'utilisateurs ouest-africains hors zone UEMOA (AWS eu-west-1). Determiner si une localisation regionale (region AWS Afrique, ou chiffrement avec cles sous controle local) est exigee par la loi 2013-450 CI / regimes UEMOA. Documenter la base legale du transfert et integrer une clause de localisation dans le choix infra (DEC cloud). | doc, lien DEC-A et DEC cloud (Infra) | Base legale du transfert documentee ; decision residence/localisation prise ; exigence de localisation (ou non) integree au choix de region/cloud de l'Infra. | KYC--00, Domaine Infra (DEC cloud), Domaine Securite | M | **0/1** | **P0** | Localisation imposee tardivement => re-architecture infra couteuse ; transfert illegal de PII |

#### EPIC A — Securisation immediate des endpoints KYC existants
*Objectif : supprimer les failles de conformite/securite deja presentes et poser le garde-fou fail-closed avant toute nouvelle fonctionnalite.*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--01 | Proteger toutes les routes admin par `requireAdmin` | Ajouter `requireAdmin` (`requireRole('ADMIN')`) apres `authenticateToken` sur le routeur admin (ou par route). Empecher l'auto-validation KYC. | `src/routes/admin.routes.ts:8`, `src/middleware/rbac.middleware.ts:49` | Un USER appelant `POST /api/admin/users/:id/verify-kyc` recoit 403 ; un ADMIN recoit 200. Test e2e ecrit. | Domaine Auth (JWT reel branche), SECU-10 | S | 1 | **P0** | Si l'UI admin frontend utilise un token mock, elle cassera : verifier le branchement JWT reel en parallele |
| KYC--31 | Garde-fou `kycRequired` fail-closed sur invest/withdraw | Middleware renvoyant **403 par defaut** sur toute route d'investissement et de retrait tant que le vrai parcours KYC n'est pas livre. Branche immediatement, avant KYC-05/19. | nouveau `src/middleware/kyc.middleware.ts`, montage sur routes invest/wallet | Toute tentative d'investissement ou de retrait renvoie 403 « KYC requis » jusqu'a livraison de KYC-19 ; comportement fail-closed verifie par test. | KYC--01 | S | **1** | **P0** | Sans ce garde-fou, la Phase 2 ouvre des flux d'argent (sandbox PSP, grand livre) sans aucune barriere KYC |
| KYC--02 | Valider le statut KYC contre un referentiel | Remplacer `status || 'VERIFIED'` par une validation stricte (enum). Rejeter toute valeur hors liste. | `src/routes/admin.routes.ts:227-238`, nouveau validateur | `POST .../kyc` avec un statut invalide renvoie 400 ; valeurs autorisees uniquement. | KYC--05 | S | 1 | P0 | — |
| KYC--03 | Persister le motif de rejet et notifier l'utilisateur | Enregistrer `reason` (table audit + champ), creer une `Notification`, envoyer un email. | `src/routes/admin.routes.ts:258-268`, `src/utils/email.ts`, schema Prisma | Apres rejet, le motif est consultable cote admin et l'utilisateur recoit notification+email. | KYC--12, KYC--13 | M | 2 | P1 | — |
| KYC--04 | Retirer les documents/donnees factices de l'UI admin | Supprimer les `placeholder-*.jpg` et le commentaire « Simuler des documents » ; brancher l'UI sur la vraie route documents. | `frontend/src/app/views/AdminVerificationView.tsx:482-516` | L'UI n'affiche plus de documents codes en dur ; affiche les documents reels ou un etat vide explicite. | KYC--08 | S | 2 | P1 | Risque que des reviewers approuvent sur la base de faux documents tant que non corrige |

#### EPIC B — Modele de donnees KYC/AML & niveaux de verification
*Objectif : doter la plateforme d'un modele de donnees conforme (niveaux, documents, decisions, consentements, audit).*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--05 | Definir l'enum `KycStatus` et les `KycLevel` | Remplacer le `kycStatus String` par un enum (`NOT_STARTED`, `PENDING`, `IN_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED`) + niveau (`TIER0/1/2`). Migration de donnees. | `prisma/schema.prisma:50`, nouvelle migration | Schema migre ; valeurs existantes mappees ; client Prisma regenere ; build OK. **Livre AVANT ouverture de tout flux d'argent reel (gating fin de Phase 2).** | — | M | **2 (fin)** | **P0** | Migration de la colonne texte existante : prevoir backfill |
| KYC--06 | Modele `KycProfile` (PII de verification) | Champs : `idType`, `idNumber` (chiffre), `dateOfBirth`, `nationality`, `occupation`, `sourceOfFunds`, `country`, `address`. Relation 1-1 User. | `prisma/schema.prisma`, migration | Modele cree, migre, indexe ; PII chiffrees au repos (cf. KYC--20). | KYC--05, KYC--20 | M | 2 | P0 | Stockage de PII sensibles : exige chiffrement avant mise en prod |
| KYC--07 | Modele `KycDocument` | Champs : `userId`, `type` (ID_CARD/PASSPORT/PROOF_OF_ADDRESS/SELFIE), `s3Key`, `status`, `rejectionReason`, `uploadedAt`, `reviewedBy`, `checksum`. | `prisma/schema.prisma`, migration | Modele cree+migre ; relation User ; pas d'URL publique stockee (cle S3 uniquement). | KYC--05, KYC--08 | M | 2 | P0 | — |
| KYC--08 | Upload securise de documents vers S3 | Route `POST /api/kyc/documents` : upload via presigned URL S3, validation type/taille/MIME, antivirus optionnel, stockage de la cle S3 (bucket prive, SSE-KMS). Route `GET .../documents/:id/url` renvoyant une presigned URL courte cote admin. | nouveau `src/routes/kyc.routes.ts`, `src/services/kyc.service.ts`, `src/config/s3.ts` | Un utilisateur authentifie televerse un document ; le fichier atterrit dans un bucket S3 prive chiffre ; aucune URL publique ; l'admin accede via presigned URL <5 min. **Region/residence du bucket conforme a la decision KYC--00c.** Test d'integration. | KYC--07, KYC--00c, Domaine Infra (bucket S3 + IAM), Domaine Securite | L | 3 | **P0** | Bucket mal configure = fuite de PII ; imposer Block Public Access + politique IAM stricte |
| KYC--09 | Modele `KycReview` (decisions + audit immuable) | Historiser chaque decision : `reviewerId`, `action` (APPROVE/REJECT/REQUEST_MORE), `reason`, `previousStatus`, `newStatus`, `createdAt`. Append-only avec **chainage cryptographique** (hash du log precedent) garantissant l'inalterabilite. | `prisma/schema.prisma`, migration | Toute approbation/rejet cree une ligne d'audit chainee ; aucune suppression/modification possible (controle d'integrite par hash) ; consultable par admin. | KYC--05, KYC--28 | M | 2 | P1 | — |
| KYC--10 | Modele `SanctionScreening` | Stocker le resultat de chaque screening : `provider`, `matchScore`, `status` (CLEAR/POTENTIAL_MATCH/CONFIRMED), `payload`, `screenedAt`. | `prisma/schema.prisma`, migration | Modele cree+migre ; relie au User (et a `CompanyKyb` pour KYB) ; resultat consultable. | KYC--16 | M | 3 | P1 | — |

#### EPIC C — Parcours utilisateur de verification (web + mobile)
*Objectif : permettre a un utilisateur de soumettre reellement son dossier KYC et d'en suivre l'etat.*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--11 | API de soumission KYC utilisateur | Routes : `POST /api/kyc/submit` (PII), `GET /api/kyc/status` (etat + niveau + motifs). Passe le statut a `PENDING`/`IN_REVIEW`. | `src/routes/kyc.routes.ts`, `src/services/kyc.service.ts` | Un utilisateur soumet son dossier ; statut passe a IN_REVIEW ; `GET /status` reflete l'etat. Tests. | KYC--06, KYC--07, KYC--08 | L | 3 | P0 | — |
| KYC--12 | Brancher l'UI checkout sur l'API KYC reelle | Remplacer le `setTimeout` simule (`processPayment`) par des appels API ; envoyer reellement PII+documents ; bloquer l'investissement si KYC non `VERIFIED`. | `frontend/src/app/views/InvestmentCheckoutView.tsx:40-149` | Les donnees KYC sont persistees en base ; un utilisateur non verifie ne peut finaliser un investissement (message clair). | KYC--11, KYC--19, KYC--31 | M | 3 | P0 | Aujourd'hui l'investissement aboutit sans aucun KYC reel : risque reglementaire fort |
| KYC--13 | Ecran « Mon statut KYC » + notifications | Page dediee montrant niveau, etat, documents soumis, motifs de rejet, action « re-soumettre ». Notifications in-app/email aux transitions. | `frontend/src/app/views/` (nouveau), `src/utils/email.ts` | L'utilisateur voit son etat en temps reel et est notifie a chaque changement. | KYC--11, KYC--03 | M | 3 | P1 | — |
| KYC--14 | Ecran KYC mobile fonctionnel | Remplacer l'item de menu inerte par un ecran d'upload (camera/galerie) + suivi de statut, via `react-native-keychain` pour le token. | `mobile/App.tsx:477` puis extraction en ecran dedie | Un utilisateur mobile peut photographier et soumettre ses documents ; statut affiche. | KYC--11, Domaine Mobile (auth reelle) | L | 3 | P1 | Qualite photo / permissions camera |
| KYC--15 | Capture et persistance des consentements | Persister `acceptTerms`/`acceptRisk` avec version de document, horodatage, IP, user-agent. | `frontend/.../InvestmentCheckoutView.tsx:477-482`, nouvelle table `Consent` | Chaque consentement est trace (qui, quoi, quelle version, quand) et exportable comme preuve. | KYC--22 | M | 3 | P0 | Preuve de consentement exigee par RGPD et regulateur |

#### EPIC D — Screening AML (sanctions / PEP) et controles transactionnels
*Objectif : detecter et tracer les risques AML.*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--16 | Integration screening sanctions/PEP | Brancher le prestataire retenu (cf. KYC--00b) au moment de la soumission KYC ; stocker le resultat. | `src/services/sanctions.service.ts`, `src/services/kyc.service.ts` | Toute soumission KYC declenche un screening ; un match potentiel met le dossier en `IN_REVIEW` manuel obligatoire. | KYC--00b, KYC--10, KYC--11 | L | 3 | P1 | Faux positifs ; dependance prestataire ; cout par requete |
| KYC--17 | Re-screening periodique | Tache planifiee re-screenant les utilisateurs verifies (ex. quotidien) contre listes mises a jour. | nouveau worker/cron, `src/services/sanctions.service.ts` | Un utilisateur devenant « liste » est detecte automatiquement et son compte gele/flag. | KYC--16 | M | 4 | P2 | — |
| KYC--18 | Detection transactionnelle AML (seuils, structuring) | Regles : seuils de declaration, depots/retraits fractionnes, velocite. Generation d'alertes. | `src/services/wallet.service.ts`, nouveau `src/services/aml.service.ts` | Une transaction depassant un seuil ou un pattern suspect cree une alerte admin et peut bloquer l'operation. | Domaine Wallet/Paiements | L | 4 | P1 | Calibrage des seuils par juridiction |
| KYC--19 | Plafonds par niveau KYC | Imposer des limites de depot/retrait/investissement selon le `KycLevel`. **Remplace le garde-fou fail-closed KYC--31 par le controle fin definitif.** | `src/services/wallet.service.ts`, `src/services/investment.service.ts` | Un utilisateur Tier0 ne peut depasser un plafond X ; le passage Tier1/2 leve les limites. **Done OBLIGATOIRE avant l'ouverture de tout flux d'argent reel, y compris sandbox PSP (gating C2 / fin Phase 2 -> debut Phase 3).** Tests. | KYC--05, KYC--31, Domaine Wallet | M | **2 (fin)/3** | **P0** | Coherence avec regles BCEAO a confirmer (cf. decisions) |

#### EPIC H — KYB (verification d'entreprise / startups levant des fonds)
*Objectif : verifier l'entreprise et ses beneficiaires effectifs avant qu'une startup ne collecte les fonds des investisseurs. Le role `STARTUP` existe (`schema.prisma:14`) et les fondateurs encaissent l'argent, mais aucune verification d'entreprise n'est aujourd'hui prevue.*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--32 | Modele `CompanyKyb` + beneficiaires effectifs (UBO) | Modeliser l'entreprise (registre du commerce, statuts, mandataire), une relation vers le User fondateur, et une liste de beneficiaires effectifs (`Ubo`) avec parts. Statut KYB (enum). Lier au modele `Startup` (`schema.prisma:182`). | `prisma/schema.prisma`, migration | Modeles `CompanyKyb` et `Ubo` crees+migres ; relation Startup/fondateur etablie ; statut KYB pilotable. | KYC--05 | L | 3 | P1 | — |
| KYC--33 | Upload & revue des documents KYB | Upload securise (S3, meme socle que KYC--08) des documents legaux de l'entreprise ; revue admin dediee. | `src/routes/kyc.routes.ts`, `src/services/kyc.service.ts`, UI admin | Une startup televerse ses documents legaux ; l'admin les consulte (presigned) et tranche ; decisions auditees. | KYC--08, KYC--32 | M | 3 | P1 | — |
| KYC--34 | Screening de l'entreprise et de ses dirigeants/UBO | Etendre le screening sanctions/PEP (KYC--16) a l'entreprise, ses dirigeants et ses beneficiaires effectifs. | `src/services/sanctions.service.ts` | Tout dossier KYB declenche un screening de l'entite et des UBO ; match => revue manuelle obligatoire. | KYC--16, KYC--32 | M | 3 | P1 | — |
| KYC--35 | Gating KYB sur le cycle de vie de campagne | Bloquer la creation/ouverture **et** la cloture/versement d'une campagne de levee tant que le KYB n'est pas `VERIFIED`. | `src/services/investment.service.ts`, routes startup (a creer ; `startup.routes.ts` aujourd'hui vide) | Une startup non verifiee (KYB) ne peut ni ouvrir ni cloturer une campagne ; message explicite ; test. | KYC--32, KYC--33, Domaine Startups/Wallet | M | 3 | **P0** | Sans KYB, des fonds publics transitent vers des entites non verifiees |

#### EPIC E — Protection des donnees personnelles (RGPD / loi locale)
*Objectif : conformite a la protection des donnees (UE si exposition .eu + loi ivoirienne 2013-450 / autorites UEMOA).*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--20 | Chiffrement des PII au repos | Chiffrer `idNumber`, documents et autres PII sensibles (KMS / pgcrypto / chiffrement applicatif). | `src/services/kyc.service.ts`, `src/config/`, S3 SSE-KMS | Les PII ne sont jamais stockees en clair en base ni sur S3 ; cles gerees via KMS, **coherentes avec la decision de localisation KYC--00c**. | KYC--06, KYC--08, KYC--00c | L | 3 | **P0** | Gestion/rotation des cles ; perte de cle = perte de donnees |
| KYC--21 | Politique de retention et purge | Definir des durees de conservation (ex. documents KYC conserves N annees post-relation, puis purges) + job de purge. | nouveau worker, doc politique | Les donnees au-dela de la duree legale sont purgees automatiquement et trace de purge conservee. | KYC--09 | M | 4 | P1 | Conflit retention AML (long) vs minimisation RGPD : trancher (cf. decisions) |
| KYC--22 | Versionnage des documents legaux (CGU, risques, confidentialite) | Externaliser CGU/mentions de risque/politique de confidentialite hors du code React, avec versionnage et reference dans `Consent`. | remplacer le texte en dur `InvestmentCheckoutView.tsx:452-482`, table `LegalDocument` | Les textes legaux sont versionnes ; chaque consentement reference une version precise ; consultables publiquement. | KYC--15 | M | 3 | P1 | Textes juridiques a faire valider par un juriste |
| KYC--23 | Droits des personnes (acces, rectification, effacement, export) | Endpoints/process pour exercer les droits RGPD (acces, portabilite, effacement avec exceptions AML). | `src/routes/kyc.routes.ts` ou `privacy.routes.ts` | Un utilisateur peut demander et obtenir l'export/effacement de ses donnees ; les exceptions de conservation legale sont appliquees. | KYC--21 | L | 4 | P2 | — |
| KYC--24 | Registre des traitements & DPA prestataires | Documenter les traitements (registre art. 30) et signer des DPA avec S3/screening/email. | doc | Registre tenu a jour ; DPA en place avec chaque sous-traitant traitant des PII (dont le prestataire KYC/AML de KYC--00b). | KYC--08, KYC--16, KYC--00b | M | 4 | P2 | — |

#### EPIC F — Outillage de revue admin & reporting de conformite
*Objectif : donner aux compliance officers les outils de revue et de reporting.*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--25 | File de revue KYC reelle pour admin | Brancher l'UI admin sur les vrais dossiers (PII + documents + resultat screening + historique). Actions : approuver / rejeter avec motif / demander complement. | `frontend/src/app/views/AdminVerificationView.tsx`, `src/routes/kyc.routes.ts` | L'admin voit les vrais dossiers en attente, consulte documents (presigned), screening, et tranche ; chaque action est auditee. | KYC--04, KYC--08, KYC--09, KYC--16 | L | 3 | P1 | — |
| KYC--26 | Dashboard de conformite reel | Remplacer `pendingVerifications: 0` en dur par des vraies metriques (en attente, delais de traitement, taux de rejet, alertes AML). | `src/routes/admin.routes.ts:35`, UI admin | Le dashboard affiche des chiffres calcules depuis la base. | KYC--09 | M | 3 | P2 | — |
| KYC--27 | Export / rapports reglementaires & declarations CENTIF (STR/SAR) | Generer des rapports de conformite (KYC realises, alertes AML) et **les declarations de soupcon au format et via le canal de la CENTIF (cellule de renseignement financier UEMOA)**. | nouveau service de reporting | Un compliance officer exporte un rapport periodique ; une declaration STR/SAR est generee au **format/canal CENTIF concret** et tracee. | KYC--09, KYC--18 | M | 4 | P1 | Format/canal dependant de l'autorite ; a confirmer juridiquement (cf. decisions) |
| KYC--28 | Journalisation de conformite immuable (WORM / chainage) | Logs structures **inviolables** de tous les evenements KYC/AML, separes des logs applicatifs. Immuabilite garantie par **S3 Object Lock (mode Compliance)** OU table append-only a **chainage cryptographique** (hash du precedent) + controle d'integrite periodique. | `src/services/kyc.service.ts`, infra logs (lien OBSE-22/25) | Tout evenement KYC/AML est journalise avec acteur/horodatage ; **une tentative de modification d'un log echoue ou est detectee** (test d'inalterabilite au gating P4) ; conserve selon la politique. | KYC--09, Domaine Infra (monitoring/OBSE) | M | 4 | P1 | — |

#### EPIC G — Tests & gouvernance
*Objectif : garantir la non-regression sur un domaine a fort enjeu reglementaire.*

| ID | Titre | Description | Fichiers | Definition of Done | Deps | Effort | Phase | Prio | Risques |
|----|-------|-------------|----------|--------------------|------|--------|-------|------|---------|
| KYC--29 | Suite de tests KYC/AML (auth, upload, transitions, plafonds, fail-closed, inalterabilite) | Tests unitaires + integration : autorisation admin, garde-fou `kycRequired` fail-closed, transitions de statut, blocage investissement/retrait sans KYC, plafonds par niveau, screening, **test d'inalterabilite de l'audit log** (tentative de modification -> echec/detectee), gating KYB. | `src/**/__tests__/`, CI | Couverture des chemins critiques ; CI rouge si une regle de conformite casse. | KYC--01, KYC--11, KYC--19, KYC--28, KYC--31, KYC--35 | L | 3 | P0 | Sans CI gating (audit : « 1 test »), les regressions de conformite passeront inapercues |
| KYC--30 | Runbook & matrice RACI conformite | Documenter le processus (delais, escalade match PEP, gel de compte, declaration CENTIF) et les responsabilites ; designer responsable conformite / DPO. | doc | Procedure ecrite, validee, accessible a l'equipe conformite ; responsable conformite/DPO designe. | — | S | 4 | P2 | — |

---

### Risques specifiques au domaine

- **Faille d'auto-validation KYC (actif aujourd'hui)** : faute de `requireAdmin` (`src/routes/admin.routes.ts:8`), n'importe quel compte authentifie peut s'auto-verifier et lister tous les utilisateurs. C'est a la fois une faille de securite et une non-conformite directe. A corriger en P0 (KYC--01).
- **Fuite entre phases — flux d'argent sans barriere KYC** : sans le garde-fou fail-closed (KYC--31) en Phase 1 et le gating dur KYC-05/19 en fin de Phase 2, la Phase 2 rend le grand livre et le premier PSP sandbox operationnels (jalon J2) **sans aucun controle KYC bloquant** — violation du principe directeur du chapeau. Corrige par le sequencement impose ci-dessus.
- **Investissement possible sans KYC reel** : le tunnel (`InvestmentCheckoutView.tsx`) finalise un investissement via `setTimeout` sans persister ni verifier le KYC. Exposition reglementaire majeure.
- **KYB absent alors que les startups encaissent les fonds** : le role `STARTUP` existe mais aucune verification d'entreprise/UBO n'est prevue ; risque de transfert de fonds publics vers des entites non verifiees (EPIC H).
- **Documents et consentements factices/non persistes** : risque de validation de dossiers sur la base de faux documents (UI demo) et absence totale de preuve de consentement opposable.
- **PII sensibles sans chiffrement ni politique de retention** : numero de piece, date de naissance, justificatifs ; risque de fuite et de non-conformite RGPD/loi locale.
- **Residence des donnees hors zone UEMOA** : PII et documents prevus sur AWS eu-west-1 (Irlande) ; legalite du transfert et exigence eventuelle de localisation non encore tranchees (KYC--00c).
- **Absence de screening sanctions/PEP** : risque d'onboarder une personne ou une entreprise sanctionnee.
- **Audit log non prouve inalterable** : sans WORM/chainage cryptographique (KYC--28), l'inalterabilite exigee pour le gating « aucune regle AML contournable » n'est pas garantie.
- **Tension retention AML vs minimisation RGPD** : obligations AML (conservation longue) en tension avec le droit a l'effacement ; arbitrage juridique requis (KYC--21, KYC--23).
- **Validation reglementaire/licence sur le chemin critique** : l'agrement CREPMF/BCEAO peut prendre 3 a 12 mois et conditionne legalement la mise en production ; sans jalon J0 (KYC--00), la date MVP public est une fiction.
- **Dependance prestataire screening non contractualisee** : delai de selection/DPA/acces API (2 a 6 sem.) et cout par verification non budgetes peuvent bloquer le MVP (KYC--00b).
- **Incoherence de juridiction** : domaine `.eu` vs `.com` et cible UEMOA — declenche potentiellement RGPD UE *et* regime local (double conformite).

### Decisions a valider par le porteur du projet

1. **Juridiction et regulateur cibles** : UEMOA/BCEAO et CREPMF (offre de valeurs non cotees) ? Statut reglementaire de la plateforme (intermediaire, conseiller en investissement, plateforme de financement participatif) ? **Delai d'agrement a estimer des J0 (KYC--00)** — conditionne la date de Go production.
2. **Niveaux KYC et plafonds associes** : combien de tiers (Tier0/1/2) et quels plafonds de depot/retrait/investissement par tier (KYC--05, KYC--19) ?
3. **Documents requis par tier** : piece d'identite seule, + justificatif de domicile, + selfie/liveness ? Liste officielle a figer.
4. **Choix du prestataire de verification/screening** : Smile ID (Afrique), Onfido, Sumsub, ComplyAdvantage, Open Sanctions ? **Budget par verification x volume cible** et couverture Afrique de l'Ouest (KYC--00b, alimente DEC-D).
5. **Verification 100% manuelle au demarrage** ou automatisee des le MVP ? (impacte le delai et le cout).
6. **Politique de retention** : duree de conservation des documents/PII apres cloture de compte, arbitrage AML vs RGPD (KYC--21).
7. **Application du RGPD UE** : confirmer si l'on cible des residents UE / domaine .eu ; sinon, perimetre = loi locale ivoirienne 2013-450 et equivalents UEMOA.
8. **Residence/localisation des donnees** : la loi locale UEMOA exige-t-elle une localisation regionale des PII, ou un transfert vers AWS eu-west-1 (Irlande) est-il admissible avec garanties (chiffrement, base legale) ? (KYC--00c).
9. **Seuils AML transactionnels** et obligation de declaration (STR/SAR) : montants, **format et canal de declaration a la CENTIF** (cellule de renseignement financier en zone UEMOA) (KYC--18, KYC--27).
10. **Perimetre KYB** : documents d'entreprise requis, seuil de detention pour qualifier un beneficiaire effectif (UBO), et point de blocage (ouverture vs versement de campagne) (EPIC H).
11. **Validation juridique des textes legaux** (CGU, mentions de risque, politique de confidentialite) avant mise en production (KYC--22).
12. **Designation d'un responsable conformite / DPO** et de la procedure d'escalade (gel de compte, match PEP) (KYC--30).

Fichiers reels cites : `/Users/cyrilsohnde/afristocks/prisma/schema.prisma` (enum `UserRole` l.12-16, `kycStatus` l.50, `UserProfile` l.72-86, `Startup` l.182-204), `/Users/cyrilsohnde/afristocks/prisma/migrations/20250715205256_add_kyc_status/migration.sql`, `/Users/cyrilsohnde/afristocks/src/routes/admin.routes.ts` (l.8 montage `authenticateToken` sans `requireAdmin`, l.35 `pendingVerifications: 0`, l.227-275), `/Users/cyrilsohnde/afristocks/src/middleware/rbac.middleware.ts` (`requireRole` l.5, `requireAdmin` l.49, `requireStartup` l.50), `/Users/cyrilsohnde/afristocks/src/services/auth.service.ts`, `/Users/cyrilsohnde/afristocks/src/routes/index.ts`, `/Users/cyrilsohnde/afristocks/frontend/src/app/views/AdminVerificationView.tsx`, `/Users/cyrilsohnde/afristocks/frontend/src/app/views/InvestmentCheckoutView.tsx`, `/Users/cyrilsohnde/afristocks/mobile/App.tsx` (l.477).

---

I have enough verification. The flagged code points are confirmed: `server.ts` (l. 65-76) `join` on raw `userId`, and `index.ts` stubs at l. 30-35. Now producing the v2 section integrating both control-agent gaps: (1) sequencing/gating fix for REAL-01 + REAL-02, (2) decomposition of the XL task REAL-29 into sub-tasks with intermediate DoD.

## Temps réel & notifications

### État actuel (vérifié sur le code)

**Score : 2/10** (l'audit du 9 fév. n'avait pas isolé ce domaine ; le delta réel est quasi nul — aucune fonctionnalité temps réel/notification de bout en bout ne fonctionne).

#### Ce qui fonctionne (ou existe partiellement)
- **Serveur Socket.io instancié** : `/Users/cyrilsohnde/afristocks/src/server.ts` (l. 22-27) crée un `Server` Socket.io attaché au `httpServer`, avec un CORS limité à `FRONTEND_URL` (l. 24). Un handler de connexion existe (l. 65-76) avec un événement `join` qui place le socket dans une room `user:${userId}`. L'objet `io` est exporté (l. 79).
- **Transport email opérationnel** : `/Users/cyrilsohnde/afristocks/src/utils/email.ts` fournit `sendEmail()` via nodemailer (SMTP générique, défaut Gmail) et 4 templates (`welcome`, `resetPassword`, `twoFactorCode`, `transactionConfirmation`).
- **Un seul appel email réel** : `auth.service.ts` (l. 62-65) envoie le template `welcome` à l'inscription. C'est le seul usage de `sendEmail` dans tout le backend.
- **Modèle `Notification` en base** : `prisma/schema.prisma` (l. 205-220) — champs `userId`, `title`, `message`, `type` (String libre, pas un enum), `isRead`, `readAt`, `metadata` (Json), `createdAt`, index sur `userId` et `isRead`, relation `User.notifications` (l. 65).
- **Service Firebase côté web (squelette)** : `/Users/cyrilsohnde/afristocks/frontend/src/services/firebase.ts` — classe `NotificationService` complète (init FCM, `getToken`, `saveTokenToServer`, listener foreground `onMessage`, `subscribeToTopic`, préférences) + hook `useNotifications()`.
- **`socket.io-client` installé côté web** et utilisé dans `frontend/src/app/news/SmartNewsSection.tsx` (l. 3, 37-43 : `io(...)`, écoute `news:update`).

#### Ce qui est cassé ou absent
- **Aucun événement métier n'émet quoi que ce soit.** `io` est exporté mais jamais importé/utilisé ailleurs. `wallet.service.ts` (dépôt l. 29-81, retrait l. 83-146) et `investment.service.ts` ne créent **aucune** `Notification`, n'émettent **aucun** événement Socket.io, n'envoient **aucun** email. Aucun `prisma.notification.create` dans tout `src`.
- **Socket.io sans authentification.** `server.ts` n'a aucun middleware `io.use(...)` de vérification de token ; le client envoie un `userId` brut via `join` (l. 68) → n'importe qui peut rejoindre la room d'un autre utilisateur et écouter ses notifications. **Faille de confidentialité directe (P0).**
- **Pas d'adaptateur Redis Socket.io** → la mise à l'échelle horizontale (plusieurs réplicas) est impossible : les émissions ne traversent pas les instances. `@socket.io/redis-adapter` n'est pas dans `package.json`.
- **Incompatibilité de protocole web ↔ backend.** `frontend/src/hooks/useWebSocket.ts` utilise l'API navigateur native `new WebSocket(url)` (l. 28) sur `ws://localhost:3001`, alors que le backend parle **Socket.io** (handshake différent). Ce hook (utilisé par `NewsSection.tsx`, `AdvancedTrading.tsx`, `SmartNewsSection.tsx`) ne se connectera jamais ; les erreurs sont silencieusement avalées (`ws.onerror = () => {}`, l. 53). Incohérence d'URL : hook sur `:3001`, `SmartNewsSection` (app/news) sur `:5002`, serveur écoute `PORT` (défaut `3000`).
- **Routes notifications = stubs vides.** `src/routes/index.ts` (l. 30-35) : `register-token`, `subscribe`, `unsubscribe`, `preferences`, `broadcast` renvoient `{ success: true }` sans rien faire. Le `saveTokenToServer` du front (firebase.ts l. 107) écrit donc dans le vide. Pas de table pour stocker les tokens FCM.
- **Pas de `firebase-admin` côté backend** (vérifié : `node_modules/firebase-admin` absent ; absent de `package.json`). Aucun push ne peut être envoyé même si un token était stocké.
- **Pas de service worker FCM** : `frontend/public/` ne contient pas de `firebase-messaging-sw.js` → les notifications **background** (onglet fermé) ne fonctionneront pas, et `getToken` échouera faute de SW enregistré.
- **Config absente** : `.env` ne contient ni `SMTP_*`, ni `FIREBASE_*`, ni mot de passe Redis. SMTP non configuré ⇒ même l'email de bienvenue échoue silencieusement en l'état.
- **2FA par email mort.** Le template `twoFactorCode` (email.ts l. 81-92) n'est jamais appelé : `auth.service.ts` n'utilise que TOTP (speakeasy, l. 249-298). Pas de canal SMS/email pour les codes.
- **Pas de SMS du tout** (aucun SDK Twilio/Orange/Vonage dans les `package.json`).
- **Pas de préférences de notification** en base (aucun champ sur `User`/`UserProfile`, aucun modèle dédié). Le `updatePreferences` du front frappe un stub.
- **Pas de fiabilité** : aucune file (BullMQ/Bull absents), aucun retry, aucune dead-letter, aucun outbox transactionnel.
- **Mobile : zéro.** `mobile/App.tsx` ne référence ni Socket.io, ni Firebase, ni notifications ; `react-native-keychain` est installé mais inutilisé ; les seuls `setTimeout` (l. 151, 253) simulent du chargement. Aucune dépendance push (`@react-native-firebase/messaging`, `notifee`) installée.
- **Tests : aucun** sur ce domaine.

#### Delta depuis l'audit du 9 fév.
Aucune avancée fonctionnelle. Le domaine reste au stade « câblage de surface » : serveur Socket.io présent mais inerte, service Firebase web orphelin, routes notifications transformées en stubs (`index.ts` l. 28-35) probablement pour faire taire les 404 console — ce qui masque l'absence d'implémentation plutôt que de la résoudre.

---

### Backlog (epics et tâches)

Conventions : Effort S (<1j) / M (1-3j) / L (3-5j) / XL (>1 sem). Phases 1-4 du plan directeur. Priorités P0 (bloquant/sécurité) → P2 (confort).

> **Règle de granularité** : aucune tâche d'effort **XL** ne franchit le gating de complétude (C1) avec un critère d'acceptation unique. Toute XL est décomposée ci-dessous en sous-tâches L/M dotées d'une *Definition of Done* (DoD) intermédiaire et vérifiable ; l'identifiant parent reste un **epic-pointer** de suivi.

> **Règle de gating temps réel (C2 — sécurité/confidentialité)** : **aucune émission ni abonnement temps réel côté client** (REAL-40 hook, REAL-42 cloche, REAL-44 wallet RT, REAL-18 broadcast news) ne passe le gating **tant que REAL-01 n'est pas Done**. Le temps réel est **désactivé par défaut** (flag `REALTIME_ENABLED=false`) jusqu'à livraison de REAL-01, qui est rattaché au **Jalon J1 de Phase 1**.

---

#### EPIC A — Sécuriser et fiabiliser la couche Socket.io
*Objectif : transformer le serveur Socket.io inerte et anonyme en un canal temps réel authentifié, scalable et observable.*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-01 | Middleware d'authentification Socket.io **(Jalon J1)** | Ajouter `io.use((socket,next)=>…)` qui lit le JWT depuis `socket.handshake.auth.token`, le vérifie via `verifyAccessToken` (`utils/jwt.ts`), attache `socket.data.userId/role`, rejette sinon. **Supprimer** le `join` à partir d'un `userId` brut (server.ts l. 65-76) ; faire rejoindre **automatiquement** `user:${socket.data.userId}` après auth. Ajouter le flag `REALTIME_ENABLED` (défaut `false`) : tant que ce flag est `false`, le serveur refuse les abonnements. **DoD** : un socket sans token est rejeté ; un socket avec token valide rejoint *uniquement* sa propre room ; aucune room rejointe à partir d'un `userId` fourni par le client (test REAL-06). | `src/server.ts`, `src/utils/jwt.ts`, `.env.example` | M | **1** | **P0** |
| REAL-03 | Module `socket.ts` isolé + accès `getIO()` **(Jalon J1)** | Extraire l'init Socket.io de `server.ts` dans `src/realtime/socket.ts` exposant `initSocket(httpServer)` et `getIO()`, pour découpler des services (éviter import circulaire via `server.ts`). **DoD** : `getIO()` renvoie l'instance ; aucun service n'importe `server.ts`. | `src/realtime/socket.ts` (nouveau), `src/server.ts` | M | **1** | **P0** |
| REAL-02 | Adaptateur Redis pour Socket.io **(prérequis scalabilité >1 réplica)** | Installer `@socket.io/redis-adapter` + 2 clients ioredis (pub/sub), brancher `io.adapter(...)`. Réutiliser `src/config/redis.ts` (gérer Redis indisponible : log + dégradation mono-instance). **Prérequis dur de tout passage à >1 réplica K8s** (lien INFR-16 HPA) : interdire la montée HPA tant que REAL-02 n'est pas Done, sinon la livraison temps réel casse silencieusement entre pods. **DoD** : un événement émis depuis le pod A est reçu par un client connecté au pod B (test à 2 instances). | `src/server.ts`/`src/realtime/socket.ts`, `src/config/redis.ts`, `package.json` | M | 2 | P1 |
| REAL-04 | Rooms par rôle + namespace admin | Faire rejoindre une room `role:ADMIN` aux admins (RBAC via `socket.data.role`) pour les broadcasts admin (nouvelle startup en attente, KYC à valider). Optionnel : namespace `/admin` protégé. | `src/realtime/socket.ts`, `src/middleware/rbac.middleware.ts` | S | 2 | P1 |
| REAL-05 | Gestion connexion/déconnexion observable | Logger via logger structuré le nb de sockets, heartbeat (`pingInterval/pingTimeout`), et exposer une métrique `socket_connections_total`. | `src/realtime/socket.ts` | S | 4 | P2 |
| REAL-06 | Tests d'intégration Socket.io | Tests (socket.io-client en mémoire) : connexion refusée sans token, refusée avec token invalide, room rejointe = `user:<id>` **du token** (pas d'un `userId` client), réception d'un événement émis vers cette room. | `src/realtime/__tests__/socket.test.ts` (nouveau) | M | 2 | P1 |

**Dépendances** : REAL-01 dépend d'un JWT réellement émis/vérifié (domaine *auth*). REAL-02 dépend de Redis authentifié (domaine *infra/sécurité*) **et est prérequis de INFR-16 (HPA / multi-réplicas)**. REAL-04 dépend du RBAC existant et de REAL-01. **Risques** : adaptateur Redis ⇒ SPOF si Redis tombe (prévoir fallback mono-instance) ; double émission si REAL-02 mal configuré.

---

#### EPIC B — Service de notifications backend (cœur du domaine)
*Objectif : un point d'entrée unique `NotificationService` qui persiste en base, pousse en temps réel, et fan-out vers email/push/SMS selon les préférences.*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-07 | Enum `NotificationType` + durcissement modèle | Remplacer `type String` par un enum Prisma (`DEPOSIT_CONFIRMED`, `WITHDRAWAL_REQUESTED`, `WITHDRAWAL_COMPLETED`, `INVESTMENT_CONFIRMED`, `DIVIDEND_PAID`, `KYC_APPROVED`, `KYC_REJECTED`, `SECURITY_LOGIN`, `NEWS`, `SYSTEM`). Ajouter `channel`/`priority` si besoin. Migration. | `prisma/schema.prisma` (l. 205-220), `prisma/migrations/*` | S | 2 | P1 |
| REAL-08 | `NotificationService.create()` (persiste + push RT) | Service central : `create({userId,type,title,message,metadata})` → `prisma.notification.create` puis `getIO().to('user:'+userId).emit('notification:new', payload)`. Renvoie l'entité. **DoD** : émission RT *gardée par `REALTIME_ENABLED`*, jamais appelée à l'intérieur d'une transaction métier (cf. risque EPIC C). | `src/services/notification.service.ts` (nouveau) | M | 2 | **P0** |
| REAL-09 | Controller + routes notifications (remplacer les stubs) | Remplacer les stubs `index.ts` l. 30-35 par de vraies routes authentifiées : `GET /api/v1/notifications` (liste paginée + filtre `isRead`), `GET .../unread-count`, `PATCH .../:id/read`, `POST .../read-all`, `DELETE .../:id`. | `src/routes/notification.routes.ts` (nouveau), `src/controllers/notification.controller.ts` (nouveau), `src/routes/index.ts` | M | 2 | **P0** |
| REAL-10 | Préférences de notification utilisateur | Modèle `NotificationPreference` (par `userId` + par type : `inApp/email/push/sms` bool, `quietHours`). Routes `GET/PUT /api/v1/notifications/preferences` réelles (remplacer stub l. 34). `NotificationService` lit les prefs avant chaque canal. | `prisma/schema.prisma`, `src/controllers/notification.controller.ts`, `src/services/notification.service.ts` | L | 3 | P1 |
| REAL-11 | Idempotence des notifications métier | Clé d'idempotence (ex. `type+transactionId`) pour éviter les doublons en cas de retry. Index unique partiel sur `metadata->>'ref'`. | `src/services/notification.service.ts`, `prisma/schema.prisma` | M | 3 | P1 |

**Dépendances** : REAL-08/09 dépendent de REAL-03 (`getIO`) et de l'auth middleware (REAL-01). REAL-10 dépend de REAL-07. **Risques** : oublier `onDelete: Cascade` déjà présent ; volumétrie notifications (prévoir purge/TTL via REAL-46).

---

#### EPIC C — Brancher les événements métier
*Objectif : chaque action financière/KYC déclenche une notification de bout en bout.*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-12 | Notif « dépôt confirmé » | Après passage `COMPLETED` du dépôt **et commit de la transaction**, appeler `NotificationService.create(DEPOSIT_CONFIRMED)` + email `transactionConfirmation`. Émettre aussi `wallet:balance`. **DoD** : aucune notif émise en cas de rollback (appel hors `$transaction`). | `src/services/wallet.service.ts` (l. 29-81) | S | 3 | **P0** |
| REAL-13 | Notif « retrait demandé / complété » | Notif à la demande (`WITHDRAWAL_REQUESTED`, statut `PENDING`) puis à la complétion (`WITHDRAWAL_COMPLETED`). **Dépendance triple consolidée** : nécessite (a) REAL-08 (`NotificationService`), (b) la **route de retrait manquante** `POST /api/wallet/withdraw` (domaine *wallet/API* — réf. BACK-10), (c) le flux paiement de retrait (domaine *paiements* — réf. PAIE-17). Tâche **bloquée** tant que ces trois prérequis ne sont pas Done ; à inscrire sur le chemin critique inter-domaines. | `src/services/wallet.service.ts` (l. 83-146), `src/routes/wallet.routes.ts` | S | 3 | **P0** |
| REAL-14 | Notif « investissement confirmé » | À la création d'un `Investment` (après commit), notifier + email. Émettre `investment:update`. | `src/services/investment.service.ts` | S | 3 | P0 |
| REAL-15 | Notif « dividende versé » | Brancher sur le futur service dividendes (transaction `DIVIDEND`) : notif + email. | `src/services/investment.service.ts` ou `dividend.service.ts` (futur) | S | 3 | P1 |
| REAL-16 | Notif KYC (approuvé/rejeté) | Sur changement de `user.kycStatus` côté admin, notifier l'utilisateur (in-app + email + push). | `src/services/*` (logique KYC à créer), `src/controllers` admin | S | 3 | P1 |
| REAL-17 | Notif sécurité (nouvelle connexion) | Sur `LoginAttempt` réussie depuis IP/device inconnu, notif + email d'alerte. | `src/services/auth.service.ts`, `src/controllers/auth.controller.ts` | M | 3 | P1 |
| REAL-18 | Broadcast actualités temps réel | Sur publication d'un article (admin), émettre `news:update` à tous (room globale/topic) — aligner avec `SmartNewsSection.tsx` (l. 43). **Gating C2** : ne peut être activé qu'après REAL-01 (sinon canal anonyme). | `src/routes/news.routes.ts`, `src/realtime/socket.ts` | S | 3 | P2 |
| REAL-19 | Broadcast admin `notification:broadcast` réel | Remplacer le stub `index.ts` l. 35 par un endpoint admin (RBAC) qui crée des notifs en masse + push topic. | `src/controllers/notification.controller.ts`, `src/middleware/rbac.middleware.ts` | M | 3 | P2 |

**Dépendances** : tout l'EPIC C dépend de REAL-08. REAL-13 dépend de BACK-10 (`POST /api/wallet/withdraw`) **et** PAIE-17 (flux retrait) **et** REAL-08 — dépendance consolidée sur le chemin critique. REAL-15/16 dépendent des services dividendes/KYC (domaines *business*). REAL-18 est soumis au gating C2 (REAL-01). **Risques** : émettre **dans** la transaction Prisma (`$transaction`) ⇒ notifs envoyées même si rollback → toujours notifier **après** commit (cf. EPIC E outbox).

---

#### EPIC D — Canaux Email & SMS fiabilisés
*Objectif : transformer le helper email minimal en couche multi-canal configurée et testable.*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-20 | Config SMTP réelle + validation au boot | Ajouter `SMTP_HOST/PORT/USER/PASS/SECURE` dans `.env`/`.env.example`, valider au démarrage (échec explicite si manquant en prod). Vérifier `transporter.verify()`. | `.env.example`, `src/utils/email.ts` (l. 8-16), `src/server.ts` | S | 1 | P1 |
| REAL-21 | Templates email manquants | Ajouter templates `deposit/withdrawal/investment/dividend/kyc/securityAlert`, factoriser un layout commun. Rendre la devise dynamique (XOF par défaut mais paramétrable). | `src/utils/email.ts` (l. 45-107) | M | 3 | P1 |
| REAL-22 | Abstraction `MailProvider` + provider prod | Interface mailer permettant de basculer SMTP → provider transactionnel (SES/Mailgun/Postmark) sans toucher aux appelants. | `src/services/mail/*` (nouveau), `src/utils/email.ts` | M | 4 | P2 |
| REAL-23 | Canal SMS (OTP & alertes) | Intégrer un provider SMS adapté Afrique (Twilio/Vonage/Orange SMS API). Service `SmsService.send(phone,msg)`. Utiliser `user.phoneNumber` (schema l. 49). | `src/services/sms.service.ts` (nouveau), `.env.example` | L | 3 | P1 |
| REAL-24 | 2FA / OTP par email & SMS | Brancher le template mort `twoFactorCode` (email.ts l. 81-92) et SMS comme canal OTP alternatif à TOTP (codes stockés Redis avec TTL, cf. pattern existant `2fa_temp` auth.service l. 256). | `src/services/auth.service.ts` (l. 249-298), `src/utils/email.ts`, `src/services/sms.service.ts` | L | 3 | P1 |
| REAL-25 | Tests unitaires email/SMS (mocks) | Mocker nodemailer/SMS, vérifier sélection de template, rendu, et non-envoi si préférence désactivée. | `src/utils/__tests__/email.test.ts` (nouveau) | M | 3 | P2 |

**Dépendances** : REAL-24 dépend de REAL-23 et du flux 2FA auth. **Risques** : secrets SMTP/SMS à gérer hors repo (domaine *sécurité* — `.env.production` exposé) ; coût/délivrabilité SMS en Afrique de l'Ouest.

---

#### EPIC E — Fiabilité : file d'attente, retry, dead-letter, outbox
*Objectif : garantir qu'aucune notification n'est perdue ni dupliquée, et découpler l'émission des canaux lents (email/SMS/push).*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-26 | File de notifications (BullMQ/Redis) | Introduire BullMQ : `NotificationService.create` met en file un job par canal (email/push/sms) ; un worker consomme. L'in-app/RT reste synchrone. | `src/services/notification.service.ts`, `src/workers/notification.worker.ts` (nouveau), `package.json` | L | 3 | P1 |
| REAL-27 | Retry + backoff exponentiel | Config jobs : `attempts`, `backoff` exponentiel, timeout. Idempotence (REAL-11) pour éviter doublons au retry. | `src/workers/notification.worker.ts` | M | 3 | P1 |
| REAL-28 | Dead-letter queue + alerte | Jobs échoués après N tentatives → DLQ persistée + alerte admin. Endpoint admin de rejouabilité. | `src/workers/notification.worker.ts`, `src/controllers/admin` | M | 4 | P2 |
| **REAL-29** | **Pattern transactional outbox (epic-pointer XL)** | **Décomposé en REAL-29a…29d ci-dessous.** Objectif global : supprimer le risque « notif envoyée mais rollback » en écrivant la notification dans la même transaction que l'événement métier, puis en publiant après commit. | *(voir sous-tâches)* | XL | 4 | P2 |
| REAL-29a | Modèle `Outbox` + migration | Table `outbox` (`id`, `aggregateType`, `aggregateId`, `eventType`, `payload` Json, `status` PENDING/SENT/FAILED, `createdAt`, `processedAt`), index sur `status`. **DoD** : migration appliquée, modèle Prisma exposé. | `prisma/schema.prisma`, `prisma/migrations/*` | M | 4 | P2 |
| REAL-29b | Écriture outbox dans la transaction métier | Modifier `wallet.service`/`investment.service` pour insérer une ligne `outbox` **à l'intérieur** du même `$transaction` que l'événement. **DoD** : un rollback annule aussi la ligne outbox (test d'intégration). | `src/services/wallet.service.ts`, `src/services/investment.service.ts` | M | 4 | P2 |
| REAL-29c | Worker relais outbox → file | Worker qui lit les lignes `PENDING`, les publie dans la file BullMQ (REAL-26), marque `SENT`, gère les `FAILED`. **DoD** : aucune ligne `PENDING` ne reste non traitée > délai cible ; pas de double publication (idempotence REAL-11). | `src/workers/outbox.worker.ts` (nouveau) | L | 4 | P2 |
| REAL-29d | Bascule des appels métier de l'émission directe vers l'outbox | Retirer les appels `NotificationService.create` post-commit (REAL-12/13/14) au profit de l'outbox, sans régression fonctionnelle. **DoD** : test e2e (REAL-48) toujours vert ; un crash simulé entre commit et publication ne perd aucune notification. | `src/services/*`, `src/services/notification.service.ts` | M | 4 | P2 |
| REAL-30 | Worker dédié + graceful shutdown | Process worker séparable du serveur HTTP, arrêt propre (drainer la file) sur SIGTERM (compléter `server.ts` l. 107-114). | `src/workers/*`, `src/server.ts` | M | 4 | P2 |

**Dépendances** : tout l'EPIC dépend de Redis fiable (REAL-02 / infra) et de REAL-08. REAL-29c/29d dépendent de REAL-26 (file) et REAL-29a/29b. **Risques** : complexité opérationnelle (worker à déployer/monitorer en K8s) ; sans outbox (REAL-29), fenêtre de perte si crash entre commit DB et mise en file.

---

#### EPIC F — Push Firebase (Web)
*Objectif : rendre le service Firebase web fonctionnel de bout en bout (token stocké → push réel reçu).*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-31 | Modèle `DeviceToken` + endpoint réel | Table `DeviceToken` (`userId`, `token`, `platform`, `lastSeenAt`). Implémenter `POST /api/v1/notifications/register-token` (remplacer stub l. 31) : upsert authentifié. | `prisma/schema.prisma`, `src/controllers/notification.controller.ts` | M | 3 | P1 |
| REAL-32 | Intégration `firebase-admin` (envoi push) | Installer `firebase-admin`, init via clés service-account (env/secret), `PushService.sendToTokens()` et `sendToTopic()`. Brancher comme canal du `NotificationService`. | `src/services/push.service.ts` (nouveau), `package.json`, `.env.example` | L | 3 | P1 |
| REAL-33 | Service worker FCM web | Créer `frontend/public/firebase-messaging-sw.js` (manquant) pour les notifications background ; l'enregistrer dans `firebase.ts` (l. 48-77). Sans lui, `getToken` est fragile. | `frontend/public/firebase-messaging-sw.js` (nouveau), `frontend/src/services/firebase.ts` | M | 3 | P1 |
| REAL-34 | Abonnement/désabonnement topics réels | Implémenter `subscribe/unsubscribe` (stubs l. 32-33) côté backend via `firebase-admin.messaging().subscribeToTopic`. Aligner avec `firebase.ts` (l. 164-200). | `src/controllers/notification.controller.ts`, `src/services/push.service.ts` | M | 3 | P2 |
| REAL-35 | Nettoyage tokens invalides | Sur réponse FCM `messaging/registration-token-not-registered`, supprimer le `DeviceToken`. | `src/services/push.service.ts` | S | 4 | P2 |
| REAL-36 | Config Firebase front sécurisée | Renseigner `NEXT_PUBLIC_FIREBASE_*` + `VAPID_KEY`, documenter. Gérer `isSupported()` faux (Safari/iOS) proprement. | `frontend/.env.example`, `frontend/src/services/firebase.ts` | S | 3 | P2 |

**Dépendances** : REAL-32/34 dépendent de REAL-31. Tout l'EPIC alimente le canal push de REAL-08/REAL-26. **Risques** : clé service-account Firebase = secret sensible (à ne PAS committer, cf. problème `.env.production`) ; iOS Safari support limité.

---

#### EPIC G — Push & temps réel Mobile (React Native)
*Objectif : amener le mobile (actuellement 100 % mock) à parité minimale notifications.*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-37 | Client Socket.io mobile authentifié | Installer `socket.io-client`, créer un service de connexion avec JWT (token sécurisé via `react-native-keychain` déjà installé mais inutilisé), écoute `notification:new`, `wallet:balance`. | `mobile/src/services/socket.ts` (nouveau), `mobile/App.tsx` | L | 3 | P2 |
| **REAL-38** | **Push FCM mobile (epic-pointer XL)** | **Décomposé en REAL-38a…38d ci-dessous.** Objectif global : push FCM reçu sur device iOS + Android, token enregistré via REAL-31. | *(voir sous-tâches)* | XL | 4 | P2 |
| REAL-38a | Install + init `@react-native-firebase/app` & `/messaging` | Ajouter les deps, configurer `google-services.json` (Android) et `GoogleService-Info.plist` (iOS), init du module. **DoD** : l'app build sur les deux plateformes avec Firebase initialisé. | `mobile/package.json`, `mobile/android/*`, `mobile/ios/*` | L | 4 | P2 |
| REAL-38b | Permission + récupération token + enregistrement | Demander la permission notifications, récupérer le token FCM, l'enregistrer via REAL-31. **DoD** : un token apparaît en base (`DeviceToken`, platform mobile) après login. | `mobile/src/services/push.ts` (nouveau) | M | 4 | P2 |
| REAL-38c | Affichage foreground (`notifee`) | Installer `notifee`, afficher les notifications reçues en premier plan. **DoD** : une notif push reçue app ouverte s'affiche. | `mobile/src/services/push.ts`, `mobile/package.json` | M | 4 | P2 |
| REAL-38d | Handler background / app fermée | Configurer le background message handler (Android headless + APNs iOS). **DoD** : une notif reçue app fermée apparaît dans le centre de notifications système. | `mobile/index.js`, `mobile/android/*`, `mobile/ios/*` | M | 4 | P2 |
| REAL-39 | Écran « Notifications » mobile | Liste in-app (réutilise `GET /api/v1/notifications`), badge non-lus, marquage lu — extrait de `App.tsx` (~1165 l. monolithique). | `mobile/src/screens/NotificationsScreen.tsx` (nouveau) | M | 4 | P2 |

**Dépendances** : EPIC G dépend des EPICs A, B, F et d'un JWT mobile réel (le mobile simule l'auth via `setTimeout`, App.tsx l. 151). REAL-38b dépend de REAL-31. **Risques** : config native iOS/Android (APNs/google-services.json) lourde ; hors chemin critique MVP.

---

#### EPIC H — Notifications côté Web (UI in-app + temps réel)
*Objectif : afficher les notifications dans l'app web et corriger le câblage temps réel cassé.*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-40 | Migrer `useWebSocket` → `socket.io-client` | Le hook utilise `new WebSocket` natif (l. 28) incompatible avec le serveur Socket.io. Le réécrire sur `socket.io-client` avec auth par token, ou supprimer au profit d'un `useSocket` unique. **Gating C2** : ne passe pas tant que REAL-01 n'est pas Done. | `frontend/src/hooks/useWebSocket.ts`, `frontend/src/components/NewsSection.tsx`, `AdvancedTrading.tsx`, `SmartNewsSection.tsx` | M | 3 | P1 |
| REAL-41 | Unifier l'URL temps réel | Une seule variable (`NEXT_PUBLIC_API_URL`) au lieu des `:3001`/`:5002`/`PORT` incohérents (hook l. 37 vs app/news/SmartNewsSection l. 37). | `frontend/.env.example`, hooks/composants ci-dessus | S | 3 | P1 |
| REAL-42 | Centre de notifications (cloche + dropdown) | Composant cloche dans `Header.tsx` : badge non-lus (`unread-count`), liste, marquage lu, écoute `notification:new` temps réel. **Gating C2** : l'abonnement temps réel ne passe pas tant que REAL-01 n'est pas Done (le fallback REST reste autorisé). | `frontend/src/components/layout/Header.tsx`, `frontend/src/components/NotificationCenter.tsx` (nouveau) | L | 3 | P1 |
| REAL-43 | Écran préférences de notification | UI branchée sur REAL-10 (par type/canal). Remplacer le `updatePreferences` qui frappe un stub (firebase.ts l. 262-296). | `frontend/src/components/settings/NotificationPreferences.tsx` (nouveau) | M | 3 | P2 |
| REAL-44 | MAJ solde/portefeuille en temps réel | Consommer `wallet:balance`/`investment:update` (émis par EPIC C) pour rafraîchir le solde sans reload. **Gating C2** : abonnement bloqué tant que REAL-01 n'est pas Done. | composants wallet/dashboard | M | 3 | P2 |

**Dépendances** : EPIC H dépend de REAL-01 (auth socket — gating C2), REAL-08/09 (API), et d'un token JWT réel côté front (actuellement `mock-token` en dur — domaine *auth/frontend*). **Risques** : l'auth front fictive bloque les tests réels tant qu'elle n'est pas remplacée.

---

#### EPIC I — Observabilité & gouvernance des notifications
*Objectif : mesurer la délivrabilité et purger la donnée.*

| ID | Titre | Description | Fichiers concernés | Effort | Phase | Prio |
|----|-------|-------------|--------------------|--------|-------|------|
| REAL-45 | Métriques notifications | Compteurs envoyées/échouées/lues par canal et par type (Prometheus). | `src/services/notification.service.ts`, `src/workers/*` | M | 4 | P2 |
| REAL-46 | Purge / archivage des notifications | Job planifié supprimant/archivant les notifs lues > N jours (volumétrie). | `src/workers/cleanup.worker.ts` (nouveau) | S | 4 | P2 |
| REAL-47 | Logs d'audit canaux sensibles | Tracer (sans contenu) l'envoi des notifs sécurité/2FA pour audit. | `src/services/notification.service.ts` | S | 4 | P2 |
| REAL-48 | Tests e2e du parcours notification | De l'événement métier (dépôt) → notif persistée → émission Socket.io reçue par un client de test → email mocké appelé. | `src/__tests__/notifications.e2e.test.ts` (nouveau) | L | 4 | P2 |

**Dépendances** : EPIC I dépend de tous les précédents. **Risques** : sans CI (aucun pipeline aujourd'hui), les tests REAL-06/25/48 ne protègent rien tant que le domaine *infra/CI* n'a pas livré le gating.

---

### Risques spécifiques au domaine

1. **Confidentialité des notifications (P0)** : Socket.io accepte aujourd'hui n'importe quel `userId` via `join` (server.ts l. 65-76) → écoute des notifications d'autrui. **Tant que REAL-01 n'est pas Done, le temps réel reste désactivé par défaut (`REALTIME_ENABLED=false`) et aucun abonnement client (REAL-18/40/42/44) ne passe le gating C2.** REAL-01 est rattaché au Jalon J1 de Phase 1.
2. **Notifications fantômes / rollback** : émettre une notif ou un email à l'intérieur d'un `prisma.$transaction` (wallet.service l. 32-70) enverrait des messages pour des transactions annulées. Imposer « notifier après commit » (REAL-12/13/14) ou l'outbox (REAL-29a-d).
3. **Perte de messages sans file** : sans BullMQ + retry (EPIC E), un échec SMTP/FCM = notification perdue silencieusement (le code avale déjà les erreurs : email.ts l. 39, useWebSocket l. 53).
4. **Scalabilité bloquée (séquencement)** : sans adaptateur Redis (REAL-02), passer à plusieurs réplicas K8s casse la livraison temps réel (émissions non propagées entre pods). **REAL-02 est déclaré prérequis dur de tout passage à >1 réplica (lien INFR-16 HPA)** : interdire l'activation du HPA tant que REAL-02 n'est pas Done. Redis devient alors un SPOF à sécuriser et surveiller (Redis actuellement sans auth — domaine *sécurité*).
5. **Incompatibilité protocole** : le front (WebSocket natif) ne se connecte pas au backend (Socket.io) ; un correctif partiel d'un seul côté donnerait une fausse impression de fonctionnement (REAL-40/41).
6. **Secrets sensibles supplémentaires** : Firebase service-account, identifiants SMTP et SMS s'ajoutent aux secrets déjà exposés (`.env.production`) — risque aggravé si la purge d'historique git n'est pas faite.
7. **Coût & délivrabilité Afrique de l'Ouest** : SMS et push (réseaux mobiles, opérateurs) peuvent avoir un taux d'échec et un coût élevés ; prévoir le throttling et le fallback canal.
8. **Mobile très en retard** : parité notifications mobile (EPIC G, REAL-38a-d) est XL et hors chemin MVP ; risque de sur-promesse si annoncée trop tôt.

### Décisions à valider par le porteur du projet

1. **Temps réel : Socket.io retenu comme standard unique** (et abandon du WebSocket natif du front) ? — recommandé pour réutiliser le serveur existant et l'adaptateur Redis.
2. **Périmètre MVP des canaux** : quels canaux pour le lancement ? (proposition : in-app + email obligatoires ; push web en P1 ; SMS et push mobile différés).
3. **Provider email de production** : SMTP Gmail (actuel, non viable en prod) vs SES/Mailgun/Postmark ? Impacte REAL-22.
4. **Provider SMS** : Twilio (global) vs Orange SMS API / Vonage (meilleure couverture régionale, coût) ? Impacte REAL-23.
5. **2FA/OTP** : conserver TOTP seul, ou ajouter OTP email/SMS comme canal grand public (REAL-24) ?
6. **File d'attente** : adopter BullMQ (dépendance Redis) dès la phase 3, ou commencer en envoi synchrone et migrer ? Impacte la dette de fiabilité (EPIC E).
7. **Outbox transactionnel** : investir dans le pattern (REAL-29a-d, XL décomposé) pour la garantie « exactly-once », ou accepter le risque « at-least-once après commit » au MVP ?
8. **Événements temps réel prioritaires** : confirmer la liste métier (dépôt, retrait, investissement, dividende, KYC, sécurité, news) et leur criticité, pour ordonner l'EPIC C.
9. **Rétention des notifications** : durée avant purge/archivage (REAL-46) et obligations réglementaires éventuelles (audit des alertes sécurité, REAL-47).
10. **Topics push** : périmètre des topics (`news`, `investments`, …) déjà supposé par `firebase.ts` (l. 278-291) — à figer côté backend.

---

Tout est confirmé. Voici la version finale (v2) de la section.

## Infrastructure, Docker & Kubernetes

### Etat actuel (verifie sur le code)

**Score : 2,5/10** (audit initial : 3/10 ; legere amelioration cote `.dockerignore`, mais regression de coherence globale et toujours aucune chaine de deploiement fonctionnelle).

Verification realisee le 21/06/2026 sur `/Users/cyrilsohnde/afristocks` (le code reel ; le dossier `/Users/cyrilsohnde/Projects/Afristocks-Trading` ne contient que `quant-system`, un projet Python distinct). Re-verifie ce jour : les 4 fichiers de secrets sont **toujours suivis** (`git ls-files` retourne `.env.production`, `backend/.env.production`, `Mots de passes et ID.txt`, `backend/Mots de passes et ID.txt`) ; le chart `charts/afristocks/templates/` ne contient que le scaffold (`deployment/service/ingress/hpa/serviceaccount/tests`, aucun `StatefulSet`, aucun `kind: Namespace`, aucun job de migration) ; `.env.production` melange bien `PORT=5000` (l.1), `PORT=3000` (l.6) et `PORT=5000` (l.52).

#### Ce qui fonctionne (partiellement)

- **`.dockerignore` (backend) correctement rempli** : `/Users/cyrilsohnde/afristocks/.dockerignore` (64 lignes) exclut `.git`, `node_modules`, `.env*` (avec `!.env.example`), `.next`, `mobile/`, manifests `*.yaml`, scripts. Conforme au delta annonce depuis l'audit.
- **Dockerfile frontend multi-stage propre** : `/Users/cyrilsohnde/afristocks/frontend/Dockerfile` est correct (3 stages `deps`/`builder`/`runner`, utilisateur non-root `nextjs:nodejs` UID 1001, sortie `standalone`, `NEXT_TELEMETRY_DISABLED`). C'est le seul artefact infra de qualite production du repo. **Reserve** : il faut verifier que `frontend/next.config.js` declare bien `output: 'standalone'`, sinon `/app/.next/standalone` n'existera pas au build.
- **Endpoint `/health` existant cote backend** : `/Users/cyrilsohnde/afristocks/src/routes/index.ts:12` expose `GET /health` (renvoie `{status, timestamp, version}`). Une cible de probe existe donc (mais n'est cablee nulle part). **Aucun `/metrics`** n'est expose (seul un faux `POST /v1/analytics/reading-metrics` existe a `index.ts:40`), ce qui conditionne l'observabilite (cf. INFR-38).
- **Squelette Helm present** : `/Users/cyrilsohnde/afristocks/charts/afristocks/` contient un chart genere par `helm create` (templates `deployment`, `service`, `ingress`, `hpa`, `serviceaccount`, `_helpers.tpl`, `tests/`).
- **docker-compose minimal fonctionnel en dev** : `/Users/cyrilsohnde/afristocks/docker-compose.yml` lance PostgreSQL 16 + Redis 7.

#### Ce qui est casse / absent / dangereux

- **AUCUN CI/CD pour ce projet.** `/Users/cyrilsohnde/afristocks/.github/` est **vide**. Le seul workflow trouve (`/Users/cyrilsohnde/Projects/Afristocks-Trading/.github/workflows/ci.yml`) concerne le projet **`quant-system` Python** (jobs `black`/`flake8`/`mypy`/`pytest`, build `docker/Dockerfile -t quant-system`) : **il ne s'applique pas a Afristocks** (Node/TS). Conclusion de l'audit confirmee : zero pipeline.
- **Dockerfile backend dev-only.** `/Users/cyrilsohnde/afristocks/Dockerfile` (181 octets) : un seul stage `AS development`, `npm ci` (avec devDeps), `CMD ["npm","run","dev"]`, **utilisateur root**, pas de `npm run build`, pas de stage runtime. Inutilisable en production.
- **Trois jeux de manifests K8s incoherents et incomplets** coexistent :
  - `/Users/cyrilsohnde/afristocks/K8s:/backend-deployment.yaml` (dossier au nom aberrant avec `:` final) et `/Users/cyrilsohnde/afristocks/k8s/backend-deployment.yaml` sont **des doublons identiques** d'un Deployment **sans probes, sans `resources` requests/limits, sans `securityContext`, sans `imagePullSecrets`, `tag: latest`**.
  - Manifests « a la racine » : `service.yaml`, `ingress.yaml`, `clusterissuer.yaml`, `production-values.yaml` — non rattaches au chart Helm.
  - Le chart Helm `charts/afristocks/` est **le scaffold par defaut non personnalise** : `values.yaml` pointe sur `image.repository: nginx`, `resources: {}`, `autoscaling.enabled: false`, probes sur `path: /` (et non `/health`), `ingress.enabled: false`, hote `chart-example.local`. Il ne deploie pas l'application Afristocks en l'etat.
- **Incoherences de port.** `Service` (`service.yaml`) et les Deployments ciblent `targetPort/containerPort: 3000`, ce qui correspond au backend (`src/server.ts:82` : `PORT || 3000`). Mais `.env.production` melange `PORT=5000` (l.1), `PORT=3000` (l.6) puis `PORT=5000` (l.52) : configuration ambigue, risque de probe/Service pointant sur le mauvais port.
- **Incoherence de domaine non resolue** : `ingress.yaml` et `clusterissuer.yaml` utilisent `afristocks.eu` + email factice `cyril@exemple.com` ; `production-values.yaml` utilise `afristocks.com`. Le domaine officiel n'est pas tranche.
- **Service `afristocks` mal connecte** : `ingress.yaml` route vers le Service `afristocks` (port 80) dont le `selector: app: afristocks-backend` ne pointe **que** sur le backend. Aucun routing `/api` vs frontend ; le frontend Next.js n'a aucun Service/Deployment/Ingress.
- **Secrets reels toujours exposes (CRITIQUE, transverse securite)** :
  - `/Users/cyrilsohnde/afristocks/.env.production` est **toujours present et toujours suivi par git** (`git ls-files` retourne `.env.production`, `backend/.env.production`). Il contient le mot de passe DB `Bonesoire001`, des secrets JWT factices, des placeholders AWS/paiements.
  - **`Mots de passes et ID.txt` est TOUJOURS suivi par git** (`git ls-files` : `Mots de passes et ID.txt` ET `backend/Mots de passes et ID.txt`) — historique non purge.
  - **AWS Account ID `771237845610`** present en clair dans `K8s:/backend-deployment.yaml`, `k8s/backend-deployment.yaml` et `production-values.yaml` (registre ECR `771237845610.dkr.ecr.eu-west-1.amazonaws.com`).
- **Pas de deploiement PostgreSQL ni Redis en K8s** : aucun StatefulSet/Deployment/PVC/Service pour les datastores (verifie : `grep -r StatefulSet` ne retourne rien). Les Deployments attendent une `DATABASE_URL` et un `REDIS_PASSWORD` (via `secretKeyRef name: afristocks-secrets`) mais ce Secret n'existe nulle part dans le repo, et aucune base n'est provisionnee (ni manifeste, ni reference RDS/ElastiCache). **Consequence de sequencement** : tant que les datastores ne sont pas provisionnes, ni le grand livre/idempotence (domaine DATA, Phase 2) ni les tests d'integration sur cluster ne peuvent fonctionner — ces datastores sont un prerequis dur, pas une tache parallele (cf. INFR-22/23 remontees et chemin critique du chapeau a amender : « datastores provisionnes » entre SECU et DATA).
- **docker-compose : credentials en dur** (`afristocks/afristocks/afristocks`), **aucun healthcheck**, **Redis sans `--requirepass`**, ports exposes sur `0.0.0.0`, pas de service backend/frontend (uniquement les datastores).
- **Manifests manquants (audit confirme)** : NetworkPolicy, ResourceQuota/LimitRange, PodDisruptionBudget, ConfigMap, Secret (manifeste ou ExternalSecrets), RBAC (Role/RoleBinding), HPA active, probes, anti-affinity. **`Namespace afristocks` jamais cree** (reference par tous les manifests mais aucun manifeste `kind: Namespace`, verifie).
- **Aucun monitoring** (pas de Prometheus/Grafana/ServiceMonitor, pas de `/metrics`), **aucun logging centralise**, **aucun backup DB** automatise.
- **Aucune IaC reseau/cluster** : pas de Terraform, pas de provisionning EKS/VPC/RDS/ElastiCache/ECR/S3/IAM.
- **`.next/` et `.pg-data/` versionnes/presents a la racine** (artefacts de build et donnees PG locales), `prisma-engines-6.11.1.tgz` commite — pollution du repo.
- **Bruit residuel multi-stack** : `main.py ` (avec espace final), `requirements.txt` (FastAPI), `dockerignore` (sans point, Python) — vestiges d'un POC FastAPI sans rapport avec le backend Node, source de confusion.
- **Git : 5 remotes** (`origin` GitHub + `backend` GitHub + `gitlab`, `gitlab_backend`, `gitlab_frontend`) ; HEAD = `2acac65` (18/08/2025, « Restore backend from GitLab monorepo ») alors que les fichiers datent de fevrier 2026 : **enorme volume de travail non commite**.

#### Delta reel constate depuis l'audit du 9 fev.

| Point audit | Etat au 21/06 |
|---|---|
| `.dockerignore` rempli | Confirme (64 lignes, OK) |
| `.env.production` supprime | **NON** — toujours present **et suivi par git** |
| `Mots de passes et ID.txt` purge | **NON** — toujours suivi par git (2 copies) |
| CI/CD | **Toujours absent** (le `ci.yml` trouve appartient a quant-system) |
| Manifests K8s completes | **NON** — toujours scaffold + doublons + AWS ID en clair |
| Doublons backend / `.bak` | Confirme supprimes (0 `.bak`, pas de copies backend) |

---

### Backlog (epics et taches)

> Conventions effort : S < 0,5j · M ~1-2j · L ~3-5j · XL > 5j. Phases : 1 Urgence · 2 Stabilisation · 3 Features/MVP · 4 Production.

> **Note de sequencement transverse (importante)** : **INFR-04 (suppression du dossier `K8s:/` et unification sous le chart Helm) est execute EN PREMIER au sein de cet axe.** Une fois INFR-04 fait, le dossier `K8s:/` n'existe plus : toutes les taches en aval (INFR-03, INFR-08, et les taches inter-domaines SECU-05, CICD-51) ne doivent plus cibler `K8s:/...` mais l'unique source de verite (chart Helm `charts/afristocks/`, complete par `k8s/` transitoirement). Les chemins de ces taches sont reecrits en consequence.

#### EPIC A — Securisation immediate des secrets et de l'arborescence infra
*Objectif : eliminer toute fuite de secret et toute incoherence structurelle bloquante avant tout autre travail infra.*

| ID | Titre | Description / fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|
| INFR-04 | **(execute en 1er)** Supprimer le dossier aberrant `K8s:/` et les doublons | Supprimer `/Users/cyrilsohnde/afristocks/K8s:/` (nom illegal avec `:`) ; conserver une **seule source de verite** manifeste (le chart Helm `charts/afristocks/`). Documenter que `K8s:/` n'existe plus et que toute reference doit pointer vers le chart. | Dossier `K8s:/` supprime ; plus de doublon `backend-deployment.yaml` ; arborescence k8s unique documentee ; `grep -rn "K8s:" .` ne retourne plus de chemin actif. | EPIC C (conception du chart) | S | 1 | P0 | Le `:` casse des outils (Windows/CI/tar) ; risque de supprimer le mauvais fichier — verifier avant `rm`. |
| INFR-01 | Retirer du suivi git tous les secrets | `git rm --cached .env.production backend/.env.production "Mots de passes et ID.txt" "backend/Mots de passes et ID.txt"` ; ajouter ces patterns au `.gitignore` racine. | `git ls-files` ne retourne plus aucun `.env*` (hors `.env.example`) ni fichier « Mots de passes » ; commit pousse. | — | S | 1 | P0 | Faux sentiment de securite si l'historique n'est pas purge (INFR-02). |
| INFR-02 | Purger l'historique git des secrets | Lancer `git filter-repo` (ou BFG) sur `.env.production`, `Mots de passes et ID.txt` et toute occurrence du mot de passe `Bonesoire001` ; force-push sur **tous** les remotes ; revoquer/regenerer le mot de passe DB, JWT secrets, cles AWS reellement utilisees. | Aucun secret retrouvable via `git log -p --all \| grep -i bonesoire` ; secrets reels regeneres ; equipe notifiee du force-push. | INFR-01 ; coord. domaine Securite | M | 1 | P0 | Force-push casse les clones existants ; coordination requise (lien domaine Securite). |
| INFR-03 | Externaliser l'AWS Account ID | Remplacer `771237845610.dkr.ecr...` par une variable `{{ .Values.image.repository }}` / `${AWS_ACCOUNT_ID}` injectee au deploiement. **Cibles apres INFR-04** : chart Helm `charts/afristocks/values.yaml` (+ `values-*.yaml`) et `production-values.yaml` uniquement (le dossier `K8s:/` n'existe plus ; `k8s/` est supprime/migre dans le chart). | `grep -r 771237845610 .` ne retourne plus rien hors doc chiffree ; le repository ECR est parametrable. | INFR-04, INFR-08 | S | 1 | P0 | ID deja public dans l'historique → purge necessaire (INFR-02). |
| INFR-05 | Nettoyer les vestiges POC FastAPI et artefacts | Supprimer `main.py `, `requirements.txt`, `dockerignore` (Python) **apres validation porteur** (cf. DEC-8) ; retirer `.next/`, `.pg-data/`, `prisma-engines-6.11.1.tgz` du repo et les ajouter au `.gitignore`. | Repo sans artefact de build/donnee local commite ; `git status` propre ; pas de stack Python orpheline. | DEC-8 | S | 1 | P1 | Verifier que `main.py`/FastAPI n'est pas un service reellement utilise avant suppression. |
| INFR-06 | Consolider les remotes git | Documenter la strategie mono/poly-repo ; reduire a un `origin` canonique ; archiver/retirer les remotes GitLab redondants. | Strategie ecrite dans `README`/`CONTRIBUTING` ; remotes inutiles supprimes ; un seul flux de push documente. | Organisation ; DEC-4 | S | 1 | P1 | Perte d'acces a du code present uniquement sur un remote secondaire. |

#### EPIC B — Conteneurisation production
*Objectif : produire des images backend et frontend reproductibles, minimales, non-root, scannees.*

| ID | Titre | Description / fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|
| INFR-07 | Dockerfile backend multi-stage production | Reecrire `/Users/cyrilsohnde/afristocks/Dockerfile` : stage `deps` (`npm ci`), stage `build` (`npm run build` + `prisma generate`), stage `runtime` (`node:20-alpine`, `npm ci --omit=dev`, copie `dist/` + `prisma/`, user non-root UID 1001, `dumb-init`/`tini`, `CMD ["node","dist/server.js"]`). | `docker build` produit une image qui demarre `dist/server.js` ; `docker run` repond 200 sur `/health` ; image tourne en non-root (`USER` != root) ; taille < 300 Mo. | Build backend OK (domaine Backend) | M | 1 | P0 | Necessite que `npm run build` et la sortie `dist/` existent cote backend. |
| INFR-08 | Parametrer le registre et le tag d'image | Bannir `tag: latest` : tagger par SHA/version ; rendre le repository ECR/registry configurable par env (`AWS_ACCOUNT_ID`, `AWS_REGION`) dans le chart Helm. | Aucune image `:latest` deployee ; tag = SHA git ; repository surchargeable via values Helm. | INFR-03, INFR-12 | S | 2 | P0 | Oubli de mise a jour du tag → deploiement d'une vieille image. |
| INFR-09 | Verifier/forcer `output: standalone` (frontend) | Confirmer dans `frontend/next.config.js` la presence de `output: 'standalone'` (requis par `frontend/Dockerfile`) ; harmoniser `next.config.js`/`.ts`/`.build.js` (3 fichiers concurrents). | `docker build frontend/` reussit sans erreur sur `.next/standalone` ; un seul `next.config` actif. | Frontend | S | 2 | P1 | Sans `standalone`, le Dockerfile frontend echoue silencieusement au COPY. |
| INFR-10 | Aligner Node 18 → 20 (frontend) | Passer `frontend/Dockerfile` de `node:18-alpine` a `node:20-alpine` pour homogeneiser avec le backend. | Frontend build/run OK sous Node 20 ; versions Node unifiees. | INFR-09 | S | 2 | P2 | Incompatibilite eventuelle d'une dependance avec Node 20. |
| INFR-11 | Scan de vulnerabilites des images | Integrer Trivy (image scan) dans le build local + CI ; echouer sur CVE `HIGH/CRITICAL`. | `trivy image` execute en CI ; build casse si CVE critique non whitelistee. | INFR-33 | S | 2 | P1 | Bruit de faux positifs au demarrage (besoin d'une politique d'ignore). |

#### EPIC C — Manifests Kubernetes complets (chart Helm unique)
*Objectif : un chart Helm parametrable, securise et complet comme seule source de verite des manifests. (Toutes ces taches presupposent INFR-04 : le chart est l'unique source ; ni `K8s:/` ni doublons `k8s/` ne subsistent.)*

| ID | Titre | Description / fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|
| INFR-12 | Personnaliser le chart backend | Dans `charts/afristocks/` : `image.repository` = backend ECR, probes sur `/health` (liveness + readiness), `resources` requests/limits, `securityContext` (runAsNonRoot, readOnlyRootFilesystem, drop ALL), `service.port` aligne sur 3000, env via Secret. | `helm template` rend un Deployment backend valide ; `helm lint` passe ; probes pointent `/health` ; `resources` non vides. | INFR-04, INFR-07 | L | 2 | P0 | Scaffold par defaut (image nginx) deploie l'appli par erreur si non corrige. |
| INFR-13 | Sous-chart / chart frontend | Ajouter Deployment+Service+Ingress frontend (Next.js, port 3000) au chart, avec son image. | `helm template` rend backend ET frontend ; routing distinct front/back. | INFR-09, INFR-12 | M | 2 | P1 | Conflit de ports/labels si selectors mal separes. |
| INFR-14 | Probes liveness/readiness/startup | Configurer les 3 probes (startupProbe pour le warm-up Prisma) dans le chart. | Pods passent `Ready` ; un crash backend coupe le trafic ; rolling update sans downtime. | INFR-12 | S | 2 | P0 | Probe trop agressive → boucle de restart. |
| INFR-15 | Requests/limits + LimitRange/ResourceQuota | Definir requests/limits par pod ; ajouter `LimitRange` et `ResourceQuota` sur le namespace. | `kubectl describe quota` montre des quotas actifs ; pods schedulables avec QoS `Burstable`. | INFR-12 | M | 2 | P1 | Limits trop basses → OOMKill. |
| INFR-16 | HPA actif | `autoscaling.enabled: true`, min/max realistes (ex. 2/6), cible CPU 70% (+ memoire). | `kubectl get hpa` affiche un HPA actif qui scale sous charge. | INFR-12, INFR-15 | S | 2 | P1 | HPA inutile sans `resources.requests` (dependance INFR-15). |
| INFR-17 | PodDisruptionBudget + anti-affinity | Ajouter PDB (`minAvailable: 1`) et anti-affinity pour repartir les replicas sur plusieurs nodes. | `kubectl get pdb` present ; pods repartis sur >=2 nodes. | INFR-12 | S | 2 | P2 | PDB trop strict bloque les drains de maintenance. |
| INFR-18 | NetworkPolicy | Default-deny + autorisations explicites (ingress nginx→back, back→PG/Redis). | Trafic non autorise bloque (test `kubectl exec` curl) ; CNI compatible NetworkPolicy. | INFR-22, INFR-23 | M | 2 | P1 | CNI sans support NetworkPolicy → regles ignorees silencieusement. |
| INFR-19 | Namespace + ServiceAccount + RBAC | Manifeste `Namespace afristocks` ; SA dedie (deja scaffolde) ; Role/RoleBinding minimal (pas de droits cluster). | `kubectl get ns afristocks` OK ; pods utilisent le SA dedie ; pas de droits superflus. | INFR-04 | S | 2 | P1 | Namespace reference partout mais jamais cree → tous les applies echouent. |
| INFR-20 | Gestion des secrets K8s | Remplacer le Secret « magique » `afristocks-secrets` par un Secret manifeste (ou ExternalSecrets/SealedSecrets/AWS Secrets Manager — cf. DEC-5). | Secret cree de maniere reproductible ; valeurs jamais en clair dans git ; backend recoit ses env. | INFR-01, INFR-02 ; DEC-5 | M | 2 | P0 | Secret en clair dans git si SealedSecrets/ESO non mis en place. |
| INFR-21 | ConfigMap pour la config non sensible | Externaliser `NODE_ENV`, URLs publiques, flags via ConfigMap. | Config non sensible dans ConfigMap ; redeploy sans rebuild d'image. | INFR-12 | S | 2 | P2 | Confusion config sensible/non sensible. |
| INFR-42 | Chiffrement au repos & cycle de vie de cle (KMS) | **(Nouvelle tache — lacune controle)** Specifier et implementer la gestion de la cle de chiffrement applicatif (secret 2FA via `ENCRYPTION_KEY`, PII KYC) sous **modele enveloppe KMS** : KEK geree par AWS KMS, DEK chiffree stockee (pas de cle statique unique en env) ; rotation, sauvegarde et derivation documentees ; chiffrement **par-champ** des PII (et non seulement SSE bucket S3). Lien SECU-29/30, SECU-06 (secret manager), SECU-09 (rotation). | KEK dans KMS ; DEK chiffree ; procedure de rotation testee ; perte/compromission d'une cle n'entraine ni 2FA irrecuperable global, ni dechiffrement massif ; runbook de rotation/restauration de cle ecrit. | INFR-20, INFR-37 (KMS via IaC) ; coord. Securite | M | 2 | P0 | Cle statique unique = compromission massive ; perte de cle = 2FA/PII irrecuperables → KMS + sauvegarde obligatoires. |

#### EPIC D — Datastores (PostgreSQL & Redis)
*Objectif : provisionner des bases fiables, persistantes, sauvegardees — in-cluster ou managees.*
**Prerequis transverse** : INFR-22/23 sont un **prerequis explicite** du domaine DATA (grand livre/idempotence, Phase 2) et des tests d'integration cluster. A distinguer de la **DB de test locale/ephemere** (TEST-02, Phase 1) qui, elle, n'exige PAS le cluster (PG/Redis en conteneur ou service CI suffisent).

| ID | Titre | Description / fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|
| INFR-22 | Decision + provisionning PostgreSQL | Trancher RDS (recommande) vs StatefulSet+PVC in-cluster (cf. DEC-2) ; si in-cluster : StatefulSet PG16 + PVC + Service + creds via Secret + probes `pg_isready`. | DB joignable depuis le backend ; `DATABASE_URL` injectee via Secret ; persistance verifiee apres restart. | INFR-20 ; DEC-2 | L | 2 | P0 | Perte de donnees si PVC mal configure ; cout RDS. **Prerequis dur de DATA Phase 2.** |
| INFR-23 | Provisionning Redis | ElastiCache vs Deployment/StatefulSet Redis 7 avec `--requirepass` (mot de passe via Secret), PVC si persistance, probe `redis-cli ping`. | Redis joignable et **authentifie** ; `REDIS_PASSWORD` injecte ; backend connecte. | INFR-20 ; coord. Securite ; DEC-2 | M | 2 | P0 | Redis sans auth (etat actuel) = fuite/abus ; lien domaine Securite. **Prerequis dur de DATA Phase 2.** |
| INFR-25 | **Sauvegardes automatiques de la DB (REMONTE en Phase 3)** | **(Re-sequence — lacune controle)** CronJob `pg_dump` (chiffre) vers S3 (ou snapshots RDS automatises) + retention. **Doit etre operationnel AVANT toute migration automatisee destructive en prod (prerequis dur de la migration auto CICD-52/INFR-24).** | Backup quotidien visible dans S3/snapshots ; chiffrement au repos ; retention configuree. | INFR-22, INFR-37 | M | **3** | P0 | Backup absent = migration auto = perte de donnees possible. |
| INFR-24 | Migrations Prisma au deploiement | Job/initContainer Helm executant `prisma migrate deploy` avant le rollout backend ; verrou pour eviter migrations concurrentes multi-replicas. | Migrations appliquees automatiquement ; rollout backend ne demarre qu'apres migration reussie. | INFR-22, **INFR-25 (backup operationnel)**, INFR-43 (test de restauration) | M | **3** | P0 | Migration destructive sans backup teste = perte definitive → INFR-25/INFR-43 sont des prerequis bloquants (et non Phase 4). |
| INFR-43 | Test de restauration DB (gate de la migration auto) | **(Nouvelle tache — lacune controle)** Executer et documenter une **restauration complete** d'un backup `pg_dump`/snapshot dans un environnement isole, mesurer le temps de restauration. Sert de gate a INFR-24 (pas de `migrate deploy` prod tant que la restauration n'est pas prouvee). | Restauration reussie depuis un backup reel ; duree mesuree ; runbook de restauration valide ; resultat consigne (alimente RPO/RTO de INFR-41). | INFR-25 | M | **3** | P0 | Backup jamais teste = inutile le jour J ; bloque legitimement la mise en prod des migrations. |

#### EPIC E — Ingress, TLS & domaine
*Objectif : exposition HTTPS propre sous un domaine unique.*

| ID | Titre | Description / fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|
| INFR-26 | Unifier le domaine | Choisir `.com` ou `.eu` (DEC-1), propager dans `ingress.yaml`, `clusterissuer.yaml`, `production-values.yaml`/chart, env (`FRONTEND_URL`, `API_URL`). | Un seul domaine dans tous les manifests/env ; `grep` ne retourne plus l'autre TLD. | DEC-1 | S | 2 | P0 | DNS/cert errones si domaine non possede. |
| INFR-27 | Ingress complet front/back + path API | Ingress unique routant `/` → frontend et `/api`/`/socket.io` → backend ; annotations sticky/WebSocket pour Socket.io. | Frontend et API accessibles via l'Ingress ; WebSocket fonctionnel ; pas d'API version depreciee. | INFR-12, INFR-13 | M | 2 | P0 | Mauvaise config sticky → coupures Socket.io. |
| INFR-28 | cert-manager + TLS automatique | ClusterIssuer avec **vrai** email (remplacer `cyril@exemple.com`) ; certificat Let's Encrypt auto sur le domaine retenu ; HSTS. | `https://<domaine>` sert un cert valide auto-renouvele ; HTTP→HTTPS force. | INFR-26 | S | 2 | P0 | Rate-limit Let's Encrypt si tests repetes en prod (utiliser staging d'abord). |
| INFR-29 | CORS pilote par config (lien Backend) | Restreindre `app.use(cors())` (actuellement ouvert) a la liste d'origines du/des domaine(s), via ConfigMap. | CORS limite aux origines legitimes ; verifie par requete cross-origin refusee. | INFR-21 ; coord. Backend/Securite | S | 2 | P1 | CORS trop strict casse le front ; lien domaine Securite. |

#### EPIC F — Multi-environnements & dev local
*Objectif : iso-prod reproductible (dev/staging/prod) et dev local sans creds en dur.*

| ID | Titre | Description / fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|
| INFR-30 | Values Helm par environnement | `values-dev.yaml`, `values-staging.yaml`, `values-prod.yaml` (replicas, ressources, domaines, tags distincts) ; nombre d'envs selon DEC-7. | `helm template -f values-<env>.yaml` rend une config coherente par env ; prod != dev. | INFR-12 ; DEC-7 | M | 2 | P1 | Derive de config entre envs si non factorise. |
| INFR-31 | Durcir docker-compose (dev) | Ajouter le backend + frontend au compose ; creds via `.env` (non commite) ; `healthcheck` PG (`pg_isready`)/Redis (`redis-cli ping`) ; Redis `--requirepass` ; `depends_on: condition: service_healthy`. | `docker compose up` demarre toute la stack ; backend attend des datastores `healthy` ; aucun secret en dur dans le fichier. | INFR-07 | M | 2 | P1 | Divergence compose/K8s si non maintenus ensemble. |
| INFR-32 | Resoudre l'ambiguite de port | Trancher le port backend (3000), purger les `PORT=5000` contradictoires de `.env.production` (l.1 et l.52) ; aligner Service/probes/compose/chart. | Un seul port backend dans tout le repo ; Service `targetPort` = port d'ecoute reel (3000). | INFR-12 | S | 1 | P1 | Probe/Service sur mauvais port → pods jamais Ready. |

#### EPIC G — CI/CD
*Objectif : pipeline reel Node/TS : build, test, scan, image, deploy.*

| ID | Titre | Description / fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|
| INFR-33 | Pipeline CI Node/TS | Creer `/Users/cyrilsohnde/afristocks/.github/workflows/ci.yml` (le workflow existant est pour quant-system Python) : install, lint/typecheck, tests backend+frontend, **services PG/Redis ephemeres** pour tests d'integration (distincts du cluster INFR-22/23). | PR declenche le workflow ; jobs verts requis pour merge ; couverture remontee. | Tests (domaine Tests) | M | 2 | P0 | Le workflow Python actuel peut faire croire a tort que la CI existe. |
| INFR-34 | Job build & push images | Build backend+frontend, tag SHA, push ECR ; cache layers ; OIDC GitHub→AWS (pas de cles longues). | Sur merge `main`, images poussees sur ECR taggees SHA ; aucune cle AWS statique stockee. | INFR-07, INFR-13, INFR-08 | M | 2 | P0 | Cles AWS en clair dans les secrets GitHub si OIDC non utilise. |
| INFR-35 | Job deploy (staging→prod) | `helm upgrade --install` vers staging auto, prod sur tag/approbation manuelle ; smoke test `/health` post-deploy. **Le deploy prod incluant `migrate deploy` (INFR-24) est gate par INFR-25 + INFR-43 (backup + restauration testee).** | Deploiement staging automatise ; prod sous gate manuelle ; rollback documente (`helm rollback`). | INFR-30, INFR-34, INFR-24, INFR-43, EPIC C/D/E | L | 3 | P1 | Deploiement prod accidentel sans gate ; migration prod sans backup. |
| INFR-36 | Gate qualite/securite en CI | Integrer Trivy (fs+image), audit deps (`npm audit`), `helm lint`, validation manifests (`kubeconform`). | CI echoue sur CVE critique / manifeste invalide ; rapports archives. | INFR-11, INFR-33 | S | 2 | P1 | Faux positifs bloquants au demarrage. |

#### EPIC H — Provisionning cloud (IaC) & observabilite
*Objectif : infrastructure cloud reproductible et exploitable en production.*

| ID | Titre | Description / fichiers | Definition of Done | Dep. | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|
| INFR-37 | IaC Terraform (cluster + dependances) | Terraform pour VPC, EKS **(ou ECS/Fargate selon DEC-3, cf. note faisabilite)**, ECR, S3 (uploads + backups), RDS/ElastiCache (si manages), **KMS (cf. INFR-42)**, IAM/OIDC ; state distant (S3+DynamoDB lock). **Chantier dimensionne a 3-5 semaines plein temps, porte par un ETP DevOps/SRE dedie (cf. note faisabilite ci-dessous), traite comme un lot a part — pas en parallele « gratuit » du dev applicatif.** | `terraform plan/apply` reproductible ; aucun clic console manuel ; state distant verrouille ; KMS provisionne. | DEC-3 (cloud cible) ; ETP DevOps confirme | XL | 3 | P1 | Cout AWS mal maitrise ; complexite Terraform ; conflit de ressources si pas d'ETP dedie. |
| INFR-38 | Monitoring (Prometheus/Grafana) | Stack kube-prometheus-stack ; **endpoint `/metrics` backend a creer (absent aujourd'hui, cf. lien Backend)** ; ServiceMonitor ; dashboards (latence, erreurs, saturation). | Metriques visibles dans Grafana ; dashboards backend/infra operationnels. | EPIC C ; expo `/metrics` (Backend) | L | 4 | P1 | Sans `/metrics` cote app, observabilite limitee. |
| INFR-39 | Alerting | Alertmanager : alertes pods CrashLoop, DB down, latence/erreurs elevees, certificat proche expiration, **echec de backup (lien INFR-25)**. | Alertes routees (Slack/email) ; au moins une alerte testee de bout en bout. | INFR-38 | M | 4 | P2 | Fatigue d'alertes si seuils mal regles. |
| INFR-40 | Logging centralise | Collecte logs (Loki/CloudWatch) + correlation request-id ; retention definie. | Logs consultables et filtrables hors pods ; retention configuree. | EPIC C | M | 4 | P2 | Cout/volume de logs. |
| INFR-41 | Runbooks, RPO/RTO & DR multi-region (livrable chiffre) | **(Reecrite — lacune controle)** Documenter deploiement, rollback, restauration DB, rotation secrets/cles KMS, incident on-call. **Definir des cibles RPO/RTO chiffrees validees par le porteur** (ex. RPO <= 15 min, RTO <= 1 h — a arbitrer). **Specifier un scenario concret de PERTE DE REGION** (pas seulement multi-AZ) : strategie de bascule (replication cross-region RDS/snapshots copies, S3 CRR, DNS failover), **procedure de bascule testee au moins une fois en staging**, et **budget de la redondance arbitre (DEC-9)**. | Runbooks dans le repo ; RPO/RTO chiffres et valides porteur ; scenario perte-de-region documente ; **bascule testee une fois en staging avec resultat consigne** ; budget DR arbitre. | INFR-25, INFR-43, INFR-35, INFR-37 | L | 4 | P1 | DR « sur le papier » non teste = intention, pas un livrable — inacceptable pour une plateforme financiere. |

#### Note de faisabilite & estimation (IaC / cloud)

- **INFR-37 (Terraform EKS/RDS/ElastiCache/ECR/S3/KMS/IAM) est un lot XL de 3-5 semaines plein temps** et bloque tout deploiement reel (datastores absents aujourd'hui). Il **exige un ETP DevOps/SRE dedie** : le calendrier ne tient que si ce flux ne partage pas ses ressources avec la securite et la CI.
- **Simplification a evaluer (DEC-3)** : si l'equipe est petite, viser **ECS/Fargate ou une PaaS managee au MVP** plutot qu'EKS auto-gere reduirait fortement l'effort IaC et l'ops (au prix d'une moindre portabilite). A trancher avant de lancer INFR-37.

---

### Risques specifiques au domaine

- **Fuite de secrets active** : mot de passe DB `Bonesoire001`, fichiers `.env.production` et `Mots de passes et ID.txt` toujours suivis par git et presents dans l'historique sur 5 remotes (dont 3 GitLab). Tant que INFR-01/02 + regeneration ne sont pas faits, **les identifiants doivent etre consideres comme compromis**.
- **Migration auto sans backup = perte de donnees** : sequencer `prisma migrate deploy` automatise (INFR-24/CICD-52) AVANT un backup teste (INFR-25/INFR-43) est dangereux. Le backup et sa restauration testee sont desormais **prerequis durs en Phase 3** des migrations prod.
- **Datastores absents = blocage en cascade** : aucun PG/Redis provisionne (verifie), aucun `afristocks-secrets`. INFR-22/23 conditionnent le domaine DATA (Phase 2) et les tests d'integration cluster ; la DB de test locale (TEST-02) doit rester ephemere et independante du cluster.
- **Gestion de cle fragile** : sans KMS (enveloppe KEK/DEK, rotation, sauvegarde — INFR-42), une `ENCRYPTION_KEY` statique unique compromise = dechiffrement massif, et une cle perdue = 2FA/PII KYC irrecuperables.
- **Manifests trompeurs** : le chart Helm est le scaffold par defaut (`image: nginx`) — un `helm install` naif deploierait nginx, pas Afristocks. Les Deployments K8s « manuels » sans probes/limits provoqueraient en prod des pods jamais coupes et un risque d'OOM/noisy-neighbor.
- **DR non chiffre/non teste** : pour une plateforme financiere, un DR sans RPO/RTO chiffres et sans bascule testee (corrige par INFR-41) reste une intention, pas un livrable.
- **Faux positif CI** : le seul workflow GitHub present cible quant-system (Python) ; un observateur pourrait croire la CI en place alors qu'Afristocks n'a aucun gating.
- **Incoherences port/domaine** : risque de pods jamais `Ready` (port 5000 vs 3000) et de certificats/DNS invalides (`afristocks.eu` vs `.com`) au premier deploiement reel.
- **Dossier `K8s:/`** : le `:` dans le nom casse de nombreux outils (Windows, certains runners CI, tar) — d'ou son traitement **en premier** (INFR-04) avant toute tache qui le referencait.
- **Faisabilite IaC** : sans ETP DevOps dedie, le lot Terraform XL (INFR-37) entre en conflit de ressources avec securite/CI et fait deraper le calendrier.

### Decisions a valider par le porteur du projet

1. **DEC-1 — Domaine officiel unique** : `afristocks.com` ou `afristocks.eu` ? (impacte Ingress, TLS, CORS, env). Le domaine est-il deja possede/DNS gere ?
2. **DEC-2 — Datastores manages vs in-cluster** : RDS + ElastiCache (recommande, ops reduit) ou PostgreSQL/Redis en StatefulSet (cout moindre, ops accrue) ?
3. **DEC-3 — Cloud cible & niveau de managed** : confirmer AWS/EKS (eu-west-1) **ou** simplifier au MVP en ECS/Fargate/PaaS pour reduire l'effort IaC (XL) ; budget mensuel cible pour dimensionner.
4. **DEC-4 — Strategie repo** : mono-repo unique (recommande) vs poly-repo ; quel remote devient canonique parmi les 5 actuels ?
5. **DEC-5 — Gestion des secrets** : SealedSecrets, External Secrets Operator, ou AWS Secrets Manager ? (prerequis INFR-20).
6. **DEC-6 — Force-push d'historique purge** : accord pour reecrire l'historique git (casse les clones existants) — indispensable vu les secrets commites.
7. **DEC-7 — Nombre d'environnements** : dev + staging + prod, ou prod + un seul pre-prod ? (dimensionne EPIC F et le cout).
8. **DEC-8 — Sort du POC FastAPI** (`main.py`, `requirements.txt`) : a supprimer definitivement ou conserve pour un usage non documente ?
9. **DEC-9 — Niveau de DR & budget** : RPO/RTO cibles chiffres et budget de la redondance multi-region (replication cross-region, DNS failover) — arbitrage cout/risque pour une plateforme financiere (prerequis INFR-41).

Fichiers reels references : `/Users/cyrilsohnde/afristocks/Dockerfile`, `/frontend/Dockerfile`, `/docker-compose.yml`, `/.dockerignore`, `/dockerignore`, `/.env.production` (`PORT` l.1=5000, l.6=3000, l.52=5000), `/Mots de passes et ID.txt`, `/K8s:/backend-deployment.yaml`, `/k8s/backend-deployment.yaml`, `/ingress.yaml`, `/service.yaml`, `/clusterissuer.yaml`, `/production-values.yaml`, `/charts/afristocks/**` (scaffold : `values.yaml`, templates `deployment/service/ingress/hpa/serviceaccount/tests` — ni StatefulSet, ni Namespace, ni job migration), `/src/routes/index.ts` (`/health` l.12 ; pas de `/metrics`), `/src/server.ts` (port 3000), `/main.py `, `/requirements.txt`, et `/Users/cyrilsohnde/Projects/Afristocks-Trading/.github/workflows/ci.yml` (CI appartenant a quant-system, hors perimetre).

---

All facts confirmed. The control agents' main valid concerns are: (1) the Phase 1 sequencing trap — a full CI pipeline built on the current structure gets reworked after the workspace restructuration (REPO-14, Phase 2), and gitleaks must precede the consolidation commit; and (2) DoDs that reference "CI verte" without explicit dependency on the specific CI task. I'll integrate both precisely. Here is the finalized v2.

## CI/CD & release

### Etat actuel (verifie sur le code)

**Score : 0,5 / 10.** Il n'existe aucun pipeline d'integration ni de deploiement continu. Tout passage de code en production repose sur des scripts manuels lances depuis le poste du developpeur.

**Constats verifies sur `/Users/cyrilsohnde/afristocks` (re-verifies le 21 juin 2026) :**

- **Aucun workflow CI/CD.** Pas de repertoire `.github/` (donc aucune GitHub Actions, confirme : `ls .github/workflows` renvoie « no such file »), pas de `.gitlab-ci.yml`, pas de `Jenkinsfile`, pas de `azure-pipelines.yml`. Recherche exhaustive des `*.yml`/`*.yaml` : seuls des manifests Kubernetes/Helm et `docker-compose.yml` existent. **Zero automatisation.**
- **Build « pipeline » = un script bash naif.** `build-prod.sh` fait `cd backend && npm run build || echo "...continuing..."` puis pareil pour le frontend. Le `|| echo ... continuing` masque les echecs : un build casse est traite comme un succes. Pire, le script pointe vers un dossier `backend/` **qui n'existe plus** sur disque (les copies ont ete supprimees du working tree mais restent `D` non committe dans l'index) : le script est donc **deja perime et non fonctionnel**.
- **Pas de gating de tests.** Le `package.json` racine (backend) **n'a aucun script `test`** (scripts presents, re-verifies : `dev`, `seed`, `build`, `build:prod`, `start:prod`, `clean`, `prebuild`, `start`). Les sous-projets ont `"test": "jest"` (`frontend/package.json` confirme : `test=jest`, `lint=next lint` ; `mobile/package.json`) mais seuls ~5 fichiers de test existent au total et rien ne les execute en CI.
- **Pas de lint/typecheck centralise.** Aucun `.eslintrc*` ni `eslint.config.*` a la racine backend ; `frontend`/`mobile` ont un script `lint` mais non cable a un pipeline. `tsconfig.json` racine a `"strict": true` (bon point), mais rien ne lance `tsc --noEmit` automatiquement.
- **Pas de scan de securite** (ni Trivy, ni CodeQL, ni `npm audit` gating, ni gitleaks/trufflehog).
- **Pas de gestion automatisee des dependances.** Aucun `renovate.json`, `.github/dependabot.yml`.
- **Pas de versionnement ni de changelog.** Aucun `CHANGELOG.md`, aucun `.releaserc`/semantic-release/changesets, aucun tag de release Git exploite. Versions figees et incoherentes : racine `1.0.0`, `frontend` `0.1.0`, `mobile` `0.0.1`.
- **Pas de hooks de pre-commit.** Aucun repertoire `.husky/` (confirme : absent), pas de `lint-staged`, pas de `commitlint` -> rien n'empeche un commit de secrets ou de code non linte.
- **Image Docker inadaptee au CI/CD.** `Dockerfile` racine est en **stage `development` uniquement** (re-verifie : `FROM node:20-alpine AS development`, `CMD ["npm", "run", "dev"]`). Pas de build multi-stage, pas d'image de production compilee, pas d'utilisateur non-root, pas de `HEALTHCHECK`.
- **Registry / tags non immuables.** Les manifests (`k8s/backend-deployment.yaml`, `K8s:/backend-deployment.yaml`, `production-values.yaml`) referencent l'image ECR avec le tag `:latest` et `pullPolicy: Always`, rendant tout deploiement non reproductible et tout rollback impossible. **L'Account ID AWS reel (`771237845610`) et la region `eu-west-1` sont exposes en clair** dans des fichiers versionnes.
- **Pas de migrations BDD dans un pipeline.** Les migrations Prisma existent (`prisma/migrations/2025071*`), mais aucun job n'execute `prisma migrate deploy` au deploiement.
- **Pas de rollback, pas de previews, pas d'environnements.** Aucun environnement GitHub (staging/prod), aucune `strategy` ni `readinessProbe`/`livenessProbe` ni `resources` dans le manifest k8s -> rollout health-gated impossible.
- **Hygiene Git incompatible avec un CI propre.** **5 remotes re-verifies** : `origin` (GitHub SSH), `backend` (GitHub), `gitlab`, `gitlab_backend`, `gitlab_frontend`. **HEAD courant = `restore-frontend-2025-08-11`**, pas `main`. Aucune protection de branche.

**Delta depuis l'audit du 9 fev. 2026 : quasi nul sur ce domaine.** Le nettoyage Phase 1 a progresse cote arborescence mais **non committe** ; **aucune brique CI/CD n'a ete ajoutee**. Point critique reconfirme sur disque : `git ls-files` montre que **`.env.production`, `Mots de passes et ID.txt`, `backend/.env.production` et `backend/Mots de passes et ID.txt` sont TOUJOURS suivis dans l'index Git** (donc toujours dans l'historique). Toute mise en place de CI doit commencer par purger ces secrets et figer une politique de secret-scanning, sinon le pipeline ne ferait que diffuser des credentials compromis.

### Sequencement de phase (IMPORTANT — pre-requis de lecture du backlog)

Deux contraintes de sequencement structurent tout ce domaine et doivent etre comprises avant le backlog :

1. **Decision bloquante n°0 (avant tout debut de Phase 1) :** trancher **mono-repo vs poly-repo** (CICD-01 / domaine Organisation REPO-13/ADR, cf. DEC-F). Cette decision conditionne *tout* : structure des workflows, contexte de build Docker, chemins d'import, et la strategie de purge de secrets (SECU-03). Aucun workflow CI ne doit etre ecrit avant qu'elle soit prise.

2. **CI en deux temps pour eviter le retravail garanti :** la restructuration en workspaces (domaine Organisation **REPO-14, Phase 2**) **casse les chemins CI et Docker**. Construire un pipeline complet en Phase 1 puis restructurer en Phase 2 garantit un retravail du pipeline. On scinde donc volontairement :
   - **Phase 1 — minimum independant de la structure :** (a) **secret-scanning gitleaks (pre-commit + CI), pose AVANT le premier commit de consolidation** (REPO-08) afin de ne pas re-introduire de secret ; (b) un **pipeline CI « plat » minimal** sur l'arborescence actuelle (lint/typecheck/test/build best-effort), explicitement etiquete comme provisoire.
   - **Phase 2 — durcissement apres REPO-14 :** reecriture du pipeline sur la structure workspaces (paths-filter, matrices, caches), **CICD-13 etant le point de retravail assume de CICD-10/11/12**.

   Cette scission est tracee ci-dessous (CICD-05a, CICD-10a → CICD-10b/13). **Toute DoD mentionnant « CI verte » dans les autres domaines doit referencer la tache CI precise qui doit etre Done d'abord** (CICD-10a pour la Phase 1, CICD-10b/13 pour la Phase 2) — voir la note de cloture du domaine.

### Backlog (epics et taches)

> Convention : effort S (<0,5 j), M (~1 j), L (2-3 j), XL (>3 j). Phase 1 = Urgence/Nettoyage, 2 = Stabilisation, 3 = Features/MVP, 4 = Production/monitoring.

---

#### EPIC A — Fondations Git, secrets et pre-requis CI

*Objectif : assainir le depot et les secrets pour qu'un pipeline puisse exister sans propager des credentials compromis, et rendre l'historique exploitable par une CI.*

| ID | Titre | Description | Fichiers/chemins | Definition of Done | Dependances | Effort | Phase | Prio | Risques |
|----|-------|-------------|------------------|--------------------|-------------|--------|-------|------|---------|
| CICD-00 | **DECISION bloquante : modele de depot (mono vs poly-repo)** | Trancher mono-repo vs multi-repos AVANT tout workflow CI. Aligner avec Organisation REPO-13/ADR et DEC-F. Conditionne CI, Docker, imports, purge SECU-03. | ADR `docs/adr/0001-repo-strategy.md` | Decision ecrite, datee, validee par le porteur ; consignee comme prerequis de toutes les taches CICD-1x/4x/5x. | DEC-F, Organisation REPO-13 | S | 1 | **P0 (bloquant phase)** | Decision tardive = blocage de tout le domaine ; mauvais choix = re-architecture CI couteuse. |
| CICD-01 | Appliquer le modele de depot retenu | Mettre en oeuvre la decision CICD-00 ; supprimer/archiver les remotes redondants (sur 5) ; designer le remote+branche « source de verite ». | `.git/config`, `docs/REPO_STRATEGY.md` | Remotes reduits a l'essentiel ; un seul repo « source de verite » identifie ; branche par defaut = `main`. | CICD-00, Organisation | M | 1 | P0 | Mauvais choix = re-architecture CI couteuse. |
| CICD-02 | Finaliser et committer le nettoyage Phase 1 | Committer les suppressions deja en `git status` (`backend/**`, `Mots de passes et ID.txt`, `main.py`...) sur une branche propre, ouvrir une PR. **Doit etre precede de CICD-05a (gitleaks) pour ne pas re-commiter de secret.** | `git status` (deletions en attente) | `git status` propre ; PR mergee ; HEAD repositionne sur `main`. | CICD-01, **CICD-05a** | M | 1 | P0 | Perte de fichiers utiles si tri non verifie ; re-commit de secret si gitleaks absent. |
| CICD-03 | Purger les secrets de l'historique Git | Retirer `.env.production`, `Mots de passes et ID.txt` (+ variantes `backend/`) de l'historique via `git filter-repo`/BFG ; force-push sur tous les remotes ; invalider l'ancien historique. | `.env.production`, `Mots de passes et ID.txt`, `backend/.env.production`, `backend/Mots de passes et ID.txt` | `git log --all -- '*.env.production'` ne renvoie rien ; `gitleaks detect` clean sur HEAD ; remotes mis a jour. | CICD-02, domaine Securite (SECU-03) | L | 1 | P0 | Force-push casse les clones existants ; coordination equipe requise. |
| CICD-04 | Rotation de tous les secrets exposes | Regenerer mot de passe DB, secret JWT, cles AWS, et router via secret manager (cf. EPIC F). | `.env.example` (template only) | Anciens secrets revoques ; nouveaux secrets uniquement dans le secret store ; aucun secret en clair dans le repo. | CICD-03, Securite, Infra | M | 1 | P0 | Oubli d'un service consommateur -> panne. |
| **CICD-05a** | **Gitleaks pre-commit + CI minimal (AVANT consolidation)** | **Tache scindee de CICD-05.** Poser gitleaks en hook pre-commit ET en job CI minimal **avant le premier commit de consolidation (REPO-08/CICD-02)**. Independant de la structure du repo. Couvre SECU-34/REPO-05. | `.husky/pre-commit` (gitleaks uniquement), `.gitleaks.toml`, `.github/workflows/security.yml` | Un commit contenant une cle factice est bloque localement ET en CI ; pose AVANT CICD-02/REPO-08. | CICD-00 (decision repo) | M | 1 | **P0** | Hooks contournables (`--no-verify`) -> ne remplacent pas le job CI (donc les deux). |
| CICD-05b | Pre-commit complet (husky + lint-staged) | Completer le hook avec lint-staged (eslint/prettier sur fichiers stages). Separe de CICD-05a car non bloquant pour la consolidation. | `package.json`(s), `.husky/pre-commit`, `.lintstagedrc` | Lint auto sur fichiers stages au commit. | CICD-05a, CICD-06 | S | 1 | P1 | Hooks contournables -> ne remplacent pas la CI. |
| CICD-06 | Normaliser engines & lockfiles | Fixer `engines.node`/`npm` dans chaque `package.json`, ajouter `.nvmrc`, garantir des lockfiles a jour pour `npm ci`. | `package.json`, `frontend/package.json`, `mobile/package.json`, `.nvmrc`, `package-lock.json` | `npm ci` reproductible sur chaque projet ; version Node unique documentee. | CICD-01 | S | 1 | P1 | Drift de versions entre dev et CI. |

---

#### EPIC B — Pipeline d'integration continue (qualite)

*Objectif : sur chaque PR, valider lint, types, tests, build, de maniere bloquante, par projet. **CI livree en deux temps** (cf. Sequencement de phase) : Phase 1 = pipeline plat minimal sur structure actuelle ; Phase 2 = reecriture apres restructuration workspaces (REPO-14).*

| ID | Titre | Description | Fichiers/chemins | Definition of Done | Dependances | Effort | Phase | Prio | Risques |
|----|-------|-------------|------------------|--------------------|-------------|--------|-------|------|---------|
| **CICD-10a** | **CI « plat » minimal (Phase 1, structure actuelle)** | Pipeline minimal et **explicitement provisoire** sur l'arborescence actuelle : `npm ci`, `prisma generate`, `tsc --noEmit` (best-effort), `eslint` si dispo, `jest` sur les ~5 tests existants, build. Sert de filet immediat ; **sera retravaille en CICD-10b/13 apres REPO-14**. | `.github/workflows/ci.yml`, `package.json` (ajout scripts `lint`/`typecheck`/`test`) | PR avec erreur de type/lint/test = check rouge ; vert sinon ; commentaire « pipeline provisoire pre-REPO-14 » dans le workflow. | CICD-00, CICD-06, domaine Tests (TEST-90) | M | 1 | P0 | Avec ~5 tests, gate partiellement factice -> coordonner avec domaine Tests ; retravail assume en Phase 2. |
| **CICD-10b** | **CI backend definitive (Phase 2, post-REPO-14)** | Reecriture du job backend sur la structure workspaces : `npm ci`, `prisma generate`, `tsc --noEmit`, `eslint`, `jest`, build, cache npm, matrice Node si besoin. | `.github/workflows/ci-backend.yml`, `package.json` | Job backend stable sur la nouvelle arborescence ; <5 min ; remplace CICD-10a. | **Organisation REPO-14**, CICD-10a, Tests | M | 2 | P0 | Sequencement : ne pas livrer avant REPO-14 sous peine de re-retravail. |
| CICD-11 | Workflow CI frontend | Sur PR/push (structure workspaces) : `npm ci`, `next lint`, `tsc --noEmit`, `jest`, `next build`. Cache `.next`. | `.github/workflows/ci-frontend.yml`, `frontend/package.json` | Build Next.js et lint bloquants ; artefact build verifie. | **REPO-14**, CICD-06 | M | 2 | P0 | `next build` long -> cache obligatoire. |
| CICD-12 | Workflow CI mobile | Sur PR/push : `npm ci`, `eslint`, `jest` (+ `test:coverage`). Build Android (Gradle assembleDebug) en option. | `.github/workflows/ci-mobile.yml`, `mobile/package.json` | Lint + tests Jest mobile bloquants ; rapport coverage publie. | **REPO-14**, CICD-06 | M | 2 | P1 | Build natif iOS necessite runner macOS (cout). |
| CICD-13 | **Reecriture en jobs separes + paths-filter (point de retravail assume)** | Apres REPO-14 : decouper le pipeline plat (CICD-10a) en jobs par projet et n'executer que ceux des chemins modifies (`dorny/paths-filter`). C'est le retravail planifie du pipeline Phase 1. | `.github/workflows/*.yml` | Une PR ne touchant que `frontend/` ne lance pas la CI backend ; CICD-10a retire. | **REPO-14**, CICD-10b/11/12 | M | 2 | P1 | Filtres mal regles -> jobs sautes a tort. |
| CICD-14 | Gate de couverture de tests | Seuil minimal de coverage (progressif), publie en commentaire de PR. | configs jest, `.github/workflows/*` | Coverage sous le seuil = check rouge ; rapport visible sur la PR. | CICD-10b/11/12, domaine Tests | M | 2 | P2 | Seuil trop haut au depart = blocage permanent. |
| CICD-15 | Validation Prisma & drift schema | Job verifiant `prisma validate` et coherence migrations/schema (`migrate diff`). | `prisma/schema.prisma`, `prisma/migrations/**`, `.github/workflows/ci-backend.yml` | PR modifiant le schema sans migration = echec ; schema invalide = echec. | CICD-10b | M | 2 | P1 | Faux positifs si baseline migrations incomplete. |
| CICD-16 | Lint des Dockerfile & manifests | `hadolint` sur Dockerfiles, `kubeconform`/`helm lint` sur k8s/charts, `yamllint`. **Necessite d'avoir d'abord unifie `k8s/` et `K8s:/`** (nom de dossier invalide avec `:`). | `Dockerfile`, `k8s/**`, `charts/**`, `.github/workflows/ci-infra.yml` | Manifest invalide ou Dockerfile non conforme = check rouge. | EPIC E (Dockerfile prod), CICD-51 (unification dossiers) | M | 2 | P2 | Doublon `K8s:/` au nom invalide a corriger avant lint. |

---

#### EPIC C — Securite dans le pipeline (DevSecOps)

*Objectif : empecher l'introduction de vulnerabilites, secrets et images compromises.*

| ID | Titre | Description | Fichiers/chemins | Definition of Done | Dependances | Effort | Phase | Prio | Risques |
|----|-------|-------------|------------------|--------------------|-------------|--------|-------|------|---------|
| CICD-20 | Secret scanning historique complet | **Etend CICD-05a** : scan planifie de tout l'historique (en complement du pre-commit/CI minimal pose en Phase 1). | `.github/workflows/security.yml`, `.gitleaks.toml` | Rapport historique clean post-purge ; scan planifie actif. | CICD-05a, CICD-03 | S | 1 | P0 | Faux positifs -> maintenir une allowlist. |
| CICD-21 | SAST CodeQL | Analyse CodeQL JS/TS sur push/PR + planifie. | `.github/workflows/codeql.yml` | Alertes CodeQL visibles dans l'onglet Security ; findings high bloquants. | CICD-10b/11 | M | 2 | P1 | Bruit initial eleve. |
| CICD-22 | Scan dependances (npm audit + Trivy fs) | Audit des deps + scan SCA ; severites high/critical bloquantes (avec allowlist motivee). | `.github/workflows/security.yml` | Vuln critique sans exception documentee = check rouge. | CICD-10b/11/12 | M | 2 | P1 | Vulns transitive non patchables -> processus d'exception. |
| CICD-23 | Scan d'image conteneur (Trivy image) | Apres build de l'image, scanner OS+libs avant push registry. | `.github/workflows/build-push.yml` | Image avec CVE critique non exception = push bloque ; rapport SARIF remonte. | EPIC E | M | 2 | P0 | Base `node:alpine` peut introduire des CVE -> politique de mise a jour. |
| CICD-24 | Signature & SBOM des images | Generer un SBOM (Syft) et signer l'image (cosign) ; verifier la signature au deploiement. | `.github/workflows/build-push.yml`, policy admission k8s | Chaque image taggee a un SBOM stocke et une signature verifiee avant deploy. | CICD-23 | L | 4 | P2 | Complexite cosign/keyless ; gestion des cles. |

---

#### EPIC D — Versionnement, release & changelog

*Objectif : des versions reproductibles, tracables, et un historique de release lisible.*

| ID | Titre | Description | Fichiers/chemins | Definition of Done | Dependances | Effort | Phase | Prio | Risques |
|----|-------|-------------|------------------|--------------------|-------------|--------|-------|------|---------|
| CICD-30 | Convention de commits (Conventional Commits) | Adopter Conventional Commits + commitlint en CI et pre-commit. | `commitlint.config.js`, `.husky/commit-msg`, `.github/workflows/ci-*.yml` | PR avec messages non conformes = check rouge ; doc CONTRIBUTING a jour. | CICD-05b | S | 2 | P1 | Adoption equipe ; squash-merge a normaliser. |
| CICD-31 | Versionnement semantique automatise | semantic-release (mono-repo) ou changesets (multi-packages) selon CICD-00 ; bump version + tag Git a partir des commits. | `.releaserc`/`.changeset/`, `.github/workflows/release.yml`, `package.json`(s) | Un merge sur `main` produit un tag SemVer et une release GitHub auto. | CICD-30, **CICD-00** | L | 3 | P1 | Choix de l'outil dependant de CICD-00. |
| CICD-32 | Generation du CHANGELOG | Changelog auto a partir des commits, par projet. | `CHANGELOG.md` (par projet) | Chaque release a un changelog genere et committe. | CICD-31 | S | 3 | P2 | Changelog bruite si commits mal formates. |
| CICD-33 | Tag d'image = version SemVer + SHA | Tagger les images `vX.Y.Z` et `sha-<commit>` (jamais `latest` en prod). | `.github/workflows/build-push.yml`, `production-values.yaml` | Aucune ressource prod ne reference `:latest` ; chaque deploy trace a un tag immuable. | CICD-31, EPIC E, EPIC F | M | 3 | P0 | Migration depuis `:latest` existant -> coordination infra. |

---

#### EPIC E — Build & publication d'images (registry ECR)

*Objectif : produire des images de production reproductibles et les pousser sur ECR de maniere securisee.*

| ID | Titre | Description | Fichiers/chemins | Definition of Done | Dependances | Effort | Phase | Prio | Risques |
|----|-------|-------------|------------------|--------------------|-------------|--------|-------|------|---------|
| CICD-40 | Dockerfile multi-stage production | Remplacer le Dockerfile dev-only (`FROM node:20-alpine AS development`, `CMD npm run dev`) par un build multi-stage (build TS -> runtime slim), utilisateur non-root, `prisma generate`, `HEALTHCHECK`, `CMD node dist/server.js`. | `Dockerfile`, `package.json` (`build`, `start`) | `docker build` produit une image qui demarre `node dist/server.js` ; non-root ; taille reduite vs dev. | Domaine Backend (build prod fonctionnel) | L | 1 | P0 | Build TS aujourd'hui non fiabilise -> a stabiliser. |
| CICD-41 | Dockerfile frontend (Next.js standalone) | Image Next.js `output: standalone` multi-stage. | `frontend/Dockerfile`, `frontend/next.config.*` | Image frontend prod buildee et lancable ; non-root. | CICD-11 | M | 2 | P1 | Variables d'env build-time Next a gerer. |
| CICD-42 | Supprimer le script `build-prod.sh` masquant les erreurs | Retirer le `|| echo continuing` et le `cd backend` perime ; remplacer par la CI. Auditer aussi les scripts annexes (`quick-test.sh`, `test-*.sh`, `check-status.sh`). | `build-prod.sh` (+ scripts `test-*.sh`) | Script supprime ou reecrit sans masquage d'erreur ; build pilote par CI ; scripts perimes nettoyes. | CICD-10a/11 | S | 1 | P1 | Scripts annexes a auditer avant suppression. |
| CICD-43 | Auth OIDC GitHub Actions -> AWS (ECR) | Role IAM assumable via OIDC (pas de cle AWS longue duree dans la CI). | `.github/workflows/build-push.yml`, IAM (Infra) | Push ECR fonctionne sans secret AWS statique ; role a permissions minimales. | CICD-04, Infra (IAM/ECR) | M | 2 | P0 | Mauvaise trust policy = acces trop large. |
| CICD-44 | Job build & push ECR | Build, tag (SemVer+SHA), scan (CICD-23), push vers `eu-west-1` ECR. **Account ID `771237845610`/region externalises en variables (jamais hardcode).** | `.github/workflows/build-push.yml` | Merge sur `main` pousse une image taggee scannee sur ECR ; aucun Account ID/region en dur ; logs tracables. | CICD-40, CICD-43, CICD-23, CICD-33 | M | 2 | P0 | Account ID/region a externaliser (cf. CICD-51). |
| CICD-45 | Cache de build (BuildKit/GHA cache) | Activer le cache de layers pour accelerer les builds. | `.github/workflows/build-push.yml` | Build incremental notablement plus rapide qu'un cold build. | CICD-44 | S | 2 | P2 | Cache empoisonne -> invalidation a prevoir. |

---

#### EPIC F — Deploiement continu (staging -> prod) & migrations

*Objectif : deployer automatiquement sur staging, puis sur prod apres approbation, avec migrations BDD et rollback.*

| ID | Titre | Description | Fichiers/chemins | Definition of Done | Dependances | Effort | Phase | Prio | Risques |
|----|-------|-------------|------------------|--------------------|-------------|--------|-------|------|---------|
| CICD-50 | Environnements GitHub + secrets | Creer environnements `staging` et `production` avec secrets dedies, reviewers requis sur `production`. | repo settings, `.github/workflows/deploy-*.yml` | Deploy prod impossible sans approbation ; secrets scoping par env. | CICD-01 | M | 2 | P0 | Mauvais scoping -> fuite cross-env. |
| CICD-51 | Externaliser config k8s + unifier `k8s/`/`K8s:/` | Sortir `771237845610`, `eu-west-1` et le domaine des manifests vers variables/values ; **unifier les dossiers doublons `k8s/` et `K8s:/`** (nom invalide avec `:`) ; corriger l'incoherence `afristocks.com`/`.eu`. | `production-values.yaml`, `k8s/backend-deployment.yaml`, `K8s:/backend-deployment.yaml`, `ingress.yaml` | Plus aucun Account ID/region/domaine hardcode ; un seul dossier manifests ; domaine unique coherent. | Infra, CICD-50 | M | 2 | P0 | Doublons d'arborescence a unifier avant tout lint (CICD-16). |
| CICD-52 | Job de migration BDD (`prisma migrate deploy`) | Etape pre-deploiement appliquant les migrations avant le rollout applicatif. | `.github/workflows/deploy-*.yml`, `prisma/migrations/**` | Deploiement applique les migrations en attente ; echec migration = deploiement avorte. | CICD-15, Infra (acces DB + backup) | L | 3 | P0 | Migration destructive sans backup -> perte de donnees ; coordonner backup (Infra). |
| CICD-53 | Deploiement staging automatique | Sur merge `main` : deployer l'image taggee sur staging (Helm/kubectl). | `.github/workflows/deploy-staging.yml`, `charts/afristocks/**` | Chaque merge `main` met a jour staging avec le tag immuable ; smoke test post-deploy. | CICD-44, CICD-50, CICD-51, CICD-56 | L | 3 | P0 | Sans probes (CICD-56), rollout « reussi » mais app KO. |
| CICD-54 | Deploiement production avec approbation | Promotion staging->prod manuelle (environnement protege), meme image. | `.github/workflows/deploy-prod.yml` | Prod deploye uniquement apres approbation, en reutilisant l'image validee en staging. | CICD-53 | M | 3 | P0 | Derive si build prod different de staging -> imposer reuse d'image. |
| CICD-55 | Strategie de rollback | Rollback auto sur echec de health post-deploy + commande manuelle (`helm rollback`/tag precedent). | `.github/workflows/deploy-*.yml`, `docs/RUNBOOK_ROLLBACK.md` | Un deploy echouant aux smoke tests revient a la version precedente ; procedure manuelle documentee et testee. | CICD-33, CICD-56 | L | 3 | P0 | Rollback DB non trivial si migration appliquee -> migrations retro-compatibles. |
| CICD-56 | Probes, resources & strategy de rollout | Ajouter `readinessProbe`/`livenessProbe`/`startupProbe`, `resources` requests/limits, `strategy: RollingUpdate`. | `k8s/backend-deployment.yaml`, `charts/afristocks/templates/deployment.yaml`, `production-values.yaml` | Rollout health-gated ; `kubectl rollout status` fiable ; pas de downtime au deploy. | Infra, Backend (`/health` fiable) | M | 2 | P0 | Endpoint `/health` doit exister et etre fiable. |
| CICD-57 | Smoke / health checks post-deploy | Apres deploy, verifier `/health` (et endpoints critiques) avant de valider le rollout. | `.github/workflows/deploy-*.yml` | Deploy non valide tant que le smoke test n'est pas vert. | CICD-56 | M | 3 | P1 | Healthcheck superficiel -> faux « OK ». |
| CICD-58 | Deployer PostgreSQL & Redis (ou managed) | Statuer (RDS/ElastiCache managed vs k8s) et integrer leur provisioning. | Infra/IaC, `charts/**` | Staging/prod disposent de PG et Redis accessibles et authentifies ; pipeline ne deploie pas une app sans backend de donnees. | Infra | XL | 3 | P0 | Hors perimetre strict CICD mais bloquant pour tout deploy reel. |

---

#### EPIC G — Gestion des dependances & maintenance

*Objectif : garder les dependances a jour et sures sans effort manuel.*

| ID | Titre | Description | Fichiers/chemins | Definition of Done | Dependances | Effort | Phase | Prio | Risques |
|----|-------|-------------|------------------|--------------------|-------------|--------|-------|------|---------|
| CICD-60 | Renovate (ou Dependabot) | MAJ automatiques de deps (npm + GitHub Actions + Docker base images) avec regroupement et auto-merge des patchs surs. | `renovate.json` ou `.github/dependabot.yml` | PRs de MAJ ouvertes automatiquement, passant la CI (CICD-10b/13) ; patchs surs auto-mergeables. | CICD-10b/11/12 | M | 2 | P1 | Flot de PRs ingerable sans grouping/auto-merge. |
| CICD-61 | Pin des actions GitHub par SHA | Epingler les actions tierces par commit SHA (supply chain). | `.github/workflows/*.yml` | Aucune action referencee par tag mutable ; toutes par SHA. | EPIC B | S | 2 | P2 | Maintenance via Renovate. |
| CICD-62 | Mise a jour planifiee des images de base | Job planifie pour rebuild/scan periodique des images (CVE base OS). | `.github/workflows/security.yml` | Rebuild+scan planifie ; alerte si CVE critique sur image deployee. | CICD-23, CICD-44 | S | 4 | P2 | Rebuild silencieux peut introduire des regressions. |

---

#### EPIC H — Protection de branche, gouvernance & previews

*Objectif : qualite imposee par la plateforme et boucle de revue efficace.*

| ID | Titre | Description | Fichiers/chemins | Definition of Done | Dependances | Effort | Phase | Prio | Risques |
|----|-------|-------------|------------------|--------------------|-------------|--------|-------|------|---------|
| CICD-70 | Protection de branche `main` | Exiger PR, 1+ revue, checks CI verts (referencer CICD-10a en P1, CICD-10b/13 en P2), branche a jour, interdiction force-push ; archiver les branches « restore-* ». | repo settings, branches Git | Push direct sur `main` impossible ; merge bloque si CI rouge ; branches obsoletes archivees. | CICD-10a (P1), puis CICD-10b/11/12 (P2), **apres CICD-03** | S | 1 | P0 | Le force-push de purge (CICD-03) doit preceder l'activation. |
| CICD-71 | CODEOWNERS & templates PR/issue | Definir owners par dossier ; templates de PR (checklist secu/tests). | `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md` | Revue auto-assignee par zone ; checklist presente sur chaque PR. | CICD-01 | S | 2 | P2 | Owners absents -> PR bloquees. |
| CICD-72 | Previews ephemeres frontend | Deploiement de preview par PR (Vercel ou namespace k8s ephemere) avec URL commentee. | `.github/workflows/preview.yml`, `frontend/**` | Chaque PR frontend genere une URL de preview ; teardown a la fermeture. | CICD-41 | L | 3 | P2 | Cout/ressources des environnements ephemeres. |
| CICD-73 | Documentation CI/CD & runbooks | Documenter pipelines, secrets requis, procedures deploy/rollback/incident. | `docs/CICD.md`, `docs/RUNBOOK_*.md` | Un nouvel arrivant peut deployer et rollback en suivant la doc. | EPIC F | M | 3 | P1 | Doc qui derive si non maintenue. |

---

### Contrat de dependances inter-domaines (pour les DoD « CI verte »)

Plusieurs domaines referencent « CI verte » dans leurs DoD sans tache CI precise. **Regle de cloture (controle C2 / sequencement) : toute DoD mentionnant la CI doit pointer la tache CICD exacte qui doit etre Done d'abord :**

- **Phase 1** -> dependance explicite sur **CICD-10a** (pipeline plat minimal) et, pour les DoD « CI bloque sur faux secret », sur **CICD-05a** (gitleaks). Concerne notamment : TEST-90 (la CI Phase 1 gate sur des tests dont l'existence releve d'EPIC A/B Tests — ajouter la dependance croisee TEST -> CICD-10a, et signaler que le gate est partiel tant que les tests reels manquent), et les DoD de secret-scanning (SECU-34/REPO-05 -> CICD-05a, qui doit etre Done **avant** REPO-08/CICD-02).
- **Phase 2+** -> dependance explicite sur **CICD-10b/CICD-13** (CI definitive post-REPO-14). Concerne notamment PAIE-30 (« CI bloque le merge » -> CICD-10b) et OBSE-36 (« annotation releases » -> CICD-31/CICD-44, eux-memes Phase 3 : si OBSE-36 est exige plus tot, sa phase doit etre alignee ou la dependance documentee comme non satisfaite).

Action concrete : les porteurs de TEST-90, PAIE-30 et OBSE-36 doivent ajouter ces dependances dans leurs fiches, et l'ordre P0->P1->P2 par phase doit etre verifie a la planification.

### Risques specifiques au domaine

- **Secrets compromis encore dans l'historique** (`.env.production`, `Mots de passes et ID.txt` toujours suivis par Git, Account ID AWS `771237845610` en clair) : industrialiser un pipeline avant la purge (CICD-03/04) ne ferait qu'automatiser la diffusion de credentials compromis. **Bloquant absolu de Phase 1** ; gitleaks (CICD-05a) doit etre pose **avant** le premier commit de consolidation.
- **Retravail garanti du pipeline si mal sequence** : un pipeline complet construit en Phase 1 sur l'arborescence actuelle est casse par la restructuration workspaces (Organisation REPO-14, Phase 2). D'ou la scission CICD-10a (provisoire P1) -> CICD-10b/13 (definitif P2). **Ne pas livrer la CI definitive avant REPO-14.**
- **Decision repo non tranchee (CICD-00)** : bloque CI, Docker, imports, versionnement (semantic-release vs changesets) et purge. A trancher en tout debut de Phase 1.
- **Tag `:latest` + `pullPolicy: Always`** : rend tout deploiement non reproductible et tout rollback fiable impossible tant que CICD-33/55 ne sont pas faits.
- **Gating de tests illusoire** : avec ~5 tests reels et aucun script `test` backend, une CI « verte » (CICD-10a) donne un faux sentiment de securite. Le domaine CI/CD depend fortement du domaine Tests (TEST-90) pour avoir du sens.
- **Migrations BDD sans backup ni rollback DB** : une `prisma migrate deploy` automatisee (CICD-52) sur une migration destructive peut detruire des donnees prod ; necessite backups (Infra) et migrations retro-compatibles.
- **Multi-remotes / branches de restore** : 5 remotes (GitHub x2, GitLab x3) et HEAD sur `restore-frontend-2025-08-11` rendent ambigue la « source de verite » ; risque de pipelines divergents.
- **Doublons d'arborescence infra** (`k8s/` vs `K8s:/`, nom de dossier invalide avec `:`) : casse les builds et les lints de manifests tant que non unifies (CICD-51 avant CICD-16).
- **Cout des runners** : builds Next.js, scans Trivy/CodeQL et surtout build natif mobile (runner macOS) peuvent exploser les minutes GitHub Actions.
- **Force-push de purge d'historique** : invalide tous les clones existants ; sans coordination, perte de travail non pousse (rappel : beaucoup de travail non commite sur disque).

### Decisions a valider par le porteur du projet

1. **Plateforme CI/CD** : GitHub Actions (recommande, repo `origin` sur GitHub) vs GitLab CI ? Conditionne tous les workflows.
2. **Modele de depot (CICD-00, bloquant)** : monorepo unique ou multi-repos (backend/frontend/mobile) ? Impacte le versionnement (semantic-release vs changesets), les filtres de chemins et la sequence CI Phase 1/Phase 2.
3. **Source de verite Git** : quel remote et quelle branche par defaut ? Faut-il supprimer GitLab et le remote `backend` ?
4. **Cible de deploiement** : conserver Kubernetes (EKS) ou simplifier (ECS/Fargate, ou Vercel pour le front + service manage backend) ? Determine EPIC F.
5. **PostgreSQL & Redis** : managed AWS (RDS/ElastiCache) ou auto-heberges k8s ? Bloquant pour tout deploiement reel (CICD-58).
6. **Strategie de tags d'image** : SemVer, `sha-<commit>`, ou les deux ? Abandon de `:latest` confirme ?
7. **Niveau d'exigence des gates** : seuil de couverture initial, severite bloquante des scans (high vs critical), auto-merge des patchs de deps ?
8. **Approbation prod** : un ou deux reviewers ? Fenetres de deploiement / freeze ?
9. **Previews ephemeres** : souhaitees malgre le cout (Phase 3) ?
10. **Domaine canonique** : `afristocks.com` ou `afristocks.eu` ? A figer avant CICD-51.
11. **Budget runners** : build mobile natif en CI (runner macOS payant) des Phase 2, ou differe ?

---

All v1 facts confirmed on disk. Now I'll produce the v2 with the three gaps integrated: (1) Phase-1 security/secret gating distinct from coverage gating + advancing TEST-26 to Phase 1; (2) dedicated QA capacity + re-worked coverage ramp; (3) single reconciled coverage-threshold table propagated everywhere.

## Tests & QA

### Etat actuel (verifie sur le code)

**Score : 1,5 / 10** (audit du 9 fev. : 1/10 ; leger delta positif, voir ci-dessous).

#### Ce qui existe / fonctionne (partiellement)

- **Mobile** est de loin le mieux outille. `mobile/package.json` declare une vraie stack de test : `jest@29`, `ts-jest@29`, `@testing-library/react-native@13`, `@testing-library/jest-native@5`, `react-test-renderer@19`, `@types/jest`, et des scripts complets (`test`, `test:watch`, `test:coverage`, `test:debug`). Un `mobile/jest.config.js` est present avec `collectCoverageFrom` configure.
- **4 fichiers de test mobile** existent et sont coherents avec des sources reelles :
  - `mobile/tests/unit/api.test.ts` (3 cas : succes, erreur HTTP 500, erreur reseau) cible `mobile/src/services/api.ts` — fichier reel verifie.
  - `mobile/tests/unit/health.test.ts` (test supertest d'un mini-Express).
  - `mobile/tests/unit/WelcomeScreen.test.tsx` (2 cas via `@testing-library/react-native`) cible `mobile/src/components/WelcomeScreen.tsx` — fichier reel verifie.
  - `mobile/__tests__/App.test.tsx` (smoke test de rendu `App`).
- **Frontend** : `frontend/jest.config.js` (via `next/jest`), `frontend/jest.setup.js` (importe `@testing-library/jest-dom`), et les devDeps `jest-environment-jsdom`, `@testing-library/react@16`, `@testing-library/jest-dom@6`. Un test : `frontend/__test__/components/GlassCard.test.ts` (2 cas) ciblant `frontend/src/components/ui/GlassCard.tsx` — source reelle verifiee.

#### Ce qui est casse / absent (verifie)

- **Aucun des tests n'est actuellement executable** : `frontend/node_modules/jest` et `mobile/node_modules/jest` sont **absents** (verifie : `jest not installed`). `npm test` echoue tant qu'un `npm install` n'a pas ete lance dans chaque sous-projet.
- **Backend : zero infrastructure de test.** `package.json` (racine) n'a **aucun script de test**, **aucun** `jest`, `ts-jest`, `supertest`, `@types/jest` ni fichier de config. **0 fichier de test sous `src/`** (verifie : `find src -name '*.test.*'` = vide). Or c'est la ou se trouve toute la logique monetaire/securite a tester : `src/services/wallet.service.ts` (188 l. : `deposit`, `withdraw`, `getBalance`, `getTransactionHistory`, transactions Prisma `$transaction`), `src/services/investment.service.ts` (186 l.), `src/services/auth.service.ts` (307 l. : JWT, 2FA, bcrypt), `src/utils/jwt.ts`, `src/utils/token.utils.ts`.
- **Bugs de configuration de test (verifies sur disque) :**
  - `frontend/jest.config.js` : `testEnvironment: 'jest-environment-jsdom'` est correct, mais le test JSX est nomme `GlassCard.test.ts` (extension `.ts` pour du JSX) → echec de parsing TSX probable. Aucun `testMatch`/`roots` restreint ; le dossier est `__test__` (singulier) au lieu de `__tests__`.
  - `mobile/jest.config.js` (verifie) : `testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts']` ne matche **que `.ts`**, donc `WelcomeScreen.test.tsx` et `__tests__/App.test.tsx` (en `.tsx`) **ne sont jamais collectes**. Le preset `ts-jest` + `testEnvironment: 'node'` est inadapte a React Native (il faudrait le preset `react-native` + babel).
  - `mobile/tests/unit/health.test.ts` importe `supertest` (verifie : `import request from 'supertest'`) qui **n'est pas declare** dans `mobile/package.json` (verifie : `no supertest in mobile pkg`) → echec a l'import.
- **Aucun test d'integration API** (supertest contre les routes Express + BDD de test). **Aucun E2E** (pas de Playwright/Cypress cote web, pas de Detox cote mobile — `.detoxrc`/`playwright.config` absents). **Aucun test de charge** (pas de k6). **Aucun test de contrat d'API**. **Aucune factory/fixture** de donnees de test.
- **Aucune CI/CD, donc aucun gating.** `find` sur `.github/workflows`, `.gitlab-ci.yml`, `Jenkinsfile`, `azure-pipelines.yml` = **vide** (verifie). Les tests ne sont jamais executes automatiquement (5 remotes : `origin` GitHub, `backend` GitHub, et 3 remotes GitLab — aucun n'a de pipeline).
- **Aucun objectif/mesure de couverture** cote backend et frontend. Seul mobile a un `collectCoverageFrom`.
- Les anciens scripts shell `test-*.sh` (`test-auth-flow.sh`, `test-complete.sh`, `test-final.sh`, `quick-test.sh`) sont des appels `curl` manuels datant d'aout 2025 : non deterministes, non assertifs, non integrables en CI. A considerer comme de la documentation, pas comme des tests.

#### Delta reel depuis l'audit du 9 fev.

L'audit annoncait « ~1 test sur tout le projet ». La realite disque est legerement meilleure : **6 fichiers de test** (4 mobile + 1 frontend + le smoke `App.test.tsx`) et **2 configurations Jest reelles**. Cependant, aucun n'est branche en CI, aucun n'est executable en l'etat (deps absentes + bugs de config), et le **backend reste a zero**. Le score evolue de 1 a 1,5/10. Le travail de fond (pyramide, integration, E2E, charge, gating) reste **entierement a faire**.

---

### Table unique des seuils de couverture (source de verite)

> **Cette table est la source unique** referencee par toutes les sections du plan (chapeau section 7, BACK-71, KYC-29, et les taches TEST-* ci-dessous). En cas de divergence chiffree ailleurs, **c'est cette table qui fait foi**. Les valeurs anterieurement contradictoires (chapeau « ≥70 % monetaire/auth en P2 », BACK-71 « >70 % services », TEST-91 « 60 % P2 → 80 % P4 ») sont **reconciliees ici** en distinguant explicitement le seuil **GLOBAL** du seuil **RENFORCE** (modules monetaires/auth).

| Phase | Seuil GLOBAL (gating couverture) | Seuil RENFORCE — services monetaires/auth (`wallet`, `investment`, `auth`, utils JWT, middlewares securite) | Gating securite/secret (independant de la couverture) |
|-------|----------------------------------|----------------------------------------------------------------------------------------|---------------------------------------------------------|
| **Phase 1** | **Aucun seuil de couverture** (backend = 0 test ; un gating chiffre serait soit a 0 % inutile, soit bloquant a vide) | **Aucun** (services testes a partir de P2) | **ACTIF et bloquant** : gitleaks (secrets), test anti-CORS-ouvert, tests d'integration negatifs auth/RBAC (TEST-26) accompagnant les corrections SECU-10/11/12/23 |
| **Phase 2** | **40 %** | **70 %** | Maintenu + scan deps/SAST |
| **Phase 3** | **60 %** | **80 %** | Maintenu |
| **Phase 4** | **80 %** | **90 %** | Maintenu |

**Justification du re-sequencement (lacune « faux gating Phase 1 ») :** la Phase 1 n'impose **aucun gating de couverture** (le backend n'a aucun test a couvrir) ; elle impose un **gating securite/secret reel et atteignable** (TEST-100 + gitleaks) ainsi que les **tests de non-regression securite negatifs (TEST-26)** qui sont **avances en Phase 1** pour accompagner les corrections P0 du domaine Securite (CORS, RBAC, auth) et empecher leur regression des leur merge — plutot que d'attendre que la correction soit livree une phase avant son filet. Le gating de couverture ne s'active qu'en Phase 2, lorsque les premiers tests de services existent.

**Capacite QA dediee (lacune « cout du passage de 0 a une couverture gating ») :** atteindre les seuils RENFORCES ci-dessus sur des services **eux-memes en refonte** (ledger, idempotence, withdraw, rendement) genere du re-travail de tests important. Le plan **reserve explicitement une capacite QA dediee a partir de la Phase 2 : 1 ETP test, ou a defaut 30-40 % de la capacite dev**, chiffree separement du dev feature. La rampe de couverture a ete volontairement **etalee (40 % P2 → 80 % P4 en global ; 70 % → 90 % sur monetaire/auth)** pour absorber ce re-travail. **Sans cette capacite dediee, soit la cible de couverture, soit la date de livraison sautera** — c'est un arbitrage a acter par le porteur (voir Decisions, point 2).

---

### Backlog (epics et taches)

Conventions : Effort S (<0,5 j), M (~1 j), L (2-3 j), XL (>3 j). Phases 1-4 (alignees sur P1 Urgence, P2 Stabilisation, P3 MVP, P4 Production). Priorites P0 (bloquant) / P1 / P2. Les seuils cites ci-dessous renvoient **systematiquement a la table unique** ci-dessus.

---

#### EPIC A — Fondations & infrastructure de test (backend)

**Objectif :** rendre le backend testable et executable, poser Jest + ts-jest + supertest et la base de donnees de test.

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-01 | Installer et configurer Jest backend | M | 1 | P0 |
| TEST-02 | Base de donnees de test isolee | M | 1 | P0 |
| TEST-03 | Bootstrap supertest + app exportable | M | 1 | P0 |
| TEST-04 | Scripts npm de test backend | S | 1 | P0 |

- **TEST-01 — Installer et configurer Jest backend**
  - Description : ajouter `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest` en devDeps du `package.json` racine ; creer `jest.config.ts` (preset `ts-jest`, `testEnvironment: 'node'`, `roots: ['src','tests']`, `collectCoverageFrom: ['src/**/*.ts','!src/server.ts','!src/**/*.d.ts']`, `coverageThreshold` **non actif en Phase 1** puis aligne sur la table unique a partir de P2). Creer un dossier `tests/` et un `tests/setup.ts`.
  - Fichiers : `/Users/cyrilsohnde/afristocks/package.json`, `/Users/cyrilsohnde/afristocks/jest.config.ts`, `/Users/cyrilsohnde/afristocks/tests/setup.ts`.
  - DoD : `npm test` s'execute et trouve 0 ou >0 tests sans erreur de config ; `npx tsc --noEmit` reste vert ; **aucun `coverageThreshold` chiffre en Phase 1**.
  - Deps : aucune. Risques : conflit ts-jest / TS 5.8 (verifier versions compatibles).

- **TEST-02 — Base de donnees de test isolee**
  - Description : provisionner une BDD de test (PostgreSQL dediee ou `embedded-postgres` deja present dans les deps, ou Testcontainers) ; variable `DATABASE_URL` de test ; script de migration + reset entre suites (`prisma migrate deploy` + truncation). Utiliser une `.env.test` (jamais de secrets reels).
  - Fichiers : `/Users/cyrilsohnde/afristocks/.env.test`, `tests/helpers/db.ts`, `prisma/schema.prisma`.
  - DoD : un test d'integration peut creer/lire un `User` puis la base est nettoyee ; les suites n'ont aucune dependance d'ordre.
  - Deps : TEST-01. Risques : lenteur si DB reelle ; le module `embedded-postgres` existant peut servir (voir `start-local.js`).

- **TEST-03 — Bootstrap supertest + app exportable** *(avance en Phase 1)*
  - Description : extraire l'instance Express de `src/server.ts` dans un module `app.ts` exporte sans `listen()`, pour pouvoir l'injecter dans supertest. **Avance en Phase 1** car prerequis des tests d'integration securite negatifs (TEST-26) eux-memes avances en Phase 1.
  - Fichiers : `src/server.ts`, nouveau `src/app.ts`.
  - DoD : `request(app).get('/health')` retourne 200 dans un test ; `server.ts` se contente d'importer `app` et d'appeler `listen`.
  - Deps : TEST-01. Lien domaine Backend (refactor server). Risques : effets de bord au chargement (Redis/Socket.io) a isoler/mocker.

- **TEST-04 — Scripts npm de test backend**
  - Description : ajouter `test`, `test:watch`, `test:coverage`, `test:unit`, `test:integration` (filtrage par dossier).
  - Fichiers : `/Users/cyrilsohnde/afristocks/package.json`.
  - DoD : chaque script lance le bon sous-ensemble ; documente dans le README.
  - Deps : TEST-01.

---

#### EPIC B — Tests unitaires backend (logique metier, priorite monetaire/securite)

**Objectif :** couvrir en priorite les chemins argent et securite. **Seuil applicable : seuil RENFORCE de la table unique** (70 % P2 → 90 % P4).

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-10 | Unitaires WalletService | L | 2 | P0 |
| TEST-11 | Unitaires InvestmentService | L | 2 | P0 |
| TEST-12 | Unitaires AuthService (JWT/bcrypt/2FA) | L | 2 | P0 |
| TEST-13 | Unitaires utils JWT/token | M | 2 | P1 |
| TEST-14 | Unitaires middlewares (auth, rbac, validation, rateLimit) | M | 2 | P1 |
| TEST-15 | Unitaires validators (auth, wallet) | S | 2 | P1 |

- **TEST-10 — Unitaires WalletService**
  - Description : tester `getBalance`, `deposit`, `withdraw`, `getTransactionHistory` (`src/services/wallet.service.ts`). Cas critiques : montant negatif/zero rejete, precision Decimal(20,2), solde insuffisant au retrait, atomicite du `$transaction` (rollback si echec partiel), creation correcte de la `Transaction` (type DEPOSIT/WITHDRAWAL) et mise a jour du `Wallet`. Mock du client Prisma.
  - Fichiers : `tests/unit/services/wallet.service.test.ts`, source `src/services/wallet.service.ts`.
  - DoD : >=12 cas, **couverture du fichier >= seuil RENFORCE de la phase courante (70 % en P2)**, tous les chemins d'erreur testes ; pas d'overflow/erreur d'arrondi sur Decimal.
  - Deps : TEST-01, TEST-02. Lien Backend (route `POST /wallet/withdraw` manquante a creer). Risques : mocker Prisma `$transaction` est delicat (preferer DB de test pour ce service).

- **TEST-11 — Unitaires InvestmentService**
  - Description : tester la creation d'investissement, debit du wallet, lien `Investment`↔`Startup`, calcul/initialisation de rendement (si implemente), refus si solde insuffisant ou startup invalide. `src/services/investment.service.ts`.
  - Fichiers : `tests/unit/services/investment.service.test.ts`.
  - DoD : >=8 cas, **couverture >= seuil RENFORCE de la phase courante** ; le debit wallet et l'enregistrement Transaction(INVESTMENT) sont verifies atomiquement.
  - Deps : TEST-02. Lien Backend (logique dividendes/rendement). Risques : feature rendement non encore codee (tester ce qui existe, marquer `todo` le reste).

- **TEST-12 — Unitaires AuthService**
  - Description : `src/services/auth.service.ts` (307 l.) : hash/verif bcrypt, generation/rotation JWT + refresh token, flux 2FA TOTP (speakeasy), gestion `LoginAttempt`/lockout, refus identifiants invalides. Mocker l'horloge pour l'expiration des tokens.
  - Fichiers : `tests/unit/services/auth.service.test.ts`.
  - DoD : >=15 cas couvrant succes/echec login, token expire, refresh invalide, 2FA OK/KO, verrouillage apres N tentatives ; **couverture >= seuil RENFORCE de la phase courante**.
  - Deps : TEST-02. Lien Securite. Risques : tests temporels (TOTP, expiration) → utiliser fake timers.

- **TEST-13 — Unitaires utils JWT/token**
  - Description : tester `src/utils/jwt.ts` et `src/utils/token.utils.ts` (duplication a clarifier avec Backend). Signature/verif, payload, expiration, secret invalide.
  - Fichiers : `tests/unit/utils/jwt.test.ts`, `tests/unit/utils/token.utils.test.ts`.
  - DoD : 100 % des fonctions exportees couvertes ; la duplication est documentee (ticket Backend) et les deux modules testes tant qu'ils coexistent.
  - Deps : TEST-01.

- **TEST-14 — Unitaires middlewares**
  - Description : `auth.middleware.ts` (token absent/invalide/expire → 401), `rbac.middleware.ts` (role insuffisant → 403), `validation.middleware.ts` (corps invalide → 422/400), `rateLimit.middleware.ts`. Utiliser des mocks `req/res/next`.
  - Fichiers : `tests/unit/middleware/*.test.ts`, sources `src/middleware/*.ts`.
  - DoD : chaque middleware a ses cas passant/bloquant ; **couverture >= seuil RENFORCE de la phase courante** (ces modules font partie du perimetre securite). *(Remplace l'ancienne mention de seuil locale par un renvoi a la table unique.)*
  - Deps : TEST-01. Lien Securite.

- **TEST-15 — Unitaires validators**
  - Description : `src/validators/auth.validator.ts`, `src/validators/wallet.validator.ts` (express-validator) : email/mot de passe/montant valides et invalides.
  - Fichiers : `tests/unit/validators/*.test.ts`.
  - DoD : chaque regle de validation a un cas OK + un cas KO.
  - Deps : TEST-01.

---

#### EPIC C — Tests d'integration API (supertest + BDD de test)

**Objectif :** valider les routes Express bout-en-bout (HTTP → service → DB), en priorisant auth et flux argent.

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-20 | Integration Auth (register/login/refresh/2FA) | L | 2 | P0 |
| TEST-21 | Integration Wallet (deposit/withdraw/balance/history) | L | 2 | P0 |
| TEST-22 | Integration Investment | L | 3 | P1 |
| TEST-23 | Integration Admin & RBAC | M | 3 | P1 |
| TEST-24 | Integration Startup (apres implementation route) | M | 3 | P1 |
| TEST-25 | Integration News & Fund | M | 3 | P2 |
| TEST-26 | Tests securite transverses (CORS, headers, RBAC, auth negatif) | M | **1** | P0 |

- **TEST-20 — Integration Auth**
  - Description : via supertest sur `src/routes/auth.routes.ts` : inscription, login (succes/echec), refresh token, activation/verif 2FA, lockout. Verifier codes HTTP, structure des reponses, et persistance (`User`, `RefreshToken`, `LoginAttempt`).
  - Fichiers : `tests/integration/auth.routes.test.ts`.
  - DoD : parcours complet inscription→login→refresh teste sur DB reelle de test ; jamais de secret reel utilise.
  - Deps : TEST-02, TEST-03. Lien Securite/Auth.

- **TEST-21 — Integration Wallet**
  - Description : `src/routes/wallet.routes.ts` : `GET /balance`, `POST /deposit`, `POST /withdraw` (route a creer cote Backend — actuellement absente), `GET /transactions`. Verifier auth requise (401 sans token), coherence solde apres operations, idempotence/rejet des montants invalides.
  - Fichiers : `tests/integration/wallet.routes.test.ts`.
  - DoD : la route withdraw est testee (dependance Backend) ; un depot puis un retrait laissent le solde coherent ; acces non authentifie refuse.
  - Deps : TEST-02, TEST-03, + creation route withdraw (Backend). Risques : bloque tant que `/wallet/withdraw` n'est pas branche.

- **TEST-22 — Integration Investment** — `src/routes/investment.routes.ts` : creation d'investissement, debit wallet, listing. DoD : un investissement debite le wallet et cree `Transaction(INVESTMENT)` + `Investment`. Deps : TEST-02/03. Effort L, Phase 3, P1.

- **TEST-23 — Integration Admin & RBAC** — `src/routes/admin.routes.ts` : acces refuse aux non-admins (403), autorise aux admins. DoD : matrice roles×endpoints verifiee. Deps : TEST-14, TEST-03. Lien Securite. Effort M, Phase 3, P1. *(Note : les cas negatifs RBAC les plus critiques sont deja couverts par TEST-26 des la Phase 1 ; TEST-23 etend la matrice complete en Phase 3.)*

- **TEST-24 — Integration Startup** — `src/routes/startup.routes.ts` est **vide (0 octet)** aujourd'hui ; tests a ecrire une fois la route implementee (CRUD admin startups). DoD : CRUD complet teste. Deps : implementation route (Backend). Effort M, Phase 3, P1.

- **TEST-25 — Integration News & Fund** — `src/routes/news.routes.ts`, `src/routes/fund.routes.ts`. DoD : endpoints publics/proteges testes selon spec. Effort M, Phase 3, P2.

- **TEST-26 — Tests securite transverses (avance en Phase 1)**
  - Description : verifier (en integration, via supertest) que CORS n'est plus totalement ouvert (echec du test si `app.use(cors())` ouvert revient), que Helmet pose les headers attendus, que le rate limiting bloque apres N requetes, qu'**aucune route monetaire n'est accessible sans JWT (401)**, que l'**acces non-admin aux routes admin est refuse (403)**, et que la 2FA est exigee la ou requise. **Tache deliberement avancee en Phase 1** : ces tests negatifs accompagnent et verrouillent les corrections P0 du domaine Securite (SECU-10/11/12/23 : CORS, RBAC, auth, secrets) **des leur merge**, evitant que la correction soit livree une phase avant son filet de non-regression.
  - Fichiers : `tests/integration/security.test.ts`.
  - DoD : un test echoue si CORS redevient `*` ; rate limit verifie ; **toutes les routes argent renvoient 401 sans token et 403 pour un role insuffisant** ; la suite tourne en CI des la Phase 1 (gating securite).
  - Deps : TEST-01, TEST-02, TEST-03 (tous en Phase 1) + corrections cote Securite (CORS/RBAC/auth). Lien fort domaine Securite. Effort M, **Phase 1**, P0.

---

#### EPIC D — Tests frontend (composants & hooks, React Testing Library)

**Objectif :** rendre les tests frontend executables, corriger la config, couvrir composants critiques (auth, wallet, trading) et l'`AuthContext` (qui contient le `mock-token` a remplacer). **Seuil applicable : seuil GLOBAL de la table unique** (40 % P2 → 80 % P4).

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-30 | Reparer la config Jest frontend | S | 2 | P0 |
| TEST-31 | Tests AuthContext (remplacement mock-token) | M | 2 | P0 |
| TEST-32 | Tests du client API/services | M | 2 | P1 |
| TEST-33 | Tests composants UI critiques | L | 3 | P1 |
| TEST-34 | Tests composants auth (formulaires) | M | 3 | P1 |
| TEST-35 | Tests composants wallet/trading | L | 3 | P1 |
| TEST-36 | Couverture & nommage des dossiers | S | 3 | P2 |

- **TEST-30 — Reparer la config Jest frontend**
  - Description : installer les deps (`npm install` dans `frontend/`), renommer `frontend/__test__` → convention `__tests__` ou definir `testMatch`, renommer `GlassCard.test.ts` → `.tsx`, verifier `next/jest` + `moduleNameMapper @/`.
  - Fichiers : `frontend/jest.config.js`, `frontend/__test__/components/GlassCard.test.ts`.
  - DoD : `cd frontend && npm test` passe au vert avec le test GlassCard.
  - Deps : aucune. Risques : faible.

- **TEST-31 — Tests AuthContext**
  - Description : `frontend/src/contexts/AuthContext.tsx` contient le `mock-token` code en dur (verifie). Ecrire des tests qui valident le login/logout reel contre le client API (mocke), le stockage securise du token et l'etat authentifie. Sert de filet pour le remplacement du mock par le vrai JWT backend.
  - Fichiers : `frontend/src/contexts/__tests__/AuthContext.test.tsx`.
  - DoD : un test echoue si `mock-token` reapparait ; login/logout met a jour l'etat ; token persiste via le mecanisme cible (cookie/localStorage securise).
  - Deps : TEST-30 + travail Auth frontend (branchement JWT reel). Lien fort domaine Frontend/Auth. Effort M, Phase 2, P0.

- **TEST-32 — Tests du client API/services**
  - Description : `frontend/src/config/api.ts` et `frontend/src/services/api.ts` : intercepteurs axios, injection du token, gestion 401/refresh, base URL. Mock axios.
  - Fichiers : `frontend/src/services/__tests__/api.test.ts`.
  - DoD : injection du header Authorization testee ; un 401 declenche le flux de refresh/logout attendu.
  - Deps : TEST-30. Effort M, Phase 2, P1.

- **TEST-33 — Tests composants UI critiques** — etendre au-dela de `GlassCard` : composants `components/ui`, `components/effects` reutilises partout. DoD : >=6 composants couverts, rendu + props/variantes. Deps : TEST-30. Effort L, Phase 3, P1.

- **TEST-34 — Tests composants auth** — `frontend/src/components/auth/*` : validation de formulaire (zod/react-hook-form), erreurs, soumission. DoD : champs valides/invalides + soumission mockee. Effort M, Phase 3, P1.

- **TEST-35 — Tests composants wallet/trading** — `frontend/src/components/trading/*` (et fichier mal nomme `AdvancedTrading..tsx` a renommer cote Frontend) + ecrans wallet : affichage solde, formulaire depot/retrait, formatage des montants. DoD : montants formates correctement, actions declenchent les bons appels API mockes. Effort L, Phase 3, P1.

- **TEST-36 — Couverture & nommage** — ajouter `collectCoverageFrom` + seuils a `frontend/jest.config.js` **alignes sur le seuil GLOBAL de la table unique** ; harmoniser l'emplacement des tests. DoD : `npm test -- --coverage` produit un rapport ; seuil GLOBAL de la phase courante atteint. Effort S, Phase 3, P2.

---

#### EPIC E — Tests mobile (reparation + extension)

**Objectif :** rendre les tests mobile executables (config + deps) et etendre la couverture quand l'app sortira des donnees mock.

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-40 | Reparer la config Jest mobile | M | 2 | P0 |
| TEST-41 | Ajouter dependances de test manquantes | S | 2 | P0 |
| TEST-42 | Tests services/api & navigation mobile | M | 3 | P1 |
| TEST-43 | Tests stockage securise (Keychain) | M | 3 | P1 |

- **TEST-40 — Reparer la config Jest mobile**
  - Description : `mobile/jest.config.js` utilise `preset: 'ts-jest'` + `testEnvironment: 'node'` et un `testMatch` qui **exclut les `.tsx`** (verifie) ; passer au `preset: 'react-native'` (babel) avec transform TS, etendre `testMatch` aux `.tsx`, ajouter `setupFilesAfterEnv`/`@testing-library/jest-native/extend-expect`, `transformIgnorePatterns` adapte a React Native 0.80.
  - Fichiers : `mobile/jest.config.js`, `mobile/jest.setup.ts` (a creer).
  - DoD : les tests existants (dont `WelcomeScreen.test.tsx` et `App.test.tsx`) sont **collectes et passent** ; `cd mobile && npm test` vert.
  - Deps : TEST-41. Risques : conflits preset RN vs ts-jest (choisir babel-jest pour RN).

- **TEST-41 — Ajouter dependances de test manquantes**
  - Description : `mobile/tests/unit/health.test.ts` importe `supertest` non declare (verifie). Recommandation : **supprimer `health.test.ts` du mobile** (un mini-Express n'a pas sa place dans le repo mobile) et porter ce besoin cote backend (EPIC C).
  - Fichiers : `mobile/package.json`, `mobile/tests/unit/health.test.ts`.
  - DoD : aucun import non resolu ; suite verte.
  - Deps : aucune. Effort S, Phase 2, P0.

- **TEST-42 — Tests services/api & navigation** — quand le mobile branchera le vrai backend (au-dela de `/health`), tester `mobile/src/services/api.ts` (auth, erreurs), et la navigation (`@react-navigation`). DoD : flux login mocke + navigation testes. Deps : TEST-40 + branchement backend (Mobile). Effort M, Phase 3, P1.

- **TEST-43 — Tests stockage securise Keychain** — `react-native-keychain` est installe mais non utilise (audit). Tester le module de stockage du token une fois implemente. DoD : set/get/clear token mockes et testes. Deps : implementation Mobile. Effort M, Phase 3, P1.

---

#### EPIC F — Tests E2E (web Playwright + mobile Detox)

**Objectif :** valider les parcours utilisateur critiques de bout en bout.

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-50 | Mise en place Playwright (web) | M | 3 | P1 |
| TEST-51 | E2E parcours auth web | M | 3 | P1 |
| TEST-52 | E2E parcours wallet/investissement web | L | 3 | P1 |
| TEST-53 | Mise en place Detox (mobile) | L | 4 | P2 |
| TEST-54 | E2E parcours auth mobile | M | 4 | P2 |

- **TEST-50 — Mise en place Playwright** — installer `@playwright/test`, `playwright.config.ts` (base URL, navigateurs, traces/screenshots a l'echec), seed de donnees E2E. Fichiers : `frontend/playwright.config.ts`, `frontend/e2e/`. DoD : un test smoke (page d'accueil) passe en local et headless. Deps : frontend buildable. Effort M, Phase 3, P1.

- **TEST-51 — E2E auth web** — inscription→login→acces zone protegee→logout, contre un backend de test reel. DoD : parcours complet vert, isole (donnees seedees/nettoyees). Deps : TEST-50, Auth frontend reel (fin du mock-token). Effort M, Phase 3, P1.

- **TEST-52 — E2E wallet/investissement web** — depot→consultation solde→investissement→historique. DoD : solde coherent affiche apres operations. Deps : TEST-50, routes wallet/investment fonctionnelles, paiement mocke. Effort L, Phase 3, P1. Risque : depend des paiements (non implementes) → mocker la passerelle.

- **TEST-53 — Mise en place Detox mobile** — `.detoxrc.js`, build debug iOS/Android, runner. DoD : un test de lancement d'app passe sur simulateur. Deps : app mobile branchee au backend. Effort L, Phase 4, P2. Risque : Detox/RN 0.80 + CI macOS couteux.

- **TEST-54 — E2E auth mobile** — login→home→logout sur simulateur. DoD : parcours vert. Deps : TEST-53, auth mobile reelle. Effort M, Phase 4, P2.

---

#### EPIC G — Tests de charge & performance (k6)

**Objectif :** verifier la tenue en charge des endpoints critiques avant production.

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-60 | Setup k6 + scenario de fumee | M | 4 | P2 |
| TEST-61 | Charge endpoints auth & wallet | L | 4 | P2 |
| TEST-62 | Seuils SLO & rapport | M | 4 | P2 |

- **TEST-60 — Setup k6** — scripts k6 versionnes, env de charge isole. Fichiers : `load/smoke.k6.js`. DoD : smoke test (1-5 VUs) vert contre un env dedie. Phase 4, P2.
- **TEST-61 — Charge auth & wallet** — montee en charge sur login, balance, deposit. DoD : courbes p95/erreurs collectees pour 50/100/500 VUs. Deps : TEST-60. Phase 4, P2. Risque : ne jamais charger la prod ; env dedie obligatoire.
- **TEST-62 — Seuils SLO** — definir `thresholds` k6 (p95 latence, taux d'erreur) qui font echouer le run si depasses ; rapport archive. DoD : run rouge si SLO viole. Deps : TEST-61. Phase 4, P2.

---

#### EPIC H — Tests de contrat d'API

**Objectif :** garantir la coherence du contrat backend↔frontend↔mobile.

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-70 | Source de verite OpenAPI/Swagger | M | 3 | P1 |
| TEST-71 | Validation des reponses vs schema | M | 3 | P1 |
| TEST-72 | Types partages clients | M | 3 | P2 |
| TEST-73 | Tests negatifs de contrat securite (avance) | M | **1** | P1 |

- **TEST-70 — OpenAPI source de verite** — `swagger-jsdoc`/`swagger-ui-express` sont deja en deps backend : completer les annotations OpenAPI des routes (`src/routes/*`) et generer un `openapi.json`. DoD : spec generee couvrant auth/wallet/investment. Phase 3, P1. Lien Backend/Doc.
- **TEST-71 — Validation reponses vs schema** — dans les tests d'integration, valider chaque reponse contre le schema OpenAPI (ex. `jest-openapi`). DoD : un test echoue si une reponse derive du contrat. Deps : TEST-70, EPIC C. Phase 3, P1.
- **TEST-72 — Types partages** — generer des types TS clients depuis l'OpenAPI (frontend/mobile) et tester la non-regression. DoD : types generes utilises par au moins un service client. Deps : TEST-70. Phase 3, P2.
- **TEST-73 — Tests negatifs de contrat securite (nouvelle tache, avancee en Phase 1)** — verifier que les reponses d'erreur securite respectent un contrat stable (401/403/422 avec corps sans fuite d'info sensible : pas de stack trace, pas de secret, pas de detail interne). Complement minimal et anticipe de TEST-71, aligne sur le besoin de verrouiller les corrections securite des la Phase 1. DoD : un test echoue si une reponse d'erreur expose une stack trace ou un message interne ; tourne en CI des la Phase 1. Deps : TEST-26, TEST-03. Effort M, **Phase 1**, P1.

---

#### EPIC I — Donnees de test, fixtures & factories

**Objectif :** fournir des donnees deterministes et reutilisables a toutes les suites.

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-80 | Factories (User, Wallet, Transaction, Investment, Startup) | M | 2 | P0 |
| TEST-81 | Seed deterministe pour E2E/charge | M | 3 | P1 |
| TEST-82 | Helpers d'authentification de test | S | **1** | P0 |

- **TEST-80 — Factories** — builders typees (faker + Prisma) pour les 13 modeles prioritaires, garantissant Decimal(20,2) coherents. Fichiers : `tests/factories/*.ts`. DoD : creation d'un `User` avec wallet en une ligne dans un test. Deps : TEST-02. Phase 2, P0.
- **TEST-81 — Seed E2E/charge** — script de seed dedie aux scenarios E2E/k6 (idempotent, nettoyable). Fichiers : `tests/seed.e2e.ts`. DoD : E2E reproductible sur base vierge. Deps : TEST-80. Phase 3, P1.
- **TEST-82 — Helpers d'auth de test (avance en Phase 1)** — fonction `loginAs(role)` retournant un JWT valide pour supertest/Playwright. **Avance en Phase 1** car prerequis direct des tests negatifs RBAC de TEST-26 (il faut pouvoir authentifier un role admin et un role user). Fichiers : `tests/helpers/auth.ts`. DoD : un test protege s'authentifie en une ligne. Deps : TEST-01, TEST-03. **Phase 1**, P0.

---

#### EPIC J — CI/CD, gating & couverture

**Objectif :** executer automatiquement tous les tests et bloquer les regressions (le projet n'a **aucune** CI aujourd'hui).

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-90 | Pipeline CI multi-projets (lint+typecheck+test) | L | 1 | P0 |
| TEST-91 | Gating securite Phase 1 + gating couverture progressif (P2→P4) | M | 1→4 | P0 |
| TEST-92 | Rapports de couverture & artefacts | M | 2 | P1 |
| TEST-93 | Job E2E & charge en CI | L | 3 | P1 |
| TEST-94 | Clarifier remotes/mono-repo pour la CI | M | 1 | P1 |

- **TEST-90 — Pipeline CI** — workflow (GitHub Actions recommande car `origin` est GitHub) avec jobs backend/frontend/mobile : install, `tsc --noEmit`, lint, `npm test`, service PostgreSQL pour l'integration. **En Phase 1, la CI execute deja : gitleaks (TEST-100), les tests securite negatifs (TEST-26, TEST-73) et le smoke backend (TEST-03)** — sans aucun gating de couverture. Fichiers : `.github/workflows/ci.yml`. DoD : chaque push/PR declenche la CI ; un test securite rouge (CORS ouvert, secret detecte, route argent sans 401, route admin sans 403) **bloque le merge des la Phase 1**. Deps : EPIC A (TEST-01/03/26), TEST-100. Phase 1, P0. Risque : choix du fournisseur CI complique par 5 remotes (voir TEST-94).
- **TEST-91 — Gating securite (P1) + gating couverture progressif (P2→P4)** — **deux mecanismes distincts, conformement a la table unique** :
  - **Phase 1 (gating securite, sans couverture)** : la CI echoue si gitleaks detecte un secret, si CORS est ouvert, ou si un test securite negatif (TEST-26/TEST-73) echoue. **Aucun `coverageThreshold` chiffre n'est actif** (le backend n'a pas encore de tests a couvrir — eviter le faux gating a 0 %).
  - **Phases 2→4 (gating couverture)** : activer `coverageThreshold` aux valeurs **exactes de la table unique** — GLOBAL 40 %→60 %→80 % et RENFORCE (monetaire/auth) 70 %→80 %→90 % — avec seuils par-glob plus stricts sur `src/services/{wallet,investment,auth}` et `src/middleware/{auth,rbac}`.
  - Fichiers : configs Jest (`coverageThreshold`), `.github/workflows/ci.yml`. DoD : en Phase 1 la CI bloque sur securite mais **jamais** sur couverture ; a partir de P2 la CI echoue sous le seuil GLOBAL ou RENFORCE de la phase courante ; ces seuils sont **identiques** a ceux de BACK-71, KYC-29 et du chapeau section 7. Deps : TEST-90, EPIC B/C/D/E. Phase 1→4, P0.
- **TEST-92 — Rapports & artefacts** — publier lcov/HTML, badge couverture, traces Playwright a l'echec. DoD : rapport telechargeable a chaque run. Deps : TEST-90. Phase 2, P1.
- **TEST-93 — Job E2E & charge** — etapes dediees (Playwright headless ; k6 sur env non-prod, eventuellement nightly). DoD : E2E en PR, charge en planifie. Deps : EPIC F/G. Phase 3, P1.
- **TEST-94 — Clarifier remotes/mono-repo** — decider du depot canonique (5 remotes : GitHub `origin`/`backend`, 3 GitLab) et y rattacher la CI ; documenter. DoD : un seul pipeline source de verite. Deps : decision porteur. Lien Organisation/Infra. Phase 1, P1.

---

#### EPIC K — Tests de regression securite & monetaire (transverse, prioritaire)

**Objectif :** filets de securite specifiques aux risques critiques de l'audit (secrets, CORS, argent).

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| TEST-100 | Test anti-regression secrets/CORS (gitleaks) | M | 1 | P0 |
| TEST-101 | Tests invariants monetaires (property-based) | L | 3 | P1 |
| TEST-102 | Scan deps & SAST en CI | M | 2 | P1 |

- **TEST-100 — Anti-regression secrets/CORS** — test/lint qui echoue si un secret reel apparait dans le repo (`gitleaks` en CI) ou si `app.use(cors())` ouvert revient. **Pierre angulaire du gating securite Phase 1** (atteignable sans aucun test de couverture). DoD : la CI bloque en cas de secret detecte ou CORS ouvert ; aligne avec la purge Securite (`.env.production`, `Mots de passes et ID.txt`). Deps : TEST-90. Lien fort Securite. Phase 1, P0.
- **TEST-101 — Invariants monetaires** — property-based testing (fast-check) : « somme des transactions = solde wallet », jamais de solde negatif, conservation lors d'un transfert/investissement. DoD : invariants verifies sur N cas generes. Deps : EPIC B/C. Phase 3, P1. Risque : modeliser correctement les arrondis Decimal.
- **TEST-102 — Scan deps & SAST** — `npm audit`/Dependabot + analyse statique en CI. DoD : vulnerabilites hautes bloquantes. Deps : TEST-90. Lien Securite/Infra. Phase 2, P1.

---

### Risques specifiques au domaine

- **Dette de base elevee :** zero test backend et aucune CI ; tout filet de securite est a construire avant de pouvoir refactorer sereinement les domaines Securite/Backend. Tant que la CI n'existe pas (TEST-90), les tests ecrits ne previennent aucune regression.
- **Cout du passage de 0 a une couverture gating (risque calendaire majeur) :** construire l'infra de test backend (Jest, DB de test, factories, supertest) **puis** atteindre 70 % sur des services **eux-memes en refonte** (ledger, idempotence, withdraw, rendement) represente un effort massif et concurrent du dev feature. **Sans la capacite QA dediee actee (1 ETP test ou 30-40 % de la capacite dev des la Phase 2) et sans la rampe etalee de la table unique, soit la couverture, soit la date de livraison sautera.** Le re-travail de tests sur du code en refonte doit etre chiffre separement.
- **Faux gating de couverture en Phase 1 (corrige) :** un seuil de couverture en Phase 1 serait soit a 0 % (inutile), soit bloquant a vide. La table unique et TEST-91 distinguent desormais un **gating securite reel en Phase 1** (gitleaks + tests negatifs TEST-26/73, atteignables) du **gating de couverture (P2+)**.
- **Tests fantomes :** les 6 tests existants donnent une fausse impression de couverture — ils ne s'executent pas (deps non installees, configs buguees : `testMatch` mobile excluant `.tsx`, extension `.ts` pour du JSX cote frontend, `supertest` non declare). Risque de « vert trompeur » si on les croit actifs.
- **Couplage avec les features manquantes :** beaucoup de tests cles (wallet withdraw, startups, paiements, dividendes, KYC, rendement) dependent de code **non encore ecrit** ou de routes **vides/absentes** (`src/routes/startup.routes.ts` = 0 octet, `POST /wallet/withdraw` absente). Les tests correspondants seront bloques ou devront mocker lourdement.
- **Auth fictive :** `mock-token` (frontend) et `setTimeout` (mobile) faussent tout test E2E d'authentification tant que le JWT reel n'est pas branche — risque de tests E2E qui valident le mock, pas le systeme.
- **Donnees monetaires (Decimal 20,2) :** risque d'erreurs d'arrondi/precision difficiles a detecter sans property-based testing et sans fixtures rigoureuses.
- **Tests d'integration lents/instables :** sans DB de test isolee et reset deterministe (TEST-02), flakiness et dependances d'ordre. L'environnement multi-services (Redis, Socket.io) complique l'isolation.
- **Multi-remote (5 remotes, 3 GitLab + 2 GitHub) :** risque de divergence entre depots ; une CI sur le mauvais remote ne protege rien.
- **E2E mobile (Detox) couteux :** RN 0.80 + runners macOS en CI = lent et fragile ; risque de sur-investissement avant que l'app mobile soit reellement branchee.
- **Decorrelation des seuils entre sections (corrige) :** la table unique est desormais la **source de verite** ; tout chiffre divergent dans BACK-71, KYC-29 ou le chapeau doit y etre realigne.

### Decisions a valider par le porteur du projet

1. **Plateforme CI canonique :** GitHub Actions (coherent avec `origin` GitHub) ou GitLab CI (3 remotes GitLab) ? Et quel depot fait foi (mono-repo vs poly-repo) ? Bloque TEST-90/TEST-94.
2. **Capacite QA dediee & rampe de couverture :** acter l'allocation d'**1 ETP test (ou 30-40 % de la capacite dev) des la Phase 2**, chiffree separement du dev feature, et **valider la table unique des seuils** (GLOBAL 40→60→80 % ; RENFORCE monetaire/auth 70→80→90 %). Sans cette decision, le gating de couverture est intenable face au code en refonte.
3. **Strategie BDD de test :** PostgreSQL conteneurise (Testcontainers/Docker) vs `embedded-postgres` deja present vs base partagee ? Impacte vitesse et fiabilite (TEST-02).
4. **Perimetre E2E mobile :** Detox des la Phase 4 ou reporte ? Cout CI macOS a arbitrer (TEST-53/54).
5. **Mock des passerelles de paiement (Orange Money/MTN/Wave) en test :** sandbox officielles vs mocks maison pour les E2E argent (TEST-52).
6. **Outil de scan de secrets/SAST :** gitleaks + Dependabot (gratuits) vs solution payante (Snyk) (TEST-100/102).
7. **Property-based testing :** adopter fast-check pour les invariants monetaires (TEST-101) ou se limiter aux tests par l'exemple ?
8. **Sort des scripts `test-*.sh` :** les supprimer (remplaces par l'integration supertest) ou les conserver comme smoke tests manuels documentes ?

---

Verified. The key facts hold: no prom-client/Sentry/winston/pino, `LoginAttempt` never written, no `LedgerEntry`/`AuditLog` model, no separate ledger table (the ledger is the `transactions` table). This confirms the gap about the financial-balance invariant — there's no double-entry ledger, so the "somme des wallets = somme des ledger entries" invariant must be derived from `wallets.balance` vs aggregated `transactions`. I have what I need to integrate the gap precisely.

Below is the finalized v2 section.

## Observabilite & exploitation

### Etat actuel (verifie sur le code)

**Score : 0,5 / 10** (l'audit du 9 fev. indiquait Infra 3/10 globalement ; le sous-domaine observabilite est en pratique inexistant). **Delta depuis l'audit : nul.** Aucun travail d'observabilite n'a ete realise entre l'audit et l'etat sur disque (les commits ne portent que sur des « Restore » de monorepo, cf. `git log` : `2acac65 Restore backend from GitLab monorepo`...).

**Ce qui fonctionne (le strict minimum) :**
- Un endpoint de liveness applicatif basique : `src/routes/index.ts:12` expose `GET /api/health` qui renvoie `{ status:'healthy', timestamp, version:'1.0.0' }`. Il est **statique** : il ne teste ni la BDD ni Redis, ne distingue pas liveness/readiness.
- Logging HTTP de developpement : `src/server.ts:35` `app.use(morgan('dev'))` — format colore non parsable, **identique en prod** (aucun switch `combined`/JSON selon `NODE_ENV`).
- Verification de connexion BDD au demarrage : `src/config/database.ts:14` `checkDatabaseConnection()` via `SELECT 1` (one-shot, au boot uniquement).
- Logs Prisma conditionnels : `src/config/database.ts:9` (`['query','info','warn','error']` en dev, `['error']` sinon) — vers stdout brut, non structures.
- `@opentelemetry/api` et `@opentelemetry/sdk-trace-base` sont presents **uniquement en transitif** (instrumentation interne de Prisma, cf. `package-lock.json:765+`). **Aucun usage applicatif** : pas de SDK initialise, pas d'exporter.

**Ce qui est casse ou absent (exhaustif) :**
- **Aucune metrique** : pas de `prom-client`, pas d'endpoint `/metrics`, aucun compteur/histogramme (verifie : 0 occurrence de `prometheus`/`prom-client`/`winston`/`pino` dans `package.json`). Pas de RED/USE, pas de latence, pas de taux 5xx.
- **Aucune metrique metier ni produit/financier** : pas de KPI de sante financiere (AUM, frais encaisses, retraits en attente), pas de funnel KYC→depot→investir, pas de taux d'echec/latence par PSP, et **aucune verification d'invariant comptable** (le modele de donnees n'a d'ailleurs **pas de ledger en partie double** : le « ledger » est la table `transactions`, `prisma/schema.prisma:136` ; l'invariant doit donc etre derive de `wallets.balance` agrege vs `transactions`).
- **Aucun dashboard Grafana**, aucune source de donnees, aucun provisioning ; **aucun dashboard direction/produit**.
- **Aucun tracing distribue** reel (pas d'`NodeSDK`, pas d'auto-instrumentation HTTP/Express/ioredis, pas de propagation de contexte).
- **Aucun suivi d'erreurs** : pas de Sentry ni equivalent, ni backend ni `frontend/` ni `mobile/` (verifie : 0 occurrence de `sentry`/`crashlytics`/`ErrorBoundary`). Le handler d'erreurs global `src/server.ts:54` se contente d'un `console.error('Erreur:', err)` et d'un 500 generique ; **aucune correlation, aucune stack remontee**.
- **Logging non structure et perdu** : 20 appels `console.log/error/warn` epars dans `src/` ; aucun logger (Winston/Pino), pas de `requestId`/`correlationId`, pas de `userId`, pas de niveaux, pas de format JSON. Rien n'est envoye vers CloudWatch/ELK/Loki.
- **Audit logging inexistant en pratique** : le modele `LoginAttempt` existe (`prisma/schema.prisma:89`, champs `email/ipAddress/userAgent/successful/createdAt`) mais **n'est jamais ecrit** — `grep -rni loginAttempt src` = **0 resultat** (re-verifie). Aucune table/log d'audit pour les actions admin (`src/routes/admin.routes.ts` : changement KYC, toggle-status, modif investissements — toutes non auditees). **Aucun modele `AuditLog`/`LedgerEntry`** dans le schema (re-verifie : 0 occurrence).
- **Aucun alerting**, aucun SLO/SLI defini, aucune Alertmanager/PagerDuty/Opsgenie ; **aucune alerte sur la sante financiere** (ecart de solde, echec PSP, retraits en attente).
- **Aucune sauvegarde PostgreSQL** : 0 script `pg_dump`, 0 CronJob, 0 snapshot. `docker-compose.yml` n'a qu'un volume `pgdata` local ; les donnees sont aussi presentes en clair dans `.pg-data/` (embedded-postgres). **Aucun plan de reprise (DR), aucun test de restauration.**
- **Probes K8s inexistantes ou erronees** : `k8s/backend-deployment.yaml` n'a **ni** `livenessProbe`, **ni** `readinessProbe`, **ni** `resources.limits/requests`. Le chart Helm (`charts/afristocks/values.yaml:89-95`) est le scaffold `helm create` par defaut : ses sondes pointent sur `path: /` (l'app ne sert **rien** sur `/`, uniquement `/api/...` → la sonde echouerait), et `resources: {}` (l.76).
- **Aucun monitoring d'infra** : pas de node-exporter, pas de postgres-exporter, pas de redis-exporter ; Redis tourne sans auth (`src/config/redis.ts:21`).
- **Aucun CI/CD** (verifie : pas de `.github/`, `.gitlab-ci.yml`, `.circleci/`) → aucune porte de qualite, aucun build/scan automatise des images.
- **Aucun runbook**, aucune doc d'exploitation.
- Le proxy Redis « silencieux » (`src/config/redis.ts:36` `instance.on('error', () => {})`) **avale toutes les erreurs Redis** → invisibilite totale des incidents de cache.

---

### Backlog (epics et taches)

#### EPIC OBSE-A — Logging structure & correlation
*Objectif : remplacer les `console.*` et `morgan('dev')` par un logging JSON structure, correle par requete, exploitable par CloudWatch/ELK.*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-01 | Logger structure Pino | Introduire `pino` (+ `pino-pretty` en dev) ; logger central exporte ; niveau via `LOG_LEVEL` ; format JSON en prod, pretty en dev. | nouveau `src/config/logger.ts`, `package.json` | Logs JSON valides en prod (champs `level/time/msg`), pretty en dev ; `LOG_LEVEL` respecte ; build OK. | — | S | 2 | P1 | Volume de logs/cout |
| OBSE-02 | Middleware requestId + access log | Middleware qui genere/propage `x-request-id`, log JSON par requete (methode, route, status, duree ms, `userId` si auth, ip). Remplace `morgan('dev')`. | `src/server.ts:35`, nouveau `src/middleware/requestLogger.ts` | Chaque reponse renvoie `x-request-id` ; chaque requete produit 1 ligne JSON avec duree et status ; `morgan('dev')` supprime. | OBSE-01 | M | 2 | P1 | Donnees PII dans les logs |
| OBSE-03 | Remplacer tous les `console.*` | Substituer les 20 `console.log/error/warn` de `src/` par le logger ; bannir `console` via regle ESLint. | `src/server.ts`, `src/config/database.ts`, `src/config/redis.ts`, tous `src/**` | `grep -rn "console\." src` = 0 ; lint echoue si `console` reintroduit. | OBSE-01 | M | 2 | P1 | Oublis dans modules non couverts |
| OBSE-04 | Handler d'erreurs enrichi | Le handler global `src/server.ts:54` log l'erreur structuree (stack, `request-id`, `userId`, route) au niveau `error`, sans fuiter le detail au client en prod. | `src/server.ts:54` | Une erreur 500 produit 1 log JSON avec stack + request-id ; reponse client reste generique en prod. | OBSE-01, OBSE-02 | S | 2 | P1 | — |
| OBSE-05 | Ne plus avaler les erreurs Redis | Logger (warn) les erreurs Redis au lieu du `on('error', () => {})` muet ; compter les fallbacks vers le mock. | `src/config/redis.ts:36,53` | Une panne Redis genere des logs warn + incremente un compteur metrique ; aucun `() => {}` muet. | OBSE-01, OBSE-09 | S | 2 | P1 | Bruit si Redis volontairement absent en dev |
| OBSE-06 | Redaction PII dans les logs | Configurer la `redact` de Pino (Authorization, password, token, otp, email partiellement) ; politique de retention documentee. | `src/config/logger.ts` | Aucun secret/mot de passe/token n'apparait dans les logs (test unitaire de redaction vert). | OBSE-01 | S | 2 | P1 | Reglementaire (donnees perso) |

#### EPIC OBSE-B — Health checks & sondes K8s
*Objectif : exposer des sondes liveness/readiness fiables et corriger les manifests pour un cycle de vie sain en cluster.*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-07 | Endpoints liveness/readiness reels | `GET /api/health/live` (process up) ; `GET /api/health/ready` (ping BDD `SELECT 1` + ping Redis, 503 si KO). Conserver `/api/health` retrocompatible. | `src/routes/index.ts:12`, `src/config/database.ts`, `src/config/redis.ts` | `/ready` renvoie 200 BDD+Redis OK, 503 si une dependance KO (teste en coupant la BDD). | OBSE-01 | M | 2 | P0 | Faux negatifs sur Redis optionnel |
| OBSE-08 | Probes + resources dans manifests | Ajouter `livenessProbe`/`readinessProbe` (→ `/api/health/live` et `/ready`, port 3000) et `resources.requests/limits` ; corriger le chart Helm (path `/` erronne, `resources:{}`). | `k8s/backend-deployment.yaml`, `charts/afristocks/values.yaml:76,89-95`, `charts/afristocks/templates/deployment.yaml` | `kubectl apply` + pod `Ready` ; `kubectl describe` montre probes pointant `/api/health/*` ; limits/requests definis. | OBSE-07 | M | 2 | P0 | Probes trop strictes → CrashLoop |

#### EPIC OBSE-C — Metriques Prometheus & dashboards Grafana
*Objectif : instrumenter l'app (RED + metier) et fournir des dashboards Grafana provisionnes.*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-09 | Endpoint `/metrics` (prom-client) | Ajouter `prom-client`, `collectDefaultMetrics()`, exposer `GET /metrics` (non monte sous le rate-limiter `/api/`, cf. `src/server.ts:40`). | `package.json`, nouveau `src/config/metrics.ts`, `src/server.ts` | `curl /metrics` renvoie l'exposition Prometheus (process_*, nodejs_*) ; scrape OK. | OBSE-01 | M | 2 | P1 | `/metrics` expose publiquement → restreindre |
| OBSE-10 | Metriques HTTP RED | Histogramme `http_request_duration_seconds{method,route,status}` + compteur requetes ; route normalisee (pas d'explosion de cardinalite sur les IDs). | `src/middleware/metrics.middleware.ts`, `src/server.ts` | Latence p50/p95/p99 et taux 5xx derivables par route ; cardinalite bornee (verifiee). | OBSE-09 | M | 2 | P1 | Cardinalite elevee |
| OBSE-11 | Metriques metier critiques | Compteurs : depots/retraits wallet (succes/echec/montant), investissements, paiements Orange/MTN/Wave (par statut), echecs 2FA/login. | `src/services/wallet.service.ts`, `src/services/investment.service.ts`, futurs services paiement | Chaque op metier incremente une metrique ; visibles dans `/metrics`. | OBSE-09 ; dep. domaines wallet/paiements | L | 3 | P1 | Couplage avec features non livrees |
| OBSE-11b | KPIs produit & financiers (instrumentation) | Exposer des metriques produit/financieres dediees : **AUM** (somme `investments.amount` actifs), **frais encaisses** (somme `transactions.fee` type `FEE`), **retraits en attente** (count/montant `WITHDRAWAL` statut `PENDING`), **taux d'echec & latence par PSP** (Orange/MTN/Wave), **funnel KYC→depot→investir** (compteurs d'etape par utilisateur). Gauges rafraichies periodiquement (job) pour eviter les agregats lourds a chaud. | nouveau `src/jobs/business-metrics.job.ts`, `src/config/metrics.ts`, `src/services/wallet.service.ts`, `src/services/investment.service.ts`, `prisma/schema.prisma:136,160` | `/metrics` expose `afristocks_aum_xaf`, `afristocks_fees_collected_xaf_total`, `afristocks_pending_withdrawals{count,amount}`, `afristocks_psp_request_{total,failures_total,duration_seconds}{psp,status}`, `afristocks_kyc_funnel_step_total{step}` ; valeurs coherentes avec une requete SQL de controle. | OBSE-09 ; dep. domaines wallet/paiements/KYC | M | 3 | P1 | Cardinalite (label `psp`/`step` borne) ; cout des agregats → passer par un job |
| OBSE-11c | Invariant comptable « preuve d'equilibre » surveille | Verifier en continu l'invariant **`SUM(wallets.balance + wallets.lockedBalance)` = solde reconstitue depuis `transactions`** (le projet n'a pas de ledger en partie double : la table `transactions` fait office de ledger, `prisma/schema.prisma:136`). Calcul periodique de l'ecart global et par wallet ; expose en metrique + detection d'anomalie de solde global (variation anormale). Conserver la formule de reconstitution dans le service pour reutilisation (rapprochement, audit). | nouveau `src/services/reconciliation.service.ts`, `src/jobs/reconciliation.job.ts`, `src/config/metrics.ts` | Metrique `afristocks_ledger_balance_discrepancy_xaf` (ecart absolu global) + `afristocks_wallets_out_of_balance_total` ; un ecart injecte (transaction sans maj wallet) est detecte et mesure ; rapport horodate des wallets en ecart. | OBSE-09 ; dep. domaine wallet (coherence transactionnelle) | M | 3 | P1 | Faux positifs sur transactions `PENDING`/`lockedBalance` ; cout du calcul (batch, pas a chaud) |

#### EPIC OBSE-C (suite) — Stack & dashboards

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-12 | Exporters infra | Deployer postgres-exporter, redis-exporter, node-exporter (manifests K8s + scrape config / ServiceMonitor). | nouveaux `k8s/monitoring/*.yaml` | Metriques PG (connexions, lag), Redis (memoire, hits/miss), noeud (CPU/mem) visibles dans Prometheus. | OBSE-13 | M | 4 | P2 | Acces credentials exporters |
| OBSE-13 | Stack Prometheus + Grafana | Deployer kube-prometheus-stack (Helm) ou compose monitoring local ; retention configuree ; persistance. | nouveaux `k8s/monitoring/`, `docker-compose.monitoring.yml` | Prometheus scrape l'app + exporters ; Grafana accessible et provisionne automatiquement. | OBSE-09 | L | 4 | P1 | Cout/ressources cluster |
| OBSE-14 | Dashboards Grafana techniques versionnes | Dashboards JSON commites & auto-provisionnes : API (RED, 5xx, latence), Node/process, PostgreSQL, Redis. | `k8s/monitoring/grafana/dashboards/*.json` | Dashboards charges au demarrage ; panels affichent des donnees reelles. | OBSE-10, OBSE-12, OBSE-13 | M | 4 | P2 | Maintenance des dashboards |
| OBSE-14b | Dashboard direction (produit & financier) | Dashboard JSON dedie : **AUM**, **frais encaisses**, **retraits en attente**, **funnel de conversion KYC→depot→investir**, **taux d'echec/latence par PSP**, **ecart de l'invariant comptable** (OBSE-11c). Lisible par le porteur du projet (non technique). | `k8s/monitoring/grafana/dashboards/business.json` | Panels alimentes par OBSE-11b/11c ; chiffres recoupent une extraction SQL de controle ; accessible aux non-ops. | OBSE-11b, OBSE-11c, OBSE-13 | M | 4 | P2 | Coherence des chiffres avec la comptabilite reelle |

#### EPIC OBSE-D — Tracing distribue (OpenTelemetry)
*Objectif : tracer les requetes de bout en bout (HTTP → Prisma → Redis → paiements) avec contexte correle aux logs.*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-15 | Bootstrap OpenTelemetry SDK | `NodeSDK` charge **avant** tout autre import (`-r ./src/tracing.ts`) ; auto-instrumentations HTTP/Express/Prisma/ioredis ; exporter OTLP. | nouveau `src/tracing.ts`, `package.json`, `src/server.ts` (ordre d'init) | Une requete genere une trace avec spans HTTP+Prisma+Redis dans le backend de tracing. | — | L | 3 | P2 | Surcout latence, ordre d'init delicat |
| OBSE-16 | Correlation trace ↔ logs | Injecter `trace_id`/`span_id` dans chaque log Pino. | `src/config/logger.ts`, `src/tracing.ts` | Chaque log porte `trace_id` ; navigation log→trace possible. | OBSE-01, OBSE-15 | S | 3 | P2 | — |
| OBSE-17 | Backend de tracing | Deployer collector OTLP + Tempo/Jaeger ; echantillonnage configurable. | `k8s/monitoring/otel-collector.yaml`, `k8s/monitoring/tempo.yaml` | Traces consultables dans Grafana/Jaeger ; sampling parametrable par env. | OBSE-13, OBSE-15 | M | 4 | P2 | Cout stockage traces |

#### EPIC OBSE-E — Suivi d'erreurs (Sentry) backend/web/mobile
*Objectif : capturer et alerter sur les exceptions non gerees, avec source maps et contexte utilisateur.*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-18 | Sentry backend | `@sentry/node` initialise (DSN via env), capture des exceptions non gerees + handler `src/server.ts:54`, tagging `request-id`/`userId`, scrubbing PII. | `package.json`, `src/config/sentry.ts`, `src/server.ts:54` | Une erreur provoquee apparait dans Sentry avec stack, request-id, env ; pas de PII. | OBSE-04 | M | 3 | P1 | Fuite PII, cout par evenement |
| OBSE-19 | Sentry web (Next.js) | `@sentry/nextjs`, ErrorBoundary, upload source maps au build ; capture client+SSR. | `frontend/` (config Sentry, `next.config`) | Une erreur React/SSR remonte dans Sentry avec source maps lisibles. | — ; dep. domaine frontend | M | 3 | P2 | Source maps exposees publiquement |
| OBSE-20 | Sentry mobile (RN) | `@sentry/react-native`, capture crashs JS+natifs, upload symbols ; tirer parti du `react-native-keychain` deja installe pour le contexte session. | `mobile/` | Un crash mobile remonte dans Sentry avec symbolication. | — ; dep. domaine mobile | M | 4 | P2 | Config natives iOS/Android |

#### EPIC OBSE-F — Audit logging (actions sensibles & admin)
*Objectif : tracer de maniere immuable les evenements de securite et les actions admin (exigence reglementaire fintech).*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-21 | Brancher l'ecriture `LoginAttempt` | Ecrire `LoginAttempt` (succes/echec, ip, userAgent) sur chaque login ; le modele existe (`prisma/schema.prisma:89`) mais n'est jamais ecrit (re-verifie : 0 usage). | `src/services/auth.service.ts`, `src/controllers/auth.controller.ts` | Chaque login (OK/KO) cree 1 `LoginAttempt` ; verifiable en BDD ; test d'integration vert. | — ; dep. domaine securite | M | 2 | P0 | Volume sur attaque brute-force |
| OBSE-22 | Modele `AuditLog` + service | Nouveau modele `AuditLog` (actor, action, resource, before/after, ip, ts) + `auditService` reutilisable. | `prisma/schema.prisma`, migration, nouveau `src/services/audit.service.ts` | Migration appliquee ; service ecrit une entree append-only ; teste. | — | M | 3 | P1 | Conception du schema before/after |
| OBSE-23 | Audit des actions admin | Auditer toutes les mutations admin : KYC verify/reject, toggle-status user/startup, modif statut investissement. | `src/routes/admin.routes.ts` (l.209,229,247,262,334,440...) | Chaque mutation admin produit 1 `AuditLog` avec acteur+cible+diff ; couverture testee. | OBSE-22 ; dep. domaine RBAC/admin | M | 3 | P1 | Routes admin sans middleware auth (a corriger) |
| OBSE-24 | Audit des actions financieres | Auditer depots/retraits/investissements (montant, wallet, statut). | `src/services/wallet.service.ts`, `src/services/investment.service.ts` | Chaque mouvement financier produit 1 `AuditLog` correle a la `Transaction`. | OBSE-22 ; dep. domaine wallet | M | 3 | P1 | Coherence transactionnelle (meme tx Prisma) |
| OBSE-25 | Export/retention audit | Politique de retention + export immuable (S3 WORM ou table append-only protegee). | `src/services/audit.service.ts`, infra S3 | Logs d'audit conserves N annees, non modifiables, exportables. | OBSE-22 ; dep. infra S3 | M | 4 | P2 | Conformite legale a clarifier |

#### EPIC OBSE-G — Alerting & SLO/SLI
*Objectif : definir des objectifs de service mesurables et alerter avant l'impact utilisateur — y compris sur la sante financiere.*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-26 | Definir SLI/SLO | Documenter SLI (dispo, taux 5xx, latence p95, succes jobs paiement) et SLO chiffres + error budget. | nouveau `docs/slo.md` | Document valide listant SLI/SLO chiffres et fenetres. | — | S | 4 | P1 | Cibles irrealistes |
| OBSE-27 | Regles d'alerte Prometheus (technique) | Alertes : 5xx > seuil, latence p95 elevee, CPU/mem, pod down, BDD/Redis injoignables, **echecs jobs paiement**, brute-force login. | `k8s/monitoring/alert-rules.yaml` | Regles chargees ; declenchement verifie sur incident simule. | OBSE-10, OBSE-11, OBSE-13, OBSE-21 | M | 4 | P1 | Bruit/alert fatigue |
| OBSE-27b | Alertes de sante financiere | Alertes **temps reel** basees sur OBSE-11b/11c : **ecart de l'invariant comptable > seuil** (`afristocks_ledger_balance_discrepancy_xaf`), **taux d'echec par PSP > seuil** (par Orange/MTN/Wave), **retraits en attente** depassant un seuil de montant/anciennete, **anomalie de solde global** (variation hors bornes). Chaque alerte reference son runbook (OBSE-35). | `k8s/monitoring/alert-rules.yaml` | Un ecart de solde injecte declenche une alerte < fenetre definie ; une rafale d'echecs PSP simulee alerte ; alertes routees (OBSE-28). | OBSE-11b, OBSE-11c, OBSE-13 ; dep. domaines wallet/paiements | M | 4 | P1 | Faux positifs (PENDING, lockedBalance) → calibrer les seuils |
| OBSE-28 | Alertmanager + routage | Alertmanager → Slack/email/PagerDuty ; severites + silencing + escalade. | `k8s/monitoring/alertmanager.yaml` | Une alerte test arrive sur le canal cible ; severites routees. | OBSE-27 | M | 4 | P2 | Secrets de notification |
| OBSE-29 | Monitoring synthetique externe | Sonde uptime externe (blackbox-exporter / service tiers) sur `/api/health/ready`. | `k8s/monitoring/blackbox.yaml` | Indisponibilite detectee de l'exterieur < 1 min. | OBSE-07 | S | 4 | P2 | Couts service externe |

#### EPIC OBSE-H — Sauvegarde PostgreSQL & DR
*Objectif : garantir RPO/RTO via backups automatises, chiffres, testes, avec procedure de restauration.*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-30 | Backup automatise PG | CronJob K8s `pg_dump` (ou snapshots RDS si manage) vers S3, chiffre, horodate ; aucun script de backup n'existe aujourd'hui. | nouveaux `k8s/backup/pg-backup-cronjob.yaml`, `scripts/pg_backup.sh` | Backup quotidien depose sur S3 chiffre ; CronJob `Succeeded`. | dep. infra S3 | M | 4 | P0 | Acces S3, cout stockage |
| OBSE-31 | Retention & rotation | Politique GFS (quotidien/hebdo/mensuel) + lifecycle S3. | `scripts/pg_backup.sh`, lifecycle S3 | Anciens backups purges selon politique ; verifie. | OBSE-30 | S | 4 | P2 | Suppression accidentelle |
| OBSE-32 | PITR / WAL archiving | Activer l'archivage WAL pour Point-In-Time Recovery (`archive_command` est commente `.pg-data/postgresql.conf:294`). | config PG/RDS | Restauration a un instant T demontree en staging. | OBSE-30 | L | 4 | P1 | Complexite, volume WAL |
| OBSE-33 | Test de restauration automatise | Job periodique qui restaure le dernier backup dans une instance jetable et valide l'integrite (count tables, `SELECT 1`, **controle de l'invariant comptable OBSE-11c**). | `k8s/backup/restore-test-cronjob.yaml`, `scripts/restore_test.sh` | Test mensuel passe et alerte si echec ; rapport horodate incluant le controle d'equilibre. | OBSE-30, OBSE-11c | M | 4 | P1 | Cout instance de test |
| OBSE-34 | Plan DR & RPO/RTO | Documenter RPO/RTO cibles, scenarios (perte AZ/region), bascule. | `docs/dr-plan.md` | Plan DR valide avec RPO/RTO chiffres et procedure pas-a-pas. | OBSE-30 | M | 4 | P1 | Engagement organisationnel |

#### EPIC OBSE-I — Runbooks & exploitation
*Objectif : rendre les incidents traitables par n'importe quel operateur.*

| ID | Titre | Description | Fichiers | Acceptation (DoD) | Deps | Effort | Phase | Prio | Risques |
|---|---|---|---|---|---|---|---|---|---|
| OBSE-35 | Runbooks d'incident | Runbooks par alerte (5xx, BDD down, Redis down, echec paiement, espace disque, restauration backup, **ecart de solde/invariant comptable**, **echecs PSP**) : symptomes, diagnostic, remediation, escalade. | nouveau `docs/runbooks/*.md` | 1 runbook par alerte OBSE-27/27b ; chaque alerte reference son runbook (lien dans l'annotation). | OBSE-27, OBSE-27b | M | 4 | P2 | Maintenance/obsolescence |
| OBSE-36 | Annotation des releases | Marquer les deploiements dans Grafana/Sentry (release version) pour correler regressions. | CI/CD, `src/config/sentry.ts`, dashboards | Chaque deploiement cree une annotation visible ; correlation regression↔release. | OBSE-13, OBSE-18 ; dep. domaine CI/CD | S | 4 | P2 | Necessite un CI/CD (absent) |
| OBSE-37 | Doc d'observabilite | README ops : ou sont logs/metrics/traces/erreurs, comment acceder aux dashboards (technique + direction), variables d'env (`LOG_LEVEL`, DSN, OTLP...). | `docs/observability.md` | Doc a jour listant tous les outils, URLs et variables. | OBSE-01→OBSE-35 | S | 4 | P2 | Doc qui derive du code |

---

### Risques specifiques au domaine

- **Conformite fintech (le plus critique).** L'absence d'audit logging effectif (`LoginAttempt` jamais ecrit, aucun `AuditLog`, aucune trace des actions admin sur KYC/wallet/investissements dans `src/routes/admin.routes.ts`) est un manquement reglementaire majeur pour une plateforme financiere : impossible de prouver qui a fait quoi en cas de litige, fraude ou controle.
- **Cecite financiere & risque de fraude silencieuse.** Sans surveillance continue de l'invariant comptable (OBSE-11c) ni alerte de sante financiere (OBSE-27b), un ecart entre les soldes wallet et le ledger (`transactions`) — bug de double credit, transaction sans maj wallet, fraude — resterait **invisible jusqu'au rapprochement manuel ou au signalement client**. Le modele n'ayant pas de ledger en partie double (`prisma/schema.prisma:136`), la « preuve d'equilibre » doit etre reconstruite et surveillee explicitement.
- **Risque de perte de donnees irreversible.** Aucune sauvegarde PostgreSQL automatisee, aucun WAL archiving, aucun test de restauration : un incident BDD aujourd'hui = perte totale et definitive des soldes wallet, transactions et investissements (donnees financieres).
- **Cecite operationnelle totale.** Sans metriques, sans alerting et sans tracing, une panne (5xx, fuite memoire, BDD/Redis injoignable) n'est detectee qu'au signalement utilisateur. Le `on('error', () => {})` Redis (`src/config/redis.ts:36`) aggrave le risque en masquant activement les pannes de cache.
- **Probes K8s defaillantes.** Les manifests actuels (`k8s/backend-deployment.yaml` sans probes ; chart Helm sondant `/` inexistant) empechent K8s de redemarrer/retirer un pod malade et d'orchestrer un rolling update sain.
- **Fuite de PII/secrets via logs.** Brancher des logs/Sentry sans redaction (OBSE-06) risquerait d'exposer mots de passe, tokens et OTP — d'autant que le projet a deja un historique d'exposition de secrets (cf. audit securite).
- **Cardinalite & cout.** Une instrumentation Prometheus naive (labels sur IDs) ou un sampling de traces a 100 % peut faire exploser les couts de stockage et la memoire de l'app ; les KPIs financiers (OBSE-11b/11c) doivent passer par des **jobs batch** plutot que des agregats SQL a chaud.
- **Dependances inter-domaines.** Une grande partie du backlog metier (OBSE-11, OBSE-11b, OBSE-24, OBSE-27b, alertes paiement) depend de features encore absentes (paiements Orange/MTN/Wave, retrait wallet, KYC effectif) : ces taches ne pourront etre completees qu'apres livraison des domaines correspondants. L'invariant comptable (OBSE-11c) est en revanche realisable des maintenant sur le modele existant.
- **Absence de CI/CD.** Plusieurs taches (annotation releases OBSE-36, scan d'images, deploiement de la stack monitoring) presupposent un pipeline qui n'existe pas — dependance dure au domaine Infra/CI-CD.

---

### Decisions a valider par le porteur du projet

1. **Hebergement de l'observabilite : self-hosted vs managed.** Stack open-source auto-heberge (Prometheus + Grafana + Loki + Tempo, faible cout licence, charge ops elevee) **ou** SaaS (Datadog / Grafana Cloud / New Relic, demarrage rapide, cout recurrent) ? Decision structurante pour OBSE-13/17/28.
2. **Outil de suivi d'erreurs.** Sentry SaaS, Sentry self-hosted, ou GlitchTip ? Impacte OBSE-18/19/20 et le scrubbing PII.
3. **Centralisation des logs.** AWS CloudWatch Logs (coherent avec ECR eu-west-1 deja cible) vs ELK/Loki auto-heberge ? Impacte OBSE-01/02 et la facture.
4. **Cibles SLO et budget d'erreur.** Disponibilite visee (99,5 % ? 99,9 %), latence p95 acceptable, RPO/RTO pour la BDD financiere. Pre-requis a OBSE-26/34.
5. **Strategie de sauvegarde PG.** PostgreSQL auto-gere (CronJob `pg_dump` + WAL) **ou** migration vers RDS managed (backups/PITR natifs) ? Decision a prendre avant OBSE-30/32.
6. **Frequence et engagement sur les tests de restauration** (OBSE-33) : qui en est responsable, a quelle cadence, sur quel budget d'infra jetable.
7. **Retention et conformite de l'audit financier** (OBSE-25) : duree legale de conservation des logs d'audit/`LoginAttempt` selon la juridiction cible (UEMOA/Cote d'Ivoire vs UE — incoherence domaine `.eu`/`.com` deja relevee).
8. **Exposition de `/metrics` et des consoles** (Grafana/Prometheus/Sentry) : reseau prive/VPN, authentification, RBAC — a arbitrer avec le domaine securite. Le **dashboard direction** (OBSE-14b) doit etre accessible a des non-ops : prevoir un acces en lecture dedie.
9. **Canal d'astreinte et escalade** (OBSE-28/35) : Slack/email/PagerDuty, qui est d'astreinte, SLA de reponse — y compris pour les **alertes financieres** (qui traite un ecart de solde et sous quel delai).
10. **Budget mensuel observabilite** acceptable (ingestion logs/metrics/traces, retention) — determine l'ampleur de l'echantillonnage et de la retention.
11. **Seuils & fenetres des alertes financieres** (OBSE-11c/27b) : tolerance d'ecart de solde acceptable (idealement zero, mais a calibrer face aux transactions `PENDING`/`lockedBalance`), seuils de montant/anciennete des retraits en attente, et seuil d'echec par PSP declenchant une alerte.

---

Verified: HEAD still on `restore-frontend-2025-08-11`, 143 D / 25 M / 13 ??, 5 remotes, secrets still tracked in HEAD. The audit state holds. Both gaps are valid. Here is the finalized v2 section.

## Depot, workflow git & architecture cible

### Etat actuel (verifie sur le code)

**Score : 2/10** (inchange vs audit du 9 fev. ; le nettoyage amorce n'a PAS ete committe, l'etat git reste critique).

#### Constat verifie (chemins reels)

Le depot est un **monorepo de fait** situe a `/Users/cyrilsohnde/afristocks`, contenant simultanement :
- le **backend** Express/TS a la racine (`src/`, `prisma/`, `package.json` nomme `"afristocks-backend"`),
- le **frontend** Next.js dans `frontend/` (`package.json` nomme `"frontend"`, next 15.3.5 / react 19),
- le **mobile** React Native dans `mobile/` (`package.json` nomme `"AfriStocksMobile"`, RN 0.80.1),
- l'**infra** melangee a la racine (`k8s/`, `charts/afristocks/`, `ingress.yaml`, `service.yaml`, `clusterissuer.yaml`, `production-values.yaml`, `Dockerfile`, `docker-compose.yml`).

Aucune frontiere de module formelle : tout cohabite a plat sans workspace, sans convention de nommage de packages (`"frontend"` au lieu de `@afristocks/web`).

#### Ce qui fonctionne (le peu)
- Un seul `.git` (13 Mo) ; `node_modules/` **n'est pas suivi** (verifie : `git ls-files node_modules` = 0).
- `.gitignore` racine est correct et complet (ignore `.env`, `.env.*` sauf `.env.example`, `node_modules/`, `.next/`, `*.bak`, `.DS_Store`, etc.).
- Les librairies OpenAPI sont **installees** : `swagger-jsdoc@6.2.8` et `swagger-ui-express@5.0.1` figurent dans `package.json` (deps), avec leurs `@types`.

#### Ce qui est casse / absent (verifie le 21 juin 2026)

0. **Etat git brut (re-verifie) :** branche courante = `restore-frontend-2025-08-11` (PAS `main`) ; `git status --porcelain` = **143 suppressions (D)**, **25 modifies (M)**, **13 non-suivis (??)** ; 5 remotes (`origin`, `backend`, `gitlab`, `gitlab_backend`, `gitlab_frontend`) ; secrets toujours traques dans HEAD (`git ls-files` liste `.env.production`, `backend/.env.production`, `Mots de passes et ID.txt`, `backend/Mots de passes et ID.txt`). Le delta vis-a-vis de l'audit est **nul cote depot**.
1. **Secrets toujours versionnes (P0 absolu).** Sont **suivis par git dans HEAD** (verifie `git ls-files`) :
   - `.env.production` (racine) et `backend/.env.production` — contiennent `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `AWS_ACCESS_KEY_ID/SECRET`, et les cles `ORANGE_MONEY_*`, `MTN_*`, `WAVE_*`, `SMTP_*`.
   - `Mots de passes et ID.txt` (racine) et `backend/Mots de passes et ID.txt`.
   - `mobile/.env.production` est present **dans l'historique** (`git log --all`).
   - Ces fichiers sont presents sur **toutes les branches/historique** : `git log --all --name-only` les liste. Le `.gitignore` correct n'a aucun effet car ils sont **deja traques** (il faut `git rm --cached` + purge d'historique).
2. **AWS Account ID expose dans les manifests :** `771237845610.dkr.ecr.eu-west-1.amazonaws.com/afristocks-backend` dans `k8s/backend-deployment.yaml:18` et `production-values.yaml:6`.
3. **Incoherence de domaine :** `ingress.yaml:12,15` -> `afristocks.eu` ; `production-values.yaml:20,26` -> `afristocks.com`.
4. **Chaos de branches/remotes :**
   - **5 remotes** : `origin` (GitHub `afristocks.git`), `backend` (GitHub `afristocks-backend.git`), `gitlab`, `gitlab_backend`, `gitlab_frontend` (3 GitLab).
   - **7 branches locales**, dont 4 issues de restores : `restore-frontend-2025-08-11` (**branche courante !**), `restore-week-ago-20250818-200015`, `backend-split`, `frontend-split`, `gitlab-backend`, `feature/neuroscience-ui-v2`, `main`.
   - HEAD = `restore-frontend-2025-08-11`, **diverge de `main`** (8 commits devant / 7 derriere) et d'`origin/main` (1/7). On ne developpe donc **pas sur main**.
5. **Historique de commits purement « restore » :** les 7 commits sont `Initial commit`, `Sauvegarde avant refonte UI`, puis 5 commits « Restore … from GitLab/snapshot ». Aucune convention (pas de Conventional Commits), messages en franglais.
6. **Enorme travail non committe :** dernier commit du **18 aout 2025**, mais fichiers modifies en **fevrier 2026**. `git status` : **143 suppressions stagees**, **25 modifies**, **13 non-suivis** (dont `mobile/`, `src/routes/admin.routes.ts`, `fund.routes.ts`, `news.routes.ts`, `setup-db.js`, `frontend/src/components/AdvancedTrading.tsx`). Tout le travail recent existe uniquement sur disque.
7. **Doublon backend dans l'index git :** 73 fichiers sous `backend/` sont encore traques dans HEAD (dont `backend/backend/package.json` — double imbrication), alors que le dossier `backend/` **n'existe plus sur disque** (verifie : `ls backend` = No such file). D'ou les 143 suppressions stagees non committees.
8. **OpenAPI installe mais non branche :** `grep swagger src/` = **0 occurrence**. Les libs sont des dependances mortes ; il n'existe aucun `/api/docs` ni spec.
9. **CI/CD : neant.** Aucun `.github/workflows`, aucun `.gitlab-ci.yml` (verifie). Le `.github/` du *cwd* `Afristocks-Trading/quant-system` est un autre projet, sans rapport.
10. **Documentation : neant.** `README.md` = `# AfriStocks Platform` (1 ligne). Pas de `docs/`, pas de `CONTRIBUTING`, pas d'ADR.
11. **Cruft a la racine :** `K8s:` (dossier avec deux-points dans le nom), `main.py ` (trailing space) + `requirements.txt` (residus Python sans rapport), `dockerignore` ET `.dockerignore` (doublon), `prisma-engines-6.11.1.tgz`, `.pg-data/`, `AUDIT_*.docx` non-suivi.
12. **Configs frontend dupliquees :** `frontend/next.config.js` + `next.config.ts` + `next.config.build.js` ; `postcss.config.js` + `postcss.config.mjs` ; `tailwind.config.js` + `tailwind.config.ts`. Ambiguite sur la source de verite.

#### Delta reel depuis l'audit du 9 fev.
- Le menage **disque** annonce a partiellement eu lieu (les 6 copies de backend et les `.bak` ont disparu du systeme de fichiers, `.dockerignore` rempli), **MAIS rien n'a ete committe** : git voit toujours `backend/`, les secrets, et 143 suppressions en attente. Le delta est donc **quasi nul du point de vue du depot**. Le risque securite (secrets dans l'historique) est **intact**.

---

### Backlog (epics et taches)

> **Regle de sequencement (verrou dur).** Toute la **Phase 0** ci-dessous doit etre **Done** avant la moindre operation git destructive ou reecrivant l'historique. Concretement : **REPO-03 (purge + force-push), REPO-07 (suppression de remotes), REPO-09 (bascule de `main`), REPO-10 (suppression de branches) sont BLOQUES PAR REPO-00, REPO-08 et REPO-09 dans l'ordre** — aucun `git filter-repo`, `push --force`, `reset --hard`, `checkout`/`switch` destructif, ni `remote remove` n'est autorise tant que l'arbre de travail de fev. 2026 n'est pas committe ET sauvegarde par miroir. Cette regle repond directement a la lacune critique de sequencement relevee par le controle.

#### EPIC Z — Phase 0 : sauvegarde et consolidation prealables (verrou absolu)
*Objectif : geler et securiser l'etat actuel (arbre de travail de fev. 2026 present uniquement sur disque + contenu unique des 5 remotes) AVANT toute manipulation git risquee. C'est le tout premier chantier du projet.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| REPO-00 | Backup miroir des 5 remotes + snapshot de l'arbre de travail | S | 0 | P0 |

- **REPO-00 — Backup miroir des 5 remotes + snapshot de l'arbre de travail (prerequis dur de TOUT)**
  - Description : avant tout, sanctuariser l'existant. (a) `git clone --mirror` de chacun des 5 remotes (`origin`, `backend`, `gitlab`, `gitlab_backend`, `gitlab_frontend`) vers un stockage hors-ligne/securise ; (b) `tar`/archive horodatee de l'**integralite** de l'arbre de travail `/Users/cyrilsohnde/afristocks` (y compris les fichiers non suivis : `mobile/`, `src/routes/*.ts`, etc.), pour parer a toute perte du code fev. 2026 ; (c) verifier l'integrite des archives (taille, `git log` dans les miroirs, listing du tar).
  - DoD : 5 miroirs `*.git` restaurables (preuve : `git -C mirror.git log --oneline -1` pour chacun) + 1 archive de l'arbre de travail dont le contenu inclut les 13 fichiers non suivis ; emplacement et date des sauvegardes consignes dans le ticket.
  - Dependances : **aucune (premier ticket execute du projet)**. **Effort S — Phase 0 — P0.**
  - Note de sequencement : **bloque** REPO-02, REPO-03, REPO-07, REPO-08, REPO-09, REPO-10 (et les jumeaux securite/infra SECU-02/03, INFR-02, CICD-03). Rien de destructif avant que REPO-00 soit Done.

#### EPIC A — Eradication des secrets et assainissement de l'historique git
*Objectif : retirer tous les secrets du depot et de tout l'historique, sur tous les remotes, et garantir qu'aucun secret ne puisse plus etre committe.*

| ID | Titre | Effort | Phase | Prio |
|----|-------|--------|-------|------|
| REPO-01 | Inventaire exhaustif des secrets versionnes | S | 1 | P0 |
| REPO-02 | Detacher les secrets de l'index (git rm --cached) | S | 1 | P0 |
| REPO-03 | Purger l'historique (git filter-repo / BFG) | M | 1 | P0 |
| REPO-04 | Rotation de TOUS les secrets exposes | M | 1 | P0 |
| REPO-05 | Scanner anti-secrets en pre-commit + CI (gitleaks) | M | 1 | P0 |
| REPO-06 | Retirer l'AWS Account ID des manifests | S | 1 | P0 |

- **REPO-01 — Inventaire exhaustif des secrets versionnes**
  - Description : lister tous les chemins contenant des secrets dans l'historique de toutes les branches/remotes. Documenter chaque secret (type, ou, valeur a revoquer).
  - Fichiers : `.env.production`, `backend/.env.production`, `mobile/.env.production`, `Mots de passes et ID.txt`, `backend/Mots de passes et ID.txt`, `k8s/backend-deployment.yaml`, `production-values.yaml`.
  - DoD : un tableau `SECURITY_secrets_inventory` (livre dans le ticket, pas committe) listant ≥ 6 fichiers et chaque cle a revoquer ; valide par `git log --all --name-only | grep -iE 'env\.production|Mots de passe'`.
  - Dependances : aucune. **Effort S — Phase 1 — P0.**
- **REPO-02 — Detacher les secrets de l'index**
  - Description : `git rm --cached` sur tous les fichiers de REPO-01, commit « chore(security): untrack secret files ». Verifier que `.gitignore` les couvre deja (c'est le cas).
  - DoD : `git ls-files | grep -iE 'env\.production|Mots de passe'` retourne vide sur HEAD.
  - Dependances : **REPO-00 (backup)**, REPO-01. **Effort S — Phase 1 — P0.**
- **REPO-03 — Purger l'historique complet**
  - Description : utiliser `git filter-repo` (prefere a BFG) pour supprimer les chemins secrets de **tout** l'historique, sur toutes les branches. Coordonner un force-push controle sur `origin` apres avoir prevenu les contributeurs ; invalider les forks/clones.
  - DoD : `git log --all --name-only | grep -iE 'env\.production|Mots de passe'` = vide ; `.git` repackee ; force-push effectue ; ancien historique inaccessible sur GitHub (et remotes conserves).
  - Dependances (verrou) : **BLOQUE PAR REPO-00 (miroir + snapshot), REPO-08 (travail fev. 2026 committe) ET REPO-09 (`main` a jour)** ; ainsi que REPO-02 et REPO-04 (rotation **avant ou en parallele**, car la purge ne « decompromet » pas un secret deja exfiltre). **Aucun force-push autorise tant que REPO-08 et REPO-09 ne sont pas Done.** **Effort M — Phase 1 — P0.**
  - Risque : reecriture d'historique destructive ; ne s'execute qu'apres backup miroir (REPO-00).
- **REPO-04 — Rotation de tous les secrets exposes**
  - Description : revoquer/regenerer mot de passe DB, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, cles AWS IAM, cles Orange/MTN/Wave, identifiants SMTP. Considerer comme compromis tout secret ayant transite par git.
  - Fichiers cibles : nouveaux secrets injectes via gestionnaire (cf. REPO-20), jamais en clair.
  - DoD : chaque secret de l'inventaire REPO-01 a une nouvelle valeur ; les anciennes sont revoquees cote fournisseur (preuve dans le ticket).
  - Dependances : REPO-01 ; lien fort avec domaine Securite. **Effort M — Phase 1 — P0.**
- **REPO-05 — Scanner anti-secrets (pre-commit + CI)**
  - Description : ajouter `gitleaks` en hook pre-commit (via `husky` ou `pre-commit`) et en job CI bloquant.
  - Fichiers : `.gitleaks.toml`, `.husky/pre-commit`, futur workflow CI.
  - DoD : un commit contenant une fausse cle est bloque localement ET en CI (test reproductible).
  - Dependances : EPIC F (CI). **Effort M — Phase 1 — P0.**
- **REPO-06 — Retirer l'AWS Account ID et parametrer le registre**
  - Description : remplacer `771237845610.dkr.ecr…` par une variable `${ECR_REGISTRY}` dans `k8s/backend-deployment.yaml:18` et `production-values.yaml:6`.
  - DoD : `grep -rn 771237845610` sur le repo = vide ; les manifests se templatisent via Helm values / kustomize.
  - Dependances : domaine Infra. **Effort S — Phase 1 — P0.**

#### EPIC B — Rationalisation des remotes et des branches
*Objectif : un seul remote canonique (origin GitHub), une strategie de branches lisible, suppression des branches de restore.*

- **REPO-07 — Choisir et figer le remote canonique**
  - Description : conserver `origin` (GitHub `afristocks.git`). Supprimer les remotes `backend`, `gitlab`, `gitlab_backend`, `gitlab_frontend` apres avoir verifie qu'ils ne contiennent rien d'unique (`git log remote/main ^origin/main`).
  - DoD : `git remote` ne liste plus que `origin` ; aucun commit unique perdu (preuve par diff de refs).
  - Dependances : **REPO-00 (miroir des 5 remotes obligatoire avant toute suppression)**, REPO-08, REPO-09 (consolidation du contenu d'abord). **Effort M — Phase 1 — P1.**
  - Risque : du code recent peut vivre uniquement sur un remote GitLab — auditer avant suppression ; les miroirs REPO-00 garantissent la reversibilite.
- **REPO-08 — Consolider le travail non committe sur une branche de travail**
  - Description : les fichiers de fev. 2026 (143 D, 25 M, 13 ?? — notamment `src/routes/admin.routes.ts`, `fund.routes.ts`, `news.routes.ts`, `mobile/`) ne sont sur aucun commit. Creer une branche `consolidation/feb-2026`, committer le contenu disque par lots thematiques (backend / frontend / mobile / infra) avec des messages clairs. **Ce ticket est un prerequis dur de toute reecriture d'historique (REPO-03) et de toute bascule de branche (REPO-09).**
  - DoD : `git status` propre (0 modif non suivie pertinente) ; chaque lot dans un commit distinct conventionnel ; la branche `consolidation/feb-2026` contient l'integralite du code fev. 2026.
  - Dependances : **REPO-00 (snapshot)**, REPO-02 (secrets retires d'abord), REPO-17 (resoudre le doublon `backend/`). **Effort L — Phase 1 — P0.**
- **REPO-09 — Definir `main` comme branche par defaut a jour**
  - Description : reconcilier `restore-frontend-2025-08-11` (HEAD actuel, diverge 8/7 de main) avec `main`. Decider de la verite (vraisemblablement l'etat disque consolide via REPO-08), fusionner dans `main`, basculer HEAD sur `main`.
  - DoD : `git branch --show-current` = `main` apres bascule ; `origin/HEAD -> main` ; `main` contient le code de fev. 2026.
  - Dependances : **REPO-00**, REPO-08. **Effort M — Phase 1 — P0.**
- **REPO-10 — Supprimer les branches mortes (restore/split)**
  - Description : supprimer `restore-frontend-2025-08-11`, `restore-week-ago-20250818-200015`, `backend-split`, `frontend-split`, `gitlab-backend`, et les refs remotes equivalentes, apres merge/verification.
  - DoD : `git branch -a` ne liste que `main` (+ branches de feature actives) ; aucune branche `restore*`/`*-split`.
  - Dependances : **REPO-00**, REPO-07, REPO-09. **Effort S — Phase 1 — P1.**

#### EPIC C — Strategie de branches et conventions de commit
*Objectif : un workflow reproductible et documente.*

- **REPO-11 — Adopter le trunk-based + branches courtes**
  - Description : trunk = `main` protege (PR obligatoire, ≥ 1 review, CI verte, pas de push direct). Branches `feat/*`, `fix/*`, `chore/*` courtes ; merge en squash. Documenter pourquoi pas GitFlow (pas de besoin de releases paralleles a ce stade).
  - Fichiers : `docs/branching.md`, regles de protection GitHub.
  - DoD : protection de branche active sur `main` (capture/preuve API) ; doc presente.
  - Dependances : REPO-09, EPIC F (CI pour le gating). **Effort S — Phase 2 — P1.**
- **REPO-12 — Conventional Commits + commitlint**
  - Description : imposer Conventional Commits via `commitlint` + hook `commit-msg` (husky). Aligner avec la future semver/changelog.
  - Fichiers : `commitlint.config.js`, `.husky/commit-msg`.
  - DoD : un message non conforme est rejete localement ; documente dans `CONTRIBUTING.md`.
  - Dependances : REPO-05 (husky deja en place). **Effort S — Phase 2 — P1.**

#### EPIC D — Architecture cible & frontieres de modules
*Objectif : trancher mono vs multi-repo, structurer en workspaces, isoler l'infra.*

- **REPO-13 — Decision documentee mono-repo vs multi-repo (ADR-0001)**
  - Description : ecrire un ADR comparant (a) monorepo unique avec workspaces, (b) multi-repo (web/mobile/backend/infra). Recommandation par defaut : **monorepo** avec pnpm/npm workspaces (etat actuel deja monorepo de fait ; evite la re-synchro qui a genere les remotes/branches `*-split`). Trancher.
  - Fichiers : `docs/adr/0001-repo-strategy.md`.
  - DoD : ADR « Accepted » signe par le porteur, avec consequences et plan de migration.
  - Dependances : REPO-07. **Effort M — Phase 1 — P0.**
- **REPO-14 — Restructurer en workspaces (operation atomique, fenetre de gel dediee)**
  - Description : deplacer le backend racine dans `apps/backend/` (ou `packages/api`), `frontend/` -> `apps/web/`, `mobile/` -> `apps/mobile/`, infra -> `infra/` (k8s, charts, ingress, service, clusterissuer, docker-compose, Dockerfile). Renommer les packages : `@afristocks/api`, `@afristocks/web`, `@afristocks/mobile`. Mettre en place un `package.json` racine avec `workspaces`. **Operation big-bang a isoler : casse simultanement imports, Dockerfiles, chemins K8s et CI.**
  - **Sequencement impose (lacune controle) :** realiser cette bascule **AVANT la mise en place de la CI (REPO-21)**, afin que la CI soit ecrite directement sur la structure cible, et **APRES la consolidation du code non committe (REPO-08)**, pour ne pas restructurer du code uniquement sur disque. Reserver une **fenetre de gel dediee de 3 a 5 jours** sur une **branche dediee** `chore/workspaces-migration`, sans autre chantier en parallele (gel partiel des merges feature) pour eviter les conflits de merge massifs. Migration mergee **uniquement** apres CI verte sur la nouvelle arborescence.
  - Fichiers concernes : `src/`, `prisma/`, `package.json` (racine), `frontend/`, `mobile/`, `k8s/`, `charts/`, `ingress.yaml`, `service.yaml`, `clusterissuer.yaml`, `production-values.yaml`, `Dockerfile`, `docker-compose.yml`.
  - DoD : `npm install` a la racine installe les 3 apps ; chaque app build independamment ; arborescence `apps/` + `infra/` + `packages/` claire ; fenetre de gel respectee (pas de merge feature concurrent durant la bascule) ; CI verte sur la cible avant merge.
  - Dependances : REPO-13, REPO-08 ; **doit preceder REPO-21 (CI)**. **Effort XL — Phase 2 (debut, fenetre dediee) — P1.**
  - Risque : big-bang ; mitige par branche dediee + gel + CI verte avant merge.
- **REPO-15 — Nettoyer le cruft racine**
  - Description : supprimer/relocaliser `K8s:` (nom invalide), `main.py ` (espace final) + `requirements.txt` (residus Python), le doublon `dockerignore` (garder `.dockerignore`), `prisma-engines-6.11.1.tgz`, `.pg-data/` (ignorer), `AUDIT_*.docx` (deplacer dans `docs/`).
  - DoD : racine ne contient plus de fichier sans rapport ; `ls` racine documente dans le README.
  - Dependances : REPO-14. **Effort S — Phase 2 — P1.**
- **REPO-16 — Dedupliquer les configs frontend**
  - Description : choisir UNE source par outil : `next.config.ts` (supprimer `next.config.js`, `next.config.build.js`), `postcss.config.mjs` (supprimer `.js`), `tailwind.config.ts` (supprimer `.js`). Migrer la config de prod (`next.config.build.js`) en variables d'env conditionnelles.
  - Fichiers : `frontend/next.config.*`, `frontend/postcss.config.*`, `frontend/tailwind.config.*`.
  - DoD : un seul fichier par outil ; `next build` OK ; aucune regression de theme/Tailwind.
  - Dependances : domaine Frontend. **Effort S — Phase 2 — P2.**
- **REPO-17 — Definir les frontieres de modules backend et resorber le doublon `backend/`**
  - Description : formaliser la structure `routes -> controllers -> services -> repositories` et un index unique. Combler les vides connus (`src/routes/startup.routes.ts` = 0 octet ; `src/routes/index.ts` doit enregistrer toutes les routes). **Resorber explicitement le doublon `backend/` (73 fichiers traques dont `backend/backend/package.json`) qui genere les 143 suppressions stagees** : supprimer ces chemins de l'index de facon controlee (pas par un commit naif de l'etat disque) afin de ne pas reintroduire d'incoherence. Documenter les couches.
  - Fichiers : `src/routes/`, `src/controllers/`, `src/services/`, `src/routes/index.ts`, `backend/**` (a deduppliquer), `docs/architecture.md`.
  - DoD : diagramme + regles de dependances entre couches ; aucune route fantome (chaque fichier route est monte ou supprime) ; `git ls-files backend/` = vide apres consolidation.
  - Dependances : REPO-08 (consolidation), domaine Backend (contenu metier). **Effort M — Phase 2 — P1.**

#### EPIC E — Configuration centralisee et variables d'environnement
*Objectif : une gestion par environnement, sans secret en clair, validee au demarrage.*

- **REPO-18 — Modele `.env.example` unique et complet par app**
  - Description : maintenir un `.env.example` exhaustif (toutes les cles, sans valeur) pour backend, web et mobile, synchronise avec le code. Supprimer toute trace de `.env.production` versionnee (cf. REPO-02).
  - Fichiers : `.env.example`, `frontend/.env.example`, `mobile/.env.example`.
  - DoD : chaque cle lue dans le code figure dans le `.env.example` correspondant (test de coherence) ; aucune valeur reelle.
  - Dependances : REPO-02. **Effort S — Phase 1 — P1.**
- **REPO-19 — Validation de la config au boot (schema)**
  - Description : valider les variables d'env au demarrage (ex. `zod`/`envalid`) cote backend et web ; echec rapide si une cle manque.
  - Fichiers : `src/config/env.ts` (nouveau), `src/server.ts`.
  - DoD : demarrage sans `JWT_SECRET` -> erreur explicite et arret ; couvert par un test.
  - Dependances : REPO-18. **Effort M — Phase 2 — P1.**
- **REPO-20 — Gestionnaire de secrets par environnement**
  - Description : choisir le stockage runtime (K8s Secrets + ExternalSecrets/SealedSecrets, ou AWS Secrets Manager) ; supprimer les creds en clair de `docker-compose.yml` et des manifests.
  - Fichiers : `docker-compose.yml`, `k8s/`, `charts/afristocks/values.yaml`, `production-values.yaml`.
  - DoD : aucun secret en clair dans les YAML/compose ; secrets injectes au runtime ; documente.
  - Dependances : REPO-04, domaine Infra. **Effort L — Phase 3 — P1.**

#### EPIC F — CI/CD et qualite de depot
*Objectif : un pipeline GitHub Actions bloquant lint/test/build + scan secrets.*

- **REPO-21 — Pipeline CI GitHub Actions multi-app**
  - Description : workflows par app (backend, web, mobile) declenchant install/lint/typecheck/test/build sur PR. Cache des dependances. **A ecrire directement sur l'arborescence cible (apps/ + infra/) issue de REPO-14** pour eviter de re-cabler les chemins deux fois.
  - Fichiers : `.github/workflows/ci.yml` (+ jobs matrices ou par app).
  - DoD : une PR lance les jobs ; un echec de lint/test bloque le merge.
  - Dependances : **REPO-14 (restructuration faite d'abord, pour des chemins definitifs)**, domaines Tests. **Effort L — Phase 2 — P0.**
- **REPO-22 — Protection de branche + gating**
  - Description : exiger CI verte + review + scan gitleaks avant merge sur `main`.
  - DoD : merge impossible si CI rouge (preuve) ; regles documentees.
  - Dependances : REPO-21, REPO-05, REPO-11. **Effort S — Phase 2 — P0.**
- **REPO-23 — CD vers les environnements**
  - Description : pipeline de build/push d'images (ECR via OIDC, pas de creds statiques) et deploiement (Helm/kustomize) par env.
  - Fichiers : `.github/workflows/cd.yml`, `charts/`, `k8s/`.
  - DoD : un tag/merge sur `main` produit une image et un deploiement stage reproductible.
  - Dependances : REPO-21, REPO-06, REPO-20, domaine Infra. **Effort XL — Phase 4 — P1.**

#### EPIC G — Contrat d'API (OpenAPI source de verite)
*Objectif : une spec OpenAPI faisant foi, exposee et testee.*

- **REPO-24 — Brancher swagger-ui sur le backend**
  - Description : les libs `swagger-jsdoc`/`swagger-ui-express` sont installees mais **non utilisees** (0 occurrence dans `src/`). Generer la spec a partir d'annotations JSDoc et l'exposer sur `/api/docs` (non public en prod ou protege).
  - Fichiers : `src/config/swagger.ts` (nouveau), `src/server.ts`, `src/routes/*`.
  - DoD : `GET /api/docs` rend l'UI ; la spec couvre auth/wallet/investment/fund/news/admin.
  - Dependances : REPO-17. **Effort M — Phase 2 — P1.**
- **REPO-25 — OpenAPI comme contrat versionne + lint**
  - Description : exporter `openapi.json`/`yaml` dans le repo, le linter (spectral) en CI, le versionner avec l'API.
  - Fichiers : `docs/api/openapi.yaml`, `.spectral.yaml`, workflow CI.
  - DoD : spec valide en CI ; toute route ajoutee sans doc fait echouer le lint.
  - Dependances : REPO-24, REPO-21. **Effort M — Phase 3 — P2.**
- **REPO-26 — Generation de client typé pour web/mobile**
  - Description : generer un client TS (openapi-typescript / orval) consomme par `apps/web` et `apps/mobile`, remplacant les appels mock.
  - DoD : le frontend importe le client genere ; build typecheck OK.
  - Dependances : REPO-25, domaines Frontend/Mobile. **Effort L — Phase 3 — P2.**

#### EPIC H — Documentation et onboarding
*Objectif : un depot auto-explicatif.*

- **REPO-27 — README racine complet**
  - Description : remplacer le `README.md` d'une ligne par : description, architecture (monorepo, apps), prerequis, demarrage local (backend/web/mobile/db), variables d'env, liens vers docs.
  - DoD : un nouveau dev demarre les 3 apps en suivant uniquement le README.
  - Dependances : REPO-14, REPO-18. **Effort M — Phase 2 — P1.**
- **REPO-28 — CONTRIBUTING + guide d'onboarding**
  - Description : workflow git, conventions de commit/branches, process de PR, setup outils (husky, gitleaks).
  - Fichiers : `CONTRIBUTING.md`, `docs/onboarding.md`.
  - DoD : guide present et reference depuis le README ; coherent avec REPO-11/12.
  - Dependances : REPO-11, REPO-12. **Effort S — Phase 2 — P2.**
- **REPO-29 — Repertoire d'ADR**
  - Description : initialiser `docs/adr/` (template MADR), avec ADR-0001 (repo strategy), futurs ADR (branches, secrets, stack).
  - DoD : ≥ 1 ADR « Accepted » ; template present.
  - Dependances : REPO-13. **Effort S — Phase 2 — P2.**

#### EPIC I — Gestion des versions de dependances
*Objectif : dependances maitrisees, a jour et sans vulnerabilites.*

- **REPO-30 — Verrouillage et harmonisation des lockfiles**
  - Description : un seul gestionnaire (npm ou pnpm) ; lockfiles coherents par app/workspace ; supprimer les lockfiles orphelins.
  - Fichiers : `package-lock.json` (racine, frontend, mobile).
  - DoD : `npm ci` reproductible a la racine ; un seul type de lockfile.
  - Dependances : REPO-14. **Effort M — Phase 2 — P2.**
- **REPO-31 — Renovate/Dependabot + audit**
  - Description : automatiser les MAJ de deps (groupes, securite prioritaire) ; `npm audit`/`osv-scanner` en CI.
  - Fichiers : `renovate.json` ou `.github/dependabot.yml`, workflow CI.
  - DoD : PR de MAJ automatiques ouvertes ; vulnerabilites hautes bloquantes en CI.
  - Dependances : REPO-21. **Effort S — Phase 3 — P2.**
- **REPO-32 — Politique de versioning produit (semver + CHANGELOG)**
  - Description : aligner versions des apps (`afristocks-backend@1.0.0`, `frontend@0.1.0`, `mobile@0.0.1` sont incoherents), adopter semver et changelog automatique (Conventional Commits).
  - DoD : versions coherentes ; CHANGELOG genere a chaque release.
  - Dependances : REPO-12. **Effort M — Phase 4 — P2.**

---

### Graphe de dependances critiques (chemin a respecter)

```
REPO-00 (backup miroir + snapshot)   <-- PREMIER TICKET, bloque tout le destructif
   |
   +--> REPO-02 (untrack secrets) --> REPO-18 (.env.example)
   |
   +--> REPO-08 (consolider fev. 2026) --> REPO-09 (main a jour)
   |                                            |
   |                                            +--> REPO-03 (purge + force-push)   [BLOQUE PAR REPO-08 + REPO-09]
   |                                            +--> REPO-07 (remote canonique) --> REPO-10 (suppr. branches)
   |
   +--> REPO-13 (ADR repo) --> REPO-14 (workspaces, fenetre de gel) --> REPO-21 (CI) --> REPO-22 (gating)
                                                                                            |
REPO-04 (rotation) --(parallele de)--> REPO-03                                              +--> REPO-23 (CD)
```

**Invariant non negociable :** aucun `filter-repo`, `push --force`, `reset --hard`, `switch`/`checkout` destructif ni `remote remove` avant que **REPO-00, REPO-08 et REPO-09** soient Done.

---

### Risques specifiques au domaine
- **Perte du travail non committe (fev. 2026) lors d'une manip git destructive — RISQUE #1 :** l'arbre de travail (143 D / 25 M / 13 ??, dont `mobile/` et `src/routes/*.ts`) vit uniquement sur disque, sur une branche `restore-*`. Tout `reset`/`checkout`/`filter-repo`/force-push premature le detruit irreversiblement. **Mitigation imposee : REPO-00 (snapshot) puis REPO-08 (commit) AVANT tout destructif** (verrou de Phase 0).
- **Secrets deja exfiltrables :** la purge d'historique (REPO-03) ne « decompromet » pas les secrets ; sans rotation (REPO-04) prealable/parallele, le risque persiste. Tout secret passe par git/GitLab/GitHub doit etre considere comme public.
- **Perte de code lors du nettoyage des remotes/branches :** du travail unique peut vivre uniquement sur un remote GitLab ou une branche `*-split`/`restore*`. Toute suppression doit etre precedee d'un diff de refs et du clone miroir REPO-00.
- **Reecriture d'historique destructive :** `filter-repo` + force-push invalident tous les clones/forks ; necessite coordination, fenetre de maintenance et backup miroir REPO-00.
- **Restructuration en workspaces (REPO-14) — risque de big-bang et de re-travail CI :** casse simultanee des imports, Dockerfiles, CI et chemins K8s. Si menee en parallele de la CI ou du dev feature, elle genere des conflits de merge massifs et un double cablage des chemins. **Mitigation : operation atomique sur branche dediee, fenetre de gel 3-5 j, AVANT REPO-21 (CI) et APRES REPO-08, merge seulement CI verte.**
- **Doublon `backend/` dans l'index :** committer naivement l'etat disque pourrait reintroduire/laisser des incoherences ; la suppression doit etre explicite (REPO-08/REPO-17).

### Decisions a valider par le porteur du projet
1. **Mono-repo vs multi-repo :** recommandation = monorepo a workspaces (l'eclatement passe a deja produit le chaos de remotes/branches `*-split`). Trancher (REPO-13).
2. **Remote canonique :** confirmer `origin` GitHub `afristocks.git` comme unique source de verite et l'abandon des 3 remotes GitLab + remote `backend` (REPO-07).
3. **Domaine de production :** `afristocks.com` ou `afristocks.eu` ? (incoherence `ingress.yaml` vs `production-values.yaml`).
4. **Strategie de branches :** valider trunk-based (vs GitFlow) (REPO-11).
5. **Reecriture d'historique :** autoriser le force-push destructif sur `origin` apres backup miroir REPO-00 (REPO-03), en acceptant l'invalidation des clones existants.
6. **Gestionnaire de paquets :** npm (statu quo) ou migration pnpm pour les workspaces (REPO-30).
7. **Gestionnaire de secrets runtime :** K8s Secrets + SealedSecrets/ExternalSecrets vs AWS Secrets Manager (REPO-20).
8. **Sort du code non committe de fev. 2026 :** confirmer que l'etat disque actuel fait foi et doit etre consolide dans `main` (REPO-08/09).
9. **Fenetre de gel pour la restructuration en workspaces (REPO-14) :** valider un creneau dedie de 3-5 jours avec gel des merges feature, place avant la mise en place de la CI.
