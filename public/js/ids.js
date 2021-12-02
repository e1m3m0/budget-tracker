let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded =  function (e) {
  const db = e.target.result;

db.createObjectStore('new_activity', { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine) {
    uploadActivity();
  }
};

request.onerror = function (e) {

  console.log(e.target.errorCode);
};


function saveRecord(record) {
  const transaction = db.transaction(["new_activity"], 'readwrite');

  const activityObjectStore = transaction.objectStore("new_activity");

  activityObjectStore.add(record);
};

function uploadActivity() {

  const transaction = db.transaction(["new_activity"], "readwrite");

  const activityObjectStore = transaction.objectStore("new_activity");
  
  const getAll = activityObjectStore.getAll();

  getAll.onsuccess = function () {

    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.json())
      .then((serverResponse) => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        const transaction = db.transaction(["new_activity"], "readwrite");
        const activityObjectStore = transaction.objectStore("new_activity");
        activityObjectStore.clear();

        alert("All activity has been submitted!");
      })
      .catch((err) => console.log(err));
    }
  }
}

window.addEventListener('online', uploadActivity);
