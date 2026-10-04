(function(){
  "use strict";

  var THREAD = [
    { date: "Apr 14, 2025", text: "irani lover" }
  ]

  var SOCIALS = [
    {
      name: "github",
      handle: "@sephean",
      url: "https://github.com/sephean",
      icon: "M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
    },
    {
      name: "twitter",
      handle: "@sephean",
      url: "https://x.com/sephean",
      icon: "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"
    }
  ];

  var curtain = document.getElementById("curtain");
  var main = document.getElementById("main");
  var audio = document.getElementById("audio");
  var enterBtn = document.getElementById("enter");
  var soundBtn = document.getElementById("sound-toggle");
  var soundLabel = document.getElementById("sound-label");
  var shellBody = document.getElementById("shell-body");
  var shellOut = document.getElementById("shell-out");
  var shellForm = document.getElementById("shell-form");
  var shellInput = document.getElementById("shell-input");
  var threadCount = document.getElementById("thread-count");
  var clock = document.getElementById("clock");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var booted = false;
  var busy = false;
  var history = [];
  var historyIndex = 0;

  function updateSoundUI(){
    var playing = !audio.paused;
    soundBtn.setAttribute("aria-pressed", String(playing));
    soundLabel.textContent = playing ? "playing" : "paused";
  }

  function fadeTo(target, duration, done){
    var start = audio.volume;
    var t0 = performance.now();
    function step(now){
      var k = Math.min((now - t0) / duration, 1);
      audio.volume = start + (target - start) * k;
      if (k < 1) requestAnimationFrame(step);
      else if (done) done();
    }
    requestAnimationFrame(step);
  }

  function playMusic(){
    audio.volume = 0;
    var p = audio.play();
    if (p && p.then){
      p.then(function(){ fadeTo(0.35, 1200); }).catch(function(){}).then(updateSoundUI);
    } else {
      fadeTo(0.35, 1200);
      updateSoundUI();
    }
  }

  function stopMusic(){
    fadeTo(0, 400, function(){ audio.pause(); });
  }

  enterBtn.addEventListener("click", function(){
    curtain.classList.add("hidden");
    main.classList.add("visible");
    main.setAttribute("aria-hidden", "false");
    playMusic();
    boot();
  });

  audio.addEventListener("play", updateSoundUI);
  audio.addEventListener("pause", updateSoundUI);

  soundBtn.addEventListener("click", function(){
    if (audio.paused) playMusic();
    else stopMusic();
  });

  function el(tag, cls, text){
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function scrollDown(){
    shellBody.scrollTop = shellBody.scrollHeight;
  }

  function out(node){
    shellOut.appendChild(node);
    scrollDown();
    return node;
  }

  function row(text, cls){
    return out(el("p", "row" + (cls ? " " + cls : ""), text));
  }

  function promptRow(){
    var line = el("p", "row");
    var ps1 = el("span", "ps1");
    ps1.innerHTML = "<b>steph</b>@sephean<em>:~$</em>";
    var cmd = el("span", "cmd");
    line.appendChild(ps1);
    line.appendChild(cmd);
    out(line);
    return cmd;
  }

  function wait(ms){
    return new Promise(function(r){ setTimeout(r, reduceMotion ? 0 : ms); });
  }

  function typeInto(node, text){
    if (reduceMotion){
      node.textContent = text;
      return Promise.resolve();
    }
    var i = 0;
    return new Promise(function(resolve){
      (function next(){
        node.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(next, 45 + Math.random() * 55);
        else resolve();
      })();
    });
  }

  function showWhoami(){
    row("sephean —  a cool 20yo tech enthusiast", "gap");
  }

  function showPosts(){
    THREAD.forEach(function(entry){
      var post = el("article", "post");
      post.appendChild(el("p", "post-text", entry.text));
      if (entry.date) post.appendChild(el("div", "post-meta", entry.date));
      out(post);
    });
  }

  function showSocials(){
    var wrap = el("div", "socials");
    SOCIALS.forEach(function(s){
      var a = el("a", "social");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + s.icon + '"/></svg>';
      a.appendChild(document.createTextNode(s.name));
      a.appendChild(el("span", null, s.handle));
      wrap.appendChild(a);
    });
    out(wrap);
  }

  function openSocial(name){
    var s = SOCIALS.filter(function(x){ return x.name === name; })[0];
    if (!s) return;
    row("opening " + s.url + " ...", "dim gap");
    window.open(s.url, "_blank", "noopener");
  }

  var COMMANDS = {
    help: function(){
      row("whoami     who is this", "dim");
      row("posts      read the thread", "dim");
      row("socials    where to find me", "dim");
      row("github     open github", "dim");
      row("twitter    open twitter", "dim");
      row("music      toggle the music", "dim");
      row("date       what time is it", "dim");
      row("clear      clean the screen", "dim gap");
    },
    whoami: showWhoami,
    posts: showPosts,
    "cat posts.txt": showPosts,
    socials: showSocials,
    "ls socials": showSocials,
    github: function(){ openSocial("github"); },
    twitter: function(){ openSocial("twitter"); },
    x: function(){ openSocial("twitter"); },
    music: function(){
      if (audio.paused){ playMusic(); row("♪ now playing: viles", "dim gap"); }
      else { stopMusic(); row("♪ paused", "dim gap"); }
    },
    date: function(){ row(new Date().toString(), "dim gap"); },
    clear: function(){ shellOut.innerHTML = ""; },
    sudo: function(){ row("nice try.", "err gap"); }
  };

  function run(input){
    var cmd = input.trim().toLowerCase().replace(/\s+/g, " ");
    if (!cmd) return;
    var fn = COMMANDS[cmd] || (cmd.indexOf("sudo") === 0 ? COMMANDS.sudo : null);
    if (fn) fn();
    else row("command not found: " + cmd + " — try help", "err gap");
  }

  function boot(){
    if (booted) return;
    booted = true;
    busy = true;
    shellForm.style.visibility = "hidden";

    if (threadCount){
      threadCount.textContent = THREAD.length + (THREAD.length === 1 ? " post" : " posts");
    }

    var script = [
      ["whoami", showWhoami],
      ["cat posts.txt", showPosts],
      ["ls socials", showSocials]
    ];

    script.reduce(function(chain, step){
      return chain.then(function(){
        var cmd = promptRow();
        return wait(500).then(function(){ return typeInto(cmd, step[0]); })
          .then(function(){ return wait(250); })
          .then(step[1]);
      });
    }, wait(900)).then(function(){
      busy = false;
      shellForm.style.visibility = "visible";
      scrollDown();
      if (window.matchMedia("(pointer:fine)").matches) shellInput.focus({ preventScroll: true });
    });
  }

  shellForm.addEventListener("submit", function(e){
    e.preventDefault();
    if (busy) return;
    var value = shellInput.value;
    shellInput.value = "";
    var cmd = promptRow();
    cmd.textContent = value;
    if (value.trim()){
      history.push(value);
      historyIndex = history.length;
    }
    run(value);
    scrollDown();
  });

  shellInput.addEventListener("keydown", function(e){
    if (e.key === "ArrowUp" && history.length){
      e.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      shellInput.value = history[historyIndex];
    } else if (e.key === "ArrowDown" && history.length){
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      shellInput.value = history[historyIndex] || "";
    }
  });

  shellBody.addEventListener("click", function(e){
    if (e.target.closest("a")) return;
    if (window.getSelection && String(window.getSelection())) return;
    shellInput.focus({ preventScroll: true });
  });

  function tickClock(){
    if (!clock) return;
    var d = new Date();
    clock.textContent =
      String(d.getHours()).padStart(2, "0") + ":" +
      String(d.getMinutes()).padStart(2, "0");
  }

  tickClock();
  setInterval(tickClock, 10000);

  var stars = document.getElementById("stars");
  var sparkle = document.getElementById("sparkle");
  var dpr = 1;
  var w = 0;
  var h = 0;
  var starField = [];

  function sizeCanvas(c){
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + "px";
    c.style.height = h + "px";
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    if (stars) sizeCanvas(stars);
    if (sparkle) sizeCanvas(sparkle);
    starField = [];
    var count = Math.round((w * h) / 9000);
    for (var i = 0; i < count; i++){
      starField.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        a: Math.random() * 0.6 + 0.15,
        s: Math.random() * 0.002 + 0.0006,
        p: Math.random() * Math.PI * 2
      });
    }
    if (reduceMotion) drawStars(0);
  }

  var sctx = stars ? stars.getContext("2d") : null;

  function drawStars(t){
    if (!sctx) return;
    sctx.clearRect(0, 0, w, h);
    sctx.fillStyle = "#ffffff";
    for (var i = 0; i < starField.length; i++){
      var s = starField[i];
      sctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(t * s.s + s.p));
      sctx.beginPath();
      sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sctx.fill();
    }
    sctx.globalAlpha = 1;
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) return;

  var ctx = sparkle.getContext("2d");
  var particles = [];
  var lastSpawn = 0;

  function spawn(x, y){
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: Math.random() * 0.6 + 0.3,
      life: 1,
      size: Math.random() * 2 + 1.2,
      star: Math.random() < 0.3,
      hue: Math.random() < 0.5 ? "#e6d6ff" : "#ffc8e6"
    });
    if (particles.length > 140) particles.shift();
  }

  window.addEventListener("pointermove", function(e){
    var now = performance.now();
    if (now - lastSpawn < 28) return;
    lastSpawn = now;
    spawn(e.clientX, e.clientY);
  });

  function drawSpark(x, y, r){
    ctx.beginPath();
    ctx.moveTo(x, y - r * 2.4);
    ctx.quadraticCurveTo(x, y, x + r * 2.4, y);
    ctx.quadraticCurveTo(x, y, x, y + r * 2.4);
    ctx.quadraticCurveTo(x, y, x - r * 2.4, y);
    ctx.quadraticCurveTo(x, y, x, y - r * 2.4);
    ctx.fill();
  }

  function tick(t){
    drawStars(t);
    ctx.clearRect(0, 0, w, h);
    ctx.shadowColor = "rgba(230,214,255,0.8)";
    ctx.shadowBlur = 8;

    for (var i = particles.length - 1; i >= 0; i--){
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.018;

      if (p.life <= 0){
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.hue;
      var r = p.size * p.life;

      if (p.star){
        drawSpark(p.x, p.y, r);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
