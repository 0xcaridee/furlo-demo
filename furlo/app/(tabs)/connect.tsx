import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Search, Users, MessageCircle, Clock, Hash } from 'lucide-react-native';
import { ILLUSTRATIONS } from '@/lib/illustrations';

const CHATS = [
  {
    id: '1',
    type: 'direct',
    name: 'Dr. Sarah Wong',
    avatar: ILLUSTRATIONS.avatarVet.uri,
    lastMessage: 'Teakha\'s vaccination records look good...',
    time: '2m ago',
    unread: 2,
    isVet: true,
  },
  {
    id: '2',
    type: 'group',
    name: 'Doodle Playgroup',
    avatar: ILLUSTRATIONS.avatarPlaygroup.uri,
    lastMessage: 'Alice: Anyone up for a walk at Victoria Park?',
    time: '15m ago',
    unread: 5,
    participants: 8,
  },
];

const GROUPS = [
  {
    id: '1',
    name: 'Doodles of Hong Kong',
    members: 120,
    description: 'A community for Doodle owners in Hong Kong',
    image: ILLUSTRATIONS.groupDoodles.uri,
    recentActivity: '5 mins ago',
  },
  {
    id: '2',
    name: 'Wanchai Doggo Friends',
    members: 267,
    description: 'Local dog community in Wan Chai area',
    image: ILLUSTRATIONS.groupWanchai.uri,
    recentActivity: '23 mins ago',
  },
  {
    id: '3',
    name: 'HK Samoyed Club',
    members: 890,
    description: 'For Samoyed enthusiasts',
    image: ILLUSTRATIONS.groupSamoyed.uri,
    recentActivity: '1 hour ago',
  },
];

export default function ConnectScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MessageCircle size={32} color="#ad8b73" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Connect</Text>
          <Text style={styles.subtitle}>Chat with vets and fellow pawrents</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats and groups"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Chats</Text>
        <View style={styles.chatsContainer}>
          {CHATS.map((chat) => (
            <TouchableOpacity key={chat.id} style={styles.chatCard}>
              <View style={styles.chatAvatarContainer}>
                <Image source={{ uri: chat.avatar }} style={styles.chatAvatar} />
                {chat.isVet && (
                  <View style={styles.vetBadge}>
                    <Text style={styles.vetBadgeText}>Vet</Text>
                  </View>
                )}
                {chat.type === 'group' && (
                  <View style={styles.groupBadge}>
                    <Hash size={12} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <View style={styles.chatNameContainer}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    {chat.type === 'group' && (
                      <Text style={styles.participantsCount}>{chat.participants} members</Text>
                    )}
                  </View>
                  <View style={styles.chatTimeContainer}>
                    <Clock size={12} color="#666" />
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </View>
                </View>
                <Text style={styles.chatMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>
              {chat.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{chat.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Groups</Text>
        <View style={styles.groupsContainer}>
          {GROUPS.map((group) => (
            <TouchableOpacity key={group.id} style={styles.groupCard}>
              <Image source={{ uri: group.image }} style={styles.groupImage} />
              <View style={styles.groupContent}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <View style={styles.membersContainer}>
                    <Users size={14} color="#666" />
                    <Text style={styles.membersCount}>{group.members}</Text>
                  </View>
                </View>
                <Text style={styles.groupDescription}>{group.description}</Text>
                <View style={styles.groupFooter}>
                  <View style={styles.activityContainer}>
                    <MessageCircle size={14} color="#666" />
                    <Text style={styles.activityText}>{group.recentActivity}</Text>
                  </View>
                  <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Join Group</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
  },
  chatsContainer: {
    gap: 12,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  chatAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  vetBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vetBadgeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: '#fff',
  },
  groupBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#2196F3',
    padding: 4,
    borderRadius: 8,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  chatNameContainer: {
    flex: 1,
  },
  chatName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#333',
  },
  participantsCount: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#666',
  },
  chatTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTime: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  chatMessage: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#ad8b73',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: '#fff',
  },
  groupsContainer: {
    gap: 16,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  groupImage: {
    width: '100%',
    height: 150,
  },
  groupContent: {
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersCount: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  groupDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: '#ad8b73',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#fff',
  },
});