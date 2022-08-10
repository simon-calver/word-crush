function checkForUser() {
  // If there is no cookie with user ID, create one. Otherwise refresh the token as it may have expired
  getUser().then(user => {
    if (!user) {
      createNewUser();
    } else {
      refreshToken(user);
    }
  });
}

function getUser() {
  return get('/get-user', {});
}

function getHost() {
  return get('/get-host', {});
}

async function createNewUser() {
  // If this is using localhost don't create a new user ID
  let host = await getHost();
  let user;
  if (host.includes('localhost')) {
    user = 'local001'
  } else {
    // Make unique identifier and add to database and local cookie
    const lastNewUser = await getLastUser();
    // Add one to number of most recent user, could do this more robustly?
    const userId = parseInt(lastNewUser.user.split('SQ')[1]) + 1;
    user = 'SQ' + userId.toString().padStart(6, '0');
  }

  // Add new user to database after cookie set, add some error handling
  await setJwtCookie(user);
  postNewUser(user);

  // updateUserDatabase(user);
  setUserCookie(user);
  setScoreCookie({
    user: user,
    played: 0,
    average: 0,
    high: 0
  });
}

function getLastUser() {
  return get('/get-user/last', {})
}

function countUsers() {
  return get('/get-user/count', {});
}

function setJwtCookie(user) {
  return get('/set-jwt-cookie', { user: user });
}

function setUserCookie(user) {
  return get('/set-persistent-cookie', { name: 'user-id', value: user })
}

function setScoreCookie(scoreData) {
  return get('/set-persistent-cookie', { name: 'squords-stats', value: scoreData })
}

async function postNewUser(user) {
  const ipAddress = await getIpAdress()
  post('/post-new-user', {
    user: user,
    ipAddress: ipAddress.ip,
    timeCreated: Date.now()
  });
}

// Add function to updaet time user last accesed

function refreshToken(user) {
  setJwtCookie(user)
}

function getStats() {
  return get('/get-word-stats');
}

function updateScore(user, score) {
  post('/post-word-score', {
    user: user,
    score: score,
    recordedTime: Date.now()
  });
}

function getIpAdress() {
  return $.getJSON("https://api.ipify.org?format=json");
}

function get(url, data) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'GET',
      url: url,
      data: data,
      success: function (response) {
        resolve(response);
      },
      error: function (error) {
        reject(error);
      }
    })
  });
}

function post(url, data) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'POST',
      url: url,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: function (response) {
        resolve(response);
      },
      error: function (error) {
        reject(error);
      }
    })
  });
}
