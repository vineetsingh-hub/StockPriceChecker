import React, { useState, useEffect } from "react";
import axios from "axios";

// Add the line here
const API_KEY = "CHGW1YQL0CGK4F60";
const API_URL = "https://www.alphavantage.co/query";
const CURRENCY_API_URL = "https://api.exchangerate-api.com/v4/latest/USD";

// Add the line here
const Symbol_Response = { Information: 'Thank you for using Alpha Vantage! Our standard AP…emium/ to instantly remove all daily rate limits.'}

interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const exampleCompanyNames = [
  "Apple Inc.",
  "Microsoft Corporation",
  "Amazon.com Inc.",
  "Alphabet Inc.",
  "Facebook Inc.",
];

const App: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>("");
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [currencyRates, setCurrencyRates] = useState<{ [key: string]: number }>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCurrencyRates();
  }, []);

  const fetchCurrencyRates = async () => {
    try {
      const response = await axios.get(CURRENCY_API_URL);
      setCurrencyRates(response.data.rates);
    } catch (error) {
      console.error("Error fetching currency rates:", error);
    }
  };

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const symbolResponse = await axios.get(API_URL, {
        params: {
          function: "SYMBOL_SEARCH",
          keywords: companyName,
          apikey: API_KEY,
        },
      });

      console.log("Symbol Response:", symbolResponse.data);

      const symbol = symbolResponse.data.bestMatches[0]?.["1. symbol"];
      if (!symbol) {
        throw new Error("No matching symbol found");
      }

      const priceResponse = await axios.get(API_URL, {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: symbol,
          apikey: API_KEY,
        },
      });

      console.log("Price Response:", priceResponse.data);

      const data: StockData[] = [];

      for (const date in priceResponse.data["Time Series (Daily)"]) {
        const stockInfo = priceResponse.data["Time Series (Daily)"][date];
        data.push({
          date,
          open: parseFloat(stockInfo["1. open"]),
          high: parseFloat(stockInfo["2. high"]),
          low: parseFloat(stockInfo["3. low"]),
          close: parseFloat(stockInfo["4. close"]),
          volume: parseFloat(stockInfo["5. volume"]),
        });
      }

      console.log("Stock Data:", data);

      // Extract only the latest 10 entries
      setStockData(data.slice(0, 10));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleSelect = (selectedCompany: string) => {
    setCompanyName(selectedCompany);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
  };

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        backgroundColor: "#86B8F3", // Fusion of blue
        position: "relative", // To position the created by text
      }}
    >
      <div>
        <h1 className="text-3xl font-bold mb-4">Stock Price Checker</h1>
        <p className="text-sm italic mb-4">
          <em>
            You can check the information of any company by putting their name
          </em>
        </p>
        <div className="mb-4 flex items-center">
          <label htmlFor="companyName" className="mr-2 font-bold">
            Enter Company Name:
          </label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="border rounded px-2 py-1 mr-2"
          />
          <button
            onClick={fetchStockData}
            disabled={!companyName || loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
          >
            {loading ? "Loading..." : "Get Data"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {exampleCompanyNames.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleSelect(example)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded"
            >
              {example}
            </button>
          ))}
        </div>
        {stockData.length > 0 && (
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-xl font-bold mb-2">Stock Data</h2>
            <div className="overflow-x-auto w-full">
              <table className="table-auto">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Open</th>
                    <th>High</th>
                    <th>Low</th>
                    <th>Close</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map((data, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">{data.date}</td>
                      <td className="px-6 py-4">{data.open}</td>
                      <td className="px-6 py-4">{data.high}</td>
                      <td className="px-6 py-4">{data.low}</td>
                      <td className="px-6 py-4">{data.close}</td>
                      <td className="px-6 py-4">{data.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            fontSize: "10px",
          }}
        >
          Created by: Vineet Singh
        </div>
        {Object.keys(currencyRates).length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Currency Conversion</h2>
            <div className="flex items-center">
              <select
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="border rounded px-2 py-1 mr-2"
              >
                {Object.keys(currencyRates).map((currency, index) => (
                  <option key={index} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <span>1 USD equals {currencyRates[selectedCurrency]} {selectedCurrency}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
