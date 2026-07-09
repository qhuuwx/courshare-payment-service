import { Router} from "express";
import { handleStripeWebhook } from "../controllers/webhook.controller";

const webhookRouter = Router();
webhookRouter.post("/stripe",handleStripeWebhook);
export default webhookRouter;