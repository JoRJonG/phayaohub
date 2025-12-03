import { useEffect } from 'react';

/**
 * Hook to prevent accidental page refreshes or closing the tab.
 * @param shouldPrevent - Boolean to determine if the prevention should be active.
 * @param message - Custom message (note: modern browsers may not display this message).
 */
export const usePreventRefresh = (shouldPrevent: boolean = true, message: string = 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก คุณแน่ใจหรือไม่ว่าต้องการออกจากหน้านี้?') => {
    useEffect(() => {
        if (!shouldPrevent) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = message;
            return message;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [shouldPrevent, message]);
};
