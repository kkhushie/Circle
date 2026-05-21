import { useEffect, useRef } from 'react';
import useAppStore from '../store/useAppStore';

const useBootstrapApp = () => {
    const bootstrapApp = useAppStore(state => state.bootstrapApp);
    const hasBootstrapped = useRef(false);

    useEffect(() => {
        if (!hasBootstrapped.current) {
            hasBootstrapped.current = true;
            bootstrapApp();
        }
    }, [bootstrapApp]);
};

export default useBootstrapApp;
