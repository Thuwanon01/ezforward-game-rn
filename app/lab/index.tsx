import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
    const pages: any[] = [
        "/lab/text-to-speech",
        "/lab/modal",
<<<<<<< HEAD
        '/lab/testComponent',
=======
        "/lab/testcode"
>>>>>>> 1dbbb6d26dbc92822f9e9d0f14a3b9e67928d8c6
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
