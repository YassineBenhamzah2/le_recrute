import moment from 'moment';

const DATE_FORMATS = [
  'DD MM YYYY',
  'DD/MM/YYYY',
  'DD-MM-YYYY',
  'DD.MM.YYYY',
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  moment.ISO_8601,
];

const parseSafeDate = (d) => {
  if (!d) return null;
  const str = String(d).trim().toLowerCase();
  if (str.includes('aujourd') || str.includes('ce jour') || str.includes('actuel') || str.includes('poste')) {
    return moment();
  }
  const m = moment(d, DATE_FORMATS);
  return m.isValid() ? m : null;
};

const controleAge = (dateNaissance) => {
  const naissance = parseSafeDate(dateNaissance);
  if (!naissance) return 0;

  const age = moment().diff(naissance, 'years', false);
  let scoreAge = 0;

  if (age < 22) scoreAge = 4;
  else if (age >= 22 && age < 23) scoreAge = 3.5;
  else if (age >= 23 && age < 24) scoreAge = 3;
  else if (age >= 24 && age < 25) scoreAge = 2.5;
  else if (age >= 25 && age < 26) scoreAge = 2;
  else if (age >= 26 && age < 27) scoreAge = 1.5;
  else if (age >= 27 && age < 28) scoreAge = 1;
  else if (age >= 28 && age < 29) scoreAge = 0.5;
  else scoreAge = 0;

  return Number(scoreAge) || 0;
};

const controleNote = (
  methodeNotation,
  niveauEtude,
  annee1,
  annee2,
  annee3,
  semestre1,
  semestre2,
  semestre3,
  semestre4,
  semestre5,
  semestre6,
  moyenneOFFPT
) => {
  const a1 = Number(annee1) || 0;
  const a2 = Number(annee2) || 0;
  const a3 = Number(annee3) || 0;

  const s1 = Number(semestre1) || 0;
  const s2 = Number(semestre2) || 0;
  const s3 = Number(semestre3) || 0;
  const s4 = Number(semestre4) || 0;
  const s5 = Number(semestre5) || 0;
  const s6 = Number(semestre6) || 0;

  const mOFPPT = Number(moyenneOFFPT) || 0;

  let note = 0;

  if (niveauEtude === 'Bac+3' || niveauEtude === 'BAC+3 PRO') {
    if (methodeNotation === 'Annees') {
      note = (a1 + a2 + a3) / 3;
    } else if (methodeNotation === 'Semestres') {
      note = (s1 + s2 + s3 + s4 + s5 + s6) / 6;
    } else {
      note = mOFPPT;
    }
  } else if (niveauEtude === 'Bac+2') {
    if (methodeNotation === 'Annees') {
      note = (a1 + a2) / 2;
    } else if (methodeNotation === 'Semestres') {
      note = (s1 + s2 + s3 + s4) / 4;
    } else {
      note = mOFPPT;
    }
  } else {
    note = (s5 + s6) > 0 ? (s5 + s6) / 2 : mOFPPT;
  }

  if (isNaN(note)) note = 0;

  let scoreNote = 0;
  if (note >= 16) scoreNote = 4;
  else if (note >= 15.5) scoreNote = 3.5;
  else if (note >= 15) scoreNote = 3;
  else if (note >= 14.5) scoreNote = 2.5;
  else if (note >= 14) scoreNote = 2;
  else if (note >= 13.5) scoreNote = 1.5;
  else if (note >= 13) scoreNote = 1;
  else if (note >= 12.5) scoreNote = 0.5;
  else scoreNote = 0;

  return Number(scoreNote) || 0;
};

const controleExperience = (experiences) => {
  let DureeMax = 0;

  if (Array.isArray(experiences)) {
    const expNonBancaire = experiences.filter(
      (exp) => exp && exp.domaine === 'Non bancaire'
    );

    expNonBancaire.forEach((exp) => {
      const debut = parseSafeDate(exp.dateDebut);
      const fin = parseSafeDate(exp.dateFin);

      if (debut && fin && fin.isAfter(debut)) {
        const diffMonths = parseFloat(fin.diff(debut, 'months', true));
        if (!isNaN(diffMonths) && diffMonths > 0) {
          DureeMax += diffMonths;
        }
      }
    });
  }

  let scoreExperience = 0;
  if (DureeMax >= 48) scoreExperience = 3;
  else if (DureeMax > 40) scoreExperience = (3 / 48) * DureeMax;
  else if (DureeMax > 32) scoreExperience = (2.5 / 40) * DureeMax;
  else if (DureeMax > 24) scoreExperience = (2 / 32) * DureeMax;
  else if (DureeMax > 16) scoreExperience = (1.5 / 24) * DureeMax;
  else if (DureeMax > 8) scoreExperience = (1 / 16) * DureeMax;
  else if (DureeMax > 0) scoreExperience = (0.5 / 8) * DureeMax;
  else scoreExperience = 0;

  return Number(scoreExperience.toFixed(2)) || 0;
};

const controleExperienceBancaire = (experiences) => {
  let DureeMax = 0;

  if (Array.isArray(experiences)) {
    const expBancaire = experiences.filter(
      (exp) => exp && exp.domaine === 'Bancaire'
    );

    expBancaire.forEach((exp) => {
      const debut = parseSafeDate(exp.dateDebut);
      const fin = parseSafeDate(exp.dateFin);

      if (debut && fin && fin.isAfter(debut)) {
        const diffMonths = parseFloat(fin.diff(debut, 'months', true));
        if (!isNaN(diffMonths) && diffMonths > 0) {
          DureeMax += diffMonths;
        }
      }
    });
  }

  let scoreExperienceBancaire = 0;
  if (DureeMax >= 48) scoreExperienceBancaire = 3;
  else if (DureeMax > 40) scoreExperienceBancaire = (3 / 48) * DureeMax;
  else if (DureeMax > 32) scoreExperienceBancaire = (2.5 / 40) * DureeMax;
  else if (DureeMax > 24) scoreExperienceBancaire = (2 / 32) * DureeMax;
  else if (DureeMax > 16) scoreExperienceBancaire = (1.5 / 24) * DureeMax;
  else if (DureeMax > 8) scoreExperienceBancaire = (1 / 16) * DureeMax;
  else if (DureeMax > 0) scoreExperienceBancaire = (0.5 / 8) * DureeMax;
  else scoreExperienceBancaire = 0;

  // Calcul combiné
  const totalScore = scoreExperienceBancaire * 2;
  return Number(totalScore.toFixed(2)) || 0;
};

export {
  controleAge,
  controleNote,
  controleExperience,
  controleExperienceBancaire,
};
