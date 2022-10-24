import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Men’s 3D Small Wordmark Tee',
    description: 'Product title',
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 25.5,
    description: 'Product pice',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must contain max two decimal places' },
  )
  @IsPositive()
  @Min(1)
  price: number;

  @ApiProperty({
    example: 'Designed for comfort and style in any size',
    description: 'Product description',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'men_3d_small_wordmark_tee',
    description: 'Product slug',
    uniqueItems: true,
    nullable: true,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  slug?: string;

  @ApiProperty({
    example: 5,
    description: 'Product stock',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  stock?: number;

  @ApiProperty({
    example: ['XS', 'S', 'M'],
    description: 'Product aviable sizes',
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Product gender',
    enum: ['men', 'woman', 'kid', 'unisex'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['men', 'woman', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    example: ['shirt', 'teslo', 'cool'],
    description: 'Product tags',
    nullable: true,
    isArray: true,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
