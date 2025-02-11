// activity-log.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { File } from 'src/files/entities/file.entity/file.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Folder } from 'src/folders/entities/folder.entity/folder.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // e.g., 'file_uploaded', 'file_downloaded', 'permission_updated', etc.

  @Column({ nullable: true })
  targetId?: string; // ID of the target (file, folder, or other)

  @Column({ nullable: true })
  targetType?: string; // e.g., 'file', 'folder'

  @ManyToOne(() => User, (user) => user.activityLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User; // The user who performed the action

  @ManyToOne(() => File, (file) => file.activityLogs, { nullable: true })
  @JoinColumn({ name: 'fileId' })
  file?: File; // Optional reference to a file (if the action relates to a file)

  @ManyToOne(() => Folder, (folder) => folder.activityLogs, { nullable: true })
  @JoinColumn({ name: 'folderId' })
  folder?: Folder; // Optional reference to a folder (if the action relates to a folder)

  @CreateDateColumn()
  timestamp: Date; // When the action occurred
}
