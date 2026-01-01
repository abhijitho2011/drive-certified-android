import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JobsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
            <Text className="text-xl font-semibold text-gray-800">Job Postings</Text>
            <Text className="text-gray-500 mt-2">Explore opportunities near you</Text>
        </SafeAreaView>
    );
}
