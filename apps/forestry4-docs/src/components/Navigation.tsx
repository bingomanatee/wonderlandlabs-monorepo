import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FaGithub } from 'react-icons/fa';
import useForestryLocal from '../hooks/useForestryLocal';
const menuItems: Record<string, MenuItem[]> = {
  'Getting Started': [
    { label: 'Quick Start', path: '/' },
    { label: 'Why Forestry?', path: '/why' },
  ],
  'Essential Features': [
    { label: 'Basics', path: '/store' },
    { label: 'Actions', path: '/actions' },
    { label: 'With React', path: '/react' },
  ],
  'Power Tools': [
    { label: 'Validation', path: '/validation' },
    { label: 'Schema', path: '/schemas' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'RxJS / Immer', path: '/rxjs' },
  ],
  'Practical Examples': [
    { label: 'Overview', path: '/examples' },
    { label: 'Todo App', path: '/examples/todo-app' },
    { label: 'Shopping Cart', path: '/examples/shopping-cart' },
    { label: 'Form Validation', path: '/examples/form-validation' },
    { label: 'Transaction Demo', path: '/examples/transaction-demo' },
  ],
  'API Reference': [
    { label: 'Overview', path: '/api' },
    { label: 'Forest Class', path: '/api#forest' },
    { label: 'Constructor & Properties', path: '/api#forest-constructor' },
    { label: 'Core Methods', path: '/api#forest-core' },
    { label: 'Branching Methods', path: '/api#forest-branching' },
    { label: 'Transactions', path: '/api#forest-transactions' },
    { label: 'Validation', path: '/api#forest-validation' },
    { label: 'ForestBranch', path: '/api#forestbranch' },
    { label: 'Configuration Types', path: '/api#types-config' },
    { label: 'Action Types', path: '/api#types-actions' },
    { label: 'Validation Types', path: '/api#types-validation' },
    { label: 'Utility Types', path: '/api#types-utility' },
  ],
};
import { NavigationState, navigationStoreFactory } from '../storeFactories/navigationStoreFactory';

interface MenuItem {
  label: string;
  path: string;
  external?: boolean;
}

const Navigation: React.FC = () => {
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Navigation state management with Forestry
  const [navState, navStore] = useForestryLocal<NavigationState>(navigationStoreFactory);
  const { openMenu } = navState;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Container maxW="container.xl">
        <Flex alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <HStack as={Link} spacing={2} mr={2} to="/" mr={10}>
            <Image w="32px" h="32px" src="/logo.png" />

            <Text fontSize="xl" fontWeight="bold" color="gray.800" whiteSpace="nowrap">
              Forestry 4.0
            </Text>
          </HStack>

          {/* Navigation Menu */}
          <HStack spacing={6}>
            {Object.entries(menuItems).map(([category, items]) => (
              <Menu
                key={category}
                isOpen={openMenu === category}
                onClose={() => navStore.$.closeMenu()}
              >
                <MenuButton
                  as={Button}
                  variant="ghost"
                  colorScheme="green"
                  _hover={{ bg: 'green.100' }}
                  _active={{ bg: 'green.200' }}
                  rightIcon={<ChevronDownIcon />}
                  onMouseEnter={() => navStore.handleMenuEnter(category)}
                  onClick={() => {
                    if (openMenu === category) {
                      navStore.closeMenu();
                    } else {
                      navStore.openMenu(category);
                    }
                  }}
                >
                  {category}
                </MenuButton>
                <MenuList
                  onMouseLeave={() => navStore.handleMenuLeave()}
                  onMouseEnter={() => navStore.setHoveredMenu(category)}
                >
                  {items.map((item) => (
                    <MenuItem
                      key={item.path}
                      as={item.external ? Link : RouterLink}
                      to={item.external ? undefined : item.path}
                      href={item.external ? item.path : undefined}
                      isExternal={item.external}
                      bg={!item.external && isActive(item.path) ? 'forest.50' : 'transparent'}
                      color={!item.external && isActive(item.path) ? 'forest.600' : 'gray.700'}
                      fontWeight={!item.external && isActive(item.path) ? 'semibold' : 'normal'}
                      _hover={{
                        bg: !item.external && isActive(item.path) ? 'forest.100' : 'gray.50',
                      }}
                      onClick={() => navStore.handleItemClick()}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            ))}

            {/* GitHub Source Button */}
            <Button
              as={Link}
              href="https://github.com/bingomanatee/wonderlandlabs-monorepo"
              isExternal
              variant="ghost"
              colorScheme="gray"
              size="sm"
              _hover={{ bg: 'gray.100' }}
              leftIcon={<FaGithub />}
              aria-label="View source on GitHub"
            >
              <ExternalLinkIcon ml={1} boxSize={3} />
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navigation;
