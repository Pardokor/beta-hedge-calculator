const { useState } = React;
const { Calculator, TrendingUp, Upload, AlertCircle, BarChart3, ArrowRight } = lucideReact;

function CompleteBetaHedgeCalculator() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [asset1Data, setAsset1Data] = useState('');
  const [asset2Data, setAsset2Data] = useState('');
  const [betaResults, setBetaResults] = useState(null);
  const [period, setPeriod] = useState(30);
  const [capital, setCapital] = useState(10000);
  const [asset1Vol, setAsset1Vol] = useState(70);
  const [asset2Vol, setAsset2Vol] = useState(90);
  const [leverage, setLeverage] = useState(1);
  const [useBetaFromCalc, setUseBetaFromCalc] = useState(false);

  const parsePriceData = (text) => {
    const lines = text.trim().split('\n');
    const prices = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      if (line.includes(',')) {
        const parts = line.split(',');
        const price = parseFloat(parts[parts.length - 1]);
        if (!isNaN(price)) prices.push(price);
      } else {
        const price = parseFloat(line);
        if (!isNaN(price)) prices.push(price);
      }
    }
    return prices;
  };

  const calculateReturns = (prices) => {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const ret = (prices[i] - prices[i-1]) / prices[i-1];
      returns.push(ret);
    }
    return returns;
  };

  const calculateVolatility = (returns) => {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const dailyVol = Math.sqrt(variance);
    const annualizedVol = dailyVol * Math.sqrt(365) * 100;
    return { dailyVol, annualizedVol };
  };

  const calculateBeta = (returns1, returns2) => {
    const n = Math.min(returns1.length, returns2.length);
    const mean1 = returns1.slice(0, n).reduce((sum, r) => sum + r, 0) / n;
    const mean2 = returns2.slice(0, n).reduce((sum, r) => sum + r, 0) / n;
    let covariance = 0;
    let variance1 = 0;
    for (let i = 0; i < n; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
    }
    covariance /= n;
    variance1 /= n;
    const beta = covariance / variance1;
    let variance2 = 0;
    for (let i = 0; i < n; i++) {
      variance2 += Math.pow(returns2[i] - mean2, 2);
    }
    variance2 /= n;
    const correlation = covariance / (Math.sqrt(variance1) * Math.sqrt(variance2));
    const rSquared = correlation * correlation;
    return { beta, rSquared, correlation };
  };

  const calculateMetrics = () => {
    try {
      const prices1 = parsePriceData(asset1Data);
      const prices2 = parsePriceData(asset2Data);
      if (prices1.length < 2 || prices2.length < 2) {
        alert('Besoin au moins 2 prix pour chaque actif');
        return;
      }
      if (prices1.length !== prices2.length) {
        alert('Les deux actifs doivent avoir le même nombre de données');
        return;
      }
      const returns1 = calculateReturns(prices1);
      const returns2 = calculateReturns(prices2);
      const vol1 = calculateVolatility(returns1);
      const vol2 = calculateVolatility(returns2);
      const betaStats = calculateBeta(returns1, returns2);
      const results = {
        asset1: { prices: prices1.length, volatility: vol1.annualizedVol, dailyVol: vol1.dailyVol * 100 },
        asset2: { prices: prices2.length, volatility: vol2.annualizedVol, dailyVol: vol2.dailyVol * 100 },
        beta: betaStats.beta,
        rSquared: betaStats.rSquared,
        correlation: betaStats.correlation,
        volRatio: vol2.annualizedVol / vol1.annualizedVol
      };
      setBetaResults(results);
      setAsset1Vol(vol1.annualizedVol);
      setAsset2Vol(vol2.annualizedVol);
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const generateSampleData = () => {
    let ethPrice = 3500;
    const ethPrices = [ethPrice];
    for (let i = 0; i < period - 1; i++) {
      ethPrice *= (1 + (Math.random() - 0.5) * 0.03);
      ethPrices.push(ethPrice);
    }
    let solPrice = 140;
    const solPrices = [solPrice];
    for (let i = 0; i < period - 1; i++) {
      solPrice *= (1 + (Math.random() - 0.5) * 0.04);
      solPrices.push(solPrice);
    }
    setAsset1Data(ethPrices.map(p => p.toFixed(2)).join('\n'));
    setAsset2Data(solPrices.map(p => p.toFixed(2)).join('\n'));
  };

  const useBetaResults = () => {
    if (betaResults) {
      setActiveTab('calculator');
      setUseBetaFromCalc(true);
    }
  };

  const betaAsset2 = useBetaFromCalc && betaResults ? betaResults.beta : (asset2Vol / asset1Vol);
  const totalCapitalPerSide = capital / 2;
  const ethLongSize = totalCapitalPerSide / (1 + betaAsset2);
  const solShortSize = ethLongSize * betaAsset2;
  const ethShortSize = ethLongSize;
  const solLongSize = solShortSize;
  const ethLongSizeLev = ethLongSize * leverage;
  const solShortSizeLev = solShortSize * leverage;
  const ethShortSizeLev = ethShortSize * leverage;
  const solLongSizeLev = solLongSize * leverage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tout le reste du JSX identique à l'artifact */}
      </div>
    </div>
  );
}

ReactDOM.render(<CompleteBetaHedgeCalculator />, document.getElementById('root'));
