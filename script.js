const monthLabel = document.getElementById('monthLabel');
const calendarGrid = document.getElementById('calendarGrid');
const timeGrid = document.getElementById('timeGrid');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');

const schedules = {
  Morning: [
    { time: '08:00AM' },
    { time: '08:30AM' },
    { time: '09:00AM' },
    { time: '09:30AM' },
    { state: 'loading' },
    { time: '10:30AM' },
    { time: '11:00AM' },
    { time: '11:30AM' },
  ],
  Afternoon: [
    { time: '12:00PM' },
    { time: '12:30PM' },
    { time: '01:00PM' },
    { time: '01:30PM' },
    { time: '02:00PM' },
    { time: '02:30PM' },
    { time: '03:00PM' },
    { time: '03:30PM' },
  ],
};

const unavailableDates = new Set(['2026-04-09', '2026-04-10', '2026-04-11', '2026-04-18', '2026-04-19']);

let activeDate = new Date(2026, 3, 16);
let visibleMonth = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
let activePeriod = 'Morning';
let activeTime = '';

function renderMonth() {
  monthLabel.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth);

  const firstDayIndex = (visibleMonth.getDay() + 6) % 7;
  const daysInCurrentMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const daysInPreviousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 0).getDate();

  const cells = [];

  for (let i = firstDayIndex - 1; i >= 0; i -= 1) {
    cells.push({ day: daysInPreviousMonth - i, monthOffset: -1 });
  }

  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    cells.push({ day, monthOffset: 0 });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (firstDayIndex + daysInCurrentMonth) + 1, monthOffset: 1 });
  }

  calendarGrid.innerHTML = '';

  cells.forEach(({ day, monthOffset }) => {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + monthOffset, day);
    const dateKey = formatDateKey(date);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-btn';
    btn.textContent = day;

    const isOutside = monthOffset !== 0;
    const isUnavailable = unavailableDates.has(dateKey);

    if (isOutside) {
      btn.classList.add('is-outside');
      btn.tabIndex = -1;
      btn.disabled = true;
    }

    if (isUnavailable) {
      btn.classList.add('is-unavailable');
      btn.disabled = true;
    }

    if (isSameDate(date, new Date(2026, 3, 6))) {
      btn.classList.add('is-outline');
    }

    if (isSameDate(date, activeDate)) {
      btn.classList.add('is-selected');
    }

    btn.addEventListener('click', () => {
      if (btn.disabled) {
        return;
      }

      activeDate = date;
      renderMonth();
    });

    calendarGrid.appendChild(btn);
  });
}

function renderTimes() {
  timeGrid.innerHTML = '';
  const schedule = schedules[activePeriod];

  schedule.forEach((slot) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-btn';

    if (slot.state === 'loading') {
      btn.classList.add('is-loading');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>';
      btn.setAttribute('aria-label', 'Loading available time');
    } else {
      btn.textContent = slot.time;
      if (activeTime === slot.time) {
        btn.classList.add('is-selected');
      }

      btn.addEventListener('click', () => {
        activeTime = slot.time;
        renderTimes();
      });
    }

    timeGrid.appendChild(btn);
  });
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

prevMonthButton.addEventListener('click', () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderMonth();
});

nextMonthButton.addEventListener('click', () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderMonth();
});

document.querySelectorAll('.toggle-btn').forEach((button) => {
  button.addEventListener('click', () => {
    activePeriod = button.dataset.period;
    activeTime = '';

    document.querySelectorAll('.toggle-btn').forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    renderTimes();
  });
});

renderMonth();
renderTimes();
