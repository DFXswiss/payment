import { UserRole } from "../models/User";
import { Session } from "../services/AuthService";
import useGuard from "./useGuard";

const useAuthGuard = (session?: Session, allowedRoles: UserRole[] = []) => {
  useGuard(() => session && (!session.isLoggedIn || (allowedRoles.length > 0 && !allowedRoles.includes(session.role ?? UserRole.Unknown))), [session]);
};

export default useAuthGuard;