// PortfolioPage.js

import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import styled, { createGlobalStyle } from 'styled-components';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import companyMappings from "../data/companyMappings.json";
import { useAuthContext } from '../auth/useAuthContext';
import { apiManager } from '../utils/api';
import toast from 'react-hot-toast';
import { Scatter, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
    background-color: #131722;
    color: #FEFEFE;
    font-family: Arial, sans-serif;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const TopSection = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 20px;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  margin-right: 20px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
`;

const BottomSection = styled.div`
  width: 100%;
`;

const Section = styled.div`
  background-color: #1b1f2c;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
`;

const TotalAssetSection = styled(Section)`
  flex: 1;
`;

const ChartSection = styled(Section)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PortfolioSection = styled(Section)`
  height: 100%;
`;


const AddStockButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background-color: #3a3f51;
  color: #FEFEFE;
  cursor: pointer;
  &:hover {
    background-color: #4a4f61;
  }
`;

const ModalContainer = styled.div`
  background-color: #1b1f2c;
  width: 300px;
  padding: 20px;
  border-radius: 10px;
  color: #FEFEFE;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #2e2f3e;
  border-radius: 4px;
  background-color: #131722;
  color: #FEFEFE;
  margin-bottom: 10px;
  width: 100%;
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::-moz-appearance {
    appearance: none;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background-color: #3a3f51;
  color: #FEFEFE;
  cursor: pointer;
  &:hover {
    background-color: #4a4f61;
  }
`;

const StockItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin-bottom: 10px;
  background-color: #2e2f3e;
  border-radius: 10px;
`;

const StockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const StockDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const DeleteButton = styled.button`
  padding: 5px 10px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background-color: #e74c3c;
  color: #FEFEFE;
  cursor: pointer;
  &:hover {
    background-color: #c0392b;
  }
`;

const EditButton = styled.button`
  padding: 5px 10px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: #FEFEFE;
  cursor: pointer;
  margin-right: 5px;
  &:hover {
    background-color: #2980b9;
  }
`;

const Change = styled.span`
  color: ${(props) => (props.value >= 0 ? "lightgreen" : "red")};
`;


const LegendContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const ColorBox = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.color};
  margin-right: 10px;
`;

const BacktestSection = styled(Section)`
  width: 100%;
  margin-top: 20px;
`;

const BacktestButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background-color: #27ae60;
  color: #FEFEFE;
  cursor: pointer;
  &:hover {
    background-color: #2ecc71;
  }
`;

const BacktestLoading = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #FEFEFE;
`;

const NewsSection = styled.div`
  background-color: #1b1f2c;
  padding: 20px;
  margin-top: 20px;
  border-radius: 10px;
`;

const NewsItem = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background-color: #2e2f3e;
  border-radius: 8px;
`;

const NewsTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #FEFEFE;
`;

const NewsLink = styled.a`
  font-size: 14px;
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
`;

const NewsDescription = styled.p`
  font-size: 14px;
  color: #a0a0a0;
`;


const TickerPredictedRisk = ({ portfolioStocks = [], portfolioRisk }) => {
  const [tickerInput, setTickerInput] = useState("");
  const [predictedRisk, setPredictedRisk] = useState(null);

  const handleInputChange = (e) => {
    setTickerInput(e.target.value.toUpperCase());
  };

  const fetchRiskForTickerInPortfolio = async () => {
    try {
        const riskResponse = await axios.post('http://127.0.0.1:5000/get-stock-risk', {
            stockSymbols: [tickerInput],
        });

        if (riskResponse.data && riskResponse.data[tickerInput]) {
            const { volatility, beta, idiosyncratic_risk } = riskResponse.data[tickerInput];
            const newStockFeature = { volatility, beta, idiosyncratic_risk };

            const portfolioFeatures = portfolioStocks
                .map(stock => ({
                    volatility: stock.volatility,
                    beta: stock.beta,
                    idiosyncratic_risk: stock.idiosyncratic_risk,
                }))
                .filter(feature => feature.volatility !== undefined && feature.beta !== undefined && feature.idiosyncratic_risk !== undefined);

            portfolioFeatures.push(newStockFeature);

            const predictedRiskResponse = await axios.post('http://127.0.0.1:5000/predict-risk', { features: portfolioFeatures });

            if (predictedRiskResponse.data && predictedRiskResponse.data.predicted_risk) {
                const tickerPredictedRisk = predictedRiskResponse.data.predicted_risk[portfolioFeatures.length - 1];
                setPredictedRisk(tickerPredictedRisk.toFixed(5));
            } else {
                setPredictedRisk("예측 리스크 데이터를 가져올 수 없습니다.");
            }
        } else {
            setPredictedRisk("해당 티커에 대한 리스크 데이터를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("Error fetching risk data:", error);
        setPredictedRisk("리스크 데이터를 가져오는 중 오류가 발생했습니다.");
    }
};

  

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>특정 주식의 포트폴리오 내 예측 리스크 조회</h3>
      <input
        type="text"
        value={tickerInput}
        onChange={handleInputChange}
        placeholder="주식 티커 입력 (예: MSFT)"
        style={{
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          marginRight: '8px',
        }}
      />
      <button onClick={fetchRiskForTickerInPortfolio} style={{ padding: '8px 12px', cursor: 'pointer' }}>
        조회
      </button>
      {predictedRisk && (
        <p style={{ marginTop: '10px' }}>
          {tickerInput} 예측 리스크 값 : {predictedRisk}
          {portfolioRisk !== null && (
      <span style={{ display: 'block', marginTop: '5px' }}>
        {predictedRisk < portfolioRisk
          ? (
            <>
            포트폴리오에 비해 리스크가 더 낮습니다<br />
            포트폴리오 리스크를 낮추고 싶다면 매수하세요
            </>
          )
          : predictedRisk > portfolioRisk
          ? (
            <>
              포트폴리오에 비해 리스크가 더 높습니다<br />
              포트폴리오 리스크를 높이고 싶다면 매수하세요
            </>
          )
          : "포트폴리오와 동일한 리스크 수준입니다"}
      </span>
    )}
        </p>
      )}
    </div>
  );
};

  // SPY와 포트폴리오 리스크 값을 표시하는 막대 그래프 컴포넌트
  const RiskComparisonBarChart = React.memo(({ spyRisk, portfolioRisk }) => {
    const data = useMemo(()=> ({
      labels: ['SPY 예측 리스크', '포트폴리오 전체 예측 리스크'],
      datasets: [
        {
          label: '예측 리스크 값',
          data: [spyRisk, portfolioRisk],
          backgroundColor: ['#FF6384', '#36A2EB'],
        },
      ],
    }), [spyRisk, portfolioRisk]);
  
    const options = useMemo(() => ({
      scales: {
        y: {
          beginAtZero: true,
          max: 0.06, // 최대값 0.1로 설정
          ticks: {
            stepSize: 0.02,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw.toFixed(5)}`,
          },
        },
      },
    }), []);
  
    return (
      <div style={{ marginTop: '20px', width: '50%' }}>
        <h3>SPY와 포트폴리오 예측 리스크 비교</h3>
        <Bar data={data} options={options} key={`${spyRisk}-${portfolioRisk}`}/>
      </div>
    );
  });



const PortfolioPage = () => {

  const [stocks, setStocks] = useState([])
  const { user } = useAuthContext();
  const [userObj, setUserObj] = useState()
  const [news, setNews] = useState([]); 

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [stockData, setStockData] = useState({ ticker: '', quantity: '', avgPrice: '' });

  const [exchangeRate, setExchangeRate] = useState(null);
  const [chartColors, setChartColors] = useState([]);

  const [riskData, setRiskData] = useState({ visualization: [] });

  const [backtestData, setBacktestData] = useState(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestError, setBacktestError] = useState(null);

  const [spyRisk, setSpyRisk] = useState(null);
  const [portfolioRisk, setPortfolioRisk] = useState(null);



  useEffect(() => { //비동기 문제 해결
    if (stocks.length > 0) {
      const stocks_data = stocks
      console.log(stocks_data)
      setUserObj(prevUserObj => ({
        ...prevUserObj,
        portfolio: stocks_data
      }));
    }
  }, [stocks]);

  const openModal = (index = null) => {
    if (index !== null) {
      setIsEdit(true);
      setEditIndex(index);
      setStockData(stocks[index]);
    } else {
      setIsEdit(false);
      setStockData({ ticker: '', quantity: '', avgPrice: '' });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStockData({ ...stockData, [name]: value });
  };

  const addStock = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/get-stock-data",
        { stockName: stockData.ticker }
      );
      const newStock = { 
        ...stockData, 
        quantity: Number(stockData.quantity), 
        avgPrice: Number(stockData.avgPrice), 
        currentPrice: response.data.latest_close || 0 
      };
      setStocks([...stocks, newStock]);
      closeModal();
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  const editStock = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/get-stock-data", 
        { stockName: stockData.ticker }
      );
      const updatedStock = { 
        ...stockData, 
        quantity: Number(stockData.quantity), 
        avgPrice: Number(stockData.avgPrice), 
        currentPrice: response.data.latest_close || 0 
      };
      const updatedStocks = [...stocks];
      updatedStocks[editIndex] = updatedStock;
      setStocks(updatedStocks);
      closeModal();
    } catch (error) {
      console.error("Error editing stock:", error);
    }
  };

  const onChangeUserInfo = async () => {
    console.log(userObj?.portfolio) 
    let result = await apiManager('auth/change-portfolio', 'update', {
      portfolio: JSON.stringify(userObj?.portfolio)
    })
    if (result) { 
      toast.success('성공적으로 변경되었습니다.');
      console.log(result)
    } else {
      toast.error('문제가 발생했습니다.')
    }
  }

  const deleteStock = (index) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const getDisplayTicker = (ticker) => {
    return ticker.endsWith('.KS') || ticker.endsWith('.KQ') ? companyMappings[ticker] || ticker : ticker;
  };

  const calculateTotalAssets = () => {
    return stocks.reduce((total, stock) => {
      const value = stock.quantity * stock.currentPrice;
      return total + (stock.ticker.endsWith('.KS') || stock.ticker.endsWith('.KQ') ? value : value * exchangeRate);
    }, 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); // 소수점 없이 천 단위 구분
  };

  const calculateTotalInvestment = () => {
    return stocks.reduce((total, stock) => {
      const value = stock.quantity * stock.avgPrice;
      return total + (stock.ticker.endsWith('.KS') || stock.ticker.endsWith('.KQ') ? value : value * exchangeRate);
    }, 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); // 소수점 없이 천 단위 구분
  };

  const fetchNewsForStocks = async (stockTickers) => {
    try {
      const promises = stockTickers.map(ticker => {
        // companyMappings에서 종목 이름을 검색, 없으면 티커 그대로 사용
        const stockName = companyMappings[ticker] || ticker;
        return axios.post('http://localhost:5000/get-stock-news', { stockName });
      });

      const responses = await Promise.all(promises);
      const newsData = {};
      responses.forEach((response, index) => {
        const ticker = stockTickers[index];
        newsData[ticker] = response.data.items;
      });

      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const generateRandomColor = () => {
    let color;
    do {
      color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    } while (color.length !== 7 || parseInt(color.substring(1), 16) < 0x444444); // 너무 어두운 색 피하기
    return color;
  };

  useEffect(() => {
    if (stocks.length > 0) {
      const stockTickers = stocks.map(stock => stock.ticker);
      fetchNewsForStocks(stockTickers);
    }
  }, [stocks]);

  const fetchCurrentPrices = async () => {
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          const response = await axios.post(
            "http://127.0.0.1:5000/get-stock-data",
            { stockName: stock.ticker }
          );
          return { ...stock, currentPrice: response.data.latest_close || 0 };
        })
      );

      setStocks(updatedStocks);
      setUserObj((prevUserObj) => ({ ...prevUserObj, portfolio: updatedStocks }));
    } catch (error) {
      console.error("Error fetching current prices:", error);
    }
  };

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
          if (user?.portfolio) {
              const parsedPortfolio = JSON.parse(user.portfolio);
              const fetchedStocks = await Promise.all(
                  parsedPortfolio.map(async (pf) => {
                      try {
                          const response = await axios.post(
                              "http://127.0.0.1:5000/get-stock-data",
                              { stockName: pf.ticker }
                          );
                          return { ...pf, ...response.data };
                      } catch (error) {
                          console.error("Error fetching data for", pf.ticker, ":", error);
                          return { ...pf, error: true };
                      }
                  })
              );
  
              const tickers = fetchedStocks.map(stock => stock.ticker);
              const riskResponse = await axios.post('http://127.0.0.1:5000/get-stock-risk', {
                  stockSymbols: [...tickers, 'SPY']
              });
              
              if (riskResponse.data) {

                const stocksWithRisk = fetchedStocks.map(stock => ({
                  ...stock,
                  volatility: riskResponse.data[stock.ticker]?.volatility,
                  beta: riskResponse.data[stock.ticker]?.beta,
                  idiosyncratic_risk: riskResponse.data[stock.ticker]?.idiosyncratic_risk,
              }));

              setStocks(stocksWithRisk); 

                const riskData = riskResponse.data;
      
                const features = fetchedStocks.map(stock => ({
                  ticker: stock.ticker,
                  volatility: riskData[stock.ticker]?.volatility,
                  beta: riskData[stock.ticker]?.beta,
                  idiosyncratic_risk: riskData[stock.ticker]?.idiosyncratic_risk,
                }));
      
                const predictedRiskResponse = await axios.post('http://127.0.0.1:5000/predict-risk', { features });
                
                if (predictedRiskResponse.data) {
                  const predictedRisks = predictedRiskResponse.data.predicted_risk;
                  
                  const stocksWithRisk = fetchedStocks.map((stock, index) => ({
                    ...stock,
                    predictedRisk: predictedRisks[index],
                  }));
      
                  setStocks(stocksWithRisk);
      
                  const spyStock = stocksWithRisk.find(stock => stock.ticker === 'SPY');
                if (spyStock) {
                  setSpyRisk(spyStock.predictedRisk.toFixed(5));
                }
              }
            }
          }
      } catch (error) {
          console.error("Error fetching portfolio data and risk data:", error);
      }
  };
  
    const fetchExchangeRate = async () => {
      const apiKey = process.env.REACT_APP_EXCHANGE;
      const response = await axios.get(`http://apilayer.net/api/live?access_key=${apiKey}&currencies=KRW&source=USD&format=1`);
      const rate = response.data.quotes.USDKRW;
      setExchangeRate(rate);
    };

    fetchPortfolioData();
    fetchCurrentPrices();
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      fetchCurrentPrices();
    }, 60000); 

    return () => clearInterval(fetchInterval); 
  }, [stocks]); 

  useEffect(() => {
    const colors = stocks.map(() => generateRandomColor());
    setChartColors(colors);
  }, [stocks]);

  

  const calculateProfit = (stock) => {
    return ((stock.currentPrice - stock.avgPrice) * stock.quantity).toFixed(2);
  };

  const calculateProfitPercent = (stock) => {
    return (((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100).toFixed(2);
  }; 

  // 종목별 예측 리스크 값 반환 함수
const calculateRisk = (ticker) => {
  const stockIndex = stocks.findIndex(stock => stock.ticker === ticker);
  return stockIndex !== -1 && riskData.predictedRisk && riskData.predictedRisk[stockIndex] !== undefined
    ? riskData.predictedRisk[stockIndex].toFixed(5)
    : "N/A";
};

  // 예측 리스크 리스트 컴포넌트
  const PredictedRiskList = ({ stocks }) => {
    return (
      <div style={{ marginTop: '20px' }}>
        <h3>예측 리스크 값</h3>
        <ul>
          {stocks.map((stock, index) => (
            <li key={index}>
              {getDisplayTicker(stock.ticker)}: {calculateRisk(stock.ticker)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const formatCurrency = (ticker, amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return 'N/A';
    }
    return ticker.endsWith('.KS') || ticker.endsWith('.KQ') ? `${numericAmount.toFixed(2)}원` : `$${numericAmount.toFixed(2)}`;
  };

  const getChartData = () => {
    const labels = stocks.map(stock => getDisplayTicker(stock.ticker));
    const data = stocks.map(stock => stock.quantity * stock.currentPrice * (stock.ticker.endsWith('.KS') || stock.ticker.endsWith('.KQ') ? 1 : exchangeRate));
    const backgroundColors = chartColors;

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
      }]
    };
  };

  const getTotalValue = () => {
    return stocks.reduce((total, stock) => {
      return total + stock.quantity * stock.currentPrice * (stock.ticker.endsWith('.KS') || stock.ticker.endsWith('.KQ') ? 1 : exchangeRate);
    }, 0).toFixed(2);
  };



  const handleBacktest = async () => {
    setIsBacktesting(true);
    setBacktestError(null);
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
  
        const formatDate = (date) => date.toISOString().split('T')[0];
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
  
        // 모든 주식의 데이터를 가져옴
        const historicalDataPromises = stocks.map(async (stock) => {
            const response = await axios.get(`http://127.0.0.1:5000/get-historical-data/${stock.ticker}`, {
                params: {
                    start: formattedStartDate,
                    end: formattedEndDate
                }
            });
            return response.data;
        });
  
        const allHistoricalData = await Promise.all(historicalDataPromises);
  
        // SPY 데이터를 추가로 가져옴
        const spyResponse = await axios.get(`http://127.0.0.1:5000/get-historical-data/SPY`, {
            params: {
                start: formattedStartDate,
                end: formattedEndDate
            }
        });
        const spyData = spyResponse.data;
  
        const dateSet = new Set();
        allHistoricalData.forEach(stockData => {
            stockData.forEach(item => dateSet.add(item.date));
        });
        spyData.forEach(item => dateSet.add(item.date)); // SPY 데이터의 날짜도 추가
        const sortedDates = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));
  
        // 포트폴리오 가치를 시간에 따라 초기화
        const portfolioValues = sortedDates.map(date => ({
            date,
            value: 0
        }));
  
        // SPY에 투자한 결과를 위한 초기화
        const spyValues = sortedDates.map(date => ({
            date,
            value: 0
        }));
  
        // 일일 포트폴리오 가치 계산
        sortedDates.forEach((date, index) => {
            let dailyTotal = 0;
            stocks.forEach((stock, stockIndex) => {
                const stockData = allHistoricalData[stockIndex];
                const dayData = stockData.find(item => item.date === date);
                if (dayData) {
                    const price = dayData.close;
                    const value = stock.quantity * price * (stock.ticker.endsWith('.KS') || stock.ticker.endsWith('.KQ') ? 1 : exchangeRate);
                    dailyTotal += value;
                } else {
                    dailyTotal += portfolioValues[index - 1]?.value || 0;
                }
            });
            portfolioValues[index].value = dailyTotal;
  
            // SPY 값 계산
            if (index === 0) {
                spyValues[index].value = portfolioValues[index].value;
            } else {
                const previousSpyData = spyData.find(item => item.date === sortedDates[index - 1]);
                const currentSpyData = spyData.find(item => item.date === date);
                
                if (currentSpyData && previousSpyData) {
                    // SPY의 현재 가격과 이전 가격을 사용해 증감 비율 계산
                    const spyPercentageChange = (currentSpyData.close - previousSpyData.close) / previousSpyData.close;
                    spyValues[index].value = spyValues[index - 1].value * (1 + spyPercentageChange);
                } else {
                    // SPY 데이터가 없으면? 이전 값을 그대로 사용
                    spyValues[index].value = spyValues[index - 1].value;
                }
            }
        });
  
        setBacktestData({
            portfolioValues,
            spyValues
        });
    } catch (error) {
        console.error("Error during backtesting:", error);
        setBacktestError("백테스팅 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
        setIsBacktesting(false);
    }
  };
  
  // 백테스팅 결과를 위한 차트 데이터
  const getBacktestChartData = () => {
    if (!backtestData || !backtestData.portfolioValues || !backtestData.spyValues) return null;
  
    const today = new Date().toISOString().split('T')[0];
  
    // 오늘 날짜를 제외한 데이터만 필터링
    const filteredPortfolioValues = backtestData.portfolioValues.filter(entry => entry.date !== today);
    const filteredSpyValues = backtestData.spyValues.filter(entry => entry.date !== today);
  
    const labels = filteredPortfolioValues.map(entry => entry.date);
    const portfolioData = filteredPortfolioValues.map(entry => entry.value);
    const spyData = filteredSpyValues.map(entry => entry.value);
  
    return {
      labels,
      datasets: [
        {
          label: '포트폴리오 가치',
          data: portfolioData,
          fill: false,
          borderColor: '#3498db',
          backgroundColor: '#3498db',
          tension: 0.1
        },
        {
          label: 'SPY에 투자한 경우',
          data: spyData,
          fill: false,
          borderColor: '#e74c3c',
          backgroundColor: '#e74c3c',
          tension: 0.1
        }
      ]
    };
  };
  
  const fetchRiskData = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/get-stock-risk', {
        stockSymbols: stocks.map(stock => stock.ticker)
      });

      const features = stocks.map((stock) => ({
        volatility: response.data[stock.ticker].volatility,
        beta: response.data[stock.ticker].beta,
        idiosyncratic_risk: response.data[stock.ticker].idiosyncratic_risk
    }));

      const riskPrediction = await axios.post('http://127.0.0.1:5000/predict-risk', { features });
      console.log("Predicted Risk (Ridge):", riskPrediction.data.predicted_risk);

      const visualization = await axios.post('http://127.0.0.1:5000/visualize-risk', { features });

      setRiskData({
        predictedRisk: riskPrediction.data.predicted_risk,
        visualization: visualization.data.map((pt, index) => ({
          x: pt.x,
          y: pt.y,
          risk: riskPrediction.data.predicted_risk[index],
          ticker: stocks[index].ticker
        }))
      });
    } catch (error) {
      console.error("Error fetching risk data:", error);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, [stocks]);

  useEffect(() => {
    const fetchClusteredRiskData = async () => {
      try {
        const features = riskData.visualization.map(pt => ({
          volatility: pt.x,  
          beta: pt.y,        
        }));
  
        const response = await axios.post('http://127.0.0.1:5000/cluster-risk', {
          features,
        });
  
        // 기존 visualization 데이터와 클러스터 정보를 합침
        const updatedVisualization = riskData.visualization.map((pt, index) => ({
          ...pt,
          cluster: response.data[index]?.cluster !== undefined ? response.data[index].cluster : -1,
        }));
  
        setRiskData(prevData => ({
          ...prevData,
          visualization: updatedVisualization
        }));
      } catch (error) {
        console.error("Error fetching clustered risk data:", error);
      }
    };

    if (riskData.visualization.length > 0) {
      fetchClusteredRiskData();
    }
}, [riskData.visualization]);

const clusterColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];


const ClusteredStocksList = ({ visualization }) => {
  const clusters = visualization.reduce((acc, stock) => {
    const { cluster, ticker } = stock;
    if (!acc[cluster]) acc[cluster] = [];
    acc[cluster].push(ticker);
    return acc;
  }, {});

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>클러스터링된 그룹</h3>
      {Object.keys(clusters).map((clusterKey) => (
        <div key={clusterKey} style={{ marginBottom: '10px' }}>
          <h4>{clusterKey !== '-1' ? `Cluster ${clusterKey}` : '노이즈 그룹'}</h4>
          <p>{clusters[clusterKey].join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

const PortfolioPredictedRisk = ({ stocks, riskData, exchangeRate }) => {
  const getTotalValue = () => {
    return stocks.reduce((total, stock) => {
      return total + stock.quantity * stock.currentPrice * (stock.ticker.endsWith('.KS') || stock.ticker.endsWith('.KQ') ? 1 : exchangeRate);
    }, 0);
  };

  const totalValue = getTotalValue();

  const portfolioRisk = stocks.reduce((acc, stock, index) => {
    const stockValue = stock.quantity * stock.currentPrice * (stock.ticker.endsWith('.KS') || stock.ticker.endsWith('.KQ') ? 1 : exchangeRate);
    const weight = stockValue / totalValue;
    const risk = riskData.predictedRisk && riskData.predictedRisk[index] ? riskData.predictedRisk[index] : 0;
    return acc + (weight * risk);
  }, 0).toFixed(5);

  useEffect(() => {
    setPortfolioRisk(parseFloat(portfolioRisk));
  }, [portfolioRisk, setPortfolioRisk]);

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>포트폴리오 전체 예측 리스크 값</h3>
      <p>{portfolioRisk}</p>
    </div>
  );
};


  return (
    <>
      <GlobalStyle />
      <Container>
        <TopSection>
          <LeftColumn>
            <TotalAssetSection>
              <h2>총 자산 영역</h2>
              <p>현재 환율 : {exchangeRate ? Math.floor(exchangeRate) : 'Loading...'}원</p>
              <p>총 자산: {calculateTotalAssets()}원</p>
              <p>투자 총 금액: {calculateTotalInvestment()}원</p>
            </TotalAssetSection>
            <ChartSection>
              <h2>차트 영역</h2>
              <div>
                  <Doughnut data={getChartData()} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <LegendContainer>
                {stocks.map((stock, index) => {
                  const percentage = ((stock.quantity * stock.currentPrice * (stock.ticker.endsWith('.KS') || stock.ticker.endsWith('.KQ') ? 1 : exchangeRate)) / getTotalValue() * 100).toFixed(1);
                  return (
                    <LegendItem key={index}>
                      <ColorBox color={chartColors[index]} />
                      <span>{getDisplayTicker(stock.ticker)} - {percentage}%</span>
                    </LegendItem>
                  );
                })}
              </LegendContainer>
            </ChartSection>
          </LeftColumn>
          <RightColumn>
            <PortfolioSection>
              <h2>포트폴리오 자산</h2>
              {stocks.map((stock, index) => (
                <StockItem key={index}>
                  <StockHeader>
                    <div>{getDisplayTicker(stock.ticker)}</div>
                    <div>
                      <EditButton onClick={() => openModal(index)}>편집</EditButton>
                      <DeleteButton onClick={() => deleteStock(index)}>삭제</DeleteButton>
                    </div>
                  </StockHeader>
                  <StockDetail>
                    <div>수량: {stock.quantity}</div>
                  </StockDetail>
                  <StockDetail>
                    <div>자산가치: {formatCurrency(stock.ticker, stock.quantity * stock.avgPrice)}</div>
                    <div>평단가: {formatCurrency(stock.ticker, stock.avgPrice)}</div>
                  </StockDetail>
                  <StockDetail>
                    <div>
                      수익: {formatCurrency(stock.ticker, calculateProfit(stock))} (
                      <Change value={calculateProfit(stock)}>
                        {calculateProfitPercent(stock)}%
                      </Change>)
                    </div>
                    <div>현재가: {formatCurrency(stock.ticker, stock.currentPrice)}</div>
                  </StockDetail>
                </StockItem>
              ))}
              <AddStockButton onClick={() => openModal()}>주식 추가</AddStockButton>
              <SubmitButton onClick={onChangeUserInfo} style={{ marginLeft: '1rem' }}>
                변경사항 저장
              </SubmitButton>
            </PortfolioSection>
          </RightColumn>
        </TopSection>
        <BottomSection>
        
        {riskData && riskData.visualization.length > 0 && (
          <>
            <Scatter
              data={{
                datasets: riskData.visualization.reduce((acc, { x, y, cluster, ticker, risk }) => {
                  const clusterLabel = `Cluster ${cluster}`;
                  const clusterIdx = acc.findIndex(d => d.label === clusterLabel);
                  if (clusterIdx === -1) {
                    acc.push({
                      label: clusterLabel,
                      data: [{ x, y, ticker, risk }],
                      backgroundColor: clusterColors[cluster % clusterColors.length] || '#999999',
                      pointRadius: 6,
                    });
                  } else {
                    acc[clusterIdx].data.push({ x, y, ticker, risk });
                  }
                  return acc;
                }, []),
              }}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const dataPoint = context.raw;
                        const ticker = dataPoint.ticker || "Unknown Ticker";
                        const riskValue = dataPoint.risk !== undefined ? dataPoint.risk.toFixed(6) : "N/A";
                        return `${ticker} - ${context.dataset.label} - Risk: ${riskValue}`;
                      },
                    },
                  },
                },
                scales: {
                  x: { title: { display: true, text: 'PCA Dimension 1' } },
                  y: { title: { display: true, text: 'PCA Dimension 2' } },
                },
              }}
            />
            <ClusteredStocksList visualization={riskData.visualization} />
            <PredictedRiskList stocks={stocks} />
            
            
            <PortfolioPredictedRisk stocks={stocks} riskData={riskData} exchangeRate={exchangeRate} setPortfolioRisk={setPortfolioRisk}/>
            <TickerPredictedRisk portfolioStocks={stocks} portfolioRisk={portfolioRisk}/>
            {spyRisk && portfolioRisk !== null && (
          <RiskComparisonBarChart spyRisk={parseFloat(spyRisk)} portfolioRisk={portfolioRisk} />
          
        )}
          </>
        )}

<NewsSection>
        <h2>관련 뉴스</h2>
        {Object.keys(news).length > 0 ? (
          Object.keys(news).map((ticker, index) => (
            <div key={index}>
              <h3>{companyMappings[ticker] || ticker} 관련 뉴스</h3>
              {news[ticker].length > 0 ? (
                news[ticker].map((article, idx) => (
                  <NewsItem key={idx}>
                    <NewsTitle>{article.title.replace(/<\/?[^>]+(>|$)/g, "")}</NewsTitle>
                    <NewsDescription>{article.content}</NewsDescription> {/* 본문 내용 표시 */}
                    <NewsLink href={article.link} target="_blank" rel="noopener noreferrer">기사 보기</NewsLink>
                  </NewsItem>
                ))
              ) : (
                <p>해당 종목에 대한 뉴스가 없습니다.</p>
              )}
            </div>
          ))
        ) : (
          <p>뉴스 데이터를 불러오는 중입니다...</p>
        )}
      </NewsSection>




          <BacktestSection>
            <h2>백테스팅 결과</h2>
            <BacktestButton onClick={handleBacktest} disabled={isBacktesting}>
              {isBacktesting ? '백테스팅 중...' : '백테스트 실행'}
            </BacktestButton>
            {backtestError && <p style={{ color: 'red' }}>{backtestError}</p>}
            {isBacktesting && <BacktestLoading>백테스팅을 수행 중입니다. 잠시만 기다려주세요...</BacktestLoading>}
            {backtestData && backtestData.portfolioValues && backtestData.spyValues && (
              <div style={{ marginTop: '20px' }}>
                <Line 
                  data={getBacktestChartData()} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: '#FEFEFE'
                        }
                      },
                      tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed?.y !== null ? context.parsed.y.toLocaleString() : '';
                            return `${label}: ${value}원`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: '#FEFEFE'
                        },
                        grid: {
                          color: '#2e2f3e'
                        }
                      },
                      y: {
                        ticks: {
                          color: '#FEFEFE'
                        },
                        grid: {
                          color: '#2e2f3e'
                        },
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </div>
            )}
          </BacktestSection>
          
        </BottomSection>
      </Container>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add/Edit Stock Modal"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#1b1f2c',
            borderRadius: '10px',
            padding: '20px',
            color: '#FEFEFE',
          },
        }}
      >
        <ModalContainer>
          <h2>{isEdit ? '주식 수정' : '주식 추가'}</h2>
          <form onSubmit={(e) => { e.preventDefault(); isEdit ? editStock() : addStock(); }}>
            <Input
              type="text"
              name="ticker"
              value={stockData.ticker}
              onChange={handleInputChange}
              placeholder="종목 이름"
              required
            />
            <Input
              type="number"
              name="quantity"
              value={stockData.quantity}
              onChange={handleInputChange}
              placeholder="수량"
              required
            />
            <Input
              type="number"
              name="avgPrice"
              value={stockData.avgPrice}
              onChange={handleInputChange}
              placeholder="평단가"
              required
            />
            <SubmitButton type="submit">{isEdit ? '수정' : '추가'}</SubmitButton>
          </form>
        </ModalContainer>

      </Modal>

    </>
  );
};

export default PortfolioPage;
