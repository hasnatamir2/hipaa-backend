import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Folder } from 'src/folders/entities/folder.entity/folder.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.groups)
  users: User[];

  @ManyToMany(() => Folder, (folder) => folder.groups)
  folders: Folder[];
}
