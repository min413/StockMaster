import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Chart from "react-apexcharts";
import axios from "axios";

const INITIAL_CAPITAL = 1000000;

const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
    background-color: #131722;
    color: #FEFEFE;
    font-family: Arial, sans-serif;
  }
`;

const DetailContainer = styled.div`
  padding: 20px;
  background-color: #1b1f2c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const TickerTitle = styled.h1`
  color: #FFFFFF;
`;

const ChartContainer = styled.div`
  height: 400px;
  width: 80%;
`;

const RSIChartContainer = styled.div`
  height: 200px;
  width: 80%;
  margin-top: 30px;
`;

const RSISignalChartContainer = styled.div`
  height: 400px;
  width: 80%;
  margin-top: 30px;
`;

const BollingerChartContainer = styled.div`
  height: 400px;
  width: 80%;
  margin-top: 30px;
`;

const SignalList = styled.div`
  margin-top: 20px;
  color: white;
  font-size: 16px;
`;


function calculateRSI(data, period = 14) {
  let gains = 0;
  let losses = 0;

  const rsiValues = data.map((item, index) => {
    if (index === 0) return null;

    const difference = item.close - data[index - 1].close;
    const gain = Math.max(difference, 0);
    const loss = Math.abs(Math.min(difference, 0));

    gains = ((gains * (period - 1)) + gain) / period;
    losses = ((losses * (period - 1)) + loss) / period;

    const rs = gains / losses;
    const rsi = 100 - (100 / (1 + rs));

    return {
      x: item.date.getTime(),
      y: rsi,
      close: item.close // 주가 정보를 같이 저장
    };
  });

  return rsiValues.filter(item => item !== null);
}

function calculateMovingAverage(data, period) {
  return data.map((_, index, array) => {
    if (index < period - 1) return null;
    const slice = array.slice(index - period + 1, index + 1);
    const sum = slice.reduce((acc, item) => acc + item.close, 0);
    return {
      x: array[index].date.getTime(),
      y: sum / period
    };
  }).filter(item => item !== null);
}


function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const movingAverage = data.map((_, index, array) => {
    if (index < period - 1) return null;
    const slice = array.slice(index - period + 1, index + 1);
    const sum = slice.reduce((acc, item) => acc + item.close, 0);
    const mean = sum / period;
    const variance = slice.reduce((acc, item) => acc + Math.pow(item.close - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      x: array[index].date.getTime(),
      middle: mean,
      upper: mean + multiplier * standardDeviation,
      lower: mean - multiplier * standardDeviation
    };
  });

  return movingAverage.filter(item => item !== null);
}


function calculateBacktesting(data, signals, signalType = 'default') {
  let capital = INITIAL_CAPITAL;
  let isHolding = false;
  let entryPrice = 0;
  let backtestingData = [];

  data.forEach((item) => {
    const date = item.date.getTime();
    const price = item.close;

    const buySignal = signals.some(
      (signal) =>
        signal.x === date &&
        ((signalType === 'RSI' && signal.label.text === 'RSI Buy') ||
        (signalType === 'Bollinger' && signal.label.text === 'Buy') ||
        (signalType === 'default' && signal.label.text === 'Buy'))
    );

    const sellSignal = signals.some(
      (signal) =>
        signal.x === date &&
        ((signalType === 'RSI' && signal.label.text === 'RSI Sell') ||
        (signalType === 'Bollinger' && signal.label.text === 'Sell') ||
        (signalType === 'default' && signal.label.text === 'Sell'))
    );

    if (!isHolding && buySignal) {
      isHolding = true;
      entryPrice = price;
    }

    if (isHolding && sellSignal) {
      isHolding = false;
      capital *= price / entryPrice;
    }

    if (isHolding) {
      const percentChange = (price / entryPrice - 1) * 100;
      backtestingData.push({ x: date, y: capital * (1 + percentChange / 100) });
    } else {
      backtestingData.push({ x: date, y: capital });
    }
  });

  return backtestingData;
}

function StockDetailPage() {
  const { ticker } = useParams();
  const [chartData, setChartData] = useState([]);
  const [movingAverages, setMovingAverages] = useState({
    ma5: [],
    ma20: [],
    ma60: [],
    ma120: [],
    ma200: []
  });
  const [rsiData, setRsiData] = useState([]); 
  const [rsiSignals, setRsiSignals] = useState([]); 
  const [rsiSignalInfo, setRsiSignalInfo] = useState([]); 
  const [buySignalInfo, setBuySignalInfo] = useState([]); 
  const [crossSignals, setCrossSignals] = useState([]); 
  const [signalInfo, setSignalInfo] = useState([]); 
  const [bollingerBands, setBollingerBands] = useState([]); 
  const [bollingerBandSignals, setBollingerBandSignals] = useState([]);  
  const [bollingerBandSignalInfo, setBollingerBandSignalInfo] = useState([]); 

  const [backtestingDataMovingAverage, setBacktestingDataMovingAverage] = useState([]);
  const [backtestingDataRSI, setBacktestingDataRSI] = useState([]);
  const [backtestingDataBollingerBands, setBacktestingDataBollingerBands] = useState([]);


  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/get-historical-data/${ticker}`);
        const data = response.data.map(item => ({
          date: new Date(item.date),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close
        }));
        setChartData(data);

        const ma5 = calculateMovingAverage(data, 5);
        const ma20 = calculateMovingAverage(data, 20);
        const ma60 = calculateMovingAverage(data, 60);
        const ma120 = calculateMovingAverage(data, 120);
        const ma200 = calculateMovingAverage(data, 200);

        
        setMovingAverages({
          ma5,
          ma20,
          ma60,
          ma120,
          ma200
        });

        const rsiValues = calculateRSI(data);
        setRsiData(rsiValues);

        const bollingerBandValues = calculateBollingerBands(data);
        setBollingerBands(bollingerBandValues);

        const rsiSignalsTemp = [];
        const rsiSignalInfoTemp = [];
        let isInRSIBuyPosition = false;

        const bollingerSignals = [];
        const bollingerSignalInfoTemp = [];
        let isInBollingerPosition = false;

        for (let i = 1; i < bollingerBandValues.length; i++) {
          const currentPrice = data[i].close;
          const previousPrice = data[i - 1].close;
          const currentLower = bollingerBandValues[i].lower;
          const currentUpper = bollingerBandValues[i].upper;

          // 매수 시그널 감지: 주가가 Lower Band를 돌파하여 위로 올라갈 때
          if (!isInBollingerPosition && currentPrice < currentLower) {
            bollingerSignals.push({
              x: bollingerBandValues[i].x,
              label: {
                text: 'Buy',
                style: {
                  color: "#00FF00",
                  background: "#000000"
                }
              },
              marker: {
                size: 6,
                fillColor: "#00FF00",
                strokeColor: "#00FF00",
                shape: "triangle",
                position: 'below'
              }
            });
            bollingerSignalInfoTemp.push({
              type: '매수',
              date: new Date(bollingerBandValues[i].x).toLocaleDateString(),
              price: currentPrice.toFixed(2),
              lower: currentLower.toFixed(2), 
              upper: currentUpper.toFixed(2), 
              info: '볼린저 밴드 Lower Band 돌파 매수 시그널'
            });
            isInBollingerPosition = true; // 매수 상태로 변경
          }

          // 매도 시그널 감지: 주가가 Upper Band를 돌파하여 아래로 내려갈 때
          if (isInBollingerPosition && currentPrice > currentUpper) {
            bollingerSignals.push({
              x: bollingerBandValues[i].x,
              label: {
                text: 'Sell',
                style: {
                  color: "#FF0000",
                  background: "#000000"
                }
              },
              marker: {
                size: 6,
                fillColor: "#FF0000",
                strokeColor: "#FF0000",
                shape: "triangle",
                position: 'above'
              }
            });
            bollingerSignalInfoTemp.push({
              type: '매도',
              date: new Date(bollingerBandValues[i].x).toLocaleDateString(),
              price: currentPrice.toFixed(2),
              lower: currentLower.toFixed(2), 
              upper: currentUpper.toFixed(2), 
              info: '볼린저 밴드 Upper Band 돌파 매도 시그널'
            });
            isInBollingerPosition = false; // 매도 상태로 변경
          }
        }

        setBollingerBandSignals(bollingerSignals);
        setBollingerBandSignalInfo(bollingerSignalInfoTemp);

        rsiValues.forEach((item, index) => {
          const previousRSI = rsiValues[index - 1]?.y;

          // 30을 넘을 때 매수 시그널
          if (!isInRSIBuyPosition && previousRSI <= 30 && item.y > 30) {
            rsiSignalsTemp.push({
              x: item.x,
              label: {
                text: 'RSI Buy',
                style: {
                  color: "#00FF00",
                  background: "#000000"
                }
              },
              marker: {
                size: 6,
                fillColor: "#00FF00",
                strokeColor: "#00FF00",
                shape: "triangle",
                position: 'below'
              }
            });

            rsiSignalInfoTemp.push({
              type: '매수',
              date: new Date(item.x).toLocaleDateString(),
              price: item.close.toFixed(2),
              info: 'RSI 30 돌파 매수 시그널'
            });
            isInRSIBuyPosition = true; // 매수 상태로 변경
          }

          // 70을 하락할 때 매도 시그널
          if (isInRSIBuyPosition && previousRSI >= 70 && item.y < 70) {
            rsiSignalsTemp.push({
              x: item.x,
              label: {
                text: 'RSI Sell',
                style: {
                  color: "#FF0000",
                  background: "#000000"
                }
              },
              marker: {
                size: 6,
                fillColor: "#FF0000",
                strokeColor: "#FF0000",
                shape: "triangle",
                position: 'above'
              }
            });

            rsiSignalInfoTemp.push({
              type: '매도',
              date: new Date(item.x).toLocaleDateString(),
              price: item.close.toFixed(2),
              info: 'RSI 70 하락 매도 시그널'
            });
            isInRSIBuyPosition = false; // 매도 상태로 변경
          }
        });

        setRsiSignals(rsiSignalsTemp);
        setRsiSignalInfo(rsiSignalInfoTemp);


        // 200일 이동평균선을 돌파하는 매수 시그널 감지
        const buySignalTemp = [];
        data.forEach((item, index) => {
          if (index >= 200) {
            const currentClose = item.close;
            const currentMA200 = ma200[index - (data.length - ma200.length)]?.y;
            const previousClose = data[index - 1]?.close;
            const previousMA200 = ma200[index - 1 - (data.length - ma200.length)]?.y;

            // 주가가 200일 이동평균선을 돌파할 때 매수 시그널로 기록
            if (previousClose <= previousMA200 && currentClose > currentMA200) {
              buySignalTemp.push({
                date: item.date.toLocaleDateString(),
              });
            }
          }
        });
        setBuySignalInfo(buySignalTemp);

        // 20일선과 60일선 교차 시그널 감지
        const crossSignalsTemp = [];
        const signalInfoTemp = [];
        let isInBuyPosition = false; 

        data.forEach((item, index) => {
          if (index >= 60) {
            const currentMA20 = ma20[index - (data.length - ma20.length)]?.y;
            const previousMA20 = ma20[index - 1 - (data.length - ma20.length)]?.y;
            const currentMA60 = ma60[index - (data.length - ma60.length)]?.y;
            const previousMA60 = ma60[index - 1 - (data.length - ma60.length)]?.y;

            // 20일선이 60일선을 위로 돌파할 때 매수 시그널
            if (currentMA20 !== undefined && previousMA20 !== undefined && currentMA60 !== undefined && previousMA60 !== undefined) {
            if (!isInBuyPosition && previousMA20 <= previousMA60 && currentMA20 > currentMA60) {
              crossSignalsTemp.push({
                x: item.date.getTime(),
                label: {
                  text: 'Buy',
                  style: {
                    color: "#00FF00",
                    background: "#000000"
                  }
                },
                marker: {
                  size: 6,
                  fillColor: "#00FF00",
                  strokeColor: "#00FF00",
                  shape: "triangle",
                  position: 'below'
                }
              });

              signalInfoTemp.push({
                type: '매수',
                date: item.date.toLocaleDateString(),
              });
              isInBuyPosition = true; // 매수 상태로 변경
            }

            // 20일선이 60일선 아래로 하락할 때 매도 시그널
            if (isInBuyPosition && previousMA20 >= previousMA60 && currentMA20 < currentMA60) {
              crossSignalsTemp.push({
                x: item.date.getTime(),
                label: {
                  text: 'Sell',
                  style: {
                    color: "#FF0000",
                    background: "#000000"
                  }
                },
                marker: {
                  size: 6,
                  fillColor: "#FF0000",
                  strokeColor: "#FF0000",
                  shape: "triangle",
                  position: 'above'
                }
              });

              signalInfoTemp.push({
                type: '매도',
                date: item.date.toLocaleDateString(),
                price: currentMA20.toFixed(2),
              });
              isInBuyPosition = false; // 매도 상태로 변경
            }
          }
          }
        });

        console.log("Generated Buy/Sell Signals:", crossSignalsTemp);
        setCrossSignals(crossSignalsTemp);
        setSignalInfo(signalInfoTemp);

        
      } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
      }
    };
    fetchChartData();
  }, [ticker]);

  useEffect(() => {
    if (chartData.length > 0 && crossSignals.length > 0) {
      const backtestingValues = calculateBacktesting(chartData, crossSignals);
      setBacktestingDataMovingAverage(backtestingValues);
    }
  }, [chartData, crossSignals]);

  useEffect(() => {
    // RSI 시그널을 이용한 백테스팅 계산
    if (chartData.length > 0 && rsiSignals.length > 0) {
      const backtestingValuesRSI = calculateBacktesting(chartData, rsiSignals, 'RSI');
      setBacktestingDataRSI(backtestingValuesRSI);
    }
  }, [chartData, rsiSignals]);

  useEffect(() => {
    if (chartData.length > 0 && bollingerBandSignals.length > 0) {
      const backtestingValuesBollinger = calculateBacktesting(chartData, bollingerBandSignals, 'Bollinger');
      setBacktestingDataBollingerBands(backtestingValuesBollinger);
    }
  }, [chartData, bollingerBandSignals]);

  return (
    <>
      <GlobalStyle />
      <DetailContainer>
        <TickerTitle>{ticker}</TickerTitle>
        <ChartContainer>
          <Chart
            options={{
              chart: {
                type: 'candlestick',
                height: 350
              },
              title: {
                text: `${ticker} Candlestick Chart with Moving Averages and Buy/Sell Signals`,
                align: 'left'
              },
              xaxis: {
                type: 'datetime',
                min: chartData.length > 0 ? new Date(chartData[0].date).getTime() : undefined,
                max: chartData.length > 0 ? new Date(chartData[chartData.length - 1].date).getTime() : undefined
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
              },
              stroke: {
                width: [1, 1, 1, 1, 1, 2],
                curve: 'smooth'
              },
              colors: ['#FF5733', '#33FF57', '#3357FF', '#F5B041', '#AF7AC5'],
              legend: {
                show: true,
                labels: {
                  useSeriesColors: true
                }
              },
              grid: {
                show: false
              },
              annotations: {
                xaxis: [...crossSignals] 
              }
            }}
            series={[
              {
                name: 'Candlestick',
                type: 'candlestick',
                data: chartData.map(item => ({
                  x: item.date.getTime(),
                  y: [item.open, item.high, item.low, item.close]
                }))
              },
              {
                name: '5-Day MA',
                type: 'line',
                data: movingAverages.ma5
              },
              {
                name: '20-Day MA',
                type: 'line',
                data: movingAverages.ma20
              },
              {
                name: '60-Day MA',
                type: 'line',
                data: movingAverages.ma60
              },
              {
                name: '120-Day MA',
                type: 'line',
                data: movingAverages.ma120
              },
              {
                name: '200-Day MA',
                type: 'line',
                data: movingAverages.ma200
              }
            ]}
            height={350}
          />
        </ChartContainer>

        {/* 20일선과 60일선 교차 시그널 정보 출력 */}
        <SignalList>
          <h3>20일선과 60일선을 이용한 매수/매도 시그널</h3>
          {signalInfo.length > 0 ? (
            <ul>
              {signalInfo.map((signal, index) => (
                <li key={index}>
                  {signal.type} 시그널 - Date: {signal.date}
                </li>
              ))}
            </ul>
          ) : (
            <p>No 20/60-day cross signals found.</p>
          )}
        </SignalList>

        {/* RSI 차트 표현 */}
        <RSIChartContainer>
          <Chart
            options={{
              chart: {
                type: 'line',
                height: 200
              },
              title: {
                text: 'RSI (Relative Strength Index)',
                align: 'left'
              },
              xaxis: {
                type: 'datetime'
              },
              yaxis: {
                min: 0,
                max: 100,
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
              },
              stroke: {
                width: 2,
                curve: 'smooth'
              },
              grid: {
                show: true
              }
            }}
            series={[
              {
                name: 'RSI',
                data: rsiData 
              }
            ]}
            height={200}
          />
        </RSIChartContainer>

        {/* RSI 시그널에 대한 주가 차트 표현 */}
        <RSISignalChartContainer>
          <Chart
            options={{
              chart: {
                type: 'candlestick',
                height: 350
              },
              title: {
                text: `${ticker} Candlestick Chart with RSI Signals`,
                align: 'left'
              },
              xaxis: {
                type: 'datetime',
                min: chartData.length > 0 ? new Date(chartData[0].date).getTime() : undefined,
                max: chartData.length > 0 ? new Date(chartData[chartData.length - 1].date).getTime() : undefined
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
              },

              annotations: {
                xaxis: [...rsiSignals]
              }
            }}
            series={[
              {
                name: 'Candlestick',
                type: 'candlestick',
                data: chartData.map(item => ({
                  x: item.date.getTime(),
                  y: [item.open, item.high, item.low, item.close]
                }))
              }
            ]}
            height={350}
          />
        </RSISignalChartContainer>

        {/* RSI 매수/매도 시그널 정보 출력 */}
        <SignalList>
          <h3>RSI 매수/매도 시그널</h3>
          {rsiSignalInfo.length > 0 ? (
            <ul>
              {rsiSignalInfo.map((signal, index) => (
                <li key={index}>
                  {signal.type} 시그널 - Date: {signal.date}
                </li>
              ))}
            </ul>
          ) : (
            <p>No RSI signals found.</p>
          )}
        </SignalList>

        {/* Bollinger Bands 차트 표현 */}
        <BollingerChartContainer>
          <Chart
            options={{
              chart: {
                type: 'candlestick',
                height: 350
              },
              title: {
                text: `${ticker} Bollinger Bands`,
                align: 'left'
              },
              xaxis: {
                type: 'datetime',
                min: chartData.length > 0 ? new Date(chartData[0].date).getTime() : undefined,
                max: chartData.length > 0 ? new Date(chartData[chartData.length - 1].date).getTime() : undefined
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
              },
              stroke: {
                width: 1,
                curve: 'smooth'
              },
              colors: ['#FF5733', '#33FF57', '#3357FF'],
              annotations: {
                xaxis: [...bollingerBandSignals] 
              }
            }}
            series={[
              {
                name: 'Candlestick',
                type: 'candlestick',
                data: chartData.map(item => ({
                  x: item.date.getTime(),
                  y: [item.open, item.high, item.low, item.close]
                }))
              },
              {
                name: 'Upper Band',
                type: 'line',
                data: bollingerBands.map(item => ({
                  x: item.x,
                  y: item.upper
                }))
              },
              {
                name: 'Middle Band',
                type: 'line',
                data: bollingerBands.map(item => ({
                  x: item.x,
                  y: item.middle
                }))
              },
              {
                name: 'Lower Band',
                type: 'line',
                data: bollingerBands.map(item => ({
                  x: item.x,
                  y: item.lower
                }))
              }
            ]}
            height={350}
          />
        </BollingerChartContainer>

        {/* Bollinger 매수/매도 시그널 정보 출력 */}
        <SignalList>
          <h3>볼린저 밴드 매수/매도 시그널</h3>
          {bollingerBandSignalInfo.length > 0 ? (
            <ul>
              {bollingerBandSignalInfo.map((signal, index) => (
                <li key={index}>
                  {signal.type} 시그널 - Date: {signal.date}, 
                  Lower Band: {signal.lower}, Upper Band: {signal.upper}
                </li>
              ))}
            </ul>
          ) : (
            <p>No Bollinger Band signals found.</p>
          )}
        </SignalList>

        <div style={{ width: "80%", marginTop: "30px" }}>
        <Chart
          options={{
            chart: {
              type: "line",
              height: 350
            },
            title: {
              text: `${ticker} Capital Change Backtesting`,
              align: "left"
            },
            xaxis: {
              type: "datetime"
            },
            yaxis: {
              labels: {
                formatter: (value) => value.toFixed(2)
              }
            },
            tooltip: {
              theme: "dark",
              style: {
                fontSize: "12px",
                colors: ["#000"]
              },
              y: {
                formatter: (value) => value.toFixed(2)
              }
            }
          }}
          series={[ 

            {
              name: "Capital (20일 & 60일 이동평균선)",
              data: backtestingDataMovingAverage 

            },
            {
              name: "Capital (RSI)",
              data: backtestingDataRSI
            },
            {
              name: "Capital (Bollinger Bands)",
              data: backtestingDataBollingerBands
            }
          ]}
          height={350}
        />
      </div>

      </DetailContainer>
    </>
  );
}

export default StockDetailPage;
