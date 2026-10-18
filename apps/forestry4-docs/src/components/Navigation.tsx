import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import { FaGithub } from 'react-icons/fa';
import {
  navigationSections,
  sourceUrl,
  type NavigationSection,
} from '../navigation/sections';

function DesktopMenu({ section }: { section: NavigationSection }) {
  const location = useLocation();
  const currentPath = location.pathname + location.hash;

  return (
    <Box>
      <Menu>
        <MenuButton
          as={Button}
          variant="ghost"
          color="green.300"
          _hover={{ bg: 'green.700', color: 'white' }}
          _active={{ bg: 'green.600', color: 'white' }}
          rightIcon={<ChevronDownIcon />}
          iconSpacing={1}
        >
          {section.label}
        </MenuButton>
        <MenuList color="gray.700">
          <MenuItem as={RouterLink} to={section.path}>
            {section.title}
          </MenuItem>
          <MenuDivider />
          {section.items.map((item) => (
            <MenuItem
              key={item.path}
              as={RouterLink}
              to={item.path}
              aria-current={currentPath === item.path ? 'page' : undefined}
              bg={currentPath === item.path ? 'forest.50' : undefined}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
}

export default function Navigation() {
  const bg = useColorModeValue('black', 'gray.500');
  const fg = useColorModeValue('white', 'black');

  return (
    <Box
      as="nav"
      aria-label="Documentation"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bg}
      shadow="sm"
    >
      <Container maxW="container.xl">
        <Flex align="center" justify="space-between" h="64px" gap={2}>
          <HStack as={RouterLink} spacing={2} to="/" flexShrink={0}>
            <Image
              w="32px"
              h="32px"
              src="/img/logo-dark.png"
              alt=""
            />
            <Text fontSize="xl" fontWeight="bold" color={fg}>
              Forestry 4.0
            </Text>
          </HStack>
          <HStack spacing={0}>
            <HStack display={{ base: 'none', lg: 'flex' }} spacing={0}>
              {navigationSections.map((section) => (
                <DesktopMenu key={section.path} section={section} />
              ))}
            </HStack>
            <Box display={{ base: 'block', lg: 'none' }}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<HamburgerIcon />}
                  aria-label="Open navigation"
                  variant="ghost"
                  color="green.300"
                  _hover={{ bg: 'green.700' }}
                  _active={{ bg: 'green.600' }}
                />
                <MenuList color="gray.700">
                  {navigationSections.map((section) => (
                    <MenuItem
                      key={section.path}
                      as={RouterLink}
                      to={section.path}
                    >
                      {section.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
            <Link
              href={sourceUrl}
              isExternal
              aria-label="View source on GitHub"
              color={fg}
              p={3}
              display="inline-flex"
            >
              <FaGithub />
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
