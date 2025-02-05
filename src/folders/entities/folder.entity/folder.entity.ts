import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { File } from '../../../files/entities/file.entity/file.entity';
import { Permission } from '../../../permissions/entities/permission.entity/permission.entity';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => File, (file) => file.folder)
  files: File[];

  @OneToMany(() => Permission, (permission) => permission.folder)
  permissions: Permission[];
}
