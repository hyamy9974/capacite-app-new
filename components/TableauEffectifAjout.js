import React from "react";
import { sommeColonne } from "../utils/calculs";

export default function TableauEffectifAjout({
  titre,
  specialties = [],
  data,
  onDataChange,
  moyenneSurfaceTheo = 0
}) {
  // إضافة خانة Ajout لكل تخصص
  const ajouterSpecialite = () => {
    const currentData = Array.isArray(data) ? data : [];
    const newData = [
      ...currentData,
      { specialite: "", groupes: 0, groupesAjout: 0, apprenants: 0 }
    ];
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const annuler = () => {
    if (data.length > 1) {
      onDataChange(data.slice(0, -1));
    } else {
      onDataChange([{ specialite: "", groupes: 0, groupesAjout: 0, apprenants: 0 }]);
    }
  };

  const handleChange = (index, field, value) => {
    const newRows = [...data];
    if (field === "specialite") {
      newRows[index][field] = value;
    } else {
      newRows[index][field] = Number(value);
    }
    // إذا كان التغيير في groupesAjout يجب تحديث apprenantsAjout تلقائياً
    if (field === "groupesAjout") {
      newRows[index].apprenantsAjout = Number(value) * (Number(moyenneSurfaceTheo) || 0);
    }
    onDataChange(
      newRows.map(row => ({
        ...row,
        groupesAjout: Number(row.groupesAjout) || 0,
        apprenantsAjout: Number(row.groupesAjout || 0) * (Number(moyenneSurfaceTheo) || 0)
      }))
    );
  };

  // تجهيز بيانات الأعمدة
  const rows = (data && data.length > 0
    ? data
    : [{ specialite: "", groupes: 0, groupesAjout: 0, apprenants: 0 }]
  ).map(row => ({
    ...row,
    groupes: Number(row.groupes) || 0,
    groupesAjout: Number(row.groupesAjout) || 0,
    apprenants: Number(row.apprenants) || 0,
    apprenantsAjout: Number(row.groupesAjout || 0) * (Number(moyenneSurfaceTheo) || 0)
  }));

  // جمع الأعمدة
  const totalGroupes = sommeColonne(rows.map(e => e.groupes));
  const totalGroupesAjout = sommeColonne(rows.map(e => e.groupesAjout));
  const totalGroupesAll = totalGroupes + totalGroupesAjout;

  const totalApprenants = sommeColonne(rows.map(e => e.apprenants));
  const totalApprenantsAjout = sommeColonne(rows.map(e => e.apprenantsAjout));
  const totalApprenantsAll = totalApprenants + totalApprenantsAjout;

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8 flex-1">
      <h2 className="text-xl font-bold text-gray-700 mb-4">{titre}</h2>
      <table className="w-full table-auto border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2 align-bottom" rowSpan={2}>Spécialité</th>
            <th className="border p-2 text-center" colSpan={2}>Groupes</th>
            <th className="border p-2 text-center" colSpan={2}>Apprenants</th>
          </tr>
          <tr>
            <th className="border p-2 text-center">Existant</th>
            <th className="border p-2 text-center">Ajout</th>
            <th className="border p-2 text-center">Existant</th>
            <th className="border p-2 text-center">Ajout</th>
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
                  value={eff.groupesAjout}
                  onChange={e => handleChange(idx, "groupesAjout", e.target.value)}
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
              <td className="border p-2 bg-gray-50 text-center">
                {/* Apprenants Ajout محسوبة تلقائيا */}
                {eff.apprenantsAjout}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td className="border p-2 text-center">Total</td>
            <td className="border p-2 text-center">{totalGroupes}</td>
            <td className="border p-2 text-center">{totalGroupesAjout}</td>
            <td className="border p-2 text-center">{totalApprenants}</td>
            <td className="border p-2 text-center">{totalApprenantsAjout}</td>
          </tr>
          <tr className="bg-gray-200 font-bold">
            <td className="border p-2 text-center">Total général</td>
            <td className="border p-2 text-center" colSpan={2}>{totalGroupesAll}</td>
            <td className="border p-2 text-center" colSpan={2}>{totalApprenantsAll}</td>
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