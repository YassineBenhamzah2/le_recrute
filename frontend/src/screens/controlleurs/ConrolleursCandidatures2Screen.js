import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  listControllerCandidatures,
  listControllerCandidatures2,
} from '../../actions/candidatureActions';
import AdminSideBar from '../../components/AdminSideBar';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import ToolkitProvider, {
  Search,
  CSVExport,
} from 'react-bootstrap-table2-toolkit';
import { Col, Collapse, Container, Row, Button } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useToasts } from 'react-toast-notifications';
import Message from '../../components/Message';
import Spinner from '../../components/Spinner';
import { CANDIDATURE_UPDATE_RESET } from '../../constants/candidatureConstants';
import LInkFichier from '../../components/LInkFichier';
import { listUsers } from '../../actions/userActions';
import ControleurSideBar from '../../components/ControleurSideBar';

const ControlleursCandidatures2Screen = () => {
  moment.locale('fr');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

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

  console.log(candidatures2);

  useEffect(() => {
    if (userInfo && userInfo.isController) {
      dispatch(listControllerCandidatures2());
      dispatch(listUsers());
      dispatch({ type: CANDIDATURE_UPDATE_RESET });
    } else {
      navigate('/login');
    }
  }, [userInfo, dispatch, navigate]);

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

  const data =
    postulations &&
    postulations.map((postulation) => ({
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
      dataField: 'dateCandidature',
      text: 'Date de condidature',
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
      dataField: 'heureCandidature',
      text: 'Heure de condidature',
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
      dataField: 'poste',
      text: 'Poste',
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
      dataField: 'civilite',
      text: 'Civilite',
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
      dataField: 'nom',
      text: 'Nom du candidat',
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
      dataField: 'prenom',
      text: 'Prenom du candidat',
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
      dataField: 'scoreTotal',
      text: 'Score Total ⭐',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#ffeeba',
        fontWeight: 'bold',
        color: '#856404',
        textAlign: 'center',
      },
      formatter: (cell) => (
        <span className='badge bg-warning text-dark fs-6 px-3 py-1'>
          <b>{cell !== undefined && cell !== null && cell !== '-' ? cell : '0'}</b>
        </span>
      ),
    },
    {
      dataField: 'action',
      text: 'Action',
      headerStyle: {
        backgroundColor: '#b8daff',
        textAlign: 'center',
        fontWeight: 'bold',
      },
      formatter: (cell, row) => (
        <button
          className='btn btn-primary btn-sm px-3 fw-bold'
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/controlleurs/candidatures/informations/${row.id}`);
          }}
        >
          <i className='fas fa-search me-1'></i> Vérifier
        </button>
      ),
    },
    {
      dataField: 'dateNaissance',
      text: 'Date de naissance',
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
      dataField: 'cni',
      text: 'Num de CNI',
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
      dataField: 'email',
      text: 'Email',
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
      dataField: 'phone',
      text: 'Num de telephone',
      sort: true,
      filter: textFilter(),
      align: 'left',
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
    },
    {
      dataField: 'adresse',
      text: 'Adresse du candidat',
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
      dataField: 'codePostale',
      text: 'Code Postale',
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
      dataField: 'ville',
      text: 'Ville du candidat',
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
      dataField: 'niveauEtude',
      text: "Niveau d'etude",
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
      dataField: 'specialite',
      text: 'Specialite',
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
      dataField: 'methodeNotation',
      text: 'Methode de notation',
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
      dataField: 'annee1',
      text: 'Annee 1',
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
      dataField: 'annee2',
      text: 'Annee 2',
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
      dataField: 'annee3',
      text: 'Annee 3',
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
      dataField: 'semestre1',
      text: 'Semestre 1',
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
      dataField: 'semestre2',
      text: 'Smestre 2',
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
      dataField: 'semestre3',
      text: 'Semestre 3',
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
      dataField: 'semestre4',
      text: 'Semestre 4',
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
      dataField: 'semestre5',
      text: 'Semestre 5',
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
      dataField: 'semestre6',
      text: 'Semestre 6',
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
      dataField: 'disponibilite',
      text: 'Disponibilite',
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
      dataField: 'scoreAge',
      text: "Score d'age",
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
      dataField: 'scoreNote',
      text: 'Score de la note',
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
      dataField: 'scoreExperience',
      text: "Score d'experience non bancaire",
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
      dataField: 'scoreExperienceBancaire',
      text: "Score d'experience non bancaire",
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
      dataField: 'scoreTotal',
      text: 'Score total',
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
      dataField: 'dateDebutExperience1',
      text: 'Date debut experience 1',
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
      dataField: 'dateFinExperience1',
      text: 'Date fin experience 1',
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
      dataField: 'dateDebutExperience2',
      text: 'Date debut experience 2',
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
      dataField: 'dateFinExperience2',
      text: 'Date fin experience 2',
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
      dataField: 'dateDebutExperience3',
      text: 'Date debut experience 3',
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
      dataField: 'dateFinExperience3',
      text: 'Date fin experience 3',
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
      dataField: 'dateDebutExperience4',
      text: 'Date debut experience 4',
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
      dataField: 'dateFinExperience4',
      text: 'Date fin experience 4',
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
      dataField: 'dateDebutExperience5',
      text: 'Date debut experience 5',
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
      dataField: 'dateFinExperience5',
      text: 'Date fin experience 5',
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
      dataField: 'dateDebutExperience6',
      text: 'Date debut experience 6',
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
      dataField: 'dateFinExperience6',
      text: 'Date fin experience 6',
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
      dataField: 'copieCNI',
      text: 'COPIE CNI',
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
      dataField: 'residence',
      text: 'Certificat de residence',
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
      dataField: 'releves',
      text: 'Releves des notes',
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
      dataField: 'copieDiplomes',
      text: 'Copies des diplomes',
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
      dataField: 'attestationsTravail',
      text: 'Attestations de travail',
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

  const CustomToggleList = ({ columns, onColumnToggle, toggles }) => (
    <div className='btn-group btn-group-toggle' data-toggle='buttons'>
      <Container>
        <Row className='justify-content-center'>
          <Container>
            <Button
              className='btn btn-outline-dark'
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

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      navigate(`/controlleurs/candidatures/informations/${row.id}`);
    },
  };

  return (
    <div id='root'>
      <div className='app'>
        <ControleurSideBar prenom={userInfo.prenom} nom={userInfo.nom} />
        <main>
          <HeaderAdministrateur
            headerTitle='Liste des candidatures pour le deuxieme controle'
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
                  columnToggle
                  search
                >
                  {(props) => (
                    <>
                      <Container>
                        <Row>
                          <h5>
                            <i className='fas fa-search'></i> Rechercher :
                          </h5>
                          <Col md={8} lg={8}>
                            {' '}
                            <SearchBar {...props.searchProps} />
                          </Col>
                          <Col style={{ textAlign: 'end' }}>
                            <ExportCSVButton {...props.csvProps}>
                              <Link
                                to='/admin/utilisateurs'
                                className='btn btn-outline-light'
                              >
                                Exporter les données
                              </Link>
                            </ExportCSVButton>
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
                        })}
                        rowEvents={rowEvents}
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

export default ControlleursCandidatures2Screen;
