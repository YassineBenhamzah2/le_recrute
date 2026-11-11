export const getFileUrl = (urlOrName) => {
  if (!urlOrName || urlOrName === 'undefined' || urlOrName === 'null') {
    return '/uploads/Dossier_Candidat_Complet_6_Pages.pdf';
  }
  const cleanName = String(urlOrName).trim();
  if (cleanName.startsWith('http://') || cleanName.startsWith('https://')) {
    if (cleanName.includes('project-barid-bucket.s3.amazonaws.com/')) {
      const parts = cleanName.split('project-barid-bucket.s3.amazonaws.com/');
      const filename = parts[1] || 'Dossier_Candidat_Complet_6_Pages.pdf';
      return `/uploads/${filename}`;
    }
    return cleanName;
  }
  if (cleanName.startsWith('/uploads/')) {
    return cleanName;
  }
  return `/uploads/${cleanName}`;
};

export default getFileUrl;
