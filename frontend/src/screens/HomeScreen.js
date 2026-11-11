import React, { useEffect, useState, useMemo, useRef } from 'react';
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
    logo: '/images/logos/abb_logo.png',
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
    logo: '/images/logos/cih_logo.png',
  },
  {
    _id: 'ocp-01',
    titre: 'Ingénieurs d’Exploitation Industrielle & Procédés',
    entreprise: 'Groupe OCP',
    sigle: 'OCP',
    secteur: 'Industrie & Mines',
    ville: 'Jorf Lasfar, Khouribga, Benguerir',
    niveau: 'Bac +5 / Ingénieur d’État',
    postes: 30,
    cloture: 'Dans 14 jours',
    urgent: true,
    logo: '/images/logos/ocp_logo.png',
  },
  {
    _id: 'mef-01',
    titre: 'Inspecteurs des Finances & Cadres d’Administration',
    entreprise: 'Ministère de l’Économie et des Finances',
    sigle: 'MEF',
    secteur: 'Administration Publique',
    ville: 'Rabat (Administration Centrale)',
    niveau: 'Bac +5 / Master / DESA',
    postes: 45,
    cloture: 'Dans 18 jours',
    urgent: false,
    logo: '/images/logos/mef_logo.png',
  },
  {
    _id: 'boa-01',
    titre: 'Analystes Risques de Crédit & Financement Entreprises',
    entreprise: 'Bank of Africa (BMCE)',
    sigle: 'BOA',
    secteur: 'Secteur Bancaire',
    ville: 'Casablanca (Siège)',
    niveau: 'Bac +5 / Master Finance',
    postes: 15,
    cloture: 'Dans 8 jours',
    urgent: true,
    logo: '/images/logos/boa_logo.png',
  },
  {
    _id: 'cdg-01',
    titre: 'Gestionnaires de Portefeuille & Investissements',
    entreprise: 'Caisse de Dépôt et de Gestion',
    sigle: 'CDG',
    secteur: 'Organisme Financier Public',
    ville: 'Rabat & Casablanca',
    niveau: 'Bac +5 / Grande École',
    postes: 10,
    cloture: 'Dans 21 jours',
    urgent: false,
    logo: '/images/logos/cdg_logo.png',
  },
];

const CYCLE_STAGES = [
  {
    num: '01',
    title: 'Recueil & Définition des Besoins',
    short: 'Besoins',
    role: 'Direction RH & Établissements',
    desc: 'Les établissements recruteurs formalisent les postes ouverts, les profils requis, les spécialités et le barème officiel de notation.',
    points: [
      'Identification des postes budgétaires et des compétences cibles',
      'Configuration du barème officiel : diplômes, mentions, expériences',
      'Validation juridique de la conformité statutaire du concours',
    ],
  },
  {
    num: '02',
    title: 'Publication Officielle du Concours',
    short: 'Concours',
    role: 'Maître d’Ouvrage / Recruteur',
    desc: 'Lancement public avec publication des avis officiels, dates d’ouverture et de clôture, et critères d’admissibilité stricts.',
    points: [
      'Génération automatique de l’avis de recrutement certifié',
      'Diffusion multi-canal et ouverture de la plateforme numérique',
      'Affichage des dates limites et des pièces justificatives exigées',
    ],
  },
  {
    num: '03',
    title: 'Dépôt Numérique & Récépissé Horodaté',
    short: 'Dépôt',
    role: 'Candidat (National)',
    desc: 'Le candidat remplit son dossier (Bac, diplômes, expériences, pièces scannées) et reçoit un récépissé numérique infalsifiable.',
    points: [
      'Saisie intuitive des données académiques et professionnelles',
      'Téléversement des pièces justificatives en haute définition',
      'Délivrance d’un récépissé horodaté conforme Loi 09-08 (CNDP)',
    ],
  },
  {
    num: '04',
    title: 'Audit Visuel des Pièces par la Commission',
    short: 'Audit',
    role: 'Commission d’Audit & Contrôleurs',
    desc: 'Interface écran scindé où les membres de la commission comparent chaque note et date déclarée avec le document original officiel.',
    points: [
      'Contrôle visuel pièce par pièce (CIN, Relevés de notes, Attestations)',
      'Possibilité de rectification immédiate des notes en cas de coquille',
      'Statuts de contrôle en temps réel : Conforme, Rejeté ou Complément',
    ],
  },
  {
    num: '05',
    title: 'Classement par Barème Algorithmique',
    short: 'Barème',
    role: 'Moteur de Scoring Dynamique',
    desc: 'Calcul automatisé transparent sur 100 points : diplôme, mentions, ancienneté, et établissement d’origine.',
    points: [
      'Application stricte du barème validé sans intervention humaine',
      'Classement instantané des candidats par ordre de mérite républicain',
      'Génération des listes principales et des listes d’attente',
    ],
  },
  {
    num: '06',
    title: 'Convocations Officielles & Affectations',
    short: 'Convocations',
    role: 'Direction RH & Centres d’Examen',
    desc: 'Édition des convocations nominatives avec centre d’examen, salle et QR-Code de sécurité pour les épreuves écrites et orales.',
    points: [
      'Téléchargement immédiat de la convocation dans l’espace candidat',
      'Émargement numérique par QR-Code le jour des épreuves',
      'Publication des résultats définitifs et suivi de l’affectation',
    ],
  },
];

const ROLES_DATA = [
  {
    id: 'candidat',
    name: 'Candidat',
    tag: 'Postuler & Suivre',
    title: 'Votre candidature. Au même endroit.',
    desc: 'Créez votre dossier unique, téléversez vos justificatifs, simulez votre note et suivez l’avancement de votre candidature en temps réel.',
    items: [
      'Dépôt numérique sécurisé et récépissé officiel avec horodatage',
      'Calcul immédiat de l’ancienneté d’expérience (même en poste actuel)',
      'Téléchargement de la convocation officielle avec centre d’examen',
    ],
    folioTitle: 'Mon dossier.',
    steps: [
      { num: '01', title: 'Concours', desc: 'Explorer les offres nationales et vérifier l’éligibilité.' },
      { num: '02', title: 'Dossier', desc: 'Saisir Bac, diplômes, expériences et pièces jointes.' },
      { num: '03', title: 'Résultats', desc: 'Suivre le score d’audit et télécharger sa convocation.' },
    ],
  },
  {
    id: 'commission',
    name: 'Commission d’Audit',
    tag: 'Contrôler & Valider',
    title: 'L’instruction des pièces. Écran scindé.',
    desc: 'Un espace dédié aux auditeurs pour comparer chaque note déclarée avec le document original scanné par le candidat sans quitter l’écran.',
    items: [
      'Visualiseur PDF haute fidélité avec zoom et rotation intégrés',
      'Ajustement instantané de la note si le relevé officiel diffère',
      'Validation, rejet motivé ou demande de complément en 1 clic',
    ],
    folioTitle: 'Instruction.',
    steps: [
      { num: '01', title: 'Affectation', desc: 'Dossiers répartis équitablement entre les contrôleurs.' },
      { num: '02', title: 'Vérification', desc: 'Audit visuel de la conformité des diplômes et relevés.' },
      { num: '03', title: 'Certification', desc: 'Signature numérique du rapport d’instruction.' },
    ],
  },
  {
    id: 'recruteur',
    name: 'Recruteur RH',
    tag: 'Piloter les Concours',
    title: 'Maîtrise d’Ouvrage des Concours.',
    desc: 'Créez vos concours au nom de votre institution (Al Barid Bank, OCP, CIH, MEF...), définissez le barème et suivez les inscriptions.',
    items: [
      'Choix officiel de l’institution mandataire et du secteur d’activité',
      'Paramétrage fin des coefficients de notation (études, mention, stages)',
      'Export des listes officielles pour affichage réglementaire',
    ],
    folioTitle: 'Gestion.',
    steps: [
      { num: '01', title: 'Création', desc: 'Paramétrage du concours et du cahier des charges.' },
      { num: '02', title: 'Inscriptions', desc: 'Suivi du flux des candidatures et du taux de complétude.' },
      { num: '03', title: 'Arrêté', desc: 'Validation définitive des listes des admissibles.' },
    ],
  },
  {
    id: 'direction',
    name: 'Direction RH',
    tag: 'Superviser & Décider',
    title: 'Pilotage Stratégique National.',
    desc: 'Vue d’ensemble sur l’équité régionale, la répartition des profils, la parité et les taux d’admissibilité par académie et université.',
    items: [
      'Tableaux de bord consolidés avec télémétrie en temps réel',
      'Statistiques de répartition géographique et par genre',
      'Contrôle qualité sur l’ensemble des commissions régionales',
    ],
    folioTitle: 'Pilotage.',
    steps: [
      { num: '01', title: 'Vue Globale', desc: 'Indicateurs clés et volumétrie nationale des candidats.' },
      { num: '02', title: 'Équité', desc: 'Veille sur le respect strict du mérite républicain.' },
      { num: '03', title: 'Bilan', desc: 'Rapports finaux d’admission pour les conseils d’administration.' },
    ],
  },
  {
    id: 'auditeur',
    name: 'Auditeur Externe',
    tag: 'Certifier & Tracer',
    title: 'Audit & Conformité CNDP.',
    desc: 'Traçabilité complète des logs, des modifications de notes et des accès aux dossiers selon les exigences de la Loi 09-08.',
    items: [
      'Piste d’audit infalsifiable avec horodatage cryptographique SHA-256',
      'Journal exhaustif de chaque modification de note par la commission',
      'Conformité totale avec les préconisations de la CNDP',
    ],
    folioTitle: 'Conformité.',
    steps: [
      { num: '01', title: 'Traçabilité', desc: 'Enregistrement de chaque action d’audit horodatée.' },
      { num: '02', title: 'Contrôle', desc: 'Vérification de l’absence de favoritisme ou de biais.' },
      { num: '03', title: 'Certification', desc: 'Émission du certificat de conformité légale du concours.' },
    ],
  },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // User state
  const userLogin = useSelector((state) => state.userLogin) || {};
  const { userInfo } = userLogin;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSigle, setSelectedSigle] = useState('ALL');
  const [offres, setOffres] = useState(DEFAULT_FEATURED_OFFRES);

  // Cycle Orbit state
  const [activeCycleIndex, setActiveCycleIndex] = useState(0);

  // Espaces Métier state
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  // Simulator state
  const [simNiveau, setSimNiveau] = useState('bac5');
  const [simMention, setSimMention] = useState('bien');
  const [simExp, setSimExp] = useState(3);

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // Custom Cursor
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorHovered, setCursorHovered] = useState(false);

  // Particle Canvas Ref
  const canvasRef = useRef(null);

  // 1. Fetch Offres from API if available
  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const { data } = await axios.get('/api/offres');
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item, idx) => ({
            _id: item._id || `off-${idx}`,
            titre: item.intitule || item.titre || 'Poste à pourvoir',
            entreprise: item.entreprise || 'Institution Partenaire',
            sigle: (item.entreprise || 'ABB').split(' ')[0],
            secteur: item.secteur || 'Secteur Public / Bancaire',
            ville: item.lieu || 'Réseau National',
            niveau: item.niveau || 'Bac +2 à Bac +5',
            postes: item.nombrePostes || 10,
            cloture: 'En cours',
            urgent: idx % 2 === 0,
            logo: '/images/logos/abb_logo.png',
          }));
          setOffres(mapped);
        }
      } catch (e) {
        // Fallback to default
        setOffres(DEFAULT_FEATURED_OFFRES);
      }
    };
    fetchOffres();
  }, []);

  // 2. Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Custom Cursor Tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      if (!cursorVisible) setCursorVisible(true);
    };

    const handleMouseLeave = () => setCursorVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Watch hover on interactive elements
    const handleOver = (e) => {
      const target = e.target.closest('a, button, input, select, .ref-clickable, [role="button"]');
      setCursorHovered(!!target);
    };

    document.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleOver);
    };
  }, [cursorVisible]);

  // 4. Auto-Cycle Orbit Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCycleIndex((prev) => (prev + 1) % CYCLE_STAGES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // 5. Interactive Particle Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create particles
    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let mouse = { x: -1000, y: -1000 };
    const handleCanvasMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleCanvasMouse);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interaction with mouse
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 130) {
          p.x -= (dxMouse / distMouse) * 0.8;
          p.y -= (dyMouse / distMouse) * 0.8;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(25, 179, 194, ${p.alpha})`;
        ctx.shadowColor = 'rgba(127, 219, 227, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();

        // Connect with nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(127, 219, 227, ${0.16 * (1 - dist / 115)})`;
            ctx.lineWidth = 0.8;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleCanvasMouse);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Filtered Offres
  const filteredOffres = useMemo(() => {
    return offres.filter((item) => {
      const matchSearch =
        item.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ville.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSigle = selectedSigle === 'ALL' || item.sigle === selectedSigle;
      return matchSearch && matchSigle;
    });
  }, [offres, searchTerm, selectedSigle]);

  // Simulator Score Calculation
  const simScore = useMemo(() => {
    let score = 0;
    // Diplome
    if (simNiveau === 'bac2') score += 25;
    else if (simNiveau === 'bac3') score += 35;
    else if (simNiveau === 'bac5') score += 45;
    else if (simNiveau === 'doctorat') score += 50;

    // Mention
    if (simMention === 'passable') score += 8;
    else if (simMention === 'assez_bien') score += 14;
    else if (simMention === 'bien') score += 18;
    else if (simMention === 'tres_bien') score += 20;

    // Experience (3 pts per year, max 30)
    score += Math.min(Number(simExp) * 3, 30);

    return Math.min(score, 100);
  }, [simNiveau, simMention, simExp]);

  // Radius for Gauge SVG: 130 -> Circumference = 2 * PI * 130 ≈ 816.8
  const gaugeCircumference = 2 * Math.PI * 130;
  const gaugeDashoffset = gaugeCircumference - (gaugeCircumference * simScore) / 100;

  const handleLogout = () => {
    dispatch(logout());
  };

  const currentRole = ROLES_DATA[activeRoleIndex];
  const currentStage = CYCLE_STAGES[activeCycleIndex];

  return (
    <div className='reference'>
      {/* 0. Top Glowing Scroll Progress */}
      <div className='ref-progress' style={{ transform: `scaleX(${scrollProgress})` }} />

      {/* 0. Custom Magnetic Cursor */}
      <div
        className='ref-cursor'
        data-visible={cursorVisible ? 'true' : 'false'}
        data-action={cursorHovered ? 'true' : 'false'}
        style={{ transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)` }}
      >
        <span>{cursorHovered ? '↗' : ''}</span>
      </div>

      {/* ====================================================================
          1. STICKY NAVBAR ULTRA-FLUIDE
          ==================================================================== */}
      <header className='ref-nav'>
        <Link to='/' className='ref-brand'>
          Recrutement<span>.ma</span>
        </Link>

        <nav className='ref-nav-links'>
          <a href='#ref-vision'>Vision</a>
          <a href='#ref-relay'>Le Cycle Radar</a>
          <a href='#ref-spaces'>Espaces Métier</a>
          <a href='#ref-offres'>Concours Ouverts</a>
          <a href='#ref-budget'>Simulateur</a>
          <a href='#ref-questions'>FAQ</a>
        </nav>

        <div className='ref-nav-actions'>
          <div className='ref-hud-pill d-none d-lg-inline-flex'>
            <span className='ref-dot-pulse'></span>
            <span>CNDP CERTIFIÉ</span>
          </div>

          <a href='#ref-offres' className='ref-search-button'>
            <i className='fas fa-search'></i>
            <span>⌘K</span>
          </a>

          {userInfo ? (
            <div className='d-flex align-items-center gap-2'>
              {userInfo.isAdministrateur ? (
                <button
                  onClick={() => navigate('/administrateur/candidatures')}
                  className='ref-button ref-button-outline'
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '10px' }}
                >
                  <i className='fas fa-shield-alt me-1'></i> Admin
                </button>
              ) : userInfo.isMaitreOuvrage ? (
                <button
                  onClick={() => navigate('/maitre-ouvrage/candidatures')}
                  className='ref-button ref-button-outline'
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '10px' }}
                >
                  <i className='fas fa-building me-1'></i> Recruteur
                </button>
              ) : (
                <button
                  onClick={() => navigate('/profil')}
                  className='ref-button ref-button-outline'
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '10px' }}
                >
                  <i className='fas fa-user-check me-1'></i> Mon Dossier
                </button>
              )}
              <button
                onClick={handleLogout}
                className='btn btn-outline-danger btn-sm rounded-circle p-2'
                title='Déconnexion'
                style={{ width: '36px', height: '36px', display: 'grid', placeItems: 'center' }}
              >
                <i className='fas fa-power-off'></i>
              </button>
            </div>
          ) : (
            <div className='d-flex align-items-center gap-2'>
              <Link to='/login' className='ref-button ref-button-outline' style={{ minHeight: '40px', padding: '0 18px', fontSize: '10.5px' }}>
                Connexion
              </Link>
              <Link to='/register' className='ref-button' style={{ minHeight: '40px', padding: '0 18px', fontSize: '10.5px' }}>
                Créer Dossier <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M7 7h10v10'></path><path d='M7 17 17 7'></path></svg>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ====================================================================
          2. HERO ULTRA-SCI-FI AVEC CANVAS PARTICULES ET GLOW AMBIENT
          ==================================================================== */}
      <section className='ref-hero' id='ref-top'>
        <div className='ref-hero-glow' />
        <canvas ref={canvasRef} className='ref-particles' />
        <div className='ref-hero-watermark'>RECRUTEMENT.MA</div>

        <div className='ref-hero-frame'>
          <div className='ref-hero-top-badge'>
            <i className='fas fa-shield-alt text-info me-2'></i>
            <span>01 — L’ÉQUITÉ NATIONALE · DU DÉPÔT NUMÉRIQUE À L’AFFECTATION</span>
          </div>

          <h1 className='ref-hero-title'>
            UN CYCLE COMPLET. <em>UNE SÉLECTION TRANSPARENTE.</em><br />
            DU DÉPÔT DE DOSSIER <em>À L’AFFECTATION.</em>
          </h1>

          <p className='ref-hero-sub'>
            Centralisation nationale des concours d’accès aux institutions bancaires, établissements publics
            et organismes financiers au Maroc. Garantie absolue de mérite républicain, barèmes dynamiques
            certifiés et récépissé numérique avec horodatage conforme Loi 09-08 (CNDP).
          </p>

          <div className='ref-hero-actions'>
            <a href='#ref-offres' className='ref-button'>
              Explorer les concours ouverts <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M7 7h10v10'></path><path d='M7 17 17 7'></path></svg>
            </a>
            <a href='#ref-budget' className='ref-button ref-button-outline'>
              <i className='fas fa-chart-line me-2'></i> Simuler mon barème en direct
            </a>
          </div>

          <div className='ref-hero-hud'>
            <span>01 — LE MÉRITE RÉPUBLICAIN</span>
            <div>
              <i className='is-on'></i>
              <i className='is-on'></i>
              <i className=''></i>
            </div>
            <span>CONFORMITÉ LOI 09-08 CNDP · SHA-256</span>
          </div>

          <a href='#ref-vision' className='ref-scroll-hint'>
            <i></i>
            <span>DÉFILER POUR EXPLORER</span>
          </a>
        </div>
      </section>

      {/* ====================================================================
          3. SECTION FACTS TELEMETRY STRIP
          ==================================================================== */}
      <section className='ref-facts-strip'>
        <div className='ref-facts-grid'>
          <div className='ref-fact-item'>
            <b>6</b>
            <span>ÉTAPES AUDITÉES DU CYCLE OFFICIEL</span>
          </div>
          <div className='ref-fact-item'>
            <b>5</b>
            <span>ESPACES MÉTIER CENTRALISÉS</span>
          </div>
          <div className='ref-fact-item'>
            <b>100%</b>
            <span>CONFORME LOI 09-08 (CNDP)</span>
          </div>
          <div className='ref-fact-item'>
            <b>100</b>
            <span>POINTS DU BARÈME ALGORITHMIQUE</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. SECTION VISION & IMPACT AVEC SVG SIGNAL THREAD
          ==================================================================== */}
      <section className='ref-impact' id='ref-vision'>
        <div className='container' style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className='ref-section-top'>
            <span>LA PLATEFORME NATIONALE</span>
            <span>DU DOSSIER AU CLASSEMENT OFFICIEL</span>
          </div>

          <div className='ref-impact-headline'>
            <div className='ref-impact-start'>
              <small>DU DÉPÔT NUMÉRIQUE</small>
              <h3>Un dossier <em>complet.</em></h3>
            </div>
            <div className='ref-impact-end'>
              <small>À LA SÉLECTION OFFICIELLE</small>
              <h3>Un barème <em>équitable.</em></h3>
            </div>
          </div>

          {/* Animated SVG Signal Path */}
          <div className='ref-impact-thread-wrap'>
            <svg className='ref-impact-thread' viewBox='0 0 1000 180' preserveAspectRatio='none'>
              <path className='ref-impact-track' d='M 30 90 Q 250 10, 500 90 T 970 90' />
              <path className='ref-impact-signal' d='M 30 90 Q 250 10, 500 90 T 970 90' />
              <circle cx='30' cy='90' r='6' />
              <circle cx='500' cy='90' r='5' />
              <circle cx='970' cy='90' r='6' />
            </svg>
          </div>

          <div className='row align-items-center g-5'>
            <div className='col-lg-7'>
              <h2 style={{ fontSize: 'clamp(34px, 3.8vw, 54px)', lineHeight: '1.15', marginBottom: '24px' }}>
                La plateforme relie les besoins, les concours, l’audit des pièces, la notation algorithmique et les convocations.
              </h2>
              <p style={{ color: '#adb7b8', fontSize: '16px', lineHeight: '1.8' }}>
                Candidats, commissions d’audit, recruteurs RH et auditeurs externes partagent un cycle commun.
                Chaque acteur retrouve ses actions. Chaque dossier reste certifié, infalsifiable et traçable en temps réel.
              </p>
            </div>
            <div className='col-lg-5'>
              <div style={{ background: 'rgba(10, 18, 21, 0.85)', border: '1px solid rgba(127, 219, 227, 0.25)', borderRadius: '12px', padding: '30px' }}>
                <div className='ref-hud-pill mb-3'>
                  <span className='ref-dot-pulse'></span>
                  <span>GARANTIE DE MÉRITE</span>
                </div>
                <h4 style={{ color: '#fff', fontSize: '20px', marginBottom: '14px' }}>Élimination Totale du Biais</h4>
                <p style={{ color: '#8da4ac', fontSize: '13.5px', lineHeight: '1.7', marginBottom: '20px' }}>
                  Aucune note ne peut être modifiée sans justificatif visuel certifié par un double contrôle de la commission.
                  L’algorithme applique le barème sur 100 points de manière égale pour tous les candidats marocains.
                </p>
                <a href='#ref-spaces' className='ref-button' style={{ minHeight: '42px', padding: '0 20px', fontSize: '10px' }}>
                  Découvrir les espaces métier <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M7 7h10v10'></path><path d='M7 17 17 7'></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. LE SIGNATURE CELESTIAL ORBIT RADAR (ref-relay-orbit)
          Inspiré directement d'ingfron.ehcgroupe.ma
          ==================================================================== */}
      <section className='ref-relay' id='ref-relay'>
        <div className='container' style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className='ref-section-top'>
            <span>LE CYCLE OFFICIEL DU RECRUTEMENT</span>
            <span>0{activeCycleIndex + 1} / 06 · UNE ÉTAPE · DES ACTEURS</span>
          </div>

          <div className='ref-relay-layout'>
            <div className='ref-relay-copy'>
              <h2>
                <span>Le cycle.</span><br />
                <span><em>Entre vos institutions.</em></span>
              </h2>
              <p>
                Un besoin s’exprime, une commission audite, le barème classe, une convocation prend vie.
                Les étapes défilent pour révéler les acteurs qui y contribuent. Vous pouvez aussi choisir un numéro sur l'orbite.
              </p>

              <div className='ref-relay-detail' key={activeCycleIndex}>
                <div className='ref-eyebrow'>
                  ÉTAPE {currentStage.num} · {currentStage.role.toUpperCase()}
                </div>
                <h3>{currentStage.title}</h3>
                <p>{currentStage.desc}</p>
                <ul>
                  {currentStage.points.map((pt, i) => (
                    <li key={i}>
                      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'></polyline></svg>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <a href='#ref-spaces' className='ref-button' style={{ minHeight: '44px', padding: '0 20px', fontSize: '10.5px' }}>
                  Explorer cet espace métier <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M7 7h10v10'></path><path d='M7 17 17 7'></path></svg>
                </a>
              </div>
            </div>

            <div className='ref-relay-diagram'>
              <div className='ref-relay-orbit'>
                <svg viewBox='0 0 420 420'>
                  <circle cx='210' cy='210' r='151' className='ref-relay-track'></circle>
                  <circle cx='210' cy='210' r='112' className='ref-relay-inner'></circle>
                  <circle cx='210' cy='210' r='151' className='ref-relay-flow'></circle>

                  {/* Radiating connector lines */}
                  <line x1='210' y1='98' x2='210' y2='59' className={activeCycleIndex === 0 ? 'is-active' : ''}></line>
                  <line x1='307' y1='154' x2='341' y2='135' className={activeCycleIndex === 1 ? 'is-active' : ''}></line>
                  <line x1='307' y1='266' x2='341' y2='286' className={activeCycleIndex === 2 ? 'is-active' : ''}></line>
                  <line x1='210' y1='322' x2='210' y2='361' className={activeCycleIndex === 3 ? 'is-active' : ''}></line>
                  <line x1='113' y1='266' x2='79' y2='286' className={activeCycleIndex === 4 ? 'is-active' : ''}></line>
                  <line x1='113' y1='154' x2='79' y2='135' className={activeCycleIndex === 5 ? 'is-active' : ''}></line>
                </svg>

                <div className='ref-relay-center'>
                  <span>RECRUTEMENT<span>.MA</span></span>
                  <p>{currentStage.short}.<br /><em>Certifié.</em></p>
                  <span>0{activeCycleIndex + 1} / 06</span>
                </div>

                <div className='ref-relay-nodes'>
                  <button style={{ left: '50%', top: '14%' }} aria-pressed={activeCycleIndex === 0} onClick={() => setActiveCycleIndex(0)}>
                    <span>01</span>
                    <span>Besoins</span>
                  </button>
                  <button style={{ left: '81.18%', top: '32%' }} aria-pressed={activeCycleIndex === 1} onClick={() => setActiveCycleIndex(1)}>
                    <span>02</span>
                    <span>Concours</span>
                  </button>
                  <button style={{ left: '81.18%', top: '68%' }} aria-pressed={activeCycleIndex === 2} onClick={() => setActiveCycleIndex(2)}>
                    <span>03</span>
                    <span>Dépôt</span>
                  </button>
                  <button style={{ left: '50%', top: '86%' }} aria-pressed={activeCycleIndex === 3} onClick={() => setActiveCycleIndex(3)}>
                    <span>04</span>
                    <span>Audit</span>
                  </button>
                  <button style={{ left: '18.82%', top: '68%' }} aria-pressed={activeCycleIndex === 4} onClick={() => setActiveCycleIndex(4)}>
                    <span>05</span>
                    <span>Barème</span>
                  </button>
                  <button style={{ left: '18.82%', top: '32%' }} aria-pressed={activeCycleIndex === 5} onClick={() => setActiveCycleIndex(5)}>
                    <span>06</span>
                    <span>Convocations</span>
                  </button>
                </div>
              </div>

              <div className='ref-relay-transport'>
                <div>
                  <span>RELAIS AUTOMATIQUE · TEMPO ACTIF</span>
                  <div className='ref-relay-timer'>
                    <i key={activeCycleIndex}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Running Marquee Ticker */}
        <div className='ref-relay-marquee'>
          <div>
            <span>
              <span>Recueillir<i>↗</i></span>
              <span className='is-outline'>Publier<i>↗</i></span>
              <span>Postuler<i>↗</i></span>
              <span className='is-outline'>Auditer<i>↗</i></span>
              <span>Classer<i>↗</i></span>
              <span className='is-outline'>Convoquer<i>↗</i></span>
            </span>
            <span>
              <span>Recueillir<i>↗</i></span>
              <span className='is-outline'>Publier<i>↗</i></span>
              <span>Postuler<i>↗</i></span>
              <span className='is-outline'>Auditer<i>↗</i></span>
              <span>Classer<i>↗</i></span>
              <span className='is-outline'>Convoquer<i>↗</i></span>
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. LES 5 ESPACES MÉTIER AVEC FOLIO CARD 3D FLOTTANTE (ref-spaces)
          ==================================================================== */}
      <section className='ref-spaces' id='ref-spaces'>
        <div className='container' style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className='ref-section-top' style={{ borderColor: 'rgba(17, 20, 21, 0.15)', color: '#626a6c' }}>
            <span>LES ESPACES MÉTIER</span>
            <span>CINQ REGARDS · UN MÊME CYCLE NATIONAL</span>
          </div>

          <div className='ref-spaces-heading'>
            <h2>
              <span>Votre rôle.</span><br />
              <em>Votre espace.</em>
            </h2>
            <p>
              Une plateforme unifiée où chaque acteur retrouve ses outils métiers dédiés,
              garantissant fluidité opérationnelle et zéro retard de traitement.
            </p>
          </div>

          <div className='ref-exhibit-stage'>
            <div className='ref-exhibit-rail'>
              <p>CHOISISSEZ VOTRE REGARD</p>
              <div className='ref-exhibit-tabs'>
                {ROLES_DATA.map((role, idx) => (
                  <button
                    key={role.id}
                    aria-selected={activeRoleIndex === idx}
                    onClick={() => setActiveRoleIndex(idx)}
                  >
                    <span>0{idx + 1}</span>
                    <span>
                      {role.name}
                      <small>{role.tag}</small>
                    </span>
                    <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M7 7h10v10'></path><path d='M7 17 17 7'></path></svg>
                  </button>
                ))}
              </div>
            </div>

            <div className='ref-exhibit-panel' key={currentRole.id}>
              <div className='ref-exhibit-story'>
                <div className='ref-eyebrow'>ESPACE 0{activeRoleIndex + 1} · {currentRole.name.toUpperCase()}</div>
                <h3>{currentRole.title}</h3>
                <p>{currentRole.desc}</p>
                <ul>
                  {currentRole.items.map((it, i) => (
                    <li key={i}>
                      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'></polyline></svg>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <div className='d-flex align-items-center gap-3'>
                  <Link to='/login' className='ref-button'>
                    Accéder à cet espace <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M7 7h10v10'></path><path d='M7 17 17 7'></path></svg>
                  </Link>
                </div>
              </div>

              {/* 3D Floating Folio Art */}
              <div className='ref-exhibit-art'>
                <span className='ref-exhibit-watermark'>0{activeRoleIndex + 1}</span>
                <div className='ref-exhibit-spine'>
                  <span>PORTAIL NATIONAL</span>
                  <i></i>
                  <span>{currentRole.name.toUpperCase()}</span>
                </div>
                <div className='ref-exhibit-folio'>
                  <div className='ref-exhibit-folio-top'>
                    <span>Recrutement<span>.ma</span></span>
                    <span>ESPACE 0{activeRoleIndex + 1}</span>
                  </div>
                  <p className='ref-exhibit-folio-kicker'>{currentRole.name}</p>
                  <h4>{currentRole.folioTitle}</h4>
                  <ol>
                    {currentRole.steps.map((st, i) => (
                      <li key={i}>
                        <span>{st.num}</span>
                        <div>
                          <strong>{st.title}</strong>
                          <p>{st.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. VITRINE DES CONCOURS NATIONAUX (ref-offres)
          ==================================================================== */}
      <section className='ref-offres' id='ref-offres'>
        <div className='container' style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className='ref-section-top'>
            <span>CONCOURS &amp; AVIS OFFICIELS</span>
            <span>RÉSEAU DES GRANDES INSTITUTIONS BANCAIRES ET PUBLIQUES</span>
          </div>

          <div className='ref-offres-header'>
            <div>
              <h2>
                <span>Concours ouverts.</span><br />
                <em>Postulez en ligne.</em>
              </h2>
            </div>
            <div style={{ maxWidth: '380px' }}>
              <input
                type='text'
                className='form-control bg-dark text-white border-secondary'
                placeholder='Rechercher un poste, ville ou institution...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: '999px', padding: '12px 20px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className='ref-filters-strip'>
            {['ALL', 'ABB', 'CIH', 'OCP', 'MEF', 'BOA', 'CDG'].map((sigle) => (
              <button
                key={sigle}
                className={`ref-filter-pill ${selectedSigle === sigle ? 'is-active' : ''}`}
                onClick={() => setSelectedSigle(sigle)}
              >
                {sigle === 'ALL' ? 'Toutes les institutions' : sigle}
              </button>
            ))}
          </div>

          <div className='ref-offres-grid'>
            {filteredOffres.map((offre) => (
              <div key={offre._id} className='ref-offre-card'>
                <div className='ref-offre-badge-strip'>
                  <span className='ref-offre-badge'>{offre.entreprise}</span>
                  {offre.urgent && (
                    <span className='badge bg-danger text-white' style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
                      CLÔTURE IMMINENTE
                    </span>
                  )}
                </div>

                <h4>{offre.titre}</h4>

                <div className='ref-offre-meta'>
                  <span><i className='fas fa-map-marker-alt'></i> {offre.ville}</span>
                  <span><i className='fas fa-graduation-cap'></i> {offre.niveau}</span>
                  <span><i className='fas fa-users'></i> {offre.postes} Postes budgétaires</span>
                  <span><i className='fas fa-clock'></i> Clôture : {offre.cloture}</span>
                </div>

                <div className='ref-offre-foot'>
                  <Link
                    to={userInfo ? '/profil' : '/register'}
                    className='ref-button'
                    style={{ minHeight: '38px', padding: '0 18px', fontSize: '10px' }}
                  >
                    Postuler à ce concours <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M7 7h10v10'></path><path d='M7 17 17 7'></path></svg>
                  </Link>

                  <a
                    href='/uploads/Dossier_Candidat_Complet_6_Pages.pdf'
                    target='_blank'
                    rel='noreferrer'
                    className='text-muted small text-decoration-none'
                    title='Télécharger l’Avis Officiel'
                  >
                    <i className='fas fa-file-pdf text-danger me-1'></i> Avis PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. SIMULATEUR DE BARÈME INTERACTIF COMPASS RADAR (ref-funding)
          ==================================================================== */}
      <section className='ref-funding' id='ref-budget'>
        <div className='container' style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className='ref-section-top'>
            <span>SIMULATEUR DE BARÈME DYNAMIQUE</span>
            <span>TRANSPARENCE ALGORITHMIQUE SUR 100 POINTS</span>
          </div>

          <div className='ref-funding-heading'>
            <h2>
              <span>Votre score.</span><br />
              <em>Avant de postuler.</em>
            </h2>
            <p style={{ color: '#9ab4be', maxWidth: '420px', fontSize: '14.5px' }}>
              Ajustez vos critères réels (diplôme, mention, années d’expérience) et observez la jauge
              calculer instantanément votre positionnement au barème national.
            </p>
          </div>

          <div className='ref-funding-panel'>
            {/* Left Controls */}
            <div className='ref-sim-controls'>
              <div className='ref-sim-group'>
                <label>
                  <span>1. Diplôme / Niveau Académique</span>
                  <span>{simNiveau === 'bac2' ? '25 pts' : simNiveau === 'bac3' ? '35 pts' : simNiveau === 'bac5' ? '45 pts' : '50 pts'}</span>
                </label>
                <select className='ref-sim-select' value={simNiveau} onChange={(e) => setSimNiveau(e.target.value)}>
                  <option value='bac2'>Bac +2 (DUT, BTS, DTS, DEUG)</option>
                  <option value='bac3'>Bac +3 (Licence Fondamentale / Professionnelle)</option>
                  <option value='bac5'>Bac +5 (Master, Diplôme d’Ingénieur d’État, ENCG, ISCAE)</option>
                  <option value='doctorat'>Doctorat / Ph.D Spécialisé</option>
                </select>
              </div>

              <div className='ref-sim-group'>
                <label>
                  <span>2. Mention au Diplôme Exigé</span>
                  <span>{simMention === 'passable' ? '8 pts' : simMention === 'assez_bien' ? '14 pts' : simMention === 'bien' ? '18 pts' : '20 pts'}</span>
                </label>
                <select className='ref-sim-select' value={simMention} onChange={(e) => setSimMention(e.target.value)}>
                  <option value='passable'>Mention Passable (10.00 à 11.99)</option>
                  <option value='assez_bien'>Mention Assez Bien (12.00 à 13.99)</option>
                  <option value='bien'>Mention Bien (14.00 à 15.99)</option>
                  <option value='tres_bien'>Mention Très Bien (16.00 et plus)</option>
                </select>
              </div>

              <div className='ref-sim-group'>
                <label>
                  <span>3. Expérience Professionnelle Validée</span>
                  <span>{simExp} an(s) · {Math.min(simExp * 3, 30)} pts</span>
                </label>
                <input
                  type='range'
                  className='ref-sim-range'
                  min='0'
                  max='10'
                  step='1'
                  value={simExp}
                  onChange={(e) => setSimExp(Number(e.target.value))}
                />
                <div className='d-flex justify-content-between mt-2 text-muted small'>
                  <span>Débutant (0 an)</span>
                  <span>5 ans</span>
                  <span>10 ans et +</span>
                </div>
              </div>

              <div className='p-3 rounded' style={{ background: 'rgba(25, 179, 194, 0.08)', border: '1px solid rgba(127, 219, 227, 0.2)' }}>
                <small className='text-info d-block mb-1'>
                  <i className='fas fa-info-circle me-1'></i> NOUVELLE FONCTIONNALITÉ POSTE ACTUEL
                </small>
                <p className='small text-muted mb-0' style={{ fontSize: '11px', lineHeight: '1.5' }}>
                  Si vous êtes en poste aujourd'hui, cochez simplement <em>« Toujours en poste »</em> dans votre profil candidat.
                  L’algorithme calcule automatiquement vos mois jusqu’à aujourd’hui sans bloquer votre date.
                </p>
              </div>
            </div>

            {/* Right Compass Radar Gauge */}
            <div className='ref-funding-compass'>
              <svg viewBox='0 0 320 320'>
                <circle cx='160' cy='160' r='130' className='ref-funding-track' />
                <circle
                  cx='160'
                  cy='160'
                  r='130'
                  className='ref-funding-arc-2'
                  style={{
                    strokeDasharray: gaugeCircumference,
                    strokeDashoffset: gaugeDashoffset,
                  }}
                />
              </svg>

              <div className='ref-funding-center'>
                <span>SCORE SIMULÉ</span>
                <b>
                  {simScore}
                  <em>/100</em>
                </b>
                <div className='ref-funding-status'>
                  <i className='fas fa-check-circle text-success me-1'></i>
                  <span>
                    {simScore >= 75
                      ? 'HAUTE ADMISSIBILITÉ (TOP 10%)'
                      : simScore >= 55
                      ? 'ÉLIGIBLE CONVOCATION ORALE'
                      : 'DOSSIER RECEVABLE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. CYBER PORTAL DOOR (ref-launch)
          ==================================================================== */}
      <section className='ref-launch'>
        <div className='container' style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className='ref-launch-layout'>
            <div className='ref-launch-copy'>
              <div className='ref-eyebrow'>PORTAIL CENTRALISÉ · SESSION 2026</div>
              <h2>
                Entrez <em>dans le cycle.</em>
              </h2>
              <p>
                Créez votre dossier candidat sécurisé, téléversez vos justificatifs
                et bénéficiez d’une égalité républicaine totale garantie par notre commission d'audit.
              </p>
              <Link to='/register' className='ref-button'>
                Créer mon dossier candidat <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M7 7h10v10'></path><path d='M7 17 17 7'></path></svg>
              </Link>
            </div>

            <div className='ref-launch-art'>
              <svg className='ref-launch-door' viewBox='0 0 400 480'>
                <path className='ref-launch-frame' d='M80 440 V180 A120 120 0 0 1 320 180 V440' />
                <path className='ref-launch-flow' d='M80 440 V180 A120 120 0 0 1 320 180 V440' />
              </svg>

              <Link to='/login' className='ref-launch-portal'>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.15em', color: '#067782' }}>ACCÈS SÉCURISÉ</span>
                <span className='ref-launch-portal-title'>Espace <em>Portail</em></span>
                <p style={{ fontSize: '11px', color: '#617076', margin: '0' }}>Candidats, Commissions &amp; RH</p>
                <i className='fas fa-arrow-right text-info mt-2'></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. FAQ ACCORDION (ref-questions)
          ==================================================================== */}
      <section className='ref-questions' id='ref-questions'>
        <div className='container' style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className='ref-questions-grid'>
            <div className='ref-questions-left'>
              <div className='ref-eyebrow' style={{ color: '#067782' }}>TRANSPARENCE &amp; RÈGLEMENT</div>
              <h2>
                Questions <em>fréquentes.</em>
              </h2>
              <p>
                Toutes les réponses officielles concernant la validation des pièces, l’horodatage de votre candidature
                et le respect strict de la Loi 09-08 (CNDP).
              </p>
            </div>

            <div className='ref-faq-list'>
              <details open>
                <summary>
                  <span>Comment fonctionne l'option « Toujours en poste » ?</span>
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='5' x2='12' y2='19'></line><line x1='5' y1='12' x2='19' y2='12'></line></svg>
                </summary>
                <p>
                  Si vous exercez actuellement une activité professionnelle, il vous suffit de cocher « Poste actuel ».
                  Le système verrouille la date de fin et calcule automatiquement votre durée d’expérience jusqu’à aujourd’hui,
                  sans nécessiter de date de fin arbitraire.
                </p>
              </details>

              <details>
                <summary>
                  <span>Que se passe-t-il si une note déclarée ne correspond pas au relevé ?</span>
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='5' x2='12' y2='19'></line><line x1='5' y1='12' x2='19' y2='12'></line></svg>
                </summary>
                <p>
                  Les auditeurs de la commission effectuent un contrôle visuel à l’écran de vos relevés originaux scannés.
                  En cas d’écart ou de faute de frappe, la note est réajustée selon la pièce officielle et le score est recalculé
                  automatiquement avec traçabilité dans le journal d'audit.
                </p>
              </details>

              <details>
                <summary>
                  <span>Mon dossier est-il protégé et conforme aux règles CNDP ?</span>
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='5' x2='12' y2='19'></line><line x1='5' y1='12' x2='19' y2='12'></line></svg>
                </summary>
                <p>
                  Absolument. Conformément à la Loi 09-08 relative à la protection des personnes physiques à l'égard du traitement
                  des données à caractère personnel, vos documents sont chiffrés et accessibles uniquement aux membres habilités
                  de la commission d'audit officielle.
                </p>
              </details>

              <details>
                <summary>
                  <span>Quand et comment recevrai-je ma convocation officielle ?</span>
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='5' x2='12' y2='19'></line><line x1='5' y1='12' x2='19' y2='12'></line></svg>
                </summary>
                <p>
                  Dès la clôture des audits par la commission, les listes des candidats admissibles sont arrêtées.
                  Votre convocation nominative (avec centre d’examen, salle et QR-Code) sera téléchargeable directement
                  depuis votre espace personnel.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          12. FOOTER DE HAUTE PRÉCISION (ref-footer)
          ==================================================================== */}
      <footer className='ref-footer'>
        <div className='ref-footer-inner'>
          <div>
            <div className='ref-brand' style={{ fontSize: '32px', marginBottom: '18px' }}>
              Recrutement<span>.ma</span>
            </div>
            <p style={{ maxWidth: '340px', lineHeight: '1.7', fontSize: '13px', color: '#8fa5ac' }}>
              Portail National de Recrutement et de Gestion des Concours d’Accès aux Grandes Institutions Bancaires,
              Établissements Publics et Organismes Financiers au Maroc.
            </p>
            <div className='ref-hud-pill mt-4'>
              <span className='ref-dot-pulse'></span>
              <span>LOI 09-08 · CNDP CONFORME</span>
            </div>
          </div>

          <div className='ref-footer-col'>
            <h5>La Plateforme</h5>
            <a href='#ref-vision'>Notre Vision</a>
            <a href='#ref-relay'>Le Cycle Radar</a>
            <a href='#ref-spaces'>Les Espaces Métier</a>
            <a href='#ref-budget'>Simulateur de Barème</a>
          </div>

          <div className='ref-footer-col'>
            <h5>Institutions</h5>
            <a href='#ref-offres'>Al Barid Bank</a>
            <a href='#ref-offres'>Groupe OCP</a>
            <a href='#ref-offres'>CIH Bank</a>
            <a href='#ref-offres'>Ministère des Finances</a>
            <a href='#ref-offres'>Bank of Africa</a>
            <a href='#ref-offres'>CDG Maroc</a>
          </div>

          <div className='ref-footer-col'>
            <h5>Accès Direct</h5>
            <Link to='/login'>Espace Recruteur RH</Link>
            <Link to='/login'>Espace Commission d'Audit</Link>
            <Link to='/register'>Créer Dossier Candidat</Link>
            <a href='#ref-questions'>Assistance &amp; Règlement</a>
          </div>
        </div>

        <div className='ref-footer-watermark'>
          RECRUTEMENT<span>.MA</span>
        </div>

        <div className='ref-footer-bottom'>
          <span>© 2026 EHC Experts Human Capital — Portail National Recrutement.ma</span>
          <span>TOUS DROITS RÉSERVÉS · SÉLECTION AU MÉRITE · CONFORME CNDP</span>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
