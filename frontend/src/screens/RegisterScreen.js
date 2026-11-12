import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Row, Col, Container, Card } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import Heading from '../components/Heading';
import Spinner from '../components/Spinner';
import { registerUser } from '../actions/userActions';
import Message from '../components/Message';
import { useNavigate } from 'react-router';
import { USER_REGISTER_RESET } from '../constants/userConstants';
import Header from '../components/Header';
import Footer from '../components/Footer';
import moment from 'moment';
import isAlphanumeric from 'validator/es/lib/isAlphanumeric';
import 'moment/locale/fr';

const RegisterScreen = () => {
  moment.locale('fr');
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const location = useLocation();
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [cni, setCni] = useState('');
  const [message, setMessage] = useState(null);
  const [isBac, setIsBac] = useState(true);
  const [dateNaissance, setDateNaissance] = useState('');
  const [dateObtentionBac, setDateObtentionBac] = useState('');
  const [showMdp, setShowMdp] = useState(false);
  const [showConfirmMdp, setShowConfirmMdp] = useState(false);

  const userRegister = useSelector((state) => state.userRegister);
  const {
    loading: loadingRegister,
    error: errorRegister,
    userInfo,
    success: successRegister,
  } = userRegister;

  const redirect = location.search ? location.search.split('=')[1] : '/';
  const targetPoste =
    redirect && redirect.startsWith('/poste/')
      ? decodeURIComponent(redirect.replace('/poste/', '').split('/')[0])
      : null;

  useEffect(() => {
    if (userInfo) {
      navigate(redirect && redirect !== '/' ? redirect : '/profile');
    }
    if (successRegister) {
      addToast('Votre compte candidat a été créé avec succès !', {
        appearance: 'success',
        autoDismiss: true,
      });
      navigate(redirect && redirect !== '/' ? redirect : '/profile');
      dispatch({ type: USER_REGISTER_RESET });
    }
  }, [navigate, redirect, userInfo, successRegister, addToast, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    setMessage(null);

    if (!prenom || !nom || !cni || !email || !dateNaissance || !mdp || !confirmMdp) {
      setMessage('Veuillez remplir tous les champs obligatoires marqués d’un astérisque (*)');
      return;
    }

    const cleanNom = nom.trim().toUpperCase();
    const cleanPrenom = prenom.trim();
    const cleanCni = cni.trim().toUpperCase();

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(cleanNom) || !/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(cleanPrenom)) {
      setMessage('Le nom et prénom ne doivent comporter que des lettres alphabétiques');
      return;
    }

    if (!isAlphanumeric(cleanCni) || cleanCni.length > 10 || cleanCni.length < 4 || cleanCni.indexOf(' ') !== -1) {
      setMessage('Format de numéro CNI invalide (Ex: WA141414, BE88990)');
      return;
    }

    if (!isBac) {
      setMessage('Le baccalauréat est obligatoire pour postuler aux concours nationaux');
      return;
    }

    if (mdp.length < 6) {
      setMessage('Le mot de passe doit comporter au moins 6 caractères');
      return;
    }

    if (mdp !== confirmMdp) {
      setMessage('Les mots de passe saisis ne sont pas identiques');
      return;
    }

    const birthDate = moment(dateNaissance);
    const age = moment().diff(birthDate, 'years', true);

    if (age < 18) {
      setMessage('Âge minimum requis non atteint (18 ans révolus)');
      return;
    }
    if (age > 45) {
      setMessage('Âge maximum dépassé pour ce concours (45 ans révolus)');
      return;
    }

    if (dateObtentionBac) {
      const bacYear = moment(dateObtentionBac).year();
      const birthYear = birthDate.year();
      if (bacYear < birthYear + 15 || bacYear > birthYear + 35) {
        setMessage("La date d'obtention du baccalauréat semble incohérente avec votre date de naissance");
        return;
      }
    }

    const formattedBirthDate = moment(dateNaissance).format('DD.MM.YYYY');
    const formattedBacDate = dateObtentionBac ? moment(dateObtentionBac).format('YYYY-MM-DD') : '';

    dispatch(
      registerUser(
        cleanPrenom,
        cleanNom,
        cleanCni,
        email.trim(),
        formattedBirthDate,
        mdp,
        formattedBacDate
      )
    );
  };

  return (
    <>
      <Header />
      <Heading
        title='Création de Dossier Candidat'
        poste={targetPoste}
        text='Inscrivez-vous sur le Portail National pour postuler officiellement et suivre votre classement'
      />

      <div style={{ background: '#F8FAFC', minHeight: '80vh', padding: '40px 15px 70px' }}>
        <Container style={{ maxWidth: '760px' }}>
          <Card
            className='border-0 shadow-sm p-4 p-md-5'
            style={{
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.08)',
            }}
          >
            {/* Header section inside card */}
            <div className='text-center mb-4'>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563EB',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  marginBottom: '14px',
                }}
              >
                <i className='fas fa-user-plus'></i>
              </div>
              <h3 className='fw-bold text-dark mb-1' style={{ fontSize: '24px' }}>
                Formulaire d'Inscription Candidat
              </h3>
              <p className='text-muted small mb-0'>
                Renseignez vos coordonnées officielles certifiées (CNDP / Loi 09-08)
              </p>
            </div>

            {/* Target Job Callout Banner */}
            {targetPoste && (
              <div
                className='p-3 rounded-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2'
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
              >
                <div className='d-flex align-items-center gap-3'>
                  <span
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#1D4ED8',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    <i className='fas fa-briefcase'></i>
                  </span>
                  <div>
                    <div className='small text-primary fw-bold' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Candidature ciblée
                    </div>
                    <div className='fw-bold text-dark' style={{ fontSize: '16px' }}>
                      {targetPoste}
                    </div>
                  </div>
                </div>
                <span className='badge bg-primary px-3 py-2 fw-semibold' style={{ borderRadius: '8px', fontSize: '11px' }}>
                  Session 2026
                </span>
              </div>
            )}

            {/* Error & Status Alerts */}
            {message && (
              <Message variant='danger'>
                <i className='fas fa-exclamation-triangle me-2'></i> {message}
              </Message>
            )}
            {errorRegister && (
              <Message variant='danger'>
                <i className='fas fa-exclamation-circle me-2'></i> {errorRegister}
              </Message>
            )}
            {loadingRegister && <Spinner size={80} />}

            <Form onSubmit={submitHandler}>
              {/* SECTION 1: ÉTAT CIVIL */}
              <div className='mb-4'>
                <div className='d-flex align-items-center gap-2 mb-3 pb-2 border-bottom'>
                  <span className='badge bg-light text-primary border fw-bold'>1</span>
                  <span className='fw-bold text-dark small text-uppercase' style={{ letterSpacing: '0.05em' }}>
                    État Civil & Identité
                  </span>
                </div>

                <Row className='g-3 mb-3'>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className='fw-bold small text-muted'>Prénom *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ background: '#F8FAFC', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                          <i className='fas fa-user text-muted'></i>
                        </InputGroup.Text>
                        <Form.Control
                          type='text'
                          placeholder='Ex: Karim'
                          value={prenom}
                          onChange={(e) => setPrenom(e.target.value)}
                          required
                          style={{ borderRadius: '0 10px 10px 0', borderLeft: 'none', height: '46px' }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className='fw-bold small text-muted'>Nom de famille *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ background: '#F8FAFC', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                          <i className='fas fa-user text-muted'></i>
                        </InputGroup.Text>
                        <Form.Control
                          type='text'
                          placeholder='Ex: El Amrani'
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          required
                          style={{ borderRadius: '0 10px 10px 0', borderLeft: 'none', height: '46px' }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className='g-3 mb-3'>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className='fw-bold small text-muted'>Numéro CNI (Carte Nationale) *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ background: '#F8FAFC', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                          <i className='fas fa-id-card text-muted'></i>
                        </InputGroup.Text>
                        <Form.Control
                          type='text'
                          placeholder='Ex: WA141414'
                          value={cni}
                          onChange={(e) => setCni(e.target.value.toUpperCase())}
                          required
                          style={{ borderRadius: '0 10px 10px 0', borderLeft: 'none', height: '46px', textTransform: 'uppercase' }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className='fw-bold small text-muted'>Date de Naissance *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ background: '#F8FAFC', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                          <i className='fas fa-calendar-alt text-muted'></i>
                        </InputGroup.Text>
                        <Form.Control
                          type='date'
                          value={dateNaissance}
                          max={moment().subtract(18, 'years').format('YYYY-MM-DD')}
                          min={moment().subtract(45, 'years').format('YYYY-MM-DD')}
                          onChange={(e) => setDateNaissance(e.target.value)}
                          required
                          style={{ borderRadius: '0 10px 10px 0', borderLeft: 'none', height: '46px' }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold small text-muted'>Adresse Email Officielle *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: '#F8FAFC', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                      <i className='fas fa-envelope text-muted'></i>
                    </InputGroup.Text>
                    <Form.Control
                      type='email'
                      placeholder='Ex: karim.elamrani@gmail.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ borderRadius: '0 10px 10px 0', borderLeft: 'none', height: '46px' }}
                    />
                  </InputGroup>
                  <Form.Text className='text-muted small'>
                    Cette adresse servira à la réception des convocations officielles et des notifications d'admission.
                  </Form.Text>
                </Form.Group>
              </div>

              {/* SECTION 2: BACCALAURÉAT */}
              <div className='mb-4'>
                <div className='d-flex align-items-center gap-2 mb-3 pb-2 border-bottom'>
                  <span className='badge bg-light text-primary border fw-bold'>2</span>
                  <span className='fw-bold text-dark small text-uppercase' style={{ letterSpacing: '0.05em' }}>
                    Diplôme de Base
                  </span>
                </div>

                <div
                  className='p-3 rounded-3 mb-3'
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                >
                  <Form.Check
                    type='checkbox'
                    id='isBac'
                    className='fw-bold text-dark'
                    label='Je certifie sur l’honneur être titulaire du Baccalauréat marocain ou équivalent'
                    checked={isBac}
                    onChange={(e) => setIsBac(e.target.checked)}
                  />

                  {isBac && (
                    <div className='mt-3 pt-3 border-top'>
                      <Row className='g-2 align-items-center'>
                        <Col md={6}>
                          <Form.Label className='fw-bold small text-muted'>
                            <i className='fas fa-graduation-cap text-success me-1'></i> Année / Date d'Obtention du Bac *
                          </Form.Label>
                          <Form.Control
                            type='date'
                            value={dateObtentionBac}
                            onChange={(e) => setDateObtentionBac(e.target.value)}
                            required
                            style={{ borderRadius: '10px', height: '44px' }}
                          />
                        </Col>
                        <Col md={6}>
                          <div className='small text-muted pt-md-3' style={{ fontSize: '11.5px', lineHeight: '1.4' }}>
                            Obligatoire pour le calcul de votre score de barème et l'éligibilité aux épreuves écrites.
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: SÉCURITÉ */}
              <div className='mb-4'>
                <div className='d-flex align-items-center gap-2 mb-3 pb-2 border-bottom'>
                  <span className='badge bg-light text-primary border fw-bold'>3</span>
                  <span className='fw-bold text-dark small text-uppercase' style={{ letterSpacing: '0.05em' }}>
                    Sécurité du Compte
                  </span>
                </div>

                <Row className='g-3'>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className='fw-bold small text-muted'>Mot de passe *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ background: '#F8FAFC', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                          <i className='fas fa-lock text-muted'></i>
                        </InputGroup.Text>
                        <Form.Control
                          type={showMdp ? 'text' : 'password'}
                          placeholder='Minimum 6 caractères'
                          value={mdp}
                          onChange={(e) => setMdp(e.target.value)}
                          required
                          style={{ borderLeft: 'none', borderRight: 'none', height: '46px' }}
                        />
                        <Button
                          variant='light'
                          style={{ border: '1px solid #ced4da', borderLeft: 'none', borderRadius: '0 10px 10px 0', background: '#F8FAFC' }}
                          onClick={() => setShowMdp(!showMdp)}
                        >
                          <i className={`fas ${showMdp ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className='fw-bold small text-muted'>Confirmer le mot de passe *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ background: '#F8FAFC', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                          <i className='fas fa-lock text-muted'></i>
                        </InputGroup.Text>
                        <Form.Control
                          type={showConfirmMdp ? 'text' : 'password'}
                          placeholder='Confirmer mot de passe'
                          value={confirmMdp}
                          onChange={(e) => setConfirmMdp(e.target.value)}
                          required
                          style={{ borderLeft: 'none', borderRight: 'none', height: '46px' }}
                        />
                        <Button
                          variant='light'
                          style={{ border: '1px solid #ced4da', borderLeft: 'none', borderRadius: '0 10px 10px 0', background: '#F8FAFC' }}
                          onClick={() => setShowConfirmMdp(!showConfirmMdp)}
                        >
                          <i className={`fas ${showConfirmMdp ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Trust Badge */}
              <div
                className='p-3 mb-4 rounded-3 d-flex align-items-center gap-2'
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: '12px' }}
              >
                <i className='fas fa-shield-alt text-success fs-5'></i>
                <span>Vos données personnelles sont protégées par chiffrement cryptographique SHA-256 conformément à la Loi 09-08 (CNDP Maroc).</span>
              </div>

              {/* Submit CTA */}
              <Button
                type='submit'
                disabled={loadingRegister}
                className='w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2'
                style={{
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                }}
              >
                {loadingRegister ? (
                  <>
                    <i className='fas fa-spinner fa-spin'></i> Création en cours...
                  </>
                ) : (
                  <>
                    <i className='fas fa-user-plus'></i> Créer mon Compte Candidat & Postuler
                  </>
                )}
              </Button>
            </Form>

            {/* Login Link */}
            <div className='text-center mt-4 pt-3 border-top'>
              <span className='text-muted small'>Vous disposez déjà d'un compte candidat ? </span>
              <Link
                to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
                className='fw-bold text-primary small text-decoration-none'
              >
                Connectez-vous ici <i className='fas fa-arrow-right ms-1'></i>
              </Link>
            </div>
          </Card>
        </Container>
      </div>

      <Footer />
    </>
  );
};

export default RegisterScreen;
