import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Container, Row, Col, Card, Badge, Modal, Form, Button } from 'react-bootstrap';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';
import moment from 'moment';
import Pdf from 'react-to-pdf';
import Spinner from '../../components/Spinner';
import OfficialReceiptPDF from '../../components/OfficialReceiptPDF';
import { listCandidatures } from '../../actions/candidatureActions';
import { listUsers, logout } from '../../actions/userActions';
import { getFileUrl } from '../../utils/fileUrl';

const DEFAULT_SCORING_RULES = {
  maxScore: 100,
  age: {
    actif: true,
    poidsMax: 10,
    tranches: [
      { min: 18, max: 24, points: 10 },
      { min: 25, max: 28, points: 7 },
      { min: 29, max: 35, points: 3 },
    ],
  },
  note: {
    actif: true,
    poidsMax: 40,
    modeCalcul: 'tranches',
    tranches: [
      { minNote: 16, points: 40 },
      { minNote: 14, points: 30 },
      { minNote: 12, points: 20 },
      { minNote: 10, points: 10 },
    ],
  },
  mention: {
    actif: false,
    poidsMax: 20,
    points: { tresBien: 20, bien: 15, assezBien: 10, passable: 5 },
  },
  experience: {
    actif: true,
    poidsMax: 30,
    nomSpecialite: 'Bancaire',
    pointsParMoisSpecialite: 0.625,
    pointsParMoisAutre: 0.15,
    maxMois: 48,
  },
  diplome: {
    actif: true,
    poidsMax: 20,
    pointsParNiveau: { bac2: 10, bac3: 15, bac5: 20 },
  },
};

const MaitreCandidatures = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const printReceiptRef = useRef();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const candidatureList = useSelector((state) => state.candidatureList);
  const { candidatures, loading: loadingCandidatures } = candidatureList;

  const userList = useSelector((state) => state.userList);
  const { users } = userList;

  // Local state
  const [activeTab, setActiveTab] = useState('candidatures');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedScoreCandidate, setSelectedScoreCandidate] = useState(null);
  const [selectedInspectCandidate, setSelectedInspectCandidate] = useState(null);
  const [activeInspectDoc, setActiveInspectDoc] = useState('cni');
  const [offres, setOffres] = useState([]);
  const [loadingOffres, setLoadingOffres] = useState(false);
  const [entreprisesList, setEntreprisesList] = useState([]);

  // Modal Créer Offre
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalTab, setModalTab] = useState('general');
  const [submittingOffre, setSubmittingOffre] = useState(false);

  const ent = userInfo?.entreprise || {};
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState(ent._id || '');
  const orgNom = ent.nom || (userInfo?.poste?.includes('Barid') ? 'Al Barid Bank' : 'Espace Recruteur');
  const orgSigle = ent.sigle || 'RH';
  const orgColor = ent.couleurPrimaire || '#003366';

  // Offre fields with pre-filled institutional defaults
  const [titre, setTitre] = useState("Chargés de Recrutement & Opérations");
  const [specialite, setSpecialite] = useState('Ressources Humaines & Réseau');
  const [secteur, setSecteur] = useState(ent.secteur || 'Services & Conseil RH');
  const [ville, setVille] = useState('Casablanca, Rabat, Tanger');
  const [niveau, setNiveau] = useState('Bac +2 / Diplôme TS');
  const [postes, setPostes] = useState(10);
  const [dateLimite, setDateLimite] = useState(moment().add(30, 'days').format('YYYY-MM-DD'));
  const [description, setDescription] = useState(
    'Recrutement officiel pour le compte de notre institution. Les dossiers seront instruits et classés selon le barème officiel de sélection de la commission.'
  );
  const [formError, setFormError] = useState('');
  const [scoring, setScoring] = useState(DEFAULT_SCORING_RULES);

  const getOrgLogo = () => {
    if (ent.logo && !ent.logo.includes('logoABB') && !ent.logo.includes('default_org')) return ent.logo;
    if (orgSigle === 'LRT' || orgNom.toLowerCase().includes('recruteur')) return '/images/logos/lrt_logo.svg';
    if (orgSigle === 'CIH') return '/images/logos/cih_logo.svg';
    if (orgSigle === 'OCP') return '/images/logos/ocp_logo.svg';
    if (orgSigle === 'BOA') return '/images/logos/boa_logo.svg';
    if (orgSigle === 'MEF') return '/images/logos/mef_logo.svg';
    if (orgSigle === 'CDG') return '/images/logos/cdg_logo.svg';
    if (orgSigle === 'ABB' || orgNom.toLowerCase().includes('barid')) return '/assets/images/logoABB.png';
    return '/images/logos/lrt_logo.svg';
  };

  const fetchEntreprises = async () => {
    try {
      const { data } = await axios.get('/api/entreprises');
      setEntreprisesList(data || []);
      if (!selectedEntrepriseId && data && data.length > 0) {
        setSelectedEntrepriseId(data[0]._id);
        if (data[0].secteur) setSecteur(data[0].secteur);
      }
    } catch (err) {
      console.error('Erreur chargement entreprises:', err);
    }
  };

  const fetchOffres = async () => {
    try {
      setLoadingOffres(true);
      const { data } = await axios.get('/api/offres');
      // Filtrer les offres appartenant à cette entreprise si configurée
      if (ent._id && !userInfo?.isAdmin) {
        setOffres(data.filter((o) => String(o.entreprise?._id || o.entreprise) === String(ent._id)));
      } else {
        setOffres(data);
      }
      setLoadingOffres(false);
    } catch (err) {
      setLoadingOffres(false);
    }
  };

  useEffect(() => {
    if (!userInfo || (!userInfo.isMaitreOuvrage && !userInfo.isAdmin)) {
      navigate('/login');
    } else {
      dispatch(listCandidatures());
      dispatch(listUsers());
      fetchOffres();
      fetchEntreprises();
    }
  }, [userInfo, dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateOffre = async (e) => {
    e.preventDefault();
    if (!titre.trim() || !dateLimite) {
      setFormError("Veuillez renseigner l'intitulé officiel du poste et la date limite de dépôt.");
      setModalTab('general');
      addToast('Le titre et la date limite sont obligatoires', { appearance: 'warning' });
      return;
    }
    const targetEntrepriseId = selectedEntrepriseId || ent._id;
    if (!targetEntrepriseId) {
      setFormError("Veuillez sélectionner l'entreprise / organisme recruteur.");
      setModalTab('general');
      addToast("Veuillez sélectionner l'institution recruteuse", { appearance: 'warning' });
      return;
    }
    setFormError('');

    try {
      setSubmittingOffre(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(
        '/api/offres',
        {
          titre: titre.trim(),
          entreprise: targetEntrepriseId,
          specialite,
          secteur,
          ville,
          niveau,
          postes: Number(postes) || 1,
          dateLimite,
          description,
          scoringRules: scoring,
          reglesScoring: scoring,
        },
        config
      );

      setSubmittingOffre(false);
      setShowCreateModal(false);
      setActiveTab('offres'); // Switch to "Mes Concours & Offres Publiées"
      addToast('Concours / Offre publié avec succès !', { appearance: 'success' });
      fetchOffres();
    } catch (err) {
      setSubmittingOffre(false);
      addToast(err.response?.data?.message || err.message, { appearance: 'error' });
    }
  };

  const currentSelectedEnt = entreprisesList.find((x) => String(x._id) === String(selectedEntrepriseId)) || ent;
  const displayOrgNom = currentSelectedEnt?.nom || (orgNom !== 'Espace Recruteur' ? orgNom : 'Al Barid Bank & Institutions Partenaires');

  // Traitement des candidatures enrichies
  const enrichedCandidatures = (candidatures || []).map((cand) => {
    const userMatch = users && users.find((u) => String(u._id) === String(cand.user?._id || cand.user));
    return {
      ...cand,
      candidatNom: cand.user?.nom || userMatch?.nom || 'Candidat',
      candidatPrenom: cand.user?.prenom || userMatch?.prenom || '',
      candidatCni: cand.user?.cni || userMatch?.cni || 'WA141414',
      candidatEmail: cand.user?.email || userMatch?.email || '-',
      candidatPhone: cand.user?.phone || userMatch?.phone || '-',
      candidatCopieCNI: cand.copieCNI || cand.user?.copieCNI || userMatch?.copieCNI || '',
      scoreTotal: cand.scoreTotal !== undefined ? cand.scoreTotal : 70,
    };
  });

  // Filtre de recherche
  const filteredCandidatures = enrichedCandidatures.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.candidatNom && c.candidatNom.toLowerCase().includes(term)) ||
      (c.candidatPrenom && c.candidatPrenom.toLowerCase().includes(term)) ||
      (c.candidatCni && c.candidatCni.toLowerCase().includes(term)) ||
      (c.poste && c.poste.toLowerCase().includes(term))
    );
  });

  // Métriques KPI dynamiques
  const totalPostes = (offres || []).reduce((acc, o) => acc + (Number(o.postes) || 0), 0);
  const avgScore =
    enrichedCandidatures.length > 0
      ? (
          enrichedCandidatures.reduce((acc, c) => acc + (Number(c.scoreTotal) || 0), 0) /
          enrichedCandidatures.length
        ).toFixed(1)
      : null;
  const conformesCount = enrichedCandidatures.filter((c) => c.conforme === 'CONFORME').length;
  const conformiteRate =
    enrichedCandidatures.length > 0
      ? Math.round((conformesCount / enrichedCandidatures.length) * 100)
      : null;

  const exportCSV = () => {
    const headers = ['Nom', 'Prenom', 'CNI', 'Poste', 'Email', 'Telephone', 'Score / 100', 'Date Depot'];
    const rows = filteredCandidatures.map((c) => [
      `"${c.candidatNom}"`,
      `"${c.candidatPrenom}"`,
      `"${c.candidatCni}"`,
      `"${c.poste || 'Concours'}"`,
      `"${c.candidatEmail}"`,
      `"${c.candidatPhone}"`,
      `"${Number(c.scoreTotal).toFixed(2)}"`,
      `"${moment(c.createdAt).format('DD/MM/YYYY HH:mm')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `liste-candidats-${orgSigle}-${moment().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* 1. TOP NAVBAR RECRUTEUR PRO */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Container fluid style={{ maxWidth: '1400px', padding: '12px 24px' }}>
          <div className='d-flex align-items-center justify-content-between'>
            {/* BRANDING ENTREPRISE */}
            <div className='d-flex align-items-center gap-3'>
              <div
                style={{
                  height: '46px',
                  width: '46px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                }}
              >
                <img
                  src={getOrgLogo()}
                  alt={orgNom}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <div>
                <div className='d-flex align-items-center gap-2'>
                  <strong style={{ fontSize: '18px', color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {orgNom}
                  </strong>
                  <span
                    className='badge'
                    style={{
                      backgroundColor: orgColor,
                      fontSize: '11px',
                      fontWeight: '700',
                    }}
                  >
                    {orgSigle}
                  </span>
                </div>
                <small className='text-muted' style={{ fontSize: '11.5px' }}>
                  <i className='fas fa-shield-alt text-success me-1'></i> Portail Officiel des Recrutements & Concours RH
                </small>
              </div>
            </div>

            {/* RECRUITER ACTIONS */}
            <div className='d-flex align-items-center gap-3'>
              {userInfo?.isAdmin && (
                <Button
                  variant='primary'
                  size='sm'
                  style={{ borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <i className='fas fa-arrow-left me-1'></i> Dashboard Admin
                </Button>
              )}
              <Button
                variant='outline-secondary'
                size='sm'
                style={{ borderRadius: '8px', fontSize: '13px' }}
                onClick={() => {
                  navigate('/#offres');
                  setTimeout(() => {
                    const el = document.getElementById('offres');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }}
              >
                <i className='fas fa-external-link-alt me-1'></i> Voir le Portail Public
              </Button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#F1F5F9',
                  padding: '6px 14px',
                  borderRadius: '30px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: orgColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                >
                  RH
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', lineHeight: '1.2' }}>
                    {userInfo?.prenom} {userInfo?.nom}
                  </div>
                  <small style={{ color: '#059669', fontSize: '10.5px', fontWeight: '600' }}>
                    Responsable Recrutement
                  </small>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className='btn btn-sm btn-outline-danger'
                style={{ borderRadius: '8px' }}
                title='Déconnexion'
              >
                <i className='fas fa-sign-out-alt'></i>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* 2. HERO BANNER RECRUTEUR */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '30px 0 20px 0' }}>
        <Container fluid style={{ maxWidth: '1400px', padding: '0 24px' }}>
          <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4'>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '8px',
                }}
              >
                <i className='fas fa-briefcase'></i> Espace Recruteur Sécurisé
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Tableau de Bord Recrutement — {orgNom}
              </h2>
              <p style={{ color: '#64748B', fontSize: '13.5px', margin: '4px 0 0 0' }}>
                Centralisez la publication de vos concours nationaux, configurez vos critères de barème et classez automatiquement les dossiers candidats.
              </p>
            </div>

            {/* CALL TO ACTION BUTTON */}
            <Button
              className='btn-lg fw-bold shadow-sm'
              style={{
                background: '#1D4ED8',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '14.5px',
              }}
              onClick={() => setShowCreateModal(true)}
            >
              <i className='fas fa-plus-circle me-2'></i>
              Publier un Nouveau Concours / Offre
            </Button>
          </div>

          {/* QUICK METRICS */}
          <Row className='g-3 mb-2'>
            <Col md={3}>
              <Card className='border-0 shadow-sm rounded-3 p-3' style={{ background: '#F8FAFC' }}>
                <span className='text-muted small fw-bold text-uppercase'>Total Candidatures Reçues</span>
                <h3 className='fw-bold mb-0 text-dark mt-1'>{enrichedCandidatures.length}</h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className='border-0 shadow-sm rounded-3 p-3' style={{ background: '#F8FAFC' }}>
                <span className='text-muted small fw-bold text-uppercase'>Concours / Postes Déposés</span>
                <h3 className='fw-bold mb-0 text-primary mt-1'>
                  {offres.length} {offres.length > 0 && <span className='fs-6 text-muted fw-normal'>({totalPostes} postes)</span>}
                </h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className='border-0 shadow-sm rounded-3 p-3' style={{ background: '#F8FAFC' }}>
                <span className='text-muted small fw-bold text-uppercase'>Score Barème Moyen</span>
                {avgScore !== null ? (
                  <h3 className='fw-bold mb-0 text-success mt-1'>{avgScore} / 100</h3>
                ) : (
                  <h3 className='fw-bold mb-0 text-muted mt-1'>—</h3>
                )}
              </Card>
            </Col>
            <Col md={3}>
              <Card className='border-0 shadow-sm rounded-3 p-3' style={{ background: '#F8FAFC' }}>
                <span className='text-muted small fw-bold text-uppercase'>Conformité Légale CNDP</span>
                {conformiteRate !== null ? (
                  <h3 className='fw-bold mb-0 text-info mt-1'>{conformiteRate}% Certifié</h3>
                ) : (
                  <h3 className='fw-bold mb-0 text-muted mt-1'>En attente</h3>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 3. TABS & MAIN CONTENT */}
      <Container fluid style={{ maxWidth: '1400px', padding: '24px' }}>
        {/* TAB NAVIGATION */}
        <div className='d-flex align-items-center gap-2 mb-4 border-bottom pb-2'>
          <button
            type='button'
            className={`btn ${activeTab === 'candidatures' ? 'btn-primary' : 'btn-light'} fw-bold px-3 py-2`}
            style={{ borderRadius: '8px' }}
            onClick={() => setActiveTab('candidatures')}
          >
            <i className='fas fa-users me-2'></i>
            Candidatures & Classement par Score ({filteredCandidatures.length})
          </button>
          <button
            type='button'
            className={`btn ${activeTab === 'offres' ? 'btn-primary' : 'btn-light'} fw-bold px-3 py-2`}
            style={{ borderRadius: '8px' }}
            onClick={() => setActiveTab('offres')}
          >
            <i className='fas fa-briefcase me-2'></i>
            Mes Concours & Offres Publiées ({offres.length})
          </button>
        </div>

        {/* TAB 1: CANDIDATURES TABLE */}
        {activeTab === 'candidatures' && (
          <Card className='border-0 shadow-sm rounded-3 overflow-hidden'>
            <Card.Header className='bg-white py-3 border-0'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-3'>
                <div className='d-flex align-items-center gap-2' style={{ maxWidth: '400px', width: '100%' }}>
                  <i className='fas fa-search text-muted'></i>
                  <Form.Control
                    type='text'
                    placeholder='Rechercher par Nom, CNI ou Poste...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>

                <Button
                  variant='outline-dark'
                  size='sm'
                  className='fw-bold'
                  style={{ borderRadius: '8px' }}
                  onClick={exportCSV}
                >
                  <i className='fas fa-file-excel text-success me-2'></i>
                  Exporter la Liste des Convoqués (Excel / CSV)
                </Button>
              </div>
            </Card.Header>

            {loadingCandidatures ? (
              <div className='text-center py-5'>
                <Spinner size={60} />
              </div>
            ) : filteredCandidatures.length === 0 ? (
              <div className='text-center py-5 text-muted'>
                <i className='fas fa-folder-open fa-3x mb-3 d-block text-secondary'></i>
                <h5 className='fw-bold text-dark'>Aucune postulation enregistrée</h5>
                <p className='small'>Les candidats qui postuleront à vos offres apparaîtront ici automatiquement avec leur score barème.</p>
              </div>
            ) : (
              <div className='table-responsive'>
                <table className='table table-hover align-middle mb-0'>
                  <thead className='bg-light text-uppercase small text-muted'>
                    <tr>
                      <th style={{ paddingLeft: '20px' }}>Candidat & Identité</th>
                      <th>Poste & Concours</th>
                      <th>Score Barème (/100)</th>
                      <th>Pièces du Dossier</th>
                      <th>Statut</th>
                      <th className='text-end' style={{ paddingRight: '20px' }}>Actions & Contrôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidatures.map((c) => {
                      const hasCni = !!(c.candidatCopieCNI || c.copieCNI || c.user?.copieCNI);
                      const hasDip = !!c.copieDiplomes;
                      const hasRel = !!c.releves;
                      const hasExp = !!c.attestationsTravail;
                      const piecesCount = (hasCni ? 1 : 0) + (hasDip ? 1 : 0) + (hasRel ? 1 : 0) + (hasExp ? 1 : 0);

                      return (
                        <tr key={c._id}>
                          <td style={{ paddingLeft: '20px' }}>
                            <div className='d-flex align-items-center gap-2'>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: '#EFF6FF',
                                  color: '#1D4ED8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: '700',
                                  fontSize: '12px',
                                }}
                              >
                                {(c.candidatNom || 'C').charAt(0)}
                              </div>
                              <div>
                                <div className='fw-bold text-dark'>
                                  {c.candidatNom} {c.candidatPrenom}
                                </div>
                                <small className='text-muted font-monospace'>CNI: {c.candidatCni}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className='fw-bold text-dark' style={{ fontSize: '13.5px' }}>
                              {c.poste || 'Concours National'}
                            </div>
                            <small className='text-muted font-monospace'>{c.numeroDossier || 'Dossier'}</small>
                          </td>
                          <td>
                            <div
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedScoreCandidate(c)}
                              title='Cliquer pour afficher la décomposition détaillée du score'
                            >
                              <span
                                className='badge'
                                style={{
                                  background: '#DCFCE7',
                                  color: '#15803D',
                                  fontSize: '13px',
                                  padding: '5px 10px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                <i className='fas fa-chart-line me-1'></i>
                                {Number(Number(c.scoreTotal).toFixed(2))} / 100 pts
                              </span>
                              <div className='d-flex gap-1 mt-1 flex-wrap' style={{ fontSize: '10px' }}>
                                <span className='badge bg-light text-dark border'>Dip: {c.scoreDiplome !== undefined ? c.scoreDiplome : '-'}</span>
                                <span className='badge bg-light text-dark border'>Exp: {c.scoreExperience !== undefined ? c.scoreExperience : '-'}</span>
                                <span className='badge bg-light text-dark border'>Note: {c.scoreNote !== undefined ? c.scoreNote : '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <span
                                className={`badge ${piecesCount === 4 ? 'bg-success' : 'bg-warning text-dark'}`}
                                style={{ fontSize: '11px', padding: '5px 8px' }}
                              >
                                <i className={`fas ${piecesCount === 4 ? 'fa-check-double' : 'fa-exclamation-triangle'} me-1`}></i>
                                {piecesCount === 4 ? 'Dossier Complet (4/4)' : `Incomplet (${piecesCount}/4)`}
                              </span>
                              <div className='d-flex gap-1 mt-1'>
                                <span title={hasCni ? 'CNIE Reçue' : 'CNIE Manquante'} className={`badge ${hasCni ? 'bg-light text-success border-success' : 'bg-light text-danger border-danger'} border`} style={{ fontSize: '9.5px' }}>
                                  {hasCni ? '✓' : '✗'} CNI
                                </span>
                                <span title={hasDip ? 'Diplôme Reçu' : 'Diplôme Manquant'} className={`badge ${hasDip ? 'bg-light text-success border-success' : 'bg-light text-danger border-danger'} border`} style={{ fontSize: '9.5px' }}>
                                  {hasDip ? '✓' : '✗'} DIP
                                </span>
                                <span title={hasRel ? 'Relevés Reçus' : 'Relevés Manquants'} className={`badge ${hasRel ? 'bg-light text-success border-success' : 'bg-light text-danger border-danger'} border`} style={{ fontSize: '9.5px' }}>
                                  {hasRel ? '✓' : '✗'} REL
                                </span>
                                <span title={hasExp ? 'Attestations Reçues' : 'Attestations Manquantes'} className={`badge ${hasExp ? 'bg-light text-success border-success' : 'bg-light text-danger border-danger'} border`} style={{ fontSize: '9.5px' }}>
                                  {hasExp ? '✓' : '✗'} EXP
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className='badge bg-success-subtle text-success border border-success' style={{ fontSize: '11px', padding: '5px 8px' }}>
                              <i className='fas fa-check-circle me-1'></i> Enregistré
                            </span>
                          </td>
                          <td className='text-end' style={{ paddingRight: '20px' }}>
                            <Button
                              variant='primary'
                              size='sm'
                              className='fw-bold me-2'
                              style={{ borderRadius: '6px', backgroundColor: '#0284C7', borderColor: '#0284C7' }}
                              onClick={() => {
                                setSelectedInspectCandidate(c);
                                setActiveInspectDoc('cni');
                              }}
                              title='Vérifier les pièces justificatives et documents'
                            >
                              <i className='fas fa-folder-open me-1'></i> Contrôler Pièces
                            </Button>
                            <Button
                              variant='outline-secondary'
                              size='sm'
                              className='fw-bold'
                              style={{ borderRadius: '6px' }}
                              onClick={() => setSelectedReceipt(c)}
                              title='Aperçu du Récépissé Officiel A4'
                            >
                              <i className='fas fa-print me-1'></i> Récépissé
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* TAB 2: OFFRES DE CETTE ENTREPRISE */}
        {activeTab === 'offres' && (
          <div>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <h5 className='fw-bold text-dark mb-0'>Concours Déposés par {orgNom}</h5>
              <Button
                variant='primary'
                size='sm'
                className='fw-bold'
                style={{ background: '#1D4ED8', border: 'none', borderRadius: '8px' }}
                onClick={() => setShowCreateModal(true)}
              >
                <i className='fas fa-plus me-1'></i> Déposer un Nouveau Concours
              </Button>
            </div>

            {loadingOffres ? (
              <div className='text-center py-5'>
                <Spinner size={60} />
              </div>
            ) : offres.length === 0 ? (
              <Card className='border-0 shadow-sm rounded-3 p-5 text-center'>
                <i className='fas fa-briefcase fa-3x text-secondary mb-3 d-block'></i>
                <h5 className='fw-bold text-dark'>Aucun concours ouvert pour le moment</h5>
                <p className='text-muted small mb-3'>
                  Publiez votre premier concours de recrutement avec votre barème sur-mesure pour recevoir les candidatures.
                </p>
                <Button
                  variant='primary'
                  className='mx-auto fw-bold'
                  style={{ background: '#1D4ED8', border: 'none', borderRadius: '8px' }}
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className='fas fa-plus-circle me-1'></i> Publier une Offre Maintenant
                </Button>
              </Card>
            ) : (
              <Row className='g-3'>
                {offres.map((o) => (
                  <Col md={6} key={o._id}>
                    <Card className='border-0 shadow-sm rounded-3 p-4 h-100'>
                      <div className='d-flex justify-content-between align-items-start mb-2'>
                        <span className='badge bg-primary' style={{ backgroundColor: orgColor }}>
                          {orgSigle}
                        </span>
                        <span className='badge bg-success'>
                          <i className='fas fa-clock me-1'></i> Clôture : {moment(o.dateLimite).format('DD/MM/YYYY')}
                        </span>
                      </div>
                      <h4 className='fw-bold text-dark mb-2' style={{ fontSize: '17px' }}>{o.titre}</h4>
                      <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mt-auto pt-3 border-top'>
                        <div className='d-flex flex-wrap gap-3 text-muted small'>
                          <span><i className='fas fa-map-marker-alt me-1 text-primary'></i> {o.ville}</span>
                          <span><i className='fas fa-graduation-cap me-1 text-success'></i> {o.niveau}</span>
                          <span><i className='fas fa-users me-1 text-warning'></i> {o.postes} Postes</span>
                        </div>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          style={{ borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}
                          onClick={() => {
                            navigate('/#offres');
                            setTimeout(() => {
                              const el = document.getElementById('offres');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 200);
                          }}
                        >
                          <i className='fas fa-eye me-1'></i> Voir sur Landing Page
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}
      </Container>

      {/* 4. MODAL PUBLIER CONCOURS / OFFRE RECRUTEUR */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size='xl' centered>
        <Form onSubmit={handleCreateOffre}>
          <Modal.Header closeButton className='bg-light'>
            <Modal.Title className='fs-5 fw-bold text-dark d-flex align-items-center gap-2'>
              <i className='fas fa-bullhorn text-primary'></i>
              <span>Publier un Nouveau Concours — <span className='text-primary'>{displayOrgNom}</span></span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='p-4'>
            {/* TABS MODAL */}
            <div className='d-flex gap-2 mb-4 border-bottom pb-2'>
              <Button
                variant={modalTab === 'general' ? 'primary' : 'light'}
                size='sm'
                className='fw-bold'
                onClick={() => setModalTab('general')}
              >
                1. Informations Générales
              </Button>
              <Button
                variant={modalTab === 'scoring' ? 'primary' : 'light'}
                size='sm'
                className='fw-bold'
                onClick={() => setModalTab('scoring')}
              >
                2. Grille de Sélection & Barème (100 Pts)
              </Button>
            </div>

            {formError && (
              <div className='alert alert-danger py-2 small mb-3'>
                <i className='fas fa-exclamation-triangle me-1'></i> {formError}
              </div>
            )}

            <div style={{ display: modalTab === 'general' ? 'block' : 'none' }}>
              <div>
                {/* SÉLECTION OFFICIELLE DE L'ENTREPRISE / ORGANISME */}
                {(!ent._id || userInfo?.isAdmin) && (
                  <Form.Group className='mb-4 p-3 bg-light rounded-3 border border-primary border-opacity-25'>
                    <Form.Label className='fw-bold text-dark d-flex align-items-center justify-content-between mb-2'>
                      <span>
                        <i className='fas fa-building text-primary me-2'></i>
                        Institution / Entreprise Recruteuse *
                      </span>
                      {currentSelectedEnt?.sigle && (
                        <Badge bg='primary' className='px-3 py-1 fs-6'>
                          {currentSelectedEnt.sigle}
                        </Badge>
                      )}
                    </Form.Label>
                    <Form.Select
                      value={selectedEntrepriseId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedEntrepriseId(val);
                        const match = entreprisesList.find((x) => String(x._id) === String(val));
                        if (match && match.secteur) {
                          setSecteur(match.secteur);
                        }
                      }}
                      required
                      className='form-select-lg fw-bold shadow-sm'
                      style={{ border: '2px solid #2563EB', background: '#FFFFFF' }}
                    >
                      <option value=''>-- Sélectionner l'institution (Al Barid Bank, OCP, CIH, MEF, CDG, etc.) --</option>
                      {entreprisesList.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.nom} ({item.sigle}) — {item.secteur}
                        </option>
                      ))}
                    </Form.Select>
                    {currentSelectedEnt?.nom && (
                      <div className='d-flex align-items-center gap-2 mt-2 text-muted small'>
                        <i className='fas fa-check-circle text-success'></i>
                        <span>Le concours sera publié sous la bannière officielle de <strong>{currentSelectedEnt.nom}</strong> ({currentSelectedEnt.secteur}).</span>
                      </div>
                    )}
                  </Form.Group>
                )}

                {ent._id && !userInfo?.isAdmin && (
                  <div className='p-3 mb-4 bg-primary bg-opacity-10 rounded-3 border border-primary d-flex align-items-center gap-3'>
                    <img
                      src={getOrgLogo()}
                      alt={orgNom}
                      style={{ height: '42px', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = '/images/logos/lrt_logo.svg'; }}
                    />
                    <div>
                      <div className='fw-bold text-primary fs-6'>{orgNom} ({orgSigle})</div>
                      <div className='small text-muted'>{ent.secteur || 'Secteur Institutionnel'}</div>
                    </div>
                  </div>
                )}

                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>Intitulé Officiel du Poste / Concours *</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder="Ex: Chargés d'Opérations Bancaires & Accueil Clientèle"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    required
                  />
                </Form.Group>

                <Row className='g-3 mb-3'>
                  <Col md={6}>
                    <Form.Label className='fw-bold small text-muted'>Spécialité Demandée</Form.Label>
                    <Form.Control
                      type='text'
                      value={specialite}
                      onChange={(e) => setSpecialite(e.target.value)}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className='fw-bold small text-muted'>Secteur d'Activité</Form.Label>
                    <Form.Control
                      type='text'
                      value={secteur}
                      onChange={(e) => setSecteur(e.target.value)}
                    />
                  </Col>
                </Row>

                <Row className='g-3 mb-3'>
                  <Col md={4}>
                    <Form.Label className='fw-bold small text-muted'>Niveau d'Étude Minimum</Form.Label>
                    <Form.Select value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                      <option value='Bac +2'>Bac +2 / Diplôme TS</option>
                      <option value='Bac +3'>Bac +3 / Licence</option>
                      <option value='Bac +5'>Bac +5 / Master / Ingénieur</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Label className='fw-bold small text-muted'>Nombre de Postes Budgétaires</Form.Label>
                    <Form.Control
                      type='number'
                      min='1'
                      value={postes}
                      onChange={(e) => setPostes(e.target.value)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className='fw-bold small text-muted'>Date Limite de Dépôt *</Form.Label>
                    <Form.Control
                      type='date'
                      value={dateLimite}
                      onChange={(e) => setDateLimite(e.target.value)}
                      required
                    />
                  </Col>
                </Row>

                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>Villes / Régions Concernées</Form.Label>
                  <Form.Control
                    type='text'
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>Description & Conditions de Candidature</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={3}
                    placeholder='Précisez les missions, compétences requises et pièces justificatives...'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>

            <div style={{ display: modalTab === 'scoring' ? 'block' : 'none' }}>
              {(() => {
              const totalPoids =
                (Number(scoring.diplome.poidsMax) || 0) +
                (Number(scoring.experience.poidsMax) || 0) +
                (Number(scoring.note.poidsMax) || 0) +
                (Number(scoring.age.poidsMax) || 0);

              return (
                <div>
                  {/* TOTAL BANNER */}
                  <div
                    className='d-flex justify-content-between align-items-center p-3 mb-4 rounded-3'
                    style={{
                      background: totalPoids === 100 ? '#ECFDF5' : '#FEF2F2',
                      border: `1px solid ${totalPoids === 100 ? '#A7F3D0' : '#FECACA'}`,
                    }}
                  >
                    <div>
                      <h6
                        className='fw-bold mb-1'
                        style={{ color: totalPoids === 100 ? '#065F46' : '#991B1B' }}
                      >
                        {totalPoids === 100
                          ? '✓ Grille Équilibrée : Total Exact de 100 / 100 Pts'
                          : `⚠ Total Actuel : ${totalPoids} Pts (La somme doit égaler 100 Pts)`}
                      </h6>
                      <p
                        className='small mb-0'
                        style={{ color: totalPoids === 100 ? '#047857' : '#B91C1C' }}
                      >
                        Chaque critère se subdivise automatiquement en tranches précises selon la position de votre curseur.
                      </p>
                    </div>
                    <Badge
                      bg={totalPoids === 100 ? 'success' : 'danger'}
                      style={{ fontSize: '15px', padding: '8px 16px', borderRadius: '8px' }}
                    >
                      {totalPoids} / 100 Pts
                    </Badge>
                  </div>

                  <Row className='g-4'>
                    {/* CRITÈRE 1: DIPLÔME */}
                    <Col md={6}>
                      <Card className='p-3 border rounded-3 h-100 shadow-sm'>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                          <span className='fw-bold text-dark'>
                            <i className='fas fa-graduation-cap text-primary me-2'></i>
                            1. Poids Diplôme & Niveau d'Étude
                          </span>
                          <Badge bg='primary' style={{ fontSize: '13px' }}>
                            {scoring.diplome.poidsMax} Pts
                          </Badge>
                        </div>
                        <Form.Range
                          min='0'
                          max='50'
                          value={scoring.diplome.poidsMax}
                          onChange={(e) =>
                            setScoring({
                              ...scoring,
                              diplome: { ...scoring.diplome, poidsMax: Number(e.target.value) },
                            })
                          }
                        />

                        {/* TRANCHES EXPLICATIVES DIPLÔME */}
                        <div className='mt-3 p-2 bg-light rounded border' style={{ fontSize: '11.5px', color: '#334155' }}>
                          <div className='fw-bold text-dark mb-1'>
                            <i className='fas fa-sitemap me-1 text-primary'></i> Répartition automatique selon le diplôme certifié :
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• Bac +5 (Master / Diplôme d'Ingénieur d'État) :</span>
                            <strong className='text-primary'>{scoring.diplome.poidsMax} Pts (100%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• Bac +3 (Licence / Bachelor Professionnel) :</span>
                            <strong>{(scoring.diplome.poidsMax * 0.75).toFixed(1)} Pts (75%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1'>
                            <span>• Bac +2 (BTS / DUT / DTS OFPPT) :</span>
                            <strong>{(scoring.diplome.poidsMax * 0.5).toFixed(1)} Pts (50%)</strong>
                          </div>
                        </div>
                      </Card>
                    </Col>

                    {/* CRITÈRE 2: EXPÉRIENCE */}
                    <Col md={6}>
                      <Card className='p-3 border rounded-3 h-100 shadow-sm'>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                          <span className='fw-bold text-dark'>
                            <i className='fas fa-briefcase text-success me-2'></i>
                            2. Poids Expérience Professionnelle
                          </span>
                          <Badge bg='success' style={{ fontSize: '13px' }}>
                            {scoring.experience.poidsMax} Pts
                          </Badge>
                        </div>
                        <Form.Range
                          min='0'
                          max='50'
                          value={scoring.experience.poidsMax}
                          onChange={(e) =>
                            setScoring({
                              ...scoring,
                              experience: { ...scoring.experience, poidsMax: Number(e.target.value) },
                            })
                          }
                        />

                        {/* TRANCHES EXPLICATIVES EXPÉRIENCE */}
                        <div className='mt-3 p-2 bg-light rounded border' style={{ fontSize: '11.5px', color: '#334155' }}>
                          <div className='fw-bold text-dark mb-1 d-flex justify-content-between'>
                            <span><i className='fas fa-calculator me-1 text-success'></i> Calcul au prorata mensuel (Plafond 48 mois = 4 ans) :</span>
                            <span className='badge bg-light text-success border'>+{(scoring.experience.poidsMax / 48).toFixed(3)} pt / mois</span>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• ≥ 4 ans (48 mois) dans la spécialité :</span>
                            <strong className='text-success'>{scoring.experience.poidsMax} Pts (100% Max)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• 3 ans (36 mois) :</span>
                            <strong>{(scoring.experience.poidsMax * 0.75).toFixed(1)} Pts (~23 Pts)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• 2 ans (24 mois) :</span>
                            <strong>{(scoring.experience.poidsMax * 0.5).toFixed(1)} Pts</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• 1 an (12 mois) :</span>
                            <strong>{(scoring.experience.poidsMax * 0.25).toFixed(1)} Pts</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• 8 mois (ou > 2 ans hors spécialité) :</span>
                            <strong>{(scoring.experience.poidsMax * (8 / 48)).toFixed(1)} Pts (~5 Pts)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1'>
                            <span>• Sans expérience / Débutant (0 mois) :</span>
                            <span className='text-muted'>0 Pt</span>
                          </div>
                        </div>
                      </Card>
                    </Col>

                    {/* CRITÈRE 3: NOTES & MOYENNE */}
                    <Col md={6}>
                      <Card className='p-3 border rounded-3 h-100 shadow-sm'>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                          <span className='fw-bold text-dark'>
                            <i className='fas fa-chart-line text-warning me-2'></i>
                            3. Poids Notes / Moyenne Académique
                          </span>
                          <Badge bg='warning' text='dark' style={{ fontSize: '13px' }}>
                            {scoring.note.poidsMax} Pts
                          </Badge>
                        </div>
                        <Form.Range
                          min='0'
                          max='50'
                          value={scoring.note.poidsMax}
                          onChange={(e) =>
                            setScoring({
                              ...scoring,
                              note: { ...scoring.note, poidsMax: Number(e.target.value) },
                            })
                          }
                        />

                        {/* TRANCHES EXPLICATIVES NOTES */}
                        <div className='mt-3 p-2 bg-light rounded border' style={{ fontSize: '11.5px', color: '#334155' }}>
                          <div className='fw-bold text-dark mb-1'>
                            <i className='fas fa-award me-1 text-warning'></i> Paliers selon la Moyenne Générale du diplôme (/20) :
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• Note ≥ 16/20 (Mention Très Bien) :</span>
                            <strong className='text-warning'>{scoring.note.poidsMax} Pts (100%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• Note ≥ 14/20 (Mention Bien) :</span>
                            <strong>{(scoring.note.poidsMax * 0.75).toFixed(1)} Pts (75%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• Note ≥ 12/20 (Mention Assez Bien) :</span>
                            <strong>{(scoring.note.poidsMax * 0.5).toFixed(1)} Pts (50%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• Note ≥ 10/20 (Mention Passable) :</span>
                            <strong>{(scoring.note.poidsMax * 0.25).toFixed(1)} Pts (25%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 text-danger'>
                            <span>• Note &lt; 10/20 :</span>
                            <strong>0 Pt (Éliminatoire)</strong>
                          </div>
                        </div>
                      </Card>
                    </Col>

                    {/* CRITÈRE 4: ÂGE */}
                    <Col md={6}>
                      <Card className='p-3 border rounded-3 h-100 shadow-sm'>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                          <span className='fw-bold text-dark'>
                            <i className='fas fa-user-clock text-info me-2'></i>
                            4. Poids Âge du Candidat
                          </span>
                          <Badge bg='info' style={{ fontSize: '13px' }}>
                            {scoring.age.poidsMax} Pts
                          </Badge>
                        </div>
                        <Form.Range
                          min='0'
                          max='30'
                          value={scoring.age.poidsMax}
                          onChange={(e) =>
                            setScoring({
                              ...scoring,
                              age: { ...scoring.age, poidsMax: Number(e.target.value) },
                            })
                          }
                        />

                        {/* TRANCHES EXPLICATIVES ÂGE */}
                        <div className='mt-3 p-2 bg-light rounded border' style={{ fontSize: '11.5px', color: '#334155' }}>
                          <div className='fw-bold text-dark mb-1'>
                            <i className='fas fa-calendar-check me-1 text-info'></i> Paliers selon les tranches officielles des concours :
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• 18 à 24 ans (Jeune diplômé prioritaire) :</span>
                            <strong className='text-info'>{scoring.age.poidsMax} Pts (100%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• 25 à 28 ans :</span>
                            <strong>{(scoring.age.poidsMax * 0.7).toFixed(1)} Pts (70%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 border-bottom'>
                            <span>• 29 à 35 ans :</span>
                            <strong>{(scoring.age.poidsMax * 0.3).toFixed(1)} Pts (30%)</strong>
                          </div>
                          <div className='d-flex justify-content-between py-1 text-muted'>
                            <span>• Supérieur à 35 ans :</span>
                            <span>0 Pt</span>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* SIMULATEUR EN DIRECT D'UN CANDIDAT TYPE */}
                  <div className='mt-4 p-3 rounded-3 border bg-white shadow-sm'>
                    <div className='d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2'>
                      <h6 className='fw-bold text-dark mb-0'>
                        <i className='fas fa-user-check text-primary me-2'></i>
                        Exemples de simulation en direct : Répartition automatique pour 3 candidats réels
                      </h6>
                      <Badge bg='primary'>Algorithme Automatisé</Badge>
                    </div>
                    <Row className='g-2 mt-1' style={{ fontSize: '12px' }}>
                      <Col md={4}>
                        <div className='p-2 rounded border bg-light h-100'>
                          <div className='fw-bold text-success d-flex justify-content-between'>
                            <span>Profil A : Senior Spécialisé</span>
                            <Badge bg='success'>Max Pts</Badge>
                          </div>
                          <div className='text-muted small mt-1'>
                            • Bac +5 (Ingénieur / Master) : {(scoring.diplome.poidsMax).toFixed(1)} pts<br/>
                            • ≥ 4 ans d'exp {scoring.experience.nomSpecialite || 'Bancaire'} : {(scoring.experience.poidsMax).toFixed(1)} pts<br/>
                            • Moyenne 16.5/20 (Très Bien) : {(scoring.note.poidsMax).toFixed(1)} pts<br/>
                            • 24 ans (Jeune diplômé) : {(scoring.age.poidsMax).toFixed(1)} pts
                          </div>
                          <div className='mt-2 fw-bold text-success border-top pt-1'>
                            Score Total : {(scoring.diplome.poidsMax + scoring.experience.poidsMax + scoring.note.poidsMax + scoring.age.poidsMax).toFixed(1)} / 100 Pts
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className='p-2 rounded border bg-light h-100'>
                          <div className='fw-bold text-primary d-flex justify-content-between'>
                            <span>Profil B : Confirmé (3 ans)</span>
                            <Badge bg='primary'>Score Élevé</Badge>
                          </div>
                          <div className='text-muted small mt-1'>
                            • Bac +3 (Licence Pro) : {(scoring.diplome.poidsMax * 0.75).toFixed(1)} pts<br/>
                            • 3 ans d'exp (36 mois) : {(scoring.experience.poidsMax * 0.75).toFixed(1)} pts (~23 pts)<br/>
                            • Moyenne 14.2/20 (Bien) : {(scoring.note.poidsMax * 0.75).toFixed(1)} pts<br/>
                            • 26 ans : {(scoring.age.poidsMax * 0.7).toFixed(1)} pts
                          </div>
                          <div className='mt-2 fw-bold text-primary border-top pt-1'>
                            Score Total : {(scoring.diplome.poidsMax * 0.75 + scoring.experience.poidsMax * 0.75 + scoring.note.poidsMax * 0.75 + scoring.age.poidsMax * 0.7).toFixed(1)} / 100 Pts
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className='p-2 rounded border bg-light h-100'>
                          <div className='fw-bold text-warning d-flex justify-content-between'>
                            <span>Profil C : Junior / Débutant</span>
                            <Badge bg='secondary'>Débutant</Badge>
                          </div>
                          <div className='text-muted small mt-1'>
                            • Bac +2 (BTS / DUT) : {(scoring.diplome.poidsMax * 0.5).toFixed(1)} pts<br/>
                            • 8 mois d'exp : {(scoring.experience.poidsMax * (8/48)).toFixed(1)} pts (~5 pts)<br/>
                            • Moyenne 11.5/20 : {(scoring.note.poidsMax * 0.25).toFixed(1)} pts<br/>
                            • 22 ans : {(scoring.age.poidsMax).toFixed(1)} pts
                          </div>
                          <div className='mt-2 fw-bold text-dark border-top pt-1'>
                            Score Total : {(scoring.diplome.poidsMax * 0.5 + scoring.experience.poidsMax * (8/48) + scoring.note.poidsMax * 0.25 + scoring.age.poidsMax).toFixed(1)} / 100 Pts
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              );
            })()}
            </div>
          </Modal.Body>
          <Modal.Footer className='bg-light d-flex justify-content-between'>
            <Button variant='secondary' onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <div>
              {modalTab === 'general' ? (
                <Button
                  variant='primary'
                  type='button'
                  onClick={() => setModalTab('scoring')}
                  style={{ background: '#1D4ED8', border: 'none', fontWeight: '700' }}
                >
                  Suivant : Configurer le Barème (100 Pts) <i className='fas fa-arrow-right ms-1'></i>
                </Button>
              ) : (
                <div className='d-flex gap-2'>
                  <Button
                    variant='outline-secondary'
                    type='button'
                    onClick={() => setModalTab('general')}
                  >
                    <i className='fas fa-arrow-left me-1'></i> Précédent
                  </Button>
                  <Button
                    variant='success'
                    type='submit'
                    disabled={submittingOffre}
                    style={{ background: '#16A34A', border: 'none', fontWeight: '700' }}
                  >
                    <i className='fas fa-check-circle me-1'></i>
                    {submittingOffre ? 'Publication en cours...' : 'Publier le Concours Officiellement'}
                  </Button>
                </div>
              )}
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 5. MODAL APERÇU DU RÉCÉPISSÉ PLEIN FORMAT A4 */}
      {selectedReceipt && (
        <Modal
          show={true}
          onHide={() => setSelectedReceipt(null)}
          size='xl'
          centered
          dialogClassName='modal-receipt-custom'
        >
          <Modal.Header closeButton className='bg-dark text-white'>
            <Modal.Title className='fs-5 fw-bold'>
              <i className='fas fa-file-contract text-primary me-2'></i>
              Récépissé Officiel — Dossier {selectedReceipt.numeroDossier || selectedReceipt.candidatCni}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: '#334155', display: 'flex', justifyContent: 'center', padding: '30px' }}>
            <div style={{ width: '794px', minWidth: '794px' }}>
              <OfficialReceiptPDF
                ref={printReceiptRef}
                candidature={selectedReceipt}
                userInfo={selectedReceipt.user || selectedReceipt}
              />
            </div>
          </Modal.Body>
          <Modal.Footer className='bg-dark text-white d-flex justify-content-between'>
            <Button variant='outline-light' onClick={() => window.print()}>
              <i className='fas fa-print me-1'></i> Imprimer
            </Button>
            <Button variant='secondary' onClick={() => setSelectedReceipt(null)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* 6. MODAL DÉCOMPOSITION DU SCORE CANDIDAT */}
      {selectedScoreCandidate && (
        <Modal
          show={true}
          onHide={() => setSelectedScoreCandidate(null)}
          centered
          size='lg'
        >
          <Modal.Header closeButton className='bg-primary text-white'>
            <Modal.Title className='fs-5 fw-bold'>
              <i className='fas fa-calculator me-2'></i>
              Décomposition Détaillée du Barème — {selectedScoreCandidate.candidatNom} {selectedScoreCandidate.candidatPrenom}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='p-4'>
            <div className='d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3 border flex-wrap gap-2'>
              <div>
                <h5 className='fw-bold mb-1 text-dark'>
                  {selectedScoreCandidate.candidatNom} {selectedScoreCandidate.candidatPrenom}
                </h5>
                <span className='text-muted small me-3'>CNI : <strong>{selectedScoreCandidate.candidatCni}</strong></span>
                <span className='text-muted small'>Concours : <strong>{selectedScoreCandidate.poste || 'Concours National'}</strong></span>
              </div>
              <div className='text-end'>
                <span className='badge bg-success fs-5 px-3 py-2'>
                  {Number(Number(selectedScoreCandidate.scoreTotal).toFixed(2))} / 100 Pts
                </span>
                <div className='text-muted small mt-1'>Score Global Validé</div>
              </div>
            </div>

            <h6 className='fw-bold text-dark mb-3'>
              <i className='fas fa-list-check me-2 text-primary'></i>
              Détail des 4 critères officiels du barème :
            </h6>

            <Row className='g-3 mb-4'>
              <Col md={6}>
                <div className='p-3 border rounded-3 bg-white h-100 shadow-sm'>
                  <div className='d-flex justify-content-between align-items-center mb-1'>
                    <span className='fw-bold text-dark'><i className='fas fa-graduation-cap text-primary me-2'></i> 1. Diplôme</span>
                    <Badge bg='primary'>{selectedScoreCandidate.scoreDiplome ?? '-'} Pts</Badge>
                  </div>
                  <small className='text-muted d-block'>Niveau : {selectedScoreCandidate.niveauEtude || 'Non renseigné'}</small>
                  <small className='text-muted d-block'>Spécialité : {selectedScoreCandidate.specialite || '-'}</small>
                </div>
              </Col>

              <Col md={6}>
                <div className='p-3 border rounded-3 bg-white h-100 shadow-sm'>
                  <div className='d-flex justify-content-between align-items-center mb-1'>
                    <span className='fw-bold text-dark'><i className='fas fa-briefcase text-success me-2'></i> 2. Expérience Professionnelle</span>
                    <Badge bg='success'>{selectedScoreCandidate.scoreExperience ?? '-'} Pts</Badge>
                  </div>
                  <small className='text-muted d-block'>Expériences déclarées : {selectedScoreCandidate.experiences?.length || 0} mission(s)</small>
                  <small className='text-muted d-block'>Calcul au prorata mensuel (max 48 mois = 4 ans)</small>
                </div>
              </Col>

              <Col md={6}>
                <div className='p-3 border rounded-3 bg-white h-100 shadow-sm'>
                  <div className='d-flex justify-content-between align-items-center mb-1'>
                    <span className='fw-bold text-dark'><i className='fas fa-chart-line text-warning me-2'></i> 3. Notes & Moyenne</span>
                    <Badge bg='warning' text='dark'>{selectedScoreCandidate.scoreNote ?? '-'} Pts</Badge>
                  </div>
                  <small className='text-muted d-block'>Moyenne calculée : {selectedScoreCandidate.rawNote ? `${selectedScoreCandidate.rawNote} / 20` : 'Certifiée'}</small>
                  <small className='text-muted d-block'>Mention : {selectedScoreCandidate.mention || 'Non spécifiée'}</small>
                </div>
              </Col>

              <Col md={6}>
                <div className='p-3 border rounded-3 bg-white h-100 shadow-sm'>
                  <div className='d-flex justify-content-between align-items-center mb-1'>
                    <span className='fw-bold text-dark'><i className='fas fa-user-clock text-info me-2'></i> 4. Âge du Candidat</span>
                    <Badge bg='info'>{selectedScoreCandidate.scoreAge ?? '-'} Pts</Badge>
                  </div>
                  <small className='text-muted d-block'>Tranche d'âge certifiée selon CNI</small>
                  <small className='text-muted d-block'>Barème jeunesse et diplômés récents</small>
                </div>
              </Col>
            </Row>

            {selectedScoreCandidate.scoreDetails && selectedScoreCandidate.scoreDetails.length > 0 && (
              <div className='p-3 bg-light rounded-3 border'>
                <div className='fw-bold text-dark mb-2 small'>
                  <i className='fas fa-terminal me-2 text-secondary'></i>
                  Journal d'exécution de l'algorithme :
                </div>
                <ul className='mb-0 ps-3 small text-muted'>
                  {selectedScoreCandidate.scoreDetails.map((detail, idx) => (
                    <li key={idx} className='py-1'>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className='bg-light'>
            <Button variant='primary' onClick={() => setSelectedScoreCandidate(null)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* 7. MODAL CONTRÔLE DÉTAILLÉ DU DOSSIER & PIÈCES JUSTIFICATIVES */}
      {selectedInspectCandidate && (
        <Modal
          show={true}
          onHide={() => setSelectedInspectCandidate(null)}
          size='xl'
          centered
        >
          <Modal.Header closeButton className='bg-dark text-white py-3'>
            <Modal.Title className='fs-5 fw-bold d-flex align-items-center gap-2'>
              <i className='fas fa-shield-alt text-primary'></i>
              <span>Contrôle &amp; Vérification du Dossier — {selectedInspectCandidate.candidatNom} {selectedInspectCandidate.candidatPrenom}</span>
              <span className='badge bg-light text-dark ms-2 font-monospace'>{selectedInspectCandidate.numeroDossier || 'Dossier'}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='p-4 bg-light'>
            {/* RÉCAP CANDIDAT */}
            <div className='p-3 bg-white rounded-3 border shadow-sm mb-4'>
              <Row className='align-items-center'>
                <Col md={7}>
                  <div className='d-flex align-items-center gap-3'>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                      {(selectedInspectCandidate.candidatNom || 'C').charAt(0)}
                    </div>
                    <div>
                      <h5 className='fw-bold mb-1 text-dark'>{selectedInspectCandidate.candidatNom} {selectedInspectCandidate.candidatPrenom}</h5>
                      <div className='text-muted small d-flex flex-wrap gap-3'>
                        <span><strong>CNI :</strong> {selectedInspectCandidate.candidatCni}</span>
                        <span><strong>Email :</strong> {selectedInspectCandidate.candidatEmail}</span>
                        <span><strong>Tél :</strong> {selectedInspectCandidate.candidatPhone}</span>
                        <span><strong>Poste :</strong> {selectedInspectCandidate.poste}</span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={5} className='text-md-end mt-2 mt-md-0'>
                  <div className='d-inline-block text-start p-2 bg-light rounded border'>
                    <span className='small text-muted d-block'>Score Barème :</span>
                    <strong className='text-success fs-5'><i className='fas fa-chart-line me-1'></i> {Number(selectedInspectCandidate.scoreTotal || 0).toFixed(2)} / 100 Pts</strong>
                  </div>
                </Col>
              </Row>
            </div>

            {/* SÉLECTEUR DE PIÈCES & VISIONNEUSE */}
            <Row className='g-3'>
              {/* LISTE DES 4 PIÈCES & STATUT */}
              <Col md={4}>
                <div className='bg-white p-3 rounded-3 border shadow-sm h-100'>
                  <h6 className='fw-bold text-dark mb-3 border-bottom pb-2'>
                    <i className='fas fa-tasks text-primary me-2'></i>
                    Inventaire des 4 Pièces Requises
                  </h6>

                  <div className='d-flex flex-column gap-2'>
                    {/* PIECE 1: CNI */}
                    {(() => {
                      const docUrl = selectedInspectCandidate.candidatCopieCNI || selectedInspectCandidate.copieCNI || selectedInspectCandidate.user?.copieCNI;
                      const hasDoc = !!docUrl;
                      return (
                        <div
                          onClick={() => hasDoc && setActiveInspectDoc('cni')}
                          style={{
                            cursor: hasDoc ? 'pointer' : 'not-allowed',
                            border: activeInspectDoc === 'cni' ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                            background: activeInspectDoc === 'cni' ? '#EFF6FF' : '#FFFFFF',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                        >
                          <div className='d-flex justify-content-between align-items-center mb-1'>
                            <span className='fw-bold' style={{ fontSize: '13px' }}><i className='fas fa-id-card text-primary me-2'></i> 1. Carte Nationale (CNIE)</span>
                            <span className={`badge ${hasDoc ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '10px' }}>
                              {hasDoc ? 'Fournie' : 'Manquante'}
                            </span>
                          </div>
                          <div className='text-muted font-monospace' style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                            {docUrl ? docUrl.split('/').pop() : 'Aucune pièce téléversée'}
                          </div>
                        </div>
                      );
                    })()}

                    {/* PIECE 2: DIPLOME */}
                    {(() => {
                      const docUrl = selectedInspectCandidate.copieDiplomes;
                      const hasDoc = !!docUrl;
                      return (
                        <div
                          onClick={() => hasDoc && setActiveInspectDoc('diplome')}
                          style={{
                            cursor: hasDoc ? 'pointer' : 'not-allowed',
                            border: activeInspectDoc === 'diplome' ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                            background: activeInspectDoc === 'diplome' ? '#EFF6FF' : '#FFFFFF',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                        >
                          <div className='d-flex justify-content-between align-items-center mb-1'>
                            <span className='fw-bold' style={{ fontSize: '13px' }}><i className='fas fa-graduation-cap text-success me-2'></i> 2. Copie du Diplôme</span>
                            <span className={`badge ${hasDoc ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '10px' }}>
                              {hasDoc ? 'Fournie' : 'Manquante'}
                            </span>
                          </div>
                          <div className='text-muted font-monospace' style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                            {docUrl ? docUrl.split('/').pop() : 'Aucune pièce téléversée'}
                          </div>
                        </div>
                      );
                    })()}

                    {/* PIECE 3: RELEVES */}
                    {(() => {
                      const docUrl = selectedInspectCandidate.releves;
                      const hasDoc = !!docUrl;
                      return (
                        <div
                          onClick={() => hasDoc && setActiveInspectDoc('releves')}
                          style={{
                            cursor: hasDoc ? 'pointer' : 'not-allowed',
                            border: activeInspectDoc === 'releves' ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                            background: activeInspectDoc === 'releves' ? '#EFF6FF' : '#FFFFFF',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                        >
                          <div className='d-flex justify-content-between align-items-center mb-1'>
                            <span className='fw-bold' style={{ fontSize: '13px' }}><i className='fas fa-file-alt text-warning me-2'></i> 3. Relevés de Notes</span>
                            <span className={`badge ${hasDoc ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '10px' }}>
                              {hasDoc ? 'Fournie' : 'Manquante'}
                            </span>
                          </div>
                          <div className='text-muted font-monospace' style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                            {docUrl ? docUrl.split('/').pop() : 'Aucune pièce téléversée'}
                          </div>
                        </div>
                      );
                    })()}

                    {/* PIECE 4: ATTESTATIONS TRAVAIL */}
                    {(() => {
                      const docUrl = selectedInspectCandidate.attestationsTravail;
                      const hasDoc = !!docUrl;
                      return (
                        <div
                          onClick={() => hasDoc && setActiveInspectDoc('attestations')}
                          style={{
                            cursor: hasDoc ? 'pointer' : 'not-allowed',
                            border: activeInspectDoc === 'attestations' ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                            background: activeInspectDoc === 'attestations' ? '#EFF6FF' : '#FFFFFF',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                        >
                          <div className='d-flex justify-content-between align-items-center mb-1'>
                            <span className='fw-bold' style={{ fontSize: '13px' }}><i className='fas fa-briefcase text-info me-2'></i> 4. Attestations Travail</span>
                            <span className={`badge ${hasDoc ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '10px' }}>
                              {hasDoc ? 'Fournie' : 'Manquante'}
                            </span>
                          </div>
                          <div className='text-muted font-monospace' style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                            {docUrl ? docUrl.split('/').pop() : 'Aucune pièce téléversée'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className='mt-4 pt-3 border-top'>
                    <div className='small text-muted mb-2'>Audit étape par étape :</div>
                    <button
                      className='btn btn-outline-primary btn-sm w-100 fw-bold'
                      onClick={() => navigate(`/controlleurs/candidatures/informations/${selectedInspectCandidate._id}`)}
                    >
                      <i className='fas fa-external-link-alt me-1'></i> Ouvrir Module Contrôleur
                    </button>
                  </div>
                </div>
              </Col>

              {/* VISIONNEUSE DE DOCUMENT EN DIRECT */}
              <Col md={8}>
                <div className='bg-white p-3 rounded-3 border shadow-sm'>
                  {(() => {
                    let currentDoc = '';
                    let docTitle = '';
                    let declaredInfo = null;

                    if (activeInspectDoc === 'cni') {
                      currentDoc = selectedInspectCandidate.candidatCopieCNI || selectedInspectCandidate.copieCNI || selectedInspectCandidate.user?.copieCNI;
                      docTitle = "Carte Nationale d'Identité (CNIE)";
                      declaredInfo = (
                        <div className='d-flex flex-wrap gap-3 small text-muted bg-light p-2 rounded mb-2 border'>
                          <span><strong>Nom Déclaré :</strong> {selectedInspectCandidate.candidatNom} {selectedInspectCandidate.candidatPrenom}</span>
                          <span><strong>CNI :</strong> {selectedInspectCandidate.candidatCni}</span>
                          <span><strong>Date Naiss :</strong> {selectedInspectCandidate.dateNaissance || selectedInspectCandidate.user?.dateNaissance || '-'}</span>
                          <span><strong>Ville :</strong> {selectedInspectCandidate.ville || selectedInspectCandidate.user?.ville || '-'}</span>
                        </div>
                      );
                    } else if (activeInspectDoc === 'diplome') {
                      currentDoc = selectedInspectCandidate.copieDiplomes;
                      docTitle = "Diplôme Certifié Conforme";
                      declaredInfo = (
                        <div className='d-flex flex-wrap gap-3 small text-muted bg-light p-2 rounded mb-2 border'>
                          <span><strong>Niveau :</strong> {selectedInspectCandidate.niveauEtude || '-'}</span>
                          <span><strong>Intitulé :</strong> {selectedInspectCandidate.diplome || '-'}</span>
                          <span><strong>Spécialité :</strong> {selectedInspectCandidate.specialite || '-'}</span>
                          <span><strong>Établissement :</strong> {selectedInspectCandidate.etablissement || '-'}</span>
                          <span><strong>Mention :</strong> {selectedInspectCandidate.mention || '-'}</span>
                        </div>
                      );
                    } else if (activeInspectDoc === 'releves') {
                      currentDoc = selectedInspectCandidate.releves;
                      docTitle = "Relevés de Notes Universitaires";
                      declaredInfo = (
                        <div className='d-flex flex-wrap gap-3 small text-muted bg-light p-2 rounded mb-2 border'>
                          <span><strong>Méthode Notation :</strong> {selectedInspectCandidate.methodeNotation || 'Années'}</span>
                          {selectedInspectCandidate.methodeNotation === 'Annees' ? (
                            <>
                              <span><strong>Année 1 :</strong> {selectedInspectCandidate.annee1 || '-'}</span>
                              <span><strong>Année 2 :</strong> {selectedInspectCandidate.annee2 || '-'}</span>
                              <span><strong>Année 3 :</strong> {selectedInspectCandidate.annee3 || '-'}</span>
                            </>
                          ) : (
                            <>
                              <span><strong>S1 :</strong> {selectedInspectCandidate.semestre1 || '-'}</span>
                              <span><strong>S2 :</strong> {selectedInspectCandidate.semestre2 || '-'}</span>
                              <span><strong>S3 :</strong> {selectedInspectCandidate.semestre3 || '-'}</span>
                              <span><strong>S4 :</strong> {selectedInspectCandidate.semestre4 || '-'}</span>
                            </>
                          )}
                        </div>
                      );
                    } else {
                      currentDoc = selectedInspectCandidate.attestationsTravail;
                      docTitle = "Attestations de Travail & Expériences";
                      declaredInfo = (
                        <div className='small text-muted bg-light p-2 rounded mb-2 border'>
                          <strong>Missions déclarées :</strong> {selectedInspectCandidate.experiences?.length || 0} mission(s)
                          {selectedInspectCandidate.experiences && selectedInspectCandidate.experiences.map((exp, idx) => (
                            <div key={idx} className='mt-1 ps-2 border-start border-primary'>
                              • <strong>{exp.fonctionOccupee || exp.poste}</strong> chez {exp.entreprise} ({exp.dateDebut} au {exp.enPoste || String(exp.dateFin).toLowerCase().includes('aujourd') ? "À ce jour (En poste)" : exp.dateFin}) — Domaine: {exp.domaine}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    const targetUrl = getFileUrl(currentDoc);

                    return (
                      <div>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                          <h6 className='fw-bold text-dark m-0'>
                            <i className='fas fa-file-contract text-primary me-2'></i>
                            Visualisation : {docTitle}
                          </h6>
                          {currentDoc && (
                            <a
                              href={targetUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='btn btn-sm btn-outline-primary'
                            >
                              <i className='fas fa-external-link-alt me-1'></i> Plein écran
                            </a>
                          )}
                        </div>

                        {declaredInfo}

                        {currentDoc ? (
                          <div style={{ height: '560px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                            <iframe
                              src={targetUrl}
                              title={docTitle}
                              width='100%'
                              height='100%'
                              style={{ border: 'none' }}
                            />
                          </div>
                        ) : (
                          <div className='text-center py-5 text-muted border rounded bg-light'>
                            <i className='fas fa-file-excel fa-3x text-secondary mb-3 d-block'></i>
                            <h6>Aucun document téléversé pour cette pièce</h6>
                            <p className='small'>Le candidat n'a pas joint ce justificatif lors de son inscription.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className='bg-light'>
            <Button variant='secondary' onClick={() => setSelectedInspectCandidate(null)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default MaitreCandidatures;
