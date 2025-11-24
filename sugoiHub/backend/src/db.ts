// Use require to avoid TypeScript needing external declaration files here
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Database: any = require("better-sqlite3");

const db = new Database("database.sqlite");

export default db;
