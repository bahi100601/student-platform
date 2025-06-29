const scriptURL = 'https://script.google.com/macros/s/AKfycbwzm8zbJCpbTb-E089ZEnfEOHy9gbUQTtKWS0VhKiDiddqLw_LbXvJ91i6-bJV8W6AxKw/exec';

let users = JSON.parse(localStorage.getItem('users') || '[]');

document.getElementById('btnRegister')?.addEventListener('click', () => {
  let email = document.getElementById('regEmail').value;
  let pass = btoa(document.getElementById('regPass').value);
  if (users.find(u => u.email === email)) {
    return document.getElementById('regMsg').innerText = 'هذا البريد مستخدم.';
  }
  users.push({ email, pass });
  localStorage.setItem('users', JSON.stringify(users));
  document.getElementById('regMsg').innerText = 'تم التسجيل! يمكنك الدخول.';
});

document.getElementById('btnLogin')?.addEventListener('click', () => {
  let email = document.getElementById('loginEmail').value;
  let pass = btoa(document.getElementById('loginPass').value);
  if (users.find(u => u.email === email && u.pass === pass)) {
    localStorage.setItem('logged', 'true');
    location.href = 'dashboard.html';
  } else {
    document.getElementById('loginMsg').innerText = 'بيانات غير صحيحة';
  }
});

if (location.pathname.endsWith('dashboard.html')) {
  if (!localStorage.getItem('logged')) location.href = 'index.html';
}

// 🗺️ ربط الحقول بالترجمة العربية الموجودة في Google Sheet
const fieldMap = {
  fname: "الاسم",
  lname: "اللقب",
  dob: "تاريخ الميلاد",
  regNo: "رقم التسجيل",
  regPassStud: "الرقم السري",
  stream: "الشعبة",
  phase1: "مرحلة التسجيل الأولي",
  phase2: "مرحلة تأكيد التسجيل",
  pedDate: "تاريخ التسجيل البيداغوجي",
  socDate: "تاريخ تسجيل الخدمات الجامعية",
  wish: "الرغبة",
  major: "التخصص",
  state: "الولاية",
  payNotes: "حالة الدفع",
  grade: "المعدل"
};

const formEls = Object.keys(fieldMap);

function gather() {
  let o = {};
  formEls.forEach(id => {
    const arabicKey = fieldMap[id];
    o[arabicKey] = document.getElementById(id).value;
  });
  return o;
}

function fill(obj) {
  for (const [engKey, arabicKey] of Object.entries(fieldMap)) {
    document.getElementById(engKey).value = obj[arabicKey] || "";
  }
}

function postToSheet(payload, action) {
  return fetch(scriptURL + '?action=' + action, {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(r => r.text());
}

if (location.pathname.endsWith('dashboard.html')) {
  const statusMsg = document.getElementById('statusMsg');

  document.getElementById('addStud').onclick = () => {
    postToSheet(gather(), 'add').then(txt => statusMsg.innerText = txt);
  };

  document.getElementById('delStud').onclick = () => {
    let regNo = prompt('أدخل رقم التسجيل للحذف');
    postToSheet({ "رقم التسجيل": regNo }, 'delete').then(txt => statusMsg.innerText = txt);
  };

  document.getElementById('clearForm').onclick = () => {
    formEls.forEach(id => document.getElementById(id).value = '');
    statusMsg.innerText = 'تم التفريغ';
  };

  document.getElementById('getStud').onclick = () => {
    let no = prompt('أدخل رقم التسجيل');
    postToSheet({ "رقم التسجيل": no }, 'get')
      .then(txt => {
        try {
          let obj = JSON.parse(txt);
          if (obj.error) statusMsg.innerText = obj.error;
          else {
            fill(obj);
            statusMsg.innerText = 'تم جلب البيانات';
          }
        } catch (e) {
          statusMsg.innerText = "⚠️ خطأ في البيانات المستلمة: " + txt;
        }
      });
  };

  document.getElementById('editStud').onclick = () => {
    postToSheet(gather(), 'edit').then(txt => statusMsg.innerText = txt);
  };
}

} 
