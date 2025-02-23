import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { File } from 'src/files/entities/file.entity/file.entity'; // Import from the File module
import { User } from 'src/users/entities/user.entity/user.entity'; // Import from the User module

@Entity('shared_links')
export class SharedLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  linkToken: string; // The secure, random token for the link

  @Column({ nullable: true })
  password: string; // Optional password protection (hashed)

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt?: Date; // Expiration date/time for the link

  @Column({ default: 0 })
  downloads: number; // Number of times the file has been downloaded

  @Column({ default: true })
  isActive: boolean; // Whether the link is active

  @ManyToOne(() => File, (file) => file.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fileId' })
  file: File; // The file being shared

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  generatedBy: User; // The user who generated the link

  @CreateDateColumn()
  createdAt: Date; // When the link was created
}
