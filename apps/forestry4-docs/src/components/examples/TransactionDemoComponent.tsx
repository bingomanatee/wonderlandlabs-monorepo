import React from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import useForestryLocal from '../../hooks/useForestryLocal';
import { transactionDemoStoreFactory } from '../../storeFactories/transactionDemoStoreFactory';

const TransactionDemoComponent: React.FC = () => {
  const toast = useToast();
  const [demoState, demoStore] = useForestryLocal(transactionDemoStoreFactory);
  const [transferAmount, setTransferAmount] = React.useState('100');
  const [fromAccount, setFromAccount] = React.useState('checking');
  const [toAccount, setToAccount] = React.useState('savings');

  const handleTransfer = () => {
    // Block same-account transfers
    if (fromAccount === toAccount) {
      toast({
        title: 'Invalid Transfer',
        description: 'Cannot transfer to the same account',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      demoStore.$.transferFunds(fromAccount, toAccount, parseFloat(transferAmount));
      toast({
        title: 'Transfer Successful',
        description: `Transferred $${transferAmount} from ${fromAccount} to ${toAccount}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Transfer Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleMigration = () => {
    try {
      demoStore.$.performDataMigration();
      toast({
        title: 'Migration Successful',
        description: 'Data migration completed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Migration Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      {/* Current State Display */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Stat>
          <StatLabel>Checking Account</StatLabel>
          <StatNumber>${demoState.bankAccounts.checking.balance.toFixed(2)}</StatNumber>
          <StatHelpText>{demoState.bankAccounts.checking.name}</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Savings Account</StatLabel>
          <StatNumber>${demoState.bankAccounts.savings.balance.toFixed(2)}</StatNumber>
          <StatHelpText>{demoState.bankAccounts.savings.name}</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Total Transactions</StatLabel>
          <StatNumber>{demoState.bankTransactions.length}</StatNumber>
          <StatHelpText>Completed transfers</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Divider mb={6} />

      {/* Bank Transfer Demo */}
      <Box mb={6}>
        <Text fontSize="md" fontWeight="semibold" mb={3}>
          Bank Transfer
        </Text>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3} mb={3}>
          <FormControl>
            <FormLabel fontSize="sm">From Account</FormLabel>
            <Select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">To Account</FormLabel>
            <Select value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Amount</FormLabel>
            <Input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="100"
            />
          </FormControl>
          <Box display="flex" alignItems="end">
            <Button
              colorScheme="blue"
              onClick={handleTransfer}
              w="full"
              isDisabled={
                fromAccount === toAccount || !transferAmount || parseFloat(transferAmount) <= 0
              }
            >
              Transfer
            </Button>
          </Box>
        </SimpleGrid>
        {fromAccount === toAccount && (
          <Text fontSize="sm" color="orange.500" mt={2}>
            ⚠️ Please select different accounts for transfer
          </Text>
        )}
        {transferAmount && parseFloat(transferAmount) <= 0 && (
          <Text fontSize="sm" color="red.500" mt={2}>
            ⚠️ Transfer amount must be greater than 0
          </Text>
        )}
      </Box>

      <Divider mb={6} />

      {/* Other Transaction Demos */}
      <HStack spacing={4} mb={6}>
        <Button colorScheme="purple" onClick={handleMigration}>
          Run Data Migration
        </Button>
        <Button colorScheme="red" variant="outline" onClick={demoStore.$.reset}>
          Reset Demo
        </Button>
      </HStack>

      <Text fontSize="sm" color="gray.600" fontStyle="italic" mb={6}>
        💡 Try transferring more than the available balance to see transaction rollback in action!
      </Text>

      {/* Transaction History */}
      {demoState.bankTransactions.length > 0 && (
        <>
          <Divider mt={6} mb={4} />
          <Box>
            <Text fontSize="md" fontWeight="semibold" mb={3}>
              Transaction History
            </Text>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Description</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {demoState.bankTransactions.map((transaction) => (
                  <Tr key={transaction.id}>
                    <Td>
                      <Badge colorScheme="blue" fontSize="xs">
                        #{transaction.id.slice(-4)}
                      </Badge>
                    </Td>
                    <Td fontSize="sm">{transaction.description}</Td>
                    <Td isNumeric>
                      <Text color="green.600" fontWeight="medium">
                        ${transaction.amount.toFixed(2)}
                      </Text>
                    </Td>
                    <Td fontSize="xs" color="gray.500">
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TransactionDemoComponent;
