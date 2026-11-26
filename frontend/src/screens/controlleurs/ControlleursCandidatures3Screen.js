import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Container, Row, Col, Button, Card, Badge, Alert } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import moment from 'moment';
import { listControllerCandidatures3 } from '../../actions/candidatureActions';
import { listUsers } from '../../actions/userActions';
import ControleurSideBar from '../../components/ControleurSideBar';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import Spinner from '../../components/Spinner';
import Message from '../../components/Message';
import ControleurDrawer from '../../components/ControleurDrawer';
import PvCommissionModal from '../../components/PvCommissionModal';

const ControlleursCandidatures3Screen = () => {
  moment.locale('fr');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPvModal, setShowPvModal] = useState(false);

  // État du Drawer d'examen latéral
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
        `Commission EHC : ${res.modifiedCount || 'Tous les'} dossiers validés avec succès ! La shortlist officielle est désormais scellée pour le Client RH.`
      );
      dispatch(listControllerCandidatures3());
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation finale');
    } finally {
      setValidating(false);
    }
  };

  const { SearchBar } = Search;
  const { ExportCSVButton } = CSVExport;

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

  const rawCandidatures = postulations || [];

  const handleOpenDrawer = (candidateObj, index) => {
    setSelectedCandidate(candidateObj);
    setSelectedIndex(index);
    setShowDrawer(true);
  };

  const handleNextCandidate = () => {
    if (selectedIndex < rawCandidatures.length - 1) {
      const nextIndex = selectedIndex + 1;
      setSelectedIndex(nextIndex);
      setSelectedCandidate(rawCandidatures[nextIndex]);
    }
  };

  const handlePrevCandidate = () => {
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setSelectedCandidate(rawCandidatures[prevIndex]);
    }
  };

  const totalDossiers = rawCandidatures.length;
  const countValidesCommission = rawCandidatures.filter(
    (d) => d.statutCommission === 'VALIDE_COMMISSION' || d.isControl3
  ).length;
  const countRejetes = rawCandidatures.filter(
    (d) => d.conforme === 'NON CONFORME' || d.statutCommission === 'REJETE_COMMISSION'
  ).length;
  const countEnAttente = totalDossiers - countValidesCommission - countRejetes;

  // 8 COLONNES ÉPURÉES POUR CONTRÔLE 3
  const columns = [
    {
      dataField: 'rang',
      text: 'Rang',
      sort: true,
      headerStyle: { backgroundColor: '#F8FAFC', width: '70px', textAlign: 'center', fontWeight: '800' },
      style: { verticalAlign: 'middle', textAlign: 'center' },
      formatter: (cell, row, rowIndex) => (
        <span className='fw-bold text-dark font-monospace'>#{rowIndex + 1}</span>
      ),
    },
    {
      dataField: '_id',
      text: 'Réf / Dossier',
      sort: true,
      headerStyle: { backgroundColor: '#F8FAFC', width: '130px', fontWeight: '800' },
      style: { verticalAlign: 'middle' },
      formatter: (cell, row) => (
        <div style={{ lineHeight: 1.2 }}>
          <span className='font-monospace text-muted fw-bold' style={{ fontSize: '12px' }}>
            {row.numeroDossier || (cell ? cell.substring(0, 10) + '...' : '-')}
          </span>
          <div className='text-muted' style={{ fontSize: '11px' }}>
            {row.createdAt ? moment(row.createdAt).format('DD/MM/YYYY') : '-'}
          </div>
        </div>
      ),
    },
    {
      dataField: 'nom',
      text: 'Candidat (Nom & CNI)',
      sort: true,
      headerStyle: { backgroundColor: '#F8FAFC', width: '220px', fontWeight: '800' },
      style: { verticalAlign: 'middle' },
      formatter: (cell, row) => {
        const nomComplet = `${row.nom || ''} ${row.prenom || ''}`.trim() || 'Candidat';
        const cniVal = row.cni || row.user?.cni || '-';
        return (
          <div style={{ lineHeight: 1.3 }}>
            <span className='fw-bold text-dark' style={{ fontSize: '13.5px' }}>
              {nomComplet}
            </span>
            <div className='d-flex align-items-center gap-2 mt-1'>
              <span className='badge bg-light text-dark border font-monospace' style={{ fontSize: '11px' }}>
                {cniVal}
              </span>
              {row.dateNaissance && (
                <span className='text-muted' style={{ fontSize: '11px' }}>
                  {moment(row.dateNaissance).format('DD.MM.YYYY')}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      dataField: 'poste',
      text: 'Poste Concours',
      sort: true,
      headerStyle: { backgroundColor: '#F8FAFC', width: '160px', fontWeight: '800' },
      style: { verticalAlign: 'middle' },
      formatter: (cell, row) => (
        <span className='badge bg-light text-secondary border fw-semibold px-2 py-1' style={{ fontSize: '11.5px' }}>
          {cell || row.offre?.titre || 'Concours'}
        </span>
      ),
    },
    {
      dataField: 'scoreTotal',
      text: 'Score ⭐',
      sort: true,
      headerStyle: { backgroundColor: '#F8FAFC', width: '100px', textAlign: 'center', fontWeight: '800' },
      style: { verticalAlign: 'middle', textAlign: 'center' },
      formatter: (cell) => (
        <span
          className='badge px-2.5 py-1.5 fw-bold font-monospace shadow-sm'
          style={{
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            border: '1px solid #FCD34D',
            fontSize: '12px',
          }}
        >
          {Number(cell || 0).toFixed(2)} pts
        </span>
      ),
    },
    {
      dataField: 'statutAI',
      text: 'Audit IA (Niv. 1)',
      sort: true,
      headerStyle: { backgroundColor: '#F8FAFC', width: '130px', textAlign: 'center', fontWeight: '800' },
      style: { verticalAlign: 'middle', textAlign: 'center' },
      formatter: (cell) => {
        if (cell === 'VALIDE_IA') {
          return <span className='badge bg-success text-white px-2 py-1' style={{ fontSize: '11px' }}><i className='fas fa-check-circle me-1'></i> Conforme IA</span>;
        }
        if (cell === 'ANOMALIE_IA') {
          return <span className='badge bg-warning text-dark px-2 py-1' style={{ fontSize: '11px' }}><i className='fas fa-exclamation-triangle me-1'></i> Anomalie</span>;
        }
        if (cell === 'REJETE_IA') {
          return <span className='badge bg-danger text-white px-2 py-1' style={{ fontSize: '11px' }}><i className='fas fa-times-circle me-1'></i> Rejeté IA</span>;
        }
        return <span className='badge bg-secondary text-white px-2 py-1' style={{ fontSize: '11px' }}>En attente</span>;
      },
    },
    {
      dataField: 'statutCommission',
      text: 'Décision Commission',
      sort: true,
      headerStyle: { backgroundColor: '#F8FAFC', width: '160px', textAlign: 'center', fontWeight: '800' },
      style: { verticalAlign: 'middle', textAlign: 'center' },
      formatter: (cell, row) => {
        if (cell === 'VALIDE_COMMISSION' || row.isControl3) {
          return (
            <span className='badge bg-success bg-opacity-25 text-success border border-success px-2.5 py-1 fw-bold' style={{ fontSize: '11.5px' }}>
              <i className='fas fa-award me-1'></i> Retenu Shortlist
            </span>
          );
        }
        if (row.conforme === 'NON CONFORME' || cell === 'REJETE_COMMISSION') {
          return (
            <span className='badge bg-danger bg-opacity-25 text-danger border border-danger px-2.5 py-1 fw-bold' style={{ fontSize: '11.5px' }}>
              <i className='fas fa-times-circle me-1'></i> Rejeté ({row.motif || 'Non éligible'})
            </span>
          );
        }
        return (
          <span className='badge bg-warning bg-opacity-25 text-dark border border-warning px-2.5 py-1 fw-bold' style={{ fontSize: '11.5px' }}>
            <i className='fas fa-clock me-1'></i> En Délibération
          </span>
        );
      },
    },
    {
      dataField: 'actions',
      text: 'Examen',
      isDummyField: true,
      headerStyle: { backgroundColor: '#F8FAFC', width: '130px', textAlign: 'center', fontWeight: '800' },
      style: { verticalAlign: 'middle', textAlign: 'center' },
      formatter: (cell, row, rowIndex) => (
        <Button
          variant='primary'
          size='sm'
          className='fw-bold px-3 py-1 shadow-sm'
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDrawer(row, rowIndex);
          }}
        >
          <i className='fas fa-gavel me-1'></i> Arbitrer
        </Button>
      ),
    },
  ];

  const defaultSorted = [
    {
      dataField: 'scoreTotal',
      order: 'desc',
    },
  ];

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      handleOpenDrawer(row, rowIndex);
    },
  };

  return (
    <div className='app'>
      <ControleurSideBar prenom={userInfo?.prenom} nom={userInfo?.nom} />
      <main style={{ backgroundColor: '#F4F7FC', minHeight: '100vh', width: '100%' }}>
        <HeaderAdministrateur
          headerTitle="Contrôle Niveau 3 : Commission Mixte d'Arbitrage & Shortlist Finale"
          endPoint='/admin'
        />

        <Container fluid className='px-4 mt-4'>
          {successMsg && (
            <Alert variant='success' dismissible onClose={() => setSuccessMsg('')} className='shadow-sm'>
              <i className='fas fa-check-circle me-2'></i>
              {successMsg}
            </Alert>
          )}

          {/* BANDEAU PILOTAGE COMMISSION : LOGICAT STYLE */}
          <div
            className='p-4 mb-4 text-white position-relative overflow-hidden'
            style={{
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #0A1128 0%, #101E3D 50%, #0052FF 100%)',
              boxShadow: '0 10px 25px rgba(0, 82, 255, 0.2)',
            }}
          >
            <div className='d-flex flex-wrap justify-content-between align-items-center gap-3 position-relative' style={{ zIndex: 2 }}>
              <div>
                <div className='d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2' style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                  <i className='fas fa-award text-warning'></i>
                  <span className='text-uppercase fw-bold' style={{ fontSize: '11px', letterSpacing: '0.05em' }}>Palier 3 : Décision Collégiale & PV</span>
                </div>
                <h3 className='fw-bolder mb-1' style={{ letterSpacing: '-0.02em' }}>
                  Commission Finale d'Arbitrage EHC (Tiers de Confiance)
                </h3>
                <p className='text-white-50 mb-0' style={{ fontSize: '13.5px', maxWidth: '750px' }}>
                  Validation collégiale finale, classement au mérite et scellement du Procès-Verbal officiel de sélection avant transmission au Client RH.
                </p>
              </div>

              {/* ACTIONS STRATÉGIQUES COMMISSION */}
              <div className='d-flex flex-wrap align-items-center gap-2'>
                <Button
                  variant='light'
                  className='fw-bold px-3 py-2 text-dark shadow-sm'
                  onClick={() => setShowPvModal(true)}
                  disabled={totalDossiers === 0}
                >
                  <i className='fas fa-file-contract text-primary me-2'></i>
                  Générer PV de Commission (PDF)
                </Button>

                <Button
                  variant='success'
                  className='fw-bold px-4 py-2 shadow'
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                  }}
                  disabled={validating || totalDossiers === 0}
                  onClick={handleValidateCommission}
                >
                  {validating ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2'></span>
                      Scellement en cours...
                    </>
                  ) : (
                    <>
                      <i className='fas fa-check-double me-2'></i>
                      Valider Shortlist Définitive ({countValidesCommission}/{totalDossiers})
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* KPI STATS CARDS */}
            <Row className='g-3 mt-3 position-relative' style={{ zIndex: 2 }}>
              <Col xs={6} md={3}>
                <div
                  className='p-3 rounded-3 text-center'
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <div className='fs-3 fw-bold text-white'>{totalDossiers}</div>
                  <small className='text-white-50 text-uppercase fw-bold' style={{ fontSize: '10.5px' }}>
                    Dossiers Présélectionnés
                  </small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div
                  className='p-3 rounded-3 text-center'
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <div className='fs-3 fw-bold' style={{ color: '#34D399' }}>{countValidesCommission}</div>
                  <small className='text-white-50 text-uppercase fw-bold' style={{ fontSize: '10.5px' }}>
                    Validés Shortlist Finale
                  </small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div
                  className='p-3 rounded-3 text-center'
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <div className='fs-3 fw-bold' style={{ color: '#FBBF24' }}>{countEnAttente}</div>
                  <small className='text-white-50 text-uppercase fw-bold' style={{ fontSize: '10.5px' }}>
                    En Cours d'Arbitrage
                  </small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div
                  className='p-3 rounded-3 text-center'
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <div className='fs-3 fw-bold' style={{ color: '#F87171' }}>{countRejetes}</div>
                  <small className='text-white-50 text-uppercase fw-bold' style={{ fontSize: '10.5px' }}>
                    Écartés / Rejetés
                  </small>
                </div>
              </Col>
            </Row>
          </div>

          {/* TABLEAU MODERNE ÉPURÉ */}
          <Card className='shadow-sm mb-4 border-0' style={{ borderRadius: '14px', overflow: 'hidden' }}>
            <Card.Body className='p-4'>
              {loadingCandidatures3 ? (
                <div className='text-center py-5'>
                  <Spinner size={60} />
                  <p className='mt-3 text-muted fw-semibold'>Chargement des dossiers de la Commission...</p>
                </div>
              ) : errorCandidatures3 ? (
                <Message variant='danger'>{errorCandidatures3}</Message>
              ) : rawCandidatures.length > 0 ? (
                <ToolkitProvider
                  keyField='_id'
                  data={rawCandidatures}
                  columns={columns}
                  search
                  exportCSV={{
                    fileName: `shortlist_commission_${moment().format('YYYY-MM-DD')}.csv`,
                  }}
                >
                  {(props) => (
                    <>
                      <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom'>
                        <div className='d-flex align-items-center gap-2'>
                          <i className='fas fa-list-check text-primary fs-5'></i>
                          <h6 className='mb-0 fw-bold text-dark' style={{ letterSpacing: '-0.01em' }}>
                            Classement Général de la Commission ({rawCandidatures.length})
                          </h6>
                          <small className='text-muted ms-2'>(Cliquez sur une ligne pour examiner)</small>
                        </div>
                        <div className='d-flex align-items-center gap-2'>
                          <div style={{ width: '280px' }}>
                            <SearchBar
                              {...props.searchProps}
                              placeholder='Rechercher un candidat...'
                              className='form-control-sm'
                            />
                          </div>
                          <ExportCSVButton
                            {...props.csvProps}
                            className='btn btn-outline-secondary btn-sm fw-bold px-3 d-flex align-items-center gap-1.5'
                          >
                            <i className='fas fa-file-csv'></i> Exporter CSV
                          </ExportCSVButton>
                        </div>
                      </div>

                      <BootstrapTable
                        {...props.baseProps}
                        keyField='_id'
                        bootstrap4
                        data={rawCandidatures}
                        columns={columns}
                        defaultSorted={defaultSorted}
                        rowEvents={rowEvents}
                        wrapperClasses='table-responsive'
                        classes='table table-hover align-middle mb-0'
                        pagination={paginationFactory({
                          sizePerPage: 15,
                          showTotal: true,
                          paginationTotalRenderer: (from, to, size) => (
                            <span className='text-muted small ms-2'>
                              Affichage de <b>{from}</b> à <b>{to}</b> sur <b>{size}</b> dossiers
                            </span>
                          ),
                        })}
                      />
                    </>
                  )}
                </ToolkitProvider>
              ) : (
                <div className='text-center py-5 text-muted'>
                  <i className='fas fa-inbox fa-3x mb-3 text-secondary'></i>
                  <h6 className='fw-bold'>Aucun dossier en attente de la Commission Finale (Contrôle 3)</h6>
                  <p className='small text-muted'>
                    Les dossiers validés par l'Auditeur Humain (Contrôle 2) apparaîtront automatiquement ici.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>

        {/* DRAWER D'EXAMEN LATÉRAL SPLIT-SCREEN (NIVEAU 3) */}
        {selectedCandidate && (
          <ControleurDrawer
            show={showDrawer}
            onClose={() => setShowDrawer(false)}
            candidature={selectedCandidate}
            controlLevel={3}
            userInfo={userInfo}
            onPrev={handlePrevCandidate}
            onNext={handleNextCandidate}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < rawCandidatures.length - 1}
            currentIndex={selectedIndex}
            totalCount={rawCandidatures.length}
          />
        )}

        {/* MODAL DU PROCÈS-VERBAL OFFICIEL DE COMMISSION */}
        <PvCommissionModal
          show={showPvModal}
          onHide={() => setShowPvModal(false)}
          candidatures={rawCandidatures}
          userInfo={userInfo}
        />
      </main>
    </div>
  );
};

export default ControlleursCandidatures3Screen;
