import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Container, Row, Col, Button, Card, Badge, Alert } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import moment from 'moment';
import { listControllerCandidatures3 } from '../../actions/candidatureActions';
import { listUsers } from '../../actions/userActions';
import ControleurSideBar from '../../components/ControleurSideBar';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import Spinner from '../../components/Spinner';
import Message from '../../components/Message';

const ControlleursCandidatures3Screen = () => {
  moment.locale('fr');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userList = useSelector((state) => state.userList);
  const { users } = userList;

  const candidaturesListController = useSelector(
    (state) => state.candidaturesListController
  );
  const {
    candidatures: candidatures3,
    loading: loadingCandidatures3,
    error: errorCandidatures3,
  } = candidaturesListController;

  useEffect(() => {
    if (userInfo && userInfo.isController) {
      dispatch(listControllerCandidatures3());
      dispatch(listUsers());
    } else {
      navigate('/login');
    }
  }, [userInfo, dispatch, navigate]);

  const handleValidateCommission = async () => {
    if (
      !window.confirm(
        'Confirmez-vous la validation finale de la Commission EHC pour l’ensemble des dossiers présélectionnés ? Ces dossiers seront transmis officiellement au Maître d’Ouvrage (Client RH).'
      )
    )
      return;

    try {
      setValidating(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data: res } = await axios.post(
        '/api/candidatures/batch/validate-control3',
        {},
        config
      );
      setSuccessMsg(
        `Commission EHC : ${res.modifiedCount} dossiers validés avec succès ! La shortlist officielle est désormais disponible pour le Maître d'Ouvrage.`
      );
      dispatch(listControllerCandidatures3());
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation finale');
    } finally {
      setValidating(false);
    }
  };

  const { SearchBar } = Search;

  let postulations =
    candidatures3 &&
    candidatures3.map((candidature) => {
      let temp =
        users &&
        users.find(
          (user) =>
            String(user._id) ===
            String(candidature.user?._id || candidature.user)
        );
      if (temp && temp.civilite) {
        candidature.civilite = temp.civilite;
        candidature.prenom = temp.prenom;
        candidature.nom = temp.nom;
        candidature.dateNaissance = temp.dateNaissance;
        candidature.cni = temp.cni;
        candidature.email = temp.email;
        candidature.phone = temp.phone;
        candidature.adresse = temp.adresse;
        candidature.ville = temp.ville;
      }
      return candidature;
    });

  const data =
    postulations &&
    postulations.map((p, idx) => ({
      rang: idx + 1,
      id: p._id || '-',
      candidat: `${p.nom || ''} ${p.prenom || ''}`.trim() || 'Candidat',
      cni: p.cni || '-',
      poste: p.poste || p.offre?.titre || 'Concours',
      scoreTotal: Number(p.scoreTotal || 0).toFixed(2),
      statutAI: p.statutAI || 'VALIDE_IA',
      controle1: p.controle1 || 'Audit IA Conforme',
      controle2: p.controle2 || 'Auditeur EHC Validé',
      statutCommission: p.statutCommission || (p.isControl3 ? 'VALIDE_COMMISSION' : 'EN_COURS_AUDIT'),
      date: p.createdAt ? moment(p.createdAt).format('DD/MM/YYYY') : '-',
    }));

  const totalDossiers = data ? data.length : 0;
  const countValidesCommission = data
    ? data.filter((d) => d.statutCommission === 'VALIDE_COMMISSION').length
    : 0;

  const columns = [
    {
      dataField: 'rang',
      text: 'Rang #',
      sort: true,
      headerStyle: { backgroundColor: '#e2e8f0', width: '80px', textAlign: 'center' },
      formatter: (cell) => <span className='fw-bold text-dark'>#{cell}</span>,
    },
    {
      dataField: 'candidat',
      text: 'Nom & Prénom',
      sort: true,
      filter: textFilter(),
      headerStyle: { backgroundColor: '#e2e8f0' },
      formatter: (cell) => <span className='fw-bold text-primary'>{cell}</span>,
    },
    {
      dataField: 'cni',
      text: 'CIN',
      sort: true,
      filter: textFilter(),
      headerStyle: { backgroundColor: '#e2e8f0' },
    },
    {
      dataField: 'poste',
      text: 'Poste Concours',
      sort: true,
      filter: textFilter(),
      headerStyle: { backgroundColor: '#e2e8f0' },
    },
    {
      dataField: 'scoreTotal',
      text: 'Barème / 100 ⭐',
      sort: true,
      headerStyle: { backgroundColor: '#fef3c7', color: '#92400e', textAlign: 'center' },
      formatter: (cell) => (
        <span className='badge bg-warning text-dark fs-6 px-3 py-1 fw-bold'>
          {cell} pts
        </span>
      ),
    },
    {
      dataField: 'statutAI',
      text: 'Contrôle 1 (IA)',
      headerStyle: { backgroundColor: '#e2e8f0', textAlign: 'center' },
      formatter: (cell) => (
        <span className='badge bg-success px-2 py-1'>
          <i className='fas fa-robot me-1'></i> IA Conforme
        </span>
      ),
    },
    {
      dataField: 'controle2',
      text: 'Contrôle 2 (Auditeur EHC)',
      headerStyle: { backgroundColor: '#e2e8f0', textAlign: 'center' },
      formatter: (cell) => (
        <span className='badge bg-info text-dark px-2 py-1'>
          <i className='fas fa-user-check me-1'></i> Audité EHC
        </span>
      ),
    },
    {
      dataField: 'statutCommission',
      text: 'Contrôle 3 (Commission)',
      sort: true,
      headerStyle: { backgroundColor: '#dcfce7', color: '#166534', textAlign: 'center' },
      formatter: (cell) => {
        if (cell === 'VALIDE_COMMISSION') {
          return (
            <span className='badge bg-success px-3 py-2'>
              <i className='fas fa-award me-1'></i> Validé Commission
            </span>
          );
        }
        return (
          <span className='badge bg-warning text-dark px-3 py-2'>
            <i className='fas fa-hourglass-half me-1'></i> En Attente Validation
          </span>
        );
      },
    },
    {
      dataField: 'actions',
      text: 'Action',
      headerStyle: { backgroundColor: '#e2e8f0', textAlign: 'center' },
      formatter: (cell, row) => (
        <button
          className='btn btn-outline-primary btn-sm fw-bold px-2'
          onClick={() => navigate(`/controlleurs/candidatures/informations/${row.id}`)}
        >
          <i className='fas fa-eye me-1'></i> Détails
        </button>
      ),
    },
  ];

  return (
    <div id='root'>
      <div className='app'>
        <ControleurSideBar prenom={userInfo?.prenom} nom={userInfo?.nom} />
        <main>
          <HeaderAdministrateur
            headerTitle='Contrôle Niveau 3 : Commission Finale EHC (Tiers de Confiance)'
            endPoint='/admin'
          />

          <Container className='mt-4'>
            {successMsg && (
              <Alert variant='success' dismissible onClose={() => setSuccessMsg('')}>
                <i className='fas fa-check-circle me-2'></i>
                {successMsg}
              </Alert>
            )}

            {/* BANDEAU COMMISSION FINALE EHC */}
            <div
              className='bg-white rounded-3 shadow-sm p-4 mb-4 border'
              style={{ borderLeft: '5px solid #16a34a' }}
            >
              <div className='d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom'>
                <div>
                  <h4 className='fw-bold text-success mb-1 d-flex align-items-center gap-2'>
                    <i className='fas fa-award text-warning fs-3'></i>
                    <span>Commission Finale d'Audit EHC (Marchés Publics)</span>
                  </h4>
                  <p className='text-muted small mb-0'>
                    Étape ultime avant mise à disposition de la liste définitive pour le Maître d'Ouvrage (Client RH). Validation collégiale et scellement du PV de présélection.
                  </p>
                </div>
                <div className='mt-2 mt-md-0'>
                  <Button
                    variant='success'
                    size='lg'
                    className='fw-bold shadow-sm'
                    disabled={validating || totalDossiers === 0}
                    onClick={handleValidateCommission}
                  >
                    {validating ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Signature en cours...
                      </>
                    ) : (
                      <>
                        <i className='fas fa-file-signature me-2'></i>
                        Valider & Signer le PV de Présélection ({totalDossiers} Dossiers)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* STATS RAPIDES */}
              <Row className='g-3 text-center'>
                <Col xs={6} md={4}>
                  <div className='p-3 rounded-3 bg-light border'>
                    <div className='fs-3 fw-bold text-primary'>{totalDossiers}</div>
                    <div className='small text-uppercase fw-semibold'>Dossiers Présélectionnés</div>
                  </div>
                </Col>
                <Col xs={6} md={4}>
                  <div className='p-3 rounded-3 bg-light border'>
                    <div className='fs-3 fw-bold text-success'>{countValidesCommission}</div>
                    <div className='small text-uppercase fw-semibold'>Validés par la Commission</div>
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div className='p-3 rounded-3 bg-light border'>
                    <div className='fs-3 fw-bold text-warning'>100 / 100</div>
                    <div className='small text-uppercase fw-semibold'>Barème d'Excellence Standard</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* TABLEAU DES DOSSIERS EN CONTRÔLE 3 */}
            <Card className='shadow-sm mb-4 border-0'>
              <Card.Header className='bg-white py-3 border-bottom'>
                <h5 className='mb-0 fw-bold text-dark'>
                  <i className='fas fa-list-check me-2 text-primary'></i>
                  Liste d'Audit Final Commission — Classement au Mérite
                </h5>
              </Card.Header>
              <Card.Body>
                {loadingCandidatures3 ? (
                  <Spinner size={100} />
                ) : errorCandidatures3 ? (
                  <Message variant='danger'>{errorCandidatures3}</Message>
                ) : data && data.length > 0 ? (
                  <ToolkitProvider
                    keyField='id'
                    data={data}
                    columns={columns}
                    search
                  >
                    {(props) => (
                      <>
                        <div className='mb-3 d-flex justify-content-end'>
                          <div style={{ maxWidth: '320px', width: '100%' }}>
                            <SearchBar {...props.searchProps} placeholder='Rechercher un candidat...' />
                          </div>
                        </div>
                        <BootstrapTable
                          {...props.baseProps}
                          keyField='id'
                          bootstrap4
                          data={data}
                          columns={columns}
                          wrapperClasses='table-responsive text-center'
                          hover
                          pagination={paginationFactory({ sizePerPage: 15 })}
                          filter={filterFactory()}
                        />
                      </>
                    )}
                  </ToolkitProvider>
                ) : (
                  <div className='text-center py-5 text-muted'>
                    <i className='fas fa-inbox fa-3x mb-3 text-secondary'></i>
                    <p className='fw-bold'>Aucun dossier en attente du Contrôle 3.</p>
                    <p className='small'>
                      Les dossiers validés en Contrôle 2 (Auditeur EHC) apparaîtront automatiquement ici.
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Container>
        </main>
      </div>
    </div>
  );
};

export default ControlleursCandidatures3Screen;

