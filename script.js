import { stocksData,stocksProfileData,stocksStatsData } from "./allstocksData.js";

let stocksDataResponse, stocksProfileDataResponse, stocksStatsDataResponse;
let stockId = "AAPL";
let stockChartCanvasInstance;

// function to load the stock data
async function fetchAllData(status){
    // const mainBody 
    stocksDataResponse = await stocksData();
    stocksProfileDataResponse = await stocksProfileData();
    stocksStatsDataResponse = await stocksStatsData();
    console.log("data Fetched");
    // using conditionals to load the initial render status
    if(!status){
        document.getElementById("loader").style.display = "none"
        document.getElementById("mainBody").style.display = "flex";
    }
}
fetchAllData().then(
    renderAllElements
);

// creating function to render all component
function renderAllElements(stockName){
    stockName = (stockName)? stockName : stockId;
    renderStockProfileInformation(stockName);
    renderStockStatus(stockName);
    renderSimilerStocksStatus();
    renderChartCanvas();
    
    // update data every 10 sc
    setInterval(()=>{
        fetchAllData("postInitial");
    },10000)
}




///////////////////         All rendaring function                           


//   Render Stock Profile information 


function renderStockProfileInformation(stockName){
    const stockDescriptionE = document.getElementById("stockDescription");
    stockDescriptionE.innerHTML = "";
    let description = (stocksProfileDataResponse && 
                        stocksProfileDataResponse.stocksProfileData && 
                        stocksProfileDataResponse.stocksProfileData[0]) ? stocksProfileDataResponse.stocksProfileData[0][stockName].summary : "";
    stockDescriptionE.innerText = description;
}

/***********---- render stock status --- *******************/


function renderStockStatus(stockName){
    const stockNameE = document.getElementById("stockName");
    const stockGrothE = document.getElementById("stockGroth");
    const stockPriceE = document.getElementById("stockPrice");

    stockNameE.innerHTML = stockName;
    let oStatusData = (stocksStatsDataResponse && 
                        stocksStatsDataResponse.stocksStatsData &&
                        stocksStatsDataResponse.stocksStatsData[0])?
                        stocksStatsDataResponse.stocksStatsData[0][stockName] : 
                        {
                            "bookValue": "0.00",
                            "profit": "0.00"
                        };
    let className = (!(oStatusData.profit == 0))? "profiteSign" : "lossSign";
    stockGrothE.innerHTML = ((oStatusData.profit == 0)? "0.000" : oStatusData.profit )+ "%";
    stockGrothE.className = className
    stockPriceE.innerHTML = "$"+ oStatusData.bookValue;
}

/******************* --- render similar stock status --- ******************************/

function renderSimilerStocksStatus(){
    const similarStocks = document.getElementById("similarStocks");
    similarStocks.innerHTML = "";


    if(!(stocksStatsDataResponse && 
        stocksStatsDataResponse.stocksStatsData &&
        stocksStatsDataResponse.stocksStatsData[0])
    )
        return;
    let stockStats = stocksStatsDataResponse.stocksStatsData[0];

    for (const [key, value] of Object.entries(stockStats)) {
        if(key == "_id")
            continue;

        const stocksShortStatus = document.createElement("div");
        stocksShortStatus.className = "stocksShortStatus";

        const button = document.createElement("button");
        button.className = "otherStockName";
        button.innerHTML = key;
        button.addEventListener("click",()=> {
            stockId = key;
            renderStockProfileInformation(stockId);
            renderStockStatus(stockId);
            renderChartCanvas(stockId);
        })
        stocksShortStatus.appendChild(button);

        const stockePrice = document.createElement("span");
        stockePrice.className = "otherStockprice";
        stockePrice.innerHTML = `$${(value.bookValue)? value.bookValue.toFixed(3): "0.000"}`;
        stocksShortStatus.appendChild(stockePrice);

        const growth = document.createElement("span");
        growth.classList.add("otherGroth");
        let className = (!(value.profit == 0))? "profiteSign" : "lossSign";
        growth.classList.add(className);
        growth.innerHTML = value.profit.toFixed(2) + "%";
        stocksShortStatus.appendChild(growth);

        similarStocks.appendChild(stocksShortStatus);
    }
    
}

/*********************** --- render graph --- ***********************************/
function renderChartCanvas(stockName,timeRange){
    let canvas = document.getElementById('stockChart');
    var ctx = canvas.getContext('2d');
    if (stockChartCanvasInstance) {
        stockChartCanvasInstance.destroy(); // Destroy the existing chart instance
    }

    stockName = (stockName)? stockName : stockId;
    timeRange = (timeRange)? timeRange : "1mo";

    if(!(stocksDataResponse && stocksDataResponse.stocksData[0]))
        return;

    let currentStockData = stocksDataResponse.stocksData[0][stockName][timeRange];
    let timeStamps = currentStockData.timeStamp.map(time => new Date(time * 1000).toLocaleDateString());
    let stockData = {
        labels: timeStamps, // X-axis labels (time)
        datasets: [{
            label: 'Stock Price',
            data: [...currentStockData.value], // Stock prices
            borderColor: 'rgba(75, 192, 192, 1)', // Line color
            borderWidth: 2, // Line thickness
            fill: false, // Fill the area under the line
            tension: 0.1, // Line tension (smoothness)
            pointRadius: 0 // Hide the circles on peaks
        }]
    };

    // Calculate min and max for y-axis range
    var yMin = Math.min(...currentStockData.value) - 1;
    var yMax = Math.max(...currentStockData.value) + 1;

    // Configuration options
    var config = {
        type: 'line', 
        data: stockData,
        options: {
            responsive: false,
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false,
                    beginAtZero: false, 
                    min: yMin, // Set min value for y-axis
                    max: yMax // Set max value for y-axis
                }
            },
             plugins: {
                legend: {
                    display: false,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const data = context.dataset.data;
                            const max = Math.max(...data);
                            const min = Math.min(...data);
                            if(context && context.chart && context.chart._lastEvent && context.chart._lastEvent.x)
                                renderVarticalLine(context.chart._lastEvent.x);
                            return [
                                `Price: ${context.raw}`,
                                `Max: ${max}`,
                                `Min: ${min}`
                            ];
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            hover: {
                mode: 'nearest',
                intersect: false
            }
        }
    };
    
    stockChartCanvasInstance = new Chart(ctx, config);
    

    function renderVarticalLine(x){
        const xAxisLabel = document.getElementById("xAxisLabel");
        xAxisLabel.style.display = 'block';
        xAxisLabel.style.left = `${x}px`;
        setTimeout( () => {
            let xAxisLabel = document.getElementById("xAxisLabel");
            xAxisLabel.style.display = 'none';
        },1000)
    }

}


/******************************             Event function   **********************************/


let allBtns = ["1mo","3mo","1y","5y"]
allBtns.forEach(key => {
    const btn = document.getElementById(key)
    btn.addEventListener("click", () => {
        onTimeStampChange(key)
    })
});

export function onTimeStampChange(timeRange){
    renderChartCanvas(stockId,timeRange);    
}






