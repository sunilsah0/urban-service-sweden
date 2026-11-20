const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// slug, English, Swedish, icon, taxType
// Check each RUT flag against Skatteverket's list before launch: eligibility depends on the exact task.
const categories = [
  ["home-cleaning", "Home cleaning", "Hemstädning", "🧹", "RUT"],
  ["deep-cleaning", "Deep cleaning", "Storstädning", "✨", "RUT"],
  ["window-cleaning", "Window cleaning", "Fönsterputs", "🪟", "RUT"],
  ["laundry-ironing", "Laundry & ironing", "Tvätt & strykning", "👕", "RUT"],
  ["nanny", "Nanny & childcare", "Barnpassning", "👶", "RUT"],
  ["garden", "Garden care", "Trädgårdsskötsel", "🌿", "RUT"],
  ["snow-removal", "Snow removal", "Snöskottning", "❄️", "RUT"],
  ["moving", "Moving help", "Flytthjälp", "📦", "RUT"],
  ["appliance-repair", "Appliance repair", "Reparation av vitvaror", "🧺", "RUT"],
  ["it-help", "Home IT help", "Datorhjälp i hemmet", "💻", "RUT"],
  ["handyman", "Handyman", "Hantverkare", "🔧", "NONE"],
  ["plumbing", "Plumbing", "VVS", "🚰", "NONE"],
  ["electrician", "Electrician", "Elektriker", "💡", "NONE"],
  ["painting", "Painting", "Målning", "🎨", "NONE"],
  ["pest-control", "Pest control", "Skadedjursbekämpning", "🐜", "NONE"],
  ["beauty", "Beauty & wellness", "Skönhet & välmående", "💆", "NONE"],
  ["pet-care", "Pet care", "Djurpassning", "🐾", "NONE"],
  ["car-care", "Car care", "Bilvård", "🚗", "NONE"],
];

async function main() {
  for (const [slug, nameEn, nameSv, icon, taxType] of categories) {
    const useRut = taxType === "RUT";

    await prisma.category.upsert({
      where: { slug },
      update: { nameEn, nameSv, icon, useRut },
      create: { slug, nameEn, nameSv, icon, useRut },
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