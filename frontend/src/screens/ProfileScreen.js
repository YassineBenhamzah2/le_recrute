import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Pdf from 'react-to-pdf';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import OfficialReceiptPDF from '../components/OfficialReceiptPDF';
import { getUserDetails, updateUserProfile } from '../actions/userActions';
import { listMyCandidatures } from '../actions/candidatureActions';
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';
import { getFileUrl } from '../utils/fileUrl';
import './ProfileScreen.css';

const CandidatureCard = ({ candidature, userInfo, onPreviewReceipt }) => {
  const downloadRef = useRef();

  const orgNomRaw =
    candidature.entreprise?.nom ||
    candidature.offre?.entreprise?.nom ||
    candidature.offre?.entrepriseNom ||
    (candidature.poste?.toLowerCase().includes('barid')
      ? 'Al Barid Bank'
      : candidature.poste?.toLowerCase().includes('cih')
      ? 'CIH Bank'
      : candidature.poste?.toLowerCase().includes('ocp')
      ? 'Groupe OCP'
      : candidature.poste?.toLowerCase().includes('finances')
      ? "Ministère de l'Économie et des Finances"
      : 'Institution Recruteuse');

  const orgNom =
    orgNomRaw.toLowerCase() === 'lerrecruteur' || orgNomRaw.toLowerCase() === '1errecruteur'
      ? '1er Recruteur'
      : orgNomRaw;

  const orgSigle =
    candidature.entreprise?.sigle ||
    candidature.offre?.entrepriseSigle ||
    (orgNom.toLowerCase().includes('barid')
      ? 'ABB'
      : orgNom.toLowerCase().includes('cih')
      ? 'CIH'
      : orgNom.toLowerCase().includes('ocp')
      ? 'OCP'
      : orgNom.toLowerCase().includes('finances')
      ? 'MEF'
      : orgNom.toLowerCase().includes('recruteur')
      ? 'LRT'
      : 'REC');

  const orgColor =
    candidature.entreprise?.couleurPrimaire ||
    candidature.offre?.entrepriseCouleur ||
    (orgSigle === 'CIH'
      ? '#0084B6'
      : orgSigle === 'MEF'
      ? '#334155'
      : orgSigle === 'OCP'
      ? '#00875A'
      : orgSigle === 'BOA'
      ? '#0055A5'
      : orgSigle === 'LRT'
      ? '#1D4ED8'
      : '#0F172A');

  const numDossier =
    candidature.numeroDossier ||
    `${orgSigle}-2026-${(candidature._id || '984120').toString().slice(-6).toUpperCase()}`;

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(numDossier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCardLogo = () => {
    if (
      candidature.entreprise?.logo &&
      !candidature.entreprise.logo.includes('default_org') &&
      !candidature.entreprise.logo.includes('logoABB')
    ) {
      return candidature.entreprise.logo;
    }
    if (
      candidature.offre?.entrepriseLogo &&
      !candidature.offre.entrepriseLogo.includes('default_org') &&
      !candidature.offre.entrepriseLogo.includes('logoABB')
    ) {
      return candidature.offre.entrepriseLogo;
    }
    const normSigle = (orgSigle || '').toUpperCase();
    const normNom = (orgNom || '').toLowerCase();
    if (normSigle === 'LRT' || normNom.includes('recruteur')) {
      return '/images/logos/lrt_logo.svg';
    }
    if (normSigle === 'CIH' || normNom.includes('cih')) {
      return '/images/logos/cih_logo.svg';
    }
    if (normSigle === 'OCP' || normNom.includes('ocp')) {
      return '/images/logos/ocp_logo.svg';
    }
    if (normSigle === 'BOA' || normNom.includes('africa')) {
      return '/images/logos/boa_logo.svg';
    }
    if (normSigle === 'MEF' || normNom.includes('finance')) {
      return '/images/logos/mef_logo.svg';
    }
    if (normSigle === 'CDG' || normNom.includes('cdg')) {
      return '/images/logos/cdg_logo.svg';
    }
    if (normSigle === 'ABB' || normNom.includes('barid')) {
      return '/assets/images/logoABB.png';
    }
    return '/images/logos/lrt_logo.svg';
  };

  const logoPngUrl = getCardLogo();

  return (
    <div className='candidate-card-item' style={{ borderLeft: `5px solid ${orgColor}` }}>
      {/* HEADER */}
      <div className='candidate-card-header'>
        <div className='candidate-card-org'>
          <div
            className='candidate-org-logo-wrap'
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              flexShrink: 0,
            }}
          >
            <img
              src={logoPngUrl}
              alt={orgSigle}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          <div className='candidate-card-title'>
            <h3>{candidature.poste || 'Concours de Recrutement'}</h3>
            <div className='candidate-card-subtitle'>
              <span>{orgNom}</span>
              <span>•</span>
              <span>N° Dossier :</span>
              <span className='candidate-dossier-pill'>{numDossier}</span>
              <button
                type='button'
                onClick={handleCopy}
                className='btn btn-link p-0 text-muted'
                style={{ fontSize: '11px', textDecoration: 'none' }}
                title='Copier le numéro'
              >
                <i className={`fas ${copied ? 'fa-check text-success' : 'fa-copy'}`}></i>
              </button>
            </div>
          </div>
        </div>

        <div className='text-end'>
          <span className='badge bg-success py-1 px-2' style={{ fontSize: '12px' }}>
            <i className='fas fa-check-circle me-1'></i> Dossier Réceptionné & Conforme
          </span>
          <div className='text-muted small mt-1'>
            {moment(candidature.createdAt).format('DD/MM/YYYY à HH:mm')}
          </div>
        </div>
      </div>

      {/* METADATA GRID */}
      <div className='candidate-card-grid'>
        <div className='candidate-detail-item'>
          <span className='candidate-detail-label'>Organisme Recruteur</span>
          <span className='candidate-detail-value'>{orgNom}</span>
        </div>
        <div className='candidate-detail-item'>
          <span className='candidate-detail-label'>Date de Dépôt</span>
          <span className='candidate-detail-value'>
            {moment(candidature.createdAt).format('DD MMMM YYYY')}
          </span>
        </div>
        <div className='candidate-detail-item'>
          <span className='candidate-detail-label'>N° de Dossier</span>
          <span className='candidate-detail-value font-monospace fw-bold text-dark'>
            {candidature.numeroDossier || 'Dossier Enregistré'}
          </span>
        </div>
        <div className='candidate-detail-item'>
          <span className='candidate-detail-label'>Statut du Dossier</span>
          <span className='candidate-detail-value text-success'>
            <i className='fas fa-file-contract me-1'></i> Transmis à la Commission
          </span>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className='candidate-card-actions'>
        <div className='d-flex align-items-center text-muted small'>
          <i className='fas fa-qrcode text-secondary me-2 fa-lg'></i>
          <span>Récépissé certifié avec QR Code d'authentification CNDP</span>
        </div>

        <div className='candidate-action-btns'>
          <button
            type='button'
            className='btn-preview-receipt'
            onClick={() => onPreviewReceipt(candidature)}
          >
            <i className='fas fa-eye text-primary'></i>
            <span>Aperçu Récépissé Officiel</span>
          </button>

          <Pdf
            targetRef={downloadRef}
            filename={`recepisse-officiel-${numDossier}.pdf`}
            options={{ orientation: 'portrait', unit: 'mm', format: 'a4' }}
          >
            {({ toPdf }) => (
              <button type='button' className='btn-download-receipt' onClick={toPdf}>
                <i className='fas fa-file-pdf'></i>
                <span>Télécharger PDF</span>
              </button>
            )}
          </Pdf>
        </div>
      </div>

      {/* Conteneur hors écran pour génération PDF A4 haute définition */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          zIndex: -1,
        }}
      >
        <OfficialReceiptPDF
          ref={downloadRef}
          candidature={candidature}
          userInfo={userInfo}
        />
      </div>
    </div>
  );
};

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('candidatures');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form state
  const [civilite, setCivilite] = useState('Monsieur');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [nationalite, setNationalite] = useState('Marocaine');
  const [phone, setPhone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [codePostale, setCodePostale] = useState('');
  const [cni, setCni] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userDetails = useSelector((state) => state.userDetails);
  const { user, loading: loadingDetails } = userDetails;

  const userUpdateProfil = useSelector((state) => state.userUpdateProfil);
  const {
    success: successUpdate,
    error: errorUpdate,
    errors: backendErrors,
    loading: loadingUpdate,
  } = userUpdateProfil;

  const activeErrors = { ...(backendErrors || {}), ...(fieldErrors || {}) };

  const candidaturesListMy = useSelector((state) => state.candidaturesListMy);
  const { loading: loadingCandidatures, candidatures } = candidaturesListMy;

  useEffect(() => {
    dispatch({ type: USER_UPDATE_PROFILE_RESET });
    setFeedbackMsg(null);
    setFieldErrors({});
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (userInfo.isMaitreOuvrage) {
      navigate('/maitre-ouvrage/candidatures');
    } else if (userInfo.isAdmin) {
      navigate('/admin/dashboard');
    } else if (userInfo.isController) {
      navigate('/controlleurs/dashboard');
    } else {
      if (!user || !user.email || String(user._id) !== String(userInfo._id)) {
        dispatch(getUserDetails('profile'));
        dispatch(listMyCandidatures());
      } else {
        setCivilite(user.civilite || 'Monsieur');
        setPrenom(user.prenom || '');
        setNom(user.nom || '');
        setDateNaissance(
          user.dateNaissance
            ? moment(user.dateNaissance, ['DD.MM.YYYY', 'YYYY-MM-DD']).format(
                'YYYY-MM-DD'
              )
            : ''
        );
        setLieuNaissance(user.lieuNaissance || '');
        setVille(user.ville || '');
        setCodePostale(user.codePostale || '');
        setEmail(user.email || '');
        setCni(user.cni || '');
        setNationalite(user.nationalite || 'Marocaine');
        setPhone(user.phone || '');
        setAdresse(user.adresse || '');
      }
    }

    if (successUpdate) {
      setFeedbackMsg({
        type: 'success',
        text: 'Vos informations ont été mises à jour avec succès.',
      });
      dispatch({ type: USER_UPDATE_PROFILE_RESET });
      dispatch(getUserDetails('profile'));
    }
  }, [dispatch, userInfo, navigate, user, successUpdate]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setFeedbackMsg(null);
    dispatch({ type: USER_UPDATE_PROFILE_RESET });

    const errs = {};
    if (!nom || !nom.trim()) errs.nom = 'Le nom de famille est obligatoire';
    if (!prenom || !prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!cni || !cni.trim()) errs.cni = 'Le numéro de CNI est obligatoire';
    if (!dateNaissance) errs.dateNaissance = 'La date de naissance est obligatoire';
    if (!lieuNaissance || !lieuNaissance.trim())
      errs.lieuNaissance = 'Le lieu de naissance est obligatoire';
    if (!phone || !phone.trim()) {
      errs.phone = 'Le numéro de téléphone est obligatoire';
    } else {
      const cleanPhone = phone.replace(/\s+/g, '');
      if (!/^(?:(?:\+|00)212|0)[5-7]\d{8}$/.test(cleanPhone)) {
        errs.phone = 'Numéro de téléphone marocain invalide (ex: 0612345678)';
      }
    }
    if (!email || !email.trim()) errs.email = "L'adresse email est obligatoire";
    if (!adresse || !adresse.trim())
      errs.adresse = "L'adresse de résidence est obligatoire";
    if (!ville || !ville.trim()) errs.ville = 'La ville de résidence est obligatoire';
    if (codePostale && !/^\d{5}$/.test(codePostale.toString().trim())) {
      errs.codePostale = 'Le code postal doit être composé de 5 chiffres (ex: 20000)';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFeedbackMsg({
        type: 'danger',
        text: 'Veuillez renseigner tous les champs obligatoires marqués d’un astérisque (*).',
      });
      return;
    }

    setFieldErrors({});

    dispatch(
      updateUserProfile({
        id: user._id,
        civilite,
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance
          ? moment(dateNaissance).format('DD.MM.YYYY')
          : undefined,
        lieuNaissance: lieuNaissance.trim(),
        email: email.trim(),
        cni: (cni || '').toUpperCase().trim(),
        nationalite,
        phone: phone.replace(/\s+/g, ''),
        adresse: adresse.trim(),
        ville: ville.trim(),
        codePostale: codePostale ? codePostale.toString().trim() : '',
      })
    );
  };

  const getInitials = () => {
    const p = (prenom || userInfo?.prenom || '').charAt(0).toUpperCase();
    const n = (nom || userInfo?.nom || '').charAt(0).toUpperCase();
    return `${p}${n}` || 'C';
  };

  const candidateFullName = `${(prenom || userInfo?.prenom || '').toUpperCase()} ${(nom || userInfo?.nom || '').toUpperCase()}`.trim();
  const candidaturesCount = candidatures ? candidatures.length : 0;

  return (
    <>
      <Header />

      <main className='candidate-portal-wrapper'>
        <div className='candidate-portal-container'>
          {userInfo?.isMaitreOuvrage && (
            <div
              className='p-3 mb-4 rounded-3 border d-flex justify-content-between align-items-center flex-wrap gap-2 shadow-sm'
              style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}
            >
              <div>
                <strong className='text-primary d-block'>
                  <i className='fas fa-briefcase me-2'></i> Espace Recruteur Détecté — {userInfo.entreprise?.nom || 'Entreprise'}
                </strong>
                <span className='small text-muted'>
                  Vous êtes connecté en tant que Responsable RH. Pour publier des concours et consulter les dossiers reçus, accédez à votre Tableau de Bord Recruteur.
                </span>
              </div>
              <Link
                to='/maitre-ouvrage/candidatures'
                className='btn btn-primary fw-bold px-3 py-2'
                style={{ background: '#1D4ED8', border: 'none', borderRadius: '8px', fontSize: '13.5px' }}
              >
                <i className='fas fa-plus-circle me-1'></i> Tableau de Bord Recruteur (+ Publier)
              </Link>
            </div>
          )}

          {/* 1. CANDIDATE HERO BANNER */}
          <div className='candidate-hero-banner'>
            <div className='candidate-profile-summary'>
              <div className='candidate-avatar-large'>
                {getInitials()}
                <div className='candidate-avatar-badge' title='Compte Certifié CNI'></div>
              </div>
              <div className='candidate-meta-text'>
                <h2>{candidateFullName || 'ESPACE CANDIDAT'}</h2>
                <div className='candidate-meta-tags'>
                  <span className='candidate-tag-cni'>
                    <i className='fas fa-id-card me-1'></i> CNI : {cni || userInfo?.cni || 'WA111114'}
                  </span>
                  <span className='candidate-tag-status'>
                    <i className='fas fa-shield-check'></i> Profil Conforme & Vérifié
                  </span>
                  <span className='text-muted small'>
                    <i className='fas fa-map-marker-alt me-1'></i> {ville || 'Casablanca'}, Maroc
                  </span>
                </div>
              </div>
            </div>

            <div className='candidate-quick-stats'>
              <div className='candidate-stat-box'>
                <div className='candidate-stat-number'>{candidaturesCount}</div>
                <div className='candidate-stat-label'>Candidature(s)</div>
              </div>
              <div className='candidate-stat-box'>
                <div className='candidate-stat-number text-success'>100%</div>
                <div className='candidate-stat-label'>Dossier Complet</div>
              </div>
            </div>
          </div>

          {/* 2. NAVIGATION TABS */}
          <div className='candidate-tabs-bar'>
            <button
              type='button'
              className={`candidate-tab-btn ${activeTab === 'candidatures' ? 'active' : ''}`}
              onClick={() => setActiveTab('candidatures')}
            >
              <i className='fas fa-file-signature'></i>
              <span>Mes Candidatures & Récépissés</span>
              <span className='candidate-tab-badge'>{candidaturesCount}</span>
            </button>
            <button
              type='button'
              className={`candidate-tab-btn ${activeTab === 'profil' ? 'active' : ''}`}
              onClick={() => setActiveTab('profil')}
            >
              <i className='fas fa-user-edit'></i>
              <span>Mon Dossier Administratif</span>
            </button>
            <button
              type='button'
              className={`candidate-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <i className='fas fa-folder-open'></i>
              <span>Pièces Justificatives</span>
            </button>
          </div>

          {/* 3. TAB CONTENT */}
          {activeTab === 'candidatures' && (
            <div>
              {loadingCandidatures && <Spinner size={80} />}

              {candidatures && candidatures.length > 0 ? (
                candidatures.map((candidature) => (
                  <CandidatureCard
                    key={candidature._id}
                    candidature={candidature}
                    userInfo={userInfo}
                    onPreviewReceipt={(cand) => setSelectedReceipt(cand)}
                  />
                ))
              ) : (
                <div className='candidate-card-item text-center py-5'>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      background: '#F1F5F9',
                      borderRadius: '50%',
                      margin: '0 auto 16px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                      fontSize: '24px',
                    }}
                  >
                    <i className='fas fa-folder-open'></i>
                  </div>
                  <h4 style={{ color: '#0F172A', fontWeight: '700' }}>Aucune candidature active</h4>
                  <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto 20px auto', fontSize: '14px' }}>
                    Vous n'avez pas encore soumis de dossier de candidature pour les concours bancaires et publics ouverts.
                  </p>
                  <button
                    type='button'
                    className='btn-download-receipt'
                    onClick={() => navigate('/')}
                  >
                    <i className='fas fa-search me-1'></i> Consulter les Concours Disponibles
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profil' && (
            <div className='candidate-form-card'>
              <form onSubmit={handleProfileSubmit} noValidate>
                {feedbackMsg && (
                  <div
                    className={`alert alert-${feedbackMsg.type} d-flex align-items-center mb-4`}
                    role='alert'
                  >
                    <i
                      className={`fas ${
                        feedbackMsg.type === 'success'
                          ? 'fa-check-circle'
                          : 'fa-exclamation-triangle'
                      } me-2 fa-lg`}
                    ></i>
                    <div>{feedbackMsg.text}</div>
                  </div>
                )}
                {errorUpdate && (
                  <div className='alert alert-danger mb-4'>
                    <i className='fas fa-exclamation-triangle me-2'></i> {errorUpdate}
                  </div>
                )}
                {loadingUpdate && <Spinner size={60} />}

                {/* SECTION 1 : ÉTAT CIVIL */}
                <div className='candidate-form-section-title'>
                  <i className='fas fa-id-card'></i>
                  <span>État Civil & Identité Officielle</span>
                </div>

                <div className='row g-3 mb-4'>
                  <div className='col-md-3'>
                    <label className='form-label-custom'>
                      <i className='fas fa-venus-mars'></i> Civilité <span className='text-danger'>*</span>
                    </label>
                    <select
                      className='form-input-custom'
                      value={civilite}
                      onChange={(e) => setCivilite(e.target.value)}
                    >
                      <option value='Monsieur'>Monsieur</option>
                      <option value='Madame'>Madame</option>
                    </select>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label-custom'>
                      <i className='far fa-user'></i> Nom de famille <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className={`form-input-custom ${
                        activeErrors.nom ? 'is-invalid border-danger' : ''
                      }`}
                      value={nom}
                      onChange={(e) => {
                        setNom(e.target.value);
                        if (fieldErrors.nom) setFieldErrors((prev) => ({ ...prev, nom: null }));
                      }}
                      placeholder='Ex: BENHAMZAH'
                    />
                    {activeErrors.nom && (
                      <div className='text-danger small mt-1'>{activeErrors.nom}</div>
                    )}
                  </div>
                  <div className='col-md-5'>
                    <label className='form-label-custom'>
                      <i className='far fa-user'></i> Prénom <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className={`form-input-custom ${
                        activeErrors.prenom ? 'is-invalid border-danger' : ''
                      }`}
                      value={prenom}
                      onChange={(e) => {
                        setPrenom(e.target.value);
                        if (fieldErrors.prenom)
                          setFieldErrors((prev) => ({ ...prev, prenom: null }));
                      }}
                      placeholder='Ex: Yassine'
                    />
                    {activeErrors.prenom && (
                      <div className='text-danger small mt-1'>{activeErrors.prenom}</div>
                    )}
                  </div>
                </div>

                <div className='row g-3 mb-4'>
                  <div className='col-md-4'>
                    <label className='form-label-custom'>
                      <i className='fas fa-fingerprint'></i> N° CNI (Carte Nationale) <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className={`form-input-custom ${
                        activeErrors.cni ? 'is-invalid border-danger' : ''
                      }`}
                      value={cni}
                      onChange={(e) => {
                        setCni(e.target.value);
                        if (fieldErrors.cni) setFieldErrors((prev) => ({ ...prev, cni: null }));
                      }}
                      placeholder='Ex: WA111114'
                    />
                    {activeErrors.cni && (
                      <div className='text-danger small mt-1'>{activeErrors.cni}</div>
                    )}
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label-custom'>
                      <i className='far fa-calendar-alt'></i> Date de naissance <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='date'
                      className={`form-input-custom ${
                        activeErrors.dateNaissance ? 'is-invalid border-danger' : ''
                      }`}
                      value={dateNaissance}
                      onChange={(e) => {
                        setDateNaissance(e.target.value);
                        if (fieldErrors.dateNaissance)
                          setFieldErrors((prev) => ({ ...prev, dateNaissance: null }));
                      }}
                    />
                    {activeErrors.dateNaissance && (
                      <div className='text-danger small mt-1'>{activeErrors.dateNaissance}</div>
                    )}
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label-custom'>
                      <i className='fas fa-city'></i> Lieu de naissance <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className={`form-input-custom ${
                        activeErrors.lieuNaissance ? 'is-invalid border-danger' : ''
                      }`}
                      value={lieuNaissance}
                      onChange={(e) => {
                        setLieuNaissance(e.target.value);
                        if (fieldErrors.lieuNaissance)
                          setFieldErrors((prev) => ({ ...prev, lieuNaissance: null }));
                      }}
                      placeholder='Ex: Casablanca'
                    />
                    {activeErrors.lieuNaissance && (
                      <div className='text-danger small mt-1'>{activeErrors.lieuNaissance}</div>
                    )}
                  </div>
                </div>

                {/* SECTION 2 : COORDONNÉES */}
                <div className='candidate-form-section-title mt-4'>
                  <i className='fas fa-address-book'></i>
                  <span>Coordonnées de Contact & Résidence</span>
                </div>

                <div className='row g-3 mb-4'>
                  <div className='col-md-6'>
                    <label className='form-label-custom'>
                      <i className='fas fa-phone-alt'></i> Numéro de téléphone portable <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='tel'
                      className={`form-input-custom ${
                        activeErrors.phone ? 'is-invalid border-danger' : ''
                      }`}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone)
                          setFieldErrors((prev) => ({ ...prev, phone: null }));
                      }}
                      placeholder='Ex: 0666666666'
                    />
                    {activeErrors.phone && (
                      <div className='text-danger small mt-1'>{activeErrors.phone}</div>
                    )}
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label-custom'>
                      <i className='far fa-envelope'></i> Adresse email officielle <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='email'
                      className={`form-input-custom ${
                        activeErrors.email ? 'is-invalid border-danger' : ''
                      }`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email)
                          setFieldErrors((prev) => ({ ...prev, email: null }));
                      }}
                      placeholder='Ex: candidat@domaine.ma'
                    />
                    {activeErrors.email && (
                      <div className='text-danger small mt-1'>{activeErrors.email}</div>
                    )}
                  </div>
                </div>

                <div className='row g-3 mb-4'>
                  <div className='col-md-6'>
                    <label className='form-label-custom'>
                      <i className='fas fa-map-marker-alt'></i> Adresse de résidence <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className={`form-input-custom ${
                        activeErrors.adresse ? 'is-invalid border-danger' : ''
                      }`}
                      value={adresse}
                      onChange={(e) => {
                        setAdresse(e.target.value);
                        if (fieldErrors.adresse)
                          setFieldErrors((prev) => ({ ...prev, adresse: null }));
                      }}
                      placeholder='Ex: 12 Boulevard Hassan II'
                    />
                    {activeErrors.adresse && (
                      <div className='text-danger small mt-1'>{activeErrors.adresse}</div>
                    )}
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label-custom'>
                      <i className='fas fa-map'></i> Ville <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className={`form-input-custom ${
                        activeErrors.ville ? 'is-invalid border-danger' : ''
                      }`}
                      value={ville}
                      onChange={(e) => {
                        setVille(e.target.value);
                        if (fieldErrors.ville)
                          setFieldErrors((prev) => ({ ...prev, ville: null }));
                      }}
                      placeholder='Ex: Casablanca'
                    />
                    {activeErrors.ville && (
                      <div className='text-danger small mt-1'>{activeErrors.ville}</div>
                    )}
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label-custom'>
                      <i className='fas fa-mail-bulk'></i> Code Postal
                    </label>
                    <input
                      type='text'
                      className={`form-input-custom ${
                        activeErrors.codePostale ? 'is-invalid border-danger' : ''
                      }`}
                      value={codePostale}
                      onChange={(e) => {
                        setCodePostale(e.target.value);
                        if (fieldErrors.codePostale)
                          setFieldErrors((prev) => ({ ...prev, codePostale: null }));
                      }}
                      placeholder='Ex: 20000'
                      maxLength={5}
                    />
                    {activeErrors.codePostale && (
                      <div className='text-danger small mt-1'>{activeErrors.codePostale}</div>
                    )}
                  </div>
                </div>

                <div className='d-flex justify-content-end gap-3 pt-3 border-top'>
                  <button type='submit' className='btn-save-profile'>
                    <i className='fas fa-save'></i>
                    <span>Enregistrer les modifications</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'documents' && (() => {
            const latestCandidature =
              candidatures && candidatures.length > 0 ? candidatures[0] : null;
            const cniPath = user?.copieCNI || latestCandidature?.user?.copieCNI || latestCandidature?.copieCNI;
            const cniVersoPath = user?.copieCNIVerso || latestCandidature?.user?.copieCNIVerso || latestCandidature?.copieCNIVerso;
            const diplomePath = latestCandidature?.copieDiplomes;
            const relevesPath = latestCandidature?.releves;
            const attestationsPath = latestCandidature?.attestationsTravail;
            const residencePath = user?.residence || latestCandidature?.user?.residence || latestCandidature?.residence;

            const docsInventory = [
              {
                title: 'Carte Nationale d’Identité (CNI Recto)',
                icon: 'fa-id-card',
                path: cniPath,
                required: true,
                description: 'Justificatif d’identité officiel (Face avant)',
              },
              {
                title: 'Carte Nationale d’Identité (CNI Verso)',
                icon: 'fa-id-card',
                path: cniVersoPath,
                required: true,
                description: 'Face arrière de la CNI avec adresse officielle',
              },
              {
                title: 'Diplôme / Attestation Bac+2/3',
                icon: 'fa-graduation-cap',
                path: diplomePath,
                required: true,
                description: 'Diplôme académique ou attestation de réussite',
              },
              {
                title: 'Relevés de Notes Globaux',
                icon: 'fa-file-invoice',
                path: relevesPath,
                required: true,
                description: 'Relevés de notes officiels (S1 à S6)',
              },
              {
                title: 'Certificat de Résidence',
                icon: 'fa-map-marker-alt',
                path: residencePath,
                required: false,
                description: 'Attestation de résidence si adresse différente',
              },
              {
                title: 'Attestations d’Expérience',
                icon: 'fa-briefcase',
                path: attestationsPath,
                required: false,
                description: 'Certificats de travail (facultatif)',
              },
            ];

            const totalUploaded = docsInventory.filter((d) => Boolean(d.path)).length;

            return (
              <div className='candidate-form-card'>
                <div className='candidate-form-section-title'>
                  <i className='fas fa-folder-open'></i>
                  <span>Inventaire des Pièces Justificatives Déposées</span>
                </div>
                <p className='text-muted' style={{ fontSize: '13.5px' }}>
                  Conformément aux directives de la commission de recrutement, ces pièces justificatives certifiées sont
                  rattachées à votre dossier numérique sécurisé.
                </p>

                {totalUploaded === 0 ? (
                  <div className='p-4 text-center my-3 bg-light rounded-3 border'>
                    <div className='mb-3 text-muted'>
                      <i className='fas fa-folder-open fa-3x text-secondary opacity-50'></i>
                    </div>
                    <h6 className='fw-bold text-dark mb-2'>
                      Aucune pièce justificative déposée pour le moment
                    </h6>
                    <p className='text-muted small mx-auto mb-3' style={{ maxWidth: '520px' }}>
                      Vous n'avez téléversé aucun document (PDF / image) sur ce compte. 
                      Vos pièces justificatives (Carte d'identité, Diplômes, Relevés de notes, etc.) seront automatiquement répertoriées ici dès votre candidature à une offre de concours.
                    </p>
                    <button
                      type='button'
                      className='btn btn-primary btn-sm fw-bold px-3 py-2'
                      onClick={() => navigate('/')}
                    >
                      <i className='fas fa-briefcase me-2'></i> Consulter les Offres & Concours
                    </button>
                  </div>
                ) : (
                  <div className='docs-list-grid'>
                    {docsInventory.map((doc, idx) => (
                      <div className='doc-item-card' key={idx}>
                        <div className='doc-item-icon'>
                          <i className={`fas ${doc.icon}`}></i>
                        </div>
                        <div className='doc-item-meta w-100'>
                          <h5>{doc.title}</h5>
                          {doc.path ? (
                            <div className='d-flex align-items-center justify-content-between mt-2'>
                              <div className='doc-item-status'>
                                <i className='fas fa-check-circle text-success'></i> Déposé
                              </div>
                              <a
                                href={getFileUrl(doc.path)}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='btn btn-outline-primary btn-sm py-0 px-2 fw-bold'
                                style={{ fontSize: '11px' }}
                              >
                                <i className='fas fa-external-link-alt me-1'></i> Voir
                              </a>
                            </div>
                          ) : (
                            <div className='doc-item-status text-secondary mt-1'>
                              <i className='fas fa-minus-circle me-1'></i> Non déposé{' '}
                              {doc.required ? '(Requis pour postuler)' : '(Facultatif)'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </main>

      {/* 4. MODAL D'APERÇU DU RÉCÉPISSÉ PLEIN FORMAT A4 */}
      {selectedReceipt && (
        <div className='receipt-modal-backdrop' onClick={() => setSelectedReceipt(null)}>
          <div
            className='receipt-modal-content'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='receipt-modal-header'>
              <div className='receipt-modal-title'>
                <i className='fas fa-file-certificate text-primary'></i>
                <span>
                  Récépissé Officiel de Dépôt de Candidature —{' '}
                  {selectedReceipt.numeroDossier || 'Dossier Conforme'}
                </span>
              </div>
              <div className='receipt-modal-actions'>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-light'
                  onClick={() => window.print()}
                >
                  <i className='fas fa-print me-1'></i> Imprimer
                </button>
                <button
                  type='button'
                  className='receipt-modal-close'
                  onClick={() => setSelectedReceipt(null)}
                  title='Fermer'
                >
                  <i className='fas fa-times'></i>
                </button>
              </div>
            </div>

            <div className='receipt-modal-body'>
              <div style={{ width: '794px', minWidth: '794px' }}>
                <OfficialReceiptPDF
                  candidature={selectedReceipt}
                  userInfo={userInfo}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ProfileScreen;
