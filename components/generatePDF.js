import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function loadLogoMinistere(callback) {
  const img = new window.Image();
  img.src = '/logo.png';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const base64 = canvas.toDataURL('image/png');
    callback(base64);
  };
  img.onerror = () => {
    callback(null);
  };
}

export function generatePDF({ sallesSummary, apprenantsSummary, resultats }) {
  if (typeof window === 'undefined') return;

  loadLogoMinistere((logoMinistere) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();

      // --- الشعار في الوسط ---
      let currentY = 10;
      const logoWidth = 90;
      const logoHeight = 15;
      if (logoMinistere) {
        pdf.addImage(
          logoMinistere,
          'PNG',
          (pageWidth - logoWidth) / 2,
          currentY,
          logoWidth,
          logoHeight
        );
      }

      // --- نص الإدارة العامة بالفرنسية تحت الشعار في الوسط وبحجم أصغر ---
      currentY += logoHeight + 3;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text(
        "Direction Générale de l'Inspection et de l'Audite Pédagogique",
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );

      currentY += 12;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(
        "Rapport de diagnostic de la capacité d'accueil",
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );

      const nomStructure = localStorage.getItem('nomStructure') || 'Structure inconnue';
      const numEnregistrement = localStorage.getItem('numEnregistrement') || '---';
      const dateGeneration = new Date().toLocaleDateString();

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nom de la structure : ${nomStructure}`, 14, currentY + 10);
      pdf.text(`N° d'enregistrement : ${numEnregistrement}`, 14, currentY + 16);
      pdf.text(`Date de génération : ${dateGeneration}`, 14, currentY + 22);

      let tableStartY = currentY + 30;

      // --- جدول القاعات (ملخص) ---
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Synthèse des salles', 14, tableStartY);
      tableStartY += 4;
      autoTable(pdf, {
        startY: tableStartY,
        head: [['Type de salle', 'Nombre de salles', 'Moy. surface pédagogique', 'Nb max heures disponibles']],
        body: sallesSummary,
        styles: { fontSize: 9 },
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          tableStartY = data.cursor.y + 10;
        },
      });

      // --- جدول المتكونين (ملخص) بدون عمود Total général ---
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Synthèse des apprenants', 14, tableStartY);

      const apprenantsHeader = ['Spécialité', 'Total groupes', 'Total apprenants'];
      const apprenantsBody = apprenantsSummary.map(row => row.slice(0, 3));

      tableStartY += 4;
      autoTable(pdf, {
        startY: tableStartY,
        head: [apprenantsHeader],
        body: apprenantsBody,
        styles: { fontSize: 9 },
        theme: 'grid',
        headStyles: { fillColor: [39, 174, 96] },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          tableStartY = data.cursor.y + 10;
        },
      });

      // --- جدول النتائج (Résultats) ---
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résultats', 14, tableStartY);

      let resultatsHeader = [];
      let resultatsBody = [];
      try {
        const colonnesASupprimer = ['heures restantes', 'apprenants possibles'];
        const idxASupprimer = resultats.columns
          .map((col, idx) =>
            colonnesASupprimer.some(sup => col && col.trim().toLowerCase().includes(sup)) ? idx : -1
          )
          .filter(idx => idx !== -1);

        resultatsHeader = resultats.columns.filter((_, idx) => !idxASupprimer.includes(idx));
        resultatsBody = resultats.rows.map(row =>
          row.filter((_, idx) => !idxASupprimer.includes(idx))
        );
      } catch (e) {
        console.warn('خطأ في تجهيز جدول النتائج:', e);
      }

      tableStartY += 4;
      if (
        resultatsHeader.length > 0 &&
        resultatsBody.length > 0 &&
        resultatsBody.some(row => row.length > 0)
      ) {
        autoTable(pdf, {
          startY: tableStartY,
          head: [resultatsHeader],
          body: resultatsBody,
          styles: { fontSize: 10 },
          theme: 'grid',
          headStyles: { fillColor: [231, 76, 60] },
          margin: { left: 8, right: 8 },
          tableWidth: 'auto',
          didDrawPage: (data) => {
            tableStartY = data.cursor.y + 10;
          },
        });
      } else {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          'Aucun résultat à afficher.',
          pageWidth / 2,
          tableStartY + 10,
          { align: 'center' }
        );
      }

      // --- حفظ الملف ---
      const cleanTitle = "Rapport_de_diagnostic_de_la_capacité_d'accueil";
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${cleanTitle}_${nomStructure.replace(/\s+/g, '_')}_${dateStr}.pdf`;

      pdf.save(fileName);
    } catch (e) {
      alert("حدث خطأ أثناء توليد التقرير: " + (e.message || e));
      console.error(e);
    }
  });
}