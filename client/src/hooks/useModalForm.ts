import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

interface UseModalFormProps<T extends Record<string, any>> {
  schema: yup.ObjectSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: (message?: string) => void;
  onError?: (error: any) => void;
}

export const useModalForm = <T extends Record<string, any>>({
  schema,
  onSubmit,
  onSuccess,
  onError
}: UseModalFormProps<T>) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  const form = useForm<T>({
    resolver: yupResolver(schema) as any,
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const modalToggle = () => {
    setOpen(!open);
  };

  const handleFormSubmit = async (data: T) => {
    setLoading(true);
    try {
      await onSubmit(data);
      setOpen(false);
      onSuccess?.("Operation completed successfully");
      reset();
    } catch (error: any) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const firstError = Object.values(errors)[0];
    if (firstError && 'message' in firstError) {
      toast.error(firstError.message as string);
    }
  }, [errors]);

  return {
    open,
    setOpen,
    loading,
    setLoading,
    modalRef,
    modalToggle,
    form,
    handleSubmit: handleSubmit(handleFormSubmit),
    reset,
  };
};
