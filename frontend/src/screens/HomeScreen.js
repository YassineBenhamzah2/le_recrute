import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../actions/userActions';
import './LandingPage.css';

const DEFAULT_FEATURED_OFFRES = [
  {
    _id: 'abb-01',
    titre: 'Guichetiers Chargés d’Opérations & Accueil Clientèle',
    entreprise: 'Al Barid Bank',
    sigle: 'ABB',
    secteur: 'Secteur Bancaire',
    ville: 'Réseau National (Toutes Régions)',
    niveau: 'Bac +2 / Diplôme TS',
    postes: 120,
    cloture: 'Dans 12 jours',
    urgent: true,
    color: '#003366',
    initials: 'ABB',
    logo: '/images/logos/abb_logo.png',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'cih-01',
    titre: 'Chargés de Clientèle Particuliers & Professionnels',
    entreprise: 'CIH Bank',
    sigle: 'CIH',
    secteur: 'Secteur Bancaire',
    ville: 'Casablanca, Rabat, Tanger',
    niveau: 'Bac +3 / Licence',
    postes: 25,
    cloture: 'Dans 6 jours',
    urgent: false,
    color: '#0084B6',
    initials: 'CIH',
    logo: '/images/logos/cih_logo.png',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'ocp-01',
    titre: 'Ingénieurs d’Exploitation Industrielle & Procédés Chimiques',
    entreprise: 'Groupe OCP',
    sigle: 'OCP',
    secteur: 'Industrie & Mines',
    ville: 'Jorf Lasfar, Khouribga, Benguerir',
    niveau: 'Bac +5 / Ingénieur d’État',
    postes: 30,
    cloture: 'Dans 14 jours',
    urgent: true,
    color: '#00875A',
    initials: 'OCP',
    logo: '/images/logos/ocp_logo.png',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'mef-01',
    titre: 'Inspecteurs des Finances & Cadres d’Administration',
    entreprise: 'Ministère de l’Économie et des Finances',
    sigle: 'MEF',
    secteur: 'Fonction Publique / Ministère',
    ville: 'Rabat (Administration Centrale)',
    niveau: 'Bac +5 / Master / Ingénieur',
    postes: 50,
    cloture: 'Dans 20 jours',
    urgent: false,
    color: '#1E293B',
    initials: 'MEF',
    logo: '/images/logos/mef_logo.png',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'boa-01',
    titre: 'Analystes Risques de Crédit & Engagements Bancaires',
    entreprise: 'Bank of Africa',
    sigle: 'BOA',
    secteur: 'Secteur Bancaire',
    ville: 'Casablanca Finance City',
    niveau: 'Bac +5 / Master / Ingénieur',
    postes: 15,
    cloture: 'Dans 18 jours',
    urgent: false,
    color: '#0055A5',
    initials: 'BOA',
    logo: '/images/logos/boa_logo.png',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'cdg-01',
    titre: 'Auditeurs Internes & Contrôleurs de Gestion Senior',
    entreprise: 'Caisse de Dépôt et de Gestion',
    sigle: 'CDG',
    secteur: 'Investissement & Prévoyance',
    ville: 'Rabat, Casablanca',
    niveau: 'Bac +5 / Master / ESC',
    postes: 10,
    cloture: 'Dans 25 jours',
    urgent: false,
    color: '#D97706',
    initials: 'CDG',
    logo: '/images/logos/cdg_logo.png',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
];

const STAGES_CYCLE = [
  {
    id: 0,
    code: '01',
    nom: 'Besoins',
    titre: 'Recueil des Besoins Budgétaires',
    desc: 'Les directions métiers et institutions partenaires expriment leurs besoins en compétences et fixent les quotas de postes budgétaires autorisés.',
    features: [
      'Identification des profils cibles et spécialités prioritaires',
      'Validation préalable des ouvertures budgétaires par l’institution',
      'Formalisation des critères d’éligibilité légale et académique',
    ],
    deliverable: 'Fiche d’opportunité et autorisation de concours validée.',
  },
  {
    id: 1,
    code: '02',
    nom: 'Concours',
    titre: 'Publication Officielle & Avis de Concours',
    desc: 'Émission de l’arrêté officiel de concours, publication du dossier d’appel à candidature et configuration de la grille de barème sur 100 points.',
    features: [
      'Diffusion multi-canale transparente des avis et délais légaux',
      'Publication du cahier des charges et des épreuves écrites / orales',
      'Paramétrage du barème de notation mathématique de sélection',
    ],
    deliverable: 'Avis officiel certifié et grille de barème transparente.',
  },
  {
    id: 2,
    code: '03',
    nom: 'Postulation',
    titre: 'Dépôt Numérique des Candidatures',
    desc: 'Les candidats s’inscrivent, renseignent leurs diplômes, notes, mentions et expériences, et téléversent leurs pièces justificatives numérisées.',
    features: [
      'Formulaire standardisé avec vérification des âges et diplômes',
      'Téléversement sécurisé de la CIN, du diplôme et des attestations',
      'Horodatage officiel et conformité aux normes CNDP (Loi 09-08)',
    ],
    deliverable: 'Dossier numérique complet et horodaté dans le registre.',
  },
  {
    id: 3,
    code: '04',
    nom: 'Audit',
    titre: 'Instruction & Contrôle des Pièces',
    desc: 'La commission de contrôle audite rigoureusement chaque pièce justificative (CIN, relevés, diplômes) avec zoom haute définition et validation motivée.',
    features: [
      'Vérification de l’authenticité des diplômes et des mentions',
      'Détection automatique des doublons ou des fausses déclarations',
      'Attribution du statut officiel : Dossier Conforme ou Rejeté motivé',
    ],
    deliverable: 'Rapport d’audit de conformité et validation de recevabilité.',
  },
  {
    id: 4,
    code: '05',
    nom: 'Barème',
    titre: 'Notation & Classement par le Mérite',
    desc: 'Le moteur algorithmique applique le barème officiel sur 100 points : note du diplôme, mention, expérience professionnelle et critères d’âge.',
    features: [
      'Calcul instantané et impartial du score sur 100 points',
      'Valorisation au prorata exact des mois d’expérience métier',
      'Classement ordonné automatisé sans intervention discrétionnaire',
    ],
    deliverable: 'Procès-verbal de classement général par ordre de mérite.',
  },
  {
    id: 5,
    code: '06',
    nom: 'Convocations',
    titre: 'Récépissés Certifiés & Convocations',
    desc: 'Génération du récépissé électronique infalsifiable avec QR Code de certification et convocation des meilleurs candidats aux épreuves.',
    features: [
      'Récépissé PDF officiel avec signature électronique et QR Code',
      'Notification des candidats retenus pour les épreuves d’admission',
      'Affectation définitive des lauréats aux postes institutionnels',
    ],
    deliverable: 'Convocation officielle sécurisée et arrêté d’affectation.',
  },
];

const ROLES_SPACES = [
  {
    id: 0,
    code: '01',
    nom: 'Candidat',
    subtitle: 'Postuler & Suivre.',
    title: 'Votre parcours de candidature en toute clarté.',
    desc: 'Consultez les concours ouverts de toutes les grandes institutions, postulez en quelques clics, téléversez vos pièces et téléchargez votre récépissé certifié horodaté.',
    missions: [
      'Catalogue unifié des concours bancaires, publics et industriels',
      'Calcul prévisionnel du score avec le simulateur de barème',
      'Téléchargement du récépissé officiel avec QR Code sécurisé',
    ],
    link: '/register',
    linkText: 'Créer mon dossier candidat',
  },
  {
    id: 1,
    code: '02',
    nom: 'Commission & Contrôleurs',
    subtitle: 'Auditer & Valider.',
    title: 'L’audit rigoureux des pièces justificatives.',
    desc: 'Examinez les dossiers déposés, zoomez sur les diplômes, cartes nationales et attestations de travail pour garantir l’exactitude de chaque note déclarée.',
    missions: [
      'Interface d’instruction rapide avec visionneuse PDF haute précision',
      'Contrôle de concordance entre relevés et notes déclarées',
      'Validation ou rejet motivé avec traçabilité administrative',
    ],
    link: '/login',
    linkText: 'Accéder à l’espace contrôle',
  },
  {
    id: 2,
    code: '03',
    nom: 'Recruteur Institutionnel',
    subtitle: 'Publier & Paramétrer.',
    title: 'Le pilotage direct des concours de votre institution.',
    desc: 'Publiez vos avis de concours, définissez vos barèmes de sélection personnalisés (Al Barid Bank, OCP, CIH...) et suivez vos candidats classés par ordre de mérite.',
    missions: [
      'Publication des arrêtés et définition des barèmes sur 100 points',
      'Classement automatique des candidats en temps réel selon le score',
      'Export Excel / CSV des listes des convoqués pour les commissions',
    ],
    link: '/maitre-ouvrage/candidatures',
    linkText: 'Entrer dans l’espace recruteur',
  },
  {
    id: 3,
    code: '04',
    nom: 'Direction RH',
    subtitle: 'Superviser & Décider.',
    title: 'La supervision macroscopique des flux nationaux.',
    desc: 'Consultez le tableau de bord décisionnel, analysez la répartition géographique et académique des candidats et contrôlez le taux d’avancement des commissions.',
    missions: [
      'Tableau de bord décisionnel avec statistiques d’inscriptions en temps réel',
      'Répartition académique des profils (Bac+2, Bac+3, Bac+5 Ingénieur)',
      'Suivi des flux d’instruction et des taux de conformité des dossiers',
    ],
    link: '/admin/dashboard',
    linkText: 'Consulter le tableau de bord',
  },
  {
    id: 4,
    code: '05',
    nom: 'Auditeur & Décideur',
    subtitle: 'Certifier & Affecter.',
    title: 'L’assurance d’une sélection irréprochable.',
    desc: 'Vérifiez la parfaite équité de traitement, l’absence de discrimination et le respect strict du mérite républicain avant validation des résultats définitifs.',
    missions: [
      'Vérification de la neutralité mathématique des barèmes',
      'Certification de conformité légale CNDP et protection des données',
      'Édition des procès-verbaux officiels d’admission et d’affectation',
    ],
    link: '/login',
    linkText: 'Explorer l’espace audit',
  },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [dbOffres, setDbOffres] = useState([]);
  const [activeStage, setActiveStage] = useState(0);
  const [activeRole, setActiveRole] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedEntFilter, setSelectedEntFilter] = useState('all');

  // Interactive Simulator
  const [simNiveau, setSimNiveau] = useState('bac3');
  const [simSpecialite, setSimSpecialite] = useState('bancaire');
  const [simMoyenne, setSimMoyenne] = useState('14.50');
  const [simExperienceMois, setSimExperienceMois] = useState(18);

  const calculatedScore = useMemo(() => {
    // 1. Diplôme
    const ptsDiplome = simNiveau === 'bac5' ? 20 : simNiveau === 'bac3' ? 20 : 12;
    // 2. Note
    const note = parseFloat(simMoyenne) || 12;
    let ptsNote = 0;
    if (note >= 16) ptsNote = 40;
    else if (note >= 14) ptsNote = 30;
    else if (note >= 12) ptsNote = 20;
    else ptsNote = 10;
    // 3. Mention
    const ptsMention = note >= 16 ? 15 : note >= 14 ? 12 : note >= 12 ? 8 : 3;
    // 4. Expérience (max 25 pts)
    const ptsExp = Math.min(25, (Number(simExperienceMois) || 0) * 0.65);
    const total = Math.min(100, Math.round((ptsDiplome + ptsNote + ptsMention + ptsExp) * 10) / 10);

    return {
      total,
      eligible: total >= 60,
      mention: note >= 16 ? 'Très Bien' : note >= 14 ? 'Bien' : note >= 12 ? 'Assez Bien' : 'Passable',
      percentage: total,
    };
  }, [simNiveau, simSpecialite, simMoyenne, simExperienceMois]);

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const { data } = await axios.get('/api/offres');
        if (Array.isArray(data) && data.length > 0) {
          setDbOffres(data);
        }
      } catch (err) {
        console.error('Erreur chargement des offres:', err);
      }
    };
    fetchOffres();
  }, []);

  const logoutHandler = () => {
    dispatch(logout());
  };

  const combinedOffres = useMemo(() => {
    if (dbOffres && dbOffres.length > 0) {
      return dbOffres.map((item, idx) => {
        let entName = 'Al Barid Bank';
        let entSigle = 'ABB';
        let entColor = '#003366';
        let entSecteur = item.secteur || 'Secteur Bancaire';

        if (item.entreprise) {
          if (typeof item.entreprise === 'object') {
            entName = item.entreprise.nom || item.entreprise.sigle || 'Al Barid Bank';
            entSigle = item.entreprise.sigle || 'ABB';
            entColor = item.entreprise.couleurPrimaire || '#003366';
            if (item.entreprise.secteur) entSecteur = item.entreprise.secteur;
          } else if (typeof item.entreprise === 'string') {
            entName = item.entrepriseNom || item.entreprise;
            entSigle = item.entrepriseSigle || 'ABB';
          }
        } else if (item.entrepriseNom) {
          entName = item.entrepriseNom;
          entSigle = item.entrepriseSigle || 'ABB';
          entColor = item.entrepriseCouleur || '#003366';
        }

        const safeInitials = String(entSigle || 'ABB').substring(0, 4).toUpperCase();
        const rawDate = item.dateLimite || item.dateFin;
        const clotureText = rawDate
          ? `Clôture : ${new Date(rawDate).toLocaleDateString('fr-FR')}`
          : 'En cours';

        return {
          _id: item._id || `db-${idx}`,
          titre: item.titre || item.title || 'Poste de Recrutement',
          entreprise: String(entName),
          sigle: String(entSigle),
          secteur: String(entSecteur),
          ville: item.ville || 'Réseau National',
          niveau: item.niveau || 'Bac +2 / Bac +3',
          postes: Number(item.postes) || 10,
          cloture: clotureText,
          urgent: (Number(item.postes) || 0) > 40,
          color: entColor,
          initials: safeInitials,
          logo: item.entrepriseLogo || (item.entreprise && item.entreprise.logo) || '',
          pdfUrl: item.pdfUrl || '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
        };
      });
    }

    return DEFAULT_FEATURED_OFFRES;
  }, [dbOffres]);

  const filteredOffres = useMemo(() => {
    return combinedOffres.filter((o) => {
      const matchKeyword =
        !searchKeyword ||
        o.titre.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        o.entreprise.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        o.secteur.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        o.ville.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchEnt =
        selectedEntFilter === 'all' ||
        o.sigle.toLowerCase() === selectedEntFilter.toLowerCase() ||
        o.entreprise.toLowerCase().includes(selectedEntFilter.toLowerCase());

      return matchKeyword && matchEnt;
    });
  }, [combinedOffres, searchKeyword, selectedEntFilter]);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', width: '100%' }}>
      {/* ====================================================================
          1. NAVIGATION HEADER (ref-nav)
          ==================================================================== */}
      <header className='ref-nav-container'>
        <div className='ref-nav-inner'>
          <Link to='/' className='ref-brand'>
            <span style={{ color: '#0F172A' }}>Recrutement</span><span>.ma</span>
            <span className='ref-brand-tag'>EHC Portail National</span>
          </Link>

          <nav className='ref-nav-menu'>
            <a href='#ref-vision' className='ref-nav-link'>La Plateforme</a>
            <a href='#ref-cycle' className='ref-nav-link'>Le Cycle</a>
            <a href='#ref-spaces' className='ref-nav-link'>Espaces Métier</a>
            <a href='#ref-offres' className='ref-nav-link'>Concours & Offres</a>
            <a href='#ref-budget' className='ref-nav-link'>Simulateur Barème</a>
            <a href='#ref-questions' className='ref-nav-link'>Repères</a>
          </nav>

          <div className='ref-nav-actions'>
            <button
              className='ref-search-pill'
              onClick={() => {
                const el = document.getElementById('search-input-ref');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              title='Rechercher un poste ou concours'
            >
              <i className='fas fa-search'></i>
              <span>Rechercher</span>
              <kbd style={{ fontSize: '10px', background: '#E2E8F0', padding: '1px 5px', borderRadius: '4px' }}>⌘K</kbd>
            </button>

            {userInfo ? (
              <>
                {userInfo.isAdmin ? (
                  <Link to='/admin/dashboard' className='ref-button ref-primary'>
                    <i className='fas fa-cogs'></i> Dashboard Admin
                  </Link>
                ) : userInfo.isMaitreOuvrage ? (
                  <Link to='/maitre-ouvrage/candidatures' className='ref-button ref-primary'>
                    <i className='fas fa-briefcase'></i> Espace Recruteur
                  </Link>
                ) : userInfo.isController ? (
                  <Link to='/controlleurs/dashboard' className='ref-button ref-primary'>
                    <i className='fas fa-user-shield'></i> Espace Contrôle
                  </Link>
                ) : (
                  <Link to='/profile' className='ref-button ref-primary'>
                    <i className='fas fa-user'></i> Mon Espace
                  </Link>
                )}
                <button
                  onClick={logoutHandler}
                  className='btn btn-sm btn-outline-danger'
                  style={{ borderRadius: '9999px', padding: '7px 12px' }}
                  title='Déconnexion'
                >
                  <i className='fas fa-sign-out-alt'></i>
                </button>
              </>
            ) : (
              <>
                <Link to='/login' className='ref-button ref-outline'>
                  Connexion
                </Link>
                <a href='#ref-offres' className='ref-button ref-primary'>
                  Explorer les concours <i className='fas fa-arrow-up-right-from-square ms-1'></i>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. HERO SECTION (ref-hero) — SOMBRE & NOBLE AVEC AMBIENT GLOW
          ==================================================================== */}
      <section className='ref-hero' id='ref-top'>
        <div className='ref-hero-glow'></div>

        <div className='ref-hero-frame'>
          <div className='ref-hero-hud'>
            <span>01 — L’ÉQUITÉ NATIONALE</span>
            <div className='ref-hero-hud-dots'>
              <i className='is-on'></i>
              <i className='is-on'></i>
              <i className=''></i>
            </div>
            <span>DU DÉPÔT À L’AFFECTATION</span>
          </div>

          <h1 className='ref-hero-title'>
            Un cycle complet. <em>Une sélection transparente.</em><br />
            Du dépôt de dossier <em>à l’affectation.</em>
          </h1>

          <p className='ref-hero-baseline'>
            Centralisation nationale des concours d’accès aux institutions bancaires et publiques. <strong>Garantie de mérite républicain, barèmes certifiés et récépissé numérique conforme CNDP.</strong>
          </p>

          <div className='ref-hero-actions'>
            <a href='#ref-offres' className='ref-button ref-primary'>
              Explorer les concours ouverts <i className='fas fa-arrow-up-right-from-square'></i>
            </a>
            <a href='#ref-budget' className='ref-button ref-outline'>
              <i className='fas fa-calculator me-1'></i> Simuler mon score barème
            </a>
          </div>

          <div className='ref-facts-strip'>
            <div className='ref-fact-item'>
              <div className='ref-fact-number'>6</div>
              <div className='ref-fact-label'>Étapes du Cycle Officiel</div>
            </div>
            <div className='ref-fact-item'>
              <div className='ref-fact-number'>5</div>
              <div className='ref-fact-label'>Espaces Métier Partagés</div>
            </div>
            <div className='ref-fact-item'>
              <div className='ref-fact-number'>100<span>%</span></div>
              <div className='ref-fact-label'>Conforme CNDP & Mérite</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. SECTION LA PLATEFORME (ref-vision ref-paper)
          ==================================================================== */}
      <section className='ref-paper-section' id='ref-vision'>
        <div className='ref-section-frame'>
          <div className='ref-section-top'>
            <span>LA PLATEFORME NATIONALE</span>
            <span>DU DOSSIER AU CLASSEMENT OFFICIEL</span>
          </div>

          <h2 className='ref-heading-luxury'>
            La plateforme relie les besoins, les concours officiels, l’instruction des pièces, la notation sur 100 points, les convocations et les affectations.
          </h2>

          <p className='ref-lead-text'>
            Candidats, commissions d’audit, recruteurs RH et auditeurs partagent un <span className='ref-accent-word'>cycle commun</span>, avec un espace adapté à leurs actions. Chaque acteur retrouve ses missions. <strong>Chaque dossier reste certifié et traçable.</strong>
          </p>

          {/* SENS DU PARCOURS (ref-impact) */}
          <div className='ref-impact-box'>
            <div className='ref-impact-header'>
              <div className='ref-impact-endpoint'>
                <small>DU DÉPÔT NUMÉRIQUE</small>
                <span>Un dossier <em>complet.</em></span>
              </div>
              <div className='ref-impact-endpoint text-end'>
                <small>À LA SÉLECTION OFFICIELLE</small>
                <span>Un barème <em>équitable.</em></span>
              </div>
            </div>

            <svg className='ref-thread-svg' viewBox='0 0 1000 60' preserveAspectRatio='none'>
              <path className='ref-thread-track' d='M 10 30 L 990 30' />
              <path className='ref-thread-signal' d='M 10 30 L 990 30' />
              <circle cx='15' cy='30' r='6' fill='#0284C7' />
              <circle cx='985' cy='30' r='6' fill='#0284C7' />
            </svg>

            <div className='d-flex justify-content-between align-items-center text-muted small mt-2'>
              <span>Horodatage officiel Loi 09-08</span>
              <span>100% Mérite & Barème Algorithmique</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. LE CYCLE DE RECRUTEMENT (ref-cycle) — 6 ÉTAPES INTERACTIVES
          ==================================================================== */}
      <section className='ref-paper-section alt-bg' id='ref-cycle'>
        <div className='ref-section-frame'>
          <div className='ref-section-top'>
            <span>LE CYCLE OFFICIEL DU RECRUTEMENT</span>
            <span>0{activeStage + 1} / 06</span>
          </div>

          <h2 className='ref-heading-luxury'>
            Le cycle. <em>De l’expression de besoin au recrutement.</em>
          </h2>

          <div className='ref-cycle-wrapper'>
            {/* TABS 01..06 */}
            <div className='ref-cycle-tabs'>
              {STAGES_CYCLE.map((st, idx) => (
                <button
                  key={st.id}
                  className={`ref-cycle-tab-btn ${activeStage === idx ? 'is-active' : ''}`}
                  onClick={() => setActiveStage(idx)}
                >
                  <span className='tab-num'>{st.code}</span>
                  <span className='tab-title'>{st.nom}</span>
                </button>
              ))}
            </div>

            {/* STAGE CONTENT */}
            <div className='ref-cycle-body'>
              <div>
                <p className='ref-cycle-eyebrow'>ÉTAPE {STAGES_CYCLE[activeStage].code} — {STAGES_CYCLE[activeStage].nom.toUpperCase()}</p>
                <h3 className='ref-cycle-stage-title'>
                  {STAGES_CYCLE[activeStage].titre}
                </h3>
                <p className='ref-cycle-desc'>
                  {STAGES_CYCLE[activeStage].desc}
                </p>

                <ul className='ref-cycle-features'>
                  {STAGES_CYCLE[activeStage].features.map((feat, fIdx) => (
                    <li key={fIdx}>
                      <i className='fas fa-check-circle'></i>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <a href='#ref-offres' className='ref-button ref-primary'>
                  Explorer cette étape <i className='fas fa-arrow-up-right-from-square ms-1'></i>
                </a>
              </div>

              <div>
                <div className='ref-cycle-deliverable'>
                  <small>CE QUE CETTE ÉTAPE PRODUIT</small>
                  <h4>{STAGES_CYCLE[activeStage].deliverable}</h4>
                  <p>Tous les éléments produits sont archivés et consultables dans l’espace dédié des auditeurs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. LES ESPACES MÉTIER (ref-spaces) — 5 REGARDS
          ==================================================================== */}
      <section className='ref-paper-section' id='ref-spaces'>
        <div className='ref-section-frame'>
          <div className='ref-section-top'>
            <span>LES ESPACES MÉTIER</span>
            <span>CINQ REGARDS. UN MÊME CYCLE.</span>
          </div>

          <h2 className='ref-heading-luxury'>
            Votre rôle. <em>Votre mouvement dans la sélection.</em>
          </h2>

          <div className='ref-spaces-layout'>
            {/* REGARD SELECTOR */}
            <div className='ref-spaces-sidebar'>
              {ROLES_SPACES.map((r, idx) => (
                <button
                  key={r.id}
                  className={`ref-space-btn ${activeRole === idx ? 'is-active' : ''}`}
                  onClick={() => setActiveRole(idx)}
                >
                  <div className='d-flex align-items-center'>
                    <span className='num'>{r.code}</span>
                    <div>
                      <span className='name'>{r.nom}</span>
                      <small>{r.subtitle}</small>
                    </div>
                  </div>
                  <i className='fas fa-arrow-right text-muted' style={{ fontSize: '12px' }}></i>
                </button>
              ))}
            </div>

            {/* SPACE PANEL */}
            <div className='ref-space-content-card'>
              <p className='ref-cycle-eyebrow'>ESPACE 0{activeRole + 1} — {ROLES_SPACES[activeRole].nom.toUpperCase()}</p>
              <h3>{ROLES_SPACES[activeRole].title}</h3>
              <p className='ref-lead-text' style={{ fontSize: '15px' }}>
                {ROLES_SPACES[activeRole].desc}
              </p>

              <ul className='ref-space-missions'>
                {ROLES_SPACES[activeRole].missions.map((m, mIdx) => (
                  <li key={mIdx}>
                    <i className='fas fa-check text-primary'></i>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>

              <Link to={ROLES_SPACES[activeRole].link} className='ref-button ref-primary'>
                {ROLES_SPACES[activeRole].linkText} <i className='fas fa-arrow-up-right-from-square ms-1'></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. CONCOURS & OFFRES ACTIVES (SHOWCASE)
          ==================================================================== */}
      <section className='ref-paper-section alt-bg' id='ref-offres'>
        <div className='ref-section-frame'>
          <div className='ref-section-top'>
            <span>CONCOURS NATIONAUX OUVERTS</span>
            <span>{filteredOffres.length} OFFRE(S) DISPONIBLE(S)</span>
          </div>

          <h2 className='ref-heading-luxury'>
            Postulez aux concours officiels. <em>Al Barid Bank, OCP, CIH, MEF...</em>
          </h2>

          {/* FILTERS & SEARCH */}
          <div className='ref-filters-strip'>
            <div className='ref-pill-filters'>
              <button
                className={`ref-pill-btn ${selectedEntFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setSelectedEntFilter('all')}
              >
                Tous les Organismes
              </button>
              <button
                className={`ref-pill-btn ${selectedEntFilter === 'abb' ? 'is-active' : ''}`}
                onClick={() => setSelectedEntFilter('abb')}
              >
                Al Barid Bank
              </button>
              <button
                className={`ref-pill-btn ${selectedEntFilter === 'ocp' ? 'is-active' : ''}`}
                onClick={() => setSelectedEntFilter('ocp')}
              >
                Groupe OCP
              </button>
              <button
                className={`ref-pill-btn ${selectedEntFilter === 'cih' ? 'is-active' : ''}`}
                onClick={() => setSelectedEntFilter('cih')}
              >
                CIH Bank
              </button>
              <button
                className={`ref-pill-btn ${selectedEntFilter === 'mef' ? 'is-active' : ''}`}
                onClick={() => setSelectedEntFilter('mef')}
              >
                Ministère Finances
              </button>
              <button
                className={`ref-pill-btn ${selectedEntFilter === 'boa' ? 'is-active' : ''}`}
                onClick={() => setSelectedEntFilter('boa')}
              >
                Bank of Africa
              </button>
            </div>

            <div className='ref-search-input-box'>
              <i className='fas fa-search text-muted'></i>
              <input
                id='search-input-ref'
                type='text'
                placeholder='Rechercher par poste, ville...'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <i className='fas fa-times'></i>
                </button>
              )}
            </div>
          </div>

          {/* OFFRES GRID */}
          <div className='ref-offres-grid'>
            {filteredOffres.map((offre) => (
              <div key={offre._id} className='ref-offre-card'>
                <div>
                  <div className='ref-offre-top'>
                    <div className='ref-ent-brand'>
                      <div className='ref-ent-logo-badge' style={{ background: offre.color }}>
                        {offre.logo ? (
                          <img
                            src={offre.logo}
                            alt={offre.sigle}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : null}
                        <span>{offre.initials}</span>
                      </div>
                      <div className='ref-ent-info'>
                        <small>{offre.secteur}</small>
                        <strong>{offre.entreprise}</strong>
                      </div>
                    </div>
                    {offre.urgent && (
                      <span className='badge bg-danger bg-opacity-10 text-danger fw-bold border border-danger border-opacity-25 px-2 py-1'>
                        Prioritaire
                      </span>
                    )}
                  </div>

                  <h3 className='ref-offre-title'>{offre.titre}</h3>

                  <div className='ref-offre-meta'>
                    <span className='ref-meta-tag'>
                      <i className='fas fa-map-marker-alt text-primary me-1'></i> {offre.ville}
                    </span>
                    <span className='ref-meta-tag'>
                      <i className='fas fa-graduation-cap text-success me-1'></i> {offre.niveau}
                    </span>
                    <span className='ref-meta-tag'>
                      <i className='fas fa-users text-dark me-1'></i> {offre.postes} Postes
                    </span>
                  </div>
                </div>

                <div className='ref-offre-footer'>
                  <span className='ref-cloture-hint'>
                    <i className='far fa-clock me-1 text-warning'></i> {offre.cloture}
                  </span>
                  <div className='d-flex gap-2'>
                    {offre.pdfUrl && (
                      <a
                        href={offre.pdfUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='btn btn-sm btn-outline-secondary'
                        style={{ borderRadius: '9999px', fontSize: '12px' }}
                        title='Voir l’Avis officiel PDF'
                      >
                        <i className='fas fa-file-pdf'></i> Avis
                      </a>
                    )}
                    <Link
                      to={userInfo ? `/poste/${encodeURIComponent(offre.titre)}` : '/login'}
                      className='ref-button ref-primary'
                      style={{ padding: '6px 16px', fontSize: '13px' }}
                    >
                      Postuler <i className='fas fa-arrow-up-right-from-square'></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. SIMULATEUR DE BARÈME (ref-budget / GAUGE SAAS)
          ==================================================================== */}
      <section className='ref-paper-section' id='ref-budget'>
        <div className='ref-section-frame'>
          <div className='ref-section-top'>
            <span>SIMULATEUR DE BARÈME EN DIRECT</span>
            <span>NOTATION MATHÉMATIQUE SUR 100 POINTS</span>
          </div>

          <h2 className='ref-heading-luxury'>
            Simulez votre score. <em>Estimez votre admissibilité en temps réel.</em>
          </h2>

          <div className='ref-sim-card'>
            <div>
              <p className='ref-lead-text' style={{ fontSize: '15px', marginBottom: '24px' }}>
                Testez vos chances avant de postuler. Le barème officiel prend en compte votre niveau d’études, votre note moyenne, votre mention et vos mois d’expérience métier.
              </p>

              <div className='row g-3'>
                <div className='col-md-6'>
                  <label className='fw-bold small text-muted mb-1'>Niveau de Diplôme</label>
                  <select
                    className='form-select fw-semibold'
                    value={simNiveau}
                    onChange={(e) => setSimNiveau(e.target.value)}
                  >
                    <option value='bac2'>Bac +2 / Diplôme TS (12 pts)</option>
                    <option value='bac3'>Bac +3 / Licence (20 pts)</option>
                    <option value='bac5'>Bac +5 / Master / Ingénieur (20 pts)</option>
                  </select>
                </div>

                <div className='col-md-6'>
                  <label className='fw-bold small text-muted mb-1'>Moyenne Générale (/20)</label>
                  <input
                    type='number'
                    step='0.25'
                    min='10'
                    max='20'
                    className='form-control fw-semibold'
                    value={simMoyenne}
                    onChange={(e) => setSimMoyenne(e.target.value)}
                  />
                </div>

                <div className='col-md-6'>
                  <label className='fw-bold small text-muted mb-1'>Expérience Métier (Mois)</label>
                  <input
                    type='number'
                    min='0'
                    max='60'
                    className='form-control fw-semibold'
                    value={simExperienceMois}
                    onChange={(e) => setSimExperienceMois(e.target.value)}
                  />
                </div>

                <div className='col-md-6'>
                  <label className='fw-bold small text-muted mb-1'>Spécialité Demandée</label>
                  <select
                    className='form-select fw-semibold'
                    value={simSpecialite}
                    onChange={(e) => setSimSpecialite(e.target.value)}
                  >
                    <option value='bancaire'>Spécialité Directe (Bancaire / Audit)</option>
                    <option value='autre'>Autre Domaine Tertiaire / Général</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GAUGE COMPASS */}
            <div className='ref-gauge-box'>
              <div
                className='ref-gauge-circle'
                style={{
                  borderTopColor: calculatedScore.eligible ? '#10B981' : '#F59E0B',
                  borderRightColor: calculatedScore.eligible ? '#10B981' : '#F59E0B',
                }}
              >
                <div className='ref-gauge-score'>{calculatedScore.total}</div>
                <div className='ref-gauge-max'>SUR 100 POINTS</div>
              </div>

              <div className='fw-bold text-dark mb-1'>
                Mention : <span className='text-primary'>{calculatedScore.mention}</span>
              </div>
              <div className='small text-muted mb-3'>
                {calculatedScore.eligible ? (
                  <span className='text-success fw-bold'>
                    <i className='fas fa-check-circle me-1'></i> Profil Fortement Compétitif
                  </span>
                ) : (
                  <span className='text-warning fw-bold'>
                    <i className='fas fa-info-circle me-1'></i> Admissible sous conditions
                  </span>
                )}
              </div>

              <a href='#ref-offres' className='ref-button ref-primary' style={{ fontSize: '13px' }}>
                Postuler avec ce profil <i className='fas fa-arrow-up-right-from-square ms-1'></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. QUESTIONS FRÉQUENTES (ref-questions)
          ==================================================================== */}
      <section className='ref-paper-section alt-bg' id='ref-questions'>
        <div className='ref-section-frame'>
          <div className='ref-section-top'>
            <span>LES REPÈRES AVANT DE POSTULER</span>
            <span>QUATRE QUESTIONS. LE CHEMIN SE PRÉCISE.</span>
          </div>

          <h2 className='ref-heading-luxury'>
            Questions fréquentes. <em>En toute transparence.</em>
          </h2>

          <div className='ref-faq-grid'>
            <div className='ref-faq-card'>
              <div className='ref-faq-num'>01 / CONFORMITÉ LÉGALE</div>
              <h4>Le récépissé avec QR Code fait-il foi juridiquement ?</h4>
              <p>Oui. Chaque récépissé généré est certifié, horodaté et conforme à la loi 09-08 relative à la protection des données à caractère personnel (CNDP). Le QR Code permet une vérification instantanée de l’authenticité du dépôt.</p>
            </div>

            <div className='ref-faq-card'>
              <div className='ref-faq-num'>02 / CALCUL DU BARÈME</div>
              <h4>Comment sont comptabilisées mes expériences si je suis toujours en poste ?</h4>
              <p>Il suffit de cocher l’option <strong>"Poste actuel (Toujours en poste)"</strong> lors de votre postulation. Notre moteur algorithmique calcule automatiquement votre expérience en mois jusqu’au jour du concours.</p>
            </div>

            <div className='ref-faq-card'>
              <div className='ref-faq-num'>03 / VÉRIFICATION DES PIÈCES</div>
              <h4>Que se passe-t-il si une note déclarée ne correspond pas au relevé ?</h4>
              <p>Les auditeurs de la commission effectuent un contrôle visuel à l’écran de vos relevés originaux. En cas d’écart non justifié, la note est réajustée selon la pièce officielle et le score est recalculé.</p>
            </div>

            <div className='ref-faq-card'>
              <div className='ref-faq-num'>04 / CONVOCATIONS</div>
              <h4>Quand et comment serai-je informé de mon admission ?</h4>
              <p>Dès l’audit final des dossiers par la commission, les listes des candidats classés par ordre de mérite sont publiées et les convocations officielles avec date et centre d’examen sont disponibles dans votre espace personnel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. FOOTER DE HAUTE PRÉCISION (ref-footer)
          ==================================================================== */}
      <footer className='ref-footer'>
        <div className='ref-footer-inner'>
          <div>
            <div className='ref-footer-brand'>
              Recrutement<span>.ma</span>
            </div>
            <p style={{ maxWidth: '360px', lineHeight: '1.6', fontSize: '13.5px' }}>
              Portail National de Recrutement et de Gestion des Concours d’Accès aux Institutions Bancaires, Établissements Publics et Organismes Financiers au Maroc.
            </p>
            <div className='small text-muted mt-3'>
              <i className='fas fa-shield-alt text-success me-2'></i>
              Système certifié conforme Loi 09-08 (CNDP)
            </div>
          </div>

          <div className='ref-footer-col'>
            <h5>La Plateforme</h5>
            <a href='#ref-vision'>Notre Vision</a>
            <a href='#ref-cycle'>Le Cycle Officiel</a>
            <a href='#ref-spaces'>Les Espaces Métier</a>
            <a href='#ref-budget'>Simulateur Barème</a>
          </div>

          <div className='ref-footer-col'>
            <h5>Institutions</h5>
            <a href='#ref-offres'>Al Barid Bank</a>
            <a href='#ref-offres'>Groupe OCP</a>
            <a href='#ref-offres'>CIH Bank</a>
            <a href='#ref-offres'>Ministère des Finances</a>
            <a href='#ref-offres'>Bank of Africa</a>
            <a href='#ref-offres'>Caisse de Dépôt et Gestion</a>
          </div>

          <div className='ref-footer-col'>
            <h5>Accès Rapide</h5>
            <Link to='/login'>Connexion Espace Recruteur</Link>
            <Link to='/login'>Espace Commission Audit</Link>
            <Link to='/register'>Créer Dossier Candidat</Link>
            <a href='#ref-questions'>Assistance & FAQ</a>
          </div>
        </div>

        <div className='ref-footer-bottom'>
          <span>© 2026 EHC Experts Human Capital — Portail National Recrutement.ma</span>
          <span>TOUS DROITS RÉSERVÉS · CONFORME CNDP</span>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
