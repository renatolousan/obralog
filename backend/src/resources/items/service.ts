import { Item, Prisma, Unit } from '@prisma/client';
import { ItemDto, ItemCSVRegisterDto } from '../../types/types';
import prisma from '../prisma/client';
import { upsertSupplier } from '../suppliers/service';
import { upsertInstallers } from '../installers/service';

export async function createItems(
  tx: Prisma.TransactionClient,
  id_unit: string,
  items: ItemDto[],
) {
  await Promise.all(
    items.map(async (item) => {
      await upsertInstallers(tx, item.installers);
      await upsertSupplier(tx, item.supplier);

      await tx.item.create({
        data: {
          name: item.name,
          description: item.description,
          value: item.value ?? null,
          batch: item.batch ?? null,
          warranty: item.warranty ?? null,
          cnpj_supplier: item.cnpj_supplier,
          id_unit,
          installers: {
            connect: item.installers.map((i) => ({ cpf: i.cpf })),
          },
        },
      });
    }),
  );
}

export async function createNewItem(
  id_unit: string,
  data: ItemDto,
): Promise<Item | null> {
  await upsertInstallers(prisma, data.installers);
  await upsertSupplier(prisma, data.supplier);
  const { name, cnpj_supplier, description, value, batch, warranty } = data;
  return await prisma.item.create({
    data: {
      name,
      description,
      value: value ?? null,
      batch: batch ?? null,
      warranty: warranty ?? null,
      cnpj_supplier,
      id_unit,
      installers: {
        connect: data.installers.map((i) => ({ cpf: i.cpf })),
      },
    },
  });
}

export async function getItemComplaintsReport() {
  const items = await prisma.item.findMany({
    include: {
      feedbacks: true,
      supplier: true,
      unit: true,
    },
  });
  const report = items.map((item) => {
    const complaintsCount = item.feedbacks.length;
    const visitCost = item.feedbacks.reduce(
      (sum, f) => sum + (Number(f.repairCost) || 0),
      0,
    );

    return {
      itemName: item.name,
      supplierName: item.supplier.name || '—',
      value: Number(item.value) || 0,
      batch: item.batch || '—',
      complaintsCount,
      visitCost,
      unitName: item.unit.name || '—',
    };
  });
  return report;
}
// Função auxiliar para buscar unidade por nome, número e andar
async function getUnitByName(
  unit_name: string,
  unit_number: number,
  floor: number,
  building_name: string,
): Promise<Unit | null> {
  return await prisma.unit.findFirst({
    where: {
      name: unit_name,
      number: unit_number,
      floor,
      torre: {
        name: building_name,
      },
    },
  });
}

// Função para criar item a partir de dados CSV
async function createItemFromCSVData(
  data: ItemCSVRegisterDto & { unitId: string },
): Promise<boolean> {
  try {
    // Criar/atualizar fornecedor
    await upsertSupplier(prisma, {
      cnpj: data.supplier_cnpj,
      name: data.supplier_name,
    });

    // Criar/atualizar instalador
    await upsertInstallers(prisma, [
      {
        cpf: data.installer_cpf,
        name: data.installer_name,
        phone: '', // CSV não tem telefone, usar vazio
      },
    ]);

    // Converter value de string para number se necessário
    const value = data.value
      ? typeof data.value === 'string'
        ? parseFloat(data.value)
        : data.value
      : null;

    // Converter warranty de string para number se necessário
    const warranty = data.warranty
      ? typeof data.warranty === 'string'
        ? parseInt(data.warranty, 10)
        : data.warranty
      : null;

    await prisma.item.create({
      data: {
        name: String(data.name || '').trim(),
        description: String(data.description || '').trim(),
        value: value ? new Prisma.Decimal(value) : null,
        batch: data.batch ? String(data.batch).trim() : null,
        warranty: warranty,
        cnpj_supplier: String(data.supplier_cnpj || '').trim(),
        id_unit: data.unitId,
        installers: {
          connect: [{ cpf: String(data.installer_cpf || '').trim() }],
        },
      },
    });

    return true;
  } catch (error) {
    console.error('Erro ao criar item:', error);
    return false;
  }
}

export async function massRegisterItems(rows: ItemCSVRegisterDto[]) {
  const errors: { row: number; error: string }[] = [];
  let successCount = 0;
  let rowCount = 0;

  for (const row of rows) {
    rowCount++;

    // O csv-parser retorna todos os valores como strings, precisamos converter
    const unit_number = Number(row.unit_number);
    const floor = Number(row.floor);
    const building_name = String(row.building_name || '').trim();
    const unit_name = String(row.unit_name || '').trim();

    // Validação básica
    if (!row.name || !row.supplier_cnpj || !row.supplier_name) {
      errors.push({
        row: rowCount,
        error:
          'Campos obrigatórios faltando (name, supplier_cnpj, supplier_name)',
      });
      continue;
    }

    if (isNaN(unit_number) || isNaN(floor) || !building_name || !unit_name) {
      errors.push({
        row: rowCount,
        error: `Dados de unidade inválidos: unit_name=${unit_name}, unit_number=${row.unit_number}, floor=${row.floor}, building_name=${building_name}`,
      });
      continue;
    }

    if (!row.installer_cpf || !row.installer_name) {
      errors.push({
        row: rowCount,
        error: 'Instalador obrigatório (installer_cpf, installer_name)',
      });
      continue;
    }

    const item: ItemCSVRegisterDto = {
      name: String(row.name || '').trim(),
      description: String(row.description || '').trim(),
      value: row.value,
      batch: row.batch ? String(row.batch).trim() : null,
      warranty: row.warranty,
      unit_name,
      unit_number,
      floor,
      building_name,
      supplier_cnpj: String(row.supplier_cnpj || '').trim(),
      supplier_name: String(row.supplier_name || '').trim(),
      installer_cpf: String(row.installer_cpf || '').trim(),
      installer_name: String(row.installer_name || '').trim(),
    };

    try {
      const unit = await getUnitByName(
        unit_name,
        unit_number,
        floor,
        building_name,
      );
      if (!unit) {
        errors.push({
          row: rowCount,
          error: `Unidade não encontrada: ${unit_name} (Nº ${unit_number}, Andar ${floor}) na ${building_name}`,
        });
        continue;
      }

      const itemWithUnitId = {
        ...item,
        unitId: unit.id,
      };

      const registered = await createItemFromCSVData(itemWithUnitId);

      if (!registered) {
        errors.push({ row: rowCount, error: 'Erro ao cadastrar item.' });
      } else {
        successCount++;
      }
    } catch (err) {
      errors.push({
        row: rowCount,
        error: err instanceof Error ? err.message : 'Erro inesperado',
      });
    }
  }

  return {
    message: 'Arquivo processado com sucesso',
    totalRows: rowCount,
    successCount,
    errors,
  };
}
