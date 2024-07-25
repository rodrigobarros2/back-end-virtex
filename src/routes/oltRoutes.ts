import express from "express";
import { uploadFiles } from "../controllers/uploadController";
import { createInfoOlt, getInfoOlt } from "../controllers/infoOltController";
import upload from "../middlewares/multerMiddleware";

const router = express.Router();

router.post(
    "/upload-olt",
    upload.fields([
        { name: "singleCommandOutput", maxCount: 1 },
        { name: "outputOfTwoCommandsIdOne", maxCount: 1 },
        { name: "outputOfTwoCommandsIdTwo", maxCount: 1 },
    ]),
    uploadFiles
);

router.post("/info-olt", createInfoOlt);
router.get("/info-olt", getInfoOlt);

export default router;
