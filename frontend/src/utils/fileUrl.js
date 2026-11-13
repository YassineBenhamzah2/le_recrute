const API_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/+$/, '') : '';

/**
 * Résout l'URL d'un fichier et lui adjoint automatiquement le jeton d'authentification
 * pour l'accès sécurisé aux pièces confidentielles (Coffre-Fort CNDP).
 */
export const getFileUrl = (urlOrName, explicitToken = null) => {
  if (!urlOrName || urlOrName === 'undefined' || urlOrName === 'null') {
    return API_URL ? `${API_URL}/uploads/Dossier_Candidat_Complet_6_Pages.pdf` : '/uploads/Dossier_Candidat_Complet_6_Pages.pdf';
  }

  const cleanName = String(urlOrName).trim();
  let baseTarget = cleanName;

  if (cleanName.startsWith('http://') || cleanName.startsWith('https://')) {
    if (cleanName.includes('project-barid-bucket.s3.amazonaws.com/')) {
      const parts = cleanName.split('project-barid-bucket.s3.amazonaws.com/');
      const filename = parts[1] || 'Dossier_Candidat_Complet_6_Pages.pdf';
      baseTarget = API_URL ? `${API_URL}/uploads/${filename}` : `/uploads/${filename}`;
    } else {
      baseTarget = cleanName;
    }
  } else if (cleanName.startsWith('/uploads/')) {
    baseTarget = API_URL ? `${API_URL}${cleanName}` : cleanName;
  } else {
    baseTarget = API_URL ? `${API_URL}/uploads/${cleanName}` : `/uploads/${cleanName}`;
  }

  // Récupération automatique du token utilisateur pour l'accès aux documents confidentiels
  const activeToken =
    explicitToken ||
    (() => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed?.token || null;
        }
      } catch (e) {
        return null;
      }
      return null;
    })();

  // Si le document réside dans /uploads/ et qu'un token existe, on l'ajoute pour la validation CNDP
  if (activeToken && baseTarget.includes('/uploads/') && !baseTarget.includes('token=')) {
    const separator = baseTarget.includes('?') ? '&' : '?';
    return `${baseTarget}${separator}token=${encodeURIComponent(activeToken)}`;
  }

  return baseTarget;
};

export default getFileUrl;
