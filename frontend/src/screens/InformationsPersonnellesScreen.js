import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button, Row, Col, Container, Card } from 'react-bootstrap';
import Calendar from '../components/Calendar';
import FormContainer from '../components/FormContainer';
import Heading from '../components/Heading';
import Message from '../components/Message';
import Spinner from '../components/Spinner';
import PostulationSteps from '../components/PostulationSteps';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { getUserDetails, updateUserProfile, logout } from '../actions/userActions';
import moment from 'moment';
import Header from '../components/Header';
import Footer from '../components/Footer';
import isMobilePhone from 'validator/es/lib/isMobilePhone';
import isNumeric from 'validator/es/lib/isNumeric';
import { useParams } from 'react-router';
import axios from 'axios';
import 'moment/locale/fr';

const InformationsPersonnellesScreen = () => {
  moment.locale('fr');
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [codePostale, setCodePostale] = useState('');
  const [cni, setCni] = useState('');
  const [email, setEmail] = useState('');
  const [copieCNI, setCopieCNI] = useState('');
  const [residence, setResidence] = useState('');
  const [uploadingCNI, setUploadingCNI] = useState(false);
  const [uploadingResidence, setUploadingResidence] = useState(false);
  const [message, setMessage] = useState('');

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

  const userDetails = useSelector((state) => state.userDetails);
  const { user, loading: loadingDetails, error: errorDetails } = userDetails;

  const userUpdateProfil = useSelector((state) => state.userUpdateProfil);
  const {
    success: successUpdate,
    error: errorUpdate,
    loading: loadingUpdate,
  } = userUpdateProfil;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (isStaffUser) {
      // Les comptes institutionnels ne doivent pas charger de formulaire candidat
      return;
    } else {
      if (!user || !user.email) {
        dispatch(getUserDetails('profile'));
      } else {
        setCivilite(user.civilite || '');
        setPrenom(user.prenom || '');
        setNom(user.nom || '');
        if (user.dateNaissance) {
          const cleanDate = typeof user.dateNaissance === 'string'
            ? user.dateNaissance.replace(/\./g, '/').replace(/-/g, '/')
            : user.dateNaissance;
          const m = moment(cleanDate, ['DD/MM/YYYY', 'YYYY/MM/DD', 'DD-MM-YYYY', 'YYYY-MM-DD']);
          setDateNaissance(m.isValid() ? m.toDate() : null);
        } else {
          setDateNaissance(null);
        }
        setLieuNaissance(user.lieuNaissance);
        setVille(user.ville);
        setCodePostale(user.codePostale);
        setEmail(user.email);
        setCni(user.cni);
        setNationalite(user.nationalite);
        setPhone(user.phone);
        setAdresse(user.adresse);
        setCopieCNI(user.copieCNI);
        setPhone(user.phone);
        setVille(user.ville);
        setCodePostale(user.codePostale);
        setResidence(user.residence);
      }
    }

    if (successUpdate) {
      navigate(`/poste/${params.poste}/diplomes`);
    }
  }, [dispatch, userInfo, navigate, user, successUpdate, params]);

  const uploadCNi = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingCNI(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setCopieCNI(data.fileName);
      setUploadingCNI(false);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erreur lors du téléversement de la CNI'
      );
      setUploadingCNI(false);
    }
  };

  const uploadResidence = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingResidence(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setResidence(data.fileName);
      setUploadingResidence(false);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erreur lors du téléversement du certificat'
      );
      setUploadingResidence(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setMessage('');

    if (!civilite) {
      setMessage('Veuillez sélectionner la civilité (Madame / Monsieur)');
      return;
    }
    if (!nom || !nom.trim()) {
      setMessage('Veuillez renseigner votre Nom de famille (champ obligatoire)');
      return;
    }
    if (!prenom || !prenom.trim()) {
      setMessage('Veuillez renseigner votre Prénom (champ obligatoire)');
      return;
    }
    if (!dateNaissance) {
      setMessage('Veuillez renseigner votre Date de naissance (champ obligatoire)');
      return;
    }
    if (!lieuNaissance || !lieuNaissance.trim()) {
      setMessage('Veuillez renseigner votre Lieu de naissance (champ obligatoire)');
      return;
    }
    if (!cni || !cni.trim()) {
      setMessage('Veuillez renseigner votre numéro de CNI (champ obligatoire)');
      return;
    }
    if (!email || !email.trim()) {
      setMessage('Veuillez renseigner votre adresse Email (champ obligatoire)');
      return;
    }
    if (!nationalite || !nationalite.trim()) {
      setMessage('Veuillez renseigner votre Nationalité (champ obligatoire)');
      return;
    }
    if (!phone || !phone.trim()) {
      setMessage('Veuillez renseigner votre Numéro de téléphone (champ obligatoire)');
      return;
    }
    // Validation téléphone Marocain souple (06, 07, 05, +212, 00212)
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setMessage('Numéro de téléphone marocain invalide (ex: 0612345678 ou +212612345678)');
      return;
    }
    if (!adresse || !adresse.trim()) {
      setMessage('Veuillez renseigner votre Adresse de résidence (champ obligatoire)');
      return;
    }
    if (!ville || !ville.trim()) {
      setMessage('Veuillez renseigner votre Ville (champ obligatoire)');
      return;
    }
    if (!codePostale || !codePostale.toString().trim()) {
      setMessage('Veuillez renseigner votre Code postal (champ obligatoire)');
      return;
    }
    const cleanCP = codePostale.toString().trim();
    if (!/^\d{5}$/.test(cleanCP)) {
      setMessage('Le code postal doit être composé exactement de 5 chiffres');
      return;
    }
    if (!copieCNI) {
      setMessage('Veuillez téléverser la copie de votre CNI (champ obligatoire)');
      return;
    }

    dispatch(
      updateUserProfile({
        id: user._id,
        civilite,
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: moment(dateNaissance).format('DD.MM.YYYY'),
        lieuNaissance: lieuNaissance.trim(),
        email: email.trim(),
        cni: (cni || '').toUpperCase().trim(),
        nationalite: nationalite.trim(),
        phone: cleanPhone,
        adresse: adresse.trim(),
        ville: ville.trim(),
        codePostale: cleanCP,
        copieCNI,
        residence,
      })
    );
  };

  if (isStaffUser) {
    return (
      <>
        <Header />
        <Container className='py-5' style={{ maxWidth: '800px' }}>
          <Card
            className='border-0 shadow-lg text-center p-4 p-md-5'
            style={{ borderRadius: '20px', background: '#FFFFFF', marginTop: '30px' }}
          >
            <div className='mb-3'>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  fontSize: '38px',
                }}
              >
                <i className='fas fa-user-shield'></i>
              </span>
            </div>

            <h3 className='fw-bold mb-2' style={{ color: '#0F172A', fontSize: '24px' }}>
              Accès Réservé aux Candidats
            </h3>

            <p className='text-muted fs-6 mb-4' style={{ lineHeight: '1.6', maxWidth: '640px', margin: '0 auto' }}>
              Vous êtes actuellement connecté en tant que{' '}
              <strong className='text-primary'>
                {userInfo.isMaitreOuvrage
                  ? 'Responsable Recrutement RH'
                  : userInfo.isAdmin || userInfo.isAdministrateur
                  ? 'Super-Administrateur'
                  : 'Membre Commission Contrôle'}
              </strong>{' '}
              (<span className='fw-semibold text-dark'>{userInfo.prenom} {userInfo.nom}</span> — {userInfo.email}).
              <br />
              Conformément à la déontologie et aux règles de conformité CNDP (Loi 09-08),{' '}
              <strong style={{ color: '#DC2626' }}>
                les comptes recruteurs et administrateurs ne peuvent pas soumettre de candidatures
              </strong>.
            </p>

            <div
              className='p-4 mb-4 rounded-3 text-start'
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}
            >
              <div className='d-flex align-items-center gap-2 mb-2 text-dark fw-bold'>
                <i className='fas fa-info-circle text-primary'></i>
                <span>Que souhaitez-vous faire ?</span>
              </div>
              <ul className='mb-0 ps-3 text-secondary small' style={{ lineHeight: '1.8' }}>
                <li>
                  <strong>Pour tester le parcours candidat ou postuler :</strong> Déconnectez-vous de votre compte RH et créez un compte <strong>Candidat</strong> dédié.
                </li>
                <li>
                  <strong>Pour administrer ce concours et gérer les dossiers :</strong> Retournez à votre <strong>Tableau de Bord Recruteur RH</strong>.
                </li>
              </ul>
            </div>

            <div className='d-flex flex-column flex-sm-row justify-content-center gap-3 mt-2'>
              <Button
                variant='primary'
                className='px-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2'
                style={{ borderRadius: '10px', fontSize: '14px', background: '#2563EB', border: 'none' }}
                onClick={() => {
                  dispatch(logout());
                  navigate(`/register?redirect=/poste/${encodeURIComponent(params.poste)}`);
                }}
              >
                <i className='fas fa-user-plus'></i>
                Se déconnecter & Créer un compte Candidat
              </Button>

              <Button
                variant='outline-secondary'
                className='px-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2'
                style={{ borderRadius: '10px', fontSize: '14px' }}
                onClick={() => {
                  if (userInfo.isMaitreOuvrage) navigate('/maitre-ouvrage/candidatures');
                  else if (userInfo.isAdmin) navigate('/admin/dashboard');
                  else navigate('/');
                }}
              >
                <i className='fas fa-briefcase'></i>
                Retour à mon Espace Recruteur
              </Button>
            </div>
          </Card>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      {' '}
      <Header />
      <Heading title='Informations générales du candidat' poste={params.poste} />
      <PostulationSteps step1 step2 now={35} />
      <FormContainer>
        <h3 className='text-center my-3'>
          Veuillez remplir le formulaire suivant
        </h3>
        <Form onSubmit={submitHandler}>
          {message && (
            <Message variant={'danger'}>
              <i class='fas fa-exclamation-triangle'></i> {message}
            </Message>
          )}
          {errorUpdate && (
            <Message variant={'danger'}>
              <i class='fas fa-exclamation-triangle'></i> {errorUpdate}
            </Message>
          )}{' '}
          {errorDetails && (
            <Message variant={'danger'}>
              <i class='fas fa-exclamation-triangle'></i> {errorDetails}
            </Message>
          )}
          {loadingUpdate && <Spinner size={150} />}
          {loadingDetails ? (
            <Spinner size={150} />
          ) : (
            <>
              {' '}
              <Row>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-venus-mars text-primary me-2'></i> Civilité :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3 '>
                    <Form.Control
                      as='select'
                      style={{ borderRadius: '8px' }}
                      value={civilite}
                      onChange={(e) => {
                        setCivilite(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    >
                      <option value=''>Vous êtes un(e)...</option>
                      <option value='Madame'>1- Madame</option>
                      <option value='Monsieur'>2- Monsieur</option>
                    </Form.Control>
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='far fa-user text-primary me-2'></i> Nom :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3 '>
                    <Form.Control
                      type='text'
                      placeholder='Votre nom de famille'
                      style={{ borderRadius: '8px' }}
                      value={nom}
                      onChange={(e) => {
                        setNom(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='far fa-user text-primary me-2'></i> Prénom :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      type='text'
                      placeholder='Votre prénom'
                      style={{ borderRadius: '8px' }}
                      value={prenom}
                      onChange={(e) => {
                        setPrenom(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='far fa-calendar text-primary me-2'></i> Date de naissance :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Calendar
                      className='form-control'
                      value={dateNaissance || ''}
                      onChange={(d) => {
                        setDateNaissance(d);
                        if (message) setMessage('');
                      }}
                      date={'Date de Naissance'}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-map-pin text-primary me-2'></i> Lieu de naissance :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      type='text'
                      placeholder='Ville de naissance'
                      style={{ borderRadius: '8px' }}
                      value={lieuNaissance}
                      onChange={(e) => {
                        setLieuNaissance(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-globe-africa text-primary me-2'></i> Nationalité :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      as='select'
                      style={{ borderRadius: '8px' }}
                      value={nationalite}
                      onChange={(e) => {
                        setNationalite(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    >
                      <option value=''>
                        Sélectionnez votre nationalité...
                      </option>
                      <option value='Marocaine'>Marocaine</option>
                      <option value='Autre'>Autre...</option>
                    </Form.Control>
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-phone-alt text-primary me-2'></i> Téléphone :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      type='text'
                      placeholder='Ex: 0612345678'
                      style={{ borderRadius: '8px' }}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-id-card text-primary me-2'></i> Numéro CNI :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      type='text'
                      placeholder='Ex: AB123456'
                      style={{ borderRadius: '8px' }}
                      value={cni}
                      onChange={(e) => {
                        setCni(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-envelope text-primary me-2'></i> Email :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      type='email'
                      placeholder='exemple@email.com'
                      style={{ borderRadius: '8px' }}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-home text-primary me-2'></i> Adresse de résidence :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      type='text'
                      placeholder='Adresse complète'
                      style={{ borderRadius: '8px' }}
                      value={adresse}
                      onChange={(e) => {
                        setAdresse(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
                <Col md={6}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-city text-primary me-2'></i> Ville de résidence :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      type='text'
                      placeholder='Ville'
                      style={{ borderRadius: '8px' }}
                      value={ville}
                      onChange={(e) => {
                        setVille(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Label className='fw-bold mt-3'>
                    <i className='fas fa-map-marker-alt text-primary me-2'></i> Code postal (5 chiffres) :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      type='text'
                      placeholder='Ex: 20000'
                      style={{ borderRadius: '8px' }}
                      value={codePostale}
                      onChange={(e) => {
                        setCodePostale(e.target.value);
                        if (message) setMessage('');
                      }}
                      required
                    ></Form.Control>
                  </InputGroup>
                </Col>
                <Col md={6}>
                  <Form.Group className='position-relative mb-3'>
                    <Form.Label className='fw-bold mt-3 d-flex align-items-center justify-content-between'>
                      <span>
                        <i className='fas fa-id-card text-primary me-2'></i> Copie de la CNI :
                        <span className='text-danger ms-1'>*</span>
                      </span>
                      {uploadingCNI && (
                        <span className='badge bg-info text-dark'>
                          <i className='fas fa-spinner fa-spin me-1'></i> Envoi...
                        </span>
                      )}
                      {!uploadingCNI && copieCNI && (
                        <span className='badge bg-success-subtle text-success small' title={copieCNI}>
                          <i className='fas fa-check-circle me-1'></i> Prêt
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control
                      accept='.pdf,.png,.jpg,.jpeg'
                      type='file'
                      id='copieCNI-file'
                      label='Choisir un fichier'
                      custom
                      onChange={uploadCNi}
                      required={!copieCNI}
                      style={{ borderRadius: '8px' }}
                    ></Form.Control>
                    {copieCNI && (
                      <div className='small text-muted mt-1 text-truncate' style={{ maxWidth: '280px' }}>
                        Fichier : <strong>{copieCNI}</strong>
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Label className='fw-bold mt-3 d-flex align-items-center justify-content-between'>
                    <span><i className='fas fa-home text-secondary me-2'></i> Certificat de résidence :</span>
                    {uploadingResidence && (
                      <span className='badge bg-info text-dark'>
                        <i className='fas fa-spinner fa-spin me-1'></i> Envoi...
                      </span>
                    )}
                    {!uploadingResidence && residence && (
                      <span className='badge bg-success-subtle text-success small' title={residence}>
                        <i className='fas fa-check-circle me-1'></i> Prêt
                      </span>
                    )}
                  </Form.Label>
                  <InputGroup className='position-relative mb-3'>
                    <Form.Control
                      accept='.pdf,.png,.jpg,.jpeg'
                      type='file'
                      id='residence-file'
                      label='Choisir un fichier'
                      custom
                      onChange={uploadResidence}
                      style={{ borderRadius: '8px' }}
                    />
                    <span style={{ fontSize: '11px', display: 'block', width: '100%', marginTop: '4px' }} className='text-muted'>
                      À insérer si l'adresse de résidence est différente de celle de la CIN, sinon passer à l'étape suivante.
                    </span>
                    {residence && (
                      <div className='small text-muted mt-1 text-truncate' style={{ maxWidth: '280px' }}>
                        Fichier : <strong>{residence}</strong>
                      </div>
                    )}
                  </InputGroup>
                </Col>
              </Row>
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
                  <span>Sauvegarder et Continuer (Diplômes)</span>
                  <i className='fas fa-arrow-right ms-2'></i>
                </Button>
              </div>
            </>
          )}
        </Form>
      </FormContainer>
      <Footer />
    </>
  );
};

export default InformationsPersonnellesScreen;
