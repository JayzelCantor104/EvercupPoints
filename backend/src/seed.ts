// creates the admin and cashier accounts and some rewards
// run with: npm run seed
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StaffUsersService } from './staff-users/staff-users.service';
import { RewardsService } from './rewards/rewards.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const staff = app.get(StaffUsersService);
  const rewards = app.get(RewardsService);

  const accounts = [
    { username: 'admin', password: 'admin123', fullName: 'Jayzel Cantor', role: 'Admin' as const },
    { username: 'cashier', password: 'cashier123', fullName: 'Mark Lopez', role: 'Staff' as const },
  ];

  for (const account of accounts) {
    try {
      await staff.create(account);
      console.log(`Created ${account.role.toLowerCase()} account: ${account.username}`);
    } catch {
      console.log(`Skipped ${account.username} (already exists)`);
    }
  }

  const catalog = [
    { rewardName: 'Free Brewed Coffee', description: 'One regular-size brewed coffee', pointsRequired: 50 },
    { rewardName: 'Free Specialty Latte', description: 'One 16oz specialty latte of choice', pointsRequired: 100 },
    { rewardName: 'Free Croissant', description: 'One butter croissant', pointsRequired: 75 },
  ];

  const existing = await rewards.findAll(1, 100);
  if (existing.total === 0) {
    for (const reward of catalog) {
      await rewards.create(reward);
      console.log(`Added reward: ${reward.rewardName}`);
    }
  } else {
    console.log('Skipped rewards (catalog is not empty)');
  }

  console.log('\nSeed complete. Log in with admin / admin123');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
