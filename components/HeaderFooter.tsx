import React, { useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { HeaderData, SetHeaderData } from "../types/types";

// Define props interface
interface HeaderFooterProps {
  headerData: HeaderData;
  setHeaderData: SetHeaderData;
}

const HeaderFooter: React.FC<HeaderFooterProps> = ({
  headerData,
  setHeaderData,
}) => {
  // Auto-generate the date when component mounts
  useEffect(() => {
    const currentDate = new Date().toLocaleDateString();
    setHeaderData("date", currentDate);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Company</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter company name"
        value={headerData.company}
        onChangeText={(text) => setHeaderData("company", text)}
      />

      <Text style={styles.label}>Created By</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter creator's name"
        value={headerData.createdBy}
        onChangeText={(text) => setHeaderData("createdBy", text)}
      />

      <Text style={styles.label}>Report For</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter report recipient"
        value={headerData.reportFor}
        onChangeText={(text) => setHeaderData("reportFor", text)}
      />

      <Text style={styles.label}>Type of Report</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter report type"
        value={headerData.typeOfReport}
        onChangeText={(text) => setHeaderData("typeOfReport", text)}
      />
      {/* Date is auto-generated, no input field needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5, // Reduced from default padding
    marginBottom: 10, // Reduced from default margin
  },
  label: {
    fontSize: 14, // Reduced from default 16
    marginBottom: 3, // Reduced from default 5
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8, // Reduced from default 10
    marginBottom: 10, // Reduced from default 15
    backgroundColor: "#f8f8f8",
  },
});

export default HeaderFooter;
