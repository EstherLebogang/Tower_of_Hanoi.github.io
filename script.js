 let moveCount = 0;
  let draggedDisk = null;
  let diskTotal = 3;
  let timer = 0;
  let timerInterval = null;

  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if(document.body.classList.contains('dark')) {
      darkModeToggle.textContent = '☀️ Light Mode';
    } else {
      darkModeToggle.textContent = '🌙 Dark Mode';
    }
  });

  function createDisk(size) {
    const disk = document.createElement("div");
    disk.classList.add("disk");
    disk.classList.add(`disk-${size}`);
    disk.setAttribute("data-size", size);
    disk.setAttribute("draggable", true);
    disk.addEventListener("dragstart", dragStart);
    disk.addEventListener("dragend", dragEnd);

    // Touch support for mobile dragging
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

    const rods = [document.getElementById("rod1"), document.getElementById("rod2"), document.getElementById("rod3")];
    rods.forEach(rod => {
      // Remove existing disks but keep tower-rod and tower-base
      [...rod.querySelectorAll(".disk")].forEach(disk => disk.remove());

      rod.addEventListener("dragover", dragOver);
      rod.addEventListener("drop", drop);
      rod.addEventListener('touchend', rodTouchEnd);
    });

    for (let i = diskTotal; i >= 1; i--) {
      rods[0].appendChild(createDisk(i));
    }

    startTimer();
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timer++;
      document.getElementById("timer").textContent = formatTime(timer);
    }, 1000);
  }

  function dragStart(e) {
    const disk = e.target;
    const rod = disk.parentElement;
    const topDisk = rod.lastElementChild;

    if (disk !== topDisk) {
      e.preventDefault();
      return;
    }

    draggedDisk = disk;
    setTimeout(() => disk.classList.add("dragging"), 0);
  }

  function dragEnd(e) {
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
    const topDisk = targetRod.lastElementChild;

    // Ignore tower-base and tower-rod elements by getting last disk child
    const disks = [...targetRod.querySelectorAll(".disk")];
    const lastDisk = disks.length ? disks[disks.length - 1] : null;
    const topSize = lastDisk ? parseInt(lastDisk.getAttribute("data-size")) : Infinity;

    const draggedSize = parseInt(draggedDisk.getAttribute("data-size"));

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
    disk: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    originalParent: null,
  };

  function touchStart(e) {
    if (e.touches.length !== 1) return;
    const disk = e.target;
    const rod = disk.parentElement;
    const topDisk = rod.lastElementChild;
    if (disk !== topDisk) return;

    touchData.disk = disk;
    touchData.startX = e.touches[0].clientX;
    touchData.startY = e.touches[0].clientY;
    touchData.currentX = touchData.startX;
    touchData.currentY = touchData.startY;
    touchData.originalParent = rod;

    disk.style.position = 'fixed';
    disk.style.zIndex = 1000;
    disk.style.left = `${touchData.startX - disk.offsetWidth/2}px`;
    disk.style.top = `${touchData.startY - disk.offsetHeight/2}px`;
    disk.classList.add('dragging');

    e.preventDefault();
  }

  function touchMove(e) {
    if (!touchData.disk || e.touches.length !== 1) return;
    touchData.currentX = e.touches[0].clientX;
    touchData.currentY = e.touches[0].clientY;

    touchData.disk.style.left = `${touchData.currentX - touchData.disk.offsetWidth/2}px`;
    touchData.disk.style.top = `${touchData.currentY - touchData.disk.offsetHeight/2}px`;
    e.preventDefault();
  }

  function touchEnd(e) {
    if (!touchData.disk) return;

    const rods = [document.getElementById("rod1"), document.getElementById("rod2"), document.getElementById("rod3")];
    let droppedOnRod = null;

    rods.forEach(rod => {
      const rect = rod.getBoundingClientRect();
      if (
        touchData.currentX >= rect.left &&
        touchData.currentX <= rect.right &&
        touchData.currentY >= rect.top &&
        touchData.currentY <= rect.bottom
      ) {
        droppedOnRod = rod;
      }
    });

    if (droppedOnRod) {
      const disks = droppedOnRod.querySelectorAll(".disk");
      const lastDisk = disks.length ? disks[disks.length - 1] : null;
      const topSize = lastDisk ? parseInt(lastDisk.getAttribute("data-size")) : Infinity;

      const draggedSize = parseInt(touchData.disk.getAttribute("data-size"));
      if (draggedSize < topSize) {
        touchData.disk.parentElement.removeChild(touchData.disk);
        droppedOnRod.appendChild(touchData.disk);
        moveCount++;
        document.getElementById("moveCount").textContent = moveCount;
        checkWinCondition();
      } else {
        touchData.originalParent.appendChild(touchData.disk);
      }
    } else {
      touchData.originalParent.appendChild(touchData.disk);
    }

    touchData.disk.style.position = '';
    touchData.disk.style.left = '';
    touchData.disk.style.top = '';
    touchData.disk.style.zIndex = '';
    touchData.disk.classList.remove('dragging');

    touchData.disk = null;
    e.preventDefault();
  }

  function rodTouchEnd(e) {
    e.preventDefault();
  }

  window.onload = initializeGame;
