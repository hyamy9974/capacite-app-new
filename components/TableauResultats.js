import {
  calculerHeuresRestantes,
  calculerApprenantsPossibles,
  determinerEtat,
} from '../utils/calculs';

export default function TableauResultats({ data }) {
  const {
    totalHeuresTheo,
    totalHeuresPrat,
    totalHeuresTpSpec,
    besoinTheoTotal,
    besoinPratTotal,
    besoinTpSpecTotal,
    moyenneBesoinTheo,
    moyenneBesoinPrat,
    moyenneBesoinTpSpec,
    moyenneSurfaceTheo,
    moyenneSurfacePrat,
    moyenneSurfaceTpSpec,
  } = data;

  const heuresRestantesTheo = calculerHeuresRestantes(totalHeuresTheo, besoinTheoTotal);
  const heuresRestantesPrat = calculerHeuresRestantes(totalHeuresPrat, besoinPratTotal);
  const heuresRestantesTpSpec = calculerHeuresRestantes(totalHeuresTpSpec, besoinTpSpecTotal);

  const apprenantsPossiblesTheo = calculerApprenantsPossibles(
    heuresRestantesTheo, moyenneBesoinTheo, moyenneSurfaceTheo
  );
  const apprenantsPossiblesPrat = calculerApprenantsPossibles(
    heuresRestantesPrat, moyenneBesoinPrat, moyenneSurfacePrat
  );
  const apprenantsPossiblesTpSpec = calculerApprenantsPossibles(
    heuresRestantesTpSpec, moyenneBesoinTpSpec, moyenneSurfaceTpSpec
  );

  const etatTheo = determinerEtat(heuresRestantesTheo);
  const etatPrat = determinerEtat(heuresRestantesPrat);
  const etatTpSpec = determinerEtat(heuresRestantesTpSpec);

  const testGlobal = etatTheo === 'Excédent' && etatPrat === 'Excédent' && etatTpSpec === 'Excédent' ? 'Excédent' : 'Dépassement';
  const couleurGlobal = testGlobal === 'Excédent' ? 'text-green-600' : 'text-red-600';

  // --- الفلترة: لا يعرض صف النوع إذا كان معدل المساحة البيداغوجية = 0 ---
  const rows = [];
  if (moyenneSurfaceTheo > 0) {
    rows.push({
      label: "Théorique",
      heures: isNaN(heuresRestantesTheo) ? 0 : heuresRestantesTheo,
      apprenants: isNaN(apprenantsPossiblesTheo) ? 0 : apprenantsPossiblesTheo,
      etat: etatTheo,
    });
  }
  if (moyenneSurfacePrat > 0) {
    rows.push({
      label: "Pratique",
      heures: isNaN(heuresRestantesPrat) ? 0 : heuresRestantesPrat,
      apprenants: isNaN(apprenantsPossiblesPrat) ? 0 : apprenantsPossiblesPrat,
      etat: etatPrat,
    });
  }
  if (moyenneSurfaceTpSpec > 0) {
    rows.push({
      label: "TP Spécifique",
      heures: isNaN(heuresRestantesTpSpec) ? 0 : heuresRestantesTpSpec,
      apprenants: isNaN(apprenantsPossiblesTpSpec) ? 0 : apprenantsPossiblesTpSpec,
      etat: etatTpSpec,
    });
  }

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Résultats</h2>
      <table className="w-full table-auto border text-sm mb-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Type</th>
            <th className="border p-2">Heures restantes</th>
            <th className="border p-2">Apprenants possibles</th>
            <th className="border p-2">État</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border p-2">{row.label}</td>
              <td className="border p-2 text-center">{row.heures}</td>
              <td className="border p-2 text-center">{row.apprenants}</td>
              <td className={`border p-2 text-center font-semibold ${row.etat === 'Excédent' ? 'text-green-600' : 'text-red-600'}`}>
                {row.etat}
              </td>
            </tr>
          ))}
          {/* السطر الأخير */}
          <tr className="font-bold">
            <td className="border p-2 text-center" colSpan="3">Résultat Global</td>
            <td className={`border p-2 text-center ${couleurGlobal}`}>{testGlobal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}