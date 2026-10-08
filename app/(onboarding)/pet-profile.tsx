import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { PawPrint, Calendar, ChevronRight, ChevronDown, X, Camera, MapPin } from 'lucide-react-native';
import { format } from 'date-fns';
import { StorageService } from '@/utils/storage';

interface PetProfileForm {
  name: string;
  breed: string;
  weight: string;
  birthdate: string;
  district: string;
  instagram?: string;
  photoUri?: string;
}

const HK_DISTRICTS = [
  'Central & Western',
  'Eastern',
  'Southern',
  'Wan Chai',
  'Kowloon City',
  'Kwun Tong',
  'Sham Shui Po',
  'Wong Tai Sin',
  'Yau Tsim Mong',
  'Islands',
  'Kwai Tsing',
  'North',
  'Sai Kung',
  'Sha Tin',
  'Tai Po',
  'Tsuen Wan',
  'Tuen Mun',
  'Yuen Long',
];

const DOG_BREEDS = {
  'Sporting Group': ['Labrador Retriever', 'Golden Retriever', 'German Shorthaired Pointer'],
  'Hound Group': ['Beagle', 'Dachshund', 'Rhodesian Ridgeback'],
  'Working Group': ['German Shepherd', 'Siberian Husky', 'Great Dane'],
  'Terrier Group': ['Yorkshire Terrier', 'Bull Terrier', 'West Highland White Terrier'],
  'Toy Group': ['Chihuahua', 'Pomeranian', 'Shih Tzu'],
  'Non-Sporting Group': ['Bulldog', 'Chow Chow', 'Dalmatian'],
  'Herding Group': ['Border Collie', 'Shetland Sheepdog', 'Welsh Corgi'],
};

export default function PetProfile() {
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [district, setDistrict] = useState('');
  const [instagram, setInstagram] = useState('');
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleSubmit = () => {
    if (petName && breed && birthdate && weight && district) {
      const profile: PetProfileForm = {
        name: petName,
        breed,
        weight,
        birthdate: birthdate.toISOString(),
        district,
        instagram: instagram || undefined,
        photoUri: photoUri || undefined,
      };
      
      StorageService.setPetProfile(profile).then((success) => {
        if (success) {
          StorageService.setHasCompletedOnboarding(true);
          router.replace('/(tabs)');
        } else {
          // Handle error - could show an alert or error message
          console.error('Failed to save pet profile');
        }
      });
    }
  };

  const handleSkip = () => {
    StorageService.setHasCompletedOnboarding(true);
    router.replace('/(tabs)');
  };

  const handleDateChange = (event: any) => {
    if (Platform.OS === 'web') {
      const selectedDate = new Date(event.target.value);
      setBirthdate(selectedDate);
    }
  };

  const renderBreedList = () => {
    const sections = Object.entries(DOG_BREEDS).map(([title, data]) => ({
      title,
      data,
    }));

    return (
      <FlatList
        data={sections.flatMap(section => 
          section.data.map(breed => ({
            breed,
            group: section.title,
          }))
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              setBreed(item.breed);
              setShowBreedModal(false);
            }}>
            <Text style={styles.listItemText}>{item.breed}</Text>
            <Text style={styles.listItemSubtext}>{item.group}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => `${item.group}-${item.breed}`}
      />
    );
  };

  const renderDistrictList = () => (
    <FlatList
      data={HK_DISTRICTS}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            setDistrict(item);
            setShowDistrictModal(false);
          }}>
          <Text style={styles.listItemText}>{item}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item}
    />
  );

  const DateInput = Platform.select({
    web: () => (
      <input
        type="date"
        onChange={handleDateChange}
        value={birthdate ? format(birthdate, 'yyyy-MM-dd') : ''}
        max={format(new Date(), 'yyyy-MM-dd')}
        style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '12px',
          width: '100%',
          border: 'none',
          fontFamily: 'Nunito-Regular',
          fontSize: '16px',
          color: '#333',
          cursor: 'pointer',
        }}
      />
    ),
    default: () => (
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          if (Platform.OS !== 'web') {
            const DateTimePicker = require('@react-native-community/datetimepicker').default;
            return (
              <DateTimePicker
                value={birthdate || new Date()}
                mode="date"
                display="default"
                onChange={(event: any, selectedDate?: Date) => {
                  if (selectedDate) {
                    setBirthdate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            );
          }
        }}>
        <Text style={birthdate ? styles.inputText : styles.placeholderText}>
          {birthdate ? format(birthdate, 'dd MMM yyyy') : 'Select date'}
        </Text>
        <Calendar size={20} color="#ad8b73" />
      </TouchableOpacity>
    ),
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PawPrint size={48} color="#ad8b73" style={styles.icon} />
      <Text style={styles.title}>Create Pet Profile</Text>
      <Text style={styles.subtitle}>Tell us about your furry friend</Text>

      <TouchableOpacity style={styles.photoContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <>
            <Camera size={32} color="#ad8b73" />
            <Text style={styles.photoText}>Add Photo</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pet's Name</Text>
          <TextInput
            style={styles.input}
            value={petName}
            onChangeText={setPetName}
            placeholder="Enter pet's name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breed</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowBreedModal(true)}>
            <Text style={breed ? styles.inputText : styles.placeholderText}>
              {breed || 'Select breed'}
            </Text>
            <ChevronDown size={20} color="#ad8b73" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Date</Text>
          {DateInput}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>District</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDistrictModal(true)}>
            <Text style={district ? styles.inputText : styles.placeholderText}>
              {district || 'Select district'}
            </Text>
            <MapPin size={20} color="#ad8b73" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instagram (Optional)</Text>
          <TextInput
            style={styles.input}
            value={instagram}
            onChangeText={setInstagram}
            placeholder="@your.pet"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (!petName || !breed || !birthdate || !weight || !district) && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!petName || !breed || !birthdate || !weight || !district}>
        <Text style={styles.buttonText}>Continue</Text>
        <ChevronRight size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Skip for Now</Text>
      </TouchableOpacity>

      <Modal
        visible={showBreedModal}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Breed</Text>
              <TouchableOpacity
                onPress={() => setShowBreedModal(false)}
                style={styles.closeButton}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {renderBreedList()}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDistrictModal}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity
                onPress={() => setShowDistrictModal(false)}
                style={styles.closeButton}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {renderDistrictList()}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 100, // Add extra padding for the skip button
  },
  icon: {
    marginTop: 48,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    marginBottom: 32,
    color: '#666',
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#ad8b73',
    borderStyle: 'dashed',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  photoText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  inputText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#999',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ad8b73',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#fff',
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#333',
  },
  listItemSubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});