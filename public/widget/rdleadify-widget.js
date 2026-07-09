(function () {
  "use strict";

  if (window.RDLeadifyWidgetLoaded) return;
  window.RDLeadifyWidgetLoaded = true;

  var script = document.currentScript || {};
  var scriptUrl = script.src || "";
  var origin = scriptUrl ? new URL(scriptUrl, window.location.href).origin : window.location.origin;
  var workspaceKey = script.dataset.workspace || window.RDLeadifyWorkspace || "";
  var config = {
    companyName: script.dataset.company || "RDLeadify AI",
    logo: script.dataset.logo || "",
    primaryColor: script.dataset.color || "#10b981",
    greetingMessage: script.dataset.greeting || "Hi, I am RDLeadify AI. I can help qualify your requirement and book a demo.",
    agentName: script.dataset.agent || "Riya",
    position: script.dataset.position || "AI Sales Consultant",
    businessHours: script.dataset.hours || "Mon-Fri, 9:00 AM - 7:00 PM",
    offlineMessage: script.dataset.offline || "We are currently offline, but the AI agent can still collect your details.",
    theme: script.dataset.theme || "dark",
    language: script.dataset.language || "auto",
    workspaceKey: workspaceKey
  };

  var storageKey = "rdleadify_widget_state_" + (workspaceKey || "default");
  var state = loadState();
  var isOpen = false;
  var isSending = false;
  var unread = state.unread || 1;
  var size = state.size || { width: 390, height: 620 };
  var messages = state.messages && state.messages.length ? state.messages : [
    { role: "assistant", content: config.greetingMessage }
  ];
  var leadInfo = state.leadInfo || {};
  var latestLead = state.latestLead || null;
  var latestAnalysis = state.latestAnalysis || null;
  var latestSheetSync = state.latestSheetSync || null;

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        visitorId: state.visitorId,
        conversationId: state.conversationId,
        messages: messages.slice(-30),
        leadInfo: leadInfo,
        latestAnalysis: latestAnalysis,
        latestLead: latestLead,
        latestSheetSync: latestSheetSync,
        unread: unread,
        size: size
      }));
    } catch {}
  }

  function id(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  state.visitorId = state.visitorId || id("visitor");
  state.conversationId = state.conversationId || id("website_chat");

  var css = document.createElement("style");
  css.textContent = `
    .rdl-root, .rdl-root * { box-sizing: border-box; font-family: Inter, Arial, sans-serif; letter-spacing: 0; }
    .rdl-root { position: fixed; right: 22px; bottom: 22px; z-index: 2147483647; color: #e5eefb; }
    .rdl-bubble { width: 64px; height: 64px; border: 0; border-radius: 50%; cursor: pointer; color: #052014; background: var(--rdl-primary); box-shadow: 0 22px 60px rgba(0,0,0,.32); display: grid; place-items: center; transition: transform .22s ease, box-shadow .22s ease; position: relative; }
    .rdl-bubble:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 28px 70px rgba(0,0,0,.38); }
    .rdl-bubble svg { width: 29px; height: 29px; }
    .rdl-unread { position: absolute; right: -2px; top: -4px; min-width: 22px; height: 22px; border-radius: 999px; background: #ef4444; color: white; display: none; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 2px solid white; }
    .rdl-panel { position: absolute; right: 0; bottom: 82px; width: min(var(--rdl-width), calc(100vw - 24px)); height: min(var(--rdl-height), calc(100vh - 112px)); min-width: 330px; min-height: 460px; max-width: calc(100vw - 24px); max-height: calc(100vh - 112px); border-radius: 18px; overflow: hidden; background: #0b1628; color: #f8fafc; border: 1px solid rgba(255,255,255,.14); box-shadow: 0 30px 90px rgba(0,0,0,.42); opacity: 0; pointer-events: none; transform: translateY(18px) scale(.96); transition: opacity .22s ease, transform .22s ease; display: flex; flex-direction: column; }
    .rdl-open .rdl-panel { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }
    .rdl-light .rdl-panel { background: #ffffff; color: #0f172a; border-color: rgba(15,23,42,.12); }
    .rdl-header { padding: 16px; background: linear-gradient(135deg, var(--rdl-primary), #38bdf8); color: #06111f; display: flex; align-items: center; gap: 12px; }
    .rdl-logo { width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,.82); display: grid; place-items: center; overflow: hidden; font-weight: 900; color: #0f172a; flex: 0 0 auto; }
    .rdl-logo img { width: 100%; height: 100%; object-fit: cover; }
    .rdl-head-main { min-width: 0; flex: 1; }
    .rdl-company { font-size: 15px; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rdl-agent { margin-top: 2px; font-size: 12px; font-weight: 700; opacity: .82; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rdl-online { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12px; font-weight: 800; }
    .rdl-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,.18); }
    .rdl-close, .rdl-theme { width: 34px; height: 34px; border: 0; border-radius: 10px; color: #06111f; background: rgba(255,255,255,.42); cursor: pointer; font-weight: 900; }
    .rdl-messages { flex: 1; overflow-y: auto; padding: 16px; background: radial-gradient(circle at top right, rgba(56,189,248,.12), transparent 34%), #07111f; }
    .rdl-light .rdl-messages { background: #f8fafc; }
    .rdl-msg { display: flex; margin-bottom: 12px; }
    .rdl-msg-user { justify-content: flex-end; }
    .rdl-bubble-msg { max-width: 84%; border-radius: 16px; padding: 11px 13px; font-size: 14px; line-height: 1.48; overflow-wrap: anywhere; }
    .rdl-msg-assistant .rdl-bubble-msg { background: rgba(255,255,255,.075); border: 1px solid rgba(255,255,255,.10); color: #e2e8f0; }
    .rdl-light .rdl-msg-assistant .rdl-bubble-msg { background: #ffffff; border-color: rgba(15,23,42,.10); color: #172033; box-shadow: 0 10px 30px rgba(15,23,42,.06); }
    .rdl-msg-user .rdl-bubble-msg { background: var(--rdl-primary); color: #052014; font-weight: 650; }
    .rdl-seen { margin-top: 4px; font-size: 10px; font-weight: 800; opacity: .68; text-align: right; }
    .rdl-bubble-msg p { margin: 0 0 8px; }
    .rdl-bubble-msg p:last-child { margin-bottom: 0; }
    .rdl-bubble-msg pre { margin: 8px 0 0; padding: 10px; overflow: auto; border-radius: 10px; background: rgba(0,0,0,.28); font-family: "Courier New", monospace; font-size: 12px; }
    .rdl-typing { display: none; align-items: center; gap: 5px; padding: 0 16px 10px; background: #07111f; color: #94a3b8; font-size: 12px; }
    .rdl-light .rdl-typing { background: #f8fafc; color: #64748b; }
    .rdl-typing span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: rdlPulse 1s infinite ease-in-out; }
    .rdl-typing span:nth-child(2) { animation-delay: .15s; }
    .rdl-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes rdlPulse { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
    .rdl-actions { display: flex; gap: 8px; overflow-x: auto; padding: 10px 14px; border-top: 1px solid rgba(255,255,255,.08); background: #091426; }
    .rdl-light .rdl-actions { background: #ffffff; border-top-color: rgba(15,23,42,.08); }
    .rdl-chip { white-space: nowrap; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: inherit; border-radius: 999px; padding: 8px 10px; font-size: 12px; font-weight: 800; cursor: pointer; }
    .rdl-light .rdl-chip { border-color: rgba(15,23,42,.12); background: #f8fafc; }
    .rdl-composer { padding: 12px; background: #0b1628; border-top: 1px solid rgba(255,255,255,.10); display: grid; gap: 9px; }
    .rdl-light .rdl-composer { background: #ffffff; border-top-color: rgba(15,23,42,.10); }
    .rdl-attach { display: flex; justify-content: space-between; gap: 8px; color: #94a3b8; font-size: 12px; }
    .rdl-input-row { display: flex; gap: 8px; align-items: flex-end; }
    .rdl-input { min-width: 0; flex: 1; min-height: 42px; max-height: 100px; resize: none; border: 1px solid rgba(255,255,255,.12); border-radius: 12px; padding: 11px 12px; outline: 0; background: rgba(0,0,0,.18); color: inherit; font-size: 14px; line-height: 1.35; }
    .rdl-light .rdl-input { border-color: rgba(15,23,42,.13); background: #f8fafc; }
    .rdl-send { width: 43px; height: 43px; border: 0; border-radius: 12px; background: var(--rdl-primary); color: #052014; cursor: pointer; display: grid; place-items: center; }
    .rdl-send svg { width: 18px; height: 18px; }
    .rdl-resize { position: absolute; left: 0; top: 0; width: 22px; height: 22px; cursor: nwse-resize; opacity: .55; }
    .rdl-resize:before { content: ""; position: absolute; left: 6px; top: 6px; width: 10px; height: 10px; border-left: 2px solid currentColor; border-top: 2px solid currentColor; }
    @media (max-width: 520px) {
      .rdl-root { right: 12px; bottom: 12px; }
      .rdl-panel { position: fixed; inset: 12px 12px 88px 12px; width: auto !important; height: auto !important; min-width: 0; border-radius: 16px; }
      .rdl-resize { display: none; }
      .rdl-bubble { width: 58px; height: 58px; }
    }
  `;
  document.head.appendChild(css);

  var root = document.createElement("div");
  root.className = "rdl-root rdl-" + config.theme;
  root.style.setProperty("--rdl-primary", config.primaryColor);
  root.style.setProperty("--rdl-width", size.width + "px");
  root.style.setProperty("--rdl-height", size.height + "px");
  root.innerHTML = `
    <section class="rdl-panel" aria-label="RDLeadify AI website chat">
      <div class="rdl-resize" title="Resize"></div>
      <header class="rdl-header">
        <div class="rdl-logo">${config.logo ? '<img alt="" src="' + escapeAttr(config.logo) + '">' : initials(config.companyName)}</div>
        <div class="rdl-head-main">
          <div class="rdl-company"></div>
          <div class="rdl-agent"></div>
          <div class="rdl-online"><span class="rdl-dot"></span><span>Online now</span></div>
        </div>
        <button class="rdl-theme" type="button" title="Toggle theme">◐</button>
        <button class="rdl-close" type="button" title="Close">×</button>
      </header>
      <main class="rdl-messages" aria-live="polite"></main>
      <div class="rdl-typing"><span></span><span></span><span></span><strong>AI is thinking</strong></div>
      <div class="rdl-actions"></div>
      <form class="rdl-composer">
        <div class="rdl-attach"><span class="rdl-capture-status">Lead not captured yet</span><span>${escapeHtml(config.businessHours)}</span></div>
        <div class="rdl-input-row">
          <textarea class="rdl-input" rows="1" placeholder="Type your message..."></textarea>
          <button class="rdl-send" type="submit" title="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
          </button>
        </div>
      </form>
    </section>
    <button class="rdl-bubble" type="button" aria-label="Open RDLeadify AI chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path></svg>
      <span class="rdl-unread"></span>
    </button>
  `;
  document.body.appendChild(root);

  var bubble = root.querySelector(".rdl-bubble");
  var unreadEl = root.querySelector(".rdl-unread");
  var closeBtn = root.querySelector(".rdl-close");
  var themeBtn = root.querySelector(".rdl-theme");
  var messagesEl = root.querySelector(".rdl-messages");
  var typingEl = root.querySelector(".rdl-typing");
  var actionsEl = root.querySelector(".rdl-actions");
  var captureStatusEl = root.querySelector(".rdl-capture-status");
  var form = root.querySelector(".rdl-composer");
  var input = root.querySelector(".rdl-input");
  var resizeHandle = root.querySelector(".rdl-resize");

  root.querySelector(".rdl-company").textContent = config.companyName;
  root.querySelector(".rdl-agent").textContent = config.agentName + " · " + config.position;

  fetchSettings();
  render();

  bubble.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) unread = 0;
    render();
  });
  closeBtn.addEventListener("click", function () {
    isOpen = false;
    render();
  });
  themeBtn.addEventListener("click", function () {
    config.theme = config.theme === "dark" ? "light" : "dark";
    render();
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener("input", function () {
    input.style.height = "42px";
    input.style.height = Math.min(input.scrollHeight, 100) + "px";
  });
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  resizeHandle.addEventListener("mousedown", startResize);

  async function fetchSettings() {
    try {
      var response = await fetch(origin + "/api/widget/settings?workspace=" + encodeURIComponent(workspaceKey), {
        headers: workspaceKey ? { "X-RDLeadify-Workspace": workspaceKey } : {}
      });
      var data = await response.json();
      if (data.ok && data.settings) {
        Object.assign(config, Object.fromEntries(Object.entries(data.settings).filter(function (entry) {
          return config[entry[0]] === undefined || !script.dataset[toDatasetKey(entry[0])];
        })));
        if (messages.length === 1 && messages[0].content !== config.greetingMessage) {
          messages[0].content = config.greetingMessage;
        }
        render();
      }
    } catch {}
  }

  function toDatasetKey(key) {
    return key.replace(/[A-Z]/g, function (letter) { return "-" + letter.toLowerCase(); });
  }

  function render() {
    root.className = "rdl-root rdl-" + config.theme + (isOpen ? " rdl-open" : "");
    root.style.setProperty("--rdl-primary", config.primaryColor);
    root.style.setProperty("--rdl-width", size.width + "px");
    root.style.setProperty("--rdl-height", size.height + "px");
    unreadEl.textContent = unread > 9 ? "9+" : String(unread);
    unreadEl.style.display = unread ? "flex" : "none";
    messagesEl.innerHTML = messages.map(renderMessage).join("");
    actionsEl.innerHTML = renderActions();
    actionsEl.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () { runAction(button.dataset.action, button.textContent); });
    });
    captureStatusEl.textContent = captureStatusText();
    typingEl.style.display = isSending ? "flex" : "none";
    messagesEl.scrollTop = messagesEl.scrollHeight;
    saveState();
  }

  function renderMessage(message) {
    return '<div class="rdl-msg rdl-msg-' + message.role + '"><div class="rdl-bubble-msg">' + markdown(message.content) + (message.role === "user" ? '<div class="rdl-seen">Seen</div>' : '') + "</div></div>";
  }

  function captureStatusText() {
    if (latestLead && latestSheetSync && latestSheetSync.log) return "Lead captured + Sheet synced";
    if (latestLead) return "Lead captured in CRM";
    if (latestAnalysis && latestAnalysis.scoreLabel) return "Lead score: " + latestAnalysis.scoreLabel;
    return "Lead not captured yet";
  }

  function renderActions() {
    var base = [
      ["need", "Need pricing"],
      ["demo", "Book a demo"],
      ["voice", "Talk to AI Voice Agent"]
    ];
    if (enoughLeadInfo()) {
      base.splice(2, 0, ["save", "Save Lead"]);
    }
    if (latestLead) {
      base.splice(3, 0, ["sheet", "Send to Google Sheet"], ["calendar", "Book Demo Appointment"]);
    }
    return base.map(function (item) {
      return '<button class="rdl-chip" type="button" data-action="' + item[0] + '">' + item[1] + "</button>";
    }).join("");
  }

  function sendMessage(value) {
    var text = String(value || "").trim();
    if (!text || isSending) return;
    input.value = "";
    input.style.height = "42px";
    messages.push({ role: "user", content: text });
    isSending = true;
    render();
    postChat();
  }

  async function postChat() {
    try {
      var response = await fetch(origin + "/api/widget/chat", {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, workspaceKey ? { "X-RDLeadify-Workspace": workspaceKey } : {}),
        body: JSON.stringify({
          workspaceKey: workspaceKey,
          visitorId: state.visitorId,
          conversationId: state.conversationId,
          messages: messages,
          leadInfo: leadInfo,
          language: config.language,
          pageUrl: window.location.href,
          referrer: document.referrer,
          settings: config
        })
      });
      var data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Inbox sync failed");
      leadInfo = data.analysis && data.analysis.leadInfo ? data.analysis.leadInfo : leadInfo;
      latestAnalysis = data.analysis || latestAnalysis;
      latestLead = data.lead || latestLead;
      latestSheetSync = data.sheetSync || latestSheetSync;
      await streamAssistant(data.reply || "Thanks, I captured that.");
    } catch {
      await streamAssistant("Widget error: inbox sync failed. Please try again or share your phone so our team can follow up.");
    } finally {
      isSending = false;
      if (!isOpen) unread += 1;
      render();
    }
  }

  function streamAssistant(text) {
    return new Promise(function (resolve) {
      var index = 0;
      var message = { role: "assistant", content: "" };
      messages.push(message);
      var timer = setInterval(function () {
        index += Math.max(2, Math.ceil(text.length / 28));
        message.content = text.slice(0, index);
        render();
        if (index >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, 28);
    });
  }

  async function runAction(action, label) {
    if (action === "need" || action === "demo") {
      sendMessage(label);
      return;
    }
    var endpoint = action === "save" ? "/api/widget/lead" : action === "voice" ? "/api/widget/voice" : "/api/widget/google";
    var leadPayload = Object.assign({}, leadInfo, {
      source: "Website Widget",
      score: latestAnalysis && latestAnalysis.score ? latestAnalysis.score : latestLead && latestLead.score,
      leadScore: latestAnalysis && latestAnalysis.score ? latestAnalysis.score : latestLead && latestLead.score,
      summary: latestAnalysis && latestAnalysis.summary ? latestAnalysis.summary : "",
      aiSummary: latestAnalysis && latestAnalysis.summary ? latestAnalysis.summary : ""
    });
    var payload = {
      workspaceKey: workspaceKey,
      visitorId: state.visitorId,
      conversationId: state.conversationId,
      leadId: latestLead && latestLead.id,
      lead: leadPayload,
      messages: messages,
      action: action === "calendar" ? "calendar" : "sheet",
      title: "RDLeadify AI Website Demo",
      attendeeEmail: leadPayload.email,
      attendeePhone: leadPayload.phone
    };
    isSending = true;
    render();
    try {
      var response = await fetch(origin + endpoint, {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, workspaceKey ? { "X-RDLeadify-Workspace": workspaceKey } : {}),
        body: JSON.stringify(payload)
      });
      var data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || actionError(action));
      if (data.lead) latestLead = data.lead;
      if (data.analysis && data.analysis.leadInfo) {
        latestAnalysis = data.analysis;
        leadInfo = data.analysis.leadInfo;
      }
      await streamAssistant(data.message || "Done. The action has been captured.");
    } catch (error) {
      await streamAssistant(String(error && error.message ? error.message : actionError(action)));
    } finally {
      isSending = false;
      render();
    }
  }

  function enoughLeadInfo() {
    return Boolean(
      (leadInfo.name || latestAnalysis) &&
      (leadInfo.phone || leadInfo.email) &&
      (leadInfo.requirement || leadInfo.business || leadInfo.budget || latestAnalysis)
    );
  }

  function actionError(action) {
    if (action === "save") return "Save lead failed.";
    if (action === "sheet") return "Google demo failed.";
    if (action === "calendar") return "Calendar demo failed.";
    if (action === "voice") return "Voice follow-up queue failed.";
    return "Widget action failed.";
  }

  function startResize(event) {
    event.preventDefault();
    var startX = event.clientX;
    var startY = event.clientY;
    var startWidth = size.width;
    var startHeight = size.height;
    function move(moveEvent) {
      size.width = Math.max(330, Math.min(560, startWidth + (startX - moveEvent.clientX)));
      size.height = Math.max(460, Math.min(760, startHeight + (startY - moveEvent.clientY)));
      render();
    }
    function up() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }

  function initials(value) {
    return escapeHtml(String(value || "RD").split(/\s+/).slice(0, 2).map(function (part) { return part[0]; }).join("").toUpperCase());
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function markdown(value) {
    var escaped = escapeHtml(value);
    escaped = escaped.replace(/```([\\s\\S]*?)```/g, function (_, code) {
      return "<pre><code>" + code.trim() + "</code></pre>";
    });
    escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\n{2,}/g, "</p><p>");
    escaped = escaped.replace(/\n/g, "<br>");
    return "<p>" + escaped + "</p>";
  }
})();
