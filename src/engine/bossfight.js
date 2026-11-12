// ════════════════════════════════════════════════════════════════
//  BOSSFIGHT (V177) — the guardians fight like guardians. A remastered boss no longer stands and trades:
//   · its guard is up — a blow on it while it stalks or winds up only chips (×0.3, "Armoured")
//   · it strikes in COMBOS you read: each blow paints the floor where it will land (amber: guard or parry it;
//     red: it cannot be blocked — get out), the paint fills as the blow comes, and it locks its aim a beat before
//   · it OPENS: after a combo it must recover; a heavy blow that whiffs leaves it overreached; a parried blow, or a
//     roll straight through one (a perfect dodge), staggers it — and then your blade bites in full, half again more
//   · three PHASES (at two-thirds and a third): it roars (no blade touches it), a shockwave rolls out (jump it), and the
//     arena turns — chains sweep the hall, the shadows multiply, the floor floods, the roots wake
//   · each has its SIGNATURE: the Imp's swoop, the Wraith's chain and its step through the dark, the Specter's
//     whirlpool and tidal wall, the Fiend's burrow and its lines of root
//  BOSSFIGHT.has(form) · BOSSFIGHT.step(d,dx,dz,dist,T,K) → true when it ran the boss this tick (K: combat's hands)
//  BOSSFIGHT.gate(d,dmg,K) → the blow after its armour · BOSSFIGHT.open(d) → is it open
//  The guardians' own rules (guardians.js) still run over it: lamps, the Wraith's solidity, the stones, the roots.
// ════════════════════════════════════════════════════════════════
const BOSSFIGHT=(function(){
  const now=()=>performance.now(), PI=Math.PI;
  const AMBER=0xffa040, RED=0xff2a2a;
  // ── the guardians' fights ──
  //  a step: tel (ticks of wind-up), shape (arc | thrust | slam | spin | claw), reach, arc (half-angle) or w (width), dmg,
  //  un (unblockable), lunge (tiles it travels into the blow), side (±1: the arm that leads), heavy (a whiff overreaches)
  const S_=(o)=>Object.assign({tel:30,shape:'arc',reach:2.2,arc:1.0,w:1.0,dmg:1,un:false,lunge:0.5,side:1,gap:6},o);
  const FIGHTS={
    // 0 — the Shadow Imp: a quick, flying ape of shadow. Flurries, a tail that sweeps, a pounce, the swoop down a line.
    0:{style:'shadow',range:1.9,speed:0.062,idle:[34,22,16],recover:44,
      moves:[
        [{c:'combo',name:'Claw flurry',w:3,steps:[S_({tel:26,shape:'claw',reach:1.8,arc:0.95,lunge:0.6,side:1}),S_({tel:13,shape:'claw',reach:1.8,arc:0.95,lunge:0.5,side:-1}),S_({tel:13,shape:'claw',reach:1.9,arc:0.95,lunge:0.6,side:1,dmg:1.2})]},
         {c:'combo',name:'Tail sweep',w:2,steps:[S_({tel:32,shape:'spin',reach:2.3,dmg:1.2,lunge:0.2,heavy:true})]},
         {c:'combo',name:'Pounce',w:2,far:true,steps:[S_({tel:34,shape:'slam',reach:1.5,lunge:2.6,dmg:1.4,heavy:true})]},
         {c:'sig',sig:'swoop',w:2,far:true},
         {c:'old',w:1,far:true,mv:{kind:'volley',count:3,telegraph:30,speed:3.4}}],
        [{c:'combo',name:'Claw flurry',w:3,steps:[S_({tel:24,shape:'claw',reach:1.9,arc:0.95,lunge:0.6}),S_({tel:12,shape:'claw',reach:1.9,arc:0.95,side:-1}),S_({tel:12,shape:'claw',reach:1.9,arc:0.95}),S_({tel:20,shape:'spin',reach:2.3,un:true,dmg:1.2,heavy:true})]},
         {c:'combo',name:'Pounce',w:2,far:true,steps:[S_({tel:30,shape:'slam',reach:1.6,lunge:2.8,dmg:1.4,heavy:true}),S_({tel:16,shape:'claw',reach:1.9,arc:1.0,lunge:0.6})]},
         {c:'sig',sig:'swoop',w:3,far:true},
         {c:'old',w:1,far:true,mv:{kind:'spread',count:10,telegraph:30,speed:3.2}}],
        [{c:'combo',name:'Frenzy',w:3,steps:[S_({tel:22,shape:'claw',reach:1.9,arc:0.95,lunge:0.7}),S_({tel:11,shape:'claw',reach:1.9,arc:0.95,side:-1}),S_({tel:11,shape:'claw',reach:1.9,arc:0.95}),S_({tel:11,shape:'claw',reach:1.9,arc:0.95,side:-1}),S_({tel:20,shape:'slam',reach:1.7,lunge:1.2,un:true,dmg:1.5,heavy:true})]},
         {c:'sig',sig:'swoop',w:3,far:true,twice:true},
         {c:'combo',name:'Tail sweep',w:2,steps:[S_({tel:26,shape:'spin',reach:2.5,dmg:1.2,un:true,heavy:true})]}]],
      phases:['The shadows multiply!','It is frenzied — the dark is everywhere!']},
    // 1 — the Iron Wraith: heavy flail arcs and an iron slam you cannot block; its chain reaches; it steps through the dark.
    1:{style:'shadow',range:2.2,speed:0.04,idle:[40,30,22],recover:52,
      moves:[
        [{c:'combo',name:'Flail arcs',w:3,steps:[S_({tel:32,reach:2.5,arc:1.15,lunge:0.6,side:1}),S_({tel:20,reach:2.5,arc:1.15,lunge:0.5,side:-1}),S_({tel:38,shape:'slam',reach:2.0,lunge:1.0,un:true,dmg:1.6,heavy:true})]},
         {c:'combo',name:'Chain lash',w:2,steps:[S_({tel:34,shape:'thrust',reach:4.4,w:1.0,lunge:0.3,dmg:1.1}),S_({tel:22,shape:'thrust',reach:4.4,w:1.0,lunge:0.3,dmg:1.1,side:-1})]},
         {c:'sig',sig:'chainpull',w:2,far:true},
         {c:'old',w:1,far:true,mv:{kind:'charge',telegraph:40,speed:7}}],
        [{c:'combo',name:'Flail arcs',w:3,steps:[S_({tel:30,reach:2.6,arc:1.2,lunge:0.6}),S_({tel:18,reach:2.6,arc:1.2,lunge:0.5,side:-1}),S_({tel:18,reach:2.6,arc:1.2,lunge:0.5}),S_({tel:34,shape:'slam',reach:2.1,lunge:1.0,un:true,dmg:1.6,heavy:true})]},
         {c:'sig',sig:'phasestep',w:2},
         {c:'sig',sig:'chainpull',w:2,far:true},
         {c:'old',w:1,mv:{kind:'slam',telegraph:40,ringSpeed:4.4,ringMax:130}}],
        [{c:'combo',name:'Iron storm',w:3,steps:[S_({tel:28,reach:2.6,arc:1.2,lunge:0.6}),S_({tel:16,reach:2.6,arc:1.2,side:-1}),S_({tel:30,shape:'slam',reach:2.1,lunge:1.0,un:true,dmg:1.6,heavy:true}),S_({tel:22,shape:'spin',reach:2.6,un:true,dmg:1.3,heavy:true})]},
         {c:'sig',sig:'phasestep',w:3,twice:true},
         {c:'sig',sig:'chainpull',w:2,far:true}]],
      phases:['The chains rise!','The iron howls — the chains fly faster!']},
    // 2 — the Tide Specter: trident thrusts, a tentacle storm all round it, the whirlpool that drags, the tidal wall.
    2:{style:'tide',range:2.6,speed:0.045,idle:[38,28,22],recover:46,
      moves:[
        [{c:'combo',name:'Trident',w:3,steps:[S_({tel:30,shape:'thrust',reach:3.2,w:0.9,lunge:0.5}),S_({tel:18,shape:'thrust',reach:3.2,w:0.9,lunge:0.5,side:-1}),S_({tel:34,shape:'spin',reach:2.5,un:true,dmg:1.4,heavy:true})]},
         {c:'combo',name:'Undertow slash',w:2,steps:[S_({tel:30,reach:2.7,arc:1.5,lunge:0.4}),S_({tel:22,reach:2.7,arc:1.5,lunge:0.4,side:-1})]},
         {c:'sig',sig:'whirlpool',w:2},
         {c:'old',w:1,far:true,mv:{kind:'wave',telegraph:46,ringSpeed:3.2,ringMax:260}}],
        [{c:'combo',name:'Trident',w:3,steps:[S_({tel:28,shape:'thrust',reach:3.4,w:0.9,lunge:0.6}),S_({tel:16,shape:'thrust',reach:3.4,w:0.9,lunge:0.6,side:-1}),S_({tel:16,shape:'thrust',reach:3.4,w:0.9,lunge:0.6}),S_({tel:30,shape:'spin',reach:2.6,un:true,dmg:1.4,heavy:true})]},
         {c:'sig',sig:'tidalwave',w:2,far:true},
         {c:'sig',sig:'whirlpool',w:2},
         {c:'old',w:1,far:true,mv:{kind:'spread',count:10,telegraph:34,speed:3.0}}],
        [{c:'combo',name:'Maelstrom',w:3,steps:[S_({tel:26,shape:'thrust',reach:3.4,w:1.0,lunge:0.6}),S_({tel:15,reach:2.8,arc:1.5,side:-1}),S_({tel:15,shape:'thrust',reach:3.4,w:1.0,lunge:0.6}),S_({tel:28,shape:'spin',reach:2.8,un:true,dmg:1.5,heavy:true})]},
         {c:'sig',sig:'tidalwave',w:3,far:true,twice:true},
         {c:'sig',sig:'whirlpool',w:2}]],
      phases:['The sea comes in — waves from the deep!','The flood rises — the tide comes from both sides!']},
    // 3 — the Root Fiend: fist swipes, a double-fisted pound, the burrow that hunts you, lines of root from the floor.
    3:{style:'root',hz:{lines:[0,290,190]},range:2.2,speed:0.036,idle:[42,32,24],recover:56,
      moves:[
        [{c:'combo',name:'Fists',w:3,steps:[S_({tel:30,reach:2.5,arc:1.1,lunge:0.6}),S_({tel:20,reach:2.5,arc:1.1,lunge:0.5,side:-1}),S_({tel:40,shape:'slam',reach:2.3,lunge:1.0,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'burrow',w:2},
         {c:'sig',sig:'spikes',w:1,far:true},
         {c:'old',w:1,far:true,mv:{kind:'charge',telegraph:38,speed:7.5}}],
        [{c:'combo',name:'Fists',w:3,steps:[S_({tel:28,reach:2.6,arc:1.15,lunge:0.6}),S_({tel:18,reach:2.6,arc:1.15,lunge:0.5,side:-1}),S_({tel:18,shape:'thrust',reach:3.0,w:1.2,lunge:0.6}),S_({tel:36,shape:'slam',reach:2.4,lunge:1.0,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'burrow',w:3},
         {c:'sig',sig:'spikes',w:2,far:true},
         {c:'old',w:1,mv:{kind:'summon',telegraph:36}}],
        [{c:'combo',name:'Uproot',w:3,steps:[S_({tel:26,reach:2.6,arc:1.2,lunge:0.6}),S_({tel:16,reach:2.6,arc:1.2,side:-1}),S_({tel:32,shape:'slam',reach:2.5,lunge:1.0,un:true,dmg:1.7,heavy:true}),S_({tel:26,shape:'slam',reach:2.5,lunge:1.0,un:true,dmg:1.5,heavy:true})]},
         {c:'sig',sig:'burrow',w:3,twice:true},
         {c:'sig',sig:'spikes',w:2,far:true}]],
      phases:['The roots wake!','The whole floor is roots — it will not stay down!']},
    // 4 — the Ember Hollow: a burning, winged husk. Raking claws, a breath of flame, the swoop; embers fall and light the grain.
    4:{style:'fire',hz:{rain:[0,330,230]},range:2.3,speed:0.045,idle:[38,28,22],recover:48,
      moves:[
        [{c:'combo',name:'Burning claws',w:3,steps:[S_({tel:28,shape:'claw',reach:2.3,arc:1.0,lunge:0.7}),S_({tel:16,shape:'claw',reach:2.3,arc:1.0,lunge:0.6,side:-1}),S_({tel:34,shape:'slam',reach:2.1,lunge:1.0,un:true,dmg:1.5,heavy:true})]},
         {c:'combo',name:'Flame breath',w:2,steps:[S_({tel:36,reach:4.2,arc:0.45,lunge:0,un:true,dmg:1.3,heavy:true})]},
         {c:'sig',sig:'swoop',w:2,far:true},
         {c:'old',w:1,far:true,mv:{kind:'volley',count:3,telegraph:30,speed:3.6}}],
        [{c:'combo',name:'Burning claws',w:3,steps:[S_({tel:26,shape:'claw',reach:2.3,arc:1.0,lunge:0.7}),S_({tel:15,shape:'claw',reach:2.3,arc:1.0,side:-1}),S_({tel:15,shape:'claw',reach:2.3,arc:1.0}),S_({tel:30,reach:4.2,arc:0.5,lunge:0,un:true,dmg:1.3,heavy:true})]},
         {c:'sig',sig:'rain',w:2},
         {c:'sig',sig:'swoop',w:2,far:true},
         {c:'old',w:1,mv:{kind:'slam',telegraph:38,ringSpeed:4.6,ringMax:130}}],
        [{c:'combo',name:'Pyre',w:3,steps:[S_({tel:24,shape:'claw',reach:2.4,arc:1.0,lunge:0.7}),S_({tel:14,shape:'claw',reach:2.4,arc:1.0,side:-1}),S_({tel:26,reach:4.4,arc:0.55,lunge:0,un:true,dmg:1.3}),S_({tel:26,shape:'spin',reach:2.6,un:true,dmg:1.4,heavy:true})]},
         {c:'sig',sig:'swoop',w:2,far:true,twice:true},
         {c:'sig',sig:'rain',w:2}]],
      phases:['Embers fall — the grain will burn!','It is all fire now!']},
    // 5 — the Frost Revenant: an ice blade in long arcs, a lance of ice, the cold that bursts out of it, icicles from the vault.
    5:{style:'ice',hz:{rain:[0,320,220]},range:2.4,speed:0.04,idle:[40,30,24],recover:50,
      moves:[
        [{c:'combo',name:'Rime blade',w:3,steps:[S_({tel:30,reach:2.6,arc:1.2,lunge:0.6}),S_({tel:18,reach:2.6,arc:1.2,lunge:0.5,side:-1}),S_({tel:30,shape:'thrust',reach:3.8,w:1.0,lunge:0.6,dmg:1.3,heavy:true})]},
         {c:'combo',name:'Frost nova',w:2,steps:[S_({tel:42,shape:'spin',reach:3.0,un:true,dmg:1.5,heavy:true})]},
         {c:'sig',sig:'rain',w:2},
         {c:'old',w:1,far:true,mv:{kind:'spread',count:10,telegraph:36,speed:3.3}}],
        [{c:'combo',name:'Rime blade',w:3,steps:[S_({tel:28,reach:2.7,arc:1.2,lunge:0.6}),S_({tel:16,reach:2.7,arc:1.2,side:-1}),S_({tel:16,reach:2.7,arc:1.2}),S_({tel:32,shape:'spin',reach:3.0,un:true,dmg:1.5,heavy:true})]},
         {c:'sig',sig:'spikes',w:2,far:true},
         {c:'sig',sig:'rain',w:2},
         {c:'old',w:1,far:true,mv:{kind:'volley',count:3,telegraph:30,speed:3.8}}],
        [{c:'combo',name:'Whiteout',w:3,steps:[S_({tel:26,shape:'thrust',reach:3.8,w:1.0,lunge:0.6}),S_({tel:15,reach:2.8,arc:1.25,side:-1}),S_({tel:15,shape:'thrust',reach:3.8,w:1.0,lunge:0.6}),S_({tel:30,shape:'spin',reach:3.2,un:true,dmg:1.6,heavy:true})]},
         {c:'sig',sig:'spikes',w:2,far:true},
         {c:'sig',sig:'rain',w:2}]],
      phases:['The vault cracks — icicles fall!','A whiteout — get to the fire!']},
    // 6 — the Char Demon: fists like anvils, the ground split open in lines of fire, the rush, embers raining.
    6:{style:'fire',hz:{lines:[0,280,190]},range:2.3,speed:0.04,idle:[40,30,22],recover:54,
      moves:[
        [{c:'combo',name:'Anvil fists',w:3,steps:[S_({tel:30,reach:2.6,arc:1.1,lunge:0.6}),S_({tel:18,reach:2.6,arc:1.1,lunge:0.5,side:-1}),S_({tel:38,shape:'slam',reach:2.5,lunge:1.0,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'spikes',w:2,far:true},
         {c:'old',w:1,far:true,mv:{kind:'charge',telegraph:32,speed:8.5}},
         {c:'old',w:1,mv:{kind:'summon',telegraph:36}}],
        [{c:'combo',name:'Anvil fists',w:3,steps:[S_({tel:28,reach:2.7,arc:1.15,lunge:0.6}),S_({tel:16,reach:2.7,arc:1.15,side:-1}),S_({tel:16,shape:'thrust',reach:3.2,w:1.3,lunge:0.7}),S_({tel:34,shape:'slam',reach:2.6,lunge:1.0,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'spikes',w:2,far:true},
         {c:'sig',sig:'rain',w:2},
         {c:'old',w:1,far:true,mv:{kind:'charge',telegraph:30,speed:9}}],
        [{c:'combo',name:'Hellfire',w:3,steps:[S_({tel:26,reach:2.7,arc:1.2,lunge:0.6}),S_({tel:15,reach:2.7,arc:1.2,side:-1}),S_({tel:30,shape:'slam',reach:2.7,lunge:1.0,un:true,dmg:1.7,heavy:true}),S_({tel:24,shape:'slam',reach:2.7,lunge:1.0,un:true,dmg:1.5,heavy:true})]},
         {c:'sig',sig:'spikes',w:2,far:true},
         {c:'sig',sig:'rain',w:2}]],
      phases:['The ground splits — fire in the cracks!','The whole floor is burning!']},
    // 7 — the Thunder Lord (once the storm is out of the king): a hammer in arcs, lightning that walks to you down a line, the storm called down.
    7:{style:'storm',cap:0.06,hz:{rain:[0,340,240]},range:2.4,speed:0.042,idle:[40,30,22],recover:50,
      moves:[
        [{c:'combo',name:'Storm hammer',w:3,steps:[S_({tel:30,reach:2.7,arc:1.15,lunge:0.6}),S_({tel:18,reach:2.7,arc:1.15,lunge:0.5,side:-1}),S_({tel:36,shape:'slam',reach:2.5,lunge:1.0,un:true,dmg:1.6,heavy:true})]},
         {c:'sig',sig:'march',w:2,far:true},
         {c:'old',w:1,far:true,mv:{kind:'volley',count:4,telegraph:28,speed:4.2}}],
        [{c:'combo',name:'Storm hammer',w:3,steps:[S_({tel:28,reach:2.8,arc:1.2,lunge:0.6}),S_({tel:16,reach:2.8,arc:1.2,side:-1}),S_({tel:16,reach:2.8,arc:1.2}),S_({tel:32,shape:'slam',reach:2.6,lunge:1.0,un:true,dmg:1.6,heavy:true})]},
         {c:'sig',sig:'march',w:2,far:true},
         {c:'sig',sig:'rain',w:2},
         {c:'old',w:1,far:true,mv:{kind:'charge',telegraph:30,speed:9}}],
        [{c:'combo',name:'Tempest',w:3,steps:[S_({tel:26,reach:2.8,arc:1.2,lunge:0.6}),S_({tel:15,reach:2.8,arc:1.2,side:-1}),S_({tel:28,shape:'slam',reach:2.7,lunge:1.0,un:true,dmg:1.6,heavy:true}),S_({tel:24,shape:'spin',reach:2.8,un:true,dmg:1.4,heavy:true})]},
         {c:'sig',sig:'march',w:2,far:true},
         {c:'sig',sig:'rain',w:2}]],
      phases:['The storm breaks over the hall!','Lightning everywhere — keep moving!']},
    // 8 — the Dark Paladin: an epic dark knight. A greatsword in sweeps and overheads, a lunge down the hall, blades of shadow from the floor.
    8:{style:'shadow',cap:0.045,hz:{lines:[0,300,200]},range:2.5,speed:0.045,idle:[38,28,20],recover:48,
      moves:[
        [{c:'combo',name:'Greatsword',w:3,steps:[S_({tel:30,reach:2.9,arc:1.25,lunge:0.7}),S_({tel:18,reach:2.9,arc:1.25,lunge:0.6,side:-1}),S_({tel:36,shape:'slam',reach:2.2,lunge:1.4,un:true,dmg:1.7,heavy:true})]},
         {c:'combo',name:'Impale',w:2,steps:[S_({tel:32,shape:'thrust',reach:4.2,w:1.0,lunge:0.9,dmg:1.3}),S_({tel:22,reach:2.9,arc:1.3,lunge:0.4,side:-1})]},
         {c:'sig',sig:'dash',w:2,far:true,tel:40},
         {c:'old',w:1,far:true,mv:{kind:'volley',count:5,telegraph:26,speed:4.4}}],
        [{c:'combo',name:'Greatsword',w:3,steps:[S_({tel:28,reach:3.0,arc:1.25,lunge:0.7}),S_({tel:16,reach:3.0,arc:1.25,side:-1}),S_({tel:16,shape:'thrust',reach:4.2,w:1.0,lunge:0.8}),S_({tel:32,shape:'slam',reach:2.3,lunge:1.4,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'dash',w:2,far:true,tel:36,un:true},
         {c:'sig',sig:'spikes',w:2,far:true},
         {c:'old',w:1,mv:{kind:'summon',telegraph:32}}],
        [{c:'combo',name:'Fallen oath',w:3,steps:[S_({tel:26,reach:3.0,arc:1.3,lunge:0.7}),S_({tel:14,reach:3.0,arc:1.3,side:-1}),S_({tel:14,reach:3.0,arc:1.3}),S_({tel:28,shape:'spin',reach:3.0,un:true,dmg:1.5}),S_({tel:26,shape:'slam',reach:2.3,lunge:1.4,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'dash',w:2,far:true,tel:34,un:true,twice:true},
         {c:'sig',sig:'spikes',w:2,far:true}]],
      phases:['Shadow blades rise from the floor!','It has given itself to the dark entirely!']},
    // 9 — the Void Champion: void blades, the step through nothing, the pull of the void, a fall of dark stars.
    9:{style:'void',cap:0.045,hz:{rain:[0,380,280],lines:[0,0,340]},range:2.5,speed:0.046,idle:[36,26,20],recover:46,
      moves:[
        [{c:'combo',name:'Void blades',w:3,steps:[S_({tel:28,reach:2.9,arc:1.25,lunge:0.7}),S_({tel:16,reach:2.9,arc:1.25,side:-1}),S_({tel:16,shape:'thrust',reach:3.8,w:1.0,lunge:0.7}),S_({tel:34,shape:'spin',reach:2.9,un:true,dmg:1.5,heavy:true})]},
         {c:'sig',sig:'phasestep',w:2},
         {c:'sig',sig:'whirlpool',w:2},
         {c:'old',w:1,far:true,mv:{kind:'spread',count:14,telegraph:28,speed:4}}],
        [{c:'combo',name:'Void blades',w:3,steps:[S_({tel:26,reach:3.0,arc:1.3,lunge:0.7}),S_({tel:15,reach:3.0,arc:1.3,side:-1}),S_({tel:15,shape:'thrust',reach:3.8,w:1.0,lunge:0.7}),S_({tel:30,shape:'slam',reach:2.6,lunge:1.2,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'phasestep',w:2,twice:true},
         {c:'sig',sig:'rain',w:2},
         {c:'sig',sig:'whirlpool',w:1}],
        [{c:'combo',name:'Unmaking',w:3,steps:[S_({tel:24,reach:3.0,arc:1.3,lunge:0.7}),S_({tel:14,reach:3.0,arc:1.3,side:-1}),S_({tel:14,shape:'thrust',reach:4.0,w:1.0,lunge:0.7}),S_({tel:26,shape:'spin',reach:3.0,un:true,dmg:1.5}),S_({tel:26,shape:'slam',reach:2.7,lunge:1.2,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'phasestep',w:2,twice:true},
         {c:'sig',sig:'march',w:2,far:true},
         {c:'sig',sig:'whirlpool',w:1}]],
      phases:['Dark stars fall!','The void opens under the hall!']},
    // ── the finale (abaddon.js speaks the turns, breaks the floor, closes the margins; the fight is here) ──
    // ABADDON: a hellblade and burning wings. The Deceiver steps through the dark and walks the stars to you; the Destroyer
    // swoops, shields himself in shades, rains fire; the Desperate throws everything, and pulls you into the void.
    ab:{style:'void',quietPhase:true,cap:0.016,dmgK:1.6,hz:{rain:[0,430,300],lines:[0,0,380]},range:2.6,speed:0.05,idle:[36,28,20],recover:44,
      moves:[
        [{c:'combo',name:'Hellblade',w:3,steps:[S_({tel:28,reach:3.0,arc:1.25,lunge:0.7}),S_({tel:16,reach:3.0,arc:1.25,side:-1}),S_({tel:26,shape:'thrust',reach:4.2,w:1.1,lunge:0.8,dmg:1.2,heavy:true})]},
         {c:'combo',name:'Wingbeat',w:2,steps:[S_({tel:34,shape:'spin',reach:3.2,un:true,dmg:1.3,heavy:true})]},
         {c:'sig',sig:'phasestep',w:2},
         {c:'sig',sig:'march',w:2,far:true}],
        [{c:'combo',name:'The Destroyer',w:3,steps:[S_({tel:26,reach:3.1,arc:1.3,lunge:0.7}),S_({tel:15,reach:3.1,arc:1.3,side:-1}),S_({tel:15,shape:'thrust',reach:4.2,w:1.1,lunge:0.8}),S_({tel:32,shape:'slam',reach:2.8,lunge:1.2,un:true,dmg:1.6,heavy:true})]},
         {c:'sig',sig:'swoop',w:2,far:true},
         {c:'sig',sig:'call',fn:'shield',w:1,once:true},
         {c:'sig',sig:'rain',w:2},
         {c:'sig',sig:'spikes',w:1,far:true}],
        [{c:'combo',name:'Unmaking',w:3,steps:[S_({tel:24,reach:3.1,arc:1.3,lunge:0.7}),S_({tel:13,reach:3.1,arc:1.3,side:-1}),S_({tel:13,shape:'thrust',reach:4.2,w:1.1,lunge:0.8}),S_({tel:26,shape:'spin',reach:3.2,un:true,dmg:1.4}),S_({tel:26,shape:'slam',reach:2.8,lunge:1.2,un:true,dmg:1.7,heavy:true})]},
         {c:'sig',sig:'swoop',w:2,far:true,twice:true},
         {c:'sig',sig:'whirlpool',w:2},
         {c:'sig',sig:'call',fn:'shield',w:1,once:true},
         {c:'sig',sig:'rain',w:2}]],
      phases:['','']},
    // THE PRETENDER: a usurper in stolen plate, a fisher of men — a royal blade, a line cast down the hall that hooks you in,
    // a guard of shades, the sea he calls on, a rush the length of the throne room when he is cornered.
    pk:{style:'tide',quietPhase:true,cap:0.02,dmgK:1.4,hz:{lines:[0,0,360]},range:2.4,speed:0.05,idle:[36,28,20],recover:46,
      moves:[
        [{c:'combo',name:'Royal blade',w:3,steps:[S_({tel:28,reach:2.8,arc:1.2,lunge:0.7}),S_({tel:16,reach:2.8,arc:1.2,side:-1}),S_({tel:28,shape:'thrust',reach:3.8,w:1.0,lunge:0.8,dmg:1.2,heavy:true})]},
         {c:'sig',sig:'chainpull',w:2,far:true},
         {c:'old',w:1,far:true,mv:{kind:'volley',count:3,telegraph:30,speed:3.6}}],
        [{c:'combo',name:'Tyrant',w:3,steps:[S_({tel:26,reach:2.9,arc:1.25,lunge:0.7}),S_({tel:15,reach:2.9,arc:1.25,side:-1}),S_({tel:15,shape:'thrust',reach:3.8,w:1.0,lunge:0.8}),S_({tel:32,shape:'slam',reach:2.6,lunge:1.1,un:true,dmg:1.6,heavy:true})]},
         {c:'sig',sig:'chainpull',w:2,far:true},
         {c:'sig',sig:'call',fn:'shield',w:1,once:true},
         {c:'sig',sig:'tidalwave',w:2}],
        [{c:'combo',name:'Cornered',w:3,steps:[S_({tel:24,reach:2.9,arc:1.3,lunge:0.7}),S_({tel:13,reach:2.9,arc:1.3,side:-1}),S_({tel:13,reach:2.9,arc:1.3}),S_({tel:28,shape:'spin',reach:3.0,un:true,dmg:1.5,heavy:true})]},
         {c:'sig',sig:'dash',w:2,far:true,tel:34,un:true,twice:true},
         {c:'sig',sig:'whirlpool',w:2},
         {c:'sig',sig:'call',fn:'shield',w:1,once:true},
         {c:'sig',sig:'tidalwave',w:1}]],
      phases:['','']}};
  // what a hall's hazards are made of: the colour of their stone, their glow, the word they leave you with
  const STY={root:{col:0x4a5a2a,em:0x1a2a08,pop:'Roots!',pc:'#a0e050',ring:0x60c040},fire:{col:0xff7a20,em:0xa03000,pop:'Burned!',pc:'#ffa060',ring:0xff7a30},ice:{col:0xcff4ff,em:0x3a8ab0,pop:'Ice!',pc:'#bfefff',ring:0x9ae0ff},
    storm:{col:0xfff2a8,em:0xc0a020,pop:'Struck!',pc:'#ffe680',ring:0xffe060},shadow:{col:0x1a1426,em:0x40206a,pop:'Shadow!',pc:'#c0a0ff',ring:0x9a70ff},void:{col:0x14061e,em:0x8020b0,pop:'The void!',pc:'#ff80e0',ring:0xc040ff},tide:{col:0x40c8d8,em:0x0a3a40,pop:'Swept!',pc:'#80f0ff',ring:0x40d8d0}};
  const sty=d=>STY[(FIGHTS[d.bfForm]||{}).style||'root']||STY.root;
  const has=f=>FIGHTS[f]!=null;
  const TELK=[1,0.92,0.84];

  // ── paint on the floor: where a blow will land ──
  const fxList=[];
  function paint(K,shape,o){ const c=K.A(); if(!c) return null; const g=new THREE.Group(), col=o.un?RED:AMBER;
    const mat=(op)=>new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    let geo; if(shape==='thrust'||shape==='line'){ geo=new THREE.PlaneGeometry(o.w,o.reach); geo.translate(0,o.reach/2,0); }
    else if(shape==='slam'||shape==='spin'||shape==='circle') geo=new THREE.CircleGeometry(o.reach,40);
    else geo=new THREE.CircleGeometry(o.reach,28,PI/2-o.arc,o.arc*2);
    const out=new THREE.Mesh(geo,mat(0.22)), fill=new THREE.Mesh(geo,mat(0.3)); [out,fill].forEach(m=>{ m.rotation.x=-PI/2; g.add(m); }); fill.position.y=0.005;
    let edge=null; if(shape==='slam'||shape==='spin'||shape==='circle'){ edge=new THREE.Mesh(new THREE.RingGeometry(o.reach*0.94,o.reach,40),mat(0.7)); edge.rotation.x=-PI/2; edge.position.y=0.01; g.add(edge); }
    c.fx.add(g); const P={g,out,fill,edge,shape,k:0,life:-1,mats:[out.material,fill.material].concat(edge?[edge.material]:[])}; fxList.push(P); return P; }
  function place(P,x,z,face){ if(!P) return; const lv=ENGINE.level; P.g.position.set(x,lv.ground(x,z)+0.06,z); P.g.rotation.y=face+PI; }
  function fill(P,k){ if(!P) return; P.k=k; if(P.shape==='thrust'||P.shape==='line') P.fill.scale.set(1,Math.max(0.02,k),1); else P.fill.scale.set(Math.max(0.02,k),Math.max(0.02,k),1); P.fill.material.opacity=0.22+0.4*k; }
  function fire(P){ if(!P) return; fill(P,1); P.life=14; P.mats.forEach(m=>m.opacity=0.85); }
  function fadeOut(P){ if(!P) return; P.life=Math.min(P.life<0?8:P.life,8); }
  function tickFx(){ for(let i=fxList.length-1;i>=0;i--){ const P=fxList[i]; if(P.life<0) continue; P.life--; P.mats.forEach(m=>m.opacity*=0.82); if(P.life<=0){ if(P.g.parent) P.g.parent.remove(P.g); fxList.splice(i,1); } } }

  // ── geometry of a blow ──
  const angD=(a,b)=>{ let r=a-b; return Math.abs(Math.atan2(Math.sin(r),Math.cos(r))); };
  function inside(px,pz,ox,oz,face,st,pad){ const dx=px-ox, dz=pz-oz, r=Math.hypot(dx,dz); pad=pad||0.35;
    if(st.shape==='slam'||st.shape==='spin'||st.shape==='circle') return r<st.reach+pad;
    if(st.shape==='thrust'||st.shape==='line'){ const fx=Math.sin(face), fz=Math.cos(face), al=dx*fx+dz*fz, pe=Math.abs(-dx*fz+dz*fx); return al>-pad&&al<st.reach+pad&&pe<st.w/2+pad; }
    return r<st.reach+pad&&(r<0.6||angD(Math.atan2(dx,dz),face)<st.arc+0.12); }
  const segD=(px,pz,ax,az,bx,bz)=>{ const vx=bx-ax, vz=bz-az, L=vx*vx+vz*vz||1; let t=((px-ax)*vx+(pz-az)*vz)/L; t=Math.max(0,Math.min(1,t)); return Math.hypot(px-ax-vx*t,pz-az-vz*t); };

  // ── the blow arriving: dodged through (it reels), parried (it reels), guarded, guard broken, or taken ──
  function land(d,st,K,X,dmgBase){ const pl=K.pl, p=K.P();
    if(pl.dashing>0){ if(!d.bf.perfect){ d.bf.perfect=true; K.spirit&&K.spirit(); K.pop(p.x,ENGINE.level.ground(p.x,p.z)+2.1,p.z,'Perfect dodge!','#8affd8'); if(!d.bf.tipDodge){ d.bf.tipDodge=true; UI.toast('💨 Rolled right through it — it’s off balance. Strike now!',2000); } } return 'dodge'; }
    if(pl.iframes>0) return 'safe';
    if(!st.un&&K.parryNow()){ K.parry(d); return 'parry'; }
    const dmg=dmgBase*(st.dmg||1);
    if(st.un&&pl.blocking&&K.perk&&K.perk().redBlock){ pl.redHold=1; K.pop(p.x,ENGINE.level.ground(p.x,p.z)+2.0,p.z,'Unbroken!','#8ac8ff'); K.shake(0.25); K.hurt(dmg); return 'block'; }   /* V185: the Guardian's Unbroken — the red blow is held, at half */
    if(st.un&&pl.blocking){ pl.guardBreak=56; pl.blocking=false; K.pop(p.x,ENGINE.level.ground(p.x,p.z)+2.0,p.z,'Guard broken!','#ff7a5a'); K.shake(0.35); if(!d.bf.tipRed){ d.bf.tipRed=true; UI.toast('🟥 Red ground cannot be guarded — roll out of it, or through it.',2200); } K.hurt(dmg*0.85); return 'hit'; }
    K.hurt(dmg); return pl.blocking?'block':'hit'; }

  // ── the arena's turns, per phase ──
  function hazards(d,K,X){ const H=d.bf.hz||(d.bf.hz={}), F=d.bfForm, ph=d.bf.ph, c=K.A(), cfg=c.cfg, W=cfg.W||20, Hh=cfg.H||20, p=K.P(), pl=K.pl, lv=ENGINE.level, lvl=d.level||5;
    // the Wraith: chains sweep the hall from its middle — jump them, or roll through
    if(F===1&&ph>=1){ if(!H.beams){ H.beams=[]; const n=ph>=2?2:1; for(let i=0;i<2;i++){ const g=new THREE.Group(), L=Math.max(W,Hh)*0.75; const ch=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,L,6),new THREE.MeshPhongMaterial({color:0x6a7078,emissive:0x1a3a30,shininess:60})); ch.rotation.z=PI/2; ch.position.x=L/2; g.add(ch);
          const gl=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,L,6),new THREE.MeshBasicMaterial({color:0x9ae0c0,transparent:true,opacity:0.22,depthWrite:false,blending:THREE.AdditiveBlending})); gl.rotation.z=PI/2; gl.position.x=L/2; g.add(gl);
          g.position.set(W/2,lv.ground(W/2,Hh/2)+0.32,Hh/2); g.visible=i<n; c.fx.add(g); H.beams.push({g,a:i*PI,L}); } }
      const n=ph>=2?2:1, sp=(ph>=2?0.0105:0.0078)*(d.bf.dir||1); H.beams.forEach((b,i)=>{ b.g.visible=i<n; if(i>=n) return; b.a+=sp; b.g.rotation.y=-b.a;
        const ax=W/2, az=Hh/2, bx=ax+Math.cos(b.a)*b.L, bz=az+Math.sin(b.a)*b.L; if(K.airH()<0.22&&pl.iframes<=0&&segD(p.x,p.z,ax,az,bx,bz)<0.42){ K.hurt(5+lvl*0.45); K.pop(p.x,lv.ground(p.x,p.z)+2,p.z,'Jump the chains!','#9ae0c0'); } }); }
    // the Specter: walls of water across the hall (dash through, or stand on a stone)
    if(F===2&&ph>=1){ H.waveT=(H.waveT==null?200:H.waveT)-1; if(H.waveT<=0&&d.bf.mode!=='roar'){ H.waveT=ph>=2?300:420; wall(d,K,X,ph>=2); } }
    // the Fiend: lines of root burst up toward you
    const HZ=FIGHTS[F].hz||{};
    if(HZ.lines&&HZ.lines[ph]){ H.lineT=(H.lineT==null?160:H.lineT)-1; if(H.lineT<=0&&d.bf.mode!=='roar'){ H.lineT=HZ.lines[ph]; const a=Math.random()*PI*2, sx=Math.max(1.5,Math.min(W-1.5,p.x+Math.cos(a)*6)), sz=Math.max(1.5,Math.min(Hh-1.5,p.z+Math.sin(a)*6)); spikeLine(d,K,sx,sz,Math.atan2(p.x-sx,p.z-sz),9,36); } }
    // things falling on you from above (embers, icicles, lightning, the dark) — one where you stand, more about you
    if(HZ.rain&&HZ.rain[ph]){ H.rainT=(H.rainT==null?120:H.rainT)-1; if(H.rainT<=0&&d.bf.mode!=='roar'){ H.rainT=HZ.rain[ph]; const n=ph>=2?4:3; for(let i=0;i<n;i++){ const a=Math.random()*PI*2, r=i?1.8+Math.random()*2.6:0; drop(d,K,p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,1.25,50+i*7); } } }
    if(H.drops) H.drops=H.drops.filter(D=>{ D.t++; const k=Math.min(1,D.t/D.tel); if(D.t<=D.tel){ fill(D.P,k); if(D.m){ const u=Math.max(0,(D.t-(D.tel-14))/14); D.m.visible=u>0; D.m.position.y=ENGINE.level.ground(D.x,D.z)+7*(1-u)+0.3; } return true; }
      if(D.t===D.tel+1){ fire(D.P); K.dust(D.x,D.z); const S2=sty(d); if(D.m){ D.m.position.y=ENGINE.level.ground(D.x,D.z)+0.3; if(S2===STY.storm) D.m.scale.set(1,1,1); }
        if(Math.hypot(p.x-D.x,p.z-D.z)<D.r+0.3&&pl.iframes<=0){ K.hurt(5+lvl*0.55); K.pop(p.x,lv.ground(p.x,p.z)+2,p.z,S2.pop,S2.pc); if(S2===STY.ice&&cfg.shotHit) cfg.shotHit(); }
        if(S2===STY.fire&&cfg.shotWall) for(let ox=-1;ox<=1;ox++) for(let oz=-1;oz<=1;oz++) cfg.shotWall(Math.floor(D.x)+ox,Math.floor(D.z)+oz); }
      if(D.m){ D.m.material.opacity=Math.max(0,(D.m.material.opacity||1)-0.1); } if(D.t>D.tel+10){ if(D.m) c.fx.remove(D.m); return false; } return true; });
    // walls of water in flight
    if(H.walls) H.walls=H.walls.filter(w=>{ w.t++; const k=w.t/w.T; w.pos=w.from+(w.to-w.from)*k; if(w.axis==='z') w.m.position.z=w.pos; else w.m.position.x=w.pos; w.m.material.opacity=0.5*Math.min(1,Math.min(k*6,(1-k)*6));
      const pp=w.axis==='z'?p.z:p.x; if(!w.hit&&Math.abs(pp-w.pos)<0.55&&pl.iframes<=0&&!(cfg.ringSafe&&cfg.ringSafe())){ w.hit=true; K.hurt(6+lvl*0.6); K.knock(w.axis==='z'?0:Math.sign(w.to-w.from)*0.9,w.axis==='z'?Math.sign(w.to-w.from)*0.9:0); }
      if(k>=1){ c.fx.remove(w.m); return false; } return true; });
    // lines of root, rising and sinking
    if(H.lines) H.lines=H.lines.filter(L=>{ L.t++; const k=Math.min(1,L.t/L.tel); if(L.t<=L.tel){ fill(L.P,k); return true; }
      if(L.t===L.tel+1){ fire(L.P); L.g.visible=true; K.dust(L.x+Math.sin(L.face)*L.len*0.5,L.z+Math.cos(L.face)*L.len*0.5); if(inside(p.x,p.z,L.x,L.z,L.face,{shape:'line',reach:L.len,w:1.0},0.3)&&pl.iframes<=0) { const S2=sty(d); K.hurt(6+lvl*0.6); K.pop(p.x,lv.ground(p.x,p.z)+2,p.z,S2.pop,S2.pc); } }
      const u=L.t-L.tel; L.g.scale.y=u<6?u/6:u>40?Math.max(0.01,1-(u-40)/12):1; if(u>52){ c.fx.remove(L.g); return false; } return true; }); }
  function wall(d,K,X,both){ const c=K.A(), cfg=c.cfg, W=cfg.W||20, H=cfg.H||20, p=K.P(), lv=ENGINE.level, Hz=d.bf.hz;
    const axis=Math.random()<0.5?'x':'z', mk=(from,to)=>{ const len=axis==='z'?W:H, m=new THREE.Mesh(new THREE.BoxGeometry(axis==='z'?len:0.7,1.6,axis==='z'?0.7:len),new THREE.MeshPhongMaterial({color:0x40c8d8,emissive:0x0a3a40,transparent:true,opacity:0.0,shininess:90,depthWrite:false}));
      m.position.set(axis==='z'?W/2:from,lv.ground(W/2,H/2)+0.8,axis==='z'?from:H/2); c.fx.add(m); (Hz.walls=Hz.walls||[]).push({m,axis,from,to,t:0,T:150,pos:from,hit:false}); };
    const M=axis==='z'?H:W; mk(0.8,M-0.8); if(both) mk(M-0.8,0.8); UI.toast(both?'🌊 The sea comes from both sides — roll through, or stand on a stone!':'🌊 A wall of water — roll through it, or stand on a stone!',1700); SFX.play('bossTelegraph'); }
  function drop(d,K,x,z,r,tel){ const c=K.A(), cfg=c.cfg, W=cfg.W||20, H=cfg.H||20; x=Math.max(1.3,Math.min(W-1.3,x)); z=Math.max(1.3,Math.min(H-1.3,z)); const Hz=d.bf.hz||(d.bf.hz={}), P=paint(K,'circle',{reach:r,un:true}); place(P,x,z,0);
    const S2=sty(d); let m; if(S2===STY.storm){ m=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.14,14,6),new THREE.MeshBasicMaterial({color:0xfff6d6,transparent:true,opacity:0.95})); m.position.set(x,7,z); }
    else if(S2===STY.ice){ m=new THREE.Mesh(new THREE.ConeGeometry(0.28,1.4,6),new THREE.MeshPhongMaterial({color:S2.col,emissive:S2.em,transparent:true,opacity:0.95,shininess:90})); m.rotation.x=PI; }
    else { m=new THREE.Mesh(new THREE.SphereGeometry(0.34,10,8),new THREE.MeshBasicMaterial({color:S2.ring,transparent:true,opacity:0.95})); }
    m.position.x=x; m.position.z=z; m.visible=false; c.fx.add(m); (Hz.drops=Hz.drops||[]).push({x,z,r,tel:Math.round(tel*TELK[d.bf.ph]),t:0,P,m}); }
  function spikeLine(d,K,x,z,face,len,tel){ const c=K.A(), lv=ENGINE.level, Hz=d.bf.hz||(d.bf.hz={}), P=paint(K,'line',{w:1.0,reach:len,un:true}); place(P,x,z,face);
    const g=new THREE.Group(), S2=sty(d), m=new THREE.MeshPhongMaterial({color:S2.col,emissive:S2.em,flatShading:true}); for(let i=0;i<Math.round(len*1.6);i++){ const u=(i+0.5)/(len*1.6)*len, s=0.7+((i*37)%5)*0.12, cn=new THREE.Mesh(new THREE.ConeGeometry(0.16*s,0.9*s,5),m); cn.position.set(Math.sin(face)*u+(((i*13)%7)-3)*0.04,0.45*s,Math.cos(face)*u+(((i*7)%5)-2)*0.05); cn.rotation.z=(((i*11)%5)-2)*0.12; g.add(cn); }
    g.position.set(x,lv.ground(x,z),z); g.visible=false; c.fx.add(g); (Hz.lines=Hz.lines||[]).push({x,z,face,len,tel,t:0,P,g}); }

  // ── the signatures ──
  const SIG={
    // the Imp rises, picks a line through you, and rakes down it
    swoop:{start(d,K,X){ const s=d.bf.s={t:0,n:X.mv.twice&&d.bf.ph>=2?2:1}; this.aim(d,K,X); },
      aim(d,K,X){ const s=d.bf.s, p=K.P(); s.ph='rise'; s.t=0; s.face=Math.atan2(p.x-d.x,p.z-d.z); const c=K.A().cfg, len=Math.min(11,Math.hypot(p.x-d.x,p.z-d.z)+4.5); s.len=len; s.P=paint(K,'thrust',{w:1.5,reach:len}); d.pose='wind'; d.shape='claw'; SFX.play('bossTelegraph'); },
      tick(d,K,X){ const s=d.bf.s, p=K.P(), tel=Math.round(44*TELK[d.bf.ph]); s.t++;
        if(s.ph==='rise'){ d.alt+=((1.3)-d.alt)*0.1; const k=s.t/tel; d.poseK=k; if(k<0.72){ s.face=Math.atan2(p.x-d.x,p.z-d.z); s.len=Math.min(11,Math.hypot(p.x-d.x,p.z-d.z)+4.5); s.P.g.scale.set(1,1,s.len/s.P.out.geometry.parameters.height); }
          place(s.P,d.x,d.z,s.face); fill(s.P,k); d.face=s.face; if(s.t>=tel){ s.ph='dash'; s.t=0; fire(s.P); s.x0=d.x; s.z0=d.z; s.hit=false; d.pose='strike'; SFX.play('bossStrike'); } return false; }
        if(s.ph==='dash'){ const N=16, k=s.t/N, c=K.A().cfg, W=c.W||20, H=c.H||20; let nx=s.x0+Math.sin(s.face)*s.len*k, nz=s.z0+Math.cos(s.face)*s.len*k; nx=Math.max(1.3,Math.min(W-1.3,nx)); nz=Math.max(1.3,Math.min(H-1.3,nz)); d.x=nx; d.z=nz; d.alt=1.3*(1-k)+0.3;
          if(!s.hit&&Math.hypot(p.x-d.x,p.z-d.z)<1.05){ s.hit=true; const r=land(d,{dmg:1.4},K,X,X.dmg); if(r==='parry') return true; if(r==='dodge') d.bf.perfect=true; }
          if(s.t>=N){ K.dust(d.x,d.z); d.alt=0.3; if(--s.n>0&&!d.bf.perfect){ this.aim(d,K,X); return false; } d.bf.whiff=!s.hit; return true; } return false; } return true; }},
    // the Wraith throws its chain down a line; caught, you are hauled in to a slam you cannot guard
    chainpull:{start(d,K,X){ const p=K.P(), s=d.bf.s={t:0,ph:'wind',face:Math.atan2(p.x-d.x,p.z-d.z)}; s.st={shape:'thrust',reach:7.5,w:1.0}; s.P=paint(K,'thrust',{w:1.0,reach:7.5}); d.pose='cast'; SFX.play('bossTelegraph'); },
      tick(d,K,X){ const s=d.bf.s, p=K.P(), pl=K.pl, tel=Math.round(40*TELK[d.bf.ph]); s.t++;
        if(s.ph==='wind'){ const k=s.t/tel; d.poseK=k; if(k<0.7) s.face=Math.atan2(p.x-d.x,p.z-d.z); d.face=s.face; place(s.P,d.x,d.z,s.face); fill(s.P,k);
          if(s.t>=tel){ fire(s.P); d.pose='strike'; d.shape='thrust'; SFX.play('bossStrike'); const inn=inside(p.x,p.z,d.x,d.z,s.face,s.st,0.3);
            if(inn){ const r=land(d,{dmg:0.5},K,X,X.dmg); if(r==='parry') return true; if(r==='hit'||r==='block'){ s.ph='pull'; s.t=0; K.pop(p.x,ENGINE.level.ground(p.x,p.z)+2.1,p.z,d.bfForm==='pk'?'Hooked!':'Caught!','#9ae0c0'); return false; } }
            K.pop(d.x,ENGINE.level.ground(d.x,d.z)+3.2,d.z,'The chain falls short','#c8d0d8'); d.bf.whiff=true; return true; } return false; }
        if(s.ph==='pull'){ const tx=d.x+Math.sin(s.face)*1.4, tz=d.z+Math.cos(s.face)*1.4, L0=ENGINE.level; const nx=p.x+(tx-p.x)*0.16, nz=p.z+(tz-p.z)*0.16; if(L0.canMove(p.x,p.z,nx,p.z)) p.x=nx; if(L0.canMove(p.x,p.z,p.x,nz)) p.z=nz;
          if(s.t>=14){ s.ph='slam'; s.t=0; s.P2=paint(K,'slam',{reach:2.0,un:true}); d.pose='wind'; d.shape='slam'; } return false; }
        if(s.ph==='slam'){ const T2=22; d.poseK=s.t/T2; place(s.P2,d.x+Math.sin(s.face)*1.0,d.z+Math.cos(s.face)*1.0,s.face); fill(s.P2,s.t/T2);
          if(s.t>=T2){ fire(s.P2); d.pose='strike'; K.shake(0.5); K.dust(d.x+Math.sin(s.face),d.z+Math.cos(s.face)); SFX.play('bossStrike'); if(inside(p.x,p.z,d.x+Math.sin(s.face),d.z+Math.cos(s.face),s.face,{shape:'slam',reach:2.0})) land(d,{un:true,dmg:1.5},K,X,X.dmg); else d.bf.whiff=true; return true; } return false; } return true; }},
    // the Wraith goes to smoke and comes out of it behind you, already swinging
    phasestep:{start(d,K,X){ const s=d.bf.s={t:0,ph:'out',n:X.mv.twice&&d.bf.ph>=2?2:1}; K.dust(d.x,d.z); d.pose='cast'; d.poseK=1; },
      tick(d,K,X){ const s=d.bf.s, p=K.P(); s.t++; const c=K.A().cfg, W=c.W||20, H=c.H||20;
        if(s.ph==='out'){ d._fading=true; (d.g.userData.mats||[]).forEach(m=>{ m.transparent=true; m.opacity=Math.max(0.05,1-s.t/14); }); if(s.t>=16){ const bk=K.face()+PI, x=Math.max(1.5,Math.min(W-1.5,p.x+Math.sin(bk)*1.7)), z=Math.max(1.5,Math.min(H-1.5,p.z+Math.cos(bk)*1.7)); d.x=x; d.z=z; K.dust(x,z); s.ph='in'; s.t=0; s.face=Math.atan2(p.x-x,p.z-z); d.face=s.face; s.st=S_({tel:26,reach:2.4,arc:1.25,lunge:0.3,dmg:1.2}); s.P=paint(K,'arc',s.st); d.pose='wind'; d.shape='arc'; d.side=1; SFX.play('bossTelegraph'); } return false; }
        if(s.ph==='in'){ (d.g.userData.mats||[]).forEach(m=>{ m.opacity=Math.min(1,s.t/8); if(s.t>=8){ m.transparent=false; d._fading=false; } }); const tel=Math.round(s.st.tel*TELK[d.bf.ph]), k=s.t/tel; d.poseK=k; if(k<0.6) s.face=Math.atan2(p.x-d.x,p.z-d.z); d.face=s.face; place(s.P,d.x,d.z,s.face); fill(s.P,k);
          if(s.t>=tel){ fire(s.P); d.pose='strike'; SFX.play('bossStrike'); if(inside(p.x,p.z,d.x,d.z,s.face,s.st)){ const r=land(d,s.st,K,X,X.dmg); if(r==='parry') return true; } else d.bf.whiff=true; if(--s.n>0&&!d.bf.perfect){ s.ph='out'; s.t=0; return false; } return true; } return false; } return true; }},
    // the Specter's whirlpool drags you in, and the tentacles spin at its heart
    whirlpool:{start(d,K,X){ const c=K.A(), s=d.bf.s={t:0,ph:'pull'}; const m=new THREE.Mesh(new THREE.RingGeometry(0.6,5.6,48,3),new THREE.MeshBasicMaterial({color:sty(d).ring,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})); m.rotation.x=-PI/2; m.position.set(d.x,ENGINE.level.ground(d.x,d.z)+0.07,d.z); c.fx.add(m); s.m=m; d.pose='cast'; UI.toast(sty(d)===STY.void?'🕳 The void pulls at you — fight it, get clear of its heart!':'🌀 The whirlpool drags at you — fight the current, get clear of its heart!',1700); SFX.play('bossTelegraph'); },
      tick(d,K,X){ const s=d.bf.s, p=K.P(), pl=K.pl, c=K.A(); s.t++; const N=110;
        if(s.ph==='pull'){ s.m.rotation.z+=0.06; s.m.material.opacity=Math.min(0.32,s.t/30); d.poseK=s.t/N; const dx=d.x-p.x, dz=d.z-p.z, r=Math.hypot(dx,dz)||1;
          if(r<5.6&&r>0.9&&!(c.cfg.ringSafe&&c.cfg.ringSafe())&&pl.dashing<=0){ const k=0.026*(1-r/6.5), nx=p.x+dx/r*k*2.2-dz/r*k, nz=p.z+dz/r*k*2.2+dx/r*k, L0=ENGINE.level; if(L0.canMove(p.x,p.z,nx,p.z)) p.x=nx; if(L0.canMove(p.x,p.z,p.x,nz)) p.z=nz; }
          if(s.t===N-34){ s.P=paint(K,'spin',{reach:2.6,un:true}); place(s.P,d.x,d.z,0); d.pose='wind'; d.shape='spin'; }
          if(s.P){ fill(s.P,(s.t-(N-34))/34); d.poseK=(s.t-(N-34))/34; }
          if(s.t>=N){ fire(s.P); d.pose='strike'; SFX.play('bossStrike'); K.shake(0.35); if(inside(p.x,p.z,d.x,d.z,0,{shape:'spin',reach:2.6})) land(d,{un:true,dmg:1.5},K,X,X.dmg); else d.bf.whiff=true; s.ph='end'; s.t=0; } return false; }
        s.m.material.opacity*=0.85; if(s.t>12){ c.fx.remove(s.m); return true; } return false; }},
    // the Specter calls the sea
    tidalwave:{start(d,K,X){ d.bf.s={t:0}; d.pose='cast'; wall(d,K,X,!!(X.mv.twice&&d.bf.ph>=2)); }, tick(d,K,X){ const s=d.bf.s; s.t++; d.poseK=Math.min(1,s.t/40); return s.t>=70; }},
    // it calls on the hall for something (the finale's shield of shades: cfg.call('shield', d, phase))
    call:{start(d,K,X){ d.bf.s={t:0}; d.pose='cast'; const cf=K.A().cfg; if(cf.call) cf.call(X.mv.fn,d,d.bf.ph); SFX.play('bossTelegraph'); }, tick(d,K,X){ const s=d.bf.s; s.t++; d.poseK=Math.min(1,s.t/30); return s.t>=56; }},
    // it calls them down on you — one where you stand, more around
    rain:{start(d,K,X){ const p=K.P(), n=d.bf.ph>=2?6:d.bf.ph>=1?5:4; for(let i=0;i<n;i++){ const a=i/n*PI*2+Math.random(), r=i?1.6+Math.random()*2.4:0; drop(d,K,p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,1.3,48+i*5); } d.bf.s={t:0}; d.pose='cast'; SFX.play('bossTelegraph'); },
      tick(d,K,X){ const s=d.bf.s; s.t++; d.poseK=Math.min(1,s.t/40); if(s.t===48){ d.pose='strike'; d.shape='slam'; } return s.t>=80; }},
    // a line of strikes that walks from it to you, one after another
    march:{start(d,K,X){ const p=K.P(), f=Math.atan2(p.x-d.x,p.z-d.z), L=Math.min(12,Math.hypot(p.x-d.x,p.z-d.z)+4); const n=Math.round(L/1.3); for(let i=1;i<=n;i++) drop(d,K,d.x+Math.sin(f)*i*1.3,d.z+Math.cos(f)*i*1.3,0.95,34+i*5);
        if(d.bf.ph>=2){ const f2=f+0.5, f3=f-0.5; for(let i=2;i<=n;i+=2){ drop(d,K,d.x+Math.sin(f2)*i*1.3,d.z+Math.cos(f2)*i*1.3,0.95,40+i*5); drop(d,K,d.x+Math.sin(f3)*i*1.3,d.z+Math.cos(f3)*i*1.3,0.95,40+i*5); } }
        d.bf.s={t:0,n}; d.face=f; d.pose='cast'; SFX.play('bossTelegraph'); },
      tick(d,K,X){ const s=d.bf.s; s.t++; d.poseK=Math.min(1,s.t/30); if(s.t===34){ d.pose='strike'; d.shape='slam'; K.shake(0.3); } return s.t>=40+s.n*5+12; }},
    // it gathers itself and rushes the length of the hall at you, blade first
    dash:{start(d,K,X){ const s=d.bf.s={t:0,n:X.mv.twice&&d.bf.ph>=2?2:1}; this.aim(d,K,X); },
      aim(d,K,X){ const s=d.bf.s, p=K.P(); s.ph='wind'; s.t=0; s.face=Math.atan2(p.x-d.x,p.z-d.z); s.len=Math.min(10,Math.hypot(p.x-d.x,p.z-d.z)+3.5); s.P=paint(K,'thrust',{w:1.7,reach:s.len,un:!!X.mv.un}); d.pose='wind'; d.shape='thrust'; d.side=1; SFX.play('bossTelegraph'); },
      tick(d,K,X){ const s=d.bf.s, p=K.P(), tel=Math.round((X.mv.tel||40)*TELK[d.bf.ph]); s.t++;
        if(s.ph==='wind'){ const k=s.t/tel; d.poseK=k; if(k<0.7){ s.face=Math.atan2(p.x-d.x,p.z-d.z); s.len=Math.min(10,Math.hypot(p.x-d.x,p.z-d.z)+3.5); s.P.g.scale.set(1,1,s.len/s.P.out.geometry.parameters.height); }
          place(s.P,d.x,d.z,s.face); fill(s.P,k); d.face=s.face; if(s.t>=tel){ s.ph='go'; s.t=0; fire(s.P); s.x0=d.x; s.z0=d.z; s.hit=false; d.pose='strike'; SFX.play('bossStrike'); } return false; }
        const N=14, k=s.t/N, c=K.A().cfg, W=c.W||20, H=c.H||20; const nx=Math.max(1.3,Math.min(W-1.3,s.x0+Math.sin(s.face)*s.len*k)), nz=Math.max(1.3,Math.min(H-1.3,s.z0+Math.cos(s.face)*s.len*k)); if(K.walk(nx,nz)){ d.x=nx; d.z=nz; }
        if(!s.hit&&Math.hypot(p.x-d.x,p.z-d.z)<1.2){ s.hit=true; const r=land(d,{dmg:1.5,un:!!X.mv.un},K,X,X.dmg); if(r==='parry') return true; }
        if(s.t>=N){ K.dust(d.x,d.z); K.shake(0.3); if(--s.n>0&&!d.bf.perfect){ this.aim(d,K,X); return false; } d.bf.whiff=!s.hit; return true; } return false; }},
    // the Fiend sinks into the floor and comes for you under it; it bursts up where the earth stops moving
    burrow:{start(d,K,X){ d.bf.s={t:0,ph:'sink',n:X.mv.twice&&d.bf.ph>=2?2:1}; d.pose='burrow'; K.dust(d.x,d.z); SFX.play('bossTelegraph'); },
      tick(d,K,X){ const s=d.bf.s, p=K.P(), c=K.A(), cfg=c.cfg, W=cfg.W||20, H=cfg.H||20; s.t++;
        if(s.ph==='sink'){ d.poseK=Math.min(1,s.t/26); d.guardUntil=now()+300; if(s.t>=28){ s.ph='hunt'; s.t=0; if(!s.trail){ s.trail=new THREE.Mesh(new THREE.CircleGeometry(0.9,20),new THREE.MeshBasicMaterial({color:0x2a1a08,transparent:true,opacity:0.7,depthWrite:false})); s.trail.rotation.x=-PI/2; c.fx.add(s.trail); } s.trail.visible=true; } return false; }
        if(s.ph==='hunt'){ d.guardUntil=now()+300; d.poseK=1; const N=Math.round(96*TELK[d.bf.ph]), dx=p.x-d.x, dz=p.z-d.z, r=Math.hypot(dx,dz)||1, sp=0.085; if(r>0.2){ d.x=Math.max(1.5,Math.min(W-1.5,d.x+dx/r*Math.min(sp,r))); d.z=Math.max(1.5,Math.min(H-1.5,d.z+dz/r*Math.min(sp,r))); }
          s.trail.position.set(d.x,ENGINE.level.ground(d.x,d.z)+0.05,d.z); s.trail.scale.setScalar(0.8+Math.sin(s.t*0.5)*0.15); if(s.t%7===0) K.dust(d.x,d.z);
          if(s.t>=N){ s.ph='erupt'; s.t=0; s.P=paint(K,'circle',{reach:1.9,un:true}); place(s.P,d.x,d.z,0); SFX.play('bossTelegraph'); } return false; }
        if(s.ph==='erupt'){ d.guardUntil=now()+300; const tel=Math.round(30*TELK[d.bf.ph]); fill(s.P,s.t/tel); s.trail.scale.setScalar(1+s.t/tel); if(s.t>=tel){ fire(s.P); s.trail.visible=false; d.pose='strike'; d.shape='slam'; d.poseK=1; K.shake(0.6); K.dust(d.x,d.z); SFX.play('bossStrike');
            if(inside(p.x,p.z,d.x,d.z,0,{shape:'circle',reach:1.9})) land(d,{un:true,dmg:1.7},K,X,X.dmg); else d.bf.whiff=true; d.guardUntil=0;
            if(--s.n>0&&!d.bf.perfect){ s.ph='sink'; s.t=0; d.pose='burrow'; return false; } c.fx.remove(s.trail); return true; } return false; } return true; }},
    // the Fiend sends roots through the floor at you, in a fan
    spikes:{start(d,K,X){ const p=K.P(), f=Math.atan2(p.x-d.x,p.z-d.z), n=d.bf.ph>=1?5:3; for(let i=0;i<n;i++) spikeLine(d,K,d.x,d.z,f+(i-(n-1)/2)*0.38,9,Math.round(38*TELK[d.bf.ph])+i*4); d.bf.s={t:0}; d.pose='cast'; d.face=f; SFX.play('bossTelegraph'); },
      tick(d,K,X){ const s=d.bf.s; s.t++; d.poseK=Math.min(1,s.t/30); if(s.t===40){ d.pose='strike'; d.shape='slam'; K.shake(0.3); } return s.t>=64; }}};

  // ── choosing what to do next ──
  function pick(d,dist){ const F=FIGHTS[d.bfForm], L=F.moves[d.bf.ph]; let tot=0; const w=L.map((m,i)=>{ let x=m.w||1; if(i===d.bf.last) x*=0.15; if(m.once&&(d.bf.used||{})[d.bf.ph+':'+i]) x=0; if(m.far&&dist<2.5) x*=0.4; if(!m.far&&m.c==='combo'&&dist>6) x*=0.5; tot+=x; return x; });
    let r=Math.random()*tot; for(let i=0;i<L.length;i++){ r-=w[i]; if(r<=0&&w[i]>0){ d.bf.last=i; if(L[i].once) (d.bf.used=d.bf.used||{})[d.bf.ph+':'+i]=1; return L[i]; } } d.bf.last=0; return L[0]; }

  // ── one tick of a guardian ──
  function step(d,dx,dz,dist,T,K){ if(!has(d.bossForm)) return false; const c=K.A(), cfg=c.cfg, p=K.P(), F=FIGHTS[d.bossForm]; d.bfForm=d.bossForm;
    const bf=d.bf||(d.bf={ph:0,mode:'stalk',t:50,last:-1,strafe:Math.random()<0.5?1:-1,dir:1}); tickFx();
    const en=d.enraged?T.enrageDmg:1, X={F,dmg:(6+(d.level||5)*0.9)*en*(F.dmgK||1),mv:bf.move||{}}; const W=cfg.W||20, H=cfg.H||20, cl=(v,M)=>Math.max(1.4,Math.min(M-1.4,v));
    const done=()=>{ if(cfg.moveDone) cfg.moveDone(d); };
    hazards(d,K,X);
    // the hall wants it still (Shadowmere's veil): what it was winding up, it lets go of
    if(cfg.quiet&&cfg.quiet()&&(bf.mode==='combo'||bf.mode==='close')){ fadeOut(bf.P); bf.mode='stalk'; bf.t=F.idle[bf.ph]; d.pose=null; }
    if(dist<0.9&&(d.alt||0)<0.8&&dist>0.01) K.knock(dx/dist*0.05,dz/dist*0.05);   // it is solid: you're shouldered off it, not stood inside it
    // the old moves run on the old machinery; when it's done (idle again), it has to recover
    if(bf.mode==='old'){ d.pose=null; if(d.state==='idle'){ bf.mode='recover'; bf.t=Math.round(F.recover*0.7); d.state='bf'; } else return false; }
    d.bfOpen=bf.mode==='recover'||bf.mode==='stagger'||d.state==='stunned'; d.bfActing=bf.mode!=='stalk';
    // a parried blow: the old 'stunned' (the reel) — it stands open until it steadies
    if(d.state==='stunned'){ d.pose='stagger'; bf.mode='stunned'; return false; }
    if(bf.mode==='stunned'){ bf.mode='stalk'; bf.t=F.idle[bf.ph]; }
    d.state='bf'; d.walking=false;
    // the turns of the fight: at two-thirds, and at a third
    const TH=[0.66,0.33]; if(bf.ph<2&&d.hp<d.maxHp*TH[bf.ph]&&(bf.mode==='stalk'||bf.mode==='recover'||bf.mode==='stagger')){ bf.ph++; bf.mode='roar'; bf.t=84; bf.hz=bf.hz||{}; if(bf.hz.beams){ bf.hz.beams.forEach(b=>c.fx.remove(b.g)); bf.hz.beams=null; }
      d.guardUntil=now()+1500; d.pose='roar'; d.poseK=0; K.shake(0.5); SFX.play('bossRoar'); K.pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.g.userData.tall||3.5)+0.6,d.z,'Phase '+(bf.ph+1),'#ff9a6a');
      if(!F.quietPhase) UI.toast('⚠ '+(d.name||'It')+' — '+F.phases[bf.ph-1]+' (jump the shockwave!)',2400); if(cfg.onPhase) cfg.onPhase(d,bf.ph); if(d.bossForm===0) clones(d,K,bf.ph); }
    if(bf.mode==='roar'){ bf.t--; d.pose='roar'; d.poseK=1-bf.t/84; d.face=Math.atan2(dx,dz); d.guardUntil=Math.max(d.guardUntil||0,now()+200);
      if(bf.t===52){ d.ring=1; d.ringR=0; d.ringJumped=false; d.anchorx=d.x; d.anchorz=d.z; d.wave=false; d.move={ringSpeed:5.2,ringMax:150}; K.dust(d.x,d.z); }
      if(bf.t<=0){ bf.mode='stalk'; bf.t=24; d.pose=null; } ringTick(d,K,X); return true; }
    ringTick(d,K,X);
    if(bf.mode==='stagger'||bf.mode==='recover'){ bf.t--; d.pose=bf.mode==='stagger'?'stagger':'recover'; if(d.alt>0) d.alt=Math.max(0,d.alt-0.08); if(bf.t<=0){ bf.mode='stalk'; bf.t=F.idle[bf.ph]; d.pose=null; } return true; }
    if(bf.mode==='stalk'){ d.pose=null; const flo=d.bossForm===0?0.35:0; if(d.alt!==flo) d.alt+=(flo-d.alt)*0.08;
      // a lamp to put out, or some other errand the hall has for it, comes first
      if(d._hold&&d.anchorx!=null){ const ax=d.anchorx-d.x, az=d.anchorz-d.z, r=Math.hypot(ax,az); if(r>0.15){ move(d,ax/r*F.speed*1.5,az/r*F.speed*1.5,K); d.walking=true; } d.face=Math.atan2(dx,dz); return true; }
      const want=F.range; let mx=0, mz=0; const ux=dx/(dist||1), uz=dz/(dist||1);
      if(dist>want+0.5){ mx=ux; mz=uz; } else if(dist<want-0.9){ mx=-ux*0.5; mz=-uz*0.5; } else { mx=-uz*bf.strafe*0.6; mz=ux*bf.strafe*0.6; if(Math.random()<0.006) bf.strafe*=-1; }
      if(mx||mz){ move(d,mx*F.speed,mz*F.speed,K); d.walking=true; }
      d.face=Math.atan2(dx,dz); if(!(cfg.quiet&&cfg.quiet())) bf.t--;
      if(bf.t<=0){ const mv=pick(d,dist); bf.move=mv; bf.perfect=false; bf.whiff=false; X.mv=mv;
        if(mv.c==='old'){ const o=mv.mv; d.move=o; d.kind=o.kind; d.state='telegraph'; d.telegraph=Math.round(o.telegraph*TELK[bf.ph]); d.telMax=d.telegraph; SFX.play('bossTelegraph'); bf.mode='old'; return false; }
        if(mv.c==='sig'){ bf.mode='sig'; SIG[mv.sig].start(d,K,X); return true; }
        bf.mode='close'; bf.t=70; }
      return true; }
    // a combo begins in reach: it closes in on you first
    if(bf.mode==='close'){ const st0=bf.move.steps[0], reach=st0.reach+st0.lunge*0.8; bf.t--; d.face=Math.atan2(dx,dz);
      if(dist>reach*0.85&&bf.t>0){ move(d,dx/dist*F.speed*1.7,dz/dist*F.speed*1.7,K); d.walking=true; return true; }
      bf.mode='combo'; bf.si=0; bf.sub='wind'; bf.t=0; bf.face=Math.atan2(dx,dz); beginStep(d,K); return true; }
    if(bf.mode==='combo'){ const st=bf.move.steps[bf.si], tel=Math.max(9,Math.round(st.tel*TELK[bf.ph])); bf.t++;
      if(bf.sub==='wind'){ const k=Math.min(1,bf.t/tel); d.pose='wind'; d.poseK=k; d.shape=st.shape; d.side=st.side;
        if(k<0.7&&st.shape!=='spin'&&st.shape!=='slam'||k<0.45) bf.face=Math.atan2(dx,dz); d.face=bf.face;
        const ox=d.x+Math.sin(bf.face)*st.lunge, oz=d.z+Math.cos(bf.face)*st.lunge; place(bf.P,ox,oz,bf.face); fill(bf.P,k);
        if(bf.t>=tel){ bf.sub='strike'; bf.t=0; fire(bf.P); bf.ox=ox; bf.oz=oz; bf.x0=d.x; bf.z0=d.z; d.pose='strike'; SFX.play('bossStrike'); if(st.shape==='slam'){ K.shake(0.45); K.dust(ox,oz); } } return true; }
      if(bf.sub==='strike'){ const N=6, k=Math.min(1,bf.t/N); d.poseK=k; const nx=bf.x0+(bf.ox-bf.x0)*k, nz=bf.z0+(bf.oz-bf.z0)*k; if(K.walk(nx,nz)){ d.x=nx; d.z=nz; }
        if(bf.t===2){ if(inside(p.x,p.z,d.x+(bf.ox-d.x),d.z+(bf.oz-d.z),bf.face,st)){ const r=land(d,st,K,X,X.dmg); if(r==='parry'){ bf.mode='stunned'; return false; } } else if(st.heavy&&bf.si===bf.move.steps.length-1) bf.whiff=true; }
        if(bf.t>=N+st.gap){ bf.si++; if(bf.perfect||bf.si>=bf.move.steps.length){ return endMove(d,K,F); } bf.sub='wind'; bf.t=0; beginStep(d,K); } return true; } }
    if(bf.mode==='sig'){ const r=SIG[bf.move.sig].tick(d,K,X); if(d.state==='stunned'){ bf.mode='stunned'; return false; } if(r) return endMove(d,K,F); return true; }
    return true; }
  function beginStep(d,K){ const bf=d.bf, st=bf.move.steps[bf.si]; bf.P=paint(K,st.shape,st); }
  function endMove(d,K,F){ const bf=d.bf, p=K.P(); d.pose=null;
    const sk=1+((K.perk&&K.perk().staggerK)||0);
    if(bf.perfect){ bf.mode='stagger'; bf.t=Math.round(100*sk); K.pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.g.userData.tall||3.5)*0.8,d.z,'Off balance!','#8affd8'); }
    else if(bf.whiff){ bf.mode='stagger'; bf.t=Math.round(F.recover*1.5*sk); K.pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.g.userData.tall||3.5)*0.8,d.z,'Overreached — strike!','#ffd84a'); }
    else { bf.mode='recover'; bf.t=F.recover; }
    if(!bf.tipOpen){ bf.tipOpen=true; setTimeout(()=>UI.toast('⚔ It’s open — now your blows bite in full. While its guard is up they barely scratch it.',2400),200); }
    if(d.alt>0) d.alt=Math.max(0,d.alt); if(cfg()&&cfg().moveDone) cfg().moveDone(d); return true; }
  const cfg=()=>{ const c=ENGINE.level&&ENGINE.level.combat; return c&&c.cfg; };
  function move(d,vx,vz,K){ const c=K.A().cfg, W=c.W||20, H=c.H||20, nx=Math.max(1.4,Math.min(W-1.4,d.x+vx)), nz=Math.max(1.4,Math.min(H-1.4,d.z+vz)); if(K.walk(nx,d.z)) d.x=nx; if(K.walk(d.x,nz)) d.z=nz; }
  function ringTick(d,K,X){ if(!d.ring) return; const cf=K.A().cfg; if(cf.ringTick) cf.ringTick(d); d.ringR+=(d.move&&d.move.ringSpeed||5)*K.PX; const p=K.P(), rd=Math.hypot(p.x-d.anchorx,p.z-d.anchorz); if(Math.abs(rd-d.ringR)<0.5) K.ringHit(d,X.dmg*0.7); if(d.ringR>(d.move&&d.move.ringMax||150)*K.PX) d.ring=0; }
  // the Imp's shadows: copies of it, small and quick, that come for you
  function clones(d,K,ph){ const c=K.A(); const n=ph>=2?3:2, have=c.adds.filter(a=>a.alive&&a.shade).length; for(let i=0;i<n-have;i++){ const a=i/n*PI*2+Math.random(), x=Math.max(1.5,Math.min(c.cfg.W-1.5,d.x+Math.cos(a)*2.4)), z=Math.max(1.5,Math.min(c.cfg.H-1.5,d.z+Math.sin(a)*2.4));
      const m=(typeof BOSS3D!=='undefined'&&BOSS3D.make(0,d.level))||null; if(m){ m.scale.multiplyScalar(0.42); (m.userData.mats||[]).forEach(q=>{ q.transparent=true; q.opacity=0.72; q.emissive&&q.emissive.setHex(0x1a0830); }); }
      const lv=Math.max(1,(d.level||4)-3); K.add({x,z,hp:5+lv,level:lv,speed:1.7*K.PX,shade:true,model:m||undefined}); K.dust(x,z); } }
  // its armour: blows on its guard only chip it; open, it takes them in full and half again in a stagger
  function gate(d,K){ if(!d.bf) return 1; const cf=cfg(), o=d.bfOpen||d.state==='stunned'||!!(cf&&cf.pierce&&cf.pierce());
    if(o) return d.bf.mode==='stagger'?1.35:1;
    const t=now(); if(!d.bf.armPop||t-d.bf.armPop>900){ d.bf.armPop=t; K.pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.g.userData.tall||3.5)*0.7,d.z,'Armoured','#a8b0c8'); }
    if(!d.bf.tipArm&&(d.bf.armN=(d.bf.armN||0)+1)>=3){ d.bf.tipArm=true; UI.toast('🛡 Its guard is up — your blows barely scratch it. Dodge its attacks and punish it when it opens.',2600); }
    return 0.2; }
  // the fight over (or the hall left): its chains, its water, its roots and its paint taken up
  function end(d){ const bf=d&&d.bf; if(!bf) return; const rm=m=>{ if(m&&m.parent) m.parent.remove(m); }, H=bf.hz||{};
    (H.beams||[]).forEach(b=>rm(b.g)); (H.walls||[]).forEach(w=>rm(w.m)); (H.lines||[]).forEach(L=>{ rm(L.g); rm(L.P&&L.P.g); }); (H.drops||[]).forEach(D=>{ rm(D.m); rm(D.P&&D.P.g); }); bf.hz={}; if(bf.s){ rm(bf.s.m); rm(bf.s.trail); } reset(); }
  function reset(){ fxList.slice().forEach(P=>{ if(P.g.parent) P.g.parent.remove(P.g); }); fxList.length=0; }
  return {has,step,gate,reset,end,cap:d=>((FIGHTS[d.bfForm]||{}).cap||0.035),open:d=>!!(d&&(d.bfOpen||d.state==='stunned')),FIGHTS};
})();
