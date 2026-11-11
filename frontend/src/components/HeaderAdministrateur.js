import React from 'react';
import { Navbar, Container, Nav, NavDropdown, Image } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../actions/userActions';

const HeaderAdministrateur = ({ headerTitle, headerImage, endPoint }) => {
  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <>
      <header>
        <Navbar bg='light' variant='light' expand='lg' collapseOnSelect>
          <Container>
            <LinkContainer to='/'>
              <>
                <Navbar.Brand className='ehc'></Navbar.Brand>
                <Navbar.Brand>
                  {headerImage} {headerTitle}{' '}
                </Navbar.Brand>
              </>
            </LinkContainer>
            <Navbar.Toggle aria-controls='basic-navbar-nav' />
            <Navbar.Collapse id='basic-navbar-nav'>
              <Nav className='me-auto ms-auto ' style={{ textAlign: 'end' }}>
                <NavDropdown title={<i className='fas fa-user-cog fa-3x'></i>}>
                  <LinkContainer to={`${endPoint}/profile`}>
                    <NavDropdown.Item>
                      <i class='far fa-user-circle'></i> Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/'>
                    <NavDropdown.Item onClick={logoutHandler}>
                      <i className='fas fa-power-off'></i> Se déconnecter
                    </NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    </>
  );
};

export default HeaderAdministrateur;
