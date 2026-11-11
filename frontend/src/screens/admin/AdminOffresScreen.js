import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import AdminSideBar from '../../components/AdminSideBar';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import {
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
  Badge,
  Modal,
  Button,
  Nav,
  ProgressBar,
} from 'react-bootstrap';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import { Link } from 'react-router-dom';
import Spinner from '../../components/Spinner';

const DEFAULT_SCORING_RULES = {
  maxScore: 100,
  age: {
    actif: true,
    poidsMax: 10,
    tranches: [
      { min: 18, max: 24, points: 10 },
      { min: 25, max: 28, points: 7 },
      { min: 29, max: 35, points: 3 },
    ],
  },
  note: {
    actif: true,
    poidsMax: 40,
    modeCalcul: 'tranches',
    tranches: [
      { minNote: 16, points: 40 },
      { minNote: 14, points: 30 },
      { minNote: 12, points: 20 },
      { minNote: 10, points: 10 },
    ],
  },
  mention: {
    actif: false,
    poidsMax: 20,
    points: { tresBien: 20, bien: 15, assezBien: 10, passable: 5 },
  },
  experience: {
    actif: true,
    poidsMax: 30,
    nomSpecialite: 'Bancaire',
    pointsParMoisSpecialite: 0.625,
    pointsParMoisAutre: 0.15,
    maxMois: 48,
  },
  diplome: {
    actif: true,
    poidsMax: 20,
    pointsParNiveau: { bac2: 10, bac3: 15, bac5: 20 },
  },
};

const AdminOffresScreen = () => {
  const navigate = useNavigate();
  const { addToast } = useToasts();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [offres, setOffres] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Tabs State
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('general');
  const [editingOffreId, setEditingOffreId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields - General
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState('');
  const [titre, setTitre] = useState('');
  const [specialite, setSpecialite] = useState('Réseau Agences Bancaires');
  const [secteur, setSecteur] = useState('Secteur Bancaire');
  const [ville, setVille] = useState('Réseau National');
  const [niveau, setNiveau] = useState('Bac +2 / Bac +3');
  const [postes, setPostes] = useState(10);
  const [dateLimite, setDateLimite] = useState('');
  const [statut, setStatut] = useState('En cours');
  const [description, setDescription] = useState('');
  const [profilRecherche, setProfilRecherche] = useState('');

  // Form Fields - Scoring Rules (Sliders & Config)
  const [scoring, setScoring] = useState(DEFAULT_SCORING_RULES);

  // Fetch Offres & Entreprises
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resOffres, resEntreprises] = await Promise.all([
        axios.get('/api/offres'),
        axios.get('/api/entreprises'),
      ]);
      setOffres(resOffres.data);
      setEntreprises(resEntreprises.data);
      if (resEntreprises.data.length > 0 && !selectedEntrepriseId) {
        setSelectedEntrepriseId(resEntreprises.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [userInfo, navigate]);

  // Open Modal for New Offre
  const handleOpenCreateModal = () => {
    setEditingOffreId(null);
    setTitre('');
    setSpecialite('Réseau Agences Bancaires');
    setSecteur('Secteur Bancaire');
    setVille('Réseau National');
    setNiveau('Bac +2 / Bac +3');
    setPostes(10);
    setDateLimite('');
    setStatut('En cours');
    setDescription('');
    setProfilRecherche('');
    setScoring(JSON.parse(JSON.stringify(DEFAULT_SCORING_RULES)));
    if (entreprises.length > 0) {
      setSelectedEntrepriseId(entreprises[0]._id);
      setSecteur(entreprises[0].secteur);
    }
    setModalTab('general');
    setShowModal(true);
  };

  // Open Modal for Edit Offre
  const handleOpenEditModal = (offre) => {
    setEditingOffreId(offre._id);
    setTitre(offre.titre || '');
    setSelectedEntrepriseId(offre.entreprise?._id || offre.entreprise || '');
    setSpecialite(offre.specialite || 'Réseau Agences Bancaires');
    setSecteur(offre.secteur || 'Secteur Bancaire');
    setVille(offre.ville || 'Réseau National');
    setNiveau(offre.niveau || 'Bac +2 / Bac +3');
    setPostes(offre.postes || 1);
    setDateLimite(offre.dateLimite ? offre.dateLimite.substring(0, 10) : '');
    setStatut(offre.statut || 'En cours');
    setDescription(offre.description || '');
    setProfilRecherche(offre.profilRecherche || '');

    if (offre.scoringRules) {
      setScoring(JSON.parse(JSON.stringify(offre.scoringRules)));
    } else {
      setScoring(JSON.parse(JSON.stringify(DEFAULT_SCORING_RULES)));
    }

    setModalTab('general');
    setShowModal(true);
  };

  // Handle Entreprise Change in Form
  const handleEntrepriseChange = (id) => {
    setSelectedEntrepriseId(id);
    const ent = entreprises.find((e) => e._id === id);
    if (ent) {
      setSecteur(ent.secteur);
      // Auto-adapt scoring specialty recommendation
      if (ent.sigle === 'OCP') {
        setScoring((prev) => ({
          ...prev,
          experience: { ...prev.experience, nomSpecialite: 'Industrie' },
          age: { ...prev.age, actif: false, poidsMax: 0 },
        }));
      } else if (ent.sigle === 'MEF') {
        setScoring((prev) => ({
          ...prev,
          experience: { ...prev.experience, nomSpecialite: 'Public' },
          mention: { ...prev.mention, actif: true },
        }));
      } else {
        setScoring((prev) => ({
          ...prev,
          experience: { ...prev.experience, nomSpecialite: 'Bancaire' },
        }));
      }
    }
  };

  // Calculated Total Weight Gauge
  const totalConfiguredWeight = useMemo(() => {
    let sum = 0;
    if (scoring.age?.actif) sum += Number(scoring.age.poidsMax) || 0;
    if (scoring.note?.actif) sum += Number(scoring.note.poidsMax) || 0;
    if (scoring.mention?.actif) sum += Number(scoring.mention.poidsMax) || 0;
    if (scoring.experience?.actif) sum += Number(scoring.experience.poidsMax) || 0;
    if (scoring.diplome?.actif) sum += Number(scoring.diplome.poidsMax) || 0;
    return sum;
  }, [scoring]);

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titre.trim()) {
      addToast('Veuillez renseigner le titre du poste', { appearance: 'error', autoDismiss: true });
      return;
    }

    try {
      setSubmitting(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const payload = {
        titre,
        entreprise: selectedEntrepriseId || undefined,
        specialite,
        secteur,
        ville,
        niveau,
        postes: Number(postes) || 1,
        dateLimite: dateLimite || undefined,
        statut,
        description,
        profilRecherche,
        scoringRules: scoring,
      };

      if (editingOffreId) {
        await axios.put(`/api/offres/${editingOffreId}`, payload, config);
        addToast('Offre et barème mis à jour avec succès !', {
          appearance: 'success',
          autoDismiss: true,
        });
      } else {
        await axios.post('/api/offres', payload, config);
        addToast('Nouvelle offre publiée avec succès !', {
          appearance: 'success',
          autoDismiss: true,
        });
      }

      setShowModal(false);
      setSubmitting(false);
      fetchData();
    } catch (err) {
      setSubmitting(false);
      addToast(err.response?.data?.message || err.message, {
        appearance: 'error',
        autoDismiss: true,
      });
    }
  };

  // Delete Offre
  const handleDelete = async (id, title) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le concours "${title}" ?`)) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`/api/offres/${id}`, config);
        addToast('Poste supprimé avec succès', { appearance: 'info', autoDismiss: true });
        fetchData();
      } catch (err) {
        addToast(err.response?.data?.message || err.message, {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  // Toggle Statut
  const handleToggleStatut = async (offre) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const newStatut = offre.statut === 'En cours' ? 'Clôturé' : 'En cours';
      await axios.put(`/api/offres/${offre._id}`, { statut: newStatut }, config);
      addToast(`Statut mis à jour : ${newStatut}`, { appearance: 'success', autoDismiss: true });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message, { appearance: 'error', autoDismiss: true });
    }
  };

  return (
    <div id='root'>
      <div className='app'>
        <AdminSideBar prenom={userInfo?.prenom} nom={userInfo?.nom} />
        <main>
          <HeaderAdministrateur
            headerTitle='Gestion des Offres & Barèmes Multi-Entreprises'
            endPoint='/admin/offres'
          />

          <Container className='mt-4 mb-5'>
            {/* TOP BAR */}
            <Row className='mb-4 align-items-center'>
              <Col md={7}>
                <h3 style={{ color: '#0F172A', fontWeight: '800', letterSpacing: '-0.02em' }}>
                  <i className='fas fa-sliders-h text-primary me-2'></i>
                  Concours & Barèmes de Scoring
                </h3>
                <p className='text-muted mb-0'>
                  Gérez les concours des banques et ministères et configurez le barème de scoring sur-mesure pour chaque poste.
                </p>
              </Col>
              <Col md={5} className='text-end'>
                <Button
                  variant='primary'
                  className='fw-bold px-4 py-2 shadow-sm'
                  style={{ borderRadius: '10px' }}
                  onClick={handleOpenCreateModal}
                >
                  <i className='fas fa-plus-circle me-2'></i>
                  Créer une Offre avec Barème
                </Button>
              </Col>
            </Row>

            {/* OFFRES LIST TABLE */}
            {loading ? (
              <Spinner />
            ) : error ? (
              <div className='alert alert-danger'>{error}</div>
            ) : (
              <Card className='shadow-sm border-0' style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Card.Body className='p-0'>
                  <Table responsive hover className='mb-0 align-middle'>
                    <thead style={{ backgroundColor: '#0F172A', color: '#fff', fontSize: '13px' }}>
                      <tr>
                        <th className='ps-4'>Organisation</th>
                        <th>Intitulé du Poste & Ville</th>
                        <th>Niveau / Postes</th>
                        <th>Barème Actif</th>
                        <th>Statut</th>
                        <th className='text-center pe-4'>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px' }}>
                      {offres.map((offre) => {
                        const ent = offre.entreprise || {};
                        const sigle = ent.sigle || offre.entrepriseSigle || 'ABB';
                        const color = ent.couleurPrimaire || offre.entrepriseCouleur || '#003366';
                        const nom = ent.nom || offre.entrepriseNom || 'Al Barid Bank';
                        const rules = offre.scoringRules || {};

                        return (
                          <tr key={offre._id}>
                            <td className='ps-4'>
                              <div className='d-flex align-items-center gap-2'>
                                <span
                                  className='badge rounded-pill px-2 py-1'
                                  style={{ backgroundColor: color, color: '#fff', fontSize: '11px', fontWeight: '800' }}
                                >
                                  {sigle}
                                </span>
                                <div>
                                  <strong className='d-block' style={{ color: '#0F172A', fontSize: '13px' }}>
                                    {nom}
                                  </strong>
                                  <small className='text-muted'>{offre.secteur || ent.secteur}</small>
                                </div>
                              </div>
                            </td>

                            <td>
                              <strong style={{ color: '#1E293B' }}>{offre.titre}</strong>
                              <div className='text-muted small'>
                                <i className='fas fa-map-marker-alt me-1 text-secondary'></i>
                                {offre.ville || 'Réseau National'}
                              </div>
                            </td>

                            <td>
                              <div>{offre.niveau || 'Bac +2 / Bac +3'}</div>
                              <span className='badge bg-light text-dark border'>
                                <strong>{offre.postes || 1}</strong> postes
                              </span>
                            </td>

                            <td>
                              <div className='d-flex flex-wrap gap-1'>
                                {rules.age?.actif && (
                                  <span className='badge bg-primary' style={{ fontSize: '10px' }}>
                                    Âge: {rules.age.poidsMax}p
                                  </span>
                                )}
                                {rules.note?.actif && (
                                  <span className='badge bg-info text-dark' style={{ fontSize: '10px' }}>
                                    Note: {rules.note.poidsMax}p
                                  </span>
                                )}
                                {rules.experience?.actif && (
                                  <span className='badge bg-success' style={{ fontSize: '10px' }}>
                                    Exp: {rules.experience.poidsMax}p
                                  </span>
                                )}
                                {rules.diplome?.actif && (
                                  <span className='badge bg-warning text-dark' style={{ fontSize: '10px' }}>
                                    Dip: {rules.diplome.poidsMax}p
                                  </span>
                                )}
                                {rules.mention?.actif && (
                                  <span className='badge bg-purple text-white' style={{ backgroundColor: '#8B5CF6', fontSize: '10px' }}>
                                    Mention: {rules.mention.poidsMax}p
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <Badge
                                bg={offre.statut === 'En cours' ? 'success' : 'secondary'}
                                style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '8px' }}
                                onClick={() => handleToggleStatut(offre)}
                                title='Cliquer pour basculer le statut'
                              >
                                {offre.statut}{' '}
                                <i className='fas fa-sync-alt ms-1' style={{ fontSize: '10px' }}></i>
                              </Badge>
                            </td>

                            <td className='text-center pe-4'>
                              <div className='d-flex justify-content-center gap-1'>
                                <Link
                                  to={`/poste/${encodeURIComponent(offre.titre)}`}
                                  className='btn btn-sm btn-outline-secondary'
                                  target='_blank'
                                  title='Voir la page candidat'
                                >
                                  <i className='fas fa-external-link-alt'></i>
                                </Link>

                                <Button
                                  variant='outline-primary'
                                  size='sm'
                                  onClick={() => handleOpenEditModal(offre)}
                                  title='Modifier l’offre & le barème'
                                >
                                  <i className='fas fa-edit'></i>
                                </Button>

                                <Button
                                  variant='outline-danger'
                                  size='sm'
                                  onClick={() => handleDelete(offre._id, offre.titre)}
                                  title='Supprimer ce concours'
                                >
                                  <i className='fas fa-trash-alt'></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* MODAL CRÉATION / ÉDITION D'UNE OFFRE AVEC CONFIGURATEUR DE BARÈME */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size='xl' centered backdrop='static'>
              <Modal.Header closeButton style={{ backgroundColor: '#0F172A', color: '#fff' }}>
                <Modal.Title style={{ fontSize: '18px', fontWeight: '800' }}>
                  <i className='fas fa-sliders-h text-primary me-2'></i>
                  {editingOffreId ? "Modifier le Concours & son Barème de Scoring" : "Publier un Concours avec Barème de Scoring sur-mesure"}
                </Modal.Title>
              </Modal.Header>

              <Form onSubmit={handleSubmit}>
                <Modal.Body className='p-0'>
                  {/* NAVIGATION TABS */}
                  <div className='border-bottom bg-light px-4 pt-3'>
                    <Nav variant='tabs' activeKey={modalTab} onSelect={(k) => setModalTab(k)}>
                      <Nav.Item>
                        <Nav.Link eventKey='general' className='fw-bold'>
                          <i className='fas fa-info-circle me-2'></i>
                          1. Informations Générales du Poste
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey='bareme' className='fw-bold'>
                          <i className='fas fa-calculator me-2'></i>
                          2. Moteur de Scoring & Grille du Barème ({totalConfiguredWeight} / 100 pts)
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>

                  <div className='p-4' style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                    {/* ONGLET 1 : INFORMATIONS GÉNÉRALES */}
                    {modalTab === 'general' && (
                      <Row>
                        <Col md={6} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Organisation / Entreprise Recruteuse *</Form.Label>
                            <Form.Select
                              value={selectedEntrepriseId}
                              onChange={(e) => handleEntrepriseChange(e.target.value)}
                              required
                            >
                              {entreprises.map((ent) => (
                                <option key={ent._id} value={ent._id}>
                                  {ent.nom} ({ent.sigle}) - {ent.secteur}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col md={6} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Intitulé Officiel du Poste *</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='Ex: Chargé de Clientèle Particuliers, Inspecteur des Finances...'
                              value={titre}
                              onChange={(e) => setTitre(e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Secteur d'Activité</Form.Label>
                            <Form.Control
                              type='text'
                              value={secteur}
                              onChange={(e) => setSecteur(e.target.value)}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Ville ou Région</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='Ex: Casablanca, Rabat, Réseau National...'
                              value={ville}
                              onChange={(e) => setVille(e.target.value)}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Niveau d'études requis</Form.Label>
                            <Form.Select value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                              <option value='Bac +2 / BTS / DUT'>Bac +2 / BTS / DUT</option>
                              <option value='Bac +3 / Licence'>Bac +3 / Licence</option>
                              <option value='Bac +5 / Master / Ingénieur'>Bac +5 / Master / Ingénieur</option>
                              <option value='Doctorat'>Doctorat</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col md={4} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Postes Budgétaires Ouverts</Form.Label>
                            <Form.Control
                              type='number'
                              min='1'
                              value={postes}
                              onChange={(e) => setPostes(e.target.value)}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Date Limite de Dépôt</Form.Label>
                            <Form.Control
                              type='date'
                              value={dateLimite}
                              onChange={(e) => setDateLimite(e.target.value)}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Statut du Concours</Form.Label>
                            <Form.Select value={statut} onChange={(e) => setStatut(e.target.value)}>
                              <option value='En cours'>En cours (Ouvert aux candidatures)</option>
                              <option value='Clôturé'>Clôturé (Fermé)</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col md={12} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Missions Principales</Form.Label>
                            <Form.Control
                              as='textarea'
                              rows={3}
                              placeholder='Décrire les missions et responsabilités associées à ce poste...'
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={12} className='mb-3'>
                          <Form.Group>
                            <Form.Label className='fw-bold'>Profil Recherché & Conditions</Form.Label>
                            <Form.Control
                              as='textarea'
                              rows={3}
                              placeholder='Ex: Être de nationalité marocaine, titulaire d’un diplôme d’État...'
                              value={profilRecherche}
                              onChange={(e) => setProfilRecherche(e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}

                    {/* ONGLET 2 : CONFIGURATION VISUELLE DU BARÈME */}
                    {modalTab === 'bareme' && (
                      <div>
                        {/* TOTAL WEIGHT GAUGE */}
                        <div className='p-3 mb-4 rounded bg-light border d-flex justify-content-between align-items-center'>
                          <div>
                            <span className='fw-bold text-dark me-2'>Pondération Totale Configurée :</span>
                            <Badge
                              bg={totalConfiguredWeight === 100 ? 'success' : 'warning'}
                              style={{ fontSize: '15px' }}
                            >
                              {totalConfiguredWeight} / 100 points
                            </Badge>
                            <div className='text-muted small mt-1'>
                              {totalConfiguredWeight === 100
                                ? '✓ Le barème est parfaitement équilibré sur 100 points.'
                                : '⚠️ Ajustez les curseurs pour que le total atteigne 100 points.'}
                            </div>
                          </div>
                          <div style={{ width: '220px' }}>
                            <ProgressBar
                              now={Math.min(totalConfiguredWeight, 100)}
                              variant={totalConfiguredWeight === 100 ? 'success' : 'warning'}
                              animated
                            />
                          </div>
                        </div>

                        {/* CRITÈRE 1 : ÂGE */}
                        <Card className='mb-3 border'>
                          <Card.Header className='bg-white d-flex justify-content-between align-items-center py-2'>
                            <Form.Check
                              type='switch'
                              id='switch-age'
                              label={<strong className='text-primary'><i className='fas fa-user-clock me-1'></i> 1. Critère d'Âge du Candidat</strong>}
                              checked={scoring.age?.actif}
                              onChange={(e) =>
                                setScoring((prev) => ({
                                  ...prev,
                                  age: { ...prev.age, actif: e.target.checked },
                                }))
                              }
                            />
                            {scoring.age?.actif && (
                              <Badge bg='primary'>Poids Max : {scoring.age.poidsMax} pts</Badge>
                            )}
                          </Card.Header>
                          {scoring.age?.actif && (
                            <Card.Body className='bg-light py-3'>
                              <Row className='align-items-center mb-3'>
                                <Col md={5}>
                                  <Form.Label className='small fw-bold'>Poids Maximum du critère d'âge :</Form.Label>
                                  <Form.Range
                                    min='0'
                                    max='25'
                                    step='1'
                                    value={scoring.age.poidsMax}
                                    onChange={(e) =>
                                      setScoring((prev) => ({
                                        ...prev,
                                        age: { ...prev.age, poidsMax: Number(e.target.value) },
                                      }))
                                    }
                                  />
                                </Col>
                                <Col md={2}>
                                  <span className='fw-bold text-primary fs-5'>{scoring.age.poidsMax} pts</span>
                                </Col>
                              </Row>

                              <div className='small text-muted mb-2'>
                                Barème par tranches (Al Barid Bank & Fonction Publique valorisent les tranches jeunes) :
                              </div>
                              <Row className='g-2'>
                                <Col md={4}>
                                  <div className='p-2 bg-white rounded border'>
                                    <small className='text-muted d-block'>18 à 24 ans :</small>
                                    <strong className='text-success'>+10 pts</strong>
                                  </div>
                                </Col>
                                <Col md={4}>
                                  <div className='p-2 bg-white rounded border'>
                                    <small className='text-muted d-block'>25 à 28 ans :</small>
                                    <strong className='text-primary'>+7 pts</strong>
                                  </div>
                                </Col>
                                <Col md={4}>
                                  <div className='p-2 bg-white rounded border'>
                                    <small className='text-muted d-block'>29 ans et plus :</small>
                                    <strong className='text-secondary'>0 à 3 pts</strong>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          )}
                        </Card>

                        {/* CRITÈRE 2 : NOTE ACADÉMIQUE / MOYENNE */}
                        <Card className='mb-3 border'>
                          <Card.Header className='bg-white d-flex justify-content-between align-items-center py-2'>
                            <Form.Check
                              type='switch'
                              id='switch-note'
                              label={<strong className='text-info'><i className='fas fa-chart-line me-1'></i> 2. Critère de Note Académique / Moyenne</strong>}
                              checked={scoring.note?.actif}
                              onChange={(e) =>
                                setScoring((prev) => ({
                                  ...prev,
                                  note: { ...prev.note, actif: e.target.checked },
                                }))
                              }
                            />
                            {scoring.note?.actif && (
                              <Badge bg='info' className='text-dark'>Poids Max : {scoring.note.poidsMax} pts</Badge>
                            )}
                          </Card.Header>
                          {scoring.note?.actif && (
                            <Card.Body className='bg-light py-3'>
                              <Row className='align-items-center mb-3'>
                                <Col md={5}>
                                  <Form.Label className='small fw-bold'>Poids Maximum de la Note :</Form.Label>
                                  <Form.Range
                                    min='10'
                                    max='50'
                                    step='1'
                                    value={scoring.note.poidsMax}
                                    onChange={(e) =>
                                      setScoring((prev) => ({
                                        ...prev,
                                        note: { ...prev.note, poidsMax: Number(e.target.value) },
                                      }))
                                    }
                                  />
                                </Col>
                                <Col md={2}>
                                  <span className='fw-bold text-info fs-5'>{scoring.note.poidsMax} pts</span>
                                </Col>
                                <Col md={5}>
                                  <Form.Label className='small fw-bold'>Méthode de Calcul :</Form.Label>
                                  <div>
                                    <Form.Check
                                      inline
                                      type='radio'
                                      name='modeCalcul'
                                      label='Par Paliers (>=16, >=14...)'
                                      checked={scoring.note.modeCalcul === 'tranches'}
                                      onChange={() =>
                                        setScoring((prev) => ({
                                          ...prev,
                                          note: { ...prev.note, modeCalcul: 'tranches' },
                                        }))
                                      }
                                    />
                                    <Form.Check
                                      inline
                                      type='radio'
                                      name='modeCalcul'
                                      label='Proportionnel (/20)'
                                      checked={scoring.note.modeCalcul === 'proportionnel'}
                                      onChange={() =>
                                        setScoring((prev) => ({
                                          ...prev,
                                          note: { ...prev.note, modeCalcul: 'proportionnel' },
                                        }))
                                      }
                                    />
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          )}
                        </Card>

                        {/* CRITÈRE 3 : MENTION DU DIPLÔME */}
                        <Card className='mb-3 border'>
                          <Card.Header className='bg-white d-flex justify-content-between align-items-center py-2'>
                            <Form.Check
                              type='switch'
                              id='switch-mention'
                              label={<strong style={{ color: '#8B5CF6' }}><i className='fas fa-award me-1'></i> 3. Critère de Mention du Diplôme</strong>}
                              checked={scoring.mention?.actif}
                              onChange={(e) =>
                                setScoring((prev) => ({
                                  ...prev,
                                  mention: { ...prev.mention, actif: e.target.checked },
                                }))
                              }
                            />
                            {scoring.mention?.actif && (
                              <Badge style={{ backgroundColor: '#8B5CF6' }}>Poids Max : {scoring.mention.poidsMax} pts</Badge>
                            )}
                          </Card.Header>
                          {scoring.mention?.actif && (
                            <Card.Body className='bg-light py-3'>
                              <Row className='align-items-center mb-2'>
                                <Col md={5}>
                                  <Form.Label className='small fw-bold'>Poids Maximum Mention :</Form.Label>
                                  <Form.Range
                                    min='0'
                                    max='25'
                                    step='1'
                                    value={scoring.mention.poidsMax}
                                    onChange={(e) =>
                                      setScoring((prev) => ({
                                        ...prev,
                                        mention: { ...prev.mention, poidsMax: Number(e.target.value) },
                                      }))
                                    }
                                  />
                                </Col>
                                <Col md={2}>
                                  <span className='fw-bold fs-5' style={{ color: '#8B5CF6' }}>{scoring.mention.poidsMax} pts</span>
                                </Col>
                                <Col md={5}>
                                  <div className='small text-muted'>
                                    Très Bien: <strong>{scoring.mention.points?.tresBien || 20}p</strong> • Bien: <strong>{scoring.mention.points?.bien || 15}p</strong> • Assez Bien: <strong>{scoring.mention.points?.assezBien || 10}p</strong>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          )}
                        </Card>

                        {/* CRITÈRE 4 : EXPÉRIENCE PROFESSIONNELLE */}
                        <Card className='mb-3 border'>
                          <Card.Header className='bg-white d-flex justify-content-between align-items-center py-2'>
                            <Form.Check
                              type='switch'
                              id='switch-exp'
                              label={<strong className='text-success'><i className='fas fa-briefcase me-1'></i> 4. Critère d'Expérience Professionnelle</strong>}
                              checked={scoring.experience?.actif}
                              onChange={(e) =>
                                setScoring((prev) => ({
                                  ...prev,
                                  experience: { ...prev.experience, actif: e.target.checked },
                                }))
                              }
                            />
                            {scoring.experience?.actif && (
                              <Badge bg='success'>Poids Max : {scoring.experience.poidsMax} pts</Badge>
                            )}
                          </Card.Header>
                          {scoring.experience?.actif && (
                            <Card.Body className='bg-light py-3'>
                              <Row className='align-items-center mb-3'>
                                <Col md={4}>
                                  <Form.Label className='small fw-bold'>Poids Max Expérience :</Form.Label>
                                  <Form.Range
                                    min='0'
                                    max='40'
                                    step='1'
                                    value={scoring.experience.poidsMax}
                                    onChange={(e) =>
                                      setScoring((prev) => ({
                                        ...prev,
                                        experience: { ...prev.experience, poidsMax: Number(e.target.value) },
                                      }))
                                    }
                                  />
                                </Col>
                                <Col md={2}>
                                  <span className='fw-bold text-success fs-5'>{scoring.experience.poidsMax} pts</span>
                                </Col>
                                <Col md={3}>
                                  <Form.Label className='small fw-bold'>Domaine Cible :</Form.Label>
                                  <Form.Control
                                    type='text'
                                    value={scoring.experience.nomSpecialite || 'Bancaire'}
                                    onChange={(e) =>
                                      setScoring((prev) => ({
                                        ...prev,
                                        experience: { ...prev.experience, nomSpecialite: e.target.value },
                                      }))
                                    }
                                  />
                                </Col>
                                <Col md={3}>
                                  <Form.Label className='small fw-bold'>Points / Mois :</Form.Label>
                                  <Form.Control
                                    type='number'
                                    step='0.1'
                                    value={scoring.experience.pointsParMoisSpecialite || 0.6}
                                    onChange={(e) =>
                                      setScoring((prev) => ({
                                        ...prev,
                                        experience: {
                                          ...prev.experience,
                                          pointsParMoisSpecialite: Number(e.target.value),
                                        },
                                      }))
                                    }
                                  />
                                </Col>
                              </Row>
                            </Card.Body>
                          )}
                        </Card>

                        {/* CRITÈRE 5 : NIVEAU DE DIPLÔME */}
                        <Card className='mb-3 border'>
                          <Card.Header className='bg-white d-flex justify-content-between align-items-center py-2'>
                            <Form.Check
                              type='switch'
                              id='switch-diplome'
                              label={<strong className='text-warning text-dark'><i className='fas fa-graduation-cap me-1'></i> 5. Critère de Niveau du Diplôme</strong>}
                              checked={scoring.diplome?.actif}
                              onChange={(e) =>
                                setScoring((prev) => ({
                                  ...prev,
                                  diplome: { ...prev.diplome, actif: e.target.checked },
                                }))
                              }
                            />
                            {scoring.diplome?.actif && (
                              <Badge bg='warning' className='text-dark'>Poids Max : {scoring.diplome.poidsMax} pts</Badge>
                            )}
                          </Card.Header>
                          {scoring.diplome?.actif && (
                            <Card.Body className='bg-light py-3'>
                              <Row className='align-items-center'>
                                <Col md={5}>
                                  <Form.Label className='small fw-bold'>Poids Maximum Diplôme :</Form.Label>
                                  <Form.Range
                                    min='0'
                                    max='30'
                                    step='1'
                                    value={scoring.diplome.poidsMax}
                                    onChange={(e) =>
                                      setScoring((prev) => ({
                                        ...prev,
                                        diplome: { ...prev.diplome, poidsMax: Number(e.target.value) },
                                      }))
                                    }
                                  />
                                </Col>
                                <Col md={2}>
                                  <span className='fw-bold text-dark fs-5'>{scoring.diplome.poidsMax} pts</span>
                                </Col>
                                <Col md={5}>
                                  <div className='small text-muted'>
                                    Bac+2: <strong>{scoring.diplome.pointsParNiveau?.bac2 || 10}p</strong> • Bac+3: <strong>{scoring.diplome.pointsParNiveau?.bac3 || 15}p</strong> • Bac+5: <strong>{scoring.diplome.pointsParNiveau?.bac5 || 20}p</strong>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          )}
                        </Card>
                      </div>
                    )}
                  </div>
                </Modal.Body>

                <Modal.Footer className='border-top bg-light'>
                  <div className='me-auto'>
                    {modalTab === 'general' ? (
                      <Button variant='outline-primary' onClick={() => setModalTab('bareme')}>
                        Configurer le Barème de Scoring <i className='fas fa-arrow-right ms-1'></i>
                      </Button>
                    ) : (
                      <Button variant='outline-secondary' onClick={() => setModalTab('general')}>
                        <i className='fas fa-arrow-left me-1'></i> Revenir aux Infos Générales
                      </Button>
                    )}
                  </div>

                  <Button variant='secondary' onClick={() => setShowModal(false)}>
                    Annuler
                  </Button>
                  <Button variant='primary' type='submit' disabled={submitting} className='fw-bold px-4'>
                    {submitting ? 'Enregistrement...' : editingOffreId ? 'Mettre à jour l’Offre' : 'Publier le Concours'}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>
          </Container>
        </main>
      </div>
    </div>
  );
};

export default AdminOffresScreen;
