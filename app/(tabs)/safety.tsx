import { Ionicons } from '@expo/vector-icons';
import React, { use, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/constants/tokens';
import { AuthContext } from '@/contexts/auth-context';
import {
  addTrustedContact,
  createSafetyCheckin,
  getActiveCheckin,
  getTrustedContacts,
  markSafe,
  removeTrustedContact,
  triggerAlert,
} from '@/lib/services/safety';
import { type TrustedContact } from '@/lib/types';

export default function SafetyScreen() {
  const { user } = use(AuthContext);
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCheckinId, setActiveCheckinId] = useState<string | null>(null);
  const [addingContact, setAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [contactsData, checkinId] = await Promise.all([
        getTrustedContacts(user.id),
        getActiveCheckin(user.id),
      ]);
      setContacts(contactsData);
      setActiveCheckinId(checkinId);
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddContact = async () => {
    if (!user || !newName.trim() || !newPhone.trim()) return;
    try {
      await addTrustedContact(user.id, newName.trim(), newPhone.trim());
      setNewName('');
      setNewPhone('');
      setAddingContact(false);
      loadData();
    } catch {
      Alert.alert('Error', 'Could not add contact. Please try again.');
    }
  };

  const handleRemoveContact = (contact: TrustedContact) => {
    Alert.alert('Remove Contact', `Remove ${contact.name} from trusted contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeTrustedContact(contact.id);
            loadData();
          } catch {
            Alert.alert('Error', 'Could not remove contact.');
          }
        },
      },
    ]);
  };

  const handleCheckin = async () => {
    if (!user) return;
    try {
      const id = await createSafetyCheckin(user.id);
      setActiveCheckinId(id);
      Alert.alert(
        'Check-in Active',
        'Your trusted contacts will be notified if you don\'t check in as safe. Stay safe!'
      );
    } catch {
      Alert.alert('Error', 'Could not start check-in.');
    }
  };

  const handleMarkSafe = async () => {
    if (!activeCheckinId) return;
    try {
      await markSafe(activeCheckinId);
      setActiveCheckinId(null);
      Alert.alert('Safe!', 'Your trusted contacts have been notified you\'re safe.');
    } catch {
      Alert.alert('Error', 'Could not mark as safe.');
    }
  };

  const handleAlert = () => {
    if (!activeCheckinId) return;
    Alert.alert(
      'Send Alert?',
      'This will alert your trusted contacts that you need help.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            try {
              await triggerAlert(activeCheckinId);
              setActiveCheckinId(null);
              Alert.alert('Alert Sent', 'Your trusted contacts have been notified.');
            } catch {
              Alert.alert('Error', 'Could not send alert.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 100, gap: 24 }}
    >
      <Text style={{ fontSize: 32, fontWeight: '800', color: theme.colors.text }}>Safety</Text>

      {/* Check-in Section */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 20,
          gap: 16,
          borderWidth: 1,
          borderColor: activeCheckinId ? theme.colors.success : theme.colors.surfaceBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>
            I Arrived Safe
          </Text>
        </View>

        <Text style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 }}>
          Start a safety check-in when heading out. Your trusted contacts will be notified if you need help.
        </Text>

        {activeCheckinId ? (
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={handleMarkSafe}
              style={{
                backgroundColor: theme.colors.success,
                padding: 16,
                borderRadius: 14,
                borderCurve: 'continuous',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>
                I'm Safe
              </Text>
            </Pressable>

            <Pressable
              onPress={handleAlert}
              style={{
                backgroundColor: theme.colors.danger,
                padding: 16,
                borderRadius: 14,
                borderCurve: 'continuous',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>
                Send Alert
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleCheckin}
            disabled={contacts.length === 0}
            style={{
              backgroundColor: contacts.length > 0 ? theme.colors.primary : theme.colors.border,
              padding: 16,
              borderRadius: 14,
              borderCurve: 'continuous',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>
              Start Check-in
            </Text>
          </Pressable>
        )}

        {contacts.length === 0 && !activeCheckinId && (
          <Text style={{ fontSize: 13, color: theme.colors.textMuted, textAlign: 'center' }}>
            Add at least one trusted contact to use this feature.
          </Text>
        )}
      </View>

      {/* Trusted Contacts */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>
            Trusted Contacts
          </Text>
          <Pressable onPress={() => setAddingContact(true)}>
            <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
          </Pressable>
        </View>

        {addingContact && (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 14,
              borderCurve: 'continuous',
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: theme.colors.surfaceBorder,
            }}
          >
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              placeholder="Name"
              placeholderTextColor={theme.colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              placeholder="Phone number"
              placeholderTextColor={theme.colors.textMuted}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => {
                  setAddingContact(false);
                  setNewName('');
                  setNewPhone('');
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddContact}
                disabled={!newName.trim() || !newPhone.trim()}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: newName.trim() && newPhone.trim() ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Add</Text>
              </Pressable>
            </View>
          </View>
        )}

        {contacts.length === 0 && !addingContact ? (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 14,
              borderCurve: 'continuous',
              padding: 24,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 36 }}>👥</Text>
            <Text style={{ fontSize: 15, color: theme.colors.textTertiary, textAlign: 'center' }}>
              No trusted contacts yet. Add someone you trust to enable safety check-ins.
            </Text>
          </View>
        ) : (
          contacts.map((contact) => (
            <View
              key={contact.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderRadius: 14,
                borderCurve: 'continuous',
                padding: 14,
                gap: 12,
                borderWidth: 1,
                borderColor: theme.colors.surfaceBorder,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primarySubtle,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="person" size={18} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text }}>
                  {contact.name}
                </Text>
                <Text style={{ fontSize: 13, color: theme.colors.textTertiary }}>
                  {contact.phone}
                </Text>
              </View>
              <Pressable onPress={() => handleRemoveContact(contact)}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
