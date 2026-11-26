import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ProSidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from 'react-pro-sidebar';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const SideBar = ({ children }) => {
  const [menuCollapse, setMenuCollapse] = useState(false);
  const userLogin = useSelector((state) => state.userLogin || {});
  const { userInfo } = userLogin;

  const menuIconClick = () => {
    setMenuCollapse(!menuCollapse);
  };

  const currentInstitution =
    userInfo?.entreprise?.nom ||
    userInfo?.entrepriseNom ||
    userInfo?.institution ||
    userInfo?.nomEntreprise ||
    'PORTAIL RECRUTEMENT';

  return (
    <ProSidebar
      width='280px'
      collapsedWidth='80px'
      collapsed={menuCollapse}
      breakPoint='md'
      style={{ height: '100vh' }}
    >
      <SidebarHeader>
        <div style={{ padding: '20px 16px 16px 18px', position: 'relative' }}>
          {!menuCollapse ? (
            <div>
              <div
                style={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {currentInstitution}
              </div>
              <div
                style={{
                  color: '#38BDF8',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '3px',
                }}
              >
                {userInfo?.isMaitreOuvrage ? 'Espace Recruteur RH' : 'Espace Contrôle'}
              </div>
            </div>
          ) : (
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '800',
                textAlign: 'center',
              }}
            >
              PR
            </div>
          )}

          <div
            className='closemenu'
            onClick={menuIconClick}
            title={menuCollapse ? 'Développer' : 'Réduire'}
          >
            {menuCollapse ? <FiChevronRight /> : <FiChevronLeft />}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>{children}</SidebarContent>

      <SidebarFooter>
        <div
          style={{
            textAlign: 'center',
            padding: '12px 10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {!menuCollapse ? (
            <div className='d-flex align-items-center justify-content-center gap-1.5'>
              <i className='fas fa-shield-alt text-primary' style={{ fontSize: '12px' }}></i>
              <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>
                Portail Certifié & Sécurisé
              </span>
            </div>
          ) : (
            <i className='fas fa-shield-alt text-primary' style={{ fontSize: '14px' }}></i>
          )}
        </div>
      </SidebarFooter>
    </ProSidebar>
  );
};

export default SideBar;
