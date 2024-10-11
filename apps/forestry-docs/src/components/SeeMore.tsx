import { Box, Button, CloseButton, Heading, useBoolean } from '@chakra-ui/react';
import React from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa6';
export function SeeMore({
  title,
  children,
  open = false,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useBoolean(open);

  if (!show) {
    return (
      <Button
        w="100%"
        onClick={setShow.on}
        leftIcon={
          <Box width="9px" height="9px" color="blue" className="sizeSVG">
            <FaChevronRight color={'blue'} />
          </Box>
        }
      >
        <Heading variant="seeMore">Show &quot;{title}&quot;</Heading>
      </Button>
    );
  }

  return (
    <Box layerStyle="seeMoreNavbarOpen">
      <Box as="nav" layerStyle="seeMoreNavbar" onClick={setShow.off}>
        <Box
          data-name="chevorn-down"
          width="9px"
          flex={0}
          height="9px"
          color="blue"
          flexBasis="9px"
          className="sizeSVG"
        >
          <FaChevronDown color={'blue'} />
        </Box>
        <Heading variant="seeMore">&quot;{title}&quot;</Heading>
        <CloseButton className="smallCloseButton" color="red" size="sm" />
      </Box>
      <Box layerStyle="seeMoreOverlay">{children}</Box>{' '}
      <Box layerStyle="seeMoreNavbarFooter" onClick={setShow.off}>
        <Heading variant="seeMore">&nbsp;</Heading>
        <CloseButton
          className="smallCloseButton"
          color="red"
          size="small"
          sx={{ width: '10px', height: '10px' }}
        />
      </Box>
    </Box>
  );
}
