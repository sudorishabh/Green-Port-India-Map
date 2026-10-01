import app from "./app";
import * as dotenv from "dotenv";
import { testConnection } from "./drizzle/db";

dotenv.config();

const PORT = process.env.PORT || 3001;
async function testDbConnection() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log("✅ DATABASE connection successful");
    } else {
      console.error("❌ DATABASE connection failed");
    }
    return isConnected;
  } catch (error) {
    console.error("❌ DATABASE connection failed:", error);
    return false;
  }
}

async function startServer() {
  const dbConnected = await testDbConnection();

  if (!dbConnected) {
    console.warn("⚠️ STARTING server despite database connection issues");
  }

  const server = app.listen(PORT, () => {
    console.log(`✅ SERVER listening on port ${PORT}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error(`Error starting server: ${error.message}`);
    }
    process.exit(1);
  });
}
startServer();
