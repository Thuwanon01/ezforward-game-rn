import { Pressable, Text } from "react-native";

interface Props {
    text: string;
    onPress: () => void;
}

export default function TextButton({ text, onPress }: Props) {
    return (
        <Pressable className="border border-black p-3 hover:bg-slate-200 active:bg-stone-300" onPress={onPress}>
            <Text>{text}</Text>
        </Pressable>
    );
}
