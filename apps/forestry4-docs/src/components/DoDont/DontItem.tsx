import React from 'react';
import { BoxProps } from '@chakra-ui/react';
import DoDontItem from './DoDontItem';

interface DontItemProps extends BoxProps {
  title: string;
  children: React.ReactNode;
}

/**
 * DontItem - Individual "Don't" warning item
 *
 * Wrapper around DoDontItem with isDont=true for negative warnings.
 * Provides consistent styling with red background.
 */
const DontItem: React.FC<DontItemProps> = ({ title, children, ...props }) => {
  return (
    <DoDontItem title={title} isDont={true} {...props}>
      {children}
    </DoDontItem>
  );
};

export default DontItem;
