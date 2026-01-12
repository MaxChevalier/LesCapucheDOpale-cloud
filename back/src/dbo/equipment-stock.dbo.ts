import { Prisma } from '@prisma/client';

export const equipmentStockInclude = {
  equipment: { include: { equipmentType: true } },
} satisfies Prisma.EquipmentStockInclude;

export type EquipmentStockDbo = Prisma.EquipmentStockGetPayload<{
  include: typeof equipmentStockInclude;
}>;
