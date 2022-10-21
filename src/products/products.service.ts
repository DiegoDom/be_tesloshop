import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isValidUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Product, ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...rest } = createProductDto;

      const product = this.productRepository.create({
        ...rest,
        user,
        images: images.map((url) =>
          this.productImageRepository.create({ url }),
        ),
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });

      return products.map(({ images, ...rest }) => ({
        ...rest,
        images: images.map((img) => img.url),
      }));
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(term: string) {
    let product: Product;

    if (isValidUUID(term)) {
      product = await this.productRepository.findOneBy({
        id: term,
      });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`LOWER(title) = LOWER(:title) or slug = LOWER(:slug)`, {
          title: term,
          slug: term,
        })
        .leftJoinAndSelect('prod.images', 'prodI')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`There is not records with the term ${term}`);
    }

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) {
      throw new NotFoundException(`There is not records with the id ${id}`);
    }

    //? Crear 'QueryRunner'
    const queryRunner = this.dataSource.createQueryRunner();

    //? Se conecta el 'QueryRunner' a la DB
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //? 'QueryRunner' elimina las imagenes anteriores
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      product.user = user;
      await queryRunner.manager.save(product);

      //? Se confirma la trasacción y se cierra el query runner
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      //? Cancelar las transacciones que realizo el 'QueryRunner'
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected server error, report to admin',
    );
  }

  async deleteAllProducts() {
    /* if (process.env.NODE_ENV === 'development') {
      throw new BadRequestException(
        'Este endpoint es válido solo en modo desarrollo',
      );
    } */

    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
