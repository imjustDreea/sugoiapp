"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const anime_1 = __importDefault(require("./apis/anime"));
try {
    db_1.default.exec(`CREATE TABLE IF NOT EXISTS __health_check (id INTEGER PRIMARY KEY)`);
    // eslint-disable-next-line no-console
    console.log("Conexión a la BD: OK");
}
catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error conectando a la BD:", err);
    process.exit(1);
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/anime', anime_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map