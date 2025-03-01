import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { File } from './file.entity';

@Entity()
export class FileVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  versionNumber: string;

  @Column()
  fileSize: number;

  @Column()
  filePath: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => File, (file) => file.versions)
  file: File;
}
