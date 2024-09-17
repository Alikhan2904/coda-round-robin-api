import { Router } from 'express';
import { post } from '../controllers/MirrorController.js';

const router = Router();
router.post('/mirror', post);

export default router;
