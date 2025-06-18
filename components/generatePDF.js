import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// تحميل صورة الشعار (base64) من public/logo.png
function loadLogoMinistere(callback) {
  const img = new window.Image();
  img.src = '/logo1.png';
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
  const pageHeight = pdf.internal.pageSize.getHeight();

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

  // --- ترقيم الصفحات (يتم إضافته بعد الانتهاء) ---
  const totalPagesExp = "{total_pages_count_string}";

  // --- تحميل الشعار ووضعه ---
  loadLogoMinistere((logoMinistere) => {
    let currentY = 10;
    if (logoMinistere) {
      pdf.addImage(logoMinistere, 'PNG', (pageWidth - 68) / 2, currentY, 68, 38);
    }
    currentY += 38;

    // --- النص تحت الشعار ---
    pdf.setFontSize(7);
    pdf.text(
      "Direction Générale de l'Inspection et de l'Audit Pédagogique",
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    currentY += 13;

    // --- إطار العنوان الرئيسي ---
    const title = "Rapport de diagnostic de la capacité d'accueil";
    const paddingH = 5;
    const paddingV = 3;
    pdf.setFontSize(15);
    pdf.setDrawColor(41, 128, 185);
    pdf.setFillColor(230, 240, 255);
    const textWidth = pdf.getTextWidth(title);
    const rectX = (pageWidth - textWidth) / 2 - paddingH;
    const rectY = currentY - 10;
    const rectWidth = textWidth + 2 * paddingH;
    const rectHeight = 10 + 2 * paddingV;
    pdf.roundedRect(rectX, rectY, rectWidth, rectHeight, 2, 2, 'FD');
    pdf.setTextColor(41, 128, 185);
    pdf.text(title, pageWidth / 2, currentY, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    currentY += 15;

    // --- معلومات عامة ---
    const nomStructure = localStorage.getItem('nomStructure') || 'Structure inconnue';
    const numEnregistrement = localStorage.getItem('numEnregistrement') || '---';
    pdf.setFontSize(10);
    pdf.text(`Nom de la structure : ${nomStructure}`, 14, currentY);
    pdf.text(`N° d'enregistrement : ${numEnregistrement}`, 14, currentY + 6);

    let tableStartY = currentY + 15;

    // دالة لفحص هل هناك مساحة كافية على الصفحة للرسم قبل أن نبدأ الجدول (لكي لا ينقسم بداية الجدول)
    function hasSpaceForTable(requiredHeight) {
      return (pageHeight - tableStartY) >= requiredHeight;
    }

    // --- ملخص القاعات ---
    if (sallesSummary && sallesSummary.length > 0) {
      pdf.setFontSize(11);
      pdf.text('Synthèse des salles', 14, tableStartY);
      tableStartY += 4;

      // حساب ارتفاع الجدول تقريبا
      const rowsCount = sallesSummary.length + 1; // +1 للرأس
      const approxRowHeight = 7; // تقديري لكل صف
      const requiredHeight = rowsCount * approxRowHeight + 10;

      if (!hasSpaceForTable(requiredHeight)) {
        pdf.addPage();
        tableStartY = 20; // بداية رسم جديد في صفحة جديدة
      }

      autoTable(pdf, {
        startY: tableStartY,
        head: [['Type de salle', 'Nombre de salles', 'Moy. surface pédagogique', 'Nb max heures disponibles']],
        body: sallesSummary,
        styles: { fontSize: 9 },
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
      });
      tableStartY = pdf.lastAutoTable.finalY + 10;
    } else {
      console.warn('⚠️ لم يتم العثور على بيانات ملخص القاعات.');
    }

    // --- ملخص المتعلمين ---
    if (apprenantsSummary && apprenantsSummary.length > 0) {
      pdf.setFontSize(11);
      pdf.text('Synthèse des apprenants', 14, tableStartY);
      const apprenantsHeader = ['Spécialité', 'Total groupes', 'Total apprenants'];
      const apprenantsBody = apprenantsSummary.map(row => row.slice(0, 3));
      tableStartY += 4;

      const rowsCount = apprenantsBody.length + 1;
      const approxRowHeight = 7;
      const requiredHeight = rowsCount * approxRowHeight + 10;

      if (!hasSpaceForTable(requiredHeight)) {
        pdf.addPage();
        tableStartY = 20;
      }

      autoTable(pdf, {
        startY: tableStartY,
        head: [apprenantsHeader],
        body: apprenantsBody,
        styles: { fontSize: 9 },
        theme: 'grid',
        headStyles: { fillColor: [255, 165, 0] },
        margin: { left: 14, right: 14 },
      });
      tableStartY = pdf.lastAutoTable.finalY + 10;
    } else {
      console.warn('⚠️ لم يتم العثور على بيانات ملخص المتعلمين.');
    }

    // --- ملخص النتائج ---
    if (resultatsTable && resultatsTable.rows.length > 0) {
      pdf.setFontSize(11);
      pdf.text('Synthèse des résultats', 14, tableStartY);
      tableStartY += 4;

      // حساب ارتفاع الجدول تقريبا
      const rowsCount = resultatsTable.rows.length + 1;
      const approxRowHeight = 7;
      const requiredHeight = rowsCount * approxRowHeight + 10;

      if (!hasSpaceForTable(requiredHeight)) {
        pdf.addPage();
        tableStartY = 20;
      }

      const body = resultatsTable.rows.map((row, idx) => {
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
        headStyles: { fillColor: [155, 89, 182] },
        margin: { left: 14, right: 14 },
      });
      tableStartY = pdf.lastAutoTable.finalY + 10;

      // --- النص التوضيحي أسفل النتائج ---
      pdf.setFontSize(10);
      pdf.setTextColor(80);
      pdf.setFont(undefined, 'normal');
      pdf.text(
        "Remarques:\n" +
        "1. Ce rapport propose une estimation diagnostique de la capacité d'accueil, basée sur les données saisies. C'est un outil d'aide à la décision pour optimiser la planification, et non une validation définitive.\n" +
        "2. Les résultats de l'étude précitée demeurent tributaires de la disponibilité des éléments suivants :\n" +
        "- Équipe de formateurs adéquate aux groupes et spécialités.\n" +
        "- Certificat de prévention des risques de la Protection Civile.\n" +
        "- Voies de circulation et système de ventilation adéquats\n" +
        "- Équipements nécessaires selon la spécificité des spécialités",
        14,
        tableStartY,
        { maxWidth: pageWidth - 28, align: 'left' }
      );
    } else {
      console.warn('⚠️ لم يتم العثور على بيانات ملخص النتائج.');
    }

    // --- ترقيم الصفحات في كل صفحة ---
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`Page ${i} / ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    // --- حفظ الملف ---
    const cleanTitle = "Rapport_de_diagnostic";
    const dateStr = new Date().toISOString().split('T')[0];
    pdf.save(`${cleanTitle}_${dateStr}.pdf`);
  });
}
