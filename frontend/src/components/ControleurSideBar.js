import React from 'react';
import { useSelector } from 'react-redux';
import { Menu, MenuItem } from 'react-pro-sidebar';
import { Link, useLocation } from 'react-router-dom';
import SideBar from './SideBar';

const ControleurSideBar = ({ prenom, nom }) => {
  const location = useLocation();
  const currentPath = location?.pathname || '';

  const userLogin = useSelector((state) => state.userLogin || {});
  const { userInfo } = userLogin;

  const displayName = prenom && nom ? `${prenom} ${nom}` : (userInfo?.prenom && userInfo?.nom ? `${userInfo.prenom} ${userInfo.nom}` : 'Staff Contrôleur');
  const initial = displayName ? displayName[0].toUpperCase() : 'C';

  const isDashboardActive = currentPath === '/controlleurs/dashboard' || currentPath === '/maitre-ouvrage/candidatures';
  const isControl1Active = currentPath.includes('/control1') || currentPath.includes('/candidatures/informations') || currentPath.includes('/candidatures/diplomes') || currentPath.includes('/candidatures/experiences');
  const isControl2Active = currentPath.includes('/control2');
  const isControl3Active = currentPath.includes('/control3');

  return (
    <SideBar>
      {/* CARTE UTILISATEUR AUDITEUR */}
      <div
        style={{
          margin: '14px 14px 10px 14px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {initial}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            className='text-truncate'
            style={{
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: '13px',
              lineHeight: 1.2,
            }}
            title={displayName}
          >
            {displayName}
          </div>
          <div className='d-flex align-items-center gap-1 mt-1'>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981',
                display: 'inline-block',
              }}
            ></span>
            <small style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '500' }}>
              {userInfo?.isMaitreOuvrage ? 'Espace RH' : 'Contrôleur Actif'}
            </small>
          </div>
        </div>
      </div>

      {userInfo?.isMaitreOuvrage && (
        <div style={{ padding: '0 14px', marginBottom: '8px' }}>
          <Link
            to='/maitre-ouvrage/candidatures'
            className='btn btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2'
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#FBBF24',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '6px 12px',
            }}
          >
            <i className='fas fa-arrow-left'></i>
            <span>Retour Espace RH</span>
          </Link>
        </div>
      )}

      <div style={{ height: '6px' }}></div>

      <Menu iconShape='circle'>
        {/* TABLEAU DE BORD */}
        <MenuItem
          active={isDashboardActive}
          icon={<i className='fas fa-tachometer-alt' style={{ fontSize: '15px' }}></i>}
        >
          <Link to={userInfo?.isMaitreOuvrage ? '/maitre-ouvrage/candidatures' : '/controlleurs/dashboard'}>
            Tableau de bord
          </Link>
        </MenuItem>

        {/* CONTRÔLE 1 (AUDIT IA) */}
        <MenuItem
          active={isControl1Active}
          icon={<i className='fas fa-robot' style={{ fontSize: '15px' }}></i>}
        >
          <Link to='/controlleurs/candidatures/control1'>
            Contrôle 1 (Audit IA)
          </Link>
        </MenuItem>

        {/* CONTRÔLE 2 (AUDITEUR EHC) */}
        <MenuItem
          active={isControl2Active}
          icon={<i className='fas fa-user-check' style={{ fontSize: '15px' }}></i>}
        >
          <Link to='/controlleurs/candidatures/control2'>
            Contrôle 2 (Auditeur EHC)
          </Link>
        </MenuItem>

        {/* CONTRÔLE 3 (COMMISSION EHC) */}
        <MenuItem
          active={isControl3Active}
          icon={<i className='fas fa-award' style={{ fontSize: '15px' }}></i>}
        >
          <Link to='/controlleurs/candidatures/control3'>
            Contrôle 3 (Commission)
          </Link>
        </MenuItem>
      </Menu>
    </SideBar>
  );
};

export default ControleurSideBar;
