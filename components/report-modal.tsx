import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppTheme } from '@/constants/tokens';
import { blockUser, reportUser } from '@/lib/services/safety';

const REPORT_REASONS = [
  'Inappropriate behavior',
  'Harassment',
  'Spam',
  'Fake profile',
  'Safety concern',
  'Other',
] as const;

type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  reporterId: string;
  reportedUserId: string;
  reportedUserName: string;
};

export function ReportModal({
  visible,
  onClose,
  reporterId,
  reportedUserId,
  reportedUserName,
}: ReportModalProps) {
  const theme = useAppTheme();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);

    try {
      await reportUser(reporterId, reportedUserId, selectedReason, details || undefined);
      Alert.alert('Report Submitted', 'Thank you for helping keep Orbit safe.', [
        {
          text: 'Also Block',
          onPress: async () => {
            try {
              await blockUser(reporterId, reportedUserId);
            } catch {}
            resetAndClose();
          },
        },
        { text: 'Done', onPress: resetAndClose },
      ]);
    } catch {
      Alert.alert('Error', 'Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlock = () => {
    Alert.alert(
      `Block ${reportedUserName}?`,
      'They won\'t be able to see your profile or message you.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(reporterId, reportedUserId);
              Alert.alert('Blocked', `${reportedUserName} has been blocked.`);
              resetAndClose();
            } catch {
              Alert.alert('Error', 'Could not block user. Please try again.');
            }
          },
        },
      ]
    );
  };

  const resetAndClose = () => {
    setSelectedReason(null);
    setDetails('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.text }}>
            Report {reportedUserName}
          </Text>
          <Pressable onPress={resetAndClose}>
            <Text style={{ fontSize: 16, color: theme.colors.primary }}>Cancel</Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 15, color: theme.colors.textSecondary, marginBottom: 16 }}>
          Select a reason for reporting:
        </Text>

        <View style={{ gap: 8, marginBottom: 20 }}>
          {REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason}
              onPress={() => setSelectedReason(reason)}
              style={{
                padding: 14,
                borderRadius: 12,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: selectedReason === reason ? theme.colors.primary : theme.colors.border,
                backgroundColor: selectedReason === reason ? theme.colors.primarySubtle : theme.colors.surface,
              }}
            >
              <Text style={{ fontSize: 15, color: theme.colors.text }}>{reason}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            borderCurve: 'continuous',
            padding: 14,
            fontSize: 15,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
            minHeight: 80,
            textAlignVertical: 'top',
            marginBottom: 24,
          }}
          placeholder="Additional details (optional)"
          placeholderTextColor={theme.colors.textMuted}
          value={details}
          onChangeText={setDetails}
          multiline
        />

        <Pressable
          onPress={handleSubmit}
          disabled={!selectedReason || submitting}
          style={{
            backgroundColor: selectedReason ? theme.colors.danger : theme.colors.border,
            padding: 16,
            borderRadius: 14,
            borderCurve: 'continuous',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleBlock}
          style={{
            padding: 16,
            borderRadius: 14,
            borderCurve: 'continuous',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.danger }}>
            Block {reportedUserName}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
