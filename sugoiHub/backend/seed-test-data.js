const { pool } = require('./db');
const bcrypt = require('bcrypt');

const testUsers = [
  { username: 'gamer_pro', name: 'Pro Gamer', bio: '🎮 Jugador competitivo' },
  { username: 'anime_lover', name: 'Anime Fan', bio: '📺 Otaku de corazón' },
  { username: 'music_vibes', name: 'Music Lover', bio: '🎵 Amante de la música' },
  { username: 'manga_reader', name: 'Manga Enthusiast', bio: '📖 Lector de manga' },
  { username: 'retro_gamer', name: 'Retro King', bio: '👾 Nostalgia pura' },
  { username: 'pixel_artist', name: 'Pixel Artist', bio: '🎨 Arte pixelado' },
  { username: 'neon_nights', name: 'Neon Enthusiast', bio: '💜 Neon lover' },
  { username: 'digital_nomad', name: 'Explorer', bio: '🌍 Viajero digital' },
  { username: 'code_wizard', name: 'Dev Nerd', bio: '💻 Programador' },
  { username: 'dream_chaser', name: 'Dreamer', bio: '✨ Persiguiendo sueños' },
];

const postContents = [
  '¡Acabo de terminar este anime y fue increíble! 🔥',
  'Este juego me tiene enganchado, no puedo parar de jugar',
  'La música de hoy está de otro nivel, amigos',
  'Está siendo un gran día en la comunidad',
  'Compartiendo mis favoritos de este mes 📝',
  '¿Alguien más ama los juegos retro tanto como yo?',
  'La comunidad en esta web es genial 💜',
  'Nuevo capitulo del manga salió y no me lo esperaba',
  'Recomendaciones de anime para este fin de semana',
  'Mi colección de juegos favoritos está creciendo',
];

const comments = [
  '¡Me encanta! 😍',
  'Completamente de acuerdo contigo',
  'Debo intentar eso pronto',
  'Qué bueno, gracias por la recomendación',
  'Tienes excelente gusto',
  '¡Definitivamente! Es lo mejor',
  'Me gustó mucho también',
  'Espero poder jugar pronto',
  'Está en mi lista de pendientes',
  'Exactamente lo que pensé 👍',
];

function generateHash(password) {
  return bcrypt.hash(password, 10);
}

async function seedData() {
  try {
    console.log('🌱 Iniciando seeding de datos de prueba...');

    // 1. Crear 10 nuevos usuarios
    console.log('\n📝 Creando 10 usuarios de prueba...');
    const userIds = [];
    
    for (const testUser of testUsers) {
      const password = 'password123';
      const passwordHash = await generateHash(password);
      
      const { rows } = await pool.query(
        `INSERT INTO public.users (username, email, password, name, last_name)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE SET password = $3
         RETURNING id`,
        [testUser.username, `${testUser.username}@test.com`, passwordHash, testUser.name, 'Test']
      );
      
      const userId = rows[0].id;
      userIds.push({ id: userId, username: testUser.username });
      
      // Crear perfil asociado
      await pool.query(
        `INSERT INTO public.profile (user_id, bio)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET bio = $2`,
        [userId, testUser.bio]
      );
      
      console.log(`✓ Usuario creado: ${testUser.username} (ID: ${userId})`);
    }

    // 2. Crear relaciones de follow entre usuarios
    console.log('\n👥 Creando relaciones de follow...');
    for (let i = 0; i < userIds.length; i++) {
      // Cada usuario sigue a 3-5 usuarios aleatorios
      const followCount = Math.floor(Math.random() * 3) + 3;
      const indices = Array.from({ length: userIds.length }, (_, i) => i)
        .filter(idx => idx !== i)
        .sort(() => Math.random() - 0.5)
        .slice(0, followCount);

      for (const idx of indices) {
        await pool.query(
          `INSERT INTO public.followers (follower_id, followed_id)
           VALUES ($1, $2)
           ON CONFLICT (follower_id, followed_id) DO NOTHING`,
          [userIds[i].id, userIds[idx].id]
        );
      }
    }
    console.log(`✓ Relaciones de follow creadas`);

    // 3. Crear posts desde cada usuario
    console.log('\n📰 Creando posts...');
    const postIds = [];
    
    for (const userId of userIds) {
      const postCount = Math.floor(Math.random() * 3) + 2; // 2-4 posts por usuario
      
      for (let i = 0; i < postCount; i++) {
        const content = postContents[Math.floor(Math.random() * postContents.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        
        const { rows } = await pool.query(
          `INSERT INTO public.posts (user_id, content, created_at)
           VALUES ($1, $2, NOW() - INTERVAL '${daysAgo} days')
           RETURNING id`,
          [userId.id, content]
        );
        
        postIds.push({ id: rows[0].id, userId: userId.id });
      }
    }
    console.log(`✓ ${postIds.length} posts creados`);

    // 4. Crear likes en posts
    console.log('\n❤️ Creando likes en posts...');
    let likeCount = 0;
    
    for (const post of postIds) {
      // Cada post recibe likes de 2-8 usuarios aleatorios
      const likerCount = Math.floor(Math.random() * 7) + 2;
      const likerIndices = Array.from({ length: userIds.length }, (_, i) => i)
        .filter(idx => userIds[idx].id !== post.userId)
        .sort(() => Math.random() - 0.5)
        .slice(0, likerCount);

      for (const idx of likerIndices) {
        await pool.query(
          `INSERT INTO public.post_likes (user_id, post_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, post_id) DO NOTHING`,
          [userIds[idx].id, post.id]
        );
        likeCount++;
      }
    }
    console.log(`✓ ${likeCount} likes creados`);

    // 5. Crear comentarios en posts
    console.log('\n💬 Creando comentarios...');
    let commentCount = 0;
    
    for (const post of postIds) {
      // Cada post recibe 1-3 comentarios
      const commentCount_ = Math.floor(Math.random() * 3) + 1;
      const commenterIndices = Array.from({ length: userIds.length }, (_, i) => i)
        .filter(idx => userIds[idx].id !== post.userId)
        .sort(() => Math.random() - 0.5)
        .slice(0, commentCount_);

      for (const idx of commenterIndices) {
        const comment = comments[Math.floor(Math.random() * comments.length)];
        const daysAgo = Math.floor(Math.random() * 7);
        
        await pool.query(
          `INSERT INTO public.post_comments (user_id, post_id, content, created_at)
           VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days')`,
          [userIds[idx].id, post.id, comment]
        );
        commentCount++;
      }
    }
    console.log(`✓ ${commentCount} comentarios creados`);

    // 6. Crear datos en la librería (favoritos)
    console.log('\n📚 Creando datos de librería...');
    const mediaTypes = ['anime', 'manga', 'games', 'music'];
    let libraryCount = 0;

    for (const userId of userIds) {
      for (const type of mediaTypes) {
        // Cada usuario tiene 3-6 favoritos por tipo
        const favCount = Math.floor(Math.random() * 4) + 3;
        
        for (let i = 1; i <= favCount; i++) {
          const externalId = `${type}_${Math.floor(Math.random() * 1000)}`;
          
          await pool.query(
            `INSERT INTO public.library_items (user_id, media_type, list_key, external_id, title, image_url)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id, media_type, list_key, external_id) DO NOTHING`,
            [userId.id, type, 'favorites', externalId, `${type} Item ${i}`, null]
          );
          libraryCount++;
        }
      }
    }
    console.log(`✓ ${libraryCount} items de librería creados`);

    console.log('\n✨ ¡Seeding completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   • Usuarios creados: ${userIds.length}`);
    console.log(`   • Posts creados: ${postIds.length}`);
    console.log(`   • Likes creados: ${likeCount}`);
    console.log(`   • Comentarios creados: ${commentCount}`);
    console.log(`   • Items de librería creados: ${libraryCount}`);
    console.log('\n🔑 Credenciales de prueba (contraseña: password123):');
    userIds.forEach(u => {
      console.log(`   • ${u.username}`);
    });

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante seeding:', err);
    process.exit(1);
  }
}

seedData();
