let countries = [];
let pageSize = 25; // 每頁筆數
window.onload = function () {
  GetCountryData();

  // 關鍵字查詢
  document.getElementById('btSearch').onclick = function () {
    InitTable();
  };

  // 清除查詢條件
  document.getElementById('btSReset').onclick = function () {
    document.getElementById('Q_CountryName').value = '';
    InitTable();
  };

  // 國家詳細資料視窗
  let modal = document.querySelector('#country-detail');
  modal.querySelectorAll('[data-toggle]').forEach((element) => {
    element.addEventListener('click', function () {
      modal.classList.remove('show');
    });
  });
};

// 取得國家資料
function GetCountryData() {
  SendAjax({
    type: 'GET',
    url: 'https://restcountries.eu/rest/v2/all',
    onSuccess: function (result) {
      countries = JSON.parse(result);
      InitTable();
    },
    onError() {},
  });
}

function InitTable() {
  GenerateTableRow(pageSize, 1);
}

// 建立Ajax連線
function SendAjax({
  type: type, // HTTP Type
  url: url, // Connect URL
  onSuccess: onSuccess, // Function when Call API Success
  onError: onError, // Function when Call API Error
}) {
  var oReq = new XMLHttpRequest();

  // Event On Load Success
  oReq.addEventListener('load', function () {
    onSuccess(this.response);
  });

  // Event On Load Error
  oReq.addEventListener('error', function () {
    onError(this.response);
  });

  oReq.open(type, url); // Open Connection
  oReq.send(); // Send Request
}

function GetPagedData(source, limit, page) {
  let start = limit * (page - 1); // 起始
  let end = start + limit; // 結束

  if (end > source.length) {
    end = source.length;
  }

  return {
    total: source.length,
    currentPage: page,
    totalPage: Math.ceil(source.length / limit),
    limit: limit,
    data: source.slice(start, end),
  };
}

// 綁定資料至Table內
function GenerateTableRow(limit, page) {
  // 根據國家名稱篩選
  let filteredData = countries.filter((value, index) => {
    let countryName = document.getElementById('Q_CountryName').value;
    if (countryName) {
      return value.name.includes(countryName);
    } else {
      return value;
    }
  });

  let resultData = GetPagedData(filteredData, limit, page);

  let tb = document.querySelector('#resultTable tbody');
  tb.innerHTML = ''; // 清空內容
  let t = document.querySelector('#countryrow'); // Template Table row
  let td = t.content.querySelectorAll('td'); // table td items
  resultData.data.forEach((element) => {
    td[0].querySelector('img').src = element.flag;
    td[1].textContent = element.name;
    td[1].dataset.alpha3Code = element.alpha3Code;
    td[2].textContent = element.alpha2Code;
    td[3].textContent = element.alpha3Code;
    td[4].textContent = element.nativeName;
    td[5].textContent = element.altSpellings;
    td[6].textContent = element.callingCodes.join(',');

    tb.appendChild(document.importNode(t.content, true)); // DeepClone 並Appent到Tbody中
  });

  // 國家名稱點擊事件
  tb.querySelectorAll('.ref-country-detail').forEach((element) => {
    element.addEventListener('click', (event) => {
      ShowCountryDetail(element.dataset.alpha3Code);
    });
  });

  GeneratePageList(resultData);
}

// 產生分頁選單
function GeneratePageList(pagedData) {
  let currentPage = pagedData.currentPage;
  let totalPage = pagedData.totalPage;
  let pageElement = document.querySelector('#pages > ul.pagination');
  pageElement.innerHTML = ''; // 清空
  let htmlStr = '';

  // 前一頁
  let prev = currentPage - 1;
  if (prev <= 0) {
    prev = totalPage;
  }
  htmlStr +=
    '<li class="page-prev" data-page="' +
    prev +
    '"><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';

  // 頁數
  for (let i = 1; i <= totalPage; i++) {
    htmlStr +=
      '<li class="page-item ' +
      (i === parseInt(currentPage) ? 'active' : '') +
      '" data-page="' +
      i +
      '"><a href="#"><span aria-hidden="true">' +
      i +
      '</span></a></li>';
  }

  // 後一頁
  let next = currentPage + 1;
  if (next > totalPage) {
    next = 1;
  }
  htmlStr +=
    '<li class="page-next" data-page="' +
    next +
    '"><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
  pageElement.innerHTML = htmlStr;

  // 頁數切換事件
  pageElement.querySelectorAll('li').forEach((element) => {
    element.addEventListener('click', (event) => {
      let topage = element.dataset.page;
      GenerateTableRow(pagedData.limit, parseInt(topage));
    });
  });
}

// 顯示國家詳細資訊
function ShowCountryDetail(alpha3Code) {
  SendAjax({
    type: 'GET',
    url: 'https://restcountries.eu/rest/v2/alpha/' + alpha3Code,
    onSuccess: function (result) {
      let resultData = JSON.parse(result);
      let modal = document.querySelector('#country-detail');
      modal.querySelector("[data-field='flag']").src = resultData.flag;
      modal.querySelector("[data-field='name']").textContent =
        resultData.name;
      modal.querySelector("[data-field='capital']").textContent =
        resultData.capital;
      modal.querySelector("[data-field='region']").textContent =
        resultData.region + '(' + resultData.subregion + ')';
      modal.querySelector("[data-field='latlng']").textContent =
        resultData.latlng[0] + ',' + resultData.latlng[1];
      modal.querySelector("[data-field='population']").textContent =
        resultData.population;
      modal.querySelector("[data-field='timezones']").textContent =
        resultData.timezones.join('; ');
      modal.querySelector("[data-field='languages']").textContent =
        resultData.languages
          .map((element) => {
            return element.nativeName;
          })
          .join(' / ');
      modal.classList.add('show');
    },
    onError() {},
  });
}