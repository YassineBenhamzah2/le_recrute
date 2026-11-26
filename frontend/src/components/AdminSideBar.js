import React from 'react';
import { useSelector } from 'react-redux';
import { Menu, MenuItem } from 'react-pro-sidebar';
import { Link, useLocation } from 'react-router-dom';
import SideBar from './SideBar';

const AdminSideBar = ({ prenom, nom }) => {
  const location = useLocation();
  const currentPath = location?.pathname || '';

  const userLogin = useSelector((state) => state.userLogin || {});
  const { userInfo } = userLogin;

  const displayName = prenom && nom ? `${prenom} ${nom}` : (userInfo?.prenom && userInfo?.nom ? `${userInfo.prenom} ${userInfo.nom}` : 'Administrateur');
  const initial = displayName ? displayName[0].toUpperCase() : 'A';

  return (
    <SideBar>
      {/* CARTE UTILISATEUR ADMIN */}
      <div
        className='user-card mx-3 my-3 p-2.5 rounded-3 d-flex align-items-center gap-2.5'
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          className='rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm'
          style={{
            width: '38px',
            height: '38px',
            minWidth: '38px',
            background: 'linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)',
            boxShadow: '0 2px 8px rgba(0, 82, 255, 0.45)',
            fontSize: '15px',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {initial}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            className='fw-bold text-white text-truncate'
            style={{ fontSize: '13px', letterSpacing: '-0.01em', lineHeight: '1.2' }}
            title={displayName}
          >
            {displayName}
          </div>
          <div className='d-flex align-items-center gap-1.5 mt-1'>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981',
                display: 'inline-block',
              }}
            ></span>
            <small style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>
              Administrateur Global
            </small>
          </div>
        </div>
      </div>

      <div
        className='px-3 pt-2 pb-1 text-uppercase'
        style={{
          color: '#64748B',
          fontSize: '10.5px',
          fontWeight: '800',
          letterSpacing: '0.08em',
        }}
      >
        Administration
      </div>

      <Menu iconShape='circle'>
        <MenuItem
          active={currentPath === '/admin/dashboard'}
          icon={<i className='fas fa-th-large' style={{ fontSize: '15px', color: currentPath === '/admin/dashboard' ? '#FFFFFF' : '#38BDF8' }}></i>}
        >
          <Link to='/admin/dashboard'>Tableau de bord</Link>
        </MenuItem>

        <MenuItem
          active={currentPath.includes('/admin/utilisateurs')}
          icon={<i className='fas fa-users-cog' style={{ fontSize: '15px', color: currentPath.includes('/admin/utilisateurs') ? '#FFFFFF' : '#818CF8' }}></i>}
        >
          <Link to='/admin/utilisateurs'>Utilisateurs</Link>
        </MenuItem>

        <MenuItem
          active={currentPath.includes('/admin/candidatures')}
          icon={<i className='fas fa-database' style={{ fontSize: '15px', color: currentPath.includes('/admin/candidatures') ? '#FFFFFF' : '#34D399' }}></i>}
        >
          <Link to='/admin/candidatures'>Candidatures</Link>
        </MenuItem>

        <MenuItem
          active={currentPath.includes('/admin/controlleurs')}
          icon={<i className='fas fa-user-shield' style={{ fontSize: '15px', color: currentPath.includes('/admin/controlleurs') ? '#FFFFFF' : '#FBBF24' }}></i>}
        >
          <Link to='/admin/controlleurs'>Contrôleurs</Link>
        </MenuItem>

        <MenuItem
          active={currentPath.includes('/admin/entreprises')}
          icon={<i className='fas fa-building' style={{ fontSize: '15px', color: currentPath.includes('/admin/entreprises') ? '#FFFFFF' : '#F472B6' }}></i>}
        >
          <Link to='/admin/entreprises'>Banques Partenaires</Link>
        </MenuItem>

        <MenuItem
          active={currentPath.includes('/maitre-ouvrage')}
          icon={<i className='fas fa-briefcase' style={{ fontSize: '15px', color: currentPath.includes('/maitre-ouvrage') ? '#FFFFFF' : '#60A5FA' }}></i>}
        >
          <Link to='/maitre-ouvrage/candidatures'>Espace Recruteur (RH)</Link>
        </MenuItem>

        <MenuItem
          active={currentPath.includes('/admin/offres')}
          icon={<i className='fas fa-bullhorn' style={{ fontSize: '15px', color: currentPath.includes('/admin/offres') ? '#FFFFFF' : '#A78BFA' }}></i>}
        >
          <Link to='/admin/offres'>Offres de Recrutement</Link>
        </MenuItem>
      </Menu>
    </SideBar>
  );
};

export default AdminSideBar;
