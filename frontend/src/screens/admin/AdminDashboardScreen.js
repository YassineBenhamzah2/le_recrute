import React, { useEffect } from 'react';
import { Col, Container, Row, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import moment from 'moment';
import AdminSideBar from '../../components/AdminSideBar';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import { listUsers } from '../../actions/userActions';
import { listCandidatures } from '../../actions/candidatureActions';
import Spinner from '../../components/Spinner';
import Message from '../../components/Message';
import './AdminDashboardScreen.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userList = useSelector((state) => state.userList);
  const { users, loading: loadingUsers, error: errorUsers } = userList;

  const candidatureList = useSelector((state) => state.candidatureList);
  const { candidatures, loading: loadingCandidatures } = candidatureList;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listUsers());
      dispatch(listCandidatures());
    } else {
      navigate('/login');
    }
  }, [userInfo, navigate, dispatch]);

  // Données enrichies et calculs statistiques précis
  const allUsers = users || [];
  const allCandidatures = candidatures || [];

  const controlleurs = allUsers.filter((u) => u.isController === true);
  const candidats = allUsers.filter(
    (u) => !u.isController && !u.isAdmin && !u.isMaitreOuvrage
  );
  const staffMembers = allUsers.filter(
    (u) => u.isController || u.isAdmin || u.isMaitreOuvrage
  );

  const recent24hUsers = allUsers.filter((u) => {
    if (!u.createdAt) return false;
    return moment().diff(moment(u.createdAt), 'hours') <= 24;
  }).length;

  // Calculs Candidatures & Traitement
  const totalCandidatures = allCandidatures.length;
  const dossiersTraites = allCandidatures.filter(
    (c) => c.isControl1 || c.conforme || c.dossier === 'Conforme'
  ).length;
  const dossiersNonTraites = totalCandidatures - dossiersTraites;
  const tauxTraitement =
    totalCandidatures > 0
      ? Math.round((dossiersTraites / totalCandidatures) * 100)
      : 0;

  // Candidatures par niveau académique
  const bac2Count = allCandidatures.filter((c) =>
    (c.niveauEtude || '').toLowerCase().includes('bac+2')
  ).length;
  const bac3Count = allCandidatures.filter((c) => {
    const niv = (c.niveauEtude || '').toLowerCase();
    return niv.includes('bac+3') && !niv.includes('pro');
  }).length;
  const bac3ProCount = allCandidatures.filter((c) =>
    (c.niveauEtude || '').toLowerCase().includes('pro')
  ).length;
  const bac5Count = allCandidatures.filter((c) => {
    const niv = (c.niveauEtude || '').toLowerCase();
    return (
      niv.includes('bac+5') ||
      niv.includes('master') ||
      niv.includes('ingénieur') ||
      niv.includes('ingenieur')
    );
  }).length;

  const isLoading = loadingUsers || loadingCandidatures;

  return (
    <div id='root'>
      <div className='app'>
        <AdminSideBar prenom={userInfo?.prenom} nom={userInfo?.nom} />
        <main>
          <HeaderAdministrateur
            headerTitle='Tableau de bord d’Administration'
            endPoint='/admin'
          />

          <div className='admin-dashboard-wrapper'>
            {/* HERO EXECUTIVE WELCOME BANNER */}
            <div className='admin-hero-banner'>
              <div>
                <div className='admin-hero-title'>
                  <i className='fas fa-chart-pie me-2 text-primary'></i>
                  Tableau de Bord Administratif &amp; Décisionnel
                </div>
                <p className='admin-hero-sub'>
                  Supervision globale des flux d'inscriptions, répartition académique des dossiers et avancement des commissions.
                </p>
              </div>
              <div className='d-flex align-items-center gap-2 flex-wrap'>
                <div className='admin-hero-badge'>
                  <i className='fas fa-check-circle text-success'></i>
                  Conforme CNDP (Loi 09-08)
                </div>
                <div className='admin-hero-badge'>
                  <i className='fas fa-clock text-info'></i>
                  {moment().format('DD/MM/YYYY — HH:mm')}
                </div>
              </div>
            </div>

            {errorUsers && <Message variant='danger'>{errorUsers}</Message>}

            {isLoading ? (
              <div className='text-center py-5'>
                <Spinner size={120} />
                <p className='mt-3 text-muted fw-bold'>
                  Chargement des indicateurs décisionnels en temps réel...
                </p>
              </div>
            ) : (
              <>
                {/* SECTION 1 : SITUATION DES INSCRIPTIONS */}
                <div className='admin-section-card'>
                  <div className='admin-section-header'>
                    <div>
                      <h4 className='admin-section-title'>
                        <i className='fas fa-users-cog text-primary'></i>
                        1. Situation des Inscriptions &amp; Utilisateurs
                      </h4>
                      <span className='admin-section-subtitle'>
                        État du registre des comptes utilisateurs, candidats et membres du staff
                      </span>
                    </div>
                    <Link
                      to='/admin/utilisateurs'
                      className='btn btn-sm btn-outline-primary fw-bold'
                      style={{ borderRadius: '8px' }}
                    >
                      <i className='fas fa-list me-1'></i> Gérer les Utilisateurs
                    </Link>
                  </div>

                  <Row className='g-3'>
                    {/* Carte 1 : Total Inscriptions */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/utilisateurs' className='stat-metric-card' style={{ '--card-accent': '#2563EB', '--icon-bg': '#EFF6FF', '--icon-color': '#1D4ED8' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-address-book'></i>
                          </div>
                          <span className='stat-card-badge'>Registre Global</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={allUsers.length} duration={2} />
                          </div>
                          <div className='stat-card-title'>Total Inscriptions</div>
                          <p className='stat-card-desc'>Comptes enregistrés sur la plateforme</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Carte 2 : Inscriptions en 24h */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/utilisateurs' className='stat-metric-card' style={{ '--card-accent': '#0284C7', '--icon-bg': '#E0F2FE', '--icon-color': '#0284C7' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-user-plus'></i>
                          </div>
                          <span className='stat-card-badge text-primary'>Dernières 24h</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={recent24hUsers} duration={2} />
                          </div>
                          <div className='stat-card-title'>Inscriptions Récentes</div>
                          <p className='stat-card-desc'>Nouveaux comptes créés en 24 heures</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Carte 3 : Candidats Actifs */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/utilisateurs' className='stat-metric-card' style={{ '--card-accent': '#059669', '--icon-bg': '#ECFDF5', '--icon-color': '#059669' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-user-graduate'></i>
                          </div>
                          <span className='stat-card-badge text-success'>Postulants</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={candidats.length} duration={2} />
                          </div>
                          <div className='stat-card-title'>Espace Candidats</div>
                          <p className='stat-card-desc'>Candidats réguliers éligibles aux concours</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Carte 4 : Staff & Contrôleurs (Texte corrigé, plus de "Con") */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/utilisateurs' className='stat-metric-card' style={{ '--card-accent': '#7C3AED', '--icon-bg': '#F5F3FF', '--icon-color': '#7C3AED' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-user-shield'></i>
                          </div>
                          <span className='stat-card-badge text-purple'>Commissions</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={staffMembers.length} duration={2} />
                          </div>
                          <div className='stat-card-title'>Staff &amp; Contrôleurs</div>
                          <p className='stat-card-desc'>Contrôleurs, auditeurs et administrateurs</p>
                        </div>
                      </Link>
                    </Col>
                  </Row>
                </div>

                {/* SECTION 2 : SITUATION DES CANDIDATURES */}
                <div className='admin-section-card'>
                  <div className='admin-section-header'>
                    <div>
                      <h4 className='admin-section-title'>
                        <i className='fas fa-file-invoice text-warning'></i>
                        2. Situation des Candidatures &amp; Flux d'Instruction
                      </h4>
                      <span className='admin-section-subtitle'>
                        Suivi du traitement des dossiers numériques par les commissions de recrutement
                      </span>
                    </div>
                    <Link
                      to='/admin/candidatures'
                      className='btn btn-sm btn-outline-warning text-dark fw-bold'
                      style={{ borderRadius: '8px' }}
                    >
                      <i className='fas fa-folder-open me-1'></i> Examiner les Candidatures
                    </Link>
                  </div>

                  <Row className='g-3'>
                    {/* Carte 1 : Total Candidatures */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/candidatures' className='stat-metric-card' style={{ '--card-accent': '#EA580C', '--icon-bg': '#FFF7ED', '--icon-color': '#EA580C' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-layer-group'></i>
                          </div>
                          <span className='stat-card-badge'>Dépôts Globaux</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={totalCandidatures} duration={2} />
                          </div>
                          <div className='stat-card-title'>Total Candidatures</div>
                          <p className='stat-card-desc'>Dossiers officiels transmis aux commissions</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Carte 2 : Non Traités */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/candidatures' className='stat-metric-card' style={{ '--card-accent': '#DC2626', '--icon-bg': '#FEF2F2', '--icon-color': '#DC2626' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-clock'></i>
                          </div>
                          <span className='stat-card-badge text-danger'>À Instruire</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={dossiersNonTraites} duration={2} />
                          </div>
                          <div className='stat-card-title'>En Attente d'Audit</div>
                          <p className='stat-card-desc'>Dossiers en attente de vérification pièces</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Carte 3 : Traités & Conformes */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/candidatures' className='stat-metric-card' style={{ '--card-accent': '#16A34A', '--icon-bg': '#F0FDF4', '--icon-color': '#16A34A' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-check-double'></i>
                          </div>
                          <span className='stat-card-badge text-success'>Audités</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={dossiersTraites} duration={2} />
                          </div>
                          <div className='stat-card-title'>Dossiers Conformes</div>
                          <p className='stat-card-desc'>Candidatures validées par les contrôleurs</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Carte 4 : Taux de Traitement */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/candidatures' className='stat-metric-card' style={{ '--card-accent': '#0891B2', '--icon-bg': '#ECFEFF', '--icon-color': '#0891B2' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-tasks'></i>
                          </div>
                          <span className='stat-card-badge text-info'>Avancement</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={tauxTraitement} duration={2} />%
                          </div>
                          <div className='stat-card-title'>Taux de Traitement</div>
                          <p className='stat-card-desc'>Progression globale de la commission d'audit</p>
                        </div>
                      </Link>
                    </Col>
                  </Row>
                </div>

                {/* SECTION 3 : CANDIDATURES PAR PROFIL ACADÉMIQUE */}
                <div className='admin-section-card'>
                  <div className='admin-section-header'>
                    <div>
                      <h4 className='admin-section-title'>
                        <i className='fas fa-graduation-cap text-success'></i>
                        3. Répartition des Candidatures par Profil Académique
                      </h4>
                      <span className='admin-section-subtitle'>
                        Segmentation des candidats selon le niveau d'études certifié
                      </span>
                    </div>
                    <Badge bg='light' text='dark' className='border px-3 py-2 fw-bold'>
                      <i className='fas fa-database me-1 text-primary'></i> {totalCandidatures} Profils Classés
                    </Badge>
                  </div>

                  <Row className='g-3'>
                    {/* Bac +2 */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/candidatures' className='stat-metric-card' style={{ '--card-accent': '#475569', '--icon-bg': '#F1F5F9', '--icon-color': '#475569' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-certificate'></i>
                          </div>
                          <span className='stat-card-badge'>TS / DUT / BTS</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={bac2Count} duration={2} />
                          </div>
                          <div className='stat-card-title'>Profils Bac +2</div>
                          <p className='stat-card-desc'>Techniciens spécialisés &amp; diplômes bac+2</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Bac +3 */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/candidatures' className='stat-metric-card' style={{ '--card-accent': '#1E3A8A', '--icon-bg': '#EFF6FF', '--icon-color': '#1E3A8A' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-user-graduate'></i>
                          </div>
                          <span className='stat-card-badge'>Licence Fond.</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={bac3Count} duration={2} />
                          </div>
                          <div className='stat-card-title'>Profils Bac +3</div>
                          <p className='stat-card-desc'>Licence fondamentale et équivalents</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Bac +3 PRO */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/candidatures' className='stat-metric-card' style={{ '--card-accent': '#0F766E', '--icon-bg': '#F0FDFA', '--icon-color': '#0F766E' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-briefcase'></i>
                          </div>
                          <span className='stat-card-badge'>Licence Pro</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={bac3ProCount} duration={2} />
                          </div>
                          <div className='stat-card-title'>Profils Bac +3 PRO</div>
                          <p className='stat-card-desc'>Licences professionnelles &amp; filières d'État</p>
                        </div>
                      </Link>
                    </Col>

                    {/* Bac +5 & Master */}
                    <Col md={6} lg={3} sm={12}>
                      <Link to='/admin/candidatures' className='stat-metric-card' style={{ '--card-accent': '#9333EA', '--icon-bg': '#FAF5FF', '--icon-color': '#9333EA' }}>
                        <div className='stat-card-top'>
                          <div className='stat-card-icon-wrap'>
                            <i className='fas fa-award'></i>
                          </div>
                          <span className='stat-card-badge'>Master / Ingénieur</span>
                        </div>
                        <div>
                          <div className='stat-card-number'>
                            <CountUp end={bac5Count} duration={2} />
                          </div>
                          <div className='stat-card-title'>Profils Bac +5 / Master</div>
                          <p className='stat-card-desc'>Diplômes d'ingénieur et masters spécialisés</p>
                        </div>
                      </Link>
                    </Col>
                  </Row>
                </div>

                {/* SECTION 4 : RACCOURCIS ADMINISTRATIFS DIRECTS */}
                <div className='admin-section-card'>
                  <div className='admin-section-header'>
                    <div>
                      <h4 className='admin-section-title'>
                        <i className='fas fa-compass text-secondary'></i>
                        4. Raccourcis Administratifs &amp; Navigation Rapide
                      </h4>
                      <span className='admin-section-subtitle'>
                        Accès direct aux modules de gestion opérationnelle
                      </span>
                    </div>
                  </div>

                  <Row className='g-3'>
                    <Col md={4} sm={6}>
                      <Link to='/admin/candidatures' className='admin-quick-action-btn'>
                        <div className='admin-quick-action-icon'>
                          <i className='fas fa-id-card'></i>
                        </div>
                        <div>
                          <div>Registre des Candidatures</div>
                          <small className='text-muted fw-normal'>Export Excel, audit des pièces</small>
                        </div>
                      </Link>
                    </Col>

                    <Col md={4} sm={6}>
                      <Link to='/admin/offres' className='admin-quick-action-btn'>
                        <div className='admin-quick-action-icon' style={{ background: '#F0FDF4', color: '#16A34A' }}>
                          <i className='fas fa-bullhorn'></i>
                        </div>
                        <div>
                          <div>Gestion des Concours &amp; Offres</div>
                          <small className='text-muted fw-normal'>Publication et paramétrage barème</small>
                        </div>
                      </Link>
                    </Col>

                    <Col md={4} sm={6}>
                      <Link to='/admin/entreprises' className='admin-quick-action-btn'>
                        <div className='admin-quick-action-icon' style={{ background: '#FFF7ED', color: '#EA580C' }}>
                          <i className='fas fa-landmark'></i>
                        </div>
                        <div>
                          <div>Banques &amp; Entreprises</div>
                          <small className='text-muted fw-normal'>Logos, en-têtes et chartes</small>
                        </div>
                      </Link>
                    </Col>

                    <Col md={4} sm={6}>
                      <Link to='/controlleurs/candidatures/control1' className='admin-quick-action-btn'>
                        <div className='admin-quick-action-icon' style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                          <i className='fas fa-clipboard-check'></i>
                        </div>
                        <div>
                          <div>Module Contrôleur Commission</div>
                          <small className='text-muted fw-normal'>Audit 4 étapes des justificatifs</small>
                        </div>
                      </Link>
                    </Col>

                    <Col md={4} sm={6}>
                      <Link to='/maitre-ouvrage/candidatures' className='admin-quick-action-btn'>
                        <div className='admin-quick-action-icon' style={{ background: '#E0F2FE', color: '#0284C7' }}>
                          <i className='fas fa-briefcase'></i>
                        </div>
                        <div>
                          <div>Espace Recruteur Institutionnel</div>
                          <small className='text-muted fw-normal'>Tableau de bord Maître d'Ouvrage</small>
                        </div>
                      </Link>
                    </Col>

                    <Col md={4} sm={6}>
                      <Link to='/admin/utilisateurs' className='admin-quick-action-btn'>
                        <div className='admin-quick-action-icon' style={{ background: '#FEF2F2', color: '#DC2626' }}>
                          <i className='fas fa-users-cog'></i>
                        </div>
                        <div>
                          <div>Comptes &amp; Permissions</div>
                          <small className='text-muted fw-normal'>Gestion des rôles et accès</small>
                        </div>
                      </Link>
                    </Col>
                  </Row>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
