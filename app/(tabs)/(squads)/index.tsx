import React, { useEffect, useState } from "react";
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useSquadStore } from "@/stores/squadStore";
import { Squad } from "@/types/squads";
import { router } from "expo-router";

export default function SquadsHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSquads, setLocalSquads] = useState<Squad[]>([]);

  const { squads } = useSquadStore();

  const filteredSquads = localSquads.filter((squad) =>
    squad.squad_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setLocalSquads(squads);
  }, [squads]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search squads..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Squad List */}
      <FlatList
        data={filteredSquads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.squadItem}
            onPress={() => router.push(`/(squads)/${item.id}`)}
          >
            <Image
              source={
                item?.squad_image_url
                  ? { uri: item.squad_image_url }
                  : require("@/assets/squads/home.png")
              }
              style={styles.squadIcon}
            />
            <Text style={styles.squadName}>{item.squad_name}</Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eaeaea",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  streak: {
    fontSize: 16,
    marginHorizontal: 4,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  squadItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  squadIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  squadName: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eaeaea",
  },
  navItem: {
    alignItems: "center",
  },
  navItemActive: {
    borderTopWidth: 2,
    borderColor: "#5D5FEF",
  },
  navLabel: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  navLabelActive: {
    color: "#5D5FEF",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
});
