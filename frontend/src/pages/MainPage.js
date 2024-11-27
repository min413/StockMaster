

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { useAuthContext } from "../auth/useAuthContext";
import { apiManager } from "../utils/api";
import companyMappings from "../data/companyMappings.json";
import toast from "react-hot-toast";
import Chart from "react-apexcharts";


const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
    background-color: #131722;
    color: #FEFEFE;
    font-family: Arial, sans-serif;
  }
`;

const FavoriteArea = styled.div`
  background-color: #1b1f2c;
  padding: 20px;
  margin-bottom: 30px;
`;

const StockList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StockInfo = styled.div`
  width: 30em;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #2e2f3e;
  padding: 20px;
  &:hover {
    background-color: #202637;
  }
`;

const StockDetail = styled.div`
  display: flex;
  align-items: center;
`;

const CompanyName = styled.span`
  font-size: 30px;
  font-weight: bold;
  margin-right: 10px;
`;

const Change = styled.span`
  color: ${(props) => (props.value >= 0 ? "lightgreen" : "red")};
`;

const StockPrices = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;


const AddStockForm = styled.form`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const StockInput = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #2e2f3e;
  border-radius: 4px;
  background-color: #131722;
  color: #FEFEFE;
  margin-right: 10px;
`;

const AddButton = styled.button`
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

const ChartArea = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #1b1f2c;
  padding: 20px;
  margin-bottom: 30px;

  @media (min-width: 1000px) {
    flex-direction: row;
    justify-content: space-around;
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  margin: 10px;
`;

const NewsArea = styled.div`
  background-color: #1b1f2c;
  padding: 20px;
  margin-bottom: 30px;
`;

const NewsTitle = styled.div`
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
`;

const NewsContent = styled.div`
  margin-bottom: 10px;
  font-size: 14px;
  color: gray;
`;

const NewsItem = styled.div`
  margin-bottom: 20px;
  cursor: pointer;
`;




function MainPage() {
  const [stocks, setStocks] = useState([]);
  const { user } = useAuthContext();
  const [newStock, setNewStock] = useState("");
  const [userObj, setUserObj] = useState();

  const [kospiData, setKospiData] = useState([]);
  const [sp500Data, setSp500Data] = useState([]);

  const [newsTitles, setNewsTitles] = useState([]);

  /*useEffect(() => {
    setUserObj({ ...user })
  }, [user])*/

  useEffect(() => {

    const fetchStockData = async () => {

      const fetchedStocks = await Promise.all(
        JSON.parse(user?.favorite).map(async (ticker) => {
          try {
            const response = await axios.post(
              "http://127.0.0.1:5000/get-stock-data",
              { stockName: ticker }
            );
            return { ticker, ...response.data };
          } catch (error) {
            console.error("Error fetching data for", ticker, ":", error);
            return { ticker, error: true };
          }
        })
      );
      setStocks(fetchedStocks);
    };

    const fetchChartData = async (symbol, setData) => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/get-historical-data/${symbol}`);
        const data = response.data.map(item => ({
          x: new Date(item.date),
          y: [item.open, item.high, item.low, item.close]
        }));
        setData(data);
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    };

    const fetchNewsTitles = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/get-news-titles");
        setNewsTitles(response.data);
      } catch (error) {
        console.error("Error fetching news titles:", error);
      }
    };


    fetchStockData();
    fetchChartData("^KS11", setKospiData);
    fetchChartData("^GSPC", setSp500Data);
    fetchNewsTitles();
    //fetchFearGreedIndex();
    setUserObj({ ...user })
  }, []);

  useEffect(() => { //비동기 문제 해결
    if (stocks.length > 0) {
      const stocks_data = stocks.map(stock => stock.ticker);
      setUserObj(prevUserObj => ({
        ...prevUserObj,
        favorite: stocks_data
      }));
    }
  }, [stocks]);

  const getCompanyName = (ticker) => {
    return companyMappings[ticker] || ticker;
  };

  const renderChange = (stock) => {
    if (stock.error) {
      return "Error fetching data";
    }
    const change = stock.latest_close - stock.last_close;
    const percentChange = ((change / stock.last_close) * 100).toFixed(2);
    return (
      <>
        <Change value={change}>{change.toFixed(2)}</Change>{" "}
        (<Change value={change}>{percentChange}%</Change>)
      </>
    );
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(Number(price))) {
      return 'N/A';
    }
    return Number(price).toFixed(2);
  };

  const formatPriceWithCurrency = (ticker, price) => {
    if (price === null || price === undefined || isNaN(Number(price))) {
      return 'N/A';
    }
    
    // 한국 주식인지 확인하고 통화 설정
    const isKoreanStock = ticker.endsWith('.KS') || ticker.endsWith('.KQ');
    const currencySymbol = isKoreanStock ? '₩' : '$';
  
    return `${currencySymbol}${Number(price).toFixed(2)}`;
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (newStock.trim() === "") return;
    try {
      
      setStocks([...stocks, { ticker: newStock,  }]);
      setNewStock("");

    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  const handleDeleteStock = (e, ticker) => {
    e.preventDefault();
    setStocks(stocks.filter(stock => stock.ticker !== ticker));

    console.log(userObj.favorite)
  };

  const onChangeUserInfo = async () => {

    let result = await apiManager('auth/change-info', 'update', {
      favorite: JSON.stringify(userObj?.favorite),
    })
    if (result) {
      toast.success('성공적으로 변경되었습니다.');
      console.log(result)
    } else {
      toast.error('문제가 발생했습니다.')
    }
  }


  return (
    <>
      <GlobalStyle />

      <ChartArea>
        <ChartContainer>
          <h2>KOSPI Chart</h2>
          <Chart
            options={{
              chart: {
                type: 'candlestick',
                height: 350
              },
              title: {
                text: 'KOSPI Candlestick Chart',
                align: 'left'
              },
              xaxis: {
                type: 'datetime',
                min: kospiData.length > 0 ? new Date(kospiData[0].x).getTime() : undefined,
                max: kospiData.length > 0 ? new Date(kospiData[kospiData.length - 1].x).getTime() : undefined
              },
              yaxis: {
                tooltip: {
                  enabled: true
                },
                labels: {
                  formatter: (value) => value.toFixed(2)
                }
              },
              tooltip: {
                theme: 'dark', 
                style: {
                  fontSize: '12px',
                  fontFamily: undefined,
                  colors: ['#000'] 
                },
                y: {
                  formatter: (value) => value.toFixed(2) 
                }
              }
            }}
            series={[{
              data: kospiData
            }]}
            type="candlestick"
            height={350}
          />
        </ChartContainer>
        <ChartContainer>
          <h2>S&P 500 Chart</h2>
          <Chart
            options={{
              chart: {
                type: 'candlestick',
                height: 350
              },
              title: {
                text: 'S&P 500 Candlestick Chart',
                align: 'left'
              },
              xaxis: {
                type: 'datetime',
                min: sp500Data.length > 0 ? new Date(sp500Data[0].x).getTime() : undefined,
                max: sp500Data.length > 0 ? new Date(sp500Data[sp500Data.length - 1].x).getTime() : undefined
              },
              yaxis: {
                tooltip: {
                  enabled: true
                },
                labels: {
                  formatter: (value) => value.toFixed(2) 
                }
              },
              tooltip: {
                theme: 'dark', 
                style: {
                  fontSize: '12px',
                  fontFamily: undefined,
                  colors: ['#000'] 
                },
                y: {
                  formatter: (value) => value.toFixed(2) 
                }
              }
            }}
            series={[{
              data: sp500Data
            }]}
            type="candlestick"
            height={350}
          />
        </ChartContainer>
      </ChartArea>


      <FavoriteArea>
        <AddStockForm onSubmit={handleAddStock}>
          <StockInput
            type="text"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            placeholder="종목을 입력하세요"
          />
          <AddButton type="submit">추가</AddButton>
        </AddStockForm>
        <StockList>
          {user &&
            stocks.map((stock, idx) => (
              <Link key={idx} to={`/stock/${stock.ticker}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <StockInfo>
                  <StockDetail>
                    <CompanyName>{getCompanyName(stock.ticker)}</CompanyName>
                  </StockDetail>
                  <StockPrices>
                    <div>{formatPriceWithCurrency(stock.ticker, stock.latest_close)}</div>
                    <div>{renderChange(stock)}</div>
                  </StockPrices>
                  <DeleteButton onClick={(e) => handleDeleteStock(e, stock.ticker)}>제거</DeleteButton>
                </StockInfo>
              </Link>
            ))
          }
          <AddButton onClick={onChangeUserInfo}>변경사항 저장</AddButton>
        </StockList>
      </FavoriteArea>
      <NewsArea>
            <h2>최신 경제 뉴스 리스트</h2>
            {newsTitles.map((news, index) => (
              <NewsItem key={index} onClick={() => window.open(news.link, "_blank")}>
                <NewsTitle>{news.title}</NewsTitle>
                <NewsContent>{news.content}</NewsContent>
              </NewsItem>
            ))}
          </NewsArea>
    </>
  );
}

export default MainPage;
