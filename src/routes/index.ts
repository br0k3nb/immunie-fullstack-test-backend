import express from 'express'
import multer from 'multer';
import UserController from '../controllers/UserController';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/user", UserController.view);
router.put("/user/edit", upload.single("image"), UserController.edit);

export default router;