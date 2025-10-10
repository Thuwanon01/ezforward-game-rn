import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
    const pages: any[] = [
        "/lab/text-to-speech",
        "/lab/modal",
        '/lab/testComponent',
        "/lab/testcode",
        "/lab/loginScreen",
        "/lab/gameMunMun",
        "/lab/register"
    ]

    return (
        <View style={{ flex: 1 }}>
            {pages.map((page, index) => (
                <Link key={index} href={page}>
                    <Text>{page}</Text>
                </Link>
            ))}
        </View>
    );
}
