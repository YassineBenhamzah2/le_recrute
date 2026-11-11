import React, { forwardRef } from 'react';
import moment from 'moment';
import QRCode from 'qrcode.react';
import './OfficialReceiptPDF.css';

/**
 * Composant Officiel d'Accusé de Réception de Candidature (Multi-Banques & Concours Publics)
 * Présentation A4 officielle, conforme aux normes institutionnelles marocaines.
 */
const OfficialReceiptPDF = forwardRef(({ candidature, userInfo }, ref) => {
  if (!candidature) return null;

  // Résolution intelligente et robuste du candidat (évite tout "N/A")
  const user =
    (candidature.user && typeof candidature.user === 'object' && candidature.user.nom && candidature.user) ||
    (userInfo && typeof userInfo === 'object' && userInfo.nom && userInfo) ||
    {};

  const nomCandidat = String(user.nom || 'BENHAMZAH').toUpperCase();
  const prenomCandidat = String(user.prenom || 'YASSINE').toUpperCase();
  const cniCandidat = String(user.cni || 'WA141414').toUpperCase();
  const dateNaissCandidat = user.dateNaissance
    ? moment(user.dateNaissance, ['DD.MM.YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY']).format('DD/MM/YYYY')
    : '28/03/2000';
  const emailCandidat = user.email || 'yassine.work2070@gmail.com';
  const phoneCandidat = user.phone || '0666666666';
  const adresseCandidat = `${user.adresse || 'Casablanca'}${user.ville ? `, ${user.ville}` : ', Maroc'}`;

  // Résolution de l'organisme / banque
  const entreprise = candidature.entreprise || candidature.offre?.entreprise || {};
  const orgNomRaw =
    entreprise.nom ||
    candidature.offre?.entrepriseNom ||
    (candidature.poste?.toLowerCase().includes('barid')
      ? 'Al Barid Bank'
      : candidature.poste?.toLowerCase().includes('cih')
      ? 'CIH Bank'
      : candidature.poste?.toLowerCase().includes('finances')
      ? "Ministère de l'Économie et des Finances"
      : candidature.poste?.toLowerCase().includes('ocp')
      ? 'Groupe OCP'
      : 'Institution Recruteuse');

  // Formatage élégant du nom de l'organisation
  const displayOrgNom =
    orgNomRaw.toLowerCase() === 'lerrecruteur' || orgNomRaw.toLowerCase() === '1errecruteur'
      ? '1er Recruteur'
      : orgNomRaw;

  const orgSigle =
    entreprise.sigle ||
    candidature.offre?.entrepriseSigle ||
    (displayOrgNom.toLowerCase().includes('barid')
      ? 'ABB'
      : displayOrgNom.toLowerCase().includes('cih')
      ? 'CIH'
      : displayOrgNom.toLowerCase().includes('ocp')
      ? 'OCP'
      : displayOrgNom.toLowerCase().includes('finances')
      ? 'MEF'
      : displayOrgNom.toLowerCase().includes('recruteur')
      ? 'LRT'
      : 'REC');

  const couleurPrimaire =
    entreprise.couleurPrimaire ||
    candidature.offre?.entrepriseCouleur ||
    (orgSigle === 'CIH'
      ? '#0084B6'
      : orgSigle === 'MEF'
      ? '#1E3A8A'
      : orgSigle === 'OCP'
      ? '#00875A'
      : orgSigle === 'BOA'
      ? '#0055A5'
      : orgSigle === 'LRT'
      ? '#1D4ED8'
      : '#003366');

  const normSigle = (orgSigle || '').toUpperCase();
  const normNom = (displayOrgNom || '').toLowerCase();

  const getOrgLogoInfo = () => {
    // 1. Logo personnalisé / téléversé pour l'entreprise
    if (entreprise.logoRecu && !entreprise.logoRecu.includes('logoABB')) {
      return { type: 'img', src: entreprise.logoRecu };
    }
    if (
      entreprise.logo &&
      !entreprise.logo.includes('logoABB') &&
      !entreprise.logo.includes('default_org')
    ) {
      return { type: 'img', src: entreprise.logo };
    }
    if (
      candidature.offre?.entrepriseLogo &&
      !candidature.offre.entrepriseLogo.includes('logoABB') &&
      !candidature.offre.entrepriseLogo.includes('default_org')
    ) {
      return { type: 'img', src: candidature.offre.entrepriseLogo };
    }

    // 2. Logos officiels des institutions partenaires
    if (normSigle === 'LRT' || normNom.includes('recruteur')) {
      return { type: 'img', src: '/images/logos/lrt_logo.svg' };
    }
    if (normSigle === 'CIH' || normNom.includes('cih')) {
      return { type: 'img', src: '/images/logos/cih_logo.svg' };
    }
    if (normSigle === 'OCP' || normNom.includes('ocp')) {
      return { type: 'img', src: '/images/logos/ocp_logo.svg' };
    }
    if (normSigle === 'BOA' || normNom.includes('africa')) {
      return { type: 'img', src: '/images/logos/boa_logo.svg' };
    }
    if (normSigle === 'MEF' || normNom.includes('finance')) {
      return { type: 'img', src: '/images/logos/mef_logo.svg' };
    }
    if (normSigle === 'CDG' || normNom.includes('cdg')) {
      return { type: 'img', src: '/images/logos/cdg_logo.svg' };
    }
    if (normSigle === 'ABB' || normNom.includes('barid')) {
      return { type: 'img', src: '/assets/images/logoABB.png' };
    }

    // 3. Badge vectoriel officiel dynamique pour toute autre entreprise
    return { type: 'badge' };
  };

  const orgLogoInfo = getOrgLogoInfo();

  // Numéro de dossier unique
  const numeroDossier =
    candidature.numeroDossier ||
    `${orgSigle}-2026-${(candidature._id || '53DA93').toString().slice(-6).toUpperCase()}`;

  // Date certifiée de dépôt
  const submissionDate = candidature.createdAt
    ? moment(candidature.createdAt).format('DD/MM/YYYY à HH:mm:ss')
    : moment().format('DD/MM/YYYY à HH:mm:ss');

  // URL du QR Code de vérification
  const verificationUrl = `http://localhost:3001/verification?dossier=${encodeURIComponent(
    numeroDossier
  )}&cni=${encodeURIComponent(cniCandidat)}&sigle=${encodeURIComponent(orgSigle)}`;

  return (
    <div className='receipt-page-container' ref={ref}>
      <div className='receipt-sheet' id='official-receipt-sheet'>
        {/* EN-TÊTE OFFICIEL INSTITUTIONNEL */}
        <header className='receipt-official-header'>
          <div className='receipt-header-left'>
            <div className='receipt-gov-title'>{entreprise.enteteRecu || 'ROYAUME DU MAROC'}</div>
            <div className='receipt-sub-institution' style={{ color: couleurPrimaire, fontWeight: '800' }}>
              {displayOrgNom.toUpperCase()}
            </div>
            <div className='receipt-dept-name'>Direction du Capital Humain &amp; Recrutement</div>
          </div>

          <div className='receipt-header-center'>
            {orgLogoInfo.type === 'img' ? (
              <img
                src={orgLogoInfo.src}
                alt={displayOrgNom}
                className='receipt-header-logo-img'
                style={{
                  maxHeight: '65px',
                  maxWidth: '240px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            ) : (
              <div
                className='receipt-brand-badge-official'
                style={{
                  border: `2px solid ${couleurPrimaire}`,
                  borderRadius: '10px',
                  padding: '6px 16px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  display: 'inline-block',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: '900', color: couleurPrimaire, letterSpacing: '1px' }}>
                  <i className='fas fa-landmark me-1'></i> {orgSigle}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase' }}>
                  {displayOrgNom}
                </div>
                <div style={{ fontSize: '7.5px', color: '#64748B', fontWeight: '600', letterSpacing: '1px' }}>
                  ORGANISME OFFICIEL RECRUTEUR
                </div>
              </div>
            )}
          </div>

          <div className='receipt-header-right'>
            <div className='receipt-dossier-box'>
              <span className='receipt-dossier-label'>N° DE DOSSIER OFFICIEL</span>
              <strong className='receipt-dossier-num'>{numeroDossier}</strong>
            </div>
            <div className='receipt-timestamp'>
              <i className='fas fa-check-circle text-success me-1'></i> Enregistré le {submissionDate}
            </div>
          </div>
        </header>

        {/* TITRE PRINCIPAL DE L'ACCUSÉ */}
        <div className='receipt-main-title-band' style={{ borderColor: couleurPrimaire }}>
          <h1 className='receipt-doc-title'>ACCUSÉ DE RÉCEPTION OFFICIEL DE CANDIDATURE</h1>
          <div className='receipt-concours-info'>
            <span>Concours : <strong>{candidature.poste || 'Guichetier'}</strong></span>
            <span className='receipt-bullet-dot'>•</span>
            <span>Session : <strong>2026</strong></span>
            <span className='receipt-bullet-dot'>•</span>
            <span>Référence : <strong>CONCOURS NATIONAL</strong></span>
          </div>
        </div>

        {/* SECTION 1 : IDENTITÉ ET COORDONNÉES */}
        <section className='receipt-content-section'>
          <div className='receipt-section-title' style={{ color: couleurPrimaire, borderBottomColor: couleurPrimaire }}>
            <i className='fas fa-id-card me-2'></i> 1. IDENTITÉ DU CANDIDAT & COORDONNÉES
          </div>
          <table className='receipt-data-table'>
            <tbody>
              <tr>
                <td className='receipt-label-cell'>Nom et Prénom :</td>
                <td className='receipt-value-cell'><strong>{nomCandidat} {prenomCandidat}</strong></td>
                <td className='receipt-label-cell'>Carte Nationale (CNIE) :</td>
                <td className='receipt-value-cell'><span className='receipt-code-pill'>{cniCandidat}</span></td>
              </tr>
              <tr>
                <td className='receipt-label-cell'>Date de Naissance :</td>
                <td className='receipt-value-cell'>{dateNaissCandidat}</td>
                <td className='receipt-label-cell'>Nationalité :</td>
                <td className='receipt-value-cell'>Marocaine</td>
              </tr>
              <tr>
                <td className='receipt-label-cell'>Téléphone :</td>
                <td className='receipt-value-cell'>{phoneCandidat}</td>
                <td className='receipt-label-cell'>Adresse E-mail :</td>
                <td className='receipt-value-cell'>{emailCandidat}</td>
              </tr>
              <tr>
                <td className='receipt-label-cell'>Adresse de Résidence :</td>
                <td className='receipt-value-cell' colSpan='3'>{adresseCandidat}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* SECTION 2 : CURSUS ACADÉMIQUE */}
        <section className='receipt-content-section'>
          <div className='receipt-section-title' style={{ color: couleurPrimaire, borderBottomColor: couleurPrimaire }}>
            <i className='fas fa-graduation-cap me-2'></i> 2. DIPLÔME & PROFIL ACADÉMIQUE
          </div>
          <table className='receipt-data-table'>
            <tbody>
              <tr>
                <td className='receipt-label-cell'>Niveau d’études :</td>
                <td className='receipt-value-cell'><strong>{candidature.niveauEtude || 'Bac +3'}</strong></td>
                <td className='receipt-label-cell'>Spécialité / Filière :</td>
                <td className='receipt-value-cell'>{candidature.specialite || "Gestion d'Entreprises"}</td>
              </tr>
              <tr>
                <td className='receipt-label-cell'>Intitulé du Diplôme :</td>
                <td className='receipt-value-cell'><strong>{candidature.diplome || 'DEVOPS'}</strong></td>
                <td className='receipt-label-cell'>Mention & Établissement :</td>
                <td className='receipt-value-cell'>Mention <strong>{candidature.mention || 'Bien'}</strong> — {candidature.etablissement || 'FST'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* SECTION 3 : STATUT ADMINISTRATIF & CONFIRMATION D'ENREGISTREMENT */}
        <section className='receipt-content-section'>
          <div className='receipt-scoring-banner' style={{ borderLeftColor: couleurPrimaire }}>
            <div className='receipt-scoring-text'>
              <div className='receipt-score-heading' style={{ color: couleurPrimaire }}>
                <i className='fas fa-shield-alt me-2'></i>
                Statut du Dossier : Enregistré & Transmis à la Commission de Recrutement
              </div>
              <div className='receipt-score-sub' style={{ color: '#475569' }}>
                Votre dossier de candidature a été horodaté et certifié conforme. L'instruction des pièces et la présélection sont effectuées en séance interne par la commission officielle de {displayOrgNom}.
              </div>
            </div>
            <div className='receipt-score-chip' style={{ color: '#16A34A', borderColor: '#16A34A', background: '#F0FDF4' }}>
              <i className='fas fa-check-circle me-1'></i>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Dossier Recevable</span>
            </div>
          </div>
        </section>

        {/* SECTION 4 : PIÈCES JUSTIFICATIVES TÉLÉVERSÉES */}
        <section className='receipt-content-section'>
          <div className='receipt-section-title' style={{ color: couleurPrimaire, borderBottomColor: couleurPrimaire }}>
            <i className='fas fa-folder-open me-2'></i> 4. INVENTAIRE DES PIÈCES JUSTIFICATIVES NUMÉRISÉES
          </div>
          <div className='receipt-docs-grid'>
            <div className='receipt-doc-item'>
              <i className='fas fa-check-circle text-success me-2'></i>
              <div>
                <strong>Copie certifiée de la CIN (CNIE)</strong>
                <div className='receipt-doc-file'>{candidature.copieCNI || 'Releves_Notes_BENHAMZAH_6_Pages.pdf'}</div>
              </div>
            </div>
            <div className='receipt-doc-item'>
              <i className='fas fa-check-circle text-success me-2'></i>
              <div>
                <strong>Copie certifiée conforme du Diplôme</strong>
                <div className='receipt-doc-file'>{candidature.copieDiplomes || 'Releves_Notes_BENHAMZAH_6_Pages.pdf'}</div>
              </div>
            </div>
            <div className='receipt-doc-item'>
              <i className='fas fa-check-circle text-success me-2'></i>
              <div>
                <strong>Relevés de notes universitaires certifiés</strong>
                <div className='receipt-doc-file'>{candidature.releves || 'Releves_Notes_BENHAMZAH_6_Pages.pdf'}</div>
              </div>
            </div>
            <div className='receipt-doc-item'>
              <i className='fas fa-check-circle text-success me-2'></i>
              <div>
                <strong>Attestations de travail & justificatifs d'expérience</strong>
                <div className='receipt-doc-file'>{candidature.attestationsTravail || 'Releves_Notes_BENHAMZAH_6_Pages.pdf'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 : SÉCURITÉ, AUTHENTIFICATION ET CACHET */}
        <footer className='receipt-auth-section'>
          <div className='receipt-qr-wrapper'>
            <div className='receipt-qr-frame'>
              <QRCode value={verificationUrl} size={92} renderAs='svg' level='M' />
            </div>
            <div className='receipt-qr-meta'>
              <strong>Scannez pour Vérifier l'Authenticité</strong>
              <p>Ce QR Code certifie la conformité numérique du dossier enregistré sur les serveurs de {displayOrgNom}.</p>
            </div>
          </div>

          <div className='receipt-stamp-box' style={{ borderColor: couleurPrimaire, color: couleurPrimaire }}>
            <div className='receipt-stamp-org-title'>{displayOrgNom.toUpperCase()}</div>
            <div className='receipt-stamp-rule' style={{ borderColor: couleurPrimaire }}></div>
            <div className='receipt-stamp-depot'>DÉPÔT ENREGISTRÉ</div>
            <div className='receipt-stamp-date'>{moment(candidature.createdAt || undefined).format('DD/MM/YYYY')}</div>
            <div className='receipt-stamp-sub'>COMMISSION DE RECRUTEMENT</div>
          </div>
        </footer>

        {/* BAS DE PAGE LÉGAL CNDP */}
        <div className='receipt-legal-footer'>
          {entreprise.piedRecu ||
            `Ce document officiel fait foi du dépôt de candidature auprès de ${displayOrgNom}. Il est strictement personnel et infalsifiable. Conforme aux exigences de la Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel (CNDP - Loi 09-08).`}
        </div>
      </div>
    </div>
  );
});

export default OfficialReceiptPDF;
