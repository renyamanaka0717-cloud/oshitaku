import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { CuteIcon } from './CuteIcon';
import { cuteIconKeyForEmoji } from '@/theme/cuteIcons';
import { ColorPalette, spacing, useTheme } from '@/theme';

type Props = {
  icon?: string;
  message: string;
};

export function EmptyState({ icon, message }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      {icon ? (
        <CuteIcon iconKey={cuteIconKeyForEmoji(icon)} size={36} fallback={<AppText style={styles.icon}>{icon}</AppText>} />
      ) : null}
      <AppText variant="body" color={colors.textMuted} style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.xs,
    },
    icon: {
      fontSize: 36,
    },
    message: {
      textAlign: 'center',
    },
  });
}
