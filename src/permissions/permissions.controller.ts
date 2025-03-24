import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  PermissionLevel,
  ResourceType,
} from '../common/constants/permission-level/permission-level.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UpdatePermissionDto } from './dto/update-permission.dto/update-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto/assign-permission.dto';
import { AssignGroupPermissionDto } from './dto/assign-group-permission.dto/assign-group-permission.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // @Post(':resourceType')
  // async setPermission(
  //   @Param('resourceType') resourceType: ResourceType,
  //   @Body() setPermissionDto: SetPermissionDto,
  //   @Body('permissionLevel') permissionLevel: PermissionLevel,
  // ) {
  //   return this.permissionsService.setPermission(
  //     setPermissionDto,
  //     resourceType,
  //     permissionLevel,
  //   );
  // }

  @Get(':resourceType/:resourceId/user/:userId')
  async getPermissions(
    @Param('resourceType') resourceType: ResourceType,
    @Param('resourceId') resourceId: string,
    @Param('userId') userId: string,
  ) {
    return this.permissionsService.getPermissions(
      userId,
      resourceId,
      resourceType,
    );
  }

  @Put(':resourceType/:resourceId/user/:userId')
  async updatePermission(
    @Param('resourceType') resourceType: ResourceType,
    @Param('resourceId') resourceId: string,
    @Param('userId') userId: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Body('permissionLevel') permissionLevel: PermissionLevel,
  ) {
    return this.permissionsService.updatePermission(
      updatePermissionDto,
      resourceType,
      permissionLevel,
      resourceId,
      userId,
    );
  }

  @Post('assign-to-users')
  async assignPermissionsToUsers(
    @Body() assignPermissionDto: AssignPermissionDto,
  ): Promise<void> {
    const { emails, fileId, accessLevel } = assignPermissionDto;
    await this.permissionsService.assignPermissionsToUsers(
      emails,
      fileId,
      accessLevel,
    );
  }

  @Post('assign-to-group')
  async assignPermissionToGroup(
    @Body() assignGroupPermissionDto: AssignGroupPermissionDto,
  ): Promise<void> {
    const { groupId, fileId, accessLevel } = assignGroupPermissionDto;
    await this.permissionsService.assignPermissionToGroup(
      groupId,
      fileId,
      accessLevel,
    );
  }
}
