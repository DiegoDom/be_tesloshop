import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { Product } from '../../products/entities';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @BeforeInsert()
  formarFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    this.password = bcryptjs.hashSync(this.password, 10);
  }

  @BeforeUpdate()
  formarFieldsBeforeUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
