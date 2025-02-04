import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { File } from '../../../files/entities/file.entity/file.entity';

@Entity()
export class SharedLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @Column()
  expiration: Date;

  @ManyToOne(() => File)
  file: File;
}
