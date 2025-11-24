import db from "./db";

try {
	db.exec(`CREATE TABLE IF NOT EXISTS __health_check (id INTEGER PRIMARY KEY)`);
	// eslint-disable-next-line no-console
	console.log("Conexión a la BD: OK");
} catch (err) {
	// eslint-disable-next-line no-console
	console.error("Error conectando a la BD:", err);
	process.exit(1);
}
