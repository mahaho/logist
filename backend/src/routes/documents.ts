import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
} from '../controllers/documentController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/download', downloadDocument);
router.post('/', requireRole(UserRole.admin, UserRole.dispatcher), upload.single('file'), createDocument);
router.put('/:id', requireRole(UserRole.admin, UserRole.dispatcher), upload.single('file'), updateDocument);
router.delete('/:id', requireRole(UserRole.admin, UserRole.dispatcher), deleteDocument);

export default router;



