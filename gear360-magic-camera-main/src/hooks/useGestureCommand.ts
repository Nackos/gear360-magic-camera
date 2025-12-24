export const useGestureCommand = () => {
    const triggerCommand = (action: string, gestureType: string, confidence: number = 1.0) => {
        const event = new CustomEvent('gesture-command', {
            detail: {
                action,
                gesture: {
                    type: gestureType,
                    confidence,
                    timestamp: Date.now()
                }
            }
        });
        window.dispatchEvent(event);
    };

    return { triggerCommand };
};
