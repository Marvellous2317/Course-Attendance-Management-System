// src/shared/hooks/useAuth.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { login as loginApi, register as registerApi, changePassword as changePasswordApi, getUserProfile } from "../api/auth";
import { getUserRole } from "../guards/RoleRedirect";

export const useAuth = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {
        user,
        token,
        isAuthenticated,
        requiresPasswordChange,
        setAuth,
        clearSession,
    } = useAuthStore();

    const loginMutation = useMutation({
        mutationFn: loginApi,
        onSuccess: async (response) => {
            const token = response?.data?.accessToken || response?.accessToken || "";
            const refreshToken =
                response?.data?.refreshToken || response?.refreshToken || null;
            const apiUser = response?.data?.user || {};

            // 1. Fetch full user profile using the token BEFORE setting auth state
            let profileUser = apiUser;
            try {
                const profileRes = await getUserProfile({
                    Authorization: `Bearer ${token}`,
                });
                const profileData = profileRes?.data || profileRes;
                if (profileData && typeof profileData === 'object') {
                    profileUser = { ...apiUser, ...profileData };
                }
            } catch (err) {
                console.warn("Could not fetch user profile immediately after login:", err);
            }

            // 2. Resolve normalized role (handles "instructor" -> "teacher")
            const role =
                getUserRole(profileUser) ||
                (profileUser.email?.includes("teacher") || profileUser.email?.includes("instructor")
                    ? "teacher"
                    : profileUser.email?.includes("student")
                    ? "student"
                    : "admin");

            const userData = { ...profileUser, role };

            // 3. Set auth ONCE with complete user data and role
            setAuth(userData, token, refreshToken);

            // Force a password change first if the backend says so
            if (userData.require_password_change) {
                navigate("/change-password", { replace: true });
                return;
            }

            // 4. Navigate directly to the corresponding portal
            if (role === "admin") navigate("/admin", { replace: true });
            else if (role === "teacher" || role === "instructor") navigate("/teacher", { replace: true });
            else if (role === "student") navigate("/student", { replace: true });
            else navigate("/dashboard", { replace: true });
        },
    });

    const registerMutation = useMutation({
        mutationFn: registerApi,
        onSuccess: () => navigate("/login"),
    });

    const changePasswordMutation = useMutation({
        mutationFn: changePasswordApi,
        onSuccess: (response) => {
            const successMessage =
                response?.data?.message || response?.message || 'Password changed';
            showSuccess(successMessage);
            useAuthStore.getState().clearAuth();
            navigate('/login', { replace: true });
        },
        onError: (error) => {
            showError(error?.response?.data?.message || 'Failed to change password');
        },
    });

     const getProfile = async () => {
        try {
            const profile = await getUserProfile();
            const user = profile?.data || profile;
            const current = useAuthStore.getState();
            current.setUser(user);
            return user;
        } catch (err) {
            // Token likely invalid/expired
            logout();
            throw err;
        }
    };

    const logout = () => {
        clearSession();
        queryClient.clear();
        navigate("/login");
    };

    return {
        user,
        token,
        isAuthenticated,
        requiresPasswordChange,
        getProfile,

        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout,

        changePassword: changePasswordMutation.mutateAsync,
        changePasswordMutation,
        isChangingPassword: changePasswordMutation.isPending,

        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,
        isRegistering: registerMutation.isPending,
        registerError: registerMutation.error,
    };
};

export default useAuth;