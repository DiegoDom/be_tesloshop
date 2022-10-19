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
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must contain max two decimal places' },
  )
  @IsPositive()
  @Min(1)
  price: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  stock?: number;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @IsNotEmpty()
  @IsString()
  @IsIn(['men', 'woman', 'kid', 'unisex'])
  gender: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
