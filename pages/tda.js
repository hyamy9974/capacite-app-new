import { useRef, useState, useEffect } from "react";
import TableauSalles from "../components/TableauSalles";
import TableauEffectif from "../components/TableauEffectif";
import TableauRepartition from "../components/TableauRepartition";
import TableauResultats from "../components/TableauResultats";
import useSpecialties from "../components/useSpecialties";
import { generatePDF } from "../components/generatePDF";
import {
  calculerHeuresRestantes,
  calculerApprenantsPossibles,
  determinerEtat,
} from "../utils/calculs";

const moyenne = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const somme = arr => arr.reduce((a, b) => a + b, 0);
const defaultSalle = (cno, semaines, heures) => ({
  surface: "",
  cno,
  semaines,
  heures,
  surfaceP: 0,
  heuresMax: Math.round(semaines * heures),
});

export default function TDA() {
  const pdfRef = useRef();
  const [salles, setSalles] = useState({
    theorie: [defaultSalle(1.0, 72, 56)],
    pratique: [defaultSalle(1.0, 72, 56)],
    tpSpecifiques: [defaultSalle(1.0, 72, 56)],
  });
  const [cnos, setCnos] = useState({ theorie: 1.0, pratique: 1.0, tpSpecifiques: 1.0 });
  const [semaines, setSemaines] = useState({ theorie: 72, pratique: 72, tpSpecifiques: 72 });
  const [heures, setHeures] = useState({ theorie: 56, pratique: 56, tpSpecifiques: 56 });
  const [apprenants, setApprenants] = useState({ theorie: 26, pratique: 26, tpSpecifiques: 26 });
  const [effectif, setEffectif] = useState([{ specialite: "", groupes: 0, apprenants: 0 }]);
  const [repartition, setRepartition] = useState({
    besoinTheoTotal: 0,
    besoinPratTotal: 0,
    besoinTpSpecTotal: 0,
    moyenneTheo: 0,
    moyennePrat: 0,
    moyenneTpSpec: 0,
  });

  const specialties = useSpecialties();

  useEffect(() => {
    const saved = localStorage.getItem("tdaData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSalles(parsed.salles);
      setEffectif(parsed.effectif);
      setRepartition(parsed.repartition);
    }
  }, []);

  const totalHeuresTheo = somme(salles.theorie.map(s => Number(s.heuresMax) || 0));
  const totalHeuresPrat = somme(salles.pratique.map(s => Number(s.heuresMax) || 0));
  const totalHeuresTpSpec = somme(salles.tpSpecifiques.map(s => Number(s.heuresMax) || 0));
  const moyenneSurfaceTheo = moyenne(salles.theorie.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfacePrat = moyenne(salles.pratique.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfaceTpSpec = moyenne(salles.tpSpecifiques.map(s => Number(s.surfaceP) || 0));

  const heuresRestantesTheo = calculerHeuresRestantes(totalHeuresTheo, repartition.besoinTheoTotal);
  const heuresRestantesPrat = calculerHeuresRestantes(totalHeuresPrat, repartition.besoinPratTotal);
  const heuresRestantesTpSpec = calculerHeuresRestantes(totalHeuresTpSpec, repartition.besoinTpSpecTotal);

  const apprenantsPossiblesTheo = calculerApprenantsPossibles(
    heuresRestantesTheo, repartition.moyenneTheo, moyenneSurfaceTheo
  );
  const apprenantsPossiblesPrat = calculerApprenantsPossibles(
    heuresRestantesPrat, repartition.moyennePrat, moyenneSurfacePrat
  );
  const apprenantsPossiblesTpSpec = calculerApprenantsPossibles(
    heuresRestantesTpSpec, repartition.moyenneTpSpec, moyenneSurfaceTpSpec
  );

  const etatTheo = determinerEtat(heuresRestantesTheo);
  const etatPrat = determinerEtat(heuresRestantesPrat);
  const etatTpSpec = determinerEtat(heuresRestantesTpSpec);

  const testGlobal = etatTheo === 'Excédent' && etatPrat === 'Excédent' && etatTpSpec === 'Excédent' ? 'Excédent' : 'Dépassement';

  const resultatsData = {
    totalHeuresTheo,
    totalHeuresPrat,
    totalHeuresTpSpec,
    besoinTheoTotal: repartition.besoinTheoTotal,
    besoinPratTotal: repartition.besoinPratTotal,
    besoinTpSpecTotal: repartition.besoinTpSpecTotal,
    moyenneBesoinTheo: repartition.moyenneTheo,
    moyenneBesoinPrat: repartition.moyennePrat,
    moyenneBesoinTpSpec: repartition.moyenneTpSpec,
    moyenneSurfaceTheo,
    moyenneSurfacePrat,
    moyenneSurfaceTpSpec,
  };

  const resultatsFinalTable = [
    ["Théorie", heuresRestantesTheo, apprenantsPossiblesTheo, etatTheo],
    ["Pratique", heuresRestantesPrat, apprenantsPossiblesPrat, etatPrat],
    ["TP Spécifiques", heuresRestantesTpSpec, apprenantsPossiblesTpSpec, etatTpSpec],
    ["Résultat Global", "", "", testGlobal]
  ];

  const handleEffectifChange = (rows) => {
    setEffectif(rows.length ? rows : [{ specialite: "", groupes: 0, apprenants: 0 }]);
  };

  const handleRepartitionChange = (repData) => {
    const r = Array.isArray(repData) && repData.length > 0 ? repData[0] : {};
    setRepartition({
      besoinTheoTotal: r.besoinTheoTotal ?? 0,
      besoinPratTotal: r.besoinPratTotal ?? 0,
      besoinTpSpecTotal: r.besoinTpSpecTotal ?? 0,
      moyenneTheo: r.besoinTheoParGroupe ?? 0,
      moyennePrat: r.besoinPratParGroupe ?? 0,
      moyenneTpSpec: r.besoinTpSpecParGroupe ?? 0,
    });
  };

  const handleSave = () => {
    const data = { salles, effectif, repartition };
    localStorage.setItem("tdaData", JSON.stringify(data));
    alert("Les données ont été enregistrées !");
  };

  const handleReset = () => {
    localStorage.removeItem("tdaData");
    setSalles({
      theorie: [defaultSalle(1.0, 72, 56)],
      pratique: [defaultSalle(1.0, 72, 56)],
      tpSpecifiques: [defaultSalle(1.0, 72, 56)],
    });
    setEffectif([{ specialite: "", groupes: 0, apprenants: 0 }]);
    setRepartition({
      besoinTheoTotal: 0,
      besoinPratTotal: 0,
      besoinTpSpecTotal: 0,
      moyenneTheo: 0,
      moyennePrat: 0,
      moyenneTpSpec: 0,
    });
    alert("Les données ont été réinitialisées.");
  };

  const sallesSummary = [
    ["Théorie", salles.theorie.length, moyenneSurfaceTheo.toFixed(2), totalHeuresTheo],
    ["Pratique", salles.pratique.length, moyenneSurfacePrat.toFixed(2), totalHeuresPrat],
    ["TP Spécifiques", salles.tpSpecifiques.length, moyenneSurfaceTpSpec.toFixed(2), totalHeuresTpSpec]
  ];

  const totalGroupes = somme(effectif.map(e => Number(e.groupes) || 0));
  const totalApprenants = somme(effectif.map(e => Number(e.apprenants) || 0));
  const apprenantsSummary = [
    ...effectif.map(e => [e.specialite, e.groupes, e.apprenants, (Number(e.groupes) || 0) + (Number(e.apprenants) || 0)]),
    ["Total", totalGroupes, totalApprenants, totalGroupes + totalApprenants]
  ];

  const resultatsTable = {
    columns: [
      "Total Heures Théorie", "Total Heures Pratique", "Total Heures TP Spécifiques",
      "Besoin Théorie", "Besoin Pratique", "Besoin TP Spécifiques",
      "Moyenne Besoin Théorie", "Moyenne Besoin Pratique", "Moyenne Besoin TP Spécifiques",
      "Moyenne Surface Théorie", "Moyenne Surface Pratique", "Moyenne Surface TP Spécifiques",
      "Résultat Final"
    ],
    rows: [[
      resultatsData.totalHeuresTheo,
      resultatsData.totalHeuresPrat,
      resultatsData.totalHeuresTpSpec,
      resultatsData.besoinTheoTotal,
      resultatsData.besoinPratTotal,
      resultatsData.besoinTpSpecTotal,
      resultatsData.moyenneBesoinTheo,
      resultatsData.moyenneBesoinPrat,
      resultatsData.moyenneBesoinTpSpec,
      resultatsData.moyenneSurfaceTheo,
      resultatsData.moyenneSurfacePrat,
      resultatsData.moyenneSurfaceTpSpec,
      testGlobal
    ]]
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div ref={pdfRef}>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Test de Dépassement Actuel
        </h1>
        <div className="flex gap-6 flex-wrap mb-8">
          <TableauSalles
            salles={salles}
            setSalles={setSalles}
            cnos={cnos}
            setCnos={setCnos}
            semaines={semaines}
            setSemaines={setSemaines}
            heures={heures}
            setHeures={setHeures}
            apprenants={apprenants}
            setApprenants={setApprenants}
          />
        </div>
        <TableauEffectif
          titre="Effectif Actuel"
          specialties={specialties}
          modeActuel={true}
          onDataChange={handleEffectifChange}
          data={effectif}
          salles={salles}
        />
        <TableauRepartition
          titre="Répartition actuelle des heures"
          effectifData={effectif}
          specialties={specialties}
          onDataChange={handleRepartitionChange}
          salles={salles}
        />
        <TableauResultats titre="Résultat" data={resultatsData} salles={salles} />
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <button
          onClick={() => window.location.href = "/"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow"
        >
          ↩️ Page d&apos;accueil
        </button>
        <button
          onClick={() => generatePDF({ sallesSummary, apprenantsSummary, resultatsTable, resultatsFinalTable })}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow"
        >
          📄 Générer le PDF
        </button>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-md shadow"
        >
          💾 Enregistrer les modifications
        </button>
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md shadow"
        >
          🗑️ Réinitialiser
        </button>
      </div>
    </div>
  );
}
