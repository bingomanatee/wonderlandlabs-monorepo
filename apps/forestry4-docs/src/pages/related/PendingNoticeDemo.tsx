import { useEffect, useRef } from 'react';
import { Button } from '@chakra-ui/react';
import {
  showPendingNotice,
} from '../../../../../packages/data-core/src/pending-indicator';

export default function PendingNoticeDemo() {
  const close = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => close.current?.(), []);
  return (
    <Button
      alignSelf="flex-start"
      onClick={() => {
        close.current = showPendingNotice({
          storageKey: 'forestry4-docs:pending-icon-explanation',
        });
      }}
    >
      Explain the pending icon
    </Button>
  );
}
