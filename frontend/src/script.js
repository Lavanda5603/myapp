// Все данные приложения
let appState = {
    profile: {
        name: 'Иван Петров',
        bio: 'Типа программист',
        birthdate: '1993-03-30',
        avatar: null
    },
    notes: [],
    habits: {
        water: { value: 0, unit: 'л', total: 0, today: 0 },
        sport: { value: 0, unit: 'мин', total: 0, today: 0 },
        reading: { value: 0, unit: 'мин', total: 0, today: 0 },
        sleep: { value: 0, unit: 'ч', total: 0, today: 0 },
        walk: { value: 0, unit: 'мин', total: 0, today: 0 }
    },
    dayNotes: [],
    streakDays: 0,
    selectedDay: '',
    currentDate: '',
    currentFullDate: '',
    listType: 'bullet',
    lastActiveDate: '',
    habitsLog: []
};

// Дни недели
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Функция получения текущей даты
function getCurrentDateData() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return {
        full: `${year}-${month}-${day}`,
        display: `${day}.${month}.${year}`
    };
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    const dateData = getCurrentDateData();
    appState.currentFullDate = dateData.full;
    appState.currentDate = dateData.display;
    appState.lastActiveDate = appState.currentFullDate;
    
    const today = new Date();
    const weekDayIndex = today.getDay();
    const weekDaysMap = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    appState.selectedDay = weekDaysMap[weekDayIndex];
    
    // Создаю заметки с текущей датой (только если нет сохраненных)
    if (appState.notes.length === 0) {
        appState.notes = [
            {
                id: 1,
                title: 'Тест 1',
                text: 'пункт 1\nпункт 2\nпункт 3',
                type: 'bullet',
                date: appState.currentDate,
                fullDate: appState.currentFullDate
            }
        ];
    }
    
    if (appState.dayNotes.length === 0) {
        appState.dayNotes = [
            { 
                text: 'какая-то заметка', 
                date: appState.currentDate, 
                day: appState.selectedDay, 
                fullDate: appState.currentFullDate, 
                id: 1 
            }
        ];
    }
    
    loadState();
    checkDateChange();
    renderWeekDays();
    initNavigation();
    initProfile();
    initNotes();
    initHabits();
    initStats();
    initTheme();
    updateTodayDate();
    updateStatsNumbers();
    renderNotes();
    updateDayNotes();
    initStatsDatePicker();
    updateYearCalendar();
});

// Загружаю из localStorage
function loadState() {
    const saved = localStorage.getItem('violetApp');
    if (!saved) return;

    const parsed = JSON.parse(saved);

    appState.profile = parsed.profile || appState.profile;
    appState.notes = parsed.notes || [];
    appState.dayNotes = parsed.dayNotes || [];
    appState.streakDays = parsed.streakDays || 0;
    appState.lastActiveDate = parsed.lastActiveDate || appState.currentFullDate;

    if (parsed.habits) {
        appState.habits = {
            ...appState.habits,
            ...parsed.habits
        };
    }
}

// Сохраняю в localStorage
function saveState() {
    localStorage.setItem('violetApp', JSON.stringify(appState));
}

// Проверяю, не наступил ли новый день
function checkDateChange() {
    if (appState.lastActiveDate !== appState.currentFullDate) {

        // Сохраняю прошлый день в habitsLog
        const yesterdayLog = {
            date: appState.lastActiveDate,
            water: appState.habits.water.today,
            sport: appState.habits.sport.today,
            reading: appState.habits.reading.today,
            sleep: appState.habits.sleep.today,
            walk: appState.habits.walk.today
        };
        appState.habitsLog.push(yesterdayLog);

        // Сброс привычек на новый день
        appState.habits.water.today = 0;
        appState.habits.water.value = 0;
        appState.habits.sport.today = 0;
        appState.habits.sport.value = 0;
        appState.habits.reading.today = 0;
        appState.habits.reading.value = 0;
        appState.habits.sleep.today = 0;
        appState.habits.sleep.value = 0;
        appState.habits.walk.today = 0;
        appState.habits.walk.value = 0;

        // Проверка на streakDays
        const last = new Date(appState.lastActiveDate);
        const current = new Date(appState.currentFullDate);
        const diffTime = current - last;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            appState.streakDays++;
        } else if (diffDays > 1) {
            appState.streakDays = 0;
        }

        appState.lastActiveDate = appState.currentFullDate;
        saveState();
        updateYearCalendar();
    }
}

// Отрисовываю дни недели
function renderWeekDays() {
    const container = document.getElementById('daysWeek');
    const today = new Date(appState.currentFullDate);
    const todayIndex = today.getDay();
    
    let html = '';
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() - todayIndex + i + 1);
        const dayMonth = String(dayDate.getMonth() + 1).padStart(2, '0');
        const dayDay = String(dayDate.getDate()).padStart(2, '0');
        const fullDate = `${dayDate.getFullYear()}-${dayMonth}-${dayDay}`;
        
        html += `<span class="day-btn ${weekDays[i] === appState.selectedDay ? 'active' : ''}" 
                      data-day="${weekDays[i]}" 
                      data-full-date="${fullDate}">
                      ${weekDays[i]}
                 </span>`;
    }
    container.innerHTML = html;
}

// Обновляю сегодняшнюю дату
function updateTodayDate() {
    const today = new Date();
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    document.getElementById('todayDate').textContent = 
        `${today.getDate()} ${months[today.getMonth()]}`;
}

// Навигация между экранами
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.dataset.screen;

            document.querySelectorAll('.screen').forEach(s => 
                s.classList.remove('active')
            );
            document.getElementById(screenId).classList.add('active');

            document.querySelectorAll('.nav-item').forEach(btn =>
                btn.classList.remove('active')
            );

            document.querySelectorAll(`.nav-item[data-screen="${screenId}"]`)
                .forEach(btn => btn.classList.add('active'));
        });
    });
}

// Профиль с проверкой на пустые поля
function initProfile() {
    const nameInput = document.getElementById('userName');
    const bioInput = document.getElementById('userBio');
    const birthInput = document.getElementById('userBirthdate');
    const profileName = document.getElementById('profileName');
    const avatarUpload = document.getElementById('avatarUpload');
    const avatarImg = document.getElementById('avatarImage');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    
    nameInput.value = appState.profile.name;
    bioInput.value = appState.profile.bio;
    birthInput.value = appState.profile.birthdate;
    profileName.textContent = appState.profile.name;
    
    if (appState.profile.avatar) {
        avatarImg.src = appState.profile.avatar;
        avatarImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    }
    
    document.getElementById('changeAvatarBtn').addEventListener('click', () => {
        avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                avatarImg.src = event.target.result;
                avatarImg.style.display = 'block';
                avatarPlaceholder.style.display = 'none';
                appState.profile.avatar = event.target.result;
                saveState();
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('saveProfileBtn').addEventListener('click', () => {
        // Проверяю, что имя не пустое
        const newName = nameInput.value.trim();
        if (!newName) {
            alert('Имя не может быть пустым!');
            nameInput.value = appState.profile.name;
            return;
        }
        
        appState.profile.name = newName;
        appState.profile.bio = bioInput.value.trim() || appState.profile.bio;
        appState.profile.birthdate = birthInput.value;
        profileName.textContent = newName;
        saveState();
        
        const btn = document.getElementById('saveProfileBtn');
        btn.textContent = '✓ Сохранено';
        setTimeout(() => btn.textContent = 'Сохранить', 2000);
    });
}

// Заметки с проверкой на пустые поля
function initNotes() {
    const typeBtns = document.querySelectorAll('.list-type-selector .btn-outline');
    
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.listType = btn.dataset.type;
        });
    });
    
    document.getElementById('addNoteBtn').addEventListener('click', () => {
        const title = document.getElementById('noteTitle').value.trim();
        const text = document.getElementById('noteText').value.trim();
        
        if (!title || !text) {
            alert('Заполните все поля!');
            return;
        }
        
        const note = {
            id: Date.now(),
            title,
            text,
            type: appState.listType,
            date: appState.currentDate,
            fullDate: appState.currentFullDate
        };
        
        appState.notes.unshift(note);
        saveState();
        renderNotes();
        
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteText').value = '';
        
        updateStatsNumbers();
    });
    
    renderNotes();
}

// Отрисовываю заметки
function renderNotes() {
    const list = document.getElementById('notesList');
    
    if (appState.notes.length === 0) {
        list.innerHTML = '<div class="note-item" style="text-align: center; color: #666;">Нет заметок</div>';
        return;
    }
    
    list.innerHTML = appState.notes.map(note => {
        let content = note.text;
        if (note.type === 'bullet') {
            const lines = note.text.split('\n').filter(l => l.trim());
            content = '<ul>' + lines.map(l => `<li>${l}</li>`).join('') + '</ul>';
        } else if (note.type === 'number') {
            const lines = note.text.split('\n').filter(l => l.trim());
            content = '<ol>' + lines.map(l => `<li>${l}</li>`).join('') + '</ol>';
        }
        
        return `
            <div class="note-item">
                <div class="note-header">
                    <span class="note-title">${note.title}</span>
                    <div class="note-actions">
                        <button onclick="editNote(${note.id})">✏️</button>
                        <button onclick="deleteNote(${note.id})">❌</button>
                    </div>
                </div>
                <div class="note-content">${content}</div>
                <div class="note-date">${note.date}</div>
            </div>
        `;
    }).join('');
}

// Редактирую заметки
window.editNote = (id) => {
    const note = appState.notes.find(n => n.id === id);
    if (note) {
        const newTitle = prompt('Редактировать заголовок:', note.title);
        if (newTitle !== null && newTitle.trim() !== '') {
            note.title = newTitle.trim();
            
            const lines = note.text.split('\n');
            let newLines = [];
            let cancelled = false;
            
            for (let i = 0; i < lines.length; i++) {
                const newLine = prompt(`Редактировать пункт ${i+1}:`, lines[i]);
                if (newLine === null) {
                    cancelled = true;
                    break;
                }
                newLines.push(newLine);
            }
            
            if (!cancelled) {
                note.text = newLines.join('\n');
                saveState();
                renderNotes();
            }
        } else if (newTitle !== null) {
            alert('Заголовок не может быть пустым!');
        }
    }
};

// Удаляю заметки
window.deleteNote = (id) => {
    if (confirm('Удалить заметку?')) {
        appState.notes = appState.notes.filter(n => n.id !== id);
        saveState();
        renderNotes();
        updateStatsNumbers();
    }
};

// Привычки
function initHabits() {
    updateHabitsDisplay();
    
    document.querySelectorAll('.habit-plus').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const habit = this.dataset.habit;
            
            if (habit === 'water') {
                appState.habits.water.value = Number((appState.habits.water.value + 0.5).toFixed(1));
                appState.habits.water.today = Number((appState.habits.water.today + 0.5).toFixed(1));
                appState.habits.water.total = Number((appState.habits.water.total + 0.5).toFixed(1));
            } else if (habit === 'sport') {
                appState.habits.sport.value += 10;
                appState.habits.sport.today += 10;
                appState.habits.sport.total += 10;
            } else if (habit === 'reading') {
                appState.habits.reading.value += 5;
                appState.habits.reading.today += 5;
                appState.habits.reading.total += 5;
            } else if (habit === 'sleep') {
                appState.habits.sleep.value += 1;
                appState.habits.sleep.today += 1;
                appState.habits.sleep.total += 1;
            }
            else if (habit === 'walk') {
                appState.habits.walk.value += 15;
                appState.habits.walk.today += 15;
                appState.habits.walk.total += 15;
            }
            
            updateHabitsDisplay();
            saveState();
            updateStatsNumbers();
            updateYearCalendar();
            
            return false;
        };
    });
    
    document.getElementById('saveHabitsBtn').addEventListener('click', () => {
        const btn = document.getElementById('saveHabitsBtn');
        btn.textContent = '✓ Сохранено';
        setTimeout(() => btn.textContent = 'Сохранить прогресс', 2000);
        saveState();
    });
}

// Обновляю отображение привычек
function updateHabitsDisplay() {
    document.getElementById('waterValue').innerHTML = `${appState.habits.water.value.toFixed(1)} л`;
    document.getElementById('waterTotal').innerHTML = `Всего сегодня: ${appState.habits.water.today.toFixed(1)} л`;
    
    document.getElementById('sportValue').innerHTML = `${appState.habits.sport.value} мин`;
    document.getElementById('sportTotal').innerHTML = `Всего сегодня: ${appState.habits.sport.today} мин`;
    
    document.getElementById('readingValue').innerHTML = `${appState.habits.reading.value} мин`;
    document.getElementById('readingTotal').innerHTML = `Всего сегодня: ${appState.habits.reading.today} мин`;

    document.getElementById('sleepValue').innerHTML = `${appState.habits.sleep.value} ч`;
    document.getElementById('sleepTotal').innerHTML = `Всего сегодня: ${appState.habits.sleep.today} ч`;

    document.getElementById('walkValue').innerHTML = `${appState.habits.walk.value} мин`;
    document.getElementById('walkTotal').innerHTML = `Всего сегодня: ${appState.habits.walk.today} мин`;
}

// Статистика с проверкой на пустую заметку
function initStats() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('day-btn')) {
            document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            appState.selectedDay = e.target.dataset.day;
            updateDayNotes();
        }
    });
    
    document.getElementById('addDayNoteBtn').addEventListener('click', () => {
        const input = document.getElementById('newDayNote');
        const text = input.value.trim();
        
        if (!text) {
            alert('Напишите заметку');
            return;
        }
        
        const activeBtn = document.querySelector('.day-btn.active');
        const fullDate = activeBtn.dataset.fullDate || appState.currentFullDate;
        
        const newNote = {
            id: Date.now(),
            text,
            date: appState.currentDate,
            day: appState.selectedDay,
            fullDate: fullDate
        };
        
        appState.dayNotes.push(newNote);
        saveState();
        updateDayNotes();
        input.value = '';
        updateStatsNumbers();
    });
    
    updateDayNotes();
}

// Обновляю заметки за день (при клике на день недели)
function updateDayNotes() {
    const list = document.getElementById('dayNotesList');
    const header = document.getElementById('dayNotesHeader');
    const dayHabitsContainer = document.getElementById('dayHabits');
    
    const activeBtn = document.querySelector('.day-btn.active');
    const fullDate = activeBtn ? activeBtn.dataset.fullDate : appState.currentFullDate;
    
    // Синхронизирую календарь
    const datePicker = document.getElementById('statsDatePicker');
    if (datePicker) {
        datePicker.value = fullDate;
    }
    
    const [year, month, day] = fullDate.split('-');
    const displayDate = `${day}.${month}.${year}`;
    
    header.innerHTML = `Заметки за день ${displayDate}`;
    
    // Показываю привычки за выбранный день
    if (dayHabitsContainer) {
        if (fullDate === appState.currentFullDate) {
            // Сегодняшний день - показываю текущие привычки
            dayHabitsContainer.innerHTML = `
                💧 Вода: ${appState.habits.water.today} л<br>
                🏃 Спорт: ${appState.habits.sport.today} мин<br>
                📚 Чтение: ${appState.habits.reading.today} мин<br>
                😴 Сон: ${appState.habits.sleep.today} ч<br>
                🚶 Прогулка: ${appState.habits.walk.today} мин
            `;
        } else {
            // Прошлые дни - ищу в habitsLog
            const habitsForDay = appState.habitsLog?.find(h => h.date === fullDate);
            
            if (habitsForDay) {
                dayHabitsContainer.innerHTML = `
                    💧 Вода: ${habitsForDay.water} л<br>
                    🏃 Спорт: ${habitsForDay.sport} мин<br>
                    📚 Чтение: ${habitsForDay.reading} мин<br>
                    😴 Сон: ${habitsForDay.sleep} ч<br>
                    🚶 Прогулка: ${habitsForDay.walk} мин
                `;
            } else {
                dayHabitsContainer.innerHTML = 'Нет данных привычек за этот день';
            }
        }
    }
    
    // Заметки за выбранный день
    const notesForDay = appState.dayNotes.filter(n => n.fullDate === fullDate);
    
    if (notesForDay.length === 0) {
        list.innerHTML = '<div class="day-note-item" style="text-align: center; color: #666;">Нет заметок за этот день</div>';
        return;
    }
    
    list.innerHTML = notesForDay.map(note => `
        <div class="day-note-item">
            <div class="note-text">${note.text}</div>
            <div class="note-footer">
                <span class="note-time">${note.date}</span>
            </div>
            <button class="delete-day-note" onclick="deleteDayNote(${note.id})">❌</button>
        </div>
    `).join('');
}

// Инициализация календаря в статистике
function initStatsDatePicker() {
    const datePicker = document.getElementById('statsDatePicker');
    if (!datePicker) return;
    
    // Устанавливаю сегодняшнюю дату
    datePicker.value = appState.currentFullDate;
    
    datePicker.addEventListener('change', function() {
        const selectedDate = this.value;
        if (!selectedDate) return;
        
        // Нахожу день недели для выбранной даты
        const date = new Date(selectedDate + 'T12:00:00');
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const dayOfWeek = days[date.getDay()];
        
        appState.selectedDay = dayOfWeek;
        
        // Подсвечиваю нужный день недели
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.day === dayOfWeek) {
                btn.classList.add('active');
            }
        });
        
        // Обновляю отображение для выбранной даты
        updateDayNotesForDate(selectedDate);
    });
}

// Обновление для конкретной даты
function updateDayNotesForDate(date) {
    const list = document.getElementById('dayNotesList');
    const header = document.getElementById('dayNotesHeader');
    const dayHabitsContainer = document.getElementById('dayHabits');
    
    if (!list || !header) return;
    
    const [year, month, day] = date.split('-');
    const displayDate = `${day}.${month}.${year}`;
    
    header.innerHTML = `Заметки за день ${displayDate}`;
    
    // Привычки за выбранный день
    if (dayHabitsContainer) {
        if (date === appState.currentFullDate) {
            dayHabitsContainer.innerHTML = `
                💧 Вода: ${appState.habits.water.today} л<br>
                🏃 Спорт: ${appState.habits.sport.today} мин<br>
                📚 Чтение: ${appState.habits.reading.today} мин<br>
                😴 Сон: ${appState.habits.sleep.today} ч<br>
                🚶 Прогулка: ${appState.habits.walk.today} мин
            `;
        } else {
            const habitsForDay = appState.habitsLog?.find(h => h.date === date);
            if (habitsForDay) {
                dayHabitsContainer.innerHTML = `
                    💧 Вода: ${habitsForDay.water} л<br>
                    🏃 Спорт: ${habitsForDay.sport} мин<br>
                    📚 Чтение: ${habitsForDay.reading} мин<br>
                    😴 Сон: ${habitsForDay.sleep} ч<br>
                    🚶 Прогулка: ${habitsForDay.walk} мин
                `;
            } else {
                dayHabitsContainer.innerHTML = 'Нет данных привычек за этот день';
            }
        }
    }
    
    // Заметки за выбранный день
    const notesForDay = appState.dayNotes.filter(n => n.fullDate === date);
    
    if (notesForDay.length === 0) {
        list.innerHTML = '<div class="day-note-item" style="text-align: center; color: #666;">Нет заметок за этот день</div>';
        return;
    }
    
    list.innerHTML = notesForDay.map(note => `
        <div class="day-note-item">
            <div class="note-text">${note.text}</div>
            <div class="note-footer">
                <span class="note-time">${note.date}</span>
            </div>
            <button class="delete-day-note" onclick="deleteDayNote(${note.id})">❌</button>
        </div>
    `).join('');
}

// Удаляю заметки за день
window.deleteDayNote = (id) => {
    if (confirm('Удалить эту заметку?')) {
        appState.dayNotes = appState.dayNotes.filter(n => n.id !== id);
        saveState();
        updateDayNotes();
        updateStatsNumbers();
    }
};

// Обновляю цифры в статистике
function updateStatsNumbers() {
    document.getElementById('streakDays').innerHTML = appState.streakDays;
    document.getElementById('totalWater').innerHTML = appState.habits.water.total.toFixed(1) + ' л';
    document.getElementById('totalNotes').innerHTML = appState.notes.length;
    document.getElementById('totalSport').innerHTML = appState.habits.sport.total + ' мин';
    document.getElementById('totalReading').innerHTML = appState.habits.reading.total + ' мин';
    document.getElementById('totalSleep').innerHTML = appState.habits.sleep.total + ' ч';
    document.getElementById('totalWalk').innerHTML = appState.habits.walk.total + ' мин';
    
    const totalActions = Math.floor(
        (appState.habits.water.total / 0.5) + 
        (appState.habits.sport.total / 10) + 
        (appState.habits.reading.total / 5) + 
        appState.habits.sleep.total + 
        (appState.habits.walk.total / 15) +
        appState.notes.length
    );
    document.getElementById('totalActions').innerHTML = totalActions;
}

// Светлая/темная тема
function initTheme() {
    const button = document.getElementById('themeToggle');

    // Загрузка сохраненной темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        button.textContent = '🌞';
    }

    button.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');

        const isLight = document.body.classList.contains('light-theme');

        if (isLight) {
            localStorage.setItem('theme', 'light');
            button.textContent = '🌞';
        } else {
            localStorage.setItem('theme', 'dark');
            button.textContent = '🌙';
        }
    });
}

// Обновление календаря активности
function updateYearCalendar() {
    const calendar = document.getElementById('yearCalendar');
    if (!calendar) return;
    
    // Считаю активные дни
    const activeDays = appState.habitsLog.length;
    const percent = Math.min(100, Math.round((activeDays / 365) * 100));
    
    calendar.innerHTML = `
        <div class="stats-card" style="width:100%;">
            <div class="stats-number">${activeDays}</div>
            <div class="stats-label">дней активности из 365</div>
            <div class="progress-bar-container" style="margin:10px 0;">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
            </div>
            <div style="color: #8A2BE2;">${percent}% года</div>
        </div>
    `;
}