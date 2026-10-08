import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Syringe, Pill, MapPin, Calendar, ChevronRight, ChevronDown, ChevronUp, Settings, Cloud, CloudRain, Thermometer, PawPrint, Plus } from 'lucide-react-native';
import { ILLUSTRATIONS } from '@/lib/illustrations';
import { router } from 'expo-router';
import { StorageService } from '@/utils/storage';
import { PET_PHOTOS, profileSummary } from '@/lib/pet';

const EVENT_IMAGE = ILLUSTRATIONS.eventVet.uri;
const CHARITY_EVENT_IMAGE = ILLUSTRATIONS.eventWalk.uri;

export default function HomeScreen() {
  const [petProfile, setPetProfile] = useState<any>(null);
  const [hasPetProfile, setHasPetProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMoments, setShowMoments] = useState(false);

  useEffect(() => {
    async function loadPetProfile() {
      try {
        setLoading(true);
        const hasProfile = await StorageService.getHasPetProfile();
        setHasPetProfile(hasProfile);
        
        if (hasProfile) {
          const profile = await StorageService.getPetProfile();
          setPetProfile(profile);
        }
      } catch (error) {
        console.error('Error loading pet profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPetProfile();
  }, []);

  const handleCreateProfile = () => {
    router.push('/(onboarding)/pet-profile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <PawPrint size={48} color="#ad8b73" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {petProfile && <Image source={PET_PHOTOS.avatar} style={styles.headerAvatar} />}
            <View>
            <Text style={styles.greeting}>Furlo!</Text>
            <Text style={styles.petName}>
              {petProfile ? `${petProfile.name}'s Pawrent` : 'Welcome Pawrent!'}
            </Text>
            </View>
          </View>
          <View style={styles.weatherContainer}>
            <View style={styles.weatherIconContainer}>
              <Cloud size={24} color="#4a90e2" />
              <Thermometer size={20} color="#e74c3c" style={styles.thermometer} />
            </View>
            <View>
              <Text style={styles.temperature}>25°C</Text>
              <Text style={styles.location}>
                {petProfile?.district || 'Wan Chai'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#ad8b73" />
          </TouchableOpacity>
        </View>
        <View style={styles.rainBar}>
          <CloudRain size={16} color="#4a90e2" />
          <Text style={styles.rainText}>
            <Text style={styles.rainStrong}>Rain likely 2–4pm (70%).</Text>
            {` Walk ${petProfile?.name || 'your dog'} before 2pm.`}
          </Text>
        </View>
      </View>

      {!hasPetProfile && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.createProfileCard} onPress={handleCreateProfile}>
            <View style={styles.createProfileContent}>
              <View style={styles.createProfileIconContainer}>
                <PawPrint size={32} color="#ad8b73" />
              </View>
              <View style={styles.createProfileTextContainer}>
                <Text style={styles.createProfileTitle}>Create Pet Profile</Text>
                <Text style={styles.createProfileDescription}>
                  Add your pet's details to get personalized reminders and recommendations
                </Text>
              </View>
              <View style={styles.createProfileArrow}>
                <Plus size={24} color="#ad8b73" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {petProfile && (
        <View style={styles.section}>
          <View style={styles.petCard}>
            <TouchableOpacity style={styles.petRow} onPress={() => setShowMoments((v) => !v)}>
              <Image source={PET_PHOTOS.avatar} style={styles.petRowAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.petRowName}>{petProfile.name}</Text>
                <Text style={styles.petRowMeta}>{profileSummary(petProfile)}</Text>
              </View>
              {showMoments ? <ChevronUp size={18} color="#ad8b73" /> : <ChevronDown size={18} color="#ad8b73" />}
            </TouchableOpacity>
            {showMoments && (
              <View style={styles.momentsRow}>
                {PET_PHOTOS.moments.map((m) => (
                  <View key={m.caption} style={styles.moment}>
                    <Image source={m.source} style={styles.momentImage} resizeMode="cover" />
                    <Text style={styles.momentCaption}>{m.caption}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
        <View style={styles.reminderCard}>
          <Syringe size={24} color="#ad8b73" />
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderTitle}>Vaccination Due</Text>
            <Text style={styles.reminderDate}>Next Thursday</Text>
          </View>
          <TouchableOpacity style={styles.scheduleButton}>
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reminderCard}>
          <Pill size={24} color="#ad8b73" />
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderTitle}>NexGard chewable</Text>
            <Text style={styles.reminderDate}>Monthly dose · in 2 weeks</Text>
          </View>
          <TouchableOpacity style={styles.scheduleButton}>
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <TouchableOpacity style={styles.eventCard}>
          <Image 
            source={{ uri: CHARITY_EVENT_IMAGE }} 
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>Charity Dog Walk</Text>
              <Text style={styles.eventDate}>Sun, Feb 18</Text>
            </View>
            <View style={styles.eventDetails}>
              <View style={styles.eventLocation}>
                <MapPin size={14} color="#666" />
                <Text style={styles.eventLocationText}>Sha Tin Racecourse</Text>
              </View>
              <TouchableOpacity style={styles.eventButton}>
                <Text style={styles.eventButtonText}>Details</Text>
                <ChevronRight size={16} color="#ad8b73" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.eventCard}>
          <Image 
            source={{ uri: EVENT_IMAGE }} 
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>Coffee Chat with Vet</Text>
              <Text style={styles.eventDate}>Wed, Feb 21</Text>
            </View>
            <View style={styles.eventDetails}>
              <View style={styles.eventLocation}>
                <MapPin size={14} color="#666" />
                <Text style={styles.eventLocationText}>The Barkyard - Wan Chai</Text>
              </View>
              <TouchableOpacity style={styles.eventButton}>
                <Text style={styles.eventButtonText}>Details</Text>
                <ChevronRight size={16} color="#ad8b73" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  headerAvatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12, borderWidth: 2, borderColor: '#ead9cc' },
  petCard: { borderRadius: 16, backgroundColor: '#f8f3ef', padding: 12 },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  petRowAvatar: { width: 48, height: 48, borderRadius: 24 },
  petRowName: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#333' },
  petRowMeta: { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#777' },
  petRowToggle: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#ad8b73' },
  momentsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  moment: { flex: 1 },
  momentImage: { width: '100%', height: 160, borderRadius: 12 },
  momentCaption: { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#666', marginTop: 6 },
  rainBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#eef5fb',
  },
  rainText: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 13, color: '#3d5a73' },
  rainStrong: { fontFamily: 'Nunito-Bold' },
  greeting: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    color: '#333',
  },
  petName: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  weatherContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIconContainer: {
    marginRight: 8,
    position: 'relative',
  },
  thermometer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  temperature: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#333',
  },
  location: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#666',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#333',
  },
  reminderDate: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
  },
  scheduleButton: {
    backgroundColor: '#ad8b73',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scheduleButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#fff',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#333',
  },
  eventDate: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocationText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  eventButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#ad8b73',
    marginRight: 4,
  },
  createProfileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ad8b73',
    marginBottom: 8,
  },
  createProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createProfileIconContainer: {
    backgroundColor: '#f8f5f3',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  createProfileTextContainer: {
    flex: 1,
  },
  createProfileTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  createProfileDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  createProfileArrow: {
    backgroundColor: '#f8f5f3',
    padding: 8,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});