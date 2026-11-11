import React from 'react';
import { Menu, MenuItem } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';
import SideBar from './SideBar';

const AdminSideBar = ({ prenom, nom }) => {
  return (
    <>
      <SideBar>
        <Menu iconShape='circle' popperArrow='false'>
          <MenuItem icon={<i className='fas fa-user-alt fa-2x'></i>}>
            <Link to='/admin/dashboard'>
              {prenom} {nom}
            </Link>
          </MenuItem>
          <br />
          <br />
          <MenuItem icon={<i className='fas fa-tachometer-alt fa-2x'></i>}>
            <Link to='/admin/dashboard'>Tableau de bord</Link>
          </MenuItem>
          <MenuItem icon={<i className='fas fa-users-cog fa-2x'></i>}>
            <Link to='/admin/utilisateurs'>Utilisateurs</Link>
          </MenuItem>
          <MenuItem icon={<i className='fas fa-database fa-2x'></i>}>
            <Link to='/admin/candidatures'>Candidatures</Link>
          </MenuItem>
          <MenuItem icon={<i className='fas fa-user-shield fa-2x'></i>}>
            <Link to='/admin/controlleurs'>Controlleurs</Link>
          </MenuItem>
          <MenuItem icon={<i className='fas fa-building fa-2x'></i>}>
            <Link to='/admin/entreprises'>Entreprises (Multi-Banques)</Link>
          </MenuItem>
          <MenuItem icon={<i className='fas fa-briefcase fa-2x'></i>}>
            <Link to='/maitre-ouvrage/candidatures'>Espace Recruteur (RH)</Link>
          </MenuItem>
          <MenuItem icon={<i className='far fa-clipboard fa-2x'></i>}>
            <Link to='/admin/offres'>Offres (Publier un poste)</Link>
          </MenuItem>
        </Menu>
      </SideBar>
    </>
  );
};

export default AdminSideBar;
