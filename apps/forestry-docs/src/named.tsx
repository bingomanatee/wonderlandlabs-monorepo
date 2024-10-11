import type { FC } from 'react';

export function Named({ Component, name }: { Component: FC; name: string }) {
  const AsNamed = Component as FC<{ name: string }>;

  return <AsNamed name={name} />;
}
