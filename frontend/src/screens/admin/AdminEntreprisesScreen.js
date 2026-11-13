import React, { useEffect, useState } from 'react';
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
} from 'react-bootstrap';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import Spinner from '../../components/Spinner';

const AdminEntreprisesScreen = () => {
  const navigate = useNavigate();
  const { addToast } = useToasts();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form state for creating / editing enterprise
  const [nom, setNom] = useState('');
  const [sigle, setSigle] = useState('');
  const [secteur, setSecteur] = useState('Secteur Bancaire');
  const [description, setDescription] = useState('');
  const [couleurPrimaire, setCouleurPrimaire] = useState('#003366');
  const [logo, setLogo] = useState('');
  const [siteWeb, setSiteWeb] = useState('');
  const [adresse, setAdresse] = useState('Casablanca, Maroc');
  const [enteteRecu, setEnteteRecu] = useState('Royaume du Maroc - Portail National de Recrutement');

  // RH Administrator Account Fields
  const [adminNom, setAdminNom] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [createdAccountModal, setCreatedAccountModal] = useState(null);

  const uploadLogoHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    setUploadingLogo(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      const url = data.url || `/uploads/${data.fileName}`;
      setLogo(url);
      setUploadingLogo(false);
      addToast('Logo téléversé avec succès !', { appearance: 'success' });
    } catch (error) {
      setUploadingLogo(false);
      addToast(error.response?.data?.message || 'Erreur lors du téléversement du logo', { appearance: 'error' });
    }
  };

  const fetchEntreprises = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/entreprises');
      setEntreprises(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      addToast(err.response?.data?.message || err.message, { appearance: 'error' });
    }
  };

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
    } else {
      fetchEntreprises();
    }
  }, [userInfo, navigate]);

  const handleCreateEntreprise = async (e) => {
    e.preventDefault();
    if (!nom || !sigle) {
      addToast('Le nom et le sigle sont obligatoires', { appearance: 'warning' });
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

      if (editingId) {
        await axios.put(
          `/api/entreprises/${editingId}`,
          {
            nom,
            sigle,
            secteur,
            description,
            couleurPrimaire,
            logo: logo || '/images/logos/default_org.png',
            siteWeb,
            adresse,
            enteteRecu,
          },
          config
        );

        setSubmitting(false);
        setShowModal(false);
        addToast(`Organisation ${nom} mise à jour avec succès`, { appearance: 'success' });
      } else {
        const { data } = await axios.post(
          '/api/entreprises',
          {
            nom,
            sigle,
            secteur,
            description,
            couleurPrimaire,
            logo: logo || '/images/logos/default_org.png',
            siteWeb,
            adresse,
            enteteRecu,
            adminNom,
            adminEmail,
            adminPassword,
          },
          config
        );

        setSubmitting(false);
        setShowModal(false);
        addToast(`Organisation ${nom} créée avec succès`, { appearance: 'success' });

        if (data.createdAccount) {
          setCreatedAccountModal({
            orgNom: nom,
            email: data.createdAccount.email,
            password: adminPassword,
            role: data.createdAccount.role,
          });
        }
      }

      // Reset form
      setEditingId(null);
      setNom('');
      setSigle('');
      setDescription('');
      setLogo('');
      setSiteWeb('');
      setAdminNom('');
      setAdminEmail('');
      setAdminPassword('');
      fetchEntreprises();
    } catch (err) {
      setSubmitting(false);
      addToast(err.response?.data?.message || err.message, { appearance: 'error' });
    }
  };

  return (
    <div className='app'>
      <AdminSideBar prenom={userInfo?.prenom} nom={userInfo?.nom} />
      <main>
        <HeaderAdministrateur
          headerTitle='Gestion des Entreprises & Institutions'
          endPoint='/admin/entreprises'
        />

        <Container fluid className='p-4'>
          {/* TOP BAR WITH TITLE & CREATE BUTTON */}
          <div className='d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3'>
            <div>
              <h3 className='fw-bold mb-1 text-dark'>
                <i className='fas fa-building text-primary me-2'></i>
                Entreprises & Institutions Partenaires
              </h3>
              <p className='text-muted small mb-0'>
                Configuration multi-tenant B2B des banques et organismes publics (Branding, Logos, Barèmes).
              </p>
            </div>

            <Button
              variant='primary'
              className='fw-bold px-3 py-2 shadow-sm'
              style={{ borderRadius: '8px', background: '#1D4ED8', border: 'none' }}
              onClick={() => {
                setEditingId(null);
                setNom('');
                setSigle('');
                setSecteur('Secteur Bancaire');
                setDescription('');
                setCouleurPrimaire('#003366');
                setLogo('');
                setSiteWeb('');
                setAdresse('Casablanca, Maroc');
                setEnteteRecu('Royaume du Maroc - Portail National de Recrutement');
                setAdminNom('');
                setAdminEmail('');
                setAdminPassword('');
                setShowModal(true);
              }}
            >
              <i className='fas fa-plus-circle me-2'></i>
              Ajouter une Entreprise / Banque
            </Button>
          </div>

          {/* STATS SUMMARY ROW */}
          <Row className='mb-4 g-3'>
            <Col md={3}>
              <Card className='border-0 shadow-sm rounded-3 p-3'>
                <div className='d-flex align-items-center justify-content-between'>
                  <div>
                    <span className='text-muted small fw-bold text-uppercase'>Institutions Actives</span>
                    <h3 className='fw-bold mb-0 text-dark'>{entreprises.length}</h3>
                  </div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    <i className='fas fa-university'></i>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={3}>
              <Card className='border-0 shadow-sm rounded-3 p-3'>
                <div className='d-flex align-items-center justify-content-between'>
                  <div>
                    <span className='text-muted small fw-bold text-uppercase'>Secteur Bancaire</span>
                    <h3 className='fw-bold mb-0 text-primary'>
                      {entreprises.filter((e) => e.secteur === 'Secteur Bancaire').length}
                    </h3>
                  </div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#F0FDF4',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    <i className='fas fa-coins'></i>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={3}>
              <Card className='border-0 shadow-sm rounded-3 p-3'>
                <div className='d-flex align-items-center justify-content-between'>
                  <div>
                    <span className='text-muted small fw-bold text-uppercase'>Établissements Publics</span>
                    <h3 className='fw-bold mb-0 text-success'>
                      {entreprises.filter((e) => e.secteur !== 'Secteur Bancaire').length}
                    </h3>
                  </div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#FEF3C7',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    <i className='fas fa-landmark'></i>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={3}>
              <Card className='border-0 shadow-sm rounded-3 p-3'>
                <div className='d-flex align-items-center justify-content-between'>
                  <div>
                    <span className='text-muted small fw-bold text-uppercase'>Statut Multi-Tenant</span>
                    <h3 className='fw-bold mb-0 text-info'>100% Opérationnel</h3>
                  </div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#E0F2FE',
                      color: '#0284C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    <i className='fas fa-shield-alt'></i>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* TABLE OF ENTERPRISES */}
          <Card className='border-0 shadow-sm rounded-3 overflow-hidden'>
            <Card.Header className='bg-white py-3 border-0'>
              <div className='d-flex justify-content-between align-items-center'>
                <span className='fw-bold text-dark'>Liste des Entreprises & Organismes Enregistrés</span>
                <span className='badge bg-light text-muted border'>{entreprises.length} organisations</span>
              </div>
            </Card.Header>

            {loading ? (
              <div className='text-center py-5'>
                <Spinner size={60} />
              </div>
            ) : (
              <Table responsive hover className='align-middle mb-0'>
                <thead className='bg-light text-uppercase small text-muted'>
                  <tr>
                    <th>Sigle & Nom</th>
                    <th>Secteur d'Activité</th>
                    <th>Couleur Branding</th>
                    <th>Adresse & Siège</th>
                    <th>Entête Récépissé</th>
                    <th>Statut</th>
                    <th className='text-end'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entreprises.map((ent) => {
                    const orgLogoUrl =
                      ent.logo && !ent.logo.includes('default_org')
                        ? ent.logo
                        : ent.sigle === 'ABB' || ent.nom?.toLowerCase().includes('barid')
                        ? '/assets/images/logoABB.png'
                        : ent.sigle === 'CIH'
                        ? '/images/logos/cih_logo.svg'
                        : ent.sigle === 'OCP'
                        ? '/images/logos/ocp_logo.svg'
                        : ent.sigle === 'BOA'
                        ? '/images/logos/boa_logo.svg'
                        : ent.sigle === 'MEF'
                        ? '/images/logos/mef_logo.svg'
                        : ent.sigle === 'CDG'
                        ? '/images/logos/cdg_logo.svg'
                        : ent.sigle === 'LRT' || ent.nom?.toLowerCase().includes('recruteur')
                        ? '/images/logos/lrt_logo.svg'
                        : ent.logo || '/images/logos/default_org.png';

                    return (
                      <tr key={ent._id}>
                        <td>
                          <div className='d-flex align-items-center gap-3'>
                            <div
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '10px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                              }}
                            >
                              <img
                                src={orgLogoUrl}
                                alt={ent.sigle}
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                              />
                            </div>
                            <div>
                              <div className='fw-bold text-dark'>{ent.nom}</div>
                              <small className='text-muted'>{ent.siteWeb || 'Portail officiel'}</small>
                            </div>
                          </div>
                        </td>
                      <td>
                        <Badge
                          bg={
                            ent.secteur === 'Secteur Bancaire'
                              ? 'primary'
                              : ent.secteur === 'Industrie & Mines'
                              ? 'success'
                              : 'secondary'
                          }
                          className='py-1 px-2'
                        >
                          {ent.secteur}
                        </Badge>
                      </td>
                      <td>
                        <div className='d-flex align-items-center gap-2'>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              backgroundColor: ent.couleurPrimaire,
                              border: '1px solid #CBD5E1',
                            }}
                          ></span>
                          <code className='small'>{ent.couleurPrimaire}</code>
                        </div>
                      </td>
                      <td>
                        <small className='text-secondary'>{ent.adresse || 'Casablanca'}</small>
                      </td>
                      <td>
                        <small className='text-muted text-truncate d-inline-block' style={{ maxWidth: '200px' }}>
                          {ent.enteteRecu}
                        </small>
                      </td>
                      <td>
                        <span className='badge bg-success py-1 px-2'>
                          <i className='fas fa-check-circle me-1'></i> Actif
                        </span>
                      </td>
                      <td className='text-end text-nowrap'>
                        <Button
                          variant='outline-secondary'
                          size='sm'
                          className='me-1'
                          onClick={() => {
                            setEditingId(ent._id);
                            setNom(ent.nom || '');
                            setSigle(ent.sigle || '');
                            setSecteur(ent.secteur || 'Secteur Bancaire');
                            setCouleurPrimaire(ent.couleurPrimaire || '#003366');
                            setLogo(ent.logo || '');
                            setSiteWeb(ent.siteWeb || '');
                            setAdresse(ent.adresse || 'Casablanca, Maroc');
                            setDescription(ent.description || '');
                            setEnteteRecu(ent.enteteRecu || 'Royaume du Maroc - Portail National de Recrutement');
                            setShowModal(true);
                          }}
                          title='Modifier les informations et le Logo'
                        >
                          <i className='fas fa-edit me-1'></i> Modifier & Logo
                        </Button>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          className='me-1'
                          onClick={() => navigate('/admin/offres')}
                          title='Gérer les concours et barèmes'
                        >
                          <i className='fas fa-sliders-h me-1'></i> Offres & Barèmes
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </Table>
            )}
          </Card>
        </Container>

        {/* MODAL CRÉATION / MODIFICATION ENTREPRISE */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size='lg' centered>
          <Form onSubmit={handleCreateEntreprise}>
            <Modal.Header closeButton className='bg-light'>
              <Modal.Title className='fs-5 fw-bold'>
                <i className='fas fa-building text-primary me-2'></i>
                {editingId ? `Modifier l'Organisation : ${nom}` : 'Créer une Nouvelle Entreprise / Institution'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-4'>
              <Row className='g-3 mb-3'>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className='fw-bold small text-muted'>
                      Raison Sociale / Nom de l'Organisation *
                    </Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Ex: Crédit Agricole du Maroc, Al Omrane...'
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className='fw-bold small text-muted'>Sigle Officiel *</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Ex: CAM, CDG'
                      value={sigle}
                      onChange={(e) => setSigle(e.target.value.toUpperCase())}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* LOGO UPLOAD & LIVE PREVIEW BOX */}
              <Form.Group className='mb-3 p-3 bg-light rounded-3 border'>
                <Form.Label className='fw-bold small text-dark d-flex align-items-center justify-content-between mb-2'>
                  <span>
                    <i className='fas fa-image text-primary me-2'></i>
                    Logo Officiel de l'Organisation / Entreprise
                  </span>
                  {uploadingLogo && (
                    <span className='text-primary small'>
                      <i className='fas fa-spinner fa-spin me-1'></i> Téléversement en cours...
                    </span>
                  )}
                </Form.Label>
                <div className='d-flex gap-3 align-items-center'>
                  <div
                    className='border rounded p-1 bg-white d-flex align-items-center justify-content-center shadow-sm'
                    style={{ width: '70px', height: '70px', overflow: 'hidden', flexShrink: 0 }}
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt='Aperçu'
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.src = '/images/logos/default_org.png';
                        }}
                      />
                    ) : (
                      <i className='fas fa-building fa-2x text-muted opacity-50'></i>
                    )}
                  </div>
                  <div className='flex-grow-1'>
                    <div className='d-flex gap-2 align-items-center'>
                      <Form.Control
                        type='file'
                        accept='image/*'
                        onChange={uploadLogoHandler}
                        disabled={uploadingLogo}
                        className='form-control-sm'
                      />
                      {logo && (
                        <Button
                          variant='outline-danger'
                          size='sm'
                          onClick={() => setLogo('')}
                          title='Effacer le logo'
                        >
                          <i className='fas fa-times'></i>
                        </Button>
                      )}
                    </div>
                    <Form.Text className='text-muted d-block mt-1' style={{ fontSize: '11px' }}>
                      Sélectionnez un fichier PNG, JPG ou SVG depuis votre ordinateur. L'image sera téléversée automatiquement.
                    </Form.Text>
                  </div>
                </div>
              </Form.Group>

              <Row className='g-3 mb-3'>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className='fw-bold small text-muted'>Secteur d'Activité</Form.Label>
                    <Form.Select value={secteur} onChange={(e) => setSecteur(e.target.value)}>
                      <option value='Secteur Bancaire'>Secteur Bancaire</option>
                      <option value='Concours Public / Ministère'>Concours Public / Ministère</option>
                      <option value='Industrie & Mines'>Industrie & Mines</option>
                      <option value='Assurance & Finance'>Assurance & Finance</option>
                      <option value='Autre'>Autre Établissement Public</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className='fw-bold small text-muted'>Couleur Primaire (Branding)</Form.Label>
                    <div className='d-flex gap-2 align-items-center'>
                      <Form.Control
                        type='color'
                        value={couleurPrimaire}
                        onChange={(e) => setCouleurPrimaire(e.target.value)}
                        style={{ width: '45px', height: '38px', padding: '2px' }}
                      />
                      <Form.Control
                        type='text'
                        value={couleurPrimaire}
                        onChange={(e) => setCouleurPrimaire(e.target.value)}
                        placeholder='#003366'
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className='g-3 mb-3'>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className='fw-bold small text-muted'>Site Web Officiel</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='https://www.exemple.ma'
                      value={siteWeb}
                      onChange={(e) => setSiteWeb(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className='fw-bold small text-muted'>Adresse / Siège Social</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Ex: Casablanca, Rabat'
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className='mb-3'>
                <Form.Label className='fw-bold small text-muted'>Description de l'Activité</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  placeholder='Présentation succincte de l’institution pour les candidats...'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label className='fw-bold small text-muted'>
                  Entête Légal pour Récépissé Officiel A4
                </Form.Label>
                <Form.Control
                  type='text'
                  value={enteteRecu}
                  onChange={(e) => setEnteteRecu(e.target.value)}
                />
              </Form.Group>

              {/* SECTION COMPTE RH RECRUTEUR (Visible seulement lors de la création initiale) */}
              {!editingId && (
                <div className='p-3 bg-light rounded-3 border mt-3'>
                  <h6 className='fw-bold text-dark mb-1'>
                    <i className='fas fa-user-shield text-success me-2'></i>
                    Compte Administrateur RH de cette Entreprise (Accès Recruteur)
                  </h6>
                  <p className='text-muted small mb-3'>
                    Renseignez ces identifiants pour permettre à l'équipe RH de cette entreprise de se connecter à la plateforme pour publier ses concours et gérer ses candidats.
                  </p>

                  <Row className='g-3'>
                    <Col md={12}>
                      <Form.Label className='fw-bold small text-muted'>Nom du Responsable RH</Form.Label>
                      <Form.Control
                        type='text'
                        placeholder='Ex: Direction du Recrutement'
                        value={adminNom}
                        onChange={(e) => setAdminNom(e.target.value)}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className='fw-bold small text-muted'>Email Professionnel de Connexion (Login) *</Form.Label>
                      <Form.Control
                        type='email'
                        placeholder='Ex: rh@banque.ma'
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className='fw-bold small text-muted'>Mot de Passe Initial *</Form.Label>
                      <Form.Control
                        type='password'
                        placeholder='Mot de passe de connexion'
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className='bg-light'>
              <Button variant='secondary' onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant='primary' type='submit' disabled={submitting}>
                {submitting
                  ? 'Enregistrement en cours...'
                  : editingId
                  ? 'Enregistrer les Modifications'
                  : "Enregistrer l'Organisation & Générer l'Accès RH"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* MODAL SUCCÈS IDENTIFIANTS COMPTE RH GÉNÉRÉ */}
        {createdAccountModal && (
          <Modal
            show={true}
            onHide={() => setCreatedAccountModal(null)}
            centered
            backdrop='static'
          >
            <Modal.Header className='bg-success text-white'>
              <Modal.Title className='fs-5 fw-bold'>
                <i className='fas fa-check-circle me-2'></i>
                Compte Entreprise & Accès RH Créés !
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-4'>
              <p className='text-muted small mb-3'>
                L'organisation <strong>{createdAccountModal.orgNom}</strong> a été enregistrée avec succès. Voici les identifiants d'accès direct pour l'équipe RH :
              </p>

              <div className='p-3 bg-light rounded-3 border mb-3'>
                <div className='mb-2'>
                  <span className='text-muted small d-block'>Email de Connexion :</span>
                  <strong className='text-dark font-monospace fs-6'>{createdAccountModal.email}</strong>
                </div>
                <div className='mb-2'>
                  <span className='text-muted small d-block'>Mot de Passe Initial :</span>
                  <strong className='text-primary font-monospace fs-6'>{createdAccountModal.password}</strong>
                </div>
                <div>
                  <span className='text-muted small d-block'>Rôle Attribué :</span>
                  <span className='badge bg-primary'>{createdAccountModal.role}</span>
                </div>
              </div>

              <div className='alert alert-info py-2 px-3 small mb-0'>
                <i className='fas fa-info-circle me-1'></i>
                Vous pouvez également publier des offres pour cette entreprise directement depuis votre compte Administrateur actuel.
              </div>
            </Modal.Body>
            <Modal.Footer className='bg-light d-flex justify-content-between'>
              <Button
                variant='outline-secondary'
                onClick={() => setCreatedAccountModal(null)}
              >
                Fermer
              </Button>
              <Button
                variant='primary'
                style={{ background: '#1D4ED8', border: 'none' }}
                onClick={() => {
                  setCreatedAccountModal(null);
                  navigate('/admin/offres');
                }}
              >
                <i className='fas fa-bullhorn me-1'></i>
                Publier une Offre Maintenant
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </main>
    </div>
  );
};

export default AdminEntreprisesScreen;
