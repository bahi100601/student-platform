let users = JSON.parse(localStorage.getItem('users')||'[]');
let currentUser = null;

document.getElementById('btnRegister')?.addEventListener('click',()=>{
  let email = document.getElementById('regEmail').value;
  let pass = btoa(document.getElementById('regPass').value);
  if(users.find(u=>u.email===email)){
    return document.getElementById('regMsg').innerText='هذا البريد مستخدم.';
  }
  users.push({email,pass}); localStorage.setItem('users',JSON.stringify(users));
  document.getElementById('regMsg').innerText='تم التسجيل! يمكنك الدخول.';
});

document.getElementById('btnLogin')?.addEventListener('click',()=>{
  let email=document.getElementById('loginEmail').value;
  let pass=btoa(document.getElementById('loginPass').value);
  if(users.find(u=>u.email===email&&u.pass===pass)){
    localStorage.setItem('logged','true');
    location.href='dashboard.html';
  } else document.getElementById('loginMsg').innerText='بيانات غير صحيحة';
});

if(location.pathname.endsWith('dashboard.html')){
  if(!localStorage.getItem('logged')) location.href='index.html';
}

const scriptURL = 'https://script.google.com/macros/s/AKfycbyGnMnTREHwBwevZTFDUUyGsAmjUygSoqrwz-uS1jGo9zp8I8qwIW20NExXj6UgbbP1Cw/exec';
function postToSheet(payload, action){
  return fetch(scriptURL+'?action='+action, {
    method:'POST', body: JSON.stringify(payload)
  }).then(r=>r.text());
}

if(location.pathname.endsWith('dashboard.html')){
  const formEls = ['fname','lname','dob','pob','regNo','regPassStud','stream','phase1','phase2','wish','socDate','pedDate','payNotes','state','major','grade'];
  const statusMsg = document.getElementById('statusMsg');

  function gather(){ let o={}; formEls.forEach(id=>o[id]=document.getElementById(id).value); return o;}
  function fill(o){ formEls.forEach(id=>document.getElementById(id).value=o[id]||''); }

  document.getElementById('addStud').onclick=()=>{
    postToSheet(gather(),'add').then(txt=>statusMsg.innerText=txt);
  };
  document.getElementById('delStud').onclick=()=>{
    let regNo = prompt('أدخل رقم التسجيل للحذف');
    postToSheet({regNo},'delete').then(txt=>statusMsg.innerText=txt);
  };
  document.getElementById('clearForm').onclick=()=>{formEls.forEach(id=>document.getElementById(id).value=''); statusMsg.innerText='تم التفريغ';};
  document.getElementById('getStud').onclick=()=>{
    let no=prompt('أدخل رقم التسجيل');
    postToSheet({regNo:no},'get')
      .then(txt=>{
        let obj = JSON.parse(txt);
        if(obj.error) statusMsg.innerText = obj.error;
        else { fill(obj); statusMsg.innerText='تم جلب البيانات'; }
      });
  };
  document.getElementById('editStud').onclick=()=>{
    postToSheet(gather(),'edit').then(txt=>statusMsg.innerText=txt);
  };
}