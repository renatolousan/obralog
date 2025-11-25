import PDFDocument from 'pdfkit';
import { getDevelopmentSummaryData } from '../../developments/service';
import { Response } from 'express';
import { summarizeDevelopmentStatistics } from '../../ai/service';
import { getDevelopmentComplaintsForSummary } from '../../complaints/service';

interface GenerateDevelopmentSummaryParams {
  developmentId: string;
  res: Response;
}

export async function generateDevelopmentSummaryPDF({
  developmentId,
  res,
}: GenerateDevelopmentSummaryParams) {
  const summaryData = await getDevelopmentSummaryData(developmentId);

  if (!summaryData || !summaryData.obra) {
    res.status(400).json({ error: 'Development data not found' });
    return;
  }

  const complaints = await getDevelopmentComplaintsForSummary(developmentId);

  const summaryText =
    (await summarizeDevelopmentStatistics(summaryData)) ||
    'Resumo não disponível.';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename=relatorio-${summaryData.obra.nome}.pdf`,
  );

  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    info: {
      Title: `Relatório da Obra - ${summaryData.obra.nome}`,
      Author: 'Sistema de Gestão de Obras',
    },
  });

  doc.pipe(res);

  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('Relatório Geral da Obra', { align: 'center' })
    .moveDown(0.5);

  doc
    .font('Helvetica')
    .fontSize(14)
    .text(summaryData.obra.nome, { align: 'center' })
    .moveDown(1.5);

  doc.font('Helvetica-Bold').fontSize(14).text('Reclamações e Visitas', {
    align: 'left',
  });
  doc.moveDown(0.5);

  const startX = doc.page.margins.left;
  let y = doc.y;
  const [colItem, colSupplier, colDate, colCost] = [150, 150, 100, 100];

  doc.font('Helvetica-Bold').fontSize(11);
  doc.text('Item', startX, y);
  doc.text('Fornecedor', startX + colSupplier, y);
  doc.text('Data da Visita', startX + colItem + colSupplier, y);
  doc.text('Custo de Reparo (R$)', startX + colItem + colSupplier + colDate, y);
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(10);
  y = doc.y;

  for (const c of complaints) {
    const itemName = c.item?.name || '—';
    const supplierName = c.item?.supplier?.name || '—';
    const visitDate = c.scheduled_visit?.date
      ? new Date(c.scheduled_visit.date).toLocaleDateString('pt-BR')
      : '—';
    const cost = c.repairCost ? Number(c.repairCost).toFixed(2) : '—';

    doc.text(itemName, startX, y, { width: colItem, ellipsis: true });
    doc.text(supplierName, startX + colItem, y, {
      width: colSupplier,
      ellipsis: true,
    });
    doc.text(visitDate, startX + colItem + colSupplier, y, {
      width: colDate,
    });
    doc.text(cost, startX + colItem + colSupplier + colDate, y, {
      width: colCost,
      align: 'right',
    });

    y += 18;

    if (y > doc.page.height - 100) {
      doc.addPage();
      y = doc.y;
    }
  }

  doc.moveDown(1);
  doc.x = startX;

  doc.moveDown(2);

  doc.moveDown(2);

  const { total_reclamacoes, total_custo_reparo, total_visitas, torres } =
    summaryData.estatisticas;

  doc.font('Helvetica-Bold').fontSize(14).text('Resumo Quantitativo');
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(12);
  doc.text(`Total de Torres: ${torres}`);
  doc.text(`Total de Reclamações: ${total_reclamacoes}`);
  doc.text(`Total de Visitas Técnicas: ${total_visitas}`);
  doc.text(`Custo Total em Reparos: R$ ${total_custo_reparo.toFixed(2)}`);
  doc.moveDown(1.5);

  const endX = doc.page.width - doc.page.margins.right;
  doc.moveTo(startX, doc.y).lineTo(endX, doc.y).stroke();
  doc.moveDown(1.5);

  doc.font('Helvetica-Bold').fontSize(14).text('Análise da Obra (Resumo LLM)');
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(12).text(summaryText, {
    align: 'justify',
    lineGap: 6,
  });

  doc.moveDown(1.5);

  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.fontSize(10).fillColor('gray').text(`Gerado em: ${currentDate}`, {
    align: 'right',
  });

  doc.end();
}
