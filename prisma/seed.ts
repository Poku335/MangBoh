import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const CHAPTERS_PER_MANGA = 3;
const PAGES_PER_CHAPTER = 5;

async function main() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const testImageDir = path.join(process.cwd(), "test_image");
  const allImages = fs
    .readdirSync(testImageDir)
    .filter((f) => f.endsWith(".png"))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""));
      const numB = parseInt(b.replace(/\D/g, ""));
      return numA - numB;
    });

  for (const img of allImages) {
    fs.copyFileSync(
      path.join(testImageDir, img),
      path.join(uploadsDir, img)
    );
  }

  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@manga.com" },
    update: {},
    create: {
      email: "admin@manga.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      coins: 9999,
    },
  });

  const testUser1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      email: "user1@example.com",
      name: "Test User 1",
      role: "USER",
      coins: 50,
    },
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      name: "Test User 2",
      role: "USER",
      coins: 100,
    },
  });

  const mangas = [
    {
      title: "Shadow Blade Chronicles",
      description:
        "A young warrior discovers an ancient blade that grants him the power of shadows. As he unravels the mysteries of the blade's origin, he must confront dark forces that threaten his world.",
      genre: "Action",
      status: "Ongoing",
      coverImage: "/uploads/image_1.png",
    },
    {
      title: "Celestial Academy",
      description:
        "In a world where magic is real, students at the prestigious Celestial Academy compete for glory. Follow Mia as she discovers her rare dual-element abilities and navigates friendship, rivalry, and ancient conspiracies.",
      genre: "Fantasy",
      status: "Ongoing",
      coverImage: "/uploads/image_6.png",
    },
    {
      title: "Steel Heart",
      description:
        "A mechanical engineer in a dystopian future creates an android with a human heart. Together they fight against the oppressive regime that controls the city's energy grid.",
      genre: "Sci-Fi",
      status: "Completed",
      coverImage: "/uploads/image_11.png",
    },
    {
      title: "Dragon's Oath",
      description:
        "A disgraced knight forges an unbreakable pact with the last living dragon. Together they must prevent an ancient evil from awakening beneath the ruins of a forgotten kingdom.",
      genre: "Fantasy",
      status: "Ongoing",
      coverImage: "/uploads/image_16.png",
    },
    {
      title: "Neon Ghost",
      description:
        "In the rain-soaked megacity of Neo Osaka, a hacker who can project her consciousness into the city's neural net hunts a serial killer who exists only inside the grid.",
      genre: "Sci-Fi",
      status: "Ongoing",
      coverImage: "/uploads/image_21.png",
    },
    {
      title: "Sakura Samurai",
      description:
        "During the twilight of the Edo period, a wandering female swordswoman seeks the man who destroyed her clan. Each town she passes through hides a piece of the truth.",
      genre: "Historical",
      status: "Completed",
      coverImage: "/uploads/image_26.png",
    },
    {
      title: "The Last Alchemist",
      description:
        "When the art of alchemy is banned across the empire, its last practitioner must disguise herself as a court herbalist while secretly working to restore balance to a world poisoned by forbidden science.",
      genre: "Fantasy",
      status: "Ongoing",
      coverImage: "/uploads/image_31.png",
    },
    {
      title: "Midnight Detective",
      description:
        "A detective who can read the final memories of the dead takes on cases the living refuse to touch. But each vision costs him a piece of his own past.",
      genre: "Mystery",
      status: "Ongoing",
      coverImage: "/uploads/image_36.png",
    },
    {
      title: "Ocean of Stars",
      description:
        "Two rival navigators on a floating sky-archipelago discover their star charts are half of the same map. Their journey to the world's edge becomes something neither expected.",
      genre: "Romance",
      status: "Ongoing",
      coverImage: "/uploads/image_41.png",
    },
    {
      title: "Iron Fist Academy",
      description:
        "At a martial arts school hidden inside an ordinary high school, students train in secret combat arts inherited from ancient clans. A transfer student with no technique somehow defeats the top fighter on his first day.",
      genre: "Action",
      status: "Ongoing",
      coverImage: "/uploads/image_46.png",
    },
    {
      title: "Phantom Protocol",
      description:
        "An elite ghost operative erases people from existence — memories, records, identities — until the next target is herself. Now she must stay invisible to an agency that trained her to find anyone.",
      genre: "Action",
      status: "Ongoing",
      coverImage: "/uploads/image_3.png",
    },
    {
      title: "Witch's Garden",
      description:
        "A young witch inherits her grandmother's floating botanical garden and discovers every plant is a sealed memory. Tending them means living someone else's forgotten life for a day.",
      genre: "Fantasy",
      status: "Ongoing",
      coverImage: "/uploads/image_8.png",
    },
    {
      title: "Crimson Empire",
      description:
        "Beneath the golden surface of a prosperous empire lie rivers of blood. A palace servant of low birth uncovers a conspiracy that reaches the throne itself and must decide how far she will go for justice.",
      genre: "Historical",
      status: "Ongoing",
      coverImage: "/uploads/image_13.png",
    },
  ];

  const chapters: Array<{ id: number; mangaId: number; chapterNumber: number }> = [];
  const totalImages = allImages.length;

  for (let m = 0; m < mangas.length; m++) {
    const mangaData = mangas[m];
    const manga = await prisma.manga.upsert({
      where: { id: m + 1 },
      update: {},
      create: {
        ...mangaData,
        viewCount: Math.floor(Math.random() * 5000) + 500,
      },
    });

    for (let c = 0; c < CHAPTERS_PER_MANGA; c++) {
      const chapter = await prisma.chapter.upsert({
        where: {
          mangaId_chapterNumber: {
            mangaId: manga.id,
            chapterNumber: c + 1,
          },
        },
        update: { isPaid: false, price: 0 },
        create: {
          mangaId: manga.id,
          chapterNumber: c + 1,
          title: `Chapter ${c + 1}`,
          isPaid: false,
          price: 0,
        },
      });

      chapters.push({ id: chapter.id, mangaId: manga.id, chapterNumber: c + 1 });

      for (let p = 0; p < PAGES_PER_CHAPTER; p++) {
        const imageIndex =
          (m * CHAPTERS_PER_MANGA * PAGES_PER_CHAPTER + c * PAGES_PER_CHAPTER + p) % totalImages;
        await prisma.page.upsert({
          where: {
            chapterId_pageNumber: {
              chapterId: chapter.id,
              pageNumber: p + 1,
            },
          },
          update: {},
          create: {
            chapterId: chapter.id,
            pageNumber: p + 1,
            imagePath: `/uploads/${allImages[imageIndex]}`,
          },
        });
      }
    }
  }

  // Mark last chapter of the final 5 manga as PAID
  const chapsToMakePaid = chapters
    .filter((ch) => ch.chapterNumber === CHAPTERS_PER_MANGA)
    .slice(-5);
  for (const ch of chapsToMakePaid) {
    await prisma.chapter.update({
      where: { id: ch.id },
      data: { isPaid: true, price: 10 },
    });
  }

  if (chapsToMakePaid.length > 0 && chapsToMakePaid[0]) {
    await prisma.purchase.upsert({
      where: {
        userId_chapterId: {
          userId: testUser1.id,
          chapterId: chapsToMakePaid[0].id,
        },
      },
      update: {},
      create: {
        userId: testUser1.id,
        chapterId: chapsToMakePaid[0].id,
        paidAmount: 10,
      },
    });
  }

  console.log("Seed complete!");
  console.log("Admin user: admin@manga.com / admin1234 (9999 coins)");
  console.log("Test users: user1@example.com (50 coins), user2@example.com (100 coins)");
  console.log(
    `${mangas.length} manga, ${mangas.length * CHAPTERS_PER_MANGA} chapters (${PAGES_PER_CHAPTER} pages each)`
  );
  console.log("Last chapter of final 5 manga marked as PAID (10 coins each)");
  console.log("Sample purchase created for user1");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
