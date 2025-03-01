import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Get,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto/create-group.dto';
import { Group } from './entities/group.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles';
import { UserRole } from 'src/common/constants/roles/roles.enum';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return await this.groupService.createGroup(createGroupDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllGroups(): Promise<Group[]> {
    return await this.groupService.findAll();
  }

  @Get(':groupId')
  @Roles(UserRole.ADMIN)
  async getGroupDetaisById(@Param('groupId') groupId: string) {
    return await this.groupService.getGroupDetailsById(groupId);
  }

  @Post(':groupId/users/:userId')
  @Roles(UserRole.ADMIN)
  async addUserToGroup(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ) {
    return await this.groupService.addUserToGroup(groupId, userId);
  }

  @Post(':groupId/folders/:folderId')
  async assignFolderToGroup(
    @Param('groupId') groupId: string,
    @Param('folderId') folderId: string,
  ): Promise<Group> {
    return await this.groupService.assignFolderToGroup(groupId, folderId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async removeGroup(@Param('id') id: string): Promise<void> {
    return await this.groupService.remove(id);
  }

  @Delete(':groupId/users/:userId')
  async unassignUserFromGroup(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<{ message: string }> {
    await this.groupService.unassignUserFromGroup(groupId, userId);
    return { message: 'User unassigned from group successfully' };
  }

  @Delete(':groupId/folder/:folderId')
  async unassignFolderFromGroup(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
  ): Promise<{ message: string }> {
    await this.groupService.unassignFolderFromGroup(groupId, folderId);
    return { message: 'Folder unassigned from group successfully' };
  }

  @Put(':groupId/users/:userId')
  async updateUserGroupAssignment(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<{ message: string }> {
    await this.groupService.updateUserGroupAssignment(groupId, userId);
    return { message: 'User group assignment updated successfully' };
  }
}
