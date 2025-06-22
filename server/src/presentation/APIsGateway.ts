import { Router } from 'express';
import { DI } from '../core/container';
import {
  validate,
  registerValidator,
  loginValidator,
  verifyAccountValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  resendVerificationValidator,
  updateProfileValidator,
  changePasswordValidator
} from '../shared/middlewares/Validator';

const router = Router();

// PUBLIC ROUTES 

router.post('/auth/register', validate(registerValidator), DI.authController.register);
router.post('/auth/verify-account', validate(verifyAccountValidator), DI.authController.verifyAccount);
router.post('/auth/login', validate(loginValidator), DI.authController.login);
router.post('/auth/forgot-password', validate(forgotPasswordValidator), DI.authController.forgotPassword);
router.post('/auth/reset-password', validate(resetPasswordValidator), DI.authController.resetPassword);
router.post('/auth/resend-verification', validate(resendVerificationValidator), DI.authController.resendVerification);


router.get('/curriculum/paths', DI.curriculumController.getPaths);
router.get('/curriculum/paths/:identifier', DI.curriculumController.getPath);
router.get('/curriculum/paths/:pathId/sections', DI.curriculumController.getSectionsByPath);
router.get('/curriculum/sections/:sectionId/lessons', DI.lessonController.getLessonsBySection);
router.get('/curriculum/lessons/:identifier', DI.lessonController.getLesson);
router.get('/curriculum/lessons/:lessonId/raw-content', DI.contentController.getRawContent);

// PROTECTED ROUTES

router.use(DI.authMiddleware);

router.get('/auth/current-user', DI.authController.getCurrentUser);
router.patch('/users/profile', validate(updateProfileValidator), DI.userController.updateUserProfile);
router.patch('/users/password', validate(changePasswordValidator), DI.userController.changePassword);
router.get('/learning/progress', DI.lessonController.getUserLessonProgress);
router.post('/learning/lessons/:lessonId/complete', DI.lessonController.markLessonAsCompleted);

export default router;