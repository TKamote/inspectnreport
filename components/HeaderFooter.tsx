import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

// Import types from types.ts
export interface HeaderData {
  company: string;
  createdBy: string;
  contact: string;
  reportFor: string;
  typeOfReport: string;
  date: string;
}

export type SetHeaderData = (field: keyof HeaderData, value: string) => void;

// Define props interface
interface HeaderFooterProps {
  headerData: HeaderData;
  setHeaderData: SetHeaderData;
}

// Define the HeaderFooter component
const HeaderFooter: React.FC<HeaderFooterProps> = ({
  headerData,
  setHeaderData,
}) => {
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
      <Text style={styles.label}>Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter contact details"
        value={headerData.contact}
        onChangeText={(text) => setHeaderData("contact", text)}
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
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter date"
        value={headerData.date}
        onChangeText={(text) => setHeaderData("date", text)}
      />
    </View>
  );
};

// Styles for HeaderFooter
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});

// Export the HeaderFooter component
export default HeaderFooter;
