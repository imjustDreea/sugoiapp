import db from "./db";
import express, { Request, Response } from 'express';
import cors from 'cors';
import animeRouter from './apis/anime';

try {
	db.exec(`CREATE TABLE IF NOT EXISTS __health_check (id INTEGER PRIMARY KEY)`);
	// eslint-disable-next-line no-console
	console.log("Conexión a la BD: OK");
} catch (err) {
	// eslint-disable-next-line no-console
	console.error("Error conectando a la BD:", err);
	process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

app.use('/api/anime', animeRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Backend listening on http://localhost:${PORT}`);
});
