import WebSocket from 'ws';

(async () => {
  console.log('[1] Listing CDP targets...');
  const list = await fetch('http://127.0.0.1:9333/json').then(r => r.json());
  const page = list.find(t => t.type === 'page');
  if (!page) {
    console.error('No CDP page target found. Is browser running?');
    process.exit(1);
  }
  console.log(`[+] Found page: ${page.title}`);

  console.log('\n[2] Connecting to CDP WebSocket...');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  
  let msgId = 1;
  const send = (method, params = {}) => {
    const msg = { id: msgId++, method, params };
    ws.send(JSON.stringify(msg));
    return new Promise(res => {
      const handler = (evt) => {
        let d;
        try {
          d = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
        } catch (e) {
          console.error('Parse error:', e, 'data:', evt.data);
          return;
        }
        if (d && d.id === msgId - 1) {
          ws.removeEventListener('message', handler);
          res(d);
        }
      };
      ws.on('message', handler);
    });
  };

  ws.on('open', async () => {
    console.log('[+] CDP connected. Navigating to Account Chooser...\n');
    
    await send('Page.navigate', {
      url: 'https://accounts.google.com/AccountChooser?continue=https://gemini.google.com/app'
    });
    
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('[3] Evaluating page for account list...');
    const acctList = await send('Runtime.evaluate', {
      expression: 'document.body.innerText',
      returnByValue: true
    });
    
    const text = acctList.result.value;
    console.log('Page text sample:\n', text.slice(0, 300), '\n');
    
    if (text.includes('Vũ Skool Edu') || text.includes('skool.edu.vn')) {
      console.log('[+] Found "Vũ Skool Edu" account. Clicking...\n');
      
      const clickRes = await send('Runtime.evaluate', {
        expression: `
          const els = Array.from(document.querySelectorAll('[role="link"], a, li, button'));
          const acct = els.find(e => e.innerText.includes('Vũ Skool Edu') || e.innerText.includes('skool.edu.vn'));
          if (acct) {
            acct.click();
            'Clicked';
          } else {
            'NOT_FOUND';
          }
        `,
        returnByValue: true
      });
      
      console.log('Click result:', clickRes.result.value);
      
      console.log('[4] Waiting for Gemini app to load (~11s)...');
      await new Promise(r => setTimeout(r, 11000));
      
      console.log('[5] Checking if in /app with editor...');
      const urlCheck = await send('Runtime.evaluate', {
        expression: 'document.location.href',
        returnByValue: true
      });
      
      console.log('Current URL:', urlCheck.result.value);
      
      if (urlCheck.result.value.includes('/app')) {
        console.log('\n✅ SUCCESS: Gemini app loaded, Account Chooser complete.');
        console.log('Ready to create images via gemini-image.mjs.\n');
      } else {
        console.log('\n⚠️  WARNING: Not yet in /app. Gemini may still be loading. Wait a bit more and retry.');
      }
    } else {
      console.error('✗ "Vũ Skool Edu" NOT found in Account Chooser. Check page text above.');
      process.exit(1);
    }
    
    ws.close();
  });

  ws.on('error', err => {
    console.error('WS error:', err);
    process.exit(1);
  });
})();
