import React, { useEffect, useState } from 'react';
import { Col, Container, Collapse, Row, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import CardItem from '../../components/CardItem';
import CountUp from 'react-countup';
import { listControllerCandidatures } from '../../actions/candidatureActions';
import moment from 'moment';
import ControleurSideBar from '../../components/ControleurSideBar';
import Spinner from '../../components/Spinner';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';

const ControlleurDashboard = () => {
  moment.locale('fr');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const candidaturesListController = useSelector(
    (state) => state.candidaturesListController
  );
  const { candidatures: candidatures1, loading: loadingCandidatures1 } =
    candidaturesListController;

  useEffect(() => {
    if (userInfo && userInfo.isController) {
      dispatch(listControllerCandidatures());
    } else {
      navigate('/login');
    }
  }, [userInfo, navigate, dispatch]);

  const candidaturesEntrantes =
    candidatures1 &&
    candidatures1.filter((candidature) => candidature.isControl1 === false);

  const candidatures1NonTraites =
    candidatures1 &&
    candidatures1.filter((candidature) => candidature.isControl1 === false);

  const candidaturesPremierControl =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.controle1 === `${userInfo.prenom} ${userInfo.nom}`
    );

  const candidaturesDeuxiemeControl =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.controle2 === `${userInfo.prenom} ${userInfo.nom}`
    );

  const candidaturesConformes =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.controle1 === `${userInfo.prenom} ${userInfo.nom}` &&
        candidature.conforme === 'CONFORME'
    );

  const candidaturesNonConformes =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.controle1 === `${userInfo.prenom} ${userInfo.nom}` &&
        candidature.conforme === 'NON CONFORME'
    );

  const candidaturesElligibles =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.controle1 === `${userInfo.prenom} ${userInfo.nom}` &&
        candidature.eligibilite === 'ELIGIBLE'
    );

  const candidaturesNonElligibles =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.controle1 === `${userInfo.prenom} ${userInfo.nom}` &&
        candidature.eligibilite === 'NON ELIGIBLE'
    );

  return (
    <>
      <div id='root'>
        <div className='app'>
          <ControleurSideBar prenom={userInfo.prenom} nom={userInfo.nom} />
          <main>
            <HeaderAdministrateur
              headerTitle='Tableau de bord'
              endPoint='/admin'
            />
            <Container
              className='mb-4 mt-4 pt-3  pb-3'
              style={{
                backgroundColor: '#fff',
                transition: 'box-shadow 0.25s',
                boxShadow:
                  '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
              }}
            >
              <h4 className='fw-bold mt-2 ms-3'>Situation des candidatures </h4>{' '}
              <>
                {loadingCandidatures1 ? (
                  <Spinner size={150} />
                ) : (
                  <>
                    {' '}
                    <Row className='justify-content-center'>
                      <Col md={6} lg={3} sm={12}>
                        <Link to='/controlleurs/dashboard'>
                          <CardItem
                            icon='fas fa-clipboard fa-4x'
                            title='Nouvelles Candidatures'
                            number={
                              <CountUp
                                end={
                                  candidaturesEntrantes &&
                                  candidaturesEntrantes.length
                                }
                                duration={5}
                              />
                            }
                            color={{
                              transition: 'box-shadow 0.25s',
                              boxShadow:
                                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                              borderRadius: '5px',
                              background: `linear-gradient(
                          45deg,
                          #4099ff,
                          #73b4ff
                        )`,
                            }}
                          />
                        </Link>
                      </Col>
                      <Col md={6} lg={3} sm={12}>
                        <Link to='/controlleurs/dashboard'>
                          <CardItem
                            icon='fas fa-calendar-times fa-4x'
                            title='Candidatures non traitees'
                            number={
                              <CountUp
                                end={
                                  candidatures1NonTraites &&
                                  candidatures1NonTraites.length
                                }
                                duration={5}
                              />
                            }
                            color={{
                              transition: 'box-shadow 0.25s',
                              boxShadow:
                                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                              borderRadius: '5px',
                              background: `linear-gradient(
                          45deg,
                          #4099ff,
                          #73b4ff
                        )`,
                            }}
                          />
                        </Link>
                      </Col>
                    </Row>
                    <Row className='justify-content-center'>
                      <Col md={6} lg={3} sm={12}>
                        <Link to='/controlleurs/dashboard'>
                          <CardItem
                            icon='fas fa-check fa-4x'
                            title='Premier controle'
                            number={
                              <CountUp
                                end={
                                  candidaturesPremierControl &&
                                  candidaturesPremierControl.length
                                }
                                duration={5}
                              />
                            }
                            color={{
                              transition: 'box-shadow 0.25s',
                              boxShadow:
                                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                              borderRadius: '5px',
                              background: `linear-gradient(
                          45deg,
                          #4099ff,
                          #73b4ff
                        )`,
                            }}
                          />
                        </Link>
                      </Col>
                      <Col md={6} lg={3} sm={12}>
                        <Link to='/controlleurs/dashboard'>
                          <CardItem
                            icon='fas fa-check-double fa-4x'
                            title='Deuxieme controle'
                            number={
                              <CountUp
                                end={
                                  candidaturesDeuxiemeControl &&
                                  candidaturesDeuxiemeControl.length
                                }
                                duration={5}
                              />
                            }
                            color={{
                              transition: 'box-shadow 0.25s',
                              boxShadow:
                                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                              borderRadius: '5px',
                              background: `linear-gradient(
                          45deg,
                          #4099ff,
                          #73b4ff
                        )`,
                            }}
                          />
                        </Link>
                      </Col>
                    </Row>
                    <Row className='justify-content-center'>
                      <Col md={6} lg={3} sm={12}>
                        <Link to='/controlleurs/dashboard'>
                          <CardItem
                            icon='fas fa-check fa-4x'
                            title='Candidatures Conformes'
                            number={
                              <CountUp
                                end={
                                  candidaturesConformes &&
                                  candidaturesConformes.length
                                }
                                duration={5}
                              />
                            }
                            color={{
                              transition: 'box-shadow 0.25s',
                              boxShadow:
                                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                              borderRadius: '5px',
                              background: `linear-gradient(
                          45deg,
                          #4099ff,
                          #73b4ff
                        )`,
                            }}
                          />
                        </Link>
                      </Col>
                      <Col md={6} lg={3} sm={12}>
                        <Link to='/controlleurs/dashboard'>
                          <CardItem
                            icon='fas fa-times fa-4x'
                            title='Candidatures non conformes'
                            number={
                              <CountUp
                                end={
                                  candidaturesNonConformes &&
                                  candidaturesNonConformes.length
                                }
                                duration={5}
                              />
                            }
                            color={{
                              transition: 'box-shadow 0.25s',
                              boxShadow:
                                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                              borderRadius: '5px',
                              background: `linear-gradient(
                          45deg,
                          #4099ff,
                          #73b4ff
                        )`,
                            }}
                          />
                        </Link>
                      </Col>
                    </Row>
                    <Row className='justify-content-center'>
                      <Col md={6} lg={3} sm={12}>
                        <Link to='/controlleurs/dashboard'>
                          <CardItem
                            icon='fas fa-check fa-4x'
                            title='Candidatures Eligibles'
                            number={
                              <CountUp
                                end={
                                  candidaturesElligibles &&
                                  candidaturesElligibles.length
                                }
                                duration={5}
                              />
                            }
                            color={{
                              transition: 'box-shadow 0.25s',
                              boxShadow:
                                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                              borderRadius: '5px',
                              background: `linear-gradient(
                          45deg,
                          #4099ff,
                          #73b4ff
                        )`,
                            }}
                          />
                        </Link>
                      </Col>
                      <Col md={6} lg={3} sm={12}>
                        <Link to='/controlleurs/dashboard'>
                          <CardItem
                            icon='fas fa-times fa-4x'
                            title='Candidatures Non Eligibles'
                            number={
                              <CountUp
                                end={
                                  candidaturesNonElligibles &&
                                  candidaturesNonElligibles.length
                                }
                                duration={5}
                              />
                            }
                            color={{
                              transition: 'box-shadow 0.25s',
                              boxShadow:
                                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
                              borderRadius: '5px',
                              background: `linear-gradient(
                          45deg,
                          #4099ff,
                          #73b4ff
                        )`,
                            }}
                          />
                        </Link>
                      </Col>
                    </Row>
                  </>
                )}
              </>
            </Container>
          </main>
        </div>
      </div>
    </>
  );
};

export default ControlleurDashboard;

{
  /* <div id='root'>
  <div className='app'>
    <ControleurSideBar prenom={userInfo.prenom} nom={userInfo.nom} />
    <main>
      <HeaderAdministrateur headerTitle='Tableau de bord' endPoint='/admin' />
    </main>
  </div>
</div>; */
}
