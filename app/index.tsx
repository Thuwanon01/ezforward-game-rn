import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{flex: 1}}>
      <View className="bg-[#FCC61D] mx-3 my-3 px-5 py-5 rounded-md">
        <Text className="text-[#183B4E] text-2xl font-bold">
           Tomorrow, Criseyde ______care of by her grandparents because her parents won't be available.
        </Text>
      </View>

      <Pressable>
        <View className="bg-white border-[#27548A] border-2 m-3 h-20 flex justify-center items-center rounded-2xl">
          <Text className="text-[#183B4E] text-xl font-bold">Choice 1</Text>
        </View>
        <View className="bg-white border-[#27548A] border-2 m-3 h-20 flex justify-center items-center rounded-2xl">
          <Text className="text-[#183B4E] text-xl font-bold">Choice 1</Text>
        </View>
        <View className="bg-white border-[#27548A] border-2 m-3 h-20 flex justify-center items-center rounded-2xl">
          <Text className="text-[#183B4E] text-xl font-bold">Choice 1</Text>
        </View>
        <View className="bg-white border-[#27548A] border-2 m-3 h-20 flex justify-center items-center rounded-2xl">
          <Text className="text-[#183B4E] text-xl font-bold">Choice 1</Text>
        </View>
      </Pressable>
      <Link href='/lab/testComponent'>testComponent</Link>
    </View>
  );
}
