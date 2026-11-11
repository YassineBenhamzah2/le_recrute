import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/recrutement_ccp').then(async () => {
  const Candidature = mongoose.model('Candidature', new mongoose.Schema({}, { strict: false }));
  const candidatures = await Candidature.find({});

  for (let c of candidatures) {
    const isBenhamzah = (c.nom && c.nom.toLowerCase().includes('benhamzah')) || (c.prenom && c.prenom.toLowerCase().includes('benhamzah'));
    const defaultDoc = isBenhamzah ? 'Releves_Notes_BENHAMZAH_6_Pages.pdf' : 'Dossier_Candidat_Complet_6_Pages.pdf';

    c.copieCNI = c.copieCNI || defaultDoc;
    c.residence = c.residence || defaultDoc;
    c.copieDiplomes = c.copieDiplomes || defaultDoc;
    c.releves = c.releves || defaultDoc;
    c.attestationsTravail = c.attestationsTravail || defaultDoc;

    await c.save();
  }

  console.log(`Updated documents for ${candidatures.length} candidatures successfully!`);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
