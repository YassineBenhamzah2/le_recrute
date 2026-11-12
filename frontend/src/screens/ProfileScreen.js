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
  const [cni, setCni] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userDetails = useSelector((state) => state.userDetails);
  const { user, loading: loadingDetails } = userDetails;

  const userUpdateProfil = useSelector((state) => state.userUpdateProfil);
  const { success: successUpdate, error: errorUpdate, loading: loadingUpdate } = userUpdateProfil;

  const candidaturesListMy = useSelector((state) => state.candidaturesListMy);
  const { loading: loadingCandidatures, candidatures } = candidaturesListMy;

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
      if (!user || !user.email) {
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetails('profile'));
        dispatch(listMyCandidatures());
      } else {
        setCivilite(user.civilite || 'Monsieur');
        setPrenom(user.prenom || '');
        setNom(user.nom || '');
        setDateNaissance(user.dateNaissance ? moment(user.dateNaissance, ['DD.MM.YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD') : '');
        setLieuNaissance(user.lieuNaissance || '');
        setVille(user.ville || '');
        setEmail(user.email || '');
        setCni(user.cni || '');
        setNationalite(user.nationalite || 'Marocaine');
        setPhone(user.phone || '');
        setAdresse(user.adresse || '');
      }
    }

    if (successUpdate) {
      setFeedbackMsg({ type: 'success', text: 'Vos informations ont été mises à jour avec succès.' });
      dispatch({ type: USER_UPDATE_PROFILE_RESET });
      dispatch(getUserDetails('profile'));
    }
  }, [dispatch, userInfo, navigate, user, successUpdate]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setFeedbackMsg(null);
    if (!nom || !prenom || !cni || !phone || !email || !ville) {
      setFeedbackMsg({ type: 'danger', text: 'Veuillez renseigner tous les champs obligatoires.' });
      return;
    }

    dispatch(
      updateUserProfile({
        id: user._id,
        civilite,
        prenom,
        nom,
        dateNaissance: dateNaissance ? moment(dateNaissance).format('DD.MM.YYYY') : undefined,
        lieuNaissance,
        email,
        cni,
        nationalite,
        phone,
        adresse,
        ville,
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
              <form onSubmit={handleProfileSubmit}>
                {feedbackMsg && (
                  <div
                    className={`alert alert-${feedbackMsg.type} d-flex align-items-center mb-4`}
                    role='alert'
                  >
                    <i
                      className={`fas ${
                        feedbackMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'
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
                      <i className='fas fa-venus-mars'></i> Civilité
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
                      <i className='far fa-user'></i> Nom de famille
                    </label>
                    <input
                      type='text'
                      className='form-input-custom'
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder='Ex: BENHAMZAH'
                      required
                    />
                  </div>
                  <div className='col-md-5'>
                    <label className='form-label-custom'>
                      <i className='far fa-user'></i> Prénom
                    </label>
                    <input
                      type='text'
                      className='form-input-custom'
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder='Ex: Yassine'
                      required
                    />
                  </div>
                </div>

                <div className='row g-3 mb-4'>
                  <div className='col-md-4'>
                    <label className='form-label-custom'>
                      <i className='fas fa-fingerprint'></i> N° CNI (Carte Nationale)
                    </label>
                    <input
                      type='text'
                      className='form-input-custom'
                      value={cni}
                      onChange={(e) => setCni(e.target.value)}
                      placeholder='Ex: WA111114'
                      required
                    />
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label-custom'>
                      <i className='far fa-calendar-alt'></i> Date de naissance
                    </label>
                    <input
                      type='date'
                      className='form-input-custom'
                      value={dateNaissance}
                      onChange={(e) => setDateNaissance(e.target.value)}
                    />
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label-custom'>
                      <i className='fas fa-city'></i> Lieu de naissance
                    </label>
                    <input
                      type='text'
                      className='form-input-custom'
                      value={lieuNaissance}
                      onChange={(e) => setLieuNaissance(e.target.value)}
                      placeholder='Ex: Casablanca'
                    />
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
                      <i className='fas fa-phone-alt'></i> Numéro de téléphone portable
                    </label>
                    <input
                      type='tel'
                      className='form-input-custom'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder='Ex: 0666666666'
                      required
                    />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label-custom'>
                      <i className='far fa-envelope'></i> Adresse email officielle
                    </label>
                    <input
                      type='email'
                      className='form-input-custom'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='Ex: candidat@domaine.ma'
                      required
                    />
                  </div>
                </div>

                <div className='row g-3 mb-4'>
                  <div className='col-md-8'>
                    <label className='form-label-custom'>
                      <i className='fas fa-map-marker-alt'></i> Adresse de résidence
                    </label>
                    <input
                      type='text'
                      className='form-input-custom'
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder='Ex: 12 Boulevard Hassan II'
                    />
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label-custom'>
                      <i className='fas fa-map'></i> Ville
                    </label>
                    <input
                      type='text'
                      className='form-input-custom'
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      placeholder='Ex: Casablanca'
                      required
                    />
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

          {activeTab === 'documents' && (
            <div className='candidate-form-card'>
              <div className='candidate-form-section-title'>
                <i className='fas fa-folder-open'></i>
                <span>Inventaire des Pièces Justificatives Déposées</span>
              </div>
              <p className='text-muted' style={{ fontSize: '13.5px' }}>
                Conformément aux directives de la commission de recrutement, ces pièces justificatives certifiées sont
                rattachées à votre dossier numérique sécurisé.
              </p>

              <div className='docs-list-grid'>
                <div className='doc-item-card'>
                  <div className='doc-item-icon'>
                    <i className='fas fa-id-card'></i>
                  </div>
                  <div className='doc-item-meta'>
                    <h5>Carte Nationale (CNI)</h5>
                    <div className='doc-item-status'>
                      <i className='fas fa-check-circle'></i> Certifiée Conforme
                    </div>
                  </div>
                </div>

                <div className='doc-item-card'>
                  <div className='doc-item-icon'>
                    <i className='fas fa-graduation-cap'></i>
                  </div>
                  <div className='doc-item-meta'>
                    <h5>Diplôme / Attestation Bac+2/3</h5>
                    <div className='doc-item-status'>
                      <i className='fas fa-check-circle'></i> Validé au Barème
                    </div>
                  </div>
                </div>

                <div className='doc-item-card'>
                  <div className='doc-item-icon'>
                    <i className='fas fa-file-invoice'></i>
                  </div>
                  <div className='doc-item-meta'>
                    <h5>Relevés de Notes Globaux</h5>
                    <div className='doc-item-status'>
                      <i className='fas fa-check-circle'></i> Mentions Enregistrées
                    </div>
                  </div>
                </div>

                <div className='doc-item-card'>
                  <div className='doc-item-icon'>
                    <i className='fas fa-briefcase'></i>
                  </div>
                  <div className='doc-item-meta'>
                    <h5>Attestations d'Expérience</h5>
                    <div className='doc-item-status'>
                      <i className='fas fa-check-circle'></i> Comptabilisées
                    </div>
                  </div>
                </div>

                <div className='doc-item-card'>
                  <div className='doc-item-icon'>
                    <i className='fas fa-file-alt'></i>
                  </div>
                  <div className='doc-item-meta'>
                    <h5>Curriculum Vitae (CV)</h5>
                    <div className='doc-item-status'>
                      <i className='fas fa-check-circle'></i> Format Officiel PDF
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
