import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const HostelContext = createContext(null);

export function HostelProvider({ children }) {
    const { user } = useAuth();
    const [hostelSettings, setHostelSettings] = useState({
        messRate: 140, // Default fallback
        cutoffTime: 20, // Default fallback (8 PM)
        hostelName: '',
        maxLeaves: 10, // Default fallback (null = unlimited)
        leaveMode: 'full_day', // 'full_day' or 'per_meal'
        breakfastRate: 40,
        lunchRate: 50,
        dinnerRate: 50,
        loading: true,
    });

    useEffect(() => {
        const fetchHostelSettings = async () => {
            if (!user?.hostelId) {
                setHostelSettings(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('hostels')
                    .select('name, mess_rate, cutoff_time, leave_mode, breakfast_rate, lunch_rate, dinner_rate')
                    .eq('id', user.hostelId)
                    .single();

                if (error) {
                    console.error('Error fetching hostel settings:', error);
                    // Keep defaults but stop loading
                    setHostelSettings(prev => ({ ...prev, loading: false }));
                    return;
                }

                if (data) {
                    setHostelSettings({
                        messRate: data.mess_rate,
                        cutoffTime: data.cutoff_time,
                        hostelName: data.name,
                        maxLeaves: 10, // Default fallback (null = unlimited)
                        leaveMode: data.leave_mode || 'full_day',
                        breakfastRate: data.breakfast_rate ?? 40,
                        lunchRate: data.lunch_rate ?? 50,
                        dinnerRate: data.dinner_rate ?? 50,
                        loading: false,
                    });
                }
            } catch (err) {
                console.error('Unexpected error fetching hostel settings:', err);
                setHostelSettings(prev => ({ ...prev, loading: false }));
            }
        };

        fetchHostelSettings();
    }, [user?.hostelId]);

    // Function to update settings (for Admin)
    const updateSettings = async (newSettings) => {
        if (!user?.hostelId) return { success: false, error: 'No hostel ID found for user' };

        try {
            const updatePayload = {
                mess_rate: newSettings.messRate,
                cutoff_time: newSettings.cutoffTime,
            };

            // Include leave mode and per-meal rates if provided
            if (newSettings.leaveMode !== undefined) {
                updatePayload.leave_mode = newSettings.leaveMode;
            }
            if (newSettings.breakfastRate !== undefined) {
                updatePayload.breakfast_rate = newSettings.breakfastRate;
            }
            if (newSettings.lunchRate !== undefined) {
                updatePayload.lunch_rate = newSettings.lunchRate;
            }
            if (newSettings.dinnerRate !== undefined) {
                updatePayload.dinner_rate = newSettings.dinnerRate;
            }

            const { error } = await supabase
                .from('hostels')
                .update(updatePayload)
                .eq('id', user.hostelId);

            if (error) throw error;

            // Optimistically update local state
            setHostelSettings(prev => ({
                ...prev,
                messRate: newSettings.messRate,
                cutoffTime: newSettings.cutoffTime,
                ...(newSettings.leaveMode !== undefined && { leaveMode: newSettings.leaveMode }),
                ...(newSettings.breakfastRate !== undefined && { breakfastRate: newSettings.breakfastRate }),
                ...(newSettings.lunchRate !== undefined && { lunchRate: newSettings.lunchRate }),
                ...(newSettings.dinnerRate !== undefined && { dinnerRate: newSettings.dinnerRate }),
            }));

            return { success: true };
        } catch (err) {
            console.error('Error updating hostel settings:', err);
            return { success: false, error: err.message };
        }
    };

    return (
        <HostelContext.Provider value={{ ...hostelSettings, updateSettings }}>
            {children}
        </HostelContext.Provider>
    );
}

export function useHostel() {
    const context = useContext(HostelContext);
    if (!context) {
        throw new Error('useHostel must be used within a HostelProvider');
    }
    return context;
}
