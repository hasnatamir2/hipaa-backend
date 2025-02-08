import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryService } from '../repository.service.interface';

@Injectable()
export class SupabaseDatabaseService<T> implements RepositoryService<T> {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async create(entity: T): Promise<T> {
    const { data, error } = await this.supabaseClient
      .from('table_name')
      .insert([entity]);
    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }
    return data?.[0] as T;
  }

  async findOne(id: string): Promise<T | null> {
    const { data, error } = await this.supabaseClient
      .from('table_name')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }
    return (data as T) || null;
  }

  async update(id: string, entity: T): Promise<T> {
    const { data, error } = await this.supabaseClient
      .from('table_name')
      .update(entity)
      .eq('id', id);
    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }
    return data?.[0] as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('table_name')
      .delete()
      .eq('id', id);
    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }
  }
}
