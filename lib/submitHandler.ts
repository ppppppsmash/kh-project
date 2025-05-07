type FormData<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
type UseSubmitProps<T, D = FormData<T>> = {
  // server action
  action: (data: D) => Promise<void>;
  // client action
  onSuccess?: () => void;
  onError?: () => void;
};

export const useSubmit = <T, D = FormData<T>>({ action, onSuccess, onError }: UseSubmitProps<T, D>) => {
  const handleSubmit = async (data: D) => {
    try {
      await action(data);
      onSuccess?.();
    } catch (error) {
      onError?.();
    }
  };

  return { handleSubmit };
};
