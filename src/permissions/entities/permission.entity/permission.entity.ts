import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../../users/entities/user.entity/user.entity';
import { File } from '../../../files/entities/file.entity/file.entity';
import { Folder } from '../../../folders/entities/folder.entity/folder.entity';
import { PermissionLevel } from '../../constants/permission-level.enum';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  canRead: boolean;

  @Column({ type: 'boolean', default: false })
  canWrite: boolean;

  @Column({ type: 'boolean', default: false })
  canShare: boolean;

  @Column({ type: 'boolean', default: false })
  canDelete: boolean;

  @ManyToOne(() => User, (user) => user.permissions)
  user: User;

  @ManyToOne(() => File, (file) => file.permissions, { nullable: true })
  file: File;

  @ManyToOne(() => Folder, (folder) => folder.permissions, { nullable: true })
  folder: Folder;

  @Column({ type: 'enum', enum: PermissionLevel })
  permissionLevel: PermissionLevel;
}
