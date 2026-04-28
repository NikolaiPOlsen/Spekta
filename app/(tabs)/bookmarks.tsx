import { SearchBar } from "@/features/search/components/search-bar"
import { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Text, View, StyleSheet } from 'react-native';

  //Bruk flatlist?

export default function Bookmarks() {
  const [search, setSearch] = useState('');
  return (
    <SafeAreaView style={ Styles.container }>
      <SearchBar value={search} onChange={setSearch} />
    </SafeAreaView>
  )
}

const Styles = StyleSheet.create ({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
})
