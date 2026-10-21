// src/shared/hooks/useAuth.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { login as loginApi, register as registerApi, changePassword as changePasswordApi, getUserProfile } from "../api/auth";

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
        onSuccess: (response) => {
            const token = response?.data?.accessToken || response?.accessToken || "";
            const refreshToken =
                response?.data?.refreshToken || response?.refreshToken || null;
            const apiUser = response?.data?.user || {};

            let role = apiUser.role?.toLowerCase();
            if (!role) {
                if (apiUser.email?.includes("teacher")) role = "teacher";
                else if (apiUser.email?.includes("student")) role = "student";
                else role = "admin";
            }

            const userData = { ...apiUser, role };

            setAuth(userData, token, refreshToken);

            // Force a password change first if the backend says so
            // (adjust the route to match yours)
            if (userData.require_password_change) {
                navigate("/change-password");
                return;
            }

            if (role === "admin") navigate("/admin");
            else if (role === "teacher") navigate("/teacher");
            else if (role === "student") navigate("/student");
            else navigate("/dashboard");
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
            current.setAuth({
                token: current.token,
                user,
                requiresPasswordChange: current.requiresPasswordChange,
            });
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