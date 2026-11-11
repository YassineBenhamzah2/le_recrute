import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Button, Form, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
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

const CandidaturesInformationsScreen = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
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

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const candidatureDetails = useSelector((state) => state.candidatureDetails);
  const {
    loading: loadingCandidature,
    error: errorCandidature,
    candidature,
  } = candidatureDetails;

  useEffect(() => {
    if (!userInfo && !userInfo.isController) {
      navigate('/login');
    } else {
      if (!candidature || !candidature.niveauEtude) {
        dispatch(getCandidatureDetails(params.id));
      } else {
        setCivilite(candidature.user.civilite);
        setPrenom(candidature.user.prenom);
        setNom(candidature.user.nom);
        setDateNaissance(moment(candidature.user.dateNaissance, 'DD.MM.YYYY'));
        setLieuNaissance(candidature.user.lieuNaissance);
        setVille(candidature.user.ville);
        setEmail(candidature.user.email);
        setCni(candidature.user.cni);
        setCopieCNI(candidature.user.copieCNI);
        setNationalite(candidature.user.nationalite);
        setPhone(candidature.user.phone);
        setAdresse(candidature.user.adresse);
      }
    }

    // navigate(`/controlleurs/candidatures/diplomes/${params.id}`);
  }, [userInfo, navigate, dispatch, params, candidature]);

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
            {candidature && candidature.user && (
              <HeaderAdministrateur
                headerTitle={`Informations personnelles de ${candidature.user.prenom} ${candidature.user.nom}`}
              />
            )}
            {loadingCandidature ? (
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
                              <i className='far fa-calendar'></i> Date de
                              naissance :
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
                              <i className='fas fa-address-card'></i> Numero CNI
                              :
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
                              <i className='fas fa-map-marker-alt'></i> Adresse
                              :
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
                    <div className='d-flex justify-content-between align-items-center my-3'>
                      <h5 className='m-0 fw-bold'>
                        <i className='fas fa-id-card text-primary me-2'></i>
                        Pièce d'identité du candidat
                      </h5>
                      <a
                        href={getFileUrl(copieCNI)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i className='fas fa-external-link-alt me-1'></i> Plein écran
                      </a>
                    </div>
                    <div style={{ height: '700px', backgroundColor: '#fff', border: '1px solid #ced4da', borderRadius: '4px', overflow: 'hidden' }}>
                      <iframe
                        src={getFileUrl(copieCNI)}
                        title="CNI Candidat"
                        width='100%'
                        height='100%'
                        style={{ border: 'none' }}
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
