import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { JobPosition, CreatePositionData, PositionFilters } from '../types/position';

export function useJobPositions(initialFilters: PositionFilters = {}) {
    const [positions, setPositions] = useState<JobPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<PositionFilters>(initialFilters);

    // Fetch positions based on filters
    const fetchPositions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.getPositions(filters);

            if (response.success && response.data) {
                setPositions(response.data);
            } else {
                setError(response.error || 'Failed to fetch positions');
            }
        } catch (err) {
            setError('An error occurred while fetching positions');
            console.error('Error fetching positions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create a new position
    const createPosition = async (data: CreatePositionData) => {
        try {
            const response = await api.createPosition(data);

            if (response.success && response.data) {
                // Prepend new position to the list
                setPositions((prev) => [response.data, ...prev]);
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.error || 'Failed to create position' };
            }
        } catch (err) {
            console.error('Error creating position:', err);
            return { success: false, error: 'An error occurred while creating position' };
        }
    };

    // Toggle position status
    const toggleStatus = async (id: string) => {
        try {
            // Optimistic update
            setPositions((prev) =>
                prev.map((pos) =>
                    pos._id === id
                        ? { ...pos, status: pos.status === 'active' ? 'paused' : 'active' }
                        : pos
                )
            );

            const response = await api.togglePositionStatus(id);

            if (response.success && response.data) {
                // Update with actual data from server
                setPositions((prev) =>
                    prev.map((pos) => (pos._id === id ? response.data : pos))
                );
                return { success: true };
            } else {
                // Revert on error
                fetchPositions();
                return { success: false, error: response.error || 'Failed to toggle status' };
            }
        } catch (err) {
            // Revert on error
            fetchPositions();
            console.error('Error toggling status:', err);
            return { success: false, error: 'An error occurred while toggling status' };
        }
    };

    // Update position
    const updatePosition = async (id: string, data: Partial<CreatePositionData>) => {
        try {
            const response = await api.updatePosition(id, data);

            if (response.success && response.data) {
                setPositions((prev) =>
                    prev.map((pos) => (pos._id === id ? response.data : pos))
                );
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.error || 'Failed to update position' };
            }
        } catch (err) {
            console.error('Error updating position:', err);
            return { success: false, error: 'An error occurred while updating position' };
        }
    };

    // Delete position
    const deletePosition = async (id: string) => {
        try {
            const response = await api.deletePosition(id);

            if (response.success) {
                setPositions((prev) => prev.filter((pos) => pos._id !== id));
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to delete position' };
            }
        } catch (err) {
            console.error('Error deleting position:', err);
            return { success: false, error: 'An error occurred while deleting position' };
        }
    };

    // Update filters
    const updateFilters = (newFilters: PositionFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    // Fetch positions when filters change
    useEffect(() => {
        fetchPositions();
    }, [filters.search, filters.department]);

    return {
        positions,
        loading,
        error,
        filters,
        updateFilters,
        createPosition,
        toggleStatus,
        updatePosition,
        deletePosition,
        refetch: fetchPositions,
    };
}
