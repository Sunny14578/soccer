window.onload = function() {
    // 페이지 로드 시 실행될 코드
    // getCompetitionTeamAPI();
    // getScheduleAPI();
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
        console.log(data);
    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });   
}

function getScheduleAPI(){
    apiUrl = '../api/schedule/';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });   
}