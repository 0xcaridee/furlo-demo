import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Search, Star, MapPin, Phone, Clock, Filter, MessageSquarePlus, ChevronRight } from 'lucide-react-native';
import { ILLUSTRATIONS } from '@/lib/illustrations';

const VENDORS = [
  {
    id: '1',
    name: 'Phoenix Animal Clinic',
    type: 'Veterinary',
    rating: 4.8,
    reviews: 156,
    image: ILLUSTRATIONS.vendorClinic.uri,
    address: 'G/F, 2 Sun Street, Wan Chai',
    phone: '+852 2865 4320',
    hours: 'Open 9:00 AM - 6:00 PM',
  },
  {
    id: '2',
    name: 'Pawsome Grooming',
    type: 'Grooming',
    rating: 4.6,
    reviews: 89,
    image: ILLUSTRATIONS.vendorGrooming.uri,
    address: '45 Johnston Road, Wan Chai',
    phone: '+852 2345 6789',
    hours: 'Open 10:00 AM - 6:00 PM',
  },
  {
    id: '3',
    name: 'Bark & Train',
    type: 'Training',
    rating: 4.9,
    reviews: 203,
    image: ILLUSTRATIONS.vendorTraining.uri,
    address: "789 Queen's Road East, Wan Chai",
    phone: '+852 3456 7890',
    hours: 'Open 8:00 AM - 8:00 PM',
  },
];

type FilterType = 'all' | 'vet' | 'grooming' | 'training';

export default function PawSearchScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'veterinary':
        return '#4CAF50';
      case 'grooming':
        return '#2196F3';
      case 'training':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const filteredVendors = VENDORS.filter(
    (vendor) => selectedFilter === 'all' || vendor.type.toLowerCase() === selectedFilter
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Search size={32} color="#ad8b73" />
        <View style={styles.headerText}>
          <Text style={styles.title}>PawSearch</Text>
          <Text style={styles.subtitle}>Find trusted pet service providers</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or service"
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}>
          <Filter size={16} color={selectedFilter === 'all' ? '#fff' : '#666'} />
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All Services
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'vet' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('vet')}>
          <Text style={[styles.filterText, selectedFilter === 'vet' && styles.filterTextActive]}>
            Veterinary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'grooming' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('grooming')}>
          <Text style={[styles.filterText, selectedFilter === 'grooming' && styles.filterTextActive]}>
            Grooming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'training' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('training')}>
          <Text style={[styles.filterText, selectedFilter === 'training' && styles.filterTextActive]}>
            Training
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.vendorsContainer}>
        <TouchableOpacity style={styles.reviewCtaCard}>
          <View style={styles.reviewCtaContent}>
            <View style={styles.reviewCtaIconContainer}>
              <MessageSquarePlus size={32} color="#ad8b73" />
            </View>
            <View style={styles.reviewCtaTextContainer}>
              <Text style={styles.reviewCtaTitle}>PawScore Your Experience</Text>
              <Text style={styles.reviewCtaDescription}>
                Help other pet parents by reviewing services you've used
              </Text>
            </View>
            <ChevronRight size={24} color="#ad8b73" />
          </View>
        </TouchableOpacity>

        {filteredVendors.map((vendor) => (
          <TouchableOpacity key={vendor.id} style={styles.vendorCard}>
            <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
            <View style={styles.vendorContent}>
              <View style={styles.vendorHeader}>
                <Text style={styles.vendorName}>{vendor.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.rating}>{vendor.rating}</Text>
                  <Text style={styles.reviews}>({vendor.reviews})</Text>
                </View>
              </View>
              <View style={styles.typeContainer}>
                <Text style={[styles.type, { color: getTypeColor(vendor.type) }]}>{vendor.type}</Text>
              </View>
              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <MapPin size={14} color="#666" />
                  <Text style={styles.infoText}>{vendor.address}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Phone size={14} color="#666" />
                  <Text style={styles.infoText}>{vendor.phone}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.infoText}>{vendor.hours}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 20,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#333',
  },
  filterScroll: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#ad8b73',
  },
  filterText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  filterTextActive: {
    color: '#fff',
  },
  vendorsContainer: {
    padding: 20,
  },
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  vendorImage: {
    width: '100%',
    height: 150,
  },
  vendorContent: {
    padding: 16,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vendorName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  reviews: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  typeContainer: {
    marginBottom: 12,
  },
  type: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  reviewCtaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ad8b73',
    marginBottom: 8,
  },
  reviewCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCtaIconContainer: {
    backgroundColor: '#f8f5f3',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  reviewCtaTextContainer: {
    flex: 1,
  },
  reviewCtaTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  reviewCtaDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});