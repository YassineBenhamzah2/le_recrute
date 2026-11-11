import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../actions/userActions';
import './LandingPage.css';

const DEFAULT_FEATURED_OFFRES = [
  {
    _id: 'cih-01',
    titre: 'Chargés de Clientèle Particuliers & Professionnels',
    entreprise: 'CIH Bank',
    secteur: 'Secteur Bancaire',
    ville: 'Casablanca, Rabat, Tanger',
    niveau: 'Bac +3 / Licence',
    postes: 25,
    cloture: 'Dans 6 jours',
    urgent: false,
    color: '#0084B6',
    initials: 'CIH',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'abb-01',
    titre: 'Guichetiers Chargés d’Opérations & Accueil Clientèle',
    entreprise: 'Al Barid Bank',
    secteur: 'Secteur Bancaire',
    ville: 'Réseau National (Toutes Régions)',
    niveau: 'Bac +2 / Diplôme TS',
    postes: 120,
    cloture: 'Dans 12 jours',
    urgent: true,
    color: '#003366',
    initials: 'ABB',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'boa-01',
    titre: 'Analystes Risques de Crédit & Engagements Bancaires',
    entreprise: 'Bank of Africa',
    secteur: 'Secteur Bancaire',
    ville: 'Casablanca Finance City',
    niveau: 'Bac +5 / Master / Ingénieur',
    postes: 15,
    cloture: 'Dans 18 jours',
    urgent: false,
    color: '#0055A5',
    initials: 'BOA',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'bcp-01',
    titre: 'Conseillers Commerciaux & Gestionnaires de Portefeuille',
    entreprise: 'Banque Populaire',
    secteur: 'Secteur Bancaire',
    ville: 'Marrakech, Agadir, Fès',
    niveau: 'Bac +3 / Bac +4',
    postes: 40,
    cloture: 'Dans 9 jours',
    urgent: false,
    color: '#FF6600',
    initials: 'BCP',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'ocp-01',
    titre: 'Ingénieurs d’Exploitation Industrielle & Procédés',
    entreprise: 'Groupe OCP',
    secteur: 'Industrie & Mines',
    ville: 'Jorf Lasfar, Khouribga, Benguerir',
    niveau: 'Bac +5 / Ingénieur d’État',
    postes: 30,
    cloture: 'Dans 14 jours',
    urgent: true,
    color: '#00875A',
    initials: 'OCP',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
  {
    _id: 'mef-01',
    titre: 'Concours de Recrutement d’Administrateurs 2ème Grade',
    entreprise: 'Ministère de l’Économie et des Finances',
    secteur: 'Fonction Publique',
    ville: 'Rabat & Centres Régionaux',
    niveau: 'Bac +5 / Master / Doctorat',
    postes: 200,
    cloture: 'Dans 22 jours',
    urgent: false,
    color: '#1E293B',
    initials: 'MEF',
    pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
  },
];

const INSTITUTIONS = [
  { name: 'Al Barid Bank', initials: 'ABB', color: '#003366' },
  { name: 'CIH Bank', initials: 'CIH', color: '#0084B6' },
  { name: 'Banque Populaire', initials: 'BCP', color: '#EA580C' },
  { name: 'Bank of Africa', initials: 'BOA', color: '#0284C7' },
  { name: 'Groupe OCP', initials: 'OCP', color: '#059669' },
  { name: 'Caisse de Dépôt et de Gestion', initials: 'CDG', color: '#D97706' },
  { name: 'Ministère des Finances', initials: 'MEF', color: '#475569' },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [dbOffres, setDbOffres] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedVille, setSelectedVille] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  // Interactive Simulator state
  const [simNiveau, setSimNiveau] = useState('licence');
  const [simSpecialite, setSimSpecialite] = useState('banque');
  const [simMoyenne, setSimMoyenne] = useState('14.50');

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  const calculatedScore = useMemo(() => {
    const baseNiveau = simNiveau === 'master' ? 35 : simNiveau === 'licence' ? 28 : 22;
    const bonusSpec = simSpecialite === 'banque' ? 22 : simSpecialite === 'info' ? 19 : 15;
    const note = parseFloat(simMoyenne) || 12;
    const scoreNote = Math.min(38, Math.max(10, (note / 20) * 38));
    const total = Math.min(100, Math.round((baseNiveau + bonusSpec + scoreNote) * 10) / 10);
    return {
      total,
      eligible: total >= 65,
      mention: note >= 16 ? 'Très Bien' : note >= 14 ? 'Bien' : note >= 12 ? 'Assez Bien' : 'Passable',
    };
  }, [simNiveau, simSpecialite, simMoyenne]);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      navigate('/admin/dashboard');
    }
    if (userInfo && userInfo.isController) {
      navigate('/controlleurs/dashboard');
    }

    const fetchOffres = async () => {
      try {
        const { data } = await axios.get('/api/offres');
        if (Array.isArray(data) && data.length > 0) {
          setDbOffres(data);
        }
      } catch (err) {
        console.error('Erreur chargement des offres API:', err);
      }
    };
    fetchOffres();

    if (window.location.hash === '#offres') {
      setTimeout(() => {
        const el = document.getElementById('offres');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [navigate, userInfo]);

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
            entSigle =
              item.entreprise.sigle ||
              (typeof entName === 'string' && entName.length >= 3
                ? entName.substring(0, 3).toUpperCase()
                : 'ABB');
            entColor = item.entreprise.couleurPrimaire || '#003366';
            if (item.entreprise.secteur) entSecteur = item.entreprise.secteur;
          } else if (typeof item.entreprise === 'string') {
            entName = item.entrepriseNom || item.entreprise;
            entSigle =
              item.entrepriseSigle ||
              (entName.length <= 4
                ? entName
                : entName.substring(0, 3).toUpperCase());
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
          logo: item.entrepriseLogo || (item.entreprise && item.entreprise.logo) || (safeInitials === 'LRT' ? '/assets/images/ehc.png' : ''),
          pdfUrl: item.pdfUrl || '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
          scoringRules: item.scoringRules,
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
        o.secteur.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchVille =
        selectedVille === 'all' ||
        o.ville.toLowerCase().includes(selectedVille.toLowerCase());

      const matchFilter =
        activeFilter === 'all' ||
        (activeFilter === 'bancaire' && o.secteur.toLowerCase().includes('bancaire')) ||
        (activeFilter === 'public' && (o.secteur.toLowerCase().includes('public') || o.secteur.toLowerCase().includes('fonction'))) ||
        (activeFilter === 'industrie' && o.secteur.toLowerCase().includes('industrie')) ||
        (activeFilter === 'services' && (o.secteur.toLowerCase().includes('service') || o.secteur.toLowerCase().includes('rh') || o.secteur.toLowerCase().includes('conseil')));

      return matchKeyword && matchVille && matchFilter;
    });
  }, [combinedOffres, searchKeyword, selectedVille, activeFilter]);

  return (
    <div className='jg-page-wrapper'>

      {/* 1. FULL-WIDTH NAVBAR (STICKY) */}
      <header className='jg-navbar-fullwidth'>
        <div className='jg-container'>
          <div className='jg-navbar-inner'>
            <Link to='/' className='jg-brand'>
              <div className='jg-brand-icon'>
                <i className='fas fa-layer-group'></i>
              </div>
              <span>Recrutement<span style={{ color: 'var(--jg-primary-blue)' }}>.ma</span></span>
            </Link>

            <nav className='jg-nav-links'>
              <a href='#offres' className='jg-nav-link'>Offres & Concours</a>
              <a href='#simulateur' className='jg-nav-link'>Simulateur Barème</a>
              <a href='#process' className='jg-nav-link'>Comment ça marche</a>
              {userInfo?.isMaitreOuvrage ? (
                <Link to='/maitre-ouvrage/candidatures' className='jg-nav-link' style={{ color: '#1D4ED8', fontWeight: '700' }}>
                  <i className='fas fa-briefcase me-1'></i> Espace Recruteur RH
                </Link>
              ) : userInfo?.isAdmin ? (
                <Link to='/admin/dashboard' className='jg-nav-link' style={{ color: '#0F172A', fontWeight: '700' }}>
                  <i className='fas fa-cogs me-1'></i> Administration EHC
                </Link>
              ) : userInfo?.isController ? (
                <Link to='/controlleurs/dashboard' className='jg-nav-link' style={{ color: '#D97706', fontWeight: '700' }}>
                  <i className='fas fa-tasks me-1'></i> Espace Contrôle
                </Link>
              ) : (
                <Link to={userInfo ? '/profile' : '/login'} className='jg-nav-link' style={{ color: 'var(--jg-primary-blue)', fontWeight: '600' }}>
                  <i className='fas fa-id-card-alt me-1'></i> Espace Candidat
                </Link>
              )}
              <a href='#faq' className='jg-nav-link'>FAQ</a>
            </nav>

            <div className='jg-nav-actions'>
              {userInfo ? (
                <>
                  {userInfo.isMaitreOuvrage ? (
                    <Link
                      to='/maitre-ouvrage/candidatures'
                      className='jg-btn-signin me-2'
                      style={{
                        background: '#1D4ED8',
                        color: '#FFFFFF',
                        border: 'none',
                        textDecoration: 'none',
                        fontWeight: '700',
                      }}
                    >
                      <i className='fas fa-plus-circle me-1'></i> Espace Recruteur (+ Publier Offre)
                    </Link>
                  ) : userInfo.isAdmin ? (
                    <Link
                      to='/admin/dashboard'
                      className='jg-btn-signin me-2'
                      style={{
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        textDecoration: 'none',
                        fontWeight: '700',
                      }}
                    >
                      <i className='fas fa-shield-alt me-1'></i> Administration
                    </Link>
                  ) : userInfo.isController ? (
                    <Link
                      to='/controlleurs/dashboard'
                      className='jg-btn-signin me-2'
                      style={{
                        background: '#D97706',
                        color: '#FFFFFF',
                        border: 'none',
                        textDecoration: 'none',
                        fontWeight: '700',
                      }}
                    >
                      <i className='fas fa-tasks me-1'></i> Commission Contrôle
                    </Link>
                  ) : (
                    <Link to='/profile' className='jg-btn-signin me-2' style={{ textDecoration: 'none' }}>
                      <i className='fas fa-user-circle me-1'></i> Mon Dossier ({userInfo.prenom || 'Candidat'})
                    </Link>
                  )}
                  <button onClick={logoutHandler} className='jg-pill-btn' style={{ padding: '6px 14px' }}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to='/login' className='jg-nav-link me-2' style={{ textDecoration: 'none' }}>
                    <i className='fas fa-sign-in-alt me-1'></i> Se Connecter
                  </Link>
                  <Link to='/register' className='jg-btn-signin' style={{ textDecoration: 'none' }}>
                    <i className='fas fa-user-plus me-1'></i> Créer mon Compte
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. FULL-PAGE EDGE-TO-EDGE HERO SECTION (PURE WHITE, NO CIRCLES, NO BORDERS) */}
      <section className='jg-hero-section-fullwidth'>
        <div className='jg-container'>
          <div className='jg-hero-grid'>

            {/* LEFT COLUMN */}
            <div className='jg-hero-left'>
              <div className='jg-hero-tag'>
                <span className='jg-tag-pulse'></span>
                Concours 2026 Al Barid & Banques Ouverts
              </div>

              <h1 className='jg-hero-title'>
                Trouvez votre emploi{' '}
                <span className='jg-highlight-word'>plus rapidement</span> et plus intelligemment.
              </h1>

              <p className='jg-hero-subtitle'>
                Centralisez votre dossier, comparez votre barème officiel en temps réel et postulez directement aux recrutements des grandes banques et concours publics au Maroc.
              </p>

              {/* FLOATING PILL SEARCH BAR (JOBGIO STYLE) */}
              <div className='jg-search-pill-wrapper'>
                <div className='jg-search-part'>
                  <i className='fas fa-briefcase'></i>
                  <div className='jg-search-inner-col'>
                    <span className='jg-search-label'>Poste ou mot-clé</span>
                    <input
                      type='text'
                      className='jg-search-input'
                      placeholder='Ex: Guichetier, Chargé d’affaires...'
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>
                </div>

                <div className='jg-search-divider'></div>

                <div className='jg-search-part'>
                  <i className='fas fa-map-marker-alt'></i>
                  <div className='jg-search-inner-col'>
                    <span className='jg-search-label'>Ville ou Région</span>
                    <select
                      className='jg-search-select'
                      value={selectedVille}
                      onChange={(e) => setSelectedVille(e.target.value)}
                    >
                      <option value='all'>Toutes les villes</option>
                      <option value='Casablanca'>Casablanca</option>
                      <option value='Rabat'>Rabat</option>
                      <option value='Tanger'>Tanger</option>
                      <option value='Marrakech'>Marrakech</option>
                      <option value='National'>Réseau National</option>
                    </select>
                  </div>
                </div>

                <button
                  className='jg-search-btn'
                  onClick={() => {
                    const el = document.getElementById('offres');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  title='Rechercher'
                >
                  <i className='fas fa-search'></i>
                </button>
              </div>

              {/* BOTTOM ROW (HOW IT WORKS + STATS) */}
              <div className='jg-hero-bottom-row'>
                <a href='#process' className='jg-start-career-card'>
                  <div className='jg-career-icon-box'>
                    <i className='fas fa-paper-plane'></i>
                  </div>
                  <div className='jg-career-text'>
                    <h5>Lancez Votre Carrière</h5>
                    <p>Comment ça marche <i className='fas fa-arrow-right' style={{ fontSize: '10px' }}></i></p>
                  </div>
                </a>

                <div className='jg-hero-stats-wrap'>
                  <div className='jg-stat-col'>
                    <h4>50K+</h4>
                    <p>Candidats Inscrits</p>
                  </div>
                  <div className='jg-stat-vsep'></div>
                  <div className='jg-stat-col'>
                    <h4>20K+</h4>
                    <p>Dossiers Validés</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (REAL CANDIDATE PHOTO + FLOATING WIDGETS - CLEAN BACKGROUND) */}
            <div className='jg-hero-right'>
              <div className='jg-candidate-image-wrapper'>
                <img
                  src='/images/hero_candidate_portrait.jpg'
                  alt='Candidate professionnelle souriante'
                  className='jg-candidate-photo'
                />

                {/* 1. TOP RIGHT CALENDAR BADGE */}
                <div className='jg-float-widget jg-widget-top-right'>
                  <div className='jg-circle-icon-btn'>
                    <i className='fas fa-calendar-check'></i>
                  </div>
                  <div className='jg-widget-meta'>
                    <strong>Concours ABB 2026</strong>
                    <span>● Inscriptions Ouvertes</span>
                  </div>
                </div>

                {/* 2. MIDDLE LEFT SCORE WIDGET */}
                <div className='jg-float-widget jg-widget-middle-left'>
                  <div className='jg-score-mini-circle'>
                    86%
                  </div>
                  <div className='jg-score-mini-meta'>
                    <strong>Score Automatisé</strong>
                    <span>Mention Bien • Validé</span>
                  </div>
                </div>

                {/* 3. MIDDLE RIGHT PDF RECEIPT BADGE */}
                <div className='jg-float-widget jg-widget-middle-right'>
                  <div className='jg-pdf-icon-box'>
                    <i className='fas fa-file-pdf'></i>
                  </div>
                  <div className='jg-widget-meta'>
                    <strong style={{ fontSize: '12px' }}>Reçu Horodaté</strong>
                    <span style={{ color: '#64748B' }}>PDF 6p Certifié</span>
                  </div>
                </div>

                {/* 4. BOTTOM CNDP VERIFIED CHIP */}
                <div className='jg-float-widget jg-widget-bottom-center'>
                  <div className='jg-cndp-pill'>
                    <i className='fas fa-shield-alt'></i>
                    <span>Dossier Conforme CNDP</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FULL-WIDTH LOGO MARQUEE */}
      <section className='jg-marquee-section'>
        <div className='jg-marquee-title'>
          Recrutements officiels hébergés pour les grandes institutions
        </div>
        <div className='jg-marquee-track'>
          {[...INSTITUTIONS, ...INSTITUTIONS, ...INSTITUTIONS].map((inst, index) => (
            <div key={index} className='jg-marquee-item'>
              <span className='jg-marquee-logo-badge' style={{ backgroundColor: inst.color }}>
                {inst.initials}
              </span>
              <span>{inst.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LIGHT HIGH-END BENTO SECTION (JOBGIO & FINANCIAL CONSULT STYLE) */}
      <div className='jg-container'>
        <section className='jg-light-bento-section' id='simulateur'>
          <div className='jg-bento-header'>
            <div>
              <span className='jg-bento-tag'>Innovation & Transparence</span>
              <h2 className='jg-bento-title'>
                Un Système Conçu Pour <br />
                <span style={{ color: 'var(--jg-royal-blue)' }}>Garantir l'Égalité des Chances</span>.
              </h2>
            </div>
            <p className='jg-bento-desc d-none d-lg-block'>
              Éliminez les ambiguïtés : chaque dossier est évalué selon un barème public transparent, vérifiable et certifié par un accusé de réception infalsifiable.
            </p>
          </div>

          <div className='jg-bento-grid'>

            {/* BENTO CARD 1: SIMULATEUR DE BAREME (SPAN 2) */}
            <div className='jg-bento-card jg-bento-card-highlight'>
              <div className='jg-bento-icon'>
                <i className='fas fa-calculator'></i>
              </div>
              <h3>Simulateur de Barème Immédiat</h3>
              <p>
                Renseignez votre diplôme et votre moyenne générale pour visualiser votre score prévisionnel calculé selon le barème officiel de l’institution ciblée.
              </p>

              <div className='jg-sim-mini-box'>
                <div className='jg-sim-controls-row'>
                  <div className='jg-sim-group'>
                    <label>Niveau d'études</label>
                    <select value={simNiveau} onChange={(e) => setSimNiveau(e.target.value)}>
                      <option value='bac2'>Bac +2 (DUT / BTS / TS)</option>
                      <option value='licence'>Bac +3 (Licence / Bachelor)</option>
                      <option value='master'>Bac +5 (Master / Ingénieur)</option>
                    </select>
                  </div>

                  <div className='jg-sim-group'>
                    <label>Spécialité</label>
                    <select value={simSpecialite} onChange={(e) => setSimSpecialite(e.target.value)}>
                      <option value='banque'>Banque, Finance & Gestion</option>
                      <option value='info'>Informatique & Digital</option>
                      <option value='autre'>Autre Spécialité</option>
                    </select>
                  </div>

                  <div className='jg-sim-group'>
                    <label>Moyenne Générale (/20)</label>
                    <input
                      type='number'
                      min='10'
                      max='20'
                      step='0.25'
                      value={simMoyenne}
                      onChange={(e) => setSimMoyenne(e.target.value)}
                    />
                  </div>
                </div>

                <div className='jg-sim-result-strip'>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600' }}>Score Estimé :</span>
                    <div className='jg-sim-score-badge'>{calculatedScore.total} / 100 pts</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      background: calculatedScore.eligible ? '#DCFCE7' : '#FEE2E2',
                      color: calculatedScore.eligible ? '#15803D' : '#DC2626',
                      padding: '5px 14px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      ● {calculatedScore.eligible ? 'Éligible pour Présélection' : 'Score Inférieur au Seuil'}
                    </span>
                    <div style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>
                      Mention : <strong>{calculatedScore.mention}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BENTO CARD 2: DOSSIER UNIQUE */}
            <div className='jg-bento-card'>
              <div className='jg-bento-icon'>
                <i className='fas fa-id-card'></i>
              </div>
              <h3>Dossier Candidat Unique</h3>
              <p>
                Déposez votre CIN, diplômes et relevés de notes une seule fois. Postulez ensuite à toutes les offres bancaires et concours en 1 seul clic.
              </p>
            </div>

            {/* BENTO CARD 3: REÇU HORODATE */}
            <div className='jg-bento-card'>
              <div className='jg-bento-icon'>
                <i className='fas fa-file-contract'></i>
              </div>
              <h3>Reçu Numérique Horodaté</h3>
              <p>
                Dès validation, téléchargez un PDF complet avec numéro d’enregistrement unique et horodatage faisant foi juridiquement.
              </p>
            </div>

            {/* BENTO CARD 4: AUDIT N1 / N2 */}
            <div className='jg-bento-card'>
              <div className='jg-bento-icon'>
                <i className='fas fa-user-check'></i>
              </div>
              <h3>Contrôle à Double Niveau</h3>
              <p>
                Double validation humaine & algorithmique (N1 conformité pièces, N2 validation commission) garantissant zéro favoritisme.
              </p>
            </div>

            {/* BENTO CARD 5: CONFORMITÉ CNDP */}
            <div className='jg-bento-card'>
              <div className='jg-bento-icon'>
                <i className='fas fa-shield-virus'></i>
              </div>
              <h3>Sécurité & Données CNDP</h3>
              <p>
                Stockage sécurisé souverain au Maroc, chiffrement SSL/TLS et respect strict de la loi 09-08 relative à la protection des données.
              </p>
            </div>

          </div>
        </section>
      </div>

      {/* 5. OFFRES ET CONCOURS (CLEAN JOBGIO CARDS GRID WITH ACCENT BARS) */}
      <section className='jg-section-offres' id='offres'>
        <div className='jg-container'>
          <div className='jg-section-title-wrap'>
            <div className='jg-section-eyebrow'>Opportunités Officielles</div>
            <h2 className='jg-section-heading'>Concours et Recrutements Disponibles</h2>
            <p className='jg-section-desc'>
              Consultez les offres officielles des grandes institutions marocaines, vérifiez votre score d'éligibilité et postulez avec votre dossier certifié.
            </p>
          </div>

          {/* FILTER PILLS */}
          <div className='jg-filter-pills'>
            <button
              className={`jg-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Toutes les offres ({combinedOffres.length})
            </button>
            <button
              className={`jg-pill-btn ${activeFilter === 'bancaire' ? 'active' : ''}`}
              onClick={() => setActiveFilter('bancaire')}
            >
              <i className='fas fa-university me-1'></i> Secteur Bancaire
            </button>
            <button
              className={`jg-pill-btn ${activeFilter === 'public' ? 'active' : ''}`}
              onClick={() => setActiveFilter('public')}
            >
              <i className='fas fa-landmark me-1'></i> Concours Publics
            </button>
            <button
              className={`jg-pill-btn ${activeFilter === 'industrie' ? 'active' : ''}`}
              onClick={() => setActiveFilter('industrie')}
            >
              <i className='fas fa-industry me-1'></i> Industrie & Mines
            </button>
            <button
              className={`jg-pill-btn ${activeFilter === 'services' ? 'active' : ''}`}
              onClick={() => setActiveFilter('services')}
            >
              <i className='fas fa-briefcase me-1'></i> Services & Conseil RH
            </button>
          </div>

          {/* CARDS GRID */}
          <div className='jg-jobs-grid'>
            {filteredOffres.map((offre) => (
              <div key={offre._id} className='jg-job-card'>
                <div className='jg-job-accent-bar' style={{ backgroundColor: offre.color }}></div>
                <div className='jg-job-card-inner'>
                  <div className='jg-job-header'>
                    <div
                      className='jg-job-logo-box'
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <img
                        src={
                          offre.initials === 'ABB'
                            ? '/assets/images/logoABB.png'
                            : offre.initials === 'CIH'
                            ? '/images/logos/cih_logo.svg'
                            : offre.initials === 'OCP'
                            ? '/images/logos/ocp_logo.svg'
                            : offre.initials === 'BOA'
                            ? '/images/logos/boa_logo.svg'
                            : offre.initials === 'MEF'
                            ? '/images/logos/mef_logo.svg'
                            : offre.initials === 'CDG'
                            ? '/images/logos/cdg_logo.svg'
                            : offre.initials === 'LRT' || (offre.entreprise && offre.entreprise.toLowerCase().includes('recruteur'))
                            ? '/images/logos/lrt_logo.svg'
                            : offre.logo && offre.logo !== '/images/logos/default_org.png'
                            ? offre.logo
                            : '/images/logos/lrt_logo.svg'
                        }
                        alt={offre.initials}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <span className='jg-job-deadline-badge'>
                      <i className='fas fa-clock me-1'></i> {offre.cloture}
                    </span>
                  </div>

                  <h3>{offre.titre}</h3>
                  <div className='jg-job-institution'>{offre.entreprise} • <span style={{ color: '#64748B' }}>{offre.secteur}</span></div>

                  <div className='jg-job-details-list'>
                    <div className='jg-job-detail-row'>
                      <i className='fas fa-map-marker-alt'></i>
                      <span>{offre.ville}</span>
                    </div>
                    <div className='jg-job-detail-row'>
                      <i className='fas fa-graduation-cap'></i>
                      <span>{offre.niveau}</span>
                    </div>
                    <div className='jg-job-detail-row'>
                      <i className='fas fa-users'></i>
                      <span><strong>{offre.postes}</strong> Postes budgétaires ouverts</span>
                    </div>
                  </div>

                  <Link
                    to={userInfo ? `/poste/${encodeURIComponent(offre.titre)}/informations-personnelles` : '/login'}
                    className='jg-job-action-btn'
                  >
                    Postuler à ce poste <i className='fas fa-arrow-right ms-1' style={{ fontSize: '11px' }}></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (CONNECTED TIMELINE) */}
      <section className='jg-section-process' id='process'>
        <div className='jg-container'>
          <div className='jg-section-title-wrap'>
            <div className='jg-section-eyebrow'>Parcours Candidat Simplifié</div>
            <h2 className='jg-section-heading'>Comment Ça Marche ?</h2>
            <p className='jg-section-desc'>
              Votre parcours complet et transparent de la création du compte jusqu'à la convocation officielle.
            </p>
          </div>

          <div className='jg-process-grid'>
            <div className='jg-process-card'>
              <div className='jg-step-number'>1</div>
              <h4>Créez Votre Profil Unique</h4>
              <p>
                Renseignez vos coordonnées, scannez votre CIN et vos diplômes une seule fois. Votre espace sécurisé conserve vos documents validés pour tous les concours.
              </p>
            </div>

            <div className='jg-process-card'>
              <div className='jg-step-number'>2</div>
              <h4>Vérifiez Votre Barème</h4>
              <p>
                L'algorithme calcule immédiatement vos points selon la grille officielle de chaque établissement (âge, mention, diplôme) et confirme votre éligibilité.
              </p>
            </div>

            <div className='jg-process-card'>
              <div className='jg-step-number'>3</div>
              <h4>Téléchargez Votre Reçu</h4>
              <p>
                Validez votre candidature en 1 clic et recevez instantanément votre accusé de réception officiel horodaté avec numéro de suivi national infalsifiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS / SOCIAL PROOF */}
      <section className='jg-section-testimonials' id='temoignages'>
        <div className='jg-container'>
          <div className='jg-section-title-wrap'>
            <div className='jg-section-eyebrow'>Confiance & Transparence</div>
            <h2 className='jg-section-heading'>Adopté par les Candidats & les Recruteurs</h2>
            <p className='jg-section-desc'>
              Découvrez les retours d'expérience sur notre système de présélection méritocratique au Maroc.
            </p>
          </div>

          <div className='jg-testimonials-grid'>
            <div className='jg-testimonial-card'>
              <div className='jg-testimonial-stars'>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
              </div>
              <blockquote>
                "Grâce au calcul transparent du barème, j'ai su immédiatement que mon profil était éligible pour le concours Al Barid Bank. Reçu horodaté téléchargé en 2 minutes !"
              </blockquote>
              <div className='jg-testimonial-author'>
                <div className='jg-testimonial-avatar' style={{ backgroundColor: '#003366' }}>
                  MB
                </div>
                <div>
                  <div className='jg-testimonial-name'>Mehdi B.</div>
                  <div className='jg-testimonial-role'>Chargé de Clientèle • Casablanca</div>
                </div>
              </div>
            </div>

            <div className='jg-testimonial-card'>
              <div className='jg-testimonial-stars'>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
              </div>
              <blockquote>
                "La double validation N1/N2 et la clarté des critères m'ont donné confiance. Zéro favoritisme, tout est tracé et consultable dans mon espace candidat."
              </blockquote>
              <div className='jg-testimonial-author'>
                <div className='jg-testimonial-avatar' style={{ backgroundColor: '#0284C7' }}>
                  SE
                </div>
                <div>
                  <div className='jg-testimonial-name'>Sara E.</div>
                  <div className='jg-testimonial-role'>Analyste Risques Junior • Rabat</div>
                </div>
              </div>
            </div>

            <div className='jg-testimonial-card'>
              <div className='jg-testimonial-stars'>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
              </div>
              <blockquote>
                "Une infrastructure ultra-robuste qui fluidifie le traitement de plus de 45 000 candidatures par session avec une conformité CNDP exemplaire et un audit complet."
              </blockquote>
              <div className='jg-testimonial-author'>
                <div className='jg-testimonial-avatar' style={{ backgroundColor: '#059669' }}>
                  KA
                </div>
                <div>
                  <div className='jg-testimonial-name'>Karim A.</div>
                  <div className='jg-testimonial-role'>Responsable RH & Concours Publics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section className='jg-section-faq' id='faq'>
        <div className='jg-container'>
          <div className='jg-section-title-wrap'>
            <div className='jg-section-eyebrow'>Foire Aux Questions</div>
            <h2 className='jg-section-heading'>Questions Fréquentes</h2>
            <p className='jg-section-desc'>
              Tout ce que vous devez savoir sur le calcul des scores, le reçu horodaté et la sécurité de vos données.
            </p>
          </div>

          <div className='jg-faq-list'>
            {[
              {
                q: "Comment est calculé le score de mon barème ?",
                a: "Chaque institution paramètre sa propre grille officielle de notation. Le barème prend en compte votre niveau d'études (Bac+2, Licence, Master, Ingénieur), la mention de votre diplôme, votre spécialité ainsi que d'éventuels critères d'âge ou d'expérience professionnelle. Le calcul est instantané et strictement impartial."
              },
              {
                q: "Le reçu numérique de dépôt a-t-il une valeur juridique ?",
                a: "Oui, absolument. Dès validation de votre candidature, un reçu officiel au format PDF est généré. Il comporte un numéro d'enregistrement unique, l'horodatage certifié de la soumission, ainsi que le récapitulatif de toutes les pièces déposées. Il fait foi auprès de l'institution recruteuse."
              },
              {
                q: "Mes documents et données personnelles sont-ils protégés ?",
                a: "Notre plateforme respecte scrupuleusement la loi 09-08 relative à la protection des données personnelles sous le contrôle de la CNDP. Toutes les pièces (CIN, diplômes, attestations) sont chiffrées (AES-256 / SSL TLS 1.3) et hébergées sur une infrastructure souveraine au Maroc."
              },
              {
                q: "Puis-je postuler à plusieurs concours avec le même compte ?",
                a: "Oui ! C'est le principe du Dossier Candidat Unique. Vous téléchargez vos justificatifs une seule fois. Lorsque de nouveaux concours s'ouvrent (CIH, Al Barid Bank, OCP, MEF), vous pouvez y postuler en un seul clic sans avoir à rescanner vos documents."
              },
              {
                q: "Comment savoir si mon dossier a été retenu pour les épreuves ?",
                a: "Vous pouvez suivre l'état d'avancement de votre candidature en temps réel depuis votre tableau de bord (Reçu, Contrôle N1 Conformité, Validation N2 Commission, Convoqué aux écrits). Une notification par e-mail et SMS vous est également transmise."
              }
            ].map((faq, idx) => (
              <div key={idx} className={`jg-faq-item ${openFaq === idx ? 'open' : ''}`}>
                <button
                  type='button'
                  className='jg-faq-question'
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <i className='fas fa-chevron-down'></i>
                </button>
                <div className='jg-faq-answer'>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL HIGH-IMPACT CTA BANNER */}
      <div className='jg-container'>
        <div className='jg-final-cta-card'>
          <div className='jg-final-cta-content'>
            <h2>
              Prêt à intégrer les <br />
              grandes institutions marocaines ?
            </h2>
            <p>
              Rejoignez plus de 50 000 candidats inscrits et postulez aux concours officiels de manière transparente, automatisée et sécurisée.
            </p>
          </div>
          <Link to={userInfo ? '/candidature' : '/register'} className='jg-btn-lime-cta'>
            Créer mon dossier gratuit <i className='fas fa-arrow-right ms-2'></i>
          </Link>
        </div>
      </div>

      {/* 10. PREMIUM 4-COLUMN FOOTER */}
      <footer className='jg-footer'>
        <div className='jg-container'>
          <div className='jg-footer-grid'>
            <div className='jg-footer-about'>
              <div className='jg-footer-brand'>
                <div className='jg-footer-brand-icon'>
                  <i className='fas fa-shield-alt'></i>
                </div>
                <div className='jg-footer-brand-text'>PORTAIL RECRUTEMENT</div>
              </div>
              <p>
                Plateforme souveraine de recrutement pour les concours publics, le secteur bancaire et les grandes entreprises du Royaume du Maroc.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '12px', fontWeight: 600 }}>
                <i className='fas fa-check-circle'></i> Plateforme conforme CNDP (Loi 09-08)
              </div>
            </div>

            <div className='jg-footer-col'>
              <h4>Candidats</h4>
              <ul>
                <li><a href='#offres'>Toutes les offres</a></li>
                <li><a href='#bento'>Simulateur de Barème</a></li>
                <li><a href='#process'>Processus de candidature</a></li>
                <li><Link to={userInfo ? '/candidature' : '/login'}>Espace Candidat</Link></li>
                <li><Link to='/register'>Créer un compte</Link></li>
              </ul>
            </div>

            <div className='jg-footer-col'>
              <h4>Institutions</h4>
              <ul>
                <li><Link to='/login'>Portail Contrôleur N1 / N2</Link></li>
                <li><Link to='/login'>Administration Concours</Link></li>
                <li><a href='#bento'>Barèmes & Algorithmes</a></li>
                <li><a href='#temoignages'>Partenaires Officiels</a></li>
                <li><a href='#faq'>Guide des Commissions</a></li>
              </ul>
            </div>

            <div className='jg-footer-col'>
              <h4>Support & Légal</h4>
              <ul>
                <li><a href='#faq'>Foire Aux Questions</a></li>
                <li><a href='#'>Mentions Légales</a></li>
                <li><a href='#'>Protection des données</a></li>
                <li><a href='#'>Conditions Générales</a></li>
                <li><a href='mailto:support@recrutement.ma'>Contact & Assistance</a></li>
              </ul>
            </div>
          </div>

          <div className='jg-footer-bottom'>
            <div>
              © 2026 Portail National des Concours Publics & Recrutements Bancaires. Tous droits réservés.
            </div>
            <div className='jg-footer-socials'>
              <a href='#' aria-label='LinkedIn'><i className='fab fa-linkedin'></i></a>
              <a href='#' aria-label='Twitter'><i className='fab fa-twitter'></i></a>
              <a href='#' aria-label='Facebook'><i className='fab fa-facebook'></i></a>
              <a href='#' aria-label='YouTube'><i className='fab fa-youtube'></i></a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomeScreen;
