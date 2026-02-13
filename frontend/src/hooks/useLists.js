import { useState, useCallback } from 'react';
import { listApi } from '../api/listApi.js';

export const useLists = () => {
    const [lists, setLists] = useState([]);
    const [currentList, setCurrentList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUserLists = useCallback(async (userId) => {
        setLoading(true);
        try {
            const response = await listApi.getUserLists(userId);
            setLists(response.data); // Backend: res.json(lists) -> response is array
            // Wait, list controller: res.json(lists).
            // So response IS the array.
            setLists(response);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchListById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await listApi.getListById(id);
            setCurrentList(response.data); // Backend: res.json({ success: true, data: list }) -> response.data
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createList = async (data) => {
        setLoading(true);
        try {
            const result = await listApi.createList(data);
            setLists(prev => [result.data, ...prev]);
            return result.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateList = async (id, data) => {
        setLoading(true);
        try {
            const result = await listApi.updateList(id, data);
            setCurrentList(result.data);
            setLists(prev => prev.map(l => l.id === id ? result.data : l));
            return result.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteList = async (id) => {
        setLoading(true);
        try {
            await listApi.deleteList(id);
            setLists(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addGameToList = async (listId, data) => {
        setLoading(true);
        try {
            const result = await listApi.addGameToList(listId, data);
            if (currentList && currentList.id === listId) {
                // Optimistically update current list items
                const newItem = result.data;
                setCurrentList(prev => ({
                    ...prev,
                    items: [...(prev.items || []), newItem]
                }));
            }
            return result.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeGameFromList = async (listId, gameId) => {
        setLoading(true);
        try {
            await listApi.removeGameFromList(listId, gameId);
            if (currentList && currentList.id === listId) {
                setCurrentList(prev => ({
                    ...prev,
                    items: prev.items.filter(item => item.gameId !== gameId)
                }));
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        lists,
        currentList,
        loading,
        error,
        fetchUserLists,
        fetchListById,
        createList,
        updateList,
        deleteList,
        addGameToList,
        removeGameFromList
    };
};
