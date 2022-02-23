import { Router } from "express";
import PasteController from "./controllers/paste.js";
import { catchError } from "./middlewares/error.js";

const router = new Router();

router.get("/", [PasteController.getAllPastes, catchError]);
router.get("/paste/:id", [PasteController.getPaste, catchError]);
router.get("/paste", PasteController.getCreateNewPaste);
router.post("/paste", [PasteController.postCreateNewPaste, catchError]);
router.get("/delete/:id", [PasteController.deletePaste, catchError]);

export default router;