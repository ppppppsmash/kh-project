type FormData<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
type UseSubmitProps<T> = {
  // server action
  action: (data: FormData<T>) => Promise<void>;
  // client action
  onSuccess?: () => void;
  onError?: () => void;
};

export const useSubmit = <T>({ action, onSuccess, onError }: UseSubmitProps<T>) => {
  const handleSubmit = async (data: FormData<T>) => {
    try {
      await action(data);
      onSuccess?.();
    } catch (error) {
      onError?.();
    }
  };

  return { handleSubmit };
};
