import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Button, Form, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import Message from '../../components/Message';
import { getCandidatureDetails } from '../../actions/candidatureActions';
import Header from '../../components/Header';
import moment from 'moment';
import Calendar from '../../components/Calendar';
import FormContainer from '../../components/FormContainer';
import Heading from '../../components/Heading';
import PostulationSteps from '../../components/PostulationSteps';
import { pdfjs } from 'react-pdf';
import ControleurSideBar from '../../components/ControleurSideBar';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import { getFileUrl } from '../../utils/fileUrl';
import DocumentViewer from '../../components/DocumentViewer';

const CandidaturesInformationsScreen = () => {
  moment.locale('fr');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const [civilite, setCivilite] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [nationalite, setNationalite] = useState('');
  const [phone, setPhone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [cni, setCni] = useState('');
  const [copieCNI, setCopieCNI] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rerunLoading, setRerunLoading] = useState(false);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const candidatureDetails = useSelector((state) => state.candidatureDetails);
  const {
    loading: loadingCandidature,
    error: errorCandidature,
    candidature,
  } = candidatureDetails;

  const handleRerunAI = async () => {
    try {
      setRerunLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(`/api/candidatures/${params.id}/ai-audit`, {}, config);
      dispatch(getCandidatureDetails(params.id));
    } catch (err) {
      alert("Erreur lors de la réévaluation de l'audit IA");
    } finally {
      setRerunLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo && !userInfo.isController) {
      navigate('/login');
    } else {
      if (!candidature || !candidature.niveauEtude || String(candidature._id) !== String(params.id)) {
        dispatch(getCandidatureDetails(params.id));
      } else if (candidature.user) {
        setCivilite(candidature.user.civilite || '');
        setPrenom(candidature.user.prenom || '');
        setNom(candidature.user.nom || '');
        setDateNaissance(
          candidature.user.dateNaissance
            ? moment(candidature.user.dateNaissance, 'DD.MM.YYYY')
            : ''
        );
        setLieuNaissance(candidature.user.lieuNaissance || '');
        setVille(candidature.user.ville || '');
        setEmail(candidature.user.email || '');
        setCni(candidature.user.cni || '');
        setCopieCNI(candidature.user.copieCNI || '');
        setNationalite(candidature.user.nationalite || '');
        setPhone(candidature.user.phone || '');
        setAdresse(candidature.user.adresse || '');
      }
    }
  }, [userInfo, navigate, dispatch, params.id, candidature]);

  const submitHandler = (e) => {
    e.preventDefault();
    navigate(`/controlleurs/candidatures/diplomes/${params.id}`);
  };

  return (
    <>
      <div id='root'>
        <div className='app'>
          <ControleurSideBar prenom={userInfo.prenom} nom={userInfo.nom} />
          <main>
            {userInfo?.isMaitreOuvrage && (
              <div className='bg-primary text-white px-4 py-2 d-flex justify-content-between align-items-center shadow-sm'>
                <div className='d-flex align-items-center gap-2'>
                  <i className='fas fa-building text-warning fs-5'></i>
                  <span className='fw-bold'>Espace Recruteur RH — {userInfo.entrepriseNom || 'Entreprise'}</span>
                </div>
                <button
                  type='button'
                  className='btn btn-warning btn-sm fw-bold text-dark'
                  onClick={() => navigate('/maitre-ouvrage/candidatures')}
                >
                  <i className='fas fa-arrow-left me-1'></i> Retour au Tableau de bord RH
                </button>
              </div>
            )}
            {candidature && candidature.user && String(candidature._id) === String(params.id) && (
              <HeaderAdministrateur
                headerTitle={`Informations personnelles de ${candidature.user.prenom} ${candidature.user.nom}`}
              />
            )}

            {/* BANDEAU AUDIT IA NIVEAU 1 */}
            {candidature?.auditAI && String(candidature._id) === String(params.id) && (
              <div
                className={`mx-4 mt-3 p-3 rounded-3 shadow-sm border ${
                  candidature.statutAI === 'VALIDE_IA'
                    ? 'bg-light border-success'
                    : candidature.statutAI === 'ANOMALIE_IA'
                    ? 'bg-light border-warning'
                    : 'bg-light border-danger'
                }`}
                style={{ borderLeftWidth: '6px' }}
              >
                <div className='d-flex flex-wrap justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center gap-2'>
                    <i
                      className={`fas ${
                        candidature.statutAI === 'VALIDE_IA'
                          ? 'fa-check-circle text-success'
                          : candidature.statutAI === 'ANOMALIE_IA'
                          ? 'fa-exclamation-triangle text-warning'
                          : 'fa-times-circle text-danger'
                      } fs-4`}
                    ></i>
                    <div>
                      <h6 className='fw-bold mb-0'>
                        <i className='fas fa-robot me-1 text-primary'></i>
                        Rapport d'Audit Automatisé IA (Contrôle Niveau 1)
                      </h6>
                      <span className='small text-muted'>
                        Audité le :{' '}
                        {candidature.auditAI.dateAudit
                          ? moment(candidature.auditAI.dateAudit).format('LLL')
                          : 'Récemment'}
                      </span>
                    </div>
                  </div>
                  <div className='d-flex align-items-center gap-2 mt-2 mt-md-0'>
                    <span
                      className={`badge ${
                        candidature.statutAI === 'VALIDE_IA'
                          ? 'bg-success'
                          : candidature.statutAI === 'ANOMALIE_IA'
                          ? 'bg-warning text-dark'
                          : 'bg-danger'
                      } fs-6 px-3 py-2`}
                    >
                      {candidature.statutAI === 'VALIDE_IA'
                        ? '🟢 Conforme IA'
                        : candidature.statutAI === 'ANOMALIE_IA'
                        ? '🟠 Anomalie Détectée'
                        : '🔴 Rejeté IA'}
                    </span>
                    <span className='badge bg-dark text-white fs-6 px-3 py-2'>
                      Score Confiance : {Math.max(0, Math.min(100, Math.round(Number(candidature.auditAI.scoreConfiance) || 0)))}%
                    </span>
                    <Button
                      variant='outline-primary'
                      size='sm'
                      className='fw-bold'
                      disabled={rerunLoading}
                      onClick={handleRerunAI}
                    >
                      {rerunLoading ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-1'></span>
                          Scan...
                        </>
                      ) : (
                        <>
                          <i className='fas fa-sync me-1'></i> Re-scanner
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className='fw-semibold text-secondary mb-2'>
                  {candidature.auditAI.summary}
                </div>

                {candidature.auditAI.anomalies?.length > 0 && (
                  <div className='p-2 bg-white rounded border'>
                    <div className='fw-bold text-danger small mb-1'>
                      <i className='fas fa-flag me-1'></i> Anomalies détectées par l'IA :
                    </div>
                    <ul className='mb-0 ps-3 small'>
                      {candidature.auditAI.anomalies.map((anom, idx) => (
                        <li key={idx} className='text-danger fw-bold'>
                          {anom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {loadingCandidature || !candidature || String(candidature._id) !== String(params.id) ? (
              <Spinner />
            ) : errorCandidature ? (
              <Message variant='danger'>{errorCandidature}</Message>
            ) : (
              <FormContainer>
                <Row onSubmit={submitHandler}>
                  <Col md={6}>
                    {candidature && candidature.user && (
                      <h5 className='text-center my-4'>
                        Informations du candidat {candidature.user.prenom}{' '}
                        {candidature.user.nom}
                      </h5>
                    )}
                    <Form>
                      <>
                        <Row>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='far fa-user'></i> Prenom :
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='text'
                                placeholder='Prenom'
                                style={{ borderRadius: '0' }}
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                              ></Form.Control>
                            </InputGroup>
                          </Col>{' '}
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='far fa-user'></i> Nom :
                            </Form.Label>
                            <InputGroup className='mb-3 '>
                              <Form.Control
                                type='text'
                                placeholder='Nom'
                                style={{ borderRadius: '0' }}
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                              ></Form.Control>
                            </InputGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-venus-mars'></i> Civilite :
                            </Form.Label>
                            <InputGroup className='mb-3 '>
                              <Form.Control
                                as='select'
                                placeholder='Civilite'
                                style={{ borderRadius: '0' }}
                                value={civilite}
                                onChange={(e) => setCivilite(e.target.value)}
                              >
                                <option value=''>Vous etes un(e)...</option>
                                <option value='Madame'>1- Madame</option>
                                <option value='Monsieur'>2- Monsieur</option>
                              </Form.Control>
                            </InputGroup>
                          </Col>{' '}
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-globe-africa'></i>{' '}
                              Nationalite :
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                as='select'
                                placeholder='Nationalite'
                                style={{ borderRadius: '0' }}
                                value={nationalite}
                                onChange={(e) => setNationalite(e.target.value)}
                              >
                                <option value=''>
                                  Selectionnez votre nationalite...
                                </option>
                                <option value='Marocaine'>Marocaine</option>
                                <option value='Autre'>Autre...</option>
                              </Form.Control>
                            </InputGroup>{' '}
                          </Col>
                        </Row>

                        <Row>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='far fa-calendar'></i> Date de naissance :
                              {candidature?.auditAI?.verifications?.age?.status === 'REJECT' && (
                                <span className='badge bg-danger ms-2 small'>
                                  ⚠️ {candidature.auditAI.verifications.age.message}
                                </span>
                              )}
                              {candidature?.auditAI?.verifications?.age?.status === 'WARNING' && (
                                <span className='badge bg-warning text-dark ms-2 small'>
                                  ⚠️ {candidature.auditAI.verifications.age.message}
                                </span>
                              )}
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Calendar
                                className='form-control'
                                value={dateNaissance}
                                onChange={(dateNaissance) =>
                                   setDateNaissance(dateNaissance)
                                }
                                date={'Date de Naissance'}
                              />
                            </InputGroup>
                          </Col>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-globe-africa'></i> Lieu de
                              naissance :
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='text'
                                placeholder='Lieu de Naissance'
                                style={{ borderRadius: '0' }}
                                value={lieuNaissance}
                                onChange={(e) =>
                                  setLieuNaissance(e.target.value)
                                }
                              ></Form.Control>
                            </InputGroup>{' '}
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-phone-square-alt'></i>{' '}
                              Telephone :
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='text'
                                placeholder='Numero de telephone'
                                style={{ borderRadius: '0' }}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                              ></Form.Control>
                            </InputGroup>
                          </Col>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-address-card'></i> Numero CNI :
                              {candidature?.auditAI?.verifications?.cni?.status &&
                                candidature.auditAI.verifications.cni.status !== 'VALID' && (
                                  <span className='badge bg-warning text-dark ms-2 small'>
                                    ⚠️ {candidature.auditAI.verifications.cni.message}
                                  </span>
                                )}
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='text'
                                placeholder='CNI'
                                style={{ borderRadius: '0' }}
                                value={cni}
                                onChange={(e) => setCni(e.target.value)}
                              ></Form.Control>
                            </InputGroup>
                          </Col>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-envelope'></i> Email :
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='text'
                                placeholder='Email'
                                style={{ borderRadius: '0' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              ></Form.Control>
                            </InputGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-map-marker-alt'></i> Adresse :
                              {candidature?.auditAI?.verifications?.adresse?.status &&
                                candidature.auditAI.verifications.adresse.status !== 'VALID' && (
                                  <span className='badge bg-warning text-dark ms-2 small'>
                                    ⚠️ {candidature.auditAI.verifications.adresse.message}
                                  </span>
                                )}
                              {candidature?.auditAI?.verifications?.adresseDoc?.status &&
                                candidature.auditAI.verifications.adresseDoc.status !== 'VALID' && (
                                  <span className='badge bg-warning text-dark ms-2 small'>
                                    ⚠️ {candidature.auditAI.verifications.adresseDoc.message}
                                  </span>
                                )}
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='text'
                                placeholder='Adresse'
                                style={{ borderRadius: '0' }}
                                value={adresse}
                                onChange={(e) => setAdresse(e.target.value)}
                              ></Form.Control>
                            </InputGroup>
                          </Col>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-map-marker-alt'></i> Ville :
                              {candidature?.auditAI?.verifications?.adresseDoc?.status === 'VALID' ? (
                                <span className='badge bg-success ms-2 small'>
                                  <i className='fas fa-check me-1'></i>Vérifiée dans CNI
                                </span>
                              ) : candidature?.auditAI?.verifications?.adresseDoc?.status === 'WARNING' ? (
                                <span className='badge bg-warning text-dark ms-2 small'>
                                  ⚠️ Non attestée dans CNI
                                </span>
                              ) : null}
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='text'
                                placeholder='Ville'
                                style={{ borderRadius: '0' }}
                                value={ville}
                                onChange={(e) => setVille(e.target.value)}
                              ></Form.Control>
                            </InputGroup>
                          </Col>
                        </Row>
                        <div className='text-end gap-2 mb-3'>
                          <Button
                            type='submit'
                            variant='btn btn-outline-warning mb-4'
                          >
                            <i className='fas fa-sign-in-alt fa-lg'></i>{' '}
                            Continuer
                          </Button>
                        </div>
                      </>
                    </Form>
                  </Col>
                  <Col md={6}>
                    <div className='my-3'>
                      <DocumentViewer
                        url={copieCNI}
                        title="Carte Nationale d'Identité (CNIE)"
                        height='650px'
                      />
                    </div>
                  </Col>
                </Row>
              </FormContainer>
            )}
          </main>
        </div>
      </div>
      ;
    </>
  );
};

export default CandidaturesInformationsScreen;
