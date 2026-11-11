import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import { useLocation } from 'react-router-dom';
import Heading from '../components/Heading';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '../components/Spinner';
import Message from '../components/Message';
import { useNavigate } from 'react-router';
import { loginUser } from '../actions/userActions';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LoginScreen = () => {
  const dispatch = useDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [message, setMessage] = useState('');

  const redirect = location.search ? location.search.split('=')[1] : '/';

  const userLogin = useSelector((state) => state.userLogin);
  const { loading: loadingLogin, error: errorLogin, userInfo } = userLogin;

  useEffect(() => {
    if (userInfo) {
      if (userInfo.isAdmin) {
        navigate('/admin/dashboard');
      } else if (userInfo.isMaitreOuvrage) {
        navigate('/maitre-ouvrage/candidatures');
      } else if (userInfo.isController) {
        navigate('/controlleurs/dashboard');
      } else {
        navigate(redirect === '/' ? '/profile' : redirect);
      }
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(loginUser(email, mdp));
  };

  return (
    <>
      <Header />
      <Heading title={`Authentification`} />
      <Row>
        <div className='landing-inner mb-4 mt-5'>
          <FormContainer>
            <h3 className='mb-4 mt-4'>
              <strong> Connectez-vous a votre espace </strong>
            </h3>
            <Form onSubmit={submitHandler}>
              {message && <Message variant='danger'>{message}</Message>}
              {errorLogin && (
                <Message variant={'danger'}>
                  <i className='fas fa-exclamation-triangle'></i> {errorLogin}
                </Message>
              )}
              <>
                <InputGroup className='mb-3'>
                  <InputGroup.Text>
                    <i className='fas fa-user-circle '></i>
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

                {loadingLogin && <Spinner size={150} />}
                <div className='d-grid gap-2'>
                  <Button type='submit' variant='btn btn-outline-warning mb-4'>
                    <i className='fas fa-sign-in-alt fa-lg'></i> Envoyer
                  </Button>
                </div>
              </>
            </Form>
            <Row className='py-3'>
              <Col style={{ color: 'black' }}>
                Si vous n'avez pas de compte,
                <Link
                  to={redirect ? `/register?redirect=${redirect}` : '/register'}
                  className='fw-bold'
                >
                  Inscrivez ici
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

export default LoginScreen;
