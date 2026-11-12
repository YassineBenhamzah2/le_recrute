import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route Guard RBAC pour isoler hermétiquement les espaces de chaque rôle :
 * - 'admin' : Seuls les administrateurs
 * - 'maitreOuvrage' : Seuls les Responsables RH / Entreprises
 * - 'controleur' : Seuls les Contrôleurs EHC
 * - 'candidat' : Seuls les Candidats
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userLogin = useSelector((state) => state.userLogin || {});
  const { userInfo } = userLogin;
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const isAdmin = !!userInfo.isAdmin;
  const isMaitreOuvrage = !!userInfo.isMaitreOuvrage;
  const isController = !!(userInfo.isController || userInfo.isControleur1 || userInfo.isControleur2);
  const isCandidat = !isAdmin && !isMaitreOuvrage && !isController;

  let isAllowed = false;
  if (allowedRoles.includes('admin') && isAdmin) isAllowed = true;
  if (allowedRoles.includes('maitreOuvrage') && isMaitreOuvrage) isAllowed = true;
  if (allowedRoles.includes('controleur') && (isController || isAdmin)) isAllowed = true;
  if (allowedRoles.includes('candidat') && isCandidat) isAllowed = true;

  if (!isAllowed) {
    // Redirection stricte et immédiate vers l'espace légitime propre à chaque compte :
    if (isMaitreOuvrage) {
      return <Navigate to='/maitre-ouvrage/candidatures' replace />;
    }
    if (isAdmin) {
      return <Navigate to='/admin/dashboard' replace />;
    }
    if (isController) {
      return <Navigate to='/controlleurs/dashboard' replace />;
    }
    return <Navigate to='/profile' replace />;
  }

  return children;
};

export default ProtectedRoute;

