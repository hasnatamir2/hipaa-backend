import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Folder } from 'src/folders/entities/folder.entity/folder.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, Folder])],
  providers: [GroupService, JwtService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
