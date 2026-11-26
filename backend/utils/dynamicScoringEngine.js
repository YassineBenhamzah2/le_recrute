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

/**
 * Calcule la note moyenne académique brute (/20) du candidat
 */
export const calculateRawNote = (candidature) => {
  const {
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
    moyenneOFFPT,
  } = candidature;

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
    note = s5 + s6 > 0 ? (s5 + s6) / 2 : mOFPPT;
  }

  if (isNaN(note)) note = 0;
  return Number(note.toFixed(2));
};

/**
 * Moteur de Scoring Dynamique Multi-Entreprises
 * Calcule le score personnalisé d'un candidat selon la grille de l'offre
 *
 * @param {Object} candidature - Données de postulation du candidat
 * @param {Object} user - Données utilisateur (dont dateNaissance)
 * @param {Object} scoringRules - Grille de scoring spécifique à l'Offre
 * @returns {Object} Score détaillé et décomposé
 */
export const calculateDynamicScore = (candidature, user, scoringRules) => {
  // Valeurs par défaut si pas de règles personnalisées
  const rules = scoringRules || {
    maxScore: 100,
    age: { actif: true, poidsMax: 10, tranches: [{ min: 18, max: 28, points: 10 }] },
    note: { actif: true, poidsMax: 40, modeCalcul: 'tranches', tranches: [{ minNote: 12, points: 20 }] },
    mention: { actif: false, poidsMax: 20, points: { tresBien: 20, bien: 15, assezBien: 10, passable: 5 } },
    experience: { actif: true, poidsMax: 30, nomSpecialite: 'Bancaire', pointsParMoisSpecialite: 0.5, pointsParMoisAutre: 0.1, maxMois: 48 },
    diplome: { actif: true, poidsMax: 20, pointsParNiveau: { bac2: 10, bac3: 15, bac5: 20 } },
  };

  const details = [];

  // =========================================================================
  // 1. CRITÈRE ÂGE
  // =========================================================================
  let scoreAge = 0;
  let age = 0;

  if (user?.dateNaissance) {
    const naissance = parseSafeDate(user.dateNaissance);
    if (naissance) {
      age = moment().diff(naissance, 'years', false);
    }
  }

  if (rules.age && rules.age.actif !== false) {
    const poidsMaxAge = Number(rules.age.poidsMax) || 10;
    let matchFound = false;

    if (Array.isArray(rules.age.tranches) && rules.age.tranches.length > 0) {
      for (const t of rules.age.tranches) {
        const tMin = Number(t.min);
        const tMax = Number(t.max);
        const tPts = Number(t.points) || 0;
        if (age >= tMin && age <= tMax) {
          scoreAge = Math.min(tPts, poidsMaxAge);
          details.push(`Âge (${age} ans - Tranche [${tMin}-${tMax} ans]) : +${scoreAge} pts`);
          matchFound = true;
          break;
        }
      }
    }

    if (!matchFound) {
      if (age >= 18 && age <= 24) {
        scoreAge = poidsMaxAge; // 100%
        details.push(`Âge (${age} ans - Jeune Diplômé) : +${scoreAge} pts`);
      } else if (age >= 25 && age <= 28) {
        scoreAge = Number((poidsMaxAge * 0.7).toFixed(2)); // 70%
        details.push(`Âge (${age} ans - Tranche 25-28 ans) : +${scoreAge} pts`);
      } else if (age >= 29 && age <= 35) {
        scoreAge = Number((poidsMaxAge * 0.3).toFixed(2)); // 30%
        details.push(`Âge (${age} ans - Tranche 29-35 ans) : +${scoreAge} pts`);
      } else {
        scoreAge = 0;
        details.push(`Âge (${age} ans - Hors tranches barème) : 0 pt`);
      }
    }
  } else {
    details.push('Critère Âge désactivé pour cette institution');
  }

  // =========================================================================
  // 2. CRITÈRE NOTE / MOYENNE
  // =========================================================================
  let scoreNote = 0;
  const rawNote = calculateRawNote(candidature);

  if (rules.note && rules.note.actif !== false) {
    const poidsMaxNote = Number(rules.note.poidsMax) || 40;

    if (rules.note.modeCalcul === 'proportionnel') {
      scoreNote = Number(((rawNote / 20) * poidsMaxNote).toFixed(2));
      details.push(
        `Moyenne académique (${rawNote}/20 - Proportionnel) : +${scoreNote} pts / ${poidsMaxNote} pts`
      );
    } else if (Array.isArray(rules.note.tranches) && rules.note.tranches.length > 0) {
      const sortedTranches = [...rules.note.tranches].sort(
        (a, b) => Number(b.minNote) - Number(a.minNote)
      );
      let noteMatched = false;
      for (const t of sortedTranches) {
        const minN = Number(t.minNote);
        const pts = Number(t.points) || 0;
        if (rawNote >= minN) {
          scoreNote = Math.min(pts, poidsMaxNote);
          details.push(`Moyenne académique (${rawNote}/20 - Palier >= ${minN}/20) : +${scoreNote} pts`);
          noteMatched = true;
          break;
        }
      }
      if (!noteMatched) {
        scoreNote = 0;
        details.push(`Moyenne académique (${rawNote}/20 - En dessous du palier minimum) : 0 pt`);
      }
    } else {
      if (rawNote >= 16) {
        scoreNote = poidsMaxNote; // 100%
        details.push(`Moyenne académique (${rawNote}/20 - Mention Très Bien) : +${scoreNote} pts`);
      } else if (rawNote >= 14) {
        scoreNote = Number((poidsMaxNote * 0.75).toFixed(2)); // 75%
        details.push(`Moyenne académique (${rawNote}/20 - Mention Bien) : +${scoreNote} pts`);
      } else if (rawNote >= 12) {
        scoreNote = Number((poidsMaxNote * 0.5).toFixed(2)); // 50%
        details.push(`Moyenne académique (${rawNote}/20 - Mention Assez Bien) : +${scoreNote} pts`);
      } else if (rawNote >= 10) {
        scoreNote = Number((poidsMaxNote * 0.25).toFixed(2)); // 25%
        details.push(`Moyenne académique (${rawNote}/20 - Mention Passable) : +${scoreNote} pts`);
      } else {
        scoreNote = 0;
        details.push(`Moyenne académique (${rawNote}/20 - Inférieur à 10/20) : 0 pt`);
      }
    }
  } else {
    details.push('Critère Note désactivé pour cette institution');
  }

  // =========================================================================
  // 3. CRITÈRE MENTION DU DIPLÔME
  // =========================================================================
  let scoreMention = 0;
  if (rules.mention && rules.mention.actif) {
    const mention = (candidature.mention || '').toLowerCase().trim();
    const poidsMaxMention = Number(rules.mention.poidsMax) || 20;
    const ptsConfig = rules.mention.points || {};

    if (mention.includes('très bien') || mention.includes('tres bien')) {
      scoreMention = ptsConfig.tresBien !== undefined ? Number(ptsConfig.tresBien) : poidsMaxMention;
    } else if (mention.includes('bien')) {
      scoreMention = ptsConfig.bien !== undefined ? Number(ptsConfig.bien) : Number((poidsMaxMention * 0.75).toFixed(2));
    } else if (mention.includes('assez bien')) {
      scoreMention = ptsConfig.assezBien !== undefined ? Number(ptsConfig.assezBien) : Number((poidsMaxMention * 0.5).toFixed(2));
    } else if (mention.includes('passable')) {
      scoreMention = ptsConfig.passable !== undefined ? Number(ptsConfig.passable) : Number((poidsMaxMention * 0.25).toFixed(2));
    }

    scoreMention = Math.min(scoreMention, poidsMaxMention);
    details.push(`Mention (${candidature.mention || 'Non spécifiée'}) : +${scoreMention} pts`);
  }

  // =========================================================================
  // 4. CRITÈRE EXPÉRIENCE PROFESSIONNELLE
  // =========================================================================
  let scoreExperience = 0;
  if (rules.experience && rules.experience.actif !== false) {
    const nomSpec = (rules.experience.nomSpecialite || 'bancaire').toLowerCase();
    const maxMois = Number(rules.experience.maxMois) || 48;
    const poidsMaxExp = Number(rules.experience.poidsMax) || 30;

    let moisSpec = 0;
    let moisAutre = 0;

    if (Array.isArray(candidature.experiences)) {
      candidature.experiences.forEach((exp) => {
        if (!exp) return;
        const debut = parseSafeDate(exp.dateDebut);
        const fin = (exp.enPoste || String(exp.dateFin).toLowerCase().includes('aujourd')) ? moment() : parseSafeDate(exp.dateFin);

        if (debut && fin && fin.isAfter(debut)) {
          const duree = parseFloat(fin.diff(debut, 'months', true));
          if (!isNaN(duree) && duree > 0) {
            const domaine = (exp.domaine || '').toLowerCase();
            const posteOuEntr = `${exp.fonctionOccupee || ''} ${exp.entreprise || ''}`.toLowerCase();
            const isSpecialiteDirecte =
              domaine.includes(nomSpec) ||
              domaine.includes('directe') ||
              domaine.includes('spécialité') ||
              domaine.includes('specialite') ||
              (nomSpec.includes('bancaire') && domaine.includes('bancaire')) ||
              posteOuEntr.includes(nomSpec);

            if (isSpecialiteDirecte) {
              moisSpec += duree;
            } else {
              moisAutre += duree;
            }
          }
        }
      });
    }

    const totalAnnees = (moisSpec + moisAutre) / 12;

    if (
      rules.experience.modeCalcul === 'tranches' &&
      Array.isArray(rules.experience.tranches) &&
      rules.experience.tranches.length > 0
    ) {
      let expMatched = false;
      for (const t of rules.experience.tranches) {
        const minAns = Number(t.minAns) || 0;
        const maxAns = t.maxAns !== undefined && !isNaN(Number(t.maxAns)) ? Number(t.maxAns) : 99;
        const pts = Number(t.points) || 0;
        if (totalAnnees >= minAns && totalAnnees <= maxAns) {
          scoreExperience = Math.min(pts, poidsMaxExp);
          details.push(
            `Expérience pro (${totalAnnees.toFixed(1)} ans - Tranche [${minAns}-${maxAns === 99 ? '+' : maxAns} ans]) : +${scoreExperience} pts`
          );
          expMatched = true;
          break;
        }
      }
      if (!expMatched) {
        scoreExperience = 0;
        details.push(`Expérience pro (${totalAnnees.toFixed(1)} ans - Hors tranche) : 0 pt`);
      }
    } else {
      const ptsMoisSpec = Number(rules.experience.pointsParMoisSpecialite) || (poidsMaxExp / maxMois);
      const ptsMoisAutre = Number(rules.experience.pointsParMoisAutre) || (ptsMoisSpec * 0.3);

      const totalMois = Math.min(moisSpec + moisAutre, maxMois);
      const scoreSpec = moisSpec * ptsMoisSpec;
      const scoreAutre = Math.max(0, totalMois - moisSpec) * ptsMoisAutre;

      scoreExperience = Number(Math.min(scoreSpec + scoreAutre, poidsMaxExp).toFixed(2));
      details.push(
        `Expérience pro (${moisSpec.toFixed(0)}m ${rules.experience.nomSpecialite || 'Spécialité'}, ${moisAutre.toFixed(0)}m Autres) : +${scoreExperience} pts / ${poidsMaxExp} pts`
      );
    }
  }

  // =========================================================================
  // 5. CRITÈRE NIVEAU D'ÉTUDES / DIPLÔME
  // =========================================================================
  let scoreDiplome = 0;
  if (rules.diplome && rules.diplome.actif !== false) {
    const niveau = (candidature.niveauEtude || '').toLowerCase();
    const poidsMaxDiplome = Number(rules.diplome.poidsMax) || 20;
    const ppn = rules.diplome.pointsParNiveau || {};

    const bac2Pts = ppn.bac2 !== undefined ? Number(ppn.bac2) : Number((poidsMaxDiplome * 0.5).toFixed(2));
    const bac3Pts = ppn.bac3 !== undefined ? Number(ppn.bac3) : Number((poidsMaxDiplome * 0.75).toFixed(2));
    const bac5Pts = ppn.bac5 !== undefined ? Number(ppn.bac5) : poidsMaxDiplome;
    const docPts = ppn.doctorat !== undefined ? Number(ppn.doctorat) : poidsMaxDiplome;

    if (niveau.includes('doctorat') || niveau.includes('phd')) {
      scoreDiplome = Math.min(docPts, poidsMaxDiplome);
    } else if (niveau.includes('bac+5') || niveau.includes('master') || niveau.includes('ingénieur') || niveau.includes('ingenieur')) {
      scoreDiplome = Math.min(bac5Pts, poidsMaxDiplome);
    } else if (niveau.includes('bac+3') || niveau.includes('licence') || niveau.includes('bachelor')) {
      scoreDiplome = Math.min(bac3Pts, poidsMaxDiplome);
    } else if (niveau.includes('bac+2') || niveau.includes('dut') || niveau.includes('bts') || niveau.includes('ofppt') || niveau.includes('est')) {
      scoreDiplome = Math.min(bac2Pts, poidsMaxDiplome);
    } else if (ppn.autre !== undefined) {
      scoreDiplome = Math.min(Number(ppn.autre), poidsMaxDiplome);
    }

    details.push(`Diplôme (${candidature.niveauEtude}) : +${scoreDiplome} pts / ${poidsMaxDiplome} pts`);
  }

  // =========================================================================
  // SCORE TOTAL
  // =========================================================================
  const maxScore = Number(rules.maxScore) || 100;
  const scoreTotal = Number(
    Math.min(
      maxScore,
      scoreAge + scoreNote + scoreMention + scoreExperience + scoreDiplome
    ).toFixed(2)
  );

  return {
    scoreTotal,
    scoreAge: Number(scoreAge.toFixed(2)),
    scoreNote: Number(scoreNote.toFixed(2)),
    scoreMention: Number(scoreMention.toFixed(2)),
    scoreExperience: Number(scoreExperience.toFixed(2)),
    scoreDiplome: Number(scoreDiplome.toFixed(2)),
    rawNote,
    age,
    details,
  };
};

export default calculateDynamicScore;
