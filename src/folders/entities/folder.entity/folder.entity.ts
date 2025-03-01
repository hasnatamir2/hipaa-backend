import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { File } from '../../../files/entities/file.entity/file.entity';
import { Permission } from '../../../permissions/entities/permission.entity/permission.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity/activity-log.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Group } from 'src/group/entities/group.entity';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => File, (file) => file.folder)
  files: File[];

  @ManyToOne(() => User, (user) => user.folders)
  owner: User;

  @OneToMany(() => Permission, (permission) => permission.folder, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  permissions: Permission[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.folder, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @ManyToMany(() => Group)
  @JoinTable()
  accessibleByGroups: Group[];

  @ManyToMany(() => Group, (group) => group.folders)
  @JoinTable()
  groups: Group[];

  activityLogs: ActivityLog[]; // Relation to track user activity logs
}
