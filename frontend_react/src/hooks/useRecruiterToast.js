import { useCallback, useEffect, useState } from "react";

function useRecruiterToast(duration = 3000) {
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast({ message: "", type: "success" });
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, toast]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: "", type: "success" });
  }, []);

  return { toast, showToast, clearToast };
}

export default useRecruiterToast;
