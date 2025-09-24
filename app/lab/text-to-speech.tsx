import { StyleSheet, Text, View } from "react-native";

export default function TextToSpeechPage() {
    return (
         <View style={styles.container}>
          <View style={styles.parentBox}>
            <Text>นี่คือกล่องแม่ (Parent)</Text>
            <View style={styles.absoluteChild}>
              <Text style={styles.childText}>ลอยอยู่!</Text>
            </View>
          </View>

        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  parentBox: {
    width: 300,
    height: 200,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  absoluteChild: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fffbcc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    elevation: 2,
  },
  childText: {
    color: "#333",
    fontWeight: "600",
  },
});
