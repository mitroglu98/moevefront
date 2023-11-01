export const fetchData = async (url, method = 'GET', body = null) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not fetch data.');
    }

    if (method === 'DELETE' || response.status === 204) {
        return null;
    }
    
    return await response.json();
};

