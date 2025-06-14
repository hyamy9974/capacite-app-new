import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePDF({ sallesSummary, apprenantsSummary, resultatsTable }) {
  if (typeof window === 'undefined') return;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  // العنوان
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text("Rapport de diagnostic actuel de la capacité d'accueil", pageWidth / 2, 20, { align: 'center' });

  // معلومات عامة
  const nomStructure = localStorage.getItem('nomStructure') || 'Structure inconnue';
  const numEnregistrement = localStorage.getItem('numEnregistrement') || '---';
  const dateGeneration = new Date().toLocaleDateString();

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nom de la structure : ${nomStructure}`, 14, 30);
  pdf.text(`N° d'enregistrement : ${numEnregistrement}`, 14, 36);
  pdf.text(`Date de génération : ${dateGeneration}`, 14, 42);

  let currentY = 50;

  // جدول القاعات (ملخص)
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Synthèse des salles', 14, currentY);
  currentY += 4;
  autoTable(pdf, {
    startY: currentY,
    head: [['Type de salle', 'Nombre de salles', 'Moy. surface pédagogique', 'Nb max heures disponibles']],
    body: sallesSummary,
    styles: { fontSize: 9 },
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      currentY = data.cursor.y + 10;
    },
  });

  // جدول المتكونين (ملخص)
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Synthèse des apprenants', 14, currentY);
  currentY += 4;
  autoTable(pdf, {
    startY: currentY,
    head: [['Spécialité', 'Total groupes', 'Total apprenants', 'Total général']],
    body: apprenantsSummary,
    styles: { fontSize: 9 },
    theme: 'grid',
    headStyles: { fillColor: [39, 174, 96] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      currentY = data.cursor.y + 10;
    },
  });

  // جدول النتائج (عريض)
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tableau de résultats', 14, currentY);
  currentY += 4;
  autoTable(pdf, {
    startY: currentY,
    head: [resultatsTable.columns],
    body: resultatsTable.rows,
    styles: { fontSize: 10 },
    theme: 'grid',
    headStyles: { fillColor: [231, 76, 60] },
    margin: { left: 8, right: 8 }, // أجعل الجدول أعرض
    tableWidth: 'auto',
  });

  // Enregistrement du fichier
  const cleanTitle = "Rapport_de_diagnostic_actuel_de_la_capacité_d'accueil";
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `${cleanTitle}_${nomStructure.replace(/\s+/g, '_')}_${dateStr}.pdf`;

  pdf.save(fileName);
}