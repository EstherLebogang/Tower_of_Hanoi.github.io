let moveCount = 0;
let draggedDisk = null;
let diskTotal = 3;
let timer = 0;
let timerInterval = null;

const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkModeToggle.textContent = document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

function createDisk(size) {
  const disk = document.createElement("div");
  disk.classList.add("disk", `disk-${size}`);
  disk.setAttribute("data-size", size);
  disk.setAttribute("draggable", true);
  disk.addEventListener("dragstart", dragStart);
  disk.addEventListener("dragend", dragEnd);

  disk.addEventListener('touchstart', touchStart, {passive: false});
  disk.addEventListener('touchmove', touchMove, {passive: false});
  disk.addEventListener('touchend', touchEnd);

  return disk;
}

function initializeGame() {
  moveCount = 0;
  timer = 0;
  clearInterval(timerInterval);
  document.getElementById("moveCount").textContent = moveCount;
  document.getElementById("timer").textContent = formatTime(timer);

  diskTotal = parseInt(document.getElementById("diskCount").value);
  const rods = [rod1, rod2, rod3];

  rods.forEach(rod => {
    [...rod.querySelectorAll(".disk")].forEach(disk => disk.remove());
    rod.addEventListener("dragover", dragOver);
    rod.addEventListener("drop", drop);
    rod.addEventListener("touchend", rodTouchEnd);
  });

  for (let i = diskTotal; i >= 1; i--) {
    rods[0].appendChild(createDisk(i));
  }

  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent = formatTime(timer);
  }, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function dragStart(e) {
  const disk = e.target;
  if (disk !== disk.parentElement.lastElementChild) return;
  draggedDisk = disk;
  setTimeout(() => disk.classList.add("dragging"), 0);
}

function dragEnd() {
  if (draggedDisk) {
    draggedDisk.classList.remove("dragging");
    draggedDisk = null;
  }
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  if (!draggedDisk) return;

  const targetRod = e.currentTarget;
  const topDisk = [...targetRod.querySelectorAll(".disk")].pop();
  const draggedSize = parseInt(draggedDisk.getAttribute("data-size"));
  const topSize = topDisk ? parseInt(topDisk.getAttribute("data-size")) : Infinity;

  if (draggedSize < topSize) {
    draggedDisk.parentElement.removeChild(draggedDisk);
    targetRod.appendChild(draggedDisk);
    moveCount++;
    document.getElementById("moveCount").textContent = moveCount;
    checkWinCondition();
  }
}

function checkWinCondition() {
  const rod3 = document.getElementById("rod3");
  const disks = rod3.querySelectorAll(".disk");
  if (disks.length === diskTotal) {
    clearInterval(timerInterval);
    setTimeout(() => {
      alert(`🎉 You Won in ${moveCount} moves and ${formatTime(timer)}!`);
    }, 200);
  }
}

function restartGame() {
  initializeGame();
}

let touchData = {
  disk: null, startX: 0, startY: 0, currentX: 0, currentY: 0, originalParent: null
};

function touchStart(e) {
  const disk = e.target;
  if (disk !== disk.parentElement.lastElementChild) return;
  const touch = e.touches[0];
  touchData.disk = disk;
  touchData.originalParent = disk.parentElement;
  touchData.startX = touch.clientX;
  touchData.startY = touch.clientY;
  disk.style.position = 'fixed';
  disk.style.zIndex = 1000;
  disk.classList.add('dragging');
  e.preventDefault();
}

function touchMove(e) {
  if (!touchData.disk) return;
  const touch = e.touches[0];
  touchData.disk.style.left = `${touch.clientX - touchData.disk.offsetWidth / 2}px`;
  touchData.disk.style.top = `${touch.clientY - touchData.disk.offsetHeight / 2}px`;
  e.preventDefault();
}

function touchEnd(e) {
  if (!touchData.disk) return;

  const touch = e.changedTouches[0]; // Use the position where touch ends
  const droppedX = touch.clientX;
  const droppedY = touch.clientY;

  const rods = [document.getElementById("rod1"), document.getElementById("rod2"), document.getElementById("rod3")];
  let droppedOnRod = null;

  rods.forEach(rod => {
    const rect = rod.getBoundingClientRect();
    if (
      droppedX >= rect.left &&
      droppedX <= rect.right &&
      droppedY >= rect.top &&
      droppedY <= rect.bottom
    ) {
      droppedOnRod = rod;
    }
  });

  const disk = touchData.disk;
  const draggedSize = parseInt(disk.getAttribute("data-size"));

  if (droppedOnRod) {
    const disks = [...droppedOnRod.querySelectorAll(".disk")];
    const topDisk = disks.length ? disks[disks.length - 1] : null;
    const topSize = topDisk ? parseInt(topDisk.getAttribute("data-size")) : Infinity;

    if (draggedSize < topSize) {
      touchData.originalParent.removeChild(disk);
      droppedOnRod.appendChild(disk);
      moveCount++;
      document.getElementById("moveCount").textContent = moveCount;
      checkWinCondition();
    } else {
      touchData.originalParent.appendChild(disk); // invalid move
    }
  } else {
    touchData.originalParent.appendChild(disk); // dropped outside
  }

  // Reset disk style
  disk.style.position = '';
  disk.style.left = '';
  disk.style.top = '';
  disk.style.zIndex = '';
  disk.classList.remove('dragging');

  touchData.disk = null;
  e.preventDefault();
}


function rodTouchEnd(e) {
  e.preventDefault();
}

window.onload = initializeGame;
