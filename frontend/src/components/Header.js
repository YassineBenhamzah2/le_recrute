import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../actions/userActions';
import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/');
  };

  const getInitials = (user) => {
    if (!user) return 'C';
    const first = (user.prenom || '').charAt(0).toUpperCase();
    const last = (user.nom || '').charAt(0).toUpperCase();
    return `${first}${last}` || 'C';
  };

  return (
    <header className='app-global-navbar'>
      <div className='app-navbar-container'>
        {/* BRAND LOGO */}
        <Link to='/' className='app-brand'>
          <img
            src='/assets/images/ehc.png'
            alt='EHC'
            style={{ height: '34px', objectFit: 'contain' }}
          />
          <div className='app-brand-text' style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '10px' }}>
            <div className='app-brand-title'>
              Recrutement<span>.ma</span>
            </div>
            <div className='app-brand-sub'>Portail National des Concours</div>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className='app-nav-menu'>
          <Link to='/' className='app-nav-item'>
            <i className='fas fa-briefcase app-nav-item-icon'></i>
            <span>Offres & Concours</span>
          </Link>
          <a href='/#simulateur' className='app-nav-item'>
            <i className='fas fa-calculator app-nav-item-icon'></i>
            <span>Simulateur Barème</span>
          </a>
          <Link to='/verification' className='app-nav-item'>
            <i className='fas fa-shield-alt app-nav-item-icon'></i>
            <span>Vérification Récépissé</span>
          </Link>
          <Link to='/about-us' className='app-nav-item'>
            <i className='fas fa-info-circle app-nav-item-icon'></i>
            <span>À Propos</span>
          </Link>
        </nav>

        {/* ACTIONS / PROFILE */}
        <div className='app-nav-actions'>
          {userInfo ? (
            <>
              {userInfo.isMaitreOuvrage ? (
                <>
                  <Link
                    to='/maitre-ouvrage/candidatures'
                    className='app-user-pill'
                    title='Mon Espace Recruteur'
                    style={{ borderColor: '#BFDBFE', background: '#EFF6FF' }}
                  >
                    <div className='app-user-avatar' style={{ background: '#1D4ED8', color: '#FFFFFF' }}>
                      {getInitials(userInfo)}
                    </div>
                    <div className='app-user-info'>
                      <span className='app-user-name' style={{ color: '#1E3A8A' }}>
                        {userInfo.prenom} {userInfo.nom}
                      </span>
                      <span className='app-user-role' style={{ color: '#2563EB' }}>
                        <i className='fas fa-briefcase me-1'></i>Responsable Recrutement
                      </span>
                    </div>
                  </Link>

                  <Link
                    to='/maitre-ouvrage/candidatures'
                    className='btn btn-sm btn-primary fw-bold ms-2 me-1'
                    style={{ borderRadius: '8px', padding: '7px 14px', background: '#1D4ED8', border: 'none' }}
                  >
                    <i className='fas fa-plus-circle me-1'></i> + Publier Offre
                  </Link>
                </>
              ) : userInfo.isAdmin ? (
                <>
                  <Link
                    to='/admin/dashboard'
                    className='app-user-pill'
                    title='Panneau Administration'
                    style={{ borderColor: '#CBD5E1', background: '#F1F5F9' }}
                  >
                    <div className='app-user-avatar' style={{ background: '#0F172A', color: '#FFFFFF' }}>
                      {getInitials(userInfo)}
                    </div>
                    <div className='app-user-info'>
                      <span className='app-user-name'>
                        {userInfo.prenom} {userInfo.nom}
                      </span>
                      <span className='app-user-role text-danger'>
                        <i className='fas fa-shield-alt me-1'></i>Super-Admin EHC
                      </span>
                    </div>
                  </Link>
                  <Link
                    to='/admin/dashboard'
                    className='btn btn-sm btn-outline-dark fw-bold ms-2 me-1'
                    style={{ borderRadius: '8px', padding: '6px 12px' }}
                  >
                    <i className='fas fa-cogs me-1'></i> Admin
                  </Link>
                </>
              ) : userInfo.isController ? (
                <Link
                  to='/controlleurs/dashboard'
                  className='app-user-pill'
                  title='Espace Commission Contrôle'
                  style={{ borderColor: '#FDE68A', background: '#FFFBEB' }}
                >
                  <div className='app-user-avatar' style={{ background: '#D97706', color: '#FFFFFF' }}>
                    {getInitials(userInfo)}
                  </div>
                  <div className='app-user-info'>
                    <span className='app-user-name'>
                      {userInfo.prenom} {userInfo.nom}
                    </span>
                    <span className='app-user-role' style={{ color: '#B45309' }}>
                      <i className='fas fa-tasks me-1'></i>Commission Contrôle
                    </span>
                  </div>
                </Link>
              ) : (
                <Link to='/profile' className='app-user-pill' title='Mon Espace Candidat'>
                  <div className='app-user-avatar'>
                    {getInitials(userInfo)}
                  </div>
                  <div className='app-user-info'>
                    <span className='app-user-name'>
                      {userInfo.prenom} {userInfo.nom}
                    </span>
                    <span className='app-user-role'>
                      <i className='fas fa-check-circle me-1'></i>Candidat Enregistré
                    </span>
                  </div>
                </Link>
              )}

              <button
                onClick={logoutHandler}
                className='app-btn-logout ms-1'
                title='Déconnexion'
              >
                <i className='fas fa-sign-out-alt'></i>
              </button>
            </>
          ) : (
            <>
              <Link to='/login' className='app-btn-login'>
                <i className='fas fa-sign-in-alt me-1'></i> Se Connecter
              </Link>
              <Link to='/register' className='app-btn-register'>
                <i className='fas fa-user-plus me-1'></i> Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
