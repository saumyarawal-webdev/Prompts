// Detective Game Logic
// All passwords and hints are randomized on each load

(function () {
  // --- Randomization helpers ---
  function randomDigits(len) {
    let min = Math.pow(10, len - 1);
    let max = Math.pow(10, len) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // --- Game State ---
  let notesPassword = randomDigits(4); // e.g. 3740
  let bmsPassword = randomDigits(4); // e.g. 5439
  // For chat hint: generate 3-5 numbers that sum to notesPassword
  function randomSumParts(sum, parts) {
    let arr = [];
    let remain = sum;
    for (let i = 0; i < parts - 1; i++) {
      let max = remain - (parts - i - 1);
      let val = Math.floor(Math.random() * (max / 2)) + 1;
      arr.push(val);
      remain -= val;
    }
    arr.push(remain);
    return arr;
  }
  let chatHintParts = randomSumParts(
    notesPassword,
    Math.floor(Math.random() * 3) + 3
  ); // 3-5 parts
  // --- DOM Elements ---
  const intro = document.getElementById("intro");
  const startBtn = document.getElementById("startGameBtn");
  const gameUI = document.getElementById("gameUI");
  const credits = document.getElementById("credits");
  const chatTab = document.getElementById("chatTab");
  const notesTab = document.getElementById("notesTab");
  const bmsTab = document.getElementById("bmsTab");
  const chatApp = document.getElementById("chatApp");
  const notesApp = document.getElementById("notesApp");
  const bmsApp = document.getElementById("bmsApp");
  // --- App Navigation ---
  function showApp(app) {
    [chatApp, notesApp, bmsApp].forEach((el) => el.classList.add("hidden"));
    [chatTab, notesTab, bmsTab].forEach((el) => el.classList.remove("active"));
    if (app === "chat") {
      chatApp.classList.remove("hidden");
      chatTab.classList.add("active");
    } else if (app === "notes") {
      notesApp.classList.remove("hidden");
      notesTab.classList.add("active");
    } else if (app === "bms") {
      bmsApp.classList.remove("hidden");
      bmsTab.classList.add("active");
    }
  }
  chatTab.onclick = () => showApp("chat");
  notesTab.onclick = () => showApp("notes");
  bmsTab.onclick = () => showApp("bms");
  // --- Game Start ---
  startBtn.onclick = function () {
    intro.classList.add("hidden");
    gameUI.classList.remove("hidden");
    showApp("chat");
  };
  // --- Chat App ---
  function renderChatApp() {
    // Fake chat list
    let chats = [
      { name: "Mom", last: "Call me when free." },
      { name: "Pizza Place", last: "Your order is on the way!" },
      { name: "John", last: "Check the numbers I sent." },
      { name: "Boss", last: "Meeting at 5pm." },
      { name: "Unknown", last: "..." },
      { name: "Priya", last: "See you soon!" },
    ];
    let chatList = '<div style="display:flex;flex-direction:column;gap:8px;">';
    chats.forEach((c, i) => {
      chatList +=
        `<div class="chat-list-item" data-idx="${i}" style="background:#222;padding:10px 14px;border-radius:10px;cursor:pointer;">` +
        `<b>${c.name}</b><br><span style='color:#aaa;font-size:0.95em;'>${c.last}</span></div>`;
    });
    chatList += "</div>";
    let chatView = '<div id="chatView" style="margin-top:18px;"></div>';
    chatApp.innerHTML = `<h3>Chats</h3>${chatList}${chatView}`;
    // Click handler
    chatApp.querySelectorAll(".chat-list-item").forEach((el, idx) => {
      el.onclick = function () {
        renderChatView(idx);
      };
    });
  }
  function renderChatView(idx) {
    let chatName = ["Mom", "Pizza Place", "John", "Boss", "Unknown", "Priya"][
      idx
    ];
    let chatMsgs = {
      Mom: [
        { from: "Mom", msg: "Don't forget to eat." },
        { from: "You", msg: "Will do!" },
      ],
      "Pizza Place": [
        { from: "Pizza Place", msg: "Your order is on the way!" },
      ],
      John: [
        {
          from: "John",
          msg: `Hey, detective. Here are some numbers for you: <br><b>${chatHintParts.join(
            ", "
          )}</b><br>Sum them up, you\'ll need it.`,
        },
        { from: "You", msg: "Thanks John!" },
      ],
      Boss: [{ from: "Boss", msg: "Meeting at 5pm." }],
      Unknown: [{ from: "Unknown", msg: "..." }],
      Priya: [{ from: "Priya", msg: "See you soon!" }],
    };
    let msgs = chatMsgs[chatName] || [];
    let html = `<div style='margin-bottom:8px;'><b>${chatName}</b></div>`;
    msgs.forEach((m) => {
      html += `<div style='margin-bottom:10px;'><span style='color:${
        m.from === "You" ? "#2e8b57" : "#fff"
      };'><b>${m.from}:</b></span> ${m.msg}</div>`;
    });
    html += `<button class='start-btn' style='margin-top:10px;' id='backToChats'>Back</button>`;
    document.getElementById("chatView").innerHTML = html;
    document.getElementById("backToChats").onclick = renderChatApp;
  }
  // --- Notes App ---
  let notesUnlocked = false;
  function renderNotesApp() {
    if (!notesUnlocked) {
      notesApp.innerHTML = `<h3>Notes (Locked)</h3>
                <div style='margin:18px 0;'>Enter password to unlock notes:</div>
                <input id='notesPwdInput' type='number' style='padding:8px;font-size:1em;width:120px;border-radius:6px;border:1px solid #444;background:#222;color:#fff;'>
                <button class='start-btn' id='unlockNotesBtn'>Unlock</button>
                <div id='notesPwdMsg' style='color:#e57373;margin-top:10px;'></div>`;
      document.getElementById("unlockNotesBtn").onclick = function () {
        let val = document.getElementById("notesPwdInput").value;
        if (Number(val) === notesPassword) {
          notesUnlocked = true;
          renderNotesApp();
        } else {
          document.getElementById("notesPwdMsg").textContent =
            "Incorrect password.";
        }
      };
    } else {
      notesApp.innerHTML = `<h3>Notes</h3>
                <div style='margin:18px 0;'>Book My Show app password: <b>${bmsPassword}</b></div>
                <div style='margin-top:24px;color:#aaa;'>Other notes:<br>- Buy groceries<br>- Call Mom<br>- Meeting at 5pm</div>`;
    }
  }
  // --- Book My Show App ---
  let bmsUnlocked = false;
  function renderBmsApp() {
    if (!bmsUnlocked) {
      bmsApp.innerHTML = `<h3>Book My Show (Locked)</h3>
                <div style='margin:18px 0;'>Enter password to unlock Book My Show:</div>
                <input id='bmsPwdInput' type='number' style='padding:8px;font-size:1em;width:120px;border-radius:6px;border:1px solid #444;background:#222;color:#fff;'>
                <button class='start-btn' id='unlockBmsBtn'>Unlock</button>
                <div id='bmsPwdMsg' style='color:#e57373;margin-top:10px;'></div>`;
      document.getElementById("unlockBmsBtn").onclick = function () {
        let val = document.getElementById("bmsPwdInput").value;
        if (Number(val) === bmsPassword) {
          bmsUnlocked = true;
          renderBmsApp();
        } else {
          document.getElementById("bmsPwdMsg").textContent =
            "Incorrect password.";
        }
      };
    } else {
      // List of previous shows
      let shows = [
        { movie: "Avengers: Endgame", loc: "PVR, CG Road" },
        { movie: "Oppenheimer", loc: "INOX, Alpha One" },
        { movie: "Jawan", loc: "Rajhans, Iscon" },
        { movie: "The Batman", loc: "Cinepolis, Shyamal" },
        { movie: "The Client", loc: "NY Cinema, Chandkheda Ahmedabad" }, // latest
      ];
      let html = `<h3>Book My Show</h3><div style='margin:18px 0;'>Previous bookings:</div><ul style='color:#fff;'>`;
      shows.forEach((s, i) => {
        html += `<li>${s.movie} - <span style='color:#aaa;'>${s.loc}</span>${
          i === shows.length - 1
            ? " <b style='color:#2e8b57;'>(Latest)</b>"
            : ""
        }</li>`;
      });
      html += "</ul>";
      html += `<div style='margin-top:30px;font-size:1.1em;color:#2e8b57;'><b>Last known location:</b><br>NY Cinema, Chandkheda Ahmedabad</div>`;
      html += `<div style='margin-top:40px;'><button class='start-btn' id='endGameBtn'>Finish Case</button></div>`;
      bmsApp.innerHTML = html;
      document.getElementById("endGameBtn").onclick = function () {
        gameUI.classList.add("hidden");
        credits.classList.remove("hidden");
      };
    }
  }
  // --- Initial Render ---
  renderChatApp();
  renderNotesApp();
  renderBmsApp();
  // Tab switching logic
  chatTab.onclick = function () {
    showApp("chat");
  };
  notesTab.onclick = function () {
    showApp("notes");
  };
  bmsTab.onclick = function () {
    showApp("bms");
  };
  // When switching to notes or bms, re-render to update lock state
  notesTab.addEventListener("click", renderNotesApp);
  bmsTab.addEventListener("click", renderBmsApp);
})();
