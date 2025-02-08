export interface RepositoryService<T> {
  create(entity: T): Promise<T>;
  findOne(id: string): Promise<T | null>;
  update(id: string, entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
