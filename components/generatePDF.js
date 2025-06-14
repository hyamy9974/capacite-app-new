import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// تحميل صورة الشعار (base64) من public/logo.png
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

export function generatePDF({ sallesSummary, apprenantsSummary, resultatsTable }) {
  if (typeof window === 'undefined') return;

  loadLogoMinistere((logoMinistere) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    // --- إعداد الشعار في الوسط مع مضاعفة الطول ---
    let currentY = 10;
    const logoWidth = 30;
    const logoHeight = 50; // مضاعفة الطول ليصبح الشعار أوضح
    if (logoMinistere) {
      pdf.addImage(
        logoMinistere,
        'PNG',
        (pageWidth - logoWidth) / 2, // في الوسط
        currentY,
        logoWidth,
        logoHeight
      );
    }

    // --- نص الإدارة العامة بالفرنسية تحت الشعار في الوسط وبحجم أصغر ---
    currentY += logoHeight + 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10); // أصغر من السابق
    pdf.text(
      "Direction Générale de l'Inspection et de l'Audite Pédagogique",
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );

    // --- مسافة بين الشعار/الادارة والعنوان ---
    currentY += 12;

    // --- العنوان الرئيسي ---
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      "Rapport de diagnostic de la capacité d'accueil",
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );

    // --- معلومات عامة ---
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

    // --- جدول المتكونين (ملخص) ---
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Synthèse des apprenants', 14, tableStartY);
    tableStartY += 4;
    autoTable(pdf, {
      startY: tableStartY,
      head: [['Spécialité', 'Total groupes', 'Total apprenants', 'Total général']],
      body: apprenantsSummary,
      styles: { fontSize: 9 },
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        tableStartY = data.cursor.y + 10;
      },
    });

    // --- جدول النتائج (عريض) ---
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tableau de résultats', 14, tableStartY);
    tableStartY += 4;
    autoTable(pdf, {
      startY: tableStartY,
      head: [resultatsTable.columns],
      body: resultatsTable.rows,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60] },
      margin: { left: 8, right: 8 },
      tableWidth: 'auto',
    });

    // --- حفظ الملف ---
    const cleanTitle = "Rapport_de_diagnostic_de_la_capacité_d'accueil";
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${cleanTitle}_${nomStructure.replace(/\s+/g, '_')}_${dateStr}.pdf`;

    pdf.save(fileName);
  });
}