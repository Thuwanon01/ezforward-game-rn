import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Markdown from 'react-native-markdown-display';

const copy = `# h1 Heading 8-)

**This is some bold text!**

This is normal text
`

export default function testComponent() {
  return (
    <View>
      <Text>test      Component</Text>
      <Markdown style={styles}>
            {copy}
          </Markdown>
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    
    color: 'blue'
  }
})