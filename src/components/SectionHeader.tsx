import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '@/theme';

type Props = {
  title: string;
  icon?: string | React.ReactNode;
  right?: React.ReactNode;
};

export function SectionHeader({ title, icon, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {typeof icon === 'string' ? <AppText style={styles.icon}>{icon}</AppText> : icon}
        <AppText variant="subtitle">{title}</AppText>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    fontSize: 20,
  },
});
