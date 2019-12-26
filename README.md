## A note on the functionality
1. This app fetches purchase prices via an API. Note that this is not really useful as 
stocks are often bought at a different value than the closing value at the day of purchase.
Also, there is often a broker's fee involved when buying stocks. And further, this app
currently only supports purchase prices in USD.   
In a later update the functionality of manually entering purchase prices will be added.

2. A user can add multiple instances of the same stock to a portfolio. This is useful when
one has bought multiple shares of the same stock at different dates.

3. Due to local storage limitations only the history since the purchase date is fetched 
for the graph.  
In a future update the fetched data will be cleaned for a much smaller footprint. Also 
history that goes further back than purchase date will be fetched on demand (as needed)
from the API and not stored to local storage.

## Known issues
  * Converting the stock values to euro and rounding them to two decimal places with 
  `.toFixed(2)` before passing the data to the rechart LineChart causes the YAxis to 
  scale incorrectly to be too short. Even forcing `<YAxis domain={[0, 'dataMax']}/>` 
  leads to a too short axis.  
  **Solution:** Casting to number seems to do the trick. 
  `Number((chart[chartKey].close * euroPerUsd).toFixed(2))`