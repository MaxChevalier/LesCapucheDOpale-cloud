import { IsInt, IsPositive } from 'class-validator';

export class CreateQuestStockEquipmentDto {
  @IsInt()
  questId: number;

  @IsInt()
  equipmentStockId: number;
}