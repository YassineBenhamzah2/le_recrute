import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import {
  listControllerCandidatures,
  updateCandidature,
  getCandidatureDetails,
} from '../../actions/candidatureActions';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Col, Collapse, Container, Row, Button } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import moment from 'moment';
import Message from '../../components/Message';
import Spinner from '../../components/Spinner';
import LInkFichier from '../../components/LInkFichier';
import ControleurSideBar from '../../components/ControleurSideBar';
import { useToasts } from 'react-toast-notifications';
import { CANDIDATURE_UPDATE_RESET } from '../../constants/candidatureConstants';

const CandidatureVlidationScreen = () => {
  moment.locale('fr');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const [open, setOpen] = useState(false);
  const { addToast } = useToasts();

  const ID = params.id;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const candidaturesListController = useSelector(
    (state) => state.candidaturesListController
  );
  const {
    candidatures: candidatures1,
    loading: loadingCandidatures1,
    error: errorCandidatures1,
  } = candidaturesListController;

  const candidatureUpdate = useSelector((state) => state.candidatureUpdate);
  const {
    success: successUpdate,
    loading: loadingUpdate,
    error: errorUpdate,
  } = candidatureUpdate;

  const candidatureDetails = useSelector(
    (state) => state.candidatureDetails || {}
  );
  const {
    candidature,
    loading: loadingDetails,
    error: errorDetails,
  } = candidatureDetails;

  useEffect(() => {
    if (userInfo && userInfo.isController) {
      dispatch(listControllerCandidatures());
      if (ID) {
        dispatch(getCandidatureDetails(ID));
      }
    } else {
      navigate('/login');
    }

    if (successUpdate) {
      addToast('Modification effectuée avec succès', {
        appearance: 'success',
        autoDismiss: true,
      });
      if (ID) {
        dispatch(getCandidatureDetails(ID));
      }
      dispatch(listControllerCandidatures());
      dispatch({ type: CANDIDATURE_UPDATE_RESET });
    }
  }, [userInfo, dispatch, addToast, successUpdate, navigate, ID]);

  const handleValidateAndTransmitToControl2 = () => {
    if (!postulationTarget || !postulationTarget._id) return;
    const targetName = `${postulationTarget.user?.prenom || postulationTarget.prenom || ''} ${postulationTarget.user?.nom || postulationTarget.nom || ''}`.trim();
    if (!window.confirm(`Confirmer la validation manuelle et la transmission du dossier de ${targetName} vers le Contrôle 2 ?`)) {
      return;
    }
    const controllerName = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim();
    dispatch(
      updateCandidature(postulationTarget._id, {
        isControl1: true,
        conforme: 'CONFORME',
        eligibilite: 'ELIGIBLE',
        controle1: `Validé manuellement par ${controllerName} (Contrôle 1 certifié)`,
      })
    );
  };

  const { SearchBar } = Search;

  const postulationTarget =
    (candidatures1 && candidatures1.find((c) => String(c._id) === String(ID))) ||
    candidature;

  const validations1 =
    postulationTarget && postulationTarget._id ? [postulationTarget] : [];

  const data =
    validations1 &&
    validations1.map((postulation) => {
      const u = postulation.user || {};
      return {
        id: postulation._id || '-',
        dateCandidature:
          (postulation.createdAt &&
            moment(postulation.createdAt).format('LLL')) ||
          '-',
        heureCandidature:
          (postulation.createdAt &&
            moment(postulation.createdAt).format('LLL')) ||
          '-',
        poste: postulation.poste || (postulation.offre && postulation.offre.titre) || '-',
        civilite: postulation.civilite || u.civilite || '-',
        nom: postulation.nom || u.nom || '-',
        prenom: postulation.prenom || u.prenom || '-',
        dateNaissance: postulation.dateNaissance || u.dateNaissance || '-',
        cni: postulation.cni || u.cni || '-',
        email: postulation.email || u.email || '-',
        phone: postulation.phone || u.phone || '-',
        adresse: postulation.adresse || u.adresse || '-',
        codePostale: postulation.codePostale || u.codePostale || '-',
        ville: postulation.ville || u.ville || '-',
        niveauEtude: postulation.niveauEtude || '-',
        specialite: postulation.specialite || '-',
        methodeNotation: postulation.methodeNotation || '-',
        annee1: postulation.annee1 || '-',
        annee2: postulation.annee2 || '-',
        annee3: postulation.annee3 || '-',
        semestre1: postulation.semestre1 || '-',
        semestre2: postulation.semestre2 || '-',
        semestre3: postulation.semestre3 || '-',
        semestre4: postulation.semestre4 || '-',
        semestre5: postulation.semestre5 || '-',
        semestre6: postulation.semestre6 || '-',
        moyenneOFPPT: postulation.moyenneOFPPT || '-',
        // noteMoyenne: postulation.noteMoyenne || '-',
        dateDebutExperience1:
          (postulation.experiences &&
            postulation.experiences[0] &&
            postulation.experiences[0].dateDebut) ||
          '-',
      dateFinExperience1:
        (postulation.experiences &&
          postulation.experiences[0] &&
          postulation.experiences[0].dateFin) ||
        '-',
      dateDebutExperience2:
        (postulation.experiences &&
          postulation.experiences[1] &&
          postulation.experiences[1].dateDebut) ||
        '-',
      dateFinExperience2:
        (postulation.experiences &&
          postulation.experiences[1] &&
          postulation.experiences[1].dateFin) ||
        '-',
      dateDebutExperience3:
        (postulation.experiences &&
          postulation.experiences[2] &&
          postulation.experiences[2].dateDebut) ||
        '-',
      dateFinExperience3:
        (postulation.experiences &&
          postulation.experiences[2] &&
          postulation.experiences[2].dateFin) ||
        '-',
      dateDebutExperience4:
        (postulation.experiences &&
          postulation.experiences[3] &&
          postulation.experiences[3].dateDebut) ||
        '-',
      dateFinExperience4:
        (postulation.experiences &&
          postulation.experiences[3] &&
          postulation.experiences[3].dateFin) ||
        '-',
      dateDebutExperience5:
        (postulation.experiences &&
          postulation.experiences[4] &&
          postulation.experiences[4].dateDebut) ||
        '-',
      dateFinExperience5:
        (postulation.experiences &&
          postulation.experiences[4] &&
          postulation.experiences[4].dateFin) ||
        '-',
      dateDebutExperience6:
        (postulation.experiences &&
          postulation.experiences[5] &&
          postulation.experiences[5].dateDebut) ||
        '-',
      dateFinExperience6:
        (postulation.experiences &&
          postulation.experiences[5] &&
          postulation.experiences[5].dateFin) ||
        '-',

      disponibilite: postulation.disponibilite || '-',
      scoreAge: postulation.scoreAge || '-',
      scoreNote: postulation.scoreNote || '-',
      scoreExperience: postulation.scoreExperience || '-',
      scoreExperienceBancaire: postulation.scoreExperienceBancaire || '-',
      scoreTotal: postulation.scoreTotal || '-',
      copieCNI:
        (postulation.copieCNI && (
          <LInkFichier link={postulation.copieCNI} />
        )) ||
        '-',
      residence:
        (postulation.residence && (
          <LInkFichier link={postulation.residence} />
        )) ||
        '-',
      releves:
        (postulation.releves && (
          <LInkFichier link={postulation.releves} />
        )) ||
        '-',
      copieDiplomes:
        (postulation.copieDiplomes && (
          <LInkFichier link={postulation.copieDiplomes} />
        )) ||
        '-',
      attestationsTravail:
        (postulation.attestationsTravail && (
          <LInkFichier link={postulation.attestationsTravail} />
        )) ||
        '-',
      controle1: postulation.controle1 || '-',
      isControl1:
        postulation.isControl1 && postulation.isControl1 === true
          ? 'OUI'
          : 'NON' || '-',
      controle2: postulation.controle2 || '-',
      isControl2:
        postulation.isControl2 && postulation.isControl2 === true
          ? 'OUI'
          : 'NON' || '-',
      conforme: postulation.conforme || '-',
      eligibilite: postulation.eligibilite || '-',
      motif: postulation.motif || '-',
      dossier: postulation.dossier || '-',
    };
  });

  const columns = [
    {
      dataField: 'id',
      text: 'ID',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
    },

    {
      dataField: 'isControl1',
      text: 'Controle premier effectue',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
      editor: {
        type: Type.SELECT,
        options: [
          {
            value: 'OUI',
            label: `OUI`,
          },
          {
            value: 'NON',
            label: `NON`,
          },
        ],
      },
    },
    {
      dataField: 'conforme',
      text: 'Candidatures conformes ?',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
      editor: {
        type: Type.SELECT,
        options: [
          {
            value: `CONFORME`,
            label: `CONFORME`,
          },
          {
            value: `NON CONFORME`,
            label: `NON CONFORME`,
          },
        ],
      },
    },
    {
      dataField: 'eligibilite',
      text: 'Eligibilite de la candidature',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
      editor: {
        type: Type.SELECT,
        options: [
          {
            value: `ELIGIBLE`,
            label: `ELIGIBLE`,
          },
          {
            value: `NON ELIGIBLE`,
            label: `NON ELIGIBLE`,
          },
        ],
      },
    },
    {
      dataField: 'motif',
      text: 'Motif de la non eligibilite',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
      editor: {
        type: Type.SELECT,
        options: [
          {
            value: `NENA`,
            label: `NENA`,
          },
          {
            value: `NEA`,
            label: `NEA`,
          },
          {
            value: `NED`,
            label: `NED`,
          },
          {
            value: `NEP`,
            label: `NEP`,
          },
        ],
      },
    },
    {
      dataField: 'dossier',
      text: 'Manque dans le dossier',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
      editor: {
        type: Type.SELECT,
        options: [
          {
            value: `NEP-CIN`,
            label: `NEP-CIN`,
          },
          {
            value: `NEP-AR`,
            label: `NEP-AR`,
          },
          {
            value: `NEP-DIP`,
            label: `NEP-DIP`,
          },
          {
            value: `NEP-AE`,
            label: `NEP-AE`,
          },
          {
            value: `NEP-RN`,
            label: `NEP-RN`,
          },
          {
            value: `NEP-AT`,
            label: `NEP-AT`,
          },
        ],
      },
    },
  ];

  const defaultSorted = [
    {
      dataField: 'scoreTotal',
      order: 'dsc',
    },
  ];
  const options = {
    paginationSize: 4,
    pageStartIndex: 1,
    sizePerPageList: [
      {
        text: '10',
        value: 10,
      },
      {
        text: '20',
        value: 20,
      },
      {
        text: '50',
        value: 50,
      },
      {
        text: '100',
        value: 100,
      },
      {
        text: '200',
        value: 200,
      },
    ],
  };

  function afterSaveCell(oldValue, newValue, row, column) {
    let payloadValue = newValue ? newValue : '-';
    if (column.dataField === 'isControl1' || column.dataField === 'isControl2') {
      payloadValue = (newValue === 'OUI' || newValue === true || newValue === 'true');
    }
    const updatePayload = {
      [column.dataField]: payloadValue,
    };
    if (column.dataField === 'isControl1' && payloadValue === true) {
      updatePayload.conforme = 'CONFORME';
      updatePayload.eligibilite = 'ELIGIBLE';
    }
    dispatch(updateCandidature(row.id, updatePayload));
  }

  const CustomToggleList = ({ columns, onColumnToggle, toggles }) => (
    <div className='btn-group btn-group-toggle' data-toggle='buttons'>
      <Container>
        <Row className='justify-content-center'>
          <Container>
            <Button
              className='btn-primary'
              onClick={() => setOpen(!open)}
              aria-controls='example-collapse-text'
              aria-expanded={open}
            >
              <i className='fas fa-filter'></i> Filter par :{' '}
            </Button>
          </Container>
        </Row>

        <Row className='justify-content-center'>
          <Col md={12} lg={12} className='mt-2' style={{ marginLeft: '11em' }}>
            <Collapse in={open}>
              <div id='example-collapse-text'>
                <>
                  {columns
                    .map((column) => ({
                      ...column,
                      toggle: toggles[column.dataField],
                    }))
                    .map((column) => (
                      <button
                        type='button'
                        key={column.dataField}
                        className={`m-1  btn btn-outline-info btn-sm ${
                          column.toggle ? 'active' : ''
                        }`}
                        data-toggle='button'
                        aria-pressed={column.toggle ? 'true' : 'false'}
                        onClick={() => onColumnToggle(column.dataField)}
                      >
                        {column.text}
                      </button>
                    ))}
                </>
              </div>
            </Collapse>
          </Col>
        </Row>
      </Container>
    </div>
  );

  return (
    <div id='root'>
      <div className='app'>
        <ControleurSideBar prenom={userInfo.prenom} nom={userInfo.nom} />
        <main>
          <HeaderAdministrateur
            headerTitle='Liste des candidatures pour le premier controle'
            endPoint='/admin'
          />
          <Container
            className='mb-4 mt-4 pt-3  pb-3 font-weight-bold'
            style={{
              backgroundColor: '#fff',
              transition: 'box-shadow 0.25s',
              boxShadow:
                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
            }}
          >
            {loadingUpdate && <Spinner size={150} />}
            {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

            {/* BANDEAU RECAPITULATIF DU CANDIDAT */}
            {postulationTarget && postulationTarget._id && (
              <div className='p-3 mb-4 rounded-3 border bg-light shadow-sm d-flex flex-wrap justify-content-between align-items-center'>
                <div>
                  <h5 className='fw-bold text-primary mb-1'>
                    <i className='fas fa-clipboard-check me-2'></i>
                    Validation Finale Contrôle 1 : {postulationTarget.user?.prenom || postulationTarget.prenom} {postulationTarget.user?.nom || postulationTarget.nom}
                  </h5>
                  <div className='text-muted small'>
                    Poste : <b>{postulationTarget.poste || postulationTarget.offre?.titre || 'Guichetier'}</b> | CNI : <b>{postulationTarget.user?.cni || postulationTarget.cni}</b> | Statut IA :{' '}
                    <span className={`badge ${postulationTarget.statutAI === 'VALIDE_IA' ? 'bg-success' : 'bg-danger'} ms-1`}>
                      {postulationTarget.statutAI || 'VALIDE_IA'}
                    </span>
                  </div>
                </div>
                <div className='d-flex align-items-center gap-2 mt-2 mt-md-0'>
                  {postulationTarget.isControl1 ? (
                    <span className='badge bg-success fs-6 px-3 py-2'>
                      <i className='fas fa-check-double me-1'></i> Validé & Transmis à Contrôle 2
                    </span>
                  ) : (
                    <>
                      <Button
                        variant='success'
                        size='sm'
                        className='fw-bold shadow-sm'
                        onClick={handleValidateAndTransmitToControl2}
                      >
                        <i className='fas fa-check-circle me-1'></i> Valider & Transmettre à Contrôle 2
                      </Button>
                      <span className='badge bg-warning text-dark fs-6 px-3 py-2'>
                        <i className='fas fa-clock me-1'></i> En Attente
                      </span>
                    </>
                  )}
                  <Button
                    variant='outline-primary'
                    size='sm'
                    className='fw-bold'
                    onClick={() => navigate('/controlleurs/candidatures/control1')}
                  >
                    <i className='fas fa-arrow-left me-1'></i> Retour Contrôle 1
                  </Button>
                </div>
              </div>
            )}

            {loadingCandidatures1 && loadingDetails ? (
              <Spinner size={150} />
            ) : errorCandidatures1 && errorDetails ? (
              <Message variant='danger'>{errorCandidatures1 || errorDetails}</Message>
            ) : (
              data && (
                <ToolkitProvider
                  keyField='id'
                  data={data}
                  columns={columns}
                  columnToggle
                  search
                >
                  {(props) => (
                    <>
                      <Container>
                        <Row className='mt-2'>
                          <h5>
                            <i className='fas fa-search'></i> Rechercher :
                          </h5>
                          <Col md={8} lg={8}>
                            {' '}
                            <SearchBar {...props.searchProps} />
                          </Col>
                        </Row>
                      </Container>
                      <hr />
                      <CustomToggleList {...props.columnToggleProps} />
                      <hr />
                      <BootstrapTable
                        {...props.baseProps}
                        keyField='id'
                        bootstrap4={true}
                        data={data}
                        columns={columns}
                        wrapperClasses='table-responsive text-center'
                        hover
                        noDataIndication='Table is Empty'
                        defaultSorted={defaultSorted}
                        pagination={paginationFactory(options)}
                        filter={filterFactory()}
                        cellEdit={cellEditFactory({
                          mode: 'click',
                          afterSaveCell,
                        })}
                      />
                    </>
                  )}
                </ToolkitProvider>
              )
            )}
          </Container>
        </main>
      </div>
    </div>
  );
};

export default CandidatureVlidationScreen;
