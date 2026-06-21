const { default: EmbeddedPostgres } = require('embedded-postgres');
const { execSync, spawn } = require('child_process');
const path = require('path');

const PG_PORT = 5433;
const DB_URL = `postgresql://afristocks:afristocks@localhost:${PG_PORT}/afristocks`;

async function main() {
  console.log('🐘 Demarrage PostgreSQL embarque...');

  const pg = new EmbeddedPostgres({
    databaseDir: path.join(__dirname, '.pg-data'),
    user: 'afristocks',
    password: 'afristocks',
    port: PG_PORT,
    persistent: true,
    postgresFlags: ['-c', 'unix_socket_directories='],
  });

  try { await pg.initialise(); } catch {}
  try { await pg.start(); console.log(`✅ PostgreSQL sur port ${PG_PORT}`); }
  catch (e) { if (e.message?.includes('already')) console.log('✅ PostgreSQL deja actif'); else throw e; }
  try { await pg.createDatabase('afristocks'); console.log('✅ DB creee'); }
  catch { console.log('✅ DB existe'); }

  // Setup schema + seed via raw SQL
  console.log('\n📦 Application du schema SQL...');
  execSync(`node setup-db.js`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: DB_URL },
    cwd: __dirname,
  });

  // Prisma generate skipped - using custom pg-based wrapper in .prisma/client/
  console.log('\n✅ Wrapper Prisma (pg-based) deja en place');

  // Start backend
  console.log('\n🚀 Demarrage du backend sur port 5002...');
  const backend = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/server.ts'], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: DB_URL, PORT: '5002', NODE_ENV: 'development',
      JWT_SECRET: 'local_dev_jwt_secret_afristocks_2026',
      JWT_REFRESH_SECRET: 'local_dev_refresh_secret_2026',
      FRONTEND_URL: 'http://localhost:3001',
      PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1' },
    cwd: __dirname,
  });

  const shutdown = async () => { backend.kill(); await pg.stop(); process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  backend.on('exit', async (code) => { await pg.stop(); process.exit(code || 0); });
}

main().catch(err => { console.error('❌', err); process.exit(1); });
