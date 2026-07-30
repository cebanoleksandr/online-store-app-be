import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  screen: string;

  @Column({ nullable: true })
  capacity: string;

  @Column({ nullable: true })
  ram: string;

  @Column({ nullable: true })
  image: string;

  @Column('text', { array: true, nullable: true })
  images: string[];
}
