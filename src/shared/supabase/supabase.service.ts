import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private readonly supabase;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(filename: string, fileBuffer: Buffer): Promise<any> {
    const { data, error } = await this.supabase.storage
      .from('files') // Specify the storage bucket in Supabase
      .upload(filename, fileBuffer, { upsert: true }); // Use 'upsert' if overwriting is allowed

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return data; // Returns information about the uploaded file
  }

  async downloadFile(fileKey: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from('files')
      .download(fileKey);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return data as Buffer; // Returns file data (Buffer)
  }
}
