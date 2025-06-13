import { useRef, useState, useEffect } from "react";
import TableauSalles from "../components/TableauSalles";
import TableauEffectif from "../components/TableauEffectif";
import TableauRepartition from "../components/TableauRepartition";
import TableauResultats from "../components/TableauResultats";
import useSpecialties from "../components/useSpecialties";
import { generatePDF } from "../components/generatePDF"; // نفس دالة PDF المستخدمة في tda.js

// دوال مساعدة
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

export default function TDP() {
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

  // تحميل البيانات من localStorage عند التشغيل
  useEffect(() => {
    const saved = localStorage.getItem("tdpData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSalles(parsed.salles);
      setEffectif(parsed.effectif);
      setRepartition(parsed.repartition);
    }
  }, []);

  // ملخصات القاعات
  const totalHeuresTheo = somme(salles.theorie.map(s => Number(s.heuresMax) || 0));
  const totalHeuresPrat = somme(salles.pratique.map(s => Number(s.heuresMax) || 0));
  const totalHeuresTpSpec = somme(salles.tpSpecifiques.map(s => Number(s.heuresMax) || 0));
  const moyenneSurfaceTheo = moyenne(salles.theorie.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfacePrat = moyenne(salles.pratique.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfaceTpSpec = moyenne(salles.tpSpecifiques.map(s => Number(s.surfaceP) || 0));

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
      moyenneTpSpec: r.moyenneTpSpecParGroupe ?? 0,
    });
  };

  // حفظ البيانات في localStorage
  const handleSave = () => {
    const data = { salles, effectif, repartition };
    localStorage.setItem("tdpData", JSON.stringify(data));
    alert("Les données ont été enregistrées !");
  };

  // إعادة التهيئة
  const handleReset = () => {
    localStorage.removeItem("tdpData");
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div ref={pdfRef}>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Test de Dépassement Prévisionnel
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
          titre="Effectif Prévisionnel"
          specialties={specialties}
          modeActuel={false}
          onDataChange={handleEffectifChange}
          data={effectif}
          salles={salles}
        />
        <TableauRepartition
          titre="Répartition prévisionnelle des heures"
          effectifData={effectif}
          specialties={specialties}
          onDataChange={handleRepartitionChange}
          salles={salles}
        />
        <TableauResultats titre="Résultat" data={resultatsData} salles={salles} />
      </div>

      {/* أزرار في صف أفقي */}
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <button
          onClick={() => window.location.href = "/"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow"
        >
          Page d&apos;accueil
        </button>
        <button
          onClick={() => generatePDF({ titre: "Test de Dépassement Prévisionnel", ref: pdfRef })}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow"
        >
          Générer le PDF
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
