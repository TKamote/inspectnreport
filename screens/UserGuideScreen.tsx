import React, { useState, useLayoutEffect } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/theme";
import { FONTS } from "../theme/theme";

export default function UserGuideScreen() {
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setPrivacyModalVisible(true)}
          style={{
            marginRight: 15,
          }}
        >
          <Ionicons
            name="information-circle"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Text style={styles.text}>
          Welcome to PDF Report Maker! This guide will help you create
          professional reports in just a few simple steps.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Creating a Report</Text>
        <Text style={styles.text}>
          Creating professional PDF reports is quick and intuitive:
        </Text>

        <Text style={styles.text}>
          1. Select a template that matches your documentation needs from the
          home screen
        </Text>

        <Text style={styles.text}>
          2. Capture photos directly or import from your gallery by tapping "Add
          Photo"
        </Text>

        <Text style={styles.text}>
          3. Add descriptive information in the customizable text fields - use
          them for locations, observations, actions, or any relevant details
        </Text>

        <Text style={styles.text}>
          4. Create additional sections by tapping "Add Card" to include all
          necessary documentation
        </Text>

        <Text style={styles.text}>
          5. Preview your work at any time, then generate a professional PDF
          with a single tap on the "PDF" button
        </Text>

        <Text style={styles.text}>
          6. Share your completed report instantly via email, messaging apps, or
          cloud storage
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Template Options</Text>
        <Text style={styles.text}>
          Our templates offer flexible options for creating professional PDF
          reports for any field inspection, site visit, or audit:
        </Text>

        <Text style={styles.text}>
          • A4 Portrait 2x2: ✅ 4 sections per page, each with a photo and two
          customizable text fields. Perfect for focused site visits where
          quality matters over quantity.
        </Text>

        <Text style={styles.text}>
          • A4 Portrait 2x3: ✅ 6 sections per page with dual input fields per
          photo. Ideal for comprehensive daily reports balancing detail and
          coverage.
        </Text>

        <Text style={styles.text}>
          • A4 Landscape 3x2: ✅ 6 sections per page in landscape format.
          Excellent for horizontal subjects and field reports requiring wider
          photo display.
        </Text>

        <Text style={styles.text}>
          • A4 Landscape 4x2: ✅ 8 sections per page with dual text fields per
          photo. Great for thorough inspections needing more visual
          documentation.
        </Text>

        <Text style={styles.text}>
          • A4 Landscape 5x3: ✅ 15 sections per page for detailed audit logs.
          Maximizes the number of items you can document in a single PDF report.
        </Text>

        <Text style={styles.text}>
          • A4 Portrait 4x6: ✅ 24 sections per page with one text field per
          photo. Optimized for situations requiring extensive photo
          documentation with brief identifiers.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flexible Input Fields</Text>
        <Text style={styles.text}>
          The text fields in each template can be used however you need - not
          just for locations and observations. Use them for:
        </Text>

        <Text style={styles.text}>
          • Equipment details • Action items • Compliance status • Client
          requirements • Materials information • Technical specifications • Any
          notes relevant to your work
        </Text>

        <Text style={styles.text}>
          This flexibility makes the app valuable for construction inspections,
          property assessments, maintenance checks, safety audits, and many
          other professional documentation needs.
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={privacyModalVisible}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPrivacyModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.MIDNIGHT} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.privacyDate}>EFFECTIVE DATE: MAY 10, 2025</Text>
              
              <Text style={styles.privacySectionTitle}>Introduction</Text>
              <Text style={styles.privacyText}>
                Welcome to PDF Report Maker. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect any information that you provide when using our app.
              </Text>
              
              <Text style={styles.privacySectionTitle}>Information We Collect</Text>
              <Text style={styles.privacyText}>
                PDF Report Maker only accesses the following data to provide its core functionality:
              </Text>
              <Text style={styles.privacyListItem}>
                1. Camera and Photo Library Access: We request access to your device's camera and photo library solely to allow you to take photos or select existing photos for your inspection reports. These photos remain on your device and are only used within the app for generating PDF reports.
              </Text>
              <Text style={styles.privacyListItem}>
                2. User-Provided Report Data: Any information you enter into the app (such as location details, observations, company information) is used only for generating PDF reports and is not transmitted to our servers.
              </Text>
              
              <Text style={styles.privacySectionTitle}>How We Use Your Information</Text>
              <Text style={styles.privacyText}>
                All data processing occurs locally on your device. We use your information only to:
              </Text>
              <Text style={styles.privacyListItem}>• Generate PDF reports based on your inputs</Text>
              <Text style={styles.privacyListItem}>• Allow you to share these reports using your device's native sharing capabilities</Text>
              
              <Text style={styles.privacySectionTitle}>Data Storage and Security</Text>
              <Text style={styles.privacyListItem}>• Local Storage Only: All data (including photos and report content) is stored locally on your device.</Text>
              <Text style={styles.privacyListItem}>• No External Servers: We do not collect, transmit, or store any of your information on external servers.</Text>
              <Text style={styles.privacyListItem}>• No Analytics: We do not use any analytics tools to track your app usage.</Text>
              
              <Text style={styles.privacySectionTitle}>Sharing Your Information</Text>
              <Text style={styles.privacyText}>
                We do not share your personal information with third parties. When you choose to share a report, you are using your device's native sharing functionality, and we have no control over or access to that process.
              </Text>
              
              <Text style={styles.privacySectionTitle}>Children's Privacy</Text>
              <Text style={styles.privacyText}>
                Our app is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </Text>
              
              <Text style={styles.privacySectionTitle}>Changes to This Privacy Policy</Text>
              <Text style={styles.privacyText}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
              </Text>
              
              <Text style={styles.privacySectionTitle}>Contact Us</Text>
              <Text style={styles.privacyText}>
                If you have any questions about this Privacy Policy, please contact us at:
              </Text>
              <Text style={styles.privacyListItem}>• Email: admin@PDFReportMaker.site</Text>
              
              <Text style={styles.privacySectionTitle}>Your Rights</Text>
              <Text style={styles.privacyText}>
                Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. Since all data is stored locally on your device, you can exercise these rights directly by managing your data within the app or through your device's settings.
              </Text>
              
              <Text style={styles.privacySectionTitle}>California Privacy Rights</Text>
              <Text style={styles.privacyText}>
                California residents have the right to request information regarding the disclosure of personal information to third parties for direct marketing purposes. As stated earlier, we do not share your personal information with third parties for marketing purposes.
              </Text>
              
              <Text style={styles.privacySectionTitle}>International Data Transfers</Text>
              <Text style={styles.privacyText}>
                Since all data remains on your device, no international data transfers occur.
              </Text>
              
              <Text style={[styles.privacyText, {marginTop: 15, marginBottom: 20}]}>
                By using our app, you consent to our Privacy Policy.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.MIDNIGHT,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: COLORS.SPACE,
    marginBottom: 8,
    lineHeight: 22,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.MIDNIGHT,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    maxHeight: "90%",
  },
  privacyDate: {
    fontSize: 14,
    color: COLORS.SPACE,
    textAlign: "center",
    marginBottom: 20,
  },
  privacySectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.MIDNIGHT,
    marginTop: 15,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.SPACE,
    marginBottom: 10,
  },
  privacyListItem: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.SPACE,
    marginBottom: 5,
    paddingLeft: 10,
  },
});
