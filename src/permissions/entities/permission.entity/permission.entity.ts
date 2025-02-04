import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../users/entities/user.entity/user.entity';
import { UserRole } from '../../../common/constants/roles/roles';
import { Folder } from 'src/folders/entities/folder.entity/folder.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRole })
  permissionLevel: UserRole;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => File)
  file: File;

  @ManyToOne(() => Folder)
  folder: Folder;
}
