import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateEquipmentStockDto {
  @IsInt()
  equipmentId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
