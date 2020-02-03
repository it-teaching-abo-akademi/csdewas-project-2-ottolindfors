/*
Loads an JSON object from local storage. Throws error if not found (data=null)
 */
function loader(objName) {
    // Get JSON from local storage
    let data = JSON.parse(localStorage.getItem(objName));
    // Check if null
    if (!data) {
        throw new Error("Did not find '" + objName + "' in local storage");
    }
    return data;
}
export const loadFromLocalStorage = (objName) => {
    return loader(objName);
};

/*
Saves object as JSON to local storage.
 */
function saver(obj, objName) {
    localStorage.setItem(objName, JSON.stringify(obj));
    console.log("==> Saved to local storage '" + objName + "'");
}
export const saveToLocalStorage = (obj, objName) => {
    return saver(obj, objName);
};

/*
Calculate a chart range (that the IEXCloud API accepts) from iso date String.
Takes as input an iso date.
Returns a chart range as String.
 */
export function dateToChartRange(isoPurchaseDate) {
    const purchaseDate = new Date(isoPurchaseDate);
    const todayDate = new Date();
    // dayDiff = number of days since purchase date
    const dayDiff = Math.ceil((todayDate - purchaseDate) / (1000 * 60 * 60 * 24));  // Ceil ensures enough days
    // janFirst = 1 Jan this year
    const janFirst = new Date(new Date().toISOString().slice(0,4));  // new Date("2019") returns 1 Jan 2019
    // ytdDiff = number of days since january 1 this year
    const ytdDiff = Math.ceil((todayDate - janFirst) / (1000 * 60 * 60 * 24));  // Days since Jan 1 (at most 365)

    // graph range options are 5d, 1m, 3m, 6m, 1y, 2y, 5y, max, ytd
    let rangeOptionsString = ["5d", "1m", "3m", "6m", "1y", "2y", "5y"];  // options the API accept
    let rangeOptionsInt = [5, 32, 94, 168, 367, 732, 1828];  // number of days corresponding to the range options
    let chartRange = "";  // The range that will be returned

    // Find the smallest range option that is larger than dayDiff (the minimum needed range)
    // Compare the elements in rangeOptionsInt one by one (smallest to largest) until one that is larger than the needed range (dayDiff) is found
    let i = 0;  // used as array index
    let cont = true;
    while(cont) {
        // Test if current range option is larger than the minimum needed range (dayDiff)
        if (dayDiff <= rangeOptionsInt[i]) {
            // Days since purchase is less than the current range option, i.e. chartRange=rangeOptionsInt[i] is a valid choice
            if (ytdDiff >= dayDiff && ytdDiff <= rangeOptionsInt[i]) {
                // When possible prefer ytd over fixed range rangeOptionsInt[i]
                chartRange = "ytd";
            } else {
                // The API requires rangeOptionsString[i] instead of rangeOptionsInt[i]
                chartRange = rangeOptionsString[i];
            }
            // Stop searching
            cont = false;
        } else {
            // days since purchase is more than the current range option
            if (i === rangeOptionsInt.length) {
                // The range options are not enough. A greater range is needed
                chartRange = "max";
                // Stop searching
                cont = false;
            }
        }
        // continue to next element in rangeOptionsInt and rangeOptionsString
        i++;
    }

    return chartRange;
}

/*
Compare two elements.
 */
export function compareFunctionWName(a, b) {
    if (a.name < b.name) {return -1}
    if (a.name > b.name) {return 1}
    return 0;
}

/*
Compare two elements.
 */
export function compareFunctionWDate(a, b) {
    if (a.date < b.date) {return -1}
    if (a.date > b.date) {return 1}
    return 0;
}

