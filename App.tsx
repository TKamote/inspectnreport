import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  Pressable,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InputScreen from "./screens/InputScreen";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import { COLORS, FONTS } from "./theme/theme";


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="Input" 
          component={InputScreen} 
          options={{ title: "PDF Report Maker" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  // Load the PDF asset when component mounts
  useEffect(() => {
    async function preparePdf() {
      try {
        // Version for cache busting
        const pdfVersion = "v1";
        
        // Create a destination path with the new name
        const destPath = FileSystem.documentDirectory + `SamplePDF_${pdfVersion}.pdf`;
        
        // Check if old file exists and delete it
        try {
          const oldPath = FileSystem.documentDirectory + "SamplePDFdownload.pdf";
          const oldFileInfo = await FileSystem.getInfoAsync(oldPath);
          if (oldFileInfo.exists) {
            await FileSystem.deleteAsync(oldPath);
          }
        } catch (error) {
        }

        // Check if the new file already exists
        const fileInfo = await FileSystem.getInfoAsync(destPath);

        // Always recreate the file to ensure we have the latest version
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(destPath);
        }

        // Load the asset with the new filename
        const asset = Asset.fromModule(
          require("./assets/SamplePDF.pdf")
        );
        await asset.downloadAsync();

        // Copy to a location that can be shared
        if (asset.localUri) {
          await FileSystem.copyAsync({
            from: asset.localUri,
            to: destPath,
          });
        }

        // Set the final URI
        setPdfUri(destPath);
      } catch (error) {
        alert("Sorry, there was a problem loading the sample PDF. Please try again later.");
      }
    }

    preparePdf();
  }, []);

  const templates = [
    { id: "1", name: "A4 Portrait (2x2)", value: "A4Portrait2x2" },
    { id: "2", name: "A4 Portrait (2x3)", value: "A4Portrait2x3" },
    { id: "3", name: "A4 Landscape (3x2)", value: "A4Landscape3x2" },
    { id: "4", name: "A4 Landscape (4x2)", value: "A4Landscape4x2" },
    { id: "5", name: "A4 Landscape (5x3)", value: "A4Landscape5x3" },
    { id: "6", name: "A4 Portrait (4x6)", value: "A4Portrait4x6" },
  ];

  const openSamplePDF = async () => {
    if (pdfUri) {
      try {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          // This will present a native share sheet, which includes "Open with..." option
          await Sharing.shareAsync(pdfUri, {
            mimeType: "application/pdf",
            dialogTitle: "View Sample PDF",
            UTI: "com.adobe.pdf", // For iOS
          });
        } else {
          alert("Sharing is not available on this device");
        }
      } catch (error) {
        alert("Sorry, there was a problem opening the sample PDF. Please try again later.");
      }
    } else {
      alert("PDF is still loading or failed to load. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headTitle}>PDF Report Maker</Text>
      <Text style={styles.title}>Select a Template</Text>

      {/* Template list */}
      <View style={styles.templateContainer}>
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.templateButton}
              onPress={() =>
                navigation.navigate("Input", { template: item.value })
              }
            >
              <Text style={styles.templateText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={() => (
            /* Sample PDF Button below the last template */
            <TouchableOpacity
              style={[styles.sampleButton, !pdfUri && styles.disabledButton]}
              onPress={openSamplePDF}
              disabled={!pdfUri}
            >
              <Text style={styles.sampleButtonText}>
                {pdfUri ? "View Sample PDFs" : "Loading Sample PDFs..."}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.footer}>
        <Pressable onPress={() => Linking.openURL('https://pdfreportmaker.site/privacy-policy')}>
          <Text style={styles.privacyText}>Privacy Policy</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://pdfreportmaker.site/guide')}>
          <Text style={styles.linkText}>User guide</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 35,
    fontFamily: FONTS.FAMILY,
  },
  headTitle: {
    fontSize: 24,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: 20,
    color: COLORS.MIDNIGHT,
  },
  title: {
    fontSize: 18,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: 20,
  },
  templateContainer: {
    width: "100%",
  },
  templateButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 12,
    alignItems: "center",
  },
  templateText: {
    fontSize: 16,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
    color: COLORS.MIDNIGHT,
  },
  sampleButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.RED, 
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  sampleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginTop: "auto",        // Adjusts distance from screen bottom
  },
  privacyText: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'underline',
  },
  linkText: {
    fontSize: 12,
    color: COLORS.MIDNIGHT,
    textDecorationLine: 'none',
  },
});
