import { api } from './api';

export const DataService = {
    async getApplications() {
        try {
            const response = await api.get('/applications');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async createApplication(data: any) {
        try {
            const response = await api.post('/applications', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getJobs() {
        try {
            // Assuming we have a jobs endpoint or it's filtered user/companies logic
            // For now, placeholder endpoint
            const response = await api.get('/jobs');
            return response.data;
        } catch (error) {
            // Fallback or empty if endpoint doesn't exist yet
            console.warn('Jobs endpoint might not be ready', error);
            return [];
        }
    },

    async getProfile() {
        try {
            // Assuming /auth/profile or /users/me exists
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
