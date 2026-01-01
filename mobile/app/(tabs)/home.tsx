import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileCheck, Activity, Award } from 'lucide-react-native';
import { useEffect, useState, useCallback } from 'react';
import { DataService } from '../../services/data.service';
import { router } from 'expo-router';

export default function HomeScreen() {
    const [profile, setProfile] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            // Parallel fetching
            const [profileData, appsData] = await Promise.all([
                DataService.getProfile().catch(() => ({ firstName: 'Driver', lastName: '' })), // Fallback if auth profile fails
                DataService.getApplications().catch(() => []),
            ]);
            setProfile(profileData);
            setApplications(appsData);
        } catch (error) {
            console.error('Failed to fetch home data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const activeApp = applications.find(app => app.status !== 'approved' && app.status !== 'rejected');

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-6">
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-2xl font-bold text-gray-900">Welcome Back</Text>
                    <Text className="text-gray-500">{profile?.firstName} {profile?.lastName}</Text>
                </View>
                <TouchableOpacity className="bg-blue-100 p-2 rounded-full">
                    <Activity size={24} color="#2563EB" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Status Card */}
                {activeApp ? (
                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="font-semibold text-lg text-gray-800">Current Status</Text>
                            <View className="bg-amber-100 px-3 py-1 rounded-full">
                                <Text className="text-amber-700 font-medium text-xs">{activeApp.status?.toUpperCase() || 'PENDING'}</Text>
                            </View>
                        </View>
                        <Text className="text-gray-500 mb-4">You have an active application.</Text>
                        <View className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                            <View className="bg-amber-500 h-full w-2/5" />
                        </View>
                        <Text className="text-xs text-gray-400 text-right">In Progress</Text>
                    </View>
                ) : (
                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <Text className="font-semibold text-lg text-gray-800 mb-2">No Active Applications</Text>
                        <Text className="text-gray-500">Start a new application to get certified.</Text>
                    </View>
                )}

                {/* Quick Actions */}
                <Text className="font-semibold text-lg text-gray-800 mb-4">Quick Actions</Text>
                <View className="flex-row gap-4 mb-6">
                    <TouchableOpacity
                        className="flex-1 bg-white p-4 rounded-xl border border-gray-100 items-center"
                        onPress={() => router.push('/(tabs)/applications')}
                    >
                        <View className="bg-blue-50 p-3 rounded-full mb-2">
                            <FileCheck size={24} color="#2563EB" />
                        </View>
                        <Text className="font-medium text-gray-800">New App</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl border border-gray-100 items-center">
                        <View className="bg-green-50 p-3 rounded-full mb-2">
                            <Award size={24} color="#16A34A" />
                        </View>
                        <Text className="font-medium text-gray-800">My Certs</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
