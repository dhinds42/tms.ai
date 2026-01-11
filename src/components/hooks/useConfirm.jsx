import { useState } from 'react';
import { ConfirmationModal } from '@/components/modals';

/**
 * Hook for programmatic confirmation dialogs
 * Replaces native window.confirm() with accessible modal
 * 
 * Usage:
 * const { confirm, ConfirmDialog } = useConfirm();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     description: 'Are you sure?',
 *     confirmText: 'Delete',
 *     variant: 'destructive'
 *   });
 *   if (confirmed) {
 *     // proceed with action
 *   }
 * };
 * 
 * return (
 *   <>
 *     {ConfirmDialog}
 *     <Button onClick={handleDelete}>Delete</Button>
 *   </>
 * );
 */
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState(null);
  
  const confirm = (config) => {
    return new Promise((resolve) => {
      setConfirmState({ ...config, resolve });
    });
  };
  
  const ConfirmDialog = confirmState ? (
    <ConfirmationModal
      isOpen={true}
      onClose={() => {
        confirmState.resolve(false);
        setConfirmState(null);
      }}
      onConfirm={() => {
        confirmState.resolve(true);
        setConfirmState(null);
      }}
      title={confirmState.title}
      description={confirmState.description}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      variant={confirmState.variant}
    />
  ) : null;
  
  return { confirm, ConfirmDialog };
};