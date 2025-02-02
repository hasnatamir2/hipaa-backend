import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
