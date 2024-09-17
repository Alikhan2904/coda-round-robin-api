import { Router } from 'express';
import { post } from '../controllers/MirrorController.js';
import { validateJson } from '../middlewares/validateJson.js';

const router = Router();
router.post('/mirror', validateJson, post);

export default router;
