import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { extractTextFromPDF } from '../utils/pdfTextExtractor.js';

/**
 * Service d'Audit Intelligent (IA Contrôle Niveau 1)
 * Analyse automatique des pièces, détection des incohérences (âge, adresse, CNI, diplôme, notes).
 * Analyse approfondie du contenu textuel des fichiers PDF téléversés.
 */
export const executeAIAudit = async (candidature, user, offre) => {
  const anomalies = [];
  const verifications = {};
  let scoreConfiance = 100;
  let isEliminatoire = false;

  const candUser = user || candidature.user || {};
  const candOffre = offre || candidature.offre || {};

  // 1. CONTRÔLE INTELLIGENT DE L'ÂGE & DATE DE NAISSANCE
  const rawBirth = candUser.dateNaissance;
  let birthYear = '';
  let birthFormats = [];

  if (!rawBirth) {
    anomalies.push("Date de naissance manquante dans le dossier.");
    scoreConfiance -= 25;
    verifications.age = { status: 'ERROR', message: 'Date de naissance non renseignée' };
  } else {
    const birthMoment = moment(rawBirth, ['YYYY-MM-DD', 'DD.MM.YYYY', 'DD/MM/YYYY'], true);
    const validBirth = birthMoment.isValid() ? birthMoment : moment(rawBirth);

    if (!validBirth.isValid()) {
      anomalies.push(`Format de date de naissance invalide : ${rawBirth}`);
      scoreConfiance -= 20;
      verifications.age = { status: 'WARNING', message: 'Format de date suspect' };
    } else {
      birthYear = validBirth.format('YYYY');
      const moisFrancais = [
        'janvier', 'février', 'fevrier', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'aout', 'septembre', 'octobre', 'novembre', 'décembre', 'decembre'
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

  // 2. CONTRÔLE DE LA CNI & IDENTITÉ NUMÉRIQUE
  const cniNum = String(candUser.cni || '').trim().toUpperCase();
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

  // 3. CONTRÔLE DE L'ADRESSE & DE LA VILLE DE RÉSIDENCE
  const ville = String(candUser.ville || '').trim().toLowerCase();
  const adresse = String(candUser.adresse || '').trim().toLowerCase();
  const hasCertifResidence = Boolean(candUser.residence);

  if (!ville || !adresse) {
    anomalies.push("Coordonnées de résidence incomplètes (Ville ou Adresse manquante).");
    scoreConfiance -= 15;
    verifications.adresse = { status: 'WARNING', message: 'Adresse incomplète' };
  } else {
    // Si l'offre cible une ville précise et que le candidat est d'une autre ville sans certificat
    const offreVille = String(candOffre.ville || '').toLowerCase();
    const isRegionalTarget = offreVille && !offreVille.includes('national') && !offreVille.includes('tout');

    if (isRegionalTarget && !offreVille.includes(ville) && !hasCertifResidence) {
      anomalies.push(
        `Résidence déclarée (${candUser.ville}) différente de la zone du concours (${candOffre.ville}) sans certificat de résidence joint.`
      );
      scoreConfiance -= 20;
      verifications.adresse = { status: 'WARNING', message: 'Certificat de résidence requis' };
    } else {
      verifications.adresse = { status: 'VALID', ville: candUser.ville, message: 'Résidence conforme' };
    }
  }

  // 4. CONTRÔLE DU DIPLÔME & SPÉCIALITÉ RECHERCHÉE
  const getLevelWeight = (str) => {
    if (!str) return 0;
    const s = String(str).toLowerCase();
    if (s.includes('bac+5') || s.includes('master') || s.includes('ingenieur') || s.includes('ingénieur')) return 5;
    if (s.includes('bac+3') || s.includes('licence') || s.includes('bachelor')) return 3;
    if (s.includes('bac+2') || s.includes('ts') || s.includes('bts') || s.includes('dut') || s.includes('dts') || s.includes('deug')) return 2;
    if (s.includes('bac')) return 1;
    return 0;
  };

  const candLvl = getLevelWeight(candidature.niveauEtude);
  const reqLvl = getLevelWeight(candOffre.niveau || candOffre.profil);

  // On ne vérifie le niveau que si l'offre a expressément défini un niveau requis non vide
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

  // 5. CONTRÔLE DES NOTES & DE LA MOYENNE
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

  // 6. CONTRÔLE APPROFONDI DU CONTENU DES PIÈCES NUMÉRISÉES (ANTI-FRAUDE & VÉRIFICATION CROISÉE)
  const resolveDocPath = (cleanFileName) => {
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

  // DÉTECTION ANTI-FRAUDE : CLONAGE OU RECYCLAGE DU MÊME FICHIER ENTRE PLUSIEURS PIÈCES
  const cniBase = path.basename(candUser.copieCNI || '').split('?')[0];
  const diplomeBase = path.basename(candidature.copieDiplomes || '').split('?')[0];
  const releveBase = path.basename(candidature.releves || '').split('?')[0];

  if (cniBase && diplomeBase && cniBase.toLowerCase() === diplomeBase.toLowerCase()) {
    anomalies.push(
      `🚨 Fraude / Doublon documentaire : Le même fichier ("${cniBase}") a été téléversé à la fois pour la CNI et pour le Diplôme.`
    );
    isEliminatoire = true;
    scoreConfiance -= 45;
  }

  if (cniBase && releveBase && cniBase.toLowerCase() === releveBase.toLowerCase()) {
    anomalies.push(
      `🚨 Fraude / Doublon documentaire : Le même fichier ("${cniBase}") a été téléversé à la fois pour la CNI et pour les Relevés de notes.`
    );
    isEliminatoire = true;
    scoreConfiance -= 40;
  }

  if (diplomeBase && releveBase && diplomeBase.toLowerCase() === releveBase.toLowerCase()) {
    anomalies.push(
      `⚠️ Doublon documentaire : Le même fichier ("${diplomeBase}") a été utilisé pour le Diplôme et les Relevés de notes.`
    );
    scoreConfiance -= 20;
  }

  // Vérification d'empreinte binaire (Même fichier sous des noms renommés)
  try {
    const cniPath = resolveDocPath(cniBase);
    const dipPath = resolveDocPath(diplomeBase);
    if (fs.existsSync(cniPath) && fs.existsSync(dipPath) && cniBase !== diplomeBase) {
      const stat1 = fs.statSync(cniPath);
      const stat2 = fs.statSync(dipPath);
      if (stat1.size === stat2.size && stat1.size > 2000) {
        const buf1 = fs.readFileSync(cniPath);
        const buf2 = fs.readFileSync(dipPath);
        if (buf1.equals(buf2)) {
          anomalies.push(
            `🚨 Fraude avancée / Fichiers identiques : Le document CNI et le Diplôme contiennent exactement les mêmes octets sous deux noms de fichiers différents.`
          );
          isEliminatoire = true;
          scoreConfiance -= 50;
        }
      }
    }
  } catch (errDuplicate) {
    // Ignorer
  }

  const pieceChecks = [
    { name: 'CNI', file: candUser.copieCNI, isCNI: true },
    { name: 'Diplôme', file: candidature.copieDiplomes, isDiplome: true },
    { name: 'Relevés de notes', file: candidature.releves, isReleves: true },
  ];

  for (const piece of pieceChecks) {
    if (!piece.file) {
      anomalies.push(`Pièce justificative obligatoire manquante : ${piece.name}.`);
      isEliminatoire = true;
      scoreConfiance -= 25;
    } else {
      const cleanFileName = path.basename(piece.file).split('?')[0];
      const filePath = resolveDocPath(cleanFileName);
      if (!fs.existsSync(filePath)) {
        anomalies.push(`Fichier numérisé introuvable sur le serveur pour ${piece.name} (${cleanFileName}).`);
        scoreConfiance -= 15;
      } else {
        // CONTRÔLE D'INTÉGRITÉ & TAILLE DU FICHIER (TOUS FORMATS: PDF, IMAGES...)
        try {
          const stats = fs.statSync(filePath);
          if (stats.size < 6000) {
            // Moins de 6 Ko : Fichier corrompu, blanc ou tronqué
            anomalies.push(
              `🚨 Pièce suspecte ou anormalement légère pour ${piece.name} (${Math.round(stats.size / 1024)} Ko) : Document potentiellement vide, illisible ou corrompu.`
            );
            isEliminatoire = true;
            scoreConfiance -= 35;
          }
        } catch (e) {
          // Ignorer erreur stat
        }

        if (cleanFileName.toLowerCase().endsWith('.pdf')) {
          // Extraction textuelle du PDF pour vérification croisée approfondie
          const pdfText = extractTextFromPDF(filePath).toLowerCase();

          // A. DÉTECTION DE DOCUMENTS SUSPECTS / INAPPROPRIÉS (ex: contrat de location, renta car, facture...)
          const suspiciousKeywords = [
            'rental contract',
            'rent a car',
            'rentacar',
            'contrat de location',
            'loueur',
            'véhicule de location',
            'quittance de loyer',
            'facture d\'électricité',
          ];

          const foundSuspicious = suspiciousKeywords.find((kw) => pdfText.includes(kw));
          if (foundSuspicious) {
            anomalies.push(
              `🚨 Document hors-sujet / suspect pour ${piece.name} : Le fichier PDF semble être un document commercial ("${foundSuspicious}") et non une pièce officielle requise.`
            );
            isEliminatoire = true;
            scoreConfiance -= 45;
          }

          // B. DÉTECTION DE DOCUMENT FLOU, MAL NUMÉRISÉ OU SCAN SANS TEXTE (Qualité d'image insuffisante)
          if (pdfText.length <= 25) {
            anomalies.push(
              `⚠️ Qualité de numérisation insuffisante pour ${piece.name} : Document sans texte exploitable (scan flou, photo sombre ou document non ocrisé). Contrôle visuel requis.`
            );
            scoreConfiance -= 15;
            verifications[`qualite_${piece.name.toLowerCase()}`] = {
              status: 'WARNING',
              message: 'Scan image sans texte exploitable / vérification visuelle obligatoire',
            };
          }

          // C. CONTRÔLE APPROFONDI DU DIPLÔME (Vérification de validité académique)
          if (piece.isDiplome) {
            const academicKeywords = [
              'diplôme', 'diplome', 'attestation', 'réussite', 'reussite',
              'licence', 'master', 'bachelor', 'ingénieur', 'ingenieur',
              'baccalauréat', 'baccalaureat', 'technicien', 'brevet',
              'université', 'universite', 'faculté', 'faculte', 'école', 'ecole',
              'institut', 'ministère', 'ministere', 'royaume du maroc', 'décerné', 'decerne',
              'titulaire', 'filière', 'filiere', 'mention', 'session', 'ofppt', 'istafi',
              'cycle', 'grade', 'commission', 'doyen', 'recteur', 'directeur'
            ];

            if (pdfText.length > 30) {
              const hasAcademicTerm = academicKeywords.some((kw) => pdfText.includes(kw));
              if (!hasAcademicTerm) {
                anomalies.push(
                  `🚨 Diplôme non conforme ou illisible : Le document téléversé ne contient aucun terme académique officiel valide (ni mention de diplôme, ni université/école, ni attestation). Pièce floue ou document non académique.`
                );
                isEliminatoire = true;
                scoreConfiance -= 35;
                verifications.diplomeDoc = {
                  status: 'REJECT',
                  message: 'Contenu académique officiel introuvable dans le fichier joint',
                };
              } else {
                verifications.diplomeDoc = {
                  status: 'VALID',
                  message: 'Mentions académiques officielles reconnues dans le document',
                };
              }
            }
          }

          // D. CONTRÔLE APPROFONDI DES RELEVÉS DE NOTES
          if (piece.isReleves && pdfText.length > 30) {
            const notesKeywords = [
              'relevé', 'releve', 'note', 'notes', 'semestre', 'module', 'bulletin',
              'moyenne', 'session', 'résultat', 'resultat', 'crédits', 'credits',
              'admis', 'ajourné', 'matière', 'matiere', 'faculté', 'universite', 'école'
            ];

            const hasNotesTerm = notesKeywords.some((kw) => pdfText.includes(kw));
            if (!hasNotesTerm) {
              anomalies.push(
                `⚠️ Relevés de notes suspects : Le document téléversé ne semble pas correspondre à un relevé de notes ou bulletin académique officiel (mentions de notes/semestres introuvables).`
              );
              scoreConfiance -= 20;
            }
          }

          // E. VÉRIFICATION CROISÉE DE LA DATE DE NAISSANCE DANS LA CNI
          if (piece.isCNI && pdfText.length > 30) {
            const hasBirthInDoc = birthFormats.some((fmt) => pdfText.includes(fmt.toLowerCase()));
            const hasBirthKeywords =
              pdfText.includes('naissance') ||
              pdfText.includes('né le') ||
              pdfText.includes('née le') ||
              pdfText.includes('date');

            if (!hasBirthInDoc && !hasBirthKeywords) {
              anomalies.push(
                `⚠️ Date de naissance déclarée introuvable dans la pièce CNI (scan mal cadré ou date illisible).`
              );
              scoreConfiance -= 20;
              verifications.age = {
                status: 'WARNING',
                message: 'Date de naissance non identifiable dans le PDF',
              };
            }
          }

          // F. VÉRIFICATION DU NUMÉRO CNI DANS LA COPIE CNI
          if (piece.isCNI && pdfText.length > 30 && cniNum) {
            const cleanCniLower = cniNum.toLowerCase();
            if (!pdfText.includes(cleanCniLower)) {
              anomalies.push(
                `⚠️ Numéro CNI ("${cniNum}") introuvable ou illisible dans le document CNI (vérifier si la pièce est floue ou rognée).`
              );
              scoreConfiance -= 20;
            }
          }

          // G. VÉRIFICATION CROISÉE DU NOM ET PRÉNOM DU CANDIDAT DANS LA PIÈCE CNI / DOSSIER
          if (piece.isCNI && pdfText.length > 30) {
            const candNom = String(candUser.nom || '').trim().toLowerCase();
            const candPrenom = String(candUser.prenom || '').trim().toLowerCase();
            const escapeReg = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

            const hasNom = candNom.length >= 2 && new RegExp(`\\b${escapeReg(candNom)}\\b`, 'i').test(pdfText);
            const hasPrenom = candPrenom.length >= 2 && new RegExp(`\\b${escapeReg(candPrenom)}\\b`, 'i').test(pdfText);

            const fullName = `${candUser.prenom || ''} ${candUser.nom || ''}`.trim();
            if (!hasNom && !hasPrenom) {
              anomalies.push(
                `🚨 Discordance d'identité : Le nom "${fullName}" n'apparaît pas dans la pièce téléversée (document d'un tiers ou CNI illisible).`
              );
              isEliminatoire = true;
              scoreConfiance -= 40;
            }
          }

          // H. VÉRIFICATION CROISÉE DE L'ADRESSE ET DE LA VILLE DE RÉSIDENCE DANS LA CNI
          if (piece.isCNI && pdfText.length > 30) {
            const declaredVille = String(candUser.ville || '').trim().toLowerCase();
            const declaredAdresse = String(candUser.adresse || '').trim().toLowerCase();

            // Mots significatifs de l'adresse (ex: "massira", "deroua", "anfa", "maarif")
            const adresseMots = declaredAdresse
              .split(/[\s,.'\-\/]+/)
              .filter(
                (w) =>
                  w.length >= 4 &&
                  ![
                    'rue',
                    'av',
                    'avenue',
                    'boulevard',
                    'bd',
                    'lot',
                    'lotissement',
                    'n°',
                    'num',
                    'numero',
                    'immeuble',
                    'imm',
                    'residence',
                    'res',
                    'quartier',
                    'hay',
                  ].includes(w)
              );

            const hasVilleInDoc = declaredVille.length >= 3 && pdfText.includes(declaredVille);
            const hasAdresseMotInDoc = adresseMots.some((mot) => pdfText.includes(mot));
            const hasCertifResidence = Boolean(candUser.residence);

            if (hasVilleInDoc || hasAdresseMotInDoc) {
              verifications.adresseDoc = {
                status: 'VALID',
                message: `Adresse / Ville ("${candUser.ville || declaredAdresse}") vérifiée dans la pièce justificative`,
              };
            } else if (declaredVille && !hasCertifResidence) {
              anomalies.push(
                `⚠️ Résidence : Ville ("${candUser.ville}") non attestée sur la CNI (aucun certificat de résidence joint).`
              );
              scoreConfiance -= 15;
              verifications.adresseDoc = {
                status: 'WARNING',
                message: 'Adresse / Ville non attestée par la CNI sans certificat de résidence',
              };
            }
          }
        }
      }
    }
  }

  // 7. VERDICT GLOBAL DE L'AUDIT IA (SCORE CLAMPÉ ENTRE 0 ET 100)
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

