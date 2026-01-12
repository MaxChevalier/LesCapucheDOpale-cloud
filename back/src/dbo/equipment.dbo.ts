import { Prisma } from '@prisma/client';

export const equipmentInclude = {
  equipmentType: true,
} satisfies Prisma.EquipmentInclude;

export type EquipmentDbo = Prisma.EquipmentGetPayload<{
  include: typeof equipmentInclude;
}>;
