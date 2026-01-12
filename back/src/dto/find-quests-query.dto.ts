import { IsOptional, IsInt, IsIn, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindQuestsQueryDto {
  @ApiPropertyOptional({
    description: 'Prime minimale (incluse)',
    example: 100,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(0)
  rewardMin?: number;

  @ApiPropertyOptional({
    description: 'Prime maximale (incluse)',
    example: 1000,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(0)
  rewardMax?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant de statut',
    example: 2,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(1)
  statusId?: number;

  @ApiPropertyOptional({
    description: 'Date finale avant (ISO 8601)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  finalDateBefore?: string;

  @ApiPropertyOptional({
    description: 'Date finale après (ISO 8601)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  finalDateAfter?: string;

  @ApiPropertyOptional({
    description: "Filtrer par identifiant d'utilisateur créateur",
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({
    description: 'XP moyen minimum des aventuriers (inclus)',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(0)
  avgXpMin?: number;

  @ApiPropertyOptional({
    description: 'XP moyen maximum des aventuriers (inclus)',
    example: 100,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  @Min(0)
  avgXpMax?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    enum: ['reward', 'finalDate', 'avgExperience', 'createdAt'],
    example: 'reward',
  })
  @IsOptional()
  @IsIn(['reward', 'finalDate', 'avgExperience', 'createdAt'])
  sortBy?: 'reward' | 'finalDate' | 'avgExperience' | 'createdAt';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
