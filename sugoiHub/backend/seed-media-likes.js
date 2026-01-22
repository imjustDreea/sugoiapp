const { pool } = require('./db');

const mediaExamples = {
  anime: [
    '1', '5', '16498', '21', '6594', '11757', '37988', '40028', '9969', '16676',
    '50', '239', '1', '8888', '42897', '33656', '33255', '28891', '35761', '36997'
  ],
  manga: [
    '2', '1', '13', '4', '30', '42', '140', '1706', '823', '25', 
    '9', '34', '100', '200', '300', '400', '500', '600', '700', '800'
  ],
  games: [
    'elden-ring', 'cyberpunk-2077', 'starfield', 'baldurs-gate-3', 'final-fantasy-vii',
    'minecraft', 'fortnite', 'valorant', 'league-of-legends', 'dota-2',
    'zelda-tears-of-the-kingdom', 'super-mario-bros', 'pokemon-scarlet', 'hollow-knight', 'stardew-valley'
  ],
  music: [
    'artist-1', 'artist-2', 'artist-3', 'artist-4', 'artist-5',
    'anime-ost-1', 'anime-ost-2', 'game-ost-1', 'game-ost-2', 'jpop-1',
    'anime-ed-1', 'anime-op-1', 'lo-fi-1', 'synth-1', 'electronic-1'
  ]
};

async function seedMediaLikes() {
  try {
    console.log('🎬 Iniciando seeding de likes a media...');

    // Obtener IDs de usuarios de prueba (IDs 10-19)
    const testUserIds = Array.from({ length: 10 }, (_, i) => 10 + i);

    let totalLikes = 0;
    const types = ['anime', 'manga', 'games', 'music'];

    for (const type of types) {
      console.log(`\n📝 Agregando likes para ${type}...`);
      const mediaIds = mediaExamples[type];
      let likesForType = 0;

      // Para cada usuario de prueba
      for (const userId of testUserIds) {
        // Cada usuario da like a 6-10 items de este tipo
        const likeCount = Math.floor(Math.random() * 5) + 6;
        
        // Seleccionar items aleatorios
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
            likesForType++;
            totalLikes++;
          } catch (e) {
            // Ignorar errores individuales
          }
        }
      }

      console.log(`✓ ${likesForType} likes agregados para ${type}`);
    }

    // Agregar likes a animes específicos (tabla anime_likes)
    console.log(`\n🎌 Agregando likes a animes específicos...`);
    let animeSpecificLikes = 0;

    for (const userId of testUserIds) {
      const animeIds = mediaExamples.anime;
      const likeCount = Math.floor(Math.random() * 8) + 5;
      
      const selectedAnime = animeIds
        .sort(() => Math.random() - 0.5)
        .slice(0, likeCount);

      for (const animeId of selectedAnime) {
        try {
          await pool.query(
            `INSERT INTO public.anime_likes (user_id, anime_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, anime_id) DO NOTHING`,
            [userId, animeId]
          );
          animeSpecificLikes++;
        } catch (e) {
          // Ignorar errores individuales
        }
      }
    }

    console.log(`✓ ${animeSpecificLikes} likes agregados a animes`);

    console.log('\n✨ ¡Seeding de media likes completado!');
    console.log(`\n📊 Resumen:`);
    console.log(`   • Likes en media (manga/games/music): ${totalLikes}`);
    console.log(`   • Likes en animes específicos: ${animeSpecificLikes}`);
    console.log(`   • Total de likes: ${totalLikes + animeSpecificLikes}`);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante seeding de media likes:', err);
    process.exit(1);
  }
}

seedMediaLikes();
