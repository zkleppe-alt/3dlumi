// ════════════════════════════════════════════════════════════════
//  GREEK — Old Man Mario's hut, at the edge of the wood east of the Homestead. Once the Homestead is yours (Abaddon
//  fallen), the old man teaches you Koine Greek, the Greek of the New Testament, a lesson at a time, so that one day
//  you can read the old manuscripts for yourself. Each lesson: he teaches (a page you can study), then a short test of
//  eight questions; six right and it's learned. Then practise any time with what you know, for a few coins a correct answer.
//  Pronunciation is the Erasmian scheme most Greek classrooms use. Reading passages will come from the public-domain
//  Robinson–Pierpont Byzantine text. State: GAME.S.greek = {done:[lesson ids], best:{id:score}, read:{fragment:true}}.
//  V95: ten lessons, to reading John 1:1–5; manuscripts around the realm (GREEK.place) open in a word-by-word reader.
//  V96: lessons 11–14 (plurals, my/your/our, commands, the future and participles); a passage on a lectern in every sanctuary.
//  greekHut(world, {x,z}) builds the hut in the realm and its room ('marioHut').
// ════════════════════════════════════════════════════════════════
const GREEK=(function(){
  // ── the letters (lessons 1 and 2) ──  [capital, small, name, sound, as in]
  const L1=[['Α','α','alpha','a','father'],['Β','β','beta','b','bat'],['Γ','γ','gamma','g','go'],['Δ','δ','delta','d','dog'],['Ε','ε','epsilon','e (short)','met'],['Ζ','ζ','zeta','z (or dz)','daze'],
    ['Η','η','eta','ē (long e)','obey'],['Θ','θ','theta','th','thin'],['Ι','ι','iota','i','it / machine'],['Κ','κ','kappa','k','kite'],['Λ','λ','lambda','l','lamp'],['Μ','μ','mu','m','mother']];
  const L2=[['Ν','ν','nu','n','net'],['Ξ','ξ','xi','x (ks)','axe'],['Ο','ο','omicron','o (short)','top'],['Π','π','pi','p','pie'],['Ρ','ρ','rho','r','rod'],['Σ','σ / ς','sigma','s','sit'],
    ['Τ','τ','tau','t','tip'],['Υ','υ','upsilon','u (French u, written y)','une'],['Φ','φ','phi','ph (f)','phone'],['Χ','χ','chi','ch (as in Bach)','loch'],['Ψ','ψ','psi','ps','lips'],['Ω','ω','omega','ō (long o)','tone']];
  const ALL=L1.concat(L2);
  // ── lesson 3: breathings, diphthongs, first words ──
  const BREATH=[['ὁ','ho','the'],['ἐν','en','in'],['ἡμέρα','hēmera','day'],['ἀρχή','archē','beginning'],['ὕδωρ','hydōr','water'],['ἁμαρτία','hamartia','sin']];
  const DIPH=[['αι','ai, as in aisle'],['ει','ei, as in eight'],['οι','oi, as in oil'],['αυ','au, as in sauerkraut'],['ευ','eu, as in feud'],['ου','ou, as in soup'],['υι','ui, as in suite']];
  const WORDS=[['θεός','theos','God'],['λόγος','logos','word'],['ἀρχή','archē','beginning'],['καί','kai','and, also'],['ἐν','en','in'],['ὁ','ho','the'],['Ἰησοῦς','Iēsous','Jesus'],
    ['Χριστός','Christos','Christ, the Anointed One'],['κύριος','kyrios','Lord, master'],['ἄνθρωπος','anthrōpos','man, person'],['ἀγάπη','agapē','love'],['πνεῦμα','pneuma','spirit, breath, wind'],
    ['κόσμος','kosmos','world'],['ζωή','zōē','life'],['φῶς','phōs','light']];
  const big=t=>`<span lang="el" style="font:600 30px/1.2 'Gentium Plus','Noto Serif','Times New Roman',serif">${t}</span>`;
  const gk=t=>`<span lang="el" style="font:600 19px 'Gentium Plus','Noto Serif','Times New Roman',serif">${t}</span>`;
  const table=(rows,cols)=>`<div style="display:grid;grid-template-columns:${cols};gap:4px 10px;align-items:center;margin:8px 0">${rows.join('')}</div>`;
  const letterRows=L=>table(L.map(([C,s,n,snd,ex])=>`<div>${big(C+' '+s)}</div><div><b>${n}</b><br><span class="ds">${UI.esc(snd)} · as in “${UI.esc(ex)}”</span></div>`),'auto 1fr');
  const shuffle=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const pick=(a,n)=>shuffle(a).slice(0,n);
  // a question: {q (html), a (answer text), opts (4 texts), big?}
  const mcq=(prompt,answer,pool)=>({q:prompt,a:answer,opts:shuffle([answer].concat(pick(pool.filter(x=>x!==answer).filter((x,i,arr)=>arr.indexOf(x)===i),3)))});
  function letterQs(L){ const out=[]; const names=ALL.map(l=>l[2]), sounds=ALL.map(l=>l[3]), smalls=ALL.map(l=>l[1]);
    L.forEach(([C,s,n,snd])=>{ out.push(mcq(`Which letter is this?<br>${big(s)}`,n,names)); out.push(mcq(`How does <b>${n}</b> sound?<br>${big(C+' '+s)}`,snd,sounds));
      out.push(Object.assign(mcq(`Which is <b>${n}</b>?`,s,smalls),{glyph:true})); out.push(Object.assign(mcq(`Which small letter goes with the capital?<br>${big(C)}`,s,smalls),{glyph:true})); });
    return shuffle(out).slice(0,8); }
  function wordQs(){ const out=[]; const means=WORDS.map(w=>w[2]), tr=WORDS.map(w=>w[1]).concat(BREATH.map(b=>b[1]));
    pick(WORDS,4).forEach(([g,t,m])=>out.push(mcq(`What does this word mean?<br>${big(g)}`,m,means)));
    pick(WORDS.filter(w=>!/^[ὁἐἀἸ]/.test(w[0])),1).concat(pick(BREATH,2)).forEach(([g,t])=>out.push(mcq(`Read this word aloud — which is right?<br>${big(g)}`,t,tr)));
    const d=pick(DIPH,1)[0]; out.push(Object.assign(mcq(`How is ${big(d[0])} sounded?`,d[1],DIPH.map(x=>x[1]))));
    return shuffle(out).slice(0,8); }
  const LESSONS=[
    { id:'l1', title:'The Letters, I — Alpha to Mu', reward:150,
      intro:['“Ah — a knight who wants to read! Sit, sit. The lamp has another hour in it yet.”','“The Greek of the apostles has twenty-four letters. Today, the first twelve. Say each one aloud — your mouth must learn them as well as your eyes.”'],
      teach:()=>`<p class="gm-intro">Twenty-four letters, and you know some already: our own alphabet came from these. Today, the first twelve. Watch the three that trick everyone: <b>η</b> is not an n but a long e, <b>ρ</b> (next lesson) is not a p, and <b>ν</b> is not a v.</p>${letterRows(L1)}<p class="gm-hint">Mario’s rule: say the name, then the sound, then draw it with your finger on the table. Three times each.</p>`,
      quiz:()=>letterQs(L1) },
    { id:'l2', title:'The Letters, II — Nu to Omega', reward:150,
      intro:['“Back again! Good. The second twelve today — and with them, every word in the Gospels is yours to sound out.”','“From alpha to omega. You know who called Himself that, eh? The first and the last letter — everything between.”'],
      teach:()=>`<p class="gm-intro">The rest of the alphabet. Mind <b>σ</b>: inside a word it is σ, but at the very end it curls into <b>ς</b> — λόγο<b>ς</b>. And mind the two o’s and two e’s: <b>ο</b> and <b>ε</b> are short, <b>ω</b> and <b>η</b> are long.</p>${letterRows(L2)}<p class="gm-hint">These are the sounds most Greek classrooms teach (the Erasmian way). Greeks today say some of them differently, and so, likely, did the apostles — but this way, every letter has its own sound, which is what a learner needs.</p>`,
      quiz:()=>letterQs(L2) },
    { id:'l3', title:'Breathing, Diphthongs and First Words', reward:200,
      intro:['“Now the little marks. See this hook over the letter? That is a breathing. It tells you whether to breathe an h before the word.”','“And then — your first words. Fifteen of them, and with them you could already read pieces of John’s first verse.”'],
      teach:()=>`<p class="gm-intro">Every word that begins with a vowel wears a <b>breathing</b> mark. The <b>rough</b> breathing ( ῾ , like a c) means say an <b>h</b> first: ${gk('ὁ')} = <i>ho</i>. The <b>smooth</b> breathing ( ᾿ , like a backward c) is silent: ${gk('ἐν')} = <i>en</i>. A word starting with υ always takes the rough: ${gk('ὕδωρ')} = <i>hydōr</i>, water.</p>`
        +table(BREATH.map(([g,t,m])=>`<div>${big(g)}</div><div><b>${t}</b> — ${UI.esc(m)}</div>`),'auto 1fr')
        +`<div class="gm-sec">Diphthongs — two vowels, one sound</div>`+table(DIPH.map(([g,s])=>`<div>${big(g)}</div><div>${UI.esc(s)}</div>`),'auto 1fr')
        +`<div class="gm-sec">First words</div>`+table(WORDS.map(([g,t,m])=>`<div>${big(g)}</div><div><b>${t}</b> — ${UI.esc(m)}</div>`),'auto 1fr')
        +`<p class="gm-hint">Already you can read three words of the Gospel of John: ${gk('ἐν ἀρχῇ … ὁ λόγος')} — <i>“in the beginning … the Word.”</i></p>`,
      quiz:wordQs } ];
  // ── lessons 4 to 10: hand-written questions [prompt, answer, three wrong answers] ──
  const pool=P=>()=>shuffle(P).slice(0,8).map(([q,a,...d])=>({q:/[A-Za-z]/.test(q)?q:`What does this mean?<br>${big(q)}`,a,opts:shuffle([a].concat(d))}));
  const rows=(R,cols)=>table(R.map(r=>r.map((c,i)=>`<div>${i===0?big(c):c}</div>`).join('')),cols||'auto 1fr');
  const MORE=[
    { id:'l4', title:'“The” and the Endings — ὁ λόγος', reward:250,
      intro:['“In English, the order of words tells you who did what. In Greek, the ending does. Change the ending and you change the job.”','“Today: ὁ λόγος, the word — and the four jobs it can do.”'],
      teach:()=>`<p class="gm-intro">A Greek noun changes its ending for its job in the sentence — its <b>case</b>. The little word “the” changes with it. Here is λόγος, “word”, in its four cases:</p>`
        +rows([['ὁ λόγος','<b>nominative</b> — the subject: <i>the word</i> (does it)'],['τοῦ λόγου','<b>genitive</b> — “of”: <i>of the word</i>'],['τῷ λόγῳ','<b>dative</b> — “to, in, with”: <i>to / in the word</i>'],['τὸν λόγον','<b>accusative</b> — the object: <i>the word</i> (has it done to it)']])
        +`<p>So <span lang="el">${gk('ὁ υἱὸς τοῦ θεοῦ')}</span> is <i>the Son of God</i>, and <span lang="el">${gk('ὁ ἄνθρωπος βλέπει τὸν θεόν')}</span> is <i>the man sees God</i> — whoever stands in the -ον ending is the one being seen, wherever he stands in the sentence.</p>`
        +`<div class="gm-sec">New words — they all end like λόγος</div>`+rows([['θεός','God'],['υἱός','son'],['οὐρανός','heaven'],['κόσμος','world'],['ἄνθρωπος','man, person']]),
      quiz:pool([['τοῦ θεοῦ','of God','God (the subject)','to God','God (the object)'],['ὁ υἱός','the son (the subject)','of the son','to the son','the son (the object)'],['τὸν κόσμον','the world (the object)','of the world','to the world','the world (the subject)'],
        ['τῷ λόγῳ','to / in the word','of the word','the word (the subject)','the word (the object)'],['ὁ υἱὸς τοῦ θεοῦ','the Son of God','the God of the son','the son to God','God is the son'],['Which ending marks the <b>object</b> (accusative) of λόγος?','-ον (λόγον)','-ος (λόγος)','-ου (λόγου)','-ῳ (λόγῳ)'],
        ['Which ending means <b>“of”</b> (genitive)?','-ου (λόγου)','-ον (λόγον)','-ος (λόγος)','-ῳ (λόγῳ)'],['οὐρανός','heaven','son','world','man'],['υἱός','son','heaven','God','word'],['ἐν τῷ κόσμῳ','in the world','of the world','the world (the object)','out of the world'],
        ['τοῦ οὐρανοῦ','of heaven','to heaven','heaven (the subject)','heaven (the object)'],[`In ${gk('τὸν θεὸν βλέπει ὁ ἄνθρωπος')} <span class="ds">(βλέπει = sees)</span>, who sees whom?`,'the man sees God','God sees the man','they see each other','the man is God']]) },
    { id:'l5', title:'“I Am” — εἰμί', reward:250,
      intro:['“The most important little verb there is. When Moses asked God His name, the answer was ‘I AM.’ And Jesus said it too — ἐγώ εἰμι.”'],
      teach:()=>`<p class="gm-intro">The verb “to be”. Greek often leaves out “I” or “they” — the ending already says who.</p>`
        +rows([['εἰμί','I am'],['εἶ','you are'],['ἐστί(ν)','he / she / it is'],['ἐσμέν','we are'],['ἐστέ','you (all) are'],['εἰσί(ν)','they are'],['ἦν','he / she / it <b>was</b>']])
        +`<div class="gm-sec">I, you, we</div>`+rows([['ἐγώ','I'],['σύ','you'],['ἡμεῖς','we']])
        +`<div class="gm-sec">In the Scriptures</div>`+rows([['ἐγώ εἰμι','I am'],['σὺ εἶ ὁ Χριστός','You are the Christ'],['ὁ θεὸς ἀγάπη ἐστίν','God is love']])
        +`<p class="gm-hint">The little ν on ἐστί(ν) and εἰσί(ν) comes and goes — it’s added before a vowel or at the end of a sentence. It changes nothing.</p>`,
      quiz:pool([['ἐστίν','he / she / it is','I am','they are','we are'],['εἰμί','I am','you are','he is','we are'],['ἐσμέν','we are','you (all) are','they are','I am'],['εἰσίν','they are','we are','he is','you are'],['εἶ','you are','I am','he is','they are'],
        ['ἦν','he / she / it was','he is','they are','I will be'],['ἐστέ','you (all) are','we are','they are','he is'],['ὁ θεὸς ἀγάπη ἐστίν','God is love','God loves','Love is not God','God was love'],['ἐγώ','I','you','we','he'],
        ['σὺ εἶ ὁ Χριστός','You are the Christ','I am the Christ','Christ is with you','You were the Christ'],['ἡμεῖς','we','I','you','they']]) },
    { id:'l6', title:'Doing Words — the Present Tense', reward:250,
      intro:['“Now the verbs that do things. Learn one, and you have the pattern for hundreds.”','“λύω — I loose, I set free. A good word for a knight, eh?”'],
      teach:()=>`<p class="gm-intro">Most verbs follow λύω, “I loose, set free”. The stem stays; the ending tells you who.</p>`
        +rows([['λύ-ω','I loose'],['λύ-εις','you loose'],['λύ-ει','he / she / it looses'],['λύ-ομεν','we loose'],['λύ-ετε','you (all) loose'],['λύ-ουσι(ν)','they loose']])
        +`<div class="gm-sec">Verbs that go the same way</div>`+rows([['λέγω','I say'],['ἔχω','I have'],['πιστεύω','I believe, trust'],['γινώσκω','I know'],['ἀκούω','I hear'],['βλέπω','I see']])
        +`<p class="gm-hint">So πιστεύ<b>ομεν</b> is “we believe”, and λέγ<b>ει</b> is “he says”.</p>`,
      quiz:pool([['πιστεύομεν','we believe','they believe','I believe','you (all) believe'],['λέγει','he / she says','I say','they say','you say'],['ἔχεις','you have','I have','we have','he has'],['ἀκούουσιν','they hear','we hear','he hears','you (all) hear'],
        ['βλέπω','I see','you see','he sees','they see'],['γινώσκετε','you (all) know','we know','they know','I know'],['Which ending means <b>“we”</b>?','-ομεν','-ετε','-ουσι(ν)','-εις'],['Which ending means <b>“they”</b>?','-ουσι(ν)','-ομεν','-ει','-ω'],
        ['πιστεύω','I believe','I say','I have','I hear'],['γινώσκω','I know','I see','I hear','I believe'],[`${big('λέγει αὐτῷ ὁ Ἰησοῦς')}<br><span class="ds">(αὐτῷ = to him)</span>`,'Jesus says to him','He says to Jesus','Jesus said nothing','They say to Jesus']]) },
    { id:'l7', title:'Life, Light and Glory — More Nouns', reward:250,
      intro:['“Not every noun ends like λόγος. Many of the most beautiful words end in -η or -α — life, love, truth, glory. These take ἡ, not ὁ.”'],
      teach:()=>`<p class="gm-intro">Nouns ending in <b>-η</b> or <b>-α</b> are mostly feminine and take <b>ἡ</b> for “the”. Here is ζωή, “life”:</p>`
        +rows([['ἡ ζωή','life (the subject)'],['τῆς ζωῆς','of life'],['τῇ ζωῇ','to / in life'],['τὴν ζωήν','life (the object)']])
        +`<p>See the tiny iota tucked under ῇ? That “iota subscript” is how you spot the dative: ${gk('ἐν ἀρχῇ')}, <i>in the beginning</i>.</p>`
        +`<div class="gm-sec">New words</div>`+rows([['ἀγάπη','love'],['φωνή','voice'],['ἀλήθεια','truth'],['ἡμέρα','day'],['δόξα','glory'],['καρδία','heart']])
        +`<div class="gm-sec">A third kind: neuter (“it”), with τό</div>`+rows([['τὸ φῶς','the light'],['τὸ ἔργον','the work, deed'],['τὸ πνεῦμα','the Spirit, breath']])+`<p class="gm-hint">A neuter noun looks the same as subject and object — the sentence tells you which.</p>`,
      quiz:pool([['ἐν ἀρχῇ','in the beginning','of the beginning','the beginning (the object)','out of the beginning'],['τῆς ζωῆς','of life','life (the subject)','to life','life (the object)'],['ἡ ἀλήθεια','the truth','the day','the glory','the heart'],['δόξα','glory','truth','heart','voice'],
        ['καρδία','heart','day','love','beginning'],['ἡμέρα','day','heart','light','work'],['τὴν ἀγάπην','love (the object)','of love','love (the subject)','to love'],['The little iota under ῃ in ἀρχῇ marks…','the dative (“in, to”)','a plural','a question','a name'],
        ['τὸ φῶς','the light','the life','the word','the world'],[`${big('ἡ · τῆς · τῇ · τήν')}<br>These are all…`,'“the” with a feminine noun','“the” with a masculine noun','forms of “to be”','forms of “and”'],['ἔργον','work, deed','word','world','spirit']]) },
    { id:'l8', title:'Him, This, and the Little Words', reward:250,
      intro:['“Little words carry great weight. Through. Without. With. In. Read John’s first verses without them and you’d be lost.”'],
      teach:()=>`<p class="gm-intro"><b>αὐτός</b> means “he”, and changes its ending like λόγος:</p>`+rows([['αὐτός','he'],['αὐτοῦ','his, of him'],['αὐτῷ','to him, in him'],['αὐτόν','him'],['αὐτό','it'],['οὗτος','this one, he'],['ἡμῖν','to us, among us'],['ἐμοῦ','of me']])
        +`<div class="gm-sec">Prepositions — each takes a certain case after it</div>`+rows([['ἐν','in (+ dative)'],['εἰς','into (+ accusative)'],['ἐκ / ἐξ','out of (+ genitive)'],['πρός','toward, with (+ accusative)'],['διά (δι᾽)','through (+ genitive)'],['χωρίς','without (+ genitive)'],['παρά','from (+ genitive)']])
        +`<div class="gm-sec">Little words</div>`+rows([['οὐ / οὐκ','not'],['οὐδέ','not even'],['καί','and'],['ἀλλά','but'],['γάρ','for (because)'],['ἵνα','so that'],['πάντα','all things'],['ὅ','which']]),
      quiz:pool([['αὐτοῦ','his / of him','him (the object)','to him','he'],['αὐτῷ','to / in him','his','he','him (the object)'],['εἰς τὸν κόσμον','into the world','out of the world','in the world','without the world'],['ἐκ τοῦ οὐρανοῦ','out of heaven','into heaven','in heaven','toward heaven'],
        ['δι᾽ αὐτοῦ','through him','without him','toward him','in him'],['χωρὶς αὐτοῦ','without him','through him','with him','his'],['πρὸς τὸν θεόν','with (toward) God','out of God','without God','God’s'],['οὐ','not','and','but','for'],
        ['ἀλλά','but','for','so that','not'],['γάρ','for (because)','but','and','not'],['πάντα','all things','nothing','one thing','this one'],['οὗτος','this one (he)','all things','not','which']]) },
    { id:'l9', title:'The Past — Augment and Aorist', reward:250,
      intro:['“Things that happened. Watch for the little ἐ- at the front of a verb — it is a doorway into the past.”'],
      teach:()=>`<p class="gm-intro">A verb that looks back usually grows an <b>ἐ-</b> at the front, the <b>augment</b>. The <b>aorist</b> tells of something that simply happened.</p>`
        +rows([['ἦν','he / she / it was'],['ἐγένετο','came to be, became, was made'],['ἐπίστευσα','I believed'],['ἔδωκεν','he gave'],['ἠγάπησεν','he loved <span class="ds">(ἀ- grows into ἠ-)</span>'],['κατέλαβεν','overcame, grasped <span class="ds">(κατ- + ἐ + λαβεν)</span>'],['ἐσκήνωσεν','dwelt — <i>pitched his tent</i>']])
        +`<div class="gm-sec">Two more you’ll meet in John</div>`+rows([['γέγονεν','has come to be <span class="ds">(the perfect: done, and it stands)</span>'],['φαίνει','shines <span class="ds">(present — no augment)</span>']])
        +`<p class="gm-hint">${gk('ὁ λόγος σὰρξ ἐγένετο')} — <i>the Word became flesh</i> (σάρξ = flesh).</p>`,
      quiz:pool([['ἐγένετο','came to be / became','comes to be','will come','has not come'],['ἔδωκεν','he gave','he gives','he will give','they gave'],['ἠγάπησεν','he loved','he loves','love','he was loved'],['ἐπίστευσα','I believed','I believe','we believed','he believes'],
        ['The ἐ- at the front of ἐγένετο marks…','the past (the augment)','a question','a plural','“not”'],['φαίνει','shines','shone','will shine','light'],['κατέλαβεν','overcame / grasped','shines','came','said'],['γέγονεν','has come to be','will come to be','is not','was not'],
        ['ἦν','was','is','will be','were not'],['σὰρξ ἐγένετο','became flesh','became light','made the world','was not flesh'],['ἐσκήνωσεν','dwelt (pitched his tent)','spoke','gave','saw']]) },
    { id:'l10', title:'Reading John 1:1–5', reward:500,
      intro:['“Well. Here we are. The first words of John’s Gospel — the very words on my desk. You know every piece of them now.”','“Read them slowly. Tap any word you’ve forgotten. Then tell me what they say.”'],
      teach:()=>readerHtml('john1',{teach:true}),
      quiz:pool([['Ἐν ἀρχῇ ἦν ὁ λόγος','In the beginning was the Word','In the end was the Word','The beginning was a word','The Word was not in the beginning'],['ὁ λόγος ἦν πρὸς τὸν Θεόν','the Word was with God','God was with the Word','the Word was without God','the Word came out of God'],
        ['Θεὸς ἦν ὁ λόγος','the Word was God','God was a word','God spoke the word','the Word is with God'],['πάντα δι᾽ αὐτοῦ ἐγένετο','all things came to be through him','all things were without him','he came through all things','nothing came to be'],
        ['χωρὶς αὐτοῦ ἐγένετο οὐδὲ ἕν','without him not even one thing came to be','with him everything came to be','without him all things came','one thing came without him'],['ἐν αὐτῷ ζωὴ ἦν','in him was life','he was in life','life was without him','he gave life'],
        ['ἡ ζωὴ ἦν τὸ φῶς τῶν ἀνθρώπων','the life was the light of men','men were the light of life','the light was the life of God','the life of men was dark'],['τὸ φῶς ἐν τῇ σκοτίᾳ φαίνει','the light shines in the darkness','the darkness shines in the light','the light shone out of darkness','the light is darkness'],
        ['ἡ σκοτία αὐτὸ οὐ κατέλαβεν','the darkness did not overcome it','the darkness overcame it','the light did not overcome the darkness','the darkness is not light']]) } ];
  MORE.forEach(l=>LESSONS.push(l));
  // ── the manuscripts: the text is the Robinson–Pierpont Byzantine Greek New Testament (2018), public domain; the
  //    word glosses and the translations are KLK's own, word for word ──
  const PASS={
    john1:{ ref:'John 1:1–5', title:'The Gospel of John, the beginning', need:10, verses:[
      ['1',[['Ἐν','in'],['ἀρχῇ','beginning (dative of ἀρχή)'],['ἦν','was'],['ὁ','the'],['λόγος,','Word — nominative: the subject'],['καὶ','and'],['ὁ','the'],['λόγος','Word'],['ἦν','was'],['πρὸς','with, toward'],['τὸν','the (accusative)'],['Θεόν,','God (accusative, after πρός)'],['καὶ','and'],['Θεὸς','God — no article: it says what the Word was'],['ἦν','was'],['ὁ','the'],['λόγος.','Word']]],
      ['2',[['οὗτος','this one, he'],['ἦν','was'],['ἐν','in'],['ἀρχῇ','beginning'],['πρὸς','with'],['τὸν','the'],['Θεόν.','God']]],
      ['3',[['πάντα','all things'],['δι᾽','through (διά)'],['αὐτοῦ','him (genitive)'],['ἐγένετο,','came to be (aorist)'],['καὶ','and'],['χωρὶς','without'],['αὐτοῦ','him'],['ἐγένετο','came to be'],['οὐδὲ','not even'],['ἓν','one thing'],['ὃ','which'],['γέγονεν.','has come to be (perfect)']]],
      ['4',[['ἐν','in'],['αὐτῷ','him (dative)'],['ζωὴ','life'],['ἦν,','was'],['καὶ','and'],['ἡ','the'],['ζωὴ','life'],['ἦν','was'],['τὸ','the (neuter)'],['φῶς','light'],['τῶν','of the (plural)'],['ἀνθρώπων.','men, people (genitive plural)']]],
      ['5',[['καὶ','and'],['τὸ','the'],['φῶς','light'],['ἐν','in'],['τῇ','the (dative)'],['σκοτίᾳ','darkness (dative)'],['φαίνει,','shines (present)'],['καὶ','and'],['ἡ','the'],['σκοτία','darkness'],['αὐτὸ','it (the light)'],['οὐ','not'],['κατέλαβεν.','overcame, grasped (aorist)']]] ],
      en:'In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God. All things came to be through him, and without him not even one thing came to be that has come to be. In him was life, and the life was the light of men. And the light shines in the darkness, and the darkness did not overcome it.' },
    john14_6:{ ref:'John 14:6', title:'A scrap kept by Hearthvale’s chapel door', need:6, verses:[
      ['6',[['λέγει','says (present)'],['αὐτῷ','to him'],['ὁ','the'],['Ἰησοῦς,','Jesus'],['Ἐγώ','I'],['εἰμι','am'],['ἡ','the'],['ὁδὸς','way'],['καὶ','and'],['ἡ','the'],['ἀλήθεια','truth'],['καὶ','and'],['ἡ','the'],['ζωή·','life'],['οὐδεὶς','no one'],['ἔρχεται','comes'],['πρὸς','to, toward'],['τὸν','the'],['πατέρα,','Father'],['εἰ','if'],['μὴ','not — εἰ μή: except'],['δι᾽','through'],['ἐμοῦ.','me']]] ],
      en:'Jesus says to him, “I am the way and the truth and the life; no one comes to the Father except through me.”' },
    john1_14:{ ref:'John 1:14', title:'A leaf on Eldan’s lectern', need:9, verses:[
      ['14',[['Καὶ','and'],['ὁ','the'],['λόγος','Word'],['σὰρξ','flesh'],['ἐγένετο','became (aorist)'],['καὶ','and'],['ἐσκήνωσεν','dwelt — pitched his tent'],['ἐν','among, in'],['ἡμῖν,','us'],['καὶ','and'],['ἐθεασάμεθα','we beheld (aorist)'],['τὴν','the'],['δόξαν','glory'],['αὐτοῦ,','his'],['δόξαν','glory'],['ὡς','as'],['μονογενοῦς','of the only-begotten, the one and only'],['παρὰ','from'],['πατρός,','the Father'],['πλήρης','full'],['χάριτος','of grace'],['καὶ','and'],['ἀληθείας.','of truth']]] ],
      en:'And the Word became flesh and dwelt among us, and we beheld his glory, glory as of the only-begotten from the Father, full of grace and truth.' },
    john3_16:{ ref:'John 3:16', title:'The old monk’s treasured scroll', need:10, verses:[
      ['16',[['Οὕτω','so, in this way'],['γὰρ','for'],['ἠγάπησεν','loved (aorist)'],['ὁ','the'],['Θεὸς','God'],['τὸν','the'],['κόσμον,','world (object)'],['ὥστε','that, so that'],['τὸν','the'],['υἱὸν','Son'],['αὐτοῦ','his'],['τὸν','the'],['μονογενῆ','only-begotten, one and only'],['ἔδωκεν,','he gave (aorist)'],['ἵνα','so that'],['πᾶς','everyone'],['ὁ','the one'],['πιστεύων','believing — who believes'],['εἰς','into, in'],['αὐτὸν','him'],['μὴ','not'],['ἀπόληται','should perish'],['ἀλλ᾽','but'],['ἔχῃ','should have'],['ζωὴν','life'],['αἰώνιον.','eternal']]] ],
      en:'For God so loved the world that he gave his only-begotten Son, so that everyone who believes in him should not perish but have eternal life.' } };
  // ── V96: lessons 11–14, past John 1 — plurals, “my/your/our”, commands and prayers, the future and the -ing words ──
  const MORE2=[
    { id:'l11', title:'Many — the Plural', reward:300,
      intro:['“One word, one shepherd, one sheep — that was easy. But the Lord said ‘our Father in the heavens’, not ‘heaven’. Today: many.”'],
      teach:()=>`<p class="gm-intro">In the plural, “the” and the endings change again. λόγος in the plural:</p>`
        +rows([['οἱ λόγοι','the words (subject)'],['τῶν λόγων','of the words'],['τοῖς λόγοις','to / in the words'],['τοὺς λόγους','the words (object)']])
        +`<div class="gm-sec">ἡμέρα, “day”, in the plural</div>`+rows([['αἱ ἡμέραι','the days (subject)'],['τῶν ἡμερῶν','of the days'],['ταῖς ἡμέραις','to / in the days'],['τὰς ἡμέρας','the days (object)']])
        +`<div class="gm-sec">Neuters end in -α in the plural</div>`+rows([['τὰ ἔργα','the works'],['τὰ πρόβατα','the sheep']])
        +`<p>Notice <b>τῶν</b> — “of the” — is the same for every kind of noun: ${gk('ἡ βασιλεία τῶν οὐρανῶν')}, <i>the kingdom of the heavens</i>.</p>`
        +`<div class="gm-sec">New words</div>`+rows([['βασιλεία','kingdom'],['πρόβατον','sheep'],['ὄνομα','name'],['πατήρ','father <span class="ds">(πάτερ: “O Father!”)</span>']]),
      quiz:pool([['οἱ λόγοι','the words (the subject)','the word (the subject)','of the words','to the words'],['τῶν οὐρανῶν','of the heavens','the heavens (the subject)','in heaven','to the heavens'],['ἐν τοῖς οὐρανοῖς','in the heavens','of the heavens','into heaven','the heavens (the object)'],
        ['τοὺς ἀνθρώπους','the men (the object)','the man (the object)','of the men','the men (the subject)'],['τὰ πρόβατα','the sheep (many)','the sheep (one)','of the sheep','the shepherd'],['ἡ βασιλεία τῶν οὐρανῶν','the kingdom of the heavens','the heavens of the kingdom','the king of heaven','in the kingdom of heaven'],
        ['αἱ ἡμέραι','the days','the day','of the days','the hours'],['Which is “of the” in the plural, for every kind of noun?','τῶν','τοῖς','οἱ','τάς'],['βασιλεία','kingdom','king','name','sheep'],['πατήρ','father','son','shepherd','name'],['ὄνομα','name','word','kingdom','father'],
        ['τῶν προβάτων','of the sheep','the sheep (the subject)','to the sheep','the shepherd']]) },
    { id:'l12', title:'My, Your, Our', reward:300,
      intro:['“Our Father. Your name. Our bread. The prayer the Lord taught is full of these little words — let us learn them, and then you can pray it as the disciples first heard it.”'],
      teach:()=>`<p class="gm-intro">“My”, “your” and “our” come <b>after</b> the noun in Greek: ${gk('τὸ ὄνομά σου')} is “the name of you” — <i>your name</i>.</p>`
        +rows([['μου','my'],['σου','your (one person)'],['αὐτοῦ','his'],['ἡμῶν','our'],['ὑμῶν','your (you all)'],['αὐτῶν','their']])
        +`<div class="gm-sec">Us and you all</div>`+rows([['ἡμεῖς','we'],['ἡμῖν','to us'],['ἡμᾶς','us'],['ὑμεῖς','you (all)'],['ὑμᾶς','you (all, object)']])
        +`<div class="gm-sec">New words</div>`+rows([['ἄρτος','bread'],['σήμερον','today'],['ὅτι','because; that'],['ἀπό','from (+ genitive)'],['πονηρός','evil'],['ὡς','as, like']])
        +`<p class="gm-hint">${gk('Πάτερ ἡμῶν ὁ ἐν τοῖς οὐρανοῖς')} — <i>Our Father, the one in the heavens.</i></p>`,
      quiz:pool([['σου','your (one person)','my','our','his'],['μου','my','your','our','their'],['ἡμῶν','our','your (you all)','their','my'],['ὑμῶν','your (you all)','our','their','his'],['αὐτῶν','their','his','our','your'],['ἡμᾶς','us','we','our','to us'],
        ['Πάτερ ἡμῶν','Our Father','My Father','Your Father','Their father'],['τὸ ὄνομά σου','your name','my name','his name','our name'],['ἄρτος','bread','water','name','day'],['σήμερον','today','tomorrow','again','always'],['ὅτι','because; that','but','and','so that'],
        ['ἀπὸ τοῦ πονηροῦ','from the evil one','into evil','with the evil one','without evil']]) },
    { id:'l13', title:'Commands and Prayers', reward:300,
      intro:['“When you pray, you ask; when a king speaks, he commands. Greek has a mood for both — the imperative. Let it come! Give! Forgive! Behold!”'],
      teach:()=>`<p class="gm-intro">The <b>imperative</b> tells or asks someone to do something. Spoken to “you” it’s simply “Do it!” — spoken of “him/it” it’s “Let it…”.</p>`
        +rows([['δός','give!'],['ἄφες','forgive!, let go!'],['ῥῦσαι','deliver!, rescue!'],['ἴδε','look!, behold!'],['ἀκολούθει','follow!'],['προσεύχεσθε','pray! (you all)']])
        +`<div class="gm-sec">“Let it…” — for him, her or it</div>`+rows([['ἐλθέτω','let it come'],['γενηθήτω','let it be done'],['ἁγιασθήτω','let it be hallowed (made holy)']])
        +`<div class="gm-sec">“Do not…”</div><p>For “don’t”, Greek uses <b>μή</b> (not οὐ): ${gk('μὴ εἰσενέγκῃς ἡμᾶς')} — <i>do not lead us</i>.</p>`
        +`<div class="gm-sec">New words</div>`+rows([['θέλημα','will (what someone wants)'],['γῆ','earth, land'],['ἐπί','on (+ genitive)'],['πειρασμός','temptation, testing'],['ὀφείλημα','debt']]),
      quiz:pool([['δός','give!','gave','he gives','to give'],['ἄφες','forgive!','forgave','he forgives','forgiveness'],['ῥῦσαι','deliver! (rescue!)','delivered','he delivers','deliverance'],['ἴδε','behold! (look!)','he saw','idea','he sees'],
        ['ἐλθέτω ἡ βασιλεία σου','let your kingdom come','your kingdom came','your kingdom will not come','the king is coming'],['γενηθήτω τὸ θέλημά σου','let your will be done','your will was done','do your will','your will is done'],['ἁγιασθήτω τὸ ὄνομά σου','let your name be hallowed','your name was holy','say your name','your holy name'],
        ['μὴ εἰσενέγκῃς ἡμᾶς εἰς πειρασμόν','do not lead us into temptation','lead us out of temptation','we were not tempted','do not tempt us to lead'],['For “do not”, Greek uses…','μή','οὐ','ἀλλά','καί'],['θέλημα','will (what is wanted)','kingdom','name','debt'],['γῆ','earth','heaven','sea','bread'],
        ['ὡς ἐν οὐρανῷ καὶ ἐπὶ τῆς γῆς','as in heaven, so also on earth','in heaven and not on earth','from heaven to earth','heaven is on earth']]) },
    { id:'l14', title:'Things to Come, and Those Who Do', reward:400,
      intro:['“Two last keys for now. The future — what will be. And the -ing words — ‘the one believing’, ‘the one following’ — that Greek loves so much.”','“With these, the great ‘I am’ sayings of John are open to you.”'],
      teach:()=>`<p class="gm-intro">The <b>future</b> often adds a <b>σ</b> to the stem: λύω, “I loose” → λύ<b>σ</b>ω, “I <i>will</i> loose”. Some common verbs have their own future forms — learn them as they come:</p>`
        +rows([['λύσω','I will loose'],['ζήσεται','he will live'],['ἕξει','he will have'],['γνώσεσθε','you (all) will know'],['ἐλευθερώσει','he / it will set free'],['ὄψονται','they will see'],['κληθήσονται','they will be called']])
        +`<div class="gm-sec">The -ing words: participles</div><p>A <b>participle</b> is a verb used like an adjective or a noun. With “the” in front it means “the one who…”:</p>`
        +rows([['ὁ πιστεύων','the one believing — whoever believes'],['ὁ ἀκολουθῶν','the one following — whoever follows'],['ὁ αἴρων','the one taking away'],['λέγων','saying'],['ἐρχόμενον','coming']])
        +`<div class="gm-sec">New words</div>`+rows([['μακάριος','blessed, happy'],['ποιμήν','shepherd'],['καλός','good, fine'],['ψυχή','life, soul'],['ἀνάστασις','resurrection'],['ἀμνός','lamb'],['ἁμαρτία','sin']]),
      quiz:pool([['λύσω','I will loose','I loose','I loosed','loose!'],['ζήσεται','he will live','he lives','he lived','life'],['ἕξει','he will have','he has','he had','have!'],['γνώσεσθε','you (all) will know','you know','you knew','know!'],['ὄψονται','they will see','they see','they saw','see!'],
        ['ὁ πιστεύων','the one who believes','he believed','he will believe','believe!'],['ὁ ἀκολουθῶν ἐμοί','whoever follows me','I followed him','follow me!','he will follow me'],['The σ in λύσω marks…','the future','the past','a plural','a command'],
        ['μακάριοι','blessed (ones)','sons','sheep','poor'],['ποιμήν','shepherd','sheep','father','lamb'],['ἀνάστασις','resurrection','life','truth','glory'],['ὁ ἀμνὸς τοῦ θεοῦ','the Lamb of God','the shepherd of God','the Son of God','the name of God']]) } ];
  MORE2.forEach(l=>LESSONS.push(l));
  Object.assign(PASS,{
    matt6a:{ ref:'Matthew 6:9–10', title:'The Lord’s Prayer, I', need:13, verses:[
      ['9',[['οὕτως','in this way'],['οὖν','therefore, then'],['προσεύχεσθε','pray! (you all)'],['ὑμεῖς·','you'],['Πάτερ','Father (calling out to him)'],['ἡμῶν','our'],['ὁ','the one'],['ἐν','in'],['τοῖς','the'],['οὐρανοῖς,','heavens'],['ἁγιασθήτω','let it be hallowed, made holy'],['τὸ','the'],['ὄνομά','name'],['σου.','your']]],
      ['10',[['ἐλθέτω','let it come'],['ἡ','the'],['βασιλεία','kingdom'],['σου.','your'],['γενηθήτω','let it be done'],['τὸ','the'],['θέλημά','will'],['σου,','your'],['ὡς','as'],['ἐν','in'],['οὐρανῷ','heaven'],['καὶ','also'],['ἐπὶ','on'],['τῆς','the'],['γῆς.','earth']]] ],
      en:'In this way, then, pray: Our Father, who is in the heavens, let your name be hallowed. Let your kingdom come. Let your will be done, as in heaven, so also on earth.' },
    matt6b:{ ref:'Matthew 6:11–13', title:'The Lord’s Prayer, II', need:13, verses:[
      ['11',[['τὸν','the'],['ἄρτον','bread'],['ἡμῶν','our'],['τὸν','the'],['ἐπιούσιον','daily — for the coming day (a rare word)'],['δὸς','give!'],['ἡμῖν','to us'],['σήμερον.','today']]],
      ['12',[['καὶ','and'],['ἄφες','forgive!'],['ἡμῖν','us (to us)'],['τὰ','the'],['ὀφειλήματα','debts'],['ἡμῶν,','our'],['ὡς','as'],['καὶ','also'],['ἡμεῖς','we'],['ἀφίεμεν','forgive'],['τοῖς','the'],['ὀφειλέταις','debtors'],['ἡμῶν.','our']]],
      ['13',[['καὶ','and'],['μὴ','not'],['εἰσενέγκῃς','lead, bring (μή + this: “do not lead”)'],['ἡμᾶς','us'],['εἰς','into'],['πειρασμόν,','temptation, testing'],['ἀλλὰ','but'],['ῥῦσαι','deliver!, rescue!'],['ἡμᾶς','us'],['ἀπὸ','from'],['τοῦ','the'],['πονηροῦ.','evil one, evil']]] ],
      en:'Give us today our daily bread. And forgive us our debts, as we also forgive our debtors. And do not lead us into temptation, but deliver us from the evil one.' },
    john8_12:{ ref:'John 8:12', title:'The light of the world', need:11, verses:[
      ['12',[['Πάλιν','again'],['οὖν','then'],['αὐτοῖς','to them'],['ὁ','the'],['Ἰησοῦς','Jesus'],['ἐλάλησε','spoke (aorist)'],['λέγων,','saying'],['Ἐγώ','I'],['εἰμι','am'],['τὸ','the'],['φῶς','light'],['τοῦ','of the'],['κόσμου·','world'],['ὁ','the one'],['ἀκολουθῶν','following — whoever follows'],['ἐμοὶ','me'],['οὐ','not'],['μὴ','not — οὐ μή: never, by no means'],['περιπατήσῃ','will walk'],['ἐν','in'],['τῇ','the'],['σκοτίᾳ,','darkness'],['ἀλλ᾽','but'],['ἕξει','will have (future)'],['τὸ','the'],['φῶς','light'],['τῆς','of the'],['ζωῆς.','life']]] ],
      en:'Then Jesus spoke to them again, saying, “I am the light of the world; whoever follows me will never walk in the darkness, but will have the light of life.”' },
    john10_11:{ ref:'John 10:11', title:'The good shepherd', need:12, verses:[
      ['11',[['ἐγώ','I'],['εἰμι','am'],['ὁ','the'],['ποιμὴν','shepherd'],['ὁ','the'],['καλός·','good'],['ὁ','the'],['ποιμὴν','shepherd'],['ὁ','the'],['καλὸς','good'],['τὴν','the'],['ψυχὴν','life, soul'],['αὐτοῦ','his'],['τίθησιν','lays down'],['ὑπὲρ','for, on behalf of'],['τῶν','the'],['προβάτων.','sheep']]] ],
      en:'I am the good shepherd; the good shepherd lays down his life for the sheep.' },
    john11_25:{ ref:'John 11:25', title:'The resurrection and the life', need:14, verses:[
      ['25',[['εἶπεν','said (aorist)'],['αὐτῇ','to her'],['ὁ','the'],['Ἰησοῦς,','Jesus'],['Ἐγώ','I'],['εἰμι','am'],['ἡ','the'],['ἀνάστασις','resurrection'],['καὶ','and'],['ἡ','the'],['ζωή·','life'],['ὁ','the one'],['πιστεύων','believing — whoever believes'],['εἰς','into, in'],['ἐμέ,','me'],['κἂν','even if (καὶ ἐάν)'],['ἀποθάνῃ,','he dies'],['ζήσεται·','will live (future)']]] ],
      en:'Jesus said to her, “I am the resurrection and the life; whoever believes in me, even if he dies, will live.”' },
    matt5_3:{ ref:'Matthew 5:3', title:'The first blessing', need:12, verses:[
      ['3',[['Μακάριοι','blessed'],['οἱ','the'],['πτωχοὶ','poor'],['τῷ','in the'],['πνεύματι,','spirit'],['ὅτι','because'],['αὐτῶν','theirs (of them)'],['ἐστιν','is'],['ἡ','the'],['βασιλεία','kingdom'],['τῶν','of the'],['οὐρανῶν.','heavens']]] ],
      en:'Blessed are the poor in spirit, because theirs is the kingdom of the heavens.' },
    john1_29:{ ref:'John 1:29', title:'Behold, the Lamb', need:14, verses:[
      ['29',[['Τῇ','on the'],['ἐπαύριον','next day'],['βλέπει','he sees'],['τὸν','the'],['Ἰησοῦν','Jesus (object)'],['ἐρχόμενον','coming'],['πρὸς','toward'],['αὐτὸν','him'],['καὶ','and'],['λέγει,','says'],['Ἴδε,','behold!, look!'],['ὁ','the'],['ἀμνὸς','lamb'],['τοῦ','of the'],['Θεοῦ','God'],['ὁ','the one'],['αἴρων','taking away'],['τὴν','the'],['ἁμαρτίαν','sin'],['τοῦ','of the'],['κόσμου.','world']]] ],
      en:'The next day he sees Jesus coming toward him and says, “Behold, the Lamb of God, who takes away the sin of the world.”' },
    matt5_8:{ ref:'Matthew 5:8–9', title:'The pure in heart, and the peacemakers', need:14, verses:[
      ['8',[['μακάριοι','blessed'],['οἱ','the'],['καθαροὶ','pure, clean'],['τῇ','in the'],['καρδίᾳ,','heart'],['ὅτι','because'],['αὐτοὶ','they'],['τὸν','the'],['Θεὸν','God (object)'],['ὄψονται.','will see (future)']]],
      ['9',[['μακάριοι','blessed'],['οἱ','the'],['εἰρηνοποιοί,','peacemakers'],['ὅτι','because'],['αὐτοὶ','they'],['υἱοὶ','sons'],['Θεοῦ','of God'],['κληθήσονται.','will be called (future)']]] ],
      en:'Blessed are the pure in heart, because they will see God. Blessed are the peacemakers, because they will be called sons of God.' },
    john8_32:{ ref:'John 8:32', title:'The truth will set you free', need:14, verses:[
      ['32',[['καὶ','and'],['γνώσεσθε','you (all) will know (future)'],['τὴν','the'],['ἀλήθειαν,','truth (object)'],['καὶ','and'],['ἡ','the'],['ἀλήθεια','truth'],['ἐλευθερώσει','will set free (future)'],['ὑμᾶς.','you (all)']]] ],
      en:'And you will know the truth, and the truth will set you free.' },
    john11_35:{ ref:'John 11:35', title:'The shortest verse', need:9, verses:[
      ['35',[['ἐδάκρυσεν','wept, shed tears (aorist — see the augment ἐ-)'],['ὁ','the'],['Ἰησοῦς.','Jesus']]] ],
      en:'Jesus wept.' } });
  // a leaf on a lectern in each cleansed sanctuary's east aisle, one passage to a town
  const SANCT_PASS=['matt6a','matt6b','john8_12','john10_11','john11_25','matt5_3','john1_29','matt5_8','john8_32','john11_35'];
  const sanctPassage=t=>typeof t==='number'||/^\d+$/.test(String(t))?SANCT_PASS[+t]||null:null;
  // the reader: every word a button — tap it for its meaning; then show the whole in English
  let RD=null;
  function readerHtml(id,o){ const p=PASS[id]; let h=o&&o.teach?`<p class="gm-intro">${UI.esc(p.ref)}. Tap any word for its meaning; when you have it, tap “What it says”.</p>`:`<p class="gm-intro">${UI.esc(p.title)} — <b>${UI.esc(p.ref)}</b></p>`;
    const sel=RD&&RD.id===id?RD.sel:null; if(sel){ const [v,i]=sel, w=p.verses[v][1][i]; h+=`<div class="gm-note" style="text-align:center">${big(w[0].replace(/[,.;·]$/,''))}<br>${UI.esc(w[1])}</div>`; }
    h+=`<div lang="el" style="line-height:2.1;margin:8px 0">`+p.verses.map(([n,ws],v)=>`<sup class="ds">${n}</sup> `+ws.map(([g],i)=>`<button class="gm-item" style="display:inline-flex;width:auto;margin:2px;padding:2px 7px;${sel&&sel[0]===v&&sel[1]===i?'border-color:#e8c766':''}" data-act="w:${v}:${i}">${gk(g)}</button>`).join('')).join(' ')+`</div>`;
    h+=RD&&RD.id===id&&RD.en?`<p class="gm-note"><i>${UI.esc(p.en)}</i></p><p class="gm-hint">Greek: Robinson–Pierpont Byzantine text (public domain). English: KLK’s own, word for word.</p>`:`<button class="gm-item" data-act="en"><span>✦ What it says</span></button>`;
    return h; }
  function reader(id,extra){ RD=RD&&RD.id===id?RD:{id,sel:null,en:false}; const p=PASS[id];
    UI.sheet({title:'📜 '+p.ref,html:readerHtml(id,extra)+(extra&&extra.after||''),keepScroll:true,act:a=>{ if(a.startsWith('w:')){ const [,v,i]=a.split(':'); RD.sel=[+v,+i]; reader(id,extra); } else if(a==='en'){ RD.en=true; reader(id,extra); } else if(extra&&extra.act) extra.act(a); },close:()=>{ RD=null; }}); }
  // a manuscript found in the world: read it if your Greek is good enough (the first reading is rewarded)
  function readFound(id){ const p=PASS[id], g=st(); g.read=g.read||{};
    if(level()<p.need){ g.tried=g.tried||{}; if(!g.tried[id]){ g.tried[id]=jday(); GAME.save(); } UI.sheet({title:'📜 An old manuscript',html:`<p class="gm-intro">${UI.esc(p.title)}. The letters are Greek — you can make out a few of them — but not enough to read it.</p><div lang="el" style="text-align:center;margin:10px 0;opacity:.75">${big(p.verses[0][1].slice(0,6).map(w=>w[0]).join(' ')+' …')}</div><p class="gm-hint">You need Greek level <b>${p.need}</b> (you have ${level()}). Old Man Mario, east of the Homestead, can teach you.</p>`}); return; }
    const first=!g.read[id]; RD=null; reader(id); if(first){ const tr=(g.tried||{})[id]; jw(`I read ${p.ref} for myself today, without anyone’s help: “${p.en}”`+(tr?` On day ${tr} I stood before this same page and could make out only a few letters.`:''),{once:'ms:'+id}); }
    if(first){ g.read[id]=true; if(FOUND().every(k=>g.read[k])&&!g.finaleReady){ g.finaleReady=true; setTimeout(()=>{ jw('That is the last of them. Every leaf Mario and Petra hid, found and read. I should go and tell him.',{once:'allfound'}); UI.toast('📜 Every hidden leaf is found. Old Man Mario should hear of this.',3600); },3600); } const r=GAME.gainXp(150); GAME.addGold(100); GAME.changed(); GAME.save(); UI.toast(`📜 You read ${p.ref} for yourself! +150 XP · +100 gold`,3200); if(r&&r.up) setTimeout(()=>UI.toast(`Level ${S().level}! A skill point to spend.`,2400),3400); } }
  // set a manuscript somewhere: a little stand with a glowing scroll, and a Read spot
  function place(lv,par,an,x,z,id,o){ o=o||{}; const g=group(x,o.y||0,z,par);
    if(!o.noStand){ Cy(0.06,0.09,0.75,6,0x6a4c30,0,0,0,g); const top=B(0.42,0.04,0.3,0x5a4028,0,0.75,0,g); top.rotation.x=-0.35; }
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.22),parchment(['ΕΝ ΑΡΧΗ','Ο ΛΟΓΟΣ'],128,84)); sc.rotation.x=-Math.PI/2-0.35*(o.noStand?0:1); sc.position.y=o.noStand?0.02:0.8; g.add(sc);
    const gl=new THREE.Mesh(new THREE.SphereGeometry(0.06,6,4),new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:0.8})); gl.position.y=(o.noStand?0.02:0.8)+0.25; g.add(gl);
    an.push(t=>{ const read=!!((st().read||{})[id]); gl.visible=!read; gl.position.y=(o.noStand?0.02:0.8)+0.25+Math.sin(t*2.2)*0.06; });
    lv.spots.push({x,z,r:o.r||1.0,label:'Read',who:'An old manuscript',action:()=>readFound(id)}); return g; }
  const S=()=>GAME.S, st=()=>{ const s=S(); s.greek=s.greek||{done:[],best:{}}; s.greek.done=s.greek.done||[]; s.greek.best=s.greek.best||{}; return s.greek; };
  const level=()=>st().done.length, nextL=()=>LESSONS.find(l=>!st().done.includes(l.id));
  const say=(lines,then)=>ENGINE.speak('Old Man Mario',lines,null,then);
  // V97: what the knight writes in his journal after each lesson
  const JLINE={l1:'Mario made me say the first twelve letters aloud until the lamp guttered. Lambda looks like a little tent. I will remember it that way.',
    l2:'Alpha to omega, all twenty-four. Mario tapped the last letter and said, “You know who called Himself this.” I did.',
    l3:'Breathing marks — a rough breath before ὁ, a smooth one before ἐν. Tonight I read “in the beginning … the Word” with my own eyes.',
    l4:'Endings, not word order. A Greek word can stand anywhere in the sentence and still be known by its work. There is a kind of freedom in that.',
    l5:'εἰμί — “I am.” Mario was quiet for a while after he said it.',
    l6:'πιστεύω — I believe. Mario says it is a verb: something one does, not only something one holds.',
    l7:'ζωή, ἀγάπη, ἀλήθεια — life, love, truth. The most beautiful words all seem to wear the same ending.',
    l8:'Through him. Without him. With God. The smallest words held the first verses of John together.',
    l9:'The past has a doorway: a small ἐ at the front of a word. ἐγένετο — it came to be.',
    l10:'Tonight I read the first five verses of John in the tongue he wrote them in. The light shines in the darkness. Mario said nothing. He poured us both tea.',
    l11:'Plurals. “Our Father in the heavens” — not one heaven, but heavens.',
    l12:'μου, σου, ἡμῶν — my, your, our. The Lord taught us to pray “our”, never “my”.',
    l13:'Let Your kingdom come; let Your will be done. Mario says that in prayer the command becomes a plea — a servant asking the King for what the King has promised.',
    l14:'ὁ πιστεύων — “the one who believes.” Not one who once believed: one who goes on believing. Mario underlined it twice.'};
  const jw=(t,o)=>{ if(typeof JOURNAL!=='undefined') JOURNAL.write(t,o); };

  // ── the test ──
  let T=null;
  function quiz(lesson,practice){ const qs=practice?shuffle(LESSONS.filter(l=>st().done.includes(l.id)).flatMap(l=>l.quiz())).slice(0,8):lesson.quiz(); T={lesson,practice,qs,i:0,right:0,picked:null}; drawQ(); }
  function drawQ(){ const q=T.qs[T.i], n=T.qs.length; let h=`<p class="gm-hint">Question ${T.i+1} of ${n} · ${T.right} right so far</p><div style="text-align:center;font-size:17px;margin:10px 0 14px">${q.q}</div>`;
    q.opts.forEach((o,k)=>{ const show=T.picked!==null, ok=o===q.a, mine=T.picked===k; const st2=show?(ok?'background:#1f4a2a;border-color:#6fdf8a':mine?'background:#4a1f24;border-color:#ff6a7a':''):'';
      h+=`<button class="gm-item" style="justify-content:center;${st2}" data-act="o:${k}" ${show?'disabled':''}>${q.glyph?big(UI.esc(o)):UI.esc(o)}</button>`; });
    if(T.picked!==null) h+=`<p class="gm-note">${q.opts[T.picked]===q.a?'✓ Right!':'✗ It’s <b>'+UI.esc(q.a)+'</b>.'}</p><button class="gm-item" data-act="next"><span>${T.i+1<n?'Next question ▸':'See how you did ▸'}</span></button>`;
    UI.sheet({title:T.practice?'📜 Practice with Mario':'📜 '+T.lesson.title,html:h,act:a=>{ if(a==='next'){ T.i++; T.picked=null; if(T.i>=n) finish(); else drawQ(); return; }
      if(a.startsWith('o:')&&T.picked===null){ T.picked=+a.slice(2); if(q.opts[T.picked]===q.a) T.right++; drawQ(); } },close:()=>{ T=null; }}); }
  // ── V98: Old Man Mario's own story — a memory after each lesson, the first time (told over the lamp), and a last scene once
  //    every leaf in the realm has been read. The leaves you find are the pages he and Petra hid when the darkness came. ──
  const MEM=[
    ['“When I was a boy I swept the floor of the scriptorium in Stormgate. The ink got into everything. I never got it out of my hands since.”','As a boy, Mario swept the floor of the scriptorium in Stormgate, he told me. The ink never came out of his hands.'],
    ['“My master, Brother Lucan, said the omega is the hardest letter to write well. ‘It must close like a door,’ he said. ‘Gently.’ I practised it for a year.”','Mario’s master, Brother Lucan, said an omega must close like a door — gently. Mario practised it for a year.'],
    ['“There was a girl who painted the gold into the first letter of every page. Petra. Her Ἐ at the start of John had a vine growing through it. I wrote the words; she made them shine.”','Mario spoke of Petra, who painted gold into the first letters. “I wrote the words; she made them shine.”'],
    ['“We copied a book for every chapel in the realm. I carried some of them myself, on a mule called Bartholomew, who did not care for bridges.”','They made a book for every chapel in the realm. Mario carried some himself, on a mule called Bartholomew who did not care for bridges.'],
    ['“Brother Lucan used to say, ‘We do not make the Word, Mario. We only carry it from one page to the next.’ I thought it was a small work. I know better now.”','“We do not make the Word. We only carry it from one page to the next.” Mario says he once thought it a small work.'],
    ['“Petra and I argued about everything. A breathing mark. A comma. Whether a mule can be stubborn on purpose. She was usually right. About the mule, especially.”','Mario and Petra argued about everything — breathing marks, commas, the mule. He says she was usually right.'],
    ['“Then the darkness came over the chapels. One by one they went quiet. People stopped coming for books.”','Mario told me how the chapels went quiet one by one when the darkness came, and no one came for books any more.'],
    ['“When they came to burn the scriptorium, Lucan sent us out the back with as many leaves as we could carry. He stayed. He said someone had to finish the page he was on.”','Brother Lucan stayed behind when they burned the scriptorium, “to finish the page he was on.” Mario did not say anything for a long time after.'],
    ['“Petra and I divided the pages and hid them. In walls. In caves. With friends — a sage in a hidden glade, a hermit in the north. ‘Somewhere the darkness won’t think to look,’ she said.”','The leaves I have been finding: Mario and Petra hid them, in walls and caves and with friends, “somewhere the darkness won’t think to look.”'],
    ['“The light shines in the darkness, and the darkness did not overcome it. Petra wrote that inside the flap of my satchel, the morning we parted. I still carry it.”','Petra wrote John 1:5 inside Mario’s satchel the morning they parted. He showed me. The ink has faded to brown.'],
    ['“She went south with her half of the pages. I waited for a letter for many years. None came. — Some of the leaves you have found are hers. I would know her gold anywhere.”','Petra went south with her half of the pages. No letter ever came. Mario says he knows her gold anywhere.'],
    ['“I built this hut at the wood’s edge because from here you can see the road from the south. Old men keep foolish habits.”','Mario built his hut where he can watch the road from the south. “Old men keep foolish habits,” he said.'],
    ['“I prayed for years that the pages would be found. I never thought to pray that someone would come who could read them. God is kinder than my prayers.”','“God is kinder than my prayers,” Mario said tonight. I think he meant me.'],
    ['“There. I have taught you everything I was taught. Lucan would say: now you carry it.”','Mario has taught me everything he was taught. “Now you carry it,” he said, the way his master said it to him.'] ];
  const FINALE=['“You have found them. Every leaf.”','He turns the last of them toward the lamp, and stops.','“There is writing in the margin. I never saw it — my eyes are not what they were.”',
    '“‘For M., if ever you come this far. I kept them safe. — P.’”','For a long while he says nothing. Then he laughs, very softly.','“She stayed a winter with the old monk, you know. Copying by his fire. Then she went on toward the sea. That was many, many years ago.”',
    '“So. She finished her page too.”','He presses something into your hand: a slender pen, its nib gilded. “Hers. She left it in my satchel. It should go on with someone who reads.”','“Thank you, knight. Now — sit. I will make tea.”'];
  function memory(i){ const m=MEM[i]; if(!m) return; const g=st(); g.mem=g.mem||{}; if(g.mem[i]) return; g.mem[i]=true; GAME.save();
    setTimeout(()=>ENGINE.speak('Old Man Mario',['He sets down his pen and looks at the lamp for a moment.',m[0]],null,()=>jw(m[1],{once:'mem:'+i,place:'Old Man Mario’s Hut'})),300); }
  const FOUND=()=>Object.keys(PASS).filter(id=>id!=='john1');
  const jday=()=>(S()&&S().jDay)||1;
  function finish(){ const t=T, n=t.qs.length, r=t.right; T=null; UI.close();
    if(t.practice){ const g=r*5; if(g) GAME.addGold(g); GAME.changed(); GAME.save(); say([`“${r} of ${n}. ${r>=7?'Your old teacher is proud.':r>=5?'Good — the letters are settling in.':'Hm. Again tomorrow, eh? Little and often.'}”`,g?`🪙 ${g} gold for your trouble.`:''].filter(Boolean)); return; }
    const g=st(), L=t.lesson; g.best[L.id]=Math.max(g.best[L.id]||0,r);
    if(r>=6){ const first=!g.done.includes(L.id); if(first){ g.done.push(L.id); { let t=JLINE[L.id]||('Another lesson learned: '+L.title+'.'); if(L.id==='l10'&&g.metDay){ const n=jday()-g.metDay; t+=n>=1?` It has been ${n} day${n>1?'s':''} since he first sat me down with the alphabet.`:' I only met him this morning, it feels like.'; } jw(t,{once:'gk:'+L.id,place:'Old Man Mario’s Hut'}); } const res=GAME.gainXp(L.reward); if(res&&res.up) setTimeout(()=>UI.toast(`Level ${S().level}! A skill point to spend.`,2400),1200); }
      GAME.changed(); GAME.save(); const nx=nextL();
      say([`“${r} of ${n}! ${r===n?'Every one!':'Well done.'} ${first?'That lesson is yours now — no one can take it from you.':''}”`,first?`📜 Greek level ${level()} · +${L.reward} XP`:'',nx?`“Come back when you are ready for the next: ${nx.title}.”`:'“That is all I have written for now. I am working on the next lessons — and I hear there are old manuscripts in this realm that want reading…”'].filter(Boolean),first?()=>memory(LESSONS.indexOf(L)):undefined); }
    else say([`“${r} of ${n}. Not yet — you need six. No shame in it; I failed my first test too, a very long time ago.”`,'“Look over the page again, say them aloud, and try once more.”']); }
  // ── talking to Mario ──
  function lessonSheet(L){ const btn=`<button class="gm-item" data-act="test"><span>✎ I’m ready — test me (6 of 8 to pass)</span></button>`;
    if(L.id==='l10'){ RD=null; reader('john1',{teach:true,after:btn,act:a=>{ if(a==='test') quiz(L); }}); return; }
    UI.sheet({title:'📜 '+L.title,html:L.teach()+`<button class="gm-item" data-act="test"><span>✎ I’m ready — test me (6 of 8 to pass)</span></button>`,act:a=>{ if(a==='test') quiz(L); }}); }
  function talk(){ const g=st(), nx=nextL();
    if(!g.met){ g.met=true; g.metDay=jday(); g.lastDay=jday(); jw('An old man in a hut at the wood’s edge offered to teach me Greek, so that I could read the Scriptures as the apostles wrote them. He calls himself Old Man Mario. His hands are stained with ink to the wrist.',{once:'mario',place:'Old Man Mario’s Hut'}); GAME.save(); say(['“Eh? A visitor! Come in, come in, mind the scrolls.”','“They call me Old Man Mario. I have spent my life copying the old words — the Scriptures as the apostles wrote them, in Greek.”','“There are writings in this realm older than any king — and no one left who can read them. You have done great things with a sword, knight. Shall I teach you to do something with your eyes?”'],menu); return; }
    const gap=jday()-(g.lastDay||jday()); g.lastDay=jday();
    if(g.finaleReady&&!g.finaleDone){ g.finaleDone=true; g.pen=true; GAME.save(); ENGINE.speak('Old Man Mario',FINALE,null,()=>{ const r=GAME.gainXp(500); GAME.changed(); GAME.save(); UI.toast('✒ Petra’s gilded pen · +500 XP',3200);
        jw('I brought Mario word that every leaf is found. In the margin of one was a note in Petra’s hand: “For M., if ever you come this far. I kept them safe. — P.” He gave me her pen. Then he made tea, and we did not talk about anything at all for a long while, and it was good.',{once:'finale',place:'Old Man Mario’s Hut'}); if(r&&r.up) setTimeout(()=>UI.toast(`Level ${S().level}! A skill point to spend.`,2400),3400); }); return; }
    if(gap>=3){ const L0=['“Ah — there you are. I wondered whether the road had kept you.”','“Back again! The tea has gone cold twice waiting for you. Sit, sit.”','“You look tired, knight. Good. Tired people learn well, if they sit down first.”']; ENGINE.speak('Old Man Mario',[L0[(Math.random()*L0.length)|0]],null,menu); return; }
    menu(); }
  function menu(){ const g=st(), nx=nextL(); let h=`<p class="gm-intro">Old Man Mario taps the open scroll on his desk. “Koine Greek — the common tongue, the language of the New Testament. Little and often, that is the way.”</p><p class="gm-hint">📜 Your Greek level: <b>${level()}</b> of ${LESSONS.length}</p>`;
    if(nx) h+=`<button class="gm-item" data-act="next"><span>▶ Next lesson: ${UI.esc(nx.title)}</span></button>`;
    LESSONS.forEach((L,i)=>{ if(g.done.includes(L.id)) h+=`<button class="gm-item" data-act="re:${i}"><span>✓ ${UI.esc(L.title)} <span class="ds">study again · best ${g.best[L.id]||0}/8</span></span></button>`; });
    { const rd=Object.keys(PASS).filter(id=>id==='john1'?g.done.includes('l10'):(g.read||{})[id]); if(rd.length){ h+=`<div class="gm-sec">📜 Manuscripts you have read</div>`; rd.forEach(id=>h+=`<button class="gm-item" data-act="rd:${id}"><span>${UI.esc(PASS[id].ref)} <span class="ds">${UI.esc(PASS[id].title)}</span></span></button>`); }
      const left=Object.keys(PASS).filter(id=>id!=='john1'&&!(g.read||{})[id]).length; if(left&&level()>=3) h+=`<p class="gm-hint">“There are old leaves out in the realm, knight — I have heard of one by Hearthvale’s chapel door, one where the old sage keeps his glade, and one in a hermit’s cave in the north. And every chapel you cleansed keeps a leaf on a lectern in its east aisle. Find them, and read them yourself.”</p>`; }
    { const ms=Object.keys(g.mem||{}).map(Number).sort((a,b)=>a-b); if(ms.length) h+=`<button class="gm-item" data-act="mem"><span>🕯 Sit with Mario a while <span class="ds">hear his stories again (${ms.length})</span></span></button>`; }
    if(g.pen) h+=`<p class="gm-hint">✒ Petra’s gilded pen rides at your belt.</p>`;
    if(level()) h+=`<button class="gm-item" data-act="prac"><span>✎ Practise what you know <span class="ds">8 questions · 5 gold a right answer</span></span></button>`;
    if(!nx) h+=`<p class="gm-hint">More lessons are coming — Mario is still writing them.</p>`;
    UI.sheet({title:'🕯 Old Man Mario',html:h,act:a=>{ if(a==='next'){ const L=nextL(); UI.close(); say(L.intro,()=>lessonSheet(L)); } else if(a==='prac') quiz(null,true); else if(a.startsWith('re:')) lessonSheet(LESSONS[+a.slice(3)]); else if(a.startsWith('rd:')){ RD=null; reader(a.slice(3)); } else if(a==='mem'){ UI.close(); const ms=Object.keys(g.mem||{}).map(Number).sort((x,y)=>x-y); ENGINE.speak('Old Man Mario',['He pours the tea and settles back.'].concat(ms.map(i=>MEM[i][0])),null,menu); } }}); }
  // ── a parchment painted with Greek uncials, for his desk and walls ──
  function parchment(lines,w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); const gr=x.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#efe0b8'); gr.addColorStop(1,'#d8c08a'); x.fillStyle=gr; x.fillRect(0,0,w,h);
    x.fillStyle='rgba(120,80,30,.15)'; for(let i=0;i<40;i++){ x.beginPath(); x.arc(Math.random()*w,Math.random()*h,Math.random()*6,0,7); x.fill(); }
    x.fillStyle='#3a2410'; x.font=`600 ${Math.round(h/(lines.length+1.6))}px 'Times New Roman',serif`; x.textAlign='center'; lines.forEach((l,i)=>x.fillText(l,w/2,(i+1.25)*h/(lines.length+1.1))); return new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}); }
  // ── the hut in the realm ──
  function hut(world,o){ const S0=S, x=o.x, z=o.z, gy=world.ground?world.ground(x,z):0, g=group(x,gy,z,world.scene);
    B(3.0,0.25,3.0,0x7a7468,0,0,0,g); B(2.8,1.7,2.8,0xd8c8a0,0,0.25,0,g);   // stone footing, limewashed walls
    [[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]].forEach(([a,b])=>B(0.18,1.75,0.18,0x5a4028,a,0.22,b,g));   // corner posts
    B(2.84,0.12,0.12,0x5a4028,0,1.4,1.42,g); B(0.12,0.12,2.84,0x5a4028,1.42,1.4,0,g); B(0.12,0.12,2.84,0x5a4028,-1.42,1.4,0,g);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(2.55,1.7,4),flat(0x9a8048)); roof.rotation.y=Math.PI/4; roof.position.y=2.75; g.add(roof);   // thatch
    const lip=new THREE.Mesh(new THREE.ConeGeometry(2.7,0.35,4,1,true),flat(0x8a7040)); lip.rotation.y=Math.PI/4; lip.position.y=2.05; g.add(lip);
    B(0.4,1.0,0.4,0x6a6458,0.8,2.4,-0.6,g);   // the chimney
    B(0.9,1.3,0.06,0x4a3020,0,0.25,1.42,g); B(0.08,0.08,0.04,0xe8c766,0.3,0.85,1.46,g);   // the door
    B(0.5,0.4,0.05,0x2a2a30,-0.95,1.0,1.42,g); B(0.42,0.32,0.04,glow(0xffd890),-0.95,1.04,1.44,g);   // a lit window
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.5),parchment(['Α Β Γ Δ','ΜΑΡΙΟΣ'],180,100)); sg.position.set(0.95,1.15,1.47); g.add(sg); B(0.04,1.2,0.04,0x5a4028,0.95,0,1.6,g);
    const lt=group(-0.6,1.5,1.55,g); B(0.14,0.2,0.14,glow(0xffc870),0,0,0,lt); B(0.18,0.04,0.18,0x2a2420,0,0.2,0,lt);
    B(1.0,0.08,0.3,0x6a4c30,-1.9,0.42,0.6,g); B(0.08,0.42,0.08,0x5a4028,-2.3,0,0.6,g); B(0.08,0.42,0.08,0x5a4028,-1.5,0,0.6,g);   // a bench outside
    const bk=Cy(0.22,0.18,0.35,8,0x8a6a3a,1.9,0,0.9,g); Cy(0.05,0.05,0.4,6,0xe8dcc0,1.85,0.3,0.85,g).rotation.z=0.3; Cy(0.05,0.05,0.4,6,0xe8dcc0,1.95,0.3,0.95,g).rotation.z=-0.2;   // a basket of scrolls
    const smoke=[]; for(let i=0;i<4;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.18,6,4),new THREE.MeshBasicMaterial({color:0xd8d8d8,transparent:true,opacity:0.3,depthWrite:false})); g.add(m); smoke.push(m); }
    world.anim.push(t=>{ if(!g.visible) return; smoke.forEach((m,i)=>{ const u=(t*0.25+i/4)%1; m.position.set(0.8+Math.sin(t+i)*0.15*u,2.9+u*1.6,-0.6); m.scale.setScalar(0.6+u*1.4); m.material.opacity=0.3*(1-u); }); });
    // solid when it stands; the door when it's yours
    const x0=x-1.5, x1=x+1.5, z0=z-1.5, z1=z+1.5, cm=world.canMove; let on=false;
    world.canMove=(fx,fz,tx,tz)=>{ if(on&&tx>x0-0.25&&tx<x1+0.25&&tz>z0-0.25&&tz<z1+0.25&&!(fx>x0-0.25&&fx<x1+0.25&&fz>z0-0.25&&fz<z1+0.25)) return false; return cm(fx,fz,tx,tz); };
    const door={x,z:z+2.0,r:1.2,label:'Enter',who:'Old Man Mario’s Hut',action:()=>ENGINE.go('marioHut')};
    world.anim.push(()=>{ const now=!!(S0()&&S0().abaddonWon); if(now===on) return; on=now; g.visible=on; const i=world.spots.indexOf(door); if(on&&i<0) world.spots.push(door); if(!on&&i>=0) world.spots.splice(i,1); });
    g.visible=false;
    // the room within
    ENGINE.add({id:'marioHut',lazy:()=>{ const grid=[[5,5,5,51,51,5,5,5],[5,44,44,12,12,45,49,5],[5,12,12,12,12,12,12,5],[5,47,12,40,40,12,12,5],[5,12,12,12,12,12,48,5],[5,13,13,12,12,12,12,5],[5,5,5,9,5,5,5,5]];
      const lv=gridRoom({id:'marioHut',name:'Old Man Mario’s Hut',theme:'home',pal:Object.assign({},ROOM_PALS.home,{wall:0xe0d0a8,cloth:0x6a4a2a,accent:0x3a5a3a}),grid,npcs:[],floor:0,exit:{level:'world',spawn:{x,z:z+2.1,face:0}},zone:'Lamplight, ink and old scrolls'});
      const room=lv.room, an=lv.anim;
      // the desk: an open scroll of John 1:1 in uncials, an ink pot and pen, a lamp, a stack of codices
      const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.55),parchment(['ΕΝ ΑΡΧΗ ΗΝ Ο ΛΟΓΟΣ','ΚΑΙ Ο ΛΟΓΟΣ ΗΝ','ΠΡΟΣ ΤΟΝ ΘΕΟΝ'],256,128)); scr.rotation.x=-Math.PI/2; scr.position.set(4,0.79,3.5); room.add(scr);
      Cy(0.04,0.04,0.6,6,0xd8c8a0,3.42,0.8,3.5,room).rotation.x=Math.PI/2; Cy(0.04,0.04,0.6,6,0xd8c8a0,4.58,0.8,3.5,room).rotation.x=Math.PI/2;
      Cy(0.05,0.06,0.08,8,0x1a1a24,4.7,0.78,3.25,room); const pen=B(0.01,0.25,0.01,0xf4ecd8,4.72,0.82,3.25,room); pen.rotation.z=0.4;
      Cy(0.08,0.1,0.06,8,0xb08040,3.25,0.78,3.3,room); flame(3.25,0.9,3.3,room,an,1.3); const L=new THREE.PointLight(0xffc880,0.9,5,1.5); L.position.set(3.3,1.3,3.3); room.add(L);
      [0,1,2].forEach(i=>B(0.32,0.07,0.24,[0x6a2a2a,0x2a3a5a,0x3a4a2a][i],4.65,0.78+i*0.07,3.7,room));
      // the alphabet on a board by the door, and a long scroll hung on the wall
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.8),parchment(['Α Β Γ Δ Ε Ζ','Η Θ Ι Κ Λ Μ','Ν Ξ Ο Π Ρ Σ','Τ Υ Φ Χ Ψ Ω'],320,160)); bd.position.set(1.05,1.55,4.5); bd.rotation.y=Math.PI/2; room.add(bd);
      const hs=new THREE.Mesh(new THREE.PlaneGeometry(0.6,1.3),parchment(['ΠΑΤΕΡ','ΗΜΩΝ','Ο ΕΝ ΤΟΙΣ','ΟΥΡΑΝΟΙΣ'],120,260)); hs.position.set(6.95,1.6,2.4); hs.rotation.y=-Math.PI/2; room.add(hs);
      if(typeof JOURNAL!=='undefined') JOURNAL.spot(lv,2.6,4.5,Math.PI,'Old Man Mario’s Hut','at the end of Old Man Mario’s desk by lamplight');
      // V98: time, made visible — the tall study candle burns down a little with every lesson, your finished slates stack up
      //  by the shelves, and once Petra's note is found, her gold lamp is lit on the desk
      const cand=Cy(0.04,0.045,1,8,0xf4ecd8,4.45,0.78,3.25,room), cf=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.11,6),glow(0xffd27a)); room.add(cf); an.push(t=>{ cf.scale.y=1+Math.sin(t*9)*0.15; });
      const slTex=parchment(['Α Β Γ'],64,40), slates=[]; for(let i=0;i<14;i++){ const sl=B(0.34,0.025,0.24,0x3a3a42,3.5+(hsh(i,3)-0.5)*0.06,0.03*i,1.45+(hsh(3,i)-0.5)*0.06,room); sl.rotation.y=(hsh(i,i)-0.5)*0.5; const fc=new THREE.Mesh(new THREE.PlaneGeometry(0.28,0.18),slTex); fc.rotation.x=-Math.PI/2; fc.position.y=0.014; sl.add(fc); sl.visible=false; slates.push(sl); }
      const pl=group(3.1,0.78,3.75,room); Cy(0.07,0.09,0.05,8,0xc9a94a,0,0,0,pl); B(0.13,0.16,0.13,glow(0xffe28a),0,0.05,0,pl); Co(0.11,0.1,4,0xc9a94a,0,0.21,0,pl).rotation.y=Math.PI/4; const pL=new THREE.PointLight(0xffd070,0.6,4,1.6); pL.position.y=0.3; pl.add(pL);
      const keepTime=()=>{ const n=level(), h=0.05+0.34*(1-n/14); cand.scale.y=h; cand.position.y=0.78+h/2; cf.position.set(4.45,0.78+h+0.06,3.25); slates.forEach((x,i)=>x.visible=i<n); const done=!!st().finaleDone; pl.visible=done; };
      keepTime(); const oe=lv.onEnter; lv.onEnter=sp=>{ if(oe) oe(sp); keepTime(); }; an.push(()=>{ if(ENGINE.level===lv&&!ENGINE.holding) keepTime(); });
      const f=addPerson(lv,room,'scribe',4,2.45,0,'Old Man Mario',null,{rest:0}); f.action=()=>talk(); f.label='Talk'; f.reach=1.4;
      // V114: once the school is open, Mario has gone north to his tower — his desk keeps a note for you
      const note={x:4,z:2.6,r:1.2,label:'Read',who:'A note on the desk',lines:['In Mario’s careful hand, weighted down with the ink pot: “Gone north to the old tower above the Scholar’s Way — the road from Hearthvale. The kettle here is yours. Come and find me. — M.”']};
      an.push(()=>{ const gone=typeof NORTH!=='undefined'&&NORTH.moved(); if(f.g.visible===!gone) return; f.g.visible=!gone; f.mute=gone; f.ghost=gone; const i=lv.spots.indexOf(note); if(gone&&i<0) lv.spots.push(note); if(!gone&&i>=0) lv.spots.splice(i,1); });
      return lv; }});
    return g; }
  return { hut, level, lessons:LESSONS, talk, st, place, read:readFound, reader, sanctPassage, passages:PASS, _t:()=>T };
})();
