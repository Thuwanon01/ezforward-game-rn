import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisContactScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#fffac9]">
      <ScrollView
        className="flex-1 px-8 pt-16 pb-8"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("@/assets/images/ram-small.png")}
          className="w-28 h-28 mb-6 self-center"
        />
        <Text className="text-3xl font-bold text-center text-[#183B4E] mb-2">
          Registration
        </Text>
        <Text className="text-center text-gray-600 mb-8">
          Online registration is not available in the app yet.
        </Text>

        <View className="bg-white/90 rounded-2xl p-6 border border-[#183B4E]/15 mb-8">
          <Text className="text-lg font-semibold text-[#183B4E] mb-3">
            Contact EZFORWARD Team
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            To request an account or ask about access, please contact the
            EZFORWARD team. They will help you get set up.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/login")}
          className="py-4 rounded-xl bg-[#183B4E] items-center"
        >
          <Text className="text-white text-lg font-bold">Back to login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
