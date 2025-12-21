const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../db');
const auth = require('../../middleware/auth');

const router = express.Router();

// Login: acepta email o username en "identifier"
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Credenciales incompletas' });
    }

    const { rows } = await pool.query(
      'SELECT id, username, name, last_name, email, password FROM public.users WHERE email=$1 OR username=$1 LIMIT 1',
      [identifier]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'dev_secret_change_me',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, last_name: user.last_name, email: user.email }
    });
  } catch (err) {
    console.error('Auth login error:', err);
    return res.status(500).json({ error: 'Error en inicio de sesión' });
  }
});

// Registro de usuario (temporal para pruebas)
router.post('/register', async (req, res) => {
  const { username, name, last_name, email, password, birth } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      'INSERT INTO public.users (username, name, last_name, email, password, birth) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, name, last_name, email',
      [username, name || '', last_name || '', email, hashedPassword, birth || null]
    );

    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error('Auth register error:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'Usuario o email ya existe' });
    return res.status(500).json({ error: 'Error en registro' });
  }
});

// Perfil del usuario autenticado
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, name, last_name, email FROM public.users WHERE id=$1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('Auth me error:', err);
    return res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

module.exports = router;
