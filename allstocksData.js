
export const stocksStatsData = async () =>{
    const url = 'https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata';
    try {
        const response = await fetch(url, {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

export const stocksData = async () =>{
    const url = 'https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata';
    try {
        const response = await fetch(url, {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

export const stocksProfileData = async () =>{
    const url = 'https://stocksapi-uhe1.onrender.com/api/stocks/getstocksprofiledata';
    try {
        const response = await fetch(url, {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}



