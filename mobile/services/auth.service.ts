import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export const AuthService = {
    async login(email: string, password: string) {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.access_token) {
                await SecureStore.setItemAsync('auth_token', response.data.access_token);
                // Store user info if needed, or fetch it separately
                await SecureStore.setItemAsync('user_email', email);
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async register(data: { firstName: string; lastName: string; email: string; password: string }) {
        try {
            // Backend expects email, password, role.
            // Profile details might need a separate call or backend adjustment.
            // For now, mapping to backend expectation for User model
            const response = await api.post('/auth/register', {
                email: data.email,
                password: data.password,
                role: 'driver', // Mobile app is for drivers
            });

            // Ideally here we would also create the Driver profile entry
            // await api.post('/drivers', { firstName: data.firstName, ... });

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_email');
    },

    async getToken() {
        return await SecureStore.getItemAsync('auth_token');
    }
};
