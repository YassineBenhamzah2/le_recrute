import React from 'react';
import { useSelector } from 'react-redux';
import { Menu, MenuItem } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';
import SideBar from './SideBar';

const ControleurSideBar = ({ prenom, nom }) => {
  const userLogin = useSelector((state) => state.userLogin || {});
  const { userInfo } = userLogin;

  return (
    <>
      <SideBar>
        <Menu iconShape='circle' popperArrow='false'>
          <MenuItem icon={<i className='fas fa-user-alt fa-2x'></i>}>
            <Link to={userInfo?.isMaitreOuvrage ? '/maitre-ouvrage/candidatures' : '/controlleurs/dashboard'}>
              {prenom} {nom}
            </Link>
          </MenuItem>
          <br />

          {userInfo?.isMaitreOuvrage && (
            <MenuItem icon={<i className='fas fa-arrow-left fa-2x text-warning'></i>}>
              <Link to='/maitre-ouvrage/candidatures' style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                Retour Espace RH
              </Link>
            </MenuItem>
          )}

          <br />
          <MenuItem icon={<i className='fas fa-tachometer-alt fa-2x'></i>}>
            <Link to={userInfo?.isMaitreOuvrage ? '/maitre-ouvrage/candidatures' : '/controlleurs/dashboard'}>
              {userInfo?.isMaitreOuvrage ? 'Tableau de bord RH' : 'Tableau de bord'}
            </Link>
          </MenuItem>
          <MenuItem icon={<i className='fas fa-database fa-2x'></i>}>
            <Link to='/controlleurs/candidatures/control1'>
              Controle 1 niveau
            </Link>
          </MenuItem>
          <MenuItem icon={<i className='fas fa-database fa-2x'></i>}>
            <Link to='/controlleurs/candidatures/control2'>
              Controle 2 niveau
            </Link>
          </MenuItem>
        </Menu>
      </SideBar>
    </>
  );
};

export default ControleurSideBar;
