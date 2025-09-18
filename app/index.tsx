import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button className="bg-red-500 hover:bg-orange-400" variant="solid" size="md" onPress={() => {console.log("hello")}}>
        <ButtonSpinner color="white" />
        <ButtonText>Get Started</ButtonText>
      </Button>
    </View>
  );
}
