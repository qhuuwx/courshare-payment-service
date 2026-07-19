import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger";
import checkoutRouter from "./routes/checkout.route";
import webhookRouter from "./routes/webhooks.route";
import transactionRouter from "./routes/transaction.route";
import { prisma } from "./prisma/prisma";
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8083;

// Middleware
app.use(cors());
app.use("/webhooks",express.raw({
  type: "application/json"
}),webhookRouter);
app.use(express.json());

// Swagger documentation endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Roots/Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "payment-service",
    status: "UP"
  });
});

app.use("/checkout", checkoutRouter);
app.use("/transactions",transactionRouter);
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
