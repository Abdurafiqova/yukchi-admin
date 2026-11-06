let timer: ReturnType<typeof setTimeout> | null = null;

export function useToast() {
  const message = useState<string | null>('yukchi-admin-toast', () => null);

  function showToast(text: string) {
    message.value = text;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      message.value = null;
    }, 3000);
  }

  return { message, showToast };
}
