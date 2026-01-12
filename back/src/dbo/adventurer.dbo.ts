import { Prisma } from '@prisma/client';

export const adventurerInclude = {
  speciality: true,
  equipmentTypes: true,
  consumableTypes: true,
} satisfies Prisma.AdventurerInclude;

export type AdventurerDbo = Prisma.AdventurerGetPayload<{
  include: typeof adventurerInclude;
}>;
