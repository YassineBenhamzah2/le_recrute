import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { listControllerCandidatures } from '../../actions/candidatureActions';
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
import { CANDIDATURE_UPDATE_RESET } from '../../constants/candidatureConstants';
import LInkFichier from '../../components/LInkFichier';
import { listUsers } from '../../actions/userActions';
import ControleurSideBar from '../../components/ControleurSideBar';

const ControlleursCandidaturesScreen = () => {
  moment.locale('fr');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [validatingControl1Loading, setValidatingControl1Loading] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL');

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userList = useSelector((state) => state.userList);
  const { users } = userList;

  const candidaturesListController = useSelector(
    (state) => state.candidaturesListController
  );
  const {
    candidatures: candidatures1,
    loading: loadingCandidatures1,
    error: errorCandidatures1,
  } = candidaturesListController;

  const handleBatchAIAudit = async () => {
    if (!window.confirm("Lancer l'audit automatique par Intelligence Artificielle (Niveau 1) sur tous les dossiers ?")) return;
    try {
      setAiAuditLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data: res } = await axios.post('/api/candidatures/batch/ai-audit', {}, config);
      alert(
        `Audit IA Terminé avec succès !\n• Traités : ${res.processedCount}\n• Conformes IA : ${res.conformesCount}\n• Anomalies IA : ${res.anomaliesCount}\n• Rejetés IA : ${res.rejetesCount}`
      );
      dispatch(listControllerCandidatures());
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'audit IA");
    } finally {
      setAiAuditLoading(false);
    }
  };

  const handleValidateConformesToControl2 = async () => {
    if (!window.confirm("Transmettre tous les dossiers conformes IA vers le Contrôle 2 ?")) return;
    try {
      setValidatingControl1Loading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data: res } = await axios.post(
        '/api/candidatures/batch/validate-control1',
        { onlyConformes: true },
        config
      );
      alert(`${res.modifiedCount} dossiers conformes validés et transmis avec succès au Contrôle 2.`);
      dispatch(listControllerCandidatures());
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setValidatingControl1Loading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.isController) {
      dispatch(listControllerCandidatures());
      dispatch(listUsers());
      dispatch({ type: CANDIDATURE_UPDATE_RESET });
    } else {
      navigate('/login');
    }
  }, [userInfo, dispatch, navigate]);

  const { SearchBar } = Search;

  let postulations =
    candidatures1 &&
    candidatures1.map((candidature) => {
      let temp =
        users &&
        users.find(
          (user) =>
            String(user._id) ===
            String(candidature.user?._id || candidature.user)
        );
      const candUser =
        (typeof candidature.user === 'object' && candidature.user) ||
        temp ||
        {};

      candidature.civilite =
        candUser.civilite || candidature.civilite || temp?.civilite || '-';
      candidature.prenom =
        candUser.prenom || candidature.prenom || temp?.prenom || '-';
      candidature.nom =
        candUser.nom || candidature.nom || temp?.nom || '-';
      candidature.mleBr = candUser.mleBr || temp?.mleBr;
      candidature.mleC = candUser.mleC || temp?.mleC;
      candidature.dateNaissance =
        candUser.dateNaissance || candidature.dateNaissance || temp?.dateNaissance || '-';
      candidature.lieuNaissance =
        candUser.lieuNaissance || temp?.lieuNaissance;
      candidature.email =
        candUser.email || candidature.email || temp?.email || '-';
      candidature.cni =
        candUser.cni || candidature.cni || temp?.cni || '-';
      candidature.dateObtentionBac =
        candUser.dateObtentionBac || temp?.dateObtentionBac;
      candidature.nationalite =
        candUser.nationalite || temp?.nationalite;
      candidature.phone =
        candUser.phone || candidature.phone || temp?.phone || '-';
      candidature.adresse =
        candUser.adresse || candidature.adresse || temp?.adresse || '-';
      candidature.ville =
        candUser.ville || candidature.ville || temp?.ville || '-';
      candidature.codePostale =
        candUser.codePostale || candidature.codePostale || temp?.codePostale || '-';
      candidature.scoreAge =
        candUser.scoreAge !== undefined ? candUser.scoreAge : temp?.scoreAge;
      candidature.copieCNI =
        candUser.copieCNI || candidature.copieCNI || temp?.copieCNI;
      candidature.residence =
        candUser.residence || candidature.residence || temp?.residence;

      return candidature;
    });

  const candidaturesNonValidees =
    postulations &&
    postulations.filter((postulation) => postulation.isControl1 === false);

  const totalCount = candidaturesNonValidees ? candidaturesNonValidees.length : 0;
  const countConformes = candidaturesNonValidees
    ? candidaturesNonValidees.filter((c) => c.statutAI === 'VALIDE_IA').length
    : 0;
  const countAnomalies = candidaturesNonValidees
    ? candidaturesNonValidees.filter((c) => c.statutAI === 'ANOMALIE_IA').length
    : 0;
  const countRejetes = candidaturesNonValidees
    ? candidaturesNonValidees.filter((c) => c.statutAI === 'REJETE_IA').length
    : 0;
  const countEnAttente = candidaturesNonValidees
    ? candidaturesNonValidees.filter((c) => !c.statutAI || c.statutAI === 'EN_ATTENTE_IA').length
    : 0;

  const filteredByTab = candidaturesNonValidees
    ? candidaturesNonValidees.filter((p) => {
        if (filterTab === 'ATTENTE') return !p.statutAI || p.statutAI === 'EN_ATTENTE_IA';
        if (filterTab === 'ANOMALIES') return p.statutAI === 'ANOMALIE_IA';
        if (filterTab === 'CONFORMES') return p.statutAI === 'VALIDE_IA';
        if (filterTab === 'REJETES') return p.statutAI === 'REJETE_IA';
        return true;
      })
    : [];

  const data =
    filteredByTab &&
    filteredByTab.map((postulation) => ({
      id: postulation._id || '-',
      candidat: `${postulation.nom || ''} ${postulation.prenom || ''}`.trim() || 'Candidat',
      statutAI: postulation.statutAI || 'EN_ATTENTE_IA',
      scoreConfiance:
        postulation.auditAI?.scoreConfiance !== undefined && postulation.auditAI?.scoreConfiance !== null
          ? postulation.auditAI.scoreConfiance
          : null,
      anomaliesAI: postulation.auditAI?.anomalies || [],
      summaryAI: postulation.auditAI?.summary || '',
      dateCandidature:
        (postulation.createdAt && moment(postulation.createdAt).format('L')) ||
        '-',
      heureCandidature:
        (postulation.createdAt &&
          moment(postulation.createdAt).format('LTS')) ||
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
      text: 'ID / Dossier',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#e2e8f0',
        width: '110px',
        textAlign: 'center',
      },
      formatter: (cell) => (
        <span className='badge bg-light text-dark border small fw-bold font-monospace'>
          {String(cell).substring(0, 8)}...
        </span>
      ),
    },
    {
      dataField: 'candidat',
      text: 'Candidat (Nom & Prénom)',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
        fontWeight: 'bold',
        minWidth: '160px',
      },
      formatter: (cell, row) => (
        <div>
          <span className='fw-bold text-primary fs-6 d-block'>{cell}</span>
          <small className='text-muted font-monospace'>{row.cni || ''}</small>
        </div>
      ),
    },
    {
      dataField: 'poste',
      text: 'Poste',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
        fontWeight: 'bold',
      },
    },
    {
      dataField: 'statutAI',
      text: 'Audit IA (Niveau 1) 🤖',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#cce5ff',
        color: '#004085',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: '160px',
        width: '160px',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'center',
      },
      formatter: (cell) => {
        if (cell === 'VALIDE_IA') {
          return (
            <span className='badge bg-success text-white px-2 py-2 fs-6 shadow-sm'>
              <i className='fas fa-check-circle me-1'></i> Conforme IA
            </span>
          );
        } else if (cell === 'ANOMALIE_IA') {
          return (
            <span className='badge bg-warning text-dark px-2 py-2 fs-6 fw-bold shadow-sm'>
              <i className='fas fa-exclamation-triangle me-1'></i> Anomalie Détectée
            </span>
          );
        } else if (cell === 'REJETE_IA') {
          return (
            <span className='badge bg-danger text-white px-2 py-2 fs-6 shadow-sm'>
              <i className='fas fa-times-circle me-1'></i> Rejeté IA
            </span>
          );
        } else {
          return (
            <span className='badge bg-secondary text-white px-2 py-2 fs-6 shadow-sm'>
              <i className='fas fa-clock me-1'></i> En Attente
            </span>
          );
        }
      },
    },
    {
      dataField: 'anomaliesAI',
      text: 'Anomalies Détectées (Âge / Adresse / CNI...)',
      classes: 'cell-wrap-text',
      headerClasses: 'cell-wrap-text',
      headerStyle: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        fontWeight: 'bold',
        minWidth: '340px',
        width: '380px',
        whiteSpace: 'normal',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'left',
        whiteSpace: 'normal',
        minWidth: '340px',
        width: '380px',
      },
      formatter: (cell) => {
        if (!cell || cell.length === 0) {
          return (
            <span className='text-success small fw-bold d-inline-flex align-items-center gap-1'>
              <i className='fas fa-check-circle text-success'></i> Aucune anomalie détectée
            </span>
          );
        }
        return (
          <div
            className='cell-wrap-text'
            style={{
              width: '100%',
              maxWidth: '360px',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              textAlign: 'left',
              fontSize: '0.82rem',
              lineHeight: '1.4',
            }}
          >
            {cell.map((anom, idx) => (
              <div
                key={idx}
                className='text-danger fw-semibold mb-1'
                style={{
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                • {anom}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      dataField: 'scoreConfiance',
      text: 'Confiance IA',
      sort: true,
      headerStyle: {
        backgroundColor: '#e2e3e5',
        textAlign: 'center',
        width: '120px',
        minWidth: '120px',
        whiteSpace: 'nowrap',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'center',
        width: '120px',
        minWidth: '120px',
        whiteSpace: 'nowrap',
      },
      formatter: (cell) => {
        if (cell === null || cell === undefined) return '-';
        const num = Math.max(0, Math.min(100, Math.round(Number(cell) || 0)));
        const color = num >= 80 ? 'bg-success' : num >= 50 ? 'bg-warning' : 'bg-danger';
        return (
          <div style={{ width: '85px', margin: '0 auto', textAlign: 'center' }}>
            <span className='fw-bold small d-block mb-1'>{num}%</span>
            <div className='progress' style={{ height: '7px' }}>
              <div
                className={`progress-bar ${color}`}
                role='progressbar'
                style={{ width: `${num}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      dataField: 'action',
      text: 'Action',
      headerStyle: {
        backgroundColor: '#b8daff',
        textAlign: 'center',
        fontWeight: 'bold',
        width: '120px',
        minWidth: '120px',
        whiteSpace: 'nowrap',
      },
      style: {
        verticalAlign: 'middle',
        textAlign: 'center',
        width: '120px',
        minWidth: '120px',
        whiteSpace: 'nowrap',
      },
      formatter: (cell, row) => (
        <button
          className='btn btn-dark btn-sm px-3 py-1 fw-bold shadow-sm text-nowrap'
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
      dataField: 'scoreTotal',
      text: 'Score ⭐',
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
      dataField: 'dateCandidature',
      text: 'Date',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
    },
    {
      dataField: 'cni',
      text: 'Num CNI',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
    },
    {
      dataField: 'dateNaissance',
      text: 'Date Naissance',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
    },
    {
      dataField: 'ville',
      text: 'Ville',
      sort: true,
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
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
              className='btn btn-primary'
              onClick={() => setOpen(!open)}
              aria-controls='example-collapse-text'
              aria-expanded={open}
            >
              <i className='fas fa-filter'></i> Filtrer par :{' '}
            </Button>
          </Container>
        </Row>

        <Row className='text-center'>
          <Col md={12} lg={12} className='mt-2'>
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
            headerTitle='Contrôle Niveau 1 : Audit Automatisé par IA (Tiers de Confiance)'
            endPoint='/admin'
          />

          <Container className='mt-4'>
            {/* BANDEAU PILOTAGE AUDIT IA NIVEAU 1 */}
            <div
              className='bg-white rounded-3 shadow-sm p-4 mb-4 border'
              style={{ borderLeft: '5px solid #0284c7' }}
            >
              <div className='d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom'>
                <div>
                  <h4 className='fw-bold text-primary mb-1 d-flex align-items-center gap-2'>
                    <i className='fas fa-robot text-info fs-3'></i>
                    <span>Pipeline Contrôle 1 : Audit Intelligent par IA</span>
                  </h4>
                  <p className='text-muted small mb-0'>
                    L'IA inspecte les candidatures, détecte les anomalies d'âge, les résidences hors zone, les CNI erronées, les diplômes et notes.
                  </p>
                </div>
                <div className='d-flex flex-wrap gap-2 mt-2 mt-md-0'>
                  <Button
                    variant='primary'
                    className='fw-bold shadow-sm'
                    disabled={aiAuditLoading}
                    onClick={handleBatchAIAudit}
                  >
                    {aiAuditLoading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Audit IA en cours...
                      </>
                    ) : (
                      <>
                        <i className='fas fa-microchip me-2'></i>
                        Lancer l'Audit IA sur Tous les Dossiers
                      </>
                    )}
                  </Button>
                  <Button
                    variant='success'
                    className='fw-bold shadow-sm'
                    disabled={validatingControl1Loading || countConformes === 0}
                    onClick={handleValidateConformesToControl2}
                  >
                    {validatingControl1Loading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Transmission...
                      </>
                    ) : (
                      <>
                        <i className='fas fa-check-double me-2'></i>
                        Transmettre les {countConformes} Conformes vers Contrôle 2
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* ALERTE DOSSIERS EN ATTENTE D'AUDIT */}
              {countEnAttente > 0 && (
                <div className='alert alert-info d-flex flex-wrap align-items-center justify-content-between mb-3 shadow-sm rounded-3'>
                  <div className='d-flex align-items-center gap-2 mb-2 mb-md-0'>
                    <i className='fas fa-info-circle fa-2x text-primary'></i>
                    <div>
                      <div className='fw-bold fs-6'>
                        {countEnAttente} dossier(s) n'ont pas encore été scannés par l'IA !
                      </div>
                      <div className='small text-muted'>
                        Cliquez sur "Lancer l'Audit IA" pour détecter automatiquement les erreurs d'âge, d'adresse/résidence, de CIN et de diplômes.
                      </div>
                    </div>
                  </div>
                  <Button
                    variant='primary'
                    size='sm'
                    className='fw-bold shadow-sm'
                    disabled={aiAuditLoading}
                    onClick={handleBatchAIAudit}
                  >
                    <i className='fas fa-microchip me-1'></i> Scanner les {countEnAttente} Dossiers
                  </Button>
                </div>
              )}

              {/* CARTES KPI AUDIT IA AVEC FILTRES CLIQUABLES */}
              <Row className='g-3 text-center'>
                <Col xs={6} md={countEnAttente > 0 ? true : 3}>
                  <div
                    className={`p-3 rounded-3 border ${filterTab === 'ALL' ? 'bg-primary text-white shadow' : 'bg-light text-dark'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setFilterTab('ALL')}
                  >
                    <div className='fs-3 fw-bold'>{totalCount}</div>
                    <div className='small text-uppercase fw-semibold'>Tous les dossiers</div>
                  </div>
                </Col>
                {countEnAttente > 0 && (
                  <Col xs={6} md={true}>
                    <div
                      className={`p-3 rounded-3 border ${filterTab === 'ATTENTE' ? 'bg-secondary text-white shadow' : 'bg-light text-dark'}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setFilterTab('ATTENTE')}
                    >
                      <div className='fs-3 fw-bold'>{countEnAttente}</div>
                      <div className='small text-uppercase fw-semibold'>⚪ En Attente IA</div>
                    </div>
                  </Col>
                )}
                <Col xs={6} md={countEnAttente > 0 ? true : 3}>
                  <div
                    className={`p-3 rounded-3 border ${filterTab === 'CONFORMES' ? 'bg-success text-white shadow' : 'bg-light text-dark'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setFilterTab('CONFORMES')}
                  >
                    <div className='fs-3 fw-bold'>{countConformes}</div>
                    <div className='small text-uppercase fw-semibold'>🟢 Conformes IA</div>
                  </div>
                </Col>
                <Col xs={6} md={countEnAttente > 0 ? true : 3}>
                  <div
                    className={`p-3 rounded-3 border ${filterTab === 'ANOMALIES' ? 'bg-warning text-dark shadow' : 'bg-light text-dark'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setFilterTab('ANOMALIES')}
                  >
                    <div className='fs-3 fw-bold text-danger'>{countAnomalies}</div>
                    <div className='small text-uppercase fw-semibold'>🟠 Anomalies (À Vérifier)</div>
                  </div>
                </Col>
                <Col xs={6} md={countEnAttente > 0 ? true : 3}>
                  <div
                    className={`p-3 rounded-3 border ${filterTab === 'REJETES' ? 'bg-danger text-white shadow' : 'bg-light text-dark'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setFilterTab('REJETES')}
                  >
                    <div className='fs-3 fw-bold'>{countRejetes}</div>
                    <div className='small text-uppercase fw-semibold'>🔴 Rejetés IA</div>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>

          <Container
            className='mb-4 pt-3 pb-3 font-weight-bold'
            style={{
              backgroundColor: '#fff',
              transition: 'box-shadow 0.25s',
              boxShadow:
                '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
            }}
          >
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

export default ControlleursCandidaturesScreen;
