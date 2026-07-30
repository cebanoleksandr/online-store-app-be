import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const {
      page = 1,
      limit = 16,
      sortBy = 'id',
      sortOrder = 'DESC',
      category,
    } = query;
    const skip = (page - 1) * limit;

    const whereCondition = category ? { category } : {};

    const [data, total] = await this.productRepository.findAndCount({
      where: whereCondition,
      order: { [sortBy]: sortOrder },
      skip: skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Товар з ID ${id} не знайдено`);
    }
    return product;
  }

  async seedProducts(): Promise<string> {
    const count = await this.productRepository.count();
    if (count > 0) {
      return 'База вже містить товари. Очистіть її перед новим наповненням.';
    }

    const dummyProducts = [
      {
        name: 'Apple iPhone 14 Pro 128GB Silver (MQ023)',
        price: 999,
        category: 'phones',
        color: 'silver',
        screen: '6.1" OLED',
        capacity: '128 GB',
        ram: '6 GB',
        image: 'iphone-14-pro-silver.png',
        images: [
          'iphone-14-pro-silver-1.png',
          'iphone-14-pro-silver-2.png',
          'iphone-14-pro-silver-3.png',
        ],
      },
      {
        name: 'Apple iPhone 14 Plus 128GB PRODUCT Red (MQ513)',
        price: 859,
        category: 'phones',
        color: 'red',
        screen: '6.7" OLED',
        capacity: '128 GB',
        ram: '6 GB',
        image: 'iphone-14-plus-red.png',
        images: ['iphone-14-plus-red-1.png', 'iphone-14-plus-red-2.png'],
      },
      {
        name: 'Apple iPhone 11 Pro Max 64GB Gold (iMT9G2FS/A)',
        price: 799,
        category: 'phones',
        color: 'gold',
        screen: '6.5" OLED',
        capacity: '64 GB',
        ram: '4 GB',
        image: 'iphone-11-pro-max-gold.png',
        images: [
          'iphone-11-pro-max-gold-1.png',
          'iphone-11-pro-max-gold-2.png',
          'iphone-11-pro-max-gold-3.png',
          'iphone-11-pro-max-gold-4.png',
        ],
      },
    ];

    for (const item of dummyProducts) {
      const product = this.productRepository.create(item);
      await this.productRepository.save(product);
    }

    return 'Тестові товари успішно додані до бази даних!';
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}
