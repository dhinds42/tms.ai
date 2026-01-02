
/**
 * TMS.ai Design System
 * 
 * Centralized export for all design system components
 * Import from: @/components/design-system
 */

export { default as PageHeader } from './PageHeader';
export { PrimaryButton, SecondaryButton, DestructiveButton, SuccessButton } from './StandardButton';
export { default as StandardTabs, TabsContent } from './StandardTabs';
export { default as EmptyState } from './EmptyState';
export { SkeletonCard, SkeletonTable, SkeletonForm, PageLoader } from './SkeletonLoader';
export { default as FormField, TextFormField, TextareaFormField, SelectFormField } from './FormField';
export { default as SectionCard } from './SectionCard';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as StatusBadge } from './StatusBadge';
export { showToast, ToastProvider } from './Toast';

/**
 * USAGE EXAMPLES:
 * 
 * import { PageHeader, PrimaryButton, EmptyState } from '@/components/design-system';
 * 
 * <PageHeader
 *   title="Carriers"
 *   subtitle="Manage carrier relationships"
 *   icon={Truck}
 *   primaryAction={{ label: 'Create Carrier', onClick: handleCreate }}
 *   secondaryActions={[
 *     { label: 'Export', onClick: handleExport, icon: Download },
 *     { label: 'Import', onClick: handleImport, icon: Upload }
 *   ]}
 * />
 */
