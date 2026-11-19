const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const categories = [
  ["home-cleaning", "Home cleaning", "Hemstädning", "🧹"],
  ["nanny", "Nanny & childcare", "Barnpassning", "👶"],
  ["garden", "Garden", "Trädgård", "🌿"],
  ["handyman", "Handyman", "Hantverkare", "🔧"],
  ["plumbing", "Plumbing", "VVS", "🚰"],
  ["electrician", "Electrician", "Elektriker", "💡"],
  ["painting", "Painting", "Målning", "🎨"],
  ["pest-control", "Pest control", "Skadedjursbekämpning", "🐜"],
  ["appliance-repair", "Appliance repair", "Reparation av vitvaror", "🧺"],
  ["moving", "Moving help", "Flytthjälp", "📦"],
  ["beauty", "Beauty & wellness", "Skönhet & välmående", "💆"],
];

async function main() {
  for (const [slug, nameEn, nameSv, icon] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { nameEn, nameSv, icon },
      create: { slug, nameEn, nameSv, icon },
    });
  }
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash: await bcrypt.hash("Admin12345!", 10),
      role: "ADMIN",
    },
  });
}
main().finally(() => prisma.$disconnect());