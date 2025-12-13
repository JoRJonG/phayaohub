/**
 * ป้องกันการใช้งาน DevTools และการดู Source Code
 * ⚠️ หมายเหตุ: การป้องกันนี้ไม่สามารถป้องกันได้ 100% 
 * แต่จะทำให้ยากต่อการดู source code สำหรับผู้ใช้ทั่วไป
 */

export const disableDevTools = () => {
    // ตรวจสอบว่าอยู่ใน production mode หรือไม่
    if (import.meta.env.MODE !== 'production') {
        return;
    }

    // 1. ป้องกันการเปิด DevTools ด้วย keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+I (Windows/Linux) หรือ Cmd+Option+I (Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+J (Windows/Linux) หรือ Cmd+Option+J (Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+C (Windows/Linux) หรือ Cmd+Option+C (Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }

        // Ctrl+U (View Source)
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            return false;
        }
    });

    // 2. ป้องกันการคลิกขวา (Right Click)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // 3. ตรวจจับการเปิด DevTools โดยการวัดความกว้างของ console
    const detectDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;

        if (widthThreshold || heightThreshold) {
            // DevTools ถูกเปิด - redirect หรือแสดง warning
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1>⚠️ กรุณาปิด Developer Tools</h1></div>';
        }
    };

    // 4. ตรวจจับการเปิด DevTools ด้วย debugger statement
    const detectDevToolsDebugger = () => {
        const start = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const end = performance.now();

        // ถ้าใช้เวลานานกว่า 100ms แสดงว่า DevTools เปิดอยู่
        if (end - start > 100) {
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1>⚠️ กรุณาปิด Developer Tools</h1></div>';
        }
    };

    // เรียกใช้งานการตรวจจับทุกๆ 1 วินาที
    setInterval(detectDevTools, 1000);
    setInterval(detectDevToolsDebugger, 1000);

    // 5. ป้องกันการ select text (optional - อาจรบกวน UX)
    // document.addEventListener('selectstart', (e) => {
    //   e.preventDefault();
    //   return false;
    // });

    // 6. ป้องกันการ copy (optional - อาจรบกวน UX)
    // document.addEventListener('copy', (e) => {
    //   e.preventDefault();
    //   return false;
    // });

    // 7. Clear console ทุกๆ 100ms
    setInterval(() => {
        console.clear();
    }, 100);

    // 8. Override console methods
    const noop = () => { };
    Object.keys(console).forEach((key) => {
        // @ts-ignore
        console[key] = noop;
    });
};
