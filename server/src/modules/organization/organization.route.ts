import express from "express";
import { OrganizationController } from "./organization.controller";

const router = express.Router();

router.post("/", OrganizationController.createOrganization);
router.get("/", OrganizationController.getOrganizations);
router.get("/:id", OrganizationController.getOrganization);
router.patch("/:id", OrganizationController.updateOrganization);

export const organizationRoutes = router;
