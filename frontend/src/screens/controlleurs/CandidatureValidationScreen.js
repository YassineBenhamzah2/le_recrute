import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import {
  listControllerCandidatures,
  updateCandidature,
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

  useEffect(() => {
    if (userInfo && userInfo.isController) {
      dispatch(listControllerCandidatures());
    } else {
      navigate('/login');
    }

    if (successUpdate) {
      addToast('Modification effectuee avec succes', {
        appearance: 'success',
        autoDismiss: true,
      });
    }
  }, [userInfo, dispatch, addToast, successUpdate, navigate]);

  const { SearchBar } = Search;

  const validations1 =
    candidatures1 &&
    candidatures1.filter((candidature1) => candidature1._id === ID);

  const data =
    validations1 &&
    validations1.map((postulation) => ({
      id: postulation._id || '-',
      dateCandidature:
        (postulation.createdAt &&
          moment(postulation.createdAt).format('LLL')) ||
        '-',
      heureCandidature:
        (postulation.createdAt &&
          moment(postulation.createdAt).format('LLL')) ||
        '-',
      poste: postulation.poste || '-',
      civilite: postulation.civilite || '-',
      nom: postulation.nom || '-',
      prenom: postulation.prenom || '-',
      dateNaissance: postulation.dateNaissance || '-',
      cni: postulation.cni || '-',
      email: postulation.email || '-',
      phone: postulation.phone || '-',
      adresse: postulation.adresse || '-',
      codePostale: postulation.codePostale || '-',
      ville: postulation.ville || '-',
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
    }));

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
            value: true,
            label: `OUI`,
          },
          {
            value: false,
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
    alert('Vous etes sur de changement');
    dispatch(
      updateCandidature(row.id, {
        [column.dataField]: newValue ? newValue : '-',
      })
    );
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
            {loadingCandidatures1 ? (
              <Spinner size={150} />
            ) : errorCandidatures1 ? (
              <Message variant='danger'>{errorCandidatures1}</Message>
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
