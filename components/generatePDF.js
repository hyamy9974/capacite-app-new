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
    alert('⚠️ فشل تحميل الشعار من المسار: /logo.png');
    callback(null);
  };
}

export function generatePDF({ sallesSummary, apprenantsSummary, resultats }) {
  if (typeof window === 'undefined') {
    alert('⚠️ لا يمكن توليد PDF - يتم تنفيذ الكود خارج المتصفح.');
    return;
  }

  alert('✅ بدأ توليد ملف PDF.');

  loadLogoMinistere((logoMinistere) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    // --- الشعار ---
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
    } else {
      alert('⚠️ لم يتم تحميل الشعار، سيتم متابعة التوليد بدون الشعار.');
    }

    currentY += logoHeight + 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text("Direction Générale de l'Inspection et de l'Audite Pédagogique", pageWidth / 2, currentY, { align: 'center' });

    currentY += 12;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Rapport de diagnostic de la capacité d'accueil", pageWidth / 2, currentY, { align: 'center' });

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

    // --- Synthèse des salles ---
    if (sallesSummary && sallesSummary.length > 0) {
      alert('✅ تم العثور على بيانات ملخص القاعات.');
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
    } else {
      alert('⚠️ لم يتم العثور على بيانات ملخص القاعات.');
    }

    // --- Synthèse des apprenants ---
    if (apprenantsSummary && apprenantsSummary.length > 0) {
      alert('✅ تم العثور على بيانات ملخص المتعلمين.');
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
    } else {
      alert('⚠️ لم يتم العثور على بيانات ملخص المتعلمين.');
    }

    // --- Résultats ---
    if (resultats && Array.isArray(resultats.columns) && Array.isArray(resultats.rows)) {
      alert('✅ تم العثور على بيانات النتائج.');
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résultats', 14, tableStartY);

      let resultatsHeader = [];
      let resultatsBody = [];
      const colonnesASupprimer = ["heures restantes", "apprenants possibles"];
      const idxASupprimer = resultats.columns
        .map((col, idx) =>
          colonnesASupprimer.some(sup => col && col.trim().toLowerCase().includes(sup)) ? idx : -1
        )
        .filter(idx => idx !== -1);

      resultatsHeader = resultats.columns.filter((_, idx) => !idxASupprimer.includes(idx));
      resultatsBody = resultats.rows.map(row =>
        row.filter((_, idx) => !idxASupprimer.includes(idx))
      );

      tableStartY += 4;
      autoTable(pdf, {
        startY: tableStartY,
        head: [resultatsHeader],
        body: resultatsBody,
        styles: { fontSize: 10 },
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60] }, // أحمر
        margin: { left: 8, right: 8 },
        tableWidth: 'auto',
        didDrawPage: (data) => {
          tableStartY = data.cursor.y + 10;
        },
      });
    } else {
      alert('⚠️ لم يتم العثور على بيانات النتائج.');
    }

    // --- حفظ الملف ---
    alert('✅ يتم الآن حفظ الملف.');
    const cleanTitle = "Rapport_de_diagnostic_de_la_capacité_d'accueil";
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${cleanTitle}_${nomStructure.replace(/\s+/g, '_')}_${dateStr}.pdf`;

    pdf.save(fileName);
    alert('✅ تم حفظ ملف PDF بنجاح.');
  });
}