// components/generatePDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePDF({ titre, tables }) {
  if (typeof window === 'undefined') return; // Empêcher l'exécution côté serveur

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Titre principal
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(titre, pageWidth / 2, 20, { align: 'center' });

  // Informations générales
  const nomStructure = localStorage.getItem('nomStructure') || 'Structure inconnue';
  const numEnregistrement = localStorage.getItem('numEnregistrement') || '---';
  const dateGeneration = new Date().toLocaleDateString();

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nom de la structure : ${nomStructure}`, 14, 30);
  pdf.text(`N° d'enregistrement : ${numEnregistrement}`, 14, 36);
  pdf.text(`Date de génération : ${dateGeneration}`, 14, 42);

  let currentY = 50;

  // Parcours et affichage des tableaux
  tables.forEach((table) => {
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(table.title, 14, currentY);
    currentY += 4;

    autoTable(pdf, {
      startY: currentY,
      head: [table.columns],
      body: table.rows,
      styles: { fontSize: 9 },
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        currentY = data.cursor.y + 10;
      },
    });
  });

  // Enregistrement du fichier
  const cleanTitle = titre.replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `${cleanTitle}_${nomStructure.replace(/\s+/g, '_')}_${dateStr}.pdf`;

  pdf.save(fileName);
}
