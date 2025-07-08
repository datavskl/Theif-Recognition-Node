import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Header
      appTitle: "AI Thief Recognition System",
      language: "Language",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      notifications: "Notifications",
      profile: "Profile",
      logout: "Logout",
      
      // Navigation
      dashboard: "Dashboard",
      faceGallery: "Face Gallery",
      recognitionLog: "Recognition Log",
      settings: "Settings",
      
      // Dashboard
      liveCameraFeed: "Live Camera Feed",
      cameraOnline: "Camera Online",
      fullscreen: "Fullscreen",
      exitFullscreen: "Exit Fullscreen",
      systemOverview: "System Overview",
      alertsToday: "Alerts Today",
      camerasOnline: "Cameras Online",
      facesInGallery: "Faces in Gallery",
      lastAlert: "Last Alert",
      recentAlerts: "Recent Alerts",
      viewAll: "View All",
      quickActions: "Quick Actions",
      
      // Stats
      fromYesterday: "from yesterday",
      allSystemsOperational: "All systems operational",
      addNewProfile: "Add new profile",
      noAlertsYet: "No alerts yet",
      
      // Alerts
      thiefDetected: "THIEF DETECTED!",
      name: "Name",
      tag: "Tag",
      camera: "Camera",
      time: "Time",
      acknowledge: "Acknowledge",
      dismiss: "Dismiss",
      
      // Quick Actions
      addNewFace: "Add New Face",
      addPersonToDatabase: "Add a person to the watch database",
      testCamera: "Test Camera",
      checkCameraConnection: "Check camera connection and quality",
      exportLogs: "Export Logs",
      downloadRecognitionData: "Download recognition data as CSV",
      
      // Table Headers
      snapshot: "Snapshot",
      status: "Status",
      pending: "Pending",
      acknowledged: "Acknowledged",
      resolved: "Resolved",
      
      // Face Gallery
      addFace: "Add Face",
      editFace: "Edit Face",
      deleteFace: "Delete Face",
      searchFaces: "Search faces...",
      notes: "Notes",
      thief: "THIEF",
      watchlist: "WATCHLIST",
      
      // Authentication
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      username: "Username",
      role: "Role",
      admin: "Admin",
      staff: "Staff",
      
      // Common
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      
      // Messages
      loginSuccess: "Login successful",
      loginError: "Login failed",
      registrationSuccess: "Registration successful",
      faceAddedSuccess: "Face added successfully",
      faceDeletedSuccess: "Face deleted successfully",
      settingsSaved: "Settings saved successfully",
    }
  },
  hi: {
    translation: {
      // Header
      appTitle: "एआई चोर पहचान प्रणाली",
      language: "भाषा",
      darkMode: "डार्क मोड",
      lightMode: "लाइट मोड",
      notifications: "सूचनाएं",
      profile: "प्रोफ़ाइल",
      logout: "लॉगआउट",
      
      // Navigation
      dashboard: "डैशबोर्ड",
      faceGallery: "चेहरा गैलरी",
      recognitionLog: "पहचान लॉग",
      settings: "सेटिंग्स",
      
      // Dashboard
      liveCameraFeed: "लाइव कैमरा फीड",
      cameraOnline: "कैमरा ऑनलाइन",
      fullscreen: "फुलस्क्रीन",
      exitFullscreen: "फुलस्क्रीन से बाहर निकलें",
      systemOverview: "सिस्टम अवलोकन",
      alertsToday: "आज की चेतावनी",
      camerasOnline: "कैमरे ऑनलाइन",
      facesInGallery: "गैलरी में चेहरे",
      lastAlert: "अंतिम चेतावनी",
      recentAlerts: "हाल की चेतावनी",
      viewAll: "सभी देखें",
      quickActions: "त्वरित कार्य",
      
      // Stats
      fromYesterday: "कल से",
      allSystemsOperational: "सभी सिस्टम कार्यशील",
      addNewProfile: "नया प्रोफ़ाइल जोड़ें",
      noAlertsYet: "अभी तक कोई अलर्ट नहीं",
      
      // Alerts
      thiefDetected: "चोर का पता चला!",
      name: "नाम",
      tag: "टैग",
      camera: "कैमरा",
      time: "समय",
      acknowledge: "स्वीकार करें",
      dismiss: "खारिज करें",
      
      // Quick Actions
      addNewFace: "नया चेहरा जोड़ें",
      addPersonToDatabase: "डेटाबेस में व्यक्ति जोड़ें",
      testCamera: "कैमरा टेस्ट करें",
      checkCameraConnection: "कैमरा कनेक्शन जांचें",
      exportLogs: "लॉग एक्सपोर्ट करें",
      downloadRecognitionData: "पहचान डेटा डाउनलोड करें",
      
      // Table Headers
      snapshot: "स्नैपशॉट",
      status: "स्थिति",
      pending: "लंबित",
      acknowledged: "स्वीकार किया गया",
      resolved: "हल किया गया",
      
      // Face Gallery
      addFace: "चेहरा जोड़ें",
      editFace: "चेहरा संपादित करें",
      deleteFace: "चेहरा हटाएं",
      searchFaces: "चेहरे खोजें...",
      notes: "नोट्स",
      thief: "चोर",
      watchlist: "वॉचलिस्ट",
      
      // Authentication
      login: "लॉगिन",
      register: "रजिस्टर",
      email: "ईमेल",
      password: "पासवर्ड",
      username: "उपयोगकर्ता नाम",
      role: "भूमिका",
      admin: "एडमिन",
      staff: "स्टाफ",
      
      // Common
      save: "सेव करें",
      cancel: "रद्द करें",
      delete: "हटाएं",
      edit: "संपादित करें",
      add: "जोड़ें",
      search: "खोजें",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफलता",
      warning: "चेतावनी",
      
      // Messages
      loginSuccess: "लॉगिन सफल",
      loginError: "लॉगिन असफल",
      registrationSuccess: "पंजीकरण सफल",
      faceAddedSuccess: "चेहरा सफलतापूर्वक जोड़ा गया",
      faceDeletedSuccess: "चेहरा सफलतापूर्वक हटाया गया",
      settingsSaved: "सेटिंग्स सफलतापूर्वक सेव की गईं",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
