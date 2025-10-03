import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{flex: 1}}>
      <View className="bg-[#FCC61D] mx-3 my-3 px-5 py-5 rounded-md">
        <Text className="text-[#183B4E] text-2xl font-bold">
           Tomorrow, Criseyde ______care of by her grandparents because her parents won't be available.
        </Text>
      </View>
       
        <Link href = "/lab/gameMunMun">Test Components</Link>,
        <Link href = "/lab/loginScreen">Test loginScreen</Link>

 



    </View>
  );
}
