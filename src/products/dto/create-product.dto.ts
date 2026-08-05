import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  screen?: string;

  @IsString()
  @IsOptional()
  capacity?: string;

  @IsString()
  @IsOptional()
  ram?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
