import TextButton from "@/components/lab/TextButton";
import { Text, View } from "react-native";

export default function TextToSpeechPage() {
    return (
        <View style={{ flex: 1 }}>
            <Text>Test: Text to Speech</Text>
            <TextButton text="Read" onPress={() => {alert("hello")}} />
        </View>
    );
}
