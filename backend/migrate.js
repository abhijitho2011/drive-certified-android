require('dotenv').config();
const { execSync } = require('child_process');

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');

try {
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
        stdio: 'inherit',
        env: { ...process.env }
    });
} catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
}
