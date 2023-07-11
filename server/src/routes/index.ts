import express from "express";
import { organizationRoutes } from "../modules/organization/organization.route";

const router = express.Router();

router.use("/organizations", organizationRoutes);

export default router;
