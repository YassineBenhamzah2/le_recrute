import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { extractTextFromPDF, normalizePdfText } from '../utils/pdfTextExtractor.js';

/**
 * Service d'Audit Intelligent Avancé (IA Contrôle Niveau 1)
 * Vérification croisée exhaustive et anti-fraude entre les déclarations du candidat et les pièces justificatives :
 * - CNI Recto & CNI Verso (Numéro, Nom/Prénom, Date et Lieu de naissance, Adresse au Verso)
 * - Diplôme / Attestation (Titulaire, Année d'obtention vs Année déclarée, Intitulé/Filière, Établissement/Université)
 * - Relevés de notes et mentions
 * - Détection du recyclage / doublon documentaire (fichiers identiques)
 */
export const executeAIAudit = async (candidature, user, offre) => {
  const anomalies = [];
  const verifications = {};
  let scoreConfiance = 100;
  let isEliminatoire = false;

  const candUser = user || candidature.user || {};
  const candOffre = offre || candidature.offre || {};

  // Helpers de nettoyage et normalisation
  const cleanStr = (s) => (s ? normalizePdfText(String(s)) : '');
  const escapeReg = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  const candNom = cleanStr(candUser.nom || candidature.nom);
  const candPrenom = cleanStr(candUser.prenom || candidature.prenom);
  const fullName = `${candUser.prenom || candidature.prenom || ''} ${candUser.nom || candidature.nom || ''}`.trim();

  // 1. CONTRÔLE DE L'ÂGE & DATE DE NAISSANCE
  const rawBirth = candUser.dateNaissance || candidature.dateNaissance;
  let birthYear = '';
  let birthFormats = [];

  if (!rawBirth) {
    anomalies.push("Date de naissance manquante dans le dossier.");
    scoreConfiance -= 25;
    verifications.age = { status: 'ERROR', message: 'Date de naissance non renseignée' };
  } else {
    const cleanBirthStr = typeof rawBirth === 'string'
      ? rawBirth.replace(/\./g, '/').replace(/-/g, '/')
      : rawBirth;
    const birthMoment = moment(cleanBirthStr, ['DD/MM/YYYY', 'YYYY/MM/DD', 'DD-MM-YYYY', 'YYYY-MM-DD'], true);
    const validBirth = birthMoment.isValid() ? birthMoment : moment(rawBirth);

    if (!validBirth.isValid()) {
      anomalies.push(`Format de date de naissance invalide : ${rawBirth}`);
      scoreConfiance -= 20;
      verifications.age = { status: 'WARNING', message: 'Format de date suspect' };
    } else {
      birthYear = validBirth.format('YYYY');
      const moisFrancais = [
        'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
      ];
      const jour = validBirth.format('D');
      const jourPadded = validBirth.format('DD');
      const moisNom = moisFrancais[validBirth.month()] || '';

      birthFormats = [
        validBirth.format('DD/MM/YYYY'),
        validBirth.format('DD-MM-YYYY'),
        validBirth.format('DD.MM.YYYY'),
        validBirth.format('YYYY-MM-DD'),
        `${jour} ${moisNom} ${birthYear}`,
        `${jourPadded} ${moisNom} ${birthYear}`,
        birthYear,
      ];

      const age = moment().diff(validBirth, 'years', true);
      const minAge = 18;
      const maxAge =
        candOffre.scoringRules?.age?.tranches?.length > 0
          ? Math.max(...candOffre.scoringRules.age.tranches.map((t) => t.max))
          : 45;

      if (age < minAge) {
        anomalies.push(`Candidat mineur (${Math.floor(age)} ans). L'âge minimum légal est de 18 ans.`);
        isEliminatoire = true;
        scoreConfiance -= 40;
        verifications.age = { status: 'REJECT', age: Math.floor(age), message: 'Candidat mineur' };
      } else if (age > maxAge + 1) {
        anomalies.push(`Dépassement de l'âge limite : ${Math.floor(age)} ans (Limite maximale : ${maxAge} ans).`);
        isEliminatoire = true;
        scoreConfiance -= 35;
        verifications.age = { status: 'REJECT', age: Math.floor(age), maxAge, message: 'Âge limite dépassé' };
      } else {
        verifications.age = { status: 'VALID', age: Math.floor(age), message: `Âge conforme (${Math.floor(age)} ans)` };
      }
    }
  }

  // 2. CONTRÔLE DE LA CNI (FORMAT & PRÉSENCE DU NUMÉRO)
  const cniNum = String(candUser.cni || candidature.cni || '').trim().toUpperCase();
  const cniRegex = /^[A-Z]{1,3}[0-9]{4,8}$/;
  if (!cniNum) {
    anomalies.push("Numéro de Carte Nationale d'Identité (CNI) non renseigné.");
    isEliminatoire = true;
    scoreConfiance -= 30;
    verifications.cni = { status: 'REJECT', message: 'CNI manquante' };
  } else if (!cniRegex.test(cniNum)) {
    anomalies.push(`Numéro CNI inhabituel ou mal formaté : "${cniNum}".`);
    scoreConfiance -= 15;
    verifications.cni = { status: 'WARNING', cni: cniNum, message: 'Format CNI à vérifier par le contrôleur' };
  } else {
    verifications.cni = { status: 'VALID', cni: cniNum, message: 'Format CNI standard conforme' };
  }

  // 3. CONTRÔLE DE L'ADRESSE DÉCLARÉE & VILLE
  const declaredVille = cleanStr(candUser.ville || candidature.ville);
  const declaredAdresse = cleanStr(candUser.adresse || candidature.adresse);
  const hasCertifResidence = Boolean(candUser.residence || candidature.residence);

  if (!declaredVille || !declaredAdresse) {
    anomalies.push("Coordonnées de résidence incomplètes (Ville ou Adresse manquante).");
    scoreConfiance -= 15;
    verifications.adresse = { status: 'WARNING', message: 'Adresse déclarée incomplète' };
  } else {
    const offreVille = cleanStr(candOffre.ville);
    const isRegionalTarget = offreVille && !offreVille.includes('national') && !offreVille.includes('tout');

    if (isRegionalTarget && !offreVille.includes(declaredVille) && !hasCertifResidence) {
      anomalies.push(
        `Résidence déclarée (${candUser.ville || candidature.ville}) différente de la zone du concours (${candOffre.ville}) sans certificat de résidence joint.`
      );
      scoreConfiance -= 20;
      verifications.adresse = { status: 'WARNING', message: 'Certificat de résidence requis' };
    } else {
      verifications.adresse = { status: 'VALID', ville: candUser.ville || candidature.ville, message: 'Résidence déclarée conforme' };
    }
  }

  // 4. CONTRÔLE DU NIVEAU D'ÉTUDES VS PRÉREQUIS OFFRE
  const getLevelWeight = (str) => {
    if (!str) return 0;
    const s = cleanStr(str);
    if (s.includes('bac+5') || s.includes('master') || s.includes('ingenieur')) return 5;
    if (s.includes('bac+3') || s.includes('licence') || s.includes('bachelor')) return 3;
    if (s.includes('bac+2') || s.includes('ts') || s.includes('bts') || s.includes('dut') || s.includes('dts') || s.includes('deug')) return 2;
    if (s.includes('bac')) return 1;
    return 0;
  };

  const candLvl = getLevelWeight(candidature.niveauEtude);
  const reqLvl = getLevelWeight(candOffre.niveau || candOffre.profil);

  if (reqLvl > 0 && candLvl < reqLvl) {
    anomalies.push(
      `Niveau académique insuffisant : Candidat déclare ${candidature.niveauEtude || 'non renseigné'} alors que l'offre exige ${candOffre.niveau}.`
    );
    isEliminatoire = true;
    scoreConfiance -= 40;
    verifications.diplome = { status: 'REJECT', message: 'Niveau d’études inférieur au prérequis' };
  } else {
    verifications.diplome = {
      status: 'VALID',
      niveau: candidature.niveauEtude || 'Conforme',
      message: 'Niveau académique conforme aux critères',
    };
  }

  // 5. CONTRÔLE DES NOTES DÉCLARÉES
  const notes = [
    candidature.semestre1,
    candidature.semestre2,
    candidature.semestre3,
    candidature.semestre4,
    candidature.semestre5,
    candidature.semestre6,
    candidature.annee1,
    candidature.annee2,
    candidature.annee3,
    candidature.moyenneOFFPT,
  ].filter((n) => typeof n === 'number' && n > 0);

  const notesSuspectes = notes.filter((n) => n > 20 || n < 10);
  if (notesSuspectes.length > 0) {
    anomalies.push(`Notes déclarées hors barème standard [10.00 - 20.00] : ${notesSuspectes.join(', ')}.`);
    scoreConfiance -= 20;
    verifications.notes = { status: 'WARNING', message: 'Notes suspectes à vérifier' };
  } else {
    verifications.notes = { status: 'VALID', message: 'Notes et moyennes cohérentes' };
  }

  // 6. GESTION DES CHEMINS DES PIÈCES TÉLÉVERSÉES
  const resolveDocPath = (cleanFileName) => {
    if (!cleanFileName) return '';
    const candidates = [
      path.join(process.cwd(), 'uploads', cleanFileName),
      path.join(process.cwd(), 'backend', 'uploads', cleanFileName),
      path.join(process.cwd(), 'recrutement-ccp-main', 'backend', 'uploads', cleanFileName),
      path.join(process.cwd(), 'recrutement-ccp-main', 'uploads', cleanFileName),
      path.join(process.cwd(), cleanFileName),
      path.join(path.resolve(), 'uploads', cleanFileName),
      path.join(path.resolve(), 'backend', 'uploads', cleanFileName),
      path.join(path.resolve(), '..', 'uploads', cleanFileName),
      path.join(path.resolve(), '..', 'backend', 'uploads', cleanFileName),
      path.join(path.resolve(), '..', 'recrutement-ccp-main', 'backend', 'uploads', cleanFileName),
    ];
    return candidates.find((p) => fs.existsSync(p)) || candidates[0];
  };

  const getCleanBase = (f) => (f ? path.basename(f).split('?')[0] : '');

  const cniRectoFile = candidature.copieCNI || candUser.copieCNI || null;
  const cniVersoFile = candidature.copieCNIVerso || candUser.copieCNIVerso || null;
  const diplomeFile = candidature.copieDiplomes || null;
  const relevesFile = candidature.releves || null;
  const residenceFile = candidature.residence || candUser.residence || null;
  const attestationsFile = candidature.attestationsTravail || null;

  const cniRectoBase = getCleanBase(cniRectoFile);
  const cniVersoBase = getCleanBase(cniVersoFile);
  const diplomeBase = getCleanBase(diplomeFile);
  const relevesBase = getCleanBase(relevesFile);
  const residenceBase = getCleanBase(residenceFile);

  // 7. CONTRÔLE DE PRÉSENCE STRICTE CNI RECTO & VERSO
  if (!cniRectoFile) {
    anomalies.push("Pièce justificative obligatoire manquante : Carte Nationale d'Identité (Recto).");
    isEliminatoire = true;
    scoreConfiance -= 30;
    verifications.cniRecto = { status: 'REJECT', message: 'CNI Recto manquante' };
  }

  if (!cniVersoFile) {
    // Si cniRecto est présent mais pas le verso : exigence légale
    anomalies.push("Pièce justificative obligatoire manquante : Carte Nationale d'Identité (Verso avec adresse).");
    isEliminatoire = true;
    scoreConfiance -= 25;
    verifications.cniVerso = { status: 'REJECT', message: 'CNI Verso manquante' };
  }

  if (!diplomeFile) {
    anomalies.push("Pièce justificative obligatoire manquante : Diplôme / Attestation.");
    isEliminatoire = true;
    scoreConfiance -= 30;
    verifications.diplomeDoc = { status: 'REJECT', message: 'Copie du Diplôme manquante' };
  }

  if (!relevesFile) {
    anomalies.push("Pièce justificative obligatoire manquante : Relevés de notes globaux.");
    isEliminatoire = true;
    scoreConfiance -= 25;
    verifications.relevesDoc = { status: 'REJECT', message: 'Relevés de notes manquants' };
  }

  // 8. DÉTECTION ANTI-FRAUDE : CLONAGE / DOUBLONS DE FICHIERS (MÊME NOM OU MÊME CONTENU BINAIRE)
  const uploadedFilesList = [
    { label: 'CNI Recto', base: cniRectoBase },
    { label: 'CNI Verso', base: cniVersoBase },
    { label: 'Diplôme', base: diplomeBase },
    { label: 'Relevés de notes', base: relevesBase },
  ].filter((item) => Boolean(item.base));

  for (let i = 0; i < uploadedFilesList.length; i++) {
    for (let j = i + 1; j < uploadedFilesList.length; j++) {
      const docA = uploadedFilesList[i];
      const docB = uploadedFilesList[j];

      // Même nom de fichier
      if (docA.base.toLowerCase() === docB.base.toLowerCase()) {
        const isCriticalPair =
          (docA.label.includes('CNI') && docB.label.includes('Diplôme')) ||
          (docA.label.includes('CNI') && docB.label.includes('Relevés')) ||
          (docA.label.includes('Recto') && docB.label.includes('Verso'));

        anomalies.push(
          `🚨 Fraude / Doublon documentaire : Le même fichier ("${docA.base}") a été téléversé à la fois pour ${docA.label} et pour ${docB.label}.`
        );
        isEliminatoire = true;
        scoreConfiance -= isCriticalPair ? 50 : 25;
      } else {
        // Noms différents mais même contenu binaire (renommage frauduleux)
        try {
          const pathA = resolveDocPath(docA.base);
          const pathB = resolveDocPath(docB.base);
          if (fs.existsSync(pathA) && fs.existsSync(pathB)) {
            const statA = fs.statSync(pathA);
            const statB = fs.statSync(pathB);
            if (statA.size === statB.size && statA.size > 2000) {
              const bufA = fs.readFileSync(pathA);
              const bufB = fs.readFileSync(pathB);
              if (bufA.equals(bufB)) {
                anomalies.push(
                  `🚨 Fraude / Fichiers identiques : Le document ${docA.label} et ${docB.label} contiennent exactement le même contenu binaire sous des noms différents.`
                );
                isEliminatoire = true;
                scoreConfiance -= 50;
              }
            }
          }
        } catch (eBinary) {
          // Ignorer
        }
      }
    }
  }

  // 9. EXTRACTION DE TEXTE DES DOCUMENTS PDF
  const readDocText = (baseName) => {
    if (!baseName) return '';
    try {
      const p = resolveDocPath(baseName);
      if (!fs.existsSync(p)) return '';
      if (!baseName.toLowerCase().endsWith('.pdf')) return '';
      const rawText = extractTextFromPDF(p);
      return normalizePdfText(rawText);
    } catch (e) {
      return '';
    }
  };

  const textCNIRecto = readDocText(cniRectoBase);
  const textCNIVerso = readDocText(cniVersoBase);
  const textDiplome = readDocText(diplomeBase);
  const textReleves = readDocText(relevesBase);
  const textResidence = readDocText(residenceBase);

  // Mots-clés de documents frauduleux ou hors-sujet
  const suspiciousKeywords = [
    'rental contract', 'rent a car', 'rentacar', 'contrat de location',
    'loueur', 'vehicule de location', 'quittance de loyer', 'facture d electricite',
  ];

  const checkSuspiciousDoc = (text, docLabel) => {
    if (!text || text.length < 20) return;
    const found = suspiciousKeywords.find((kw) => text.includes(kw));
    if (found) {
      anomalies.push(
        `🚨 Document hors-sujet / suspect pour ${docLabel} : Le document PDF semble être une pièce commerciale ("${found}") et non une pièce officielle requise.`
      );
      isEliminatoire = true;
      scoreConfiance -= 45;
    }
  };

  checkSuspiciousDoc(textCNIRecto, 'CNI Recto');
  checkSuspiciousDoc(textCNIVerso, 'CNI Verso');
  checkSuspiciousDoc(textDiplome, 'Diplôme');
  checkSuspiciousDoc(textReleves, 'Relevés de notes');

  // 10. VÉRIFICATION CROISÉE CNI RECTO & VERSO VS DÉCLARATION DU CANDIDAT
  const combinedCNIText = `${textCNIRecto} ${textCNIVerso}`.trim();

  if (combinedCNIText.length > 25) {
    // A. Vérification du numéro de CNI
    if (cniNum) {
      const cniClean = cleanStr(cniNum);
      const hasCniInDoc = combinedCNIText.includes(cniClean);
      if (!hasCniInDoc) {
        anomalies.push(
          `⚠️ Numéro CNI ("${cniNum}") introuvable ou illisible dans les documents CNI (vérifier si la pièce est floue ou rognée).`
        );
        scoreConfiance -= 20;
      }
    }

    // B. Vérification du Nom et Prénom du titulaire
    if (candNom && candPrenom) {
      const hasNom = candNom.length >= 2 && new RegExp(`\\b${escapeReg(candNom)}\\b`, 'i').test(combinedCNIText);
      const hasPrenom = candPrenom.length >= 2 && new RegExp(`\\b${escapeReg(candPrenom)}\\b`, 'i').test(combinedCNIText);

      if (!hasNom && !hasPrenom) {
        anomalies.push(
          `🚨 Discordance d'identité CNI : Le nom "${fullName}" n'apparaît pas dans la pièce CNI téléversée (document d'un tiers ou illisible).`
        );
        isEliminatoire = true;
        scoreConfiance -= 45;
        verifications.cniIdentite = { status: 'REJECT', message: 'Nom et prénom introuvables sur la CNI' };
      } else {
        verifications.cniIdentite = { status: 'VALID', message: 'Identité vérifiée conforme sur la CNI' };
      }
    }

    // C. Vérification de la date de naissance dans la CNI
    if (birthFormats.length > 0) {
      const hasBirthInDoc = birthFormats.some((fmt) => combinedCNIText.includes(cleanStr(fmt)));
      const hasBirthKeywords =
        combinedCNIText.includes('naissance') ||
        combinedCNIText.includes('ne le') ||
        combinedCNIText.includes('nee le') ||
        combinedCNIText.includes('date');

      if (!hasBirthInDoc && !hasBirthKeywords) {
        anomalies.push(
          `⚠️ Date de naissance déclarée introuvable dans la CNI (pièce mal cadrée ou date masquée).`
        );
        scoreConfiance -= 15;
      }
    }

    // D. Vérification du lieu de naissance
    const lieuNaissance = cleanStr(candUser.lieuNaissance || candidature.lieuNaissance);
    if (lieuNaissance && lieuNaissance.length >= 3) {
      const hasLieu = combinedCNIText.includes(lieuNaissance);
      verifications.lieuNaissanceDoc = {
        status: hasLieu ? 'VALID' : 'INFO',
        message: hasLieu ? 'Lieu de naissance attesté sur la CNI' : 'Lieu de naissance non détecté sur la CNI',
      };
    }

    // E. VÉRIFICATION CROISÉE DE L'ADRESSE ET VILLE SUR LE VERSO DE LA CNI
    const versoAndResText = `${textCNIVerso} ${textResidence}`.trim();

    if (textCNIVerso.length > 20 || textResidence.length > 20) {
      // Mots significatifs de l'adresse déclarée
      const stopwords = [
        'rue', 'av', 'avenue', 'boulevard', 'bd', 'lot', 'lotissement', 'n°', 'num',
        'numero', 'immeuble', 'imm', 'residence', 'res', 'quartier', 'hay', 'maroc', 'et', 'de', 'du'
      ];
      const adresseMots = declaredAdresse
        .split(/[\s,.'\-\/]+/)
        .filter((w) => w.length >= 4 && !stopwords.includes(w));

      const hasVilleInVerso = declaredVille.length >= 3 && versoAndResText.includes(declaredVille);
      const hasAdresseMotInVerso = adresseMots.some((mot) => versoAndResText.includes(mot));

      if (hasVilleInVerso || hasAdresseMotInVerso) {
        verifications.adresseDoc = {
          status: 'VALID',
          message: `Adresse / Ville ("${candUser.ville || candUser.adresse}") confirmée sur le verso de la CNI ou justificatif`,
        };
      } else if (declaredVille && !hasCertifResidence) {
        anomalies.push(
          `🚨 Incohérence d'adresse : L'adresse déclarée ("${candUser.adresse || ''}, ${candUser.ville || ''}") ne correspond pas aux mentions trouvées sur le verso de la CNI (aucun certificat de résidence joint pour attester d'un changement).`
        );
        scoreConfiance -= 25;
        verifications.adresseDoc = {
          status: 'WARNING',
          message: 'Adresse / Ville déclarée non attestée sur le verso de la CNI sans certificat de résidence',
        };
      }
    }
  }

  // 11. VÉRIFICATION CROISÉE APPROFONDIE DU DIPLÔME VS DÉCLARATION DU CANDIDAT
  if (diplomeBase) {
    if (textDiplome.length > 30) {
      // A. Termes académiques officiels
      const academicKeywords = [
        'diplome', 'attestation', 'reussite', 'licence', 'master', 'bachelor',
        'ingenieur', 'baccalaureat', 'technicien', 'brevet', 'universite', 'faculte',
        'ecole', 'institut', 'ministere', 'royaume du maroc', 'decerne', 'titulaire',
        'filiere', 'mention', 'session', 'ofppt', 'istafi', 'cycle', 'grade', 'directeur'
      ];
      const hasAcademicTerm = academicKeywords.some((kw) => textDiplome.includes(kw));
      if (!hasAcademicTerm) {
        anomalies.push(
          `🚨 Diplôme non conforme ou illisible : Le document téléversé ne contient aucun terme académique officiel valide (ni mention de diplôme, ni université/école). Pièce floue ou document non académique.`
        );
        isEliminatoire = true;
        scoreConfiance -= 40;
        verifications.diplomeDoc = {
          status: 'REJECT',
          message: 'Contenu académique officiel introuvable dans le fichier joint',
        };
      } else {
        verifications.diplomeDoc = {
          status: 'VALID',
          message: 'Mentions académiques officielles reconnues dans le diplôme',
        };
      }

      // B. Vérification du titulaire du diplôme (Nom et Prénom du candidat)
      if (candNom && candPrenom) {
        const hasNomInDip = candNom.length >= 2 && new RegExp(`\\b${escapeReg(candNom)}\\b`, 'i').test(textDiplome);
        const hasPrenomInDip = candPrenom.length >= 2 && new RegExp(`\\b${escapeReg(candPrenom)}\\b`, 'i').test(textDiplome);

        if (!hasNomInDip && !hasPrenomInDip) {
          anomalies.push(
            `🚨 Discordance Titulaire Diplôme : Le nom du candidat ("${fullName}") n'apparaît nulle part sur le diplôme téléversé (document d'un tiers ou nom illisible).`
          );
          isEliminatoire = true;
          scoreConfiance -= 50;
          verifications.diplomeTitulaire = {
            status: 'REJECT',
            message: 'Titulaire du diplôme différent du candidat',
          };
        } else {
          verifications.diplomeTitulaire = {
            status: 'VALID',
            message: 'Titulaire du diplôme certifié conforme au candidat',
          };
        }
      }

      // C. VÉRIFICATION STRICTE DE L'ANNÉE D'OBTENTION DU DIPLÔME
      // Ex: candidat déclare 2024, mais sur le diplôme il y a écrit 2020 ou une autre année
      let declaredGradYear = '';
      if (candidature.dateObtention) {
        const parsedYear = moment(candidature.dateObtention).year();
        if (parsedYear && !isNaN(parsedYear) && parsedYear > 1980 && parsedYear <= 2030) {
          declaredGradYear = String(parsedYear);
        }
      }
      if (!declaredGradYear && candidature.anneeObtention) {
        const matchYear = String(candidature.anneeObtention).match(/\b(19\d{2}|20\d{2})\b/);
        if (matchYear) declaredGradYear = matchYear[1];
      }

      if (declaredGradYear) {
        // Extraction de toutes les années à 4 chiffres présentes dans le document
        const allYearsInDoc = (textDiplome.match(/\b(19[8-9]\d|20[0-3]\d)\b/g) || []);
        const uniqueYears = [...new Set(allYearsInDoc)];

        // Recherche spécifique des motifs de session / promotion
        const sessionMatches = [
          ...textDiplome.matchAll(/session\s*[:\s]\s*(\d{4})/g),
          ...textDiplome.matchAll(/promotion\s*[:\s]\s*(\d{4})/g),
          ...textDiplome.matchAll(/annee\s+universitaire\s*[:\s]\s*(\d{4})/g),
          ...textDiplome.matchAll(/delivre\s+le\s+.*?(\d{4})/g),
          ...textDiplome.matchAll(/decerne\s+le\s+.*?(\d{4})/g),
          ...textDiplome.matchAll(/fait\s+le\s+.*?(\d{4})/g),
          ...textDiplome.matchAll(/l an\s+(\d{4})/g),
        ].map((m) => m[1]);

        const keyDocYears = [...new Set(sessionMatches.length > 0 ? sessionMatches : uniqueYears)];

        if (keyDocYears.length > 0) {
          const yearMatches = keyDocYears.includes(declaredGradYear) || uniqueYears.includes(declaredGradYear);
          if (!yearMatches) {
            anomalies.push(
              `🚨 Incohérence Année d'obtention du Diplôme : Le candidat déclare l'année ${declaredGradYear}, alors que le diplôme téléversé indique l'année ${keyDocYears.join(', ')}.`
            );
            isEliminatoire = true;
            scoreConfiance -= 45;
            verifications.diplomeAnnee = {
              status: 'REJECT',
              declared: declaredGradYear,
              found: keyDocYears,
              message: `Année déclarée (${declaredGradYear}) non conforme au diplôme (${keyDocYears.join(', ')})`,
            };
          } else {
            verifications.diplomeAnnee = {
              status: 'VALID',
              declared: declaredGradYear,
              message: `Année d'obtention (${declaredGradYear}) certifiée conforme au diplôme`,
            };
          }
        }
      }

      // D. VÉRIFICATION CROISÉE DE L'INTITULÉ DU DIPLÔME ET DE LA FILIÈRE
      const declaredDiplome = cleanStr(candidature.diplome || candidature.specialite);
      if (declaredDiplome && declaredDiplome.length >= 3) {
        const dipStopwords = [
          'diplome', 'licence', 'master', 'technicien', 'specialise', 'specialite',
          'filiere', 'option', 'etudes', 'superieures', 'professionnelle', 'fondamentale',
          'cycle', 'de', 'en', 'la', 'le', 'du', 'des', 'et'
        ];
        const dipKeywords = declaredDiplome
          .split(/[\s,.'\-\/]+/)
          .filter((w) => w.length >= 4 && !dipStopwords.includes(w));

        if (dipKeywords.length > 0) {
          const matchCount = dipKeywords.filter((kw) => textDiplome.includes(kw)).length;
          const matchRatio = matchCount / dipKeywords.length;

          if (matchCount === 0) {
            anomalies.push(
              `⚠️ Incohérence Spécialité / Diplôme : L'intitulé déclaré ("${candidature.diplome || candidature.specialite}") ne correspond pas aux filières mentionnées sur le diplôme joint.`
            );
            scoreConfiance -= 25;
            verifications.diplomeTitre = {
              status: 'WARNING',
              declared: candidature.diplome || candidature.specialite,
              message: 'Intitulé ou filière déclarée introuvable sur le diplôme',
            };
          } else {
            verifications.diplomeTitre = {
              status: 'VALID',
              declared: candidature.diplome || candidature.specialite,
              message: 'Intitulé et spécialité confirmés dans le document',
            };
          }
        }
      }

      // E. VÉRIFICATION CROISÉE DE L'ÉTABLISSEMENT / UNIVERSITÉ
      const declaredEtab = cleanStr(candidature.etablissement);
      if (declaredEtab && declaredEtab.length >= 3) {
        const etabStopwords = [
          'ecole', 'universite', 'faculte', 'institut', 'centre', 'maroc', 'de', 'du', 'des'
        ];
        const etabKeywords = declaredEtab
          .split(/[\s,.'\-\/]+/)
          .filter((w) => w.length >= 3 && !etabStopwords.includes(w));

        if (etabKeywords.length > 0) {
          const hasEtab = etabKeywords.some((kw) => textDiplome.includes(kw));
          if (!hasEtab) {
            anomalies.push(
              `⚠️ Incohérence Établissement : L'établissement déclaré ("${candidature.etablissement}") ne figure pas sur le diplôme téléversé.`
            );
            scoreConfiance -= 20;
            verifications.diplomeEtablissement = {
              status: 'WARNING',
              declared: candidature.etablissement,
              message: 'Établissement déclaré non mentionné sur le diplôme',
            };
          } else {
            verifications.diplomeEtablissement = {
              status: 'VALID',
              declared: candidature.etablissement,
              message: 'Établissement certifié conforme au document',
            };
          }
        }
      }
    } else {
      // Document sans texte exploitable (image non ocrisée ou scan sombre)
      anomalies.push(
        `⚠️ Qualité Diplôme : Scan sans texte exploitable ou document non ocrisé. Contrôle visuel par l'arbitre humain obligatoire.`
      );
      scoreConfiance -= 15;
      verifications.diplomeDoc = {
        status: 'WARNING',
        message: 'Scan image sans texte exploitable / vérification visuelle obligatoire',
      };
    }
  }

  // 12. VÉRIFICATION CROISÉE DES RELEVÉS DE NOTES
  if (relevesBase) {
    if (textReleves.length > 30) {
      const notesKeywords = [
        'releve', 'note', 'notes', 'semestre', 'module', 'bulletin',
        'moyenne', 'session', 'resultat', 'credits', 'admis', 'ajourne', 'matiere'
      ];
      const hasNotesTerm = notesKeywords.some((kw) => textReleves.includes(kw));
      if (!hasNotesTerm) {
        anomalies.push(
          `⚠️ Relevés de notes suspects : Le document téléversé ne semble pas correspondre à un relevé de notes ou bulletin académique officiel (mentions de notes ou semestres introuvables).`
        );
        scoreConfiance -= 20;
      }

      // Vérification du nom du candidat sur les relevés
      if (candNom && candPrenom) {
        const hasNomInReleves = candNom.length >= 2 && new RegExp(`\\b${escapeReg(candNom)}\\b`, 'i').test(textReleves);
        const hasPrenomInReleves = candPrenom.length >= 2 && new RegExp(`\\b${escapeReg(candPrenom)}\\b`, 'i').test(textReleves);
        if (!hasNomInReleves && !hasPrenomInReleves) {
          anomalies.push(
            `🚨 Relevés de notes d'un tiers : Le nom de l'étudiant sur les relevés de notes ne correspond pas à l'identité du candidat (${fullName}).`
          );
          isEliminatoire = true;
          scoreConfiance -= 45;
        }
      }
    }
  }

  // 13. VERDICT GLOBAL DE L'AUDIT IA (SCORE CLAMPÉ ENTRE 0 ET 100)
  scoreConfiance = Math.max(0, Math.min(100, Math.round(scoreConfiance)));

  let statutAI = 'VALIDE_IA';
  let summary = 'Dossier complet, âge et pièces conformes. Aucun écart détecté par l’IA.';

  if (isEliminatoire) {
    statutAI = 'REJETE_IA';
    summary = `Dossier non éligible selon les critères officiels : ${anomalies[0]}`;
  } else if (anomalies.length > 0) {
    statutAI = 'ANOMALIE_IA';
    summary = `${anomalies.length} anomalie(s) détectée(s) nécessitant l’arbitrage du Contrôleur Humain.`;
  }

  return {
    statutAI,
    auditAI: {
      scoreConfiance,
      anomalies,
      verifications,
      dateAudit: new Date(),
      summary,
    },
  };
};

export default executeAIAudit;
