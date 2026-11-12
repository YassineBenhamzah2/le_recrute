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
import DocumentViewer from '../../components/DocumentViewer';

const CandidaturesDiplomesScreen = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  moment.locale('fr');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const [niveauEtude, setNiveauEtude] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [specialite2, setSpecialite2] = useState('');
  const [diplome, setDiplome] = useState('');
  const [mention, setMention] = useState('');
  const [dateObtention, setDateObtention] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [methodeNotation, setMethodeNotation] = useState('');
  const [annee1, setAnnee1] = useState('');
  const [annee2, setAnnee2] = useState('');
  const [annee3, setAnnee3] = useState('');
  const [semestre1, setSemestre1] = useState('');
  const [semestre2, setSemestre2] = useState('');
  const [semestre3, setSemestre3] = useState('');
  const [semestre4, setSemestre4] = useState('');
  const [semestre5, setSemestre5] = useState('');
  const [semestre6, setSemestre6] = useState('');
  const [moyenneOFFPT, setMoyenneOFFPT] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('diplomes');

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const candidatureDetails = useSelector((state) => state.candidatureDetails);
  const { candidature } = candidatureDetails;

  useEffect(() => {
    if (!userInfo && !userInfo.isController) {
      navigate('/login');
    } else {
      if (!candidature || !candidature.niveauEtude) {
        dispatch(getCandidatureDetails(params.id));
      } else {
        setNiveauEtude(candidature.niveauEtude);
        setSpecialite(candidature.specialite);
        setSpecialite2(candidature.specialite2);
        setDiplome(candidature.diplome);
        setMention(candidature.mention);
        setDateObtention(candidature.dateObtention);
        setEtablissement(candidature.etablissement);
        setMethodeNotation(candidature.methodeNotation);
        setAnnee1(candidature.annee1);
        setAnnee2(candidature.annee2);
        setAnnee3(candidature.annee3);
        setSemestre1(candidature.semestre1);
        setSemestre2(candidature.semestre2);
        setSemestre3(candidature.semestre3);
        setSemestre4(candidature.semestre4);
        setSemestre5(candidature.semestre5);
        setSemestre6(candidature.semestre6);
        setMoyenneOFFPT(candidature.moyenneOFFPT);
        setMessage(candidature.message);
      }
    }

    // navigate(`/controlleurs/candidatures/diplomes/${params.id}`);
  }, [userInfo, navigate, dispatch, params, candidature]);

  const submitHandler = (e) => {
    e.preventDefault();
    navigate(`/controlleurs/candidatures/experiences/${params.id}`);
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
            {candidature && candidature.user && (
              <HeaderAdministrateur
                headerTitle={`Diplomes de ${candidature.user.prenom} ${candidature.user.nom}`}
              />
            )}
            <FormContainer>
              <Row>
                <Col md={6}>
                  {candidature && candidature.user && (
                    <h5 className='text-center my-4'>
                      Diplomes et releves du candidat {candidature.user.prenom}{' '}
                      {candidature.user.nom}
                    </h5>
                  )}

                  <Form onSubmit={submitHandler}>
                    {message && (
                      <Message variant={'danger'}>
                        <i className='fas fa-exclamation-triangle'></i>{' '}
                        {message}
                      </Message>
                    )}
                    <Row>
                      <Col>
                        <Form.Label className='fw-bold mt-3'>
                          <i className='fas fa-user-graduate'></i> Niveau
                          d'etude :
                        </Form.Label>
                        <InputGroup className='mb-3'>
                          <Form.Control
                            as='select'
                            style={{ borderRadius: '0' }}
                            value={niveauEtude}
                            onChange={(e) => setNiveauEtude(e.target.value)}
                          >
                            <option value=''>
                              Selectioner votre niveau d'etude...
                            </option>
                            <option value='Bac+2'>1- Bac+2</option>
                            <option value='Bac+3'>2- Bac+3</option>
                            <option value='Bac+3 PRO'>3- Bac+3 PRO</option>
                          </Form.Control>
                        </InputGroup>
                      </Col>
                      <Col>
                        <Form.Label className='fw-bold mt-3'>
                          <i className='fas fa-calculator'></i> Specialite :
                        </Form.Label>
                        <InputGroup className='mb-3 '>
                          <Form.Control
                            as='select'
                            placeholder='Specialite'
                            style={{ borderRadius: '0' }}
                            value={specialite}
                            onChange={(e) => setSpecialite(e.target.value)}
                            disabled={specialite === 'Autre' ? true : false}
                          >
                            <option value=''>
                              Selectioner votre specialite...
                            </option>
                            <option value="Gestion d'Entreprises">
                              1- Gestion d'Entreprises{' '}
                            </option>
                            <option value='Economie'>2- Economie</option>
                            <option value='Banque'>3- Banque</option>
                            <option value='Finance'>4- Finance</option>
                            <option value='Comptabilité'>
                              5- Comptabilité
                            </option>
                            <option value='Audit'>6- Audit</option>
                            <option value='Contrôle de Gestion'>
                              7- Contrôle de Gestion
                            </option>
                            <option value='Commerce'>7- Commerce</option>
                            <option value='Marketing'>8- Marketing</option>
                            <option value='Relations clientèle'>
                              9- Relations clientèle
                            </option>
                            <option value='Assurance'>10- Assurance</option>
                            <option value='Communication'>
                              11- Communication
                            </option>
                            <option value='Administration des Affaires'>
                              12- Administration des Affaires
                            </option>
                            <option value='Administration des Entreprises'>
                              13- Administration des Entreprises
                            </option>
                            <option value='Informatique de Gestion ou assimilé'>
                              14- Informatique de Gestion ou assimilé
                            </option>
                            <option value='Autre'>14- Autre</option>
                          </Form.Control>
                        </InputGroup>
                      </Col>
                    </Row>
                    {specialite === 'Autre' && (
                      <Row>
                        <Col>
                          <Form.Label className='fw-bold mt-3'>
                            <i className='fas fa-calculator'></i> Specialite :
                          </Form.Label>
                          <InputGroup className='mb-3 '>
                            <Form.Control
                              type='text'
                              placeholder='Entrer votre specialite Specialite'
                              style={{ borderRadius: '0' }}
                              value={specialite2}
                              onChange={(e) => setSpecialite2(e.target.value)}
                            ></Form.Control>
                          </InputGroup>
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col>
                        <Form.Label className='fw-bold mt-3'>
                          <i className='fas fa-marker'></i> Mention :
                        </Form.Label>
                        <InputGroup className='mb-3'>
                          <Form.Control
                            as='select'
                            placeholder='Mention du diplome'
                            style={{ borderRadius: '0' }}
                            value={mention}
                            onChange={(e) => setMention(e.target.value)}
                          >
                            <option value=''>
                              Selectioner votre mention...
                            </option>
                            <option value='Passable'>1 - Passable</option>
                            <option value='Assez Bien'>2 - Assez Bien</option>
                            <option value='Bien'>3 - Bien</option>
                            <option value='Tres Bien'>4 - Tres Bien</option>
                          </Form.Control>
                        </InputGroup>
                      </Col>{' '}
                      <Col>
                        {' '}
                        <Form.Label className='fw-bold mt-3'>
                          <i className='fas fa-graduation-cap'></i> Diplome :
                        </Form.Label>
                        <InputGroup className='mb-3'>
                          <Form.Control
                            type='text'
                            placeholder='Intitule du diplome'
                            style={{ borderRadius: '0' }}
                            value={diplome}
                            onChange={(e) => setDiplome(e.target.value)}
                            target='_blank'
                            rel='noreferrer'
                          ></Form.Control>
                        </InputGroup>{' '}
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        {' '}
                        <Form.Label className='fw-bold mt-3'>
                          <i className='far fa-calendar'></i> Date d'obtention
                          de diplome :
                        </Form.Label>
                        <InputGroup className='mb-3'>
                          <Calendar
                            className='form-control'
                            value={dateObtention}
                            onChange={(dateObtention) =>
                              setDateObtention(dateObtention)
                            }
                            date={"Date d'obtention de diplome"}
                          />
                        </InputGroup>
                      </Col>
                      <Col>
                        {' '}
                        <Form.Label className='fw-bold mt-3'>
                          <i className='fas fa-school'></i> Etablissement :
                        </Form.Label>{' '}
                        <InputGroup className='mb-3'>
                          <Form.Control
                            type='text'
                            placeholder='Etablissement'
                            style={{ borderRadius: '0' }}
                            value={etablissement}
                            onChange={(e) => setEtablissement(e.target.value)}
                          ></Form.Control>
                        </InputGroup>
                      </Col>
                    </Row>
                    <>
                      <Col>
                        <Form.Label className='fw-bold mt-3'>
                          <i className='fas fa-pencil-alt'></i> Methode de
                          notation :
                        </Form.Label>
                        <InputGroup className='mb-3'>
                          <Form.Control
                            as='select'
                            placeholder='Selectionnez la methode de notation'
                            style={{ borderRadius: '0' }}
                            value={
                              niveauEtude === 'Bac+3 PRO'
                                ? 'Semestres'
                                : methodeNotation
                            }
                            onChange={(e) => setMethodeNotation(e.target.value)}
                            disabled={
                              niveauEtude === 'Bac+3 PRO' ? true : false
                            }
                          >
                            <option value=''>
                              Selectionnez le methode de notation
                            </option>
                            <option value='Annees'>1- Annees</option>
                            <option value='Semestres'>2- Semestres</option>
                            <option value='Moyenne générale (OFPPT)'>
                              3- Moyenne générale (OFPPT)
                            </option>
                          </Form.Control>
                        </InputGroup>
                      </Col>

                      {methodeNotation === 'Annees' &&
                        (niveauEtude === 'Bac+2' ? (
                          <>
                            <Row>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Premiere
                                  annee :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre la premiere annee'
                                    style={{ borderRadius: '0' }}
                                    value={annee1}
                                    onChange={(e) => setAnnee1(e.target.value)}
                                    required
                                  ></Form.Control>
                                </InputGroup>
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Deuxieme
                                  annee :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre la deuxieme annee'
                                    style={{ borderRadius: '0' }}
                                    value={annee2}
                                    onChange={(e) => setAnnee2(e.target.value)}
                                    required
                                  ></Form.Control>
                                </InputGroup>
                              </Col>
                            </Row>
                          </>
                        ) : (
                          <>
                            <Row>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Premiere
                                  annee :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre la premiere annee'
                                    style={{ borderRadius: '0' }}
                                    value={annee1}
                                    onChange={(e) => setAnnee1(e.target.value)}
                                    required
                                  ></Form.Control>
                                </InputGroup>
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Deuxieme
                                  annee :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre la deuxieme annee'
                                    style={{ borderRadius: '0' }}
                                    value={annee2}
                                    onChange={(e) => setAnnee2(e.target.value)}
                                    required
                                  ></Form.Control>
                                </InputGroup>
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> troisieme
                                  annee :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre la troisieme annee'
                                    style={{ borderRadius: '0' }}
                                    value={annee3}
                                    onChange={(e) => setAnnee3(e.target.value)}
                                    required
                                  ></Form.Control>
                                </InputGroup>
                              </Col>
                            </Row>
                          </>
                        ))}
                      {methodeNotation === 'Semestres' &&
                        (niveauEtude === 'Bac+2' ? (
                          <>
                            <Row>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 1
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 1'
                                    style={{ borderRadius: '0' }}
                                    value={semestre1}
                                    onChange={(e) =>
                                      setSemestre1(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 2
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 2'
                                    style={{ borderRadius: '0' }}
                                    value={semestre2}
                                    onChange={(e) =>
                                      setSemestre2(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 3
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 3'
                                    style={{ borderRadius: '0' }}
                                    value={semestre3}
                                    onChange={(e) =>
                                      setSemestre3(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 4
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 4'
                                    style={{ borderRadius: '0' }}
                                    value={semestre4}
                                    onChange={(e) =>
                                      setSemestre4(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                            </Row>
                          </>
                        ) : niveauEtude === 'Bac+3' ? (
                          <>
                            <Row>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 1
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  {/* <NumericInput step={0.1} precision={2} value={50.3} /> */}
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 1'
                                    style={{ borderRadius: '0' }}
                                    maxLength={'1'}
                                    value={semestre1}
                                    onChange={(e) =>
                                      setSemestre1(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 2
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 2'
                                    style={{ borderRadius: '0' }}
                                    value={semestre2}
                                    onChange={(e) =>
                                      setSemestre2(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 3
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 3'
                                    style={{ borderRadius: '0' }}
                                    value={semestre3}
                                    onChange={(e) =>
                                      setSemestre3(e.target.value)
                                    }
                                    Sauvegarder
                                    et
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 4
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 4'
                                    style={{ borderRadius: '0' }}
                                    value={semestre4}
                                    onChange={(e) =>
                                      setSemestre4(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 5
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 5'
                                    style={{ borderRadius: '0' }}
                                    value={semestre5}
                                    onChange={(e) =>
                                      setSemestre5(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 6
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 6'
                                    style={{ borderRadius: '0' }}
                                    value={semestre6}
                                    onChange={(e) =>
                                      setSemestre6(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>
                              </Col>
                            </Row>
                          </>
                        ) : (
                          <>
                            <Row>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 5
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 5'
                                    style={{ borderRadius: '0' }}
                                    value={semestre5}
                                    onChange={(e) =>
                                      setSemestre5(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>{' '}
                              </Col>
                              <Col>
                                <Form.Label className='fw-bold mt-3'>
                                  <i className='fas fa-list-ol'></i> Semestre 6
                                  :
                                </Form.Label>
                                <InputGroup className='mb-3'>
                                  <Form.Control
                                    type='number'
                                    placeholder='Note du Semestre 6'
                                    style={{ borderRadius: '0' }}
                                    value={semestre6}
                                    onChange={(e) =>
                                      setSemestre6(e.target.value)
                                    }
                                    required
                                  ></Form.Control>
                                </InputGroup>
                              </Col>
                            </Row>
                          </>
                        ))}

                      {niveauEtude === 'Bac+3 PRO' && (
                        <Row>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-list-ol'></i> Semestre 5 :
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='number'
                                placeholder='Note du Semestre 5'
                                style={{ borderRadius: '0' }}
                                value={semestre5}
                                onChange={(e) => setSemestre5(e.target.value)}
                                required
                              ></Form.Control>
                            </InputGroup>{' '}
                          </Col>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-list-ol'></i> Semestre 6 :
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='number'
                                placeholder='Note du Semestre 6'
                                style={{ borderRadius: '0' }}
                                value={semestre6}
                                onChange={(e) => setSemestre6(e.target.value)}
                                required
                              ></Form.Control>
                            </InputGroup>
                          </Col>
                        </Row>
                      )}
                      {methodeNotation === 'Moyenne générale (OFPPT)' && (
                        <Row>
                          <Col>
                            <Form.Label className='fw-bold mt-3'>
                              <i className='fas fa-list-ol'></i> Note generale :
                            </Form.Label>
                            <InputGroup className='mb-3'>
                              <Form.Control
                                type='number'
                                placeholder='Moyenne generale'
                                style={{ borderRadius: '0' }}
                                value={moyenneOFFPT}
                                onChange={(e) =>
                                  setMoyenneOFFPT(e.target.value)
                                }
                                required
                              ></Form.Control>
                            </InputGroup>{' '}
                          </Col>
                        </Row>
                      )}
                    </>
                    <div className='text-end gap-2 mb-3'>
                      <Button
                        type='submit'
                        variant='btn btn-outline-warning mb-4'
                      >
                        <i className='fas fa-sign-in-alt fa-lg'></i> Continuer
                      </Button>
                    </div>
                  </Form>
                </Col>
                <Col md={6}>
                  <div className='d-flex justify-content-between align-items-center my-3'>
                    <h5 className='m-0 fw-bold'>
                      <i className='fas fa-graduation-cap text-success me-2'></i>
                      Diplômes et Relevés
                    </h5>
                    {candidature && (
                      <div className='btn-group'>
                        <a
                          href={getFileUrl(candidature.copieDiplomes)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='btn btn-sm btn-outline-primary'
                        >
                          Diplôme ↗
                        </a>
                        <a
                          href={getFileUrl(candidature.releves)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='btn btn-sm btn-outline-secondary'
                        >
                          Relevés ↗
                        </a>
                      </div>
                    )}
                  </div>
                  {candidature && (
                    <div className='border rounded shadow-sm p-2 bg-light'>
                      <div className='btn-group w-100 mb-3' role='group'>
                        <button
                          type='button'
                          className={`btn btn-sm ${(!selectedDoc || selectedDoc === 'diplomes') ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedDoc('diplomes')}
                        >
                          🎓 Copie du Diplôme
                        </button>
                        <button
                          type='button'
                          className={`btn btn-sm ${selectedDoc === 'releves' ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedDoc('releves')}
                        >
                          📊 Relevés de Notes
                        </button>
                      </div>
                      <DocumentViewer
                        url={selectedDoc === 'releves' ? candidature.releves : candidature.copieDiplomes}
                        title={selectedDoc === 'releves' ? "Relevés de Notes Universitaires" : "Copie du Diplôme"}
                        height='650px'
                      />
                    </div>
                  )}
                </Col>
              </Row>
              <br />
            </FormContainer>
          </main>
        </div>
      </div>
      ;
    </>
  );
};

export default CandidaturesDiplomesScreen;
