import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import {
  listControllerCandidatures,
  updateCandidature,
  getCandidatureDetails,
} from '../../actions/candidatureActions';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import { Col, Container, Row, Button, Form, Card, Badge } from 'react-bootstrap';
import moment from 'moment';
import Message from '../../components/Message';
import Spinner from '../../components/Spinner';
import ControleurSideBar from '../../components/ControleurSideBar';
import { useToasts } from 'react-toast-notifications';
import { CANDIDATURE_UPDATE_RESET } from '../../constants/candidatureConstants';

const CandidatureVlidationScreen = () => {
  moment.locale('fr');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const [open, setOpen] = useState(false);
  const { addToast } = useToasts();

  const ID = params.id;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const candidaturesListController = useSelector(
    (state) => state.candidaturesListController
  );
  const {
    candidatures: candidatures1,
    loading: loadingCandidatures1,
    error: errorCandidatures1,
  } = candidaturesListController;

  const candidatureUpdate = useSelector((state) => state.candidatureUpdate);
  const {
    success: successUpdate,
    loading: loadingUpdate,
    error: errorUpdate,
  } = candidatureUpdate;

  const candidatureDetails = useSelector(
    (state) => state.candidatureDetails || {}
  );
  const {
    candidature,
    loading: loadingDetails,
    error: errorDetails,
  } = candidatureDetails;

  useEffect(() => {
    if (userInfo && userInfo.isController) {
      dispatch(listControllerCandidatures());
      if (ID) {
        dispatch(getCandidatureDetails(ID));
      }
    } else {
      navigate('/login');
    }

    if (successUpdate) {
      addToast('Modification effectuée avec succès', {
        appearance: 'success',
        autoDismiss: true,
      });
      if (ID) {
        dispatch(getCandidatureDetails(ID));
      }
      dispatch(listControllerCandidatures());
      dispatch({ type: CANDIDATURE_UPDATE_RESET });
    }
  }, [userInfo, dispatch, addToast, successUpdate, navigate, ID]);

  const handleValidateAndTransmitToControl2 = () => {
    if (!postulationTarget || !postulationTarget._id) return;
    const targetName = `${postulationTarget.user?.prenom || postulationTarget.prenom || ''} ${postulationTarget.user?.nom || postulationTarget.nom || ''}`.trim();
    if (!window.confirm(`Confirmer la validation manuelle et la transmission du dossier de ${targetName} vers le Contrôle 2 ?`)) {
      return;
    }
    const controllerName = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim();
    dispatch(
      updateCandidature(postulationTarget._id, {
        isControl1: true,
        conforme: 'CONFORME',
        eligibilite: 'ELIGIBLE',
        controle1: `Validé manuellement par ${controllerName} (Contrôle 1 certifié)`,
      })
    );
  };

  const handleValidateAndTransmitToControl3 = () => {
    if (!postulationTarget || !postulationTarget._id) return;
    const targetName = `${postulationTarget.user?.prenom || postulationTarget.prenom || ''} ${postulationTarget.user?.nom || postulationTarget.nom || ''}`.trim();
    if (!window.confirm(`Confirmer la transmission individuelle du dossier de ${targetName} vers le Contrôle 3 (Commission EHC) ?`)) {
      return;
    }
    const controllerName = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim();
    dispatch(
      updateCandidature(postulationTarget._id, {
        isControl2: true,
        conforme: 'CONFORME',
        eligibilite: 'ELIGIBLE',
        controle2: `Validé Niveau 2 par ${controllerName} (Transmis individuellement à Contrôle 3)`,
      })
    );
  };

  const postulationTarget =
    (candidatures1 && candidatures1.find((c) => String(c._id) === String(ID))) ||
    candidature;

  const [conformeVal, setConformeVal] = useState('CONFORME');
  const [eligibiliteVal, setEligibiliteVal] = useState('ELIGIBLE');
  const [motifVal, setMotifVal] = useState('-');
  const [dossierVal, setDossierVal] = useState('-');

  useEffect(() => {
    if (postulationTarget && postulationTarget._id) {
      setConformeVal(postulationTarget.conforme || 'CONFORME');
      setEligibiliteVal(postulationTarget.eligibilite || 'ELIGIBLE');
      setMotifVal(postulationTarget.motif || '-');
      setDossierVal(postulationTarget.dossier || '-');
    }
  }, [postulationTarget]);

  const handleConformeChange = (val) => {
    setConformeVal(val);
    if (val === 'CONFORME') {
      setEligibiliteVal('ELIGIBLE');
      setMotifVal('-');
      setDossierVal('-');
    } else {
      setEligibiliteVal('NON ELIGIBLE');
      if (motifVal === '-') {
        setMotifVal('NEP');
      }
    }
  };

  const handleSaveDecision = () => {
    if (!postulationTarget || !postulationTarget._id) return;
    const controllerName = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim();
    const payload = {
      conforme: conformeVal,
      eligibilite: eligibiliteVal,
      motif: motifVal !== '-' ? motifVal : undefined,
      dossier: dossierVal !== '-' ? dossierVal : undefined,
      controle1: `Arbitrage par ${controllerName} (${conformeVal} / ${eligibiliteVal})`,
    };
    dispatch(updateCandidature(postulationTarget._id, payload));
    addToast('Décision officielle enregistrée avec succès !', {
      appearance: 'success',
      autoDismiss: true,
    });
  };

  return (
    <div id='root'>
      <div className='app'>
        <ControleurSideBar prenom={userInfo.prenom} nom={userInfo.nom} />
        <main>
          <HeaderAdministrateur
            headerTitle="Validation & Arbitrage du Candidat (Contrôle d'Éligibilité)"
            endPoint='/admin'
          />
          <Container className='mb-4 mt-4'>
            {loadingUpdate && <Spinner size={150} />}
            {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

            {/* BANDEAU RECAPITULATIF DU CANDIDAT & ACTIONS DE PIPELINE */}
            {postulationTarget && postulationTarget._id && (
              <div className='p-3 mb-4 rounded-3 border bg-light shadow-sm d-flex flex-wrap justify-content-between align-items-center'>
                <div>
                  <h5 className='fw-bold text-primary mb-1'>
                    <i className='fas fa-clipboard-check me-2'></i>
                    Fiche Candidat : {postulationTarget.user?.prenom || postulationTarget.prenom} {postulationTarget.user?.nom || postulationTarget.nom}
                  </h5>
                  <div className='text-muted small'>
                    Poste : <b>{postulationTarget.poste || postulationTarget.offre?.titre || 'Guichetier'}</b> | CNI : <b>{postulationTarget.user?.cni || postulationTarget.cni}</b> | Statut IA :{' '}
                    <span className={`badge ${postulationTarget.statutAI === 'VALIDE_IA' ? 'bg-success' : 'bg-danger'} ms-1`}>
                      {postulationTarget.statutAI || 'VALIDE_IA'}
                    </span>
                  </div>
                </div>
                <div className='d-flex align-items-center gap-2 mt-2 mt-md-0'>
                  {postulationTarget.isControl2 ? (
                    <span className='badge bg-success fs-6 px-3 py-2'>
                      <i className='fas fa-award me-1'></i> Validé & Transmis à Contrôle 3
                    </span>
                  ) : postulationTarget.isControl1 ? (
                    <>
                      <Button
                        variant='success'
                        size='sm'
                        className='fw-bold shadow-sm'
                        onClick={handleValidateAndTransmitToControl3}
                      >
                        <i className='fas fa-paper-plane me-1'></i> Transmettre ce dossier seul à Contrôle 3
                      </Button>
                      <span className='badge bg-info text-dark fs-6 px-3 py-2'>
                        <i className='fas fa-check me-1'></i> En Contrôle 2
                      </span>
                    </>
                  ) : (
                    <>
                      <Button
                        variant='success'
                        size='sm'
                        className='fw-bold shadow-sm'
                        onClick={handleValidateAndTransmitToControl2}
                      >
                        <i className='fas fa-check-circle me-1'></i> Valider & Transmettre à Contrôle 2
                      </Button>
                      <span className='badge bg-warning text-dark fs-6 px-3 py-2'>
                        <i className='fas fa-clock me-1'></i> En Attente
                      </span>
                    </>
                  )}
                  <Button
                    variant='outline-secondary'
                    size='sm'
                    className='fw-bold'
                    onClick={() => navigate('/controlleurs/candidatures/control2')}
                  >
                    <i className='fas fa-arrow-left me-1'></i> Contrôle 2
                  </Button>
                  <Button
                    variant='outline-primary'
                    size='sm'
                    className='fw-bold'
                    onClick={() => navigate('/controlleurs/candidatures/control1')}
                  >
                    <i className='fas fa-arrow-left me-1'></i> Contrôle 1
                  </Button>
                </div>
              </div>
            )}

            {loadingCandidatures1 && loadingDetails ? (
              <Spinner size={150} />
            ) : errorCandidatures1 && errorDetails ? (
              <Message variant='danger'>{errorCandidatures1 || errorDetails}</Message>
            ) : postulationTarget && postulationTarget._id ? (
              <>
                {/* 1. FORMULAIRE D'ARBITRAGE ET DE DÉCISION OFFICIELLE */}
                <Card className='shadow-sm border-0 mb-4'>
                  <Card.Header className='bg-primary text-white py-3 d-flex justify-content-between align-items-center'>
                    <h5 className='mb-0 fw-bold'>
                      <i className='fas fa-gavel me-2'></i> Formulaire d'Arbitrage et de Décision Officielle
                    </h5>
                    <Badge bg='light' text='dark' className='fs-6'>
                      Dossier ID : {postulationTarget._id?.substring(0, 8)}...
                    </Badge>
                  </Card.Header>
                  <Card.Body className='p-4'>
                    <Row className='g-4'>
                      <Col md={6}>
                        <div className='p-3 bg-light rounded border h-100'>
                          <h6 className='fw-bold text-dark border-bottom pb-2 mb-3'>
                            <i className='fas fa-clipboard-check text-success me-2'></i> 1. Statut de Conformité & Éligibilité
                          </h6>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fw-bold small text-muted'>Candidature Conforme ?</Form.Label>
                            <Form.Select
                              size='lg'
                              className={`fw-bold ${conformeVal === 'CONFORME' ? 'text-success border-success' : 'text-danger border-danger'}`}
                              value={conformeVal}
                              onChange={(e) => handleConformeChange(e.target.value)}
                            >
                              <option value='CONFORME'>✓ CONFORME</option>
                              <option value='NON CONFORME'>✗ NON CONFORME (Rejet)</option>
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className='mb-3'>
                            <Form.Label className='fw-bold small text-muted'>Éligibilité du Candidat</Form.Label>
                            <Form.Select
                              className='fw-bold'
                              value={eligibiliteVal}
                              onChange={(e) => setEligibiliteVal(e.target.value)}
                            >
                              <option value='ELIGIBLE'>ÉLIGIBLE</option>
                              <option value='NON ELIGIBLE'>NON ÉLIGIBLE</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className='p-3 bg-light rounded border h-100'>
                          <h6 className='fw-bold text-dark border-bottom pb-2 mb-3'>
                            <i className='fas fa-exclamation-circle text-danger me-2'></i> 2. Preuves & Motifs Légaux (En cas de Rejet)
                          </h6>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fw-bold small text-muted'>Motif Officiel de Rejet</Form.Label>
                            <Form.Select
                              className='fw-bold'
                              value={motifVal}
                              onChange={(e) => setMotifVal(e.target.value)}
                              disabled={conformeVal === 'CONFORME'}
                            >
                              <option value='-'>- Aucun motif (Dossier conforme) -</option>
                              <option value='NEP'>NEP - Dossier incomplet / Pièces manquantes</option>
                              <option value='NENA'>NENA - Niveau académique insuffisant</option>
                              <option value='NEA'>NEA - Dépassement de la limite d'âge légale</option>
                              <option value='NED'>NED - Diplôme ou spécialité non conforme</option>
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className='mb-3'>
                            <Form.Label className='fw-bold small text-muted'>Pièce Manquante ou Défaillante</Form.Label>
                            <Form.Select
                              className='fw-bold'
                              value={dossierVal}
                              onChange={(e) => setDossierVal(e.target.value)}
                              disabled={conformeVal === 'CONFORME'}
                            >
                              <option value='-'>- Aucune pièce manquante -</option>
                              <option value='NEP-CIN'>NEP-CIN : Carte Nationale d'Identité (CNI/CNIE)</option>
                              <option value='NEP-DIP'>NEP-DIP : Copie du Diplôme officiel</option>
                              <option value='NEP-RN'>NEP-RN : Relevés de notes universitaires</option>
                              <option value='NEP-AR'>NEP-AR : Attestation de résidence</option>
                              <option value='NEP-AT'>NEP-AT : Attestation de travail / Expérience</option>
                              <option value='NEP-AE'>NEP-AE : Attestation d'équivalence</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>

                    <div className='d-flex justify-content-end align-items-center gap-3 mt-4 pt-3 border-top'>
                      <Button
                        variant='primary'
                        size='lg'
                        className='fw-bold px-4 shadow-sm'
                        onClick={handleSaveDecision}
                      >
                        <i className='fas fa-save me-2'></i> Enregistrer la Décision Officielle
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* 2. PIÈCES JUSTIFICATIVES NUMÉRISÉES ET DONNÉES DU CANDIDAT */}
                <Row className='g-4'>
                  <Col md={6}>
                    <Card className='shadow-sm border-0 h-100'>
                      <Card.Header className='bg-dark text-white fw-bold'>
                        <i className='fas fa-folder-open me-2 text-warning'></i> Pièces Justificatives Téléversées
                      </Card.Header>
                      <Card.Body className='p-3'>
                        <div className='list-group list-group-flush'>
                          <div className='list-group-item d-flex justify-content-between align-items-center px-0'>
                            <div>
                              <i className='fas fa-id-card text-primary me-2'></i>
                              <strong>Carte Nationale d'Identité (CNI) :</strong>
                            </div>
                            {postulationTarget.copieCNI || postulationTarget.user?.copieCNI ? (
                              <a
                                href={postulationTarget.copieCNI || postulationTarget.user?.copieCNI}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='btn btn-outline-primary btn-sm fw-bold'
                              >
                                <i className='fas fa-external-link-alt me-1'></i> Voir CNI
                              </a>
                            ) : (
                              <Badge bg='danger'>Non Fournie</Badge>
                            )}
                          </div>

                          <div className='list-group-item d-flex justify-content-between align-items-center px-0'>
                            <div>
                              <i className='fas fa-graduation-cap text-success me-2'></i>
                              <strong>Diplôme Certifié :</strong>
                            </div>
                            {postulationTarget.copieDiplomes ? (
                              <a
                                href={postulationTarget.copieDiplomes}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='btn btn-outline-success btn-sm fw-bold'
                              >
                                <i className='fas fa-external-link-alt me-1'></i> Voir Diplôme
                              </a>
                            ) : (
                              <Badge bg='danger'>Non Fourni</Badge>
                            )}
                          </div>

                          <div className='list-group-item d-flex justify-content-between align-items-center px-0'>
                            <div>
                              <i className='fas fa-file-alt text-info me-2'></i>
                              <strong>Relevés de Notes :</strong>
                            </div>
                            {postulationTarget.releves ? (
                              <a
                                href={postulationTarget.releves}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='btn btn-outline-info btn-sm fw-bold'
                              >
                                <i className='fas fa-external-link-alt me-1'></i> Voir Relevés
                              </a>
                            ) : (
                              <Badge bg='danger'>Non Fournis</Badge>
                            )}
                          </div>

                          <div className='list-group-item d-flex justify-content-between align-items-center px-0'>
                            <div>
                              <i className='fas fa-briefcase text-secondary me-2'></i>
                              <strong>Attestations de Travail :</strong>
                            </div>
                            {postulationTarget.attestationsTravail ? (
                              <a
                                href={postulationTarget.attestationsTravail}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='btn btn-outline-secondary btn-sm fw-bold'
                              >
                                <i className='fas fa-external-link-alt me-1'></i> Voir Attestation
                              </a>
                            ) : (
                              <Badge bg='secondary'>Facultatif</Badge>
                            )}
                          </div>
                        </div>

                        <div className='mt-3 text-center'>
                          <Button
                            variant='outline-dark'
                            size='sm'
                            className='w-100 fw-bold'
                            onClick={() => navigate(`/controlleurs/candidatures/informations/${postulationTarget._id}`)}
                          >
                            <i className='fas fa-search-plus me-1'></i> Ouvrir la Visionneuse Complète HD (DocumentViewer)
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className='shadow-sm border-0 h-100'>
                      <Card.Header className='bg-dark text-white fw-bold'>
                        <i className='fas fa-user-circle me-2 text-info'></i> Données Déclarées du Candidat
                      </Card.Header>
                      <Card.Body className='p-3'>
                        <div className='row g-2 small'>
                          <div className='col-6'>
                            <span className='text-muted d-block'>Nom & Prénom :</span>
                            <strong className='text-primary'>{postulationTarget.user?.prenom || postulationTarget.prenom} {postulationTarget.user?.nom || postulationTarget.nom}</strong>
                          </div>
                          <div className='col-6'>
                            <span className='text-muted d-block'>Numéro CNI :</span>
                            <strong>{postulationTarget.user?.cni || postulationTarget.cni || '-'}</strong>
                          </div>
                          <div className='col-6'>
                            <span className='text-muted d-block'>Date de Naissance :</span>
                            <strong>{postulationTarget.user?.dateNaissance || postulationTarget.dateNaissance || '-'}</strong>
                          </div>
                          <div className='col-6'>
                            <span className='text-muted d-block'>Ville de Résidence :</span>
                            <strong>{postulationTarget.user?.ville || postulationTarget.ville || '-'}</strong>
                          </div>
                          <div className='col-6'>
                            <span className='text-muted d-block'>Niveau Académique :</span>
                            <strong>{postulationTarget.niveauEtude || '-'}</strong>
                          </div>
                          <div className='col-6'>
                            <span className='text-muted d-block'>Diplôme :</span>
                            <strong>{postulationTarget.diplome || '-'}</strong>
                          </div>
                          <div className='col-12 mt-2 pt-2 border-top'>
                            <span className='text-muted d-block'>Score au Barème Officiel :</span>
                            <Badge bg='warning' text='dark' className='fs-6 px-3 py-1'>
                              Total : {Number(postulationTarget.scoreTotal || 0).toFixed(2)} pts
                            </Badge>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : null}
          </Container>
        </main>
      </div>
    </div>
  );
};

export default CandidatureVlidationScreen;
