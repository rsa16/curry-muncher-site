(() => {
  const STORAGE_KEY = "reader.settings";
  const THEMES = ["kanin", "dark", "light", "sepia"];
  const FONTS = {
    kanin: "var(--font-poppins), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
    arial: "var(--font-poppins), Arial, ui-sans-serif, system-ui, sans-serif"
  };

  const defaults = {
    fontSize: 20,
    lineSpacing: 1.5,
    paragraphSpacing: 0.6,
    indentWidth: 1,
    textAlign: "left",
    theme: "dark",
    font: "kanin",
    indent: true,
    menuOpen: !window.matchMedia("(max-width: 900px)").matches,
    minimizedNav: false,
    margins: window.matchMedia("(max-width: 900px)").matches ? [30, 30] : [50, 30],
    progressBarPosition: "bottom",
    sideBarPosition: "left",
    constraints: {
      fill: false,
      usePercentage: true,
      percentage: window.matchMedia("(max-width: 900px)").matches ? 100 : 90
    }
  };

  const state = loadSettings();
  const els = {
    root: document.documentElement,
    body: document.body,
    app: document.getElementById("app"),
    menu: document.querySelector(".menu"),
    reader: document.querySelector(".reader"),
    readerContent: document.querySelector(".readerContent"),
    readerInner: document.querySelector(".readerContent > div"),
    readerArticle: document.querySelector(".readerArticle"),
    readerBody: document.querySelector(".readerBody"),
    tocLinks: Array.from(document.querySelectorAll(".toc > div > a")),
    progressBar: document.getElementById("progressBar"),
    navArea: document.querySelector(".navArea"),
    navBar: document.getElementById("navBar"),
    chapterTitle: document.getElementById("chapterTitle"),
    maxIcon: document.querySelector(".max"),
    maxTooltip: document.querySelector(".max .tooltip-text"),
    closeBtn: document.getElementById("close-btn"),
    infoBtn: document.querySelector(".info"),
    widthBtn: document.getElementById("width-btn"),
    widthBtnText: document.querySelector("#width-btn p"),
    widthBtnIcon: document.querySelector("#width-btn iconify-icon"),
    settingsBtn: document.getElementById("settings-btn"),
    displaySettingsBtn: document.getElementById("displaySettings"),
    creditsBtn: document.getElementById("creditsBtn"),
    chapterNavBtns: Array.from(document.querySelectorAll(".back-btn, .go-btn")),
    imageContainer: document.querySelector(".imageContainer"),
    imageOverlay: document.querySelector("#imageOverlay"),
    imageOverlayImg: document.querySelector("#imageOverlay img"),
    menuContainer: document.querySelector(".menuContainer"),
    fontMenu: document.getElementById("fontMenu"),
    creditsMenu: document.getElementById("creditsMenu"),
    advancedMenu: document.getElementById("advancedMenu"),
    themeOptions: Array.from(document.querySelectorAll("#themeSelect > div")),
    fontSizeDisplay: document.querySelector("#fontSize > div"),
    increaseFont: document.querySelector(".increaseFont"),
    decreaseFont: document.querySelector(".decreaseFont"),
    lineSpacingInput: document.querySelector("#paragraphHeight input"),
    paragraphSpacingInput: document.querySelector("#paragraphSpacingControl input"),
    indentWidthInput: document.querySelector("#indentWidthControl input"),
    alignmentOptions: Array.from(document.querySelectorAll("#alignment > iconify-icon")),
    fontOptions: Array.from(document.querySelectorAll("#fonts > .menuFont")),
    indentSwitch: document.querySelector("#indentSwitch input[type='checkbox']"),
    marginX: document.querySelector("#margin > div:first-child"),
    marginY: document.querySelector("#margin > div:last-child"),
    progressOptions: Array.from(document.querySelectorAll("#progressContainer div > div")),
    sidebarOptions: Array.from(document.querySelectorAll("#sidebarContainer div > div")),
    fillSwitch: document.querySelector("#fillSwitch input[type='checkbox']"),
    percentSwitch: document.querySelector("#percentSwitch input[type='checkbox']"),
    widthRange: document.querySelector("#constraintContainer input[type='range']"),
    constraintLabel: document.querySelector("#constraintContainer h3")
  };

  const prevHref = els.body?.dataset.prevHref || "";
  const nextHref = els.body?.dataset.nextHref || "";
  const MODAL_FADE_MS = 320;
  const MODAL_SLIDE_MS = 420;
  const MODAL_CLOSE_MS = Math.max(MODAL_FADE_MS, MODAL_SLIDE_MS);
  let hideNavTimer;
  let navRevealTimer;

  function loadSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const parsedFontSize = Number(parsed.fontSize);
      const effectiveFontSize = Number.isFinite(parsedFontSize) && parsedFontSize > 0
        ? parsedFontSize
        : defaults.fontSize;
      const parsedParagraphSpacing = Number(parsed.paragraphSpacing);
      const paragraphSpacingEm = Number.isFinite(parsedParagraphSpacing)
        ? (parsedParagraphSpacing > 4 ? parsedParagraphSpacing / effectiveFontSize : parsedParagraphSpacing)
        : defaults.paragraphSpacing;
      const parsedIndentWidth = Number(parsed.indentWidth);

      return {
        ...defaults,
        ...parsed,
        lineSpacing: parsed.lineSpacing ?? parsed.spacing ?? defaults.lineSpacing,
        paragraphSpacing: Math.max(0, Math.min(4, paragraphSpacingEm)),
        indentWidth: Number.isFinite(parsedIndentWidth) ? Math.max(0, Math.min(4, parsedIndentWidth)) : defaults.indentWidth,
        constraints: {
          ...defaults.constraints,
          ...(parsed.constraints || {})
        }
      };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function setSelected(elements, matcher) {
    elements.forEach((el) => {
      el.classList.toggle("selected", matcher(el));
    });
  }

  function applyTheme() {
    THEMES.forEach((theme) => els.root.classList.remove(theme));
    els.root.classList.add(state.theme);
    setSelected(els.themeOptions, (el) => el.id === `theme-${state.theme}`);
  }

  function applyTypography() {
    if (!els.readerArticle) return;
    const bodyContainer = els.readerBody || els.readerArticle;
    els.readerArticle.style.fontSize = `${state.fontSize}px`;
    bodyContainer.style.lineHeight = String(state.lineSpacing);
    bodyContainer.style.textAlign = state.textAlign;
    els.readerArticle.style.fontFamily = FONTS[state.font] || FONTS.kanin;

    const paragraphs = Array.from(bodyContainer.querySelectorAll("p"));
    let skipIndentForNextParagraph = false;

    paragraphs.forEach((p, index) => {
      const hasCenteredMarker = Boolean(p.querySelector(".text-center"));
      p.style.margin = `${state.paragraphSpacing}em 0`;

      if (hasCenteredMarker) {
        p.style.textAlign = "center";
        p.style.textIndent = "0";
        skipIndentForNextParagraph = true;
        return;
      }

      p.style.textAlign = "";
      const shouldIndent = state.indent && index > 0 && !skipIndentForNextParagraph;
      p.style.textIndent = shouldIndent ? `${state.indentWidth}em` : "0";
      skipIndentForNextParagraph = false;
    });

    if (els.fontSizeDisplay) {
      els.fontSizeDisplay.textContent = String(state.fontSize);
    }
    if (els.lineSpacingInput) {
      els.lineSpacingInput.value = String(state.lineSpacing);
    }
    if (els.paragraphSpacingInput) {
      els.paragraphSpacingInput.value = String(state.paragraphSpacing);
    }
    if (els.indentSwitch) {
      els.indentSwitch.checked = state.indent;
    }
    if (els.indentWidthInput) {
      els.indentWidthInput.value = String(state.indentWidth);
      els.indentWidthInput.disabled = !state.indent;
    }

    setSelected(els.alignmentOptions, (el) => el.id === `align-${state.textAlign}`);
    setSelected(els.fontOptions, (el) => el.id === `font-${state.font}`);
  }

  function applyMargins() {
    if (!els.readerContent) return;
    const [x, y] = state.margins;
    els.readerContent.style.padding = `${y}px ${x}px calc(${y}px + 56px + 6vh)`;
    if (els.marginX) {
      els.marginX.textContent = String(x);
    }
    if (els.marginY) {
      els.marginY.textContent = String(y);
    }
  }

  function applyReaderLayout() {
    if (!els.reader) return;

    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    if (isMobile || !state.menuOpen) {
      els.reader.style.width = "100%";
      els.reader.style.marginLeft = "0";
      els.reader.style.marginRight = "0";
      return;
    }

    els.reader.style.width = "calc(100% - var(--menuWidth))";
    if (state.sideBarPosition === "right") {
      els.reader.style.marginLeft = "0";
      els.reader.style.marginRight = "var(--menuWidth)";
    } else {
      els.reader.style.marginLeft = "var(--menuWidth)";
      els.reader.style.marginRight = "0";
    }
  }

  function applyWidthConstraint() {
    if (!els.readerInner || !els.readerContent) return;
    const { fill, percentage } = state.constraints;
    const readerWidth = els.readerContent.clientWidth;
    if (fill) {
      els.readerInner.style.width = `${percentage}%`;
      els.readerInner.style.maxWidth = "none";
      if (els.widthBtnText) {
        els.widthBtnText.textContent = "Fill Width";
      }
      els.widthBtnIcon?.setAttribute("icon", "fluent:fixed-width-24-filled");
    } else {
      const px = Math.floor((readerWidth * percentage) / 100);
      els.readerInner.style.width = `${px}px`;
      els.readerInner.style.maxWidth = "100%";
      if (els.widthBtnText) {
        els.widthBtnText.textContent = "Contain Width";
      }
      els.widthBtnIcon?.setAttribute("icon", "fluent:auto-fit-width-20-regular");
    }

    if (els.fillSwitch) {
      els.fillSwitch.checked = fill;
    }
    if (els.widthRange) {
      els.widthRange.value = String(percentage);
      els.widthRange.style.setProperty("--range-progress", `${percentage}%`);
    }
    if (els.constraintLabel) {
      els.constraintLabel.textContent = `Constrain Width (${percentage}%)`;
    }
  }

  function applyProgressPosition() {
    if (!els.progressBar) return;
    els.progressBar.style.display = state.progressBarPosition === "none" ? "none" : "block";
    els.progressBar.style.top = state.progressBarPosition === "top" ? "0" : "initial";
    els.progressBar.style.bottom = state.progressBarPosition === "bottom" ? "0" : "initial";
    setSelected(els.progressOptions, (el) => el.id === `progress-${state.progressBarPosition}`);
  }

  function applySidebarPosition() {
    if (!els.menu || !els.reader) return;

    const isRight = state.sideBarPosition === "right";
    els.menu.classList.toggle("right", isRight);

    if (state.sideBarPosition === "right") {
      els.reader.after(els.menu);
    } else {
      els.reader.before(els.menu);
    }

    applyReaderLayout();
    setSelected(els.sidebarOptions, (el) => el.id === `sidebar-${state.sideBarPosition}`);
  }

  function applyMenuState() {
    if (!els.menu || !els.reader) return;
    els.menu.classList.toggle("hidden", !state.menuOpen);
    els.reader?.classList.toggle("menu-hidden", !state.menuOpen);
    els.maxIcon?.classList.toggle("hidden", state.menuOpen);
    applyReaderLayout();
  }

  function applyNavState() {
    if (!els.navBar || !els.navArea) return;
    els.navBar.classList.toggle("widget", state.minimizedNav);
    els.navBar.classList.toggle("minimized", state.minimizedNav);
    els.navArea.classList.toggle("minimized", state.minimizedNav);
    if (els.maxTooltip) {
      els.maxTooltip.textContent = state.minimizedNav ? "Press N to expand" : "Press N to minify";
    }
    if (els.chapterTitle) {
      els.chapterTitle.style.opacity = state.minimizedNav ? "0" : "1";
      els.chapterTitle.style.pointerEvents = state.minimizedNav ? "none" : "auto";
    }
  }

  function updateProgress() {
    if (!els.readerContent || !els.progressBar) return;
    const maxScroll = els.readerContent.scrollHeight - els.readerContent.clientHeight;
    const progress = maxScroll > 0 ? els.readerContent.scrollTop / maxScroll : 0;
    els.progressBar.style.transform = `scaleX(${progress})`;
  }

  function setModalVisible(modal, visible) {
    if (!els.menuContainer || !modal) return;
    if (visible) {
      els.menuContainer.style.display = "flex";
      modal.style.display = "flex";
      requestAnimationFrame(() => {
        els.menuContainer.classList.add("visible");
        modal.classList.add("visible");
      });
      return;
    }

    modal.classList.remove("visible");
    els.menuContainer.classList.remove("visible");
    setTimeout(() => {
      modal.style.display = "none";
      if (!document.querySelector(".menuChild.visible")) {
        els.menuContainer.style.display = "none";
      }
    }, MODAL_CLOSE_MS);
  }

  function closeAllModals() {
    const modals = [els.fontMenu, els.creditsMenu, els.advancedMenu];

    modals.forEach((modal) => {
      if (modal) {
        modal.classList.remove("visible");
      }
    });

    if (els.menuContainer) {
      els.menuContainer.classList.remove("visible");
    }

    setTimeout(() => {
      modals.forEach((modal) => {
        if (modal) {
          modal.style.display = "none";
        }
      });
      if (els.menuContainer && !document.querySelector(".menuChild.visible")) {
        els.menuContainer.style.display = "none";
      }
    }, MODAL_CLOSE_MS);
  }

  function toggleMenu(forceOpen) {
    state.menuOpen = typeof forceOpen === "boolean" ? forceOpen : !state.menuOpen;
    applyMenuState();
    saveSettings();
  }

  function toggleMinifiedNav(force) {
    state.minimizedNav = typeof force === "boolean" ? force : !state.minimizedNav;
    applyNavState();
    if (state.minimizedNav && els.navArea) {
      els.navArea.classList.add("show");
      clearTimeout(navRevealTimer);
      navRevealTimer = setTimeout(() => {
        if (state.minimizedNav) {
          els.navArea?.classList.remove("show");
        }
      }, 1600);
    }
    saveSettings();
  }

  function setupTocSelection() {
    const current = window.location.pathname;
    els.tocLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("select", href === current);
    });
  }

  function setupChapterNavigation() {
    const goTo = (href) => {
      if (!href) return;
      window.location.href = href;
    };
    els.chapterNavBtns.forEach((btn) => {
      const isBack = btn.classList.contains("back-btn");
      const disabled = isBack ? !prevHref : !nextHref;
      btn.classList.toggle("disabled", disabled);
      if (!disabled) {
        btn.addEventListener("click", () => goTo(isBack ? prevHref : nextHref));
      }
    });
  }

  function setupImageOverlay() {
    if (!els.readerArticle || !els.imageContainer || !els.imageOverlay || !els.imageOverlayImg) return;

    els.readerArticle.querySelectorAll("img").forEach((img) => {
      img.classList.add("readerInlineImage");
      img.addEventListener("click", () => {
        els.imageOverlayImg.src = img.currentSrc || img.src;
        els.imageContainer.style.display = "flex";
        requestAnimationFrame(() => {
          els.imageContainer.classList.add("visible");
          els.imageOverlay.classList.add("visible");
        });
      });
    });

    els.imageContainer.addEventListener("click", (event) => {
      if (event.target !== els.imageContainer && event.target !== els.imageOverlay) return;
      els.imageContainer.classList.remove("visible");
      els.imageOverlay.classList.remove("visible");
      setTimeout(() => {
        els.imageContainer.style.display = "none";
      }, 320);
    });
  }

  function bindSettingsControls() {
    els.themeOptions.forEach((option) => {
      option.addEventListener("click", () => {
        state.theme = option.id.replace("theme-", "");
        applyTheme();
        saveSettings();
      });
    });

    const setFontSize = (value) => {
      const n = Math.max(8, Math.min(48, value));
      state.fontSize = n;
      applyTypography();
      saveSettings();
    };

    els.increaseFont?.addEventListener("click", () => setFontSize(state.fontSize + 1));
    els.decreaseFont?.addEventListener("click", () => setFontSize(state.fontSize - 1));
    els.fontSizeDisplay?.addEventListener("blur", () => {
      const n = Number.parseInt(els.fontSizeDisplay.textContent || "", 10);
      setFontSize(Number.isNaN(n) ? state.fontSize : n);
    });

    els.lineSpacingInput?.addEventListener("change", () => {
      const n = Number.parseFloat(els.lineSpacingInput.value);
      state.lineSpacing = Number.isFinite(n) ? Math.max(1, Math.min(3, n)) : state.lineSpacing;
      applyTypography();
      saveSettings();
    });

    els.paragraphSpacingInput?.addEventListener("change", () => {
      const n = Number.parseFloat(els.paragraphSpacingInput.value);
      state.paragraphSpacing = Number.isFinite(n) ? Math.max(0, Math.min(4, n)) : state.paragraphSpacing;
      applyTypography();
      saveSettings();
    });

    els.alignmentOptions.forEach((icon) => {
      icon.addEventListener("click", () => {
        state.textAlign = icon.id.replace("align-", "");
        applyTypography();
        saveSettings();
      });
    });

    els.fontOptions.forEach((font) => {
      font.addEventListener("click", () => {
        state.font = font.id.replace("font-", "");
        applyTypography();
        saveSettings();
      });
    });

    els.indentSwitch?.addEventListener("change", () => {
      state.indent = els.indentSwitch.checked;
      applyTypography();
      saveSettings();
    });

    els.indentWidthInput?.addEventListener("change", () => {
      const n = Number.parseFloat(els.indentWidthInput.value);
      state.indentWidth = Number.isFinite(n) ? Math.max(0, Math.min(4, n)) : state.indentWidth;
      applyTypography();
      saveSettings();
    });

    const parseEditableNumber = (text, fallback) => {
      const normalized = (text || "").replace(/[^\d.-]/g, "").trim();
      const value = Number.parseInt(normalized, 10);
      return Number.isFinite(value) ? Math.max(0, value) : fallback;
    };

    const commitMargins = () => {
      const x = parseEditableNumber(els.marginX?.textContent, state.margins[0]);
      const y = parseEditableNumber(els.marginY?.textContent, state.margins[1]);
      state.margins = [x, y];
      applyMargins();
      saveSettings();
    };

    [els.marginX, els.marginY].forEach((el) => {
      el?.addEventListener("input", commitMargins);
      el?.addEventListener("blur", commitMargins);
      el?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          el.blur();
        }
      });
    });

    els.progressOptions.forEach((option) => {
      option.addEventListener("click", () => {
        state.progressBarPosition = option.id.replace("progress-", "");
        applyProgressPosition();
        saveSettings();
      });
    });

    els.sidebarOptions.forEach((option) => {
      option.addEventListener("click", () => {
        state.sideBarPosition = option.id.replace("sidebar-", "");
        applySidebarPosition();
        saveSettings();
      });
    });

    const updateFill = (fill) => {
      state.constraints.fill = fill;
      applyWidthConstraint();
      saveSettings();
    };

    els.widthBtn?.addEventListener("click", () => updateFill(!state.constraints.fill));
    els.fillSwitch?.addEventListener("change", () => updateFill(els.fillSwitch.checked));
    els.percentSwitch?.addEventListener("change", () => {
      state.constraints.usePercentage = els.percentSwitch.checked;
      saveSettings();
    });
    els.widthRange?.addEventListener("input", () => {
      state.constraints.percentage = Number.parseInt(els.widthRange.value, 10) || state.constraints.percentage;
      applyWidthConstraint();
      saveSettings();
    });
  }

  function bindUiEvents() {
    els.closeBtn?.addEventListener("click", () => toggleMenu(false));
    els.infoBtn?.addEventListener("click", () => toggleMenu(!state.menuOpen));
    els.maxIcon?.addEventListener("click", () => toggleMinifiedNav());

    els.displaySettingsBtn?.addEventListener("click", () => setModalVisible(els.fontMenu, true));
    els.settingsBtn?.addEventListener("click", () => setModalVisible(els.advancedMenu, true));
    els.creditsBtn?.addEventListener("click", () => setModalVisible(els.creditsMenu, true));

    document.querySelectorAll(".menuClose-btn").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => closeAllModals());
    });

    els.menuContainer?.addEventListener("click", (event) => {
      if (event.target === els.menuContainer) {
        closeAllModals();
      }
    });

    els.readerContent?.addEventListener("scroll", () => {
      updateProgress();
      if (!state.minimizedNav) return;
      els.navArea?.classList.add("show");
      clearTimeout(hideNavTimer);
      hideNavTimer = setTimeout(() => {
        if (state.minimizedNav) {
          els.navArea?.classList.remove("show");
        }
      }, 1800);
    });

    window.addEventListener("resize", () => {
      applyReaderLayout();
      applyWidthConstraint();
    });

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key === "m") {
        event.preventDefault();
        toggleMenu(!state.menuOpen);
      }
      if (key === "n" && !state.menuOpen) {
        event.preventDefault();
        toggleMinifiedNav();
      }
      if (event.key === "Escape") {
        closeAllModals();
      }
    });
  }

  function init() {
    applyTheme();
    applyTypography();
    applyMargins();
    applyProgressPosition();
    applySidebarPosition();
    applyMenuState();
    applyNavState();
    applyWidthConstraint();
    setupTocSelection();
    setupChapterNavigation();
    setupImageOverlay();
    bindSettingsControls();
    bindUiEvents();
    updateProgress();
  }

  init();
})();
