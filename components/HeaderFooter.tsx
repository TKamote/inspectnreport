import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  View,
  TextInput, // Ensure TextInput is imported
} from "react-native";
import { HeaderData, SetHeaderData } from "../types/types"; // Import the types

interface HeaderFooterProps {
  headerData: HeaderData;
  setHeaderData: SetHeaderData;
}

const HeaderFooter: React.FC<HeaderFooterProps> = ({
  headerData,
  setHeaderData,
}) => {
  return (
    <View style={stylesHeaderFooter.container}>
      <Text style={stylesHeaderFooter.label}>Company</Text>
      <TextInput
        style={stylesHeaderFooter.input}
        placeholder="Enter company name"
        value={headerData.company}
        onChangeText={(text) => setHeaderData("company", text)}
      />
      <Text style={stylesHeaderFooter.label}>Created By</Text>
      <TextInput
        style={stylesHeaderFooter.input}
        placeholder="Enter creator's name"
        value={headerData.createdBy}
        onChangeText={(text) => setHeaderData("createdBy", text)}
      />
      <Text style={stylesHeaderFooter.label}>Contact</Text>
      <TextInput
        style={stylesHeaderFooter.input}
        placeholder="Enter contact details"
        value={headerData.contact}
        onChangeText={(text) => setHeaderData("contact", text)}
      />
      <Text style={stylesHeaderFooter.label}>Report For</Text>
      <TextInput
        style={stylesHeaderFooter.input}
        placeholder="Enter report recipient"
        value={headerData.reportFor}
        onChangeText={(text) => setHeaderData("reportFor", text)}
      />
      <Text style={stylesHeaderFooter.label}>Type of Report</Text>
      <TextInput
        style={stylesHeaderFooter.input}
        placeholder="Enter report type"
        value={headerData.typeOfReport}
        onChangeText={(text) => setHeaderData("typeOfReport", text)}
      />
      <Text style={stylesHeaderFooter.label}>Date</Text>
      <TextInput
        style={stylesHeaderFooter.input}
        placeholder="Enter date"
        value={headerData.date}
        onChangeText={(text) => setHeaderData("date", text)}
      />
    </View>
  );
};

export default function InputScreen({ route }: { route: any }) {
  const { template } = route.params;

  const [headerData, setHeaderData] = useState<HeaderData>({
    company: "",
    createdBy: "",
    contact: "",
    reportFor: "",
    typeOfReport: "",
    date: "",
  });

  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility

  const updateHeaderData: SetHeaderData = (field, value) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    Alert.alert(
      "Add Header and Footer?",
      "Do you want to fill in the header and footer before generating the PDF?",
      [
        {
          text: "Yes",
          onPress: () => setModalVisible(true), // Show the modal
        },
        {
          text: "No",
          onPress: () => {
            // Proceed to generate the PDF with default or empty header/footer
            alert("Generate PDF with default header/footer");
          },
        },
      ]
    );
  };

  const closeModalAndGeneratePDF = () => {
    setModalVisible(false);
    alert(`Generating PDF with header: ${JSON.stringify(headerData)}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Template: {template}</Text>

      {/* Generate PDF Button */}
      <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF}>
        <Text style={styles.pdfButtonText}>Generate PDF</Text>
      </TouchableOpacity>

      {/* Modal for Header/Footer */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Fill in Header and Footer</Text>
            <HeaderFooter
              headerData={headerData}
              setHeaderData={updateHeaderData}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeModalAndGeneratePDF}
            >
              <Text style={styles.modalButtonText}>Generate PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pdfButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  pdfButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const stylesHeaderFooter = StyleSheet.create({
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
