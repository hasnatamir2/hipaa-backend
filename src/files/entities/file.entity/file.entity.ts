import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Folder } from '../../../folders/entities/folder.entity/folder.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string; // File's key in S3 (path in the bucket)

  @Column()
  url: string; // URL to access the file

  @Column()
  size: number;

  @Column()
  mimeType: string;

  @Column()
  name: string;

  @ManyToOne(() => Folder, (folder) => folder.files, { nullable: true })
  @JoinColumn({ name: 'folderId' })
  folder: Folder;
}
