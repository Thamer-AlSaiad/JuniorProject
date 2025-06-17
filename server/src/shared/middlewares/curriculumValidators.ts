import { body } from 'express-validator';

export const pathValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('slug')
      .notEmpty()
      .withMessage('Slug is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('estimatedHours')
      .notEmpty()
      .withMessage('Estimated hours is required')
      .isInt({ min: 1, max: 500 })
      .withMessage('Estimated hours must be between 1 and 500')
  ],
  update: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('slug')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('estimatedHours')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Estimated hours must be between 1 and 500')
  ]
};

export const courseValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('slug')
      .notEmpty()
      .withMessage('Slug is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('pathId')
      .notEmpty()
      .withMessage('Path ID is required')
      .isMongoId()
      .withMessage('Path ID must be a valid MongoDB ID'),
    body('estimatedHours')
      .notEmpty()
      .withMessage('Estimated hours is required')
      .isInt({ min: 1, max: 200 })
      .withMessage('Estimated hours must be between 1 and 200'),
    body('objectives')
      .notEmpty()
      .withMessage('Objectives are required')
      .isArray()
      .withMessage('Objectives must be an array')
      .isLength({ min: 1, max: 10 })
      .withMessage('Objectives must have between 1 and 10 items')
  ],
  update: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('slug')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('estimatedHours')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('Estimated hours must be between 1 and 200'),
    body('objectives')
      .optional()
      .isArray()
      .withMessage('Objectives must be an array')
      .isLength({ min: 1, max: 10 })
      .withMessage('Objectives must have between 1 and 10 items'),
    body('prerequisites')
      .optional()
      .isArray()
      .withMessage('Prerequisites must be an array'),
    body('changeDescription')
      .optional()
      .isString()
      .withMessage('Change description must be a string')
  ],
  reorder: [
    body('courseOrder')
      .notEmpty()
      .withMessage('Course order is required')
      .isArray()
      .withMessage('Course order must be an array'),
    body('courseOrder.*.id')
      .notEmpty()
      .withMessage('Course ID is required')
      .isMongoId()
      .withMessage('Course ID must be a valid MongoDB ID'),
    body('courseOrder.*.order')
      .notEmpty()
      .withMessage('Order is required')
      .isInt({ min: 1 })
      .withMessage('Order must be a positive integer')
  ]
};

export const sectionValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('slug')
      .notEmpty()
      .withMessage('Slug is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('pathId')
      .notEmpty()
      .withMessage('Path ID is required')
      .isMongoId()
      .withMessage('Path ID must be a valid MongoDB ID'),
    body('estimatedHours')
      .notEmpty()
      .withMessage('Estimated hours is required')
      .isInt({ min: 1, max: 1000 })
      .withMessage('Estimated hours must be between 1 and 1000')
  ],
  update: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('slug')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('estimatedHours')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Estimated hours must be between 1 and 1000')
  ],
  reorder: [
    body('sectionOrder')
      .notEmpty()
      .withMessage('Section order is required')
      .isArray()
      .withMessage('Section order must be an array'),
    body('sectionOrder.*.id')
      .notEmpty()
      .withMessage('Section ID is required')
      .isMongoId()
      .withMessage('Section ID must be a valid MongoDB ID'),
    body('sectionOrder.*.order')
      .notEmpty()
      .withMessage('Order is required')
      .isInt({ min: 1 })
      .withMessage('Order must be a positive integer')
  ]
};

export const lessonValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('slug')
      .notEmpty()
      .withMessage('Slug is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('sectionId')
      .notEmpty()
      .withMessage('Section ID is required')
      .isMongoId()
      .withMessage('Section ID must be a valid MongoDB ID'),
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    body('estimatedMinutes')
      .notEmpty()
      .withMessage('Estimated minutes is required')
      .isInt({ min: 1, max: 300 })
      .withMessage('Estimated minutes must be between 1 and 300'),
    body('projectInstructions')
      .optional()
      .isLength({ min: 10 })
      .withMessage('Project instructions must be at least 10 characters')
  ],
  update: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('slug')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Slug must be between 3 and 100 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('estimatedMinutes')
      .optional()
      .isInt({ min: 1, max: 300 })
      .withMessage('Estimated minutes must be between 1 and 300')
  ],
  updateContent: [
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    body('projectInstructions')
      .optional(),
    body('changeDescription')
      .optional()
      .isString()
      .withMessage('Change description must be a string')
  ],
  reorder: [
    body('lessonOrder')
      .notEmpty()
      .withMessage('Lesson order is required')
      .isArray()
      .withMessage('Lesson order must be an array'),
    body('lessonOrder.*.id')
      .notEmpty()
      .withMessage('Lesson ID is required')
      .isMongoId()
      .withMessage('Lesson ID must be a valid MongoDB ID'),
    body('lessonOrder.*.order')
      .notEmpty()
      .withMessage('Order is required')
      .isInt({ min: 1 })
      .withMessage('Order must be a positive integer')
  ]
};

export const projectSubmissionValidation = {
  submit: [
    body('lessonId')
      .notEmpty()
      .withMessage('Lesson ID is required')
      .isMongoId()
      .withMessage('Lesson ID must be a valid MongoDB ID'),
    body('submission')
      .notEmpty()
      .withMessage('Submission content is required')
      .isLength({ min: 1, max: 50000 })
      .withMessage('Submission must be between 1 and 50000 characters'),
    body('submissionType')
      .notEmpty()
      .withMessage('Submission type is required')
      .isIn(['url', 'text', 'code', 'json'])
      .withMessage('Submission type must be url, text, code, or json')
  ],
  review: [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['approved', 'needs_revision'])
      .withMessage('Status must be either approved or needs_revision'),
    body('feedback')
      .notEmpty()
      .withMessage('Feedback is required')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Feedback must be between 10 and 2000 characters')
  ]
}; 