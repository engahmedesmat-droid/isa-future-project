const E = require('./js/engine'); const AI = require('./js/ai');
function count(s,c){let n=s.bar[c]+s.off[c];for(const p of s.pts){if(p.o===c)n+=p.n;else if(p.o===1-c)n+=p.p;}return n;}
for (const variant of ['3ada','mahbusa']) {
  let games=0, turnsTotal=0, stuck=0, t0=Date.now();
  for (let g=0; g<20; g++) {
    let s=E.newState(variant), c=Math.floor(Math.random()*2), turns=0;
    while (s.off[0]<15 && s.off[1]<15 && turns<3000) {
      const a=1+Math.floor(Math.random()*6), b=1+Math.floor(Math.random()*6);
      const dice=E.diceFor(a,b);
      const t=AI.chooseTurn(s,c,dice,'normal');
      if (t) { for (const m of t.seq) E.doMove(s,c,m);
        // verify with legalMoves step-by-step consistency
      }
      for (const k of [0,1]) if (count(s,k)!==15) throw new Error(variant+' checker count broke for '+k+' '+JSON.stringify(s));
      c=1-c; turns++;
    }
    if (turns>=3000) stuck++; else games++; turnsTotal+=turns;
  }
  console.log(variant,'finished',games,'stuck',stuck,'avg turns',(turnsTotal/20).toFixed(0),'ms',Date.now()-t0);
}
// rule checks
let s=E.newState('3ada');
console.log('opening 3-1 moves for p0:',E.legalMoves(s,0,[3,1]).length,' 6-6:',E.legalMoves(s,0,[6,6,6,6]).length);
