import { IsOptional, IsString, IsInt, IsIn, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindAdventurersQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer par nom (contains, insensible à la casse)',
    example: 'aria',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant de spécialité',
    example: 3,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(1)
  specialityId?: number;

  @ApiPropertyOptional({
    description: 'Expérience minimale (incluse)',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(0)
  experienceMin?: number;

  @ApiPropertyOptional({
    description: 'Expérience maximale (incluse)',
    example: 50,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(0)
  experienceMax?: number;

  @ApiPropertyOptional({
    description: 'Tri par taux journalier',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  dailyRateOrder?: 'asc' | 'desc';
}
