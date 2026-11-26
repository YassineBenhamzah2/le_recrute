import React, { useEffect } from 'react';
import { Col, Container, Row, Button, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
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

  const totalCandidatures = candidatures1 ? candidatures1.length : 0;

  const candidaturesPremierControl =
    candidatures1 &&
    candidatures1.filter((candidature) => candidature.isControl1 !== true);

  const candidaturesDeuxiemeControl =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.isControl1 === true && candidature.isControl2 === false
    );

  const candidaturesTroisiemeControl =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.isControl2 === true ||
        candidature.isControl3 === true ||
        candidature.statutCommission === 'VALIDE_COMMISSION'
    );

  const candidaturesConformes =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.statutAI === 'VALIDE_IA' ||
        candidature.conforme === 'CONFORME'
    );

  const candidaturesAnomalies =
    candidatures1 &&
    candidatures1.filter((candidature) => candidature.statutAI === 'ANOMALIE_IA');

  const candidaturesRejetees =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.statutAI === 'REJETE_IA' ||
        candidature.conforme === 'NON CONFORME'
    );

  const candidaturesElligibles =
    candidatures1 &&
    candidatures1.filter(
      (candidature) =>
        candidature.statutAI === 'VALIDE_IA' ||
        candidature.eligibilite === 'ELIGIBLE'
    );

  return (
    <div id='root'>
      <div className='app'>
        <ControleurSideBar prenom={userInfo?.prenom} nom={userInfo?.nom} />
        <main style={{ backgroundColor: '#F4F7FC', minHeight: '100vh' }}>
          <HeaderAdministrateur
            headerTitle='Tableau de bord Général • Espace Contrôle'
            endPoint='/admin'
          />

          <Container className='mt-4 mb-5'>
            {/* HERO BANNER - STYLE LOGICAT ELECTRIC BLUE */}
            <div
              className='p-4 p-md-5 mb-4 text-white position-relative overflow-hidden'
              style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #0A1128 0%, #101E3D 50%, #0052FF 100%)',
                boxShadow: '0 12px 30px rgba(0, 82, 255, 0.22)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0, 163, 255, 0.3) 0%, rgba(0,0,0,0) 70%)',
                  pointerEvents: 'none',
                }}
              ></div>

              <div className='d-flex flex-wrap justify-content-between align-items-center position-relative' style={{ zIndex: 1 }}>
                <div>
                  <div className='d-flex align-items-center gap-2 mb-2'>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <i className='fas fa-chart-line me-1 text-info'></i> Pilotage & Traitement
                    </span>
                  </div>
                  <h2 className='fw-bold mb-2 text-white' style={{ letterSpacing: '-0.03em' }}>
                    Portail de Recrutement • Contrôle des Dossiers
                  </h2>
                  <p className='text-light mb-0 opacity-75' style={{ maxWidth: '640px', fontSize: '15px' }}>
                    Suivez en direct l'avancement des audits par Intelligence Artificielle, la résolution humaine des anomalies et les validations pour la Commission.
                  </p>
                </div>

                <div className='d-flex flex-wrap gap-2 mt-3 mt-md-0'>
                  <Link to='/controlleurs/candidatures/control1'>
                    <Button
                      variant='light'
                      className='fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2'
                      style={{ borderRadius: '12px', color: '#0052FF' }}
                    >
                      <i className='fas fa-robot'></i> Contrôle 1 (Audit IA)
                    </Button>
                  </Link>
                  <Link to='/controlleurs/candidatures/control2'>
                    <Button
                      className='fw-bold px-3 py-2 text-white shadow-sm d-flex align-items-center gap-2'
                      style={{
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0052FF 0%, #0070F3 100%)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <i className='fas fa-user-check'></i> Contrôle 2 (Auditeur EHC)
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {loadingCandidatures1 ? (
              <div className='text-center py-5'>
                <Spinner size={120} />
                <p className='text-muted mt-3 fw-bold'>Chargement des indicateurs en cours...</p>
              </div>
            ) : (
              <>
                {/* 3 CARTES DU PIPELINE DE TRAITEMENT (NIVEAUX 1, 2, 3) */}
                <h5 className='fw-bold text-dark mb-3 d-flex align-items-center gap-2'>
                  <i className='fas fa-stream text-primary'></i>
                  <span>Pipeline des 3 Paliers de Contrôle</span>
                </h5>

                <Row className='g-4 mb-4'>
                  {/* PALIERS 1 : CONTRÔLE 1 (IA) */}
                  <Col md={4}>
                    <div
                      className='card h-100 p-4 border-0 position-relative'
                      style={{
                        borderRadius: '18px',
                        background: '#FFFFFF',
                        boxShadow: '0 4px 20px rgba(0, 82, 255, 0.08)',
                        borderTop: '5px solid #0052FF',
                      }}
                    >
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'rgba(0, 82, 255, 0.1)',
                            color: '#0052FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                          }}
                        >
                          <i className='fas fa-robot'></i>
                        </div>
                        <Badge bg='primary' className='px-2 py-1'>
                          Palier 1 • IA
                        </Badge>
                      </div>

                      <div className='text-muted small fw-bold text-uppercase'>À Traiter en Niveau 1</div>
                      <div
                        className='fw-bold my-2 text-dark'
                        style={{ fontSize: '32px', letterSpacing: '-0.03em' }}
                      >
                        <CountUp
                          end={candidaturesPremierControl ? candidaturesPremierControl.length : 0}
                          duration={2}
                        />
                      </div>
                      <p className='small text-muted mb-4'>
                        Candidatures en attente de l'audit automatique IA et du premier contrôle.
                      </p>

                      <Link to='/controlleurs/candidatures/control1' className='mt-auto'>
                        <Button
                          variant='outline-primary'
                          className='w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2'
                          style={{ borderRadius: '10px' }}
                        >
                          <span>Accéder au Contrôle 1</span>
                          <i className='fas fa-arrow-right'></i>
                        </Button>
                      </Link>
                    </div>
                  </Col>

                  {/* PALIERS 2 : CONTRÔLE 2 (AUDITEUR EHC) */}
                  <Col md={4}>
                    <div
                      className='card h-100 p-4 border-0 position-relative'
                      style={{
                        borderRadius: '18px',
                        background: '#FFFFFF',
                        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)',
                        borderTop: '5px solid #F59E0B',
                      }}
                    >
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#F59E0B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                          }}
                        >
                          <i className='fas fa-user-check'></i>
                        </div>
                        <span
                          className='badge'
                          style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}
                        >
                          Palier 2 • Auditeur
                        </span>
                      </div>

                      <div className='text-muted small fw-bold text-uppercase'>Dossiers en Contrôle 2</div>
                      <div
                        className='fw-bold my-2 text-dark'
                        style={{ fontSize: '32px', letterSpacing: '-0.03em' }}
                      >
                        <CountUp
                          end={candidaturesDeuxiemeControl ? candidaturesDeuxiemeControl.length : 0}
                          duration={2}
                        />
                      </div>
                      <p className='small text-muted mb-4'>
                        Dossiers validés Niveau 1 ou présentant des anomalies nécessitant l'expertise humaine.
                      </p>

                      <Link to='/controlleurs/candidatures/control2' className='mt-auto'>
                        <Button
                          className='w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2 text-dark'
                          style={{
                            borderRadius: '10px',
                            backgroundColor: '#FDE68A',
                            border: '1px solid #F59E0B',
                          }}
                        >
                          <span>Gérer le Contrôle 2</span>
                          <i className='fas fa-arrow-right'></i>
                        </Button>
                      </Link>
                    </div>
                  </Col>

                  {/* PALIERS 3 : CONTRÔLE 3 (COMMISSION EHC) */}
                  <Col md={4}>
                    <div
                      className='card h-100 p-4 border-0 position-relative'
                      style={{
                        borderRadius: '18px',
                        background: '#FFFFFF',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)',
                        borderTop: '5px solid #10B981',
                      }}
                    >
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10B981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                          }}
                        >
                          <i className='fas fa-award'></i>
                        </div>
                        <Badge bg='success' className='px-2 py-1'>
                          Palier 3 • Commission
                        </Badge>
                      </div>

                      <div className='text-muted small fw-bold text-uppercase'>Transmis à Commission</div>
                      <div
                        className='fw-bold my-2 text-dark'
                        style={{ fontSize: '32px', letterSpacing: '-0.03em' }}
                      >
                        <CountUp
                          end={candidaturesTroisiemeControl ? candidaturesTroisiemeControl.length : 0}
                          duration={2}
                        />
                      </div>
                      <p className='small text-muted mb-4'>
                        Dossiers certifiés et présentés à la commission finale pour décision officielle.
                      </p>

                      <Link to='/controlleurs/candidatures/control3' className='mt-auto'>
                        <Button
                          variant='success'
                          className='w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2'
                          style={{ borderRadius: '10px' }}
                        >
                          <span>Accéder à la Commission</span>
                          <i className='fas fa-arrow-right'></i>
                        </Button>
                      </Link>
                    </div>
                  </Col>
                </Row>

                {/* INDICATEURS DE CONFORMITÉ & SANTÉ DES DOSSIERS */}
                <h5 className='fw-bold text-dark mb-3 mt-4 d-flex align-items-center gap-2'>
                  <i className='fas fa-shield-alt text-primary'></i>
                  <span>Indicateurs de Conformité & Audit Global</span>
                </h5>

                <Row className='g-3'>
                  <Col sm={6} lg={3}>
                    <div
                      className='card p-3 border-0'
                      style={{
                        borderRadius: '16px',
                        background: '#FFFFFF',
                        borderLeft: '4px solid #0052FF',
                      }}
                    >
                      <div className='small text-muted fw-bold'>Total Candidatures</div>
                      <div className='fs-3 fw-bold text-dark mt-1'>
                        <CountUp end={totalCandidatures} duration={2} />
                      </div>
                      <div className='small text-primary mt-1 fw-semibold'>
                        <i className='fas fa-folder me-1'></i> Tous les dossiers enregistrés
                      </div>
                    </div>
                  </Col>

                  <Col sm={6} lg={3}>
                    <div
                      className='card p-3 border-0'
                      style={{
                        borderRadius: '16px',
                        background: '#FFFFFF',
                        borderLeft: '4px solid #10B981',
                      }}
                    >
                      <div className='small text-muted fw-bold'>Conformes Certifiés</div>
                      <div className='fs-3 fw-bold text-success mt-1'>
                        <CountUp end={candidaturesConformes ? candidaturesConformes.length : 0} duration={2} />
                      </div>
                      <div className='small text-success mt-1 fw-semibold'>
                        <i className='fas fa-check-circle me-1'></i> Audit IA ou Validés Humain
                      </div>
                    </div>
                  </Col>

                  <Col sm={6} lg={3}>
                    <div
                      className='card p-3 border-0'
                      style={{
                        borderRadius: '16px',
                        background: '#FFFFFF',
                        borderLeft: '4px solid #F59E0B',
                      }}
                    >
                      <div className='small text-muted fw-bold'>Anomalies Détectées</div>
                      <div className='fs-3 fw-bold text-warning mt-1'>
                        <CountUp end={candidaturesAnomalies ? candidaturesAnomalies.length : 0} duration={2} />
                      </div>
                      <div className='small text-warning mt-1 fw-semibold'>
                        <i className='fas fa-exclamation-triangle me-1'></i> À arbitrer en Niveau 2
                      </div>
                    </div>
                  </Col>

                  <Col sm={6} lg={3}>
                    <div
                      className='card p-3 border-0'
                      style={{
                        borderRadius: '16px',
                        background: '#FFFFFF',
                        borderLeft: '4px solid #EF4444',
                      }}
                    >
                      <div className='small text-muted fw-bold'>Dossiers Rejetés</div>
                      <div className='fs-3 fw-bold text-danger mt-1'>
                        <CountUp end={candidaturesRejetees ? candidaturesRejetees.length : 0} duration={2} />
                      </div>
                      <div className='small text-danger mt-1 fw-semibold'>
                        <i className='fas fa-times-circle me-1'></i> Non éligibles / Motifs légaux
                      </div>
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </Container>
        </main>
      </div>
    </div>
  );
};

export default ControlleurDashboard;
