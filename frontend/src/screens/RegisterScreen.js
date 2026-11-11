import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import { useLocation } from 'react-router-dom';
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
import Calendar from '../components/Calendar';
import moment from 'moment';
import isAlpha from 'validator/es/lib/isAlpha';
import isUppercase from 'validator/es/lib/isUppercase';
import isAlphanumeric from 'validator/es/lib/isAlphanumeric';
import trim from 'validator/es/lib/trim';
import 'moment/locale/fr';

const RegisterScreen = () => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();

  const location = useLocation();
  const navigate = useNavigate();

  var hasNumber = /\d/;

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [cni, setCni] = useState('');
  const [message, setMessage] = useState(null);
  const [isBac, setIsBac] = useState(false);
  const [dateNaissance, setDateNaissance] = useState('');
  const [dateObtentionBac, setDateObtentionBac] = useState('');

  const userRegister = useSelector((state) => state.userRegister);
  const {
    loading: loadingRegister,
    error: errorRegister,
    userInfo,
    success: successRegister,
  } = userRegister;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
    if (successRegister) {
      addToast('Votre compte a ete bien cree', {
        appearance: 'success',
        autoDismiss: true,
      });
      navigate('/');
      dispatch({ type: USER_REGISTER_RESET });
    }
  }, [navigate, redirect, userInfo, successRegister, addToast, dispatch]);

  const dateHandler = (dateNaissance) => {
    setDateNaissance(dateNaissance);
  };

  const submitHandler = (e) => {
    moment.locale('fr');
    e.preventDefault();

    console.log(moment(dateNaissance).format('L'));

    if (
      !prenom ||
      !nom ||
      !cni ||
      !email ||
      !dateNaissance ||
      !mdp ||
      !dateObtentionBac
    ) {
      setMessage('Veuillez remplir tous les champs');
    } else {
      const cleanNom = nom.trim().toUpperCase();
      const cleanPrenom = prenom.trim().toUpperCase();
      const cleanCni = cni.trim().toUpperCase();

      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(nom) || !/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(prenom)) {
        setMessage('Le nom et prénom ne doivent contenir que des lettres');
      } else {
        if (
          !isAlphanumeric(cleanCni) ||
          cleanCni.length > 10 ||
          cleanCni.length < 5 ||
          cleanCni.indexOf(' ') !== -1 ||
          /^\d/.test(cleanCni) ||
          !hasNumber.test(cleanCni)
        ) {
          setMessage('CNI invalide (Ex: WA141414, BE88990)');
        } else {
          if (!isBac) {
            setMessage('Le baccalauréat est obligatoire pour ce concours');
          } else {
            if (mdp !== confirmMdp) {
              setMessage('Les mots de passes ne sont pas identiques');
            } else {
              if (moment().diff(dateNaissance, 'years', true) > 29) {
                setMessage('Age maximum dépassé (29 ans maximum)');
              } else {
                if (moment().diff(dateNaissance, 'years', true) < 18) {
                  setMessage('Age incorrect (18 ans minimum)');
                } else {
                  if (
                    moment(dateObtentionBac).year() <
                      moment(dateNaissance).year() + 16 ||
                    moment(dateObtentionBac).year() >
                      moment(dateNaissance).year() + 30
                  ) {
                    setMessage("Date d'obtention de baccalaureat erronee");
                  } else {
                    dispatch(
                      registerUser(
                        cleanPrenom,
                        cleanNom,
                        cleanCni,
                        email.trim(),
                        moment(dateNaissance).format('L'),
                        mdp,
                        dateObtentionBac
                      )
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  return (
    <>
      <Header />
      <Heading
        title={'Inscrivez-vous'}
        text={'Remplissez le formulaire, pour créer un compte'}
      />

      <Row>
        <div className='landing-inner '>
          <FormContainer>
            <h3 className='mb-4 mt-4'>
              <i class='fas fa-user-plus'></i>{' '}
              <strong> Remplissez le formulaire suivant</strong>
            </h3>
            <Form onSubmit={submitHandler}>
              {message && <Message variant='danger'>{message}</Message>}
              {loadingRegister && <Spinner size={120} />}
              {errorRegister && (
                <Message variant={'danger'}>{errorRegister}</Message>
              )}
              <>
                <InputGroup className='mb-3'>
                  <InputGroup.Text>
                    <i className='fas fa-user-circle '></i>
                  </InputGroup.Text>
                  <Form.Control
                    type='text'
                    placeholder='Prénom'
                    style={{ borderRadius: '0' }}
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  ></Form.Control>
                </InputGroup>

                <InputGroup className='mb-3'>
                  <InputGroup.Text>
                    <i className='fas fa-user-circle '></i>
                  </InputGroup.Text>
                  <Form.Control
                    type='nom'
                    placeholder='Nom'
                    style={{ borderRadius: '0' }}
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  ></Form.Control>
                </InputGroup>

                <InputGroup className='mb-3'>
                  <InputGroup.Text>
                    <i className='fas fa-id-card'></i>
                  </InputGroup.Text>
                  <Form.Control
                    type='text'
                    placeholder='CNI'
                    style={{ borderRadius: '0' }}
                    value={cni}
                    onChange={(e) => setCni(e.target.value)}
                  ></Form.Control>
                </InputGroup>

                <InputGroup className='mb-3'>
                  <InputGroup.Text>
                    <i className='fas fa-envelope'></i>
                  </InputGroup.Text>
                  <Form.Control
                    type='email'
                    placeholder='Email'
                    style={{ borderRadius: '0' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  ></Form.Control>
                </InputGroup>

                <InputGroup className='mb-3'>
                  <InputGroup.Text>
                    <i className='far fa-calendar'></i>
                  </InputGroup.Text>
                  <Calendar
                    value={dateNaissance}
                    // value={dateNaissance && moment(dateNaissance, 'DD MM YYYY')}
                    onChange={dateHandler}
                    date={'Date de Naissance'}
                  />
                </InputGroup>

                <InputGroup className='mb-3'>
                  <InputGroup.Text>
                    <i className='fas fa-lock '></i>
                  </InputGroup.Text>
                  <Form.Control
                    type='password'
                    placeholder='Mot de passe'
                    style={{ borderRadius: '0' }}
                    value={mdp}
                    onChange={(e) => setMdp(e.target.value)}
                  ></Form.Control>
                </InputGroup>

                <InputGroup className='mb-3'>
                  <InputGroup.Text>
                    <i className='fas fa-lock '></i>
                  </InputGroup.Text>
                  <Form.Control
                    type='password'
                    placeholder='Confirmer votre mot de passe'
                    style={{ borderRadius: '0' }}
                    value={confirmMdp}
                    onChange={(e) => setConfirmMdp(e.target.value)}
                  ></Form.Control>
                </InputGroup>
                <InputGroup InputGroup controlId='isBac' className='mb-3'>
                  <Form.Check
                    style={{ color: '#000' }}
                    type='checkbox'
                    label='Avez-vous le baccalauréat '
                    checked={isBac}
                    onChange={(e) => setIsBac(e.target.checked)}
                  ></Form.Check>
                </InputGroup>

                {isBac && (
                  <InputGroup className='mb-3'>
                    <InputGroup.Text>
                      <i className='far fa-calendar'></i>
                    </InputGroup.Text>
                    <Calendar
                      value={dateObtentionBac}
                      // value={dateNaissance && moment(dateNaissance, 'DD MM YYYY')}
                      onChange={(dateObtentionBac) =>
                        setDateObtentionBac(dateObtentionBac)
                      }
                      date={'Date de Bac'}
                    />
                  </InputGroup>
                )}

                <div className='d-grid gap-2'>
                  <Button type='submit' variant='btn btn-outline-warning mb-4'>
                    <i className='fas fa-sign-in-alt fa-lg'></i> Inscrivez-vous
                  </Button>
                </div>
              </>
            </Form>
            <Row className='py-3'>
              <Col style={{ color: 'black' }}>
                Vous avez un compte,
                <Link
                  to={redirect ? `/login?redirect=${redirect}` : '/login'}
                  className='fw-bold'
                >
                  Connectez-vous
                </Link>
              </Col>
            </Row>
          </FormContainer>
        </div>
      </Row>
      <Footer />
    </>
  );
};

export default RegisterScreen;
