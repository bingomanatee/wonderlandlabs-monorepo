# DoDont Component System

A set of reusable components for creating consistent "Do's and Don'ts" sections throughout the Forestry4 documentation app.

## Components

### `DoDont`
Container component that provides a Section wrapper with responsive grid layout for side-by-side Do and Don't lists. Includes automatic Section styling and optional title.

### `DoList` 
Container for positive recommendations with green styling and check mark emoji.

### `DoItem`
Individual recommendation item with green background and consistent text styling. (Wrapper around DoDontItem with isDont=false)

### `DontList`
Container for warnings/anti-patterns with red styling and X mark emoji.

### `DontItem`
Individual warning item with red background and consistent text styling. (Wrapper around DoDontItem with isDont=true)

### `DoDontItem`
Universal item component that can be either a Do or Don't item based on the `isDont` boolean prop.

### `TradeoffList`
Container for trade-offs/considerations with orange styling and warning emoji.

### `TradeoffItem`
Individual trade-off item with orange background and consistent text styling.

## Usage

```tsx
import { DoDont, DoList, DoItem, DontList, DontItem, DoDontItem, TradeoffList, TradeoffItem } from '@/components/DoDont';

const MyBestPractices = () => {
  return (
    <DoDont title="Best Practices">
      <DoList title="✅ Best Practices">
        <DoItem title="Use meaningful names">
          Choose descriptive variable and function names that clearly indicate their purpose.
        </DoItem>

        <DoItem title="Keep functions small">
          Write functions that do one thing well and are easy to understand.
        </DoItem>
      </DoList>

      <DontList title="❌ Things to avoid">
        <DontItem title="Don't use magic numbers">
          Avoid hardcoded numbers without explanation. Use named constants instead.
        </DontItem>

        <DontItem title="Don't ignore errors">
          Always handle errors appropriately rather than silently failing.
        </DontItem>
      </DontList>
    </DoDont>
  );
};

// Example with trade-offs
const MyComparison = () => {
  return (
    <DoDont title="Framework Comparison">
      <DoList title="✅ Advantages">
        <DoItem title="Great performance">
          Optimized for speed and efficiency.
        </DoItem>
      </DoList>

      <DontList title="⚠️ Considerations">
        <DontItem title="Learning curve">
          Requires time to master the concepts.
        </DontItem>
      </DontList>
    </DoDont>
  );
};

// Example using DoDontItem directly
const MyDirectUsage = () => {
  return (
    <DoDont title="Direct Usage Example">
      <DoList>
        <DoDontItem title="Good practice" isDont={false}>
          This is a positive recommendation.
        </DoDontItem>
        <DoDontItem title="Bad practice" isDont={true}>
          This is something to avoid.
        </DoDontItem>
      </DoList>
    </DoDont>
  );
};
```

## Props

### DoDont Props
Extends `SimpleGridProps` from Chakra UI.
- `children`: React.ReactNode - DoList and DontList components
- `title?`: string - Optional section title

### DoList/DontList/TradeoffList Props
Extends `VStackProps` from Chakra UI (excluding 'title').
- `title?`: string - Custom title (defaults to "✅ Best Practices" / "❌ Things that won't work" / "⚠️ Trade-offs")
- `children`: React.ReactNode - DoItem/DontItem/TradeoffItem components

### DoItem/DontItem/TradeoffItem Props
Extends `BoxProps` from Chakra UI.
- `title`: string - Bold title text
- `children`: React.ReactNode - Description content

### DoDontItem Props
Extends `BoxProps` from Chakra UI.
- `title`: string - Bold title text
- `children`: React.ReactNode - Description content
- `isDont?`: boolean - If true, uses red background (Don't), if false uses green background (Do). Default: false

## Styling

The components use consistent styling:
- **Do items**: Green background (`green.50`), green headings (`green.600`), `layerStyle="highlight"`
- **Don't items**: Red background (`red.50`), red headings (`red.600`), `layerStyle="highlight"`
- **Tradeoff items**: Orange background (`orange.50`), orange headings (`orange.600`), `layerStyle="highlight"`
- **Responsive**: Stacks vertically on mobile, side-by-side on desktop
- **Typography**: Uses theme's `textStyle="description"` for consistent text styling
- **Layout**: All items use `layerStyle="highlight"` for consistent padding and border radius

## Benefits

- **Consistency**: Standardized styling across all Do's and Don'ts sections
- **Maintainability**: Single source of truth for styling changes
- **Flexibility**: Customizable titles and content while maintaining visual consistency
- **Accessibility**: Proper semantic structure and color contrast
- **Responsive**: Works well on all screen sizes
