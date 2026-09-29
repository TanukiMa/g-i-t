// Shared rendering logic for index.html / dashboard.html / minimal.html.
// Parses the already-rendered CHANGELOG.md HTML (via marked.js) into
// per-entry <section class="entry"> cards, turns site links into
// hostname chips, and tags maintenance-only entries for muted styling.
(function () {
  function formatJst(date) {
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(date || new Date())
      .reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
      }, {});
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} JST`;
  }

  function hostnameOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }

  function enhance(root) {
    root.querySelectorAll(":scope > ul > li > a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!/^https?:\/\//.test(href)) return;
      a.textContent = hostnameOf(href);
      a.title = href;
      a.classList.add("site-chip");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });

    root.querySelectorAll(":scope > p").forEach((p) => {
      const a = p.querySelector("a");
      if (a && p.textContent.trim().startsWith("コミット:")) {
        a.classList.add("commit-badge");
      }
    });

    Array.from(root.querySelectorAll(":scope > h2")).forEach((h2) => {
      const section = document.createElement("section");
      section.className = "entry";
      h2.replaceWith(section);
      section.appendChild(h2);
      let sibling = section.nextSibling;
      while (sibling && sibling.nodeName !== "H2") {
        const next = sibling.nextSibling;
        section.appendChild(sibling);
        sibling = next;
      }
      if (!section.querySelector("ul")) {
        section.classList.add("entry--maintenance");
      }
    });
  }

  function computeStats(root) {
    const entries = root.querySelectorAll(".entry");
    const changes = root.querySelectorAll(".site-chip");
    const latestHeading = entries[0]?.querySelector("h2")?.textContent ?? "-";
    const latest = latestHeading.split("—")[0].trim() || latestHeading;
    return {
      entryCount: entries.length,
      changeCount: changes.length,
      latest,
    };
  }

  function renderStats(root, target) {
    const stats = computeStats(root);
    target.innerHTML = `
      <div class="stat">
        <span class="stat-value">${stats.entryCount}</span>
        <span class="stat-label">記録された更新</span>
      </div>
      <div class="stat">
        <span class="stat-value">${stats.changeCount}</span>
        <span class="stat-label">検知したサイト変更</span>
      </div>
      <div class="stat">
        <span class="stat-value">${stats.latest}</span>
        <span class="stat-label">最終更新</span>
      </div>
    `;
  }

  function loadReport({ onContent, onError }) {
    return fetch("CHANGELOG.md", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("CHANGELOG.md: " + res.status);
        return res.text();
      })
      .then((markdown) => {
        const content = document.getElementById("content");
        content.innerHTML = marked.parse(markdown);
        enhance(content);
        onContent && onContent(content);
      })
      .catch((err) => {
        onError && onError(err);
      });
  }

  window.reportPage = {
    hostnameOf,
    enhance,
    computeStats,
    renderStats,
    loadReport,
    formatJst,
  };
})();
