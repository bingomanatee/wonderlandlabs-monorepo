import { Badge } from '@chakra-ui/react';
import { memo } from 'react';

type Params = {
  count?: number;
  children?: React.ReactNode;
};

const ContentBadge: React.FC = ({ count, children }: Params) => (
  <Badge
    position="absolute"
    top="-6px"
    right="-6px"
    borderRadius="full"
    colorScheme="red"
    variant="solid"
    // sizing to make a circle:
    minW="18px"
    h="18px"
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    fontSize="xs"
    lineHeight="none"
    border="1px solid"
    borderColor="white"
  >
    {count ?? children}
  </Badge>
);

export default memo(ContentBadge);
