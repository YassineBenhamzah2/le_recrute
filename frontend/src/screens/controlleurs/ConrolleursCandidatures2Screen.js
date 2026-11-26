import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { listControllerCandidatures2 } from '../../actions/candidatureActions';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import { Col, Container, Row, Button, Badge } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import moment from 'moment';
import { useToasts } from 'react-toast-notifications';
import Message from '../../components/Message';
import Spinner from '../../components/Spinner';
import { CANDIDATURE_UPDATE_RESET } from '../../constants/candidatureConstants';
import { listUsers } from '../../actions/userActions';
import ControleurSideBar from '../../components/ControleurSideBar';
import ControleurDrawer from '../../components/ControleurDrawer';

const ControlleursCandidatures2Screen = () => {
  moment.locale('fr');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [validatingControl2Loading, setValidatingControl2Loading] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL');

  // État du Drawer d'examen latéral
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { addToast } = useToasts();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userList = useSelector((state) => state.userList);
  const { users } = userList;

  const candidaturesListController = useSelector(
    (state) => state.candidaturesListController
  );
  const {
    candidatures: candidatures2,
    loading: loadingCandidatures2,
    error: errorCandidatures2,
  } = candidaturesListController;

  useEffect(() => {
    if (userInfo && userInfo.isController) {
      dispatch(listControllerCandidatures2());
      dispatch(listUsers());
      dispatch({ type: CANDIDATURE_UPDATE_RESET });
    } else {
      navigate('/login');
    }
  }, [userInfo, dispatch, navigate]);

  const handleValidateConformesToControl3 = async () => {
    try {
      setValidatingControl2Loading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(
        '/api/candidatures/batch/validate-control2',
        { onlyConformes: true },
        config
      );
      addToast(
        'Transmission réussie : les dossiers conformes ont été envoyés vers Contrôle 3 (Commission EHC) !',
        { appearance: 'success', autoDismiss: true }
      );
      dispatch(listControllerCandidatures2());
    } catch (err) {
      addToast(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Erreur lors de la transmission vers Contrôle 3',
        { appearance: 'error', autoDismiss: true }
      );
    } finally {
      setValidatingControl2Loading(false);
    }
  };

  const { SearchBar } = Search;
  const { ExportCSVButton } = CSVExport;

  let postulations =
    candidatures2 &&
    candidatures2.map((candidature) => {
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
        candidature.mleBr = temp.mleBr;
        candidature.mleC = temp.mleC;
        candidature.dateNaissance = temp.dateNaissance;
        candidature.lieuNaissance = temp.lieuNaissance;
        candidature.email = temp.email;
        candidature.cni = temp.cni;
        candidature.dateObtentionBac = temp.dateObtentionBac;
        candidature.nationalite = temp.nationalite;
        candidature.phone = temp.phone;
        candidature.adresse = temp.adresse;
        candidature.ville = temp.ville;
        candidature.codePostale = temp.codePostale;
        candidature.scoreAge = temp.scoreAge;
        candidature.copieCNI = temp.copieCNI;
        candidature.residence = temp.residence;
      }
      return candidature;
    });

  const totalCount2 = postulations ? postulations.length : 0;
  const countConformes2 = postulations
    ? postulations.filter(
        (c) => c.conforme === 'CONFORME' || c.statutAI === 'VALIDE_IA'
      ).length
    : 0;
  const countNonConformes2 = totalCount2 - countConformes2;

  const filteredByTab = postulations
    ? postulations.filter((p) => {
        if (filterTab === 'CONFORMES') return p.conforme === 'CONFORME' || p.statutAI === 'VALIDE_IA';
        if (filterTab === 'NON_CONFORMES') return p.conforme === 'NON CONFORME' || p.statutAI === 'ANOMALIE_IA' || p.statutAI === 'REJETE_IA';
        return true;
      })
    : [];

  const data =
    filteredByTab &&
    filteredByTab.map((postulation) => ({
      id: postulation._id || '-',
      numeroDossier: postulation.numeroDossier || postulation._id,
      candidat: `${postulation.nom || ''} ${postulation.prenom || ''}`.trim() || 'Candidat',
      nom: postulation.nom || '-',
      prenom: postulation.prenom || '-',
      cni: postulation.cni || '-',
      dateNaissance: postulation.dateNaissance || '-',
      poste: postulation.poste || '-',
      statutAI: postulation.statutAI || 'EN_ATTENTE_IA',
      scoreConfiance:
        postulation.auditAI?.scoreConfiance !== undefined && postulation.auditAI?.scoreConfiance !== null
          ? postulation.auditAI.scoreConfiance
          : null,
      anomaliesAI: postulation.auditAI?.anomalies || [],
      scoreTotal: postulation.scoreTotal || 0,
      conforme: postulation.conforme || '-',
      eligibilite: postulation.eligibilite || '-',
      motif: postulation.motif || '-',
      dossier: postulation.dossier || '-',
      raw: postulation,
    }));

  const handleOpenDrawer = (row, idx) => {
    const cand = (postulations && postulations.find((c) => String(c._id) === String(row.id))) || row.raw;
    setSelectedCandidate(cand);
    setSelectedIndex(idx);
    setShowDrawer(true);
  };

  const handlePrevCandidate = () => {
    if (selectedIndex > 0) {
      const prevIdx = selectedIndex - 1;
      const prevRow = data[prevIdx];
      const cand = (postulations && postulations.find((c) => String(c._id) === String(prevRow.id))) || prevRow.raw;
      setSelectedCandidate(cand);
      setSelectedIndex(prevIdx);
    }
  };

  const handleNextCandidate = () => {
    if (selectedIndex < data.length - 1) {
      const nextIdx = selectedIndex + 1;
      const nextRow = data[nextIdx];
      const cand = (postulations && postulations.find((c) => String(c._id) === String(nextRow.id))) || nextRow.raw;
      setSelectedCandidate(cand);
      setSelectedIndex(nextIdx);
    }
  };

  const unifiedHeaderStyle = {
    backgroundColor: '#F8FAFC',
    color: '#334155',
    borderBottom: '2px solid #E2E8F0',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '14px 12px',
    verticalAlign: 'middle',
  };

  const columns = [
    {
      dataField: 'numeroDossier',
      text: 'Réf / Dossier',
      sort: true,
      headerStyle: {
        ...unifiedHeaderStyle,
        width: '120px',
        textAlign: 'center',
      },
      style: { textAlign: 'center', verticalAlign: 'middle' },
      formatter: (cell) => (
        <span className='badge bg-light text-dark border small fw-bold font-monospace'>
          {String(cell).substring(0, 8)}...
        </span>
      ),
    },
    {
      dataField: 'candidat',
      text: 'Candidat (Nom & CNI)',
      sort: true,
      headerStyle: {
        ...unifiedHeaderStyle,
        minWidth: '180px',
      },
      style: { verticalAlign: 'middle' },
      formatter: (cell, row) => (
        <div>
          <span className='fw-bold text-dark fs-6 d-block'>{cell}</span>
          <div className='d-flex align-items-center gap-2 small text-muted'>
            <span className='font-monospace fw-semibold'>{row.cni || '-'}</span>
            {row.dateNaissance && row.dateNaissance !== '-' && <span>• {row.dateNaissance}</span>}
          </div>
        </div>
      ),
    },
    {
      dataField: 'poste',
      text: 'Poste Postulé',
      sort: true,
      headerStyle: {
        ...unifiedHeaderStyle,
        minWidth: '150px',
      },
      style: { verticalAlign: 'middle' },
      formatter: (cell) => <span className='badge bg-light text-dark border fw-bold'>{cell}</span>,
    },
    {
      dataField: 'statutAI',
      text: 'Audit IA (Niveau 1)',
      sort: true,
      headerStyle: {
        ...unifiedHeaderStyle,
        textAlign: 'center',
        width: '160px',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'center',
      },
      formatter: (cell) => {
        if (cell === 'VALIDE_IA') {
          return (
            <Badge bg='success' className='px-2 py-1 fs-6 shadow-sm'>
              <i className='fas fa-check-circle me-1'></i> Conforme IA
            </Badge>
          );
        } else if (cell === 'ANOMALIE_IA') {
          return (
            <Badge bg='warning' text='dark' className='px-2 py-1 fs-6 fw-bold shadow-sm'>
              <i className='fas fa-exclamation-triangle me-1'></i> Anomalie
            </Badge>
          );
        } else if (cell === 'REJETE_IA') {
          return (
            <Badge bg='danger' className='px-2 py-1 fs-6 shadow-sm'>
              <i className='fas fa-times-circle me-1'></i> Rejeté IA
            </Badge>
          );
        } else {
          return (
            <Badge bg='secondary' className='px-2 py-1 fs-6 shadow-sm'>
              <i className='fas fa-clock me-1'></i> En Attente
            </Badge>
          );
        }
      },
    },
    {
      dataField: 'anomaliesAI',
      text: 'Anomalies & Remarques',
      headerStyle: {
        ...unifiedHeaderStyle,
        minWidth: '240px',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'left',
        fontSize: '0.84rem',
      },
      formatter: (cell) => {
        if (!cell || cell.length === 0) {
          return (
            <span className='text-success small fw-bold d-inline-flex align-items-center gap-1'>
              <i className='fas fa-check-circle text-success'></i> Aucune anomalie
            </span>
          );
        }
        return (
          <div style={{ maxWidth: '300px' }}>
            {cell.slice(0, 2).map((anom, idx) => (
              <div key={idx} className='text-danger fw-semibold mb-1 text-truncate' title={anom}>
                • {anom}
              </div>
            ))}
            {cell.length > 2 && (
              <span className='badge bg-light text-muted border'>+{cell.length - 2} autre(s)</span>
            )}
          </div>
        );
      },
    },
    {
      dataField: 'scoreTotal',
      text: 'Score ⭐',
      sort: true,
      headerStyle: {
        ...unifiedHeaderStyle,
        textAlign: 'center',
        width: '95px',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'center',
      },
      formatter: (cell) => (
        <span className='badge bg-warning text-dark fs-6 px-2 py-1'>
          <b>{cell !== undefined && cell !== null && cell !== '-' ? cell : '0'}</b>
        </span>
      ),
    },
    {
      dataField: 'conforme',
      text: 'Statut Contrôle 2',
      sort: true,
      headerStyle: {
        ...unifiedHeaderStyle,
        textAlign: 'center',
        width: '150px',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'center',
      },
      formatter: (cell) => {
        if (cell === 'CONFORME') {
          return <span className='badge bg-success text-white px-2 py-1'>🟢 Conforme Certifié</span>;
        } else if (cell === 'NON CONFORME') {
          return <span className='badge bg-danger text-white px-2 py-1'>🔴 Non Conforme</span>;
        } else {
          return <span className='badge bg-warning text-dark px-2 py-1'>🟡 En Cours d'Audit</span>;
        }
      },
    },
    {
      dataField: 'action',
      text: 'Contrôle',
      headerStyle: {
        ...unifiedHeaderStyle,
        textAlign: 'center',
        width: '130px',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'center',
      },
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
          <i className='fas fa-user-check me-1'></i> Examiner
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

  const options = {
    paginationSize: 5,
    pageStartIndex: 1,
    sizePerPageList: [
      { text: '10 dossiers', value: 10 },
      { text: '25 dossiers', value: 25 },
      { text: '50 dossiers', value: 50 },
      { text: '100 dossiers', value: 100 },
    ],
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      handleOpenDrawer(row, rowIndex);
    },
  };

  return (
    <div id='root'>
      <div className='app'>
        <ControleurSideBar prenom={userInfo?.prenom} nom={userInfo?.nom} />
        <main style={{ backgroundColor: '#F4F7FC', minHeight: '100vh' }}>
          <HeaderAdministrateur
            headerTitle='Contrôle Niveau 2 : Auditeur Humain EHC (Résolution des Anomalies & Conformité)'
            endPoint='/admin'
          />
          <Container className='mt-4'>
            {/* BANDEAU PILOTAGE CONTRÔLE 2 : STYLE LOGICAT */}
            <div
              className='p-4 mb-4 text-white position-relative overflow-hidden'
              style={{
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0A1128 0%, #101E3D 55%, #0052FF 100%)',
                boxShadow: '0 10px 25px rgba(0, 82, 255, 0.2)',
              }}
            >
              <div className='d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom border-light border-opacity-10'>
                <div>
                  <div className='d-flex align-items-center gap-2 mb-2'>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <i className='fas fa-user-check me-1 text-info'></i> Contrôle Palier 2
                    </span>
                  </div>
                  <h4 className='fw-bold mb-1 text-white' style={{ letterSpacing: '-0.02em' }}>
                    Pipeline Contrôle 2 : Auditeur Humain EHC
                  </h4>
                  <p className='text-light mb-0 opacity-75 small' style={{ maxWidth: '650px' }}>
                    Résolution humaine des anomalies, vérification approfondie des pièces justificatives et transmission vers la Commission Finale (Contrôle 3).
                  </p>
                </div>
                <div className='d-flex flex-wrap gap-2 mt-3 mt-md-0'>
                  <Button
                    variant='success'
                    className='fw-bold px-3 py-2 text-white shadow-sm d-flex align-items-center gap-2'
                    style={{ borderRadius: '10px' }}
                    disabled={validatingControl2Loading || countConformes2 === 0}
                    onClick={handleValidateConformesToControl3}
                  >
                    {validatingControl2Loading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Transmission vers Commission...
                      </>
                    ) : (
                      <>
                        <i className='fas fa-award'></i>
                        Transmettre les {countConformes2} Conformes vers Contrôle 3 (Commission)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* CARTES KPI CONTRÔLE 2 AVEC FILTRES */}
              <Row className='g-3 text-center'>
                <Col xs={4}>
                  <div
                    className={`p-3 rounded-3 ${filterTab === 'ALL' ? 'bg-white text-primary fw-bold shadow' : 'bg-white bg-opacity-10 text-white'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s', borderRadius: '14px' }}
                    onClick={() => setFilterTab('ALL')}
                  >
                    <div className='fs-3 fw-bold'>{totalCount2}</div>
                    <div className='small text-uppercase fw-semibold'>Tous les dossiers (C2)</div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div
                    className={`p-3 rounded-3 ${filterTab === 'CONFORMES' ? 'bg-success text-white shadow' : 'bg-white bg-opacity-10 text-white'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s', borderRadius: '14px' }}
                    onClick={() => setFilterTab('CONFORMES')}
                  >
                    <div className='fs-3 fw-bold'>{countConformes2}</div>
                    <div className='small text-uppercase fw-semibold'>🟢 Conformes Certifiés</div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div
                    className={`p-3 rounded-3 ${filterTab === 'NON_CONFORMES' ? 'bg-danger text-white shadow' : 'bg-white bg-opacity-10 text-white'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s', borderRadius: '14px' }}
                    onClick={() => setFilterTab('NON_CONFORMES')}
                  >
                    <div className='fs-3 fw-bold'>{countNonConformes2}</div>
                    <div className='small text-uppercase fw-semibold'>🔴 À Traiter / Rejetés</div>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>

          <Container
            className='mb-4 mt-4 pt-3 pb-3'
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            }}
          >
            {loadingCandidatures2 ? (
              <Spinner size={150} />
            ) : errorCandidatures2 ? (
              <Message variant='danger'>{errorCandidatures2}</Message>
            ) : (
              data && (
                <ToolkitProvider
                  keyField='id'
                  data={data}
                  columns={columns}
                  search
                  exportCSV
                >
                  {(props) => (
                    <>
                      <div className='d-flex flex-wrap justify-content-between align-items-center mb-3 px-2 gap-2'>
                        <div className='d-flex align-items-center gap-2'>
                          <h5 className='mb-0 fw-bold text-dark'>
                            <i className='fas fa-tasks me-2 text-primary'></i>
                            Dossiers Contrôle 2 ({data.length})
                          </h5>
                          <span className='small text-muted'>
                            (Cliquez sur une ligne pour examiner)
                          </span>
                        </div>
                        <div className='d-flex align-items-center gap-2'>
                          <div style={{ width: '300px' }}>
                            <SearchBar {...props.searchProps} placeholder='Rechercher un candidat, CNI...' />
                          </div>
                          <ExportCSVButton {...props.csvProps} className='btn btn-outline-primary btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-1'>
                            <i className='fas fa-file-excel'></i> Exporter CSV
                          </ExportCSVButton>
                        </div>
                      </div>

                      <div className='table-responsive'>
                        <BootstrapTable
                          {...props.baseProps}
                          keyField='id'
                          bootstrap4={true}
                          data={data}
                          columns={columns}
                          hover
                          rowClasses='cursor-pointer'
                          noDataIndication={
                            <div className='text-center py-4 text-muted'>
                              <i className='fas fa-folder-open fa-2x mb-2 d-block opacity-50'></i>
                              Aucun dossier trouvé dans cette vue.
                            </div>
                          }
                          defaultSorted={defaultSorted}
                          pagination={paginationFactory(options)}
                          rowEvents={rowEvents}
                        />
                      </div>
                    </>
                  )}
                </ToolkitProvider>
              )
            )}
          </Container>

          {/* DRAWER D'EXAMEN LATÉRAL RAPIDE */}
          <ControleurDrawer
            show={showDrawer}
            onClose={() => setShowDrawer(false)}
            candidature={selectedCandidate}
            controlLevel={2}
            userInfo={userInfo}
            onPrev={handlePrevCandidate}
            onNext={handleNextCandidate}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < data.length - 1}
            currentIndex={selectedIndex}
            totalCount={data.length}
          />
        </main>
      </div>
    </div>
  );
};

export default ControlleursCandidatures2Screen;
