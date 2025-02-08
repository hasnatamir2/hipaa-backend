import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Folder } from '../../../folders/entities/folder.entity/folder.entity';
import { Permission } from 'src/permissions/entities/permission.entity/permission.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column()
  // key: string; // File's key in S3 (path in the bucket)

  @Column()
  url: string; // URL to access the file

  @Column()
  size: number;

  // @Column()
  // mimeType: string;

  @Column()
  name: string;

  @ManyToOne(() => Folder, (folder) => folder.files, { nullable: true })
  @JoinColumn({ name: 'folderId' })
  folder: Folder;

  @OneToMany(() => Permission, (permission) => permission.file)
  permissions: Permission[];
}
