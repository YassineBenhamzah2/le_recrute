import React from 'react';
import { Menu, MenuItem } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';
import SideBar from './SideBar';

const ControleurSideBar = ({ prenom, nom }) => {
  return (
    <>
      <SideBar>
        <Menu iconShape='circle' popperArrow='false'>
          <MenuItem icon={<i className='fas fa-user-alt fa-2x'></i>}>
            <Link to='/controlleurs/dashboard'>
              {prenom} {nom}
            </Link>
          </MenuItem>
          <br />
          <br />
          <MenuItem icon={<i className='fas fa-tachometer-alt fa-2x'></i>}>
            <Link to='/controlleurs/dashboard'>Tableau de bord</Link>
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
