import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ProfileScreen() {
    const handleLogout = () => {
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

            <TouchableOpacity
                className="bg-red-50 p-4 rounded-xl items-center border border-red-100"
                onPress={handleLogout}
            >
                <Text className="text-red-600 font-semibold">Log Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
