import { useState, useEffect } from 'react';
import service from '../service';

export default function useCreateSession() {
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);

    const createSession = async () => {
        setLoading(true);
        try {
            const res = await service.createSession('travel_agent', 'user');
            setSessionId(res.id);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        createSession();
    }, []);

    return { loading, sessionId };
}
