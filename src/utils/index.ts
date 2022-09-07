type NiceRequestInit<T = {}> = Omit<RequestInit, 'body'> & { body?: T }

export const fetchData = async (input: RequestInfo | URL, init?: NiceRequestInit) => {

    const config: RequestInit = {
        ...init,
        body: init?.body ? JSON.stringify(init.body) : undefined,
        headers: {
            'Content-Type': 'application/json',
        }
    }
    console.log(config);
    const result = await fetch(input, config);
    const data = await result.json();
    return data
}