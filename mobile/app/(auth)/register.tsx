import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../services/auth.service';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleRegister = async () => {
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await AuthService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });
            Alert.alert('Success', 'Account created successfully', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerClassName="p-6">
                <View className="mb-8 mt-4">
                    <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
                    <Text className="text-gray-500 mt-2">Join Motract as a Driver</Text>
                </View>

                <View className="space-y-4">
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Text className="text-gray-700 mb-1 ml-1">First Name</Text>
                            <TextInput
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChangeText={(text) => handleChange('firstName', text)}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-700 mb-1 ml-1">Last Name</Text>
                            <TextInput
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChangeText={(text) => handleChange('lastName', text)}
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1">Email</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChangeText={(text) => handleChange('email', text)}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1">Password</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                            placeholder="Create a password"
                            value={formData.password}
                            onChangeText={(text) => handleChange('password', text)}
                            secureTextEntry
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1">Confirm Password</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChangeText={(text) => handleChange('confirmPassword', text)}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        className="w-full bg-blue-600 rounded-xl p-4 items-center mt-4 active:bg-blue-700 disabled:bg-blue-300"
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-semibold text-lg">Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-500">Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-blue-600 font-semibold">Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
