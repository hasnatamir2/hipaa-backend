import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { File } from '../../../files/entities/file.entity/file.entity';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => File, (file) => file.folder)
  files: File[];
}
