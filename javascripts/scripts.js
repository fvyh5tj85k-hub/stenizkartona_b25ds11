const boxes = Array.from(document.querySelectorAll(".box"));
const ticketBox = document.getElementById("ticketBox");
const overlay = document.getElementById("overlay");
const ticketFull = document.getElementById("ticketFull");
const cutStage = document.getElementById("cutStage");
const cutPanel = document.querySelector(".cut-panel");
const cutQuestionMark = document.getElementById("cutQuestionMark");
const helpOverlay = document.getElementById("helpOverlay");
const scissorsTool = document.getElementById("scissorsTool");
const fragileWindow = document.getElementById("fragileWindow");
const iconsWindow = document.getElementById("iconsWindow");
const graffitiWindow = document.getElementById("graffitiWindow");
const towerPanel = document.querySelector(".tower-panel");
const towerMeta = document.querySelector(".tower-meta");
const towerHelpButton = document.getElementById("towerHelpButton");
const towerHelpOverlay = document.getElementById("towerHelpOverlay");
const towerArena = document.getElementById("towerArena");
const towerStack = document.getElementById("towerStack");
const towerCurrentBox = document.getElementById("towerCurrentBox");
const towerSpawnLine = document.querySelector(".tower-spawn-line");
const towerScore = document.getElementById("towerScore");
const towerBest = document.getElementById("towerBest");
const towerMouseSlot = document.querySelector(".tower-mouse-slot");
const giftPanel = document.querySelector(".gift-panel");
const giftHelpButton = document.getElementById("giftHelpButton");
const giftHelpOverlay = document.getElementById("giftHelpOverlay");
const giftPrizeImage = document.getElementById("giftPrizeImage");
const giftGenerateButton = document.getElementById("giftGenerateButton");
const giftResetButton = document.getElementById("giftResetButton");
const decorateCanvasWrap = document.getElementById("decorateCanvasWrap");
const decorateBoxBase = document.querySelector(".decorate-box-base");
const decorateCanvas = document.getElementById("decorateCanvas");
const decorateColorButtons = Array.from(document.querySelectorAll(".decorate-color-swatch"));
const decorateMarkButtons = Array.from(document.querySelectorAll(".decorate-mark-button"));
const decorateUndoButton = document.getElementById("decorateUndoButton");
const cutThumbs = Array.from(document.querySelectorAll(".cut-thumb"));
const cutBasePaper = document.getElementById("cutBasePaper");
const cutFinishMessage = document.getElementById("cutFinishMessage");

let removedBoxes = 0;
let isTicketOpen = false;
let scissorsArmed = false;
let cutInProgress = false;
let activePointerId = null;
const assetVersion = "20260328r";

const cutSequence = [
  {
    paperSrc: "./images/cardboardPaper1.png",
    paperAlt: "Картон со звездой",
    cutoutSrc: "./images/star.png",
    cutoutAlt: "Вырезанная звезда",
  },
  {
    paperSrc: "./images/heart-paper.png",
    paperAlt: "Картон с сердцем",
    cutoutSrc: "./images/heart-cutout.png",
    cutoutAlt: "Вырезанное сердце",
  },
  {
    paperSrc: "./images/flower-paper.png",
    paperAlt: "Картон с цветком",
    cutoutSrc: "./images/flower-cutout.png",
    cutoutAlt: "Вырезанный цветок",
  },
  {
    paperSrc: "./images/house-paper.png",
    paperAlt: "Картон с домиком",
    cutoutSrc: "./images/house-cutout.png",
    cutoutAlt: "Вырезанный домик",
  },
  {
    paperSrc: "./images/mug-paper.png",
    paperAlt: "Картон с кружкой",
    cutoutSrc: "./images/mug-cutout.png",
    cutoutAlt: "Вырезанная кружка",
  },
];

let currentCutIndex = 0;
const maxCutIndex = 5;
const towerStorageKey = "tower-best-score";
const towerMaxBoxes = Number.POSITIVE_INFINITY;
const towerFloorInset = 26;
const towerFloorInsetMobile = 42;
const towerStackTighten = 0;
const towerSafeTop = 190;
const towerAssets = [
  { src: "./images/tower-box-1.png", alt: "Длинная коробка", width: 214, ratio: 1326 / 3500 },
  { src: "./images/tower-box-2.png", alt: "Коробка-звезда", width: 144, ratio: 1280 / 1277 },
  { src: "./images/tower-box-3.png", alt: "Шестиугольная коробка fragile", width: 154, ratio: 2480 / 2653 },
  { src: "./images/tower-box-4.png", alt: "Ромбовидная коробка", width: 182, ratio: 2142 / 3500 },
  { src: "./images/tower-box-5.png", alt: "Квадратная коробка fragile", width: 166, ratio: 2480 / 2475 },
];
const giftPrizes = [
  { src: "./images/gift-present-1.png", alt: "Стул", className: "gift-prize--large" },
  { src: "./images/gift-present-2.png", alt: "Букет цветов", className: "gift-prize--large" },
  { src: "./images/gift-present-3.png", alt: "Машина", className: "gift-prize--xlarge" },
  { src: "./images/gift-present-4.png", alt: "Монитор", className: "gift-prize--medium" },
  { src: "./images/gift-present-5.png", alt: "Плюшевый мишка", className: "gift-prize--medium" },
  { src: "./images/gift-present-6.png", alt: "Стакан кофе", className: "gift-prize--medium" },
  { src: "./images/gift-present-7.png", alt: "Микрофон", className: "gift-prize--medium" },
];
const decorateLineWidths = {
  color: 26,
};
const decorateStampSources = {
  recycle: "./images/mark-recycle.png",
  arrow: "./images/mark-arrow.png",
  umbrella: "./images/mark-umbrella.png",
};
let towerAnimationFrame = 0;
let towerPreviousTimestamp = 0;
let towerCurrent = null;
let towerPlaced = [];
let towerIsResetting = false;
let towerScoreValue = 0;
let towerBestValue = 0;
let towerCameraOffset = 0;
let currentGiftPrize = null;
let decorateActiveColor = "#8B9A9F";
let decorateActiveStamp = null;
let decorateIsPainting = false;
let decoratePointerId = null;
let decorateActions = [];
let decorateCurrentAction = null;
let decorateMaskCanvas = null;
const decorateStampImages = {};

const withVersion = (src) => `${src}?v=${assetVersion}`;

const loadTowerBest = () => {
  try {
    const stored = Number.parseInt(window.localStorage.getItem(towerStorageKey) || "0", 10);
    return Number.isFinite(stored) ? stored : 0;
  } catch (error) {
    return 0;
  }
};

const saveTowerBest = (value) => {
  try {
    window.localStorage.setItem(towerStorageKey, String(value));
  } catch (error) {
    // Ignore storage failures.
  }
};

const setTowerStats = () => {
  towerScore.textContent = String(towerScoreValue);
  towerBest.textContent = String(towerBestValue);
};

const randomTowerAsset = () => {
  const randomIndex = Math.floor(Math.random() * towerAssets.length);
  return towerAssets[randomIndex];
};

const isMobileTowerLayout = () => window.matchMedia("(max-width: 700px)").matches;

const getTowerFlightBounds = (width) => {
  const arenaRect = towerArena.getBoundingClientRect();
  const arenaWidth = towerArena.clientWidth;

  if (isMobileTowerLayout()) {
    const sidePadding = 12;
    return {
      minX: sidePadding,
      maxX: Math.max(sidePadding, arenaWidth - width - sidePadding),
    };
  }

  let minX = 0;
  let maxX = Math.max(0, arenaWidth - width);

  if (towerMeta) {
    const metaRect = towerMeta.getBoundingClientRect();
    const metaRightInsideArena = metaRect.right - arenaRect.left;
    minX = Math.max(minX, metaRightInsideArena + 36);
  }

  if (towerMouseSlot) {
    const mouseRect = towerMouseSlot.getBoundingClientRect();
    const mouseLeftInsideArena = mouseRect.left - arenaRect.left;
    maxX = Math.min(maxX, mouseLeftInsideArena - width - 30);
  }

  if (maxX < minX) {
    const fallbackMin = Math.max(0, arenaWidth * 0.28);
    const fallbackMax = Math.max(fallbackMin, arenaWidth - width - 120);
    return {
      minX: fallbackMin,
      maxX: fallbackMax,
    };
  }

  return { minX, maxX };
};

const renderTowerCurrentBox = () => {
  if (!towerCurrent) {
    towerCurrentBox.removeAttribute("src");
    towerCurrentBox.alt = "";
    towerCurrentBox.style.opacity = "0";
    towerCurrentBox.style.display = "none";
    return;
  }

  towerCurrentBox.src = withVersion(towerCurrent.asset.src);
  towerCurrentBox.alt = towerCurrent.asset.alt;
  towerCurrentBox.style.width = `${towerCurrent.width}px`;
  towerCurrentBox.style.height = `${towerCurrent.height}px`;
  towerCurrentBox.style.left = `${towerCurrent.x}px`;
  towerCurrentBox.style.top = `${towerCurrent.y}px`;
  towerCurrentBox.style.opacity = "1";
  towerCurrentBox.style.display = "block";
};

const syncTowerPlacedBoxPosition = (boxData) => {
  if (!boxData.element) {
    return;
  }

  boxData.element.style.left = `${boxData.x}px`;
  boxData.element.style.top = `${boxData.y + towerCameraOffset}px`;
};

const syncTowerPlacedPositions = () => {
  towerPlaced.forEach(syncTowerPlacedBoxPosition);
};

const updateTowerCameraOffset = () => {
  if (towerPlaced.length === 0) {
    towerCameraOffset = 0;
    return;
  }

  const topBox = towerPlaced[towerPlaced.length - 1];
  const desiredOffset = Math.max(0, towerSafeTop - topBox.y);
  towerCameraOffset = desiredOffset;
};

const createTowerPlacedBox = (boxData) => {
  const image = document.createElement("img");
  image.className = "tower-box";
  image.src = withVersion(boxData.asset.src);
  image.alt = boxData.asset.alt;
  image.style.width = `${boxData.width}px`;
  image.style.height = `${boxData.height}px`;
  towerStack.appendChild(image);
  boxData.element = image;
  syncTowerPlacedBoxPosition(boxData);
};

const getTowerFloorY = (height) => {
  const floorInset = isMobileTowerLayout() ? towerFloorInsetMobile : towerFloorInset;
  return towerArena.clientHeight - floorInset - height;
};

const getTowerSpawnY = (height) => {
  const floorY = getTowerFloorY(height);
  const minimumSpawnY = isMobileTowerLayout() ? 8 : -height * 0.6;

  if (!towerSpawnLine) {
    return Math.max(minimumSpawnY, floorY - 120);
  }

  const arenaRect = towerArena.getBoundingClientRect();
  const lineRect = towerSpawnLine.getBoundingClientRect();
  const lineTop = lineRect.top - arenaRect.top;
  return Math.max(minimumSpawnY, Math.min(lineTop, floorY - 24));
};

const spawnTowerBox = () => {
  if (towerIsResetting) {
    return;
  }

  const asset = randomTowerAsset();
  const arenaWidth = towerArena.clientWidth;

  if (arenaWidth < 120) {
    window.requestAnimationFrame(spawnTowerBox);
    return;
  }

  const width = Math.min(asset.width, Math.max(100, arenaWidth * 0.26));
  const height = width * asset.ratio;
  const { minX, maxX } = getTowerFlightBounds(width);
  const spawnY = getTowerSpawnY(height);

  towerCurrent = {
    asset,
    width,
    height,
    x: Math.round((minX + maxX) * 0.5),
    y: spawnY,
    direction: Math.random() > 0.5 ? 1 : -1,
    moveSpeed: 250,
    dropSpeed: 980,
    mode: "moving",
    targetY: spawnY,
    shouldStack: true,
    minX,
    maxX,
  };

  renderTowerCurrentBox();
};

const clearTowerStack = () => {
  towerPlaced.forEach((box) => {
    if (box.element) {
      box.element.remove();
    }
  });
  towerPlaced = [];
};

const resetTowerGame = () => {
  towerIsResetting = false;
  towerPanel.classList.remove("is-resetting");
  towerScoreValue = 0;
  towerCameraOffset = 0;
  clearTowerStack();
  towerCurrent = null;
  setTowerStats();
  spawnTowerBox();
};

const scheduleTowerReset = () => {
  towerIsResetting = true;
  towerPanel.classList.add("is-resetting");

  window.setTimeout(() => {
    resetTowerGame();
  }, 1000);
};

const settleTowerBox = () => {
  if (!towerCurrent) {
    return;
  }

  const settledBox = {
    asset: towerCurrent.asset,
    width: towerCurrent.width,
    height: towerCurrent.height,
    x: towerCurrent.x,
    y: towerCurrent.y,
  };

  if (towerCurrent.shouldStack) {
    createTowerPlacedBox(settledBox);
    towerPlaced.push(settledBox);
    towerScoreValue += 1;
    towerBestValue = Math.max(towerBestValue, towerScoreValue);
    saveTowerBest(towerBestValue);
    updateTowerCameraOffset();
    syncTowerPlacedPositions();

    setTowerStats();
    towerCurrent = null;

    if (towerPlaced.length >= towerMaxBoxes) {
      renderTowerCurrentBox();
      return;
    }

    window.setTimeout(() => {
      if (!towerIsResetting) {
        spawnTowerBox();
      }
    }, 160);
    return;
  }

  towerCurrent = null;
  renderTowerCurrentBox();
  scheduleTowerReset();
};

const startTowerDrop = () => {
  if (!towerCurrent || towerCurrent.mode !== "moving" || towerIsResetting) {
    return;
  }

  const previousBox = towerPlaced[towerPlaced.length - 1];

  if (!previousBox) {
    towerCurrent.mode = "dropping";
    towerCurrent.shouldStack = true;
    towerCurrent.targetY = getTowerFloorY(towerCurrent.height);
    return;
  }

  const currentLeft = towerCurrent.x;
  const currentRight = currentLeft + towerCurrent.width;
  const previousLeft = previousBox.x;
  const previousRight = previousLeft + previousBox.width;
  const overlap = Math.min(currentRight, previousRight) - Math.max(currentLeft, previousLeft);
  const minimumOverlap = Math.min(towerCurrent.width, previousBox.width) * 0.28;
  const hasHit = overlap >= minimumOverlap;

  towerCurrent.mode = "dropping";
  towerCurrent.shouldStack = hasHit;
  towerCurrent.targetY = hasHit
    ? previousBox.y - towerCurrent.height + towerStackTighten
    : getTowerFloorY(towerCurrent.height);
};

const updateTowerLoop = (timestamp) => {
  if (!towerPreviousTimestamp) {
    towerPreviousTimestamp = timestamp;
  }

  const deltaSeconds = Math.min((timestamp - towerPreviousTimestamp) / 1000, 0.032);
  towerPreviousTimestamp = timestamp;

  if (towerCurrent && !towerIsResetting) {
    if (towerCurrent.mode === "moving") {
      const { minX, maxX } = getTowerFlightBounds(towerCurrent.width);
      towerCurrent.minX = minX;
      towerCurrent.maxX = maxX;
      towerCurrent.x += towerCurrent.direction * towerCurrent.moveSpeed * deltaSeconds;

      if (towerCurrent.x <= minX) {
        towerCurrent.x = minX;
        towerCurrent.direction = 1;
      } else if (towerCurrent.x >= maxX) {
        towerCurrent.x = maxX;
        towerCurrent.direction = -1;
      }
    }

    if (towerCurrent.mode === "dropping") {
      towerCurrent.y += towerCurrent.dropSpeed * deltaSeconds;

      if (towerCurrent.y >= towerCurrent.targetY) {
        towerCurrent.y = towerCurrent.targetY;
        renderTowerCurrentBox();
        settleTowerBox();
      }
    }

    renderTowerCurrentBox();
  }

  towerAnimationFrame = window.requestAnimationFrame(updateTowerLoop);
};

const openTowerHelp = () => {
  towerHelpOverlay.classList.add("is-active");
  towerHelpOverlay.setAttribute("aria-hidden", "false");
};

const closeTowerHelp = () => {
  towerHelpOverlay.classList.remove("is-active");
  towerHelpOverlay.setAttribute("aria-hidden", "true");
};

const openGiftHelp = () => {
  giftHelpOverlay.classList.add("is-active");
  giftHelpOverlay.setAttribute("aria-hidden", "false");
};

const closeGiftHelp = () => {
  giftHelpOverlay.classList.remove("is-active");
  giftHelpOverlay.setAttribute("aria-hidden", "true");
};

const randomGiftPrize = () => {
  const randomIndex = Math.floor(Math.random() * giftPrizes.length);
  return giftPrizes[randomIndex];
};

const resetGiftGenerator = () => {
  currentGiftPrize = null;
  giftPanel.classList.remove("is-generated");
  giftPrizeImage.removeAttribute("src");
  giftPrizeImage.alt = "";
  giftPrizeImage.className = "gift-stage-image gift-stage-image--prize";
  giftGenerateButton.disabled = false;
  giftResetButton.disabled = true;
};

const generateGiftPrize = () => {
  if (currentGiftPrize) {
    return;
  }

  currentGiftPrize = randomGiftPrize();
  giftPrizeImage.src = withVersion(currentGiftPrize.src);
  giftPrizeImage.alt = currentGiftPrize.alt;
  giftPrizeImage.className = `gift-stage-image gift-stage-image--prize ${currentGiftPrize.className || ""}`.trim();
  giftPanel.classList.add("is-generated");
  giftGenerateButton.disabled = true;
  giftResetButton.disabled = false;
};

const getDecorateContext = () => decorateCanvas.getContext("2d");

const resizeDecorateCanvas = () => {
  const rect = decorateCanvasWrap.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  decorateCanvas.width = Math.round(rect.width * dpr);
  decorateCanvas.height = Math.round(rect.height * dpr);
  decorateCanvas.style.width = `${rect.width}px`;
  decorateCanvas.style.height = `${rect.height}px`;

  const context = getDecorateContext();
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.lineCap = "round";
  context.lineJoin = "round";
  redrawDecorateBoard();
};

const setDecorateActiveColor = (button) => {
  decorateActiveColor = button.dataset.color;
  decorateActiveStamp = null;
  decorateColorButtons.forEach((item) => item.classList.toggle("is-active", item === button));
  decorateMarkButtons.forEach((item) => item.classList.remove("is-active"));
};

const setDecorateActiveStamp = (button) => {
  decorateActiveStamp = button.dataset.stamp;
  decorateMarkButtons.forEach((item) => item.classList.toggle("is-active", item === button));
  decorateColorButtons.forEach((item) => item.classList.remove("is-active"));
};

const getDecorateNormalizedPoint = (point) => {
  const rect = decorateCanvas.getBoundingClientRect();
  return {
    x: rect.width > 0 ? point.x / rect.width : 0,
    y: rect.height > 0 ? point.y / rect.height : 0,
  };
};

const getDecorateAbsolutePoint = (point) => {
  const rect = decorateCanvas.getBoundingClientRect();
  return {
    x: point.x * rect.width,
    y: point.y * rect.height,
  };
};

const getDecoratePoint = (event) => {
  const rect = decorateCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const ensureDecorateMask = () => {
  if (
    decorateMaskCanvas ||
    !decorateBoxBase ||
    !decorateBoxBase.complete ||
    !decorateBoxBase.naturalWidth ||
    !decorateBoxBase.naturalHeight
  ) {
    return;
  }

  decorateMaskCanvas = document.createElement("canvas");
  decorateMaskCanvas.width = decorateBoxBase.naturalWidth;
  decorateMaskCanvas.height = decorateBoxBase.naturalHeight;
  const maskContext = decorateMaskCanvas.getContext("2d");
  maskContext.drawImage(decorateBoxBase, 0, 0, decorateMaskCanvas.width, decorateMaskCanvas.height);
};

const isDecoratePointInsideBox = (point) => {
  ensureDecorateMask();

  if (!decorateMaskCanvas) {
    return true;
  }

  const sampleX = Math.max(
    0,
    Math.min(decorateMaskCanvas.width - 1, Math.round((point.x / decorateCanvas.clientWidth) * decorateMaskCanvas.width)),
  );
  const sampleY = Math.max(
    0,
    Math.min(decorateMaskCanvas.height - 1, Math.round((point.y / decorateCanvas.clientHeight) * decorateMaskCanvas.height)),
  );
  const maskContext = decorateMaskCanvas.getContext("2d");
  const pixel = maskContext.getImageData(sampleX, sampleY, 1, 1).data;
  return pixel[3] > 20;
};

const drawDecorateDot = (x, y, color, radius) => {
  const context = getDecorateContext();
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
};

const drawDecorateLine = (fromPoint, toPoint, style, width) => {
  const context = getDecorateContext();
  context.strokeStyle = style;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(fromPoint.x, fromPoint.y);
  context.lineTo(toPoint.x, toPoint.y);
  context.stroke();
};

const getDecorateStampImage = (stamp) => decorateStampImages[stamp] || null;

const getDecorateStampSize = () => {
  const rect = decorateCanvas.getBoundingClientRect();
  return Math.max(54, rect.width * 0.18);
};

const drawDecorateStamp = (action) => {
  const image = getDecorateStampImage(action.stamp);
  if (!image || !image.complete) {
    return;
  }

  const point = getDecorateAbsolutePoint(action.point);
  const size = getDecorateStampSize();
  const width = size;
  const height = size * (image.naturalHeight / image.naturalWidth);
  const context = getDecorateContext();
  context.drawImage(image, point.x - (width / 2), point.y - (height / 2), width, height);
};

const drawDecorateAction = (action) => {
  if (!action) {
    return;
  }

  if (action.type === "stamp") {
    drawDecorateStamp(action);
    return;
  }

  if (action.points.length === 0) {
    return;
  }

  const points = action.points.map(getDecorateAbsolutePoint);
  const width = decorateLineWidths.color;
  const radius = width / 2;
  const firstPoint = points[0];
  drawDecorateDot(firstPoint.x, firstPoint.y, action.color, radius);

  for (let index = 1; index < points.length; index += 1) {
    const fromPoint = points[index - 1];
    const toPoint = points[index];
    drawDecorateLine(fromPoint, toPoint, action.color, width);
    drawDecorateDot(toPoint.x, toPoint.y, action.color, radius);
  }
};

const redrawDecorateBoard = () => {
  const context = getDecorateContext();
  const rect = decorateCanvas.getBoundingClientRect();
  context.clearRect(0, 0, rect.width, rect.height);
  decorateActions.forEach(drawDecorateAction);

  if (decorateCurrentAction) {
    drawDecorateAction(decorateCurrentAction);
  }

  if (decorateBoxBase && decorateBoxBase.complete) {
    context.save();
    context.globalCompositeOperation = "destination-in";
    context.drawImage(decorateBoxBase, 0, 0, rect.width, rect.height);
    context.restore();
  }
};

const loadDecorateStampImages = () => {
  Object.entries(decorateStampSources).forEach(([key, source]) => {
    const image = new Image();
    image.decoding = "async";
    image.src = withVersion(source);
    image.addEventListener("load", redrawDecorateBoard, { once: true });
    decorateStampImages[key] = image;
  });
};

const startDecorateAction = (event) => {
  const point = getDecoratePoint(event);
  if (!isDecoratePointInsideBox(point)) {
    return;
  }

  if (decorateActiveStamp) {
    decorateActions.push({
      type: "stamp",
      stamp: decorateActiveStamp,
      point: getDecorateNormalizedPoint(point),
    });
    redrawDecorateBoard();
    return;
  }

  decorateIsPainting = true;
  decoratePointerId = event.pointerId;
  decorateCanvas.setPointerCapture(event.pointerId);
  decorateCurrentAction = { type: "color", color: decorateActiveColor, points: [getDecorateNormalizedPoint(point)] };

  redrawDecorateBoard();
};

const extendDecorateAction = (event) => {
  if (!decorateCurrentAction || event.pointerId !== decoratePointerId) {
    return;
  }

  const point = getDecoratePoint(event);
  if (!isDecoratePointInsideBox(point)) {
    redrawDecorateBoard();
    return;
  }

  decorateCurrentAction.points.push(getDecorateNormalizedPoint(point));
  redrawDecorateBoard();
};

const finishDecorateAction = (event) => {
  if (!decorateIsPainting || event.pointerId !== decoratePointerId) {
    return;
  }

  if (decorateCanvas.hasPointerCapture(event.pointerId)) {
    decorateCanvas.releasePointerCapture(event.pointerId);
  }

  if (decorateCurrentAction && decorateCurrentAction.points.length > 0) {
    decorateActions.push(decorateCurrentAction);
  }

  decorateIsPainting = false;
  decoratePointerId = null;
  decorateCurrentAction = null;
  redrawDecorateBoard();
};

const undoDecorateAction = () => {
  if (decorateCurrentAction) {
    decorateCurrentAction = null;
    decorateIsPainting = false;
    decoratePointerId = null;
    redrawDecorateBoard();
    return;
  }

  decorateActions.pop();
  redrawDecorateBoard();
};

const pressTowerMouse = () => {
  towerPanel.classList.add("is-clicking");
};

const releaseTowerMouse = () => {
  towerPanel.classList.remove("is-clicking");
};
 
const setTicketStartPoint = () => {
  const rect = ticketBox.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  overlay.style.setProperty("--ticket-start-left", `${centerX}px`);
  overlay.style.setProperty("--ticket-start-top", `${centerY}px`);
  overlay.style.setProperty("--ticket-start-width", `${Math.max(rect.width * 0.72, 120)}px`);
};

const openTicket = () => {
  if (!ticketBox.classList.contains("is-visible") || isTicketOpen) {
    return;
  }

  isTicketOpen = true;
  setTicketStartPoint();
  document.body.classList.add("ticket-open");
  overlay.classList.add("is-active");
  overlay.setAttribute("aria-hidden", "false");
};

const closeTicket = () => {
  if (!isTicketOpen) {
    return;
  }

  isTicketOpen = false;
  document.body.classList.remove("ticket-open");
  overlay.classList.remove("is-active");
  overlay.setAttribute("aria-hidden", "true");
};

const openHelp = () => {
  helpOverlay.classList.add("is-active");
  helpOverlay.setAttribute("aria-hidden", "false");
};

const closeHelp = () => {
  helpOverlay.classList.remove("is-active");
  helpOverlay.setAttribute("aria-hidden", "true");
};

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (box.classList.contains("is-removed")) {
      return;
    }

    box.classList.add("is-removed");
    removedBoxes += 1;

    if (removedBoxes === boxes.length) {
      ticketBox.classList.add("is-visible");
      setTicketStartPoint();
    }
  });
});

ticketBox.addEventListener("click", openTicket);

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) {
    closeTicket();
  }
});

window.addEventListener("resize", () => {
  if (ticketBox.classList.contains("is-visible")) {
    setTicketStartPoint();
  }
});

ticketFull.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

const updateScissorsCursorPosition = (clientX, clientY) => {
  scissorsTool.style.setProperty("--scissors-cursor-x", `${clientX - 58}px`);
  scissorsTool.style.setProperty("--scissors-cursor-y", `${clientY - 42}px`);
};

const resetScissorsPosition = () => {
  scissorsTool.style.removeProperty("--scissors-cursor-x");
  scissorsTool.style.removeProperty("--scissors-cursor-y");
};

const renderCutScene = () => {
  const isComplete = currentCutIndex >= cutSequence.length;

  cutStage.classList.toggle("is-complete", isComplete);
  cutPanel.classList.toggle("is-complete", isComplete);

  if (!isComplete) {
    const activeStep = cutSequence[currentCutIndex];
    cutBasePaper.src = withVersion(activeStep.paperSrc);
    cutBasePaper.alt = activeStep.paperAlt;
  } else {
    cutBasePaper.removeAttribute("src");
    cutBasePaper.alt = "";
  }

  cutThumbs.forEach((thumb, index) => {
    const thumbImage = thumb.querySelector("img");
    const step = cutSequence[index];

    thumb.classList.remove("is-active", "is-completed");

    if (!thumbImage || !step) {
      return;
    }

    if (index < currentCutIndex) {
      thumb.classList.add("is-completed");
      thumbImage.src = withVersion(step.cutoutSrc);
      thumbImage.alt = step.cutoutAlt;
      return;
    }

    thumbImage.src = withVersion(step.paperSrc);
    thumbImage.alt = step.paperAlt;

    if (index === currentCutIndex) {
      thumb.classList.add("is-active");
    }
  });
};

const syncCutSidebar = () => {
  renderCutScene();
};

const armScissors = () => {
  if (currentCutIndex >= maxCutIndex) {
    return;
  }

  scissorsArmed = true;
  scissorsTool.classList.add("is-armed");
  scissorsTool.setAttribute("aria-pressed", "true");
};

const disarmScissors = () => {
  scissorsArmed = false;
  activePointerId = null;
  scissorsTool.classList.remove("is-armed");
  scissorsTool.setAttribute("aria-pressed", "false");
  resetScissorsPosition();
};

const finishCutting = () => {
  cutStage.classList.remove("is-cutting");
  cutStage.classList.add("is-switching");

  window.setTimeout(() => {
    currentCutIndex = Math.min(currentCutIndex + 1, maxCutIndex);

    renderCutScene();
    cutStage.classList.remove("is-switching");
    cutInProgress = false;
    disarmScissors();
  }, 420);
};

const startCutting = () => {
  if (!scissorsArmed || cutInProgress || currentCutIndex >= maxCutIndex) {
    return;
  }

  cutInProgress = true;
  cutStage.classList.add("is-cutting");

  window.setTimeout(finishCutting, 500);
};

scissorsTool.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

scissorsTool.addEventListener("pointerdown", (event) => {
  if (currentCutIndex >= maxCutIndex) {
    return;
  }

  activePointerId = event.pointerId;
  armScissors();
  scissorsTool.setPointerCapture(event.pointerId);
  event.preventDefault();
});

scissorsTool.addEventListener("pointermove", (event) => {
  if (!scissorsArmed || event.pointerId !== activePointerId) {
    return;
  }
});

const releaseScissors = (event) => {
  if (!scissorsArmed || event.pointerId !== activePointerId) {
    return;
  }

  if (scissorsTool.hasPointerCapture(event.pointerId)) {
    scissorsTool.releasePointerCapture(event.pointerId);
  }

  disarmScissors();
};

scissorsTool.addEventListener("pointerup", releaseScissors);
scissorsTool.addEventListener("pointercancel", releaseScissors);

window.addEventListener("pointermove", (event) => {
  if (!scissorsArmed || event.pointerId !== activePointerId) {
    return;
  }

  updateScissorsCursorPosition(event.clientX, event.clientY);

  const stageRect = cutStage.getBoundingClientRect();
  const insideStage =
    event.clientX >= stageRect.left &&
    event.clientX <= stageRect.right &&
    event.clientY >= stageRect.top &&
    event.clientY <= stageRect.bottom;

  if (insideStage) {
    startCutting();
  }
});

window.addEventListener("pointerup", releaseScissors);
window.addEventListener("pointercancel", releaseScissors);

cutQuestionMark.addEventListener("click", openHelp);

helpOverlay.addEventListener("click", (event) => {
  if (event.target === helpOverlay) {
    closeHelp();
  }
});

fragileWindow.addEventListener("click", () => {
  const isOpen = fragileWindow.classList.toggle("is-open");
  fragileWindow.setAttribute("aria-pressed", String(isOpen));
});

iconsWindow.addEventListener("click", () => {
  const isOpen = iconsWindow.classList.toggle("is-open");
  iconsWindow.setAttribute("aria-pressed", String(isOpen));
});

graffitiWindow.addEventListener("click", () => {
  const isOpen = graffitiWindow.classList.toggle("is-open");
  graffitiWindow.setAttribute("aria-pressed", String(isOpen));
});

towerHelpButton.addEventListener("click", openTowerHelp);

towerHelpOverlay.addEventListener("click", (event) => {
  if (event.target === towerHelpOverlay) {
    closeTowerHelp();
  }
});

giftHelpButton.addEventListener("click", openGiftHelp);

giftHelpOverlay.addEventListener("click", (event) => {
  if (event.target === giftHelpOverlay) {
    closeGiftHelp();
  }
});

giftGenerateButton.addEventListener("click", generateGiftPrize);
giftResetButton.addEventListener("click", resetGiftGenerator);

decorateColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDecorateActiveColor(button);
  });
});

decorateMarkButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDecorateActiveStamp(button);
  });
});

decorateCanvas.addEventListener("pointerdown", (event) => {
  startDecorateAction(event);
});

decorateCanvas.addEventListener("pointermove", (event) => {
  if (!decorateIsPainting) {
    return;
  }

  extendDecorateAction(event);
});

decorateCanvas.addEventListener("pointerup", finishDecorateAction);
decorateCanvas.addEventListener("pointercancel", finishDecorateAction);
window.addEventListener("pointerup", finishDecorateAction);
window.addEventListener("pointercancel", finishDecorateAction);

decorateUndoButton.addEventListener("click", undoDecorateAction);

towerPanel.addEventListener("click", (event) => {
  if (
    towerMeta.contains(event.target) ||
    towerHelpButton.contains(event.target) ||
    towerMouseSlot.contains(event.target)
  ) {
    return;
  }

  startTowerDrop();
});

towerPanel.addEventListener("pointerdown", (event) => {
  if (
    towerMeta.contains(event.target) ||
    towerHelpButton.contains(event.target) ||
    towerMouseSlot.contains(event.target)
  ) {
    return;
  }

  pressTowerMouse();
});

window.addEventListener("pointerup", releaseTowerMouse);
window.addEventListener("pointercancel", releaseTowerMouse);

window.addEventListener("resize", () => {
  if (towerPlaced.length > 0 || towerCurrent) {
    resetTowerGame();
  }

  resizeDecorateCanvas();
});

if (decorateBoxBase) {
  decorateBoxBase.addEventListener("load", () => {
    decorateMaskCanvas = null;
    redrawDecorateBoard();
  });
}

renderCutScene();
resetScissorsPosition();
towerBestValue = loadTowerBest();
loadDecorateStampImages();
setTowerStats();
spawnTowerBox();
towerAnimationFrame = window.requestAnimationFrame(updateTowerLoop);
resetGiftGenerator();
resizeDecorateCanvas();
if (decorateColorButtons[0]) {
  setDecorateActiveColor(decorateColorButtons[0]);
}

// i am making changes
// i am making changes
