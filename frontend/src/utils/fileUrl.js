const API_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/+$/, '') : '';

export const getFileUrl = (urlOrName) => {
  if (!urlOrName || urlOrName === 'undefined' || urlOrName === 'null') {
    return API_URL ? `${API_URL}/uploads/Dossier_Candidat_Complet_6_Pages.pdf` : '/uploads/Dossier_Candidat_Complet_6_Pages.pdf';
  }
  const cleanName = String(urlOrName).trim();
  if (cleanName.startsWith('http://') || cleanName.startsWith('https://')) {
    if (cleanName.includes('project-barid-bucket.s3.amazonaws.com/')) {
      const parts = cleanName.split('project-barid-bucket.s3.amazonaws.com/');
      const filename = parts[1] || 'Dossier_Candidat_Complet_6_Pages.pdf';
      return API_URL ? `${API_URL}/uploads/${filename}` : `/uploads/${filename}`;
    }
    return cleanName;
  }
  if (cleanName.startsWith('/uploads/')) {
    return API_URL ? `${API_URL}${cleanName}` : cleanName;
  }
  return API_URL ? `${API_URL}/uploads/${cleanName}` : `/uploads/${cleanName}`;
};

export default getFileUrl;
