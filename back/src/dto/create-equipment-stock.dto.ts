import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateEquipmentStockDto {
  @IsInt()
  equipmentId: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
