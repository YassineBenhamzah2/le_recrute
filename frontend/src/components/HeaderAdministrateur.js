import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../actions/userActions';

const HeaderAdministrateur = ({ headerTitle, headerImage, endPoint }) => {
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin || {});
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
  };

  const userName = userInfo?.prenom && userInfo?.nom ? `${userInfo.prenom} ${userInfo.nom}` : 'Contrôleur';
  const userInitial = userInfo?.prenom ? userInfo.prenom[0].toUpperCase() : 'C';

  return (
    <header className='sticky-top'>
      <Navbar
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          padding: '10px 0',
        }}
        expand='lg'
      >
        <Container fluid className='px-4'>
          <div className='d-flex align-items-center gap-3'>
            {headerImage}
            <div>
              <h5
                style={{
                  color: '#0F172A',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  fontSize: '17px',
                }}
              >
                {headerTitle}
              </h5>
              <div className='d-flex align-items-center gap-2 mt-1'>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    display: 'inline-block',
                  }}
                ></span>
                <small style={{ color: '#64748B', fontSize: '11px', fontWeight: '600' }}>
                  Session Active • Espace Contrôle & Audit
                </small>
              </div>
            </div>
          </div>

          <Nav className='ms-auto d-flex align-items-center gap-2'>
            <div className='d-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border'>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0052FF 0%, #0070F3 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '13px',
                }}
              >
                {userInitial}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                {userName}
              </span>
            </div>

            <NavDropdown
              align='end'
              title={<i className='fas fa-ellipsis-v text-muted px-2 py-1'></i>}
              id='admin-user-menu'
            >
              <LinkContainer to={`${endPoint}/profile`}>
                <NavDropdown.Item className='small py-2'>
                  <i className='far fa-user-circle me-2 text-primary'></i> Mon Profil
                </NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logoutHandler} className='small py-2 text-danger'>
                <i className='fas fa-power-off me-2'></i> Se déconnecter
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default HeaderAdministrateur;
