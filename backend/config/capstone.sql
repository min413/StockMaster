-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.31 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- capstone 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `capstone` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `capstone`;

-- 테이블 capstone.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) DEFAULT NULL,
  `user_pw` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `user_salt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `favorite` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `portfolio` varchar(9999) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 capstone.users:~10 rows (대략적) 내보내기
INSERT INTO `users` (`id`, `user_name`, `user_pw`, `user_salt`, `nickname`, `favorite`, `portfolio`) VALUES
	(1, 'test', 'test', NULL, NULL, 'test', 'test'),
	(2, 'test1', NULL, 'ee54+RoQRX+U4L7j+3gFhk715Iu4f8TD6HF2SMRSLQfW1wjETyS3WmAHmJH0SJ4egpG1bdj5qfDEod+9V2k5zQ==', 'test1', '[{"ticker":"AAPL","error":true},{"ticker":"TSLA","error":true},{"ticker":"005930.KS","error":true}]', NULL),
	(3, 'test2', 'DhcbXdiGdpUWl2Y32Hhqn1ikdZhrQCZPqvklJX5f5ExkqrCOkRsXyRmDQYuiJ+7k82Dc5k6uBFJ7dI88hfnHzA==', 'X8MU+NJpdymkdZyZlcRh8NFGoPGXB17V9kwtgKAfqTtu5AtX4nPXNKHvUFEIpG//mXpmVDhHlDKvA3NLC9f3SQ==', 'test2', '[{"ticker":"AAPL","last_close":216.7899932861328,"latest_close":220.69000244140625,"latest_div":"N/A","latest_div_date":"N/A"},{"ticker":"QQQ","last_close":473.489990234375,"latest_close":471.44000244140625,"latest_div":"N/A","latest_div_date":"N/A"}]', ''),
	(4, NULL, NULL, 'OjuaQ1h7Gbo8BsS602k2uUv8QhTuWXgZ4v1OiUcF4TRL95gcnygZGtIsefk2X6n4+9lGUrlZM70JKfSWaRaqVg==', NULL, '["AAPL"]', NULL),
	(5, NULL, NULL, 'faAsaVYCuPxh61oCnzUCvEQTpCM50bMmM812aL+YorUa70C5tL6uuywkAu4fjhN1JzrmdYObAjnTMtkEaztm4A==', NULL, '["AAPL"]', NULL),
	(6, 'test11', 'ZLNeUwaniVHjCkAtN0GTLp48Ds0p8OzKpxO9aBKMuV++DAQ0DkVP0X4CynFuznYu6sq0uFP0knOHLusFBeYo+w==', 'rQbTnwLoiZ+i2AhfxviCLk3wu/OtmVzNeKZ7gDyGrtmdvDEK6twitPWHtzUMSRvylQvGHl6Ih1ec9PYxFT/OBA==', 'test11', '["AAPL","TSLA","MSFT","005930.KS"]', '[{"ticker":"MSFT","quantity":1,"avgPrice":111,"currentPrice":416.1199951171875,"last_close":411.4599914550781,"latest_close":414.1300048828125,"predictedRisk":0.015702041964311977,"volatility":0.017472002159143837,"beta":1.253217552729953,"historical_risk":0.010592994860823855},{"ticker":"NVDA","quantity":1,"avgPrice":111,"currentPrice":135.72000122070312,"last_close":139.91000366210938,"latest_close":143.6999969482422,"predictedRisk":0.024057844818310987,"volatility":0.035463408849884574,"beta":2.311409743911788,"historical_risk":0.02451358854821268},{"ticker":"GOOGL","quantity":1,"avgPrice":111,"currentPrice":165.16000366210938,"last_close":169.74000549316406,"latest_close":174.36639404296875,"predictedRisk":0.016313702739391867,"volatility":0.020257254684807068,"beta":1.3264410577060546,"historical_risk":0.01393117619025981},{"ticker":"AMZN","quantity":1,"avgPrice":111,"currentPrice":186.88999938964844,"last_close":199.5,"latest_close":200.30490112304688,"predictedRisk":0.018283784403640556,"volatility":0.024059150904071694,"beta":1.582098366665462,"historical_risk":0.016466900873832985},{"ticker":"V","quantity":1,"avgPrice":111,"currentPrice":287.5199890136719,"last_close":293.2900085449219,"latest_close":305.7650146484375,"predictedRisk":0.012814364959808127,"volatility":0.014391098308803963,"beta":0.878288075378179,"historical_risk":0.010596278702790824},{"ticker":"SPY","quantity":1,"avgPrice":111,"currentPrice":583.4500122070312,"last_close":576.7000122070312,"latest_close":588.411376953125,"predictedRisk":0.01372821409663453,"volatility":0.011089525929628063,"beta":0.9995728079777553,"historical_risk":0.0003978220441588493},{"ticker":"AAPL","quantity":1,"avgPrice":111,"currentPrice":231.7449951171875,"last_close":223.4499969482422,"latest_close":225.27999877929688,"predictedRisk":0.015498892939709272,"volatility":0.017398437349917466,"beta":1.2270940545755173,"historical_risk":0.01084486573046928},{"ticker":"TSLA","quantity":1,"avgPrice":111,"currentPrice":219.44500732421875,"last_close":251.44000244140625,"latest_close":289.3994140625,"error":true,"predictedRisk":0.021166344068845943,"volatility":0.03838362187582981,"beta":1.9166945108144438,"historical_risk":0.03196424785924426},{"ticker":"KO","quantity":1,"avgPrice":111,"currentPrice":70.20999908447266,"last_close":65.37000274658203,"latest_close":64.06759643554688,"predictedRisk":0.009048086380248737,"volatility":0.009997444949890575,"beta":0.4130659672625174,"historical_risk":0.00888679513448199},{"ticker":"ASML","quantity":1,"avgPrice":11,"currentPrice":698.3599853515625,"last_close":676.4600219726562,"latest_close":668.0499877929688,"predictedRisk":0.020385529840438642,"volatility":0.02765851030993209,"beta":1.8523270736374478,"historical_risk":0.01852634946646861},{"ticker":"AVGO","quantity":1,"avgPrice":111,"currentPrice":183.64500427246094,"last_close":173.89999389648438,"latest_close":178.67999267578125,"predictedRisk":0.01785216541140932,"volatility":0.02445370238281214,"beta":1.5222201369266166,"historical_risk":0.017696015108906962},{"ticker":"AMD","quantity":1,"avgPrice":111,"currentPrice":157.08009338378906,"last_close":141.66000366210938,"latest_close":144.4376983642578,"predictedRisk":0.02236468121995631,"volatility":0.03360340076272226,"beta":2.097227104670666,"historical_risk":0.024259491344884632},{"ticker":"JPM","quantity":1,"avgPrice":111,"currentPrice":224.6750030517578,"last_close":221.49000549316406,"latest_close":239.19000244140625,"predictedRisk":0.012567910845473068,"volatility":0.015187411051654843,"beta":0.8389746890433418,"historical_risk":0.01200556793033694},{"ticker":"UNH","quantity":1,"avgPrice":111,"currentPrice":567.739990234375,"last_close":567.030029296875,"latest_close":596.8900146484375,"predictedRisk":0.009529996321887342,"volatility":0.014634708936408296,"beta":0.45762660078287015,"historical_risk":0.013727040272425143},{"ticker":"INTC","quantity":1,"avgPrice":111,"currentPrice":22.540000915527344,"last_close":23.31999969482422,"latest_close":24.360000610351562,"predictedRisk":0.016704362705802688,"volatility":0.026640440694414298,"beta":1.3721236884237922,"historical_risk":0.021869626770086744},{"ticker":"O","quantity":20,"avgPrice":20,"currentPrice":58.81999969482422,"last_close":58.81999969482422,"latest_close":57.29999923706055,"predictedRisk":0.00996127554892999}]'),
	(7, 'test12', 'v6gGrm7bNIHtA1rW3G9UNkHHVXCcIOBt/Rd86Z4erTXeWZNQ1N0kHBEBGGBr927LG8XKU7je8CqZN2YarIMTRA==', '/8f3O7d1/OkIwSUBVFQvc0BFlz96TIbkpvh0nIFfooDsFoBWZroZ5s1so9U1pdjXZGwHwhbe2HuXS4iklq3vXA==', 'test12', NULL, '[{"ticker":"AAPL","quantity":1,"avgPrice":111,"currentPrice":232.14999389648438,"last_close":231.77999877929688,"latest_close":232.14999389648438},{"ticker":"META","quantity":1,"avgPrice":111,"currentPrice":576.9299926757812,"last_close":576.7899780273438,"latest_close":576.9299926757812},{"ticker":"KO","quantity":1,"avgPrice":111,"currentPrice":69.9000015258789}]'),
	(8, 't1', '80fnhzElQ+ejJ194uQzGClshkRqV1Jde+Xv+MVAezF82EtnqdYhRtdhXsLPr1RLhgqu9iz32+LE/yeHPo3nBGg==', 'kbGd/PmNt+DEt54CceN9wMzionvQPrVByG/LQHNVBDTwtfzm/sYDvzlTTXg1+GwUekNOuvzNnSo+OB03k/3xlQ==', 't1', '["AAPL","MSTR"]', '[{"ticker":"SPY","quantity":1,"avgPrice":111,"currentPrice":593.7905883789062,"last_close":590.5,"latest_close":593.6400146484375,"predictedRisk":0.017094727559901317},{"ticker":"AAPL","quantity":1,"avgPrice":111,"currentPrice":229.67999267578125,"last_close":229,"latest_close":229.6999969482422,"predictedRisk":0.020267544180293938},{"ticker":"META","quantity":1,"avgPrice":111,"currentPrice":561.52001953125,"last_close":565.52001953125,"latest_close":561.0001220703125,"predictedRisk":0.027603513535905996},{"ticker":"MSFT","quantity":1,"avgPrice":111,"currentPrice":415.510009765625,"last_close":415.489990234375,"latest_close":415.1199951171875,"predictedRisk":0.020751073854965607},{"ticker":"O","quantity":1,"avgPrice":111,"currentPrice":57.32500076293945,"last_close":56.880001068115234,"latest_close":57.313899993896484,"predictedRisk":0.010048368914335953},{"ticker":"005930.KS","quantity":1,"avgPrice":111,"currentPrice":56400,"last_close":55300,"latest_close":56400,"predictedRisk":0.00710870950626648},{"ticker":"TSLA","quantity":1,"avgPrice":111,"currentPrice":342.860107421875,"last_close":342.0299987792969,"latest_close":343,"predictedRisk":0.031055772611095912},{"ticker":"COIN","quantity":1,"avgPrice":111,"currentPrice":308.87298583984375,"last_close":320.010009765625,"latest_close":307.7900085449219,"predictedRisk":0.04530393362395313},{"ticker":"IONQ","quantity":1,"avgPrice":111,"currentPrice":31.969999313354492,"last_close":28.860000610351562,"latest_close":31.889999389648438,"predictedRisk":0.04099687334446982},{"ticker":"MO","quantity":1,"avgPrice":111,"currentPrice":56.45500183105469,"last_close":55.97999954223633,"latest_close":56.380001068115234,"predictedRisk":0.006911053640863331},{"ticker":"MSTR","quantity":1,"avgPrice":111,"currentPrice":467.3949890136719,"last_close":473.8299865722656,"latest_close":461.5150146484375,"predictedRisk":0.04417900142733364},{"ticker":"AMZN","quantity":10,"avgPrice":200,"currentPrice":199.1750030517578}]'),
	(9, 'q1', 'W4KtEOv3UUKQ3i2GzCIMe8lCQnHVT1fJgpZ5BtK+qLUD5WHnz/0+rBvfsnnf98Nu34z3Sb9d+NfD6S8KSCLjww==', 'RTisCSJ283Gz3S2Pp6qtyAurRcaa8qu5AEnMKFaNl5PYMY4WoewWSGNG+8/8tK133ox0NotMvPOmEaJGTkdoLQ==', 'q1', '["COIN"]', '[{"ticker":"SPY","quantity":1,"avgPrice":111,"currentPrice":597.1900024414062,"last_close":590.2999877929688,"latest_close":590.5,"predictedRisk":0.012861400763723389},{"ticker":"O","quantity":1,"avgPrice":50,"currentPrice":56.900001525878906,"last_close":57.18000030517578,"latest_close":56.880001068115234,"predictedRisk":0.004546940214958141},{"ticker":"AAPL","quantity":1,"avgPrice":111,"currentPrice":225.1199951171875,"last_close":228.27999877929688,"latest_close":229,"predictedRisk":0.01660515705946618}]'),
	(10, 'w1', 'u/mzCmBg9v8KkB+nD+nNSU/GLlWGGR6BgwV7tZTU+qsWYq7o/jbOU+SNPehJv6N33HvCnBT8D2Yg5+vRxZu3sw==', 'fMqX6WwJabFQ50uObt+PKwyjkmafjfSWTH9cIln5PDiulC5A6nOayCpQJJ+CXJOTINNTXoWG5CIUJQmBukGSzg==', 'w1', '["AAPL"]', '[{"ticker":"SPY","quantity":1,"avgPrice":111,"currentPrice":587.52001953125},{"ticker":"COIN","quantity":10,"avgPrice":111,"currentPrice":327.6700134277344},{"ticker":"MSTR","quantity":10,"avgPrice":111,"currentPrice":479.9800109863281},{"ticker":"TSLA","quantity":1,"avgPrice":111,"currentPrice":341.1099853515625}]');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;