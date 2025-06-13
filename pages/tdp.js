import React, { useState } from "react";
import { generatePDF } from "@/components/generatePDF";
import TableauSalles from "@/components/TableauSalles";
import TableauEffectif from "@/components/TableauEffectif";
import TableauRepartition from "@/components/TableauRepartition";
import TableauResultat from "@/components/TableauResultat";
import { Button } from "@/components/ui/button";

export default function TDP() {
  const [sallesTheoriques, setSallesTheoriques] = useState([]);
  const [sallesPratiques, setSallesPratiques] = useState([]);
  const [effectif, setEffectif] = useState([]);
  const [repartition, setRepartition] = useState([]);

  const handleGeneratePDF = () => {
    const titre = "Rapport de diagnostic de la capacité d'accueil prévue";

    const tables = [
      {
        title: "Salles Théoriques",
        columns: ["Type", "Surface pédagogique", "Heures disponibles"],
        rows: sallesTheoriques.map((s) => [
          s.type,
          s.surface,
          s.heures,
        ]),
      },
      {
        title: "Salles Pratiques",
        columns: ["Type", "Surface pédagogique", "Heures disponibles"],
        rows: sallesPratiques.map((s) => [
          s.type,
          s.surface,
          s.heures,
        ]),
      },
      {
        title: "Effectif Prévu",
        columns: ["Nom", "Nombre"],
        rows: effectif.map((e) => [e.nom, e.nombre]),
      },
      {
        title: "Répartition prévue des heures",
        columns: ["Nom", "Heures Théoriques", "Heures Pratiques"],
        rows: repartition.map((r) => [
          r.nom,
          r.heuresTheoriques,
          r.heuresPratiques,
        ]),
      },
      {
        title: "Résultat",
        columns: ["Formation", "État prévu"],
        rows: [["Formation 1", "Suffisante"]],
      },
    ];

    generatePDF({ titre, tables });
  };

  const handleSaveData = () => {
    localStorage.setItem("tdp_sallesTheoriques", JSON.stringify(sallesTheoriques));
    localStorage.setItem("tdp_sallesPratiques", JSON.stringify(sallesPratiques));
    localStorage.setItem("tdp_effectif", JSON.stringify(effectif));
    localStorage.setItem("tdp_repartition", JSON.stringify(repartition));
    alert("Les données ont été enregistrées !");
  };

  const handleClearData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer toutes les données ?")) {
      localStorage.removeItem("tdp_sallesTheoriques");
      localStorage.removeItem("tdp_sallesPratiques");
      localStorage.removeItem("tdp_effectif");
      localStorage.removeItem("tdp_repartition");
      setSallesTheoriques([]);
      setSallesPratiques([]);
      setEffectif([]);
      setRepartition([]);
    }
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold text-center">
        {"Rapport de l'état d'accueil prévu"}
      </h1>

      <TableauSalles
        type="théorique"
        data={sallesTheoriques}
        setData={setSallesTheoriques}
        localStorageKey="tdp_sallesTheoriques"
      />
      <TableauSalles
        type="pratique"
        data={sallesPratiques}
        setData={setSallesPratiques}
        localStorageKey="tdp_sallesPratiques"
      />
      <TableauEffectif
        data={effectif}
        setData={setEffectif}
        localStorageKey="tdp_effectif"
      />
      <TableauRepartition
        data={repartition}
        setData={setRepartition}
        localStorageKey="tdp_repartition"
      />
      <TableauResultat />

      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={handleGeneratePDF}>Télécharger le rapport PDF</Button>
        <Button onClick={handleSaveData}>Enregistrer les données</Button>
        <Button variant="destructive" onClick={handleClearData}>
          Effacer les données
        </Button>
      </div>
    </div>
  );
}
