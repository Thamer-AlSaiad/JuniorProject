// src/modules/user/userController.ts
import { Request, Response, NextFunction } from 'express';
import { IUserService } from './IUserService';

export class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      
      const user = await this.userService.getUserProfile(userId);
      
      res.status(200).json({
        status: 'success',
        user
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      
      const user = await this.userService.updateUserProfile(userId, req.body);
      
      res.status(200).json({
        status: 'success',
        user
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      
      const result = await this.userService.changePassword(userId, req.body);
      
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  };
}