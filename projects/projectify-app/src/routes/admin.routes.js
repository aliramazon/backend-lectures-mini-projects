import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const adminRouter = Router();

adminRouter.post("/sign-up", adminController.signUp);
adminRouter.post("/login", adminController.login);
adminRouter.get("/activate", adminController.activate);
adminRouter.patch("/forgot-password", adminController.forgotPassword);
adminRouter.patch("/reset-password", adminController.resetPassword);
adminRouter.get("/me", adminMiddleware.authenticate, adminController.getMe);
export { adminRouter };
