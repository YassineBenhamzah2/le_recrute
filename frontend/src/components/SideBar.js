import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ProSidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from 'react-pro-sidebar';
import { FiArrowLeftCircle, FiArrowRightCircle } from 'react-icons/fi';

const SideBar = ({ children }) => {
  const [menuCollapse, setMenuCollapse] = useState(false);
  const userLogin = useSelector((state) => state.userLogin || {});
  const { userInfo } = userLogin;

  const menuIconClick = () => {
    menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
  };

  const currentInstitution =
    userInfo?.entreprise?.nom ||
    userInfo?.entrepriseNom ||
    userInfo?.institution ||
    userInfo?.nomEntreprise ||
    'Portail Recrutement';

  return (
    <>
      <ProSidebar
        collapsed={menuCollapse}
        breakPoint='md'
        style={{ height: '100vh', backgroundColor: '#21333e' }}
      >
        <SidebarHeader>
          <div className='logotext mt-3 text-center px-2'>
            <h5 style={{ color: 'wheat', fontSize: '15px', fontWeight: 'bold' }}>
              {menuCollapse ? currentInstitution.substring(0, 3).toUpperCase() : currentInstitution}
            </h5>
            <small style={{ color: '#cbd5e1', fontSize: '11px', display: 'block' }}>
              {userInfo?.isMaitreOuvrage ? 'Espace Recruteur RH' : 'Espace Contrôle'}
            </small>
          </div>
          <div className='closemenu' onClick={menuIconClick}>
            {menuCollapse ? <FiArrowRightCircle /> : <FiArrowLeftCircle />}
          </div>
        </SidebarHeader>
        <SidebarContent>{children}</SidebarContent>
        <SidebarFooter>
          <div style={{ textAlign: 'center', padding: '12px 6px', fontSize: '12px', color: '#94a3b8' }}>
            <i className='fas fa-building me-1'></i>
            <strong>{currentInstitution}</strong>
          </div>
        </SidebarFooter>
      </ProSidebar>
    </>
  );
};

export default SideBar;
