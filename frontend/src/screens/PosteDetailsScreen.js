import React, { Fragment, useState, useEffect } from 'react';
import { Card, Col, Container, Row, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr';
import { logout } from '../actions/userActions';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Heading from '../components/Heading';
import { getFileUrl } from '../utils/fileUrl';

const PosteDetailsScreen = () => {
  moment.locale('fr');
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOffreData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/offres/${encodeURIComponent(params.poste)}`);
        if (isMounted) {
          setOffre(data);
          setFetchError(null);
        }
      } catch (err) {
        if (isMounted) {
          // If not found in DB, we fall back to a structured placeholder for legacy posts
          setFetchError(err.response?.data?.message || 'Offre introuvable dans la base de données');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOffreData();
    return () => {
      isMounted = false;
    };
  }, [params.poste]);

  // Extract display values (real data from DB or smart fallbacks)
  const posteTitre = offre?.titre || params.poste;
  const entObj = offre?.entreprise && typeof offre.entreprise === 'object' ? offre.entreprise : {};
  const entNom = entObj.nom || offre?.entrepriseNom || 'Institution Officielle';
  const entSigle = entObj.sigle || offre?.entrepriseSigle || 'CONCOURS';
  const entLogo = entObj.logo || offre?.entrepriseLogo || '';
  const entColor = entObj.couleurPrimaire || offre?.entrepriseCouleur || '#1D4ED8';
  const secteur = offre?.secteur || entObj.secteur || 'Secteur Public / Institutionnel';
  const specialite = offre?.specialite || 'Spécialité Générale';
  const ville = offre?.ville || 'Réseau National';
  const niveau = offre?.niveau || 'Bac +2 / Bac +3';
  const postesCount = offre?.postes || 1;
  const pdfUrl = offre?.pdfUrl || '';

  // Dates & Status calculation
  const createdDate = offre?.createdAt ? moment(offre.createdAt).format('DD MMMM YYYY') : moment().format('DD MMMM YYYY');
  const dateLimiteObj = offre?.dateLimite ? moment(offre.dateLimite) : null;
  const isExpired = dateLimiteObj ? dateLimiteObj.isBefore(moment(), 'day') : false;
  const daysLeft = dateLimiteObj ? dateLimiteObj.diff(moment(), 'days') : null;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  return (
    <Fragment>
      <Header />
      <Heading
        title={`Concours : ${posteTitre}`}
        text={'Portail Officiel des Concours & Recrutements Nationaux'}
        poste={posteTitre}
      />

      <div style={{ backgroundColor: '#F8FAFC', minHeight: '80vh', padding: '36px 0 60px 0' }}>
        <Container>
          {loading ? (
            <div className='text-center py-5'>
              <Spinner animation='border' variant='primary' style={{ width: '3rem', height: '3rem' }} />
              <p className='text-muted mt-3 fw-bold'>Chargement des détails officiels du concours...</p>
            </div>
          ) : (
            <Row className='g-4'>
              {/* MAIN CONTENT (LEFT COLUMN) */}
              <Col lg={8}>
                {/* 1. INSTITUTION & JOB HERO BANNER */}
                <Card
                  className='border-0 shadow-sm mb-4 overflow-hidden'
                  style={{
                    borderRadius: '16px',
                    background: '#FFFFFF',
                    borderLeft: `6px solid ${entColor}`,
                  }}
                >
                  <Card.Body className='p-4'>
                    <div className='d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3'>
                      {/* Institution Badge */}
                      <div className='d-flex align-items-center gap-3'>
                        {entLogo ? (
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '12px',
                              background: '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px',
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            <img
                              src={entLogo}
                              alt={entNom}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '12px',
                              background: `${entColor}15`,
                              color: entColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '22px',
                              fontWeight: 'bold',
                            }}
                          >
                            <i className='fas fa-building'></i>
                          </div>
                        )}
                        <div>
                          <div className='d-flex align-items-center gap-2'>
                            <span className='fw-bold text-dark fs-6'>{entNom}</span>
                            <Badge bg='dark' style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                              {entSigle}
                            </Badge>
                          </div>
                          <small className='text-muted d-block'>
                            <i className='fas fa-briefcase me-1'></i> {secteur}
                          </small>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isExpired ? (
                          <Badge bg='danger' className='px-3 py-2 text-uppercase' style={{ fontSize: '12px' }}>
                            <i className='fas fa-clock me-1'></i> Dépôt Clôturé
                          </Badge>
                        ) : isUrgent ? (
                          <Badge bg='warning' text='dark' className='px-3 py-2 text-uppercase' style={{ fontSize: '12px' }}>
                            <i className='fas fa-exclamation-triangle me-1'></i> Clôture dans {daysLeft}j
                          </Badge>
                        ) : (
                          <Badge bg='success' className='px-3 py-2 text-uppercase' style={{ fontSize: '12px' }}>
                            <i className='fas fa-check-circle me-1'></i> Concours Actif
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h2 className='fw-bold text-dark mb-2' style={{ fontSize: '26px' }}>
                      {posteTitre}
                    </h2>

                    {/* Quick Badges Row */}
                    <div className='d-flex flex-wrap gap-2 pt-2'>
                      <span className='badge bg-light text-dark border px-3 py-2' style={{ fontSize: '12.5px' }}>
                        <i className='fas fa-user-friends text-primary me-1'></i> {postesCount} {postesCount > 1 ? 'Postes Budgétaires' : 'Poste Budgétaire'}
                      </span>
                      <span className='badge bg-light text-dark border px-3 py-2' style={{ fontSize: '12.5px' }}>
                        <i className='fas fa-graduation-cap text-success me-1'></i> {niveau}
                      </span>
                      <span className='badge bg-light text-dark border px-3 py-2' style={{ fontSize: '12.5px' }}>
                        <i className='fas fa-map-marker-alt text-danger me-1'></i> {ville}
                      </span>
                      <span className='badge bg-light text-dark border px-3 py-2' style={{ fontSize: '12.5px' }}>
                        <i className='fas fa-tag text-info me-1'></i> {specialite}
                      </span>
                    </div>
                  </Card.Body>
                </Card>

                {/* 2. DESCRIPTION & MISSIONS */}
                <Card className='border-0 shadow-sm mb-4' style={{ borderRadius: '16px' }}>
                  <Card.Header className='bg-white border-0 pt-4 px-4 pb-0'>
                    <h5 className='fw-bold text-dark d-flex align-items-center gap-2 mb-0'>
                      <i className='fas fa-clipboard-list text-primary'></i> Description & Missions Principales
                    </h5>
                  </Card.Header>
                  <Card.Body className='p-4'>
                    {offre?.description && offre.description.trim() ? (
                      <div
                        style={{
                          whiteSpace: 'pre-line',
                          lineHeight: '1.8',
                          color: '#334155',
                          fontSize: '14.5px',
                        }}
                      >
                        {offre.description}
                      </div>
                    ) : (
                      <div style={{ color: '#475569', lineHeight: '1.7', fontSize: '14px' }}>
                        <p>
                          Dans le cadre du renforcement de ses effectifs pour l’exercice en cours, <strong>{entNom}</strong> ouvre un concours national de recrutement pour le poste de <strong>{posteTitre}</strong>.
                        </p>
                        <h6 className='fw-bold text-dark mt-3'>Principales attributions confiées :</h6>
                        <ul className='mb-3' style={{ paddingLeft: '20px' }}>
                          <li>Assurer la réalisation et le suivi opérationnel des missions rattachées à la spécialité <em>{specialite}</em>.</li>
                          <li>Veiller au respect scrupuleux des normes de conformité, des délais et des procédures internes de l’institution.</li>
                          <li>Contribuer activement à l'amélioration de la qualité de service et à l'atteinte des objectifs stratégiques fixés.</li>
                          <li>Collaborer en transversalité avec les différentes directions et les équipes sur le terrain.</li>
                        </ul>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* 3. PROFIL RECHERCHÉ & CONDITIONS D'ÉLIGIBILITÉ */}
                <Card className='border-0 shadow-sm mb-4' style={{ borderRadius: '16px' }}>
                  <Card.Header className='bg-white border-0 pt-4 px-4 pb-0'>
                    <h5 className='fw-bold text-dark d-flex align-items-center gap-2 mb-0'>
                      <i className='fas fa-user-check text-success'></i> Profil Recherché & Conditions d'Éligibilité
                    </h5>
                  </Card.Header>
                  <Card.Body className='p-4'>
                    {offre?.profilRecherche && offre.profilRecherche.trim() ? (
                      <div
                        style={{
                          whiteSpace: 'pre-line',
                          lineHeight: '1.8',
                          color: '#334155',
                          fontSize: '14.5px',
                        }}
                      >
                        {offre.profilRecherche}
                      </div>
                    ) : (
                      <div className='d-flex flex-column gap-3'>
                        <div className='d-flex align-items-start gap-3 p-3 rounded-3' style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <i className='fas fa-flag text-primary mt-1'></i>
                          <div>
                            <strong className='text-dark d-block'>Nationalité & Citoyenneté</strong>
                            <span className='text-muted small'>Être de nationalité marocaine et jouir de l'ensemble de ses droits civiques.</span>
                          </div>
                        </div>

                        <div className='d-flex align-items-start gap-3 p-3 rounded-3' style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <i className='fas fa-graduation-cap text-success mt-1'></i>
                          <div>
                            <strong className='text-dark d-block'>Niveau Académique Requis</strong>
                            <span className='text-muted small'>Titulaire d’un diplôme de niveau <strong>{niveau}</strong> ou titre équivalent reconnu par l’État dans le domaine <strong>{specialite}</strong>.</span>
                          </div>
                        </div>

                        <div className='d-flex align-items-start gap-3 p-3 rounded-3' style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <i className='fas fa-award text-warning mt-1'></i>
                          <div>
                            <strong className='text-dark d-block'>Baccalauréat</strong>
                            <span className='text-muted small'>La possession du diplôme du Baccalauréat est obligatoire pour valider la candidature.</span>
                          </div>
                        </div>

                        <div className='d-flex align-items-start gap-3 p-3 rounded-3' style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <i className='fas fa-map-marked-alt text-danger mt-1'></i>
                          <div>
                            <strong className='text-dark d-block'>Affectation Géographique</strong>
                            <span className='text-muted small'>Être disposé à exercer dans les localités concernées : <strong>{ville}</strong>.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* 4. BARÈME OFFICIEL & GRILLE DE SCORING (100 PTS) */}
                {offre?.scoringRules && (
                  <Card className='border-0 shadow-sm mb-4' style={{ borderRadius: '16px' }}>
                    <Card.Header className='bg-white border-0 pt-4 px-4 pb-0'>
                      <div className='d-flex align-items-center justify-content-between flex-wrap gap-2'>
                        <h5 className='fw-bold text-dark d-flex align-items-center gap-2 mb-0'>
                          <i className='fas fa-calculator text-primary'></i> Barème Officiel de Classement (100 Pts)
                        </h5>
                        <Badge bg='primary' style={{ fontSize: '11px' }}>
                          Évaluation Automatique Conforme CNDP
                        </Badge>
                      </div>
                    </Card.Header>
                    <Card.Body className='p-4'>
                      <p className='text-muted small mb-3'>
                        Les dossiers des candidats sont classés de façon équitable et transparente selon les barèmes paramétrés par la commission de sélection de <strong>{entNom}</strong> :
                      </p>

                      <Row className='g-3'>
                        {/* Critère Note */}
                        {offre.scoringRules.note?.actif && (
                          <Col sm={6}>
                            <div className='p-3 rounded-3 border bg-light h-100'>
                              <div className='d-flex justify-content-between align-items-center mb-1'>
                                <span className='fw-bold text-dark small'>
                                  <i className='fas fa-star text-warning me-1'></i> Moyenne / Note Diplôme
                                </span>
                                <Badge bg='dark'>{offre.scoringRules.note.poidsMax} Pts</Badge>
                              </div>
                              <span className='text-muted' style={{ fontSize: '11.5px' }}>
                                Échelonné selon la mention et la moyenne générale obtenue au diplôme requis.
                              </span>
                            </div>
                          </Col>
                        )}

                        {/* Critère Expérience */}
                        {offre.scoringRules.experience?.actif && (
                          <Col sm={6}>
                            <div className='p-3 rounded-3 border bg-light h-100'>
                              <div className='d-flex justify-content-between align-items-center mb-1'>
                                <span className='fw-bold text-dark small'>
                                  <i className='fas fa-briefcase text-primary me-1'></i> Expérience Professionnelle
                                </span>
                                <Badge bg='dark'>{offre.scoringRules.experience.poidsMax} Pts</Badge>
                              </div>
                              <span className='text-muted' style={{ fontSize: '11.5px' }}>
                                Attribué au prorata des mois d'expérience justifiés dans le domaine {offre.scoringRules.experience.nomSpecialite || 'requis'}.
                              </span>
                            </div>
                          </Col>
                        )}

                        {/* Critère Diplôme */}
                        {offre.scoringRules.diplome?.actif && (
                          <Col sm={6}>
                            <div className='p-3 rounded-3 border bg-light h-100'>
                              <div className='d-flex justify-content-between align-items-center mb-1'>
                                <span className='fw-bold text-dark small'>
                                  <i className='fas fa-user-graduate text-success me-1'></i> Niveau de Qualification
                                </span>
                                <Badge bg='dark'>{offre.scoringRules.diplome.poidsMax} Pts</Badge>
                              </div>
                              <span className='text-muted' style={{ fontSize: '11.5px' }}>
                                Bonus selon le niveau d'études académique (Bac+2, Bac+3, Bac+5).
                              </span>
                            </div>
                          </Col>
                        )}

                        {/* Critère Âge */}
                        {offre.scoringRules.age?.actif && (
                          <Col sm={6}>
                            <div className='p-3 rounded-3 border bg-light h-100'>
                              <div className='d-flex justify-content-between align-items-center mb-1'>
                                <span className='fw-bold text-dark small'>
                                  <i className='fas fa-birthday-cake text-danger me-1'></i> Critère de Tranche d'Âge
                                </span>
                                <Badge bg='dark'>{offre.scoringRules.age.poidsMax} Pts</Badge>
                              </div>
                              <span className='text-muted' style={{ fontSize: '11.5px' }}>
                                Attribution de points selon les tranches d'âge réglementaires du concours.
                              </span>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* 5. AVIS OFFICIEL PDF BANNER (IF ATTACHED) */}
                {pdfUrl && (
                  <Card
                    className='border-0 shadow-sm mb-4 text-white overflow-hidden'
                    style={{
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    }}
                  >
                    <Card.Body className='p-4 d-flex align-items-center justify-content-between flex-wrap gap-3'>
                      <div className='d-flex align-items-center gap-3'>
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                          }}
                        >
                          <i className='fas fa-file-pdf'></i>
                        </div>
                        <div>
                          <h6 className='fw-bold mb-1 text-white'>Avis de Recrutement & Cahier des Charges</h6>
                          <small className='text-slate-400' style={{ color: '#94A3B8' }}>
                            Téléchargez le document officiel scanné signé par la direction de {entNom}.
                          </small>
                        </div>
                      </div>
                      <a
                        href={getFileUrl(pdfUrl)}
                        target='_blank'
                        rel='noreferrer'
                        className='btn btn-light fw-bold px-4 py-2'
                        style={{ borderRadius: '10px', fontSize: '13.5px' }}
                      >
                        <i className='fas fa-download me-2 text-danger'></i> Télécharger PDF
                      </a>
                    </Card.Body>
                  </Card>
                )}
              </Col>

              {/* SIDEBAR (RIGHT COLUMN) */}
              <Col lg={4}>
                <div style={{ position: 'sticky', top: '100px' }}>
                  <Card className='border-0 shadow-sm mb-4' style={{ borderRadius: '16px' }}>
                    <Card.Header className='bg-white border-0 pt-4 px-4 pb-2'>
                      <h5 className='fw-bold text-dark mb-0'>
                        <i className='fas fa-info-circle text-primary me-2'></i> Fiche du Concours
                      </h5>
                    </Card.Header>
                    <Card.Body className='p-4 pt-2'>
                      <div className='d-flex flex-column gap-3 py-2'>
                        {/* Date Annonce */}
                        <div className='d-flex justify-content-between align-items-center pb-2 border-bottom'>
                          <span className='text-muted small'>
                            <i className='fas fa-calendar-alt me-2 text-muted'></i> Date d'annonce
                          </span>
                          <span className='fw-bold text-dark small'>{createdDate}</span>
                        </div>

                        {/* Date Clôture */}
                        <div className='d-flex justify-content-between align-items-center pb-2 border-bottom'>
                          <span className='text-muted small'>
                            <i className='fas fa-calendar-check me-2 text-danger'></i> Date limite
                          </span>
                          <span className='fw-bold text-danger small'>
                            {dateLimiteObj ? dateLimiteObj.format('DD/MM/YYYY') : 'Non spécifiée'}
                          </span>
                        </div>

                        {/* Secteur */}
                        <div className='d-flex justify-content-between align-items-center pb-2 border-bottom'>
                          <span className='text-muted small'>
                            <i className='fas fa-industry me-2 text-muted'></i> Secteur
                          </span>
                          <span className='fw-bold text-dark small text-end'>{secteur}</span>
                        </div>

                        {/* Spécialité */}
                        <div className='d-flex justify-content-between align-items-center pb-2 border-bottom'>
                          <span className='text-muted small'>
                            <i className='fas fa-tag me-2 text-muted'></i> Spécialité
                          </span>
                          <span className='fw-bold text-dark small text-end'>{specialite}</span>
                        </div>

                        {/* Niveau Requis */}
                        <div className='d-flex justify-content-between align-items-center pb-2 border-bottom'>
                          <span className='text-muted small'>
                            <i className='fas fa-graduation-cap me-2 text-muted'></i> Niveau d'études
                          </span>
                          <span className='fw-bold text-primary small'>{niveau}</span>
                        </div>

                        {/* Postes Budgétaires */}
                        <div className='d-flex justify-content-between align-items-center pb-2 border-bottom'>
                          <span className='text-muted small'>
                            <i className='fas fa-users me-2 text-muted'></i> Postes à pourvoir
                          </span>
                          <span className='fw-bold text-dark small'>{postesCount} {postesCount > 1 ? 'postes' : 'poste'}</span>
                        </div>

                        {/* Villes */}
                        <div className='d-flex justify-content-between align-items-center pb-2 border-bottom'>
                          <span className='text-muted small'>
                            <i className='fas fa-map-marker-alt me-2 text-muted'></i> Régions ciblées
                          </span>
                          <span className='fw-bold text-dark small text-end'>{ville}</span>
                        </div>
                      </div>

                      {/* CALL TO ACTION BUTTON */}
                      <div className='mt-4 pt-2'>
                        {isStaffUser ? (
                          <div
                            className='p-3 text-center rounded-3'
                            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
                          >
                            <i className='fas fa-user-shield text-danger fs-4 mb-2'></i>
                            <div className='text-danger fw-bold small mb-1'>
                              Accès Candidature Réservé
                            </div>
                            <p className='text-muted' style={{ fontSize: '11.5px', marginBottom: '12px', lineHeight: '1.4' }}>
                              Vous êtes connecté en tant que{' '}
                              <strong>{userInfo.isMaitreOuvrage ? 'Recruteur RH' : 'Administrateur'}</strong>.
                              Seuls les profils candidats peuvent déposer un dossier.
                            </p>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              className='w-100 fw-bold py-2'
                              style={{ fontSize: '12px', borderRadius: '8px' }}
                              onClick={() => {
                                dispatch(logout());
                                navigate(`/register?redirect=/poste/${encodeURIComponent(posteTitre)}`);
                              }}
                            >
                              <i className='fas fa-user-plus me-1'></i> Créer un compte Candidat
                            </Button>
                          </div>
                        ) : isExpired ? (
                          <Button
                            disabled
                            className='w-100 py-3 fw-bold'
                            style={{
                              background: '#94A3B8',
                              border: 'none',
                              borderRadius: '12px',
                              fontSize: '15px',
                            }}
                          >
                            <i className='fas fa-ban me-2'></i> Concours Clôturé
                          </Button>
                        ) : (
                          <LinkContainer to={`/poste/${encodeURIComponent(posteTitre)}/informations-personnelles`}>
                            <Button
                              className='w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow'
                              style={{
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15.5px',
                              }}
                            >
                              <i className='fas fa-paper-plane'></i> Postuler en Ligne
                            </Button>
                          </LinkContainer>
                        )}
                      </div>

                      {/* CNDP Legal Protection Strip */}
                      <div className='mt-3 text-center'>
                        <small className='text-muted' style={{ fontSize: '11px', lineHeight: '1.3' }}>
                          <i className='fas fa-shield-alt text-success me-1'></i>
                          Dépôt crypté & sécurisé conforme à la <strong>Loi 09-08 (CNDP)</strong>.
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      <Footer />
    </Fragment>
  );
};

export default PosteDetailsScreen;
