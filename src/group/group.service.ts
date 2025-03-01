import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { CreateGroupDto } from './dto/create-group.dto/create-group.dto';
import { Folder } from 'src/folders/entities/folder.entity/folder.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto) {
    const group = this.groupRepository.create(createGroupDto);
    return await this.groupRepository.save(group);
  }

  async getGroupDetailsById(groupId: string) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users', 'folders'],
    });
    return group;
  }

  async addUserToGroup(groupId: string, userId: string) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users'],
    });
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!group || !user) throw new NotFoundException('Group or User not found');

    group.users.push(user);
    await this.groupRepository.save(group);
    return group;
  }

  async assignFolderToGroup(groupId: string, folderId: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['folders'],
    });
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });

    if (!group || !folder) {
      throw new NotFoundException('Group or Folder not found');
    }

    group.folders.push(folder);
    return this.groupRepository.save(group);
  }

  async unassignFolderFromGroup(
    groupId: string,
    folderId: string,
  ): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['folders'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    group.folders = group.folders.filter((f) => f.id !== folderId);
    await this.groupRepository.save(group);
  }

  async unassignUserFromGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    group.users = group.users.filter((u) => u.id !== userId);
    await this.groupRepository.save(group);
  }

  async updateUserGroupAssignment(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the user is already assigned to this group
    if (!group.users.some((u) => u.id === userId)) {
      group.users.push(user);
      await this.groupRepository.save(group);
    }
  }

  async findOne(id: string): Promise<Group | null> {
    return this.groupRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find();
  }

  async remove(id: string): Promise<void> {
    await this.groupRepository.delete(id);
  }
}
