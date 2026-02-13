const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // Create sample users
    let user1, user2;

    try {
      user1 = await prisma.user.create({
        data: {
          googleId: null,
          username: "gamer_pro",
          email: "gamer@example.com",
          displayName: "Gaming Pro",
          bio: "Hardcore gamer",
        },
      });
      console.log("✅ Created user: gamer_pro");
    } catch (e) {
      if (e.code === "P2002") {
        user1 = await prisma.user.findUnique({ where: { username: "gamer_pro" } });
        console.log("⚠️  User gamer_pro already exists");
      } else throw e;
    }

    try {
      user2 = await prisma.user.create({
        data: {
          googleId: null,
          username: "casual_gamer",
          email: "casual@example.com",
          displayName: "Casual Gamer",
          bio: "Play for fun",
        },
      });
      console.log("✅ Created user: casual_gamer");
    } catch (e) {
      if (e.code === "P2002") {
        user2 = await prisma.user.findUnique({ where: { username: "casual_gamer" } });
        console.log("⚠️  User casual_gamer already exists");
      } else throw e;
    }

    // Create sample games
    let game1, game2;

    try {
      game1 = await prisma.game.create({
        data: {
          rawgId: 3498,
          title: "Grand Theft Auto V",
          description: "An open world action-adventure game",
          coverImage: "https://media.rawg.io/media/games/20/20e3718a9dede9b394ac3e91e012676c.jpg",
          releaseDate: new Date("2013-09-17"),
          genres: ["Action", "Adventure"],
          platforms: ["PC", "PlayStation", "Xbox"],
          developer: "Rockstar Games",
          publisher: "Rockstar Games",
          avgRating: 4.5,
          ratingCount: 1500,
        },
      });
      console.log("✅ Created game: Grand Theft Auto V");
    } catch (e) {
      if (e.code === "P2002") {
        game1 = await prisma.game.findUnique({ where: { rawgId: 3498 } });
        console.log("⚠️  Game Grand Theft Auto V already exists");
      } else throw e;
    }

    try {
      game2 = await prisma.game.create({
        data: {
          rawgId: 3328,
          title: "The Witcher 3: Wild Hunt",
          description: "An open world RPG adventure",
          coverImage: "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
          releaseDate: new Date("2015-05-19"),
          genres: ["RPG", "Adventure"],
          platforms: ["PC", "PlayStation", "Xbox"],
          developer: "CD Projekt Red",
          publisher: "CD Projekt Red",
          avgRating: 4.8,
          ratingCount: 2000,
        },
      });
      console.log("✅ Created game: The Witcher 3: Wild Hunt");
    } catch (e) {
      if (e.code === "P2002") {
        game2 = await prisma.game.findUnique({ where: { rawgId: 3328 } });
        console.log("⚠️  Game The Witcher 3: Wild Hunt already exists");
      } else throw e;
    }

    // Create user-game relationships
    try {
      const exists = await prisma.userGame.findUnique({
        where: { userId_gameId: { userId: user1.id, gameId: game1.id } },
      });
      if (!exists) {
        await prisma.userGame.create({
          data: {
            userId: user1.id,
            gameId: game1.id,
            status: "COMPLETED",
            rating: 9,
            review: "Amazing game! One of the best open world games ever.",
            isFavorite: true,
            completedAt: new Date("2024-01-15"),
            startedAt: new Date("2023-12-01"),
          },
        });
        console.log("✅ Created UserGame: gamer_pro + GTA V");
      } else {
        console.log("⚠️  UserGame gamer_pro + GTA V already exists");
      }
    } catch (e) {
      console.error("Error with GTA V user game:", e.message);
    }

    try {
      const exists = await prisma.userGame.findUnique({
        where: { userId_gameId: { userId: user1.id, gameId: game2.id } },
      });
      if (!exists) {
        await prisma.userGame.create({
          data: {
            userId: user1.id,
            gameId: game2.id,
            status: "PLAYING",
            isFavorite: true,
            startedAt: new Date("2025-01-10"),
          },
        });
        console.log("✅ Created UserGame: gamer_pro + Witcher 3");
      } else {
        console.log("⚠️  UserGame gamer_pro + Witcher 3 already exists");
      }
    } catch (e) {
      console.error("Error with Witcher 3 user game:", e.message);
    }

    // Create activities
    try {
      await prisma.activity.create({
        data: {
          userId: user1.id,
          gameId: game1.id,
          type: "COMPLETED",
          metadata: { rating: 9 },
        },
      });
      console.log("✅ Created Activity: GTA V completed");
    } catch (e) {
      console.error("Error creating activity:", e.message);
    }

    // Create comments/reviews
    try {
      await prisma.comment.create({
        data: {
          userId: user1.id,
          gameId: game1.id,
          content: "Best open world game I've ever played!",
          isReview: true,
          likes: 25,
        },
      });
      console.log("✅ Created Comment: GTA V review");
    } catch (e) {
      console.error("Error creating comment:", e.message);
    }

    // Create a follow relationship
    try {
      const exists = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: user1.id, followingId: user2.id } },
      });
      if (!exists) {
        await prisma.follow.create({
          data: { followerId: user1.id, followingId: user2.id },
        });
        console.log("✅ Created Follow: gamer_pro -> casual_gamer");
      } else {
        console.log("⚠️  Follow relationship already exists");
      }
    } catch (e) {
      console.error("Error creating follow:", e.message);
    }

    console.log("\n✅ Seed data completed!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
