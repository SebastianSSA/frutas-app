importScripts('./ngsw-worker.js');
let token = '';
const apiURL = "https://cpysd1.com/";

function getToken() {
  let db;
  const request = indexedDB.open('my-db');
  request.onerror = (event) => {
    console.log('Error al acceder a IndexedDB');
  };
  request.onsuccess = (event) => {
    db = event.target.result;

    const transaction = db.transaction(['db-frutas']);
    const objectStore = transaction.objectStore('db-frutas');
    const request = objectStore.get('token-user');

    request.onerror = (event) => {
      console.log('Error al obtener token');
      token = '';
    }
    request.onsuccess = (event) => {
      token = request.result;
    }
  };
}

self.addEventListener('sync', (event) => {
  if(event.tag === 'post-orden-compra') {
    event.waitUntil(getAndSendOrdenCompra());
  }
});

function saveOrdenCompra(data, token) {
  fetch(apiURL + 'api/orden_compra', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: data,
  })
  .then((res) => {
    deleteByKey('orden-compra-guardada');
    Promise.resolve();
  })
  .catch((err) => {
    console.log(err);
    Promise.reject();
  });
}

function getAndSendOrdenCompra() {
  let db;
  const request = indexedDB.open('my-db');
  request.onerror = (event) => {
    console.log('Error al acceder a IndexedDB')
  };
  request.onsuccess = (event) => {
    db = event.target.result;
    getOrdenCompraGuardada(db);
  };
};

function getOrdenCompraGuardada(db) {
  const transaction = db.transaction(['db-frutas']);
  const objectStore = transaction.objectStore('db-frutas');
  const request = objectStore.get('orden-compra-guardada');

  request.onerror = (event) => {
    console.log('Error al acceder a la orden de compra guardada');
  }
  request.onsuccess = (event) => {
    getToken();
    saveOrdenCompra(request.result, token);
  }
}

function deleteByKey(key) {
  let db;
  const request = indexedDB.open('my-db');

  request.onerror = (event) => {
    console.log('Error al acceder a IndexedDB');
  }

  request.onsuccess = (event) => {
    db = event.target.result;

    const transaction = db.transaction(['db-frutas']);
    const objectStore = transaction.objectStore('db-frutas');
    const request = objectStore.delete(key, 'readwrite');

    request.onerror = (event) => {
      console.log('Error al eliminar de indexedDB');
    }
    request.onsuccess = (event) => {
      console.log('Registro eliminada');
    }
  };
}
