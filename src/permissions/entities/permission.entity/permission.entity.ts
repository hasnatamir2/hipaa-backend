import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { PermissionLevel } from '../../common/constants/roles';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PermissionLevel })
  permissionLevel: PermissionLevel;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => File)
  file: File;

  @ManyToOne(() => Folder)
  folder: Folder;
}