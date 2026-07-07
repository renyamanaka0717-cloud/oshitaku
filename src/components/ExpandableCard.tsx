import { PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card } from './Card';
import { AppText } from './AppText';
import { ColorPalette, spacing, useTheme } from '@/theme';

type Props = PropsWithChildren<{
  summary: ReactNode;
  defaultExpanded?: boolean;
}>;

export function ExpandableCard({ summary, defaultExpanded = false, children }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card style={styles.card}>
      <Pressable style={styles.summaryRow} onPress={() => setExpanded((e) => !e)} hitSlop={4}>
        <View style={styles.summaryContent}>{summary}</View>
        <AppText style={styles.chevron} color={colors.textMuted}>
          {expanded ? '︿' : '﹀'}
        </AppText>
      </Pressable>
      {expanded ? <View style={styles.detail}>{children}</View> : null}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      padding: 0,
      overflow: 'hidden',
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
    },
    summaryContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    chevron: {
      fontSize: 13,
    },
    detail: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.surfaceAlt,
      paddingTop: spacing.sm,
    },
  });
}
