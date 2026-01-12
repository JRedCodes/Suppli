# Suppli — Component Library

## Purpose of This Document
This document defines Suppli's reusable component library, component specifications, and usage guidelines.
The component library ensures consistency, reduces development time, and maintains design system integrity.

All components must be accessible, documented, and tested before use.

---

## Core Principles
1. **Reusability over duplication**
2. **Accessibility by default**
3. **Composition over configuration**
4. **Consistent API patterns**
5. **Documentation with examples**

---

## Component Architecture

### Base Components (Primitives)
Low-level, unstyled or minimally styled building blocks.

### Composite Components
Higher-level components built from primitives.

### Feature Components
Domain-specific components (order-specific, vendor-specific, etc.).

---

## Component Standards

### Required Props
All components should support:
- `className` for custom styling
- `id` for testing and accessibility
- Standard HTML attributes where applicable

### Accessibility Requirements
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes where needed

### Styling Approach
- Tailwind CSS for styling
- shadcn/ui as base component library
- CSS variables for theming
- Consistent spacing scale

---

## Core Component Catalog

### Buttons

#### Button Variants
- Primary: Main action on page/section
- Secondary: Secondary actions
- Destructive: Delete/destructive actions
- Ghost: Subtle actions
- Link: Text link styled as button

#### Button Sizes
- sm: Small buttons
- md: Default size
- lg: Large buttons

#### Button States
- Default
- Hover
- Active
- Disabled
- Loading

#### Usage Rules
- Only one primary button per view
- Destructive actions require confirmation
- Disabled buttons must explain why

#### Example
```tsx
<Button variant="primary" size="md">
  Approve Order
</Button>
```

---

### Inputs

#### Input Types
- Text
- Number
- Email
- Password
- Date
- Textarea
- Select
- Checkbox
- Radio

#### Input States
- Default
- Focus
- Error
- Disabled
- Read-only

#### Required Features
- Visible label
- Error message support
- Helper text support
- Required indicator

#### Example
```tsx
<Input
  label="Vendor Name"
  error="Vendor name is required"
  helperText="Enter the vendor's business name"
  required
/>
```

---

### Tables

#### Table Features
- Sortable columns
- Selectable rows
- Pagination
- Empty states
- Loading states

#### Accessibility
- Proper th/td structure
- Scope attributes
- Keyboard navigation
- Screen reader support

#### Example
```tsx
<Table
  columns={columns}
  data={orders}
  onSort={handleSort}
  emptyState="No orders yet"
/>
```

---

### Modals / Dialogs

#### Modal Features
- Focus trapping
- Escape key to close
- Backdrop click to close (optional)
- Size variants (sm, md, lg, full)

#### Modal Structure
- Header (title + close button)
- Body (scrollable content)
- Footer (actions)

#### Example
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Add Vendor"
>
  <ModalBody>
    {/* Form content */}
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Save
    </Button>
  </ModalFooter>
</Modal>
```

---

### Badges

#### Badge Variants
- Default: Neutral
- Success: Green
- Warning: Amber
- Error: Red
- Info: Blue

#### Badge Usage
- Status indicators
- Confidence levels
- Order status
- Count indicators

#### Example
```tsx
<Badge variant="warning">Needs Review</Badge>
```

---

### Alerts

#### Alert Variants
- Info
- Success
- Warning
- Error

#### Alert Features
- Dismissible
- Icon support
- Action buttons

#### Example
```tsx
<Alert variant="warning" dismissible>
  This order has low confidence due to limited sales data.
</Alert>
```

---

### Tabs

#### Tab Features
- Keyboard navigation
- Accessible ARIA attributes
- Controlled/uncontrolled modes

#### Example
```tsx
<Tabs>
  <TabList>
    <Tab>Overview</Tab>
    <Tab>History</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>{/* Overview content */}</TabPanel>
    <TabPanel>{/* History content */}</TabPanel>
  </TabPanels>
</Tabs>
```

---

### Tooltips

#### Tooltip Features
- Keyboard accessible
- Screen reader support
- Position variants (top, bottom, left, right)

#### Usage Rules
- Use sparingly
- Add clarity, don't repeat labels
- Keep text short

#### Example
```tsx
<Tooltip content="Sales data improves order accuracy">
  <IconButton icon={InfoIcon} />
</Tooltip>
```

---

### Dropdown Menus

#### Menu Features
- Keyboard navigation
- Screen reader support
- Submenus support
- Icons support

#### Example
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="ghost">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Loading States

#### Skeleton Loaders
- Table rows
- Cards
- Forms

#### Spinners
- Inline spinners
- Full-page loaders
- Button loading states

#### Example
```tsx
{isLoading ? (
  <SkeletonTable rows={5} />
) : (
  <Table data={orders} />
)}
```

---

### Empty States

#### Empty State Structure
- Icon or illustration
- Title
- Description
- Action button (optional)

#### Example
```tsx
<EmptyState
  icon={VendorIcon}
  title="No vendors yet"
  description="Add your first vendor to generate orders"
  action={<Button>Add Vendor</Button>}
/>
```

---

## Domain-Specific Components

### Order Components

#### OrderCard
- Order summary
- Status badge
- Quick actions

#### OrderLineItem
- Product name
- Quantity (editable)
- Confidence indicator
- Explanation

#### OrderReviewTable
- Vendor grouping
- Inline editing
- Confidence indicators

---

### Vendor Components

#### VendorCard
- Vendor name
- Ordering method
- Last order date

#### VendorForm
- Vendor creation/editing
- Ordering method selection
- Contact information

---

### Invoice Components

#### InvoiceUploader
- Drag-and-drop
- File preview
- Progress indicator

#### InvoiceComparison
- Side-by-side comparison
- Mismatch highlighting
- Resolution actions

---

## Component Documentation Standards

### Required Documentation
- Component purpose
- Props interface
- Usage examples
- Accessibility notes
- Common patterns

### Storybook (Later)
- Interactive examples
- Variant showcase
- Accessibility testing

---

## Component Testing Requirements

### Unit Tests
- Render correctly
- Handle props correctly
- State management

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes

### Visual Tests (Later)
- Visual regression testing
- Cross-browser testing

---

## Component Naming Conventions

### Naming Pattern
- PascalCase for component names
- Descriptive, not generic
- Domain prefix for feature components

### Examples
- `Button` (generic)
- `OrderCard` (domain-specific)
- `VendorForm` (domain-specific)

---

## Component Composition Patterns

### Compound Components
- Tabs (TabList + TabPanels)
- Modals (ModalHeader + ModalBody + ModalFooter)

### Render Props (When Needed)
- Flexible component composition
- Avoid overuse

### Hooks for Logic
- `useModal` for modal state
- `useForm` for form state
- `useTable` for table logic

---

## Styling Guidelines

### Tailwind Classes
- Use utility classes primarily
- Extract to components when reused
- Follow design system spacing scale

### CSS Variables
- Colors
- Spacing
- Typography
- Breakpoints

### Responsive Design
- Mobile-first approach
- Breakpoint consistency
- Touch target sizes

---

## MVP Component Priority

### Must Have
- Button
- Input
- Table
- Modal
- Badge
- Alert
- Loading states
- Empty states

### Should Have
- Tabs
- Tooltip
- Dropdown menu
- Select

### Nice to Have
- Date picker
- File uploader
- Rich text editor (if needed)

---

## Success Criteria
- Components are reusable across features
- Components are accessible
- Components are documented
- Components follow design system
- No duplicate component implementations

---

## Summary
The component library exists to:
- Ensure consistency
- Speed up development
- Maintain quality
- Enable scalability

If a component is duplicated, it should be extracted.
If a component is not accessible, it is not complete.
