// ════════════════════════════════════════════════════════════════
//  PEOPLE — low-poly townsfolk from KLK's look / outfit names.
//  person(look, opts) → THREE.Group facing +z, feet at y=0.
//  Looks: soldier, royalguard, knight (opts.her = {main,trim}), matthew, merchant, merchantD,
//  innkeep, patronA, guest, shadeTr, peasant, peasantF, vill (opts.outfit), priest, general (opts.tint),
//  scribe, bard, king, noble.  Unknown looks fall back to a plain villager.
// ════════════════════════════════════════════════════════════════
const SKIN=0xe0b080;
// the 2D game's own OUTFITS (skin, hair, top, bottom, hat, apron) — every villager takes its colours from these,
// so a nomad, a smith or a shade looks as it was drawn
const OUTFITS_2D={peasant:{skin:0xe0b080,hair:0x6a4a2a,top:0x9a7a4a,bottom:0x6f5436,hat:0xcaa56a},peasantF:{skin:0xe8bc92,hair:0x8a5a2a,top:0xa85a6a,bottom:0x7a4a5a,apron:0xe8e0d0},farmer:{skin:0xd8a878,hair:0x9a9a9a,top:0x6a8a4a,bottom:0x5a5a3a,hat:0x8a6a3a},child:{skin:0xf0c8a0,hair:0xcaa030,top:0xd08040,bottom:0x5a6a8a},smith:{skin:0xcf9a68,hair:0x3a2a1a,top:0x5a3a2a,bottom:0x3a2a22,apron:0x4a4a52},smithF:{skin:0xe0a878,hair:0x5a3a2a,top:0x7a4a3a,bottom:0x4a3a32,apron:0x52525a},soldier:{skin:0xd8a878,hair:0x4a4a5a,top:0x5a6a8a,bottom:0x3a4a5a,hat:0x9aa0b0},fisher:{skin:0xdca878,hair:0x5a4a2a,top:0x3a8a9a,bottom:0x4a5a6a,hat:0xd8c878},fisherF:{skin:0xe8b888,hair:0x7a5a2a,top:0x4a9aaa,bottom:0x5a6a7a,apron:0xcfe0e0},sailor:{skin:0xcf9a68,hair:0x8a8a8a,top:0xdceaf0,bottom:0x2a4a7a,hat:0x1a3a6a},hunter:{skin:0xcf9a68,hair:0x3a2a1a,top:0x3a5a2a,bottom:0x4a3a22,hat:0x2f4a1f},hunterF:{skin:0xe0a878,hair:0x5a3a1a,top:0x4a6a32,bottom:0x3a3a22,hat:0x2f4a1f},woodcutter:{skin:0xd8a060,hair:0x6a4a2a,top:0x7a4a2a,bottom:0x4a3a22,apron:0x5a6a3a},nomad:{skin:0xc88a52,hair:0x2a1a0e,top:0xd8c090,bottom:0xb89860,hat:0xe8dcc0},nomadF:{skin:0xd49a62,hair:0x2a1a0e,top:0xc89070,bottom:0xa87858,apron:0xe0d0b0},merchantD:{skin:0xc88a52,hair:0x2a1a0e,top:0x7a3a6a,bottom:0x5a2a4a,hat:0xd8b040},monk:{skin:0xe0b890,hair:0x9a9a9a,top:0x8a6a4a,bottom:0x6a4a32,hat:0x7a5a3a},monkF:{skin:0xe8c098,hair:0xaaaaaa,top:0x7a5a8a,bottom:0x5a3a6a,hat:0x6a4a7a},pilgrim:{skin:0xd8a878,hair:0x6a4a2a,top:0x9aa0b0,bottom:0x5a5a6a,hat:0xcfcad0},survivor:{skin:0xb88a60,hair:0x3a2a22,top:0x6a4a42,bottom:0x4a3a32,hat:0x5a4a42},survivorF:{skin:0xc89870,hair:0x3a2a22,top:0x7a5a52,bottom:0x4a3a32,apron:0x8a7a72},embersmith:{skin:0xb07850,hair:0x2a1a12,top:0x8a3a2a,bottom:0x3a2a22,apron:0x4a3a32},shade:{skin:0xc8c0c8,hair:0x3a3a44,top:0x4a4a58,bottom:0x33333e,hat:0x3a3a48},shadeF:{skin:0xd0c8d0,hair:0x44444e,top:0x5a4a6a,bottom:0x3a3344,hat:0x43384e},watcher:{skin:0xbcb4ba,hair:0x8a8a92,top:0x3e4650,bottom:0x2e343c,hat:0x4a525c},innkeep:{skin:0xe0b080,hair:0x5a3a2a,top:0x8a4a3a,bottom:0x4a3a32,apron:0xe8e0d0},patronA:{skin:0xd8a878,hair:0x6a4a2a,top:0x6a6a4a,bottom:0x4a4a3a},patronB:{skin:0xcf9a68,hair:0x8a8a8a,top:0x5a4a6a,bottom:0x3a3a4a},guest:{skin:0xe0b080,hair:0x3a2a1a,top:0x4a6a5a,bottom:0x5a4a32,hat:0x6f5436},merchant:{skin:0xe0b080,hair:0x4a3a2a,top:0x7a3a8a,bottom:0x3a2a44,hat:0xc8a038},fishmong:{skin:0xdca878,hair:0x5a4a2a,top:0x3a8a9a,bottom:0x2a4a5a,apron:0x9ab8c0},caravanM:{skin:0xc08858,hair:0x2a1a0a,top:0xc8a05a,bottom:0x8a6a3a,hat:0xe8d0a0},shadeTr:{skin:0xd0c8d0,hair:0x44444e,top:0x5a4a6a,bottom:0x3a3344,hat:0x43384e},qmaster:{skin:0xd8a878,hair:0x7a7a7a,top:0x5a6a8a,bottom:0x3a4a5a,hat:0x9aa0b0,apron:0x7a5c3a},reuben:{skin:0xd8a070,hair:0x7a2a1a,top:0x2a7a7a,bottom:0x5a3a5a,hat:0xb8452a,apron:0xe0c070}};
const LOOK_OUTFIT={mastersmith:'smith',caravan:'caravanM'};
// the named people the 2D game drew by hand (drawSirJoshua, drawKingLuminar, drawPrincessMadison, drawRoyalGuard, drawAldric,
// drawSage, drawLibrarian, drawElijah, drawSquireMatthew, drawRobby, drawCheyenne, drawBenji): whoever builds them, by whatever
// look, they come out as themselves
const NAMED_LOOK={'Sir Aldric':'aldric','Princess Madison':'madison','Sir Joshua':'joshua','Ezra the Scribe':'librarian','Eldan the Sage':'sage','King Karl':'king',
  'Royal Guard':'royalguard','Elijah':'elijah','Old Man Elijah':'elijah','Robby':'robby','Cheyenne':'cheyenne','Benji':'benji','Squire Matthew':'matthew','Dylan':'dylan','Ethan':'ethan','Ranger Cody':'cody'};
const LOOKS={
  soldier:   {body:0x3b6fd4,legs:0x2a4a8a,helm:0xc9cdd6,spear:true},
  royalguard:{body:0x2f4a8f,legs:0x1f3a70,helm:0xc9cdd6,trim:0xe8c766,halberd:true,tall:1.08},
  knight:    {body:0x2f4a8f,legs:0x2a3a5a,helm:0xc9cdd6,trim:0xe8c766,plate:true},
  matthew:   {body:0x8a6a3a,legs:0x4a3220,hair:0xb8742a,small:0.82,trim:0x2f4a8f},
  merchant:  {body:0x7a3a5a,legs:0x3a2a20,hat:0xe8c766,apron:0xe8dcc0},
  merchantD: {body:0x7a5a2e,legs:0x4a3220,hat:0x3f8a4e},
  innkeep:   {body:0x8a5a32,legs:0x4a3220,hair:0x6a4a2a,apron:0xf0e8d8,round:true},
  patronA:   {body:0x5a7a3a,legs:0x3a2a20,hair:0x3a2a1a,mug:true},
  guest:     {body:0x6a5a8a,legs:0x3a3040,hair:0xc8a060},
  shadeTr:   {body:0x2a2a34,legs:0x1a1a22,hood:0x22222c,robe:true},
  peasant:   {body:0xc8a46a,legs:0x6b4a2e,brim:0xe0c66a},
  peasantF:  {body:0x9a5a6a,legs:0x9a5a6a,hair:0x6a3a1a,dress:true,kerchief:0xe8dcc0},
  priest:    {body:0xf4f2ec,legs:0xf4f2ec,hair:0x9a9aa2,robe:true,stole:0x7a3a9a,cross:0xe8c040},
  general:   {body:0x3a4a9a,legs:0x3a4a9a,hair:0x4a3020,robe:true,belt:0xe8c25a,circlet:true},
  scribe:    {body:0x7a5a3a,legs:0x7a5a3a,hair:0xd8d4cc,beard:0xe8e4dc,robe:true,belt:0x4a3220,scroll:true},
  bard:      {body:0x9a3a3a,legs:0x3a3a5a,hat:0x2f6a3a,feather:true,lute:true},
  king:      {body:0x8f2f2f,legs:0x8f2f2f,hair:0xe8e4dc,beard:0xe8e4dc,robe:true,crown:true,trim:0xe8c766,cape:0x2f4a8f},
  noble:     {body:0x2f4a8f,legs:0x2a2a3a,hair:0x4a3020,trim:0xe8c766},
  // the villagers of the other nine towns, by their outfit names
  farmer:    {body:0x7a9a4a,legs:0x5a4a2e,brim:0xd8c070},
  child:     {body:0xd86a4a,legs:0x4a5a8a,hair:0x8a5a2a,small:0.66},
  nomad:     {body:0xd8c49a,legs:0xb89a6a,hood:0xe8dcc0,robe:true,belt:0x9a3a2a},
  nomadF:    {body:0xb84a3a,legs:0xb84a3a,hair:0x2a1a10,dress:true,kerchief:0xe8c860},
  monk:      {body:0x7a5a3a,legs:0x7a5a3a,hair:0x8a7a6a,robe:true,belt:0xd8c49a},
  monkF:     {body:0x8a7a6a,legs:0x8a7a6a,hair:0x5a4a3a,dress:true,kerchief:0xf0ece0},
  pilgrim:   {body:0x8a8478,legs:0x8a8478,brim:0x5a4a3a,robe:true,belt:0x5a3a20},
  smith:     {body:0x5a4a42,legs:0x3a2e28,hair:0x2a1a10,apron:0x3a2a20,beard:0x3a2a1a},
  smithF:    {body:0x6a4a3a,legs:0x3a2e28,hair:0x8a3a1a,apron:0x3a2a20},
  reuben:    {body:0x2a7a7a,legs:0x5a3a5a,hood:0xb8452a,robe:true,apron:0xe0c070},   // a patched traveller's robe and a rust-red hood
  hunter:    {body:0x4a6a3a,legs:0x4a3a2a,hood:0x3a5a2e},
  hunterF:   {body:0x5a7a42,legs:0x4a3a2a,hair:0xa86a2a,dress:true},
  woodcutter:{body:0xa83a2a,legs:0x3a3a4a,hair:0x6a4a2a,beard:0x6a4a2a},
  survivor:  {body:0x7a706a,legs:0x5a524c,hair:0x4a4440},
  survivorF: {body:0x8a7a72,legs:0x8a7a72,hair:0x5a4a40,dress:true,kerchief:0x9a908a},
  embersmith:{body:0x4a3a34,legs:0x2e2624,hair:0x1a1410,apron:0xd8742a},
  shade:     {body:0x3a3448,legs:0x2a2634,hood:0x2e2a3a,robe:true},
  shadeF:    {body:0x463e56,legs:0x463e56,hood:0x352f44,robe:true},
  watcher:   {body:0x2e3a4a,legs:0x222a36,hood:0x26303e,robe:true,belt:0xa8e0d8},
  fisher:    {body:0xd8b830,legs:0x3a4a5a,brim:0xd8b830},
  fisherF:   {body:0x4a7a9a,legs:0x4a7a9a,hair:0x8a5a2a,dress:true,apron:0xe8dcc0},
  sailor:    {body:0xf0ece0,legs:0x2a3a6a,hat:0x2a3a6a,trim:0x2a3a6a},
  caravan:   {body:0xb8862a,legs:0x7a5a2e,hood:0xe8dcc0,robe:true,belt:0x8a3a2a},
  qmaster:   {body:0x4a6a9a,legs:0x3a3a4a,hair:0x9a9aa2,beard:0x9a9aa2,apron:0xd8d0c0},
  mastersmith:{body:0x5a4a42,legs:0x2e2624,hair:0x3a2a1a,beard:0x6a4a2a,apron:0x2a1e18,round:true},
  fishmong:  {body:0x4a7a9a,legs:0x3a3a4a,brim:0xd8b830,apron:0xe8e0d0},
  patronB:   {body:0x8a5a3a,legs:0x3a2a20,hair:0x2a1a10,mug:true},
  // ── the hand-drawn ones ──
  joshua:    {tall:1.2,body:0x4a8a3a,legs:0x8a8e98,skin:0xe0a878,hair:0x6a4a2a,stubble:0x7a5a3a,cross:0xe8c040,bigPaul:0xe4e8ee,band:0x9aa0aa,tuft:0x4a8a3a},
  aldric:    {body:0xf0ece0,legs:0x9a9ea8,helm:0xf2efe6,trim:0xe8b93a,plate:true,crest:0xe8c040,cape:0xb82a2a,belt:0xe8b93a,paul:0xe8c040},
  royalguard:{body:0x2f4a9a,legs:0xa8aeb8,helm:0xd8dce4,trim:0xe8c040,plate:true,plume:0xc8302a,paul:0xe8c040,emblem:0xe8c040,halberd:true,tall:1.08},
  madison:   {tall:0.9,body:0xe07090,legs:0xc0506a,skin:0xf4d0b0,hair:0xd8b070,dress:true,longHair:true,tiara:0xe8c040,gem:0xd83040,bodice:0xf2c860,cheeks:0xf0a0a0},
  sage:      {body:0x3a6a3a,legs:0x2e5a30,hood:0x2f5530,robe:true,beard:0xeeeae0,longBeard:true,staff:0x7a5230,staffGem:0x8af0b0},
  librarian: {body:0x2f5a3a,legs:0x2f5a3a,skin:0xe8c8a0,hair:0xd8d4cc,bald:true,beard:0xe8e4da,longBeard:true,robe:true,stole:0xc8a038},
  elijah:    {body:0xe07a4a,legs:0xd8c8a0,skin:0xb87a50,hair:0x2a1a10,beard:0xf0eee8,board:true},
  robby:     {body:0xe8dcc0,legs:0xf2f0ea,skin:0xe8bc92,hair:0x6a4a2a,bucket:0x9ad8b8,flower:0xf08ab0},
  cheyenne:  {body:0xf4f2ec,legs:0xf4f2ec,skin:0xf0c8a0,hair:0xe8c860,dress:true,brim:0xd8b878,spots:0x2a2a2a,longHair:true},
  benji:     {body:0xf2f0ea,legs:0xd8c890,skin:0xf0c8a0,hair:0x8a5a2a,cap:0xd8302a,stripe:0x4aa04a,small:0.7},
  king:      {body:0xf0ead8,legs:0x2a4a8a,skin:0xd8a070,hair:0x7a4a22,beard:0x7a4a22,bigBeard:true,bun:true,circlet:0xe8c040,gem:0xd83040,fish:0xe8b93a,trim:0xe8c040}
};
// ── ROBBY, CHEYENNE AND BENJI ── built to their own sprites (drawRobby, drawCheyenne, drawBenji), not from the shared
// outfit kit: Robby's pale-mint cap with the pink patch and the thin moustache, his white tee with the little navy print,
// khaki shorts and trainers; Cheyenne's straw hat, blonde hair, dark glasses and smile, the narrow white summer dress, the
// flowers on her arm, the bag strap and the black pouch; Benji, two, with a big head under a junior fire helmet (wide brim,
// cream badge), a green striped shirt and khaki dungarees, wearing the unimpressed mouth.
const NAMED_BUILT=new Set(['dylan','ethan','cody','robby','cheyenne','benji','king','madison','joshua','aldric','matthew','royalguard','sage','librarian','elijah','priest']);
const FAMILY_MORE=new Set(['dylan','ethan','cody','aldric','matthew','royalguard','sage','librarian','elijah','priest']);
function familyPerson(look,opts){ const g=new THREE.Group(), inner=group(0,0,0,g), tag=(m,p)=>{ m.userData.part=p; return m; };
  const kid=look==='benji', S0=kid?0.66:look==='madison'?0.92:look==='joshua'?1.2:look==='matthew'?0.86:look==='royalguard'?1.08:look==='dylan'?1.06:look==='ethan'?0.96:1; inner.scale.setScalar(S0);
  const SK=look==='dylan'?0xe8b890:look==='ethan'?0xe2b88c:look==='cody'?0xd8a47a:look==='matthew'?0xf0c8a0:look==='sage'?0xe8c9a0:look==='librarian'?0xe0c09a:look==='elijah'?0xc08858:look==='priest'||look==='royalguard'?0xe8b88a:look==='joshua'?0xd8a878:look==='robby'||look==='king'?0xe8b88a:look==='cheyenne'||look==='madison'?0xf0c49a:0xf2c9a4, SKD=new THREE.Color(SK).multiplyScalar(0.84).getHex();
  const hy=kid?1.12:look==='joshua'?1.17:1.2, HR=kid?0.25:0.2, sh=kid?0.78:0.94;
  // legs and feet
  const legs=(col,top,bare,shoe,sole)=>[-1,1].forEach(sd=>{ const pt=sd>0?4:5; tag(Cy(0.07,0.062,top,10,bare?SK:col,sd*0.095,0.05,0,inner),pt); tag(Sp(0.068,shoe||0xf0ece4,sd*0.095,0.05,0.035,inner,10,6),pt).scale.set(1,0.62,1.45); tag(B(0.13,0.03,0.2,sole||0xd8d2c8,sd*0.095,0,0.035,inner),pt); });
  // arms: a short sleeve in the shirt's colour, then bare skin to the hand
  const arms=(sleeve,len)=>[-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.085,sleeve,sd*0.24,sh-0.03,0,inner,12,8),pt); tag(Cy(0.075,0.07,0.14,10,sleeve,sd*0.255,sh-0.2,0,inner),pt);
      tag(Cy(0.055,0.05,len,10,SK,sd*0.26,sh-0.2-len,0,inner),pt); tag(Sp(0.055,SK,sd*0.262,sh-0.24-len,0.01,inner,8,6),pt).scale.set(0.9,1.1,1); });
  // the head: a round face with the 2D sprites' eyes, set a row apart from everything else
  const head=()=>{ tag(Cy(0.065,0.075,0.1,8,SK,0,hy-HR-0.07,0,inner),3); tag(Sp(HR,SK,0,hy,0,inner,16,12),3).scale.set(1,1.02,0.95);
    [-1,1].forEach(sd=>tag(Sp(HR*0.22,SK,sd*HR*0.98,hy,0,inner,8,6),3).scale.set(0.5,1,0.8));                                        // ears
    tag(Co(HR*0.13,HR*0.3,6,SKD,0,hy-HR*0.15,HR*0.97,inner),3).rotation.x=Math.PI/2+0.25; };                                        // nose
  const eyes=(dark)=>[-1,1].forEach(sd=>{ tag(Sp(HR*0.19,0xf8f4ee,sd*HR*0.36,hy+HR*0.12,HR*0.83,inner,8,6),3).scale.set(1,1.15,0.55); tag(Sp(HR*0.13,dark||0x2a2018,sd*HR*0.36,hy+HR*0.11,HR*0.92,inner,8,6),3).scale.set(1,1.2,0.7); tag(Sp(HR*0.045,0xffffff,sd*HR*0.36+HR*0.05,hy+HR*0.19,HR*1.0,inner,4,3),3); });
  if(look==='robby'){
    legs(0,0.24,true); tag(Cy(0.1,0.1,0.2,10,0xc8b89a,0.1,0.26,0,inner),4); tag(Cy(0.1,0.1,0.2,10,0xc8b89a,-0.1,0.26,0,inner),5);   // bare shins, khaki shorts
    Cy(0.2,0.215,0.12,14,0xc8b89a,0,0.4,0,inner); Cy(0.21,0.2,0.46,14,0xf4f2ec,0,0.48,0,inner); Cy(0.205,0.205,0.03,14,0xd2cfc8,0,0.48,0,inner);   // waistband, the tee and its hem
    B(0.11,0.07,0.02,0x3a5a78,0,0.76,0.205,inner); B(0.05,0.03,0.022,0xf4f2ec,0,0.775,0.207,inner);                            // the small chest print
    arms(0xf4f2ec,0.28); head(); eyes();
    [-1,1].forEach(sd=>{ const m=tag(B(0.085,0.024,0.03,0x7a4434,sd*0.04,hy-HR*0.4,HR*0.92,inner),3); m.rotation.z=sd*0.14; });     // the thin moustache, two rows below the eyes
    [-1,1].forEach(sd=>tag(B(0.035,0.1,0.1,0x3a2418,sd*HR*0.95,hy+HR*0.12,-0.01,inner),3));                                       // dark hair showing at the sides
    { const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.03,14,8,Math.PI,Math.PI,Math.PI*0.25,Math.PI*0.42),flat(0x3a2418)),3); hb.position.set(0,hy,0); inner.add(hb); }   // the back of his head below the cap
    const cap=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.06,16,8,0,Math.PI*2,0,Math.PI*0.5),flat(0xa8d4bc)),3); cap.position.set(0,hy+HR*0.22,0); cap.scale.set(1,0.78,1); inner.add(cap);
    tag(Cy(HR*1.07,HR*1.07,0.035,16,0x7fae98,0,hy+HR*0.2,0,inner),3);                                                           // the band
    const brim=tag(new THREE.Mesh(new THREE.CylinderGeometry(HR*0.75,HR*0.75,0.025,16,1,false,-Math.PI/2,Math.PI),flat(0x7fae98)),3); brim.position.set(0,hy+HR*0.3,HR*0.62); brim.scale.set(1.05,1,1.1); brim.rotation.x=0.12; inner.add(brim);   // the bill
    tag(Sp(0.028,0xf0a0b8,0,hy+HR*0.62,HR*0.86,inner,8,6),3).scale.set(1.5,0.8,0.4);                                                // the pink patch on the front
  }
  if(look==='cheyenne'){
    legs(0,0.3,true);
    Cy(0.2,0.31,0.4,16,0xf7f5ef,0,0.26,0,inner); Cy(0.312,0.312,0.035,16,0xdad7ce,0,0.26,0,inner);                                 // the skirt, flaring a little, its hem
    Cy(0.15,0.19,0.34,14,0xf7f5ef,0,0.62,0,inner); Cy(0.155,0.155,0.03,14,0xdad7ce,0,0.66,0,inner);                                // a narrow bodice, the waist drawn in
    const st=B(0.035,0.5,0.02,0x3a3a44,0,0.72,0.165,inner); st.rotation.z=0.62;                                                    // the bag strap across her
    B(0.13,0.13,0.07,0x2e2e36,0.2,0.46,0.12,inner); B(0.13,0.03,0.072,0xe8e4dc,0.2,0.57,0.12,inner);                               // the pouch at her hip
    [-1,1].forEach(sd=>tag(Cy(0.04,0.04,0.14,8,0xf7f5ef,sd*0.15,0.82,0,inner),sd>0?1:2));                                         // straps over the shoulders
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.062,SK,sd*0.2,0.9,0,inner,10,7),pt); tag(Cy(0.052,0.045,0.42,10,SK,sd*0.215,0.46,0,inner),pt); tag(Sp(0.05,SK,sd*0.218,0.44,0.01,inner,8,6),pt); });   // bare arms, in close
    for(let i=0;i<3;i++) tag(Sp(0.018,0x8fb6cf,0.215+0.03,0.6+i*0.06,0.02,inner,6,4),1);                                        // the flowers on one arm
    head(); eyes();
    tag(B(HR*1.38,HR*0.26,0.03,0x2a2430,0,hy+HR*0.12,HR*0.95,inner),3); [-1,1].forEach(sd=>tag(B(0.02,0.02,HR*0.8,0x2a2430,sd*HR*0.72,hy+HR*0.15,HR*0.45,inner),3));   // dark glasses, and their arms
    const sm=tag(new THREE.Mesh(new THREE.TorusGeometry(0.03,0.006,4,10,Math.PI),flat(0xc9806e)),3); sm.position.set(0,hy-HR*0.48,HR*0.9); sm.rotation.z=Math.PI; inner.add(sm);   // a smile
    [-1,1].forEach(sd=>{ const lk=tag(Cy(0.05,0.065,0.3,8,0xecd691,sd*HR*0.98,hy-0.24,0.0,inner),3); lk.scale.set(0.8,1,1.2); });                                     // blonde either side, to the shoulder
    { const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.05,16,10,Math.PI,Math.PI,0,Math.PI*0.86),flat(0xecd691)),3); hb.position.set(0,hy,-0.01); hb.scale.set(1,1.12,1); inner.add(hb); }   // her hair, falling behind to the shoulders
    tag(Cy(HR*1.6,HR*1.6,0.025,18,0xb08f56,0,hy+HR*0.5,0,inner),3); tag(Cy(HR*0.9,HR*1.0,HR*0.55,14,0xd8b478,0,hy+HR*0.5,0,inner),3); tag(Cy(HR*0.88,HR*0.9,0.02,14,0xe8caa0,0,hy+HR*1.05,0,inner),3);   // the straw hat, pulled in
    tag(Cy(HR*1.01,HR*1.01,0.04,14,0xb08f56,0,hy+HR*0.55,0,inner),3);                                                           // its band
  }
  if(look==='benji'){
    legs(0xcbbd96,0.36); Cy(0.2,0.22,0.16,14,0xcbbd96,0,0.38,0,inner);                                                         // khaki dungarees
    B(0.2,0.16,0.03,0xcbbd96,0,0.5,0.19,inner); [-1,1].forEach(sd=>B(0.03,0.26,0.02,0xcbbd96,sd*0.08,0.52,0.2,inner));            // the bib and its straps
    Cy(0.19,0.2,0.3,14,0x8fbf7a,0,0.5,0,inner); [0.56,0.68].forEach(y=>Cy(0.195,0.195,0.035,14,0xe8f0d8,0,y,0,inner)); Cy(0.193,0.193,0.03,14,0x6fa35c,0,0.62,0,inner);   // the green striped shirt
    arms(0x8fbf7a,0.12); head(); eyes();
    tag(B(0.06,0.014,0.014,0xc98a78,0,hy-HR*0.5,HR*0.9,inner),3);                                                                // the unimpressed mouth: a short flat line
    [-1,1].forEach(sd=>tag(Sp(0.02,0xf0a8a0,sd*HR*0.58,hy-HR*0.22,HR*0.84,inner,6,4),3).scale.set(1,0.7,0.4));                   // toddler cheeks
    tag(B(HR*1.4,0.07,0.1,0x3a2418,0,hy+HR*0.45,HR*0.72,inner),3);                                                              // a dark brown fringe
    const hm=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.08,16,8,0,Math.PI*2,0,Math.PI*0.5),flat(0xc0261e)),3); hm.position.set(0,hy+HR*0.45,0); hm.scale.set(1,0.8,1.05); inner.add(hm);   // the junior fire helmet
    tag(Cy(HR*1.12,HR*1.12,0.05,16,0x8f1a14,0,hy+HR*0.42,0,inner),3);
    const br=tag(new THREE.Mesh(new THREE.CylinderGeometry(HR*1.55,HR*1.45,0.03,18),flat(0xc0261e)),3); br.position.set(0,hy+HR*0.4,-HR*0.22); br.scale.set(1,1,1.1); inner.add(br);   // its wide brim, long at the back
    tag(B(0.08,0.09,0.02,0xe8dcbb,0,hy+HR*0.9,HR*0.86,inner),3).rotation.x=-0.5;                                                 // the little shield badge
    tag(B(0.03,0.03,HR*1.2,0xa82018,0,hy+HR*1.3,0,inner),3);                                                                    // the ridge over the top
  }
  if(look==='king'){   // King Karl (drawKingLuminar): the man-bun with its red tie, a gold circlet with a red gem, a full beard darker than his hair, the cream tunic of golden fish
    legs(0x3a4a8a,0.36,false,0x5b3a1f,0x3a2414); [-1,1].forEach(sd=>tag(Cy(0.08,0.075,0.16,10,0x5b3a1f,sd*0.095,0.04,0,inner),sd>0?4:5));                  // blue trousers into brown boots
    Cy(0.22,0.24,0.52,16,0xf0ead8,0,0.4,0,inner); Cy(0.225,0.225,0.06,16,0xf2c14e,0,0.86,0,inner);                                // the tunic and its gold yoke
    Cy(0.235,0.235,0.06,16,0x5b3a1f,0,0.42,0,inner); B(0.07,0.07,0.03,0xf2c14e,0,0.415,0.235,inner);                             // the belt and its buckle
    B(0.1,0.12,0.06,0x5b3a1f,-0.2,0.33,0.12,inner);                                                                               // a pouch at his hip
    for(const [fx,fy,dir] of [[-0.09,0.74,1],[0.1,0.64,-1],[-0.05,0.53,1],[0.12,0.5,-1]]){ const f=Sp(0.03,0xf2c14e,fx,fy,0.222,inner,8,6); f.scale.set(1.7,0.85,0.4); Co(0.025,0.04,3,0xe8a83e,fx-dir*0.06,fy,0.22,inner).rotation.z=dir*Math.PI/2; }   // the golden fish
    arms(0xf0ead8,0.2); [-1,1].forEach(sd=>tag(Cy(0.077,0.077,0.03,10,0xf2c14e,sd*0.255,sh-0.21,0,inner),sd>0?1:2));             // sleeves with gold cuffs, bare forearms
    head(); eyes(); [-1,1].forEach(sd=>tag(B(0.06,0.018,0.02,0x5a3a20,sd*HR*0.36,hy+HR*0.42,HR*0.9,inner),3));                   // brows
    const BD=0x6f4522; tag(Sp(HR*0.95,BD,0,hy-HR*0.35,HR*0.18,inner,14,10),3).scale.set(1.05,0.9,0.9);                            // the full beard
    [-1,1].forEach(sd=>tag(B(0.05,0.18,0.12,BD,sd*HR*0.92,hy-HR*0.1,0.02,inner),3));                                             // sideburns into it
    [-1,1].forEach(sd=>{ const m=tag(B(0.09,0.03,0.04,BD,sd*0.045,hy-HR*0.36,HR*0.96,inner),3); m.rotation.z=sd*0.2; });          // moustache
    tag(B(0.06,0.018,0.02,0xc88a6a,0,hy-HR*0.5,HR*0.98,inner),3); [-1,1].forEach(sd=>tag(Sp(0.018,0x8a5a30,sd*0.06,hy-HR*0.72,HR*0.86,inner,5,4),3));   // the mouth, the beard's texture
    { const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.05,16,10,0,Math.PI*2,0,Math.PI*0.42),flat(0x8a5a30)),3); hb.position.set(0,hy+0.01,-0.01); inner.add(hb);
      const bk=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.04,14,8,Math.PI,Math.PI,Math.PI*0.3,Math.PI*0.4),flat(0x8a5a30)),3); bk.position.set(0,hy,0); inner.add(bk); }   // his hair, and the back of it
    tag(Sp(HR*0.42,0x8a5a30,0,hy+HR*1.0,-HR*0.35,inner,10,8),3); tag(Sp(HR*0.2,0xa8703c,0,hy+HR*1.25,-HR*0.3,inner,8,6),3); tag(Cy(HR*0.22,HR*0.25,0.04,10,0xc0432f,0,hy+HR*0.72,-HR*0.32,inner),3);   // the man-bun, its highlight, its red tie
    tag(Cy(HR*1.07,HR*1.07,0.045,18,0xf2c14e,0,hy+HR*0.35,0,inner),3); tag(Sp(0.03,0xc0432f,0,hy+HR*0.37,HR*1.06,inner,8,6),3);   // the gold circlet and its red gem
  }
  if(look==='madison'){   // Princess Madison (drawPrincessMadison): a rose gown, lighter on one side and deeper on the other, the gold bodice and placket, long golden hair, a tiara with a ruby
    [-1,1].forEach(sd=>tag(Sp(0.06,0xe8c766,sd*0.09,0.03,0.07,inner,8,6),sd>0?4:5).scale.set(1,0.6,1.3));                       // gold slippers peeping out
    const gw=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.36,0.62,20),new THREE.MeshPhongMaterial({color:0xc85a7a})); gw.position.y=0.31; inner.add(gw);   // the gown
    Cy(0.365,0.365,0.04,20,0x9a3a5a,0,0,0,inner); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const f=Cy(0.025,0.05,0.6,6,i%2?0xe88aa4:0x9a3a5a,Math.sin(a)*0.27,0.02,Math.cos(a)*0.27,inner); f.rotation.x=-Math.cos(a)*0.24; f.rotation.z=Math.sin(a)*0.24; }   // its folds and hem
    Cy(0.15,0.2,0.3,16,0xc85a7a,0,0.6,0,inner); B(0.07,0.3,0.02,0xe8c766,0,0.6,0.165,inner); Cy(0.155,0.155,0.035,16,0xe8c766,0,0.88,0,inner); Cy(0.205,0.205,0.03,16,0xe8c766,0,0.6,0,inner);   // the bodice, its placket, neckline and waist in gold
    for(let i=0;i<3;i++) Sp(0.012,0xfff8d0,0,0.66+i*0.08,0.18,inner,5,4);                                                        // buttons down the placket
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.075,0xe88aa4,sd*0.19,0.86,0,inner,12,8),pt).scale.set(1,0.85,1); tag(Cy(0.06,0.05,0.36,10,0xc85a7a,sd*0.215,0.5,0,inner),pt); tag(Cy(0.055,0.055,0.03,10,0xe8c766,sd*0.215,0.5,0,inner),pt); tag(Sp(0.045,SK,sd*0.217,0.47,0.01,inner,8,6),pt); });   // puffed sleeves, gold cuffs
    head(); eyes(0x3a2a1a); [-1,1].forEach(sd=>tag(Sp(0.026,0xf0a0a0,sd*HR*0.58,hy-HR*0.25,HR*0.84,inner,6,4),3).scale.set(1,0.7,0.4));   // rosy cheeks
    const sm=tag(new THREE.Mesh(new THREE.TorusGeometry(0.026,0.006,4,10,Math.PI),flat(0xd88a8a)),3); sm.position.set(0,hy-HR*0.42,HR*0.92); sm.rotation.z=Math.PI; inner.add(sm);   // a smile
    const HC=0xe8c05a; { const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.06,16,10,0,Math.PI*2,0,Math.PI*0.45),flat(HC)),3); hb.position.set(0,hy+0.01,-0.01); inner.add(hb);
      const bk=tag(new THREE.Mesh(new THREE.CylinderGeometry(HR*1.02,HR*1.2,0.5,14,1,true,Math.PI*0.62,Math.PI*0.76),flat(HC)),3); bk.position.set(0,hy-0.18,0); inner.add(bk); }   // her hair, and its fall down her back
    [-1,1].forEach(sd=>{ const lk=tag(Cy(0.055,0.07,0.46,10,HC,sd*HR*0.96,hy-0.38,0.03,inner),3); lk.scale.set(0.85,1,1.1); tag(Sp(0.06,new THREE.Color(HC).multiplyScalar(0.85).getHex(),sd*HR*0.96,hy-0.38,0.03,inner,8,6),3); });   // long locks either side, to the waist
    tag(B(HR*1.3,0.05,0.06,HC,0,hy+HR*0.62,HR*0.72,inner),3).rotation.x=-0.3;                                                    // a soft fringe
    tag(Cy(HR*0.78,HR*0.82,0.05,16,0xe8c766,0,hy+HR*0.82,0,inner),3); for(let i=0;i<5;i++){ const a=(i-2)*0.42; tag(Co(0.024,0.07+(i===2?0.05:0),4,0xe8c766,Math.sin(a)*HR*0.8,hy+HR*0.87,Math.cos(a)*HR*0.8,inner),3); }
    tag(Sp(0.026,0xd83040,0,hy+HR*0.95,HR*0.82,inner,8,6),3); tag(Sp(0.012,0xfff8d0,0,hy+HR*1.35,HR*0.8,inner,5,4),3);            // the tiara, its ruby and its pearl
  }
  if(look==='joshua'){   // Sir Joshua (drawSirJoshua): broad AND tall — plate in steel, the swamp-green tabard and its gold cross, great pauldrons, an open steel cap with a green tuft, an easy smile
    const AR=0x9aa0b0, ARL=0xc8ccd8, ARD=0x6a707e, TAB=0x4a7a3a, TABL=0x68a052, ST=bmat(AR,'brick');
    [-1,1].forEach(sd=>{ const pt=sd>0?4:5; tag(Cy(0.09,0.08,0.4,10,ARD,sd*0.12,0.06,0,inner),pt); tag(Sp(0.085,ARL,sd*0.12,0.3,0.05,inner,8,6),pt).scale.set(1,0.8,0.7);   // greaves, knee-cops
      tag(B(0.16,0.08,0.24,0x3a3e48,sd*0.12,0,0.03,inner),pt); tag(Sp(0.08,ARD,sd*0.12,0.06,0.06,inner,8,6),pt).scale.set(1,0.6,1.4); });   // sabatons
    Cy(0.27,0.24,0.5,16,AR,0,0.42,0,inner); Cy(0.25,0.27,0.08,16,ARD,0,0.42,0,inner);                                                  // the breastplate over a fauld
    for(let i=0;i<3;i++) Cy(0.255+i*0.01,0.27+i*0.01,0.04,16,i%2?ARL:ARD,0,0.3-i*0.06,0,inner);                                      // the lames of the skirt
    const tb=B(0.24,0.62,0.03,TAB,0,0.3,0.262,inner); B(0.24,0.05,0.032,TABL,0,0.88,0.263,inner); B(0.24,0.5,0.03,TAB,0,0.36,-0.262,inner);   // the tabard, front and back
    B(0.06,0.26,0.02,0xe8c766,0,0.56,0.28,inner); B(0.17,0.06,0.02,0xe8c766,0,0.71,0.28,inner);                                     // the gold cross
    Cy(0.235,0.235,0.04,16,0x5b3a1f,0,0.5,0,inner); B(0.06,0.06,0.03,0xe8c766,0,0.5,0.27,inner);                                     // sword-belt and buckle
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; const pa=tag(Sp(0.16,ARL,sd*0.3,0.94,0,inner,14,10),pt); pa.scale.set(1.1,0.72,1); tag(Sp(0.13,0xe8ecf4,sd*0.3,0.99,0,inner,10,6),pt).scale.set(1,0.4,0.9);   // great pauldrons, bright at the top
      for(let i=0;i<2;i++) tag(Cy(0.12-i*0.01,0.13-i*0.01,0.05,12,i?ARD:AR,sd*0.32,0.8-i*0.06,0,inner),pt);
      tag(Cy(0.07,0.065,0.24,10,AR,sd*0.32,0.5,0,inner),pt); tag(Sp(0.07,ARL,sd*0.32,0.5,0,inner,8,6),pt); tag(Cy(0.065,0.07,0.22,10,ARD,sd*0.32,0.27,0,inner),pt); tag(B(0.1,0.1,0.11,0x3a3e48,sd*0.32,0.21,0.01,inner),pt); });   // arms and gauntlets
    head(); eyes(); tag(Sp(HR*0.85,0xb08858,0,hy-HR*0.42,HR*0.25,inner,12,8),3).scale.set(1.0,0.55,0.9);                            // the stubble along his jaw
    const sm=tag(new THREE.Mesh(new THREE.TorusGeometry(0.035,0.007,4,10,Math.PI),flat(0x8a5a40)),3); sm.position.set(0,hy-HR*0.42,HR*0.95); sm.rotation.z=Math.PI; inner.add(sm);   // the easy smile
    [-1,1].forEach(sd=>tag(B(0.055,0.016,0.02,0x5a3a20,sd*HR*0.36,hy+HR*0.38,HR*0.92,inner),3));                                    // brows
    const cap=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.1,16,10,0,Math.PI*2,0,Math.PI*0.5),flat(AR)),3); cap.position.set(0,hy+HR*0.15,0); cap.scale.set(1,0.9,1); inner.add(cap);   // the open steel cap
    tag(Cy(HR*1.12,HR*1.12,0.05,16,ARL,0,hy+HR*0.12,0,inner),3); [-1,1].forEach(sd=>tag(B(0.03,0.16,0.13,AR,sd*HR*1.04,hy-HR*0.28,-0.01,inner),3));   // its brow-band, cheek-guards
    { const ng=tag(new THREE.Mesh(new THREE.CylinderGeometry(HR*1.1,HR*1.25,HR*0.8,14,1,true,Math.PI*0.6,Math.PI*0.8),flat(ARD)),3); ng.material=new THREE.MeshPhongMaterial({color:ARD,side:THREE.DoubleSide}); ng.position.set(0,hy-HR*0.25,0); inner.add(ng); }                                                                     // the neck-guard behind
    tag(Co(0.05,0.14,5,TAB,0,hy+HR*1.12,0,inner),3);                                                                                // the green tuft on top
  }
  // shared pieces for the rest of the cast
  const robe=(c,cl,cd,hem,top)=>{ const r=new THREE.Mesh(new THREE.CylinderGeometry(top||0.19,0.34,0.86,20),new THREE.MeshPhongMaterial({color:c})); r.position.y=0.43; inner.add(r);
      Cy(0.345,0.345,0.04,20,hem,0,0,0,inner); for(let i=0;i<5;i++){ const a=(i/5-0.4)*Math.PI*1.4, f=Cy(0.022,0.05,0.82,6,i%2?cl:cd,Math.sin(a)*0.26,0.02,Math.cos(a)*0.26,inner); f.rotation.x=-Math.cos(a)*0.17; f.rotation.z=Math.sin(a)*0.17; }   // folds, lit down one side
      Cy(0.2,0.19,0.18,16,c,0,0.86,0,inner); };
  const sleeves=(c,cuff)=>[-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.085,c,sd*0.22,sh-0.03,0,inner,12,8),pt); tag(Cy(0.07,0.11,0.42,10,c,sd*0.24,sh-0.46,0,inner),pt); if(cuff) tag(Cy(0.112,0.112,0.03,10,cuff,sd*0.24,sh-0.46,0,inner),pt); tag(Sp(0.05,SK,sd*0.24,sh-0.5,0.02,inner,8,6),pt); });
  const plateArms=(A,AL,AD,glove)=>[-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Cy(0.065,0.06,0.24,10,A,sd*0.26,0.6,0,inner),pt); tag(Sp(0.062,AL,sd*0.26,0.6,0,inner,8,6),pt); tag(Cy(0.06,0.065,0.22,10,AD,sd*0.26,0.38,0,inner),pt); tag(B(0.09,0.09,0.1,glove,sd*0.26,0.31,0.01,inner),pt); });
  const beard=(c,cd,len)=>{ tag(Sp(HR*0.9,c,0,hy-HR*0.45,HR*0.2,inner,14,10),3).scale.set(1.05,0.9,0.9); const b=tag(new THREE.Mesh(new THREE.ConeGeometry(HR*0.75,len,12),flat(c)),3); b.rotation.x=Math.PI-0.18; b.position.set(0,hy-HR*0.7-len/2,HR*0.95+len*0.12); b.scale.set(1,1,0.5); inner.add(b);
      [-1,1].forEach(sd=>{ const m=tag(B(0.085,0.03,0.04,c,sd*0.045,hy-HR*0.36,HR*0.97,inner),3); m.rotation.z=sd*0.25; }); tag(B(0.035,len*0.6,0.01,cd,0,hy-HR*0.8-len*0.3,HR*1.12+len*0.1,inner),3).rotation.x=0.18; };
  const hood=(c,cd)=>{ linedShell(new THREE.SphereGeometry(HR*1.22,16,12,Math.PI/2+0.85,Math.PI*2-1.7,0,Math.PI*0.8),c,inner,0,hy+0.02,-0.02,1,1.1,1.05).forEach(m=>tag(m,3));
      tag(Cy(0.21,0.3,0.24,16,c,0,hy-HR-0.2,-0.01,inner),3); tag(Cy(0.302,0.302,0.03,16,cd,0,hy-HR-0.2,-0.01,inner),3); };
  if(look==='aldric'){   // Sir Aldric (drawAldric): white plate gilded at the shoulders, a closed white helm with a navy visor and gold band, a tall gold crest, the crimson cape, a gilded blade at his side
    const W=0xece8dc, WL=0xfffdf4, WD=0xc8c2b0, G=0xe8b93a, GL=0xfff0b0;
    [-1,1].forEach(sd=>{ const pt=sd>0?4:5; tag(Cy(0.085,0.075,0.4,10,0xd8dce4,sd*0.1,0.06,0,inner),pt); tag(Sp(0.075,0xf4f6fa,sd*0.1,0.3,0.05,inner,8,6),pt).scale.set(1,0.8,0.7); tag(B(0.14,0.08,0.22,0x2a2a34,sd*0.1,0,0.03,inner),pt); });
    Cy(0.24,0.22,0.46,16,W,0,0.44,0,inner); Cy(0.225,0.245,0.08,16,WD,0,0.42,0,inner); for(let i=0;i<2;i++) Cy(0.24+i*0.012,0.255+i*0.012,0.04,16,i?WD:WL,0,0.34-i*0.06,0,inner);
    B(0.2,0.24,0.03,WL,0,0.58,0.235,inner); B(0.08,0.06,0.035,G,0,0.86,0.23,inner); Cy(0.232,0.232,0.04,16,G,0,0.5,0,inner);                             // breastplate, gold gorget clasp, gold belt
    const cp=B(0.52,0.95,0.04,0xa02030,0,-0.02,-0.25,inner); cp.rotation.x=0.07; B(0.52,0.05,0.05,0x701622,0,-0.02,-0.27,inner); [-1,1].forEach(sd=>B(0.04,0.9,0.12,0x701622,sd*0.27,0.0,-0.2,inner));   // the crimson cape trailing behind
    const bl=B(0.04,0.55,0.02,0xf4f6fa,-0.28,0.14,0.08,inner); bl.rotation.z=0.12; B(0.14,0.03,0.04,0xb8902a,-0.26,0.7,0.08,inner); B(0.04,0.12,0.04,0xb8902a,-0.26,0.73,0.08,inner);   // the gilded blade at his side
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.14,G,sd*0.28,0.92,0,inner,14,10),pt).scale.set(1.1,0.72,1); tag(Sp(0.11,GL,sd*0.28,0.96,0,inner,10,6),pt).scale.set(1,0.4,0.9); });
    plateArms(W,WL,WD,0xd8dce4);
    tag(Cy(0.07,0.08,0.1,8,W,0,hy-HR-0.07,0,inner),3); tag(Cy(HR*1.02,HR*0.95,HR*1.35,16,W,0,hy-HR*0.75,0,inner),3); tag(Sp(HR*1.02,W,0,hy+HR*0.0,0,inner,16,10),3).scale.set(1,0.75,1);   // the closed helm
    tag(B(HR*1.7,HR*0.3,0.04,0x141c2e,0,hy+HR*0.0,HR*0.98,inner),3); tag(B(HR*1.8,0.035,0.03,G,0,hy+HR*0.25,HR*0.99,inner),3); tag(B(0.03,HR*0.7,0.03,G,0,hy-HR*0.45,HR*1.0,inner),3);   // navy visor, gold band, gold nasal line
    for(let i=0;i<5;i++) tag(B(0.05,0.12,0.06,i%2?0xfff0b0:0xb8902a,0,hy+HR*0.75+i*0.06,-0.05*i+0.04,inner),3).rotation.x=-0.25*i;                   // the tall gold crest
  }
  if(look==='matthew'){   // Squire Matthew (drawSquireMatthew): a lad in a blue-grey jerkin over a steel plate, a gold clasp, a gold band and a feather in his hair, his tool in hand
    legs(0x4a4a3a,0.36,false,0x2a1c10,0x1a1008);
    Cy(0.2,0.22,0.46,16,0x5a6a8a,0,0.42,0,inner); B(0.18,0.28,0.04,0x8a8f9e,0,0.5,0.205,inner); B(0.18,0.04,0.045,0x6a707e,0,0.78,0.205,inner); B(0.06,0.06,0.05,0xe8c766,0,0.8,0.22,inner);   // the jerkin, the plate on his chest, its gold clasp
    Cy(0.225,0.225,0.04,16,0x8a5c32,0,0.46,0,inner);
    arms(0x5a6a8a,0.24); { const t=tag(Cy(0.02,0.02,0.5,6,0x8a5c32,-0.26,0.2,0.08,inner),2); tag(B(0.06,0.1,0.14,0xc8ccd8,-0.26,0.62,0.13,inner),2); }   // the hand-axe
    head(); eyes(); [-1,1].forEach(sd=>tag(B(0.05,0.014,0.02,0x5a3a10,sd*HR*0.36,hy+HR*0.38,HR*0.92,inner),3));
    const sm=tag(new THREE.Mesh(new THREE.TorusGeometry(0.026,0.006,4,10,Math.PI),flat(0xb07a60)),3); sm.position.set(0,hy-HR*0.45,HR*0.93); sm.rotation.z=Math.PI; inner.add(sm);
    { const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.07,16,10,0,Math.PI*2,0,Math.PI*0.47),flat(0xb8862a)),3); hb.position.set(0,hy+0.01,-0.01); inner.add(hb); [-1,1].forEach(sd=>tag(B(0.05,0.14,0.14,0xb8862a,sd*HR*0.96,hy-HR*0.1,-0.03,inner),3)); }
    for(let i=0;i<5;i++) tag(B(0.05,0.05,0.03,0xb8862a,-0.1+i*0.05,hy+HR*0.62,HR*0.82,inner),3).rotation.x=0.4;                                      // his fringe
    tag(Cy(HR*1.08,HR*1.08,0.04,16,0xe8c766,0,hy+HR*0.38,0,inner),3); const fe=tag(B(0.03,0.16,0.05,0xe8c766,HR*0.6,hy+HR*1.0,-HR*0.3,inner),3); fe.rotation.z=-0.4;   // the gold band, a feather in it
  }
  if(look==='royalguard'){   // the Royal Guard (drawRoyalGuard): polished steel trimmed in gold, a crimson plume, the royal-blue tabard with the golden fish, and a tall halberd
    const A=0xc2cad6, AD=0x828a98, AL=0xe6ecf4, G=0xe8c766;
    [-1,1].forEach(sd=>{ const pt=sd>0?4:5; tag(Cy(0.085,0.075,0.42,10,A,sd*0.1,0.06,0,inner),pt); tag(Sp(0.075,AL,sd*0.1,0.3,0.05,inner,8,6),pt).scale.set(1,0.8,0.7); tag(B(0.14,0.08,0.22,0x2a2a34,sd*0.1,0,0.03,inner),pt); });
    Cy(0.24,0.22,0.46,16,A,0,0.44,0,inner); Cy(0.23,0.25,0.08,16,AD,0,0.42,0,inner);
    B(0.24,0.62,0.03,0x2f4a8f,0,0.28,0.245,inner); B(0.24,0.04,0.035,G,0,0.88,0.246,inner); B(0.24,0.04,0.035,0x4a68b8,0,0.28,0.246,inner); B(0.24,0.5,0.03,0x2f4a8f,0,0.34,-0.245,inner);   // the royal tabard
    { const f=Sp(0.045,G,0,0.64,0.262,inner,8,6); f.scale.set(1.6,0.8,0.4); Co(0.035,0.05,3,0xb8912e,-0.08,0.64,0.26,inner).rotation.z=Math.PI/2; }   // its golden fish
    Cy(0.232,0.232,0.04,16,0xb8912e,0,0.5,0,inner);
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.13,G,sd*0.28,0.92,0,inner,14,10),pt).scale.set(1.1,0.7,1); });
    plateArms(A,AL,AD,0x828a98);
    { const h=tag(Cy(0.024,0.024,2.25,6,0x6a4a2a,0.27,0.06,0.1,inner),1); tag(B(0.03,0.32,0.22,AL,0.27,1.92,0.16,inner),1); tag(Co(0.035,0.24,4,AL,0.27,2.3,0.1,inner),1); tag(B(0.03,0.12,0.08,AD,0.27,1.98,0.03,inner),1); }   // the halberd: shaft, axe head, spear tip, back spike
    tag(Cy(0.07,0.08,0.1,8,SK,0,hy-HR-0.07,0,inner),3); tag(Cy(HR*1.02,HR*0.95,HR*1.3,16,A,0,hy-HR*0.7,0,inner),3); tag(Sp(HR*1.02,A,0,hy+HR*0.05,0,inner,16,10),3).scale.set(1,0.8,1);   // the helm
    tag(B(HR*1.6,HR*0.18,0.04,0x22262e,0,hy+HR*0.0,HR*0.98,inner),3); tag(Cy(HR*1.04,HR*1.04,0.05,16,G,0,hy+HR*0.3,0,inner),3);                      // visor slit, gold brow band
    for(let i=0;i<5;i++) tag(B(0.06,0.1,0.07,i%2?0xd9564a:0xc0392b,0,hy+HR*0.9+i*0.045,-0.04*i,inner),3).rotation.x=-0.3*i;                          // the crimson plume
  }
  if(look==='sage'){   // Eldan the Sage (drawSage): the green hood and robe, narrow at the shoulder and pooling at the hem, a long white beard, hands folded, his staff with its lit head
    robe(0x4a6a52,0x5f8468,0x35503c,0x2e4534,0.17); sleeves(0x4a6a52,0x35503c);
    head(); eyes(0x3a2a1a); hood(0x4a6a52,0x35503c); beard(0xeceae0,0xc4c2b6,0.44);
    tag(Cy(0.024,0.03,1.7,6,0x7a5636,0.34,0.02,0.1,inner),1); const ck=tag(new THREE.Mesh(new THREE.TorusGeometry(0.07,0.022,5,10,Math.PI*1.3),flat(0x553a24)),1); ck.position.set(0.3,1.74,0.1); inner.add(ck);   // the staff and its gnarled crook
    const gm=new THREE.Mesh(new THREE.OctahedronGeometry(0.055),glow(0x8fd4a8)); gm.position.set(0.32,1.7,0.1); inner.add(gm); gm.userData.part=1;
  }
  if(look==='librarian'){   // Ezra the Scribe (drawLibrarian): a green robe with wide sleeves and gold stole bands, the clasped tome with its gilt spine, a great white beard, bushy brows, a shining crown
    robe(0x2f5a3a,0x3f7048,0x244630,0x1e3a28); sleeves(0x2f5a3a,0xc8a038);
    [-1,1].forEach(sd=>{ const st=B(0.07,0.82,0.03,0xc8a038,sd*0.08,0.12,0.27,inner); st.rotation.x=-0.13; for(let i=0;i<3;i++) B(0.074,0.03,0.032,0xe8c766,sd*0.08,0.25+i*0.22,0.3-i*0.03,inner); });   // the stole bands
    B(0.24,0.3,0.08,0x7a3a2a,0,0.5,0.3,inner); B(0.03,0.3,0.085,0xe8c766,-0.11,0.5,0.3,inner); B(0.22,0.28,0.01,0x9a4e38,0.01,0.51,0.345,inner); B(0.06,0.06,0.02,0xe8c766,0.06,0.62,0.35,inner);   // the clasped tome, gilt spine
    head(); eyes(); [-1,1].forEach(sd=>{ const b=tag(B(0.07,0.03,0.03,0x2a1c10,sd*HR*0.36,hy+HR*0.4,HR*0.92,inner),3); b.rotation.z=-sd*0.2; });   // bushy brows
    beard(0xf4f2ec,0xc8c2b4,0.46); [-1,1].forEach(sd=>tag(B(0.06,0.18,0.15,0xe8e4da,sd*HR*0.95,hy+HR*0.05,-0.02,inner),3));   // the GREAT beard, the side hair
    tag(Sp(HR*0.5,0xfff4e4,0.02,hy+HR*0.72,HR*0.25,inner,8,6),3).scale.set(1,0.4,0.8);                                                              // the shine on his crown
  }
  if(look==='elijah'){   // Elijah (drawElijah): the surfer — an orange shirt, a big white beard, cream shorts, a green shell necklace, and his board
    legs(0,0.26,true); [-1,1].forEach(sd=>tag(Cy(0.1,0.1,0.18,10,0xc8b890,sd*0.1,0.26,0,inner),sd>0?4:5));
    Cy(0.21,0.22,0.12,14,0xc8b890,0,0.4,0,inner); Cy(0.22,0.21,0.44,14,0xe07a4a,0,0.48,0,inner); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; const f=Sp(0.025,0xf0e8d0,Math.sin(a)*0.2,0.5+(i%2)*0.2,Math.cos(a)*0.21,inner,5,4); }   // shorts; the orange shirt with its pale print
    for(let i=0;i<7;i++){ const a=(i-3)*0.25; Sp(0.018,0x3a7a42,Math.sin(a)*0.16,0.86-Math.abs(i-3)*0.02,0.15+Math.cos(a)*0.03,inner,5,4); }   // the shell necklace
    arms(0xe07a4a,0.26); head(); eyes(); beard(0xf0e8d0,0xd8d0b8,0.26);
    { const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.05,16,10,0,Math.PI*2,0,Math.PI*0.42),flat(0x2a1c10)),3); hb.position.set(0,hy+0.01,-0.01); inner.add(hb);
      const bk=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.04,14,8,Math.PI,Math.PI,Math.PI*0.3,Math.PI*0.45),flat(0x2a1c10)),3); bk.position.set(0,hy,0); inner.add(bk); }
    const bd=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,1.5,16),flat(0xffffff)); bd.scale.set(1,1,0.18); bd.position.set(0.44,0.78,-0.02); inner.add(bd);   // the board, standing by him
    B(0.05,1.4,0.04,0x3a8a9a,0.44,0.08,0.02,inner); B(0.16,0.05,0.045,0xe8c766,0.44,1.1,0.02,inner);
  }
  if(look==='priest'){   // a priest (drawPriest): grey hair, a white alb, the purple stole with its gold cross, brown shoes; one hand lifts in blessing
    [-1,1].forEach(sd=>tag(Sp(0.065,0x5b3a1f,sd*0.09,0.03,0.07,inner,8,6),sd>0?4:5).scale.set(1,0.6,1.3));
    robe(0xefe9da,0xf8f4ea,0xd8d2c0,0xd8d2c0); sleeves(0xefe9da,0xd8d2c0);
    [-1,1].forEach(sd=>{ const st=B(0.08,0.86,0.03,(opts&&opts.stole)||0x6a3a8a,sd*0.09,0.08,0.27,inner); st.rotation.x=-0.12; }); B(0.06,0.14,0.035,0xf2c14e,-0.09,0.5,0.31,inner); B(0.13,0.04,0.035,0xf2c14e,-0.09,0.54,0.31,inner);   // the stole and its gold cross
    head(); eyes(0x2a221c); const sm=tag(new THREE.Mesh(new THREE.TorusGeometry(0.026,0.006,4,10,Math.PI),flat(0xc88a6a)),3); sm.position.set(0,hy-HR*0.45,HR*0.93); sm.rotation.z=Math.PI; inner.add(sm);
    { const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.05,16,10,0,Math.PI*2,0,Math.PI*0.4),flat(0x8a8a92)),3); hb.position.set(0,hy+0.01,-0.01); inner.add(hb); [-1,1].forEach(sd=>tag(B(0.05,0.13,0.15,0x8a8a92,sd*HR*0.96,hy-HR*0.05,-0.03,inner),3));
      const bk=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.04,14,8,Math.PI,Math.PI,Math.PI*0.3,Math.PI*0.4),flat(0x8a8a92)),3); bk.position.set(0,hy,0); inner.add(bk); }
  }
  if(look==='dylan'){   // Dylan (drawDylan, portraitDylan): broad and tall, shaggy brown hair, a stubbled square jaw, sly half-lidded eyes and a lopsided grin, the patched olive coat
    const T=0x77714a, TL=0x958d5e, TU=0x565132;
    legs(0x8a6e50,0.36,false,0x4a3a2a,0x2a2018);
    const coat=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.28,0.62,18),new THREE.MeshPhongMaterial({color:T})); coat.position.y=0.62; inner.add(coat);   // the long olive coat, broad in the shoulder
    Cy(0.282,0.282,0.04,18,TU,0,0.31,0,inner); B(0.06,0.6,0.02,TU,0.05,0.34,0.27,inner);                                   // its hem and the front edge
    B(0.12,0.11,0.02,0xa45e3a,0.13,0.44,0.255,inner); B(0.12,0.015,0.022,0xc07a50,0.13,0.55,0.256,inner); B(0.1,0.09,0.02,0xa45e3a,-0.18,0.72,0.22,inner);   // the patches
    Cy(0.262,0.262,0.045,18,0x8a6a3a,0,0.5,0,inner); B(0.07,0.06,0.03,0xcaa06a,0,0.5,0.265,inner);                         // belt and buckle
    B(0.2,0.1,0.06,TU,0,0.88,0.17,inner);                                                                                   // the collar gap
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.1,sd>0?TL:TU,sd*0.27,sh-0.02,0,inner,12,8),pt); tag(Cy(0.08,0.07,0.44,10,sd>0?TL:T,sd*0.29,sh-0.46,0,inner),pt); tag(Sp(0.058,SK,sd*0.29,sh-0.5,0.02,inner,8,6),pt); });
    tag(Cy(0.085,0.095,0.12,10,0xc4906a,0,hy-HR-0.08,0,inner),3);                                                            // a thick neck
    tag(Sp(HR*1.05,SK,0,hy,0,inner,16,12),3).scale.set(1.08,1.02,0.95); [-1,1].forEach(sd=>tag(Sp(HR*0.22,0xc4906a,sd*HR*1.08,hy,0,inner,8,6),3).scale.set(0.5,1,0.8));
    tag(Sp(HR*0.98,0xb89070,0,hy-HR*0.55,HR*0.1,inner,14,10),3).scale.set(1.1,0.52,0.96);                                  // the stubbled jaw
    tag(Co(HR*0.15,HR*0.34,6,0xd49c74,0,hy-HR*0.12,HR*1.0,inner),3).rotation.x=Math.PI/2+0.25;
    [-1,1].forEach(sd=>{ tag(Sp(HR*0.18,0xfbf6ea,sd*HR*0.38,hy+HR*0.1,HR*0.85,inner,8,6),3).scale.set(1.15,0.7,0.55); tag(Sp(HR*0.11,0x3a2a1a,sd*HR*0.38+HR*0.04,hy+HR*0.09,HR*0.93,inner,8,6),3).scale.set(1,0.8,0.7);   // narrow, sly eyes
      tag(B(0.075,0.02,0.03,0xc4906a,sd*HR*0.38,hy+HR*0.2,HR*0.92,inner),3);                                                   // heavy lids
      const br=tag(B(0.085,0.024,0.03,0x452a14,sd*HR*0.38,hy+HR*0.36,HR*0.9,inner),3); br.rotation.z=sd>0?-0.12:0.05; });
    { const m=tag(B(0.1,0.018,0.02,0x5a2e22,-0.01,hy-HR*0.48,HR*0.95,inner),3); m.rotation.z=0.18; tag(B(0.07,0.01,0.012,0xfbf6ea,-0.01,hy-HR*0.45,HR*0.96,inner),3).rotation.z=0.18; }   // the lopsided grin
    { const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.14,16,10,0,Math.PI*2,0,Math.PI*0.52),flat(0x6b4424)),3); hb.position.set(0,hy+0.04,-0.02); hb.scale.set(1.05,0.95,1); inner.add(hb);   // shaggy hair
      for(let i=0;i<9;i++){ const a=(i/8-0.5)*Math.PI*1.3, t=tag(B(0.07,0.08+(i%3)*0.025,0.05,i%3?0x6b4424:0x8f6238,Math.sin(a)*HR*0.95,hy+HR*0.62-(i%3)*0.02,Math.cos(a)*HR*0.86,inner),3); t.rotation.y=a; t.rotation.x=0.35; }   // shaggy locks over the brow   // locks falling over the brow
      const bk=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.12,14,8,Math.PI,Math.PI,Math.PI*0.3,Math.PI*0.42),flat(0x452a14)),3); bk.position.set(0,hy,0); inner.add(bk);
      tag(Sp(0.06,0xa8784a,-0.08,hy+HR*1.04,0.05,inner,8,6),3).scale.set(1.6,0.4,1); }
  }
  if(look==='ethan'){   // Ethan (drawEthan, portraitEthan): the wild man — spiky black hair exploding out, wide wild eyes with tiny pupils, a screaming mouth, the torn red tunic, bare arms and feet, his stick
    const RT=0x9a3a2c, RL=0xb8563e, RD=0x6e241c, HH=0x1c1a22;
    [-1,1].forEach(sd=>{ const pt=sd>0?4:5; tag(Cy(0.07,0.065,0.3,10,0x6a5a44,sd*0.095,0.14,0,inner),pt); tag(Cy(0.055,0.06,0.12,8,SK,sd*0.095,0.03,0,inner),pt); tag(Sp(0.062,SK,sd*0.095,0.03,0.04,inner,8,6),pt).scale.set(1,0.55,1.5); });   // ragged trousers, bare feet
    const tu=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.24,0.5,16),new THREE.MeshPhongMaterial({color:RT})); tu.position.y=0.64; inner.add(tu);   // the torn red tunic
    for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, f=Co(0.05,0.12,3,i%2?RD:RL,Math.sin(a)*0.22,0.33,Math.cos(a)*0.22,inner); f.rotation.x=Math.PI; }   // its ragged hem
    B(0.035,0.12,0.02,0x2c1a1a,-0.08,0.62,0.235,inner); B(0.03,0.16,0.02,0x2c1a1a,0.1,0.72,0.215,inner);                    // rips
    Cy(0.215,0.215,0.035,16,0xc9a878,0,0.55,0,inner);                                                                         // a rope belt
    B(0.36,0.06,0.2,SK,0,0.88,0,inner);                                                                                      // bare scrawny shoulders
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.065,SK,sd*0.2,sh-0.04,0,inner,10,7),pt); tag(Cy(0.05,0.045,0.44,10,SK,sd*0.22,sh-0.48,0,inner),pt); tag(Sp(0.05,SK,sd*0.22,sh-0.5,0.02,inner,8,6),pt); });
    tag(Cy(0.024,0.03,1.2,6,0x8a5a2c,0.24,0.38,0.05,inner),1); tag(Sp(0.04,0x6a4220,0.24,1.5,0.05,inner,6,4),1);              // the stick, raised
    head();
    [-1,1].forEach(sd=>{ tag(Sp(HR*0.25,0xffffff,sd*HR*0.38,hy+HR*0.08,HR*0.8,inner,10,8),3).scale.set(1,1.2,0.55); tag(Sp(HR*0.07,0x1a1418,sd*HR*0.36,hy+HR*0.06,HR*0.95,inner,6,4),3);   // WIDE wild eyes, tiny pupils
      const br=tag(B(0.08,0.022,0.03,HH,sd*HR*0.38,hy+HR*0.48,HR*0.88,inner),3); br.rotation.z=sd*0.3; });                    // brows shot up
    tag(Sp(HR*0.32,0x5a1e1a,0,hy-HR*0.5,HR*0.82,inner,10,8),3).scale.set(1.2,0.85,0.5); tag(B(0.1,0.025,0.02,0xf4ece0,0,hy-HR*0.33,HR*1.0,inner),3);   // the screaming mouth, teeth
    { const cap=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.08,16,10,0,Math.PI*2,0,Math.PI*0.5),flat(HH)),3); cap.position.set(0,hy+0.02,-0.01); inner.add(cap);
      for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, up=i%2?0.55:0.9, sp=tag(Co(0.055,0.2,4,i%4?HH:0x3a3644,Math.sin(a)*HR*0.75,hy+HR*0.55,Math.cos(a)*HR*0.75,inner),3); sp.rotation.order='YXZ'; sp.rotation.y=a; sp.rotation.x=up; }   // the spikes, bursting outward
      for(let i=0;i<5;i++){ const sp=tag(Co(0.05,0.18,4,HH,(i-2)*0.06,hy+HR*1.15,(i%2)*0.04,inner),3); sp.rotation.z=(i-2)*0.25; } }
  }
  if(look==='cody'){   // Ranger Cody (drawCodyMounted, portraitCody): the forest-green hood pulled up with its gold edge, a calm face with steady green eyes and a trimmed beard, steel pauldrons and breastplate over a leather jerkin, the gold leaf clasp, the green cape
    const G=0x3f5a3a, GL=0x5a7a50, GD=0x2a3e28, ST=0xb8c0cc, STL=0xe6ebf2, LE=0x7a5634;
    legs(0x4e3620,0.36,false,0x2e2014,0x1a1008); [-1,1].forEach(sd=>tag(Cy(0.08,0.075,0.18,10,LE,sd*0.095,0.04,0,inner),sd>0?4:5));   // leather legs and boots
    Cy(0.22,0.24,0.5,16,LE,0,0.42,0,inner); Cy(0.248,0.24,0.3,16,ST,0,0.6,0,inner); Cy(0.25,0.25,0.03,16,STL,0,0.88,0,inner); B(0.02,0.28,0.02,0x7e8694,0,0.61,0.248,inner);   // the jerkin, the breastplate over it
    Cy(0.245,0.245,0.04,16,0x4e3620,0,0.46,0,inner); B(0.06,0.05,0.03,0xd4a93e,0,0.46,0.25,inner);
    const cp=B(0.5,0.92,0.04,GD,0,0.02,-0.24,inner); cp.rotation.x=0.07; [-1,1].forEach(sd=>B(0.04,0.86,0.12,G,sd*0.26,0.04,-0.19,inner));   // the green cape
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; tag(Sp(0.12,ST,sd*0.27,0.92,0,inner,12,8),pt).scale.set(1.1,0.7,1); tag(Sp(0.09,STL,sd*0.27,0.96,0,inner,8,6),pt).scale.set(1,0.4,0.9);
      tag(Cy(0.065,0.06,0.42,10,LE,sd*0.27,sh-0.46,0,inner),pt); tag(Cy(0.068,0.068,0.12,10,0x4e3620,sd*0.27,sh-0.46,0,inner),pt); tag(Sp(0.05,SK,sd*0.27,sh-0.5,0.02,inner,8,6),pt); });
    tag(Sp(0.05,0xd4a93e,0,0.92,0.2,inner,8,6),3).scale.set(1.4,1,0.5); tag(Sp(0.025,0xf2d27a,0,0.93,0.225,inner,6,4),3);   // the gold leaf clasp at his throat
    head(); [-1,1].forEach(sd=>{ tag(Sp(HR*0.18,0xf4eee4,sd*HR*0.36,hy+HR*0.1,HR*0.84,inner,8,6),3).scale.set(1.1,1,0.55); tag(Sp(HR*0.12,0x2a4a3a,sd*HR*0.36,hy+HR*0.1,HR*0.93,inner,8,6),3).scale.set(1,1.1,0.7);   // steady green eyes
      tag(B(0.07,0.02,0.03,0x3a2616,sd*HR*0.36,hy+HR*0.34,HR*0.9,inner),3); });                                              // level brows
    tag(Sp(HR*0.92,0x5a3c22,0,hy-HR*0.52,HR*0.22,inner,14,10),3).scale.set(1.05,0.8,0.9); tag(B(0.16,0.02,0.02,0x7a5634,0,hy-HR*0.28,HR*0.96,inner),3); [-1,1].forEach(sd=>tag(B(0.05,0.14,0.11,0x5a3c22,sd*HR*0.93,hy-HR*0.15,0.02,inner),3));   // the trimmed beard
    const sm=tag(new THREE.Mesh(new THREE.TorusGeometry(0.03,0.007,4,10,Math.PI),flat(0x8a4a38)),3); sm.position.set(0,hy-HR*0.4,HR*0.96); sm.rotation.z=Math.PI; inner.add(sm);   // a small, pleasant smile
    tag(Sp(HR*1.0,0x2a1c14,0,hy+HR*0.15,-0.02,inner,12,8),3).scale.set(1,0.75,1);                                            // hair, in the hood's shadow
    linedShell(new THREE.SphereGeometry(HR*1.3,18,12,Math.PI/2+0.75,Math.PI*2-1.5,0,Math.PI*0.82),G,inner,0,hy+0.02,-0.03,1,1.12,1.06).forEach(m=>tag(m,3));   // the hood, pulled up
    tag(Cy(0.2,0.27,0.12,16,G,0,hy-HR-0.13,-0.04,inner),3); tag(Cy(0.272,0.272,0.025,16,0xd4a93e,0,hy-HR-0.13,-0.04,inner),3);   // its cowl and gold edge
    { const pk=tag(Co(0.08,0.2,6,GL,0,hy+HR*1.15,-HR*0.4,inner),3); pk.rotation.x=-0.9; }                                       // the hood's point, hanging back
  }
  g.userData.pivots={1:[0.24*S0,(sh-0.03)*S0,0],2:[-0.24*S0,(sh-0.03)*S0,0],3:[0,(hy-HR-0.04)*S0,0],4:[0.095*S0,0.45*S0,0],5:[-0.095*S0,0.45*S0,0]};
  return mergePerson(shade(g),opts); }
// a hood or any open shell, lined inside: the outer cloth, and a darker lining facing in, so the opening never shows through
function linedShell(geo,col,par,x,y,z,sx,sy,sz){ const out=new THREE.Mesh(geo,flat(col)); const ig=geo.clone(); ig.scale(0.97,0.97,0.97);
  const idx=ig.index; if(idx){ const a=idx.array; for(let i=0;i<a.length;i+=3){ const t=a[i]; a[i]=a[i+2]; a[i+2]=t; } } const n=ig.attributes.normal; for(let i=0;i<n.array.length;i++) n.array[i]=-n.array[i];
  const inn=new THREE.Mesh(ig,flat(new THREE.Color(col).multiplyScalar(0.55).getHex())); [out,inn].forEach(m=>{ m.userData.noInk=true; m.position.set(x,y,z); m.scale.set(sx||1,sy||1,sz||1); par.add(m); }); return [out,inn]; }
// ── THE TOWNSFOLK ── every outfit from KLK's OUTFITS, built the way drawVillager draws it: a shirt in the outfit's top colour,
// lit on one side and shaded on the other, a pale band across the shoulders, the apron (when it has one) down the front,
// trousers in the bottom colour over dark shoes, the head with its two dark eyes and mouth line, and the hat by HAT_STYLE —
// a steel helm with its red tuft, a peaked cap, a hood, or the wide brim. The women of each trade wear their hair long,
// and the children are small with big heads. (The 3D looks still add their props: a spear, a mug, a beard, a round belly.)
const FOLK_SPECIAL=new Set(['Herald of the Melee','Marshal of the Lists']);   // dressed for the tourney: still the older costumes
const VHAT={ soldier:'helm', guard:'helm', sailor:'cap', hunter:'hood', monk:'hood', guest:'cap', merchant:'cap', caravanM:'hood', shadeTr:'hood', qmaster:'helm' };
function villagerPerson(outfit,O,L,opts){ const g=new THREE.Group(), inner=group(0,0,0,g), tag=(m,p)=>{ m.userData.part=p; return m; }, C=h=>new THREE.Color(h), LT=(h,f)=>new THREE.Color(h).lerp(new THREE.Color(0xffffff),f).getHex();
  const kid=outfit==='child', fem=/F$/.test(outfit)||outfit==='patronB', S0=kid?0.7:(hsh(outfit.length*7,outfit.charCodeAt(0))*0.06+0.97); inner.scale.setScalar(S0);
  const SK=O.skin, SKD=C(SK).multiplyScalar(0.84).getHex(), top=O.top, topL=LT(top,0.2), topD=C(top).multiplyScalar(0.72).getHex(), bot=O.bottom, hair=O.hair;
  const hy=kid?1.06:1.2, HR=kid?0.24:0.2, sh=kid?0.74:0.94;
  // legs, trousers to the ankle, dark shoes
  [-1,1].forEach(sd=>{ const pt=sd>0?4:5; tag(Cy(0.075,0.068,0.38,10,bot,sd*0.095,0.06,0,inner),pt); tag(Sp(0.068,0x2a2018,sd*0.095,0.05,0.035,inner,10,6),pt).scale.set(1,0.62,1.45); tag(B(0.13,0.03,0.2,0x1a1410,sd*0.095,0,0.035,inner),pt); });
  // the shirt: lit on one side, shaded on the other, a pale band across the shoulders
  const shirt=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.235,0.5,18),new THREE.MeshPhongMaterial({color:top})); shirt.position.y=0.66; inner.add(shirt);
  Cy(0.237,0.237,0.04,18,topD,0,0.41,0,inner); Cy(0.205,0.2,0.05,18,LT(top,0.3),0,0.88,0,inner);
  if(fem) { const sk=new THREE.Mesh(new THREE.CylinderGeometry(0.23,0.3,0.22,18),new THREE.MeshPhongMaterial({color:bot})); sk.position.y=0.31; inner.add(sk); Cy(0.302,0.302,0.03,18,C(bot).multiplyScalar(0.7).getHex(),0,0.2,0,inner); }   // the women's skirts, to the knee
  if(O.apron){ B(0.22,0.46,0.03,O.apron,0,0.28+(fem?0.02:0),0.235,inner); B(0.04,0.46,0.032,C(O.apron).multiplyScalar(0.82).getHex(),-0.09,0.28,0.236,inner); B(0.2,0.02,0.02,C(O.apron).multiplyScalar(0.75).getHex(),0,0.74,0.22,inner); }   // the apron down the front, its strings
  if(L.belt) Cy(0.237,0.237,0.04,18,L.belt,0,0.46,0,inner);
  if(L.round) Sp(0.2,top,0,0.6,0.08,inner,12,9).scale.set(1,1,0.8);
  // arms: sleeves in the shirt's colour (the far side darker), hands of skin
  [-1,1].forEach(sd=>{ const pt=sd>0?1:2, sc=sd>0?topL:topD; tag(Sp(0.08,top,sd*0.22,sh-0.03,0,inner,12,8),pt); tag(Cy(0.068,0.06,0.42,10,sc,sd*0.24,sh-0.44,0,inner),pt); tag(Cy(0.062,0.062,0.03,10,topD,sd*0.24,sh-0.44,0,inner),pt); tag(Sp(0.05,SK,sd*0.24,sh-0.49,0.02,inner,8,6),pt).scale.set(0.9,1.1,1); });
  // the head: round, two dark eyes a row apart, the mouth line below
  tag(Cy(0.065,0.075,0.1,8,SK,0,hy-HR-0.07,0,inner),3); tag(Sp(HR,SK,0,hy,0,inner,16,12),3).scale.set(1,1.02,0.95);
  [-1,1].forEach(sd=>tag(Sp(HR*0.22,SK,sd*HR*0.98,hy,0,inner,8,6),3).scale.set(0.5,1,0.8));
  tag(Co(HR*0.13,HR*0.3,6,SKD,0,hy-HR*0.15,HR*0.97,inner),3).rotation.x=Math.PI/2+0.25;
  [-1,1].forEach(sd=>{ tag(Sp(HR*0.19,0xf8f4ee,sd*HR*0.36,hy+HR*0.12,HR*0.83,inner,8,6),3).scale.set(1,1.15,0.55); tag(Sp(HR*0.13,0x2a1c10,sd*HR*0.36,hy+HR*0.11,HR*0.92,inner,8,6),3).scale.set(1,1.2,0.7); tag(Sp(HR*0.045,0xffffff,sd*HR*0.36+HR*0.05,hy+HR*0.19,HR*1.0,inner,4,3),3);
    tag(B(0.05,0.014,0.02,C(hair).multiplyScalar(0.8).getHex(),sd*HR*0.36,hy+HR*0.38,HR*0.92,inner),3); });
  tag(B(0.06,0.014,0.014,C(SK).multiplyScalar(0.72).getHex(),0,hy-HR*0.5,HR*0.92,inner),3);
  if(L.beard){ tag(Sp(HR*0.85,L.beard,0,hy-HR*0.48,HR*0.25,inner,12,9),3).scale.set(1.05,0.75,0.85); [-1,1].forEach(sd=>{ const m=tag(B(0.08,0.03,0.04,L.beard,sd*0.042,hy-HR*0.36,HR*0.97,inner),3); m.rotation.z=sd*0.25; }); }
  // hair: a cap of it, the back of the head, long locks for the women
  const hs=O.hat?(VHAT[outfit]||'brim'):null;
  if(hs!=='hood'){ const hb=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.05,16,10,0,Math.PI*2,0,Math.PI*0.44),flat(hair)),3); hb.position.set(0,hy+0.01,-0.01); inner.add(hb);
    const bk=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.04,14,8,Math.PI,Math.PI,Math.PI*0.3,Math.PI*(fem?0.6:0.42)),flat(hair)),3); bk.position.set(0,hy,0); inner.add(bk);
    if(!hs) for(let i=0;i<5;i++) tag(B(0.05,0.04,0.03,hair,-0.1+i*0.05,hy+HR*0.7-Math.abs(i-2)*0.01,HR*0.76,inner),3).rotation.x=0.5;
    if(fem) [-1,1].forEach(sd=>{ const lk=tag(Cy(0.05,0.065,0.34,8,hair,sd*HR*0.97,hy-0.28,0.0,inner),3); lk.scale.set(0.8,1,1.15); }); }
  // the hats, by HAT_STYLE
  if(hs==='helm'){ const hm=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.1,16,9,0,Math.PI*2,0,Math.PI*0.5),flat(O.hat)),3); hm.position.set(0,hy+HR*0.25,0); hm.scale.set(1,0.85,1); inner.add(hm);
    tag(Cy(HR*1.14,HR*1.14,0.05,16,C(O.hat).multiplyScalar(0.8).getHex(),0,hy+HR*0.22,0,inner),3); tag(Co(0.04,0.1,5,0xc0392e,0,hy+HR*1.15,0,inner),3); }
  else if(hs==='cap'){ const cp=tag(new THREE.Mesh(new THREE.SphereGeometry(HR*1.07,16,8,0,Math.PI*2,0,Math.PI*0.5),flat(O.hat)),3); cp.position.set(0,hy+HR*0.25,0); cp.scale.set(1.02,0.62,1.02); inner.add(cp);
    tag(Cy(HR*1.08,HR*1.08,0.04,16,C(O.hat).multiplyScalar(0.75).getHex(),0,hy+HR*0.24,0,inner),3); const pk=tag(new THREE.Mesh(new THREE.CylinderGeometry(HR*0.7,HR*0.7,0.025,14,1,false,-Math.PI/2,Math.PI),flat(C(O.hat).multiplyScalar(0.75).getHex())),3); pk.position.set(0,hy+HR*0.28,HR*0.62); inner.add(pk); }
  else if(hs==='hood'){ linedShell(new THREE.SphereGeometry(HR*1.22,16,12,Math.PI/2+0.85,Math.PI*2-1.7,0,Math.PI*0.8),O.hat,inner,0,hy+0.02,-0.02,1,1.1,1.05).forEach(m=>tag(m,3));
    tag(Cy(0.21,0.28,0.2,16,O.hat,0,hy-HR-0.16,-0.01,inner),3); }
  else if(hs==='brim'){ const br=tag(new THREE.Mesh(new THREE.CylinderGeometry(HR*1.8,HR*1.9,0.05,22),flat(O.hat)),3); br.position.set(0,hy+HR*0.5,0); inner.add(br); tag(Cy(HR*1.78,HR*1.78,0.012,22,LT(O.hat,0.25),0,hy+HR*0.5+0.025,0,inner),3);   // the wide brim
    tag(Cy(HR*0.86,HR*1.04,HR*0.85,16,O.hat,0,hy+HR*0.52,0,inner),3); tag(Cy(HR*0.87,HR*0.87,0.02,16,LT(O.hat,0.2),0,hy+HR*1.37,0,inner),3); tag(Cy(HR*1.05,HR*1.05,0.05,16,C(O.hat).multiplyScalar(0.7).getHex(),0,hy+HR*0.55,0,inner),3); }   // the crown, its band
  // their props
  if(L.spear){ tag(Cy(0.024,0.024,1.9,5,0x6b4a2e,0.27,0.1,0.1,inner),1); tag(Co(0.045,0.2,4,0xd8dce4,0.27,2.0,0.1,inner),1); }
  if(L.mug){ tag(Cy(0.055,0.055,0.12,8,0x8a6a42,0.27,sh-0.6,0.12,inner),1); tag(Cy(0.052,0.052,0.02,8,0xf4ead0,0.27,sh-0.48,0.12,inner),1); }
  g.userData.pivots={1:[0.22*S0,(sh-0.03)*S0,0],2:[-0.22*S0,(sh-0.03)*S0,0],3:[0,(hy-HR-0.04)*S0,0],4:[0.095*S0,0.45*S0,0],5:[-0.095*S0,0.45*S0,0]};
  return mergePerson(shade(g),opts); }
function person(look,opts){ opts=opts||{};
  // the sculpted cast, by who they are and what they wear: the knights in their liveries, the generals in Aldric's white
  //  plate in their own town's colour, the tourney's herald and marshal, the bard, Tirzah, Reuben; a priest's stole
  if(typeof CAST_LOOKS!=='undefined'&&!person.classic&&!person.noCast){ const W=opts.who||'', hx=v=>v==null?null:typeof v==='number'?v:hexn(v), her=opts.her;
    let to=null, rc=null;
    if(look==='knight'){ to=W==='Captain'?'captain':/Dame/.test(W)?'dame':'knight'; if(her) rc={livery:hx(her.main),trim:hx(her.trim)}; }
    else if(look==='general'){ to='aldric'; if(opts.tint){ const t=hx(opts.tint); rc={crimson:t,goldL:null}; } }
    else if(W==='Herald of the Melee') to='herald'; else if(W==='Marshal of the Lists') to='marshal';
    else if(look==='bard'||look==='reuben') to=look; else if(W==='Tirzah, Keeper of the Records') to='tirzah';
    else if(look==='priest'&&opts.stole!=null&&CAST_LOOKS.has('priest')) return castPerson('priest',Object.assign({},opts,{recolor:{stole:hx(opts.stole)}}));
    if(to&&CAST_LOOKS.has(to)){ const o=Object.assign({},opts,{recolor:rc}); delete o.her; delete o.tint; return castPerson(to,o); } }
  if(typeof CAST_LOOKS!=='undefined'&&CAST_LOOKS.has(look)&&!opts.her&&!opts.tint&&!person.classic&&!person.noCast) return castPerson(look,opts);   // the cast on the knight's sculpture (cast.js)
  if(typeof HERO_LOOKS!=='undefined'&&HERO_LOOKS.has(look)&&!opts.her&&!opts.tint&&!person.classic) return heroPerson(look,opts);   // the main cast in the new knight's style (heroes.js)
  { const ok0=look==='vill'?opts.outfit:look, ok1=ok0&&!OUTFITS_2D[ok0]&&LOOK_OUTFIT[ok0]&&!opts.her&&!opts.tint?LOOK_OUTFIT[ok0]:ok0;   // the townsfolk from the sculpted folk kit (cast.js)
    if(typeof KIT_DATA!=='undefined'&&typeof folkPerson!=='undefined'&&ok1&&OUTFITS_2D[ok1]&&!opts.her&&!opts.tint&&!person.classic&&!NAMED_BUILT.has(ok1)&&!FOLK_SPECIAL.has(opts.who||'')){ const f=folkPerson(ok1,OUTFITS_2D[ok1],LOOKS[ok0]||LOOKS[ok1]||{},opts); if(f) return f; } }
  { const ok0=look==='vill'?opts.outfit:look, ok=ok0&&!OUTFITS_2D[ok0]&&LOOK_OUTFIT[ok0]&&!opts.her&&!opts.tint?LOOK_OUTFIT[ok0]:ok0; if(ok!==ok0&&typeof heroPerson!=='undefined'&&!person.classic) return heroPerson('v:'+ok,Object.assign({},opts,{O:OUTFITS_2D[ok],L:LOOKS[ok0]||{}}));
    if(ok&&OUTFITS_2D[ok]&&!opts.her&&!opts.tint&&!NAMED_BUILT.has(ok)) return typeof heroPerson!=='undefined'&&!person.classic?heroPerson('v:'+ok,Object.assign({},opts,{O:OUTFITS_2D[ok],L:LOOKS[ok]||{}})):villagerPerson(ok,OUTFITS_2D[ok],LOOKS[ok]||{},opts); } if((look==='robby'||look==='cheyenne'||look==='benji'||look==='king'||look==='madison'||look==='joshua'||FAMILY_MORE.has(look))&&!opts.her&&!opts.tint) return familyPerson(look,opts); let o=Object.assign({},LOOKS[look]||LOOKS.peasant);
  if(look==='vill'&&opts.outfit&&LOOKS[opts.outfit]) o=Object.assign({},LOOKS[opts.outfit]);
  { const ok=LOOK_OUTFIT[look==='vill'?opts.outfit:look]||(look==='vill'?opts.outfit:look), O=OUTFITS_2D[ok];   // the 2D game's colours for this outfit
    if(O&&!opts.her&&!opts.tint){ o.body=O.top; o.legs=o.robe||o.dress?O.top:O.bottom; o.skin=O.skin; if(!o.hood&&!o.bald) o.hair=O.hair; if(O.apron&&o.apron!==undefined) o.apron=O.apron; else if(O.apron&&!o.robe) o.apron=O.apron;
      if(O.hat){ if(o.hood) o.hood=O.hat; else if(o.hat) o.hat=O.hat; else if(o.helm) o.helm=O.hat; else o.brim=O.hat; } } }
  if(opts.her){ o.body=hexn(opts.her.main); o.trim=hexn(opts.her.trim); }
  if(opts.tint) o.body=o.legs=hexn(opts.tint);
  if(opts.stole) o.stole=opts.stole;
  if(typeof heroPerson!=='undefined'&&!person.classic) return heroPerson('g:'+look,Object.assign({},opts,{G:o}));   // every other look, heraldry and tints too, in the new style
  const g=new THREE.Group(), s=o.small||1, inner=group(0,0,0,g); inner.scale.setScalar(s*(o.tall||1)); const SK=o.skin||SKIN;
  const robe=o.robe||o.dress;
  if(robe){ Cy(0.2,0.34,0.8,14,o.body,0,0,0,inner); Cy(0.22,0.2,0.3,12,o.body,0,0.78,0,inner); Cy(0.345,0.35,0.05,14,new THREE.Color(o.body).multiplyScalar(0.72).getHex(),0,0,0,inner); }   // the robe, its hem a shade darker
  else { Cy(0.075,0.065,0.45,8,o.legs,-0.09,0,0,inner); Cy(0.075,0.065,0.45,8,o.legs,0.09,0,0,inner);
    [-0.09,0.09].forEach(x=>{ const sh=B(0.13,0.08,0.21,0x3a2a1c,x,0,0.03,inner); B(0.135,0.025,0.215,0x22180e,x,0,0.03,inner); });   // shoes, soled
    Cy(0.2,0.26,0.62,12,o.body,0,0.42,0,inner); Cy(0.205,0.21,0.04,12,new THREE.Color(o.body).multiplyScalar(0.72).getHex(),0,0.42,0,inner);   // the hem
    if(o.plate){ Cy(0.21,0.27,0.3,7,o.helm,0,0.72,0,inner); } }
  const shoulder=robe?1.0:0.98;   // robed or not, everyone stands the same height (only the build and the 'tall' of each look differ)
  [-1,1].forEach(sd=>{ const part=sd>0?1:2, sp=Sp(0.085,o.body,sd*0.25,shoulder-0.04,0,inner,10,7);   // a rounded shoulder, a sleeve, a cuff, a hand
    const a=Cy(0.062,0.055,0.44,8,o.body,sd*0.28,shoulder-0.46,0,inner); a.rotation.z=sd*0.06;
    const cf=Cy(0.06,0.06,0.04,8,o.trim||new THREE.Color(o.body).multiplyScalar(0.75).getHex(),sd*0.283,shoulder-0.48,0,inner);
    const hd=Sp(0.055,o.plate?o.helm:SK,sd*0.285,shoulder-0.54,0.01,inner,8,6); hd.scale.set(0.9,1.1,1); [sp,a,cf,hd].forEach(m=>m.userData.part=part); });
  if(o.belt) B(0.46,0.06,0.42,o.belt,0,robe?0.6:0.62,0,inner);
  if(o.trim&&!robe){ B(0.42,0.06,0.3,o.trim,0,0.62,0,inner); B(0.06,0.4,0.02,o.trim,0,0.62,0.22,inner); }
  if(o.apron) B(0.34,0.5,0.03,o.apron,0,0.3,0.24,inner);
  if(o.stole){ [-0.09,0.09].forEach(x=>{ B(0.08,0.8,0.03,o.stole,x,0.25,0.27,inner).rotation.x=-0.12; B(0.08,0.06,0.031,0xe8c25a,x,0.3,0.31,inner); }); }
  if(o.cape){ const c=B(0.5,1.0,0.04,o.cape,0,0.25,-0.24,inner); c.rotation.x=0.08; B(0.52,0.06,0.05,o.trim||0xe8c766,0,1.2,-0.22,inner); }
  const hy=robe?1.2:1.17;
  if(!o.plate||o.matthew){ Cy(0.07,0.08,0.1,8,SK,0,hy-0.22,0,inner); Sp(0.17,SK,0,hy,0,inner,14,10);   // neck and head
    { const SKD=new THREE.Color(SK).multiplyScalar(0.82).getHex(), br=o.hair||o.beard||o.hood||0x4a3020;
      [-1,1].forEach(sd=>{ const ew=Sp(0.034,0xf8f4ee,sd*0.064,hy+0.014,0.142,inner,8,6); ew.scale.set(1,1.15,0.6); Sp(0.024,0x1a1410,sd*0.064,hy+0.012,0.156,inner,8,6).scale.set(1,1.2,0.8); Sp(0.008,0xffffff,sd*0.064+0.008,hy+0.026,0.172,inner,4,3);   // eyes with whites, a dark iris and a catchlight   // eyes, with a catchlight
        B(0.055,0.011,0.015,new THREE.Color(br).multiplyScalar(0.85).getHex(),sd*0.062,hy+0.058,0.152,inner).rotation.z=sd*0.08;                 // brows
        if(!o.hood){ const e=Sp(0.038,SK,sd*0.168,hy,0,inner,6,5); e.scale.set(0.5,1,0.8); } });                                                          // ears
      const n=Co(0.028,0.07,5,SKD,0,hy-0.035,0.17,inner); n.rotation.x=Math.PI/2+0.25;                                                         // nose
      B(0.045,0.01,0.01,new THREE.Color(SK).lerp(new THREE.Color(0xa04a40),0.6).getHex(),0,hy-0.085,0.16,inner);                                                                                      // mouth
      } }
  if(o.plate){ Cy(0.17,0.16,0.32,8,o.helm,0,hy-0.16,0,inner); B(0.24,0.04,0.04,0x1a2740,0,hy+0.02,0.15,inner); Sp(0.06,o.trim,0,hy+0.22,0,inner); }
  if(o.hair&&!o.hood&&!o.bald&&!o.plate){ [-1,1].forEach(sd=>{ const lk=B(0.06,o.longHair?0.42:0.17,0.12,o.hair,sd*0.165,hy-(o.longHair?0.32:0.12),-0.01,inner); });   // hair framing the face, as the sprites wear it
    if(o.longHair){ const lh=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.2,0.5,14,1,false,Math.PI*0.6,Math.PI*0.8),flat(o.hair)); lh.position.set(0,hy-0.3,-0.03); lh.rotation.y=Math.PI; inner.add(lh); } }
  if(o.hair&&!o.hood&&!o.bald){ const h=new THREE.Mesh(new THREE.SphereGeometry(0.183,14,8,0,Math.PI*2,0,Math.PI*0.55),flat(o.hair)); h.position.y=hy+0.02; h.rotation.x=-0.25; inner.add(h);
    const bk=new THREE.Mesh(new THREE.SphereGeometry(0.178,12,7,0,Math.PI*2,Math.PI*0.45,Math.PI*0.3),flat(o.hair)); bk.position.set(0,hy+0.01,-0.02); bk.rotation.x=0.5; inner.add(bk);   // the back of the head
    for(let i=0;i<5;i++){ const f=B(0.05,0.05,0.03,o.hair,-0.1+i*0.05,hy+0.09-Math.abs(i-2)*0.012,0.14,inner); f.rotation.x=0.4; }   // a fringe
    if(o.dress) Sp(0.09,o.hair,0,hy+0.06,-0.17,inner); }
  if(o.kerchief){ const k=new THREE.Mesh(new THREE.SphereGeometry(0.19,9,6,0,Math.PI*2,0,Math.PI*0.4),flat(o.kerchief)); k.position.y=hy+0.03; k.rotation.x=-0.35; inner.add(k); }
  if(o.helm&&!o.plate){ Cy(0.18,0.18,0.18,8,o.helm,0,hy+0.05,0,inner); Co(0.19,0.15,8,o.helm,0,hy+0.21,0,inner); }
  if(o.hood){ // a rounded hood drawn up over the head, open at the face, its cowl falling over the shoulders (drawVillager's hooded outfits)
    const hd=new THREE.Mesh(new THREE.SphereGeometry(0.225,14,10,Math.PI/2+0.85,Math.PI*2-1.7,0,Math.PI*0.78),flat(o.hood)); hd.position.set(0,hy+0.015,-0.015); hd.scale.set(1,1.08,1.04); inner.add(hd);
    Cy(0.2,0.3,0.24,14,o.hood,0,hy-0.36,-0.01,inner); }
  if(o.brim){ Cy(0.32,0.32,0.03,10,o.brim,0,hy+0.11,0,inner); Cy(0.13,0.16,0.14,8,o.brim,0,hy+0.12,0,inner); }
  if(o.hat){ Cy(0.15,0.18,0.12,8,o.hat,0,hy+0.1,0,inner); if(o.feather) B(0.03,0.22,0.03,0xe8dcc0,0.12,hy+0.18,-0.05,inner).rotation.z=-0.4; }
  if(o.circlet) Cy(0.18,0.18,0.04,12,0xd8dce4,0,hy+0.08,0,inner);
  if(o.crown){ Cy(0.17,0.17,0.08,8,0xe8c766,0,hy+0.1,0,inner); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; Co(0.035,0.1,4,0xe8c766,Math.sin(a)*0.16,hy+0.18,Math.cos(a)*0.16,inner); } }
  if(o.beard){ const b=new THREE.Mesh(new THREE.ConeGeometry(0.13,0.3,7),flat(o.beard)); b.rotation.x=Math.PI; b.position.set(0,hy-0.22,0.07); b.scale.set(0.85,1,0.7); inner.add(b); [-1,1].forEach(sd=>{ const m=B(0.075,0.03,0.04,o.beard,sd*0.04,hy-0.08,0.158,inner); m.rotation.z=sd*0.25; }); }   // a beard from the jaw, and a moustache
  if(o.round) Sp(0.2,o.body,0,0.62,0.06,inner);
  if(o.spear){ Cy(0.025,0.025,1.9,5,0x6b4a2e,0.36,0.2,0.08,inner); Co(0.05,0.2,4,0xd8dce4,0.36,2.1,0.08,inner); }
  if(o.halberd){ Cy(0.025,0.025,2.2,5,0x6b4a2e,0.36,0.1,0.08,inner); B(0.04,0.3,0.22,0xd8dce4,0.36,1.95,0.14,inner); Co(0.04,0.22,4,0xd8dce4,0.36,2.3,0.08,inner); }
  if(o.mug){ Cy(0.06,0.06,0.12,8,0x8a6a42,0.3,0.5,0.12,inner); }
  if(o.scroll){ const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.34,8),flat(0xf0e4c4)); sc.rotation.z=Math.PI/2; sc.position.set(0.12,0.72,0.2); inner.add(sc); }
  if(o.lute){ const lu=Sp(0.15,0xb07a3a,0.05,0.72,0.2,inner); lu.scale.set(1,1.2,0.5); B(0.04,0.4,0.03,0x6b4a2e,0.18,0.82,0.2,inner).rotation.z=-0.7; }
  // ── the hand-drawn details ──
  const chestY=robe?0.84:0.82, front=robe?0.24:0.235;
  if(o.bald&&o.hair){ [-1,1].forEach(sd=>B(0.05,0.1,0.14,o.hair,sd*0.165,hy-0.02,-0.03,inner)); B(0.26,0.08,0.06,o.hair,0,hy-0.02,-0.15,inner); }      // a fringe round a bald crown
  if(o.stubble) B(0.2,0.06,0.04,o.stubble,0,hy-0.11,0.14,inner);
  if(o.longBeard){ const b=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.62,10),flat(o.beard)); b.rotation.x=Math.PI; b.position.set(0,hy-0.42,0.1); inner.add(b); [-1,1].forEach(sd=>{ const m=B(0.08,0.03,0.04,o.beard,sd*0.042,hy-0.08,0.158,inner); m.rotation.z=sd*0.3; B(0.06,0.14,0.08,o.beard,sd*0.12,hy-0.12,0.1,inner); }); }   // the moustache over the mouth, whiskers down the cheeks
  if(o.bigBeard){ Sp(0.17,o.beard,0,hy-0.1,0.07,inner,10,8).scale.set(1.05,1.0,0.8); B(0.2,0.06,0.05,0x5a3015,0,hy-0.04,0.17,inner); }                 // the king's great beard and moustache
  if(o.bun){ Sp(0.08,o.hair,0,hy+0.2,-0.1,inner,8,6); Cy(0.03,0.03,0.04,8,o.circlet||0xe8c040,0,hy+0.15,-0.08,inner); }
  if(o.circlet){ Cy(0.182,0.182,0.045,16,o.circlet,0,hy+0.07,0,inner); if(o.gem) Sp(0.03,o.gem,0,hy+0.09,0.18,inner,6,4); }
  if(o.tiara){ Cy(0.17,0.175,0.05,14,o.tiara,0,hy+0.12,0,inner); for(let i=0;i<5;i++){ const a=(i-2)*0.42; Co(0.026,0.08+(i===2?0.05:0),4,o.tiara,Math.sin(a)*0.17,hy+0.15,Math.cos(a)*0.17,inner); } if(o.gem) Sp(0.03,o.gem,0,hy+0.17,0.17,inner,6,4); }
  if(o.cheeks) [-1,1].forEach(sd=>{ const c=Sp(0.028,o.cheeks,sd*0.1,hy-0.04,0.14,inner,6,4); c.scale.z=0.4; });
  if(o.bodice){ B(0.06,0.28,0.03,o.bodice,0,0.78,front+0.02,inner); B(0.34,0.045,0.04,o.bodice,0,0.78,front+0.0,inner); [-1,1].forEach(sd=>B(0.03,0.22,0.03,o.bodice,sd*0.08,0.83,front+0.01,inner).rotation.z=sd*0.35); }
  if(o.dress&&o.legs!==o.body) Cy(0.3,0.36,0.5,14,o.legs,0,0,0,inner);                                                                                    // a gown's darker skirt
  if(o.cross){ B(0.06,0.3,0.02,o.cross,0,chestY-0.22,front+0.02,inner); B(0.2,0.06,0.02,o.cross,0,chestY-0.12,front+0.02,inner); }                     // Joshua's gold cross
  if(o.emblem) B(0.12,0.12,0.02,o.emblem,0,chestY-0.12,front+0.02,inner);
  if(o.bigPaul) [-1,1].forEach(sd=>{ const p=Sp(0.15,o.bigPaul,sd*0.29,shoulder-0.02,0,inner,12,8); p.scale.set(1.15,0.75,1.0); B(0.08,0.28,0.24,o.bigPaul,sd*0.37,shoulder-0.28,0,inner); });   // broad silver shoulders
  if(o.paul) [-1,1].forEach(sd=>{ const p=Sp(0.11,o.paul,sd*0.27,shoulder-0.01,0,inner,10,7); p.scale.set(1.1,0.7,1); });
  if(o.band){ Cy(0.18,0.18,0.08,14,o.band,0,hy+0.07,0,inner); Sp(0.17,o.band,0,hy+0.1,0,inner,12,6).scale.y=0.45; if(o.tuft) Co(0.04,0.1,5,o.tuft,0,hy+0.19,0,inner); }
  if(o.crest){ B(0.05,0.12,0.26,o.crest,0,hy+0.17,-0.02,inner); B(0.36,0.04,0.36,o.trim||o.crest,0,hy+0.07,0,inner).scale.set(1,1,1); Cy(0.172,0.172,0.04,14,o.trim||o.crest,0,hy+0.02,0,inner); }
  if(o.plume){ for(let i=0;i<4;i++){ const pl=B(0.07,0.1,0.08,o.plume,0,hy+0.17+i*0.035,-0.03-i*0.05,inner); pl.rotation.x=-0.4-i*0.25; } Cy(0.172,0.172,0.04,14,o.trim||0xe8c040,0,hy+0.0,0,inner); }
  if(o.staff){ Cy(0.022,0.026,1.55,6,o.staff,0.32,0.05,0.12,inner); const gm=new THREE.Mesh(new THREE.OctahedronGeometry(0.06),glow(o.staffGem||0x8af0b0)); gm.position.set(0.32,1.66,0.12); inner.add(gm); }
  if(o.board){ const bd=B(0.34,1.45,0.06,0xf4f0e6,0.42,0,-0.05,inner); B(0.06,1.3,0.065,0x2a8aa0,0.42,0.07,-0.05,inner); }                          // Elijah's surfboard, with its stripe
  if(o.bucket){ Cy(0.2,0.23,0.14,14,o.bucket,0,hy+0.1,0,inner); Cy(0.3,0.3,0.025,16,o.bucket,0,hy+0.06,0,inner); if(o.flower) Sp(0.04,o.flower,0.12,hy+0.16,0.12,inner,6,4); }
  if(o.cap){ Sp(0.18,o.cap,0,hy+0.06,0,inner,12,6).scale.y=0.6; B(0.2,0.025,0.14,o.cap,0,hy+0.06,0.18,inner); Cy(0.185,0.185,0.03,14,0xf4f0e6,0,hy+0.05,0,inner); }
  if(o.stripe) B(0.42,0.06,0.42,o.stripe,0,0.72,0,inner);
  if(o.spots) for(let i=0;i<7;i++){ const a=i*0.9, y=0.3+((i*37)%9)/9*0.55; const d=Sp(0.025,o.spots,Math.sin(a)*0.26,y,Math.cos(a)*0.26,inner,5,3); d.scale.z=0.4; }
  // which part each piece belongs to, for the pose shader: 1/2 the left/right arm, 3 the head and all it wears, 4/5 the legs
  const S0=s*(o.tall||1), heldX=!!(o.mug||o.spear||o.halberd||o.staff||o.scroll||o.lute||o.board);
  inner.children.forEach(m=>{ if(m.userData.part) return; const q=m.position;
    if(q.y>=hy-0.3&&Math.abs(q.x)<0.24) m.userData.part=3;
    else if(!robe&&q.y<0.36&&Math.abs(q.x)>0.04&&Math.abs(q.x)<0.16) m.userData.part=q.x>0?4:5; });
  g.userData.pivots={1:[0.25*S0,(shoulder-0.04)*S0,0],2:[-0.25*S0,(shoulder-0.04)*S0,0],3:[0,(hy-0.24)*S0,0],4:[0.09*S0,0.45*S0,0],5:[-0.09*S0,0.45*S0,0]}; g.userData.heldL=heldX;
  return mergePerson(shade(g),opts); }
// one mesh per person: every flat-coloured part baked into a single vertex-coloured geometry (glows and see-through
// parts stay as they are) — so a town of detailed folk costs a handful of draws, not hundreds
const _PMAT=new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:6,specular:0x111111});
function mergePerson(g,opts){ if(opts&&opts.noMerge) return g; g.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(), pos=[], nor=[], col=[], part=[], piv=[], ink=[], drop=[], m4=new THREE.Matrix4(), nm=new THREE.Matrix3(), v=new THREE.Vector3(), c=new THREE.Color();
  g.traverse(o=>{ if(!o.isMesh||!o.visible) { if(o.isMesh) drop.push(o); return; } const mt=o.material; if(!mt||!mt.isMeshPhongMaterial||mt.transparent||(mt.emissive&&mt.emissive.getHex())||mt.map) return;
    let ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); m4.multiplyMatrices(inv,o.matrixWorld); ge.applyMatrix4(m4); if(!ge.attributes.normal) ge.computeVertexNormals(); c.copy(mt.color);   // the parts keep their own smooth normals: rounded heads, robes and sleeves
    const gp=o.geometry.parameters||{}, open=(gp.phiLength!==undefined&&gp.phiLength<6.2)||!!gp.openEnded, ik=open||o.userData.noInk?0:1;   // an open shell (a hood, a fall of hair) gets no ink: its inside would show through
    let pt=0; for(let q=o;q&&q!==g;q=q.parent) if(q.userData.part){ pt=q.userData.part; break; } const pv=(g.userData.pivots&&g.userData.pivots[pt])||[0,0,0];
    const p=ge.attributes.position.array, n=ge.attributes.normal.array; for(let i=0;i<p.length;i++){ pos.push(p[i]); nor.push(n[i]); } for(let i=0;i<p.length/3;i++){ const yy=p[i*3+1], ao=yy<0.9?0.68+0.32*Math.min(1,Math.max(0,yy/0.9)):1;   // darker toward the feet, as the light falls
      col.push(c.r*ao,c.g*ao,c.b*ao); part.push(pt); piv.push(pv[0],pv[1],pv[2]); ink.push(ik); } drop.push(o); });
  if(!pos.length) return g; drop.forEach(o=>o.parent&&o.parent.remove(o));
  const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); bg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  bg.setAttribute('aPart',new THREE.Float32BufferAttribute(part,1)); bg.setAttribute('aPivot',new THREE.Float32BufferAttribute(piv,3)); bg.setAttribute('aInk',new THREE.Float32BufferAttribute(ink,1));
  const pose=g.userData.pose={armL:{value:new THREE.Vector2()},armR:{value:new THREE.Vector2()},head:{value:new THREE.Vector3()},legs:{value:new THREE.Vector2()}};
  const mesh=new THREE.Mesh(bg,poseMat(pose)); mesh.castShadow=true; mesh.receiveShadow=true; g.add(mesh);
  if(typeof OOT_LOOK!=='undefined'&&OOT_LOOK) return g;   // the Ocarina look: no ink line
  const ol=new THREE.Mesh(bg,outlineMat(pose)); ol.userData.outline=true; g.add(ol); return g; }   // a dark ink line round the figure, as the sprites are drawn
// the ink outline: the same figure, pushed out along its normals, drawn from behind in a dark tone
function outlineMat(pose){ const m=new THREE.MeshBasicMaterial({color:0x1c1418,side:THREE.BackSide});
  m.onBeforeCompile=sh=>{ sh.uniforms.uArmL=pose.armL; sh.uniforms.uArmR=pose.armR; sh.uniforms.uHead=pose.head; sh.uniforms.uLegs=pose.legs;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aInk;\n'+_POSE_GLSL)
      .replace('#include <begin_vertex>',`#include <begin_vertex>
        mat3 pR=mat3(1.0); if(aPart>0.5&&aPart<1.5) pR=_rz(uArmL.y)*_rx(uArmL.x); else if(aPart>1.5&&aPart<2.5) pR=_rz(uArmR.y)*_rx(uArmR.x);
        else if(aPart>2.5&&aPart<3.5) pR=_ry(uHead.x)*_rx(uHead.y)*_rz(uHead.z); else if(aPart>3.5&&aPart<4.5) pR=_rx(uLegs.x); else if(aPart>4.5) pR=_rx(uLegs.y);
        transformed=aInk<0.5?aPivot:aPivot+pR*(transformed-aPivot)+normalize(pR*normal)*0.016;`); };
  m.customProgramCacheKey=()=>'folkink'; return m; }
// the folk's pose, in the vertex shader: each baked part turns about its own joint (shoulder, neck, hip) — so a merged
// person can still wave, gesture as they talk, nod, glance about and walk, at no extra draw
const _POSE_GLSL=`attribute float aPart; attribute vec3 aPivot; uniform vec2 uArmL; uniform vec2 uArmR; uniform vec3 uHead; uniform vec2 uLegs;
mat3 _rx(float a){ float c=cos(a),s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); } mat3 _ry(float a){ float c=cos(a),s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); } mat3 _rz(float a){ float c=cos(a),s=sin(a); return mat3(c,s,0., -s,c,0., 0.,0.,1.); }`;
function poseMat(pose){ const m=new THREE.MeshPhongMaterial({vertexColors:true,shininess:10,specular:0x1a1a1a});
  m.onBeforeCompile=sh=>{ sh.uniforms.uArmL=pose.armL; sh.uniforms.uArmR=pose.armR; sh.uniforms.uHead=pose.head; sh.uniforms.uLegs=pose.legs;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+_POSE_GLSL)
      .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
        mat3 pR=mat3(1.0); if(aPart>0.5&&aPart<1.5) pR=_rz(uArmL.y)*_rx(uArmL.x); else if(aPart>1.5&&aPart<2.5) pR=_rz(uArmR.y)*_rx(uArmR.x);
        else if(aPart>2.5&&aPart<3.5) pR=_ry(uHead.x)*_rx(uHead.y)*_rz(uHead.z); else if(aPart>3.5&&aPart<4.5) pR=_rx(uLegs.x); else if(aPart>4.5) pR=_rx(uLegs.y);
        objectNormal=pR*objectNormal;`)
      .replace('#include <begin_vertex>','#include <begin_vertex>\n transformed=aPivot+pR*(transformed-aPivot);'); };
  m.customProgramCacheKey=()=>'folkpose'; return m; }
// how the folk move: at rest they breathe and glance about; as you come near they turn their head to you (and some wave);
// in talk they gesture and nod; and anyone walking swings arms and legs
function folkPose(f,t,dt,P,talking){ const u=f.g.userData; if(u.castK){ castPose(f,t,dt,P,talking); return; } const ps=u.pose; if(!ps) return; const ph=f.ph||0, d=Math.hypot(f.x-P.x,f.z-P.z);
  const st=u._ps||(u._ps={hy:0,hp:0,ax:0,az:0,lx:0,rx:0,rz:0,wave:0,met:false,wk:0}); const k=Math.min(1,dt*6);
  if(d<3.2&&!st.met){ st.met=true; if(hsh(Math.floor(ph*100),7)<0.45) st.wave=1.6; } if(d>6) st.met=false;
  let hy=Math.sin(t*0.35+ph)*0.35*Math.max(0,Math.sin(t*0.13+ph*2)), hp=0.03*Math.sin(t*1.7+ph), rx=Math.sin(t*1.1+ph)*0.04, rz=0, lx=-Math.sin(t*1.1+ph)*0.04;
  if(d<2.6){ let a=Math.atan2(P.x-f.x,P.z-f.z)-f.g.rotation.y; a=Math.atan2(Math.sin(a),Math.cos(a)); hy=Math.max(-0.7,Math.min(0.7,a)); hp=-0.08; }
  if(talking){ st.wave=0; hp=-0.06+Math.sin(t*3.1+ph)*0.07; rx=-0.55-0.35*Math.max(0,Math.sin(t*2.2+ph)); rz=-0.15-0.12*Math.sin(t*1.4+ph); if(!u.heldL) lx=-0.25-0.2*Math.max(0,Math.sin(t*1.9+ph+1.7)); }
  if(st.wave>0){ st.wave-=dt; rx=-2.7; rz=-0.35+Math.sin(t*11)*0.32; }
  const wk=f.walking?1:0; st.wk+=(wk-st.wk)*k; if(st.wk>0.01){ const w=Math.sin(t*8+ph)*0.5*st.wk; rx+=-w*0.8; lx+=w*0.8; ps.legs.value.set(w,-w); } else ps.legs.value.set(0,0);
  st.hy+=(hy-st.hy)*k; st.hp+=(hp-st.hp)*k; st.rx+=(rx-st.rx)*Math.min(1,dt*(st.wave>0?14:7)); st.rz+=(rz-st.rz)*Math.min(1,dt*(st.wave>0?14:7)); st.lx+=(lx-st.lx)*k;
  ps.head.value.set(st.hy,st.hp,0); ps.armR.value.set(st.rx,st.rz); ps.armL.value.set(st.lx,0); }
// helper: put a person into a level at tile (x,y), facing rest, saying lines
function addPerson(lv,par,look,x,z,y,who,lines,opts){ opts=opts||{}; const nl=who&&NAMED_LOOK[who]; if(nl){ look=nl; opts=Object.assign({},opts); delete opts.her; } const g=person(look,Object.assign({who:who||''},opts)); g.position.set(x,y,z); g.rotation.y=opts.rest||0; par.add(g);
  const f={g,x,z,y,who,look,lines,rest:opts.rest||0,ph:hsh(Math.floor(x*7),Math.floor(z*7))*6,reach:opts.reach||0,next:opts.next,mute:opts.mute,still:opts.still};
  lv.folk.push(f); return f; }
