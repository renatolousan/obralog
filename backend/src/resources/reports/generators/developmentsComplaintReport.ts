import ExcelJS from 'exceljs';
import { Response } from 'express';

type DevelopmentReport = {
  obra: string;
  total: number;
  abertos: number;
  fechados: number;
  totalCost: string;
  avgCost: string;
};

export async function generateDevelopmentsReportExcel({
  data,
  res,
}: {
  data: DevelopmentReport[];
  res: Response;
}) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Relatório de Obras', {
    properties: { tabColor: { argb: 'FFC000' } },
  });

  sheet.columns = [
    { header: 'Obra', key: 'obra', width: 35 },
    { header: 'Total de Reclamações', key: 'total', width: 22 },
    { header: 'Abertas', key: 'abertos', width: 12 },
    { header: 'Fechadas', key: 'fechados', width: 12 },
    { header: 'Custo Total (R$)', key: 'totalCost', width: 18 },
    { header: 'Custo Médio (R$)', key: 'avgCost', width: 18 },
  ];

  sheet.getRow(1).font = { bold: true, size: 12 };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDDEBF7' },
  };
  sheet.getRow(1).border = {
    bottom: { style: 'medium', color: { argb: 'FF2E75B6' } },
  };

  data.forEach((row) => {
    sheet.addRow(row);
  });

  const lastRow = sheet.lastRow!.number + 1;
  sheet.addRow({
    obra: 'TOTAL GERAL',
    total: { formula: `SUM(B2:B${lastRow - 1})` },
    abertos: { formula: `SUM(C2:C${lastRow - 1})` },
    fechados: { formula: `SUM(D2:D${lastRow - 1})` },
    totalCost: { formula: `SUM(E2:E${lastRow - 1})` },
  });

  const totalRow = sheet.getRow(lastRow);
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFCE4D6' },
  };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=relatorio-obras.xlsx',
  );

  await workbook.xlsx.write(res);
  res.end();
}
