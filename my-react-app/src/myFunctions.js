function loader(objName) {
    /*
    Loads an JSON object from local storage. Throws error if not found (data=null)
     */
    let data = JSON.parse(localStorage.getItem(objName));
    // Check if null
    if (!data) {
        throw new Error("Did not find '" + objName + "' in local storage");
    }
    return data;
}

function saver(obj, objName) {
    /*
    Saves an JSON object to local storage.
     */
    localStorage.setItem(objName, JSON.stringify(obj));
    console.log("==> Saved to local storage '" + objName + "'");
}

export function dateToChartRange(isoPurchaseDate) {
    const purchaseDate = new Date(isoPurchaseDate);
    const todayDate = new Date();
    // dayDiff = number of days since purchase date
    const dayDiff = Math.ceil((todayDate - purchaseDate) / (1000 * 60 * 60 * 24));  // Ceil ensures enough days
    const janFirst = new Date(new Date().toISOString().slice(0,4));  // new Date("2019") returns 1 Jan 2019
    // ytdDiff = number of days since january 1 this year
    const ytdDiff = Math.ceil((todayDate - janFirst) / (1000 * 60 * 60 * 24));  // Days since Jan 1 (at most 365)

    // graph range options are 5d, 1m, 3m, 6m, ytd, 1y, 2y, 5y, max
    let rangeOptionsString = ["5d", "1m", "3m", "6m", "1y", "2y", "5y"];  // options the API accept
    let rangeOptionsInt = [5, 32, 94, 168, 367, 732, 1828];  // options used for finding the correct range
    let chartRange = "";

    // Find the smallest range option that is larger than dayDiff
    let i = 0;
    let cont = true;
    while(cont) {
        if (dayDiff <= rangeOptionsInt[i]) {
            // days since purchase is less than the current range option, i.e. chartRange=rangeOptionsInt[i] is a valid choice
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

export function compareFunctionWName(a, b) {
    if (a.name < b.name) {return -1}
    if (a.name > b.name) {return 1}
    return 0;
}

export function compareFunctionWDate(a, b) {
    if (a.date < b.date) {return -1}
    if (a.date > b.date) {return 1}
    return 0;
}

export const loadFromLocalStorage = (objName) => {
  return loader(objName);
};

export const saveToLocalStorage = (obj, objName) => {
    return saver(obj, objName);
};