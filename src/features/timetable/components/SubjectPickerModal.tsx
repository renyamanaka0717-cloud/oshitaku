import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Subject } from '@/db/models';
import { colors, radius, spacing } from '@/theme';

type Props = {
  visible: boolean;
  subjects: Subject[];
  onSelect: (subjectId: string | null) => void;
  onClose: () => void;
};

export function SubjectPickerModal({ visible, subjects, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            教科をえらぶ
          </AppText>
          <View style={styles.grid}>
            <Pressable style={[styles.chip, { backgroundColor: colors.surfaceAlt }]} onPress={() => { onSelect(null); onClose(); }}>
              <AppText>なし</AppText>
            </Pressable>
            {subjects.map((s) => (
              <Pressable
                key={s.id}
                style={[styles.chip, { backgroundColor: s.color }]}
                onPress={() => { onSelect(s.id); onClose(); }}
              >
                <AppText color={colors.white}>{s.name}</AppText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '70%',
  },
  title: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.round,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
