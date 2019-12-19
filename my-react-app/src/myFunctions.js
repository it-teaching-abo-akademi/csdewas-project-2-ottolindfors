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

export const loadFromLocalStorage = (objName) => {
  return loader(objName);
};