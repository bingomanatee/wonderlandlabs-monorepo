import { useEffect } from 'react';
import { Container, Link, ListItem, UnorderedList } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Section from '../components/Section';
import type { NavigationSection } from '../navigation/sections';

export default function NavigationLanding({
  section,
}: {
  section: NavigationSection;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section.path]);

  return (
    <Container maxW="container.xl" py={8}>
      <PageTitle title={section.title} />
      <Section>
        <UnorderedList spacing={4} pl={4}>
          {section.items.map((item) => (
            <ListItem key={item.path}>
              <Link as={RouterLink} to={item.path}>
                {item.label}
              </Link>
            </ListItem>
          ))}
        </UnorderedList>
      </Section>
    </Container>
  );
}
