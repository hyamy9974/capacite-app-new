import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';

// تحميل صورة الشعار (base64) من public/logo.png
function loadLogoMinistere() {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = '/logo.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL('image/png');
      resolve(base64);
    };
    img.onerror = () => {
      reject('Failed to load logo image');
    };
  });
}

// إنشاء رسم بياني وتحويله إلى صورة Base64
async function createChartImage(labels, data, title, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;

  new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: title,
          data,
          backgroundColor: color,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(canvas.toDataURL('image/png'));
    }, 500); // مهلة قصيرة لضمان اكتمال الرسم
  });
}

export async function generatePDFWithCharts({
  totalHeuresTheo,
  totalHeuresPrat,
  totalHeuresTpSpec,
  besoinTheoTotal,
  besoinPratTotal,
  besoinTpSpecTotal,
  etatTheo,
  etatPrat,
  etatTpSpec,
  testGlobal,
}) {
  if (typeof window === 'undefined') return;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = 10;

  try {
    // --- تحميل الشعار ---
    const logoMinistere = await loadLogoMinistere();
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

    currentY += logoHeight + 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text("Direction Générale de l'Inspection et de l'Audite Pédagogique", pageWidth / 2, currentY, { align: 'center' });

    currentY += 12;
    pdf.setFontSize(16);
    pdf.text("Rapport de diagnostic de la capacité d'accueil", pageWidth / 2, currentY, { align: 'center' });

    currentY += 20;

    // --- الرسوم البيانية ---
    const charts = [
      {
        title: 'Théorique',
        labels: ['Besoin', 'Total'],
        data: [besoinTheoTotal, totalHeuresTheo],
        color: etatTheo === 'Excédent' ? 'green' : 'red',
        etat: etatTheo,
      },
      {
        title: 'Pratique',
        labels: ['Besoin', 'Total'],
        data: [besoinPratTotal, totalHeuresPrat],
        color: etatPrat === 'Excédent' ? 'green' : 'red',
        etat: etatPrat,
      },
      {
        title: 'TP Spécifique',
        labels: ['Besoin', 'Total'],
        data: [besoinTpSpecTotal, totalHeuresTpSpec],
        color: etatTpSpec === 'Excédent' ? 'green' : 'red',
        etat: etatTpSpec,
      },
    ];

    for (const chart of charts) {
      const imgBase64 = await createChartImage(chart.labels, chart.data, chart.title, chart.color);
      pdf.setFontSize(14);
      pdf.text(chart.title, 14, currentY);
      currentY += 5;

      pdf.addImage(imgBase64, 'PNG', 20, currentY, 170, 100);
      currentY += 105;

      pdf.setFontSize(12);
      pdf.setTextColor(chart.color === 'green' ? '0,128,0' : '255,0,0'); // أخضر أو أحمر
      pdf.text(`État: ${chart.etat}`, 14, currentY);
      currentY += 10;
    }

    // --- النتيجة النهائية ---
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(testGlobal === 'Excédent' ? '0,128,0' : '255,0,0'); // أخضر أو أحمر
    pdf.text(`Résultat Global: ${testGlobal}`, pageWidth / 2, currentY, { align: 'center' });

    // --- حفظ الملف ---
    const cleanTitle = "Rapport_de_diagnostic_de_la_capacité_d'accueil";
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${cleanTitle}_${dateStr}.pdf`;

    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('حدث خطأ أثناء توليد التقرير. يرجى المحاولة مرة أخرى.');
  }
}