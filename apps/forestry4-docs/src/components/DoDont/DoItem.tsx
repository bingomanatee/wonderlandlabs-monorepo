import React from 'react';
import { BoxProps } from '@chakra-ui/react';
import DoDontItem from './DoDontItem';

interface DoItemProps extends BoxProps {
  title: string;
  children: React.ReactNode;
}

/**
 * DoItem - Individual "Do" recommendation item
 *
 * Wrapper around DoDontItem with isDont=false for positive recommendations.
 * Provides consistent styling with green background.
 */
const DoItem: React.FC<DoItemProps> = ({ title, children, ...props }) => {
  return (
    <DoDontItem title={title} isDont={false} {...props}>
      {children}
    </DoDontItem>
  );
};

export default DoItem;
