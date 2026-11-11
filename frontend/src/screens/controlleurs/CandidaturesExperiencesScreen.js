import React, { useEffect, useState } from 'react';
import {
  Col,
  Container,
  Row,
  Button,
  Form,
  InputGroup,
  Table,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import Spinner from '../../components/Spinner';
import Message from '../../components/Message';
import { getCandidatureDetails } from '../../actions/candidatureActions';
import moment from 'moment';
import Calendar from '../../components/Calendar';
import FormContainer from '../../components/FormContainer';
import Heading from '../../components/Heading';
import PostulationSteps from '../../components/PostulationSteps';
import { updateUser, updateUserProfile } from '../../actions/userActions';
import { USER_UPDATE_PROFILE_RESET } from '../../constants/userConstants';
import { Document, Page, pdfjs } from 'react-pdf';
import ControleurSideBar from '../../components/ControleurSideBar';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import { getFileUrl } from '../../utils/fileUrl';

const CandidaturesExperiencesScreen = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  moment.locale('fr');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const [situationActuelle, setSituationActuelle] = useState('');
  const [disponibilite, setDisponibilite] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [domaine, setDomaine] = useState('');
  const [fonctionOccupee, setFonctionOccupee] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [message, setMessage] = useState('');
  const [attestationsTravail, setAttestationsTravail] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('attestations');

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
        setSituationActuelle(candidature.situationActuelle);
        setDisponibilite(candidature.disponibilite);
        setExperiences(candidature.experiences);
        setDateDebut(candidature.dateDebut);
        setDateFin(candidature.dateFin);
        setAttestationsTravail(candidature.attestationsTravail);
      }
    }
  }, [userInfo, navigate, dispatch, params, candidature]);

  const submitHandler = (e) => {
    e.preventDefault();
    navigate(`/controlleurs/candidatures/validations/${params.id}`);
  };

  return (
    <>
      <div id='root'>
        <div className='app'>
          <ControleurSideBar prenom={userInfo.prenom} nom={userInfo.nom} />
          <main>
            {candidature && candidature.user && (
              <HeaderAdministrateur
                headerTitle={`Experiences de ${candidature.user.prenom} ${candidature.user.nom}`}
              />
            )}
            <FormContainer>
              <Row>
                <Col md={6}>
                  {candidature && candidature.user && (
                    <h5 className='text-center my-4'>
                      Experiences du candidat {candidature.user.prenom}{' '}
                      {candidature.user.nom}
                    </h5>
                  )}

                  <Form onSubmit={submitHandler}>
                    <Row className='mb-3 mt-2'>
                      <Col>
                        <Form.Label className='fw-bold mt-3'>
                          <i className='fas fa-user-tie'></i> Situation actuelle
                          :
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            as='select'
                            style={{ borderRadius: '0' }}
                            value={situationActuelle}
                            onChange={(e) =>
                              setSituationActuelle(e.target.value)
                            }
                          >
                            <option value=''>
                              Selectioner votre situation professionnelle
                              actuelle ...
                            </option>

                            <option value='Recherche emploi'>
                              1- A la recherche d'un emploi
                            </option>
                            <option value='En poste'>2- En poste</option>
                          </Form.Control>
                        </InputGroup>
                      </Col>
                      <Col>
                        <Form.Label className='fw-bold mt-3'>
                          <i className='fas fa-calendar-times'></i>{' '}
                          Disponibilite :
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            as='select'
                            style={{ borderRadius: '0' }}
                            value={disponibilite}
                            onChange={(e) => setDisponibilite(e.target.value)}
                          >
                            {' '}
                            <option value=''>
                              Selectioner votre disponibilite ...
                            </option>
                            <option value='Immediate'>2- Immediate</option>
                            <option value='Dans un mois'>
                              2- Dans un mois
                            </option>
                            <option value='Dans deux mois'>
                              3- Dans deux mois
                            </option>
                          </Form.Control>
                        </InputGroup>
                      </Col>
                    </Row>

                    <Row className='mt-5 mb-3'>
                      <Col className='mt-2'>
                        <h5>Experiences : </h5>
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <Container>
                          <Table
                            striped
                            bordered
                            hover
                            responsive
                            className='table-sm'
                          >
                            <thead className='text-center bg-light'>
                              <tr>
                                <th>Domaine</th>
                                <th>Fonction</th>
                                <th>Établissement</th>
                                <th>Date Début</th>
                                <th>Date Fin</th>
                              </tr>
                            </thead>
                            <tbody className='text-center align-middle'>
                              {experiences &&
                                experiences.map((experience, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <span className='badge bg-info text-dark'>
                                        {experience.domaine || 'Générale'}
                                      </span>
                                    </td>
                                    <td className='fw-bold'>{experience.fonctionOccupee || '-'}</td>
                                    <td>{experience.entreprise || '-'}</td>
                                    <td>{experience.dateDebut}</td>
                                    <td>
                                      {experience.enPoste || String(experience.dateFin).toLowerCase().includes('aujourd') ? (
                                        <span className='badge bg-success'>
                                          <i className='fas fa-clock me-1'></i> À ce jour (En poste)
                                        </span>
                                      ) : (
                                        experience.dateFin
                                      )}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </Table>
                        </Container>
                      </Col>
                    </Row>
                    <br />
                    <br />
                    <div className='text-end gap-2 mb-5'>
                      <Button type='submit' variant='btn btn-outline-warning '>
                        <i className='fas fa-sign-in-alt fa-lg'></i> Continuer
                      </Button>
                    </div>
                  </Form>
                </Col>

                <Col md={6}>
                  <div className='d-flex justify-content-between align-items-center my-3'>
                    <h5 className='m-0 fw-bold'>
                      <i className='fas fa-file-pdf text-danger me-2'></i>
                      Documents & Pièces Justificatives
                    </h5>
                    {candidature && (
                      <a
                        href={getFileUrl(
                          selectedDoc === 'diplomes'
                            ? candidature.copieDiplomes
                            : selectedDoc === 'releves'
                            ? candidature.releves
                            : selectedDoc === 'cni'
                            ? candidature.copieCNI
                            : (candidature.attestationsTravail || candidature.copieDiplomes || candidature.copieCNI)
                        )}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i className='fas fa-external-link-alt me-1'></i> Plein écran
                      </a>
                    )}
                  </div>

                  {candidature && (
                    <div className='border rounded shadow-sm p-2 bg-light'>
                      <div className='btn-group w-100 mb-2' role='group'>
                        <button
                          type='button'
                          className={`btn btn-sm ${(!selectedDoc || selectedDoc === 'attestations') ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedDoc('attestations')}
                        >
                          📄 Attestations
                        </button>
                        <button
                          type='button'
                          className={`btn btn-sm ${selectedDoc === 'diplomes' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedDoc('diplomes')}
                        >
                          🎓 Diplômes
                        </button>
                        <button
                          type='button'
                          className={`btn btn-sm ${selectedDoc === 'releves' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedDoc('releves')}
                        >
                          📊 Relevés
                        </button>
                        <button
                          type='button'
                          className={`btn btn-sm ${selectedDoc === 'cni' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedDoc('cni')}
                        >
                          🆔 CIN
                        </button>
                      </div>

                      <div style={{ height: '700px', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                        <iframe
                          src={getFileUrl(
                            selectedDoc === 'diplomes'
                              ? candidature.copieDiplomes
                              : selectedDoc === 'releves'
                              ? candidature.releves
                              : selectedDoc === 'cni'
                              ? candidature.copieCNI
                              : (candidature.attestationsTravail || candidature.copieDiplomes || candidature.copieCNI)
                          )}
                          title='Document Justificatif'
                          width='100%'
                          height='100%'
                          style={{ border: 'none' }}
                        />
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
              <br />
              <br />
            </FormContainer>
          </main>
        </div>
      </div>
    </>
  );
};

export default CandidaturesExperiencesScreen;
