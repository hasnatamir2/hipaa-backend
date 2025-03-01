import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserRole } from '../../../common/constants/roles/roles.enum';
import { Permission } from 'src/permissions/entities/permission.entity/permission.entity';
import { File } from 'src/files/entities/file.entity/file.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity/activity-log.entity';
import { Folder } from 'src/folders/entities/folder.entity/folder.entity';
import { Group } from 'src/group/entities/group.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STANDARD_USER })
  role: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Permission, (permission) => permission.user)
  permissions: Permission[];

  @OneToMany(() => File, (file) => file.owner)
  files: File[];

  @OneToMany(() => Folder, (folder) => folder.owner)
  folders: File[];

  @ManyToMany(() => Group, (group: Group) => group.users)
  @JoinTable() // This creates the joining table automatically
  groups: Group[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.user)
  activityLogs: ActivityLog[]; // Relation to track user activity logs
}
