import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import paymentsRouter from "./routes/payments.route";
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8083;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Roots/Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "payment-service",
    status: "UP"
  });
});
app.use("/payments", paymentsRouter);
// Start Express Server
const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("[server]: Shutting down server...");
  server.close(async () => {
    console.log("[server]: Express server closed.");
    await prisma.$disconnect();
    console.log("[server]: Prisma client disconnected.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
