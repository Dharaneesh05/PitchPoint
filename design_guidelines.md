# Cricket Web Application Design Guidelines

## Design Approach
**Selected Approach**: Design System (Material Design inspired) with sports application optimizations
**Justification**: The cricket application requires data-heavy displays, dashboard functionality, and role-based interfaces prioritizing clarity and usability over visual flair.

## Core Design Elements

### A. Color Palette
**Primary Colors**:
- Light mode: 142 69% 58% (Cricket green)
- Dark mode: 142 45% 35%

**Secondary Colors**:
- Light mode: 220 13% 18% (Charcoal)
- Dark mode: 220 13% 85%

**Accent Colors**:
- Success: 120 61% 50%
- Warning: 38 92% 50%
- Error: 0 84% 60%

**Background Colors**:
- Light mode: 0 0% 98% (Off-white)
- Dark mode: 220 13% 8%

### B. Typography
**Font Families**:
- Primary: Inter (Google Fonts) - Clean, readable for dashboards
- Secondary: JetBrains Mono - For statistics and data displays

**Font Hierarchy**:
- Headings: 600-700 weight
- Body text: 400 weight
- Data/Statistics: 500 weight (JetBrains Mono)

### C. Layout System
**Spacing Units**: Consistent use of Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: m-8, m-12
- Card spacing: gap-4, gap-6

### D. Component Library

**Navigation**:
- Sidebar navigation with role-based menu items
- Top header with user profile and notifications
- Breadcrumb navigation for deep pages

**Dashboard Cards**:
- Clean white/dark cards with subtle shadows
- Rounded corners (rounded-lg)
- Consistent internal padding (p-6)

**Data Displays**:
- Tables with alternating row colors
- Progress bars for performance metrics
- Badge system for player roles and match status

**Forms**:
- Consistent form styling with focus states
- Input groups for related data
- Validation feedback with clear error states

**Charts & Visualizations**:
- Muted color schemes for data clarity
- Consistent tooltip styling
- Interactive legends and filters

### E. Animations
**Minimal Animation Strategy**:
- Subtle fade-ins for page transitions (300ms)
- Hover states on interactive elements
- Loading spinners for data fetching
- NO complex animations or distracting effects

## Visual Treatment

**Background Strategy**:
- Clean solid backgrounds with subtle texture
- Card-based layouts with elevation
- Generous whitespace for readability

**Contrast & Hierarchy**:
- High contrast for text readability
- Clear visual hierarchy through typography scale
- Strategic use of color to highlight important data

**Responsive Design**:
- Mobile-first approach
- Collapsible sidebar on mobile
- Stacked cards on smaller screens
- Touch-friendly interactive elements

## Images
**No large hero images** - This is a data-focused application prioritizing functionality.

**Image Usage**:
- Small profile pictures (rounded avatars)
- Team logos (32x32px, 64x64px variants)
- Player photos in cards (if available)
- Cricket field diagrams for tactical analysis

**Image Placement**:
- Profile pictures in headers and user cards
- Team logos in match cards and tables
- Player photos in selection interfaces
- All images should have proper alt text and loading states

## Key Design Principles
1. **Data First**: Information hierarchy prioritizes cricket statistics and performance data
2. **Role Clarity**: Visual differentiation between Coach, Analyst, and Fan interfaces
3. **Professional Aesthetic**: Clean, business-like appearance suitable for professional cricket analysis
4. **Accessibility**: High contrast ratios, keyboard navigation, screen reader support
5. **Performance**: Fast loading with optimized images and minimal animations

This design system creates a professional, data-focused cricket application that prioritizes usability and clear information presentation over visual spectacle.