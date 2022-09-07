import { useState, useEffect, useCallback, useRef, useContext, useId } from "react";

type AsyncFn<T, K> = (data: T) => Promise<K>;

interface IDataSync<Data extends { id: string }, NewData, UpdateParams, DeleteParams, QueryData> {
    getter: AsyncFn<QueryData | undefined, Data[]>
    creator: AsyncFn<NewData, unknown>
    updater?: AsyncFn<UpdateParams, unknown>
    deleter?: AsyncFn<DeleteParams, unknown>,
    getterParams?: QueryData;
    fetchOnLoad?: boolean;
    optimistic?: boolean;
}
const useDataSync = <Data extends { id: string }, NewData extends {}, UpdateParams extends { id: string }, DeleteParams extends { id: string }, QueryData = {}>({
    getter,
    creator,
    updater,
    deleter,
    getterParams,
    fetchOnLoad = false,
    optimistic = false,
}: IDataSync<Data, NewData, UpdateParams, DeleteParams, QueryData>) => {
    const [data, setData] = useState<Data[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>();
    const [invalidated, setInvalidated] = useState(false);
    const [stagingData, setStagingData] = useState<NewData | null>();
    const [updateStagingData, setUpdateStagingData] = useState<UpdateParams | null>();
    const [deleteStagingData, setDeleteStagingData] = useState<DeleteParams | null>();

    const newItemId = useId();
    const createTempDatum = <T>(item: T) => ({
        ...item,
        id: newItemId,
    });
    const _sendData = useCallback(async () => {
        setLoading(true);
        if (!stagingData) {
            setLoading(false);
            return;
        };
        try {
            await creator(stagingData);
            setError(null);
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false);
            setStagingData(null);
            setInvalidated(true);
        }
    }, [stagingData])

    const sendData = useCallback((data: NewData) => {
        setStagingData(data);
        setData(prev => optimistic ? ([...prev, createTempDatum(data)] as Data[]) : prev);
    }, [optimistic]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getter(getterParams);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false);
            setInvalidated(false);
        }
    }, [getterParams]);

    const _updateData = useCallback(async (data: UpdateParams) => {
        setLoading(true);
        if (!updater) {
            setLoading(false)
            return;
        };
        try {
            await updater(data);
            setError(null)
        } catch (err) {
            setError(err)
        } finally {
            setInvalidated(true);
            setLoading(false);
            setUpdateStagingData(null);
        }
    }, [updater])

    const updateData = useCallback(async (data: UpdateParams) => {
        setUpdateStagingData(data);
        setData(prev => optimistic ? prev.map((item => {
            if (item.id === data.id) {
                return {
                    ...item,
                    ...data,
                }
            }
            return item
        })) : prev);
    }, [])

    const _deleteData = useCallback(async (data: DeleteParams) => {
        setLoading(true);
        if (!deleter) {
            setLoading(false)
            return;
        };
        try {
            await deleter(data);
            setError(null)
        } catch (err) {
            setError(err)
        } finally {
            setInvalidated(true);
            setLoading(false);
            setDeleteStagingData(null);
        }

    }, [deleter])

    const deleteData = useCallback((data: DeleteParams) => {
        setData(prev => optimistic ? prev?.filter(item => item.id !== data?.id) : prev);
        setDeleteStagingData(data);
    }, [optimistic]);

    useEffect(() => {
        const refetchData = async () => {
            setLoading(true);
            try {
                const result = await getter(getterParams);
                setData(result);
                setError(null);
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false);
                setInvalidated(false);
            }
        }
        if (invalidated && !loading) {
            refetchData();
        }

        return () => {
            setInvalidated(false)
        }
    }, [invalidated, fetchOnLoad])

    useEffect(() => {
        if (fetchOnLoad) {
            fetchData();
        }
    }, [fetchOnLoad, fetchData]);

    useEffect(() => {
        const handleStagingData = async () => {
            await _sendData();
        }

        if (stagingData) {
            handleStagingData();
        }
    }, [stagingData]);

    useEffect(() => {
        const handleUpdateStagingData = async (data: UpdateParams) => {
            await _updateData(data);
        }

        if (updateStagingData) {
            handleUpdateStagingData(updateStagingData);
        }
    }, [updateStagingData]);

    useEffect(() => {
        const handleUpdateDeleteData = async (data: DeleteParams) => {
            await _deleteData(data);
        }

        if (deleteStagingData) {
            handleUpdateDeleteData(deleteStagingData);
        }
    }, [deleteStagingData]);

    return {
        data,
        sendData,
        refetch: fetchData,
        deleteData,
        updateData,
        loading,
        error,
    }
}

export default useDataSync;