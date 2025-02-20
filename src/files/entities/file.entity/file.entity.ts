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
import { User } from 'src/users/entities/user.entity/user.entity';
import { SharedLink } from 'src/shared-links/entities/shared-link.entity/shared-link.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity/activity-log.entity';

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

  @Column()
  mimeType: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastModified: Date;

  @ManyToOne(() => Folder, (folder) => folder.files, { nullable: true })
  @JoinColumn({ name: 'folderId' })
  folder: Folder;

  @OneToMany(() => Permission, (permission) => permission.file)
  permissions: Permission[];

  @ManyToOne(() => User, (user) => user.files)
  owner: User;

  @OneToMany(() => SharedLink, (sharedLink) => sharedLink.file)
  sharedLinks: SharedLink[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.file)
  activityLogs: ActivityLog[]; // Relation to track file activity logs
}
