const btcData = document.getElementById("btc-data");
const ethData = document.getElementById("eth-data");
const totalBTC = document.getElementById("total-btc");
const fetchData = document.getElementById("fetch-data");

/**
 * url https://jsonplaceholder.typicode.com/todos/
 * define route to retrieve and send data from every 1 second
 */
const fetchSource = new EventSource("/fetch");
fetchSource.onmessage = (event) => {
  // parse the event data
  const receivedData = JSON.parse(event.data);
  console.log(event.data);
  console.log(receivedData);
  fetchData.innerHTML = `${receivedData.body}`;
};

// Create a new EventSource and set the URL to '/sse' on the current host.
const chartSource = new EventSource("/sse");
/**
 * Display using Plotly
 * xArray for timeline
 * yArray for btc value
 * zArray for eth value
 * @type {Array<string>}
 * @param {Array<number>} xArray - timeline
 * @param {Array<number>} yArray - value
 * @param {Array<number>} zArray - value
 */
const xArray = [0];
const yArray = [0];
const zArray = [0];

chartSource.onmessage = (event) => {
  const receivedData = JSON.parse(event.data);
  /**
   * @param {number} xArrayAtFirst - first elem of xArray
   * @param {number} yArrayAtFirst - first elem of yArray
   * @param {number} zArrayAtFirst - first elem of zArray
   * @param {number} xArrayLast - last elem of xArray
   * @param {number} yArrayLast - last elem of yArray
   * @param {number} zArrayLast - last elem of zArray
   * remove first element of xArray and yArray and zArray
   */
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

  // display data
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
  /**
   * @param {Array<object>} data - data for Plotly
   * @param {object} trace1 - trace for Plotly
   * @param {object} trace2 - trace for Plotly
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
  /**
   * @param {object} layout - layout for Plotly
   */
  const layout = {
    xaxis: {
      range: [xArrayAtFirst, xArrayLast],
      title: "Timeline",
    },
    yaxis: {
      range: [yArrayAtFirst - 15, yArrayLast + 15],
      title: "Price",
    },
    title: "BTC Prices in 2s",
  };

  /**
   * Plotly
   */
  Plotly.newPlot("myPlot", data, layout);
};
