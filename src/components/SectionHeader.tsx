import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { CuteIcon } from './CuteIcon';
import { cuteIconKeyForEmoji } from '@/theme/cuteIcons';
import { spacing } from '@/theme';

type Props = {
  title: string;
  icon?: string | React.ReactNode;
  right?: React.ReactNode;
};

export function SectionHeader({ title, icon, right }: Props) {
  const iconNode =
    typeof icon === 'string' ? (
      <CuteIcon iconKey={cuteIconKeyForEmoji(icon)} size={20} fallback={<AppText style={styles.icon}>{icon}</AppText>} />
    ) : (
      icon
    );
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {iconNode}
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
