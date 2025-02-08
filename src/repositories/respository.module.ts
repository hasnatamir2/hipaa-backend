import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
// import { TypeOrmDatabaseService } from './typeorm/typeorm-database.service';
import { SupabaseDatabaseService } from './supabase/supabase-database.service';
// import { RepositoryService } from './repository.service.interface';

@Module({
  providers: [
    {
      provide: 'DATABASE_SERVICE',
      useFactory: (configService: ConfigService) => {
        const databaseType = configService.get<string>('DATABASE_TYPE');

        if (databaseType === 'supabase') {
          const supabaseUrl = configService.get<string>('SUPABASE_URL');
          const supabaseKey = configService.get<string>('SUPABASE_KEY');
          const supabaseClient = createClient(
            supabaseUrl || '',
            supabaseKey || '',
          );
          return new SupabaseDatabaseService(supabaseClient);
        }

        // For TypeORM, pass the appropriate repository
        // return new TypeOrmDatabaseService(/* InjectRepository for the entity T */);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DATABASE_SERVICE'],
})
export class DatabaseModule {}
