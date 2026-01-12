import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

class UpdateStatusDto {
  @Type(() => Number)
  @IsInt()
  statusId: number;
}
export { UpdateStatusDto };
