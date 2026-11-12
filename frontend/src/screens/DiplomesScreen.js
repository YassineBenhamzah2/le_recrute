import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button, Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { saveFormations } from '../actions/candidatureActions';
import Calendar from '../components/Calendar';
import FormContainer from '../components/FormContainer';
import Heading from '../components/Heading';
import PostulationSteps from '../components/PostulationSteps';
import { useNavigate, useParams } from 'react-router';
import Message from '../components/Message';
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';
import Header from '../components/Header';
import Footer from '../components/Footer';
import isUppercase from 'validator/es/lib/isUppercase';
import axios from 'axios';
import moment from 'moment';

const DiplomesScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const candidatureInformations = useSelector(
    (state) => state.candidatureInformations
  );
  const { success: successInformations, formations } = candidatureInformations;

  const [niveauEtude, setNiveauEtude] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [specialite2, setSpecialite2] = useState('');
  const [diplome, setDiplome] = useState('');
  const [mention, setMention] = useState('');
  const [dateObtention, setDateObtention] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [methodeNotation, setMethodeNotation] = useState('Annees');
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
  const [releves, setReleves] = useState('');
  const [copieDiplomes, setCopieDiplomes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [uploadingDiplomes, setUploadingDiplomes] = useState(false);
  const [uploadingReleves, setUploadingReleves] = useState(false);

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

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (isStaffUser) {
      navigate(`/poste/${encodeURIComponent(params.poste)}/informations-personnelles`);
    } else {
      dispatch({ type: USER_UPDATE_PROFILE_RESET });
      if (formations) {
        setNiveauEtude(formations.niveauEtude);
        setSpecialite(formations.specialite);
        setSpecialite2(formations.specialite2);
        setDiplome(formations.diplome);
        setMention(formations.mention);
        setDateObtention(formations.dateObtention);
        setEtablissement(formations.etablissement);
        setMethodeNotation(formations.methodeNotation);
        setAnnee1(formations.annee1);
        setAnnee2(formations.annee2);
        setAnnee3(formations.annee3);
        setSemestre1(formations.semestre1);
        setSemestre2(formations.semestre2);
        setSemestre3(formations.semestre3);
        setSemestre4(formations.semestre4);
        setSemestre5(formations.semestre5);
        setSemestre6(formations.semestre6);
        setMoyenneOFFPT(formations.moyenneOFFPT);
        setMessage(formations.message);
        setReleves(formations.releves);
        setCopieDiplomes(formations.copieDiplomes);
      }
    }

    if (successInformations) {
      navigate(`/poste/${params.poste}/experiences`);
    }
  }, [dispatch, userInfo, navigate, successInformations, params, formations]);

  const uploadDiplomes = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingDiplomes(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setCopieDiplomes(data.fileName);
      setUploadingDiplomes(false);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erreur lors du téléversement du diplôme'
      );
      setUploadingDiplomes(false);
    }
  };

  const uploadReleves = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingReleves(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setReleves(data.fileName);
      setUploadingReleves(false);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erreur lors du téléversement des relevés'
      );
      setUploadingReleves(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage('');

    if (!niveauEtude) {
      setMessage("Veuillez sélectionner votre niveau d'études (champ obligatoire)");
      return;
    }
    if (!specialite) {
      setMessage("Veuillez sélectionner votre spécialité (champ obligatoire)");
      return;
    }
    if (specialite === 'Autre' && (!specialite2 || !specialite2.trim())) {
      setMessage("Veuillez préciser votre spécialité (champ obligatoire)");
      return;
    }
    if (!diplome || !diplome.trim()) {
      setMessage("Veuillez renseigner l'intitulé exact de votre diplôme (champ obligatoire)");
      return;
    }
    if (!mention) {
      setMessage("Veuillez sélectionner la mention obtenue (champ obligatoire)");
      return;
    }
    if (!dateObtention) {
      setMessage("Veuillez renseigner la date d'obtention de votre diplôme (champ obligatoire)");
      return;
    }
    if (!etablissement || !etablissement.trim()) {
      setMessage("Veuillez renseigner votre établissement / université (champ obligatoire)");
      return;
    }
    if (!methodeNotation) {
      setMessage("Veuillez choisir le mode de notation (champ obligatoire)");
      return;
    }

    // Validation des notes selon la méthode choisie
    if (methodeNotation === 'Annees') {
      const n1 = parseFloat(annee1);
      const n2 = parseFloat(annee2);
      if (isNaN(n1) || n1 < 0 || n1 > 20) {
        setMessage("Veuillez saisir une note valide entre 0 et 20 pour la 1ère Année");
        return;
      }
      if (isNaN(n2) || n2 < 0 || n2 > 20) {
        setMessage("Veuillez saisir une note valide entre 0 et 20 pour la 2ème Année");
        return;
      }
      if (niveauEtude === 'Bac+3' || niveauEtude === 'BAC+3 PRO') {
        const n3 = parseFloat(annee3);
        if (isNaN(n3) || n3 < 0 || n3 > 20) {
          setMessage("Veuillez saisir une note valide entre 0 et 20 pour la 3ème Année");
          return;
        }
      }
    } else if (methodeNotation === 'Semestres') {
      const sArr = [
        { label: 'Semestre 1', val: parseFloat(semestre1) },
        { label: 'Semestre 2', val: parseFloat(semestre2) },
        { label: 'Semestre 3', val: parseFloat(semestre3) },
        { label: 'Semestre 4', val: parseFloat(semestre4) },
      ];
      if (niveauEtude === 'Bac+3' || niveauEtude === 'BAC+3 PRO') {
        sArr.push({ label: 'Semestre 5', val: parseFloat(semestre5) });
        sArr.push({ label: 'Semestre 6', val: parseFloat(semestre6) });
      }
      for (let s of sArr) {
        if (isNaN(s.val) || s.val < 0 || s.val > 20) {
          setMessage(`Veuillez saisir une note valide entre 0 et 20 pour le ${s.label}`);
          return;
        }
      }
    } else if (methodeNotation === 'OFPPT') {
      const mOfppt = parseFloat(moyenneOFFPT);
      if (isNaN(mOfppt) || mOfppt < 0 || mOfppt > 20) {
        setMessage("Veuillez saisir une moyenne OFPPT valide entre 0 et 20");
        return;
      }
    }

    if (!copieDiplomes) {
      setMessage("Veuillez téléverser la copie de votre Diplôme au format PDF (champ obligatoire)");
      return;
    }
    if (!releves) {
      setMessage("Veuillez téléverser la copie de vos Relevés de notes au format PDF (champ obligatoire)");
      return;
    }

    dispatch(
      saveFormations({
        niveauEtude,
        specialite: specialite === 'Autre' ? specialite2.trim() : specialite,
        diplome: (diplome || '').toUpperCase().trim(),
        mention,
        dateObtention,
        etablissement: (etablissement || '').toUpperCase().trim(),
        methodeNotation,
        annee1: Number(annee1) || 0,
        annee2: Number(annee2) || 0,
        annee3: Number(annee3) || 0,
        semestre1: Number(semestre1) || 0,
        semestre2: Number(semestre2) || 0,
        semestre3: Number(semestre3) || 0,
        semestre4: Number(semestre4) || 0,
        semestre5: Number(semestre5) || 0,
        semestre6: Number(semestre6) || 0,
        moyenneOFFPT: Number(moyenneOFFPT) || 0,
        releves,
        copieDiplomes,
      })
    );
  };

  return (
    <>
      {' '}
      <Header />
      <Heading title='Formations et diplômes' poste={params.poste} />
      <PostulationSteps step1 step2 step3 now={55} />
      <FormContainer>
        <h3 className='text-center my-3'>
          Veuillez remplir le formulaire suivant
        </h3>
        <Form noValidate onSubmit={submitHandler}>
          {message && (
            <Message variant={'danger'}>
              <i className='fas fa-exclamation-triangle'></i> {message}
            </Message>
          )}
          <Row>
            <Col md={6}>
              <Form.Label className='fw-bold mt-3'>
                <i className='fas fa-user-graduate text-primary me-2'></i> Niveau d'étude :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup className='mb-3'>
                <Form.Control
                  as='select'
                  style={{ borderRadius: '8px' }}
                  value={niveauEtude}
                  onChange={(e) => {
                    setNiveauEtude(e.target.value);
                    if (message) setMessage('');
                  }}
                  required
                >
                  <option value=''>-- Sélectionnez votre niveau d'études --</option>
                  <option value='Bac+2'>Bac +2 (DUT, BTS, DTS OFPPT, DEUG)</option>
                  <option value='Bac+3'>Bac +3 (Licence Fondamentale — 3 ans)</option>
                  <option value='Bac+3 PRO'>Bac +3 PRO (Licence Professionnelle — Année S5/S6)</option>
                  <option value='Bac+5'>Bac +5 (Master, Diplôme d'Ingénieur d'État, Bac+5)</option>
                </Form.Control>
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Label className='fw-bold mt-3'>
                <i className='fas fa-calculator text-primary me-2'></i> Spécialité :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup className='mb-3 '>
                <Form.Control
                  as='select'
                  style={{ borderRadius: '8px' }}
                  value={specialite}
                  onChange={(e) => {
                    setSpecialite(e.target.value);
                    if (message) setMessage('');
                  }}
                  required
                >
                  <option value=''>Selectioner votre specialite...</option>
                  <option value="Gestion d'Entreprises">
                    1- Gestion d'Entreprises{' '}
                  </option>
                  <option value='Economie'>2- Economie</option>
                  <option value='Banque'>3- Banque</option>
                  <option value='Finance'>4- Finance</option>
                  <option value='Comptabilité'>5- Comptabilité</option>
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
                  <option value='Communication'>11- Communication</option>
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
            <Col md={6}>
              <Form.Label className='fw-bold mt-3'>
                <i className='fas fa-marker text-primary me-2'></i> Mention :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup className='mb-3'>
                <Form.Control
                  as='select'
                  style={{ borderRadius: '8px' }}
                  value={mention}
                  onChange={(e) => {
                    setMention(e.target.value);
                    if (message) setMessage('');
                  }}
                  required
                >
                  <option value=''>Sélectionnez votre mention...</option>
                  <option value='Passable'>1 - Passable</option>
                  <option value='Assez Bien'>2 - Assez Bien</option>
                  <option value='Bien'>3 - Bien</option>
                  <option value='Tres Bien'>4 - Très Bien</option>
                </Form.Control>
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Label className='fw-bold mt-3 d-flex align-items-center justify-content-between'>
                <span>
                  <i className='fas fa-graduation-cap text-primary me-2'></i> Relevés de notes :
                  <span className='text-danger ms-1'>*</span>
                </span>
                {uploadingReleves && (
                  <span className='badge bg-info text-dark'>
                    <i className='fas fa-spinner fa-spin me-1'></i> Envoi...
                  </span>
                )}
                {!uploadingReleves && releves && (
                  <span className='badge bg-success-subtle text-success small' title={releves}>
                    <i className='fas fa-check-circle me-1'></i> Prêt
                  </span>
                )}
              </Form.Label>
              <InputGroup className='position-relative mb-3'>
                <Form.Control
                  accept='.pdf,.png,.jpg,.jpeg'
                  type='file'
                  id='releves-file'
                  label='Choisir un fichier'
                  custom
                  onChange={uploadReleves}
                  required={!releves}
                  style={{ borderRadius: '8px' }}
                />
              </InputGroup>
              {releves && (
                <div className='small text-muted mb-2 text-truncate' style={{ maxWidth: '300px' }}>
                  Fichier : <strong>{releves}</strong>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Label className='fw-bold mt-3'>
                <i className='fas fa-graduation-cap text-primary me-2'></i> Intitulé du diplôme :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup className='mb-3'>
                <Form.Control
                  type='text'
                  placeholder='Ex: LICENCE PROFESSIONNELLE RH'
                  style={{ borderRadius: '8px' }}
                  value={diplome}
                  onChange={(e) => {
                    setDiplome(e.target.value);
                    if (message) setMessage('');
                  }}
                  required
                ></Form.Control>
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Label className='fw-bold mt-3 d-flex align-items-center justify-content-between'>
                <span>
                  <i className='fas fa-certificate text-secondary me-2'></i> Copie de diplôme :
                  <span className='text-danger ms-1'>*</span>
                </span>
                {uploadingDiplomes && (
                  <span className='badge bg-info text-dark'>
                    <i className='fas fa-spinner fa-spin me-1'></i> Envoi...
                  </span>
                )}
                {!uploadingDiplomes && copieDiplomes && (
                  <span className='badge bg-success-subtle text-success small' title={copieDiplomes}>
                    <i className='fas fa-check-circle me-1'></i> Prêt
                  </span>
                )}
              </Form.Label>
              <InputGroup className='position-relative mb-3'>
                <Form.Control
                  accept='.pdf,.png,.jpg,.jpeg'
                  type='file'
                  id='diplomes-file'
                  label='Choisir un fichier'
                  custom
                  onChange={uploadDiplomes}
                  required={!copieDiplomes}
                  style={{ borderRadius: '8px' }}
                />
              </InputGroup>
              {copieDiplomes && (
                <div className='small text-muted mb-2 text-truncate' style={{ maxWidth: '300px' }}>
                  Fichier : <strong>{copieDiplomes}</strong>
                </div>
              )}
              <span className='small text-muted'>
                Insérez tous vos diplômes cumulés (bac, bac+2, licence...){' '}
                <a
                  href='https://www.ilovepdf.com/fr/fusionner_pdf'
                  className='fw-bold'
                  target='_blank'
                  rel='noreferrer'
                >
                  Fusionnez les pdfs
                </a>
              </span>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Label className='fw-bold mt-3'>
                <i className='far fa-calendar text-primary me-2'></i> Date d'obtention de diplôme :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup className='mb-3'>
                <Form.Control
                  type='date'
                  max={moment().format('YYYY-MM-DD')}
                  style={{ borderRadius: '8px', height: '46px' }}
                  value={dateObtention ? (moment.isMoment(dateObtention) ? dateObtention.format('YYYY-MM-DD') : (typeof dateObtention === 'string' && dateObtention.includes('-') ? dateObtention : (moment(dateObtention).isValid() ? moment(dateObtention).format('YYYY-MM-DD') : ''))) : ''}
                  onChange={(e) => {
                    setDateObtention(e.target.value);
                    if (message) setMessage('');
                  }}
                  required
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Label className='fw-bold mt-3'>
                <i className='fas fa-school text-primary me-2'></i> Établissement :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup className='mb-3'>
                <Form.Control
                  type='text'
                  placeholder='Ex: UNIVERSITE HASSAN II, ENCG...'
                  style={{ borderRadius: '8px' }}
                  value={etablissement}
                  onChange={(e) => {
                    setEtablissement(e.target.value);
                    if (message) setMessage('');
                  }}
                  required
                ></Form.Control>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Label className='fw-bold mt-3'>
                <i className='fas fa-pencil-alt text-primary me-2'></i> Méthode de notation :
                <span className='text-danger ms-1'>*</span>
              </Form.Label>
              <InputGroup className='mb-3'>
                <Form.Control
                  as='select'
                  style={{ borderRadius: '8px' }}
                  value={
                    niveauEtude === 'Bac+3 PRO' ? 'Semestres' : methodeNotation
                  }
                  onChange={(e) => {
                    setMethodeNotation(e.target.value);
                    if (message) setMessage('');
                  }}
                  disabled={niveauEtude === 'Bac+3 PRO' ? true : false}
                  required
                >
                  <option value=''>Sélectionnez la méthode de notation</option>
                  <option value='Annees'>1- Années (Moyennes annuelles)</option>
                  <option value='Semestres'>2- Semestres (Notes par semestre)</option>
                  <option value='Moyenne générale (OFPPT)'>
                    3- Moyenne générale (OFPPT)
                  </option>
                </Form.Control>
              </InputGroup>
            </Col>
          </Row>

            {methodeNotation === 'Annees' &&
              (niveauEtude === 'Bac+2' ? (
                <>
                  <Row>
                    <Col>
                      <Form.Label className='fw-bold mt-3'>
                        <i className='fas fa-list-ol'></i> Premiere annee :
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
                        <i className='fas fa-list-ol'></i> Deuxieme annee :
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
                        <i className='fas fa-list-ol'></i> Premiere annee :
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
                        <i className='fas fa-list-ol'></i> Deuxieme annee :
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
                        <i className='fas fa-list-ol'></i> troisieme annee :
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
                        <i className='fas fa-list-ol'></i> Semestre 1 :
                      </Form.Label>
                      <InputGroup className='mb-3'>
                        <Form.Control
                          type='number'
                          placeholder='Note du Semestre 1'
                          style={{ borderRadius: '0' }}
                          value={semestre1}
                          onChange={(e) => setSemestre1(e.target.value)}
                          required
                        ></Form.Control>
                      </InputGroup>{' '}
                    </Col>
                    <Col>
                      <Form.Label className='fw-bold mt-3'>
                        <i className='fas fa-list-ol'></i> Semestre 2 :
                      </Form.Label>
                      <InputGroup className='mb-3'>
                        <Form.Control
                          type='number'
                          placeholder='Note du Semestre 2'
                          style={{ borderRadius: '0' }}
                          value={semestre2}
                          onChange={(e) => setSemestre2(e.target.value)}
                          required
                        ></Form.Control>
                      </InputGroup>{' '}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label className='fw-bold mt-3'>
                        <i className='fas fa-list-ol'></i> Semestre 3 :
                      </Form.Label>
                      <InputGroup className='mb-3'>
                        <Form.Control
                          type='number'
                          placeholder='Note du Semestre 3'
                          style={{ borderRadius: '0' }}
                          value={semestre3}
                          onChange={(e) => setSemestre3(e.target.value)}
                          required
                        ></Form.Control>
                      </InputGroup>{' '}
                    </Col>
                    <Col>
                      <Form.Label className='fw-bold mt-3'>
                        <i className='fas fa-list-ol'></i> Semestre 4 :
                      </Form.Label>
                      <InputGroup className='mb-3'>
                        <Form.Control
                          type='number'
                          placeholder='Note du Semestre 4'
                          style={{ borderRadius: '0' }}
                          value={semestre4}
                          onChange={(e) => setSemestre4(e.target.value)}
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
                        <i className='fas fa-list-ol'></i> Semestre 1 :
                      </Form.Label>
                      <InputGroup className='mb-3'>
                        {/* <NumericInput step={0.1} precision={2} value={50.3} /> */}
                        <Form.Control
                          type='number'
                          placeholder='Note du Semestre 1'
                          style={{ borderRadius: '0' }}
                          maxLength={'1'}
                          value={semestre1}
                          onChange={(e) => setSemestre1(e.target.value)}
                          required
                        ></Form.Control>
                      </InputGroup>{' '}
                    </Col>
                    <Col>
                      <Form.Label className='fw-bold mt-3'>
                        <i className='fas fa-list-ol'></i> Semestre 2 :
                      </Form.Label>
                      <InputGroup className='mb-3'>
                        <Form.Control
                          type='number'
                          placeholder='Note du Semestre 2'
                          style={{ borderRadius: '0' }}
                          value={semestre2}
                          onChange={(e) => setSemestre2(e.target.value)}
                          required
                        ></Form.Control>
                      </InputGroup>{' '}
                    </Col>
                    <Col>
                      <Form.Label className='fw-bold mt-3'>
                        <i className='fas fa-list-ol'></i> Semestre 3 :
                      </Form.Label>
                      <InputGroup className='mb-3'>
                        <Form.Control
                          type='number'
                          placeholder='Note du Semestre 3'
                          style={{ borderRadius: '0' }}
                          value={semestre3}
                          onChange={(e) => setSemestre3(e.target.value)}
                          required
                        ></Form.Control>
                      </InputGroup>{' '}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label className='fw-bold mt-3'>
                        <i className='fas fa-list-ol'></i> Semestre 4 :
                      </Form.Label>
                      <InputGroup className='mb-3'>
                        <Form.Control
                          type='number'
                          placeholder='Note du Semestre 4'
                          style={{ borderRadius: '0' }}
                          value={semestre4}
                          onChange={(e) => setSemestre4(e.target.value)}
                          required
                        ></Form.Control>
                      </InputGroup>{' '}
                    </Col>
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
                </>
              ) : (
                <>
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
                      onChange={(e) => setMoyenneOFFPT(e.target.value)}
                      required
                    ></Form.Control>
                  </InputGroup>{' '}
                </Col>
              </Row>
            )}
          <div className='text-end gap-2 mb-3'>
            <Button
              type='submit'
              style={{
                background: '#1D4ED8',
                borderColor: '#1D4ED8',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '11px 26px',
                fontWeight: '700',
                fontSize: '14.5px',
                boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)',
              }}
            >
              <span>Sauvegarder et Continuer (Expériences)</span>
              <i className='fas fa-arrow-right ms-2'></i>
            </Button>
          </div>
        </Form>
      </FormContainer>
      <Footer />
    </>
  );
};

export default DiplomesScreen;
