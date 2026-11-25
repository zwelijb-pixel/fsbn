(() => {
  'use strict';
  const scriptBase = 'https://s3.tradingview.com/external-embedding/';
  const widget = (host, file, options, credit = 'Market data by TradingView', href = 'https://www.tradingview.com/markets/') => {
    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    const target = document.createElement('div');
    target.className = 'tradingview-widget-container__widget';
    container.append(target);
    const script = document.createElement('script');
    script.src = `${scriptBase}${file}`;
    script.async = true;
    script.textContent = JSON.stringify(options);
    script.onerror = () => { target.textContent = 'Market data is temporarily unavailable.'; };
    container.append(script);
    const attribution = document.createElement('a');
    attribution.className = 'market-attribution';
    attribution.href = href;
    attribution.target = '_blank';
    attribution.rel = 'noopener noreferrer';
    attribution.textContent = credit;
    container.append(attribution);
    host.replaceChildren(container);
  };
  const ticker = document.querySelector('[data-market-ticker]');
  if (ticker) widget(ticker, 'embed-widget-ticker-tape.js', {
    symbols: [
      {proName: 'JSE:J200', title: 'JSE Top 40'},
      {proName: 'SP:SPX', title: 'S&P 500'},
      {proName: 'NASDAQ:IXIC', title: 'Nasdaq Composite'},
      {proName: 'TVC:UKX', title: 'FTSE 100'},
      {proName: 'XETR:DAX', title: 'DAX'},
      {proName: 'FX_IDC:USDZAR', title: 'USD/ZAR'},
      {proName: 'TVC:GOLD', title: 'Gold'},
      {proName: 'TVC:UKOIL', title: 'Brent crude'},
      {proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin'}
    ], showSymbolLogo: true, colorTheme: 'light', isTransparent: false,
    displayMode: 'adaptive', locale: 'en'
  }, 'Track all markets on TradingView', 'https://www.tradingview.com/markets/');

  const charts = document.querySelector('[data-market-charts]');
  if (charts) {
    const instruments = [
      ['South Africa · JSE Top 40', 'JSE:J200', 'Africa/Johannesburg'],
      ['United States · S&P 500', 'SP:SPX'],
      ['United States · Nasdaq Composite', 'NASDAQ:IXIC'],
      ['United Kingdom · FTSE 100', 'TVC:UKX'],
      ['Germany · DAX', 'XETR:DAX'],
      ['Japan · Nikkei 225', 'TVC:NI225'],
      ['Commodities · Gold', 'TVC:GOLD'],
      ['Commodities · Brent crude', 'TVC:UKOIL'],
      ['Currency · US dollar / South African rand', 'FX_IDC:USDZAR'],
      ['Digital assets · Bitcoin / US dollar', 'BITSTAMP:BTCUSD']
    ];
    instruments.forEach(([label, symbol, timezone = 'Etc/UTC']) => {
      const section = document.createElement('section');
      section.className = 'market-chart';
      const heading = document.createElement('h4');
      heading.textContent = label;
      const frame = document.createElement('div');
      frame.className = 'chart-frame';
      section.append(heading, frame);
      charts.append(section);
      widget(frame, 'embed-widget-advanced-chart.js', {
        autosize: true, symbol, interval: 'D', timezone, theme: 'light',
        style: '1', locale: 'en', allow_symbol_change: true,
        calendar: false, hide_side_toolbar: true, withdateranges: true,
        details: false, hotlist: false, save_image: false, studies: [],
        support_host: 'https://www.tradingview.com'
      }, `${symbol} chart by TradingView`, `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`);
    });
  }

  const news = document.querySelector('[data-market-news]');
  if (news) widget(news, 'embed-widget-timeline.js', {
    feedMode: 'all_symbols', colorTheme: 'light', isTransparent: false,
    displayMode: 'regular', width: '100%', height: 600, locale: 'en'
  }, 'Top stories by TradingView', 'https://www.tradingview.com/news/top-providers/tradingview/');
})();
