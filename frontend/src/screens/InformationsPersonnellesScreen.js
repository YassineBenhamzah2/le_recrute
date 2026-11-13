import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button, Row, Col, Container, Card } from 'react-bootstrap';
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
  const [nationalite, setNationalite] = useState('Marocaine');
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
  const [fieldErrors, setFieldErrors] = useState({});

  const userLogin = useSelector((state) => state.userLogin) || {};
  const { userInfo } = userLogin;

  const isStaffUser = Boolean(
    userInfo && (
      userInfo.isMaitreOuvrage ||
      userInfo.isAdmin ||
      userInfo.isAdministrateur ||
      userInfo.isController ||
      userInfo.isControlleur ||
      userInfo.isControleur1 ||
      userInfo.isControleur2 ||
      userInfo.role === 'rh' ||
      userInfo.role === 'admin'
    )
  );

  const userDetails = useSelector((state) => state.userDetails) || {};
  const { user, loading: loadingDetails, error: errorDetails } = userDetails;

  const userUpdateProfil = useSelector((state) => state.userUpdateProfil) || {};
  const {
    success: successUpdate,
    error: errorUpdate,
    errors: backendErrors,
    loading: loadingUpdate,
  } = userUpdateProfil;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (isStaffUser) {
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
          setDateNaissance(m.isValid() ? m.format('YYYY-MM-DD') : '');
        } else {
          setDateNaissance('');
        }
        setLieuNaissance(user.lieuNaissance || '');
        setVille(user.ville || '');
        setCodePostale(user.codePostale || '');
        setEmail(user.email || '');
        setCni(user.cni || '');
        setNationalite(user.nationalite || 'Marocaine');
        setPhone(user.phone || '');
        setAdresse(user.adresse || '');
        setCopieCNI(user.copieCNI || '');
        setResidence(user.residence || '');
      }
    }

    if (successUpdate) {
      navigate(`/poste/${params.poste}/diplomes`);
    }
  }, [dispatch, userInfo, navigate, user, successUpdate, params, isStaffUser]);

  // Synchronisation dynamique des erreurs backend
  useEffect(() => {
    if (backendErrors && typeof backendErrors === 'object') {
      setFieldErrors((prev) => ({ ...prev, ...backendErrors }));
    }
    if (errorUpdate) {
      setMessage(errorUpdate);
    }
  }, [backendErrors, errorUpdate]);

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (message) setMessage('');
  };

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
          ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      const fileName = data.fileName || data;
      setCopieCNI(fileName);
      setUploadingCNI(false);
      handleFieldChange('copieCNI', fileName, setCopieCNI);
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erreur lors du téléversement de la CNI';
      setFieldErrors((prev) => ({ ...prev, copieCNI: errMsg }));
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
          ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      const fileName = data.fileName || data;
      setResidence(fileName);
      setUploadingResidence(false);
      handleFieldChange('residence', fileName, setResidence);
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erreur lors du téléversement du certificat';
      setFieldErrors((prev) => ({ ...prev, residence: errMsg }));
      setUploadingResidence(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setMessage('');
    const errors = {};

    if (!civilite) {
      errors.civilite = 'Veuillez sélectionner votre civilité (Madame / Monsieur)';
    }
    if (!nom || !nom.trim()) {
      errors.nom = 'Le nom de famille est obligatoire';
    }
    if (!prenom || !prenom.trim()) {
      errors.prenom = 'Le prénom est obligatoire';
    }
    if (!dateNaissance) {
      errors.dateNaissance = 'La date de naissance est obligatoire';
    } else {
      const birthDate = moment(dateNaissance);
      const age = moment().diff(birthDate, 'years', true);
      if (age < 18) {
        errors.dateNaissance = 'Vous devez être âgé(e) d’au moins 18 ans pour postuler';
      } else if (age > 60) {
        errors.dateNaissance = 'L’âge maximum légal pour postuler est de 60 ans';
      }
    }
    if (!lieuNaissance || !lieuNaissance.trim()) {
      errors.lieuNaissance = 'Le lieu de naissance est obligatoire';
    }
    if (!nationalite || !nationalite.trim()) {
      errors.nationalite = 'La nationalité est obligatoire';
    }
    if (!phone || !phone.trim()) {
      errors.phone = 'Le numéro de téléphone est obligatoire';
    } else {
      const cleanPhone = phone.replace(/\s+/g, '');
      const phoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Numéro de téléphone marocain invalide (ex: 0612345678 ou +212612345678)';
      }
    }
    if (!cni || !cni.trim()) {
      errors.cni = 'Le numéro de CNI est obligatoire';
    }
    if (!email || !email.trim()) {
      errors.email = 'L’adresse email est obligatoire';
    }
    if (!adresse || !adresse.trim()) {
      errors.adresse = 'L’adresse de résidence est obligatoire';
    }
    if (!ville || !ville.trim()) {
      errors.ville = 'La ville de résidence est obligatoire';
    }
    if (!codePostale || !codePostale.toString().trim()) {
      errors.codePostale = 'Le code postal est obligatoire (5 chiffres)';
    } else {
      const cleanCP = codePostale.toString().trim();
      if (!/^\d{5}$/.test(cleanCP)) {
        errors.codePostale = 'Le code postal doit être composé exactement de 5 chiffres (ex: 20000)';
      }
    }
    if (!copieCNI) {
      errors.copieCNI = 'Veuillez téléverser la copie scannée de votre CIN (recto/verso)';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage('Veuillez renseigner tous les champs obligatoires marqués en rouge ci-dessous');
      return;
    }

    setFieldErrors({});

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
        phone: phone.replace(/\s+/g, ''),
        adresse: adresse.trim(),
        ville: ville.trim(),
        codePostale: codePostale.toString().trim(),
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

            <div className='d-flex flex-column flex-sm-row gap-3 justify-content-center pt-2'>
              <Button
                variant='outline-danger'
                className='fw-bold py-2 px-4'
                style={{ borderRadius: '10px' }}
                onClick={() => {
                  dispatch(logout());
                  navigate(`/register?redirect=/poste/${encodeURIComponent(params.poste)}`);
                }}
              >
                <i className='fas fa-user-plus me-2'></i> Se déconnecter & Créer un compte Candidat
              </Button>
              <Button
                variant='primary'
                className='fw-bold py-2 px-4'
                style={{ borderRadius: '10px', background: '#2563EB' }}
                onClick={() => {
                  if (userInfo.isMaitreOuvrage) navigate('/maitre-ouvrage/candidatures');
                  else if (userInfo.isAdmin) navigate('/admin/dashboard');
                  else navigate('/controlleur/candidatures');
                }}
              >
                <i className='fas fa-arrow-left me-2'></i> Retour à mon Espace Recruteur
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
      <Header />
      <Heading title='Informations générales du candidat' poste={params.poste} />
      <PostulationSteps step1 step2 now={35} />
      <FormContainer>
        <h3 className='text-center my-3 fw-bold' style={{ color: '#0F172A' }}>
          Veuillez remplir le formulaire suivant
        </h3>

        {/* Global error banner if present */}
        {message && (
          <div className='alert alert-danger py-2 d-flex align-items-center gap-2 mb-3' style={{ borderRadius: '10px' }}>
            <i className='fas fa-exclamation-triangle fs-5 text-danger'></i>
            <span>{message}</span>
          </div>
        )}

        {errorDetails && (
          <div className='alert alert-danger py-2 d-flex align-items-center gap-2 mb-3' style={{ borderRadius: '10px' }}>
            <i className='fas fa-exclamation-triangle fs-5 text-danger'></i>
            <span>{errorDetails}</span>
          </div>
        )}

        <Form noValidate onSubmit={submitHandler}>
          {loadingUpdate && <Spinner size={150} />}
          {loadingDetails ? (
            <Spinner size={150} />
          ) : (
            <>
              {/* LIGNE 1 : Civilité, Nom, Prénom */}
              <Row>
                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-venus-mars text-primary me-2'></i> Civilité :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Select
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.civilite ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.civilite ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={civilite}
                    onChange={(e) => handleFieldChange('civilite', e.target.value, setCivilite)}
                  >
                    <option value=''>Vous êtes un(e)...</option>
                    <option value='Madame'>Madame</option>
                    <option value='Monsieur'>Monsieur</option>
                  </Form.Select>
                  {fieldErrors.civilite && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.civilite}</span>
                    </div>
                  )}
                </Col>

                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='far fa-user text-primary me-2'></i> Nom :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Votre nom de famille'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.nom ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.nom ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={nom}
                    onChange={(e) => handleFieldChange('nom', e.target.value, setNom)}
                  />
                  {fieldErrors.nom && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.nom}</span>
                    </div>
                  )}
                </Col>

                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='far fa-user text-primary me-2'></i> Prénom :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Votre prénom'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.prenom ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.prenom ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={prenom}
                    onChange={(e) => handleFieldChange('prenom', e.target.value, setPrenom)}
                  />
                  {fieldErrors.prenom && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.prenom}</span>
                    </div>
                  )}
                </Col>
              </Row>

              {/* LIGNE 2 : Date de naissance, Lieu de naissance, Nationalité */}
              <Row>
                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='far fa-calendar text-primary me-2'></i> Date de naissance :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='date'
                    max={moment().subtract(18, 'years').format('YYYY-MM-DD')}
                    min={moment().subtract(65, 'years').format('YYYY-MM-DD')}
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.dateNaissance ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.dateNaissance ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={dateNaissance}
                    onChange={(e) => handleFieldChange('dateNaissance', e.target.value, setDateNaissance)}
                  />
                  {fieldErrors.dateNaissance && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.dateNaissance}</span>
                    </div>
                  )}
                </Col>

                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-map-pin text-primary me-2'></i> Lieu de naissance :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Ville de naissance'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.lieuNaissance ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.lieuNaissance ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={lieuNaissance}
                    onChange={(e) => handleFieldChange('lieuNaissance', e.target.value, setLieuNaissance)}
                  />
                  {fieldErrors.lieuNaissance && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.lieuNaissance}</span>
                    </div>
                  )}
                </Col>

                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-globe-africa text-primary me-2'></i> Nationalité :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Select
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.nationalite ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.nationalite ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={nationalite}
                    onChange={(e) => handleFieldChange('nationalite', e.target.value, setNationalite)}
                  >
                    <option value='Marocaine'>Marocaine</option>
                    <option value='Autre'>Autre...</option>
                  </Form.Select>
                  {fieldErrors.nationalite && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.nationalite}</span>
                    </div>
                  )}
                </Col>
              </Row>

              {/* LIGNE 3 : Téléphone, Numéro CNI, Email */}
              <Row>
                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-phone-alt text-primary me-2'></i> Téléphone :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='tel'
                    placeholder='Ex: 0612345678'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.phone ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.phone ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value, setPhone)}
                  />
                  {fieldErrors.phone && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.phone}</span>
                    </div>
                  )}
                </Col>

                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-id-card text-primary me-2'></i> Numéro CNI :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Ex: WA121212'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.cni ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.cni ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={cni}
                    onChange={(e) => handleFieldChange('cni', e.target.value.toUpperCase(), setCni)}
                  />
                  {fieldErrors.cni && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.cni}</span>
                    </div>
                  )}
                </Col>

                <Col md={4} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-envelope text-primary me-2'></i> Email :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='exemple@email.com'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.email ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.email ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={email}
                    onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
                  />
                  {fieldErrors.email && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}
                </Col>
              </Row>

              {/* LIGNE 4 : Adresse de résidence, Ville de résidence */}
              <Row>
                <Col md={6} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-home text-primary me-2'></i> Adresse de résidence :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Adresse complète'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.adresse ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.adresse ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={adresse}
                    onChange={(e) => handleFieldChange('adresse', e.target.value, setAdresse)}
                  />
                  {fieldErrors.adresse && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.adresse}</span>
                    </div>
                  )}
                </Col>

                <Col md={6} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-city text-primary me-2'></i> Ville de résidence :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Ville'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.ville ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.ville ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={ville}
                    onChange={(e) => handleFieldChange('ville', e.target.value, setVille)}
                  />
                  {fieldErrors.ville && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.ville}</span>
                    </div>
                  )}
                </Col>
              </Row>

              {/* LIGNE 5 : Code postal (5 chiffres), Copie de la CNI */}
              <Row>
                <Col md={6} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>
                    <i className='fas fa-map-marker-alt text-primary me-2'></i> Code postal (5 chiffres) :
                    <span className='text-danger ms-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    maxLength='5'
                    placeholder='Ex: 20000'
                    style={{
                      borderRadius: '8px',
                      height: '46px',
                      border: fieldErrors.codePostale ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.codePostale ? '#FEF2F2' : '#FFFFFF',
                    }}
                    value={codePostale}
                    onChange={(e) => handleFieldChange('codePostale', e.target.value, setCodePostale)}
                  />
                  {fieldErrors.codePostale && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.codePostale}</span>
                    </div>
                  )}
                </Col>

                <Col md={6} className='mb-3'>
                  <Form.Label className='fw-bold small text-muted d-flex align-items-center justify-content-between'>
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
                        <i className='fas fa-check-circle me-1'></i> Fichier attaché
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control
                    accept='.pdf,.png,.jpg,.jpeg'
                    type='file'
                    id='copieCNI-file'
                    style={{
                      borderRadius: '8px',
                      border: fieldErrors.copieCNI ? '1.5px solid #EF4444' : '1px solid #ced4da',
                      background: fieldErrors.copieCNI ? '#FEF2F2' : '#FFFFFF',
                    }}
                    onChange={uploadCNi}
                  />
                  {copieCNI && (
                    <div className='small text-muted mt-1 text-truncate' style={{ maxWidth: '320px', fontSize: '11.5px' }}>
                      <i className='fas fa-file-alt text-success me-1'></i> {copieCNI}
                    </div>
                  )}
                  {fieldErrors.copieCNI && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.copieCNI}</span>
                    </div>
                  )}
                </Col>
              </Row>

              {/* LIGNE 6 : Certificat de résidence (Optionnel) */}
              <Row>
                <Col md={12} className='mb-4'>
                  <Form.Label className='fw-bold small text-muted d-flex align-items-center justify-content-between'>
                    <span><i className='fas fa-home text-secondary me-2'></i> Certificat de résidence (Optionnel) :</span>
                    {uploadingResidence && (
                      <span className='badge bg-info text-dark'>
                        <i className='fas fa-spinner fa-spin me-1'></i> Envoi...
                      </span>
                    )}
                    {!uploadingResidence && residence && (
                      <span className='badge bg-success-subtle text-success small' title={residence}>
                        <i className='fas fa-check-circle me-1'></i> Fichier attaché
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control
                    accept='.pdf,.png,.jpg,.jpeg'
                    type='file'
                    id='residence-file'
                    style={{ borderRadius: '8px' }}
                    onChange={uploadResidence}
                  />
                  <div style={{ fontSize: '11.5px' }} className='text-muted mt-1'>
                    À insérer uniquement si votre adresse de résidence actuelle diffère de celle mentionnée sur votre CIN.
                  </div>
                  {residence && (
                    <div className='small text-muted mt-1 text-truncate' style={{ maxWidth: '320px', fontSize: '11.5px' }}>
                      <i className='fas fa-file-alt text-success me-1'></i> {residence}
                    </div>
                  )}
                  {fieldErrors.residence && (
                    <div className='text-danger small mt-1 d-flex align-items-center gap-1' style={{ fontSize: '11.5px', fontWeight: '500' }}>
                      <i className='fas fa-exclamation-circle'></i>
                      <span>{fieldErrors.residence}</span>
                    </div>
                  )}
                </Col>
              </Row>

              {/* SUBMIT BUTTON */}
              <div className='text-end gap-2 mb-3'>
                <Button
                  type='submit'
                  disabled={loadingUpdate}
                  style={{
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '12px 28px',
                    fontWeight: '700',
                    fontSize: '14.5px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  {loadingUpdate ? (
                    <>
                      <i className='fas fa-spinner fa-spin me-2'></i> Enregistrement...
                    </>
                  ) : (
                    <>
                      <span>Sauvegarder et Continuer (Diplômes)</span>
                      <i className='fas fa-arrow-right ms-2'></i>
                    </>
                  )}
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
