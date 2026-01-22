const { pool } = require('./db');

const expandedMedia = {
  anime: [
    '1', '5', '16498', '21', '6594', '11757', '37988', '40028', '9969', '16676',
    '50', '239', '8888', '42897', '33656', '33255', '28891', '35761', '36997', '1535',
    '25', '129', '15335', '30652', '32615', '16662', '19', '15', '37999', '41514',
    '46', '52', '2001', '215', '2904', '3332', '3511', '5680', '9253', '13125'
  ],
  manga: [
    '2', '1', '13', '4', '30', '42', '140', '1706', '823', '25',
    '9', '34', '100', '200', '300', '400', '500', '600', '700', '800',
    '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010', '2001', '2002',
    '3001', '3002', '3003', '3004', '3005', '3006', '3007', '3008', '3009', '3010'
  ],
  games: [
    'elden-ring', 'cyberpunk-2077', 'starfield', 'baldurs-gate-3', 'final-fantasy-vii',
    'minecraft', 'fortnite', 'valorant', 'league-of-legends', 'dota-2',
    'zelda-tears-of-the-kingdom', 'super-mario-bros', 'pokemon-scarlet', 'hollow-knight', 'stardew-valley',
    'hades', 'celeste', 'palworld', 'dragon-age-inquisition', 'mass-effect-3',
    'witcher-3', 'god-of-war', 'horizon-zero-dawn', 'ghost-of-tsushima', 'uncharted-4',
    'the-last-of-us', 'red-dead-redemption-2', 'gta-v', 'call-of-duty', 'overwatch-2'
  ],
  music: [
    'artist-1', 'artist-2', 'artist-3', 'artist-4', 'artist-5',
    'anime-ost-1', 'anime-ost-2', 'game-ost-1', 'game-ost-2', 'jpop-1',
    'anime-ed-1', 'anime-op-1', 'lo-fi-1', 'synth-1', 'electronic-1',
    'ost-3', 'ost-4', 'ost-5', 'jpop-2', 'jpop-3',
    'kpop-1', 'vocaloid-1', 'vtuber-ost-1', 'gaming-ost-1', 'ambient-1',
    'rock-1', 'metal-1', 'pop-1', 'indie-1', 'edm-1'
  ]
};

const morePosts = [
  'Este anime es increíble, la trama es genial',
  'Acabo de descubrir este manga y estoy obsesionado',
  'Los gráficos de este juego son alucinantes',
  'La música de este artista es perfecta',
  'Recomiendo este contenido 100%',
  '¿Alguien más ha visto esto? Es excelente',
  'Mi favorito de este año sin dudarlo',
  'Subió mi expectativa mucho, qué obra',
  'Es difícil no quedar cautivado por esto',
  'Cada vez que lo veo me emociono más',
  'Definitivamente es uno de los mejores',
  'No tenía idea que algo así podía ser tan bueno',
  'Esto merece mucho más reconocimiento',
  'Está en mi top 5 sin lugar a dudas',
  'La calidad es insuperable, bravo',
  'Me hace muy feliz ver contenido así',
  'Espero que haya más así pronto',
  'Este tipo de contenido es lo que necesitaba',
  'Simplemente perfecto en todos los aspectos',
  'Un verdadero tesoro, gracias por mostrarlo'
];

async function expandActivity() {
  try {
    console.log('🚀 Iniciando expansión masiva de actividad...\n');

    const testUserIds = Array.from({ length: 10 }, (_, i) => 10 + i);

    // 1. Agregar muchos más likes a media
    console.log('📌 Agregando miles de likes a media...');
    let mediaLikesCount = 0;

    for (const type of Object.keys(expandedMedia)) {
      const mediaIds = expandedMedia[type];
      
      // Para cada usuario, dar múltiples likes
      for (const userId of testUserIds) {
        // Cada usuario da like a 15-25 items
        const likeCount = Math.floor(Math.random() * 11) + 15;
        const selectedMedia = mediaIds
          .sort(() => Math.random() - 0.5)
          .slice(0, likeCount);

        for (const mediaId of selectedMedia) {
          try {
            await pool.query(
              `INSERT INTO public.media_likes (user_id, media_type, media_id)
               VALUES ($1, $2, $3)
               ON CONFLICT (user_id, media_type, media_id) DO NOTHING`,
              [userId, type, mediaId]
            );
            mediaLikesCount++;
          } catch (e) {}
        }
      }
    }
    console.log(`✓ ${mediaLikesCount} likes agregados a media\n`);

    // 2. Agregar muchos más likes a posts
    console.log('❤️ Agregando miles de likes a posts...');
    const { rows: allPosts } = await pool.query('SELECT id FROM public.posts LIMIT 1000');
    let postLikesCount = 0;

    for (const post of allPosts) {
      // Cada post recibe likes de 5-15 usuarios
      const likerCount = Math.floor(Math.random() * 11) + 5;
      const likers = testUserIds
        .sort(() => Math.random() - 0.5)
        .slice(0, likerCount);

      for (const userId of likers) {
        try {
          await pool.query(
            `INSERT INTO public.post_likes (user_id, post_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, post_id) DO NOTHING`,
            [userId, post.id]
          );
          postLikesCount++;
        } catch (e) {}
      }
    }
    console.log(`✓ ${postLikesCount} likes agregados a posts\n`);

    // 3. Agregar muchos más comentarios a posts
    console.log('💬 Agregando miles de comentarios...');
    let commentsCount = 0;

    for (const post of allPosts) {
      // Cada post recibe 5-15 comentarios
      const commentCount = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < commentCount; i++) {
        const userId = testUserIds[Math.floor(Math.random() * testUserIds.length)];
        const content = morePosts[Math.floor(Math.random() * morePosts.length)];
        const daysAgo = Math.floor(Math.random() * 30);

        try {
          await pool.query(
            `INSERT INTO public.post_comments (user_id, post_id, content, created_at)
             VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days')`,
            [userId, post.id, content]
          );
          commentsCount++;
        } catch (e) {}
      }
    }
    console.log(`✓ ${commentsCount} comentarios agregados\n`);

    // 4. Agregar más posts desde usuarios
    console.log('📰 Creando más posts...');
    let newPostsCount = 0;

    for (const userId of testUserIds) {
      // Cada usuario crea 5-10 posts adicionales
      const postCount = Math.floor(Math.random() * 6) + 5;

      for (let i = 0; i < postCount; i++) {
        const content = morePosts[Math.floor(Math.random() * morePosts.length)];
        const daysAgo = Math.floor(Math.random() * 60);

        try {
          await pool.query(
            `INSERT INTO public.posts (user_id, content, created_at)
             VALUES ($1, $2, NOW() - INTERVAL '${daysAgo} days')`,
            [userId, content]
          );
          newPostsCount++;
        } catch (e) {}
      }
    }
    console.log(`✓ ${newPostsCount} posts creados\n`);

    // 5. Agregar más relaciones de follow
    console.log('👥 Creando más seguimientos...');
    let followsCount = 0;

    for (let i = 0; i < testUserIds.length; i++) {
      // Cada usuario sigue a 6-9 usuarios más
      const followCount = Math.floor(Math.random() * 4) + 6;
      const indices = Array.from({ length: testUserIds.length }, (_, idx) => idx)
        .filter(idx => idx !== i)
        .sort(() => Math.random() - 0.5)
        .slice(0, followCount);

      for (const idx of indices) {
        try {
          await pool.query(
            `INSERT INTO public.followers (follower_id, followed_id)
             VALUES ($1, $2)
             ON CONFLICT (follower_id, followed_id) DO NOTHING`,
            [testUserIds[i], testUserIds[idx]]
          );
          followsCount++;
        } catch (e) {}
      }
    }
    console.log(`✓ ${followsCount} relaciones de follow creadas\n`);

    console.log('✨ ¡Expansión completada exitosamente!');
    console.log('\n📊 Resumen de nuevos datos:');
    console.log(`   • Likes en media: ${mediaLikesCount}`);
    console.log(`   • Likes en posts: ${postLikesCount}`);
    console.log(`   • Comentarios: ${commentsCount}`);
    console.log(`   • Posts nuevos: ${newPostsCount}`);
    console.log(`   • Seguimientos: ${followsCount}`);
    console.log(`   • TOTAL DE NUEVOS REGISTROS: ${mediaLikesCount + postLikesCount + commentsCount + newPostsCount + followsCount}`);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante expansión:', err);
    process.exit(1);
  }
}

expandActivity();
