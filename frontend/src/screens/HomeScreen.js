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

const PARTNERS_LIST = [
  { name: 'Al Barid Bank', tag: 'Réseau Bancaire & Postal', icon: 'fas fa-university text-warning', status: 'SESSION 2026' },
  { name: 'Groupe OCP', tag: 'Leader Minier & Chimique', icon: 'fas fa-industry text-success', status: 'CONCOURS ACTIF' },
  { name: 'CIH Bank', tag: 'Banque Digitale & Particuliers', icon: 'fas fa-landmark text-info', status: 'SESSION 2026' },
  { name: 'Ministère des Finances', tag: 'Administration Centrale', icon: 'fas fa-balance-scale text-warning', status: 'RECRUTEMENT ÉTAT' },
  { name: 'Bank of Africa (BMCE)', tag: 'Groupe Panafricain', icon: 'fas fa-globe-africa text-info', status: 'CONCOURS ACTIF' },
  { name: 'Caisse de Dépôt (CDG)', tag: 'Organisme Financier Public', icon: 'fas fa-shield-alt text-success', status: 'SESSION 2026' },
  { name: 'Commission CNDP', tag: 'Protection Données (Loi 09-08)', icon: 'fas fa-certificate text-danger', status: 'ACCRÉDITÉ' },
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

const MOROCCAN_CITIES = [
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898, postes: 185 },
  { name: 'Rabat', lat: 34.0209, lon: -6.8416, postes: 140 },
  { name: 'Tanger', lat: 35.7595, lon: -5.8340, postes: 65 },
  { name: 'Marrakech', lat: 31.6295, lon: -7.9811, postes: 55 },
  { name: 'Fès', lat: 34.0331, lon: -5.0003, postes: 45 },
  { name: 'Oujda', lat: 34.6867, lon: -1.9114, postes: 30 },
  { name: 'Agadir', lat: 30.4278, lon: -9.5981, postes: 40 },
];

const SECTIONS_NAV = [
  { id: 'xr-top', label: '01 ACCUEIL' },
  { id: 'xr-facts', label: '02 MATRICE' },
  { id: 'xr-pipeline', label: '03 PARCOURS' },
  { id: 'xr-offres', label: '04 CONCOURS' },
  { id: 'xr-simulateur', label: '05 SIMULATEUR' },
  { id: 'xr-espaces', label: '06 ESPACES' },
  { id: 'xr-securite', label: '07 CONFORMITÉ' },
  { id: 'xr-faq', label: '08 FAQ' },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // User auth state
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

  // Theme state with localStorage persistence (Light Mode / Dark Mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('xr_theme') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('xr_theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Scroll Progress, ScrollY & Active Section Spy
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('xr-top');

  // Custom Cursor
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorHovered, setCursorHovered] = useState(false);

  // Animated Facts Counters
  const [countFact1, setCountFact1] = useState(0);
  const [countFact2, setCountFact2] = useState(0);
  const [countFact3, setCountFact3] = useState(0);

  // Canvas Ref for 3D Globe & Particles
  const canvasRef = useRef(null);

  // 1. Fetch Offres from API if available
  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const { data } = await axios.get('/api/offres');
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item, idx) => {
            const entObj = item.entreprise && typeof item.entreprise === 'object' ? item.entreprise : {};
            const entNom =
              entObj.nom ||
              item.entrepriseNom ||
              (typeof item.entreprise === 'string' && item.entreprise.trim() ? item.entreprise : 'Institution Partenaire');
            const entSigle =
              entObj.sigle ||
              item.entrepriseSigle ||
              (typeof item.entreprise === 'string' && item.entreprise.trim() ? item.entreprise.split(' ')[0] : 'ORG');
            const entLogo = entObj.logo || item.entrepriseLogo || '';
            const entCouleur = entObj.couleurPrimaire || item.entrepriseCouleur || '#003366';

            return {
              _id: item._id || `off-${idx}`,
              titre: item.titre || item.intitule || 'Poste à pourvoir',
              entreprise: entNom,
              sigle: entSigle,
              logo: entLogo,
              couleur: entCouleur,
              secteur: item.secteur || entObj.secteur || 'Secteur Public / Bancaire',
              ville: item.ville || item.lieu || 'Réseau National',
              niveau: item.niveau || 'Bac +2 à Bac +5',
              postes: Number(item.postes) || Number(item.nombrePostes) || 1,
              cloture: item.dateLimite
                ? `Clôture: ${new Date(item.dateLimite).toLocaleDateString('fr-FR')}`
                : item.cloture || 'En cours',
              urgent: idx === 0 || Boolean(item.urgent),
              pdfUrl: item.pdfUrl || '',
            };
          });
          setOffres(mapped);
        }
      } catch (e) {
        console.error('Error fetching offres for landing page:', e);
        setOffres(DEFAULT_FEATURED_OFFRES);
      }
    };
    fetchOffres();
  }, []);

  // 2. SCROLL ANIMATION ENGINE: Intersection Observer for dynamic entrance
  useEffect(() => {
    const revealElements = document.querySelectorAll('[data-scroll-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('is-revealed');
      }
      observer.observe(el);
    });

    // Section Spy for Vertical Navigation
    const sectionElements = SECTIONS_NAV.map((s) => document.getElementById(s.id)).filter(Boolean);
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.25 }
    );

    sectionElements.forEach((el) => sectionObserver.observe(el));

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, [offres, activeStageIndex]);

  // 3. Animated Numbers Counter Trigger on Scroll
  useEffect(() => {
    const factsEl = document.getElementById('xr-facts');
    if (!factsEl) return;

    let hasCounted = false;
    const factsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasCounted) {
          hasCounted = true;
          // Count Fact 1: 0 -> 6
          let c1 = 0;
          const t1 = setInterval(() => {
            c1++;
            setCountFact1(c1);
            if (c1 >= 6) clearInterval(t1);
          }, 120);

          // Count Fact 2: 0 -> 100
          let c2 = 0;
          const t2 = setInterval(() => {
            c2 += 4;
            setCountFact2(Math.min(c2, 100));
            if (c2 >= 100) clearInterval(t2);
          }, 35);

          // Count Fact 3: 0 -> 100
          let c3 = 0;
          const t3 = setInterval(() => {
            c3 += 4;
            setCountFact3(Math.min(c3, 100));
            if (c3 >= 100) clearInterval(t3);
          }, 35);
        }
      },
      { threshold: 0.25 }
    );

    factsObserver.observe(factsEl);
    return () => factsObserver.disconnect();
  }, []);

  // 4. Scroll Progress & ScrollY Tracker
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 5. Custom Magnetic Holographic Cursor Tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      if (!cursorVisible) setCursorVisible(true);
    };

    const handleMouseLeave = () => setCursorVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleOver = (e) => {
      const target = e.target.closest('a, button, input, select, .xr-clickable, [role="button"]');
      setCursorHovered(!!target);
    };

    document.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleOver);
    };
  }, [cursorVisible]);

  // 6. Ultra 3D Moroccan FinTech Gyroscope & Holographic Core Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const isLight = theme === 'light';
    const initParticles = (w, h) => {
      const particleCount = Math.min(Math.floor((w * h) / 9500), 120);
      const arr = [];
      for (let i = 0; i < particleCount; i++) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2.2 + 0.6,
          alpha: Math.random() * 0.6 + 0.25,
          color: isLight
            ? (i % 3 === 0 ? '#00875a' : i % 3 === 1 ? '#0284c7' : '#d97706')
            : (i % 3 === 0 ? '#00f2a9' : i % 3 === 1 ? '#00d9f5' : '#ffd166'),
        });
      }
      return arr;
    };

    let particles = initParticles(width, height);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      particles = initParticles(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Dynamic Data Photon Packets traveling between Moroccan cities
    const photonPackets = [];
    for (let i = 0; i < 14; i++) {
      photonPackets.push({
        fromIdx: Math.floor(Math.random() * MOROCCAN_CITIES.length),
        toIdx: Math.floor(Math.random() * MOROCCAN_CITIES.length),
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.008,
      });
    }

    let targetRotX = 0.15;
    let targetRotY = 0;
    let currentRotX = 0.15;
    let currentRotY = 0;
    let mouse = { x: width / 2, y: height / 2 };

    const handleCanvasMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      targetRotY = (mouse.x / width - 0.5) * 1.5;
      targetRotX = (mouse.y / height - 0.5) * 1.0;
    };
    window.addEventListener('mousemove', handleCanvasMouse);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const time = Date.now() * 0.0018;

      // Dynamically calculate globe center & radius on every animation frame
      const globeRadius = Math.min(width, height) * 0.32;
      const globeCenterX = width * 0.5;
      const globeCenterY = height * 0.52;

      // Smooth inertia rotation easing
      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;
      const rotY = currentRotY + time * 0.18;
      const rotX = currentRotX;

      // 1. Draw Starfield Particles
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
          p.x -= (dxMouse / distMouse) * 1.2;
          p.y -= (dyMouse / distMouse) * 1.2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1;

        for (let j = i + 1; j < particles.length; j += 2) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 242, 169, ${0.14 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }

      // 2. CONCENTRIC 3D GYROSCOPE HOLOGRAPHIC RINGS
      // Ring 1: Inner Emerald Ring
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(globeCenterX, globeCenterY, globeRadius * 1.15, globeRadius * 0.38, rotY * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? 'rgba(0, 135, 90, 0.45)' : 'rgba(0, 242, 169, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = isLight ? '#00875a' : '#00f2a9';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // Ring 2: Middle Electric Azure Ring (Reverse Tilt)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(globeCenterX, globeCenterY, globeRadius * 1.35, globeRadius * 0.48, -rotY * 0.8 + 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(0, 217, 245, 0.35)';
      ctx.setLineDash([8, 12]);
      ctx.lineWidth = 1.4;
      ctx.shadowColor = isLight ? '#0284c7' : '#00d9f5';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      // Ring 3: Outer Imperial Gold Orbit with Satellite Nodes
      ctx.save();
      const goldOrbitR_X = globeRadius * 1.58;
      const goldOrbitR_Y = globeRadius * 0.62;
      const goldAngle = rotY * 0.4 - 0.5;
      ctx.beginPath();
      ctx.ellipse(globeCenterX, globeCenterY, goldOrbitR_X, goldOrbitR_Y, goldAngle, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? 'rgba(180, 83, 9, 0.35)' : 'rgba(255, 209, 102, 0.28)';
      ctx.setLineDash([4, 16]);
      ctx.lineWidth = 1.2;
      ctx.shadowColor = isLight ? '#b45309' : '#ffd166';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // 3 Orbiting Gold Satellites
      for (let s = 0; s < 3; s++) {
        const satAngle = time * 0.7 + (s * (Math.PI * 2)) / 3;
        const satX = globeCenterX + Math.cos(satAngle) * goldOrbitR_X * Math.cos(goldAngle) - Math.sin(satAngle) * goldOrbitR_Y * Math.sin(goldAngle);
        const satY = globeCenterY + Math.cos(satAngle) * goldOrbitR_X * Math.sin(goldAngle) + Math.sin(satAngle) * goldOrbitR_Y * Math.cos(goldAngle);
        ctx.beginPath();
        ctx.arc(satX, satY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#b45309' : '#ffd166';
        ctx.shadowColor = isLight ? '#b45309' : '#ffd166';
        ctx.shadowBlur = 14;
        ctx.fill();
      }
      ctx.restore();

      // 3. 3D Holographic Wireframe Globe Lat/Lon Grid
      for (let lat = -60; lat <= 60; lat += 20) {
        const radLat = (lat * Math.PI) / 180;
        const rLat = globeRadius * Math.cos(radLat);
        const yLat = globeRadius * Math.sin(radLat);

        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 12) {
          const radLon = (lon * Math.PI) / 180 + rotY;
          const x = globeCenterX + rLat * Math.sin(radLon);
          const y = globeCenterY - yLat * Math.cos(rotX) + rLat * Math.cos(radLon) * Math.sin(rotX);
          const z = rLat * Math.cos(radLon) * Math.cos(rotX) + yLat * Math.sin(rotX);

          if (z > -globeRadius * 0.45) {
            if (lon === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = 'rgba(0, 242, 169, 0.08)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }

      // 4. Moroccan Regional Beacons, Radar Sonar Rings & Laser Mesh
      const cityPoints = [];
      for (let i = 0; i < MOROCCAN_CITIES.length; i++) {
        const city = MOROCCAN_CITIES[i];
        const latRad = ((city.lat - 32) * Math.PI) / 70;
        const lonRad = ((city.lon + 6) * Math.PI) / 70 + rotY;

        const x = globeCenterX + globeRadius * Math.sin(lonRad) * Math.cos(latRad);
        const y = globeCenterY - globeRadius * Math.sin(latRad) * Math.cos(rotX) + globeRadius * Math.cos(lonRad) * Math.cos(latRad) * Math.sin(rotX);
        const z = globeRadius * Math.cos(lonRad) * Math.cos(latRad) * Math.cos(rotX) + globeRadius * Math.sin(latRad) * Math.sin(rotX);

        if (z > -60) {
          cityPoints.push({ x, y, name: city.name, postes: city.postes, z });

          // Expanding Sonar Wave
          const pulse = (Math.sin(time * 3.5 + i) + 1) * 0.5;
          ctx.beginPath();
          ctx.arc(x, y, 6 + pulse * 14, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 242, 169, ${0.4 * (1 - pulse)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Core Glowing Node
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#00f2a9';
          ctx.shadowColor = '#00f2a9';
          ctx.shadowBlur = 16;
          ctx.fill();

          // City Label with JetBrains Mono Badge
          ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
          ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
          ctx.shadowColor = isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 4;
          ctx.fillText(`${city.name.toUpperCase()} · ${city.postes}P`, x + 9, y + 3.5);
        }
      }

      // Inter-City Laser Grid
      ctx.beginPath();
      for (let i = 0; i < cityPoints.length; i++) {
        for (let j = i + 1; j < cityPoints.length; j++) {
          ctx.moveTo(cityPoints[i].x, cityPoints[i].y);
          ctx.lineTo(cityPoints[j].x, cityPoints[j].y);
        }
      }
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.25)' : 'rgba(0, 217, 245, 0.18)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 4;
      ctx.shadowColor = isLight ? '#0284c7' : '#00d9f5';
      ctx.stroke();

      // 5. Traveling Photon Packets (High-Speed Data Light)
      for (let k = 0; k < photonPackets.length; k++) {
        const pkt = photonPackets[k];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.fromIdx = Math.floor(Math.random() * cityPoints.length);
          pkt.toIdx = Math.floor(Math.random() * cityPoints.length);
        }
        if (cityPoints[pkt.fromIdx] && cityPoints[pkt.toIdx]) {
          const pA = cityPoints[pkt.fromIdx];
          const pB = cityPoints[pkt.toIdx];
          const curX = pA.x + (pB.x - pA.x) * pkt.progress;
          const curY = pA.y + (pB.y - pA.y) * pkt.progress;

          ctx.beginPath();
          ctx.arc(curX, curY, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#b45309' : '#ffd166';
          ctx.shadowColor = isLight ? '#b45309' : '#ffd166';
          ctx.shadowBlur = 12;
          ctx.fill();
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
  }, [theme]);

  // 7. Interactive 3D Card Spotlight & Magnetic Tilt on Hover (Aceternity UI Standard)
  useEffect(() => {
    const handleCardsMove = (e) => {
      const cards = document.querySelectorAll(
        '.xr-offre-card, .xr-fact-card, .xr-espace-card, .xr-pipeline-card, .xr-seal-card, .xr-sim-box'
      );
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= -40 && x <= rect.width + 40 && y >= -40 && y <= rect.height + 40) {
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotX = ((y - centerY) / centerY) * -5.5;
          const rotY = ((x - centerX) / centerX) * 5.5;
          card.style.setProperty('--card-rot-x', `${rotX.toFixed(2)}deg`);
          card.style.setProperty('--card-rot-y', `${rotY.toFixed(2)}deg`);
        } else {
          card.style.setProperty('--card-rot-x', '0deg');
          card.style.setProperty('--card-rot-y', '0deg');
        }
      });
    };
    window.addEventListener('mousemove', handleCardsMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleCardsMove);
  }, [offres, activeStageIndex]);

  // Filtered Offres
  const filteredOffres = useMemo(() => {
    return offres.filter((item) => {
      const matchSearch =
        (item.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.entreprise || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ville || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchSigle = selectedSigle === 'ALL' || item.sigle === selectedSigle;
      const matchVille = selectedVille === 'ALL' || (item.ville || '').toLowerCase().includes(selectedVille.toLowerCase());
      return matchSearch && matchSigle && matchVille;
    });
  }, [offres, searchTerm, selectedSigle, selectedVille]);

  // Dynamic Institution Tabs derived from current offres
  const institutionTabs = useMemo(() => {
    const tabs = [{ id: 'ALL', label: 'Toutes les institutions', count: offres.length }];
    const uniqueMap = new Map();

    offres.forEach((o) => {
      const sigle = o.sigle || 'AUTRE';
      const label = o.entreprise || sigle;
      if (!uniqueMap.has(sigle)) {
        uniqueMap.set(sigle, { id: sigle, label, count: 0 });
      }
      uniqueMap.get(sigle).count += 1;
    });

    uniqueMap.forEach((val) => {
      tabs.push(val);
    });

    return tabs;
  }, [offres]);

  // Simulator Score Breakdown Calculations
  const simScoreDiplome = useMemo(() => {
    if (simNiveau === 'bac2') return 25;
    if (simNiveau === 'bac3') return 35;
    if (simNiveau === 'bac5') return 45;
    return 48;
  }, [simNiveau]);

  const simScoreMention = useMemo(() => {
    if (simMention === 'passable') return 8;
    if (simMention === 'assez_bien') return 14;
    if (simMention === 'bien') return 18;
    return 22;
  }, [simMention]);

  const simScoreExp = useMemo(() => {
    return Math.min(Number(simExp) * 3, 30);
  }, [simExp]);

  const simScore = useMemo(() => {
    return Math.min(simScoreDiplome + simScoreMention + simScoreExp, 100);
  }, [simScoreDiplome, simScoreMention, simScoreExp]);

  const gaugeCircumference = 2 * Math.PI * 130;
  const gaugeDashoffset = gaugeCircumference - (gaugeCircumference * simScore) / 100;

  const handleLogout = () => {
    dispatch(logout());
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const currentStage = PIPELINE_STAGES[activeStageIndex];

  return (
    <div className='xr-universe' data-theme={theme}>
      {/* 0. Top Glowing Scroll Progress Bar */}
      <div className='xr-progress' style={{ transform: `scaleX(${scrollProgress})` }} />

      {/* 0. Custom Magnetic Holographic Cursor */}
      <div
        className='xr-cursor'
        data-visible={cursorVisible ? 'true' : 'false'}
        data-action={cursorHovered ? 'true' : 'false'}
        style={{ transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)` }}
      >
        <span>{cursorHovered ? '↗' : ''}</span>
      </div>

      {/* 0. Vertical Awwwards HUD Section Scroll Navigator */}
      <div className='xr-scroll-nav'>
        {SECTIONS_NAV.map((sec) => (
          <button
            key={sec.id}
            className={`xr-scroll-dot-wrap ${activeSection === sec.id ? 'is-active' : ''}`}
            onClick={() => scrollToSection(sec.id)}
            aria-label={`Aller à ${sec.label}`}
          >
            <span className='xr-scroll-dot-label'>{sec.label}</span>
            <div className='xr-scroll-dot'></div>
          </button>
        ))}
      </div>

      {/* ====================================================================
          1. NAVBAR SUPRÊME FLOTTANTE ACRYLIQUE
          ==================================================================== */}
      <header className='xr-nav'>
        <Link to='/' className='xr-brand'>
          RECRUTEMENT<span>.MA</span>
          <span className='xr-brand-badge'>PORTAIL OFFICIEL</span>
        </Link>

        <nav className='xr-nav-links'>
          <a href='#xr-pipeline'>Le Parcours du Mérite</a>
          <a href='#xr-offres'>Concours Ouverts</a>
          <a href='#xr-simulateur'>Simulateur de Barème</a>
          <a href='#xr-espaces'>Espaces Métier</a>
          <a href='#xr-securite'>Audit &amp; CNDP</a>
          <a href='#xr-faq'>FAQ</a>
        </nav>

        <div className='xr-nav-actions'>
          {/* Light Mode / Dark Mode Theme Switcher */}
          <button
            onClick={toggleTheme}
            className='xr-theme-toggle'
            title={theme === 'dark' ? 'Activer le Mode Clair (Light)' : 'Activer le Mode Sombre (Dark)'}
            aria-label='Basculer le thème'
          >
            <div className={`xr-theme-track ${theme === 'light' ? 'is-light' : ''}`}>
              <i className='fas fa-moon xr-theme-icon-moon'></i>
              <i className='fas fa-sun xr-theme-icon-sun'></i>
              <div className='xr-theme-thumb'></div>
            </div>
          </button>
          {userInfo ? (
            <div className='d-flex align-items-center gap-2'>
              {userInfo.isAdministrateur ? (
                <button
                  onClick={() => navigate('/administrateur/candidatures')}
                  className='xr-btn xr-btn-outline'
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '10px' }}
                >
                  <i className='fas fa-shield-alt me-1 text-warning'></i> Admin Central
                </button>
              ) : userInfo.isMaitreOuvrage ? (
                <button
                  onClick={() => navigate('/maitre-ouvrage/candidatures')}
                  className='xr-btn xr-btn-outline'
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '10px' }}
                >
                  <i className='fas fa-building me-1 text-info'></i> Espace Recruteur
                </button>
              ) : (
                <button
                  onClick={() => navigate('/profil')}
                  className='xr-btn xr-btn-outline'
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
              <Link to='/login' className='xr-btn xr-btn-outline' style={{ minHeight: '38px', padding: '0 16px', fontSize: '10.5px' }}>
                Connexion
              </Link>
              <Link to='/register' className='xr-btn' style={{ minHeight: '38px', padding: '0 18px', fontSize: '10.5px' }}>
                Créer Mon Dossier <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ====================================================================
          2. HERO 3D : GLOBE HOLOGRAPHIQUE & RECHERCHE INSTANTANÉE
          ==================================================================== */}
      <section className='xr-hero' id='xr-top'>
        <div className='xr-hero-bg' />
        <canvas ref={canvasRef} className='xr-canvas-layer' />

        <div
          className='xr-hero-content'
          data-scroll-reveal='zoom-in'
          style={{
            transform: `translate3d(0, ${scrollY * 0.22}px, 0)`,
            opacity: Math.max(0, 1 - scrollY / 720),
          }}
        >
          <div className='xr-hud-pill'>
            <span className='xr-pulse-dot'></span>
            <span>SYSTÈME NATIONAL SÉCURISÉ · SÉLECTION AU MÉRITE RÉPUBLICAIN · SESSION 2026</span>
          </div>

          <h1 className='xr-hero-title'>
            L'Équité du Concours. <em>La Rigueur de l'Audit.</em><br />
            Du Dépôt Numérique <em>à l'Affectation Nationale.</em>
          </h1>

          <p className='xr-hero-sub'>
            Plateforme souveraine de centralisation des concours d’accès aux grandes institutions bancaires,
            organismes financiers et établissements publics au Maroc. Barèmes algorithmiques transparents,
            audit visuel en double-contrôle et récépissé numérique horodaté conforme Loi 09-08 (CNDP).
          </p>

          {/* Instant Multi-Criteria Search Engine */}
          <div className='xr-search-box' data-scroll-reveal='fade-up'>
            <i className='fas fa-search text-muted'></i>
            <input
              type='text'
              placeholder='Rechercher un poste, diplôme, mot-clé (ex: Guichetier, Ingénieur...)'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={selectedSigle} onChange={(e) => setSelectedSigle(e.target.value)}>
              {institutionTabs.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.id === 'ALL' ? inst.label : `${inst.label} (${inst.id})`}
                </option>
              ))}
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
            <a href='#xr-offres' className='xr-btn' style={{ minHeight: '38px', padding: '0 18px', fontSize: '10.5px' }}>
              Trouver <i className='fas fa-arrow-down ms-1'></i>
            </a>
          </div>

          <div className='xr-hero-hud' data-scroll-reveal='fade-up'>
            <span>AUDIT CRYPTOGRAPHIQUE ACTIF (SHA-256)</span>
            <div>
              <i className='hud-bar is-active'></i>
              <i className='hud-bar is-active'></i>
              <i className='hud-bar is-active'></i>
              <i className='hud-bar'></i>
            </div>
            <span>CONFORMITÉ LOI 09-08 CNDP · ZÉRO FRAUDE TOLÉRÉE</span>
          </div>

          {/* Animated Scroll Down Indicator */}
          <a
            href='#xr-facts'
            className='xr-scroll-indicator'
            data-scroll-reveal='fade-up'
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('xr-facts');
            }}
          >
            <span className='xr-scroll-indicator-text'>DÉCOUVRIR LE PARCOURS DU MÉRITE</span>
            <div className='xr-scroll-indicator-mouse'>
              <div className='xr-scroll-indicator-wheel'></div>
            </div>
            <i className='fas fa-chevron-down xr-scroll-indicator-arrow'></i>
          </a>
        </div>
      </section>

      {/* ====================================================================
          3. MATRICE DE CONFIANCE (FACTS TELEMETRY BENTO) AVEC ANIMATIONS HAUTE PRÉCISION
          ==================================================================== */}
      <section className='xr-facts-strip' id='xr-facts'>
        <div className='xr-facts-container xr-stagger' data-scroll-reveal='fade-up'>
          {/* Bento Card 1: 6 Grandes Institutions */}
          <div className='xr-fact-card'>
            <div className='xr-fact-corner xr-corner-tl'></div>
            <div className='xr-fact-corner xr-corner-br'></div>
            <div className='xr-fact-header'>
              <span className='xr-fact-badge'>
                <span className='xr-pulse-dot'></span> SOUVERAINETÉ
              </span>
              <div className='xr-fact-icon-box'>
                <i className='fas fa-university'></i>
              </div>
            </div>
            <div className='xr-fact-metric'>
              <b>{countFact1}</b>
              <span className='xr-fact-unit'>RÉSEAUX</span>
            </div>
            <p className='xr-fact-desc'>
              Grandes institutions bancaires &amp; établissements d'État partenaires
            </p>
            <div className='xr-fact-nodes'>
              <span className='xr-node-dot is-active' title='Al Barid Bank'></span>
              <span className='xr-node-line'></span>
              <span className='xr-node-dot is-active' title='Groupe OCP'></span>
              <span className='xr-node-line'></span>
              <span className='xr-node-dot is-active' title='CIH Bank'></span>
              <span className='xr-node-line'></span>
              <span className='xr-node-dot is-active' title='Ministère Finances'></span>
              <span className='xr-node-line'></span>
              <span className='xr-node-dot is-active' title='Bank of Africa'></span>
              <span className='xr-node-line'></span>
              <span className='xr-node-dot is-active' title='CDG Maroc'></span>
            </div>
          </div>

          {/* Bento Card 2: 100% Double Aveugle */}
          <div className='xr-fact-card'>
            <div className='xr-fact-corner xr-corner-tl'></div>
            <div className='xr-fact-corner xr-corner-br'></div>
            <div className='xr-fact-header'>
              <span className='xr-fact-badge' style={{ borderColor: 'rgba(0, 217, 245, 0.4)', color: '#00d9f5' }}>
                <span className='xr-pulse-dot' style={{ background: '#00d9f5' }}></span> ZÉRO FRAUDE
              </span>
              <div
                className='xr-fact-icon-box'
                style={{
                  background: 'rgba(0, 217, 245, 0.1)',
                  borderColor: 'rgba(0, 217, 245, 0.3)',
                  color: '#00d9f5',
                }}
              >
                <i className='fas fa-user-shield'></i>
              </div>
            </div>
            <div className='xr-fact-metric'>
              <b>{countFact2}<em>%</em></b>
              <span className='xr-fact-unit'>AUDIT VISUEL</span>
            </div>
            <p className='xr-fact-desc'>
              Instruction en double-aveugle sur écran scindé certifiée anti-fraude
            </p>
            <div className='xr-fact-scanbar'>
              <div className='xr-scan-item'>
                <span>DÉCLARÉ</span>
                <div className='xr-scan-track'>
                  <div className='xr-scan-fill is-match'></div>
                </div>
              </div>
              <i className='fas fa-check-double text-success'></i>
              <div className='xr-scan-item'>
                <span>ORIGINAL</span>
                <div className='xr-scan-track'>
                  <div className='xr-scan-fill is-match'></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 3: 100 Points Algorithmiques */}
          <div className='xr-fact-card'>
            <div className='xr-fact-corner xr-corner-tl'></div>
            <div className='xr-fact-corner xr-corner-br'></div>
            <div className='xr-fact-header'>
              <span className='xr-fact-badge' style={{ borderColor: 'rgba(255, 209, 102, 0.4)', color: '#ffd166' }}>
                <span className='xr-pulse-dot' style={{ background: '#ffd166' }}></span> TRANSPARENCE
              </span>
              <div
                className='xr-fact-icon-box'
                style={{
                  background: 'rgba(255, 209, 102, 0.1)',
                  borderColor: 'rgba(255, 209, 102, 0.3)',
                  color: '#ffd166',
                }}
              >
                <i className='fas fa-balance-scale'></i>
              </div>
            </div>
            <div className='xr-fact-metric'>
              <b>{countFact3}</b>
              <span className='xr-fact-unit'>POINTS MÉRITE</span>
            </div>
            <p className='xr-fact-desc'>
              Barème algorithmique transparent et immuable sans favoritisme
            </p>
            <div className='xr-fact-eq'>
              <span style={{ animationDelay: '0s' }}></span>
              <span style={{ animationDelay: '0.2s' }}></span>
              <span style={{ animationDelay: '0.4s' }}></span>
              <span style={{ animationDelay: '0.1s' }}></span>
              <span style={{ animationDelay: '0.3s' }}></span>
              <span style={{ animationDelay: '0.5s' }}></span>
              <span style={{ animationDelay: '0.25s' }}></span>
            </div>
          </div>

          {/* Bento Card 4: 0 ms Latence */}
          <div className='xr-fact-card'>
            <div className='xr-fact-corner xr-corner-tl'></div>
            <div className='xr-fact-corner xr-corner-br'></div>
            <div className='xr-fact-header'>
              <span className='xr-fact-badge'>
                <span className='xr-pulse-dot'></span> TEMPS RÉEL
              </span>
              <div className='xr-fact-icon-box'>
                <i className='fas fa-bolt'></i>
              </div>
            </div>
            <div className='xr-fact-metric'>
              <b>0<em>ms</em></b>
              <span className='xr-fact-unit'>LATENCE CALCUL</span>
            </div>
            <p className='xr-fact-desc'>
              Calcul instantané d'ancienneté professionnelle pour candidat en poste
            </p>
            <div className='xr-fact-ping'>
              <span className='xr-ping-live'></span>
              <code>ENGINE_ACTIVE · BUFFER 0.04ms</code>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. LE PARCOURS DU MÉRITE RÉPUBLICAIN (INTERACTIVE 5-STAGE PIPELINE)
          ==================================================================== */}
      <section className='xr-pipeline-section' id='xr-pipeline'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='xr-pipeline-header' data-scroll-reveal='fade-up'>
            <div className='xr-hud-chip mb-3'>
              <span className='xr-pulse-dot'></span>
              <span>TRAÇABILITÉ TOTALE DE BOUT EN BOUT · 5 ÉTAPES CERTIFIÉES</span>
            </div>
            <h2 className='xr-pipeline-title'>
              Le Parcours du Mérite. <em>Transparence absolue en 5 étapes.</em>
            </h2>
            <p className='xr-pipeline-desc'>
              Chaque concours national suit une procédure rigoureusement auditée, garantissant aux candidats
              comme aux recruteurs un traitement impartial, transparent et conforme aux plus hauts standards réglementaires.
            </p>
          </div>

          {/* Pipeline Stage Buttons */}
          <div className='xr-pipeline-nav' data-scroll-reveal='fade-up'>
            {PIPELINE_STAGES.map((st, idx) => (
              <button
                key={st.num}
                className={`xr-pipeline-tab ${activeStageIndex === idx ? 'is-active' : ''}`}
                onClick={() => setActiveStageIndex(idx)}
              >
                <div className='xr-tab-glow-bar'></div>
                <div className='d-flex align-items-center justify-content-between mb-1'>
                  <span className='num'>PHASE {st.num}</span>
                  <span className={`xr-tab-dot ${activeStageIndex === idx ? 'is-active' : ''}`}></span>
                </div>
                <strong>{st.short.replace(/^\d+\.\s*/, '')}</strong>
              </button>
            ))}
          </div>

          {/* Pipeline Interactive Card */}
          <div className='xr-pipeline-card' key={currentStage.num} data-scroll-reveal='rotate-in'>
            <div className='xr-fact-corner xr-corner-tl'></div>
            <div className='xr-fact-corner xr-corner-br'></div>

            <div className='xr-pipeline-left'>
              <div className='d-flex align-items-center gap-2 mb-3'>
                <div className='xr-hud-chip' style={{ fontSize: '9.5px' }}>
                  <span>{currentStage.tag}</span>
                </div>
                <span className='xr-stage-pill'>ÉTAPE {currentStage.num} / 05</span>
              </div>

              <h3>{currentStage.title}</h3>
              <p>{currentStage.desc}</p>

              <ul className='xr-pipeline-points'>
                {currentStage.points.map((pt, i) => (
                  <li key={i}>
                    <div className='xr-point-icon'>
                      <i className='fas fa-check'></i>
                    </div>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className='d-flex align-items-center gap-3 pt-2'>
                <Link to='/register' className='xr-btn'>
                  Commencer mon dossier <i className='fas fa-arrow-right ms-1'></i>
                </Link>
                <a href='#xr-simulateur' className='xr-btn xr-btn-outline'>
                  <i className='fas fa-calculator me-1 text-info'></i> Simuler mon barème
                </a>
              </div>
            </div>

            {/* Right Interactive Telemetry & Mission Control Box */}
            <div className='xr-pipeline-visual'>
              <div className='xr-pipeline-visual-header'>
                <div className='d-flex align-items-center gap-2'>
                  <span className='xr-pulse-dot'></span>
                  <span>MÉTRIQUE OPÉRATIONNELLE · STAGE_{currentStage.num}</span>
                </div>
                <span className='xr-visual-badge'>{currentStage.badge}</span>
              </div>

              <div className='xr-pipeline-cockpit'>
                <div className='xr-cockpit-ring'>
                  <div className='xr-cockpit-val'>{currentStage.metric}</div>
                  <div className='xr-cockpit-sub'>Garantie d'intégrité nationale certifiée EHC</div>
                </div>
              </div>

              {/* SHA-256 Dynamic Hash Feed */}
              <div className='xr-crypto-stream'>
                <div className='xr-crypto-head'>
                  <i className='fas fa-fingerprint text-warning me-1'></i>
                  <span>REGISTRE AUDIT CRYPTOGRAPHIQUE</span>
                </div>
                <code>ROOT_HASH: 0x{currentStage.num}e8a9d023bf4...100%_VALIDATED</code>
                <code>ALGORITHM: SHA-256 · MERKLE_ROOT_VERIFIED</code>
              </div>

              <div className='xr-pipeline-audit-bars'>
                <div className='xr-audit-bar-item'>
                  <div className='d-flex justify-content-between mb-1'>
                    <span>Conformité Réglementaire CNDP</span>
                    <span className='text-success fw-bold'>100% Validé</span>
                  </div>
                  <div className='xr-audit-bar-track'>
                    <div className='xr-audit-bar-fill' style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className='xr-audit-bar-item'>
                  <div className='d-flex justify-content-between mb-1'>
                    <span>Temps Moyen d'Instruction</span>
                    <span className='text-info fw-bold'>&lt; 48 Heures</span>
                  </div>
                  <div className='xr-audit-bar-track'>
                    <div className='xr-audit-bar-fill' style={{ width: '92%', background: '#00d9f5' }}></div>
                  </div>
                </div>
                <div className='xr-audit-bar-item'>
                  <div className='d-flex justify-content-between mb-1'>
                    <span>Horodatage SHA-256</span>
                    <span className='text-warning fw-bold'>Immuable</span>
                  </div>
                  <div className='xr-audit-bar-track'>
                    <div className='xr-audit-bar-fill' style={{ width: '100%', background: '#ffd166' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. CARROUSEL DES PARTENAIRES SOUVERAINS (REMPLACE L'ANCIENNE BANDE)
          ==================================================================== */}
      <div className='xr-partner-ribbon'>
        <div className='xr-ribbon-badge'>
          <span className='xr-pulse-dot'></span>
          <span>RÉSEAUX INSTITUTIONNELS ACCRÉDITÉS · SESSION NATIONALE 2026</span>
        </div>
        <div className='xr-ribbon-track-wrap'>
          <div className='xr-ribbon-track'>
            {[...PARTNERS_LIST, ...PARTNERS_LIST].map((item, idx) => (
              <div key={idx} className='xr-partner-pill'>
                <div className='xr-partner-icon-circle'>
                  <i className={item.icon}></i>
                </div>
                <div className='xr-partner-info'>
                  <strong className='xr-partner-name'>{item.name}</strong>
                  <span className='xr-partner-tag'>{item.tag}</span>
                </div>
                <span className='xr-partner-status'>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          6. VITRINE DES CONCOURS NATIONAUX EN COURS
          ==================================================================== */}
      <section className='xr-offres-section' id='xr-offres'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Centered Command Center Header (Clear & Cohesive Layout) */}
          <div className='xr-offres-header' data-scroll-reveal='fade-up'>
            <div className='xr-hud-chip mb-3'>
              <span className='xr-pulse-dot'></span>
              <span>SESSION NATIONALE 2026 · AVIS OFFICIELS DE RECRUTEMENT</span>
            </div>
            <h2 className='xr-offres-title'>
              Concours Nationaux Ouverts. <em>Postulez en Ligne.</em>
            </h2>
            <p className='xr-offres-desc'>
              Consultez l'ensemble des concours ouverts par les institutions bancaires et organismes publics habilités.
              Téléchargez les cahiers des charges officiels, consultez le barème détaillé et déposez votre dossier dématérialisé.
            </p>

            {/* Quick Live Telemetry Strip directly inside Header */}
            <div className='xr-offres-stats-strip'>
              <div className='xr-stat-pill'>
                <div className='xr-stat-num'>
                  {offres.reduce((acc, o) => acc + (Number(o.postes) || 0), 0)}
                </div>
                <div className='xr-stat-lbl'>Postes Budgétaires Ouverts</div>
              </div>
              <div className='xr-stat-sep'></div>
              <div className='xr-stat-pill'>
                <div className='xr-stat-num'>
                  {institutionTabs.filter((t) => t.id !== 'ALL').length}
                </div>
                <div className='xr-stat-lbl'>Grandes Institutions Partenaires</div>
              </div>
              <div className='xr-stat-sep'></div>
              <div className='xr-stat-pill'>
                <div className='xr-stat-num'>100%</div>
                <div className='xr-stat-lbl'>Dossiers Audités Loi 09-08 (CNDP)</div>
              </div>
            </div>
          </div>

          <div className='xr-filters-row' data-scroll-reveal='fade-up'>
            {institutionTabs.map((inst) => (
              <button
                key={inst.id}
                className={`xr-filter-btn ${selectedSigle === inst.id ? 'is-active' : ''}`}
                onClick={() => setSelectedSigle(inst.id)}
              >
                <span>{inst.label}</span>
                <span className='xr-filter-count'>{inst.count}</span>
              </button>
            ))}
          </div>

          <div className='xr-offres-grid xr-stagger' data-scroll-reveal='fade-up'>
            {filteredOffres.map((offre) => (
              <div key={offre._id} className='xr-offre-card'>
                <div className='xr-fact-corner xr-corner-tl'></div>
                <div className='xr-fact-corner xr-corner-br'></div>

                <div className='xr-offre-top-bar'>
                  <div className='d-flex align-items-center gap-2'>
                    {offre.logo ? (
                      <img
                        src={offre.logo}
                        alt={offre.entreprise}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          objectFit: 'contain',
                          background: '#fff',
                          padding: '2px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                      />
                    ) : null}
                    <span className='xr-institution-badge'>{offre.entreprise}</span>
                    <span className='xr-session-tag'>SESSION 2026</span>
                  </div>
                  {offre.urgent ? (
                    <span className='xr-urgent-badge'>
                      <span className='xr-pulse-dot' style={{ background: '#ef4444' }}></span>
                      CLÔTURE IMMINENTE
                    </span>
                  ) : (
                    <span className='xr-regular-badge'>CONCOURS ACTIF</span>
                  )}
                </div>

                <h4 className='xr-offre-title'>{offre.titre}</h4>

                {/* Capacity & Budget Allocation Bar */}
                <div className='xr-capacity-box'>
                  <div className='d-flex justify-content-between align-items-center mb-1'>
                    <span className='xr-capacity-lbl'>
                      <i className='fas fa-user-check text-success me-1'></i> Capacité Budgétaire
                    </span>
                    <span className='xr-capacity-val'>{offre.postes} Postes Ouverts</span>
                  </div>
                  <div className='xr-capacity-track'>
                    <div className='xr-capacity-fill' style={{ width: '85%' }}></div>
                  </div>
                </div>

                {/* 2x2 Bento Specifications Grid (Structured, Clean, No Wrapping Bugs) */}
                <div className='xr-spec-grid'>
                  <div className='xr-spec-item'>
                    <span className='xr-spec-lbl'>
                      <i className='fas fa-map-marker-alt text-success'></i> RÉGION
                    </span>
                    <span className='xr-spec-val'>{offre.ville}</span>
                  </div>
                  <div className='xr-spec-item'>
                    <span className='xr-spec-lbl'>
                      <i className='fas fa-graduation-cap text-info'></i> DIPLÔME REQUIS
                    </span>
                    <span className='xr-spec-val'>{offre.niveau}</span>
                  </div>
                  <div className='xr-spec-item'>
                    <span className='xr-spec-lbl'>
                      <i className='fas fa-briefcase text-warning'></i> SECTEUR
                    </span>
                    <span className='xr-spec-val'>{offre.secteur}</span>
                  </div>
                  <div className='xr-spec-item'>
                    <span className='xr-spec-lbl'>
                      <i className='fas fa-clock text-danger'></i> DATE DE CLÔTURE
                    </span>
                    <span className='xr-spec-val'>{offre.cloture}</span>
                  </div>
                </div>

                <div className='xr-offre-foot'>
                  <Link
                    to={
                      userInfo
                        ? `/poste/${encodeURIComponent(offre.titre)}`
                        : `/register?redirect=/poste/${encodeURIComponent(offre.titre)}`
                    }
                    className='xr-btn'
                    style={{ minHeight: '38px', padding: '0 20px', fontSize: '10.5px' }}
                  >
                    Postuler en Ligne <i className='fas fa-arrow-right ms-1'></i>
                  </Link>

                  <a
                    href={offre.pdfUrl || '/uploads/Dossier_Candidat_Complet_6_Pages.pdf'}
                    target='_blank'
                    rel='noreferrer'
                    className='xr-pdf-link'
                    title='Télécharger l’Avis Officiel'
                  >
                    <i className='fas fa-file-pdf text-danger'></i>
                    <span>Avis PDF</span>
                    <span className='xr-pdf-size'>1.4 MB</span>
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
      <section className='xr-sim-section' id='xr-simulateur'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Centered Simulator Command Deck Header (Fixes Image 4 split bug) */}
          <div className='xr-sim-header' data-scroll-reveal='fade-up'>
            <div className='xr-hud-chip mb-3'>
              <span className='xr-pulse-dot'></span>
              <span>TRANSPARENCE ALGORITHMIQUE TOTALE · BARÈME OFFICIEL D'ÉTAT (100 PTS)</span>
            </div>
            <h2 className='xr-sim-title'>
              Simulateur de Barème. <em>Calculez votre score en direct.</em>
            </h2>
            <p className='xr-sim-desc'>
              Évaluez votre positionnement prévisionnel avant même de soumettre votre dossier.
              Ajustez vos critères académiques et professionnels selon le barème officiel sur 100 points.
            </p>
          </div>

          <div className='xr-sim-layout' data-scroll-reveal='zoom-in'>
            {/* Left Controls & Breakdown Telemetry */}
            <div className='xr-sim-box'>
              <div className='xr-fact-corner xr-corner-tl'></div>
              <div className='xr-fact-corner xr-corner-br'></div>

              <div className='xr-sim-field'>
                <label>
                  <span>1. Diplôme / Niveau d'études</span>
                  <span className='pts'>{simScoreDiplome} / 48 pts</span>
                </label>
                <select className='xr-sim-select' value={simNiveau} onChange={(e) => setSimNiveau(e.target.value)}>
                  <option value='bac2'>Bac +2 (DUT, BTS, DTS, DEUG) — 25 pts</option>
                  <option value='bac3'>Bac +3 (Licence Fondamentale / Pro) — 35 pts</option>
                  <option value='bac5'>Bac +5 (Master, Ingénieur d'État, ENCG, ISCAE) — 45 pts</option>
                  <option value='doctorat'>Doctorat / Ph.D Spécialisé — 48 pts</option>
                </select>
                <div className='xr-sim-track'>
                  <div className='xr-sim-fill' style={{ width: `${(simScoreDiplome / 48) * 100}%` }}></div>
                </div>
              </div>

              <div className='xr-sim-field'>
                <label>
                  <span>2. Mention obtenue au diplôme requis</span>
                  <span className='pts'>{simScoreMention} / 22 pts</span>
                </label>
                <select className='xr-sim-select' value={simMention} onChange={(e) => setSimMention(e.target.value)}>
                  <option value='passable'>Mention Passable (10.00 à 11.99) — 8 pts</option>
                  <option value='assez_bien'>Mention Assez Bien (12.00 à 13.99) — 14 pts</option>
                  <option value='bien'>Mention Bien (14.00 à 15.99) — 18 pts</option>
                  <option value='tres_bien'>Mention Très Bien (16.00 et plus) — 22 pts</option>
                </select>
                <div className='xr-sim-track'>
                  <div
                    className='xr-sim-fill'
                    style={{ width: `${(simScoreMention / 22) * 100}%`, background: '#00d9f5' }}
                  ></div>
                </div>
              </div>

              <div className='xr-sim-field'>
                <label>
                  <span>3. Expérience professionnelle cumulée</span>
                  <span className='pts'>{simExp} an(s) · {simScoreExp} / 30 pts</span>
                </label>
                <input
                  type='range'
                  className='xr-sim-range'
                  min='0'
                  max='10'
                  step='1'
                  value={simExp}
                  onChange={(e) => setSimExp(Number(e.target.value))}
                />
                <div className='d-flex justify-content-between mt-2 text-muted small' style={{ fontSize: '11px' }}>
                  <span>Débutant (0 an)</span>
                  <span>5 ans (15 pts)</span>
                  <span>10 ans et + (Max 30 pts)</span>
                </div>
                <div className='xr-sim-track mt-2'>
                  <div
                    className='xr-sim-fill'
                    style={{ width: `${(simScoreExp / 30) * 100}%`, background: '#ffd166' }}
                  ></div>
                </div>
              </div>

              {/* Highlighted Option Poste Actuel Card */}
              <div className='xr-sim-option-card'>
                <div className='d-flex align-items-center justify-content-between mb-2'>
                  <span className='fw-bold text-white small d-flex align-items-center gap-2'>
                    <i className='fas fa-briefcase text-success'></i>
                    Option "Toujours en poste" Active
                  </span>
                  <span className='xr-option-badge'>AUTODÉTECTÉ</span>
                </div>
                <p className='text-muted small mb-0' style={{ fontSize: '11.5px', lineHeight: '1.6' }}>
                  Dans votre dossier candidat, il vous suffit de cocher <em>« Poste actuel »</em>.
                  Le moteur calcule automatiquement vos mois d'ancienneté jusqu'à aujourd'hui sans bloquer votre date de fin.
                </p>
              </div>
            </div>

            {/* Right Neon Compass Radar Gauge */}
            <div className='xr-gauge-wrap'>
              <div className='xr-radar-ticks'></div>
              {/* Outer HUD Compass Markings */}
              <div className='xr-radar-marks'>
                <span className='xr-radar-mark rm-0'>0P</span>
                <span className='xr-radar-mark rm-25'>25P</span>
                <span className='xr-radar-mark rm-50'>50P</span>
                <span className='xr-radar-mark rm-75'>75P</span>
                <span className='xr-radar-mark rm-100'>100P</span>
              </div>
              <svg viewBox='0 0 320 320'>
                <defs>
                  <linearGradient id='xr-gauge-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                    <stop
                      offset='0%'
                      stopColor={simScore >= 75 ? '#00f2a9' : simScore >= 55 ? '#00d9f5' : '#f59e0b'}
                    />
                    <stop
                      offset='50%'
                      stopColor={simScore >= 75 ? '#00d9f5' : simScore >= 55 ? '#00f2a9' : '#ffd166'}
                    />
                    <stop
                      offset='100%'
                      stopColor={simScore >= 75 ? '#ffd166' : simScore >= 55 ? '#00d9f5' : '#ef4444'}
                    />
                  </linearGradient>
                </defs>
                <circle cx='160' cy='160' r='130' className='xr-gauge-track' />
                <circle
                  cx='160'
                  cy='160'
                  r='130'
                  className='xr-gauge-active'
                  style={{
                    strokeDasharray: gaugeCircumference,
                    strokeDashoffset: gaugeDashoffset,
                  }}
                />
              </svg>

              <div className='xr-gauge-center'>
                <span className='lbl'>NOTE PRÉVISIONNELLE DU BARÈME</span>
                <b>
                  {simScore}
                  <em>/100</em>
                </b>
                <div
                  className={`xr-gauge-verdict ${
                    simScore >= 75
                      ? 'is-gold'
                      : simScore >= 55
                      ? 'is-emerald'
                      : 'is-amber'
                  }`}
                >
                  <i
                    className={`fas ${
                      simScore >= 75
                        ? 'fa-crown text-warning'
                        : simScore >= 55
                        ? 'fa-check-circle text-success'
                        : 'fa-info-circle text-info'
                    } me-1`}
                  ></i>
                  <span>
                    {simScore >= 75
                      ? 'HAUTE ADMISSIBILITÉ (TOP 5%)'
                      : simScore >= 55
                      ? 'ÉLIGIBLE CONVOCATION ORALE'
                      : 'DOSSIER RECEVABLE'}
                  </span>
                </div>
                <div className='xr-gauge-breakdown'>
                  <span>DIP: {simScoreDiplome}P</span> · <span>MEN: {simScoreMention}P</span> · <span>EXP: {simScoreExp}P</span>
                </div>
                <Link
                  to={userInfo ? '/profil' : '/register'}
                  className='xr-btn mt-3'
                  style={{
                    minHeight: '38px',
                    padding: '0 20px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                  }}
                >
                  Appliquer ce Barème <i className='fas fa-arrow-right ms-2'></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. LES 4 ESPACES MÉTIER DÉDIÉS (3D BENTO GRID)
          ==================================================================== */}
      <section className='xr-espaces-section' id='xr-espaces'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Centered Espaces Command Header */}
          <div className='xr-espaces-header' data-scroll-reveal='fade-up'>
            <div className='xr-hud-chip mb-3'>
              <span className='xr-pulse-dot'></span>
              <span>ENVIRONNEMENTS DÉDIÉS · ARCHITECTURE MULTI-RÔLES SOUVERAINE</span>
            </div>
            <h2 className='xr-espaces-title'>
              Quatre Espaces Spécialisés. <em>Une seule exigence d'intégrité.</em>
            </h2>
            <p className='xr-espaces-desc'>
              La plateforme interconnecte l'ensemble des parties prenantes du concours à travers des interfaces sur-mesure,
              conçues pour éliminer les retards et fluidifier chaque prise de décision.
            </p>
          </div>

          <div className='xr-espaces-grid xr-stagger' data-scroll-reveal='fade-up'>
            {/* Espace 1: Candidat (Emerald) */}
            <div className='xr-espace-card xr-theme-emerald'>
              <div className='xr-fact-corner xr-corner-tl'></div>
              <div className='xr-fact-corner xr-corner-br'></div>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <div className='xr-espace-icon'>
                  <i className='fas fa-user-graduate'></i>
                </div>
                <span className='xr-espace-pill'>PORTAIL CANDIDAT</span>
              </div>
              <h4>Espace Candidat</h4>
              <p>
                Créez votre dossier, téléversez vos diplômes et attestations d'expérience,
                suivez l'audit en direct et téléchargez votre convocation officielle avec QR-Code.
              </p>
              <ul className='xr-espace-features'>
                <li><i className='fas fa-check text-success'></i> Calcul auto expérience poste actuel</li>
                <li><i className='fas fa-check text-success'></i> Récépissé numérique SHA-256</li>
                <li><i className='fas fa-check text-success'></i> Convocation officielle nominative</li>
              </ul>
              <Link to='/register' className='xr-btn xr-btn-outline' style={{ minHeight: '38px', fontSize: '10.5px' }}>
                Créer Mon Espace <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>

            {/* Espace 2: Commission d'Audit (Cyan) */}
            <div className='xr-espace-card xr-theme-cyan'>
              <div className='xr-fact-corner xr-corner-tl'></div>
              <div className='xr-fact-corner xr-corner-br'></div>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <div className='xr-espace-icon'>
                  <i className='fas fa-balance-scale'></i>
                </div>
                <span className='xr-espace-pill' style={{ borderColor: 'rgba(0, 217, 245, 0.4)', color: '#00d9f5' }}>
                  DOUBLE-AVEUGLE
                </span>
              </div>
              <h4>Commission d'Audit</h4>
              <p>
                Interface écran scindé pour vérifier les relevés originaux scannés, ajuster immédiatement les notes
                en cas d'erreur de saisie et certifier l'admissibilité en double contrôle.
              </p>
              <ul className='xr-espace-features'>
                <li><i className='fas fa-check text-info'></i> Visualiseur split-screen HD</li>
                <li><i className='fas fa-check text-info'></i> Rectification sécurisée des notes</li>
                <li><i className='fas fa-check text-info'></i> Procès-verbal d'audit horodaté</li>
              </ul>
              <Link to='/login' className='xr-btn xr-btn-outline' style={{ minHeight: '38px', fontSize: '10.5px' }}>
                Accès Contrôleur <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>

            {/* Espace 3: Recruteur RH Banques (Gold) */}
            <div className='xr-espace-card xr-theme-gold'>
              <div className='xr-fact-corner xr-corner-tl'></div>
              <div className='xr-fact-corner xr-corner-br'></div>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <div className='xr-espace-icon'>
                  <i className='fas fa-building'></i>
                </div>
                <span className='xr-espace-pill' style={{ borderColor: 'rgba(255, 209, 102, 0.4)', color: '#ffd166' }}>
                  MULTI-ÉTABLISSEMENTS
                </span>
              </div>
              <h4>Recruteur RH (Banques)</h4>
              <p>
                Publiez des concours au nom de votre institution (Al Barid Bank, OCP, CIH, MEF...), paramétrez le barème
                et exportez les listes officielles des candidats classés par ordre de mérite.
              </p>
              <ul className='xr-espace-features'>
                <li><i className='fas fa-check text-warning'></i> Publication d'avis certifiés</li>
                <li><i className='fas fa-check text-warning'></i> Classement au mérite en 1 clic</li>
                <li><i className='fas fa-check text-warning'></i> Export listes d'admissibilité PDF</li>
              </ul>
              <Link to='/login' className='xr-btn xr-btn-outline' style={{ minHeight: '38px', fontSize: '10.5px' }}>
                Espace Recruteur <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>

            {/* Espace 4: Direction & CNDP (Violet) */}
            <div className='xr-espace-card xr-theme-violet'>
              <div className='xr-fact-corner xr-corner-tl'></div>
              <div className='xr-fact-corner xr-corner-br'></div>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <div className='xr-espace-icon'>
                  <i className='fas fa-shield-alt'></i>
                </div>
                <span className='xr-espace-pill' style={{ borderColor: 'rgba(167, 139, 250, 0.4)', color: '#a78bfa' }}>
                  LOI 09-08 CNDP
                </span>
              </div>
              <h4>Direction &amp; CNDP</h4>
              <p>
                Supervision macroscopique, tableaux de bord de parité et d'équité régionale,
                journal d'audit infalsifiable avec horodatage cryptographique SHA-256.
              </p>
              <ul className='xr-espace-features'>
                <li><i className='fas fa-check text-primary'></i> Tableaux de bord de parité</li>
                <li><i className='fas fa-check text-primary'></i> Registre blockchain d'audit</li>
                <li><i className='fas fa-check text-primary'></i> Conformité souveraine totale</li>
              </ul>
              <Link to='/login' className='xr-btn xr-btn-outline' style={{ minHeight: '38px', fontSize: '10.5px' }}>
                Supervision CNDP <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. SÉCURITÉ, GARANTIE ANTI-FRAUDE & ACCRÉDITATION CNDP
          ==================================================================== */}
      <section className='xr-security-section' id='xr-securite'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='xr-security-box' data-scroll-reveal='fade-up'>
            <div>
              <div className='xr-hud-chip mb-3'>
                <span className='xr-pulse-dot'></span>
                <span>CONFORMITÉ LOI 09-08 DU ROYAUME DU MAROC</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginBottom: '20px' }}>
                La confiance républicaine. <em>Scellée par le code.</em>
              </h2>
              <p style={{ color: 'var(--xr-muted)', fontSize: '15px', lineHeight: '1.8', marginBottom: '24px' }}>
                Notre plateforme garantit l'inviolabilité absolue des données personnelles et professionnelles des candidats.
                Chaque consultation, chaque visa d'auditeur et chaque note réajustée est consignée dans un journal immuable
                auditable par les autorités nationales compétentes.
              </p>

              <div className='xr-security-badges-row'>
                <div className='xr-sec-badge'>
                  <i className='fas fa-lock text-success'></i>
                  <div>
                    <strong>AES-256-GCM</strong>
                    <span>Chiffrement Bancaire</span>
                  </div>
                </div>
                <div className='xr-sec-badge'>
                  <i className='fas fa-stamp text-warning'></i>
                  <div>
                    <strong>SHA-256 SEAL</strong>
                    <span>Horodatage Immuable</span>
                  </div>
                </div>
                <div className='xr-sec-badge'>
                  <i className='fas fa-user-shield text-info'></i>
                  <div>
                    <strong>CNDP D-W-452</strong>
                    <span>Conformité Loi 09-08</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Cryptographic Vault Card */}
            <div className='xr-seal-card' data-scroll-reveal='zoom-in'>
              <div className='xr-fact-corner xr-corner-tl'></div>
              <div className='xr-fact-corner xr-corner-br'></div>

              <div className='d-flex align-items-center gap-3 mb-4'>
                <div className='xr-seal-icon'>
                  <i className='fas fa-certificate'></i>
                </div>
                <div>
                  <h5 className='text-white mb-1' style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
                    Sceau de Sécurité Cryptographique
                  </h5>
                  <span className='text-muted small'>Horodatage Certifié Conforme CNDP &amp; EHC</span>
                </div>
              </div>

              <div className='xr-terminal-matrix'>
                <div className='xr-terminal-bar'>
                  <span className='xr-term-dot red'></span>
                  <span className='xr-term-dot yellow'></span>
                  <span className='xr-term-dot green'></span>
                  <span className='xr-term-title'>SECURITY_CORE_V4 // LIVE_AUDIT</span>
                </div>
                <code>&gt; SYSTEM_INTEGRITY: 100%_OPTIMAL</code>
                <code>&gt; ROOT_HASH: 0x7f8a9d023bf4e8c1ba99d21...[SEALED]</code>
                <code>&gt; AUDIT_TRAIL: DOUBLE_BLIND_CONTROLLER_SYNC</code>
                <code>&gt; STATUS: IMMUTABLE_TIMESTAMPED (LOI 09-08)</code>
              </div>

              <ul className='xr-security-checklist'>
                <li><i className='fas fa-check-circle text-success me-2'></i> Chiffrement AES-256 de l’ensemble des pièces scannées</li>
                <li><i className='fas fa-check-circle text-success me-2'></i> Protection intégrale conforme aux préconisations de la CNDP</li>
                <li><i className='fas fa-check-circle text-success me-2'></i> Élimination stricte de toute interférence dans le classement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. FOIRE AUX QUESTIONS OFFICIELLES (FAQ ACCORDION)
          ==================================================================== */}
      <section className='xr-faq-section' id='xr-faq'>
        <div className='container' style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className='xr-faq-layout' data-scroll-reveal='fade-up'>
            <div>
              <div className='xr-hud-chip mb-2'>
                <span className='xr-pulse-dot'></span>
                <span>ASSISTANCE AUX CANDIDATS</span>
              </div>
              <h2 style={{ fontSize: 'clamp(38px, 4.2vw, 65px)', marginBottom: '20px' }}>
                Questions <em>fréquentes.</em>
              </h2>
              <p style={{ color: 'var(--xr-muted)', fontSize: '15px', lineHeight: '1.8', marginBottom: '28px' }}>
                Retrouvez les réponses réglementaires aux questions les plus posées lors du dépôt de dossier,
                du calcul d'ancienneté et de l'instruction par la commission d'audit.
              </p>

              <div className='xr-faq-help-card'>
                <div className='d-flex align-items-center gap-3 mb-2'>
                  <i className='fas fa-headset text-success' style={{ fontSize: '24px' }}></i>
                  <div>
                    <strong className='text-white d-block'>Besoin d'assistance ?</strong>
                    <span className='text-muted small'>Cellule Support Concours EHC</span>
                  </div>
                </div>
                <p className='text-muted small mb-0' style={{ fontSize: '12px' }}>
                  Une équipe dédiée répond sous 2h à toute question relative à votre dossier ou à vos pièces scannées.
                </p>
              </div>
            </div>

            <div className='xr-faq-list'>
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

              <details>
                <summary>
                  <span>Puis-je postuler à plusieurs concours simultanément ?</span>
                  <i className='fas fa-plus'></i>
                </summary>
                <p>
                  Oui. Votre dossier unique (état civil, diplômes et expériences certifiés) est mutualisé sur la plateforme.
                  Vous pouvez postuler en un clic à tous les concours bancaires ou publics ouverts correspondant à votre niveau d'études.
                </p>
              </details>

              <details>
                <summary>
                  <span>Mes données sont-elles protégées conformément à la Loi 09-08 (CNDP) ?</span>
                  <i className='fas fa-plus'></i>
                </summary>
                <p>
                  Absolument. La plateforme fait l'objet d'une déclaration préalable auprès de la CNDP. Vos documents sont
                  chiffrés en AES-256 et ne sont accessibles qu'aux jurys habilités pour la stricte instruction du concours.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. FOOTER INSTITUTIONNEL HAUTE PRÉCISION
          ==================================================================== */}
      <footer className='xr-footer'>
        <div className='xr-footer-inner' data-scroll-reveal='fade-up'>
          <div>
            <div className='xr-brand' style={{ fontSize: '30px', marginBottom: '18px' }}>
              RECRUTEMENT<span>.MA</span>
            </div>
            <p style={{ maxWidth: '340px', lineHeight: '1.7', fontSize: '13px', color: 'var(--xr-muted)' }}>
              Portail National de Centralisation et de Gestion des Concours d’Accès aux Grandes Institutions Bancaires,
              Établissements Publics et Organismes Financiers au Maroc.
            </p>
            <div className='xr-hud-chip mt-4' style={{ fontSize: '9px' }}>
              <span className='xr-pulse-dot'></span>
              <span>CONFORME LOI 09-08 · CNDP MAROC</span>
            </div>
          </div>

          <div className='xr-footer-col'>
            <h5>La Plateforme</h5>
            <a href='#xr-pipeline'>Le Parcours du Mérite</a>
            <a href='#xr-offres'>Concours Ouverts</a>
            <a href='#xr-simulateur'>Simulateur de Barème</a>
            <a href='#xr-espaces'>Espaces Métier</a>
          </div>

          <div className='xr-footer-col'>
            <h5>Institutions Partenaires</h5>
            <a href='#xr-offres'>Al Barid Bank</a>
            <a href='#xr-offres'>Groupe OCP</a>
            <a href='#xr-offres'>CIH Bank</a>
            <a href='#xr-offres'>Ministère de l'Économie &amp; Finances</a>
            <a href='#xr-offres'>Bank of Africa (BMCE)</a>
            <a href='#xr-offres'>Caisse de Dépôt et de Gestion</a>
          </div>

          <div className='xr-footer-col'>
            <h5>Accès Direct</h5>
            <Link to='/login'>Espace Recruteur RH</Link>
            <Link to='/login'>Espace Commission d'Audit</Link>
            <Link to='/register'>Créer Dossier Candidat</Link>
            <a href='#xr-faq'>Assistance &amp; Règlement</a>
          </div>
        </div>

        <div className='xr-footer-watermark'>
          RECRUTEMENT<span>.MA</span>
        </div>

        <div className='xr-footer-bottom'>
          <span>© 2026 EHC Experts Human Capital — Portail National Recrutement.ma</span>
          <span>SÉLECTION AU MÉRITE RÉPUBLICAIN · CONFORME CNDP MAROC</span>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
