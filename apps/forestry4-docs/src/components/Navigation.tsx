import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface MenuItem {
  label: string;
  path: string;
  external?: boolean;
}

const Navigation: React.FC = () => {
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isActive = (path: string) => location.pathname === path;

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
      /*    { label: 'Advanced Patterns', path: '/advanced' },*/
    ],
    'Practical Examples': [
      { label: 'Overview', path: '/examples' },
      { label: 'Todo App', path: '/examples/todo-app' },
      { label: 'Shopping Cart', path: '/examples/shopping-cart' },
      { label: 'Form Validation', path: '/examples/form-validation' },
      { label: 'Transaction Demo', path: '/examples/transaction-demo' },
    ],
    Reference: [
      { label: 'API', path: '/api' },
      {
        label: 'GitHub Source',
        path: 'https://github.com/bingomanatee/wonderlandlabs-monorepo',
        external: true,
      },
    ],
  };

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
        <Flex h="80px" alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <HStack spacing={2}>
              <Text fontSize="2xl" fontWeight="bold" color="forest.600">
                🌲
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Forestry 4
              </Text>
            </HStack>
          </Link>

          {/* Navigation Menu */}
          <HStack spacing={8}>
            {Object.entries(menuItems).map(([category, items]) => (
              <Menu key={category}>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={<ChevronDownIcon />}
                  _hover={{ bg: 'gray.100' }}
                  _active={{ bg: 'gray.200' }}
                >
                  {category}
                </MenuButton>
                <MenuList>
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
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            ))}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navigation;
