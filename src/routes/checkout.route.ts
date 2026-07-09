import { Router } from "express";
import { createCheckoutSession, verifyCheckout } from "../controllers/checkout.controller";

const checkoutRouter = Router();

checkoutRouter.post("/session", createCheckoutSession);
checkoutRouter.get("/verify", verifyCheckout);

export default checkoutRouter;