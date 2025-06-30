const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

async function main() {
  // Step 1: Create Roles
  const roleNames = ['Admin', 'User', 'Manager', 'Editor', 'Viewer'];
  const roles = await Promise.all(
    roleNames.map(name =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `${name} role`,
          permissions: { access: `${name}-level` }, // sample JSON
        },
      })
    )
  );

  // Step 2: Create 50 Users
  for (let i = 0; i < 50; i++) {
    const dob = faker.date.birthdate({ min: 18, max: 60, mode: 'age' });
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password(),
        emailVerified: faker.date.recent({ days: 30 }),
        dob,
        address: faker.location.streetAddress(),
        roles: {
          connect: [
            {
              id: roles[Math.floor(Math.random() * roles.length)].id,
            },
          ],
        },
      },
    });
  }

  // Step 3: Create 50 Products
  for (let i = 0; i < 50; i++) {
    await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        category: faker.commerce.department(),
      },
    });
  }

  console.log('✅ Seeded 50 users, roles, and products successfully.');
}

main()
  .catch(e => {
    console.error('❌ Error while seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
