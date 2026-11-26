import React, { useState, useEffect, useCallback } from 'react';
import { Offcanvas, Button, Badge, Form, Row, Col, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import DocumentViewer from './DocumentViewer';
import {
  updateCandidature,
  listControllerCandidatures,
  listControllerCandidatures2,
  listControllerCandidatures3,
} from '../actions/candidatureActions';

const ControleurDrawer = ({
  show,
  onClose,
  candidature,
  controlLevel = 1,
  userInfo,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  currentIndex = 0,
  totalCount = 0,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedDocKey, setSelectedDocKey] = useState('copieCNI');
  const [saving, setSaving] = useState(false);

  // Form decision state
  const [conformeVal, setConformeVal] = useState('CONFORME');
  const [eligibiliteVal, setEligibiliteVal] = useState('ELIGIBLE');
  const [motifVal, setMotifVal] = useState('-');
  const [dossierVal, setDossierVal] = useState('-');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    if (candidature) {
      setConformeVal(candidature.conforme || (candidature.statutAI === 'VALIDE_IA' ? 'CONFORME' : 'CONFORME'));
      setEligibiliteVal(candidature.eligibilite || 'ELIGIBLE');
      setMotifVal(candidature.motif || '-');
      setDossierVal(candidature.dossier || '-');
      setFeedbackMsg(null);

      // Default active document
      if (candidature.copieCNI || candidature.user?.copieCNI) setSelectedDocKey('copieCNI');
      else if (candidature.copieDiplomes) setSelectedDocKey('copieDiplomes');
      else if (candidature.releves) setSelectedDocKey('releves');
      else if (candidature.attestationsTravail) setSelectedDocKey('attestationsTravail');
      else if (candidature.residence || candidature.user?.residence) setSelectedDocKey('residence');
      else setSelectedDocKey('copieCNI');
    }
  }, [candidature]);

  const fullName = `${candidature?.prenom || ''} ${candidature?.nom || ''}`.trim() || 'Candidat';
  const cni = candidature?.cni || candidature?.user?.cni || '-';
  const poste = candidature?.poste || '-';
  const dossierId = candidature?.numeroDossier || candidature?._id;

  const handleConformeChange = (val) => {
    setConformeVal(val);
    if (val === 'CONFORME') {
      setEligibiliteVal('ELIGIBLE');
      setMotifVal('-');
      setDossierVal('-');
    } else {
      setEligibiliteVal('NON ELIGIBLE');
      if (motifVal === '-') setMotifVal('NEP');
      if (dossierVal === '-') setDossierVal('NEP-CIN');
    }
  };

  const handleQuickValidate = useCallback(async () => {
    if (!candidature) return;
    if (!window.confirm(`Confirmer la validation du dossier de ${fullName} ?`)) return;
    setSaving(true);
    const controllerName = `${userInfo?.prenom || ''} ${userInfo?.nom || ''}`.trim();
    const payload =
      controlLevel === 1
        ? {
            isControl1: true,
            conforme: 'CONFORME',
            eligibilite: 'ELIGIBLE',
            controle1: `Validé Niveau 1 par ${controllerName} (Certifié)`,
          }
        : controlLevel === 2
        ? {
            isControl2: true,
            conforme: 'CONFORME',
            eligibilite: 'ELIGIBLE',
            controle2: `Validé Niveau 2 par ${controllerName} (Transmis à Contrôle 3)`,
          }
        : {
            isControl3: true,
            conforme: 'CONFORME',
            eligibilite: 'ELIGIBLE',
            statutCommission: 'VALIDE_COMMISSION',
            controle3: `Validation Finale Commission par ${controllerName}`,
          };

    try {
      await dispatch(updateCandidature(candidature._id, payload));
      setFeedbackMsg({
        type: 'success',
        text: `Dossier validé avec succès (${
          controlLevel === 1
            ? 'Envoyé vers Contrôle 2'
            : controlLevel === 2
            ? 'Envoyé vers Contrôle 3'
            : 'Validé Shortlist Finale'
        })`,
      });
      if (controlLevel === 1) {
        dispatch(listControllerCandidatures());
      } else if (controlLevel === 2) {
        dispatch(listControllerCandidatures2());
      } else {
        dispatch(listControllerCandidatures3());
      }
      setTimeout(() => {
        if (hasNext && onNext) onNext();
      }, 700);
    } catch (e) {
      setFeedbackMsg({ type: 'danger', text: "Erreur lors de l'enregistrement de la validation" });
    } finally {
      setSaving(false);
    }
  }, [candidature, controlLevel, dispatch, fullName, hasNext, onNext, userInfo]);

  // RACCOURCIS CLAVIER ULTRA-RAPIDES POUR L'AUDITEUR (Vitesse x5)
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      // Ignorer si l'utilisateur est en train de taper dans un champ
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight' && hasNext && onNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === '1') {
        setSelectedDocKey('copieCNI');
      } else if (e.key === '2') {
        setSelectedDocKey('copieDiplomes');
      } else if (e.key === '3') {
        setSelectedDocKey('releves');
      } else if (e.key === '4') {
        setSelectedDocKey('residence');
      } else if (e.key === '5') {
        setSelectedDocKey('attestationsTravail');
      } else if ((e.key === 'v' || e.key === 'V') && !saving) {
        e.preventDefault();
        handleQuickValidate();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleConformeChange('NON CONFORME');
        const decisionAnchor = document.getElementById('decision-card-anchor');
        if (decisionAnchor) {
          decisionAnchor.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, hasNext, hasPrev, onNext, onPrev, saving, handleQuickValidate]);

  if (!candidature) return null;

  const handleSaveDecision = async () => {
    setSaving(true);
    const controllerName = `${userInfo?.prenom || ''} ${userInfo?.nom || ''}`.trim();
    const payload = {
      conforme: conformeVal,
      eligibilite: eligibiliteVal,
      motif: motifVal !== '-' ? motifVal : undefined,
      dossier: dossierVal !== '-' ? dossierVal : undefined,
      ...(controlLevel === 1
        ? { controle1: `Arbitrage par ${controllerName} (${conformeVal} / ${eligibiliteVal})` }
        : { controle2: `Arbitrage Niveau 2 par ${controllerName} (${conformeVal} / ${eligibiliteVal})` }),
    };

    try {
      await dispatch(updateCandidature(candidature._id, payload));
      setFeedbackMsg({ type: 'success', text: 'Décision enregistrée avec succès !' });
      if (controlLevel === 1) {
        dispatch(listControllerCandidatures());
      } else {
        dispatch(listControllerCandidatures2());
      }
    } catch (e) {
      setFeedbackMsg({ type: 'danger', text: "Erreur lors de l'enregistrement" });
    } finally {
      setSaving(false);
    }
  };

  const docsList = [
    { key: 'copieCNI', label: 'CNI Recto', url: candidature.copieCNI || candidature.user?.copieCNI, icon: 'fa-id-card' },
    { key: 'copieCNIVerso', label: 'CNI Verso', url: candidature.copieCNIVerso || candidature.user?.copieCNIVerso, icon: 'fa-id-card' },
    { key: 'copieDiplomes', label: 'Diplômes', url: candidature.copieDiplomes, icon: 'fa-graduation-cap' },
    { key: 'releves', label: 'Relevés de Notes', url: candidature.releves, icon: 'fa-file-invoice' },
    { key: 'residence', label: 'Certificat Résidence', url: candidature.residence || candidature.user?.residence, icon: 'fa-map-marker-alt' },
    { key: 'attestationsTravail', label: 'Attestations Travail', url: candidature.attestationsTravail, icon: 'fa-briefcase' },
  ];

  const currentDoc = docsList.find((d) => d.key === selectedDocKey) || docsList[0];

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement='end'
      style={{
        width: 'min(1560px, 98vw)',
        boxShadow: '-12px 0 35px rgba(0,0,0,0.3)',
        zIndex: 1055,
      }}
    >
      {/* HEADER DE LA POPUP */}
      <Offcanvas.Header closeButton className='border-bottom bg-light py-2 px-4'>
        <div className='d-flex align-items-center justify-content-between w-100 me-3'>
          <div className='d-flex align-items-center gap-3'>
            <div
              className='rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm'
              style={{ width: '44px', height: '44px', fontSize: '17px' }}
            >
              {(candidature.nom || 'C')[0]?.toUpperCase()}
              {(candidature.prenom || 'C')[0]?.toUpperCase()}
            </div>
            <div>
              <div className='d-flex align-items-center gap-2'>
                <h5 className='mb-0 fw-bold text-dark'>{fullName}</h5>
                <Badge bg='secondary' className='font-monospace small'>
                  CNI: {cni}
                </Badge>
                <Badge bg='info' text='dark' className='fw-bold'>
                  {poste}
                </Badge>
              </div>
              <div className='small text-muted mt-1 d-flex align-items-center gap-2'>
                <span className='font-monospace'>Dossier #{String(dossierId).substring(0, 10)}</span>
                <span>•</span>
                <span>Contrôle Niveau {controlLevel}</span>
              </div>
            </div>
          </div>

          {/* Raccourcis Clavier Pro Badge */}
          <div className='d-none d-xl-flex align-items-center gap-1.5 px-2.5 py-1 rounded bg-white border shadow-sm'>
            <span className='text-muted' style={{ fontSize: '11px', fontWeight: '700' }}>Raccourcis :</span>
            <kbd style={{ fontSize: '10px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '2px 5px', borderRadius: '4px' }}>← / →</kbd>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Dossiers</span>
            <kbd style={{ fontSize: '10px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '2px 5px', borderRadius: '4px' }}>1-5</kbd>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Pièces</span>
            <kbd style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold' }}>V</kbd>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>Valider</span>
            <kbd style={{ fontSize: '10px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold' }}>R</kbd>
            <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: '700' }}>Rejeter</span>
          </div>

          {/* Navigation Précédent / Suivant */}
          <div className='d-flex align-items-center gap-2'>
            <span className='small text-muted fw-bold font-monospace me-1'>
              {totalCount > 0 ? `Dossier ${currentIndex + 1} / ${totalCount}` : ''}
            </span>
            <Button
              variant='outline-secondary'
              size='sm'
              disabled={!hasPrev || saving}
              onClick={onPrev}
              title='Dossier Précédent'
            >
              <i className='fas fa-chevron-left me-1'></i> Précédent
            </Button>
            <Button
              variant='outline-secondary'
              size='sm'
              disabled={!hasNext || saving}
              onClick={onNext}
              title='Dossier Suivant'
            >
              Suivant <i className='fas fa-chevron-right ms-1'></i>
            </Button>
          </div>
        </div>
      </Offcanvas.Header>

      <Offcanvas.Body className='p-0 d-flex flex-column' style={{ height: 'calc(100vh - 75px)', backgroundColor: '#f8fafc' }}>
        {/* BANDEAU RECAP AUDIT IA & ALERTES */}
        <div className='px-4 py-2 border-bottom bg-white'>
          <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
            <div className='d-flex align-items-center gap-2'>
              <span className='small fw-bold text-muted text-uppercase'>Audit IA :</span>
              {candidature.statutAI === 'VALIDE_IA' && (
                <Badge bg='success' className='px-3 py-1 fs-6 shadow-sm'>
                  <i className='fas fa-check-circle me-1'></i> Conforme IA
                </Badge>
              )}
              {candidature.statutAI === 'ANOMALIE_IA' && (
                <Badge bg='warning' text='dark' className='px-3 py-1 fs-6 fw-bold shadow-sm'>
                  <i className='fas fa-exclamation-triangle me-1'></i> Anomalie Détectée
                </Badge>
              )}
              {candidature.statutAI === 'REJETE_IA' && (
                <Badge bg='danger' className='px-3 py-1 fs-6 shadow-sm'>
                  <i className='fas fa-times-circle me-1'></i> Rejeté IA
                </Badge>
              )}
              {(!candidature.statutAI || candidature.statutAI === 'EN_ATTENTE_IA') && (
                <Badge bg='secondary' className='px-3 py-1 fs-6 shadow-sm'>
                  <i className='fas fa-clock me-1'></i> En Attente IA
                </Badge>
              )}

              {candidature.auditAI?.scoreConfiance !== undefined && candidature.auditAI?.scoreConfiance !== null && (
                <span className='badge bg-light text-dark border small'>
                  Confiance: {candidature.auditAI.scoreConfiance}%
                </span>
              )}

              <span className='badge bg-warning text-dark fs-6 px-3 py-1 ms-2'>
                Score Total: <b>{candidature.scoreTotal || 0} pts</b>
              </span>
            </div>

            <Button
              variant='outline-primary'
              size='sm'
              onClick={() => navigate(`/controlleurs/candidatures/informations/${candidature._id}`)}
              title='Ouvrir la page de vérification par étapes'
            >
              <i className='fas fa-external-link-alt me-1'></i> Vue détaillée par étapes
            </Button>
          </div>

          {/* LISTE DES ANOMALIES SI PRÉSENTES */}
          {candidature.auditAI?.anomalies && candidature.auditAI.anomalies.length > 0 && (
            <div className='alert alert-warning mt-2 mb-0 py-2 px-3 small border-start border-4 border-warning'>
              <div className='fw-bold text-danger mb-1'>
                <i className='fas fa-exclamation-triangle me-1'></i> Anomalies signalées par le système :
              </div>
              <ul className='mb-0 ps-3'>
                {candidature.auditAI.anomalies.map((anom, idx) => (
                  <li key={idx} className='text-dark fw-semibold'>
                    {anom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedbackMsg && (
            <div className={`alert alert-${feedbackMsg.type} mt-2 mb-0 py-2 px-3 small`}>
              {feedbackMsg.text}
            </div>
          )}
        </div>

        {/* SPLIT VIEW : DONNÉES DU CANDIDAT (GAUCHE) + PDF / JUSTIFICATIFS (DROITE) CÔTE À CÔTE */}
        <div className='flex-grow-1 p-3' style={{ minHeight: 0 }}>
          <Row className='h-100 g-3 m-0'>
            {/* COLONNE GAUCHE (50%) : DONNÉES DU CANDIDAT & FORMULAIRE DE DÉCISION */}
            <Col lg={6} className='d-flex flex-column h-100 ps-0 pe-2'>
              <div
                className='flex-grow-1 overflow-auto pe-2'
                style={{
                  height: 'calc(100vh - 215px)',
                }}
              >
                {/* 1. État Civil & Coordonnées */}
                <Card className='mb-3 border-0 shadow-sm'>
                  <Card.Header className='bg-white fw-bold py-2 text-primary border-bottom d-flex align-items-center justify-content-between'>
                    <span><i className='fas fa-id-card me-2'></i> 1. État Civil & Coordonnées</span>
                    <Badge bg='light' text='dark' className='border font-monospace'>{cni}</Badge>
                  </Card.Header>
                  <Card.Body className='p-3'>
                    <Row className='g-2 small'>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Date de naissance :</span>
                        <span className='fw-bold fs-6'>
                          {candidature.dateNaissance || candidature.user?.dateNaissance || '-'}
                        </span>
                      </Col>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Lieu de naissance / Ville :</span>
                        <span className='fw-bold fs-6'>
                          {candidature.lieuNaissance || candidature.ville || candidature.user?.ville || '-'}
                        </span>
                      </Col>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Téléphone :</span>
                        <span className='fw-bold font-monospace'>
                          {candidature.phone || candidature.user?.phone || '-'}
                        </span>
                      </Col>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Email :</span>
                        <span className='fw-bold'>
                          {candidature.email || candidature.user?.email || '-'}
                        </span>
                      </Col>
                      <Col sm={12}>
                        <span className='text-muted d-block'>Adresse de résidence déclarée :</span>
                        <span className='fw-bold'>
                          {candidature.adresse || candidature.user?.adresse || '-'}{' '}
                          {candidature.codePostale || candidature.user?.codePostale ? `(${candidature.codePostale || candidature.user?.codePostale})` : ''}
                        </span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* 2. Diplôme & Formation */}
                <Card className='mb-3 border-0 shadow-sm'>
                  <Card.Header className='bg-white fw-bold py-2 text-primary border-bottom'>
                    <i className='fas fa-graduation-cap me-2'></i> 2. Diplômes & Cursus Académique
                  </Card.Header>
                  <Card.Body className='p-3'>
                    <Row className='g-2 small'>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Niveau d'études :</span>
                        <span className='fw-bold fs-6 text-dark'>{candidature.niveauEtude || '-'}</span>
                      </Col>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Spécialité :</span>
                        <span className='fw-bold fs-6 text-dark'>{candidature.specialite || '-'}</span>
                      </Col>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Intitulé Diplôme :</span>
                        <span className='fw-bold'>{candidature.diplome || '-'}</span>
                      </Col>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Établissement & Mention :</span>
                        <span className='fw-bold'>
                          {candidature.etablissement || '-'} {candidature.mention ? `(${candidature.mention})` : ''}
                        </span>
                      </Col>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Méthode de notation :</span>
                        <span className='fw-bold'>{candidature.methodeNotation || '-'}</span>
                      </Col>
                      <Col sm={6}>
                        <span className='text-muted d-block'>Moyenne déclarée :</span>
                        <span className='fw-bold text-success fs-6'>
                          {candidature.moyenneOFPPT ? `${candidature.moyenneOFPPT}/20` : '-'}
                        </span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* 3. Expériences professionnelles */}
                <Card className='mb-3 border-0 shadow-sm'>
                  <Card.Header className='bg-white fw-bold py-2 text-primary border-bottom'>
                    <i className='fas fa-briefcase me-2'></i> 3. Expériences Professionnelles
                  </Card.Header>
                  <Card.Body className='p-3'>
                    {candidature.experiences && candidature.experiences.length > 0 ? (
                      <div className='d-flex flex-column gap-2'>
                        {candidature.experiences.map((exp, idx) => (
                          <div key={idx} className='p-2 rounded bg-light border small'>
                            <div className='d-flex justify-content-between align-items-center'>
                              <span className='fw-bold text-dark'>
                                {exp.fonctionOccupee || exp.poste || `Expérience ${idx + 1}`}
                              </span>
                              <Badge bg={exp.enPoste ? 'success' : 'secondary'}>
                                {exp.enPoste ? 'En poste' : `${exp.dateDebut || '-'} à ${exp.dateFin || '-'}`}
                              </Badge>
                            </div>
                            <div className='text-muted mt-1'>
                              <span>Société : <b>{exp.entreprise || '-'}</b></span>
                              {exp.domaine && <span className='ms-3'>Domaine : {exp.domaine}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-muted small text-center py-2'>Aucune expérience professionnelle déclarée</div>
                    )}
                  </Card.Body>
                </Card>

                {/* 4. Scoring calculé */}
                <Card className='mb-3 border-0 shadow-sm'>
                  <Card.Header className='bg-white fw-bold py-2 text-warning border-bottom'>
                    <i className='fas fa-star me-2'></i> 4. Barème & Notation Globale
                  </Card.Header>
                  <Card.Body className='p-3'>
                    <Row className='g-2 text-center'>
                      <Col xs={3}>
                        <div className='p-2 bg-light rounded'>
                          <div className='small text-muted'>Score Âge</div>
                          <div className='fw-bold'>{candidature.scoreAge || 0}</div>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div className='p-2 bg-light rounded'>
                          <div className='small text-muted'>Score Diplôme</div>
                          <div className='fw-bold'>{candidature.scoreDiplome || candidature.scoreMention || 0}</div>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div className='p-2 bg-light rounded'>
                          <div className='small text-muted'>Score Exp</div>
                          <div className='fw-bold'>{candidature.scoreExperience || 0}</div>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div className='p-2 bg-warning bg-opacity-25 rounded border border-warning'>
                          <div className='small fw-bold text-dark'>Total</div>
                          <div className='fw-bold fs-5 text-dark'>{candidature.scoreTotal || 0}</div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* 5. Formulaire d'Arbitrage Officiel & Motifs de Rejet */}
                <Card className='border-0 shadow-sm mb-3' id='arbitrage-section'>
                  <div id='decision-card-anchor'></div>
                  <Card.Header className='bg-dark text-white py-2 fw-bold d-flex justify-content-between align-items-center'>
                    <span><i className='fas fa-gavel me-2 text-warning'></i> 5. Formulaire d'Arbitrage & Motifs de Rejet</span>
                    <Badge bg='warning' text='dark'>Arbitrage Officiel</Badge>
                  </Card.Header>
                  <Card.Body className='p-3 bg-light'>
                    <Row className='g-2'>
                      <Col sm={6}>
                        <Form.Group className='mb-2'>
                          <Form.Label className='fw-bold small text-muted mb-1'>Statut de Conformité</Form.Label>
                          <Form.Select
                            size='sm'
                            className={`fw-bold ${conformeVal === 'CONFORME' ? 'text-success border-success' : 'text-danger border-danger'}`}
                            value={conformeVal}
                            onChange={(e) => handleConformeChange(e.target.value)}
                          >
                            <option value='CONFORME'>✓ CONFORME (Dossier Validé)</option>
                            <option value='NON CONFORME'>✗ NON CONFORME (Rejet Officiel)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group className='mb-2'>
                          <Form.Label className='fw-bold small text-muted mb-1'>Éligibilité Globale</Form.Label>
                          <Form.Select
                            size='sm'
                            className='fw-bold'
                            value={eligibiliteVal}
                            onChange={(e) => setEligibiliteVal(e.target.value)}
                          >
                            <option value='ELIGIBLE'>ÉLIGIBLE</option>
                            <option value='NON ELIGIBLE'>NON ÉLIGIBLE</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col sm={12}>
                        <Form.Group className='mb-2'>
                          <Form.Label className='fw-bold small text-muted mb-1'>Motif Officiel de Rejet (si non conforme)</Form.Label>
                          <Form.Select
                            size='sm'
                            className='fw-bold'
                            value={motifVal}
                            onChange={(e) => setMotifVal(e.target.value)}
                            disabled={conformeVal === 'CONFORME'}
                          >
                            <option value='-'>- Aucun motif (Dossier conforme) -</option>
                            <option value='NEP'>NEP - Dossier incomplet / Pièces justificatives manquantes</option>
                            <option value='NENA'>NENA - Niveau académique insuffisant</option>
                            <option value='NEA'>NEA - Dépassement de la limite d'âge légale</option>
                            <option value='NED'>NED - Diplôme ou spécialité non conforme</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col sm={12}>
                        <Form.Group className='mb-2'>
                          <Form.Label className='fw-bold small text-muted mb-1'>Pièce Manquante ou Défaillante</Form.Label>
                          <Form.Select
                            size='sm'
                            className='fw-bold'
                            value={dossierVal}
                            onChange={(e) => setDossierVal(e.target.value)}
                            disabled={conformeVal === 'CONFORME'}
                          >
                            <option value='-'>- Aucune pièce défaillante -</option>
                            <option value='NEP-CIN'>NEP-CIN : Carte Nationale d'Identité (CNI)</option>
                            <option value='NEP-DIP'>NEP-DIP : Copie du Diplôme officiel</option>
                            <option value='NEP-RN'>NEP-RN : Relevés de notes universitaires</option>
                            <option value='NEP-AR'>NEP-AR : Certificat de résidence</option>
                            <option value='NEP-AT'>NEP-AT : Attestation de travail / Expérience</option>
                            <option value='NEP-AE'>NEP-AE : Attestation d'équivalence</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className='d-flex justify-content-end mt-2'>
                      <Button
                        variant='primary'
                        size='sm'
                        className='fw-bold px-3'
                        disabled={saving}
                        onClick={handleSaveDecision}
                      >
                        <i className='fas fa-save me-1'></i> Enregistrer la Décision
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>

            {/* COLONNE DROITE (50%) : VISUALISEUR PDF / DOCUMENTS EN DIRECT */}
            <Col lg={6} className='d-flex flex-column h-100 ps-2 pe-0'>
              <div className='d-flex flex-column h-100 bg-white border rounded shadow-sm p-3'>
                {/* Barre de sélection rapide des documents */}
                <div className='d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 pb-2 border-bottom'>
                  <span className='fw-bold small text-dark d-flex align-items-center gap-1'>
                    <i className='fas fa-file-pdf text-danger'></i> Pièce affichée :
                  </span>

                  <div className='d-flex flex-wrap gap-1'>
                    {docsList.map((doc) => {
                      const hasFile = !!doc.url;
                      const isSelected = selectedDocKey === doc.key;
                      return (
                        <Button
                          key={doc.key}
                          variant={isSelected ? 'primary' : hasFile ? 'outline-primary' : 'outline-secondary'}
                          size='sm'
                          className={`d-flex align-items-center gap-1 py-1 px-2 ${isSelected ? 'fw-bold shadow-sm' : ''}`}
                          style={{ fontSize: '12px' }}
                          onClick={() => setSelectedDocKey(doc.key)}
                        >
                          <i className={`fas ${doc.icon}`}></i>
                          <span>{doc.label}</span>
                          {hasFile ? (
                            <span className='badge bg-success rounded-pill ms-1' style={{ fontSize: '9px' }}>✓</span>
                          ) : (
                            <span className='badge bg-light text-muted rounded-pill ms-1' style={{ fontSize: '9px' }}>-</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Prévisualisation intégrée DocumentViewer HD */}
                <div className='flex-grow-1' style={{ minHeight: 0 }}>
                  <DocumentViewer
                    url={currentDoc.url}
                    title={currentDoc.label}
                    height='calc(100vh - 290px)'
                    showActions={true}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* FOOTER FIXE AVEC ACTIONS RAPIDES EN 1 CLIC */}
        <div className='p-3 bg-white border-top shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-2'>
          <div className='d-flex align-items-center gap-2'>
            <span className='small text-muted fw-bold'>
              Statut actuel :
            </span>
            {conformeVal === 'CONFORME' ? (
              <Badge bg='success' className='px-2 py-1 fs-6'>Conforme</Badge>
            ) : (
              <Badge bg='danger' className='px-2 py-1 fs-6'>Non Conforme ({motifVal})</Badge>
            )}
          </div>

          <div className='d-flex align-items-center gap-2'>
            <Button
              variant='outline-danger'
              size='sm'
              className='fw-bold px-3 py-2'
              disabled={saving}
              onClick={() => {
                handleConformeChange('NON CONFORME');
                const el = document.getElementById('arbitrage-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <i className='fas fa-times-circle me-1'></i> Rejeter Dossier
            </Button>

            <Button
              variant='success'
              className='fw-bold px-4 py-2 shadow-sm'
              disabled={saving}
              onClick={handleQuickValidate}
            >
              {saving ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2'></span>
                  Validation en cours...
                </>
              ) : (
                <>
                  <i className='fas fa-check-circle me-1'></i>
                  {controlLevel === 1
                    ? 'Valider & Vers Contrôle 2'
                    : controlLevel === 2
                    ? 'Valider & Vers Commission (C3)'
                    : 'Validation Finale Shortlist'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ControleurDrawer;
