import jsPDF from "jspdf";
import "jspdf-autotable";

export function generatePDF({ sallesSummary, apprenantsSummary, resultatsTable }) {
  const doc = new jsPDF();

  const marginLeft = 15;
  let y = 20;

  // عنوان التقرير
  doc.setFontSize(16);
  doc.text("Rapport de diagnostic de la capacité d'accueil actuelle", marginLeft, y);
  y += 10;

  // دالة لإنشاء جدول
  function createTable(title, columns, rows, startY) {
    doc.setFontSize(12);
    doc.text(title, marginLeft, startY);
    doc.autoTable({
      startY: startY + 5,
      margin: { left: marginLeft },
      head: [columns],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 2 },
      didDrawPage: (data) => {
        // لتحديث الموضع عند الحاجة، لكن هنا نستخدم y منفصل لكل جدول
      },
    });
    return doc.previousAutoTable.finalY;
  }

  // جدول ملخص القاعات (Salles)
  const sallesColumns = ["Type de Salle", "Nombre", "Surface Moyenne (m²)", "Total Heures"];
  const sallesRows = sallesSummary; // مفترض أن يكون مصفوفة من الصفوف، مثل [["Théorie", 3, "24.5", 1680], ...]

  y = createTable("Synthèse des Salles", sallesColumns, sallesRows, y) + 10;

  // جدول ملخص المتعلمين (Apprenants)
  const apprenantsColumns = ["Spécialité", "Groupes", "Apprenants", "Total"];
  const apprenantsRows = apprenantsSummary; // [["Info", 5, 120, 125], ...]

  y = createTable("Synthèse des Apprenants", apprenantsColumns, apprenantsRows, y) + 10;

  // جدول ملخص النتائج (Resultats)
  const resultatsColumns = resultatsTable.columns;
  const resultatsRows = resultatsTable.rows;

  y = createTable("Synthèse des Résultats", resultatsColumns, resultatsRows, y) + 10;

  // عرض نتيجة نهائية (Excédent أو Dépassement)
  const resultatFinalIndex = resultatsColumns.indexOf("Résultat Final");
  if (resultatFinalIndex >= 0 && resultatsRows.length > 0) {
    const finalResult = resultatsRows[0][resultatFinalIndex];
    doc.setFontSize(14);
    doc.setTextColor(finalResult === "Excédent" ? "green" : "red");
    doc.text(`Résultat global : ${finalResult}`, marginLeft, y);
  }

  doc.save("rapport_capacite_accueil.pdf");
}
