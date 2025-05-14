import { useAuth } from "react-oidc-context";
import toast from "react-hot-toast";

export function useTokenGuard() {
  const auth = useAuth();
  const token = auth.user?.id_token;

  const requireToken = (): string | null => {
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return null;
    }
    return token;
  };

  return { token, requireToken };
}