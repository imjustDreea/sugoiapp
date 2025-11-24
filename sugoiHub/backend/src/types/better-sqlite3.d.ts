declare module "better-sqlite3" {
  /* Minimal typing to silence TypeScript when @types is not installed. */
  class Database {
    constructor(filename: string, options?: any);
    prepare(sql: string): any;
    exec(sql: string): any;
    close(): void;
  }
  export default Database;
}
