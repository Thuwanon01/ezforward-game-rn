import * as React from 'react';
import { StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

const topics = [
  {
    id: 'grammar',
    title: 'Grammar Topics',
    children: [
      {
        id: 'aux',
        title: 'Auxiliary Verbs',
        items: ['Can / Could', 'May / Might', 'Should / Ought to'],
      },
      {
        id: 'passive',
        title: 'Passive Voice',
        items: ['Be + V3', 'Get + V3'],
      },
      {
        id: 'conditional',
        title: 'Conditionals',
        items: ['If + Present → will + Base Verb'],
      },
    ],
  },
  {
    id: 'vocab',
    title: 'Vocabulary',
    children: [
      {
        id: 'syn',
        title: 'Synonyms',
        items: ['Happy - Joyful', 'Big - Large'],
      },
      {
        id: 'ant',
        title: 'Antonyms',
        items: ['Hot - Cold', 'Rich - Poor'],
      },
    ],
  },
];

export default function MyComponent() {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));


  return (
    <List.Section>
      {topics.map(topic => (
        <List.Accordion
          key={topic.id}
          title={topic.title}
          expanded={expanded[topic.id]}
          onPress={() => toggle(topic.id)}
        >
          {topic.children.map(sub => (
            <List.Accordion
              key={sub.id}
              title={sub.title}
              expanded={expanded[sub.id]}
              onPress={() => toggle(sub.id)}
              style={{ marginLeft: 12 }}
            >
              {sub.items.map((item, i) => (
                <List.Item key={i} title={item} />
              ))}
            </List.Accordion>
          ))}
        </List.Accordion>
      ))}
    </List.Section>
  )
}


const styles = StyleSheet.create({
  outer: {


    margin: 4,
    borderRadius: 8
  },
  middle: {


    margin: 4,
    borderRadius: 8
  },
  inner: {

    borderWidth: 1,
    marginHorizontal: 32,
    marginVertical: 4,
    borderRadius: 8
  },
  middleGroup: {



    marginHorizontal: 20,
    marginVertical: 4,


  }
});