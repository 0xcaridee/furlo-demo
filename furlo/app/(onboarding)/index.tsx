import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Globe as Globe2, ChevronRight } from 'lucide-react-native';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
];

export default function LanguageSelection() {
  const handleLanguageSelect = (code: string) => {
    // TODO: Set language preference in storage
    router.replace('/pet-profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Globe2 size={48} color="#ad8b73" style={styles.icon} />
        <Text style={styles.title}>Welcome to Furlo</Text>
        <Text style={styles.tagline}>Connecting pawrents, caring for pets, powered by community</Text>
        <Text style={styles.subtitle}>Choose your language</Text>
      </View>

      <View style={styles.languageContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.languageButton}
            onPress={() => handleLanguageSelect(lang.code)}
          >
            <View style={styles.languageContent}>
              <Text style={styles.languageText}>{lang.name}</Text>
            </View>
            <ChevronRight size={24} color="#ad8b73" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 32,
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  languageContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#333',
  },
});