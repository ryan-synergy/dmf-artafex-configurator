/* Regression harness for the DMF Artafex Field Configurator.
   Run: npm test  (requires `npm install` once for jsdom)
   Verifies SKU assembly against printed spec-sheet examples (both lines)
   and runs a jsdom DOM smoke. Exits non-zero on any failure. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'DMF_Artafex4_Field_Configurator.html');
const html = fs.readFileSync(htmlPath, 'utf8');

let fails = 0;
const ok = (name, cond) => { console.log((cond ? '  ✓ ' : '  ✗ ') + name); if (!cond) fails++; };

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });
const w = dom.window;
const store = {};
Object.defineProperty(w, 'localStorage', { value: { getItem: k => store[k] || null, setItem: (k, v) => store[k] = v, removeItem: k => delete store[k] } });

setTimeout(() => {
  try {
    const gk = w.groupKit;
    const skus = g => gk(g).map(l => l.sku).join(' + ');
    const has = (g, s) => skus(g).includes(s);
    const A4 = o => Object.assign({ line: '4', app: 'new', shape: 'R', install: 'NC', rating: 'S', mType: 'D', lumens: '10', cct: '30', beam: 'NS', dim: 'T', mFin: '', tStyle: 'S', tFin: 'WH', tOpt: '' }, o);
    const A2 = o => Object.assign({ line: '2', app: 'new', shape: 'R', install: 'NC', mType: 'D', lumens: '07', cct: '27', beam: 'NS', dim: 'T', tStyle: 'S', tFin: 'WH', tOpt: 'MF' }, o);

    console.log('Artafex 4 SKU assembly:');
    ok('housing M4NCRS', has(A4({}), 'M4NCRS'));
    ok('housing square fire-rated M4NCSF', has(A4({ shape: 'S', rating: 'F' }), 'M4NCSF'));
    ok('concrete M4CC', has(A4({ install: 'CC' }), 'M4CC'));
    ok('module ART4D07T27GAT', has(A4({ lumens: '07', cct: '27', beam: 'GA' }), 'ART4D07T27GAT'));
    ok('module PhaseX ART4D10TT1GAX', has(A4({ cct: 'T1', beam: 'GA', dim: 'X' }), 'ART4D10TT1GAX'));
    ok('trim M4TRSWHFL + mud plate', has(A4({ tOpt: 'FL' }), 'M4TRSWHFL') && has(A4({ tOpt: 'FL' }), 'M4XRMUD'));
    ok('retrofit DRD2TR6SWH', has({ line: '4', app: 'retro', shape: 'R', rAper: '6', rStyle: 'S', rFin: 'WH', mType: 'D', lumens: '10', cct: '30', beam: 'NS', dim: 'T' }, 'DRD2TR6SWH'));

    console.log('Artafex 2 SKU assembly:');
    ok('housing X2NCR', has(A2({}), 'X2NCR'));
    ok('module ART2D07T27NST', has(A2({}), 'ART2D07T27NST'));
    ok('module PhaseX ART2D10TT1SPX', has(A2({ lumens: '10', cct: 'T1', beam: 'SP', dim: 'X' }), 'ART2D10TT1SPX'));
    ok('trim X2TRDSWHMF', has(A2({}), 'X2TRDSWHMF'));
    ok('trim flangeless X2TRDSWHFL + mud kit', has(A2({ tOpt: 'FL' }), 'X2TRDSWHFL') && has(A2({ tOpt: 'FL' }), 'X2KRMUD'));
    ok('remodel digital X2RDR', has(A2({ install: 'RM', dim: 'X' }), 'X2RDR'));
    ok('remodel TRIAC X2RMR', has(A2({ install: 'RM', dim: 'T' }), 'X2RMR'));
    ok('square trim X2TSDSWHMF', has(A2({ shape: 'S' }), 'X2TSDSWHMF'));
    ok('adjustable X2TRASWHMF + ART2A', has(A2({ mType: 'A' }), 'X2TRASWHMF') && has(A2({ mType: 'A' }), 'ART2A07T27NST'));
    ok('retrofit conv X2KRRETRO45', has({ line: '2', app: 'retro', shape: 'R', rAper: '45', mType: 'D', lumens: '10', cct: '30', beam: 'SP', dim: 'T', tStyle: 'S', tFin: 'WH', tOpt: 'MF' }, 'X2KRRETRO45'));

    console.log('DOM smoke:');
    const d = w.document, $ = s => [...d.querySelectorAll(s)], byText = (s, t) => $(s).find(b => b.textContent.trim() === t);
    byText('button', '+ Add room').click();
    byText('button', '+ Add lighting group').click();
    ok('renders an A4 group', d.getElementById('rooms').innerHTML.includes('ART4D'));
    byText('.seg', 'Artafex 2 · 2"').click();
    ok('line switch -> A2 (X2 + ART2)', d.getElementById('rooms').innerHTML.includes('X2NCR') && d.getElementById('rooms').innerHTML.includes('ART2'));
    let crashed = false; try { w.openReport(); } catch (e) { crashed = true; }
    ok('report opens without error', !crashed && d.getElementById('reportBody').innerHTML.includes('buy-list'));
    // user-entered text must be escaped in the report (names/notes go into innerHTML)
    w.JOB.rooms[0].name = '<img src=x onerror=1> Kitchen & "more"';
    w.JOB.rooms[0].groups[0].notes = 'note with <i>tags</i>';
    w.openReport();
    const rb = d.getElementById('reportBody');
    ok('report escapes user HTML', !rb.querySelector('img') && !rb.querySelector('i') &&
      rb.textContent.includes('<img src=x onerror=1> Kitchen & "more"') && rb.textContent.includes('note with <i>tags</i>'));

    console.log('Multi-job store:');
    const n0 = w.STORE.jobs.length;
    w.newJobBtn();
    ok('new job added + becomes current', w.STORE.jobs.length === n0 + 1 && w.JOB.id === w.STORE.currentId && w.JOB.rooms.length === 0);
    const firstId = w.STORE.jobs[0].id;
    w.switchJob(firstId);
    ok('switch back restores rooms', w.JOB.id === firstId && w.JOB.rooms.length === 1);
    w.dupJob(firstId);
    ok('duplicate creates independent copy', w.STORE.jobs.length === n0 + 2 &&
      w.STORE.jobs[n0 + 1].rooms[0].groups[0].id !== w.JOB.rooms[0].groups[0].id);
    w.openJobs();
    ok('jobs modal lists all jobs', d.querySelectorAll('#jobsList .jobrow').length === n0 + 2);
    ok('sync off by default (no fetch attempted)', !w.syncReady());
    const persisted = JSON.parse(w.localStorage.getItem('dmf_artafex_store_v1'));
    ok('store persists jobs', persisted && persisted.jobs.length === n0 + 2);

    // legacy single-job key migrates into the multi-job store on boot
    const legacy = { name: 'Legacy Walk', addr: '12 Main St', rooms: [{ id: 'r1', name: 'Hall', existing: [], groups: [{ id: 'g1', qty: 2, line: '4', app: 'new', shape: 'R', install: 'NC', rating: 'S', mType: 'D', lumens: '10', cct: '30', beam: 'NS', dim: 'T', tStyle: 'S', tFin: 'WH', tOpt: '' }] }] };
    const seed = '<script>localStorage.setItem("dmf_artafex4_job_v1",' + JSON.stringify(JSON.stringify(legacy)) + ');<\/script>';
    const dom2 = new JSDOM(html.replace('<script>', seed + '<script>'), { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });
    const w2 = dom2.window;
    ok('legacy job migrated', w2.STORE.jobs.length === 1 && w2.JOB.name === 'Legacy Walk' && w2.JOB.rooms.length === 1 && !!w2.JOB.id);
    ok('legacy key removed after migration', w2.localStorage.getItem('dmf_artafex4_job_v1') === null);

    console.log('\n' + (fails ? ('FAILED: ' + fails + ' check(s)') : 'ALL PASSED'));
    process.exit(fails ? 1 : 0);
  } catch (e) {
    console.error('RUNTIME ERROR:', e.message);
    process.exit(1);
  }
}, 300);
