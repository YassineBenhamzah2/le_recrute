import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import AdminSideBar from '../../components/AdminSideBar';
import HeaderAdministrateur from '../../components/HeaderAdministrateur';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import ToolkitProvider, {
  Search,
  CSVExport,
} from 'react-bootstrap-table2-toolkit';
import { Col, Collapse, Container, Row } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { Link } from 'react-router-dom';
import { listUsers, updateUser } from '../../actions/userActions';
import Message from '../../components/Message';
import Spinner from '../../components/Spinner';
import { useToasts } from 'react-toast-notifications';
import Button from '@restart/ui/esm/Button';
import { USER_UPDATE_RESET } from '../../constants/userConstants';
import moment from 'moment';

const AdminUtilisateursScreen = () => {
  moment.locale('fr');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const { addToast } = useToasts();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userList = useSelector((state) => state.userList);
  const { users, loading: loadingUsers, error: errorUsers } = userList;

  const userUpdate = useSelector((state) => state.userUpdate);
  const {
    success: successUpdate,
    loading: loadingUpdate,
    error: errorUpdate,
  } = userUpdate;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listUsers());
    } else {
      navigate('/login');
    }
    if (successUpdate) {
      addToast('Modification effectuee avec succes', {
        appearance: 'success',
        autoDismiss: true,
      });
      dispatch({ type: USER_UPDATE_RESET });
    }
  }, [userInfo, dispatch, navigate, addToast, successUpdate]);

  const { SearchBar } = Search;
  const { ExportCSVButton } = CSVExport;

  const data =
    users &&
    users.map((candidat) => ({
      id: candidat._id || '-',
      poste: candidat.poste || '-',
      civilite: candidat.civilite || '-',
      prenom: candidat.prenom || '-',
      nom: candidat.nom || '-',
      cni: candidat.cni || '-',
      dateNaissance: candidat.dateNaissance || '-',
      email: candidat.email || '-',
      phone: candidat.phone || '-',
      isController: candidat.isController,
      isAdmin: candidat.isAdmin,
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
      dataField: 'prenom',
      text: 'Prenom',
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
      text: 'Nom',
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
      text: 'CNI',
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
      dataField: 'dateNaissance',
      text: 'Date de Naissance',
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
      text: 'Numero de telephone',
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
      dataField: 'isController',
      text: 'Profile controlleur',
      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
    },
    {
      dataField: 'isAdmin',
      text: 'Profile administrateur',

      filter: textFilter(),
      headerStyle: {
        backgroundColor: '#d1ecf1',
      },
      editorStyle: {
        backgroundColor: '#e9ecef',
      },
    },
  ];

  const defaultSorted = [
    {
      dataField: 'scoreAge',
      order: 'asc',
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
    console.log(newValue);

    column.dataField === 'isController'
      ? dispatch(
          updateUser(row.id, {
            [column.dataField]: newValue,
          })
        )
      : column.dataField === 'isAdmin'
      ? dispatch(
          updateUser(row.id, {
            [column.dataField]: newValue,
          })
        )
      : dispatch(
          updateUser(row.id, {
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

  return (
    <div id='root'>
      <div className='app'>
        <AdminSideBar prenom={userInfo.prenom} nom={userInfo.nom} />
        <main>
          <HeaderAdministrateur
            headerTitle='Liste des candidatures'
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
            {loadingUsers ? (
              <Spinner size={150} />
            ) : errorUsers ? (
              <Message variant='danger'>{errorUsers}</Message>
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
                                className='btn btn-outline-dark'
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
                          blurToSave: true,
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

export default AdminUtilisateursScreen;
