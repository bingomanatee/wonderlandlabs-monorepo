import { useEffect, useRef } from 'react';
import { Button } from '@chakra-ui/react';
import {
  createPendingIndicator,
} from '../../../../../packages/data-core/src/pending-indicator';

const preview = {
  records: 3,
  durationMs: 3000,
  minScale: 0.5,
  scaleRange: 0.75,
  hueRange: 360,
};

export default function PendingIndicatorDemo() {
  const indicator = useRef<
    ReturnType<typeof createPendingIndicator> | undefined
  >(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    indicator.current = createPendingIndicator();
    return () => {
      clearTimeout(timer.current);
      indicator.current?.destroy();
    };
  }, []);
  const showPreview = () => {
    clearTimeout(timer.current);
    indicator.current?.configure({
      scale: preview.minScale + Math.random() * preview.scaleRange,
      hue: Math.floor(Math.random() * preview.hueRange),
    });
    indicator.current?.setPending(preview.records);
    timer.current = setTimeout(() => {
      indicator.current?.setPending(0);
    }, preview.durationMs);
  };
  return (
    <Button alignSelf="flex-start" onClick={showPreview}>
      Preview indicator for 3 seconds
    </Button>
  );
}
