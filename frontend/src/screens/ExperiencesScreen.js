import React, { useState, useEffect } from 'react';
import {
  Form,
  InputGroup,
  Button,
  Modal,
  Row,
  Col,
  Table,
  Container,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createCandidature } from '../actions/candidatureActions';
import Calendar from '../components/Calendar';
import Message from '../components/Message';
import FormContainer from '../components/FormContainer';
import Heading from '../components/Heading';
import PostulationSteps from '../components/PostulationSteps';
import { useNavigate, useParams } from 'react-router';
import moment from 'moment';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  CANDIDATURE_SAVE_FORMATIONS_RESET,
  CANDIDATURE_CREATE_RESET,
} from '../constants/candidatureConstants';
import axios from 'axios';

const ExperiencesScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const [situationActuelle, setSituationActuelle] = useState('');
  const [disponibilite, setDisponibilite] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [domaine, setDomaine] = useState('');
  const [fonctionOccupee, setFonctionOccupee] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [enPoste, setEnPoste] = useState(false);
  const [message, setMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalFieldErrors, setModalFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [attestationsTravail, setAttestationsTravail] = useState('');
  const [uploadingAttestations, setUploadingAttestations] = useState(false);
  const [currentOffre, setCurrentOffre] = useState(null);

  useEffect(() => {
    dispatch({ type: CANDIDATURE_CREATE_RESET });
    const fetchCurrentOffre = async () => {
      try {
        if (params.poste) {
          const { data } = await axios.get(`/api/offres/${encodeURIComponent(params.poste)}`);
          setCurrentOffre(data);
        }
      } catch (err) {
        console.error('Erreur chargement offre courante:', err);
      }
    };
    fetchCurrentOffre();
  }, [dispatch, params.poste]);

  const posteTitre = currentOffre?.titre || params.poste || 'Poste ciblé';
  const specialitePoste =
    (currentOffre?.specialite && !currentOffre.specialite.includes('Bancaire') ? currentOffre.specialite : null) ||
    (currentOffre?.scoringRules?.experience?.nomSpecialite && currentOffre.scoringRules.experience.nomSpecialite !== 'Bancaire'
      ? currentOffre.scoringRules.experience.nomSpecialite
      : null) ||
    posteTitre;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const isStaffUser = Boolean(
    userInfo && (
      userInfo.isMaitreOuvrage ||
      userInfo.isAdmin ||
      userInfo.isAdministrateur ||
      userInfo.isController ||
      userInfo.isControlleur ||
      userInfo.isControleur1 ||
      userInfo.isControleur2
    )
  );

  const candidatureCreate = useSelector((state) => state.candidatureCreate);
  const {
    loading: loadingCandidature,
    error: errorCanditure,
    success: successCandidature,
    candidature,
  } = candidatureCreate;

  const candidatureInformations = useSelector(
    (state) => state.candidatureInformations
  );
  const { formations } = candidatureInformations;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (isStaffUser) {
      navigate(`/poste/${encodeURIComponent(params.poste)}/informations-personnelles`);
    } else {
      dispatch({ type: CANDIDATURE_SAVE_FORMATIONS_RESET });
    }
    if (successCandidature && candidature) {
      navigate(`/poste/${encodeURIComponent(params.poste)}/candidature/${candidature._id}`);
      localStorage.removeItem('formations');
    }
  }, [userInfo, successCandidature, params, navigate, candidature, dispatch]);

  const handleDeleteExperience = (index) => {
    setExperiences(experiences.filter((_, idx) => idx !== index));
  };

  const [showNote, setShowNote] = useState(false);
  const handleCloseNote = () => {
    setShowNote(false);
    setEnPoste(false);
    setModalError('');
  };
  const handleShowNote = () => {
    if (experiences && experiences.length >= 6) {
      setMessage('Le nombre maximum d’expériences autorisé est de 6');
    } else {
      setModalError('');
      setShowNote(true);
    }
  };

  const uploadAttestations = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingAttestations(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setAttestationsTravail(data.fileName);
      setUploadingAttestations(false);
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erreur lors du téléversement des attestations'
      );
      setUploadingAttestations(false);
    }
  };

  const parseMomentSafe = (val) => {
    if (!val) return null;
    if (typeof val === 'string' && (val.toLowerCase().includes('aujourd') || val.toLowerCase().includes('ce jour') || val.toLowerCase().includes('poste'))) {
      return moment();
    }
    if (moment.isMoment(val)) return val.isValid() ? val : null;
    if (val instanceof Date) {
      const m = moment(val);
      return m.isValid() ? m : null;
    }
    const m = moment(val, ['DD.MM.YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], true);
    if (m.isValid()) return m;
    const loose = moment(val);
    return loose.isValid() ? loose : null;
  };

  const experienceSubmitHandler = (e) => {
    e.preventDefault();
    setModalError('');
    const errs = {};

    if (!domaine) {
      errs.domaine = "Veuillez sélectionner le type d'expérience";
    }
    if (!fonctionOccupee || !fonctionOccupee.trim()) {
      errs.fonctionOccupee = "Veuillez renseigner la fonction occupée";
    }
    if (!entreprise || !entreprise.trim()) {
      errs.entreprise = "Veuillez renseigner l'entreprise ou l'établissement";
    }
    if (!dateDebut) {
      errs.dateDebut = "Veuillez renseigner la date de début";
    }
    if (!enPoste && !dateFin) {
      errs.dateFin = "Veuillez renseigner la date de fin";
    }

    const dd = parseMomentSafe(dateDebut);
    const df = enPoste ? moment() : parseMomentSafe(dateFin);

    if (dateDebut && (!dd || !dd.isValid())) {
      errs.dateDebut = "Date de début invalide";
    }
    if (!enPoste && dateFin && (!df || !df.isValid())) {
      errs.dateFin = "Date de fin invalide";
    }
    if (dd && df && dd.isValid() && df.isValid() && dd.isAfter(df)) {
      errs.dateFin = "La date de fin doit être postérieure à la date de début";
    }
    if (!enPoste && df && df.isValid() && df.isAfter(moment().endOf('day'))) {
      errs.dateFin = "La date de fin ne peut pas être dans le futur";
    }

    // Validation Bac : uniquement si l'année de début est strictement inférieure à l'année du Bac
    if (userInfo && userInfo.dateObtentionBac && dd && dd.isValid()) {
      const dBac = parseMomentSafe(userInfo.dateObtentionBac);
      if (dBac && dBac.isValid() && dd.year() < dBac.year()) {
        errs.dateDebut = `L'année de début (${dd.year()}) ne peut pas être antérieure au Bac (${dBac.year()})`;
      }
    }

    if (Object.keys(errs).length > 0) {
      setModalFieldErrors(errs);
      setModalError("Veuillez renseigner tous les champs obligatoires marqués en rouge");
      return;
    }

    setModalFieldErrors({});
    setExperiences((prev) => [
      ...prev,
      {
        domaine,
        fonctionOccupee: fonctionOccupee.trim(),
        entreprise: entreprise.trim(),
        dateDebut: dd.format('DD.MM.YYYY'),
        dateFin: enPoste ? "Aujourd'hui" : df.format('DD.MM.YYYY'),
        enPoste: Boolean(enPoste),
      },
    ]);

    setDomaine('');
    setEntreprise('');
    setFonctionOccupee('');
    setDateDebut('');
    setDateFin('');
    setEnPoste(false);
    setModalError('');
    setModalFieldErrors({});
    setShowNote(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage('');
    dispatch({ type: CANDIDATURE_CREATE_RESET });

    // Validation précise champ par champ avec message d'erreur explicite
    if (!situationActuelle) {
      setMessage('Veuillez renseigner votre situation actuelle (champ obligatoire)');
      return;
    }
    if (!disponibilite) {
      setMessage('Veuillez préciser votre disponibilité (champ obligatoire)');
      return;
    }
    if (experiences && experiences.length > 0 && !attestationsTravail) {
      setMessage(
        'Veuillez joindre le fichier de vos attestations de travail cumulées au format PDF pour justifier vos expériences'
      );
      return;
    }

    const payload = {
      offre: currentOffre?._id || undefined,
      niveauEtude: formations?.niveauEtude || 'Bac+3',
      specialite: formations?.specialite || specialitePoste,
      diplome: formations?.diplome || 'DIPLOME D ETAT',
      mention: formations?.mention || 'Bien',
      dateObtention: formations?.dateObtention || new Date(),
      etablissement: formations?.etablissement || 'UNIVERSITE',
      methodeNotation: formations?.methodeNotation || 'Annees',
      annee1: Number(formations?.annee1) || 0,
      annee2: Number(formations?.annee2) || 0,
      annee3: Number(formations?.annee3) || 0,
      semestre1: Number(formations?.semestre1) || 0,
      semestre2: Number(formations?.semestre2) || 0,
      semestre3: Number(formations?.semestre3) || 0,
      semestre4: Number(formations?.semestre4) || 0,
      semestre5: Number(formations?.semestre5) || 0,
      semestre6: Number(formations?.semestre6) || 0,
      moyenneOFFPT: Number(formations?.moyenneOFFPT) || 0,
      copieDiplomes: formations?.copieDiplomes || '',
      releves: formations?.releves || '',
      situationActuelle,
      disponibilite,
      experiences,
      poste: params.poste,
      attestationsTravail: attestationsTravail || '',
    };

    dispatch(createCandidature(payload));
  };

  return (
    <>
      {' '}
      <Header />
      <Heading title='Expériences professionnelles' poste={params.poste} />
      <PostulationSteps step1 step2 step3 step4 now={80} />
      <FormContainer>
        <Form noValidate onSubmit={submitHandler}>
          <h3 className='text-center my-3'>
            Veuillez remplir le formulaire suivant
          </h3>
          <Row className='mb-3 mt-4'>
            {message && (
              <Col xs={12} className='mb-3'>
                <Message variant='danger'>
                  <i className='fas fa-exclamation-circle me-2'></i> {message}
                </Message>
              </Col>
            )}
            {errorCanditure && (
              <Col xs={12} className='mb-3'>
                <Message variant='danger'>
                  <i className='fas fa-exclamation-triangle me-2'></i> {errorCanditure}
                </Message>
              </Col>
            )}
            {loadingCandidature && <Spinner size={150} />}
            <Col md={6}>
              <Form.Label className='fw-bold mt-2'>
                <i className='fas fa-user-tie text-primary me-2'></i> Situation actuelle :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  as='select'
                  style={{ borderRadius: '8px' }}
                  value={situationActuelle}
                  onChange={(e) => {
                    setSituationActuelle(e.target.value);
                    if (message) setMessage('');
                  }}
                  required
                  isInvalid={submitted && !situationActuelle}
                >
                  <option value=''>
                    Sélectionner votre situation actuelle...
                  </option>
                  <option value='Recherche emploi'>
                    1- À la recherche d'un emploi
                  </option>
                  <option value='En poste'>2- En poste</option>
                  <option value='Fonctionnaire'>3- Fonctionnaire</option>
                </Form.Control>
                <Form.Control.Feedback type='invalid'>
                  Veuillez sélectionner votre situation actuelle
                </Form.Control.Feedback>
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Label className='fw-bold mt-2'>
                <i className='fas fa-calendar-check text-primary me-2'></i> Disponibilité :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  as='select'
                  style={{ borderRadius: '8px' }}
                  value={disponibilite}
                  onChange={(e) => {
                    setDisponibilite(e.target.value);
                    if (message) setMessage('');
                  }}
                  required
                  isInvalid={submitted && !disponibilite}
                >
                  <option value=''>Sélectionner votre disponibilité...</option>
                  <option value='Immediate'>1- Immédiate</option>
                  <option value='Dans un mois'>2- Dans un mois</option>
                  <option value='Dans deux mois'>3- Dans deux mois</option>
                </Form.Control>
                <Form.Control.Feedback type='invalid'>
                  Veuillez préciser votre disponibilité
                </Form.Control.Feedback>
              </InputGroup>
            </Col>
          </Row>

          {experiences && experiences.length > 0 && (
            <Row className='my-3'>
              <Col xs={12}>
                <div className='p-3 border rounded-3 bg-light'>
                  <Form.Label className='fw-bold d-flex align-items-center justify-content-between mb-2'>
                    <span>
                      <i className='fas fa-file-pdf text-danger me-2'></i> Attestations de travail cumulées :
                      <span className='text-danger ms-1'>*</span>
                    </span>
                    {uploadingAttestations && (
                      <span className='badge bg-info text-dark'>
                        <i className='fas fa-spinner fa-spin me-1'></i> Téléversement...
                      </span>
                    )}
                    {!uploadingAttestations && attestationsTravail && (
                      <span className='badge bg-success text-white' title={attestationsTravail}>
                        <i className='fas fa-check-circle me-1'></i> Document prêt
                      </span>
                    )}
                  </Form.Label>
                  <InputGroup hasValidation className='mb-2'>
                    <Form.Control
                      accept='.pdf,.png,.jpg,.jpeg'
                      type='file'
                      id='attestations-file'
                      onChange={uploadAttestations}
                      required={experiences.length > 0 && !attestationsTravail}
                      isInvalid={submitted && experiences.length > 0 && !attestationsTravail}
                      style={{ borderRadius: '8px' }}
                    />
                    <Form.Control.Feedback type='invalid'>
                      Veuillez joindre l'attestation de travail cumulée pour justifier vos expériences
                    </Form.Control.Feedback>
                  </InputGroup>
                  {attestationsTravail && (
                    <div className='small text-success mb-2'>
                      <i className='fas fa-check-circle me-1'></i> Fichier enregistré : <strong>{attestationsTravail}</strong>
                    </div>
                  )}
                  <span className='text-muted small'>
                    Insérez toutes vos attestations de travail cumulées au format PDF.{' '}
                    <a
                      href='https://www.ilovepdf.com/fr/fusionner_pdf'
                      className='fw-bold text-decoration-none'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Fusionner mes PDF
                    </a>
                  </span>
                </div>
              </Col>
            </Row>
          )}

          <Row className='mt-4 mb-3'>
            <Col className='mt-2'>
              <h5 className='fw-bold text-dark'>
                <i className='fas fa-briefcase text-primary me-2'></i> Expériences Professionnelles :
              </h5>
            </Col>
            <Col className='text-end'>
              <Button
                onClick={handleShowNote}
                variant='outline-primary'
                size='sm'
                style={{ borderRadius: '8px', fontWeight: '600' }}
              >
                <i className='fas fa-plus me-1'></i> Ajouter une expérience
              </Button>
            </Col>
          </Row>

          <Row>
            {experiences && experiences.length === 0 ? (
              <Container className='my-4'>
                <Message variant='info'>
                  <i className='fas fa-info-circle me-2'></i> Aucune expérience saisie. Cliquez sur <strong>"Ajouter une expérience"</strong> si vous avez des expériences professionnelles à valoriser.
                </Message>
              </Container>
            ) : (
              <Col>
                <Container className='px-0'>
                  <Table striped hover responsive className='align-middle shadow-sm rounded-3 overflow-hidden'>
                    <thead className='table-light text-center'>
                      <tr>
                        <th>Nature du Domaine</th>
                        <th>Fonction Occupée</th>
                        <th>Entreprise / Établissement</th>
                        <th>Période (Début ➔ Fin)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody className='text-center'>
                      {experiences &&
                        experiences.map((experience, idx) => (
                          <tr key={idx}>
                            <td>
                              {experience.domaine === 'Bancaire' || experience.domaine === 'Spécialité directe' ? (
                                <span
                                  className='badge'
                                  style={{
                                    background: '#DCFCE7',
                                    color: '#15803D',
                                    fontWeight: '700',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                  }}
                                >
                                  <i className='fas fa-star me-1'></i> Spécialité Directe ({specialitePoste})
                                </span>
                              ) : (
                                <span
                                  className='badge'
                                  style={{
                                    background: '#F1F5F9',
                                    color: '#475569',
                                    fontWeight: '600',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                  }}
                                >
                                  <i className='fas fa-briefcase me-1'></i> Autre Domaine
                                </span>
                              )}
                            </td>
                            <td className='fw-bold text-dark'>{experience.fonctionOccupee}</td>
                            <td>{experience.entreprise}</td>
                            <td>
                              <span className='badge bg-light text-dark border px-2 py-1'>
                                {experience.dateDebut} ➔{' '}
                                {experience.enPoste || String(experience.dateFin).toLowerCase().includes('aujourd') ? (
                                  <span className='text-success fw-bold'>
                                    <i className='fas fa-clock me-1'></i> À ce jour (En poste)
                                  </span>
                                ) : (
                                  experience.dateFin
                                )}
                              </span>
                            </td>
                            <td>
                              <Button
                                variant='outline-danger'
                                size='sm'
                                style={{ borderRadius: '6px' }}
                                onClick={() => handleDeleteExperience(idx)}
                                title='Supprimer cette expérience'
                              >
                                <i className='fas fa-trash-alt'></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </Container>
              </Col>
            )}
          </Row>

          <div className='text-end gap-2 mb-5 mt-4'>
            <Button
              type='submit'
              style={{
                background: '#1D4ED8',
                borderColor: '#1D4ED8',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '12px 28px',
                fontWeight: '700',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
              }}
            >
              <i className='fas fa-check-circle me-2'></i> Enregistrer & Déposer la Candidature
            </Button>
          </div>
        </Form>
      </FormContainer>
      <Modal
        show={showNote}
        onHide={handleCloseNote}
        backdrop='static'
        keyboard={false}
        centered
        size='lg'
      >
        <Modal.Header closeButton className='bg-light'>
          <Modal.Title className='h5 fw-bold text-dark'>
            <i className='fas fa-briefcase text-primary me-2'></i> Ajouter une Expérience Professionnelle
          </Modal.Title>
        </Modal.Header>
        <Form noValidate onSubmit={experienceSubmitHandler}>
          <Modal.Body className='p-4'>
            {modalError && (
              <div className='mb-3'>
                <Message variant='danger'>
                  <i className='fas fa-exclamation-circle me-2'></i> {modalError}
                </Message>
              </div>
            )}
            <Form.Group className='mb-3'>
              <Form.Label className='fw-bold'>
                <i className='fas fa-layer-group text-primary me-2'></i> Nature / Domaine de l'expérience :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <Form.Select
                style={{
                  borderRadius: '8px',
                  height: '46px',
                  border: modalFieldErrors.domaine ? '1.5px solid #EF4444' : '1px solid #ced4da',
                  background: modalFieldErrors.domaine ? '#FEF2F2' : '#FFFFFF',
                  fontWeight: '500',
                }}
                value={domaine}
                onChange={(e) => {
                  setDomaine(e.target.value);
                  setModalError('');
                  setModalFieldErrors((prev) => ({ ...prev, domaine: null }));
                }}
              >
                <option value=''>-- Sélectionnez la nature de votre expérience --</option>
                <option value='Spécialité directe'>
                  🎯 Expérience directe dans le poste / métier ({specialitePoste})
                </option>
                <option value='Autre'>
                  💼 Autre expérience professionnelle (Secteur public, privé ou connexe)
                </option>
              </Form.Select>
              {modalFieldErrors.domaine && (
                <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                  <i className='fas fa-exclamation-circle'></i>
                  <span>{modalFieldErrors.domaine}</span>
                </div>
              )}
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    <i className='fas fa-user-tag text-primary me-2'></i> Fonction occupée :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Ex: Développeur Web, Analyste...'
                    style={{
                      borderRadius: '8px',
                      height: '44px',
                      border: modalFieldErrors.fonctionOccupee ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: modalFieldErrors.fonctionOccupee ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={fonctionOccupee}
                    onChange={(e) => {
                      setFonctionOccupee(e.target.value);
                      setModalError('');
                      setModalFieldErrors((prev) => ({ ...prev, fonctionOccupee: null }));
                    }}
                  />
                  {modalFieldErrors.fonctionOccupee && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{modalFieldErrors.fonctionOccupee}</span>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    <i className='far fa-building text-primary me-2'></i> Entreprise / Établissement :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Ex: Maroc Telecom, OCP, Société X...'
                    style={{
                      borderRadius: '8px',
                      height: '44px',
                      border: modalFieldErrors.entreprise ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: modalFieldErrors.entreprise ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={entreprise}
                    onChange={(e) => {
                      setEntreprise(e.target.value);
                      setModalError('');
                      setModalFieldErrors((prev) => ({ ...prev, entreprise: null }));
                    }}
                  />
                  {modalFieldErrors.entreprise && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{modalFieldErrors.entreprise}</span>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row className='mb-2'>
              <Col md={12}>
                <div
                  className='p-2 mb-3 rounded'
                  style={{
                    background: enPoste ? '#F0FDF4' : '#F8FAFC',
                    border: enPoste ? '1.5px solid #22C55E' : '1px solid #E2E8F0',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Form.Check
                    type='checkbox'
                    id='enPosteCheckbox'
                    className='fw-bold'
                    style={{ color: enPoste ? '#15803D' : '#334155', cursor: 'pointer' }}
                    label={
                      <span style={{ fontSize: '13.5px' }}>
                        <i className='fas fa-user-clock me-2 text-success'></i>
                        <strong>Poste actuel (Toujours en poste aujourd'hui)</strong> — Calcul automatique de l'expérience jusqu'à aujourd'hui
                      </span>
                    }
                    checked={enPoste}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEnPoste(checked);
                      if (checked) {
                        setDateFin(moment().format('YYYY-MM-DD'));
                      } else {
                        setDateFin('');
                      }
                      setModalError('');
                      setModalFieldErrors((prev) => ({ ...prev, dateFin: null }));
                    }}
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    <i className='fas fa-calendar-alt text-primary me-2'></i> Date de Début :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='date'
                    max={moment().format('YYYY-MM-DD')}
                    style={{
                      borderRadius: '8px',
                      height: '44px',
                      border: modalFieldErrors.dateDebut ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: modalFieldErrors.dateDebut ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={dateDebut ? (moment.isMoment(dateDebut) ? dateDebut.format('YYYY-MM-DD') : (parseMomentSafe(dateDebut) ? parseMomentSafe(dateDebut).format('YYYY-MM-DD') : (typeof dateDebut === 'string' && dateDebut.includes('-') ? dateDebut : ''))) : ''}
                    onChange={(e) => {
                      setDateDebut(e.target.value);
                      setModalError('');
                      setModalFieldErrors((prev) => ({ ...prev, dateDebut: null }));
                    }}
                  />
                  {modalFieldErrors.dateDebut && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{modalFieldErrors.dateDebut}</span>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    <i className='fas fa-calendar-check text-primary me-2'></i> Date de Fin :
                    {!enPoste && <span className='text-danger ms-1'>*</span>}
                  </Form.Label>
                  {enPoste ? (
                    <div
                      className='form-control d-flex align-items-center gap-2 fw-bold'
                      style={{ background: '#DCFCE7', color: '#15803D', borderColor: '#86EFAC', height: '44px', borderRadius: '8px' }}
                    >
                      <i className='fas fa-check-circle'></i> À ce jour (Aujourd'hui)
                    </div>
                  ) : (
                    <>
                      <Form.Control
                        type='date'
                        max={moment().format('YYYY-MM-DD')}
                        min={dateDebut ? (parseMomentSafe(dateDebut) ? parseMomentSafe(dateDebut).format('YYYY-MM-DD') : undefined) : undefined}
                        style={{
                          borderRadius: '8px',
                          height: '44px',
                          border: modalFieldErrors.dateFin ? '1.5px solid #EF4444' : '1px solid #ced4da',
                          background: modalFieldErrors.dateFin ? '#FEF2F2' : '#FFFFFF',
                        }}
                        value={dateFin ? (moment.isMoment(dateFin) ? dateFin.format('YYYY-MM-DD') : (parseMomentSafe(dateFin) ? parseMomentSafe(dateFin).format('YYYY-MM-DD') : (typeof dateFin === 'string' && dateFin.includes('-') ? dateFin : ''))) : ''}
                        onChange={(e) => {
                          setDateFin(e.target.value);
                          setModalError('');
                          setModalFieldErrors((prev) => ({ ...prev, dateFin: null }));
                        }}
                      />
                      {modalFieldErrors.dateFin && (
                        <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                          <i className='fas fa-exclamation-circle'></i>
                          <span>{modalFieldErrors.dateFin}</span>
                        </div>
                      )}
                    </>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className='bg-light'>
            <Button onClick={handleCloseNote} variant='secondary' style={{ borderRadius: '8px' }}>
              Fermer
            </Button>
            <Button
              type='submit'
              style={{
                background: '#1D4ED8',
                borderColor: '#1D4ED8',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              <i className='fas fa-plus me-1'></i> Valider & Ajouter
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Footer />
    </>
  );
};

export default ExperiencesScreen;
