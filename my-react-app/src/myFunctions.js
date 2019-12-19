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
}

export const loadFromLocalStorage = (objName) => {
  return loader(objName);
};

export const saveToLocalStorage = (obj, objName) => {
    return saver(obj, objName);
};