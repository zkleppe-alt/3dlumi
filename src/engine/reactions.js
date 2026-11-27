// ════════════════════════════════════════════════════════════════
//  REACT (V287) — the townsfolk answer to what the Knight has done. When you speak to a villager, before their own words they
//  greet you as things stand: afraid while their own chapel is still bound; glad and grateful once it's cleansed (overjoyed if
//  you've only just done it); passing on the word of other towns you've freed, as it spreads (and wondering if it was you);
//  warm as to a friend once you've helped people in their village (the side quests); at home of an evening, welcoming you in;
//  and once the Demon King is beaten, at peace. Guards, the night watch and children have their own way of saying it.
//  Each villager picks their line by their own seed, and a different one each time you speak to them.
//    REACT.wrap(f, lines) → lines   (core.js, before a townsperson speaks)
// ════════════════════════════════════════════════════════════════
const REACT=(()=>{
  const S=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  const TIX={Hearthvale:0,Homestead:0,Ironhold:1,Saltmere:2,Thornwood:3,Dusthaven:4,Crystalpeak:5,Ashfield:6,Stormgate:7,Shadowmere:8,Hellgate:9};
  const TNAME=['Hearthvale','Ironhold','Saltmere','Thornwood','Dusthaven','Crystalpeak','Ashfield','Stormgate','Shadowmere','Hellgate'];
  const nameOf=t=>(typeof CHAPELS!=='undefined'&&CHAPELS[t]&&CHAPELS[t].td&&CHAPELS[t].td.name)||TNAME[t]||'a town';
  // each village's own life, before and after its chapel is cleansed
  const FLAV={
    Hearthvale:{pre:'The sheep won\'t graze near the chapel. They know.',post:'We rang the chapel bell for the harvest supper. First time in fifteen years.'},
    Ironhold:{pre:'The forges burn day and night, and still the cold gets in.',post:'The forge-fires burn clean again. Listen — the hammers are singing.'},
    Saltmere:{pre:'The boats come back with empty nets, and nobody says why.',post:'The nets come up full again. Old Ezra says the sea\'s forgiven us.'},
    Thornwood:{pre:'Even the birds keep quiet in the trees these days.',post:'The birds came back to the Chapel Oak the very morning after.'},
    Dusthaven:{pre:'The caravans don\'t stop here long. They feel it.',post:'Three caravans came in this week. The bazaar smells of spice again.'},
    Crystalpeak:{pre:'The hot spring\'s gone lukewarm. That\'s never happened.',post:'The spring steams like it used to. The pilgrims are climbing again.'},
    Ashfield:{pre:'We rebuild, and the ash still won\'t settle.',post:'The new barley\'s coming up green right through the ash.'},
    Stormgate:{pre:'The King\'s court whispers. Nobody says what about.',post:'The cathedral bells rang for an hour. The whole city came out to hear.'},
    Shadowmere:{pre:'The mist sits on the mere and doesn\'t lift.',post:'The mist burned off this morning. I could see clear across the mere.'},
    Hellgate:{pre:'Pray as you go, knight. This was a great city once.',post:'The old city breathes again. The pilgrims weep at the gates.'} };
  const P={
    pre:['Knight! Thank heaven. Nobody\'s dared go near our chapel since the dark came.','We bar our doors at dusk now. You hear things, after.','Our chapel\'s bells have been silent so long the children don\'t know what they sound like.','They say something sits in our chapel like it\'s a throne. Is that why you\'ve come?','Keep your sword close, knight. It\'s not safe here — not yet.','Every night I pray someone will come. Maybe tonight it was answered.'],
    fresh:['It\'s you! You cleansed the chapel — I heard the bells from my own doorstep!','Bless you, knight. I slept through the night for the first time in years.','The whole village is talking. The light came back into the chapel and we all just… wept.','I don\'t know how to thank you. I keep looking at the chapel to make sure it\'s still lit.','You did it. You actually did it. Come here — let me shake your hand.'],
    post:['Good day, knight. Life\'s come back to us, thanks to you.','Peace to you, Sir Knight. The chapel\'s doors are open every morning now.','There\'s the knight who gave us back our chapel! Good day to you.','We remember you in our prayers, knight. Every night.','Walk where you like here, knight. You\'ll always find a welcome.'],
    word0:['Nobody comes back from the roads these days. You\'re brave to be out.','They say the King\'s sent a knight against the dark. Just one.'],
    word1:['Word came from {last}: their chapel burns bright again. Was that you?','A trader said {last} is free of the darkness. Could it be true?','They\'re saying a lone knight freed {last}. Folk here are starting to hope.'],
    wordN:['{n} chapels lit again, they say — {last} the latest. It\'s you, isn\'t it?','Every traveller has the same story: one knight, and the chapels lighting up one after another.','Half the realm\'s praying for you, knight. Word gets around.','First {last}, and before that more. Maybe our turn is coming.'],
    helped:['{giver} hasn\'t stopped telling everyone what you did for her family.','You\'re the one who helped {giver}! The whole village heard.','A friend of {giver}\'s is a friend of ours, knight.','Folk here don\'t forget a kindness. {giver} made sure of that.'],
    home:['Come in out of the dark, knight! Sit by the fire a while.','We were just about to bank the fire. Come in, come in.','You\'re welcome under our roof, Sir Knight. There\'s bread on the table.','At this hour? Well — come in. Any friend of the village is a friend of this house.'],
    homePre:['Quickly, inside — and bar the door behind you. Nobody\'s out after dark here.','Knight? Come in, hurry. We don\'t open the door after dusk anymore.'],
    won:['The Demon King is gone! My children sleep without nightmares now.','Glory to God — and thanks to you, knight. The whole realm is free.','I saw the sky change the day you won. Like a weight lifting off the world.','Everywhere you go, they\'ll be singing about you for a hundred years.','Peace, at last. "Weeping may endure for a night, but joy cometh in the morning."'],
    guardPre:['Halt — ah, Sir Knight. Pass, but watch yourself. The dark\'s thick here.','Stay sharp, knight. We\'ve lost men on this road.','I keep the post. Someone has to, while the chapel\'s bound.'],
    guardPost:['Sir Knight! An honour. The post\'s quiet these days — thanks to you.','Pass, friend. You\'ve no need of a guard\'s leave in this town.','Morning, Sir Knight. Nothing to report. Good to say that again.'],
    night:['Night watch, Sir Knight. Keep to the lit streets.','All\'s quiet on my watch. Get some rest — the dawn comes early.','I\'ve the post till sunrise. Go safely.'],
    nightPre:['Night watch. Don\'t linger out here, knight — not after dark. Not here.','I\'ve the post till dawn. Pray it\'s a quiet one.'],
    kidPre:['Are you a real knight? Mama says the chapel\'s full of monsters.','I\'m not scared of the dark. Much.','Will you make the bad things go away?'],
    kidPost:['You beat the monster in our chapel! I saw the light come back!','When I grow up I\'m going to be a knight like you!','Can I hold your sword? Just for a minute?'],
    kidWon:['You BEAT the Demon King! I told everyone you would!','Teach me to fight! Please, please, please!'] };
  const seedOf=(f,k)=>{ let x=2166136261; const t=String(f.key||f.who)+'|'+k; for(let i=0;i<t.length;i++){ x^=t.charCodeAt(i); x=Math.imul(x,16777619); } return x>>>0; };
  const pick=(f,pool,k)=>{ const n=(f._rk=(f._rk||0)+1); return pool[(seedOf(f,k)+n)%pool.length]; };
  const fill=(s,o)=>s.replace(/\{(\w+)\}/g,(m,k)=>o[k]!=null?o[k]:m);
  function helpedGiver(t){ const Q=typeof SIDEQUEST_DATA!=='undefined'&&SIDEQUEST_DATA.quests&&SIDEQUEST_DATA.quests[t]; const sq=S().sideq||{}; if(!Q) return null; const d=Q.filter(q=>sq[q.id]===3); return d.length?d[d.length-1].giver&&d[d.length-1].giver.name:null; }
  function greet(f){ const s=S(), t=TIX[f.town]; if(t===undefined) return null; const n=s.chapels|0, own=n>t, fresh=own&&t===n-1&&!s.abaddonWon, won=!!s.abaddonWon, last=n>0?nameOf(n-1):null, kind=(f.key||'').split(':').pop();
    const guard=/soldier|guard|watcher/.test(kind), kid=/child/.test(kind), home=!!f.atHomeIn, nightW=!!f.night, o={last,n,giver:null};
    if(kid) return pick(f,won?P.kidWon:own?P.kidPost:P.kidPre,'kid');
    if(nightW) return pick(f,won||own?P.night:P.nightPre,'nw');
    if(guard) return pick(f,won?P.won:own?P.guardPost:P.guardPre,'g');
    const out=[];
    if(home) out.push(pick(f,own||won?P.home:P.homePre,'home'));
    if(won) out.push(pick(f,P.won,'won'));
    else if(fresh) out.push(pick(f,P.fresh,'fresh'));
    else if(own){ const g=helpedGiver(t); if(g&&(seedOf(f,'h')+(f._rk||0))%2===0){ o.giver=g; out.push(fill(pick(f,P.helped,'help'),o)); } else out.push(pick(f,(seedOf(f,'fl')+(f._rk||0))%3===0?[FLAV[f.town]&&FLAV[f.town].post].filter(Boolean).concat(P.post):P.post,'post')); }
    else { const fl=FLAV[f.town]; out.push(pick(f,fl&&(seedOf(f,'fp')+(f._rk||0))%3===0?[fl.pre]:P.pre,'pre')); if(!home) out.push(fill(pick(f,n===0?P.word0:n===1?P.word1:P.wordN,'word'),o)); }
    return out; }
  function wrap(f,lines){ try{ if(!f||!f.town) return lines; const g=greet(f); if(!g) return lines; const head=Array.isArray(g)?g:[g];
      const rest=(lines||[]).filter(l=>head.indexOf(l)<0); return head.concat(rest.length?rest.slice(0,2):[]); }catch(e){ return lines; } }
  return {wrap,greet,TIX};
})();
