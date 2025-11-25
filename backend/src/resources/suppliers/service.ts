import { Prisma, Supplier } from '@prisma/client';
import prisma from '../prisma/client';

export async function getAllSuppliers(): Promise<Supplier[]> {
  const suppliers = await prisma.supplier.findMany({
    select: {
      cnpj: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return suppliers;
}

export async function getSuppliedItems(cnpj: string) {
  return await prisma.supplier.findMany({
    where: {
      cnpj,
    },
    include: {
      supplied_items: true,
    },
  });
}

export async function findSupplierByCNPJ(
  cnpj: string,
  supplied_items: boolean = false,
): Promise<Supplier | null> {
  return await prisma.supplier.findFirst({
    where: { cnpj },
    include: { supplied_items },
  });
}

export async function upsertSupplier(
  tx: Prisma.TransactionClient,
  supplier: Supplier,
) {
  await tx.supplier.upsert({
    where: { cnpj: supplier.cnpj },
    update: {},
    create: { cnpj: supplier.cnpj, name: supplier.name },
  });
}

export async function supplierAlreadyExists(supplier: Supplier) {
  return !!(await prisma.supplier.findFirst({
    where: { AND: [{ cnpj: supplier.cnpj }, { name: supplier.name }] },
  }));
}

export async function createNewSupplier(supplier: Supplier) {
  if (!(await supplierAlreadyExists(supplier))) {
    return await prisma.supplier.create({ data: supplier });
  } else {
    throw new Error('Fornecedor já cadastrado');
  }
}

export async function bulkSupplierRegistration(rows: Supplier[]) {
  const errors: { row: number; error: string }[] = [];
  let successCount = 0;
  let rowCount = 0;

  for (const row of rows) {
    rowCount++;
    const supplier = row as Supplier;

    try {
      const registered = await createNewSupplier(supplier);
      if (!registered) {
        errors.push({ row: rowCount, error: 'Erro ao cadastrar fornecedor.' });
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
  return { successCount, errors };
}
