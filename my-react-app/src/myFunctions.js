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
    const dayDiff = Math.ceil((todayDate - purchaseDate) / (1000 * 60 * 60 * 24));  // Ceil ensures enough days
    const janFirst = new Date(new Date().toISOString().slice(0,4));  // new Date("2019") returns 1 Jan 2019
    const ytdDiff = Math.ceil((todayDate - janFirst) / (1000 * 60 * 60 * 24));  // Days since Jan 1 (at most 365)


    // graphRange options are 5d, 1m, 3m, 6m, ytd, 1y, 2y, 5y, max
    let chartRange = "";

    if (dayDiff < 5) {
        // 5 days is enough
        chartRange = "5d";
        if (ytdDiff < 5) {chartRange = "ytd"}
    }
    else if (dayDiff < 32) {
        // 1 month is enough
        chartRange = "1m";
        if (ytdDiff < 32) {chartRange = "ytd"}
    }
    else if (dayDiff < 94) {
        // 3 months is enough
        chartRange = "3m";
        if (ytdDiff < 94) {chartRange = "ytd"}
    }
    else if (dayDiff< 168) {
        chartRange = "6m";
        if (ytdDiff < 168) {chartRange = "ytd"}
    }
    else if (dayDiff < 367) {
        chartRange = "1y";
        if (ytdDiff < 367) {chartRange = "ytd"}
    }
    else if (dayDiff < 732) {
        chartRange = "2y";
    }
    else if (dayDiff < 1828) {
        chartRange = "5y";
    }
    else {
        chartRange = "max"
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