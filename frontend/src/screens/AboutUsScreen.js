import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutUsScreen = () => {
  return (
    <>
      {' '}
      <Header />
      <section
        id='about'
        className='py-3'
        style={{ textAlign: 'justify', textJustify: 'inter-word' }}
      >
        <Container>
          <Row>
            <Col md={6} className=' align-self-center'>
              <h1>EHC : Experts Human Capital</h1>
              <p>
                Qui sommes-nous ? Depuis sa création, le cabinet EXPERTS HUMAN
                CAPITAL a pu satisfaire et fidéliser des clients à haut niveau
                d’exigence. EXPERTS HUMAN CAPITAL a pour vacation d’intervenir
                dans la sphère du conseil notamment en gestion du capital humain
                de la communication et l’événementielle ainsi que la conduite de
                changement. EXPERTS HUMAN CAPITAL emploie des experts connus et
                reconnus pour leur éthique professionnalisme et compétences.Nous
                opérons aussi bien à l’échelle nationale qu’à l’international.
              </p>
            </Col>
            <Col md={6}>
              <img
                src='./assets/images/ehc.png'
                alt=''
                className='img-fluid d-none d-md-block about-img'
              ></img>
            </Col>
          </Row>
        </Container>
      </section>
      {/* <!-- ICON BOXES --> */}
      <section id='icon-boxes' className='p-5'>
        <Container>
          <Row mb={4}>
            <Col md={4} className='mb-3'>
              <Card
                style={{ backgroundColor: '#058283' }}
                className='text-white text-center'
              >
                <Card.Body>
                  <i className='fas fa-map-signs fa-3x'></i>
                  <h3>Conseil et Accompagnement</h3>
                  Tous vos projets du début à la conduite de changement.
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card bg='info' className='text-white text-center'>
                <Card.Body>
                  <i className='fas fa-crosshairs fa-3x'></i>
                  <h3>Recrutement et Assessment Center</h3>
                  Recrutement de masse - sur mesure - cadres dirigeants - chasse
                  de tête.
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                style={{ backgroundColor: '#058283' }}
                className=' text-white text-center'
              >
                <Card.Body>
                  <i className='fas fa-pen-square fa-3x'></i>
                  <h3>Blended Learning</h3>
                  <br />
                  Presentiel - elearning - intra et inter
                  <br />
                  ...
                </Card.Body>
                <Card.Text></Card.Text>
              </Card>
            </Col>
          </Row>

          <Row mb={4}>
            <Col md={4}>
              <Card bg='info' className='text-white text-center'>
                <Card.Body>
                  <i className='fas fa-cloud-upload-alt fa-3x'></i>
                  <h3>SIRH et digitalisation des processus</h3>
                  Standard - personnalisé - GExD
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                style={{ backgroundColor: '#058283' }}
                className=' text-white text-center'
              >
                <Card.Body>
                  <i className='fas fa-film fa-3x'></i>
                  <h3>Événementiel</h3>
                  Team buildings - Colloque - Séminaire Groupe - Journée
                  sportive/ culturelle
                  <br />
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card bg='info' className='text-white text-center'>
                <Card.Body>
                  <i className='fas fa-copy fa-3x'></i>
                  <h3>Études et enquêtes</h3>
                  Rémunération - Marché- Veille concurrentielle - ...
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* <!-- TESTIMONIALS --> */}
      <section id='testimonials' className='p-4 bg-dark text-white'>
        <Container>
          <h2 className='text-center text-white'>Satisfaction clients</h2>
          <Row className=' text-center'>
            <Col>
              <div>
                <blockquote className='blockquote'>
                  <p className='mb-3'>
                    100% de nos clients sont satisfaits de notre démarche et la
                    qualité de notre service
                  </p>
                </blockquote>
              </div>
            </Col>
          </Row>
        </Container>
      </section>{' '}
      <Footer />
    </>
  );
};

export default AboutUsScreen;
