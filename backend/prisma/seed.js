const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // Create sample users (with error handling for duplicates)
    let user1, user2;

    try {
      user1 = await prisma.user.create({
        data: {
          googleId: null,
          username: "gamer_pro",
          email: "gamer@example.com",
          displayName: "Gaming Pro",
          bio: "Hardcore gamer",
          isStreamer: false,
        },
      });
      console.log("✅ Created user: gamer_pro");
    } catch (e) {
      if (e.code === "P2002") {
        user1 = await prisma.user.findUnique({
          where: { username: "gamer_pro" },
        });
        console.log("⚠️  User gamer_pro already exists");
      } else throw e;
    }

    try {
      user2 = await prisma.user.create({
        data: {
          googleId: null,
          username: "streamer_king",
          email: "streamer@example.com",
          displayName: "Streamer King",
          bio: "Professional streamer",
          isStreamer: true,
        },
      });
      console.log("✅ Created user: streamer_king");
    } catch (e) {
      if (e.code === "P2002") {
        user2 = await prisma.user.findUnique({
          where: { username: "streamer_king" },
        });
        console.log("⚠️  User streamer_king already exists");
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
          coverImage:
            "https://media.rawg.io/media/games/20/20e3718a9dede9b394ac3e91e012676c.jpg",
          releaseDate: new Date("2013-09-17"),
          genres: ["Action", "Adventure"],
          platforms: ["PC", "PlayStation", "Xbox"],
          developer: "Rockstar Games",
          publisher: "Rockstar Games",
          metacriticScore: 97,
          avgRating: 4.5,
          ratingCount: 1500,
          playingCount: 250,
          completedCount: 150,
          abandonedCount: 10,
          wishlistCount: 50,
        },
      });
      console.log("✅ Created game: Grand Theft Auto V");
    } catch (e) {
      if (e.code === "P2002") {
        game1 = await prisma.game.findUnique({
          where: { rawgId: 3498 },
        });
        console.log("⚠️  Game Grand Theft Auto V already exists");
      } else throw e;
    }

    try {
      game2 = await prisma.game.create({
        data: {
          rawgId: 3328,
          title: "The Witcher 3: Wild Hunt",
          description: "An open world RPG adventure",
          coverImage:
            "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
          releaseDate: new Date("2015-05-19"),
          genres: ["RPG", "Adventure"],
          platforms: ["PC", "PlayStation", "Xbox"],
          developer: "CD Projekt Red",
          publisher: "CD Projekt Red",
          metacriticScore: 92,
          avgRating: 4.8,
          ratingCount: 2000,
          playingCount: 300,
          completedCount: 200,
          abandonedCount: 5,
          wishlistCount: 100,
        },
      });
      console.log("✅ Created game: The Witcher 3: Wild Hunt");
    } catch (e) {
      if (e.code === "P2002") {
        game2 = await prisma.game.findUnique({
          where: { rawgId: 3328 },
        });
        console.log("⚠️  Game The Witcher 3: Wild Hunt already exists");
      } else throw e;
    }

    // Create user-game relationships (only if they don't exist)
    try {
      const existingUserGame1 = await prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId: user1.id,
            gameId: game1.id,
          },
        },
      });

      if (!existingUserGame1) {
        await prisma.userGame.create({
          data: {
            userId: user1.id,
            gameId: game1.id,
            status: "COMPLETED",
            rating: 9,
            review: "Amazing game! One of the best open world games ever.",
            isFavorite: true,
            playCount: 3,
            totalHours: 120,
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
      const existingUserGame2 = await prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId: user1.id,
            gameId: game2.id,
          },
        },
      });

      if (!existingUserGame2) {
        await prisma.userGame.create({
          data: {
            userId: user1.id,
            gameId: game2.id,
            status: "PLAYING",
            rating: null,
            isFavorite: true,
            playCount: 1,
            totalHours: 45,
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

    // Create play sessions
    try {
      const userGame1 = await prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId: user1.id,
            gameId: game1.id,
          },
        },
      });

      if (userGame1) {
        await prisma.playSession.create({
          data: {
            userId: user1.id,
            gameId: game1.id,
            userGameId: userGame1.id,
            durationMinutes: 120,
            platform: "PC",
            note: "Finished the main story",
            playedAt: new Date("2024-01-15"),
          },
        });
        console.log("✅ Created PlaySession: GTA V");
      }
    } catch (e) {
      console.error("Error creating GTA V session:", e.message);
    }

    try {
      const userGame2 = await prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId: user1.id,
            gameId: game2.id,
          },
        },
      });

      if (userGame2) {
        await prisma.playSession.create({
          data: {
            userId: user1.id,
            gameId: game2.id,
            userGameId: userGame2.id,
            durationMinutes: 90,
            platform: "PC",
            note: "Exploring Novigrad",
            playedAt: new Date("2025-01-14"),
          },
        });
        console.log("✅ Created PlaySession: Witcher 3");
      }
    } catch (e) {
      console.error("Error creating Witcher 3 session:", e.message);
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

    try {
      await prisma.activity.create({
        data: {
          userId: user1.id,
          gameId: game2.id,
          type: "SESSION",
          metadata: { durationMinutes: 90 },
        },
      });
      console.log("✅ Created Activity: Witcher 3 session");
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
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user1.id,
            followingId: user2.id,
          },
        },
      });

      if (!existingFollow) {
        await prisma.follow.create({
          data: {
            followerId: user1.id,
            followingId: user2.id,
          },
        });
        console.log("✅ Created Follow: gamer_pro -> streamer_king");
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
