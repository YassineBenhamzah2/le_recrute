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
    niveau: 'Bac +2 (DUT, BTS, DTS)',
    postes: 120,
    cloture: 'Dans 12 jours',
    urgent: true,
  },
  {
    _id: 'cih-01',
    titre: 'Chargés de Clientèle Particuliers & Professionnels',
    entreprise: 'CIH Bank',
    sigle: 'CIH',
    secteur: 'Secteur Bancaire',
    ville: 'Casablanca, Rabat, Tanger, Marrakech',
    niveau: 'Bac +3 / Licence',
    postes: 25,
    cloture: 'Dans 6 jours',
    urgent: false,
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
  },
];

const PIPELINE_STAGES = [
  {
    num: '01',
    tag: 'DÉPÔT NUMÉRIQUE SÉCURISÉ',
    title: 'Constitution du Dossier & Récépissé Horodaté',
    short: '01. Inscription & Dépôt',
    desc: 'Le candidat renseigne son état civil, ses diplômes (Bac, DUT, Licence, Master) et ses expériences professionnelles (avec calcul automatique du temps en poste actuel) et téléverse les justificatifs originaux.',
    points: [
      'Génération d’une empreinte cryptographique SHA-256 infalsifiable pour chaque pièce téléversée',
      'Calcul automatique de l’expérience professionnelle sans exiger de date de fin pour les candidats en poste',
      'Délivrance d’un récépissé officiel avec horodatage électronique certifié conforme Loi 09-08 (CNDP)',
    ],
    metric: '100% Dématérialisé',
    badge: 'CONFORME CNDP',
  },
  {
    num: '02',
    tag: 'AUDIT VISUEL ANTI-FRAUDE',
    title: 'Instruction des Pièces en Double-Aveugle',
    short: '02. Audit par la Commission',
    desc: 'Les membres de la commission d’audit examinent les relevés de notes et attestations originaux sur écran scindé en comparant chaque chiffre déclaré à la pièce officielle sans possibilité d’intervention extérieure.',
    points: [
      'Visualiseur PDF haute résolution avec détection automatique des coquilles et falsifications',
      'Rectification transparente de la note déclarée si le relevé officiel scanné comporte un écart',
      'Double validation indépendante : deux contrôleurs distincts doivent viser le dossier pour validation',
    ],
    metric: '0 Fraude Tolérée',
    badge: 'DOUBLE CONTRÔLE',
  },
  {
    num: '03',
    tag: 'NOTATION TRANSPARENTE',
    title: 'Calcul Algorithmique du Barème sur 100 Points',
    short: '03. Barème sur 100 Pts',
    desc: 'L’algorithme applique strictement le barème validé par l’institution recruteuse (diplômes, mentions académiques, ancienneté d’expérience et spécificités métiers) sans aucune intervention humaine arbitraire.',
    points: [
      'Score calculé à la milliseconde selon le décret officiel régissant le concours',
      'Égalité absolue des chances et élimination complète de toute forme de favoritisme ou de népotisme',
      'Publication immédiate des critères de notation et des seuils d’admissibilité pour chaque région',
    ],
    metric: '100 / 100 Points',
    badge: 'ALGORITHME CERTIFIÉ',
  },
  {
    num: '04',
    tag: 'LOGISTIQUE D’EXAMEN',
    title: 'Édition des Convocations Sécurisées avec QR-Code',
    short: '04. Convocations QR-Code',
    desc: 'Les candidats retenus reçoivent leur convocation officielle nominative indiquant le centre d’examen régional, la salle, le numéro de table et un QR-Code crypté pour l’émargement électronique le jour J.',
    points: [
      'Téléchargement instantané de la convocation PDF certifiée dans l’espace personnel du candidat',
      'Répartition géographique optimisée selon l’adresse de résidence pour réduire les déplacements',
      'Système anti-substitution d’identité par vérification biométrique et QR-Code à l’entrée des salles',
    ],
    metric: 'Affectation Immédiate',
    badge: 'QR SÉCURISÉ',
  },
  {
    num: '05',
    tag: 'PUBLICATION OFFICIELLE',
    title: 'Épreuves, Entretien & Affectation Définitive',
    short: '05. Épreuves & Affectation',
    desc: 'Après correction anonyme des épreuves écrites et passage devant le jury d’oral, les listes principales et d’attente sont publiées par ordre strict de mérite avec accompagnement à l’intégration en agence ou au siège.',
    points: [
      'Double anonymisation des copies d’examen lors de la phase des épreuves écrites nationales',
      'Grille d’évaluation standardisée pour les entretiens oraux devant la commission paritaire',
      'Affectation transparente dans les agences bancaires ou directions régionales selon le rang de mérite',
    ],
    metric: 'Mérite Républicain',
    badge: 'RÉSULTATS PUBLICS',
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
  const [selectedVille, setSelectedVille] = useState('ALL');
  const [offres, setOffres] = useState(DEFAULT_FEATURED_OFFRES);

  // Active Pipeline Stage
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Simulator state
  const [simNiveau, setSimNiveau] = useState('bac5');
  const [simMention, setSimMention] = useState('bien');
  const [simExp, setSimExp] = useState(3);
  const [simEnPoste, setSimEnPoste] = useState(true);

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // Custom Cursor
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorHovered, setCursorHovered] = useState(false);

  // Canvas Ref
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
          }));
          setOffres(mapped);
        }
      } catch (e) {
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

    const handleOver = (e) => {
      const target = e.target.closest('a, button, input, select, .nr-clickable, [role="button"]');
      setCursorHovered(!!target);
    };

    document.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleOver);
    };
  }, [cursorVisible]);

  // 4. Interactive Particle Canvas (Constellation & Cyber Glow)
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

    const particleCount = Math.min(Math.floor((width * height) / 12000), 80);
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
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

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 140) {
          p.x -= (dxMouse / distMouse) * 0.9;
          p.y -= (dyMouse / distMouse) * 0.9;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 169, ${p.alpha})`;
        ctx.shadowColor = 'rgba(0, 242, 169, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 242, 169, ${0.18 * (1 - dist / 125)})`;
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
      const matchVille = selectedVille === 'ALL' || item.ville.toLowerCase().includes(selectedVille.toLowerCase());
      return matchSearch && matchSigle && matchVille;
    });
  }, [offres, searchTerm, selectedSigle, selectedVille]);

  // Simulator Score Calculation
  const simScore = useMemo(() => {
    let score = 0;
    // Diplôme (Max 45 pts)
    if (simNiveau === 'bac2') score += 25;
    else if (simNiveau === 'bac3') score += 35;
    else if (simNiveau === 'bac5') score += 45;
    else if (simNiveau === 'doctorat') score += 48;

    // Mention (Max 22 pts)
    if (simMention === 'passable') score += 8;
    else if (simMention === 'assez_bien') score += 14;
    else if (simMention === 'bien') score += 18;
    else if (simMention === 'tres_bien') score += 22;

    // Expérience (3 pts/an, max 30)
    score += Math.min(Number(simExp) * 3, 30);

    return Math.min(score, 100);
  }, [simNiveau, simMention, simExp]);

  // Gauge SVG Math: R=130 -> 2*PI*130 ≈ 816.8
  const gaugeCircumference = 2 * Math.PI * 130;
  const gaugeDashoffset = gaugeCircumference - (gaugeCircumference * simScore) / 100;

  const handleLogout = () => {
    dispatch(logout());
  };

  const currentStage = PIPELINE_STAGES[activeStageIndex];

  return (
    <div className='nr-universe'>
      {/* 0. Top Glowing Scroll Progress */}
      <div className='nr-progress-bar' style={{ transform: `scaleX(${scrollProgress})` }} />

      {/* 0. Custom Magnetic Holographic Cursor */}
      <div
        className='nr-cursor'
        data-visible={cursorVisible ? 'true' : 'false'}
        data-action={cursorHovered ? 'true' : 'false'}
        style={{ transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)` }}
      >
        <span>{cursorHovered ? '↗' : ''}</span>
      </div>

      {/* ====================================================================
          1. NAVBAR SUPRÊME FLOTTANTE
          ==================================================================== */}
      <header className='nr-nav'>
        <Link to='/' className='nr-brand'>
          RECRUTEMENT<span>.MA</span>
          <span className='nr-brand-badge'>PORTAIL OFFICIEL</span>
        </Link>

        <nav className='nr-nav-links'>
          <a href='#nr-pipeline'>Le Parcours du Mérite</a>
          <a href='#nr-offres'>Concours Ouverts</a>
          <a href='#nr-simulateur'>Simulateur de Barème</a>
          <a href='#nr-espaces'>Espaces Métier</a>
          <a href='#nr-securite'>Audit &amp; CNDP</a>
          <a href='#nr-faq'>FAQ</a>
        </nav>

        <div className='nr-nav-actions'>
          {userInfo ? (
            <div className='d-flex align-items-center gap-2'>
              {userInfo.isAdministrateur ? (
                <button
                  onClick={() => navigate('/administrateur/candidatures')}
                  className='nr-btn nr-btn-outline'
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '10px' }}
                >
                  <i className='fas fa-shield-alt me-1 text-warning'></i> Admin Central
                </button>
              ) : userInfo.isMaitreOuvrage ? (
                <button
                  onClick={() => navigate('/maitre-ouvrage/candidatures')}
                  className='nr-btn nr-btn-outline'
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '10px' }}
                >
                  <i className='fas fa-building me-1 text-info'></i> Espace Recruteur
                </button>
              ) : (
                <button
                  onClick={() => navigate('/profil')}
                  className='nr-btn nr-btn-outline'
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '10px' }}
                >
                  <i className='fas fa-user-check me-1 text-success'></i> Mon Dossier
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
              <Link to='/login' className='nr-btn nr-btn-outline' style={{ minHeight: '38px', padding: '0 16px', fontSize: '10.5px' }}>
                Connexion
              </Link>
              <Link to='/register' className='nr-btn' style={{ minHeight: '38px', padding: '0 18px', fontSize: '10.5px' }}>
                Créer Mon Dossier <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ====================================================================
          2. HERO SUPRÊME : PARTICULES, CYBER-GRID & RECHERCHE INSTANTANÉE
          ==================================================================== */}
      <section className='nr-hero'>
        <div className='nr-hero-bg' />
        <canvas ref={canvasRef} className='nr-particles-canvas' />

        <div className='nr-hero-content'>
          <div className='nr-hud-chip'>
            <span className='nr-dot-live'></span>
            <span>SYSTÈME NATIONAL SÉCURISÉ · SÉLECTION AU MÉRITE RÉPUBLICAIN · SESSION 2026</span>
          </div>

          <h1 className='nr-hero-title'>
            L’ÉQUITÉ DU CONCOURS. <em>LA RIGUEUR DE L’AUDIT.</em><br />
            DU DÉPÔT NUMÉRIQUE <em>À L’AFFECTATION NATIONALE.</em>
          </h1>

          <p className='nr-hero-sub'>
            Plateforme souveraine de centralisation des concours d’accès aux grandes institutions bancaires,
            organismes financiers et établissements publics au Maroc. Barèmes algorithmiques transparents,
            audit visuel en double-contrôle et récépissé numérique horodaté conforme Loi 09-08 (CNDP).
          </p>

          {/* Instant Multi-Criteria Search Engine */}
          <div className='nr-hero-search'>
            <i className='fas fa-search text-muted'></i>
            <input
              type='text'
              placeholder='Rechercher un intitulé de poste, diplôme, mot-clé...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={selectedSigle} onChange={(e) => setSelectedSigle(e.target.value)}>
              <option value='ALL'>Toutes les institutions</option>
              <option value='ABB'>Al Barid Bank</option>
              <option value='CIH'>CIH Bank</option>
              <option value='OCP'>Groupe OCP</option>
              <option value='MEF'>Ministère des Finances</option>
              <option value='BOA'>Bank of Africa</option>
              <option value='CDG'>Caisse de Dépôt (CDG)</option>
            </select>
            <select value={selectedVille} onChange={(e) => setSelectedVille(e.target.value)}>
              <option value='ALL'>Toutes les régions</option>
              <option value='Casablanca'>Casablanca</option>
              <option value='Rabat'>Rabat</option>
              <option value='Tanger'>Tanger</option>
              <option value='Marrakech'>Marrakech</option>
              <option value='Fès'>Fès / Meknès</option>
              <option value='Agadir'>Agadir / Souss</option>
            </select>
            <a href='#nr-offres' className='nr-btn' style={{ minHeight: '38px', padding: '0 18px', fontSize: '10.5px' }}>
              Trouver <i className='fas fa-arrow-down ms-1'></i>
            </a>
          </div>

          <div className='nr-hero-telemetry'>
            <span>AUDIT CRYPTOGRAPHIQUE ACTIF (SHA-256)</span>
            <div>
              <i className='hud-bar is-active'></i>
              <i className='hud-bar is-active'></i>
              <i className='hud-bar is-active'></i>
              <i className='hud-bar'></i>
            </div>
            <span>CONFORMITÉ LOI 09-08 CNDP · ZÉRO FRAUDE TOLÉRÉE</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. MATRICE DE CONFIANCE (FACTS TELEMETRY STRIP)
          ==================================================================== */}
      <section className='nr-facts-strip'>
        <div className='nr-facts-container'>
          <div className='nr-fact-card'>
            <b>6</b>
            <span>GRANDES INSTITUTIONS BANCAIRES &amp; ÉTABLISSEMENTS PUBLICS PARTENAIRES</span>
          </div>
          <div className='nr-fact-card'>
            <b>100%</b>
            <span>AUDIT VISUEL EN DOUBLE-AVEUGLE SUR ÉCRAN SCINDÉ ANTI-FRAUDE</span>
          </div>
          <div className='nr-fact-card'>
            <b>100</b>
            <span>POINTS DU BARÈME ALGORITHMIQUE TRANSPARENT ET VÉRIFIABLE</span>
          </div>
          <div className='nr-fact-card'>
            <b>0 ms</b>
            <span>LATENCE DANS LE CALCUL D'EXPÉRIENCE EN POSTE ACTUEL</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. LE PARCOURS DU MÉRITE RÉPUBLICAIN (INTERACTIVE 5-STAGE PIPELINE)
          ==================================================================== */}
      <section className='nr-pipeline-section' id='nr-pipeline'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='nr-section-header'>
            <div>
              <div className='nr-hud-chip mb-2'>
                <span>TRAÇABILITÉ TOTALE DE BOUT EN BOUT</span>
              </div>
              <h2>
                Le Parcours <em>du Mérite.</em><br />
                En 5 étapes certifiées.
              </h2>
            </div>
            <p>
              Chaque concours national suit une procédure rigoureusement auditée, garantissant aux candidats
              comme aux recruteurs un traitement impartial, transparent et conforme aux plus hauts standards réglementaires.
            </p>
          </div>

          {/* Pipeline Stage Buttons */}
          <div className='nr-pipeline-nav'>
            {PIPELINE_STAGES.map((st, idx) => (
              <button
                key={st.num}
                className={`nr-pipeline-tab ${activeStageIndex === idx ? 'is-active' : ''}`}
                onClick={() => setActiveStageIndex(idx)}
              >
                <span className='num'>ÉTAPE {st.num}</span>
                <strong>{st.short}</strong>
              </button>
            ))}
          </div>

          {/* Pipeline Interactive Card */}
          <div className='nr-pipeline-card' key={currentStage.num}>
            <div className='nr-pipeline-card-left'>
              <div className='nr-hud-chip mb-3' style={{ fontSize: '9px' }}>
                <span>{currentStage.tag}</span>
              </div>
              <h3>{currentStage.title}</h3>
              <p>{currentStage.desc}</p>
              <ul className='nr-pipeline-points'>
                {currentStage.points.map((pt, i) => (
                  <li key={i}>
                    <i className='fas fa-check-circle'></i>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className='d-flex align-items-center gap-3'>
                <Link to='/register' className='nr-btn'>
                  Commencer mon dossier <i className='fas fa-arrow-right ms-1'></i>
                </Link>
                <a href='#nr-simulateur' className='nr-btn nr-btn-outline'>
                  Simuler mon barème
                </a>
              </div>
            </div>

            {/* Right Interactive Visualizer Box */}
            <div className='nr-pipeline-visual'>
              <div className='nr-pipeline-visual-header'>
                <span>MÉTRIQUE OPÉRATIONNELLE</span>
                <span className='nr-pipeline-visual-badge'>{currentStage.badge}</span>
              </div>

              <div className='text-center py-4'>
                <div style={{ fontSize: '48px', color: 'var(--nr-mint)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
                  {currentStage.metric}
                </div>
                <div className='text-muted small'>Garantie d'intégrité nationale certifiée EHC</div>
              </div>

              <div className='p-3 rounded' style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 242, 169, 0.15)' }}>
                <div className='d-flex justify-content-between text-muted small mb-2' style={{ fontSize: '11px' }}>
                  <span>Conformité Réglementaire</span>
                  <span className='text-success'>100% Validé</span>
                </div>
                <div className='d-flex justify-content-between text-muted small mb-2' style={{ fontSize: '11px' }}>
                  <span>Temps Moyen d'Instruction</span>
                  <span className='text-info'>&lt; 48 Heures</span>
                </div>
                <div className='d-flex justify-content-between text-muted small' style={{ fontSize: '11px' }}>
                  <span>Traçabilité SHA-256</span>
                  <span className='text-warning'>Immuable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. RUNNING MARQUEE CINÉTIQUE DU MÉRITE RÉPUBLICAIN
          ==================================================================== */}
      <div className='nr-marquee'>
        <div className='nr-marquee-track'>
          <div className='nr-marquee-group'>
            <span>AL BARID BANK<i>✦</i></span>
            <span className='outline'>GROUPE OCP<i>✦</i></span>
            <span>CIH BANK<i>✦</i></span>
            <span className='outline'>MINISTÈRE DES FINANCES<i>✦</i></span>
            <span>BANK OF AFRICA<i>✦</i></span>
            <span className='outline'>CDG MAROC<i>✦</i></span>
            <span>MÉRITE RÉPUBLICAIN<i>✦</i></span>
            <span className='outline'>CONFORMITÉ CNDP<i>✦</i></span>
          </div>
          <div className='nr-marquee-group'>
            <span>AL BARID BANK<i>✦</i></span>
            <span className='outline'>GROUPE OCP<i>✦</i></span>
            <span>CIH BANK<i>✦</i></span>
            <span className='outline'>MINISTÈRE DES FINANCES<i>✦</i></span>
            <span>BANK OF AFRICA<i>✦</i></span>
            <span className='outline'>CDG MAROC<i>✦</i></span>
            <span>MÉRITE RÉPUBLICAIN<i>✦</i></span>
            <span className='outline'>CONFORMITÉ CNDP<i>✦</i></span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          6. VITRINE DES CONCOURS NATIONAUX EN COURS
          ==================================================================== */}
      <section className='nr-offres-section' id='nr-offres'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='nr-section-header'>
            <div>
              <div className='nr-hud-chip mb-2'>
                <span>AVIS DE RECRUTEMENT OFFICIELS</span>
              </div>
              <h2>
                Concours ouverts. <em>Postulez en ligne.</em>
              </h2>
            </div>
            <p>
              Consultez les offres publiées par les institutions habilitées.
              Chaque concours fait l'objet d'un avis officiel téléchargeable avec cahier des charges et barème détaillé.
            </p>
          </div>

          <div className='nr-filters-row'>
            {[
              { id: 'ALL', label: 'Toutes les institutions' },
              { id: 'ABB', label: 'Al Barid Bank' },
              { id: 'CIH', label: 'CIH Bank' },
              { id: 'OCP', label: 'Groupe OCP' },
              { id: 'MEF', label: 'Ministère des Finances' },
              { id: 'BOA', label: 'Bank of Africa' },
              { id: 'CDG', label: 'CDG Maroc' },
            ].map((inst) => (
              <button
                key={inst.id}
                className={`nr-filter-btn ${selectedSigle === inst.id ? 'is-active' : ''}`}
                onClick={() => setSelectedSigle(inst.id)}
              >
                {inst.label}
              </button>
            ))}
          </div>

          <div className='nr-offres-grid'>
            {filteredOffres.map((offre) => (
              <div key={offre._id} className='nr-offre-card'>
                <div className='nr-offre-top-bar'>
                  <span className='nr-institution-tag'>{offre.entreprise}</span>
                  {offre.urgent && (
                    <span className='badge bg-danger text-white' style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
                      CLÔTURE IMMINENTE
                    </span>
                  )}
                </div>

                <h4>{offre.titre}</h4>

                <div className='nr-offre-details'>
                  <span><i className='fas fa-map-marker-alt'></i> {offre.ville}</span>
                  <span><i className='fas fa-graduation-cap'></i> {offre.niveau}</span>
                  <span><i className='fas fa-users'></i> {offre.postes} Postes budgétaires ouverts</span>
                  <span><i className='fas fa-clock'></i> {offre.cloture}</span>
                </div>

                <div className='nr-offre-footer'>
                  <Link
                    to={userInfo ? '/profil' : '/register'}
                    className='nr-btn'
                    style={{ minHeight: '36px', padding: '0 18px', fontSize: '10px' }}
                  >
                    Postuler en Ligne <i className='fas fa-arrow-right ms-1'></i>
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
          7. SIMULATEUR DE BARÈME DYNAMIQUE SUR 100 POINTS
          ==================================================================== */}
      <section className='nr-sim-section' id='nr-simulateur'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='nr-section-header'>
            <div>
              <div className='nr-hud-chip mb-2'>
                <span>TRANSPARENCE ALGORITHMIQUE TOTALE</span>
              </div>
              <h2>
                Simulateur de Barème. <em>Calculez votre score.</em>
              </h2>
            </div>
            <p>
              Évaluez votre positionnement prévisionnel avant même de soumettre votre dossier.
              Ajustez vos critères académiques et professionnels selon le barème officiel sur 100 points.
            </p>
          </div>

          <div className='nr-sim-layout'>
            {/* Left Controls */}
            <div className='nr-sim-box'>
              <div className='nr-sim-field'>
                <label>
                  <span>1. Diplôme / Niveau d'études</span>
                  <span className='pts'>{simNiveau === 'bac2' ? '25 pts' : simNiveau === 'bac3' ? '35 pts' : simNiveau === 'bac5' ? '45 pts' : '48 pts'}</span>
                </label>
                <select className='nr-sim-select' value={simNiveau} onChange={(e) => setSimNiveau(e.target.value)}>
                  <option value='bac2'>Bac +2 (DUT, BTS, DTS, DEUG)</option>
                  <option value='bac3'>Bac +3 (Licence Fondamentale / Professionnelle)</option>
                  <option value='bac5'>Bac +5 (Master, Diplôme d'Ingénieur d'État, ENCG, ISCAE)</option>
                  <option value='doctorat'>Doctorat / Ph.D Spécialisé</option>
                </select>
              </div>

              <div className='nr-sim-field'>
                <label>
                  <span>2. Mention obtenue au diplôme requis</span>
                  <span className='pts'>{simMention === 'passable' ? '8 pts' : simMention === 'assez_bien' ? '14 pts' : simMention === 'bien' ? '18 pts' : '22 pts'}</span>
                </label>
                <select className='nr-sim-select' value={simMention} onChange={(e) => setSimMention(e.target.value)}>
                  <option value='passable'>Mention Passable (10.00 à 11.99)</option>
                  <option value='assez_bien'>Mention Assez Bien (12.00 à 13.99)</option>
                  <option value='bien'>Mention Bien (14.00 à 15.99)</option>
                  <option value='tres_bien'>Mention Très Bien (16.00 et plus)</option>
                </select>
              </div>

              <div className='nr-sim-field'>
                <label>
                  <span>3. Expérience professionnelle cumulée</span>
                  <span className='pts'>{simExp} an(s) · {Math.min(simExp * 3, 30)} pts</span>
                </label>
                <input
                  type='range'
                  className='nr-sim-range'
                  min='0'
                  max='10'
                  step='1'
                  value={simExp}
                  onChange={(e) => setSimExp(Number(e.target.value))}
                />
                <div className='d-flex justify-content-between mt-2 text-muted small' style={{ fontSize: '11px' }}>
                  <span>Débutant (0 an)</span>
                  <span>5 ans</span>
                  <span>10 ans et plus (Max 30 pts)</span>
                </div>
              </div>

              <div className='p-3 rounded mt-4' style={{ background: 'rgba(0, 242, 169, 0.08)', border: '1px solid rgba(0, 242, 169, 0.25)' }}>
                <div className='d-flex align-items-center justify-content-between mb-2'>
                  <span className='fw-bold text-white small'>
                    <i className='fas fa-briefcase text-success me-2'></i> Option "Toujours en poste"
                  </span>
                  <span className='badge bg-success text-dark fw-bold' style={{ fontSize: '9px' }}>ACTIF</span>
                </div>
                <p className='text-muted small mb-0' style={{ fontSize: '11.5px', lineHeight: '1.6' }}>
                  Dans votre dossier candidat, il vous suffit de cocher <em>« Poste actuel »</em>.
                  Le moteur calcule automatiquement vos mois d'ancienneté jusqu'à aujourd'hui sans bloquer votre date de fin.
                </p>
              </div>
            </div>

            {/* Right Neon Compass Gauge */}
            <div className='nr-gauge-wrap'>
              <svg viewBox='0 0 320 320'>
                <defs>
                  <linearGradient id='nr-gauge-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                    <stop offset='0%' stopColor='#00f2a9' />
                    <stop offset='100%' stopColor='#00d9f5' />
                  </linearGradient>
                </defs>
                <circle cx='160' cy='160' r='130' className='nr-gauge-track' />
                <circle
                  cx='160'
                  cy='160'
                  r='130'
                  className='nr-gauge-active'
                  style={{
                    strokeDasharray: gaugeCircumference,
                    strokeDashoffset: gaugeDashoffset,
                  }}
                />
              </svg>

              <div className='nr-gauge-center'>
                <span className='lbl'>NOTE PRÉVISIONNELLE</span>
                <b>
                  {simScore}
                  <em>/100</em>
                </b>
                <div className='nr-gauge-verdict'>
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
          8. LES 4 ESPACES MÉTIER DÉDIÉS
          ==================================================================== */}
      <section className='nr-espaces-section' id='nr-espaces'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='nr-section-header'>
            <div>
              <div className='nr-hud-chip mb-2'>
                <span>ENVIRONNEMENTS DÉDIÉS</span>
              </div>
              <h2>
                Quatre espaces. <em>Une seule exigence.</em>
              </h2>
            </div>
            <p>
              La plateforme interconnecte l'ensemble des parties prenantes du concours à travers des interfaces sur-mesure,
              conçues pour éliminer les retards et fluidifier chaque prise de décision.
            </p>
          </div>

          <div className='nr-espaces-grid'>
            <div className='nr-espace-card'>
              <div className='nr-espace-icon'>
                <i className='fas fa-user-graduate'></i>
              </div>
              <h4>Espace Candidat</h4>
              <p>
                Créez votre profil, téléversez vos diplômes et justificatifs d'expérience,
                suivez l'audit en direct et téléchargez votre convocation officielle avec QR-Code.
              </p>
              <Link to='/register' className='nr-btn nr-btn-outline' style={{ minHeight: '36px', fontSize: '10px' }}>
                Créer Mon Espace <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>

            <div className='nr-espace-card'>
              <div className='nr-espace-icon'>
                <i className='fas fa-balance-scale'></i>
              </div>
              <h4>Commission d'Audit</h4>
              <p>
                Interface écran scindé pour vérifier les relevés originaux scannés, ajuster immédiatement les notes
                en cas d'erreur de saisie et certifier l'admissibilité en double contrôle.
              </p>
              <Link to='/login' className='nr-btn nr-btn-outline' style={{ minHeight: '36px', fontSize: '10px' }}>
                Accès Contrôleur <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>

            <div className='nr-espace-card'>
              <div className='nr-espace-icon'>
                <i className='fas fa-building'></i>
              </div>
              <h4>Recruteur RH (Banques)</h4>
              <p>
                Publiez des concours au nom de votre institution (Al Barid Bank, OCP, CIH, MEF...), paramétrez le barème
                et exportez les listes officielles des candidats classés par ordre de mérite.
              </p>
              <Link to='/login' className='nr-btn nr-btn-outline' style={{ minHeight: '36px', fontSize: '10px' }}>
                Espace Recruteur <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>

            <div className='nr-espace-card'>
              <div className='nr-espace-icon'>
                <i className='fas fa-shield-alt'></i>
              </div>
              <h4>Direction &amp; CNDP</h4>
              <p>
                Supervision macroscopique, tableaux de bord de parité et d'équité régionale,
                journal d'audit infalsifiable avec horodatage cryptographique SHA-256.
              </p>
              <Link to='/login' className='nr-btn nr-btn-outline' style={{ minHeight: '36px', fontSize: '10px' }}>
                Supervision CNDP <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. SÉCURITÉ, GARANTIE ANTI-FRAUDE & ACCRÉDITATION CNDP
          ==================================================================== */}
      <section className='nr-security-section' id='nr-securite'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='nr-security-box'>
            <div>
              <div className='nr-hud-chip mb-3'>
                <span>CONFORMITÉ LOI 09-08</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginBottom: '20px' }}>
                La confiance républicaine. <em>Scellée par le code.</em>
              </h2>
              <p style={{ color: 'var(--nr-muted)', fontSize: '15px', lineHeight: '1.8' }}>
                Notre plateforme garantit l'inviolabilité absolue des données personnelles et professionnelles des candidats.
                Chaque consultation, chaque visa d'auditeur et chaque note réajustée est consignée dans un journal immuable
                auditable par les autorités nationales compétentes.
              </p>
            </div>

            <div className='nr-seal-card'>
              <div className='d-flex align-items-center gap-3 mb-4'>
                <i className='fas fa-certificate text-warning' style={{ fontSize: '32px' }}></i>
                <div>
                  <h5 className='text-white mb-1' style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
                    Sceau de Sécurité Cryptographique
                  </h5>
                  <span className='text-muted small'>Horodatage Certifié Conforme CNDP</span>
                </div>
              </div>

              <div className='p-3 rounded mb-3' style={{ background: 'rgba(0, 0, 0, 0.4)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nr-mint)' }}>
                <code>ROOT_HASH: 7f8a9d023bf4e8c1...100%_SECURE</code><br />
                <code>STATUS: AUDIT_TRAIL_ACTIVE · ZERO_BREACH</code>
              </div>

              <ul className='list-unstyled mb-0 text-muted small' style={{ fontSize: '12px', lineHeight: '1.8' }}>
                <li><i className='fas fa-check text-success me-2'></i> Chiffrement AES-256 de l’ensemble des pièces scannées</li>
                <li><i className='fas fa-check text-success me-2'></i> Protection intégrale conforme aux préconisations de la CNDP</li>
                <li><i className='fas fa-check text-success me-2'></i> Élimination stricte de toute interférence dans le classement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. FOIRE AUX QUESTIONS OFFICIELLES (FAQ ACCORDION)
          ==================================================================== */}
      <section className='nr-faq-section' id='nr-faq'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='nr-faq-layout'>
            <div>
              <div className='nr-hud-chip mb-2'>
                <span>ASSISTANCE AUX CANDIDATS</span>
              </div>
              <h2 style={{ fontSize: 'clamp(38px, 4.2vw, 65px)', marginBottom: '20px' }}>
                Questions <em>fréquentes.</em>
              </h2>
              <p style={{ color: 'var(--nr-muted)', fontSize: '15px', lineHeight: '1.8' }}>
                Retrouvez les réponses réglementaires aux questions les plus posées lors du dépôt de dossier,
                du calcul d'ancienneté et de l'instruction par la commission d'audit.
              </p>
            </div>

            <div className='nr-faq-list'>
              <details open>
                <summary>
                  <span>Comment fonctionne l'option « Toujours en poste » pour les expériences ?</span>
                  <i className='fas fa-plus'></i>
                </summary>
                <p>
                  Si vous exercez actuellement une activité professionnelle, il vous suffit de cocher « Poste actuel »
                  lors de la saisie de votre expérience. La date de fin est automatiquement verrouillée à « Aujourd'hui »,
                  et le moteur dynamique calcule précisément vos mois d'ancienneté cumulés sans bloquer votre validation.
                </p>
              </details>

              <details>
                <summary>
                  <span>Mon expérience dans la même année que le Bac est-elle acceptée ?</span>
                  <i className='fas fa-plus'></i>
                </summary>
                <p>
                  Oui. Le système applique désormais une validation intelligente par année : tant que votre expérience
                  commence dans l'année d'obtention de votre Baccalauréat ou après, elle est immédiatement acceptée et soumise
                  au barème de points sans blocage de date.
                </p>
              </details>

              <details>
                <summary>
                  <span>Que se passe-t-il si j'ai commis une faute de frappe sur ma note ?</span>
                  <i className='fas fa-plus'></i>
                </summary>
                <p>
                  Les membres de la commission d'audit comparent visuellement chaque relevé de notes original téléversé
                  avec les chiffres saisis. En cas de coquille mineure, l'auditeur réajuste la note selon le document officiel,
                  garantissant que votre candidature ne soit pas pénalisée injustement.
                </p>
              </details>

              <details>
                <summary>
                  <span>Comment et quand recevrai-je ma convocation officielle ?</span>
                  <i className='fas fa-plus'></i>
                </summary>
                <p>
                  Dès la clôture de la phase d'audit par la commission, la liste des candidats admissibles est publiée.
                  Votre convocation officielle nominative (comportant votre centre d'examen, salle, numéro de table et QR-Code)
                  sera téléchargeable directement depuis votre espace personnel.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. FOOTER INSTITUTIONNEL HAUTE PRÉCISION
          ==================================================================== */}
      <footer className='nr-footer'>
        <div className='nr-footer-inner'>
          <div>
            <div className='nr-brand' style={{ fontSize: '30px', marginBottom: '18px' }}>
              RECRUTEMENT<span>.MA</span>
            </div>
            <p style={{ maxWidth: '340px', lineHeight: '1.7', fontSize: '13px', color: 'var(--nr-muted)' }}>
              Portail National de Centralisation et de Gestion des Concours d’Accès aux Grandes Institutions Bancaires,
              Établissements Publics et Organismes Financiers au Maroc.
            </p>
            <div className='nr-hud-chip mt-4' style={{ fontSize: '9px' }}>
              <span className='nr-dot-live'></span>
              <span>CONFORME LOI 09-08 · CNDP</span>
            </div>
          </div>

          <div className='nr-footer-col'>
            <h5>La Plateforme</h5>
            <a href='#nr-pipeline'>Le Parcours du Mérite</a>
            <a href='#nr-offres'>Concours Ouverts</a>
            <a href='#nr-simulateur'>Simulateur de Barème</a>
            <a href='#nr-espaces'>Espaces Métier</a>
          </div>

          <div className='nr-footer-col'>
            <h5>Institutions Partenaires</h5>
            <a href='#nr-offres'>Al Barid Bank</a>
            <a href='#nr-offres'>Groupe OCP</a>
            <a href='#nr-offres'>CIH Bank</a>
            <a href='#nr-offres'>Ministère de l'Économie &amp; Finances</a>
            <a href='#nr-offres'>Bank of Africa (BMCE)</a>
            <a href='#nr-offres'>Caisse de Dépôt et de Gestion</a>
          </div>

          <div className='nr-footer-col'>
            <h5>Accès Direct</h5>
            <Link to='/login'>Espace Recruteur RH</Link>
            <Link to='/login'>Espace Commission d'Audit</Link>
            <Link to='/register'>Créer Dossier Candidat</Link>
            <a href='#nr-faq'>Assistance &amp; Règlement</a>
          </div>
        </div>

        <div className='nr-footer-watermark'>
          RECRUTEMENT<span>.MA</span>
        </div>

        <div className='nr-footer-bottom'>
          <span>© 2026 EHC Experts Human Capital — Portail National Recrutement.ma</span>
          <span>SÉLECTION AU MÉRITE RÉPUBLICAIN · CONFORME CNDP MAROC</span>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
