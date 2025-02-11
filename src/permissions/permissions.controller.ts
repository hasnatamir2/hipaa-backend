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
import { SetPermissionDto } from './dto/set-permission.dto/set-permission.dto';
import {
  PermissionLevel,
  ResourceType,
} from '../common/constants/permission-level/permission-level.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UpdatePermissionDto } from './dto/update-permission.dto/update-permission.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post(':resourceType')
  async setPermission(
    @Param('resourceType') resourceType: ResourceType,
    @Body() setPermissionDto: SetPermissionDto,
    @Body('permissionLevel') permissionLevel: PermissionLevel,
  ) {
    return this.permissionsService.setPermission(
      setPermissionDto,
      resourceType,
      permissionLevel,
    );
  }

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
}
