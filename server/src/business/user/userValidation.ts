import { body } from 'express-validator';

export const updateProfileValidator = [
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .trim(),
  
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .trim()
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('New password must contain at least one number')
];