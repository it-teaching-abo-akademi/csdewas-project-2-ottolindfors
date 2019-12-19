const TOKEN = 'Tpk_391653b184fb45f2a8e9b1270c0306e9';
const BASE_URL = 'https://sandbox.iexapis.com/stable/stock/market/batch?';

function builder(stockSymbols, type, chartRange) {
    /*
    Builds the url for fetching stock data from api.
    - symbolsArr is an array of stock symbols as strings.
    - range is the timespan as string that should be fetched (1d, 5d, 1m, ...).
    - type is 'quote' or 'chart'
     */
    let url = BASE_URL;
    const sym = 'symbols=';
    const typ = '&types=';
    const ran = '&range=';
    const fallbackRange = '1y';
    const tok = '&token=';

    // Append symbols to the url
    url += sym;
    for (let i=0; i<stockSymbols.length; i++) {
        url += stockSymbols[i];
        // Append ',' after symbol except after last one
        if (i < stockSymbols.length - 1) {
            url += ',';
        }
    }
    // Append types to the url
    url += typ + type;
    // Append range to the url
    if (type.includes('chart')) {
        if (chartRange) { url += ran + chartRange }
        else { url += ran + fallbackRange }  // Use fallbackRange if no range was provided
    }
    // Append token to the url
    url += tok + TOKEN;

    return url;
}

export const urlBuilder = (stockSymbols, type, chartRange) => {
  return builder(stockSymbols, type, chartRange);
};
