import React, {useState, useCallback, createContext, useRef, useEffect, useContext, createRef} from 'react';

interface IDataContext {
    cache?: Map<string, any>,
    updateCache: (key: string, data?: any) => void;
    getCachedValue: (key: string) => any;
}

interface IDataContextWrapper {
    children: React.ReactNode;
}

export const dataContext = createContext<IDataContext>({
    cache: new Map<string, any>(),
    updateCache: () => {},
    getCachedValue: () => {},
});

const {Provider} = dataContext;

const cache = createRef<Map<string, any>>();
const DataContextProvider = ({children}: IDataContextWrapper) => {
    const cacheRef = useRef<Map<string, any>>();

    const updateCache = (key: string, data: any) => {
        cache.current?.set(key, data);
    }

    const getCachedValue = (key: string) => {
        return cache.current?.get(key);
    }

    if(!cacheRef.current){
        cacheRef.current = new Map();
    }

    return (
        <Provider value={{cache: cacheRef.current, updateCache, getCachedValue}}>{children}</Provider>
    )
}

export default DataContextProvider