const bcrypt = require('bcrypt');
bcrypt.hash('hashedpassword1', 10).then(hash => {
  console.log('\n=== Hash bcrypt para: hashedpassword1 ===');
  console.log(hash);
  console.log('\n=== SQL para actualizar usuario ===');
  console.log(`UPDATE public.users SET password = '${hash}' WHERE email = 'john.doe@example.com';`);
});
