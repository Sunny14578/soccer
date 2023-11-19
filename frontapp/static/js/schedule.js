window.onload = function() {
    // 페이지 로드 시 실행될 코드
    dateUpdate();
    getScheduleAPI();
};

function getCompetitionTeamAPI(){
    apiUrl = '../api/competitionTeam/';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message){
            console.log(data.data);
        }
    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });   
}

const currentDateTag = document.querySelector(".year-date span");

const currentDate = new Date();

let year = currentDate.getFullYear();
let month = currentDate.getMonth() + 1;
let day = currentDate.getDate();

function dateUpdate(){
    const dateText = year + "." + padZero(month);

    currentDateTag.innerHTML = dateText;
}

function padZero(number) {
    return number < 10 ? `0${number}` : number;
}

const preArrow = document.querySelector(".bx-chevron-left");
const nextArrow = document.querySelector(".bx-chevron-right");

function prechangeMonth(){
    
    month = month-1;

    if (month == 0) {
        year -= 1;
        month = 12;
    }
    
    const dateText = year + "." + padZero(month);
    currentDateTag.innerHTML = dateText;
}

function nextchangeMonth(){
    month = month+1;

    if (month == 13) {
        year += 1;
        month = 1;
    }
    
    const dateText = year + "." + padZero(month);
    currentDateTag.innerHTML = dateText;
}

preArrow.addEventListener("click", prechangeMonth);
nextArrow.addEventListener("click", nextchangeMonth);

function getScheduleAPI(){
    apiUrl = '../api/schedule/';
    date = { currentYear : year,
            currentMonth : month}

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentDate : date }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message){
            preprocessMatchData(data.data);
        }
    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });   
}

// function getScheduleAPI(){
//     apiUrl = '../api/schedule/';

//     fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//         }
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.message){
//             preprocessMatchData(data.data);
//         }
//     })
//     .catch(error => {
//         console.error('Error loading JSON file:', error);
//     });   
// }

function preprocessMatchData(data){
    let dateDic = []

    data.forEach(match => {
        const awayTeam = match.awayTeam
        const homeTeam = match.homeTeam;
        const awayTeamName = awayTeam.name;
        const homeTeamName = homeTeam.name;
        const awayTeamLogo = awayTeam.logo;
        const homeTeamLogo = homeTeam.logo;
        const homeStadium = homeTeam.venue;

        const scoreAway = match.score_away;
        const scoreHome = match.score_home;

        const matchStatus = (match.match_status == "FINISHED") ? '종료' : '예정';
        const matchday = match.matchday;

        const utcDate = match.utcDate;
        const time = formatTimeHour(utcDate)
        dateDic.push(utcDate);

        const preproData = {
            awayTeamName, homeTeamName,
            awayTeamLogo, homeTeamLogo,
            homeStadium, 
            scoreAway, scoreHome,
            matchStatus, matchday,
            time
        }

        createDynamicTags(preproData);
    })

    const dateList = dayAvailableList(dateDic);
    createDaysTags(dateList);
}

function formatTimeHour(date){
    const utcDate = new Date(date);
    const koreaTime = utcDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false, hour: 'numeric', minute: 'numeric' });
    return koreaTime;
}

function formatTimeDay(date){
    const utcDate = new Date(date);
    const koreaTime = utcDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false, day: 'numeric'});
    const preproTime =  koreaTime.slice(0, koreaTime.length-1);
    return preproTime;
}

const matchdayTag = document.querySelector('.matchday');

function createDynamicTags(preproData){
    const fragment = document.createDocumentFragment();
    const parentElement = document.querySelector('.premier.league');
    matchdayTag.innerHTML = preproData.matchday + "R";

    let Check = scoreCheck(preproData.scoreHome, preproData.scoreAway);

    const htmlString = `
        <div class="league-content">
            <div class="content-date">
            <span class="start-date">${preproData.time}</span>
            <span class="stadium">${preproData.homeStadium}</span>
            </div>
            <div class="content-team">
            <div class="home team">
                <span>홈</span>
                <span class="home-team-name">${preproData.homeTeamName}</span>
                <img src="${preproData.homeTeamLogo}">
            </div>
            <div class="status">
                <span class="home-score score ${preproData.matchStatus == '예정' ? 'hidden' : ''}" 
                    style="color: ${Check == 2 ? 'lightgray' : ''}">${preproData.scoreHome}
                </span>
                <span class="status-span">${preproData.matchStatus}</span>
                <span class="away-score score ${preproData.matchStatus == '예정' ? 'hidden' : ''}"
                    style="color: ${Check == 1 ? 'lightgray' : ''}">${preproData.scoreAway}
                </span>
            </div>
            <div class="away team">
                <img src="${preproData.awayTeamLogo}">
                <span class="away-team-name">${preproData.awayTeamName}</span>
            </div>
            </div>
            <div class="content-matchday">
            <span>${preproData.matchday}R</span>
            </div>
        </div>
    `;

    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlString;

    while (tempElement.firstChild) {
        fragment.appendChild(tempElement.firstChild);
    }

    // DocumentFragment을 실제 DOM에 추가
    parentElement.appendChild(fragment);
}

function createDaysTags(dateList){
    const fragment = document.createDocumentFragment();
    const daysTag = document.querySelector('.days');

    const days = new Date(year, month, 0).getDate();

    for(let i=1; i<=days; i++){
        const boolean = dayAvailable(i, dateList);
      
        const date = new Date(year, month, i); // month는 0부터 시작하므로 -1 해줍니다.
        const week = { weekday: 'short', timeZone: 'Asia/Seoul' };
        const dayOfWeek = new Intl.DateTimeFormat('ko-KR', week).format(date);
        
        const htmlString = 
            `
            <div class="day">
                <em>${dayOfWeek}</em>
                <span class="${boolean ? "active" : "inactive"}">${i}</span>
            </div>
            `

        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlString;

        while (tempElement.firstChild) {
            fragment.appendChild(tempElement.firstChild);
        }
    }

    daysTag.appendChild(fragment);
}

function dayAvailableList(date){
    const dateList = []

    date.forEach(time => {
        const day = formatTimeDay(time);

        if (!dateList.includes(day)){
            dateList.push(day);
        }
    })

    return dateList
}

function dayAvailable(day, dateList) {
    let boolean = true;
    
    if(!dateList.includes(String(day))){
        boolean = false;
    }
    return boolean
}

function scoreCheck(scoreHome, scoreAway) {
    let scoreCheck = 0

    if (scoreHome > scoreAway){
        scoreCheck = 1
    }else if(scoreHome < scoreAway){
        scoreCheck = 2
    }
    return scoreCheck
}

