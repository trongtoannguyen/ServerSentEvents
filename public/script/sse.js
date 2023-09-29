/**
 * @fileoverview sse.js is a client-side script that handles the event source
 * and displays the data received from the server
 * @since 2023-09-29
 * @requires Plotly
 * @requires EventSource
 * @requires /fetch
 * @requires /sse
 */
const btcData = document.getElementById("btc-data");
const ethData = document.getElementById("eth-data");
const totalBTC = document.getElementById("total-btc");
const fetchData = document.getElementById("fetch-data");

/**
 * create an event source and register event handlers
 * define route to retrieve and send data from every 1 second
 * @param {object} fetchSource - event source
 * @param {object} chartSource - event source
 */
const fetchSource = new EventSource("/fetch");
const chartSource = new EventSource("/sse");
console.log(fetchSource);

/**
 * handle data received from server
 * @param {object} receivedData - comment from server
 */
fetchSource.onmessage = (event) => {
  // parse the event data
  const body = JSON.parse(event.data).body;
  console.log(event.data);
  fetchData.innerHTML = `${body}`;
};

/**
 * difine arrays to store data
 * @param {Array<number>} xArray - timeline
 * @param {Array<number>} yArray - btcValue
 * @param {Array<number>} zArray - ethValue
 */
const xArray = [0];
const yArray = [0];
const zArray = [0];

/**
 * handle data received from server
 * @param {object} receivedData - data received from server
 * @param {number} xArrayAtFirst - first elem of xArray
 * @param {number} yArrayAtFirst - first elem of yArray
 * @param {number} zArrayAtFirst - first elem of zArray
 * @param {number} xArrayLast - last elem of xArray
 * @param {number} yArrayLast - last elem of yArray
 * @param {number} zArrayLast - last elem of zArray
 */
chartSource.onmessage = (event) => {
  const receivedData = JSON.parse(event.data);
  //get name of receivedData's object
  let data1 = Object.keys(receivedData)[0].toUpperCase();
  let data2 = Object.keys(receivedData)[1].toUpperCase();

  // remove first element of xArray and yArray and zArray
  // to keep the array length at 48
  if (xArray.length > 48) {
    xArray.shift();
    yArray.shift();
    zArray.shift();
  }

  let xArrayAtFirst = xArray[0];
  let yArrayAtFirst = yArray[0];
  let xArrayLast = xArray[xArray.length - 1];
  let yArrayLast = yArray[yArray.length - 1];
  let zArrayLast = zArray[zArray.length - 1];

  // push data to xArray and yArray and zArray
  xArray.push(xArrayLast + 1);
  yArray.push(receivedData.btc);
  zArray.push(receivedData.eth);
  console.log(yArray);

  /**
   * @param {object} trace1 - trace for Plotly
   * @param {object} trace2 - trace for Plotly
   * @param {Array<object>} data - data for Plotly
   * @param {object} layout - layout for Plotly
   */
  const trace1 = {
    x: xArray,
    y: yArray, // BTC

    type: "scatter",
    mode: "lines",
    marker: { color: "gold" },
  };
  const trace2 = {
    x: xArray,
    y: zArray, // ETH

    type: "scatter",
    mode: "lines",
    marker: { color: "blue" },
  };

  const data = [trace1, trace2];
  const layout = {
    xaxis: {
      range: [xArrayAtFirst, xArrayLast],
      title: "Timeline",
    },
    yaxis: {
      range: [yArrayAtFirst - 15, yArrayLast + 15],
      title: "Price",
    },
    title: `${data1}/${data2} Prices in 2s`,
  };

  /**
   * Display data
   * Plotly
   */

  if (receivedData.btc < yArrayLast) {
    btcData.style.color = "red";
  } else {
    btcData.style.color = "green";
  }
  if (receivedData.eth < zArrayLast) {
    ethData.style.color = "red";
  } else {
    ethData.style.color = "green";
  }

  btcData.innerHTML = `BTC price: ${receivedData.btc}`;
  ethData.innerHTML = `ETH price: ${receivedData.eth}`;
  Plotly.newPlot("myPlot", data, layout);
};
