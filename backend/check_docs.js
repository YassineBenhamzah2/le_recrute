import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/recrutement_ccp').then(async () => {
  const Candidature = mongoose.model('Candidature', new mongoose.Schema({}, { strict: false }));
  const all = await Candidature.find({}).lean();
  console.log('Total candidatures:', all.length);
  all.forEach((c, idx) => {
    console.log(`--- [${idx}] ${c.nom} ${c.prenom} (id: ${c._id}) ---`);
    console.log('copieCNI:', c.copieCNI);
    console.log('residence:', c.residence);
    console.log('copieDiplomes:', c.copieDiplomes);
    console.log('releves:', c.releves);
    console.log('attestationsTravail:', c.attestationsTravail);
  });
  process.exit(0);
});
