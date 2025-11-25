import ExcelJS from 'exceljs';
import { Response } from 'express';

type ItemReport = {
  itemName: string;
  supplierName: string;
  value: number;
  batch: string;
  complaintsCount: number;
  visitCost: number;
  unitName: string;
};

export async function generateItemsReportExcel({
  data,
  res,
}: {
  data: ItemReport[];
  res: Response;
}) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Itens e Fornecedores');

  sheet.columns = [
    { header: 'Nome do Item', key: 'itemName', width: 30 },
    { header: 'Fornecedor', key: 'supplierName', width: 28 },
    {
      header: 'Valor (R$)',
      key: 'value',
      width: 15,
      style: { numFmt: 'R$ #,##0.00' },
    },
    { header: 'Lote', key: 'batch', width: 15 },
    { header: 'Qtd. Reclamações', key: 'complaintsCount', width: 18 },
    {
      header: 'Custo por Visita (R$)',
      key: 'visitCost',
      width: 20,
      style: { numFmt: 'R$ #,##0.00' },
    },
    { header: 'Unidade Instalada', key: 'unitName', width: 28 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 22;
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF305496' },
  };

  data.forEach((item) => {
    sheet.addRow(item);
  });

  const lastRow = sheet.lastRow!.number + 1;
  const totalRow = sheet.addRow({
    itemName: 'TOTAL GERAL',
    value: { formula: `SUM(C2:C${lastRow - 1})` },
    complaintsCount: { formula: `SUM(E2:E${lastRow - 1})` },
    visitCost: { formula: `SUM(F2:F${lastRow - 1})` },
  });

  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFCE4D6' },
  };

  totalRow.border = {
    top: { style: 'medium' },
  };

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.alignment = { vertical: 'middle', horizontal: 'left' };
    if (rowNumber > 1 && rowNumber !== totalRow.number) {
      row.border = {
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };
    }
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=itens-fornecedores.xlsx',
  );

  await workbook.xlsx.write(res);
  res.end();
}
