import Button from '@restart/ui/esm/Button';
import React, { Fragment } from 'react';
import { Card, Col, Container, ListGroup, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Heading from '../components/Heading';
import { useParams } from 'react-router';

const PosteDetailsScreen = () => {
  const params = useParams();

  return (
    <Fragment>
      <Header />
      <Heading
        title={`Poste : ${params.poste}`}
        text={'postuler en quelques cliques'}
      />
      {params.poste === 'Guichetier' ? (
        <Container>
          <Row>
            <Col md={8}>
              <Container
                style={{
                  backgroundColor: '#fff',
                  transition: 'box-shadow 0.25s',
                  boxShadow:
                    '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                }}
                className='mt-3  p-2 mb-3'
              >
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <h2 className='text-center' style={{ color: '#EECE55' }}>
                      Description du poste
                    </h2>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <h4>Missions</h4>
                    <p>
                      <strong>
                        <ul>
                          <li>
                            Assurer les prestations guichets en faveur de la
                            clientèle
                          </li>
                          <li>
                            Promouvoir et commercialiser l'ensemble des produits
                          </li>
                          <li>
                            Veiller à la conformité des opérations de guichet.
                          </li>
                        </ul>
                      </strong>
                    </p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <h4>PROFILE RECHERCHE</h4>
                    <ul className='list-unstyled'>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Être de Nationalité
                        Marocaine.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Être âgé(e) maximum de
                        29 ans au 31/12/2021.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Avoir un Bac+2/3 en
                        Management / Gestion d'Entreprises / Economie / Banque /
                        Finance / Comptabilité / Audit / Contrôle de Gestion /
                        Commerce / Marketing / Relations clientèle / Assurance /
                        Communication / Administration des Affaires /
                        Administration des Entreprises/ Informatique de Gestion
                        ou assimilé.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Seuls les diplômes
                        délivrés par les établissements publics et ceux
                        disposant d'attestation d'équivalence délivrée par les
                        autorités compétentes seront éligibles pour passer le
                        concours.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Avoir une expérience
                        dans le poste à pourvoir (ou assimilé) au sein d’une
                        banque ou dans une institution financière serait
                        souhaitable.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Résider obligatoirement
                        dans une des provinces selon le plan d’affectation d’Al
                        Barid Bank (justifié par CIN ou Certificat de
                        Résidence).
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> La possession du
                        baccalauréat est obligatoire..
                      </li>
                    </ul>
                  </ListGroup.Item>
                </ListGroup>
              </Container>
            </Col>

            <Col md={4}>
              <Container
                style={{
                  backgroundColor: '#fff',
                  transition: 'box-shadow 0.25s',
                  boxShadow:
                    '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className='mt-3  p-2 mb-3 '
              >
                <Card>
                  <ListGroup variant='flush'>
                    <ListGroup.Item>
                      <h3 className='text-center' style={{ color: '#EECE55' }}>
                        Details du poste
                      </h3>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6> Date d'annonce</h6>
                        </Col>
                        <Col>27.12.2021</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6> Date Fin </h6>
                        </Col>
                        <Col> 10/01/2022 a minuit </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6> Rattachemnt hierarchique</h6>
                        </Col>
                        <Col>Directeur d’agence</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6> Nationalite</h6>
                        </Col>
                        <Col>Marocaine</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6>Niveau d'étude </h6>
                        </Col>
                        <Col> Bac + 2 / Bac + 3 </Col>
                      </Row>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <div className='d-grid gap-2'>
                        <LinkContainer
                          to={`/poste/${params.poste}/informations-personnelles`}
                        >
                          <Button
                            type='button'
                            className='btn btn-outline-warning'
                          >
                            Postuler
                          </Button>
                        </LinkContainer>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Container>
            </Col>
          </Row>
        </Container>
      ) : (
        <Container>
          <Row>
            <Col md={8}>
              <Container
                style={{
                  backgroundColor: '#fff',
                  transition: 'box-shadow 0.25s',
                  boxShadow:
                    '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                }}
                className='mt-3  p-2 mb-3'
              >
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <h2 className='text-center' style={{ color: '#EECE55' }}>
                      Description du poste
                    </h2>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <h4>Missions</h4>
                    <p>
                      <strong>
                        <ul>
                          <li>
                            Assurer le remplacement des collaborateurs en agence
                            en cas de congé ou de toute autre absence (congé
                            maladie, congé administratif, permission
                            exceptionnelle, certificat médical, absence
                            prolongée, grossesse, etc.. ).
                          </li>
                          <li>
                            Renforcer les équipes du réseau durant les
                            opérations de masse et les opérations citoyennes ou
                            spécifiques (Exemple : Tayssir, Minhaty...).
                          </li>

                          <li>
                            Venir en renfort aux agences en sous-effectif en
                            période de pic.
                          </li>
                          <li>
                            Veiller au respect des attributions du poste assuré
                            durant la période de remplacement (Postes concernés
                            : Directeur d’Agence, Arrière Guichet, Conseiller de
                            Clientèle et Guichetier).
                          </li>
                        </ul>
                      </strong>
                    </p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <h4>PROFILE RECHERCHE</h4>
                    <ul className='list-unstyled'>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Être de Nationalité
                        Marocaine.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Être âgé(e) maximum de
                        29 ans au 31/12/2021.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Avoir un Bac+2/3 en
                        Management / Gestion d'Entreprises / Economie / Banque /
                        Finance / Comptabilité / Audit / Contrôle de Gestion /
                        Commerce / Marketing / Relations clientèle / Assurance /
                        Communication / Administration des Affaires /
                        Administration des Entreprises/ Informatique de Gestion
                        ou assimilé.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Seuls les diplômes
                        délivrés par les établissements publics et ceux
                        disposant d'attestation d'équivalence délivrée par les
                        autorités compétentes seront éligibles pour passer le
                        concours.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Avoir une expérience
                        dans le poste à pourvoir (ou assimilé) au sein d’une
                        banque ou dans une institution financière serait
                        souhaitable.
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> Résider obligatoirement
                        dans une des provinces selon le plan d’affectation d’Al
                        Barid Bank (justifié par CIN ou Certificat de
                        Résidence).
                      </li>
                      <li className='m-3'>
                        <i className='fas fa-check'></i> La possession du
                        baccalauréat est obligatoire.
                      </li>
                    </ul>
                  </ListGroup.Item>
                </ListGroup>
              </Container>
            </Col>

            <Col md={4}>
              <Container
                style={{
                  backgroundColor: '#fff',
                  transition: 'box-shadow 0.25s',
                  boxShadow:
                    '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className='mt-3  p-2 mb-3 '
              >
                <Card>
                  <ListGroup variant='flush'>
                    <ListGroup.Item>
                      <h3 className='text-center' style={{ color: '#EECE55' }}>
                        Details de poste
                      </h3>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6> Date d'annonce</h6>
                        </Col>
                        <Col>27.12.2021</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6> Date Fin </h6>
                        </Col>
                        <Col>10.01.2022 a minuit</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6> Rattachemnt hierarchique</h6>
                        </Col>
                        <Col>Directeur d’agence</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6> Nationalite</h6>
                        </Col>
                        <Col>Marocaine</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6>Niveau d'étude </h6>
                        </Col>
                        <Col> Bac + 2 / Bac + 3 </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <h6>Rgime indemnitaire </h6>
                        </Col>
                        <Col>
                          Les déplacements des guichetiers mobiles sont couverts
                          par le régime indemnitaire des frais de déplacement de
                          la Banque.
                        </Col>
                      </Row>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <div className='d-grid gap-2'>
                        <LinkContainer
                          to={`/poste/${params.poste}/informations-personnelles`}
                        >
                          <Button
                            type='button'
                            className='btn btn-outline-warning'
                          >
                            Postuler
                          </Button>
                        </LinkContainer>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Container>
            </Col>
          </Row>
        </Container>
      )}
      <Footer />
    </Fragment>
  );
};

export default PosteDetailsScreen;
