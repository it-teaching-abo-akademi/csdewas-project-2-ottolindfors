# Content
1. [About](#about-stock-portfolio-management-system-(spms))  
2. [Run it yourself](#run-it-yourself)
# 1. About Stock Portfolio Management System (SPMS)

### What does it do?
This is a javascript app running in the web browser, built using React, for managing stock portfolios and keep track of 
their performance. The app uses the browser's local storage for saving the portfolios across sessions.  
  
Try it out: [https://it-teaching-abo-akademi.github.io/csdewas-project-2-ottolindfors/](https://it-teaching-abo-akademi.github.io/csdewas-project-2-ottolindfors/)

### Limitations

The limitations described below are more like nice features to have.

* For now only one instances of the same stock can be added to a portfolio.

* Purchase prices are not converted into EUR/USD. That would require calculating 
today's value of the currency at the purchase date and is for simplicity left out.

### Known issues
  * Chart does not refresh after a stock is added even though the state of the parent 
  component (`App` component) changes.  
    * **Workaround (for now):** Manual refresh of the page is needed by the user.  
    
  * Converting the stock values to euro and rounding them to two decimal places with 
  `.toFixed(2)` before passing the data to the rechart LineChart causes the YAxis to 
  scale incorrectly to be too short. Even forcing `<YAxis domain={[0, 'dataMax']}/>` 
  leads to a too short axis.  
    * **Solution:** Casting to number does the trick. `Number((chart[chartKey].close * euroPerUsd).toFixed(2))`
    
# 2. Run it yourself

If you want to reproduce the app yourself from scratch, the app is created using create-react-app which will
give you a template to start from. From there you can start reproducing my app yourself.

## Clone or Fork this project

Start by cloning/forking this project and add it to your local machine. 

### Requirements

The following needs to be installed if you intend to clone/fork this project:
* Node.js
* yarn

The app currently uses the IEX Cloud API so you will need an API token for that (instructions below). 
I have not implemented interfaces for fetching the data (==> swapping providers), but that could 
be a fun project to do (should not be too difficult).

### Install the packages listed in yarn.lock

Change directory into the my-react-app directory of this project. For me this is:
```
cd WebstormProjects/csdewas-project-2-ottolindfors/my-react-app
```

I am using yarn instead of npm so all dependencies for this project are listed in `yarn.lock`. 
To install the dependencies just run: 
```
yarn install
```

### IEX Cloud Token

Go to [https://iexcloud.io/](https://iexcloud.io/) and get a token for accessing their API (sign up required). Once signed
in you can very easily create a token. Refer to IEX Cloud's own instructions if you get stuck as the 
procedure may change.

Add your token to `my-react-app/src/api.js` to `row:1`  
```
const TOKEN = 'add-your-personal-token-here';
```

### Happy coding

That should be it! Now you can start playing around and improving on the code.  
Let me know if there is anything in these instructions I have missed.
