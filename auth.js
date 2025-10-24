const BACKEND = "https://emailserverbackend-production.up.railway.app";
const JWKS_URL = `${BACKEND}/.well-known/jwks.json`;
const LOGIN_URL = `${BACKEND}/api/auth/login-encrypted`;
const POST_LOGIN_PATH = "/mail.html";

// Pre-fill saved credentials
try {
  const saved = localStorage.getItem("savedLogin");
  if (saved) {
    const { email, password } = JSON.parse(saved);
    if (email) document.getElementById("email").value = email;
    if (password) document.getElementById("password").value = password;
  }
} catch {}

const te = new TextEncoder();
function b64url(ab) {
  const b = new Uint8Array(ab);
  let s = ""; for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function uuidv4(){return crypto.randomUUID?.(): 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c=='x'?r:(r&0x3|0x8);return v.toString(16)})}
function selectEncKey(jwks){const k=jwks.keys.find(k=>(!k.use||k.use==="enc")&&k.kty==="RSA");if(!k)throw new Error("No RSA key found");return k;}
async function importRsaKey(jwk){return crypto.subtle.importKey("jwk",jwk,{name:"RSA-OAEP",hash:"SHA-256"},false,["encrypt"]);}

const form=document.getElementById("signin-form");
const msg=document.getElementById("msg");
const btn=document.getElementById("submit");

form.addEventListener("submit",async e=>{
  e.preventDefault(); msg.textContent=""; btn.disabled=true;
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value;
  if(!email||!password){msg.textContent="Missing fields.";btn.disabled=false;return;}
  try{
    const jwks=await fetch(JWKS_URL).then(r=>r.json());
    const jwk=selectEncKey(jwks);
    const pub=await importRsaKey(jwk);
    const nonce=uuidv4();
    const payload=te.encode(JSON.stringify({email,password,nonce,ts:new Date().toISOString()}));
    const ciphertext=await crypto.subtle.encrypt({name:"RSA-OAEP"},pub,payload);
    const body=JSON.stringify({ciphertext:b64url(ciphertext),kid:jwk.kid,nonce});
    const res=await fetch(LOGIN_URL,{method:"POST",headers:{"content-type":"application/json"},body,credentials:"include"});
    if(!res.ok)throw new Error("Login failed");
    // Save login locally (not session)
    localStorage.setItem("savedLogin",JSON.stringify({email,password}));
    window.location.href=POST_LOGIN_PATH;
  }catch(err){msg.textContent=err.message||"Error";}
  finally{btn.disabled=false;}
});
