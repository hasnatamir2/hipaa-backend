import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { SetPermissionDto } from './dto/set-permission.dto/set-permission.dto';
import {
  PermissionLevel,
  ResourceType,
} from '../common/constants/permission-level/permission-level.enum';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post(':resourceType')
  async setPermission(
    @Req() req: any,
    @Param('resourceType') resourceType: ResourceType,
    @Body() setPermissionDto: SetPermissionDto,
    @Body('permissionLevel') permissionLevel: PermissionLevel,
  ) {
    const user = req.user; // Assuming req.user contains the authenticated user
    if (!user) {
      throw new ForbiddenException('Unauthorized request');
    }
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
}
