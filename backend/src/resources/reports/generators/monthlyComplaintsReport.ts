import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

interface MonthlyData {
  month: string;
  complaints: number;
}

interface GeneratePDFReportParams {
  data: MonthlyData[];
  res: Response;
}

export async function generateMonthlyComplaintReport({
  data,
  res,
}: GeneratePDFReportParams) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename=reclamacoes-por-mes.pdf',
  );

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc
    .fontSize(20)
    .fillColor('#2E65BD')
    .text('Relatório de Reclamações por Mês', { align: 'center' });
  doc.moveDown(1.5);
  doc.fillColor('#000000');

  const pageWidth = doc.page.width;
  const margin = doc.page.margins.left;
  const usableWidth = pageWidth - margin * 2;

  const startX = margin;
  const startY = doc.y + 10;
  const colWidth = usableWidth / 2;
  const rowHeight = 25;

  doc.rect(startX, startY, usableWidth, rowHeight).fill('#2E65BD').stroke();

  doc
    .fillColor('#FFFFFF')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Mês', startX + 10, startY + 7, { width: colWidth - 20 })
    .text('Quantidade', startX + colWidth + 10, startY + 7, {
      width: colWidth - 20,
      align: 'right',
    });

  doc.fillColor('#000000').font('Helvetica');

  let currentY = startY + rowHeight;
  let total = 0;

  data.forEach((item, index) => {
    const isEven = index % 2 === 0;

    doc
      .rect(startX, currentY, usableWidth, rowHeight)
      .fill(isEven ? '#F4F6FA' : '#FFFFFF')
      .strokeColor('#DDDDDD')
      .stroke();

    doc
      .fillColor('#000000')
      .fontSize(11)
      .text(item.month, startX + 10, currentY + 7, { width: colWidth - 20 })
      .text(item.complaints.toString(), startX + colWidth + 10, currentY + 7, {
        width: colWidth - 20,
        align: 'right',
      });

    total += item.complaints;
    currentY += rowHeight;
  });

  doc.rect(startX, currentY, usableWidth, rowHeight).fill('#E1E8F5').stroke();

  doc
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text('Total', startX + 10, currentY + 7, { width: colWidth - 20 })
    .text(total.toString(), startX + colWidth + 10, currentY + 7, {
      width: colWidth - 20,
      align: 'right',
    });

  doc.moveDown(3);

  doc.addPage();
  doc
    .fontSize(16)
    .fillColor('#2E65BD')
    .text('Gráfico de Reclamações por Mês', { align: 'center' });
  doc.moveDown(1.5);

  const chart = new ChartJSNodeCanvas({ width: 800, height: 400 });
  const chartImage = await chart.renderToBuffer({
    type: 'bar',
    data: {
      labels: data.map((d) => d.month),
      datasets: [
        {
          label: 'Reclamações',
          data: data.map((d) => d.complaints),
          backgroundColor: '#2E65BD',
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });

  doc.image(chartImage, {
    fit: [500, 250],
    align: 'center',
    valign: 'center',
  });

  doc.end();
}
