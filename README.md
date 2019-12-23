## Known issues
  * Converting the stock values to euro and rounding them to two decimal places with 
  `.toFixed(2)` before passing the data to the rechart LineChart causes the YAxis to 
  scale incorrectly to be too short. Even forcing `<YAxis domain={[0, 'dataMax']}/>` 
  leads to a too short axis.  
  **Solution:** Casting back to number seems to do the trick. 
  `Number((chart[chartKey].close * euroPerUsd).toFixed(2))`