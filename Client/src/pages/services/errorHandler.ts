import { toast } from '../../components/ui/toast-wrapper';

export const handleError = (error: any, defaultMessage: string = 'An error occurred'): never => {
  const errorMessage = error.response?.data?.message || defaultMessage;
  
  toast.error("Error", {
    description: errorMessage
  });

  console.error(errorMessage, error);
  
  throw new Error(errorMessage);
}; 