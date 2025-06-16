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
    console.warn('⚠️ فشل تحميل الشعار من المسار: /logo.png');
    callback(null);
  };
}

export function generatePDF({ sallesSummary, apprenantsSummary, resultatsTable }) {
  if (typeof window === 'undefined') {
    alert('⚠️ لا يمكن توليد PDF - يتم تنفيذ الكود خارج المتصفح.');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  // --- التاريخ والتوقيت أعلى الصفحة على اليمين ---
  const dateTime = new Date().toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' •');
  pdf.setFontSize(10);
  pdf.text(dateTime, pageWidth - 14, 10, { align: 'right' });

  // --- تحميل الشعار ووضعه ---
  loadLogoMinistere((logoMinistere) => {
    let currentY = 10;
    if (logoMinistere) {
      pdf.addImage(logoMinistere, 'PNG', (pageWidth - 90) / 2, currentY, 90, 15);
    }
    currentY += 17; // مسافة بين الشعار والنص

    // --- إضافة النص تحت الشعار ---
    pdf.setFontSize(9);
    pdf.text(
      "Direction Générale de l'Inspection et de l'Audite Pédagogique",
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    currentY += 13; // مسافة بين النص والعنوان الرئيسي

    // --- العنوان الرئيسي ---
    pdf.setFontSize(16);
    pdf.text("Rapport de diagnostic de la capacité d'accueil", pageWidth / 2, currentY, { align: 'center' });

    // --- معلومات عامة ---
    const nomStructure = localStorage.getItem('nomStructure') || 'Structure inconnue';
    const numEnregistrement = localStorage.getItem('numEnregistrement') || '---';
    pdf.setFontSize(11);
    pdf.text(`Nom de la structure : ${nomStructure}`, 14, currentY + 10);
    pdf.text(`N° d'enregistrement : ${numEnregistrement}`, 14, currentY + 16);

    let tableStartY = currentY + 30;

    // --- ملخص القاعات ---
    if (sallesSummary && sallesSummary.length > 0) {
      pdf.setFontSize(13);
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
      });
      tableStartY = pdf.lastAutoTable.finalY + 10; // إضافة تباعد بعد الجدول
    } else {
      console.warn('⚠️ لم يتم العثور على بيانات ملخص القاعات.');
    }

    // --- ملخص المتعلمين ---
    if (apprenantsSummary && apprenantsSummary.length > 0) {
      pdf.setFontSize(13);
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
      });
      tableStartY = pdf.lastAutoTable.finalY + 10; // إضافة تباعد بعد الجدول
    } else {
      console.warn('⚠️ لم يتم العثور على بيانات ملخص المتعلمين.');
    }

    // --- ملخص النتائج (يدعم colSpan/سطر Résultat Global) ---
    if (resultatsTable && resultatsTable.rows.length > 0) {
      pdf.setFontSize(13);
      pdf.text('Synthèse des résultats', 14, tableStartY);
      tableStartY += 4;

      // تجهيز صفوف الجدول مع colSpan وstyling
      const body = resultatsTable.rows.map((row, idx) => {
        // إذا كان السطر الأخير (Résultat Global) وهو كائن colSpan
        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 3) {
          return [
            {
              content: row[0].value,
              colSpan: 3,
              styles: { halign: 'center', fontStyle: 'bold', textColor: [33,33,33], fillColor: [245,245,245] }
            },
            {
              content: row[1],
              styles: {
                fillColor: row[1] === 'Excédent' ? [39, 174, 96] : [231, 76, 60],
                textColor: [255,255,255],
                fontStyle: 'bold'
              }
            }
          ];
        }
        // بقية الصفوف: تلوين كلمة Excédent/Dépassement فقط في العمود الرابع
        return row.map((cell, colIdx) => {
          if (colIdx === 3) {
            return {
              content: cell,
              styles: {
                textColor: cell === 'Excédent' ? [39, 174, 96] : [231, 76, 60],
                fontStyle: 'bold'
              }
            };
          }
          return { content: cell };
        });
      });

      autoTable(pdf, {
        startY: tableStartY,
        head: [resultatsTable.columns],
        body: body,
        styles: { fontSize: 9, halign: 'center', valign: 'middle' },
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60] },
        margin: { left: 14, right: 14 },
      });
      tableStartY = pdf.lastAutoTable.finalY + 10;
    } else {
      console.warn('⚠️ لم يتم العثور على بيانات ملخص النتائج.');
    }

    // --- حفظ الملف ---
    const cleanTitle = "Rapport_de_diagnostic";
    const dateStr = new Date().toISOString().split('T')[0];
    pdf.save(`${cleanTitle}_${dateStr}.pdf`);
  });
}