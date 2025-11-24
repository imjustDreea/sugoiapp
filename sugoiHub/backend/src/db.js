"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Use require to avoid TypeScript needing external declaration files here
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Database = require("better-sqlite3");
const db = new Database("database.sqlite");
exports.default = db;
//# sourceMappingURL=db.js.map