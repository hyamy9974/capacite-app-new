import React from "react";
import { sommeColonne } from "../utils/calculs";

export default function TableauEffectif({ titre, specialties = [], data, onDataChange }) {
  const ajouterSpecialite = () => {
    const currentData = Array.isArray(data) ? data : [];
    const newData = [
      ...currentData,
      { specialite: "", groupes: 0, apprenants: 0 }
    ];
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const annuler = () => {
    if (data.length > 1) {
      onDataChange(data.slice(0, -1));
    } else {
      onDataChange([{ specialite: "", groupes: 0, apprenants: 0 }]);
    }
  };

  const handleChange = (index, field, value) => {
    try {
      const newRows = [...data];
      if (field === "specialite" && !specialties.some(s => s["Spécialité"] === value)) {
        throw new Error(`Invalid value selected for Spécialité: ${value}`);
      }
      newRows[index][field] = field === "specialite" ? value : Number(value);
      onDataChange(newRows);
    } catch (error) {
      alert("حدث خطأ أثناء تحديث البيانات. يُرجى التحقق من القيم المدخلة.");
    }
  };

  const totalGroupes = sommeColonne((data || []).map(e => Number(e.groupes) || 0));
  const totalApprenants = sommeColonne((data || []).map(e => Number(e.apprenants) || 0));

  const rows = data && data.length > 0 ? data : [{ specialite: "", groupes: 0, apprenants: 0 }];

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8 flex-1">
      <h2 className="text-xl font-bold text-gray-700 mb-4">{titre}</h2>
      <table className="w-full table-auto border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Spécialité</th>
            <th className="border p-2">Groupes</th>
            <th className="border p-2">Apprenants</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((eff, idx) => (
            <tr key={idx}>
              <td className="border p-2">
                <select
                  value={eff.specialite}
                  onChange={e => handleChange(idx, "specialite", e.target.value)}
                  className="w-full p-1 border rounded"
                >
                  <option value="">-- Choisir --</option>
                  {specialties.map(s => (
                    <option key={s["Spécialité"]} value={s["Spécialité"]}>
                      {s["Spécialité"]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  min={0}
                  value={eff.groupes}
                  onChange={e => handleChange(idx, "groupes", e.target.value)}
                  className="w-full p-1 border rounded"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  min={0}
                  value={eff.apprenants}
                  onChange={e => handleChange(idx, "apprenants", e.target.value)}
                  className="w-full p-1 border rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td className="border p-2 text-center">Total</td>
            <td className="border p-2 text-center">{totalGroupes}</td>
            <td className="border p-2 text-center">{totalApprenants}</td>
          </tr>
        </tfoot>
      </table>
      <div className="flex gap-4 mt-4 justify-center">
        <button
          className="bg-blue-500 text-white rounded px-3 py-1"
          onClick={ajouterSpecialite}
        >
          Ajouter spécialité
        </button>
        <button
          className="bg-gray-300 text-gray-700 rounded px-3 py-1"
          onClick={annuler}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}